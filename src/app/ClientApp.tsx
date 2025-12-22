
'use client';

import React, { useState, useEffect, useCallback, useTransition, useRef, useMemo } from 'react';
import Link from 'next/link';
import type { Task, TaskStatus } from '@/lib/types';
import { Header } from '@/components/Header';
import { useToast } from '@/hooks/use-toast';
import { TaskGrid } from '@/components/TaskGrid';
import { STATUS_CYCLE } from '@/lib/types';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, ChevronLeft, ChevronRight, Loader2, RotateCcw } from 'lucide-react';
import { TouchBackend } from 'react-dnd-touch-backend';
import { addDays, getWeek, getYear, parseISO, setWeek, startOfWeek, format, parse, getDate } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Legend } from '@/components/Legend';
import { useTheme } from 'next-themes';
import { getTasks, getTasksMarkdown, parseTasksMarkdown, getAIFeatureStatus } from './actions';
import { handleBreakDownTask } from '@/app/actions';
import { WeekPicker } from '@/components/WeekPicker';
import { encodeShareData } from '@/lib/sharing';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy } from 'lucide-react';

import { StartFreshDialog } from '@/components/StartFreshDialog';

const ID_CHARSET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const ID_LENGTH = 4;
const LOCAL_STORAGE_KEY = 'weeklist-tasks';
const SHOW_WEEKENDS_KEY = 'weeklist-show-weekends';
const HIDE_COMPLETED_KEY = 'weeklist-hide-completed';
const FIT_TO_SCREEN_KEY = 'weeklist-fit-to-screen';
const COOKIE_CONSENT_KEY = 'weeklist-cookie-consent';

// File System Access API types
interface FileSystemFileHandle {
  kind: 'file';
  name: string;
  getFile: () => Promise<File>;
  createWritable: () => Promise<FileSystemWritableFileStream>;
}

interface FileSystemWritableFileStream extends WritableStream {
  write: (data: string | BufferSource | Blob) => Promise<void>;
  close: () => Promise<void>;
}

declare global {
  interface Window {
    showSaveFilePicker?: (options?: any) => Promise<FileSystemFileHandle>;
    showOpenFilePicker?: (options?: any) => Promise<FileSystemFileHandle[]>;
  }
}


async function generateTaskId(existingIds: string[]): Promise<string> {
  let newId: string;
  do {
    newId = '';
    for (let i = 0; i < ID_LENGTH; i++) {
      newId += ID_CHARSET.charAt(Math.floor(Math.random() * ID_CHARSET.length));
    }
  } while (existingIds.includes(newId));
  return newId;
}


const getDayWithSuffix = (date: Date) => {
  const day = getDate(date);
  let suffix = 'th';
  if (day % 10 === 1 && day !== 11) suffix = 'st';
  if (day % 10 === 2 && day !== 12) suffix = 'nd';
  if (day % 10 === 3 && day !== 13) suffix = 'rd';
  return <>{day}<sup>{suffix}</sup></>;
};

interface ClientAppProps {
  initialDate?: string;
}

export default function ClientApp({ initialDate }: ClientAppProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const DndBackend = isMobile ? TouchBackend : HTML5Backend;
  const dndOptions = isMobile ? { enableMouseEvents: false, enableTouchEvents: true } : {};

  // Parse the initial date string or default to new Date()
  const [currentDate, setCurrentDate] = useState(() => initialDate ? new Date(initialDate) : new Date());
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showWeekends, setShowWeekends] = useState(true);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [isStartFreshOpen, setIsStartFreshOpen] = useState(false);



  const currentWeek = getWeek(currentDate, { weekStartsOn: 1 });
  const currentYear = getYear(currentDate);
  const currentWeekKey = `${currentYear}-${currentWeek}`;

  const weeklyTasks = useMemo(() => {
    return tasks.filter(t => t.week === currentWeekKey);
  }, [tasks, currentWeekKey]);

  const navigableTasks = useMemo(() => {
    const taskMap = new Map(weeklyTasks.map(t => [t.id, t]));

    // Create a list of top-level tasks in their current order
    const topLevelTasks = weeklyTasks.filter(t => !t.parentId || !taskMap.has(t.parentId));

    const orderedTasks: Task[] = [];
    const processedIds = new Set<string>();

    function addTaskAndChildren(task: Task) {
      if (processedIds.has(task.id)) return;
      orderedTasks.push(task);
      processedIds.add(task.id);

      const children = weeklyTasks
        .filter(t => t.parentId === task.id)
        .sort((a, b) => {
          const aIndex = weeklyTasks.findIndex(task => task.id === a.id);
          const bIndex = weeklyTasks.findIndex(task => task.id === b.id);
          return aIndex - bIndex;
        });

      children.forEach(addTaskAndChildren);
    }

    topLevelTasks.forEach(addTaskAndChildren);

    // Add any orphans that might have been missed
    weeklyTasks.forEach(task => {
      if (!processedIds.has(task.id)) {
        orderedTasks.push(task);
        processedIds.add(task.id);
      }
    });

    return orderedTasks;
  }, [weeklyTasks]);






  const [isAIFeatureEnabled, setIsAIFeatureEnabled] = useState(false);

  const HIDE_COMPLETED_KEY = 'weeklist-hide-completed';
  const FIT_TO_SCREEN_KEY = 'weeklist-fit-to-screen';
  const [hideCompleted, setHideCompleted] = useState(false);
  const [fitToScreen, setFitToScreen] = useState(false);


  const { resolvedTheme, setTheme } = useTheme();

  // Smart Export/Import State
  const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | null>(null);
  const [importFileHandle, setImportFileHandle] = useState<FileSystemFileHandle | null>(null);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [pendingMarkdown, setPendingMarkdown] = useState<string | null>(null);

  // Child Move Dialog State
  const [childMoveState, setChildMoveState] = useState<{ taskId: string, direction: 'next' | 'previous', parentId: string } | null>(null);

  // Print State
  const [showPrintDialog, setShowPrintDialog] = useState(false);

  const openPrintPage = useCallback(() => {
    window.open('/print', '_blank');
  }, []);

  const handlePrint = useCallback(() => {
    if (resolvedTheme === 'dark') {
      setShowPrintDialog(true);
    } else {
      openPrintPage();
    }
  }, [resolvedTheme, openPrintPage]);

  const handleSwitchThemeAndPrint = useCallback(() => {
    setTheme('light');
    openPrintPage();
    setShowPrintDialog(false);
  }, [setTheme, openPrintPage]);

  const handlePrintInDarkMode = useCallback(() => {
    openPrintPage();
    setShowPrintDialog(false);
  }, [openPrintPage]);

  const fallbackDownload = useCallback((markdown: string) => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'weeklist.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const performSave = useCallback(async (handle: FileSystemFileHandle, markdown: string) => {
    try {
      const writable = await handle.createWritable();
      await writable.write(markdown);
      await writable.close();
      toast({ title: 'Saved', description: `Successfully saved ${handle.name}` });
    } catch (error) {
      console.error('Save failed:', error);
      toast({
        variant: 'destructive',
        title: 'Save failed',
        description: 'Could not overwrite the file. You might need to grant permission.',
      });
    }
  }, [toast]);

  const performSaveAs = useCallback(async (markdown: string) => {
    try {
      if (!window.showSaveFilePicker) throw new Error('Not supported');

      const handle = await window.showSaveFilePicker({
        suggestedName: 'weeklist.md',
        types: [{
          description: 'Markdown File',
          accept: { 'text/markdown': ['.md'] },
        }],
      });

      await performSave(handle, markdown);
      setFileHandle(handle);
    } catch (error) {
      if ((error as any).name !== 'AbortError') {
        console.error('Save As failed:', error);
        fallbackDownload(markdown);
      }
    }
  }, [performSave, setFileHandle, fallbackDownload]);

  const handleDownload = useCallback(async () => {
    try {
      const markdown = await getTasksMarkdown(tasks);
      if (!markdown || markdown.trim() === '# WeekList Tasks') {
        toast({
          variant: 'destructive',
          title: 'Save to .md failed',
          description: 'There are no tasks to save.',
        });
        return;
      }

      const supportsFileSystem = typeof window.showSaveFilePicker === 'function';

      if (supportsFileSystem) {
        if (fileHandle) {
          setPendingMarkdown(markdown);
          setIsSaveDialogOpen(true);
        } else {
          await performSaveAs(markdown);
        }
      } else {
        await fallbackDownload(markdown);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error generating markdown',
        description: 'Could not generate the markdown content.',
      });
    }
  }, [tasks, fileHandle, performSaveAs, fallbackDownload, toast, setIsSaveDialogOpen, setPendingMarkdown]);

  const handleOverwrite = async () => {
    if (fileHandle && pendingMarkdown) {
      await performSave(fileHandle, pendingMarkdown);
    }
    setIsSaveDialogOpen(false);
    setPendingMarkdown(null);
  };

  const handleSaveNew = async () => {
    if (pendingMarkdown) {
      await performSaveAs(pendingMarkdown);
    }
    setIsSaveDialogOpen(false);
    setPendingMarkdown(null);
  };

  // Start Fresh Logic
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.has('StartFresh')) {
        setIsStartFreshOpen(true);
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, []);

  const handleStartFreshConfirm = useCallback(({ deleteAll, deleteCurrentWeek, resetPrefs }: { deleteAll: boolean; deleteCurrentWeek: boolean; resetPrefs: boolean }) => {
    if (deleteAll) {
      setTasks([]);
      localStorage.setItem(LOCAL_STORAGE_KEY, '[]');
      if (typeof setFileHandle === 'function') setFileHandle(null);
      if (typeof setImportFileHandle === 'function') setImportFileHandle(null);
    } else if (deleteCurrentWeek) {
      // Need currentWeekKey. It's defined further down?
      // currentWeekKey depends on currentDate.
      // Let's calculate it here locally or use state if possible?
      // 'currentWeekKey' variable is defined at line 110.
      // is it available here?
      // It's a const defined in the render body. Yes, it's available since line 110.
      // But we are at line 300. So yes.
      const remainingTasks = tasks.filter(t => t.week !== currentWeekKey);
      setTasks(remainingTasks);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(remainingTasks));
    }

    if (resetPrefs) {
      localStorage.removeItem(SHOW_WEEKENDS_KEY);
      setShowWeekends(true);
      localStorage.removeItem(HIDE_COMPLETED_KEY);
      setHideCompleted(false);
      localStorage.removeItem(FIT_TO_SCREEN_KEY);
      setFitToScreen(false);
      setTheme('system');
      localStorage.removeItem('theme');
    }

    toast({ title: 'Fresh Start', description: 'WeekList has been reset according to your choices.' });
  }, [tasks, currentWeekKey, setTheme, toast]);

  const handleStartFreshExport = useCallback(() => {
    handleDownload();
  }, [handleDownload]);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const storedTasks = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      } else {
        const fetchedTasks = await getTasks();
        setTasks(fetchedTasks);
      }
      const storedShowWeekends = localStorage.getItem(SHOW_WEEKENDS_KEY);
      if (storedShowWeekends) {
        setShowWeekends(JSON.parse(storedShowWeekends));
      }
      const storedHideCompleted = localStorage.getItem(HIDE_COMPLETED_KEY);
      if (storedHideCompleted) {
        setHideCompleted(JSON.parse(storedHideCompleted));
      }
      const storedFitToScreen = localStorage.getItem(FIT_TO_SCREEN_KEY);
      if (storedFitToScreen !== null) {
        setFitToScreen(JSON.parse(storedFitToScreen));
      }

      const aiStatus = await getAIFeatureStatus();
      setIsAIFeatureEnabled(aiStatus);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error loading tasks',
        description: 'Could not load tasks from storage. Loading sample data.',
      });
      // Fallback to sample data on error
      const fetchedTasks = await getTasks();
      setTasks(fetchedTasks);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadTasks();
      setIsClient(true);
    }
  }, [loadTasks]);


  const updateAndSaveTasks = useCallback((newTasksOrFn: React.SetStateAction<Task[]>) => {
    setTasks(newTasksOrFn);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      startTransition(() => {
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
        } catch (e) {
          toast({ variant: 'destructive', title: 'Save failed', description: 'Could not save tasks to local storage.' });
        }
      });
    }
  }, [tasks, isLoading, toast, startTransition]);

  const handleToggleWeekends = () => {
    setShowWeekends(current => {
      const newValue = !current;
      localStorage.setItem(SHOW_WEEKENDS_KEY, JSON.stringify(newValue));
      return newValue;
    });
  }

  const handleToggleHideCompleted = () => {
    setHideCompleted(current => {
      const newValue = !current;
      localStorage.setItem(HIDE_COMPLETED_KEY, JSON.stringify(newValue));
      return newValue;
    });
  }

  const handleToggleFitToScreen = () => {
    setFitToScreen(current => {
      const newValue = !current;
      localStorage.setItem(FIT_TO_SCREEN_KEY, JSON.stringify(newValue));
      return newValue;
    });
  }


  const handleMoveTaskUpDown = useCallback((taskId: string, direction: 'up' | 'down') => {
    updateAndSaveTasks(currentTasks => {
      const taskIndex = currentTasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return currentTasks;

      const newTasks = [...currentTasks];
      const targetIndex = direction === 'up' ? taskIndex - 1 : taskIndex + 1;

      if (targetIndex < 0 || targetIndex >= newTasks.length) {
        return currentTasks;
      }

      const taskToMove = newTasks[taskIndex];
      const taskToSwapWith = newTasks[targetIndex];

      newTasks[taskIndex] = taskToSwapWith;
      newTasks[targetIndex] = taskToMove;

      return newTasks;
    });
  }, [updateAndSaveTasks]);


  const handleSetTaskParent = useCallback((childId: string, parentId: string | null) => {
    updateAndSaveTasks(currentTasks => {
      const childTask = currentTasks.find(t => t.id === childId);
      if (!childTask) return currentTasks;

      const oldParentId = childTask.parentId;

      // Indenting checks
      if (parentId) {
        const hasChildren = currentTasks.some(t => t.parentId === childId);
        if (hasChildren) {
          toast({
            variant: 'destructive',
            title: 'Nesting failed',
            description: 'Cannot indent a task that already has sub-tasks.',
          });
          return currentTasks;
        }

        const parentTask = currentTasks.find(t => t.id === parentId);
        if (parentTask?.parentId) {
          toast({
            variant: 'destructive',
            title: 'Nesting failed',
            description: 'Cannot nest a task more than one level deep.',
          });
          return currentTasks;
        }
      }

      let newTasks = [...currentTasks];
      const childIndex = newTasks.findIndex(t => t.id === childId);

      if (childIndex === -1) return newTasks;

      // Update parentId
      newTasks[childIndex] = { ...newTasks[childIndex], parentId };

      // Reorder the list
      const [movedChild] = newTasks.splice(childIndex, 1);

      if (parentId) { // Reorder logic for INDENTING
        const parentChildren = newTasks.filter(t => t.parentId === parentId);
        let targetIndex;

        if (parentChildren.length > 0) {
          const lastChild = parentChildren[parentChildren.length - 1];
          targetIndex = newTasks.findIndex(t => t.id === lastChild.id);
        } else {
          targetIndex = newTasks.findIndex(t => t.id === parentId);
        }

        newTasks.splice(targetIndex + 1, 0, movedChild);
      } else { // Reorder logic for UN-INDENTING
        if (oldParentId) {
          const oldParentIndex = newTasks.findIndex(t => t.id === oldParentId);
          if (oldParentIndex !== -1) {
            newTasks.splice(oldParentIndex + 1, 0, movedChild);
          } else {
            // old parent not found, just put it at the end
            newTasks.push(movedChild);
          }
        } else {
          // Was not a child before, something is wrong, put it back
          newTasks.splice(childIndex, 0, movedChild);
        }
      }

      return newTasks;
    });
  }, [updateAndSaveTasks, toast]);

  const handleAddTaskSmart = useCallback(async (selectedTaskId: string | null) => {
    const allIds = tasks.map(t => t.id);
    const newTaskId = await generateTaskId(allIds);

    if (!selectedTaskId) {
      // No task is selected, add a new task at the very top.
      const newTask: Task = {
        id: newTaskId,
        title: '[ ] New Task',
        createdAt: new Date().toISOString(),
        parentId: null,
        statuses: { monday: 'default', tuesday: 'default', wednesday: 'default', thursday: 'default', friday: 'default', saturday: 'default', sunday: 'default' },
        week: currentWeekKey,
        isNew: true,
      };
      updateAndSaveTasks(currentTasks => [newTask, ...currentTasks]);
      setSelectedTaskId(newTask.id);
      return;
    }

    const selectedTask = tasks.find(t => t.id === selectedTaskId);
    if (!selectedTask) return;

    const isParent = tasks.some(t => t.parentId === selectedTaskId);

    if (isParent) {
      // Selected task is a parent, add new task as the first child.
      const newTask: Task = {
        id: newTaskId,
        title: '[ ] New Task',
        createdAt: new Date().toISOString(),
        parentId: selectedTaskId,
        statuses: { monday: 'default', tuesday: 'default', wednesday: 'default', thursday: 'default', friday: 'default', saturday: 'default', sunday: 'default' },
        week: selectedTask.week,
        isNew: true,
      };
      updateAndSaveTasks(currentTasks => {
        const parentIndex = currentTasks.findIndex(t => t.id === selectedTaskId);
        const newTasks = [...currentTasks];
        newTasks.splice(parentIndex + 1, 0, newTask);
        return newTasks;
      });
      setSelectedTaskId(newTaskId);
    } else {
      // Selected task is a child or a regular task, add new task after it.
      const newTask: Task = {
        id: newTaskId,
        title: '[ ] New Task',
        createdAt: new Date().toISOString(),
        parentId: selectedTask.parentId, // Inherit parentage
        statuses: { monday: 'default', tuesday: 'default', wednesday: 'default', thursday: 'default', friday: 'default', saturday: 'default', sunday: 'default' },
        week: selectedTask.week,
        isNew: true,
      };
      updateAndSaveTasks(currentTasks => {
        const afterIndex = currentTasks.findIndex(t => t.id === selectedTaskId);
        const newTasks = [...currentTasks];
        newTasks.splice(afterIndex + 1, 0, newTask);
        return newTasks;
      });
      setSelectedTaskId(newTaskId);
    }
  }, [tasks, currentWeekKey, updateAndSaveTasks]);



  const handleSmartImport = useCallback(async () => {
    if (typeof window.showOpenFilePicker === 'function') {
      try {
        const [handle] = await window.showOpenFilePicker({
          types: [{
            description: 'Markdown File',
            accept: { 'text/markdown': ['.md', '.txt'] },
          }],
          multiple: false,
        });

        if (handle) {
          const file = await handle.getFile();
          const content = await file.text();
          const newTasks = await parseTasksMarkdown(content);
          if (newTasks.length > 0) {
            updateAndSaveTasks(newTasks);
            setImportFileHandle(handle);
            toast({ title: 'Success', description: `Imported ${newTasks.length} tasks. Press Ctrl+R or click refresh icon to reload.` });
          } else {
            toast({ variant: 'destructive', title: 'Import failed', description: 'No tasks found.' });
          }
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Import failed:', error);
          toast({ variant: 'destructive', title: 'Import error', description: 'Could not open file.' });
        }
      }
    } else {
      fileInputRef.current?.click();
    }
  }, [updateAndSaveTasks, toast]);

  const handleImportHotkey = useCallback(async () => {
    if (importFileHandle) {
      try {
        const file = await importFileHandle.getFile();
        const content = await file.text();
        const newTasks = await parseTasksMarkdown(content);
        if (newTasks.length > 0) {
          updateAndSaveTasks(newTasks);
          toast({ title: 'Reloaded', description: `Re-imported tasks from ${importFileHandle.name}` });
        } else {
          toast({ variant: 'destructive', title: 'Reload failed', description: 'No tasks found.' });
        }
      } catch (error) {
        console.error('Re-import failed:', error);
        toast({ variant: 'destructive', title: 'Reload failed', description: 'Could not read file. Select it again.' });
        handleSmartImport(); // Fallback to picking again
      }
    } else {
      handleSmartImport();
    }
  }, [importFileHandle, updateAndSaveTasks, toast, handleSmartImport]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        handleAddTaskSmart(selectedTaskId);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        handleDownload();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'r' || e.key === 'R')) {
        e.preventDefault();
        handleImportHotkey();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        handleDownload();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        handlePrint();
        return;
      }

      if (e.key === 'Delete') {
        if (selectedTaskId) {
          e.preventDefault();
          const task = tasks.find(t => t.id === selectedTaskId);
          if (task) {
            setTaskToDelete(task);
            setIsDeleteAlertOpen(true);
          }
        }
        return;
      }

      if (!selectedTaskId) return;

      const selectedTask = tasks.find(t => t.id === selectedTaskId);
      if (!selectedTask) return;

      const selectedTaskIndex = navigableTasks.findIndex(t => t.id === selectedTaskId);

      if (e.key === 'ArrowUp' && !e.ctrlKey) {
        e.preventDefault();
        if (selectedTaskIndex > 0) {
          setSelectedTaskId(navigableTasks[selectedTaskIndex - 1].id);
        }
      } else if (e.key === 'ArrowDown' && !e.ctrlKey) {
        e.preventDefault();
        if (selectedTaskIndex < navigableTasks.length - 1) {
          setSelectedTaskId(navigableTasks[selectedTaskIndex + 1].id);
        }
      } else if (e.key === 'ArrowUp' && e.ctrlKey) {
        e.preventDefault();
        handleMoveTaskUpDown(selectedTaskId, 'up');
      } else if (e.key === 'ArrowDown' && e.ctrlKey) {
        e.preventDefault();
        handleMoveTaskUpDown(selectedTaskId, 'down');
      } else if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        if (selectedTaskIndex > 0) {
          const taskAbove = navigableTasks[selectedTaskIndex - 1];
          if (taskAbove.parentId) {
            handleSetTaskParent(selectedTaskId, taskAbove.parentId);
          } else {
            handleSetTaskParent(selectedTaskId, taskAbove.id);
          }
        }
      } else if (e.key === 'Tab' && e.shiftKey) {
        e.preventDefault();
        if (selectedTask.parentId) {
          handleSetTaskParent(selectedTaskId, null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedTaskId, tasks, handleMoveTaskUpDown, handleSetTaskParent, navigableTasks, handleAddTaskSmart, handleDownload, handlePrint, handleImportHotkey]);




  const handleToggleCollapse = useCallback((taskId: string) => {
    updateAndSaveTasks(currentTasks => {
      return currentTasks.map(t => {
        if (t.id === taskId) {
          return { ...t, isCollapsed: !t.isCollapsed };
        }
        return t;
      });
    });
  }, [updateAndSaveTasks]);

  const getTaskById = useCallback((taskId: string) => {
    return tasks.find(t => t.id === taskId);
  }, [tasks]);

  const handleStatusChange = (taskId: string, day: keyof Task['statuses'], newStatus: TaskStatus) => {
    const task = getTaskById(taskId);
    if (task?.title.startsWith('[v]')) return;

    if (isMobile) {
      setSelectedTaskId(taskId);
    }

    updateAndSaveTasks(currentTasks =>
      currentTasks.map(task => {
        if (task.id === taskId) {
          const newStatuses = { ...task.statuses, [day]: newStatus };
          return { ...task, statuses: newStatuses };
        }
        return task;
      })
    );
  };

  const handleAddTask = async () => {
    const newTaskId = await generateTaskId(tasks.map(t => t.id));
    const newTask: Task = {
      id: newTaskId,
      title: '[ ] New Task',
      createdAt: new Date().toISOString(),
      parentId: null,
      statuses: {
        monday: 'default',
        tuesday: 'default',
        wednesday: 'default',
        thursday: 'default',
        friday: 'default',
        saturday: 'default',
        sunday: 'default',
      },
      week: currentWeekKey,
      isNew: true,
    };
    updateAndSaveTasks(currentTasks => [newTask, ...currentTasks]);
    setSelectedTaskId(newTask.id);
  };

  const handleAddTaskAfter = async (afterTaskId: string) => {
    const afterTask = getTaskById(afterTaskId);
    if (!afterTask) return;

    const newTaskId = await generateTaskId(tasks.map(t => t.id));
    const newTask: Task = {
      id: newTaskId,
      title: '[ ] New Task',
      createdAt: new Date().toISOString(),
      parentId: afterTask.parentId, // Inherit parentage
      statuses: {
        monday: 'default', tuesday: 'default', wednesday: 'default',
        thursday: 'default', friday: 'default', saturday: 'default',
        sunday: 'default',
      },
      week: afterTask.week,
      isNew: true,
    };

    updateAndSaveTasks(currentTasks => {
      const afterIndex = currentTasks.findIndex(t => t.id === afterTaskId);
      if (afterIndex === -1) return currentTasks;

      const newTasks = [...currentTasks];
      newTasks.splice(afterIndex + 1, 0, newTask);
      return newTasks;
    });
    setSelectedTaskId(newTaskId);
  };

  const handleAddSubTasks = useCallback(async (parentId: string, subTaskTitles: string[]) => {
    const parentTask = tasks.find(t => t.id === parentId);
    if (!parentTask) return;

    const newSubTasks: Task[] = [];
    const existingIds = tasks.map(t => t.id);

    for (const title of subTaskTitles) {
      const newId = await generateTaskId(existingIds.concat(newSubTasks.map(t => t.id)));
      const newTask: Task = {
        id: newId,
        title: `[ ] ${title}`,
        createdAt: new Date().toISOString(),
        parentId: parentId,
        week: parentTask.week,
        statuses: {
          monday: 'default', tuesday: 'default', wednesday: 'default',
          thursday: 'default', friday: 'default', saturday: 'default',
          sunday: 'default',
        },
      };
      newSubTasks.push(newTask);
    }

    updateAndSaveTasks(currentTasks => {
      const parentIndex = currentTasks.findIndex(t => t.id === parentId);
      if (parentIndex === -1) return currentTasks;

      const newTasks = [...currentTasks];
      newTasks.splice(parentIndex + 1, 0, ...newSubTasks);
      return newTasks;
    });
  }, [tasks, updateAndSaveTasks]);


  const handleUpdateTask = (taskId: string, newTitle: string) => {
    updateAndSaveTasks(currentTasks =>
      currentTasks.map(task =>
        task.id === taskId ? { ...task, title: newTitle, isNew: false } : task
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    updateAndSaveTasks(currentTasks => currentTasks.filter(task => task.id !== taskId && task.parentId !== taskId));
    setSelectedTaskId(null);
  };

  const handleConfirmDelete = () => {
    if (taskToDelete) {
      handleDeleteTask(taskToDelete.id);
    }
    setIsDeleteAlertOpen(false);
    setTaskToDelete(null);
  };

  const handleTriggerDelete = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setTaskToDelete(task);
      setIsDeleteAlertOpen(true);
    }
  };

  const handleToggleDone = (taskId: string) => {
    updateAndSaveTasks(currentTasks =>
      currentTasks.map(task => {
        if (task.id === taskId) {
          const isDone = task.title.startsWith('[v]');
          const newTitle = isDone
            ? `[ ]${task.title.substring(3)}`
            : `[v]${task.title.substring(3)}`;

          return { ...task, title: newTitle };
        }
        return task
      })
    );
  }

  const handleMoveTask = useCallback((dragId: string, hoverId: string) => {
    updateAndSaveTasks((prevTasks) => {
      const newTasks = [...prevTasks];
      const dragIndex = newTasks.findIndex(t => t.id === dragId);
      const hoverIndex = newTasks.findIndex(t => t.id === hoverId);

      if (dragIndex === -1 || hoverIndex === -1) {
        return newTasks;
      }

      const [movedTask] = newTasks.splice(dragIndex, 1);
      newTasks.splice(hoverIndex, 0, movedTask);

      return newTasks;
    });
  }, [updateAndSaveTasks]);


  const handleMoveTaskToWeek = useCallback((taskId: string, direction: 'next' | 'previous') => {
    const taskToMove = tasks.find(t => t.id === taskId);
    if (!taskToMove) return;

    if (taskToMove.parentId) {
      setChildMoveState({ taskId, direction, parentId: taskToMove.parentId });
      return;
    }

    updateAndSaveTasks(currentTasks => {
      const childrenToMove = currentTasks.filter(t => t.parentId === taskId);
      const taskIdsToMove = [taskId, ...childrenToMove.map(t => t.id)];

      const [year, weekNumber] = taskToMove.week.split('-').map(Number);

      const firstDayOfYear = parse(`${year}-01-04`, 'yyyy-MM-dd', new Date());
      const startOfFirstWeek = startOfWeek(firstDayOfYear, { weekStartsOn: 1 });
      const taskDate = addDays(startOfFirstWeek, (weekNumber - 1) * 7);

      const newDate = addDays(taskDate, direction === 'next' ? 7 : -7);

      const newWeek = getWeek(newDate, { weekStartsOn: 1 });
      const newYear = getYear(newDate);
      const newWeekKey = `${newYear}-${newWeek}`;

      return currentTasks.map(task => {
        if (taskIdsToMove.includes(task.id)) {
          return { ...task, week: newWeekKey };
        }
        return task;
      });
    });
  }, [tasks, updateAndSaveTasks]);

  const handleConfirmMoveChild = useCallback(async (action: 'recreate-parent' | 'unindent') => {
    if (!childMoveState) return;

    const { taskId, direction, parentId } = childMoveState;
    const taskToMove = tasks.find(t => t.id === taskId);
    if (!taskToMove) {
      setChildMoveState(null);
      return;
    }

    const [year, weekNumber] = taskToMove.week.split('-').map(Number);
    const firstDayOfYear = parse(`${year}-01-04`, 'yyyy-MM-dd', new Date());
    const startOfFirstWeek = startOfWeek(firstDayOfYear, { weekStartsOn: 1 });
    const taskDate = addDays(startOfFirstWeek, (weekNumber - 1) * 7);
    const newDate = addDays(taskDate, direction === 'next' ? 7 : -7);
    const newWeek = getWeek(newDate, { weekStartsOn: 1 });
    const newYear = getYear(newDate);
    const newWeekKey = `${newYear}-${newWeek}`;

    let newParentTask: Task | null = null;

    if (action === 'recreate-parent') {
      const parentTask = tasks.find(t => t.id === parentId);
      if (parentTask) {
        const newParentId = await generateTaskId(tasks.map(t => t.id));
        newParentTask = {
          ...parentTask,
          id: newParentId,
          week: newWeekKey,
          statuses: {
            monday: 'default', tuesday: 'default', wednesday: 'default',
            thursday: 'default', friday: 'default', saturday: 'default',
            sunday: 'default',
          },
          createdAt: new Date().toISOString(),
          isNew: false
        };
      }
    }

    updateAndSaveTasks(currentTasks => {
      let tasksToSave = [...currentTasks];

      if (newParentTask) {
        tasksToSave.push(newParentTask);
      }

      tasksToSave = tasksToSave.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            week: newWeekKey,
            parentId: action === 'recreate-parent' && newParentTask ? newParentTask.id : null
          };
        }
        return task;
      });

      return tasksToSave;
    });

    setChildMoveState(null);
  }, [childMoveState, tasks, updateAndSaveTasks]);

  const handleCopyUnfinishedToNextWeek = useCallback(async () => {
    const currentWeekKey = `${getYear(currentDate)}-${getWeek(currentDate, { weekStartsOn: 1 })}`;
    const unfinishedTasks = tasks.filter(t => t.week === currentWeekKey && !t.title.startsWith('[v]'));

    if (unfinishedTasks.length === 0) {
      toast({ title: "All tasks are finished!", description: "Nothing to move to the next week." });
      return;
    }

    const nextWeekDate = addDays(currentDate, 7);
    const nextWeek = getWeek(nextWeekDate, { weekStartsOn: 1 });
    const nextYear = getYear(nextWeekDate);
    const nextWeekKey = `${nextYear}-${nextWeek}`;

    const newTasks: Task[] = [];
    const idMap = new Map<string, string>();
    const allIds = tasks.map(t => t.id);

    // First pass: Generate new IDs for all tasks to be copied
    for (const task of unfinishedTasks) {
      const newId = await generateTaskId([...allIds, ...Array.from(idMap.values())]);
      idMap.set(task.id, newId);
    }

    // Second pass: Create new task objects
    for (const task of unfinishedTasks) {
      const newId = idMap.get(task.id)!;
      // Determine new parent ID
      // If parent is also being copied, use its new ID.
      // If parent is NOT being copied (e.g. it was finished), set parentId to null (become top-level).
      const newParentId = task.parentId && idMap.has(task.parentId) ? idMap.get(task.parentId)! : null;

      newTasks.push({
        ...task,
        id: newId,
        parentId: newParentId,
        week: nextWeekKey,
        statuses: {
          monday: 'default', tuesday: 'default', wednesday: 'default',
          thursday: 'default', friday: 'default', saturday: 'default',
          sunday: 'default',
        },
        createdAt: new Date().toISOString(),
        isNew: true
      });
    }

    toast({ title: `Copied ${unfinishedTasks.length} open tasks to the next week.` });

    updateAndSaveTasks(currentTasks => [...currentTasks, ...newTasks]);
  }, [currentDate, tasks, toast, updateAndSaveTasks]);



  const handleShare = () => {
    const data = encodeShareData(weeklyTasks, currentWeekKey);
    const url = `${window.location.origin}/share/${data}`;
    setShareUrl(url);
    setIsShareDialogOpen(true);
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({ title: "Link copied to clipboard!" });
  };




  const handleUploadClick = () => {
    handleSmartImport();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        try {
          const newTasks = await parseTasksMarkdown(content);
          if (newTasks.length > 0) {
            updateAndSaveTasks(newTasks);
            toast({ title: 'Success', description: `Imported ${newTasks.length} tasks successfully.` });
          } else {
            toast({
              variant: 'destructive',
              title: 'Import failed',
              description: 'No tasks were found in the file. See debug logs for details.',
            });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Could not parse the markdown file.';
          toast({
            variant: 'destructive',
            title: 'Import failed',
            description: errorMessage,
          });
        }
      }
    };
    reader.readAsText(file);

    if (event.target) event.target.value = '';
  };


  const handleSelectTask = (taskId: string | null) => {
    if (taskId === selectedTaskId) {
      setSelectedTaskId(null);
    } else {
      setSelectedTaskId(taskId);
    }
  };

  const goToPreviousWeek = () => {
    setCurrentDate(prevDate => addDays(prevDate, -7));
  };

  const goToNextWeek = () => {
    setCurrentDate(newDate => addDays(newDate, 7));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  if (!isClient) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const startOfWeekDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDates = Array.from({ length: 7 }).map((_, i) => addDays(startOfWeekDate, i));



  const today = new Date();
  const isCurrentWeek = getYear(currentDate) === getYear(today) && getWeek(currentDate, { weekStartsOn: 1 }) === getWeek(today, { weekStartsOn: 1 });





  return (
    <DndProvider backend={DndBackend} options={dndOptions}>
      <div className="min-h-screen bg-background text-foreground flex flex-col" onClick={() => setSelectedTaskId(null)}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".md,.txt"
          className="hidden"
        />
        <Header
          isSaving={isPending}
          onDownload={handleDownload}
          onUpload={handleUploadClick}
          onPrint={handlePrint}
          onShare={handleShare}
          canReImport={!!importFileHandle}
          onReImport={handleImportHotkey}
        />
        <main className="flex-grow py-4" onClick={(e) => e.stopPropagation()}>
          <div className="w-full px-2 max-w-7xl">
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4 sm:px-0">
                  <Button variant="outline" size="icon" onClick={goToPreviousWeek} aria-label="Previous week">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2 text-center justify-center">
                    <h2
                      className="text-sm sm:text-base md:text-xl font-bold font-headline whitespace-normal sm:whitespace-nowrap"
                    >
                      Week of{" "}
                      <WeekPicker currentDate={currentDate} onWeekChange={setCurrentDate}>
                        <span className="underline decoration-dotted underline-offset-4 cursor-pointer hover:opacity-70 transition-opacity">
                          {format(startOfWeekDate, 'MMMM')} {getDayWithSuffix(startOfWeekDate)}, {format(startOfWeekDate, 'yyyy')}
                        </span>
                      </WeekPicker>
                    </h2>
                  </div>
                  <Button variant="outline" size="icon" onClick={goToNextWeek} aria-label="Next week">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="sm:px-0 pb-2 overflow-x-auto">
                  <TaskGrid
                    tasks={navigableTasks}
                    selectedTaskId={selectedTaskId}
                    onStatusChange={handleStatusChange}
                    onUpdateTask={handleUpdateTask}
                    onDeleteTask={handleTriggerDelete}
                    onToggleDone={handleToggleDone}
                    onAddTask={handleAddTask}
                    onAddTaskAfter={handleAddTaskAfter}
                    onAddSubTasks={handleAddSubTasks}
                    onMoveTask={handleMoveTask}
                    onSetTaskParent={handleSetTaskParent}
                    getTaskById={getTaskById}
                    weekDates={weekDates}
                    isAIFeatureEnabled={isAIFeatureEnabled}
                    hideCompleted={hideCompleted}
                    onToggleHideCompleted={handleToggleHideCompleted}
                    fitToScreen={fitToScreen}
                    onToggleFitToScreen={handleToggleFitToScreen}
                    onMoveToWeek={handleMoveTaskToWeek}
                    onMoveTaskUpDown={handleMoveTaskUpDown}
                    onSelectTask={handleSelectTask}
                    allTasks={tasks}
                    showWeekends={showWeekends}
                    onToggleWeekends={handleToggleWeekends}
                    weeklyTasksCount={weeklyTasks.length}
                    today={today}
                    onToggleCollapse={handleToggleCollapse}
                  />
                </div>
                <div className="mt-2 flex flex-row items-start justify-between gap-4 sm:px-0">
                  <div className="flex-shrink-0 min-w-[45%] sm:min-w-0">
                    <Legend />
                  </div>
                  <div className="flex flex-col items-end gap-4 text-right sm:text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="link" className="max-w-[170px] sm:max-w-xs h-auto p-0 text-right leading-tight whitespace-normal font-normal">
                          Copy all open tasks to next week
                          <ArrowRight className="ml-2 size-4 inline-block" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will copy all open tasks from the current week to the next one.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleCopyUnfinishedToNextWeek}>
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    {/* <Link href="/welcome" className="text-sm text-muted-foreground hover:text-foreground transition-colors mr-1">
                      Back to the Welcome page
                    </Link> */}
                    <Button
                      variant="link"
                      className="max-w-[170px] sm:max-w-xs h-auto p-0 text-right leading-tight whitespace-normal font-normal"
                      onClick={() => setIsStartFreshOpen(true)}
                    >
                      Start Fresh
                      <RotateCcw className="ml-2 size-4 inline-block" />
                    </Button>
                  </div>
                </div>

              </>
            )}
          </div>
        </main>

        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the task "{taskToDelete?.title.substring(taskToDelete.title.indexOf(']') + 2)}" and all its sub-tasks.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setTaskToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <AlertDialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>File Already Exists</AlertDialogTitle>
              <AlertDialogDescription>
                You have previously exported to "{fileHandle?.name}". Do you want to overwrite it or save as a new file?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setPendingMarkdown(null)}>Cancel</AlertDialogCancel>
              <Button variant="outline" onClick={handleSaveNew}>Save As...</Button>
              <AlertDialogAction onClick={handleOverwrite}>Overwrite</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!childMoveState} onOpenChange={(open) => !open && setChildMoveState(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Move Child Task</AlertDialogTitle>
              <AlertDialogDescription>
                This task belongs to a parent task. How would you like to move it to the {childMoveState?.direction} week?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel onClick={() => setChildMoveState(null)}>Cancel</AlertDialogCancel>
              <Button variant="outline" onClick={() => handleConfirmMoveChild('unindent')}>
                Un-indent and Move
              </Button>
              <AlertDialogAction onClick={() => handleConfirmMoveChild('recreate-parent')}>
                Recreate Parent & Move
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <AlertDialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Switch to Light Theme for Printing?</AlertDialogTitle>
              <AlertDialogDescription>
                Printing in dark mode is not recommended. For the best results, we suggest switching to the light theme before printing your document.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button variant="outline" onClick={handlePrintInDarkMode}>Print in Dark theme</Button>
              <AlertDialogAction onClick={handleSwitchThemeAndPrint}>
                Switch to Light theme & Print
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>


        <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Share Week List</DialogTitle>
              <DialogDescription>
                Anyone with this link can view this week's tasks in read-only mode.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="link" className="sr-only">
                  Link
                </Label>
                <Input
                  id="link"
                  defaultValue={shareUrl}
                  readOnly
                />
              </div>
              <Button size="sm" className="px-3" onClick={handleCopyShareLink}>
                <span className="sr-only">Copy</span>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <DialogFooter className="sm:justify-start">
              <Button type="button" variant="secondary" onClick={() => setIsShareDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>

          <StartFreshDialog
            open={isStartFreshOpen}
            onOpenChange={setIsStartFreshOpen}
            onConfirm={handleStartFreshConfirm}
            onExport={handleStartFreshExport}
          />
        </Dialog>

      </div >
    </DndProvider >
  );
}

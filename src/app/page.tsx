'use client';

import React, { useState, useMemo, useTransition, useEffect } from 'react';
import type { Task } from '@/lib/types';
import { handleSuggestTasks, handleBreakDownTask } from './actions';
import { Header } from '@/components/Header';
import { AddTaskForm } from '@/components/AddTaskForm';
import { TaskList } from '@/components/TaskList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const initialTasksData: Omit<Task, 'id' | 'createdAt'>[] = [
  {
    title: 'Plan summer vacation',
    status: 'todo',
    parentId: null,
    subTasks: [
      { title: 'Research destinations', status: 'todo', parentId: '1', subTasks: [] },
      { title: 'Book flights', status: 'todo', parentId: '1', subTasks: [] },
      { title: 'Reserve accommodation', status: 'done', parentId: '1', subTasks: [] },
    ],
  },
  {
    title: 'Weekly grocery shopping',
    status: 'done',
    parentId: null,
    subTasks: [],
  },
  {
    title: 'Finish Q2 report',
    status: 'todo',
    parentId: null,
    subTasks: [],
  },
];

const addIdsAndDates = (tasks: Omit<Task, 'id' | 'createdAt'>[], parentId: string | null = null): Task[] => {
  return tasks.map((task) => {
    const id = crypto.randomUUID();
    return {
      ...task,
      id,
      parentId,
      createdAt: new Date().toISOString(),
      subTasks: task.subTasks ? addIdsAndDates(task.subTasks, id) : [],
    };
  });
};


// Recursive helper to find and update a task in the tree
const updateTaskInTree = (
  tasks: Task[],
  taskId: string,
  updateFn: (task: Task) => Task
): Task[] => {
  return tasks.map((task) => {
    if (task.id === taskId) {
      return updateFn(task);
    }
    if (task.subTasks.length > 0) {
      return { ...task, subTasks: updateTaskInTree(task.subTasks, taskId, updateFn) };
    }
    return task;
  });
};

// Recursive helper to add a subtask
const addSubTaskToTree = (
  tasks: Task[],
  parentId: string,
  newSubTask: Task
): Task[] => {
  return tasks.map((task) => {
    if (task.id === parentId) {
      return { ...task, subTasks: [...task.subTasks, newSubTask] };
    }
    if (task.subTasks.length > 0) {
      return { ...task, subTasks: addSubTaskToTree(task.subTasks, parentId, newSubTask) };
    }
    return task;
  });
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isAiLoading, startAiTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    setTasks(addIdsAndDates(initialTasksData));
    setIsClient(true);
  }, []);

  const handleAddTask = (title: string, parentId: string | null = null) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      status: 'todo',
      parentId,
      subTasks: [],
      createdAt: new Date().toISOString(),
    };

    if (parentId) {
      setTasks((prevTasks) => addSubTaskToTree(prevTasks, parentId, newTask));
    } else {
      setTasks((prevTasks) => [...prevTasks, newTask]);
    }
  };

  const handleToggleTask = (taskId: string) => {
    setTasks((prevTasks) =>
      updateTaskInTree(prevTasks, taskId, (task) => ({
        ...task,
        status: task.status === 'todo' ? 'done' : 'todo',
      }))
    );
  };

  const runSuggestTasks = () => {
    startAiTransition(async () => {
      const allTasks: Task[] = [];
      const collectTasks = (tasks: Task[]) => {
        tasks.forEach(task => {
          allTasks.push(task);
          if (task.subTasks.length > 0) {
            collectTasks(task.subTasks);
          }
        });
      };
      collectTasks(tasks);

      const completed = allTasks.filter(t => t.status === 'done').map(t => t.title);
      const incomplete = allTasks.filter(t => t.status === 'todo').map(t => t.title);
      
      const suggestions = await handleSuggestTasks(completed, incomplete);
      
      if (suggestions.length > 0) {
        toast({
          title: 'AI Suggestions',
          description: (
            <ul className="list-disc pl-5">
              {suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          ),
        });
        suggestions.forEach(title => handleAddTask(title));
      } else {
        toast({
          title: 'AI Suggestions',
          description: 'No new task suggestions at the moment.',
        });
      }
    });
  };

  const runBreakDownTask = (taskId: string) => {
    startAiTransition(async () => {
      let taskToBreakDown: Task | undefined;
      const findTask = (tasks: Task[], id: string): Task | undefined => {
        for (const task of tasks) {
          if (task.id === id) return task;
          if (task.subTasks.length > 0) {
            const found = findTask(task.subTasks, id);
            if (found) return found;
          }
        }
      };
      taskToBreakDown = findTask(tasks, taskId);

      if (!taskToBreakDown) {
        toast({ title: 'Error', description: 'Task not found.', variant: 'destructive' });
        return;
      }

      const subTasksTitles = await handleBreakDownTask(taskToBreakDown.title);

      if (subTasksTitles.length > 0) {
        const newSubTasks: Task[] = subTasksTitles.map(title => ({
            id: crypto.randomUUID(),
            title,
            status: 'todo',
            parentId: taskId,
            subTasks: [],
            createdAt: new Date().toISOString(),
        }));
        
        setTasks(prevTasks => updateTaskInTree(prevTasks, taskId, (task) => ({
            ...task,
            subTasks: [...task.subTasks, ...newSubTasks],
        })))

        toast({
            title: 'Task Broken Down!',
            description: `Added ${subTasksTitles.length} sub-tasks to "${taskToBreakDown.title}".`,
        });
      } else {
        toast({
            title: 'AI Assistant',
            description: 'Could not break down the task further.',
        });
      }
    });
  };

  const { todoTasks, completedTasks } = useMemo(() => {
    const todo: Task[] = [];
    const completed: Task[] = [];
    tasks.forEach(task => {
        if (task.status === 'todo') todo.push(task)
        else completed.push(task)
    })
    return { todoTasks: todo, completedTasks: completed }
  }, [tasks]);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
        <Header onSuggestTasks={() => {}} isAiLoading={false} />
        <main className="max-w-7xl mx-auto mt-8">
          <Card className="mb-8">
            <CardHeader>
              <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <Header onSuggestTasks={runSuggestTasks} isAiLoading={isAiLoading} />
      <main className="max-w-7xl mx-auto mt-8">
        <Card className="mb-8 shadow-md">
          <CardHeader>
            <CardTitle className="font-headline">Add New Task</CardTitle>
          </CardHeader>
          <CardContent>
            <AddTaskForm onAddTask={handleAddTask} />
          </CardContent>
        </Card>
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="font-headline">To-Do</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskList
                tasks={todoTasks}
                onToggleTask={handleToggleTask}
                onAddTask={handleAddTask}
                onBreakDownTask={runBreakDownTask}
                isAiLoading={isAiLoading}
              />
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="font-headline">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskList
                tasks={completedTasks}
                onToggleTask={handleToggleTask}
                onAddTask={handleAddTask}
                onBreakDownTask={runBreakDownTask}
                isAiLoading={isAiLoading}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

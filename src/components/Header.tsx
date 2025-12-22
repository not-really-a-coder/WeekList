
'use client';

import Link from 'next/link';
import React from 'react';
import Logo from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { Loader2, Download, Upload, Menu, Printer, CircleHelp, Share2, Check, Info, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { AboutDialog } from './AboutDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

import { useOS } from '@/hooks/use-os';

interface HeaderProps {
  isSaving: boolean;
  onDownload: () => void;
  onUpload: () => void;
  onPrint: () => void;
  onShare?: () => void;
  isReadOnly?: boolean;
  fitToScreen?: boolean;
  onToggleFitToScreen?: () => void;
  hideClosed?: boolean;
  onToggleHideClosed?: () => void;
  canReImport?: boolean;
  onReImport?: () => void;
}

export function Header({
  isSaving,
  onDownload,
  onUpload,
  onPrint,
  onShare,
  isReadOnly = false,
  fitToScreen,
  onToggleFitToScreen,
  hideClosed,
  onToggleHideClosed,
  canReImport,
  onReImport
}: HeaderProps) {
  const [showAbout, setShowAbout] = React.useState(false);
  const os = useOS();
  const modifier = os === 'mac' ? '⌘' : 'Ctrl';

  return (
    <>
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-50 print:hidden">
        <div className="flex items-center justify-between px-2 py-2 w-full max-w-7xl gap-2 md:gap-4">
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 md:gap-3">
              <Logo className="size-8" />
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold font-headline text-foreground">WeekList</h1>
                {isReadOnly && <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded font-medium">Snapshot</span>}
              </div>
            </Link>
            {isSaving && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
          </div>
          <div className="flex items-center justify-end gap-2">
            {!isReadOnly && canReImport && onReImport && (
              <Button variant="ghost" size="icon" onClick={onReImport} className="size-8 hover:bg-accent hover:text-accent-foreground" aria-label={`Reload from file (${modifier}+R)`}>
                <RefreshCw className="size-5" />
              </Button>
            )}
            {!isReadOnly && onShare && (
              <Button variant="ghost" size="icon" onClick={onShare} className="size-8 hover:bg-accent hover:text-accent-foreground" aria-label="Share this list">
                <Share2 className="size-5" />
              </Button>
            )}
            {!isReadOnly && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8 hover:bg-accent hover:text-accent-foreground">
                    <CircleHelp className="size-5" />
                    <span className="sr-only">Help</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2 text-muted-foreground">Desktop Hotkeys</h4>
                      <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">↑/↓</span>
                        <span>Navigate tasks</span>

                        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{modifier}+Enter</span>
                        <span>Add new task (smartly)</span>

                        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">Enter</span>
                        <span>Save changes</span>

                        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">Del</span>
                        <span>Delete a task</span>

                        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{modifier}+&#8593;/&#8595;</span>
                        <span>Move task up/down</span>

                        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">Tab</span>
                        <span>Indent task</span>

                        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">Shift+Tab</span>
                        <span>Un-indent task</span>

                        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{modifier}+S</span>
                        <span>Save tasks to .md</span>

                        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{modifier}+R</span>
                        <span>(Re)Load tasks from .md</span>

                        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{modifier}+P</span>
                        <span>Print</span>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium text-sm mb-2 text-muted-foreground">Mobile Controls</h4>
                      <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">Long-tap</span>
                        <span>Open context menu</span>

                        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">Swipe right</span>
                        <span>Indent task</span>

                        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">Swipe left</span>
                        <span>Un-indent task</span>

                        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">Tap & Drag</span>
                        <span>Reorder task</span>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {/* Theme Toggle - standalone for read-only or regular if desired */}
            {isReadOnly ? (
              <ThemeToggle isDropdown={false} showLabel={false} />
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8 hover:bg-accent hover:text-accent-foreground dark:hover:bg-white/10 dark:hover:text-accent-foreground transition-colors">
                    <Menu className="size-5" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {!isReadOnly && (
                    <>
                      <DropdownMenuItem onClick={onUpload}>
                        <Upload className="mr-2 size-4" />
                        Load (.md)
                        <span className="ml-auto text-xs tracking-widest text-muted-foreground opacity-60 hidden md:inline-block">{modifier}+R</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={onDownload}>
                        <Download className="mr-2 size-4" />
                        Save (.md)
                        <span className="ml-auto text-xs tracking-widest text-muted-foreground opacity-60 hidden md:inline-block">{modifier}+S</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem onClick={onPrint}>
                    <Printer className="mr-2 size-4" />
                    Print
                    <span className="ml-auto text-xs tracking-widest text-muted-foreground opacity-60 hidden md:inline-block">{modifier}+P</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <ThemeToggle />
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowAbout(true)}>
                    <Info className="mr-2 size-4" />
                    About Weeklist
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>
      <AboutDialog open={showAbout} onOpenChange={setShowAbout} />
    </>
  );
}

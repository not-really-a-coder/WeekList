
'use client';

import React from 'react';
import Logo from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { Loader2, Download, Upload, Menu, Printer, CircleHelp, Share2, Check } from 'lucide-react';
import { Button } from './ui/button';
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
  onToggleHideClosed
}: HeaderProps) {
  return (
    <>
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-50 print:hidden">
        <div className="flex items-center justify-between px-2 py-2 w-full max-w-7xl gap-4">
          <div className="flex items-center gap-3 flex-shrink-0">
            <Logo className="size-8" />
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold font-headline text-foreground">WeekList</h1>
              {isReadOnly && <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded font-medium">Snapshot</span>}
              {isSaving && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
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

                        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">Ctrl+Enter</span>
                        <span>Create a new task</span>

                        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">Enter</span>
                        <span>Save changes</span>

                        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">Del</span>
                        <span>Delete a task</span>

                        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">Ctrl+↑/↓</span>
                        <span>Move task up/down</span>

                        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">Tab</span>
                        <span>Indent task</span>

                        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">Shift+Tab</span>
                        <span>Un-indent task</span>

                        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">Ctrl+S</span>
                        <span>Export tasks</span>

                        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">Ctrl+P</span>
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
                        Import (.md)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={onDownload}>
                        <Download className="mr-2 size-4" />
                        Export (.md)
                        <span className="ml-auto text-xs tracking-widest text-muted-foreground opacity-60 hidden md:inline-block">Ctrl+S</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem onClick={onPrint}>
                    <Printer className="mr-2 size-4" />
                    Print
                    <span className="ml-auto text-xs tracking-widest text-muted-foreground opacity-60 hidden md:inline-block">Ctrl+P</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <ThemeToggle />
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

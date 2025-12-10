
'use client';

import React from 'react';
import Logo from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { Loader2, Download, Upload, Menu, Printer } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  isSaving: boolean;
  onDownload: () => void;
  onUpload: () => void;
  onPrint: () => void;
}

export function Header({ isSaving, onDownload, onUpload, onPrint }: HeaderProps) {
  return (
    <>
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-50 print:hidden">
        <div className="flex items-center justify-between px-4 py-2 w-full max-w-7xl gap-4">
          <div className="flex items-center gap-3 flex-shrink-0">
            <Logo className="size-8" />
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold font-headline text-foreground">WeekList</h1>
              {isSaving && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={onUpload}>
                  <Upload className="mr-2 size-4" />
                  Import (.md)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDownload}>
                  <Download className="mr-2 size-4" />
                  Export (.md)
                  <span className="ml-auto text-xs tracking-widest text-muted-foreground opacity-60 hidden md:inline-block">Ctrl+S</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onPrint}>
                  <Printer className="mr-2 size-4" />
                  Print
                  <span className="ml-auto text-xs tracking-widest text-muted-foreground opacity-60 hidden md:inline-block">Ctrl+P</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <ThemeToggle />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    </>
  );
}


import React from 'react';
import Logo from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { Loader2, Download, Upload, Menu } from 'lucide-react';
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
}

export function Header({ isSaving, onDownload, onUpload }: HeaderProps) {
  return (
    <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
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
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onUpload}>
                <Upload className="mr-2" />
                Import (.md)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDownload}>
                <Download className="mr-2" />
                Export (.md)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <ThemeToggle />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

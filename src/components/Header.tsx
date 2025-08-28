
'use client';

import React, { useState } from 'react';
import Logo from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { Loader2, Download, Upload, Menu, Check, Printer } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface HeaderProps {
  isSaving: boolean;
  onDownload: () => void;
  onUpload: () => void;
  showWeekends: boolean;
  onToggleWeekends: () => void;
}

export function Header({ isSaving, onDownload, onUpload, showWeekends, onToggleWeekends }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [showPrintDialog, setShowPrintDialog] = useState(false);

  const openPrintPage = () => {
    window.open('/print', '_blank');
  };

  const handlePrint = () => {
    if (theme === 'dark') {
      setShowPrintDialog(true);
    } else {
      openPrintPage();
    }
  };

  const handleSwitchThemeAndPrint = () => {
    setTheme('light');
    openPrintPage();
    setShowPrintDialog(false);
  };
  
  const handlePrintInDarkMode = () => {
    openPrintPage();
    setShowPrintDialog(false);
  }

  return (
    <>
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10 print:hidden">
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
                <DropdownMenuCheckboxItem
                  checked={showWeekends}
                  onSelect={(e) => e.preventDefault()} // prevent menu from closing
                  onClick={onToggleWeekends}
                >
                  Show Weekends
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onUpload}>
                  <Upload className="mr-2" />
                  Import (.md)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDownload}>
                  <Download className="mr-2" />
                  Export (.md)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePrint}>
                  <Printer className="mr-2" />
                  Print
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <ThemeToggle />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
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
    </>
  );
}

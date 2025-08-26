
import React from 'react';
import Logo from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { Loader2, Download, Upload } from 'lucide-react';
import { Button } from './ui/button';


interface HeaderProps {
    isSaving: boolean;
    onDownload: () => void;
    onUpload: () => void;
}


export function Header({ isSaving, onDownload, onUpload }: HeaderProps) {
  
  return (
    <header className="border-b">
      <div className="flex items-center justify-between mx-auto px-2 py-4 w-full gap-4">
        <div className="flex items-center gap-3 flex-shrink-0">
          <Logo className="size-8" />
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-headline text-foreground">WeekList</h1>
            {isSaving && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 flex-grow">
          <Button variant="outline" size="sm" onClick={onUpload}>
            <Upload className="mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={onDownload}>
            <Download className="mr-2" />
            Export
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

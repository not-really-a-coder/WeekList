
import React from 'react';
import Logo from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './ui/button';
import { Download, Upload, Loader2 } from 'lucide-react';
import { getTasksMarkdown } from '@/app/actions';
import { Label } from './ui/label';

interface HeaderProps {
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isSaving: boolean;
}


export function Header({ onFileUpload, isSaving }: HeaderProps) {

  const handleDownload = async () => {
    const markdown = await getTasksMarkdown();
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
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
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="size-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="size-4 mr-2" />
              Upload
            </Label>
          </Button>
          <input type="file" id="file-upload" className="hidden" accept=".md,text/markdown" onChange={onFileUpload} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

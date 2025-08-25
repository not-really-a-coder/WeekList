
import React from 'react';
import Logo from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { Loader2 } from 'lucide-react';

interface HeaderProps {
    isSaving: boolean;
}


export function Header({ isSaving }: HeaderProps) {
  
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
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

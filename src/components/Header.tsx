
import React from 'react';
import Logo from './Logo';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  return (
    <header className="border-b">
      <div className="flex items-center justify-between mx-auto px-2 py-4 w-full gap-4">
        <div className="flex items-center gap-3 flex-shrink-0">
          <Logo className="size-8" />
          <h1 className="text-2xl font-bold font-headline text-foreground">WeekList</h1>
        </div>
        <div className="flex items-center justify-end gap-2 flex-grow">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

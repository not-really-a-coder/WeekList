
import React from 'react';
import Logo from './Logo';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  return (
    <header className="flex items-center justify-between px-4 py-4 border-b max-w-7xl mx-auto w-full gap-4 sm:px-0">
      <div className="flex items-center gap-3 flex-shrink-0">
        <Logo className="size-8" />
        <h1 className="text-2xl font-bold font-headline text-foreground">WeekList</h1>
      </div>
      <div className="flex items-center justify-end gap-2 flex-grow">
        <ThemeToggle />
      </div>
    </header>
  );
}

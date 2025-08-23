import React from 'react';
import Logo from './Logo';

export function Header() {
  return (
    <header className="flex items-center justify-between p-4 border-b max-w-7xl mx-auto w-full">
      <div className="flex items-center gap-3">
        <Logo className="size-8" />
        <h1 className="text-2xl font-bold font-headline text-foreground">WeekList</h1>
      </div>
    </header>
  );
}

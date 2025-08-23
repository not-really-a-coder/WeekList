import React from 'react';
import Logo from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { WeekNavigator, WeekNavigatorProps } from './WeekNavigator';

export function Header({
  currentDate,
  goToPreviousWeek,
  goToNextWeek,
  goToToday,
}: WeekNavigatorProps) {
  return (
    <header className="flex items-center justify-between p-4 border-b max-w-7xl mx-auto w-full gap-4">
      <div className="flex items-center gap-3 flex-shrink-0">
        <Logo className="size-8" />
        <h1 className="text-2xl font-bold font-headline text-foreground">WeekList</h1>
      </div>
      <div className="flex items-center justify-end gap-2 flex-grow">
        <WeekNavigator 
            currentDate={currentDate}
            goToPreviousWeek={goToPreviousWeek}
            goToNextWeek={goToNextWeek}
            goToToday={goToToday}
        />
        <ThemeToggle />
      </div>
    </header>
  );
}

import React from 'react';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, startOfWeek, getWeek, getYear } from 'date-fns';

export interface WeekNavigatorProps {
    currentDate: Date;
    goToPreviousWeek: () => void;
    goToNextWeek: () => void;
    goToToday: () => void;
}

export function WeekNavigator({ currentDate, goToPreviousWeek, goToNextWeek, goToToday }: WeekNavigatorProps) {
    const startOfWeekDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDisplay = `Week of ${format(startOfWeekDate, 'MMMM do, yyyy')}`;

    const today = new Date();
    const isCurrentWeek = getYear(currentDate) === getYear(today) && getWeek(currentDate, { weekStartsOn: 1 }) === getWeek(today, { weekStartsOn: 1 });


    return (
        <div className="flex items-center gap-2 justify-center flex-grow">
            <Button variant="outline" size="icon" onClick={goToPreviousWeek} aria-label="Previous week">
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 text-center justify-center">
                <h2 className="text-xs md:text-lg font-bold font-headline whitespace-nowrap">{weekDisplay}</h2>
                {!isCurrentWeek && (
                <Button variant="ghost" size="icon" onClick={goToToday} aria-label="Go to today">
                    <Calendar className="h-4 w-4" />
                </Button>
                )}
            </div>
            <Button variant="outline" size="icon" onClick={goToNextWeek} aria-label="Next week">
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    )
}

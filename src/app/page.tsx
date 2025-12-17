import dynamic from 'next/dynamic';
import React from 'react';
import { Loader2, Calendar, ClipboardList } from 'lucide-react';
import { getWeek, getYear, startOfWeek, addDays, format, getDate } from 'date-fns';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';

// Helper for date formatting matching ClientApp
const getDayWithSuffix = (date: Date) => {
  const day = getDate(date);
  let suffix = 'th';
  if (day % 10 === 1 && day !== 11) suffix = 'st';
  if (day % 10 === 2 && day !== 12) suffix = 'nd';
  if (day % 10 === 3 && day !== 13) suffix = 'rd';
  return (
    <>
      {day}
      <sup>{suffix}</sup>
    </>
  );
};

const ClientApp = dynamic(() => import('./ClientApp'), {
  ssr: true,
  loading: () => {
    // Replicate the initial view (Header + Title) to prevent LCP delay
    const today = new Date();
    const currentWeek = getWeek(today, { weekStartsOn: 1 });
    const currentYear = getYear(today);
    const firstDayOfYear = new Date(currentYear, 0, 4); // Standard ISO week logic approx
    const startOfFirstWeek = startOfWeek(firstDayOfYear, { weekStartsOn: 1 });
    const startOfCurrentWeek = addDays(startOfFirstWeek, (currentWeek - 1) * 7);

    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {/* Static Header Shell */}
        <div className="border-b sticky top-0 bg-background/95 backdrop-blur z-50 print:hidden">
          <div className="flex items-center justify-between px-2 py-2 w-full max-w-7xl gap-4">
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Logo Placeholder */}
              <div className="flex items-center gap-3">
                <div className="size-8" />
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold font-headline text-foreground">WeekList</h1>
                </div>
              </div>
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        </div>

        <main className="flex-grow py-4">
          <div className="w-full px-2 max-w-7xl">
            {/* Title Section matching ClientApp */}
            <div className="flex items-center justify-between mb-4 px-2 sm:px-0">
              <div className="w-10"></div>
              <div className="flex items-center gap-2 text-center justify-center">
                <h2 className="text-sm sm:text-base md:text-xl font-bold font-headline whitespace-normal sm:whitespace-nowrap">
                  Week of {format(startOfCurrentWeek, 'MMMM')} {getDayWithSuffix(startOfCurrentWeek)}, {format(startOfCurrentWeek, 'yyyy')}
                </h2>
              </div>
              <div className="w-10"></div>
            </div>

            {/* Grid Loading State */}
            <div className="flex items-center justify-center p-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </main>
      </div>
    );
  },
});

export default function Page() {
  const today = new Date();
  return <ClientApp initialDate={today.toISOString()} />;
}

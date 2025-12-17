
import type { Metadata } from 'next';

import '@/app/globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils'; // Assuming cn utility is available there as per common shadcn patterns

export const metadata: Metadata = {
    title: 'WeekList - Master your week',
    description: 'The local-first weekly planner for high performers.',
};

export default function WelcomeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={cn("font-sans antialiased min-h-screen bg-background text-foreground dark")}>
            <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                forcedTheme="dark"
                disableTransitionOnChange
            >
                {children}
            </ThemeProvider>
        </div>
    );
}

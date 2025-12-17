"use client";

import React, { useMemo } from "react";
import {
    Check,
    X,
    ArrowRight,
    Plus,
    ChevronLeft,
    ChevronRight,
    SlidersHorizontal,
    ChevronDown,
    CornerDownRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";

export function DemoGrid() {
    const gridColsClass = "grid-cols-[repeat(7,3.5rem)_1fr]"; // Fixed width for columns to ensure perfect alignment

    // Dynamic dates logic
    const { weekDates, weekTitle } = useMemo(() => {
        const today = new Date();
        const start = startOfWeek(today, { weekStartsOn: 1 }); // Monday start
        const dates = Array.from({ length: 7 }).map((_, i) => addDays(start, i));

        // Format: "December 15th, 2025"
        // Note: date-fns 'do' format adds ordinal (st, nd, rd, th)
        const title = format(start, 'MMMM do, yyyy');

        return { weekDates: dates, weekTitle: title };
    }, []);

    const today = new Date();

    return (
        <div className="w-full bg-card/50 backdrop-blur-sm border rounded-xl shadow-2xl overflow-hidden flex flex-col font-sans select-none text-left">

            {/* Top Bar: Week Navigation */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                <button className="p-1 rounded-md hover:bg-muted/50 text-muted-foreground transition-colors">
                    <ChevronLeft className="size-5" />
                </button>
                <div className="text-lg font-bold tracking-tight text-foreground">
                    Week of <span className="underline decoration-dotted underline-offset-4 decoration-muted-foreground/50">{weekTitle}</span>
                </div>
                <button className="p-1 rounded-md hover:bg-muted/50 text-muted-foreground transition-colors">
                    <ChevronRight className="size-5" />
                </button>
            </div>

            {/* Grid Header */}
            <div className={cn("grid gap-px border-b bg-border", gridColsClass)}>
                {weekDates.map((date, i) => {
                    const isToday = isSameDay(date, today);
                    return (
                        <div key={i} className={cn(
                            "bg-muted px-1 py-2 flex flex-col items-center justify-center relative",
                            isToday && "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#66b2f0]" // Active day indicator
                        )}>
                            <span className="text-[10px] font-bold text-foreground">{format(date, 'EEEEE')}</span> {/* M, T, W... */}
                            <span className="text-xs font-medium text-foreground">{format(date, 'd')}</span>
                        </div>
                    );
                })}

                {/* Task Header */}
                <div className="bg-muted px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">Task</span>
                        <SlidersHorizontal className="size-3.5 text-foreground" />
                    </div>
                    <Plus className="size-4 text-foreground" />
                </div>
            </div>

            {/* Grid Rows */}
            <div className="bg-border grid gap-px">
                {/* Row 1 */}
                {/* Parent Task: Quality of Life */}
                <Row
                    statuses={{
                        [getDayKey(0)]: "check",
                        [getDayKey(1)]: "check",
                        [getDayKey(2)]: "dot",
                        [getDayKey(3)]: "dot",
                        [getDayKey(4)]: "dot",
                        [getDayKey(5)]: "dot"
                    }}
                    text="Improve the quality of life"
                    isParent={true}
                    isCollapsed={false}
                />

                {/* Child 3 */}
                <Row
                    statuses={{
                        [getDayKey(0)]: "check",
                        [getDayKey(1)]: "dot",
                        [getDayKey(2)]: "dot",
                        [getDayKey(3)]: "dot",
                        [getDayKey(4)]: "dot",
                        [getDayKey(5)]: "dot",
                        [getDayKey(6)]: "dot"
                    }}
                    text="Spend quality time with family"
                    level={1}
                    className="border-l-2 border-l-red-500"
                />

                {/* Child 1 */}
                <Row
                    statuses={{
                        [getDayKey(0)]: "check",
                        [getDayKey(2)]: "dot",
                        [getDayKey(4)]: "arrow",
                        [getDayKey(5)]: "dot"
                    }}
                    text="Run at least 15 minutes in the park"
                    level={1}
                />

                <Row
                    statuses={{
                        [getDayKey(0)]: "check"
                    }}
                    text="Cancel all unused software subscriptions"
                    level={1}
                    isCompleted={true}
                    taskStatus="check"
                />

                {/* Branch Parent */}
                <Row
                    statuses={{
                        [getDayKey(0)]: "check",
                        [getDayKey(1)]: "arrow",
                        [getDayKey(2)]: "dot",
                        [getDayKey(3)]: "dot"
                    }}
                    text="Kick-off website redesign project"
                    isParent={true}
                    isCollapsed={false}
                    className="border-l-2 border-l-red-500"
                />

                {/* Branch Child 1 */}
                <Row
                    statuses={{ [getDayKey(0)]: "check" }}
                    text="Finalize homepage copy with marketing team"
                    level={1}
                    isCompleted={true}
                    taskStatus="check"
                />

                {/* Branch Child 2 */}
                <Row
                    statuses={{ [getDayKey(2)]: "dot" }}
                    text="Review mobile responsiveness on staging"
                    level={1}
                />

                {/* Branch Child 3 */}
                <Row
                    statuses={{ [getDayKey(3)]: "dot" }}
                    text="Prepare assets for Monday launch"
                    level={1}
                />

                {/* Row 3 */}
                <Row
                    statuses={{
                        [getDayKey(1)]: "dot",
                        [getDayKey(3)]: "dot"
                    }}
                    text="Get over with personal routine"
                    isParent={true}
                    isCollapsed={false}
                />

                {/* Child 3 */}
                <Row
                    statuses={{
                        [getDayKey(1)]: "arrow",
                        [getDayKey(3)]: "dot"
                    }}
                    text="Pay utility bills"
                    level={1}
                />
                <Row
                    statuses={{
                        [getDayKey(3)]: "dot"
                    }}
                    text="Grocery shopping"
                    level={1}
                />
            </div>

            {/* Legend Footer */}
            <div className="bg-muted/30 px-4 py-2 flex flex-wrap items-center justify-start gap-x-4 gap-y-2 border-t">
                <div className="flex items-center gap-1.5">
                    <StatusIcon type="dot" />
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Planned</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <StatusIcon type="arrow" />
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Rescheduled</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <StatusIcon type="check" />
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Completed</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <StatusIcon type="x" />
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Cancelled</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-1 h-3 bg-red-500 rounded-full" />
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Important</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="size-3.5 rounded-full border border-green-500/50 flex items-center justify-center">
                        <Check className="size-2 text-green-500" />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Closed</span>
                </div>
            </div>
        </div>
    );
}

// Helper to get dynamic keys based on index 0-6 (Mon-Sun)
// In the original map, keys were 'm', 't', 'w'... simplifying to use index based keys or mapping
// Let's keep the simple object key approach but mapping dynamic week days is tricky if we want exact days.
// For the mock, we can just say index 0 is Monday, index 1 is Tuesday, etc.
function getDayKey(index: number) {
    const days = ['m', 't', 'w', 'th', 'f', 's', 'su'];
    return days[index];
}


function Row({
    statuses = {},
    text,
    isCompleted,
    taskStatus,
    className,
    level = 0,
    isParent = false,
    isCollapsed = false
}: {
    statuses?: Record<string, "check" | "x" | "arrow" | "dot">,
    text: string,
    isCompleted?: boolean,
    taskStatus?: "check",
    className?: string,
    level?: number,
    isParent?: boolean,
    isCollapsed?: boolean
}) {
    const gridColsClass = "grid-cols-[repeat(7,3.5rem)_1fr]"; // Fixed width for columns to ensure perfect alignment
    const days = ['m', 't', 'w', 'th', 'f', 's', 'su'];

    return (
        <div className={cn("grid gap-px group", gridColsClass)}>
            {days.map(day => (
                <div key={day} className="bg-background min-h-[3rem] flex items-center justify-center transition-colors">
                    <StatusIcon type={statuses[day]} />
                </div>
            ))}
            <div className={cn(
                "bg-background min-h-[3rem] flex items-center justify-between px-4 py-1 relative transition-colors",
                // Hover effect: Pseudo-element border to ensure visibility and prevent layout shifts/clipping
                "after:absolute after:inset-0 after:border after:border-[#66b2f0] after:opacity-0 hover:after:opacity-100 after:pointer-events-none after:transition-opacity",
                className
            )}>
                <div className="flex items-center gap-2 overflow-hidden flex-1">
                    {/* Indentation & Child Arrow */}
                    {level > 0 && (
                        <div className="flex items-center justify-end shrink-0 text-muted-foreground mr-1" style={{ width: `${level * 24}px` }}>
                            <CornerDownRight className="size-3.5" />
                        </div>
                    )}

                    <div className="flex items-center gap-1 min-w-0">
                        <span className={cn(
                            "text-sm line-clamp-2 leading-snug break-words",
                            isParent ? "font-bold" : "font-normal",
                            isCompleted ? "text-muted-foreground/50 line-through" : "text-foreground"
                        )}>
                            {text}
                        </span>

                        {/* Parent Toggle (Right of text) */}
                        {isParent && (
                            <button className="text-muted-foreground hover:text-foreground shrink-0 flex items-center justify-center">
                                {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}
                            </button>
                        )}
                    </div>
                </div>

                {taskStatus === 'check' && (
                    <div className="size-4 rounded-full border border-green-500/50 flex items-center justify-center shrink-0 ml-2">
                        <Check className="size-2.5 text-green-500" />
                    </div>
                )}
            </div>
        </div>
    );
}

function StatusIcon({ type }: { type?: "check" | "x" | "arrow" | "dot" }) {
    if (!type) return null;

    switch (type) {
        case 'check':
            return <Check className="size-4 text-green-500" />;
        case 'x':
            return <X className="size-4 text-red-500" />;
        case 'arrow':
            return <ArrowRight className="size-4 text-blue-500" />;
        case 'dot':
            return <div className="size-1.5 rounded-full bg-slate-600 dark:bg-slate-400" />;
        default:
            return null;
    }
}

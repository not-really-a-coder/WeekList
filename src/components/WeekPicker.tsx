"use client"

import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { startOfWeek, endOfWeek } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface WeekPickerProps {
    currentDate: Date
    onWeekChange: (date: Date) => void
    children?: React.ReactNode
}

export function WeekPicker({ currentDate, onWeekChange, children }: WeekPickerProps) {
    const [open, setOpen] = React.useState(false)

    // Calculate the selected range based on the current date
    const selectedWeek = {
        from: startOfWeek(currentDate, { weekStartsOn: 1 }),
        to: endOfWeek(currentDate, { weekStartsOn: 1 }),
    }

    const handleSelect = (date: Date | undefined) => {
        if (!date) return
        onWeekChange(date)
        setOpen(false)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                {children ?? (
                    <Button
                        variant={"ghost"}
                        size="icon"
                        className={cn(
                            "h-8 w-8",
                            open ? "bg-accent text-accent-foreground" : ""
                        )}
                    >
                        <CalendarIcon className="h-4 w-4" />
                        <span className="sr-only">Pick a week</span>
                    </Button>
                )}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="range"
                    defaultMonth={selectedWeek.from}
                    selected={selectedWeek}
                    onDayClick={handleSelect}
                    weekStartsOn={1}
                    numberOfMonths={2}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    )
}

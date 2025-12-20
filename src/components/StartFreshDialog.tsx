'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from './ui/checkbox';
import { AlertCircle, Download, Trash2, ArrowRight } from 'lucide-react';

interface StartFreshDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (options: { deleteAll: boolean; deleteCurrentWeek: boolean; resetPrefs: boolean }) => void;
    onExport: () => void;
}

type Step = 'SELECTION' | 'CONFIRMATION';

export function StartFreshDialog({ open, onOpenChange, onConfirm, onExport }: StartFreshDialogProps) {
    const [step, setStep] = useState<Step>('SELECTION');
    const [deleteOption, setDeleteOption] = useState<'current-week' | 'all'>('current-week');
    const [resetPrefs, setResetPrefs] = useState(false);

    // Reset state when dialog opens
    React.useEffect(() => {
        if (open) {
            setStep('SELECTION');
            setDeleteOption('current-week');
            setResetPrefs(false);
        }
    }, [open]);

    const handleNext = () => {
        setStep('CONFIRMATION');
    };

    const handleBack = () => {
        setStep('SELECTION');
    };

    const handleConfirm = () => {
        onConfirm({
            deleteAll: deleteOption === 'all',
            deleteCurrentWeek: deleteOption === 'current-week',
            resetPrefs
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                {step === 'SELECTION' ? (
                    <>
                        <DialogHeader>
                            <DialogTitle>Start Fresh</DialogTitle>
                            <DialogDescription>
                                Choose how you want to reset your WeekList.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-6 py-4">
                            <RadioGroup value={deleteOption} onValueChange={(v) => setDeleteOption(v as any)} className="gap-4">
                                <div className="flex items-start space-x-3 space-y-0">
                                    <RadioGroupItem value="current-week" id="current-week" className="mt-1" />
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="current-week" className="font-semibold cursor-pointer">
                                            Delete tasks for current week only
                                        </Label>
                                        <span className="text-sm text-muted-foreground">
                                            Keeps history of other weeks intact.
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3 space-y-0">
                                    <RadioGroupItem value="all" id="all" className="mt-1" />
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="all" className="font-semibold cursor-pointer">
                                            Delete all tasks
                                        </Label>
                                        <span className="text-sm text-muted-foreground">
                                            Completely wipes your local database.
                                        </span>
                                    </div>
                                </div>
                            </RadioGroup>

                            <div className="flex items-center space-x-2 pt-2 border-t">
                                {/* Using native checkbox if UI component missing, or assume Checkbox exists. 
                                    Let's use a simple input checkbox if unsure, or check if Checkbox exists.
                                    ClientApp uses Switch, but Checkbox is standard. 
                                    I will try to use <input type="checkbox" /> styled with tailwind for simplicity if I can't be sure, 
                                    but standard shadcn is <Checkbox />. I'll gamble on standard Radix Checkbox if likely.
                                    Actually, I'll use a standard input to be safe and fast.
                                */}
                                <input
                                    type="checkbox"
                                    id="reset-prefs"
                                    checked={resetPrefs}
                                    onChange={(e) => setResetPrefs(e.target.checked)}
                                    className="h-4 w-4 rounded border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 accent-primary"
                                />
                                <Label htmlFor="reset-prefs" className="cursor-pointer">
                                    Reset my app preferences also?
                                </Label>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button onClick={handleNext}>Next</Button>
                        </DialogFooter>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-destructive flex items-center gap-2">
                                <AlertCircle className="size-5" />
                                Are you sure?
                            </DialogTitle>
                            <DialogDescription>
                                This action cannot be undone.
                                {deleteOption === 'all'
                                    ? ' All your tasks will be permanently deleted.'
                                    : ' Tasks for this week will be permanently deleted.'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-2">
                            {/* Placeholder for visual warning if needed */}
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="ghost" onClick={handleBack} className="mr-auto">Back</Button>
                            <Button variant="outline" onClick={onExport} className="gap-2">
                                <Download className="size-4" />
                                Export to MD
                            </Button>
                            <Button variant="destructive" onClick={handleConfirm} className="gap-2">
                                <Trash2 className="size-4" />
                                Delete
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

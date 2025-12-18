'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Github, ExternalLink, Linkedin, Rocket } from 'lucide-react';

interface AboutDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AboutDialog({ open, onOpenChange }: AboutDialogProps) {
    const updateDate = process.env.NEXT_PUBLIC_UPDATE_DATE || 'Unknown';
    const router = useRouter();

    // Cleanup effect for when dialog closes
    React.useEffect(() => {
        if (!open) {
            const timer = setTimeout(() => {
                document.body.style.pointerEvents = '';
                document.body.removeAttribute('data-scroll-locked');
            }, 300);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [open]);

    const handleWelcomeClick = (e: React.MouseEvent) => {
        e.preventDefault();
        onOpenChange(false);
        // Small delay to allow Dialog to close and clean up pointer-events
        setTimeout(() => {
            router.push('/welcome');
        }, 300);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        About WeekList
                        <span className="text-xs font-normal text-muted-foreground px-2 py-0.5 rounded-full bg-muted border">
                            v1.0
                        </span>
                    </DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-2 text-sm">
                    <div className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-2">
                        <div className="text-muted-foreground">Public Preview</div>
                        <div className="font-medium">19.12.2025</div>
                        <div className="text-muted-foreground">Last Updated</div>
                        <div className="font-medium">{updateDate}</div>
                    </div>

                    <div className="space-y-3 pt-2 border-t">
                        <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Vibe-coded by</span>
                            <Link
                                href="https://www.linkedin.com/in/leonidardaev/"
                                target="_blank"
                                className="font-medium hover:underline hover:text-primary flex items-center gap-1 transition-colors"
                            >
                                <Linkedin className="size-3" />
                                Leonid Ardaev
                            </Link>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Link
                                href="https://github.com/not-really-a-coder/WeekList"
                                target="_blank"
                                className="hover:underline flex items-center gap-2 group w-fit"
                            >
                                <Github className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                <span>Github Repo</span>
                            </Link>

                            <div className="flex items-center gap-2 opacity-60 cursor-not-allowed select-none w-fit tooltipp">
                                <Rocket className="size-4 text-muted-foreground" />
                                <span>Product Hunt (tbc)</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 border-t space-y-4">
                        <div className="text-xs text-muted-foreground">
                            Distributed under GPL 3.0 Licence
                        </div>

                        <div>
                            <Link href="/welcome" onClick={handleWelcomeClick} className="text-primary hover:underline font-medium flex items-center gap-1 w-fit">
                                Go to Welcome Page
                                <ExternalLink className="size-3" />
                            </Link>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

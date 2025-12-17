'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, Shield, Zap, Calendar, MousePointer2, Github } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '@/components/Logo';
import { DemoGrid } from './demo-grid';

export default function WelcomePage() {
    return (
        <div className="flex flex-col min-h-screen bg-background overflow-hidden selection:bg-primary/20">

            {/* Navigation Layer */}
            <nav className="flex items-center justify-between px-6 py-4 w-full max-w-7xl mx-auto z-50">
                <div className="flex items-center gap-2 font-bold text-xl font-headline tracking-tight">
                    <Logo className="size-8" />
                    WeekList
                </div>
                <div className="flex items-center gap-4">

                    <Button asChild className="rounded-full px-6 font-semibold shadow-lg hover:shadow-primary/25 transition-all">
                        <Link href="/?start=true">
                            Start Planning
                        </Link>
                    </Button>
                </div>
            </nav>

            <main className="flex-grow">

                {/* --- HERO SECTION --- */}
                <section className="relative pt-5 pb-16 px-6 overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] opacity-50" />
                        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] opacity-50" />
                    </div>

                    <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/50 border border-border/50 text-xs font-medium text-muted-foreground mb-8 backdrop-blur-sm"
                        >
                            <Zap className="size-3 text-yellow-500 fill-yellow-500" />
                            <span>Public preview is now live</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-5xl md:text-7xl font-extrabold font-headline tracking-tight leading-[1.1] mb-2 text-foreground"
                        >
                            Your Week, <br />
                            <span className="inline-flex flex-col h-[1.1em] overflow-hidden relative w-full items-center justify-center">
                                <RotatingText words={["De-cluttered.", "At a Glance.", "No nonsense.", "Focused."]} />
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed"
                        >
                            The local-first planner for people who hate planning. <br className="hidden sm:block" />
                            Secure. No AI gimmicks. Fast as you are.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
                        >
                            <Button asChild size="lg" className="h-12 px-8 rounded-full text-base font-semibold shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all w-full sm:w-auto">
                                <Link href="/?start=true">
                                    Try Now
                                    <ArrowRight className="ml-2 size-4" />
                                </Link>
                            </Button>
                            {/* <Button variant="outline" size="lg" className="h-12 px-8 rounded-full text-base w-full sm:w-auto bg-background/50 backdrop-blur-md hover:bg-accent/50" asChild>
                                <Link href="#demo">
                                    See how it works
                                </Link>
                            </Button> */}
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="mt-4 text-xs text-muted-foreground/60 font-medium"
                        >
                            No authorization required. Yet.
                        </motion.p>

                        {/* Hero Visual */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="mt-16 w-full max-w-5xl mx-auto md:px-4"
                        >
                            <DemoGrid />
                            <div className="mt-16 flex justify-center">
                                <Button asChild size="lg" className="h-12 px-8 rounded-full text-base font-semibold shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all w-full sm:w-auto">
                                    <Link href="/?start=true">
                                        Experience Yourself
                                    </Link>
                                </Button>
                            </div>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                className="mt-4 text-xs text-muted-foreground/60 font-medium"
                            >
                                Trial period? No, it's just free.
                            </motion.p>

                        </motion.div>
                    </div>
                </section>

                {/* --- VALUE PROPS --- */}
                <section className="py-24 bg-muted/50 border-y border-border/50">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid md:grid-cols-3 gap-12">
                            {/* Feature 1 */}
                            <div className="space-y-4">
                                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
                                    <Calendar className="size-6" />
                                </div>
                                <h3 className="text-xl font-bold font-headline">Weekly Priorities &gt; Daily Grind</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Don't let overdue tasks shame you. WeekList treats your week as a fluid bucket, offering the flexibility to accomplish tasks without the guilt.
                                </p>
                                <div className="pt-2">
                                    {/* <Button variant="link" className="p-0 h-auto font-semibold text-primary" asChild>
                                        <Link href="#demo">See it in action <ArrowRight className="ml-1 size-3" /></Link>
                                    </Button> */}
                                </div>
                            </div>

                            {/* Feature 2 */}
                            <div className="space-y-4">
                                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
                                    <Shield className="size-6" />
                                </div>
                                <h3 className="text-xl font-bold font-headline">Local-First & Private</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Your data lives on your device in human-readable markdown. No one can see your tasks but you. No storing data on servers. No leaks.
                                </p>
                                <div className="pt-2">
                                    {/* <Button variant="link" className="p-0 h-auto font-semibold text-primary" asChild>
                                        <Link href="#demo">See it in action <ArrowRight className="ml-1 size-3" /></Link>
                                    </Button> */}
                                </div>
                            </div>

                            {/* Feature 3 */}
                            <div className="space-y-4">
                                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
                                    <Zap className="size-6" />
                                </div>
                                <h3 className="text-xl font-bold font-headline">Speed & Simplicity</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Mouse optional. Built for flow with optimized keyboard controls. Drag, drop, done. It works as fast as you think.
                                </p>
                                <div className="pt-2">
                                    {/* <Button variant="link" className="p-0 h-auto font-semibold text-primary" asChild>
                                        <Link href="#demo">See it in action <ArrowRight className="ml-1 size-3" /></Link>
                                    </Button> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- USE CASES --- */}
                <section className="py-24 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold font-headline mb-4">Built for every part of your life</h2>
                            <p className="text-muted-foreground">From deep work to daily chores.</p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { title: "For Work", icon: <BriefcaseIcon className="size-5" />, desc: "Securely plan working week output. Export for stand-ups." },
                                {
                                    title: "For Life", icon: <CoffeeIcon className="size-5" />, desc: "Missed the planned gym? Reschedule it. It's a plan, not a prison."
                                },
                                { title: "For Habits", icon: <RepeatIcon className="size-5" />, desc: "Build streaks. Copy-paste routines instantly." },
                                { title: "For Students", icon: <GraduationCapIcon className="size-5" />, desc: "Visualize semester load. No more all-nighters." }
                            ].map((useCase, i) => (
                                <div key={i} className="p-6 rounded-2xl border bg-card hover:border-primary/50 transition-colors group">
                                    <div className="mb-4 text-muted-foreground group-hover:text-primary transition-colors">
                                        {useCase.icon}
                                    </div>
                                    <h3 className="font-bold mb-2">{useCase.title}</h3>
                                    <p className="text-sm text-muted-foreground">{useCase.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 text-center">
                            <Button asChild size="lg" variant="secondary" className="rounded-full">
                                <Link href="/?start=true">Try WeekList for Free</Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* --- VIDEO DEMO PLACEHOLDER --- */}
                {/*<section id="demo" className="py-24 px-6 bg-muted/30">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl font-bold font-headline mb-12">See how fast it flows</h2>

                        <div className="relative aspect-video bg-black rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center group ring-1 ring-border">
                            <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-black" />

                            <div className="relative z-10 size-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform cursor-pointer border border-white/20">
                                <div className="ml-1 size-0 border-y-8 border-y-transparent border-l-[16px] border-l-white" />
                            </div>

                            <div className="absolute bottom-6 left-6 text-white/50 text-sm font-mono">
                                0:00 / 0:45 • WeekList Demo
                            </div>
                        </div>

                        <div className="mt-12">
                            <Button asChild size="lg" className="rounded-full h-14 px-10 text-lg shadow-xl shadow-primary/25">
                                <Link href="/">Start Planning Now</Link>
                            </Button>
                            <p className="mt-4 text-xs text-muted-foreground">Free for local use. No credit card required.</p>
                        </div>
                    </div>
                </section>*/}

                <footer className="py-12 px-6 border-t bg-background text-center text-sm text-muted-foreground flex flex-col items-center gap-4">
                    <p>&copy; {new Date().getFullYear()} WeekList. Built for focus.</p>
                    <a href="https://github.com/not-really-a-coder/WeekList" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-foreground transition-colors">
                        <Github className="size-4" />
                        <span>View on GitHub</span>
                    </a>
                </footer>

            </main>
        </div>
    );
}

// Simple Icons for Use Cases
function BriefcaseIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
    )
}

function CoffeeIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v2" /><path d="M14 2v2" /><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 0 1 4 4v0" /><path d="M6 2v2" /></svg>
    )
}

function RepeatIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m17 2 4 4-4 4" /><path d="M3 11v-1a4 4 0 0 1 4-4h14" /><path d="m7 22-4-4 4-4" /><path d="M21 13v1a4 4 0 0 1-4 4H3" /></svg>
    )
}

function GraduationCapIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
    )
}

function RotatingText({ words }: { words: string[] }) {
    const [index, setIndex] = React.useState(0);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % words.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [words.length]);

    return (
        <span className="relative flex items-center justify-center w-full">
            <AnimatePresence mode="wait">
                <motion.span
                    key={index}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="block leading-tight pb-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400" // Added padding bottom to prevent clipping of descenders
                >
                    {words[index]}
                </motion.span>
            </AnimatePresence>
        </span>
    );
}

import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import Logo from './Logo';

interface HeaderProps {
  onSuggestTasks: () => void;
  isAiLoading: boolean;
}

export function Header({ onSuggestTasks, isAiLoading }: HeaderProps) {
  return (
    <header className="flex items-center justify-between p-4 border-b max-w-7xl mx-auto w-full">
      <div className="flex items-center gap-3">
        <Logo className="size-8" />
        <h1 className="text-2xl font-bold font-headline text-foreground">FlowDo</h1>
      </div>
      <Button onClick={onSuggestTasks} disabled={isAiLoading}>
        <Sparkles className="mr-2 size-4" />
        {isAiLoading ? 'Thinking...' : 'Suggest Tasks'}
      </Button>
    </header>
  );
}

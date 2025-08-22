
import { Check, X, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Dot } from './Dot';

const legendItems = [
  { icon: <Dot className="size-3 text-muted-foreground/50" />, label: 'Planned' },
  { icon: <ArrowRight className="size-4 text-blue-500" />, label: 'Rescheduled' },
  { icon: <AlertCircle className="size-4 text-destructive" />, label: 'Important' },
  { icon: <X className="size-4 text-red-500" />, label: 'Cancelled' },
  { icon: <Check className="size-4 text-green-500" />, label: 'Completed' },
  { icon: <CheckCircle2 className="size-4 text-green-500" />, label: 'Closed' },
];

export function Legend() {
  return (
    <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm max-w-md hidden md:block">
      <h3 className="font-bold mb-2 font-headline text-sm">Legend</h3>
      <div className="grid grid-cols-3 gap-x-6 gap-y-2">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className="flex items-center justify-center w-5 h-5">{item.icon}</div>
            <span className="text-sm text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

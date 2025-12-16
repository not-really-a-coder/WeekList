

import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Print WeekList',
  description: 'Printable view of your weekly tasks.',
};

export default function PrintLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="font-body antialiased bg-background text-foreground">
      {children}
    </div>
  );
}

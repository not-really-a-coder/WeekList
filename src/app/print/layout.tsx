
import type { Metadata } from 'next';
import '../globals.css';
import { Poppins, PT_Sans } from 'next/font/google';

const fontPoppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-poppins',
});

const fontPtSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
});


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
    <div className={`${fontPoppins.variable} ${fontPtSans.variable} font-body antialiased bg-background text-foreground`}>
        {children}
    </div>
  );
}

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { BottomNav } from '@/components/BottomNav';
import { Sidebar } from '@/components/Sidebar';
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'COPUN Dashboard',
  description: 'Instructor Hub',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: '#f8fafc',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={cn("h-full", "font-sans", inter.variable)} suppressHydrationWarning>
      <head>
        {/* We can fallback to Google Fonts CDN if needed, but next/font is better performance */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} font-sans antialiased min-h-screen bg-[#EBF0F7] text-slate-900 md:flex`}>
        <Sidebar />
        <main className="flex-1 mx-auto w-full max-w-md md:max-w-7xl min-h-screen relative md:px-8 md:py-8">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}

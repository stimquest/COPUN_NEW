import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { BottomNav } from '@/components/BottomNav';
import { Sidebar } from '@/components/Sidebar';
import { cn } from "@/lib/utils";
import { createClient, getCachedUser } from '@/lib/supabase/server';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: "COP'UN Dashboard",
  description: 'Instructor Hub',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: "COP'UN",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#f8fafc',
};


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let role: string | null = null;
  let fullName: string | null = null;
  let email: string | null = null;
  let clubName: string | null = null;
  try {
    const supabase = await createClient();
    const user = await getCachedUser();
    if (user) {
      email = user.email ?? null;
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name, club_id, clubs(name)')
        .eq('id', user.id)
        .single();
      role = profile?.role ?? null;
      fullName = profile?.full_name ?? null;
      const clubs = profile?.clubs as { name: string } | { name: string }[] | null;
      clubName = clubs ? (Array.isArray(clubs) ? clubs[0]?.name : clubs.name) ?? null : null;
    }
  } catch { /* non connecté ou page publique */ }

  return (
    <html lang="fr" className={cn("h-full", "font-sans", inter.variable)} suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} font-sans antialiased min-h-screen bg-[#EBF0F7] text-slate-900 md:flex overflow-x-hidden`}>
        <Sidebar role={role} fullName={fullName} email={email} clubName={clubName} />
        {/*
          Zone de sécurité globale pour la nav flottante mobile :
          - pb réservé en bas pour que la nav (fixed, md:hidden) ne masque jamais le contenu
          - inclut le safe-area iOS
          - annulé en desktop (md:pb-8) où il n'y a pas de bottom nav
        */}
        <main className="flex-1 mx-auto w-full max-w-md md:max-w-7xl min-h-screen relative md:px-8 md:py-8 pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-8">
          {children}
        </main>
        <BottomNav role={role} />
      </body>
    </html>
  );
}

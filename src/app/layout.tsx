import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { BottomNav } from '@/components/BottomNav';
import { Sidebar } from '@/components/Sidebar';
import { cn } from "@/lib/utils";
import { getResumeFormation } from '@/actions/formation-actions';
import { getProfile } from '@/actions/user-actions';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: "COP’UN — Apprendre à parler d’environnement",
  description: 'Se former, découvrir le littoral et transmettre sur le terrain.',
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
  // Tant que la formation n'est pas terminée, un simple point dans la nav la signale
  // depuis n'importe quel écran — chargé une fois ici plutôt que dupliqué par page, et
  // c'est tout ce que la nav a besoin de savoir (pas le détail de progression, qui vit
  // sur /formation lui-même).
  let formationEnCours = false;
  try {
    const [profile, resumeFormation] = await Promise.all([getProfile(), getResumeFormation()]);
    if (profile) {
      email = profile.email ?? null;
      role = profile?.role ?? null;
      fullName = profile?.full_name ?? null;
      const clubs = profile?.clubs as { name: string } | { name: string }[] | null;
      clubName = clubs ? (Array.isArray(clubs) ? clubs[0]?.name : clubs.name) ?? null : null;

      formationEnCours = resumeFormation.nbRediges > 0 && resumeFormation.nbFaits < resumeFormation.nbTotal;
    }
  } catch { /* non connecté ou page publique */ }

  return (
    <html lang="fr" className={cn("h-full", "font-sans", inter.variable)} suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} co-app font-sans antialiased min-h-screen md:flex`}>
        <Sidebar role={role} fullName={fullName} email={email} clubName={clubName} formationEnCours={formationEnCours} />
        {/*
          Zone de sécurité globale pour la nav flottante mobile :
          - pb réservé en bas pour que la nav (fixed, md:hidden) ne masque jamais le contenu
          - inclut le safe-area iOS
          - annulé en desktop (md:pb-8) où il n'y a pas de bottom nav
        */}
        <div className="co-workspace">
          {children}
        </div>
        <BottomNav role={role} formationEnCours={formationEnCours} />
      </body>
    </html>
  );
}

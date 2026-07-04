import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function proxy(request: NextRequest) {
    return await updateSession(request);
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, manifest.webmanifest, apple-icon.png (icônes/manifest PWA —
         *   doivent rester accessibles sans session, sinon le navigateur reçoit une
         *   redirection au lieu du contenu attendu et refuse l'installation)
         * - assets statiques (images, fonts, css/js hors _next, textes bruts)
         * Chaque exécution du proxy appelle Supabase Auth (aller-retour réseau) —
         * éviter de la déclencher pour des fichiers qui n'en ont jamais besoin réduit
         * le nombre d'invocations facturées côté hébergeur.
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon\\.ico|manifest\\.webmanifest|apple-icon\\.png|icon-192\\.png|icon-512\\.png|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf|css|js|txt|xml|json)$).*)',
    ],
};

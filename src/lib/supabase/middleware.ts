import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { cheminSuivi, enregistrerNavigation } from '@/lib/suivi-navigation';

const PUBLIC_PATHS = ['/', '/login', '/auth/callback', '/auth/reset-password'];

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: { headers: request.headers },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({
                        request: { headers: request.headers },
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    const path = request.nextUrl.pathname;
    const isPublic = PUBLIC_PATHS.some(p => path === p || path.startsWith(p + '/'));

    // Non connecté → page publique seulement
    if (!user && !isPublic) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Déjà connecté → pas besoin de rester sur login/landing
    if (user && (path === '/' || path === '/login')) {
        return NextResponse.redirect(new URL('/stages', request.url));
    }

    // Compte créé par invitation/magic link : tant que le mot de passe n'a pas été défini,
    // on bloque tout accès au reste de l'app pour éviter une session "orpheline" sans
    // moyen de se reconnecter une fois expirée.
    if (user && path !== '/auth/reset-password' && !path.startsWith('/auth/callback')) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('password_set')
            .eq('id', user.id)
            .single();

        if (profile && profile.password_set === false) {
            return NextResponse.redirect(new URL('/auth/reset-password', request.url));
        }
    }

    // Route /admin → vérifier le rôle admin
    if (user && path.startsWith('/admin')) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || !['admin', 'club_admin'].includes(profile.role)) {
            return NextResponse.redirect(new URL('/stages', request.url));
        }
    }

    // Journalisation de l'usage — posée ici, après tous les contrôles, pour ne compter
    // que les navigations effectivement servies : une requête qui finit en redirection
    // n'est pas un écran consulté. Volontairement non attendue (voir suivi-navigation.ts).
    if (user && cheminSuivi(path)) {
        enregistrerNavigation(supabase, path, request.headers.get('user-agent'));
    }

    return response;
}

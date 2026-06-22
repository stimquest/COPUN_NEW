import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

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

    // Route /admin → vérifier le rôle admin
    if (user && path.startsWith('/admin')) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || profile.role !== 'admin') {
            return NextResponse.redirect(new URL('/stages', request.url));
        }
    }

    return response;
}

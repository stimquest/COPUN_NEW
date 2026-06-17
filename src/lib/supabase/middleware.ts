import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/', '/login'];

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
    const isPublic = PUBLIC_PATHS.includes(path);

    // Not logged in → redirect to landing (unless already on a public page)
    if (!user && !isPublic) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Already logged in → skip landing/login, go straight to app
    if (user && isPublic) {
        return NextResponse.redirect(new URL('/stages', request.url));
    }

    return response;
}

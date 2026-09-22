/** Only an absolute path on our own origin may follow an authentication callback. */
export function safeRedirectPath(value: string | null | undefined, fallback = '/stages'): string {
    if (!value?.startsWith('/') || value.startsWith('//') || /[\\\u0000-\u0020]/.test(value)) return fallback;
    const origin = 'https://copun.invalid';
    try {
        const url = new URL(value, origin);
        return url.origin === origin ? `${url.pathname}${url.search}${url.hash}` : fallback;
    } catch { return fallback; }
}

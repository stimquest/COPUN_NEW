import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "COP'UN — Cockpit moniteur",
        short_name: "COP'UN",
        description: "Suivi pédagogique et transmission environnementale pour moniteurs de voile.",
        start_url: '/stages',
        display: 'standalone',
        background_color: '#f8fafc',
        theme_color: '#f8fafc',
        orientation: 'portrait',
        icons: [
            { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
            { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
    };
}

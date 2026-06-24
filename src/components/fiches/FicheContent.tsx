'use client';

import { useMemo } from 'react';
import DOMPurify from 'dompurify';

/**
 * Affiche le contenu HTML d'une fiche mémo de façon sécurisée (anti-XSS).
 * Le HTML provient de l'éditeur Tiptap mais peut avoir été altéré → on sanitize toujours.
 */
export default function FicheContent({ html }: { html: string }) {
    const clean = useMemo(
        () => DOMPurify.sanitize(html, {
            ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'code', 'pre'],
            ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'class'],
        }),
        [html]
    );

    return (
        <div
            className="prose prose-slate max-w-none prose-img:rounded-xl prose-a:text-teal-600"
            dangerouslySetInnerHTML={{ __html: clean }}
        />
    );
}

import type { ReactNode } from 'react';

export function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
    return <header className="co-heading"><div><p className="co-eyebrow">{eyebrow}</p><h1>{title}</h1>{description && <p className="co-intro">{description}</p>}</div>{action}</header>;
}

/** Formes natives : le graphisme reste net, léger et indépendant des images. */
export function CoastalMark({ kind = 'waves' }: { kind?: 'waves' | 'talk' | 'compass' | 'leaf' }) {
    return <svg viewBox="0 0 160 160" fill="none" className="co-mark" aria-hidden="true">
        {kind === 'waves' && <><circle cx="95" cy="47" r="23" fill="currentColor" opacity=".22"/><path d="M8 82 Q38 48 68 82 T128 82 T188 82 M-22 108 Q8 74 38 108 T98 108 T158 108 M8 134 Q38 100 68 134 T128 134 T188 134" stroke="currentColor" strokeWidth="12" strokeLinecap="round"/></>}
        {kind === 'talk' && <><path d="M20 35 Q20 20 36 20 H110 Q126 20 126 36 V86 Q126 102 110 102 H66 L34 126 V102 Q20 102 20 86Z" fill="currentColor" opacity=".22"/><path d="M49 61 H99 M49 79 H80" stroke="currentColor" strokeWidth="9" strokeLinecap="round"/><circle cx="127" cy="127" r="19" fill="currentColor"/></>}
        {kind === 'compass' && <><circle cx="80" cy="80" r="60" stroke="currentColor" strokeWidth="2" opacity=".35"/><circle cx="80" cy="80" r="43" stroke="currentColor" strokeDasharray="2 9" strokeWidth="5"/><path d="M110 40 L92 92 L50 120 L68 68Z" fill="currentColor"/><circle cx="80" cy="80" r="7" fill="var(--co-paper)"/></>}
        {kind === 'leaf' && <><path d="M38 123 C10 49 81 19 133 24 C143 102 97 143 38 123Z" fill="currentColor" opacity=".28"/><path d="M30 139 L107 54 M51 111 L47 70 M75 88 L115 85" stroke="currentColor" strokeWidth="7" strokeLinecap="round"/></>}
    </svg>;
}

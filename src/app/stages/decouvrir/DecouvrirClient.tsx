'use client';

import { useState } from 'react';
import Link from 'next/link';
import FluxDecouverte from '@/components/explorer/FluxDecouverte';
import CardDetailModal from '@/components/CardDetailModal';
import { PedagogicalContent } from '@/types';
import { THEMATIC_LABELS, ThematicTag } from '@/data/seasonal-context';

export default function DecouvrirClient({ pool, theme, group }: { pool: PedagogicalContent[]; theme?: ThematicTag; group?: string }) {
    const [retenues, setRetenues] = useState<string[]>([]);
    const [detail, setDetail] = useState<PedagogicalContent | null>(null);

    /** Partagée entre le flux de cartes et la fiche ouverte, pour un plafond unique. */
    const basculer = (id: string) => setRetenues(previous =>
        previous.includes(id)
            ? previous.filter(item => item !== id)
            : previous.length < 5 ? [...previous, id] : previous,
    );
    return (
        <div className="min-h-screen fond-ciel pb-52">
            <header className="px-4 pt-6 pb-4 max-w-2xl mx-auto">
                <Link href="/stages" className="text-sm font-bold text-indigo-600">← Accueil</Link>
                <h1 className="text-xl font-black mt-4">{theme ? THEMATIC_LABELS[theme].label : 'Découvrir les sujets'}</h1>
                <p className="text-sm text-slate-500 mt-2">Parcourez les idées et gardez celles que vous avez envie de transmettre.</p>
            </header>
            <main className="max-w-2xl mx-auto px-4">
                <FluxDecouverte pool={pool} initialTheme={theme} initialGroup={group} retenues={retenues}
                    onToggleFiche={basculer}
                    onFicheInfo={setDetail} />
                <p className="text-xs text-slate-500 mt-4">Gardez jusqu’à 5 questions pour votre semaine.</p>
            </main>
            {retenues.length > 0 && (
                <div className="above-nav fixed left-0 right-0 px-4 py-4 z-40 bg-slate-50/95">
                    <Link href={`/stages/new?selection=${encodeURIComponent(retenues.join(','))}${theme ? `&theme=${encodeURIComponent(theme)}` : ''}${group ? `&group=${encodeURIComponent(group)}` : ''}`} className="flex items-center justify-between max-w-2xl mx-auto rounded-2xl bg-indigo-600 text-white p-4 font-bold text-sm">
                        <span>{retenues.length} question{retenues.length > 1 ? 's' : ''} retenue{retenues.length > 1 ? 's' : ''}</span>
                        <span>Organiser ma semaine →</span>
                    </Link>
                </div>
            )}
            <CardDetailModal
                isOpen={!!detail}
                content={detail}
                onClose={() => setDetail(null)}
                retenue={!!detail && retenues.includes(detail.id)}
                onGarder={detail ? () => basculer(detail.id) : undefined}
                plafondAtteint={retenues.length >= 5}
            />
        </div>
    );
}

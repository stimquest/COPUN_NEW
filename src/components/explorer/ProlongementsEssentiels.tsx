'use client';

import type { Dimension, PedagogicalContent } from '@/types';
import { PILLARS } from '@/data/etages';

export default function ProlongementsEssentiels({ cards, onSelect, selected, heading = true }: {
    cards: PedagogicalContent[];
    onSelect: (dimension: Dimension) => void;
    selected?: Dimension | null;
    heading?: boolean;
}) {
    return <section className="space-y-3" aria-label="Prolonger ce sujet">
        {heading && <h4 className="text-note font-semibold text-discret">Pour aller plus loin</h4>}
        <div className="grid grid-cols-3 gap-2">
            {PILLARS.map(pillar => {
                const count = cards.filter(card => card.dimension === pillar.id).length;
                const active = selected === pillar.id;
                return <button key={pillar.id} type="button" disabled={!count} aria-pressed={selected === undefined ? undefined : active} aria-label={`${pillar.label} : ${count} carte${count > 1 ? 's' : ''}`} onClick={() => onSelect(pillar.id)} className={`relative flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-bloc border border-filet px-1 py-3 text-note font-semibold transition-colors disabled:opacity-40 ${active ? `${pillar.bg} text-white` : 'bg-carte text-encre'}`}>
                    <span>{pillar.label}</span><span className="font-normal">{count} carte{count > 1 ? 's' : ''}</span>
                    {!active && <span aria-hidden className={`absolute bottom-1 h-0.5 w-6 rounded-full ${pillar.bg}`}/>}
                </button>;
            })}
        </div>
    </section>;
}

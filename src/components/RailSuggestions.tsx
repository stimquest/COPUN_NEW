'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { PedagogicalContent } from '@/types';
import { ENTREES_DECOUVERTE, cartesDuTheme } from '@/data/decouverte-accueil';

type Rail = typeof ENTREES_DECOUVERTE[number];

const TONES = {
    comprendre: 'bg-[var(--co-sand)]',
    observer: 'bg-[var(--co-sea)]',
    proteger: 'bg-[var(--co-leaf)]',
};

function RailRow({ rail, cards }: { rail: Rail; cards: PedagogicalContent[] }) {
    const slides = rail.themes.map(theme => ({
        ...theme, questions: cartesDuTheme(cards, rail.dimension, theme),
    })).filter(theme => theme.questions.length > 0);
    const destination = '/stages/decouvrir';
    const [index, setIndex] = useState(0);
    const trackRef = useRef<HTMLDivElement>(null);
    if (!slides.length) return null;
    const moveTo = (target: number) => {
        const safeTarget = (target + slides.length) % slides.length;
        const targetCard = trackRef.current?.children.item(safeTarget) as HTMLElement | null;
        targetCard?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
        setIndex(safeTarget);
    };
    const updatePosition = () => {
        const track = trackRef.current;
        if (!track) return;
        const children = Array.from(track.children) as HTMLElement[];
        const closest = children.reduce((best, child, childIndex) =>
            Math.abs(child.offsetLeft - track.scrollLeft) < Math.abs(children[best].offsetLeft - track.scrollLeft) ? childIndex : best,
        0);
        setIndex(closest);
    };
    return (
        <section className="space-y-3" aria-label={rail.title}>
            <div className="flex items-end justify-between gap-3 px-0.5">
                <div>
                    <h3 className="text-[17px] font-semibold tracking-[-.025em] text-[var(--co-ink)] leading-tight">{rail.title}</h3>
                </div>
                <Link href={`${destination}?pillar=${rail.id}`} className={`text-[11px] font-black shrink-0 text-slate-600`}>Voir tout</Link>
            </div>
            <div className="relative -mr-4">
                <div ref={trackRef} onScroll={updatePosition} className="relative flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory scroll-pl-1 pl-1 pr-4 pt-2 pb-7 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {slides.map(card => (
                        <Link
                            key={card.id}
                            href={`${destination}?pillar=${rail.id}&entry=${card.id}`}
                            className={`co-discovery-tile group relative isolate flex flex-col overflow-hidden snap-start shrink-0 w-[72%] sm:w-[42%] rounded-[26px] text-[var(--co-ink)] active:scale-[.985] transition-transform ${TONES[rail.id as keyof typeof TONES]}`}
                        >
                            <div className="co-discovery-art" aria-hidden="true"><span className="material-symbols-outlined">{card.icon}</span><span className="co-discovery-orbit"/></div>
                            <div className="px-5 pb-5"><h4 className="text-[21px] font-semibold tracking-[-.04em] leading-tight">{card.title}</h4><span className="mt-4 flex items-center justify-between text-xs">Explorer <span aria-hidden className="material-symbols-outlined text-lg">arrow_forward</span></span></div>
                        </Link>
                    ))}
                </div>
                {slides.length > 1 && (
                    <div className="flex items-center justify-between px-4 -mt-1">
                        <div className="flex items-center gap-1.5" aria-label={`Suggestions ${index + 1} sur ${slides.length}`}>
                            {slides.map((_, dot) => <span key={dot} className={`h-1 rounded-full transition-all ${dot === index ? 'w-4 bg-slate-500' : 'w-1 bg-slate-200'}`} />)}
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => moveTo(index - 1)} aria-label="Sujet précédent" className="size-11 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 active:scale-90 transition">
                                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                            </button>
                            <button onClick={() => moveTo(index + 1)} aria-label="Sujet suivant" className="size-11 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 active:scale-90 transition">
                                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

/** Trois intentions de terrain, chacune ouvre une découverte libre ciblée. */
export function RailSuggestions({ pool }: { pool: PedagogicalContent[]; suggested: string[] }) {
    return (
        <div className="space-y-8">
            <div className="px-0.5">
                <h2 className="co-section-title">Au gré des découvertes</h2>
            </div>
            {ENTREES_DECOUVERTE.map(rail => <RailRow key={rail.id} rail={rail} cards={pool} />)}
        </div>
    );
}

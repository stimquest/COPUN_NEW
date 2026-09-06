'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { PedagogicalContent } from '@/types';
import { THEMATIC_LABELS, ThematicTag } from '@/data/seasonal-context';
import { GROUPES } from '@/data/groupes';

type Rail = {
    title: string;
    subtitle: string;
    theme: ThematicTag;
    icon: string;
    tone: string;
    cardTone: string;
    select: (card: PedagogicalContent) => boolean;
};

const hasTheme = (card: PedagogicalContent, theme: string) => card.tags_theme?.includes(theme);

// Titres propres à l'angle de lecture, les noms des groupes restent les repères secondaires.
const ANGLES: Record<string, { comprendre: string; proteger: string; observer: string }> = {
    marees: { comprendre: 'Comprendre les marées', proteger: 'Préserver la vie de l’estran', observer: 'Repérer la mer qui monte' },
    courants: { comprendre: 'Pourquoi l’eau circule', proteger: 'Composer avec les courants', observer: 'Lire le sens du courant' },
    vagues: { comprendre: 'De la houle à la vague', proteger: 'Épargner les habitats du bord', observer: 'Regarder où les vagues cassent' },
    etat_mer: { comprendre: 'Pourquoi la mer change', proteger: 'Adapter sa sortie au milieu', observer: 'Lire la mer avant de partir' },
    vent: { comprendre: 'D’où vient le vent ?', proteger: 'Adapter sa pratique au vent', observer: 'Trouver les indices du vent' },
    meteo: { comprendre: 'Comment naissent les nuages', proteger: 'Tenir compte du temps', observer: 'Décrypter le ciel' },
    plage_dunes: { comprendre: 'Comment se construit une dune', proteger: 'Laisser les dunes respirer', observer: 'Lire les traces de l’érosion' },
    laisse_mer: { comprendre: 'Ce que la mer dépose', proteger: 'Nettoyer sans tout enlever', observer: 'Enquêter dans la laisse de mer' },
    vie_marine: { comprendre: 'Les liens de la vie marine', proteger: 'Prendre soin de la vie marine', observer: 'Rencontrer la vie dans l’eau' },
    oiseaux: { comprendre: 'Le voyage des oiseaux', proteger: 'Respecter les haltes des oiseaux', observer: 'Observer les oiseaux de passage' },
    cohabiter: { comprendre: 'Un littoral plein de vie', proteger: 'Approcher sans déranger', observer: 'Reconnaître le dérangement' },
    observer: { comprendre: 'Relier les indices du terrain', proteger: 'Observer avec respect', observer: 'Mobiliser ses sens' },
    activites: { comprendre: 'Un littoral partagé', proteger: 'Faire évoluer nos habitudes', observer: 'Repérer les usages du littoral' },
    protection: { comprendre: 'Pourquoi protéger un site', proteger: 'Agir pour le territoire', observer: 'Reconnaître les zones sensibles' },
};

function RailRow({ rail, cards, destination }: { rail: Rail; cards: PedagogicalContent[]; destination: string }) {
    const slides = GROUPES.map(group => ({
        ...group,
        questions: cards.filter(card => group.fiches.includes(Number(card.id))),
    })).filter(group => group.questions.length > 0);
    const angle = rail.icon === 'eco' ? 'proteger' : rail.icon === 'waves' ? 'comprendre' : rail.icon === 'visibility' ? 'observer' : null;
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
                    <h2 className="text-[17px] font-black tracking-tight text-slate-950 leading-tight">{rail.title}</h2>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{rail.subtitle}</p>
                </div>
                <Link href={`${destination}?theme=${rail.theme}`} className={`text-[11px] font-black shrink-0 ${rail.tone}`}>Voir tout</Link>
            </div>
            <div className="relative -mr-4">
                <div ref={trackRef} onScroll={updatePosition} className="relative flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory scroll-pl-1 pl-1 pr-4 pt-2 pb-7 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {slides.map(card => (
                        <Link
                            key={card.id}
                            href={`${destination}?group=${card.id}`}
                            className={`group relative isolate flex flex-col overflow-hidden snap-start shrink-0 w-[calc((100%_-_12px)_/_1.5)] rounded-[22px] text-white shadow-[0_6px_16px_-8px_rgba(15,23,42,.18)] active:scale-[.985] transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${rail.cardTone}`}
                        >
                            <div className="relative overflow-hidden px-4 pt-4 pb-3">
                                <span aria-hidden="true" className="absolute -right-4 -top-5 size-28 rounded-full border border-white/15" />
                                <span aria-hidden="true" className="absolute right-5 top-7 size-20 rounded-full border border-white/10" />
                                <div className="relative flex items-center gap-2 text-white/80">
                                    <span aria-hidden="true" className="material-symbols-outlined text-[18px]">{card.icon}</span>
                                    <span className="text-[10px] font-semibold">{card.label}</span>
                                </div>
                                <h3 className="relative mt-2 text-[17px] font-extrabold leading-tight tracking-tight">{angle ? ANGLES[card.id]?.[angle] ?? card.accroche : rail.icon === 'forum' ? card.questions[0].question : card.accroche}</h3>
                            </div>
                            <div className="flex flex-1 flex-col px-4 pb-4">
                                <div className="space-y-2 border-t border-white/20 pt-3">
                                    {card.questions.filter(question => question.question !== (angle ? ANGLES[card.id]?.[angle] ?? card.accroche : rail.icon === 'forum' ? card.questions[0].question : card.accroche)).slice(0, 2).map(question => (
                                        <p key={question.id} className="text-xs leading-snug text-white/90">
                                            {question.question}
                                        </p>
                                    ))}
                                </div>
                                <span className="mt-auto pt-3 flex items-center justify-between gap-2 text-[10px] font-bold text-white/85">
                                    Explorer le sujet
                                    <span aria-hidden="true" className="material-symbols-outlined text-[17px] transition-transform group-hover:translate-x-1">arrow_forward</span>
                                </span>
                            </div>
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

/** Accueil éditorial : cinq portes d'entrée, pas un catalogue de thèmes. */
export function RailSuggestions({ stageId, pool, suggested }: { stageId?: string; pool: PedagogicalContent[]; suggested: string[] }) {
    const destination = stageId ? `/stages/${stageId}/program` : '/stages/decouvrir';
    const currentTheme = suggested.find(tag => THEMATIC_LABELS[tag as ThematicTag]) as ThematicTag | undefined
        ?? 'biodiversite_saisonnalite';
    const cleanPool = pool.filter(card => card.source !== 'custom');
    const rails: Rail[] = [
        {
            title: 'Ce que le terrain montre en ce moment', subtitle: 'Des sujets qui font écho à la saison', theme: currentTheme,
            icon: 'wb_sunny', tone: 'text-orange-600', cardTone: 'bg-gradient-to-br from-orange-400 to-amber-600',
            select: card => hasTheme(card, currentTheme),
        },
        {
            title: 'Pour lancer une discussion', subtitle: 'Des questions qui donnent envie de réagir', theme: 'biodiversite_saisonnalite',
            icon: 'forum', tone: 'text-violet-600', cardTone: 'bg-gradient-to-br from-violet-500 to-indigo-700',
            select: card => hasTheme(card, 'biodiversite_saisonnalite'),
        },
        {
            title: 'À observer cette semaine', subtitle: 'Partir de ce qui est déjà visible dehors', theme: 'lecture_paysage',
            icon: 'visibility', tone: 'text-sky-600', cardTone: 'bg-gradient-to-br from-sky-500 to-blue-700',
            select: card => hasTheme(card, 'lecture_paysage'),
        },
        {
            title: 'Comprendre les phénomènes du littoral', subtitle: 'Marées, vent, nuages et mouvements de la mer', theme: 'interactions_climatiques',
            icon: 'waves', tone: 'text-amber-600', cardTone: 'bg-gradient-to-br from-amber-500 to-orange-700',
            select: card => hasTheme(card, 'interactions_climatiques') || hasTheme(card, 'caracteristiques_littoral'),
        },
        {
            title: 'Protéger ce qui est fragile', subtitle: 'Faire attention à ce qui vit autour de nous', theme: 'cohabitation_vivant',
            icon: 'eco', tone: 'text-emerald-600', cardTone: 'bg-gradient-to-br from-emerald-500 to-teal-700',
            select: card => hasTheme(card, 'cohabitation_vivant') || hasTheme(card, 'impact_presence_humaine'),
        },
    ];

    return (
        <div className="space-y-7">
            <div className="px-0.5">
                <p className="text-[10px] font-black uppercase tracking-[.2em] text-indigo-500">Explorer avant de préparer</p>
                <h1 className="text-[23px] font-black tracking-tight text-slate-950 mt-1">Qu&apos;as-tu envie de faire vivre au groupe&nbsp;?</h1>
            </div>
            {rails.map(rail => <RailRow key={rail.title} rail={rail} destination={destination} cards={cleanPool.filter(rail.select)} />)}
        </div>
    );
}

'use client';

import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import clsx from 'clsx';
import { PedagogicalContent, Dimension } from '@/types';
import { PILLARS, THEMES_BY_PILLAR } from '@/data/etages';
import { groupeDe, GROUPES } from '@/data/groupes';
import { NIVEAUX } from '@/data/niveaux';
import { HistoriqueMoniteur } from '@/lib/historique-moniteur';

/**
 * Le second chemin de l'écran : consommer le catalogue comme un flux, pas comme une
 * liste à filtrer. Une carte à la fois, swipée, montrant la matière réelle de la fiche
 * (accroche, forme, idée reçue) plutôt qu'une ligne à cocher. « Garder » est le seul
 * engagement : un tap, jamais un formulaire à la suite.
 *
 * Le drag utilise les primitives standard de framer-motion (`useMotionValue` +
 * `useTransform` pour suivre le doigt sans re-render, `dragConstraints`/`dragElastic` pour
 * la résistance, `dragSnapToOrigin` pour le retour natif sous le seuil) — jamais
 * `controls.start()` appelé en boucle dans `onDrag`, qui empile des animations à chaque
 * frame et produit un geste erratique. Le swipe n'avance que dans un seul sens ; revenir
 * en arrière et garder ne passent que par leurs boutons dédiés, jamais par un geste,
 * via une pile d'historique séparée de la pile visible.
 *
 * Priorité aux fiches jamais rencontrées (`historique.dejaVues`) : c'est ce qui traite le
 * « ça tourne en rond » — 65% du catalogue dort faute d'un endroit qui le fasse remonter.
 *
 * L'orientation par pilier/thème (COPUN) reste visible, mais ne bloque jamais le flux :
 * filtrer restreint juste la file de cartes déjà en cours, ce n'est jamais un écran qu'il
 * faut traverser pour voir du contenu.
 */

type Props = {
    pool: PedagogicalContent[];
    retenues: string[];
    onToggleFiche: (id: string) => void;
    onFicheInfo?: (fiche: PedagogicalContent) => void;
    historique?: HistoriqueMoniteur;
    initialTheme?: string;
    initialGroup?: string;
};

/** Devine la forme d'une accroche par un marqueur structurel net — jamais pour classer
 * automatiquement (vérifié : <35% des phrases en portent un), seulement comme repère
 * affiché à titre d'exemple sur la première accroche visible. */
function reperePari(texte: string): boolean {
    return /vous croyez|je peux vous dire|je parie/i.test(texte);
}
function reperePiege(texte: string): boolean {
    return /qui est d.accord|vous êtes d.accord/i.test(texte);
}
function repereConstat(texte: string): boolean {
    return /pourtant/i.test(texte);
}
function repereChoixForce(texte: string): boolean {
    return /\bou\b.*\?/i.test(texte) && /lequel|laquelle/i.test(texte);
}

const SWIPE_THRESHOLD = 80;
const HAUTEUR_TITRE_PILE = 60;
const HAUTEUR_CARTE_DECOUVERTE = 500;

// Les thèmes héritent du pilier choisi, mais sur une teinte plus douce : ils servent de
// repère de famille, sans prendre la couleur franche réservée au pilier lui-même.
const THEME_TONES: Record<Dimension, { active: string }> = {
    COMPRENDRE: {
        active: 'bg-amber-100 text-amber-900 ring-1 ring-amber-300 shadow-sm',
    },
    OBSERVER: {
        active: 'bg-blue-100 text-blue-900 ring-1 ring-blue-300 shadow-sm',
    },
    PROTÉGER: {
        active: 'bg-emerald-100 text-emerald-900 ring-1 ring-emerald-300 shadow-sm',
    },
};

export default function FluxDecouverte({ pool, retenues, onToggleFiche, onFicheInfo, historique, initialTheme, initialGroup }: Props) {
    const [group, setGroup] = useState(() => GROUPES.find(item => item.id === initialGroup));
    const dejaVues = useMemo(() => historique?.dejaVues ?? {}, [historique]);

    // Orientation COPUN toujours visible : le pilier ouvre ses trois thèmes, jamais
    // l'inverse — un thème n'a de sens qu'à l'intérieur d'un pilier. Le niveau reste
    // visible avant cette orientation : c'est le repère de public de la méthode, pas un
    // filtre technique noyé parmi les autres.
    const [pilier, setPilier] = useState<Dimension | null>(null);
    const [theme, setTheme] = useState<string | null>(initialTheme ?? null);
    const [niveau, setNiveau] = useState<1 | 2 | 3 | null>(null);

    const poolFiltre = useMemo(() => {
        return pool.filter(f => {
            if (group && !group.fiches.includes(Number(f.id))) return false;
            if (pilier && f.dimension !== pilier) return false;
            if (theme && !f.tags_theme?.includes(theme)) return false;
            if (niveau && f.niveau !== niveau) return false;
            return true;
        });
    }, [pool, pilier, theme, niveau, group]);

    // Jamais vues d'abord, puis le reste — mélangé une seule fois par changement de
    // filtre, pas à chaque rendu (sinon la pile change sous les doigts pendant le swipe).
    const ordreInitial = useMemo(() => {
        const jamais = poolFiltre.filter(f => !dejaVues[f.id]);
        const vues = poolFiltre.filter(f => dejaVues[f.id]);
        const brasser = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);
        return [...brasser(jamais), ...brasser(vues)];
    }, [poolFiltre, dejaVues]);

    const choisirPilier = (p: Dimension) => {
        setPilier(prev => (prev === p ? null : p));
        setTheme(null);
    };
    const choisirTheme = (t: string) => setTheme(prev => (prev === t ? null : t));
    const choisirNiveau = (n: 1 | 2 | 3) => setNiveau(prev => (prev === n ? null : n));
    const nbFiltres = (pilier ? 1 : 0) + (theme ? 1 : 0) + (niveau ? 1 : 0);

    return (
        <div className="space-y-3">
            {group && <button onClick={() => setGroup(undefined)} className="rounded-full bg-white px-4 py-2 text-sm font-bold text-indigo-700">{group.label} · Retirer le filtre ×</button>}
            {/* Visible d'emblée, mais volontairement compact : le niveau calibre le public
                sans prendre la place des cartes et de leur contenu. */}
            <div className="px-1">
                <div className="grid grid-cols-3 gap-1 rounded-xl bg-white/55 p-1">
                    {NIVEAUX.map(n => (
                        <button
                            key={n.n}
                            onClick={() => choisirNiveau(n.n)}
                            aria-pressed={niveau === n.n}
                            className={clsx(
                                'rounded-lg px-2 py-1.5 text-[10px] font-bold transition-all active:scale-[0.97]',
                                niveau === n.n ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-white/70',
                            )}
                        >
                            {n.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Les repères de la méthode restent constamment visibles : ils orientent le
                choix sans devenir un écran de filtres à traverser. Les thèmes n'apparaissent
                qu'après le choix d'un pilier, car ils n'ont de sens que dans ce contexte. */}
            <div className="space-y-1.5 px-1">
                <div className="grid grid-cols-3 gap-1">
                    {PILLARS.map(p => (
                        <button
                            key={p.id}
                            onClick={() => choisirPilier(p.id)}
                            aria-pressed={pilier === p.id}
                            className={clsx(
                                'flex items-center justify-center gap-1.5 rounded-xl px-1 py-2 text-[10px] font-bold transition-all active:scale-[0.97]',
                                pilier === p.id ? clsx(p.bg, 'text-white shadow-sm') : 'bg-white/90 text-slate-500 shadow-sm',
                            )}
                        >
                            <span className="material-symbols-outlined text-[15px]">{p.icon}</span>
                            {p.label}
                        </button>
                    ))}
                </div>

                {pilier && (
                    <div className="grid grid-cols-3 gap-1 pt-0.5">
                        {THEMES_BY_PILLAR[pilier].map(t => (
                            <button
                                key={t.id}
                                onClick={() => choisirTheme(t.id)}
                                aria-pressed={theme === t.id}
                                className={clsx(
                                    'min-w-0 flex min-h-10 items-center justify-center gap-1 rounded-xl px-1.5 py-1.5 text-[9px] font-bold leading-tight text-center transition-all active:scale-[0.97]',
                                    theme === t.id ? THEME_TONES[pilier].active : 'bg-white text-slate-400 shadow-sm',
                                )}
                            >
                                <span className="material-symbols-outlined shrink-0 text-[13px]">{t.icon}</span>
                                <span className="min-w-0 break-words">{t.label}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <DeckDecouverte
                key={ordreInitial.map(f => f.id).join('|')}
                ordreInitial={ordreInitial}
                nbFiltres={nbFiltres}
                retenues={retenues}
                onToggleFiche={onToggleFiche}
                onFicheInfo={onFicheInfo}
            />
        </div>
    );
}

function DeckDecouverte({
    ordreInitial, nbFiltres, retenues, onToggleFiche, onFicheInfo,
}: {
    ordreInitial: PedagogicalContent[]; nbFiltres: number; retenues: string[];
    onToggleFiche: (id: string) => void; onFicheInfo?: (fiche: PedagogicalContent) => void;
}) {
    const [pile, setPile] = useState(ordreInitial);
    const [historiquePile, setHistoriquePile] = useState<PedagogicalContent[]>([]);
    const carteDessus = pile[pile.length - 1] ?? null;
    const position = ordreInitial.length - pile.length + 1;

    const suivante = () => {
        if (!carteDessus) return;
        setHistoriquePile(h => [...h, carteDessus]);
        setPile(p => p.slice(0, -1));
    };
    const precedente = () => {
        if (!historiquePile.length) return;
        const carte = historiquePile[historiquePile.length - 1];
        setHistoriquePile(h => h.slice(0, -1));
        setPile(p => [...p, carte]);
    };

    if (!carteDessus) {
        return (
            <div className="text-center py-16">
                <span className="material-symbols-outlined text-4xl text-slate-300">
                    {nbFiltres > 0 ? 'search_off' : 'check_circle'}
                </span>
                <p className="mt-3 text-[13px] font-bold text-slate-500">
                    {nbFiltres > 0 ? 'Rien avec ces filtres.' : 'Tu as fait le tour du catalogue.'}
                </p>
                <button onClick={() => { setPile(ordreInitial); setHistoriquePile([]); }} className="mt-3 text-[12px] font-black text-indigo-600 underline underline-offset-2">
                    Recommencer
                </button>
            </div>
        );
    }

    return (
        <>
            <p className="text-center text-[11px] font-bold text-slate-400 tabular-nums">
                {position} / {ordreInitial.length}
            </p>
            <div className="relative" style={{ paddingTop: (Math.min(3, pile.length) - 1) * HAUTEUR_TITRE_PILE }}>
                <div className="relative" style={{ height: HAUTEUR_CARTE_DECOUVERTE }}>
                <AnimatePresence mode="popLayout">
                    {pile.slice(-3).map((f, i, arr) => (
                        <CarteFlux
                            key={f.id} fiche={f} estTop={i === arr.length - 1} rang={arr.length - 1 - i}
                            retenue={retenues.includes(f.id)} onSwipe={suivante} onPrecedente={precedente}
                            onGarder={() => onToggleFiche(f.id)} onInfo={() => onFicheInfo?.(f)}
                        />
                    ))}
                </AnimatePresence>
                </div>
            </div>
        </>
    );
}

function CarteFlux({
    fiche, estTop, rang, retenue, onSwipe, onPrecedente, onGarder, onInfo,
}: {
    fiche: PedagogicalContent;
    /** La carte du dessus : seule elle est draggable et tapable. */
    estTop: boolean;
    /** 0 = dessus, 1-2 = les suivantes empilées derrière. */
    rang: number;
    retenue: boolean;
    /** Swipe (un seul sens : avancer). Revenir en arrière et garder ne passent QUE par
     * leurs boutons dédiés, jamais par un geste. */
    onSwipe: () => void;
    onPrecedente: () => void; onGarder: () => void; onInfo: () => void;
}) {
    const pilier = PILLARS.find(p => p.id === fiche.dimension);
    const groupe = groupeDe(fiche.id);
    const accroche = (fiche.accroches_variantes ?? [fiche.accroche])[0] ?? fiche.question;

    const forme = reperePari(accroche) ? 'Le pari'
        : reperePiege(accroche) ? 'Le piège'
        : repereConstat(accroche) ? 'Le constat'
        : repereChoixForce(accroche) ? 'Le choix forcé'
        : null;

    // `x` suit le doigt en direct (aucun re-render React par frame) ; `rotate` en dérive.
    // C'est le pattern documenté par framer-motion pour un drag suivi visuellement — pas
    // `controls.start()` en boucle dans `onDrag`, qui lance une animation à chaque frame
    // et fait s'entrechoquer les transitions.
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-12, 12]);

    /**
     * Le tap n'ouvre la fiche que si la carte n'est pas en train d'être swipée. Une ref,
     * pas un state : elle ne change qu'au début et à la fin du drag (deux événements),
     * jamais à chaque frame de mouvement — donc aucun re-render superflu pendant le geste.
     */
    const enSwipe = useRef(false);

    /**
     * Le swipe n'avance que dans un seul sens (vers la gauche, comme « passer la carte »).
     * En dessous du seuil, `dragSnapToOrigin` ramène nativement la carte au centre — pas
     * besoin de le déclencher à la main.
     */
    const gerer = (_: unknown, info: PanInfo) => {
        enSwipe.current = false;
        if (info.offset.x < -SWIPE_THRESHOLD) onSwipe();
    };

    return (
        <motion.div
            // Seule la carte du dessus porte une ombre : appliquée aux trois, les ombres
            // bleutées et larges se cumulaient en un halo coloré autour de la pile.
            // Les cartes de derrière se distinguent par leur `scale`/`y`, pas par une ombre.
            className={clsx(
                'absolute inset-0 rounded-[1.75rem] bg-white overflow-hidden',
                estTop ? 'shadow-[var(--shadow-lift)]' : 'ring-1 ring-slate-900/5',
            )}
            style={{ zIndex: 10 - rang, x: estTop ? x : 0, rotate: estTop ? rotate : 0, transformOrigin: 'center top' }}
            inert={!estTop}
            drag={estTop ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0.6, right: 0.15 }}
            dragSnapToOrigin
            onDragStart={estTop ? () => { enSwipe.current = true; } : undefined}
            onDragEnd={estTop ? gerer : undefined}
            // Pleine opacité à tous les rangs : une carte de fond semi-transparente reste
            // visible à travers celle du dessus pendant qu'elle glisse, ce qui donnait
            // l'impression d'un flou sale plutôt que d'une vraie pile nette.
            initial={{ scale: 1 - rang * 0.05, y: -rang * HAUTEUR_TITRE_PILE }}
            animate={{ scale: 1 - rang * 0.05, y: -rang * HAUTEUR_TITRE_PILE }}
            exit={{ x: -400, opacity: 0, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
        >
            <motion.div
                className={clsx('flex shrink-0 items-center gap-2.5 overflow-hidden px-5', estTop ? pilier?.bg : 'bg-white')}
                initial={false}
                animate={{ height: HAUTEUR_TITRE_PILE, opacity: 1 }}
                transition={{ duration: 0.2 }}
            >
                {!estTop && <span aria-hidden className={clsx('h-5 w-0.5 shrink-0 rounded-full', pilier?.bg)} />}
                <h3 className={clsx('leading-[16px] line-clamp-3', estTop ? 'text-[13px] font-bold text-white' : 'text-[12px] font-semibold text-slate-500')}>{fiche.question}</h3>
            </motion.div>
            {/* Le tap n'ouvre la fiche que si la carte n'est pas en swipe (`enSwipe`) :
                `onDragStart` de framer-motion ne se déclenche qu'au-delà de son propre
                seuil de détection, donc dès qu'il se déclenche, c'est un vrai geste de
                swipe et le tap doit être ignoré. */}
            <div
                role="button"
                tabIndex={0}
                onClick={estTop ? () => { if (!enSwipe.current) onInfo(); } : undefined}
                onKeyDown={e => { if (estTop && (e.key === 'Enter' || e.key === ' ')) onInfo(); }}
                className="w-full flex flex-col text-left px-6 pt-6 pb-20 overflow-y-auto touch-pan-y cursor-pointer"
                style={{ height: HAUTEUR_CARTE_DECOUVERTE - HAUTEUR_TITRE_PILE }}
            >
                <div className="flex items-center gap-2 shrink-0">
                    <span className={clsx('size-2 rounded-full', pilier?.bg)} />
                    <span className={clsx('text-[10px] font-black uppercase tracking-widest', pilier?.color)}>
                        {pilier?.label}
                    </span>
                    {groupe && (
                        <span className="text-[10px] font-bold text-slate-300">· {groupe.label}</span>
                    )}
                </div>

                <div className="mt-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">J&apos;ouvre avec</p>
                    <p className="text-[17px] font-black text-slate-900 leading-snug mt-1.5">
                        «&nbsp;{accroche}&nbsp;»
                    </p>
                </div>

                {forme && (
                    <span className="inline-flex self-start items-center gap-1 mt-2 px-2.5 py-1 rounded-full bg-indigo-50 text-[10.5px] font-black text-indigo-600 uppercase tracking-wide">
                        {forme}
                    </span>
                )}

                {fiche.erreur_frequente && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Ils croient souvent que
                        </p>
                        <p className="text-[13px] text-slate-600 leading-snug mt-1">
                            {fiche.erreur_frequente}
                        </p>
                    </div>
                )}

                {fiche.a_observer && (
                    <div className="mt-3 rounded-xl bg-sky-50 px-3 py-2.5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-sky-600">À leur faire observer</p>
                        <p className="text-[12.5px] text-slate-600 leading-snug mt-1">{fiche.a_observer}</p>
                    </div>
                )}

                {fiche.actions?.[0] && (
                    <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2.5">
                        <p className="text-[12.5px] text-slate-600 leading-snug">
                            <span className="font-black">{fiche.actions[0].label} — </span>
                            {fiche.actions[0].consigne}
                        </p>
                    </div>
                )}

                {fiche.a_retenir && (
                    <div className="mt-3 rounded-xl bg-emerald-50 px-3 py-2.5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Ils repartent avec</p>
                        <p className="text-[12.5px] text-slate-600 leading-snug mt-1">{fiche.a_retenir}</p>
                    </div>
                )}
            </div>

            {/* Le swipe (vers la gauche uniquement) fait avancer. Revenir en arrière et
                garder ne sont accessibles QUE par ces boutons — jamais par un geste,
                pour qu'aucun des deux ne se déclenche par accident pendant un swipe. */}
            <div className="absolute bottom-0 inset-x-0 flex items-center gap-3 px-6 py-4 bg-white border-t border-slate-100">
                <button
                    onClick={onPrecedente}
                    className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 active:scale-90 transition shrink-0"
                    aria-label="Précédente"
                >
                    <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>

                <button
                    onClick={onGarder}
                    className={clsx(
                        'flex-1 h-11 rounded-full flex items-center justify-center gap-1.5 active:scale-[0.98] transition text-[12.5px] font-black',
                        retenue ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600',
                    )}
                >
                    <span className="material-symbols-outlined text-[19px]">{retenue ? 'check' : 'favorite'}</span>
                    {retenue ? 'Gardé' : 'Garder'}
                </button>

                <button
                    onClick={onSwipe}
                    className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 active:scale-90 transition shrink-0"
                    aria-label="Suivante"
                >
                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
            </div>
        </motion.div>
    );
}

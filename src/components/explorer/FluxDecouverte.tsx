'use client';

import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import clsx from 'clsx';
import { PedagogicalContent, Dimension } from '@/types';
import { PILLARS, THEMES_BY_PILLAR } from '@/data/etages';
import { groupeDe, GROUPES } from '@/data/groupes';
import { NIVEAUX } from '@/data/niveaux';
import { HistoriqueMoniteur } from '@/lib/historique-moniteur';
import LectureCarte from './LectureCarte';

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
    /** Le mode lecture laisse explorer sans demarrer ni composer une semaine. */
    mode?: 'lecture' | 'selection' | 'catalogue';
    retenues?: string[];
    onToggleFiche?: (id: string) => void;
    onFicheInfo?: (fiche: PedagogicalContent) => void;
    historique?: HistoriqueMoniteur;
    initialTheme?: string;
    initialGroup?: string;
    savedIds?: string[];
    onToggleSaved?: (id: string) => void;
    savingId?: string | null;
    savedUnavailable?: boolean;
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
// La carte reste volontairement plus haute que le viewport utile sur mobile : la page
// peut défiler naturellement, sans transformer son contenu pédagogique en sous-zone
// à scroller. La mécanique de pile, elle, ne change pas.
const HAUTEUR_CARTE_DECOUVERTE = 680;

/**
 * Graine du mélange : le jour courant à Paris, identique côté serveur et côté navigateur.
 *
 * Le fuseau est explicite parce que le serveur peut tourner en UTC (Vercel) et le
 * navigateur être à Paris : sans ça, les deux tomberaient sur des jours différents entre
 * minuit et 2 h du matin, et l'hydratation échouerait à nouveau — précisément le bug que
 * ce mélange déterministe corrige.
 */
function graineDuJour(): number {
    const [j, m, a] = new Intl.DateTimeFormat('fr-FR', {
        timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date()).split('/').map(Number);
    return a * 10000 + m * 100 + j;
}

/** Mélange Fisher-Yates piloté par une graine — même graine, même ordre, partout. */
function brasser<T>(arr: T[], graine: number): T[] {
    const out = [...arr];
    // `mulberry32` : reproductible et entièrement en arithmétique 32 bits (`|0`, `>>>`),
    // donc jamais de dépassement de la précision entière — un générateur congruentiel
    // classique multiplierait la graine par ~1e9 et sortirait des entiers sûrs.
    let etat = graine >>> 0;
    const suivant = () => {
        etat = (etat + 0x6D2B79F5) >>> 0;
        let t = etat;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(suivant() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

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

export default function FluxDecouverte({ pool, mode = 'selection', retenues = [], onToggleFiche, onFicheInfo, historique, initialTheme, initialGroup, savedIds = [], onToggleSaved, savingId, savedUnavailable }: Props) {
    const [group, setGroup] = useState(() => GROUPES.find(item => item.id === initialGroup));
    const [filtresOuverts, setFiltresOuverts] = useState(false);
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
    //
    // Mélange DÉTERMINISTE, graine = le jour courant : `Math.random()` donnait un ordre au
    // rendu serveur et un autre à l'hydratation, donc une erreur React (« server rendered
    // text didn't match the client ») et une pile qui se reconstruisait à l'arrivée. La
    // graine journalière garde l'ordre stable sur une session tout en le renouvelant d'un
    // jour à l'autre. Fisher-Yates plutôt qu'un `sort()` à comparateur aléatoire, qui
    // n'est pas un vrai mélange et biaise fortement la distribution.
    const ordreInitial = useMemo(() => {
        const jamais = poolFiltre.filter(f => !dejaVues[f.id]);
        const vues = poolFiltre.filter(f => dejaVues[f.id]);
        return [...brasser(jamais, graineDuJour()), ...brasser(vues, graineDuJour() + 1)];
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
            <div className="flex items-center justify-between gap-2 px-1">
                {group ? (
                    <button onClick={() => setGroup(undefined)} aria-label={`Retirer le filtre ${group.label}`} className="min-h-11 min-w-0 truncate px-2 text-sm font-medium text-slate-600">{group.label} <span className="ml-1 text-slate-400" aria-hidden>×</span></button>
                ) : <span />}
                {mode === 'lecture' && (
                    <button
                        onClick={() => setFiltresOuverts(value => !value)}
                        aria-expanded={filtresOuverts}
                        className={clsx('min-h-11 shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition', filtresOuverts ? 'bg-white/80 text-indigo-600' : 'text-slate-600 hover:bg-white/60')}
                    >
                        <span className="material-symbols-outlined text-[16px]">tune</span>
                        Filtres{nbFiltres ? ` · ${nbFiltres}` : ''}
                    </button>
                )}
            </div>
            {/* Visible d'emblée, mais volontairement compact : le niveau calibre le public
                sans prendre la place des cartes et de leur contenu. */}
            <div className={clsx('px-1', mode === 'lecture' && !filtresOuverts && 'hidden')}>
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
            <div className={clsx('space-y-1.5 px-1', mode === 'lecture' && !filtresOuverts && 'hidden')}>
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

            {mode === 'catalogue' ? (
                <CatalogueDecouverte
                    fiches={ordreInitial}
                    retenues={retenues}
                    onToggleFiche={onToggleFiche}
                    onFicheInfo={onFicheInfo}
                />
            ) : (
                <DeckDecouverte
                    key={ordreInitial.map(f => f.id).join('|')}
                    ordreInitial={ordreInitial}
                    nbFiltres={nbFiltres}
                    mode={mode}
                    savedIds={savedIds}
                    onToggleSaved={onToggleSaved}
                    savingId={savingId}
                    savedUnavailable={savedUnavailable}
                    retenues={retenues}
                    onToggleFiche={onToggleFiche}
                    onFicheInfo={onFicheInfo}
                />
            )}
        </div>
    );
}

/**
 * En preparation, l'intention est de comparer et choisir. Le meme contenu que la pile
 * devient donc un catalogue : plusieurs questions restent visibles et la selection est
 * explicite, plutot qu'un swipe qui cache sans cesse les alternatives.
 */
function CatalogueDecouverte({ fiches, retenues, onToggleFiche, onFicheInfo }: {
    fiches: PedagogicalContent[];
    retenues: string[];
    onToggleFiche?: (id: string) => void;
    onFicheInfo?: (fiche: PedagogicalContent) => void;
}) {
    if (!fiches.length) {
        return (
            <div className="py-16 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-300">search_off</span>
                <p className="mt-3 text-[13px] font-bold text-slate-500">Rien avec ces filtres.</p>
            </div>
        );
    }

    return (
        <section className="space-y-2.5 pt-1">
            <div className="flex items-baseline justify-between px-1">
                <p className="text-[13px] font-black text-slate-900">Choisir des questions</p>
                <p className="text-[11px] font-bold tabular-nums text-slate-400">{fiches.length} idées</p>
            </div>
            <div className="space-y-2">
                {fiches.map(fiche => {
                    const pilier = PILLARS.find(p => p.id === fiche.dimension);
                    const groupe = groupeDe(fiche.id);
                    const retenue = retenues.includes(fiche.id);
                    return (
                        <article key={fiche.id} className={clsx(
                            'rounded-2xl border bg-white px-4 py-3.5 transition-colors',
                            retenue ? 'border-emerald-300 bg-emerald-50/40' : 'border-slate-100 shadow-sm',
                        )}>
                            <button onClick={() => onFicheInfo?.(fiche)} className="block w-full text-left">
                                <div className="flex items-center gap-2">
                                    <span className={clsx('size-2 rounded-full', pilier?.bg)} />
                                    <span className={clsx('text-[9px] font-black uppercase tracking-widest', pilier?.color)}>{pilier?.label}</span>
                                    {groupe && <span className="min-w-0 truncate text-[10px] font-bold text-slate-400">· {groupe.label}</span>}
                                </div>
                                <h3 className="mt-2 text-[14px] font-black leading-snug text-slate-900">{fiche.question}</h3>
                                {fiche.accroche && <p className="mt-1 line-clamp-1 text-[11px] text-slate-500">« {fiche.accroche} »</p>}
                            </button>
                            <div className="mt-3 flex items-center justify-between gap-3">
                                <button onClick={() => onFicheInfo?.(fiche)} className="text-[11px] font-bold text-slate-400">Voir la fiche</button>
                                <button
                                    onClick={() => onToggleFiche?.(fiche.id)}
                                    className={clsx(
                                        'h-9 rounded-full px-3.5 text-[11px] font-black transition active:scale-[0.97]',
                                        retenue ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600',
                                    )}
                                >
                                    {retenue ? 'Retenue' : 'Choisir'}
                                </button>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}

function DeckDecouverte({
    ordreInitial, nbFiltres, mode, retenues, onToggleFiche, onFicheInfo, savedIds, onToggleSaved, savingId, savedUnavailable,
}: {
    ordreInitial: PedagogicalContent[]; nbFiltres: number; mode: 'lecture' | 'selection'; retenues: string[];
    onToggleFiche?: (id: string) => void; onFicheInfo?: (fiche: PedagogicalContent) => void;
    savedIds: string[]; onToggleSaved?: (id: string) => void; savingId?: string | null; savedUnavailable?: boolean;
}) {
    const [pile, setPile] = useState(ordreInitial);
    const [historiquePile, setHistoriquePile] = useState<PedagogicalContent[]>([]);
    const pileRef = useRef<HTMLDivElement>(null);
    const retrouverDebut = () => {
        // Attendre la sortie (0,2 s) pour que l'ancrage du navigateur ne ramène pas
        // le lecteur au bas de la pile pendant le remplacement de la carte.
        if (mode === 'lecture') window.setTimeout(() => {
            if ((pileRef.current?.getBoundingClientRect().top ?? 0) < 0) {
                pileRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' });
            }
        }, 240);
    };
    const carteDessus = pile[pile.length - 1] ?? null;
    const position = ordreInitial.length - pile.length + 1;

    const suivante = () => {
        if (!carteDessus) return;
        setHistoriquePile(h => [...h, carteDessus]);
        setPile(p => p.slice(0, -1));
        retrouverDebut();
    };
    const precedente = () => {
        if (!historiquePile.length) return;
        const carte = historiquePile[historiquePile.length - 1];
        setHistoriquePile(h => h.slice(0, -1));
        setPile(p => [...p, carte]);
        retrouverDebut();
    };

    if (!carteDessus) {
        return (
            <div className="text-center py-16">
                <span className="material-symbols-outlined text-4xl text-slate-300">
                    {nbFiltres > 0 ? 'search_off' : 'check_circle'}
                </span>
                <p className="mt-3 text-[13px] font-bold text-slate-500">
                    {ordreInitial.length === 0 ? 'Rien avec ces filtres.' : 'Vous avez parcouru ces cartes.'}
                </p>
                <button onClick={() => { setPile(ordreInitial); setHistoriquePile([]); }} className="mt-3 text-[12px] font-black text-indigo-600 underline underline-offset-2">
                    Recommencer
                </button>
                {historiquePile.length > 0 && <button onClick={precedente} className="block mx-auto mt-4 py-2 text-sm font-bold text-slate-600">Revenir à la dernière carte</button>}
            </div>
        );
    }

    return (
        <>
            <p className={clsx('text-[11px] font-bold text-slate-400 tabular-nums', mode === 'lecture' ? 'px-1 text-right' : 'text-center')}>
                {position} / {ordreInitial.length} {ordreInitial.length > 1 ? 'cartes' : 'carte'}
            </p>
            <div ref={pileRef} className="relative scroll-mt-4" style={{ paddingTop: (Math.min(3, pile.length) - 1) * HAUTEUR_TITRE_PILE }}>
                <div className="relative" style={mode === 'lecture' ? undefined : { height: HAUTEUR_CARTE_DECOUVERTE }}>
                <AnimatePresence mode="popLayout">
                    {pile.slice(-3).map((f, i, arr) => (
                        <CarteFlux
                            key={f.id} fiche={f} estTop={i === arr.length - 1} rang={arr.length - 1 - i}
                            mode={mode}
                            retenue={mode === 'lecture' ? savedIds.includes(f.id) : retenues.includes(f.id)} onSwipe={suivante} onPrecedente={precedente}
                            onGarder={() => mode === 'lecture' ? onToggleSaved?.(f.id) : onToggleFiche?.(f.id)} onInfo={() => onFicheInfo?.(f)}
                            saving={savingId === f.id} savedUnavailable={savedUnavailable || (!!savingId && savingId !== f.id)} canGoBack={historiquePile.length > 0}
                        />
                    ))}
                </AnimatePresence>
                </div>
            </div>
        </>
    );
}

function CarteFlux({
    fiche, estTop, rang, mode, retenue, onSwipe, onPrecedente, onGarder, onInfo, saving, savedUnavailable, canGoBack,
}: {
    fiche: PedagogicalContent;
    /** La carte du dessus : seule elle est draggable et tapable. */
    estTop: boolean;
    /** 0 = dessus, 1-2 = les suivantes empilées derrière. */
    rang: number;
    mode: 'lecture' | 'selection';
    retenue: boolean;
    saving?: boolean; savedUnavailable?: boolean; canGoBack: boolean;
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
                'rounded-[1.75rem] bg-white overflow-hidden',
                mode === 'lecture' && estTop ? 'relative min-h-[680px]' : 'absolute inset-0',
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
                className={clsx('flex shrink-0 items-center gap-2.5 overflow-hidden px-5', estTop ? pilier?.bg : 'bg-white', mode === 'lecture' && estTop && 'min-h-[60px] py-4')}
                initial={false}
                animate={{ height: mode === 'lecture' && estTop ? 'auto' : HAUTEUR_TITRE_PILE, opacity: 1 }}
                transition={{ duration: 0.2 }}
            >
                {!estTop && <span aria-hidden className={clsx('h-5 w-0.5 shrink-0 rounded-full', pilier?.bg)} />}
                <h3 className={clsx(mode === 'lecture' && estTop ? 'text-[17px] leading-snug font-bold text-white' : ['leading-[16px] line-clamp-3', estTop ? 'text-[13px] font-bold text-white' : 'text-[12px] font-semibold text-slate-500'])}>{fiche.question}</h3>
            </motion.div>
            {/* Le tap n'ouvre la fiche que si la carte n'est pas en swipe (`enSwipe`) :
                `onDragStart` de framer-motion ne se déclenche qu'au-delà de son propre
                seuil de détection, donc dès qu'il se déclenche, c'est un vrai geste de
                swipe et le tap doit être ignoré. */}
            <div
                role={mode === 'lecture' ? undefined : 'button'}
                tabIndex={mode === 'lecture' ? undefined : 0}
                onClick={mode !== 'lecture' && estTop ? () => { if (!enSwipe.current) onInfo(); } : undefined}
                onKeyDown={mode === 'lecture' ? undefined : e => { if (estTop && (e.key === 'Enter' || e.key === ' ')) onInfo(); }}
                className={clsx('w-full flex flex-col text-left px-5 sm:px-6 pt-5 touch-pan-y', mode === 'lecture' ? 'pb-6' : 'pb-20 overflow-y-auto cursor-pointer')}
                style={mode === 'lecture' ? undefined : { height: HAUTEUR_CARTE_DECOUVERTE - HAUTEUR_TITRE_PILE }}
            >
                <div className="flex items-center gap-2 shrink-0">
                    <span className={clsx('size-2 rounded-full', pilier?.bg)} />
                    <span className={clsx('text-[10px] font-black uppercase tracking-widest', pilier?.color)}>
                        {pilier?.label}
                    </span>
                    {groupe && (
                        <span className="text-[10px] font-bold text-slate-300">· {groupe.label}</span>
                    )}
                    {mode === 'lecture' && <button
                        onPointerDown={event => event.stopPropagation()}
                        onClick={onGarder} disabled={saving || savedUnavailable} aria-pressed={retenue}
                        aria-label={retenue ? 'Retirer cette carte des cartes mises de côté' : 'Mettre cette carte de côté'}
                        className="ml-auto flex size-11 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 disabled:opacity-50"
                    ><span className="material-symbols-outlined" aria-hidden>{saving ? 'hourglass_top' : retenue ? 'bookmark_added' : 'bookmark_add'}</span></button>}
                </div>

                {mode === 'lecture' ? <LectureCarte fiche={fiche} /> : <>
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
                </>}
            </div>

            {/* Le swipe (vers la gauche uniquement) fait avancer. Revenir en arrière et
                garder ne sont accessibles QUE par ces boutons — jamais par un geste,
                pour qu'aucun des deux ne se déclenche par accident pendant un swipe. */}
            <div onPointerDown={event => event.stopPropagation()} className={clsx('flex items-center gap-3 px-5 sm:px-6 py-4 bg-white border-t border-slate-100', mode !== 'lecture' && 'absolute bottom-0 inset-x-0')}>
                <button
                    onClick={onPrecedente}
                    disabled={!canGoBack}
                    className="size-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 active:scale-90 transition shrink-0 disabled:opacity-35"
                    aria-label="Précédente"
                >
                    <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>

                {mode === 'selection' ? (
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
                ) : (
                    <button
                        onClick={onGarder}
                        disabled={saving || savedUnavailable}
                        aria-pressed={retenue}
                        aria-label={retenue ? 'Retirer cette carte des cartes mises de côté' : 'Mettre cette carte de côté'}
                        className="flex-1 h-11 rounded-full flex items-center justify-center gap-1.5 bg-indigo-50 text-indigo-600 active:scale-[0.98] transition text-[12.5px] font-black"
                    >
                        <span className="material-symbols-outlined text-[18px]">{saving ? 'hourglass_top' : retenue ? 'bookmark_added' : 'bookmark_add'}</span>
                        {saving ? 'Enregistrement…' : retenue ? 'Mise de côté' : 'Mettre de côté'}
                    </button>
                )}

                <button
                    onClick={onSwipe}
                    className="size-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 active:scale-90 transition shrink-0"
                    aria-label="Suivante"
                >
                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
            </div>
        </motion.div>
    );
}

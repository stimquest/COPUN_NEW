'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { animate, motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import clsx from 'clsx';
import { PedagogicalContent, Dimension } from '@/types';
import { PILLARS, THEMES_BY_PILLAR } from '@/data/etages';
import { groupeDe, GROUPES, MILIEUX, groupesDuMilieu } from '@/data/groupes';
import { NIVEAUX } from '@/data/niveaux';
import { HistoriqueMoniteur } from '@/lib/historique-moniteur';
import LectureCarte from './LectureCarte';
import UseCardWithGroup from './UseCardWithGroup';
import { ENTREES_DECOUVERTE, cartesDuTheme } from '@/data/decouverte-accueil';
import { CardChoicesProvider, useCardChoices } from './CardChoicesContext';
import { resolveCardChoice, type CardChoice, type CardChoices } from '@/lib/card-choice';

/**
 * Le second chemin de l'écran : consommer le catalogue comme un flux, pas comme une
 * liste à filtrer. Une carte à la fois, swipée, montrant la matière réelle de la fiche
 * (accroche, forme, idée reçue) plutôt qu'une ligne à cocher. « Garder » est le seul
 * engagement : un tap, jamais un formulaire à la suite.
 *
 * Le drag utilise les primitives standard de framer-motion (`useMotionValue` +
 * `useTransform` pour suivre le doigt sans re-render, `dragConstraints`/`dragElastic` pour
 * la résistance, puis une animation de retour sous le seuil) — jamais
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
    initialPillar?: Dimension;
    initialEntry?: string;
    savedIds?: string[];
    onToggleSaved?: (id: string, choice?: CardChoice) => void;
    initialChoices?: CardChoices;
    choices?: CardChoices;
    savedChoices?: CardChoices;
    onSaveChoice?: (id: string, choice: CardChoice) => Promise<void>;
    allowUse?: boolean;
    onChoiceChange?: (id: string, choice: CardChoice) => void;
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
// Bandeau de titre qui dépasse de chaque carte de derrière : serré, pour montrer 5 cartes.
const HAUTEUR_TITRE_PILE = 44;
const CARTES_VISIBLES = 5;
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

export default function FluxDecouverte(props: Props) {
    return <CardChoicesProvider initialChoices={props.initialChoices} value={props.choices} savedChoices={props.savedChoices} saveChoice={props.onSaveChoice} onChange={props.onChoiceChange} allowUse={props.allowUse}><FluxContent {...props}/></CardChoicesProvider>;
}

function FluxContent({ pool, mode = 'selection', retenues = [], onToggleFiche, onFicheInfo, historique, initialTheme, initialGroup, initialPillar, initialEntry, savedIds = [], onToggleSaved, savingId, savedUnavailable }: Props) {
    const choicesContext = useCardChoices();
    const [entry, setEntry] = useState(() => ENTREES_DECOUVERTE.find(rail => rail.dimension === initialPillar)?.themes.find(theme => theme.id === initialEntry));
    const [group, setGroup] = useState(() => GROUPES.find(item => item.id === initialGroup));
    // Sujets cochés dans « Par sujet » (sélection multiple, identifiants de groupe).
    const [sujets, setSujets] = useState<string[]>([]);
    const dejaVues = useMemo(() => historique?.dejaVues ?? {}, [historique]);

    // Orientation COPUN toujours visible : le pilier ouvre ses trois thèmes, jamais
    // l'inverse — un thème n'a de sens qu'à l'intérieur d'un pilier. Le niveau reste
    // visible avant cette orientation : c'est le repère de public de la méthode, pas un
    // filtre technique noyé parmi les autres.
    const [pilier, setPilier] = useState<Dimension | null>(initialPillar ?? null);
    const [theme, setTheme] = useState<string | null>(initialTheme ?? null);
    const [niveau, setNiveau] = useState<1 | 2 | 3 | null>(null);

    const poolFiltre = useMemo(() => {
        const candidates = entry && pilier ? cartesDuTheme(pool, pilier, entry) : pool;
        return candidates.filter(f => {
            if (group && !group.fiches.includes(Number(f.id))) return false;
            if (sujets.length && !sujets.includes(groupeDe(f.id)?.id ?? '')) return false;
            if (pilier && f.dimension !== pilier) return false;
            if (theme && !f.tags_theme?.includes(theme)) return false;
            if (niveau && f.niveau !== niveau) return false;
            return true;
        });
    }, [pool, pilier, theme, niveau, group, sujets, entry]);

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
        setEntry(undefined);
        setPilier(prev => (prev === p ? null : p));
        setTheme(null);
    };
    const choisirTheme = (t: string) => setTheme(prev => (prev === t ? null : t));
    const choisirNiveau = (n: 1 | 2 | 3) => setNiveau(prev => (prev === n ? null : n));
    const nbFiltres = (pilier ? 1 : 0) + (theme ? 1 : 0) + (niveau ? 1 : 0) + (group || sujets.length ? 1 : 0);

    /* Filtre par sujet (marées, oiseaux, nuages…), rangé par milieu. Il ne propose que
       les sujets qui ont des cartes avec les autres filtres en cours. */
    const [sujetsOuverts, setSujetsOuverts] = useState(false);
    const sujetsDisponibles = useMemo(() => {
        const ids = new Set(pool.filter(f =>
            (!pilier || f.dimension === pilier) && (!theme || f.tags_theme?.includes(theme)) && (!niveau || f.niveau === niveau),
        ).map(f => Number(f.id)));
        return MILIEUX.map(milieu => ({
            ...milieu,
            groupes: groupesDuMilieu(milieu.id).filter(g => g.fiches.some(id => ids.has(Number(id)))),
        })).filter(milieu => milieu.groupes.length);
    }, [pool, pilier, theme, niveau]);
    /* Sélection multiple des sujets ; les milieux ne sont que des intertitres. Le
       panneau reste ouvert pendant qu'on coche. */
    const basculerSujet = (id: string) => setSujets(current => current.includes(id) ? current.filter(s => s !== id) : [...current, id]);
    const outilSujets = mode === 'lecture' ? <div className="flex items-center gap-1.5">
        <button onClick={() => setSujetsOuverts(value => !value)} aria-expanded={sujetsOuverts}
            className={clsx('inline-flex min-h-9 items-center rounded-full border px-3.5 text-[12px] font-semibold transition',
                sujetsOuverts || sujets.length ? 'border-[#173d3a] bg-[#173d3a] text-[#fffdf8]' : 'border-[#193d3b1f] bg-[#fffdf8] text-[#173d3a]')}>
            {sujets.length ? `${sujets.length} sujet${sujets.length > 1 ? 's' : ''}` : 'Par sujet'}
        </button>
        {sujets.length > 0 && <button onClick={() => setSujets([])} className="min-h-9 px-2 text-[12px] font-semibold text-[#56706a] underline underline-offset-2">Effacer</button>}
    </div> : null;
    const nomsSujets = sujets.map(id => GROUPES.find(g => g.id === id)?.label).filter(Boolean).join(', ');
    const panneauSujets = mode === 'lecture' && !sujetsOuverts && sujets.length ? <p className="-mt-1 truncate px-1 text-[12px] text-[#56706a]">{nomsSujets}</p> : mode === 'lecture' && sujetsOuverts ? <div className="space-y-3 rounded-2xl bg-[#fffdf8] p-4 ring-1 ring-[#193d3b14]">
        {sujetsDisponibles.map(milieu => {
            return <div key={milieu.id}>
                <p className="text-[12px] font-extrabold text-[#56706a]">{milieu.label}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {milieu.groupes.map(g => <button key={g.id} onClick={() => basculerSujet(g.id)} aria-pressed={sujets.includes(g.id)}
                        className={clsx('min-h-9 rounded-full px-3 text-[12px] font-semibold ring-1 transition active:scale-[0.97]',
                            sujets.includes(g.id) ? 'bg-[#f2dfa6] text-[#173d3a] ring-[#e0c77f]' : 'bg-white text-[#173d3a] ring-[#193d3b1a]')}>
                        {g.label}
                    </button>)}
                </div>
            </div>;
        })}
        <button onClick={() => setSujetsOuverts(false)} className="w-full min-h-10 rounded-full bg-[#173d3a] text-[13px] font-bold text-[#fffdf8]">
            Voir les cartes
        </button>
    </div> : null;

    return (
        <div className="space-y-3">
            {entry && <div className="flex items-center justify-between gap-3 rounded-xl bg-white/70 px-4 py-3">
                <p className="text-sm font-semibold text-slate-700">{entry.title}</p>
                <button onClick={() => setEntry(undefined)} aria-label="Retirer le thème de découverte" className="size-11 shrink-0 rounded-full text-slate-500">✕</button>
            </div>}
            <div className={clsx('flex items-center justify-between gap-2 px-1', mode === 'lecture' && 'hidden')}>
                {group ? (
                    <button onClick={() => setGroup(undefined)} aria-label={`Retirer le filtre ${group.label}`} className="min-h-11 min-w-0 truncate px-2 text-sm font-medium text-slate-600">{group.label} <span className="ml-1 text-slate-400" aria-hidden>×</span></button>
                ) : null}
            </div>
            {/* Les repères COP d'abord, toujours visibles : c'est l'outil qui guide la
                lecture, pas un réglage à ouvrir. Une seule rangée légère, jamais un
                formulaire avant les cartes. Couleurs COP inchangées. */}
            {/* Un seul contrôle segmenté pour les trois repères : un bloc papier, chaque
                repère marqué par sa couleur COP (trait en bas au repos, fond plein une fois
                choisi). */}
            <div className="space-y-2 px-1">
                {/* Le niveau en premier : on calibre le public, puis on choisit un repère. */}
                <div className="grid grid-cols-3 gap-1 rounded-xl bg-white/55 p-1">
                    {NIVEAUX.map(n => (
                        <button
                            key={n.n}
                            onClick={() => choisirNiveau(n.n)}
                            aria-pressed={niveau === n.n}
                            className={clsx(
                                'relative min-h-9 rounded-lg px-2 text-[11px] transition-all active:scale-[0.97]',
                                niveau === n.n ? 'bg-[#f2dfa6] font-bold text-[#173d3a] shadow-sm' : 'font-semibold text-[#56706a] hover:bg-white/70',
                            )}
                        >
                            {n.label}
                        </button>
                    ))}
                </div>
                {/* Effet « métaballes » : un calque de fond flouté puis recontrasté (filtre
                    SVG goo) fait fusionner le repère choisi, le bassin de ses thèmes et le
                    thème choisi comme des gouttes. Le calque de fond et le calque de texte
                    ont exactement la même structure (même cellule de grille), donc les
                    mêmes hauteurs ; seul le texte, au-dessus, reste net et cliquable. */}
                <svg aria-hidden width="0" height="0" className="absolute">
                    <filter id="co-goo">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="flou"/>
                        <feColorMatrix in="flou" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -7" result="goo"/>
                        <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
                    </filter>
                </svg>
                <div className="grid rounded-2xl bg-[#fffdf8] ring-1 ring-[#193d3b14]">
                    {[true, false].map(fond => (
                        <div key={fond ? 'fond' : 'texte'} aria-hidden={fond || undefined} className={clsx('relative [grid-area:1/1] p-1', fond ? 'pointer-events-none z-0' : 'z-10')}
                            style={fond ? { filter: 'url(#co-goo)' } : undefined}>
                            <div className="grid grid-cols-3 gap-1">
                                {PILLARS.map(p => fond
                                    ? <div key={p.id} className={clsx('min-h-11 rounded-xl transition-colors duration-200', pilier === p.id && p.bg)}/>
                                    : <button
                                        key={p.id}
                                        onClick={() => choisirPilier(p.id)}
                                        aria-pressed={pilier === p.id}
                                        className={clsx(
                                            'relative flex min-h-11 flex-col items-center justify-center rounded-xl text-[13px] font-bold tracking-[-.01em] transition-all active:scale-[0.97]',
                                            pilier === p.id ? 'text-white' : 'text-[#173d3a] hover:bg-[#f4f1e8]',
                                        )}
                                    >
                                        {p.label}
                                        {pilier !== p.id && <span aria-hidden className={clsx('absolute bottom-1.5 h-[3px] w-6 rounded-full', p.bg)}/>}
                                    </button>)}
                            </div>

                            {pilier && (
                                <div className={clsx('mt-1.5 grid grid-cols-3 gap-1 rounded-xl p-1', fond && PILLARS.find(p => p.id === pilier)?.bg)}>
                                    {THEMES_BY_PILLAR[pilier].map(t => fond
                                        ? <div key={t.id} className="min-h-9 rounded-xl px-1.5 py-1 text-center text-[12px] font-semibold leading-tight text-transparent break-words">{t.label}</div>
                                        : <button
                                            key={t.id}
                                            onClick={() => choisirTheme(t.id)}
                                            aria-pressed={theme === t.id}
                                            className={clsx(
                                                'min-w-0 min-h-9 rounded-xl px-1.5 py-1 text-center text-[12px] font-semibold leading-tight break-words transition-all active:scale-[0.97]',
                                                theme === t.id ? clsx('bg-white shadow-sm', PILLARS.find(p => p.id === pilier)?.color) : 'bg-white/15 text-white hover:bg-white/25',
                                            )}
                                        >
                                            {t.label}
                                        </button>)}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

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
                    outil={outilSujets} panneau={panneauSujets}
                    mode={mode}
                    savedIds={savedIds}
                    onToggleSaved={id => {
                        const card = pool.find(item => item.id === id);
                        onToggleSaved?.(id, card ? resolveCardChoice(card, choicesContext?.choices[id]) : undefined);
                    }}
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
            {/* Pas de titre ici : le mode « catalogue » n'a qu'un seul appelant
                (ExplorerClient), qui affiche déjà « Choisir les sujets » juste au-dessus —
                le répéter ne faisait qu'empiler un troisième niveau de titre avant la
                première carte. Seul le compte reste, utile en lui-même. */}
            <div className="flex items-baseline justify-end px-1">
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
                                    <span className={clsx('text-[12px] font-bold', pilier?.color)}>{pilier?.label}</span>
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

/**
 * La tranche du bac : chaque carte est un trait à sa couleur COP, comme la tranche des
 * disques vue de dessus. On voit la masse disponible, la répartition COP, et où l'on en
 * est (cartes passées estompées, carte actuelle plus haute). Glisser le doigt dessus
 * feuillette le bac ; le swipe de la pile, lui, ne change pas.
 *
 * `ordre` suit la convention de la pile : la carte en position k est ordre[n - k].
 */
function TrancheDuBac({ ordre, position, onAller }: { ordre: PedagogicalContent[]; position: number; onAller: (k: number) => void }) {
    const rail = useRef<HTMLDivElement>(null);
    const n = ordre.length;
    const viser = (clientX: number) => {
        // La réglette est centrée : on vise sur l'étendue réelle des traits, pas du conteneur.
        const premier = rail.current?.firstElementChild?.getBoundingClientRect();
        const dernier = rail.current?.lastElementChild?.getBoundingClientRect();
        if (!premier || !dernier) return;
        const largeur = Math.max(1, dernier.right - premier.left);
        const k = Math.min(n, Math.max(1, Math.floor((clientX - premier.left) / largeur * n) + 1));
        if (k !== position) onAller(k);
    };
    return <div ref={rail} role="slider" aria-label="Position dans les cartes" aria-valuemin={1} aria-valuemax={n} aria-valuenow={position} tabIndex={0}
        className="flex h-7 cursor-pointer touch-none select-none items-end justify-center gap-[2px] px-1"
        onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); viser(event.clientX); }}
        onPointerMove={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) viser(event.clientX); }}
        onKeyDown={event => {
            if (event.key === 'ArrowRight' && position < n) onAller(position + 1);
            if (event.key === 'ArrowLeft' && position > 1) onAller(position - 1);
        }}>
        {Array.from({ length: n }, (_, index) => {
            const k = index + 1;
            const fiche = ordre[n - k];
            const pilier = PILLARS.find(p => p.id === fiche.dimension);
            return <span key={fiche.id} aria-hidden className={clsx('min-w-px max-w-[3px] flex-1 rounded-full transition-all duration-150', pilier?.bg,
                k === position ? 'h-7 min-w-[3px]' : k < position ? 'h-2.5 opacity-25' : 'h-4 opacity-60')}/>;
        })}
    </div>;
}

function DeckDecouverte({
    ordreInitial, nbFiltres, mode, retenues, onToggleFiche, onFicheInfo, savedIds, onToggleSaved, savingId, savedUnavailable, outil, panneau,
}: {
    outil?: React.ReactNode; panneau?: React.ReactNode;
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
                <button onClick={() => { setPile(ordreInitial); setHistoriquePile([]); }} className="mt-3 text-[12px] font-black text-[#173d3a] underline underline-offset-2">
                    Recommencer
                </button>
                {historiquePile.length > 0 && <button onClick={precedente} className="block mx-auto mt-4 py-2 text-sm font-bold text-slate-600">Revenir à la dernière carte</button>}
            </div>
        );
    }

    return (
        <>
            {/* Où on en est dans la pile ; le total suit les filtres. */}
            <div className={clsx('flex items-center gap-3', mode === 'lecture' ? 'justify-between px-1' : 'justify-center')}>
                {outil ?? <span/>}
                <p className={clsx('text-[11px] font-semibold tabular-nums', mode === 'lecture' ? 'text-[#6f817d]' : 'text-slate-400')}>
                    {position} / {ordreInitial.length} {ordreInitial.length > 1 ? 'cartes' : 'carte'}
                </p>
            </div>
            {panneau}
            {mode === 'lecture' && ordreInitial.length > 1 && <TrancheDuBac ordre={ordreInitial} position={position} onAller={k => {
                const n = ordreInitial.length;
                setPile(ordreInitial.slice(0, n - k + 1));
                setHistoriquePile(ordreInitial.slice(n - k + 1).reverse());
            }}/>}
            <div ref={pileRef} className="relative scroll-mt-4" style={{ paddingTop: (Math.min(CARTES_VISIBLES, pile.length) - 1) * HAUTEUR_TITRE_PILE }}>
                <div className="relative" style={mode === 'lecture' ? undefined : { height: HAUTEUR_CARTE_DECOUVERTE }}>
                    {pile.slice(-CARTES_VISIBLES).map((f, i, arr) => (
                        <CarteFlux
                            key={f.id} fiche={f} estTop={i === arr.length - 1} rang={arr.length - 1 - i}
                            mode={mode}
                            retenue={mode === 'lecture' ? savedIds.includes(f.id) : retenues.includes(f.id)} onSwipe={suivante} onPrecedente={precedente}
                            onGarder={() => mode === 'lecture' ? onToggleSaved?.(f.id) : onToggleFiche?.(f.id)} onInfo={() => onFicheInfo?.(f)}
                            saving={savingId === f.id} savedUnavailable={savedUnavailable || (!!savingId && savingId !== f.id)} canGoBack={historiquePile.length > 0}
                        />
                    ))}
                </div>
                {/* Un tap sur le titre d'une carte de derrière fait avancer le deck jusqu'à
                    elle : les cartes devant sont passées, comme par autant de swipes (la
                    réglette et le compteur suivent). Des zones
                    transparentes posées sur les bandeaux, hors des cartes : la mécanique de
                    la pile (cartes de derrière inertes, swipe du dessus) ne change pas. */}
                {pile.slice(-CARTES_VISIBLES, -1).map((f, i, arr) => {
                    const rang = arr.length - i;
                    const visibles = Math.min(CARTES_VISIBLES, pile.length);
                    return <button key={f.id} type="button" aria-label={`Afficher : ${f.question}`}
                        className="absolute inset-x-0 z-20"
                        style={{ top: (visibles - 1 - rang) * HAUTEUR_TITRE_PILE, height: HAUTEUR_TITRE_PILE }}
                        onClick={() => {
                            const passees = pile.slice(-rang).reverse();
                            setHistoriquePile(h => [...h, ...passees]);
                            setPile(p => p.slice(0, -rang));
                            retrouverDebut();
                        }}/>;
                })}
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
    const choixCarte = useCardChoices();
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
    const animation = useRef<ReturnType<typeof animate> | null>(null);
    const sortieEnCours = useRef(false);
    const [sortie, setSortie] = useState(false);
    const element = useRef<HTMLDivElement>(null);
    useEffect(() => () => { animation.current?.stop(); }, []);

    const passer = async () => {
        if (!estTop || sortieEnCours.current) return;
        sortieEnCours.current = true;
        setSortie(true);
        // La pile reste immobile jusqu'à la sortie complète de la carte opaque.
        const distance = window.innerWidth + (element.current?.offsetHeight ?? 680);
        const mouvement = animate(x, -distance, { duration: 0.3, ease: [0.32, 0, 0.67, 0] });
        animation.current = mouvement;
        await mouvement;
        if (element.current) onSwipe();
    };

    /**
     * Le tap n'ouvre la fiche que si la carte n'est pas en train d'être swipée. Une ref,
     * pas un state : elle ne change qu'au début et à la fin du drag (deux événements),
     * jamais à chaque frame de mouvement — donc aucun re-render superflu pendant le geste.
     */
    const enSwipe = useRef(false);

    /**
     * Le swipe n'avance que dans un seul sens (vers la gauche, comme « passer la carte »).
     * Sous le seuil, la carte revient au centre. Au-delà, sa sortie se termine avant
     * de promouvoir la suivante, sans retour automatique concurrent.
     */
    const gerer = (_: unknown, info: PanInfo) => {
        enSwipe.current = false;
        if (info.offset.x < -SWIPE_THRESHOLD) void passer();
        else animation.current = animate(x, 0, { type: 'spring', damping: 30, stiffness: 320 });
    };

    return (
        <motion.div
            ref={element}
            // Seule la carte du dessus porte une ombre : appliquée aux trois, les ombres
            // bleutées et larges se cumulaient en un halo coloré autour de la pile.
            // Les cartes de derrière se distinguent par leur `scale`/`y`, pas par une ombre.
            className={clsx(
                'rounded-[1.75rem] overflow-hidden',
                mode === 'lecture' && estTop ? 'relative min-h-[680px]' : 'absolute inset-0',
                mode === 'lecture' ? 'bg-white ring-1 ring-[#193d3b24]' : 'bg-white',
                estTop ? 'shadow-[0_22px_50px_rgba(25,61,59,.20)]' : mode === 'lecture' ? 'shadow-[0_-6px_18px_rgba(25,61,59,.10)]' : 'ring-1 ring-slate-900/5',
            )}
            style={{ zIndex: 10 - rang, x: estTop ? x : 0, rotate: estTop ? rotate : 0, transformOrigin: 'center top' }}
            inert={!estTop || sortie}
            drag={estTop && !sortie ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0.6, right: 0.15 }}
            dragMomentum={false}
            onDragStart={estTop ? () => { enSwipe.current = true; } : undefined}
            onDragEnd={estTop ? gerer : undefined}
            // Pleine opacité à tous les rangs : une carte de fond semi-transparente reste
            // visible à travers celle du dessus pendant qu'elle glisse, ce qui donnait
            // l'impression d'un flou sale plutôt que d'une vraie pile nette.
            initial={{ scale: 1 - rang * 0.05, y: -rang * HAUTEUR_TITRE_PILE }}
            animate={{ scale: 1 - rang * 0.05, y: -rang * HAUTEUR_TITRE_PILE }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
        >
            <motion.div
                className={clsx('flex shrink-0 gap-2.5 overflow-hidden px-5', mode === 'lecture' && estTop ? 'min-h-[76px] flex-col pt-5 pb-1' : ['items-center', estTop ? pilier?.bg : 'bg-white'])}
                initial={false}
                animate={{ height: mode === 'lecture' && estTop ? 'auto' : HAUTEUR_TITRE_PILE, opacity: 1 }}
                transition={{ duration: 0.2 }}
            >
                {!estTop && <span aria-hidden className={clsx('h-5 w-1 shrink-0 rounded-full', pilier?.bg)} />}
                {/* En lecture, le repère COP devient le surtitre de la carte, avec le signet
                    discret sur la même ligne : une seule rangée avant le titre. */}
                {mode === 'lecture' && estTop && <div className="flex min-h-9 items-center gap-2">
                    <span className={clsx('size-2 rounded-full', pilier?.bg)} />
                    <span className={clsx('text-[12px] font-bold', pilier?.color)}>{pilier?.label}</span>
                    {groupe && <span className="text-[11px] font-semibold text-[#6f817d]">· {groupe.label}</span>}
                    <button
                        onPointerDown={event => event.stopPropagation()}
                        onClick={onGarder} disabled={saving || savedUnavailable} aria-pressed={retenue}
                        aria-label={retenue ? 'Retirer cette carte des cartes mises de côté' : 'Mettre cette carte de côté'}
                        className="-mr-2 ml-auto flex size-10 shrink-0 items-center justify-center rounded-full text-[#56706a] hover:bg-[#edf1ea] aria-pressed:text-[#173d3a] disabled:opacity-50"
                    ><span className="material-symbols-outlined text-[22px]" aria-hidden>{saving ? 'hourglass_top' : retenue ? 'bookmark_added' : 'bookmark_add'}</span></button>
                </div>}
                <h3 className={clsx(mode === 'lecture' && estTop ? 'text-[21px] leading-[1.25] font-bold tracking-[-.02em] text-[#173d3a]' : ['leading-[16px] line-clamp-3', estTop ? 'text-[13px] font-bold text-white' : mode === 'lecture' ? 'line-clamp-2 font-semibold text-[#173d3a]' : 'text-[12px] font-semibold text-slate-500'])}
                    // Même taille pour tous les titres de derrière : la profondeur se lit déjà
                    // par l'échelle des cartes.
                    style={mode === 'lecture' && !estTop ? { fontSize: 12, lineHeight: 1.2 } : undefined}>{fiche.question}</h3>
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
                className={clsx('w-full flex flex-col text-left px-5 sm:px-6 touch-pan-y', mode === 'lecture' ? 'pt-0 pb-6' : 'pt-5 pb-20 overflow-y-auto cursor-pointer')}
                style={mode === 'lecture' ? undefined : { height: HAUTEUR_CARTE_DECOUVERTE - HAUTEUR_TITRE_PILE }}
            >
                <div className={clsx('flex items-center gap-2 shrink-0', mode === 'lecture' && 'hidden')}>
                    <span className={clsx('size-2 rounded-full', pilier?.bg)} />
                    <span className={clsx('text-[12px] font-bold', pilier?.color)}>
                        {pilier?.label}
                    </span>
                    {groupe && (
                        <span className="text-[11px] font-semibold text-[#6f817d]">· {groupe.label}</span>
                    )}
                    {mode === 'lecture' && <button
                        onPointerDown={event => event.stopPropagation()}
                        onClick={onGarder} disabled={saving || savedUnavailable} aria-pressed={retenue}
                        aria-label={retenue ? 'Retirer cette carte des cartes mises de côté' : 'Mettre cette carte de côté'}
                        className="ml-auto flex size-11 shrink-0 items-center justify-center rounded-full border border-[#193d3b24] bg-[#edf1ea] text-[#173d3a] disabled:opacity-50"
                    ><span className="material-symbols-outlined" aria-hidden>{saving ? 'hourglass_top' : retenue ? 'bookmark_added' : 'bookmark_add'}</span></button>}
                </div>

                {mode === 'lecture' ? <LectureCarte fiche={fiche} allowUse={false} /> : <>
                <div className="mt-3">
                    <p className="text-[12px] font-bold text-slate-400">J&apos;ouvre avec</p>
                    <p className="text-[17px] font-black text-slate-900 leading-snug mt-1.5">
                        «&nbsp;{accroche}&nbsp;»
                    </p>
                </div>

                {forme && (
                    <span className="inline-flex self-start items-center gap-1 mt-2 px-2.5 py-1 rounded-full bg-[#edf1ea] text-[12px] font-bold text-[#173d3a]">
                        {forme}
                    </span>
                )}

                {fiche.erreur_frequente && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                        <p className="text-[12px] font-bold text-slate-400">
                            Ils croient souvent que
                        </p>
                        <p className="text-[13px] text-slate-600 leading-snug mt-1">
                            {fiche.erreur_frequente}
                        </p>
                    </div>
                )}

                {fiche.a_observer && (
                    <div className="mt-3 rounded-xl bg-sky-50 px-3 py-2.5">
                        <p className="text-[12px] font-bold text-sky-600">À leur faire observer</p>
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
                        <p className="text-[12px] font-bold text-emerald-600">Ils repartent avec</p>
                        <p className="text-[12.5px] text-slate-600 leading-snug mt-1">{fiche.a_retenir}</p>
                    </div>
                )}
                </>}
            </div>

            {/* Le swipe (vers la gauche uniquement) fait avancer. Revenir en arrière et
                garder ne sont accessibles QUE par ces boutons — jamais par un geste,
                pour qu'aucun des deux ne se déclenche par accident pendant un swipe. */}
            <div onPointerDown={event => event.stopPropagation()} className={clsx('flex items-center gap-3 px-5 sm:px-6 py-4 bg-[#fffdf8] border-t border-[#193d3b14]', mode !== 'lecture' && 'absolute bottom-0 inset-x-0')}>
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
                    /* L'action finale de la carte, en bas : l'emmener dans une semaine. Mettre
                       de côté reste accessible par le signet, en haut de la carte. */
                    choixCarte?.allowUse === false ? <span className="flex-1"/> : <UseCardWithGroup card={fiche} choice={resolveCardChoice(fiche, choixCarte?.choices[fiche.id])} variant="bar"/>
                )}

                <button
                    onClick={() => { void passer(); }}
                    className="size-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 active:scale-90 transition shrink-0"
                    aria-label="Suivante"
                >
                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
            </div>
        </motion.div>
    );
}

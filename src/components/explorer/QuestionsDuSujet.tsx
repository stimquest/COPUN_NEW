'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { PILLARS, THEMES_BY_PILLAR } from '@/data/etages';
import { GROUPES, groupeDe, Groupe } from '@/data/groupes';
import { NIVEAUX, niveauRepere } from '@/data/niveaux';
import { PedagogicalContent, Dimension } from '@/types';

type Props = {
    pool: PedagogicalContent[];
    retenues: string[];
    onToggleFiche: (id: string) => void;
    onFicheInfo?: (fiche: PedagogicalContent) => void;
    /** Sujets retenus à l'étape précédente, un par pilier. */
    themesInitiaux?: Partial<Record<Dimension, string>>;
};

const TOUS_LES_THEMES = Object.values(THEMES_BY_PILLAR).flat();

const libelleTheme = (id: string) => TOUS_LES_THEMES.find(t => t.id === id)?.label ?? id;

/**
 * Les questions des sujets retenus, groupées par couleur.
 *
 * Il n'y a plus de sélecteur de pilier ni de thème : ce choix est fait à l'écran précédent
 * (« Cette semaine, on parle de quoi ? »). Le panacop à trois roues qui vivait ici posait
 * une deuxième fois la même question dans un autre vocabulaire — un instrument sans
 * problème à résoudre. Ne restent que les deux tris qui affinent réellement une liste de
 * questions déjà cadrée : le niveau et les mots-clés.
 */
export default function QuestionsDuSujet({ pool, retenues, onToggleFiche, onFicheInfo, themesInitiaux }: Props) {
    // Niveaux cumulables : un groupe n'est pas toujours homogène, et « Découverte +
    // Approfondi » est un cas courant. Liste vide = aucun filtre, tous les niveaux.
    const [niveaux, setNiveaux] = useState<Array<1 | 2 | 3>>([]);
    const [motsClesOuverts, setMotsClesOuverts] = useState(false);
    const [motsCles, setMotsCles] = useState<string[]>([]);
    const [rechercheMots, setRechercheMots] = useState('');
    // Regroupement par couleur par défaut : c'est la lecture de la méthode. La vue par
    // phénomène est un affichage alternatif du même jeu de questions, pas un filtre.
    const [parPhenomene, setParPhenomene] = useState(false);

    const poolEnvironnemental = useMemo(() => pool.filter(f => f.source !== 'custom'), [pool]);

    const toggleMotCle = (m: string) => {
        setMotsCles(prev => (prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]));
    };

    const toggleNiveau = (n: 1 | 2 | 3) => {
        setNiveaux(prev => (prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]));
    };

    const poolNiveau = useMemo(
        () => (niveaux.length
            ? poolEnvironnemental.filter(f => niveaux.includes(Number(f.niveau) as 1 | 2 | 3))
            : poolEnvironnemental),
        [poolEnvironnemental, niveaux],
    );

    /** Fiche rattachée au sujet retenu pour son pilier. */
    const dansLeSujet = useMemo(() => {
        const attendus = new Set(Object.values(themesInitiaux ?? {}).filter(Boolean) as string[]);
        return (f: PedagogicalContent) =>
            attendus.size === 0 || (f.tags_theme ?? []).map(String).some(t => attendus.has(t));
    }, [themesInitiaux]);

    // Compté sur les sujets retenus, indépendamment des niveaux cochés : chaque carte
    // annonce ce que ce niveau apporte à lui seul, un chiffre stable qu'on peut additionner
    // mentalement — et non ce qui resterait sous la sélection courante.
    const comptesParNiveau = useMemo(() => {
        const compte: Record<number, number> = {};
        poolEnvironnemental.forEach(f => {
            if (!dansLeSujet(f)) return;
            const n = Number(f.niveau);
            if (n) compte[n] = (compte[n] ?? 0) + 1;
        });
        return compte;
    }, [poolEnvironnemental, dansLeSujet]);

    // Mots-clés proposés : uniquement ceux présents dans les questions effectivement
    // affichées — proposer un tri qui ne rendrait aucun résultat n'aide personne.
    const motsClesDisponibles = useMemo(() => {
        const set = new Set<string>();
        poolNiveau.forEach(f => {
            if (!dansLeSujet(f)) return;
            (f.tags_filtre ?? []).forEach(t => { if (t) set.add(String(t)); });
        });
        return Array.from(set).sort((a, b) => a.localeCompare(b, 'fr'));
    }, [poolNiveau, dansLeSujet]);

    const motsClesFiltres = rechercheMots.trim()
        ? motsClesDisponibles.filter(m => m.toLowerCase().includes(rechercheMots.trim().toLowerCase()))
        : motsClesDisponibles;

    /** Les questions retenues par les filtres, avant tout regroupement. */
    const retenuesParFiltres = useMemo(() => {
        return poolNiveau.filter(f => {
            if (!dansLeSujet(f)) return false;
            if (motsCles.length) {
                const siens = (f.tags_filtre ?? []).map(t => String(t).toLowerCase());
                if (!motsCles.some(m => siens.includes(m.toLowerCase()))) return false;
            }
            return true;
        });
    }, [poolNiveau, dansLeSujet, motsCles]);

    const groupes = useMemo(
        () => PILLARS
            .map(pillar => ({ pillar, fiches: retenuesParFiltres.filter(f => f.dimension === pillar.id) }))
            .filter(g => g.fiches.length > 0),
        [retenuesParFiltres],
    );

    // Même jeu de questions, rangé par phénomène observable plutôt que par pilier. Ce n'est
    // pas un filtre — rien n'est masqué, le total est identique — mais une autre façon de
    // lire la même liste : « Les marées » annonce de quoi on va parler là où « Repères
    // spatio-temporels » nomme une intention pédagogique.
    const groupesPhenomene = useMemo(() => {
        const par = new Map<string, { groupe: Groupe; fiches: PedagogicalContent[] }>();
        const orphelines: PedagogicalContent[] = [];

        retenuesParFiltres.forEach(f => {
            const g = groupeDe(f.id);
            if (!g) { orphelines.push(f); return; }
            const entree = par.get(g.id) ?? { groupe: g, fiches: [] };
            entree.fiches.push(f);
            par.set(g.id, entree);
        });

        // Ordre du catalogue plutôt que d'apparition : les milieux restent groupés.
        const ordonnes = GROUPES.map(g => par.get(g.id)).filter((e): e is NonNullable<typeof e> => !!e);
        return { ordonnes, orphelines };
    }, [retenuesParFiltres]);

    const total = retenuesParFiltres.length;

    return (
        <div className="space-y-4">
            {/* Les deux tris qui restent. Le niveau occupe la place principale : c'est le
                seul réglage courant. Ce n'est pas une difficulté mais un repère d'exposition
                au sujet (voir `data/niveaux.ts`), d'où la jauge de trois barres, qui rend la
                progression lisible sans texte explicatif. */}
            <section className="rounded-2xl bg-white/70 px-3 py-3 space-y-2.5">
                <div className="flex items-baseline justify-between gap-2 px-0.5">
                    <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">
                        Niveau
                    </p>
                    {niveaux.length > 0 && (
                        <button
                            onClick={() => setNiveaux([])}
                            className="text-[10px] font-bold text-slate-400 hover:text-slate-700 underline transition-colors"
                        >
                            Tout afficher
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                    {NIVEAUX.map(({ n, label }) => {
                        const actif = niveaux.includes(n);
                        const nb = comptesParNiveau[n] ?? 0;

                        return (
                            <button
                                key={n}
                                onClick={() => toggleNiveau(n)}
                                aria-pressed={actif}
                                disabled={nb === 0}
                                className={clsx(
                                    'relative overflow-hidden rounded-xl px-3 pt-2.5 pb-2.5 text-left transition-all active:scale-[0.98]',
                                    'disabled:opacity-40 disabled:active:scale-100 disabled:cursor-not-allowed',
                                    actif
                                        ? 'bg-slate-900 text-white shadow-md'
                                        : 'bg-white text-slate-800 shadow-sm hover:shadow',
                                )}
                            >
                                {/* Jauge d'exposition : 1, 2 ou 3 barres remplies — la
                                    progression Découverte → Engagement se lit sans lire. */}
                                <span className="flex items-center gap-0.5 mb-1.5">
                                    {[1, 2, 3].map(i => (
                                        <span
                                            key={i}
                                            className={clsx(
                                                'h-[3px] flex-1 rounded-full transition-colors',
                                                i <= n
                                                    ? actif ? 'bg-white' : 'bg-slate-800'
                                                    : actif ? 'bg-white/25' : 'bg-slate-200',
                                            )}
                                        />
                                    ))}
                                </span>

                                <span className="block text-[12px] font-black leading-tight">
                                    {label}
                                </span>
                                <span className={clsx(
                                    'block text-[9.5px] font-bold tabular-nums mt-0.5',
                                    actif ? 'text-white/50' : 'text-slate-300',
                                )}>
                                    {nb} question{nb > 1 ? 's' : ''}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {motsClesDisponibles.length > 0 && (
                    <>
                        <div className="h-px bg-slate-900/[0.07]" />
                        <div>
                            <button
                                onClick={() => setMotsClesOuverts(o => !o)}
                                className="w-full flex items-center gap-2 text-[10.5px] font-bold text-slate-500 hover:text-slate-800 transition-colors py-0.5"
                            >
                                <span className="material-symbols-outlined text-[14px]">sell</span>
                                {motsCles.length > 0 ? `${motsCles.length} mot-clé${motsCles.length > 1 ? 's' : ''}` : 'Mots-clés'}
                                <span className={clsx(
                                    'material-symbols-outlined text-[15px] ml-auto transition-transform',
                                    motsClesOuverts && 'rotate-180',
                                )}>
                                    expand_more
                                </span>
                            </button>

                            {motsClesOuverts && (
                                <div className="mt-2 space-y-2">
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">search</span>
                                        <input
                                            type="text"
                                            placeholder="Filtrer…"
                                            value={rechercheMots}
                                            onChange={e => setRechercheMots(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white text-[11px] font-bold text-slate-800 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-300 transition-all"
                                        />
                                    </div>
                                    {motsCles.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {motsCles.map(m => (
                                                <button
                                                    key={m}
                                                    onClick={() => toggleMotCle(m)}
                                                    className="bg-slate-800 text-white pl-2.5 pr-1.5 py-0.5 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1 hover:bg-red-500 transition-colors"
                                                >
                                                    {m}<span className="material-symbols-outlined text-[12px]">close</span>
                                                </button>
                                            ))}
                                            <button onClick={() => setMotsCles([])} className="text-[10px] font-bold text-slate-500 hover:text-slate-800 underline px-1">
                                                Effacer
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                                        {motsClesFiltres.filter(m => !motsCles.includes(m)).map(m => (
                                            <button
                                                key={m}
                                                onClick={() => toggleMotCle(m)}
                                                className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-white text-slate-500 shadow-sm hover:text-slate-900 transition-all"
                                            >
                                                {m}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </section>

            {total > 0 && (
                <div className="flex items-center gap-2 px-1">
                    <p className="flex-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {total} question{total > 1 ? 's' : ''}
                    </p>

                    {/* Bascule d'affichage, pas de filtre : le total est le même dans les
                        deux vues, seul l'ordre de lecture change. Par palier reste le
                        défaut. */}
                    <div className="flex items-center gap-0.5 bg-white/70 rounded-lg p-0.5 shrink-0">
                        <BasculeVue actif={!parPhenomene} onClick={() => setParPhenomene(false)}>
                            Par palier
                        </BasculeVue>
                        <BasculeVue actif={parPhenomene} onClick={() => setParPhenomene(true)}>
                            Par phénomène
                        </BasculeVue>
                    </div>
                </div>
            )}

            {total === 0 ? (
                <div className="text-center py-16 text-slate-400">
                    <span className="material-symbols-outlined text-4xl">search_off</span>
                    <p className="text-sm font-black uppercase tracking-wide mt-2">Aucun résultat</p>
                    <p className="text-xs mt-1">Modifiez le niveau ou les mots-clés.</p>
                </div>
            ) : parPhenomene ? (
                <div className="space-y-6">
                    {groupesPhenomene.ordonnes.map(({ groupe, fiches }) => (
                        <section key={groupe.id} className="space-y-2">
                            <div className="flex items-center gap-2 px-1 py-2">
                                <div className="size-7 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-slate-600 text-base">{groupe.icon}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-slate-800 tracking-tight leading-none">
                                        {groupe.label}
                                    </p>
                                    <p className="text-[11px] font-semibold text-slate-400 truncate mt-0.5">
                                        {groupe.accroche}
                                    </p>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full shrink-0">
                                    {fiches.length}
                                </span>
                            </div>

                            <div className="space-y-1.5">
                                {fiches.map(fiche => (
                                    <CarteQuestion
                                        key={fiche.id}
                                        fiche={fiche}
                                        retenue={retenues.includes(fiche.id)}
                                        /* Le pilier reste lisible sur chaque question : c'est
                                           l'information que le regroupement par couleur portait
                                           dans son en-tête. */
                                        montrerPilier
                                        onToggle={() => onToggleFiche(fiche.id)}
                                        onInfo={() => onFicheInfo?.(fiche)}
                                    />
                                ))}
                            </div>
                        </section>
                    ))}

                    {groupesPhenomene.orphelines.length > 0 && (
                        <section className="space-y-2">
                            <div className="flex items-center gap-2 px-1 py-2">
                                <div className="size-7 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-slate-600 text-base">more_horiz</span>
                                </div>
                                <p className="flex-1 text-sm font-black text-slate-800 tracking-tight">
                                    Autres questions
                                </p>
                                <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full shrink-0">
                                    {groupesPhenomene.orphelines.length}
                                </span>
                            </div>
                            <div className="space-y-1.5">
                                {groupesPhenomene.orphelines.map(fiche => (
                                    <CarteQuestion
                                        key={fiche.id}
                                        fiche={fiche}
                                        retenue={retenues.includes(fiche.id)}
                                        montrerPilier
                                        onToggle={() => onToggleFiche(fiche.id)}
                                        onInfo={() => onFicheInfo?.(fiche)}
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    {groupes.map(({ pillar, fiches }) => {
                        const sujet = themesInitiaux?.[pillar.id];

                        return (
                            <section key={pillar.id} className="space-y-2">
                                {/* L'en-tête rappelle le sujet retenu, pas seulement la couleur :
                                    c'est ce qui relie ces questions à la décision d'avant. */}
                                <div className="flex items-center gap-2 px-1 py-2">
                                    <div className={clsx('size-7 rounded-lg flex items-center justify-center shrink-0', pillar.bg)}>
                                        <span className="material-symbols-outlined text-white text-base">{pillar.icon}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={clsx('text-sm font-black uppercase tracking-tight leading-none', pillar.color)}>
                                            {pillar.label}
                                        </p>
                                        {sujet && (
                                            <p className="text-[11px] font-semibold text-slate-400 truncate mt-0.5">
                                                {libelleTheme(sujet)}
                                            </p>
                                        )}
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full shrink-0">
                                        {fiches.length}
                                    </span>
                                </div>

                                <div className="space-y-1.5">
                                    {fiches.map(fiche => (
                                        <CarteQuestion
                                            key={fiche.id}
                                            fiche={fiche}
                                            retenue={retenues.includes(fiche.id)}
                                            onToggle={() => onToggleFiche(fiche.id)}
                                            onInfo={() => onFicheInfo?.(fiche)}
                                        />
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function BasculeVue({
    actif, onClick, children,
}: { actif: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            aria-pressed={actif}
            className={clsx(
                'px-2.5 py-1 rounded-md text-[10px] font-black transition-colors',
                actif ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-700',
            )}
        >
            {children}
        </button>
    );
}

/**
 * Une question. `montrerPilier` affiche l'étiquette de couleur au-dessus du titre : dans la
 * vue par phénomène, l'en-tête ne porte plus l'angle COP, il doit donc se lire sur la carte.
 */
function CarteQuestion({
    fiche, retenue, montrerPilier = false, onToggle, onInfo,
}: {
    fiche: PedagogicalContent;
    retenue: boolean;
    montrerPilier?: boolean;
    onToggle: () => void;
    onInfo: () => void;
}) {
    const pilier = PILLARS.find(p => p.id === fiche.dimension);

    return (
        <div className={clsx(
            'relative flex items-start gap-2 rounded-xl overflow-hidden transition-colors shadow-sm',
            retenue ? 'bg-indigo-50' : 'bg-white',
        )}>
            <span className={clsx('absolute left-0 top-0 bottom-0 w-1', pilier?.bg)} />

            <button onClick={onInfo} className="flex-1 min-w-0 text-left pl-4 py-3">
                {montrerPilier && pilier && (
                    <span className={clsx('block text-[9px] font-black uppercase tracking-widest mb-0.5', pilier.color)}>
                        {pilier.label}
                    </span>
                )}
                <span className="block text-[13px] font-bold text-slate-800 leading-snug">
                    {fiche.question}
                </span>
                {niveauRepere(fiche.niveau) && (
                    <span className="block text-[10px] font-semibold text-slate-400 mt-0.5">
                        {niveauRepere(fiche.niveau)}
                    </span>
                )}
            </button>

            <button
                onClick={onToggle}
                aria-label={retenue ? 'Retirer' : 'Retenir'}
                className={clsx(
                    'size-8 my-2.5 mr-2.5 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90',
                    retenue ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 shadow-sm',
                )}
            >
                <span className="material-symbols-outlined text-[17px]">
                    {retenue ? 'check' : 'add'}
                </span>
            </button>
        </div>
    );
}

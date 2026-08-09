'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { PILLARS, THEMES_BY_PILLAR } from '@/data/etages';
import { NIVEAUX, niveauRepere } from '@/data/niveaux';
import { PedagogicalContent, Dimension } from '@/types';

type Props = {
    pool: PedagogicalContent[];
    retenues: string[];
    onToggleFiche: (id: string) => void;
    onFicheInfo?: (fiche: PedagogicalContent) => void;
};

/**
 * Vue COP'UN — telle que conçue par la créatrice de la méthode : Comprendre, Observer,
 * Protéger n'est pas un filtre secondaire mais la colonne vertébrale pédagogique. Filtres
 * à plat (niveau, les 9 thèmes classés par pilier, mots-clés), toujours visibles, jamais
 * cachés derrière un entonnoir — cocher un thème resserre directement la liste de cartes
 * groupées par pilier en dessous. Aucune référence aux phénomènes de terrain (marées,
 * vent…) : c'est la différence assumée avec l'entrée « Par sujet », voir ChoixMethode.
 */
// Tous les thèmes du référentiel, tous piliers confondus — sert à retrouver le libellé
// d'un tags_theme même quand il n'appartient pas au pilier de la fiche qui le porte (les
// données croisent parfois les deux, ex. une fiche COMPRENDRE taguée « repères
// spatio-temporels », qui est un thème OBSERVER).
const TOUS_LES_THEMES = Object.values(THEMES_BY_PILLAR).flat();

export default function FiltresCopun({ pool, retenues, onToggleFiche, onFicheInfo }: Props) {
    const [niveau, setNiveau] = useState<1 | 2 | 3 | 4 | null>(null);
    const [themes, setThemes] = useState<string[]>([]);
    const [motsCles, setMotsCles] = useState<string[]>([]);
    const [rechercheMots, setRechercheMots] = useState('');

    // La vue COP'UN n'a de sens que pour le contenu environnemental du référentiel — les
    // fiches personnelles/techniques du moniteur (manœuvres, voile…) n'appartiennent à
    // aucun pilier pédagogique et n'y ont pas leur place.
    const poolEnvironnemental = useMemo(() => pool.filter(f => f.source !== 'custom'), [pool]);

    const toggleTheme = (id: string) => {
        setThemes(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
    };
    const toggleMotCle = (m: string) => {
        setMotsCles(prev => (prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]));
    };

    const poolNiveau = useMemo(
        () => (niveau ? poolEnvironnemental.filter(f => Number(f.niveau) === niveau) : poolEnvironnemental),
        [poolEnvironnemental, niveau],
    );

    const motsClesDisponibles = useMemo(() => {
        const set = new Set<string>();
        poolNiveau.forEach(f => {
            if (themes.length && !(f.tags_theme ?? []).some(t => themes.includes(String(t)))) return;
            (f.tags_filtre ?? []).forEach(t => { if (t) set.add(String(t)); });
        });
        return Array.from(set).sort((a, b) => a.localeCompare(b, 'fr'));
    }, [poolNiveau, themes]);

    const motsClesFiltres = rechercheMots.trim()
        ? motsClesDisponibles.filter(m => m.toLowerCase().includes(rechercheMots.trim().toLowerCase()))
        : motsClesDisponibles;

    const groupes = useMemo(() => {
        return PILLARS.map(pillar => {
            const fiches = poolNiveau.filter(f => {
                if (f.dimension !== pillar.id) return false;
                if (themes.length) {
                    const siens = (f.tags_theme ?? []).map(String);
                    if (!themes.some(t => siens.includes(t))) return false;
                }
                if (motsCles.length) {
                    const siens = (f.tags_filtre ?? []).map(t => String(t).toLowerCase());
                    if (!motsCles.some(m => siens.includes(m.toLowerCase()))) return false;
                }
                return true;
            });
            return { pillar, fiches };
        }).filter(g => g.fiches.length > 0);
    }, [poolNiveau, themes, motsCles]);

    const total = groupes.reduce((n, g) => n + g.fiches.length, 0);

    return (
        <div className="space-y-5">
            {/* FILTRES */}
            <section className="bg-white rounded-2xl p-5 space-y-5 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Filtres</p>

                <div className="space-y-2">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Niveau</p>
                    <div className="flex bg-[#EBF0F7] p-1 rounded-xl gap-1">
                        {NIVEAUX.map(({ n, label }) => (
                            <button
                                key={n}
                                onClick={() => setNiveau(v => (v === n ? null : n))}
                                className={clsx(
                                    'flex-1 py-2.5 px-1 rounded-lg text-[11px] font-black transition-all',
                                    niveau === n ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600',
                                )}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Thématiques</p>
                    <div className="space-y-3">
                        {PILLARS.map(pillar => (
                            <div key={pillar.id} className="space-y-2">
                                <p className={clsx('text-[9px] font-black uppercase tracking-[0.15em]', pillar.color)}>{pillar.label}</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {THEMES_BY_PILLAR[pillar.id].map(theme => {
                                        const actif = themes.includes(theme.id);
                                        return (
                                            <button
                                                key={theme.id}
                                                onClick={() => toggleTheme(theme.id)}
                                                className={clsx(
                                                    'flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all',
                                                    actif ? `${pillar.bg} text-white` : 'bg-[#EBF0F7] text-slate-500 hover:text-slate-700',
                                                )}
                                            >
                                                <span className="material-symbols-outlined text-[13px]">{theme.icon}</span>
                                                {theme.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {motsClesDisponibles.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mots-clés</p>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-base">search</span>
                            <input
                                type="text"
                                placeholder="Filtrer…"
                                value={rechercheMots}
                                onChange={e => setRechercheMots(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#EBF0F7] text-[11px] font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all"
                            />
                        </div>
                        {motsCles.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                                {motsCles.map(m => (
                                    <button
                                        key={m}
                                        onClick={() => toggleMotCle(m)}
                                        className="bg-slate-800 text-white pl-2.5 pr-1.5 py-0.5 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1 hover:bg-red-500 transition-colors"
                                    >
                                        {m}<span className="material-symbols-outlined text-[12px]">close</span>
                                    </button>
                                ))}
                                <button onClick={() => setMotsCles([])} className="text-[10px] font-bold text-slate-400 hover:text-slate-600 underline px-1">
                                    Effacer
                                </button>
                            </div>
                        )}
                        <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                            {motsClesFiltres.filter(m => !motsCles.includes(m)).map(m => (
                                <button
                                    key={m}
                                    onClick={() => toggleMotCle(m)}
                                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-[#EBF0F7] text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-all"
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            {/* CARTES GROUPÉES PAR PILIER */}
            {total === 0 ? (
                <div className="text-center py-16 text-slate-400">
                    <span className="material-symbols-outlined text-4xl">search_off</span>
                    <p className="text-sm font-black uppercase tracking-wide mt-2">Aucun résultat</p>
                    <p className="text-xs mt-1">Modifiez vos filtres pour voir des questions.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {groupes.map(({ pillar, fiches }) => (
                        <section key={pillar.id} className="space-y-2">
                            <div className="flex items-center gap-2 px-1 py-2">
                                <div className={clsx('size-7 rounded-lg flex items-center justify-center shrink-0', pillar.bg)}>
                                    <span className="material-symbols-outlined text-white text-base">{pillar.icon}</span>
                                </div>
                                <p className={clsx('flex-1 text-sm font-black uppercase tracking-tight', pillar.color)}>{pillar.label}</p>
                                <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full">{fiches.length}</span>
                            </div>

                            {/* Même carte que le catalogue par sujet (voir GroupeBloc) : les deux
                                méthodes mènent au même geste final — choisir des questions — donc
                                partagent la même présentation, seul le chemin pour y arriver diffère. */}
                            <div className="space-y-1.5">
                                {fiches.map(fiche => {
                                    const isSelected = retenues.includes(fiche.id);
                                    // Tous les thèmes de la fiche, pas seulement ceux du pilier affiché
                                    // ici — les données croisent parfois pilier et thème d'un autre
                                    // pilier (ex. dimension COMPRENDRE avec un tags_theme d'OBSERVER).
                                    const themesLabels = TOUS_LES_THEMES.filter(t =>
                                        (fiche.tags_theme ?? []).map(String).includes(t.id),
                                    );
                                    return (
                                        <div
                                            key={fiche.id}
                                            className={clsx(
                                                'relative flex items-start gap-2 rounded-xl overflow-hidden transition-colors shadow-sm',
                                                isSelected ? 'bg-indigo-50' : 'bg-white',
                                            )}
                                        >
                                            <span className={clsx('absolute left-0 top-0 bottom-0 w-1', pillar.bg)} />

                                            <button
                                                onClick={() => onFicheInfo?.(fiche)}
                                                className="flex-1 min-w-0 text-left pl-4 py-3"
                                            >
                                                {themesLabels.length > 0 && (
                                                    <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
                                                        {themesLabels.map(t => t.label).join(' · ')}
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
                                                onClick={() => onToggleFiche(fiche.id)}
                                                aria-label={isSelected ? 'Retirer' : 'Retenir'}
                                                className={clsx(
                                                    'size-8 my-2.5 mr-2.5 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90',
                                                    isSelected
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-white text-slate-400 shadow-sm',
                                                )}
                                            >
                                                <span className="material-symbols-outlined text-[17px]">
                                                    {isSelected ? 'check' : 'add'}
                                                </span>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                </div>
            )}
        </div>
    );
}

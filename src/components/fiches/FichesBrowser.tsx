'use client';

import { useState, useMemo } from 'react';
import FicheCard from './FicheCard';
import type { FicheMemo } from '@/actions/fiche-memo-actions';
import type { ThematicTag } from '@/data/seasonal-context';
import { THEMATIC_TAG_LABELS, SAISON_LABELS, ALL_THEMATIC_TAGS, ALL_SAISON_IDS } from './fiche-constants';

interface Props {
    fiches: FicheMemo[];
    currentUserId?: string | null;
    isAdmin?: boolean;
    isModerator?: boolean;
    /** Thème présélectionné (`?theme=` dans l'URL) — permet d'arriver ici depuis un thème
     *  de l'écran de choix des sujets et de tomber directement sur le mémo concerné. */
    themeInitial?: ThematicTag | null;
}

export default function FichesBrowser({ fiches, currentUserId, isAdmin, isModerator, themeInitial = null }: Props) {
    const [search, setSearch] = useState('');
    const [theme, setTheme] = useState<ThematicTag | null>(themeInitial);
    const [saison, setSaison] = useState<string | null>(null);
    const [tag, setTag] = useState<string | null>(null);
    // Filtres dépliés d'emblée quand on arrive avec un thème imposé : sinon le filtre actif
    // est invisible et la liste paraît incomplète sans raison.
    const [showFilters, setShowFilters] = useState(!!themeInitial);

    // Tags libres réellement présents dans les fiches
    const allTags = useMemo(() => {
        const set = new Set<string>();
        fiches.forEach(f => (f.tags ?? []).forEach(t => set.add(t)));
        return Array.from(set).sort();
    }, [fiches]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return fiches.filter(f => {
            if (theme && !f.tags_thematiques.includes(theme)) return false;
            if (saison && !f.tags_saisons.includes(saison)) return false;
            if (tag && !(f.tags ?? []).includes(tag)) return false;
            if (q) {
                const hay = `${f.titre} ${f.resume ?? ''} ${(f.tags ?? []).join(' ')}`.toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });
    }, [fiches, search, theme, saison, tag]);

    const activeFilters = (theme ? 1 : 0) + (saison ? 1 : 0) + (tag ? 1 : 0);

    const resetFilters = () => { setTheme(null); setSaison(null); setTag(null); };

    return (
        <div>
            {/* Barre de recherche + bouton filtres */}
            <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Rechercher une fiche…"
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                    />
                </div>
                <button
                    onClick={() => setShowFilters(s => !s)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold border transition ${
                        activeFilters > 0 || showFilters
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
                    }`}
                >
                    <span className="material-symbols-outlined text-[18px]">tune</span>
                    Filtres
                    {activeFilters > 0 && (
                        <span className="bg-white/25 text-[10px] px-1.5 rounded-full">{activeFilters}</span>
                    )}
                </button>
            </div>

            {/* Panneau de filtres */}
            {showFilters && (
                <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-5 space-y-4">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Thème</p>
                        <div className="flex flex-wrap gap-1.5">
                            {ALL_THEMATIC_TAGS.map(t => (
                                <button key={t} onClick={() => setTheme(theme === t ? null : t)}
                                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition ${
                                        theme === t ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
                                    }`}>
                                    {THEMATIC_TAG_LABELS[t]}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Saison</p>
                        <div className="flex flex-wrap gap-1.5">
                            {ALL_SAISON_IDS.map(id => (
                                <button key={id} onClick={() => setSaison(saison === id ? null : id)}
                                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition ${
                                        saison === id ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300'
                                    }`}>
                                    {SAISON_LABELS[id]}
                                </button>
                            ))}
                        </div>
                    </div>
                    {allTags.length > 0 && (
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Mots-clés</p>
                            <div className="flex flex-wrap gap-1.5">
                                {allTags.map(t => (
                                    <button key={t} onClick={() => setTag(tag === t ? null : t)}
                                        className={`px-2.5 py-1 rounded-full text-xs font-medium border transition ${
                                            tag === t ? 'bg-slate-700 text-white border-slate-700' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                                        }`}>
                                        #{t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {activeFilters > 0 && (
                        <button onClick={resetFilters} className="text-xs font-bold text-slate-400 hover:text-slate-700 transition">
                            Réinitialiser les filtres
                        </button>
                    )}
                </div>
            )}

            {/* Résultats */}
            {filtered.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered.map(fiche => (
                        <FicheCard
                            key={fiche.id}
                            fiche={fiche}
                            currentUserId={currentUserId}
                            isAdmin={isAdmin}
                            isModerator={isModerator}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-slate-400">
                    <span className="material-symbols-outlined text-4xl mb-2 block">search_off</span>
                    <p className="text-sm font-semibold">Aucune fiche ne correspond à ta recherche.</p>
                </div>
            )}
        </div>
    );
}

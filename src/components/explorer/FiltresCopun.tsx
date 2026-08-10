'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { PILLARS, THEMES_BY_PILLAR } from '@/data/etages';
import { NIVEAUX, niveauRepere } from '@/data/niveaux';
import { PedagogicalContent, Dimension } from '@/types';
import RoueChoix from './RoueChoix';

type Props = {
    pool: PedagogicalContent[];
    retenues: string[];
    onToggleFiche: (id: string) => void;
    onFicheInfo?: (fiche: PedagogicalContent) => void;
};

// Couleurs pleines des piliers COP — seule contrainte visuelle imposée sur cet outil.
// OBSERVER est descendu d'un cran (blue-600 plutôt que blue-500) : sur fond clair, le bleu
// d'origine était le plus pâle des trois et s'effaçait là où l'ambre et le vert accrochaient.
const COULEUR_PILIER: Record<Dimension, string> = {
    COMPRENDRE: '#f59e0b',
    OBSERVER: '#2563eb',
    PROTÉGER: '#10b981',
};

const TOUS_LES_THEMES = Object.values(THEMES_BY_PILLAR).flat();

/**
 * Vue COP'UN — telle que conçue par la créatrice de la méthode : Comprendre, Observer,
 * Protéger n'est pas un filtre secondaire mais la colonne vertébrale pédagogique.
 *
 * L'instrument de filtre est un bandeau clair à roues glissantes, qui reprend le geste
 * physique du panacop papier. Le fond pâle n'est pas un défaut d'ambition : les trois
 * couleurs COP y gardent leur densité, là où l'anthracite ne rendait justice qu'au bleu
 * OBSERVER et poussait l'ambre et le vert vers le fluo.
 *
 * Trois roues emboîtées, du plus général (niveau) au plus spécifique (thème), toujours
 * toutes visibles à leur position par défaut (« Tous ») — aucun présélectionné.
 */
export default function FiltresCopun({ pool, retenues, onToggleFiche, onFicheInfo }: Props) {
    const [niveau, setNiveau] = useState<1 | 2 | 3 | null>(null);
    const [pilier, setPilier] = useState<Dimension | null>(null);
    const [theme, setTheme] = useState<string | null>(null);
    const [motsClesOuverts, setMotsClesOuverts] = useState(false);
    const [motsCles, setMotsCles] = useState<string[]>([]);
    const [rechercheMots, setRechercheMots] = useState('');

    const poolEnvironnemental = useMemo(() => pool.filter(f => f.source !== 'custom'), [pool]);

    const choisirPilier = (id: Dimension | null) => {
        setPilier(id);
        setTheme(null);
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
            if (theme && !(f.tags_theme ?? []).some(t => String(t) === theme)) return;
            (f.tags_filtre ?? []).forEach(t => { if (t) set.add(String(t)); });
        });
        return Array.from(set).sort((a, b) => a.localeCompare(b, 'fr'));
    }, [poolNiveau, theme]);

    const motsClesFiltres = rechercheMots.trim()
        ? motsClesDisponibles.filter(m => m.toLowerCase().includes(rechercheMots.trim().toLowerCase()))
        : motsClesDisponibles;

    const groupes = useMemo(() => {
        return PILLARS
            .filter(p => !pilier || p.id === pilier)
            .map(pillar => {
                const fiches = poolNiveau.filter(f => {
                    if (f.dimension !== pillar.id) return false;
                    if (theme) {
                        const siens = (f.tags_theme ?? []).map(String);
                        if (!siens.includes(theme)) return false;
                    }
                    if (motsCles.length) {
                        const siens = (f.tags_filtre ?? []).map(t => String(t).toLowerCase());
                        if (!motsCles.some(m => siens.includes(m.toLowerCase()))) return false;
                    }
                    return true;
                });
                return { pillar, fiches };
            }).filter(g => g.fiches.length > 0);
    }, [poolNiveau, pilier, theme, motsCles]);

    const total = groupes.reduce((n, g) => n + g.fiches.length, 0);

    const optionsNiveau = NIVEAUX.map(({ n, label }) => ({ id: String(n), label }));
    const optionsPilier = PILLARS.map(p => ({
        id: p.id, label: p.label, icon: p.icon, couleur: COULEUR_PILIER[p.id],
    }));
    const optionsTheme = pilier
        ? THEMES_BY_PILLAR[pilier].map(t => ({
            id: t.id,
            label: t.label,
            icon: t.icon,
            couleur: COULEUR_PILIER[pilier],
        }))
        : [];

    // Le panneau prend franchement la couleur du pilier actif (20%), pas un soupçon : à 8%
    // sur du gris, la teinte se lisait comme un fond sale plutôt que comme un choix. Sans
    // pilier, gris neutre.
    const fondPanneau = pilier
        ? `linear-gradient(${COULEUR_PILIER[pilier]}33, ${COULEUR_PILIER[pilier]}33), #FFFFFF`
        : '#EEF1F6';

    return (
        <div className="space-y-4">
            {/* L'instrument : un bandeau compact, pas un panneau qui domine l'écran — trois
                pistes basses (label + pilule sur une seule ligne), séparateurs fins. Le fond
                se teinte très légèrement de la couleur du pilier actif, pour que l'instrument
                réagisse au choix fait plutôt que de rester indifférent. */}
            <section
                className="rounded-2xl px-3.5 py-2.5 space-y-2 transition-[background] duration-500"
                style={{ background: fondPanneau }}
            >
                <RoueSection titre="Niveau" options={optionsNiveau} valeur={niveau ? String(niveau) : null}
                    onChange={v => setNiveau(v ? (Number(v) as 1 | 2 | 3) : null)} />

                <div className="h-px bg-slate-900/[0.10]" />

                <RoueSection titre="Pilier" options={optionsPilier} valeur={pilier}
                    onChange={v => choisirPilier(v as Dimension | null)} />

                {pilier && (
                    <>
                        <div className="h-px bg-slate-900/[0.10]" />
                        <RoueSection titre="Thème" options={optionsTheme} valeur={theme} onChange={setTheme} />
                    </>
                )}

                {motsClesDisponibles.length > 0 && (
                    <>
                        <div className="h-px bg-slate-900/[0.10]" />
                        <div>
                            <button
                                onClick={() => setMotsClesOuverts(o => !o)}
                                className="w-full flex items-center gap-2 text-[10.5px] font-bold text-slate-500 hover:text-slate-800 transition-colors py-1"
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

                            <div className="space-y-1.5">
                                {fiches.map(fiche => {
                                    const isSelected = retenues.includes(fiche.id);
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

function RoueSection({
    titre, options, valeur, onChange,
}: {
    titre: string;
    options: { id: string; label: string; labelCourt?: string; icon?: string; couleur?: string }[];
    valeur: string | null;
    onChange: (v: string | null) => void;
}) {
    return (
        <div className="flex items-center gap-2.5">
            <p className="w-14 shrink-0 text-[9px] font-black uppercase tracking-[0.1em] text-slate-500">
                {titre}
            </p>
            <div className="flex-1 min-w-0">
                <RoueChoix options={options} valeur={valeur} onChange={onChange} />
            </div>
        </div>
    );
}

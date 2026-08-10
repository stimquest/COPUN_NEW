'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { PILLARS, THEMES_BY_PILLAR } from '@/data/etages';
import { Dimension } from '@/types';

type Props = {
    /** Thème retenu pour chaque pilier — au plus un par palier. */
    choisis: Partial<Record<Dimension, string>>;
    onChoisir: (pilier: Dimension, themeId: string) => void;
};

/** Valeurs brutes : l'anneau du sujet retenu se pose en `ring-color`, pas en classe. */
const COULEUR: Record<Dimension, string> = {
    COMPRENDRE: '#f59e0b',
    OBSERVER: '#2563eb',
    PROTÉGER: '#10b981',
};

/**
 * L'arrivée sur l'écran de choix : les neuf thèmes, tous visibles d'emblée, groupés par
 * couleur de pilier.
 *
 * Avant, l'écran s'ouvrait sur un vide (« choisis un outil de filtre ») qui demandait de
 * traverser un menu avant de voir quoi que ce soit. Les neuf thèmes tiennent dans un
 * écran : les montrer directement supprime l'étape et met sous les yeux la structure de la
 * semaine — un sujet par couleur.
 *
 * Le vocabulaire de la méthode n'est pas exposé : on demande de choisir un sujet par
 * couleur, pas de « parcourir les piliers COP ». Chaque thème renvoie à sa fiche mémo, dont
 * les identifiants de tag sont les mêmes que ceux des thèmes (`ThematicTag`).
 */
export default function ChoixThemes({ choisis, onChoisir }: Props) {
    const faits = PILLARS.filter(p => choisis[p.id]).length;
    // Le mémo s'ouvre dans une autre section de l'app : on lui passe le chemin de retour,
    // sans quoi le seul moyen de revenir est le bouton de l'OS.
    const retour = usePathname();

    return (
        <section className="space-y-3">
            <div className="px-1">
                <h2 className="text-[16px] font-black text-slate-900 leading-tight">
                    Cette semaine, on parle de quoi&nbsp;?
                </h2>
                <p className="text-[12.5px] font-medium text-slate-500 leading-snug mt-0.5">
                    Choisis un sujet pour chaque palier.
                    {faits > 0 && faits < PILLARS.length && (
                        <span className="text-slate-400"> — {faits} sur {PILLARS.length}.</span>
                    )}
                </p>
            </div>

            {PILLARS.map(pilier => {
                const retenu = choisis[pilier.id];

                return (
                    <div key={pilier.id} className="space-y-1">
                        {/* Le mémo du sujet retenu vit à droite du titre de palier : une
                            lecture pour le moniteur, proposée une fois le choix fait plutôt
                            qu'en neuf exemplaires, et sur une ligne déjà là plutôt qu'en
                            ajoutant une ligne sous la grille. */}
                        <div className="flex items-center gap-2 px-1">
                            <span className={clsx('size-2 rounded-full shrink-0', pilier.bg)} />
                            <span className={clsx('text-[10px] font-black uppercase tracking-widest', pilier.color)}>
                                {pilier.label}
                            </span>
                            {retenu && (
                                <Link
                                    href={`/ressources?theme=${retenu}&retour=${encodeURIComponent(retour)}`}
                                    className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-slate-700 transition-colors shrink-0"
                                >
                                    <span className="material-symbols-outlined text-[14px]">menu_book</span>
                                    Fiche mémo
                                </Link>
                            )}
                        </div>

                        {/* Trois colonnes : les libellés font trois mots au plus, une carte
                            pleine largeur chacune faisait déborder les neuf sujets bien
                            au-delà de l'écran pour presque aucun texte. */}
                        <div className="grid grid-cols-3 gap-1.5">
                            {THEMES_BY_PILLAR[pilier.id].map(theme => {
                                const actif = retenu === theme.id;

                                return (
                                    <button
                                        key={theme.id}
                                        onClick={() => onChoisir(pilier.id, theme.id)}
                                        aria-pressed={actif}
                                        className={clsx(
                                            'flex flex-col items-center gap-1 rounded-xl px-1.5 py-2.5 text-center transition-all active:scale-[0.97]',
                                            actif
                                                ? 'bg-white shadow-md ring-2'
                                                : 'bg-white/70 shadow-sm hover:bg-white',
                                        )}
                                        style={actif ? { '--tw-ring-color': COULEUR[pilier.id] } as React.CSSProperties : undefined}
                                    >
                                        <span className={clsx(
                                            'material-symbols-outlined text-[20px] transition-colors',
                                            actif ? pilier.color : 'text-slate-300',
                                        )}>
                                            {theme.icon}
                                        </span>
                                        <span className={clsx(
                                            'text-[10.5px] leading-[1.25] transition-colors',
                                            actif ? 'font-black text-slate-900' : 'font-semibold text-slate-500',
                                        )}>
                                            {theme.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </section>
    );
}

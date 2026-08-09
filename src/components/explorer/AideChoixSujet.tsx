'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MILIEUX, groupesDuMilieu, Groupe } from '@/data/groupes';
import { PILLARS } from '@/data/etages';
import { Dimension } from '@/types';
import clsx from 'clsx';

type Props = {
    open: boolean;
    onClose: () => void;
    /** Renvoie le groupe visé et les dimensions COP retenues (vide = toutes). */
    onResultat: (groupe: Groupe, dimensions: Dimension[]) => void;
};

const ANGLES: { id: Dimension; label: string; detail: string }[] = [
    { id: 'COMPRENDRE', label: 'Comprendre pourquoi', detail: 'Le mécanisme, l’explication' },
    { id: 'OBSERVER', label: 'Savoir le repérer', detail: 'Ce qu’on regarde sur le terrain' },
    { id: 'PROTÉGER', label: 'Savoir quoi faire', detail: 'Le bon geste, la bonne attitude' },
];

/**
 * Aide au choix par sujet de terrain — un secours, pas un péage.
 *
 * Le catalogue reste l'arrivée par défaut : celui qui sait ce qu'il cherche n'a rien à
 * traverser. Cet entonnoir s'adresse au moniteur qui ouvre l'app sans idée précise.
 *
 * Ordre délibéré : milieu → groupe (le sujet concret, ce qui se voit sur le terrain)
 * avant l'angle COP — contrairement à la vue « Méthode COP'UN » qui part du pilier,
 * ici le sujet vient en premier. L'angle (pilier + thème) reste une précision
 * optionnelle en dernière étape, pas un préalable à devoir traverser.
 */
export default function AideChoixSujet({ open, onClose, onResultat }: Props) {
    const [etape, setEtape] = useState(1);
    const [milieu, setMilieu] = useState<string | null>(null);
    const [groupe, setGroupe] = useState<Groupe | null>(null);
    const [angles, setAngles] = useState<Dimension[]>([]);

    const fermer = () => {
        onClose();
        // Réinitialisation différée : évite de voir le parcours se vider pendant l'animation.
        setTimeout(() => {
            setEtape(1); setMilieu(null); setGroupe(null); setAngles([]);
        }, 250);
    };

    // Certains milieux ne contiennent qu'un seul groupe (« Le vivant », « Apprendre à
    // observer ») : demander « plus précisément ? » avec une seule réponse ne fait rien
    // avancer, on passe directement à l'angle.
    const choisirMilieu = (id: string) => {
        setMilieu(id);
        const gs = groupesDuMilieu(id);
        if (gs.length === 1) { setGroupe(gs[0]); setEtape(3); }
        else { setGroupe(null); setEtape(2); }
    };

    const choisirGroupe = (g: Groupe) => {
        setGroupe(g);
        setEtape(3);
    };

    const toggleAngle = (a: Dimension) => {
        setAngles(prev => (prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]));
    };

    const conclure = () => {
        if (!groupe) return;
        onResultat(groupe, angles);
        fermer();
    };

    const retour = () => {
        // Revenir depuis l'angle doit ramener au milieu quand l'étape 2 a été sautée.
        if (etape === 3 && milieu && groupesDuMilieu(milieu).length === 1) {
            setGroupe(null);
            setEtape(1);
        } else {
            setEtape(e => e - 1);
        }
    };

    const question = etape === 1
        ? 'De quoi veux-tu leur parler ?'
        : etape === 2 ? 'Plus précisément ?' : 'Qu’est-ce que tu veux travailler ?';

    // Le parcours fait 2 ou 3 étapes selon que le milieu choisi se subdivise ou non.
    const etapeSautee = !!milieu && groupesDuMilieu(milieu).length === 1;
    const nbEtapes = etapeSautee ? 2 : 3;
    const positionEtape = etapeSautee && etape === 3 ? 2 : etape;

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={fermer}
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[70]"
                    />
                    <motion.div
                        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 32, stiffness: 320 }}
                        className="fixed inset-x-0 bottom-0 z-[71] bg-[#EBF0F7] rounded-t-[2rem] max-h-[88vh] flex flex-col shadow-2xl"
                    >
                        <div className="px-5 pt-4 pb-3 flex items-center gap-3 shrink-0">
                            {etape > 1 ? (
                                <button
                                    onClick={retour}
                                    className="size-9 rounded-full bg-white flex items-center justify-center text-slate-500 active:scale-90 transition shrink-0"
                                    aria-label="Retour"
                                >
                                    <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                                </button>
                            ) : <span className="size-9 shrink-0" />}

                            <div className="flex-1 flex gap-1.5">
                                {Array.from({ length: nbEtapes }, (_, i) => (
                                    <span
                                        key={i}
                                        className={clsx(
                                            'h-1.5 flex-1 rounded-full transition-colors duration-300',
                                            i < positionEtape ? 'bg-slate-900' : 'bg-slate-200',
                                        )}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={fermer}
                                className="size-9 rounded-full bg-white flex items-center justify-center text-slate-400 active:scale-90 transition shrink-0"
                                aria-label="Fermer"
                            >
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-5 pb-8">
                            {/* Fil des choix déjà faits — chaque miette ramène directement à son étape. */}
                            {(milieu || groupe) && (
                                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                                    {milieu && (
                                        <button
                                            type="button"
                                            onClick={() => { setGroupe(null); setEtape(1); }}
                                            className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            {MILIEUX.find(m => m.id === milieu)?.label}
                                        </button>
                                    )}
                                    {groupe && (
                                        <>
                                            <span className="material-symbols-outlined text-[14px] text-slate-300">chevron_right</span>
                                            <button
                                                type="button"
                                                onClick={() => setEtape(etapeSautee ? 1 : 2)}
                                                className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
                                            >
                                                {groupe.label}
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}

                            <h2 className="text-xl font-black text-slate-900 leading-tight">{question}</h2>

                            <div className="mt-5 space-y-2">
                                {etape === 1 && MILIEUX.map(m => (
                                    <Ligne
                                        key={m.id}
                                        label={m.label}
                                        detail={m.detail}
                                        icon={m.icon}
                                        onClick={() => choisirMilieu(m.id)}
                                    />
                                ))}

                                {etape === 2 && milieu && groupesDuMilieu(milieu).map(g => (
                                    <Ligne
                                        key={g.id}
                                        label={g.label}
                                        detail={`${g.accroche} · ${g.fiches.length} questions`}
                                        icon={g.icon}
                                        onClick={() => choisirGroupe(g)}
                                    />
                                ))}

                                {etape === 3 && (
                                    <>
                                        <p className="text-xs text-slate-500 leading-relaxed -mt-3 mb-3">
                                            Choisis un ou plusieurs angles — facultatif, tu peux voir toutes les questions du sujet.
                                        </p>
                                        {ANGLES.map(a => {
                                            const pilier = PILLARS.find(p => p.id === a.id);
                                            const actif = angles.includes(a.id);
                                            return (
                                                <Ligne
                                                    key={a.id}
                                                    label={a.label}
                                                    detail={a.detail}
                                                    icon={pilier?.icon}
                                                    accent={pilier?.bg}
                                                    coche={actif}
                                                    onClick={() => toggleAngle(a.id)}
                                                />
                                            );
                                        })}

                                        <button
                                            onClick={conclure}
                                            className="w-full h-14 mt-4 rounded-2xl bg-slate-900 text-white text-xs font-black tracking-[0.15em] uppercase shadow-lg active:scale-[0.98] transition-all"
                                        >
                                            Voir les questions
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function Ligne({
    label, detail, icon, accent, coche, onClick,
}: {
    label: string; detail?: string; icon?: string; accent?: string;
    /** Défini = ligne à cocher (choix multiple) ; absent = ligne de navigation. */
    coche?: boolean;
    onClick: () => void;
}) {
    const multi = coche !== undefined;
    return (
        <button
            onClick={onClick}
            className={clsx(
                'w-full text-left px-4 py-3.5 rounded-2xl bg-white shadow-sm active:scale-[0.99] transition-all flex items-center gap-3',
                // Non coché = état neutre (c'est le point de départ), coché = affirmé.
                multi && coche && 'ring-2 ring-slate-900',
            )}
        >
            {icon && (
                <span className={clsx(
                    'size-10 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                    multi && !coche ? 'bg-[#EBF0F7]' : accent ?? 'bg-[#EBF0F7]',
                )}>
                    <span className={clsx(
                        'material-symbols-outlined text-[20px]',
                        multi && !coche ? 'text-slate-400' : accent ? 'text-white' : 'text-slate-500',
                    )}>
                        {icon}
                    </span>
                </span>
            )}
            <span className="flex-1 min-w-0">
                <span className="block text-sm font-black text-slate-900 leading-snug">{label}</span>
                {detail && <span className="block text-xs text-slate-400 mt-0.5">{detail}</span>}
            </span>
            {multi ? (
                <span className={clsx(
                    'size-6 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                    coche ? 'bg-slate-900 text-white' : 'border-2 border-slate-200',
                )}>
                    {coche && <span className="material-symbols-outlined text-[15px]">check</span>}
                </span>
            ) : (
                <span className="material-symbols-outlined text-slate-300 shrink-0">chevron_right</span>
            )}
        </button>
    );
}

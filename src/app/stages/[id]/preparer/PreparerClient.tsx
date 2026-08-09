'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { PedagogicalContent } from '@/types';
import { PILLARS } from '@/data/etages';
import { actionsPourFiche, actionSujetParId } from '@/data/actions-sujets';
import { PILIERS_ACTION, actionsDuPilier, actionSemaineParId } from '@/data/actions-semaine';
import { groupeDe } from '@/data/groupes';
import OrdreSujets from '@/components/OrdreSujets';
import { updateStagePool } from '@/actions/stage-actions';
import {
    saveAccrocheChoice,
    saveChute,
    saveActions,
    saveActionsSemaine,
    StagePreparation,
} from '@/actions/preparation-actions';

type Props = {
    stageId: string;
    contents: PedagogicalContent[];
    initialPreparations: Record<string, StagePreparation>;
    initialActionsSemaine: string[];
};

/** Au-delà, ce n'est plus un rituel de semaine mais une liste de tâches. */
const MAX_SEMAINE = 2;

/** Hauteur de l'en-tête collant de la page, sous lequel la barre vient se poser. */
const HAUTEUR_ENTETE = 68;

function formulations(c: PedagogicalContent): string[] {
    if (c.accroches_variantes?.length) return c.accroches_variantes;
    if (c.accroche) return [c.accroche];
    return [c.question];
}

function pilierDe(c: PedagogicalContent) {
    const d = (c.dimension ?? '').toUpperCase();
    const cle = d.startsWith('COMPR') ? 'COMPRENDRE' : d.startsWith('OBSERV') ? 'OBSERVER' : 'PROTÉGER';
    return PILLARS.find(p => p.id === cle);
}

/**
 * Le fil de ma semaine.
 *
 * Tous les sujets de la semaine sont déroulés verticalement, à la suite. La version
 * précédente n'en affichait qu'un à la fois, avec une pagination en haut de page : dès
 * qu'on descendait pour choisir une action, le repère sortait de l'écran et on ne savait
 * plus où on en était ni combien il restait. Le scroll continu rend la progression
 * physique, et la barre collante la garde lisible en permanence.
 *
 * Par sujet, deux décisions : par quelle phrase j'ouvre, et ce que je fais faire au
 * groupe. Le reste vient de la fiche — explication, idée fausse à corriger, ce qu'il y a
 * à faire observer, idée à faire retenir.
 *
 * Les actions proposées sont écrites pour la fiche, ou à défaut pour son groupe de
 * phénomène (`src/data/actions-sujets.ts`). Plusieurs versions ont échoué en proposant
 * des listes génériques — techniques d'animation, angles narratifs, amorces de dialogue :
 * formulées pour valoir sur les 131 fiches, elles ne pouvaient qu'énoncer ce qu'un
 * moniteur diplômé sait déjà faire. Ce qui reste légitimement générique — un rituel tenu
 * toute la semaine — est remonté au niveau du stage (`src/data/actions-semaine.ts`) et
 * vit dans une feuille, hors du flux.
 *
 * L'ambre est la couleur de la transmission dans COPUN (`CardDetailModal`, bloc « Comment
 * en parler aux enfants ») : elle marque ici tout ce qui se dit au groupe.
 */
export default function PreparerClient({
    stageId,
    contents,
    initialPreparations,
    initialActionsSemaine,
}: Props) {
    const [preps, setPreps] = useState(initialPreparations);
    /**
     * Ordre des sujets, tenu localement : le réordonnancement doit être immédiat, et
     * `revalidatePath` ne rafraîchit pas cette liste tant que la navigation reste sur
     * place.
     */
    const [ordre, setOrdre] = useState(contents);
    const [semaine, setSemaine] = useState<string[]>(initialActionsSemaine);
    const [ouvrirSemaine, setOuvrirSemaine] = useState(false);
    /** Sujet actuellement à l'écran, déduit du défilement. */
    const [courant, setCourant] = useState(0);
    /**
     * Échec d'enregistrement. Les choix sont appliqués localement avant la réponse du
     * serveur ; sans ce garde-fou, un échec laissait le choix affiché alors que rien
     * n'était parti en base.
     */
    const [echec, setEchec] = useState<string | null>(null);

    const sections = useRef<(HTMLElement | null)[]>([]);

    /**
     * Suit le sujet visible pour tenir la barre à jour.
     *
     * Le seuil est placé sous l'en-tête plutôt qu'au centre de l'écran : un sujet devient
     * « courant » dès que son titre passe sous la barre, ce qui correspond à ce que le
     * moniteur est en train de lire.
     */
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                const visibles = entries
                    .filter(e => e.isIntersecting)
                    .map(e => Number((e.target as HTMLElement).dataset.rang));
                if (visibles.length) setCourant(Math.min(...visibles));
            },
            { rootMargin: `-${HAUTEUR_ENTETE + 48}px 0px -55% 0px` },
        );

        sections.current.forEach(el => el && observer.observe(el));
        return () => observer.disconnect();
    }, [ordre]);

    const maj = (contentId: string, patch: Partial<StagePreparation>) => {
        setPreps(p => {
            const base: StagePreparation = p[contentId] ?? {
                pedagogical_content_id: contentId, accroche_choisie: null, chute: null, actions: [],
            };
            return { ...p, [contentId]: { ...base, ...patch } };
        });
    };

    const allerAu = (i: number) => {
        const el = sections.current[i];
        if (!el) return;
        const haut = el.getBoundingClientRect().top + window.scrollY - HAUTEUR_ENTETE - 56;
        window.scrollTo({ top: Math.max(haut, 0), behavior: 'smooth' });
    };

    const choisirAccroche = async (c: PedagogicalContent, texte: string) => {
        const avant = preps[c.id]?.accroche_choisie ?? null;
        maj(c.id, { accroche_choisie: texte, chute: c.a_retenir ?? null });
        setEchec(null);

        const r = await saveAccrocheChoice(stageId, c.id, texte);
        if (!r.success) {
            maj(c.id, { accroche_choisie: avant });
            setEchec(r.error ?? 'Enregistrement impossible.');
            return;
        }
        if (c.a_retenir) await saveChute(stageId, c.id, c.a_retenir);
    };

    const basculer = async (c: PedagogicalContent, id: string) => {
        const avant = preps[c.id]?.actions ?? [];
        const suivant = avant.includes(id) ? avant.filter(a => a !== id) : [...avant, id];
        maj(c.id, { actions: suivant });
        setEchec(null);

        const r = await saveActions(stageId, c.id, suivant);
        if (!r.success) {
            maj(c.id, { actions: avant });
            setEchec(r.error ?? 'Enregistrement impossible.');
        }
    };

    const reordonner = async (ids: string[]) => {
        const avant = ordre;
        const suivant = ids
            .map(id => ordre.find(c => c.id === id))
            .filter((c): c is PedagogicalContent => !!c);

        setOrdre(suivant);
        setEchec(null);

        const r = await updateStagePool(stageId, ids);
        if (!r.success) {
            setOrdre(avant);
            setEchec(r.error ?? 'Réorganisation non enregistrée.');
        }
    };

    const basculerSemaine = async (id: string) => {
        const avant = semaine;
        const suivant = semaine.includes(id)
            ? semaine.filter(a => a !== id)
            : [...semaine, id].slice(-MAX_SEMAINE);
        setSemaine(suivant);
        setEchec(null);

        const r = await saveActionsSemaine(stageId, suivant);
        if (!r.success) {
            setSemaine(avant);
            setEchec(r.error ?? 'Enregistrement impossible.');
        }
    };

    if (ordre.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4 pb-32">
                <span className="material-symbols-outlined text-5xl text-slate-300">menu_book</span>
                <p className="text-slate-900 font-black">Rien à préparer</p>
                <p className="text-slate-500 text-sm max-w-xs">Choisissez d&apos;abord les sujets de votre semaine.</p>
                <Link href={`/stages/${stageId}/program`} className="mt-2 px-5 py-3 bg-slate-900 text-white rounded-xl font-black text-sm">
                    Choisir mes sujets
                </Link>
            </div>
        );
    }

    const prets = ordre.filter(c => preps[c.id]?.accroche_choisie).length;

    return (
        <div className="flex-1 flex flex-col">

            {/* ══ LA BARRE — reste visible pendant tout le défilement ══ */}
            <div
                className="sticky z-30 bg-background/95 backdrop-blur-sm border-b border-slate-200/70"
                style={{ top: HAUTEUR_ENTETE }}
            >
                <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center gap-3">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        {ordre.map((c, i) => (
                            <button
                                key={c.id}
                                onClick={() => allerAu(i)}
                                aria-label={`Aller au sujet ${i + 1}`}
                                aria-current={i === courant}
                                className="flex-1 h-1.5 rounded-full transition-colors relative"
                            >
                                <span className={clsx(
                                    'absolute inset-0 rounded-full transition-colors',
                                    i === courant ? 'bg-indigo-600'
                                        : preps[c.id]?.accroche_choisie ? 'bg-indigo-200' : 'bg-slate-200',
                                )} />
                            </button>
                        ))}
                    </div>
                    <span className="text-[11px] font-black text-slate-400 tabular-nums shrink-0">
                        {courant + 1}/{ordre.length}
                    </span>
                </div>
            </div>

            <div className="max-w-2xl mx-auto w-full px-4 pb-32">

                {echec && (
                    <div role="alert" className="mt-4 rounded-2xl bg-red-50 border border-red-200 px-5 py-4 flex items-start gap-3">
                        <span className="material-symbols-outlined text-red-600 text-[20px] shrink-0">cloud_off</span>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-red-900 uppercase tracking-widest">Choix non enregistré</p>
                            <p className="text-[13px] font-medium text-red-800 leading-relaxed mt-1">{echec}</p>
                        </div>
                        <button
                            onClick={() => setEchec(null)}
                            aria-label="Masquer l’alerte"
                            className="size-7 rounded-full hover:bg-white/70 flex items-center justify-center text-red-400 hover:text-red-700 transition-colors shrink-0"
                        >
                            <span className="material-symbols-outlined text-[17px]">close</span>
                        </button>
                    </div>
                )}

                <div className="mt-5">
                    <OrdreSujets contents={ordre} onReordonner={reordonner} repliable />
                </div>

                {/* ══ LES SUJETS, À LA SUITE ══ */}
                {ordre.map((c, i) => (
                    <Sujet
                        key={c.id}
                        ref={el => { sections.current[i] = el; }}
                        rang={i}
                        total={ordre.length}
                        content={c}
                        prep={preps[c.id]}
                        onChoisirAccroche={t => choisirAccroche(c, t)}
                        onBasculer={id => basculer(c, id)}
                    />
                ))}

                {/* Le rituel de semaine reste hors du flux — c'est un réglage de stage, pas
                    une étape par sujet — mais il doit se voir. */}
                <button
                    onClick={() => setOuvrirSemaine(true)}
                    className={clsx(
                        'w-full flex items-center gap-3 mt-10 rounded-2xl px-5 py-4 text-left transition-all active:scale-[0.99]',
                        semaine.length === 0
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                            : 'bg-white border border-indigo-200',
                    )}
                >
                    <span className={clsx(
                        'material-symbols-outlined text-[22px] shrink-0',
                        semaine.length === 0 ? 'text-white/70' : 'text-indigo-600',
                    )}>
                        repeat
                    </span>
                    <span className="flex-1 min-w-0">
                        <span className={clsx(
                            'block text-[10px] font-black uppercase tracking-widest',
                            semaine.length === 0 ? 'text-white/60' : 'text-indigo-500',
                        )}>
                            Pour toute la semaine
                        </span>
                        <span className={clsx(
                            'block text-[15px] font-black leading-snug mt-0.5',
                            semaine.length === 0 ? 'text-white' : 'text-slate-900',
                        )}>
                            {semaine.length === 0
                                ? 'Choisir un rituel à tenir chaque jour'
                                : semaine.map(id => actionSemaineParId(id)?.label).filter(Boolean).join(' · ')}
                        </span>
                    </span>
                    <span className={clsx(
                        'material-symbols-outlined text-[20px] shrink-0',
                        semaine.length === 0 ? 'text-white/60' : 'text-indigo-300',
                    )}>
                        chevron_right
                    </span>
                </button>

                <div className="mt-6 flex items-center gap-2.5">
                    <Link
                        href={`/stages/${stageId}/program`}
                        className="h-[52px] px-5 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-[14px] font-black text-slate-500 active:scale-95 transition shrink-0"
                    >
                        Mes sujets
                    </Link>
                    <Link
                        href="/stages"
                        className="flex-1 h-[52px] rounded-2xl bg-slate-900 text-white text-[15px] font-black active:scale-[0.98] transition flex items-center justify-center gap-2"
                    >
                        {prets === ordre.length ? 'Terminé' : `${prets}/${ordre.length} préparés`}
                        <span className="material-symbols-outlined text-[19px]">check</span>
                    </Link>
                </div>
            </div>

            <FeuilleSemaine
                ouverte={ouvrirSemaine}
                onFermer={() => setOuvrirSemaine(false)}
                retenues={semaine}
                onBasculer={basculerSemaine}
            />
        </div>
    );
}

/** Un sujet du stage : le contenu de la fiche, puis les deux décisions du moniteur. */
function Sujet({
    ref,
    rang,
    total,
    content,
    prep,
    onChoisirAccroche,
    onBasculer,
}: {
    ref: (el: HTMLElement | null) => void;
    rang: number;
    total: number;
    content: PedagogicalContent;
    prep?: StagePreparation;
    onChoisirAccroche: (texte: string) => void;
    onBasculer: (id: string) => void;
}) {
    const [changeAccroche, setChangeAccroche] = useState(false);

    const choisie = prep?.accroche_choisie ?? null;
    const actions = prep?.actions ?? [];
    const pilier = pilierDe(content);
    const proposees = actionsPourFiche(content.actions, groupeDe(content.id)?.id);
    const retenues = actions
        .map(id => actionSujetParId(id, content.actions))
        .filter((a): a is NonNullable<typeof a> => !!a);
    const restantes = proposees.filter(a => !actions.includes(a.id));
    const variantes = formulations(content);

    return (
        <section ref={ref} data-rang={rang} className="pt-10">

            <div className="flex items-center gap-2.5 mb-4">
                <span className={clsx(
                    'size-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0',
                    choisie ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500',
                )}>
                    {choisie ? '✓' : rang + 1}
                </span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Sujet {rang + 1} sur {total}
                </span>
                <span className="flex-1 h-px bg-slate-200/70" />
            </div>

            <span className={clsx('text-[10px] font-black uppercase tracking-widest', pilier?.color)}>
                {pilier?.label}
            </span>
            <h2 className="text-[24px] font-black text-slate-900 leading-[1.15] mt-1.5 text-balance">
                {content.question}
            </h2>
            {content.explication && (
                <p className="text-[15px] font-medium text-slate-500 leading-relaxed mt-3">
                    {content.explication}
                </p>
            )}

            {content.erreur_frequente && (
                <div className="mt-5 rounded-2xl bg-white border border-slate-200/80 p-5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
                        L&apos;idée fausse à corriger
                    </span>
                    <p className="text-[14px] font-medium text-slate-600 leading-relaxed">
                        {content.erreur_frequente}
                    </p>
                </div>
            )}

            {/* ══ CE QUE JE VAIS DIRE ══
                Le cadre distingue trois natures de contenu, pas une seule teinte plate :
                - DÉCIDÉ (accroche choisie, actions retenues) : carte blanche nette, c'est
                  le cœur vivant du bloc, ce que le moniteur a produit ;
                - À CHOISIR : contour pointillé fin, clairement « pas encore rempli » ;
                - DONNÉ PAR LA FICHE (à observer, à retenir) : texte simple sans carte,
                  posé sur le fond ambre — c'est du contexte à lire, pas un choix à faire. */}
            <div className="mt-6 rounded-2xl bg-white border border-amber-100 shadow-sm shadow-amber-900/5 overflow-hidden">
                <div className="flex items-center gap-2 px-6 pt-5 pb-4 bg-amber-50/70 border-b border-amber-100">
                    <span className="material-symbols-outlined text-amber-600 text-[20px]">record_voice_over</span>
                    <h3 className="text-xs font-black text-amber-900 uppercase tracking-widest">
                        Ce que je vais dire
                    </h3>
                </div>

                <div className="px-6 py-5 space-y-5">

                    {/* J'ouvre avec — décision 1 */}
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                            J&apos;ouvre avec
                        </span>

                        {choisie && !changeAccroche ? (
                            <button
                                onClick={() => setChangeAccroche(true)}
                                className="group w-full text-left rounded-xl bg-amber-50 border-l-4 border-amber-500 px-4 py-3.5"
                            >
                                <p className="text-[18px] font-bold text-amber-950 leading-[1.4] italic">
                                    «&nbsp;{choisie}&nbsp;»
                                </p>
                                <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-600/70 group-hover:text-amber-800 uppercase tracking-widest mt-1.5 transition-colors">
                                    <span className="material-symbols-outlined text-[13px]">edit</span>
                                    Changer
                                </span>
                            </button>
                        ) : (
                            <div className="space-y-2">
                                {variantes.map((v, i) => (
                                    <CartePop key={v} delai={i * 0.06}>
                                        <BoutonChoix onClick={() => { onChoisirAccroche(v); setChangeAccroche(false); }}>
                                            «&nbsp;{v}&nbsp;»
                                        </BoutonChoix>
                                    </CartePop>
                                ))}
                                {choisie && (
                                    <button
                                        onClick={() => setChangeAccroche(false)}
                                        className="text-[11px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors pt-1"
                                    >
                                        Annuler
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Je leur fais observer — donné par la fiche */}
                    {content.a_observer && (
                        <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
                                Je leur fais observer
                            </span>
                            <p className="text-[15px] font-semibold text-slate-700 leading-relaxed">{content.a_observer}</p>
                        </div>
                    )}

                    {/* Je leur fais faire — décision 2, choix et résultat au même endroit :
                        avant, les propositions vivaient hors du cadre, plus bas dans la
                        page, pendant que le résultat s'affichait ici. */}
                    {choisie && proposees.length > 0 && (
                        <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                                Je leur fais faire
                            </span>

                            <AnimatePresence initial={false}>
                                {retenues.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="space-y-2 pb-2">
                                            {retenues.map(a => (
                                                <motion.div
                                                    key={a.id}
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.85 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                                                    className="flex items-start gap-3 rounded-xl bg-amber-50 border-l-4 border-amber-500 px-4 py-3.5"
                                                >
                                                    <p className="flex-1 text-[15px] font-bold text-amber-950 leading-snug">
                                                        {a.consigne}
                                                    </p>
                                                    <button
                                                        onClick={() => onBasculer(a.id)}
                                                        aria-label={`Retirer : ${a.label}`}
                                                        className="size-6 rounded-full hover:bg-white/70 flex items-center justify-center text-amber-500/60 hover:text-amber-800 transition-colors shrink-0"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">close</span>
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {restantes.length > 0 && (
                                <div className="space-y-2">
                                    {retenues.length === 0 && (
                                        <p className="text-[11px] font-semibold text-slate-400 mb-1">
                                            Touchez une ou plusieurs propositions.
                                        </p>
                                    )}
                                    {restantes.map((a, i) => (
                                        <CartePop key={a.id} delai={i * 0.06}>
                                            <BoutonChoix onClick={() => onBasculer(a.id)} compact>
                                                {a.consigne}
                                            </BoutonChoix>
                                        </CartePop>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Ils repartent avec — donné par la fiche */}
                    {content.a_retenir && (
                        <div className="pt-1 border-t border-slate-100">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 mt-4">
                                Ils repartent avec
                            </span>
                            <p className="text-[15px] font-semibold text-slate-700 leading-relaxed">{content.a_retenir}</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

/**
 * Fait entrer son contenu avec un petit rebond, en escalier avec les cartes voisines
 * (`delai`) — le mouvement dit « je suis une option à considérer », pas un bloc de texte
 * figé posé sur la page. Reste discret : quelques degrés d'amplitude, pas un effet de jeu.
 */
function CartePop({ children, delai = 0 }: { children: React.ReactNode; delai?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 16, delay: delai }}
        >
            {children}
        </motion.div>
    );
}

/**
 * Une proposition à choisir dans « Ce que je vais dire » — accroche ou action.
 *
 * Le clic déclenche un aller-retour d'échelle très bref (bounce) avant que la carte ne
 * disparaisse de la liste : la confirmation se sent physiquement, pas seulement lue.
 */
function BoutonChoix({
    children,
    onClick,
    compact = false,
}: {
    children: React.ReactNode;
    onClick: () => void;
    compact?: boolean;
}) {
    const [pris, setPris] = useState(false);

    return (
        <motion.button
            type="button"
            onClick={() => { setPris(true); setTimeout(onClick, 140); }}
            animate={pris ? { scale: [1, 1.06, 0.9] } : { scale: 1 }}
            transition={{ duration: 0.16 }}
            className={clsx(
                'w-full text-left rounded-xl bg-white border-2 border-dashed border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 transition-colors active:scale-[0.98]',
                compact ? 'px-4 py-3' : 'px-4 py-3.5',
            )}
        >
            <span className={clsx(
                'block font-semibold text-slate-600 leading-[1.45]',
                compact ? 'text-[14px]' : 'text-[16px] italic',
            )}>
                {children}
            </span>
        </motion.button>
    );
}

/**
 * Les rituels de semaine, dans une feuille montante.
 *
 * Ce choix se fait une seule fois pour tout le stage : le laisser dans le flux de
 * préparation en faisait un obstacle massif à franchir avant d'arriver au contenu, alors
 * qu'il n'est consulté qu'exceptionnellement.
 */
function FeuilleSemaine({
    ouverte,
    onFermer,
    retenues,
    onBasculer,
}: {
    ouverte: boolean;
    onFermer: () => void;
    retenues: string[];
    onBasculer: (id: string) => void;
}) {
    return (
        <AnimatePresence>
            {ouverte && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onFermer}
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[70]"
                    />
                    <motion.div
                        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 32, stiffness: 320 }}
                        className="fixed inset-x-0 bottom-0 z-[71] bg-background rounded-t-[2rem] max-h-[80vh] flex flex-col shadow-2xl"
                    >
                        <div className="px-5 pt-5 pb-3 flex items-start gap-3 shrink-0">
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Pour toute la semaine
                                </p>
                                <p className="text-lg font-black text-slate-900 leading-tight">
                                    Un rituel tenu chaque jour
                                </p>
                                <p className="text-[12px] font-bold text-slate-400 mt-0.5">
                                    {retenues.length}/{MAX_SEMAINE} retenu{retenues.length > 1 ? 's' : ''}
                                </p>
                            </div>
                            <button
                                onClick={onFermer}
                                aria-label="Fermer"
                                className="size-9 rounded-full bg-white flex items-center justify-center text-slate-400 active:scale-90 transition shrink-0"
                            >
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-5 pb-8 space-y-5">
                            {PILIERS_ACTION.map(p => {
                                const pil = PILLARS.find(x => x.id === p);
                                return (
                                    <div key={p}>
                                        <span className={clsx(
                                            'text-[10px] font-black uppercase tracking-widest block mb-2',
                                            pil?.color ?? 'text-slate-400',
                                        )}>
                                            {p}
                                        </span>
                                        <div className="space-y-2">
                                            {actionsDuPilier(p).map(a => {
                                                const prise = retenues.includes(a.id);
                                                return (
                                                    <button
                                                        key={a.id}
                                                        onClick={() => onBasculer(a.id)}
                                                        aria-pressed={prise}
                                                        className={clsx(
                                                            'w-full text-left rounded-xl px-4 py-3 transition-all active:scale-[0.99]',
                                                            prise
                                                                ? 'bg-indigo-600 text-white'
                                                                : 'bg-white text-slate-800 shadow-sm hover:shadow',
                                                        )}
                                                    >
                                                        <span className="block text-[14px] font-black">{a.label}</span>
                                                        <span className={clsx(
                                                            'block text-[13px] font-medium leading-relaxed mt-0.5',
                                                            prise ? 'text-white/70' : 'text-slate-500',
                                                        )}>
                                                            {a.consigne}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

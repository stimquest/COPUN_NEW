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
import { AccrocheFormee, FORMES_ACCROCHE } from '@/data/formes-accroche';
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

function formulations(c: PedagogicalContent): Array<AccrocheFormee | { texte: string }> {
    if (c.accroches_formes?.length) return c.accroches_formes;
    if (c.accroches_variantes?.length) return c.accroches_variantes.map(texte => ({ texte }));
    if (c.accroche) return [{ texte: c.accroche }];
    return [{ texte: c.question }];
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

                {/* ══ SI VOUS VOULEZ ALLER PLUS LOIN ══
                    Facultatif, et présenté comme tel : pas de bouton plein indigo en fin de
                    page — le traitement d'une étape obligatoire — mais une suggestion posée à
                    plat, qu'on peut traverser sans rien faire. L'outil propose des idées
                    d'animation, il n'impose pas un rituel de plus à tenir. */}
                <div className="mt-12 pt-6 border-t border-slate-200/70">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Si vous voulez aller plus loin
                    </p>
                    <p className="text-[14px] font-medium text-slate-500 leading-relaxed mt-1.5">
                        Certains moniteurs tiennent un même petit geste chaque jour de la semaine.
                        C&apos;est une idée à prendre ou à laisser — votre programme est complet sans.
                    </p>

                    {semaine.length > 0 && (
                        <div className="space-y-2 mt-4">
                            {semaine.map(id => {
                                const rituel = actionSemaineParId(id);
                                if (!rituel) return null;
                                return (
                                    <div
                                        key={id}
                                        className="flex items-start gap-3 rounded-xl bg-white border border-slate-200 px-4 py-3.5"
                                    >
                                        <span className="material-symbols-outlined text-slate-400 text-[19px] mt-0.5 shrink-0">
                                            repeat
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[14px] font-bold text-slate-800 leading-snug">
                                                {rituel.label}
                                            </p>
                                            <p className="text-[13px] font-medium text-slate-500 leading-relaxed mt-0.5">
                                                {rituel.consigne}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => basculerSemaine(id)}
                                            aria-label={`Retirer : ${rituel.label}`}
                                            className="size-6 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-300 hover:text-slate-600 transition-colors shrink-0"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">close</span>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <button
                        onClick={() => setOuvrirSemaine(true)}
                        className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-black text-slate-500 hover:text-slate-800 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[17px]">
                            {semaine.length > 0 ? 'edit' : 'add'}
                        </span>
                        {semaine.length > 0 ? 'Changer' : 'Voir les idées de rituel'}
                    </button>
                </div>

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
    /**
     * Les propositions restent repliées tant que le moniteur ne les demande pas : un sujet
     * qui s'ouvre en déballant ses trois formulations donne une page à trier, alors que
     * l'emplacement vide pose une décision à prendre — plus court à lire, plus clair à faire.
     */
    const [deplie, setDeplie] = useState(false);
    const [deplieActions, setDeplieActions] = useState(false);
    /**
     * Rappel des quatre formes d'accroche (voir `formes-accroche.ts`), facultatif et
     * escamotable : le pont vers la formation, sans jamais s'imposer entre le moniteur et
     * ses variantes. Fermé par défaut à chaque nouvelle ouverture du choix — un rappel
     * qu'on doit redemander plutôt qu'un état qui traînerait sujet après sujet.
     */
    const [voirFormes, setVoirFormes] = useState(false);

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

            {/* ══ LE DÉROULÉ DE LA SÉANCE ══
                Deux cadres ambre pour les deux moments qui demandent une décision (j'ouvre,
                je leur fais faire) ; entre et après, ce que la fiche fournit déjà — observer,
                repartir avec — en texte simple hors cadre. Un seul cadre englobant les
                quatre faisait deux écrans de haut et rangeait sous « ce que je vais dire »
                des choses qui ne se disent pas.

                Trois natures de contenu, trois traitements :
                - DÉCIDÉ (accroche choisie, actions retenues) : carte ambre à liseré plein ;
                - À CHOISIR : emplacement vide en pointillé ambre, puis propositions en
                  cartes blanches à trait plein — le pointillé ambre ne désigne que le trou ;
                - DONNÉ PAR LA FICHE : texte simple, sans carte, avec une icône. */}
            <div className="mt-6">
                <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Le fil de la séance</p>
                <div className="relative space-y-5 border-l-2 border-slate-200 pl-5">
                    <div className="relative">
                        <span className="absolute -left-[31px] top-0 size-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[16px]">record_voice_over</span>
                        </span>
                        <h3 className="pb-2 text-[10px] font-black text-amber-700 uppercase tracking-widest">J&apos;ouvre avec</h3>

                    {/* J'ouvre avec — décision 1 */}
                    <div>
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
                        ) : !deplie ? (
                            <EmplacementVide
                                invite="Choisir mon accroche"
                                nombre={variantes.length}
                                onClick={() => setDeplie(true)}
                            />
                        ) : (
                            <div className="space-y-2">
                                {/* Le pont vers la formation : un rappel très court au moment
                                    du choix. Les exemples sont volontairement absents : les
                                    propositions de la fiche, juste après, jouent ce rôle. */}
                                {voirFormes ? (
                                    <RappelFormes onFermer={() => setVoirFormes(false)} />
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setVoirFormes(true)}
                                        className="w-full flex items-center gap-2.5 rounded-xl bg-amber-100 px-4 py-3 active:scale-[0.99] transition-all"
                                    >
                                        <span className="size-8 rounded-lg bg-white flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-amber-600 text-[18px]">lightbulb</span>
                                        </span>
                                        <span className="flex-1 min-w-0 text-left">
                                            <span className="block text-[13px] font-black text-amber-900">
                                                Revoir les formes qui marchent
                                            </span>
                                            <span className="block text-[11px] text-amber-700/70">
                                                Le pari, le piège, le constat, le choix forcé
                                            </span>
                                        </span>
                                        <span className="material-symbols-outlined text-amber-400 shrink-0">chevron_right</span>
                                    </button>
                                )}

                                {variantes.map((v, i) => (
                                    <CartePop key={v.texte} delai={i * 0.06}>
                                        <BoutonChoix onClick={() => {
                                            onChoisirAccroche(v.texte);
                                            setChangeAccroche(false);
                                            setDeplie(false);
                                            setVoirFormes(false);
                                        }}>
                                            {'forme' in v && (
                                                <span className="mb-1.5 block text-[9px] font-black uppercase tracking-widest text-amber-600">
                                                    {FORMES_ACCROCHE.find(f => f.id === v.forme)?.nom}
                                                </span>
                                            )}
                                            «&nbsp;{v.texte}&nbsp;»
                                        </BoutonChoix>
                                    </CartePop>
                                ))}
                                <BoutonRefermer
                                    onClick={() => { setChangeAccroche(false); setDeplie(false); setVoirFormes(false); }}
                                    libelle="Annuler"
                                    valide={false}
                                />
                            </div>
                        )}
                    </div>
                    </div>

            {/* Je leur fais observer — donné par la fiche, hors cadre : ce n'est pas une
                décision à prendre, et ça n'a jamais relevé de « ce que je vais dire ». */}
            {content.a_observer && (
                <div className="relative flex items-start gap-3">
                    <span className="absolute -left-[31px] top-0 size-7 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                    </span>
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                            Je leur fais observer
                        </span>
                        <p className="text-[15px] font-semibold text-slate-700 leading-relaxed">{content.a_observer}</p>
                    </div>
                </div>
            )}

            {/* Je leur fais faire — décision 2, dans son propre cadre : c'est un second
                moment de séance, pas une suite de la parole d'ouverture. */}
            {choisie && proposees.length > 0 && (
                <div className="relative">
                    <span className="absolute -left-[31px] top-0 size-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[16px]">back_hand</span>
                    </span>
                    <h3 className="pb-2 text-[10px] font-black text-amber-700 uppercase tracking-widest">Je leur fais faire</h3>
                        {/* Pas d'animation de hauteur sur le conteneur : combinée au `layout`
                            des cartes, elle laissait la hauteur se figer avant la fin de la
                            transition et le texte débordait du cadre. Chaque carte porte sa
                            propre entrée, ça suffit. */}
                        {retenues.length > 0 && (
                            <div className="space-y-2 pb-2">
                                {retenues.map(a => (
                                    <motion.div
                                        key={a.id}
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
                        )}

                        {restantes.length > 0 && (
                            deplieActions ? (
                                <div className="space-y-2">
                                    {restantes.map((a, i) => (
                                        <CartePop key={a.id} delai={i * 0.06}>
                                            <BoutonChoix onClick={() => onBasculer(a.id)} compact>
                                                {a.consigne}
                                            </BoutonChoix>
                                        </CartePop>
                                    ))}
                                    <BoutonRefermer
                                        onClick={() => setDeplieActions(false)}
                                        libelle={retenues.length > 0 ? 'Terminé' : 'Annuler'}
                                        valide={retenues.length > 0}
                                    />
                                </div>
                            ) : (
                                <EmplacementVide
                                    invite={retenues.length > 0 ? 'Ajouter une autre activité' : 'Choisir une activité'}
                                    nombre={restantes.length}
                                    onClick={() => setDeplieActions(true)}
                                />
                            )
                        )}
                </div>
            )}

            {/* Ils repartent avec — la conclusion du sujet, donnée par la fiche. Sortie du
                cadre pour la même raison que « je leur fais observer ». */}
            {content.a_retenir && (
                <div className="relative flex items-start gap-3">
                    <span className="absolute -left-[31px] top-0 size-7 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[16px]">backpack</span>
                    </span>
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                            Ils repartent avec
                        </span>
                        <p className="text-[15px] font-semibold text-slate-700 leading-relaxed">{content.a_retenir}</p>
                    </div>
                </div>
            )}
                </div>
            </div>

            {(content.explication || content.erreur_frequente) && (
                <details className="mt-7 rounded-2xl bg-white/70 border border-slate-200/80 group">
                    <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3.5 text-[12px] font-black text-slate-500">
                        <span className="material-symbols-outlined text-[17px] text-slate-400">menu_book</span>
                        Pour moi, avant la séance
                        <span className="material-symbols-outlined ml-auto text-slate-400 transition-transform group-open:rotate-180">expand_more</span>
                    </summary>
                    <div className="space-y-4 border-t border-slate-100 px-4 py-4">
                        {content.explication && (
                            <p className="text-[14px] font-medium text-slate-600 leading-relaxed">{content.explication}</p>
                        )}
                        {content.erreur_frequente && (
                            <div className="border-l-2 border-slate-200 pl-3">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">L&apos;idée fausse à corriger</span>
                                <p className="text-[13px] font-medium text-slate-600 leading-relaxed">{content.erreur_frequente}</p>
                            </div>
                        )}
                    </div>
                </details>
            )}
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
 * Referme une liste de propositions dépliée.
 *
 * Dessiné comme un bouton — fond, bordure, hauteur de frappe — et non comme le libellé gris
 * en petites capitales qu'il était : posé sous une liste, ce libellé se lisait comme un
 * titre de section alors qu'il portait la seule action permettant de refermer le bloc.
 */
function BoutonRefermer({
    onClick,
    libelle,
    valide,
}: {
    onClick: () => void;
    libelle: string;
    valide: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={clsx(
                'mt-1 inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[12px] font-black transition-colors active:scale-[0.97]',
                valide
                    ? 'bg-amber-500 text-white hover:bg-amber-600'
                    : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300',
            )}
        >
            {valide && <span className="material-symbols-outlined text-[15px]">check</span>}
            {libelle}
        </button>
    );
}

/**
 * Le trou à combler — un emplacement vide, en pointillé, qui montre qu'une décision manque
 * ici et déplie les propositions au clic.
 *
 * Il occupe la place que prendra le choix une fois fait : la carte ne se réorganise pas
 * sous les yeux du moniteur, elle se remplit. Le halo qui pulse lentement signale que c'est
 * l'endroit où agir sans réclamer l'attention comme le ferait une couleur vive.
 */
function EmplacementVide({
    invite,
    nombre,
    onClick,
}: {
    invite: string;
    nombre: number;
    onClick: () => void;
}) {
    return (
        <motion.button
            type="button"
            onClick={onClick}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.985 }}
            className="group w-full flex items-center gap-3 rounded-xl border-2 border-dashed border-amber-300/70 bg-amber-50/30 hover:bg-amber-50/70 hover:border-amber-400 px-4 py-4 transition-colors"
        >
            <motion.span
                animate={{ scale: [1, 1.12, 1], opacity: [0.75, 1, 0.75] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                className="size-7 rounded-full bg-amber-100 flex items-center justify-center shrink-0"
            >
                <span className="material-symbols-outlined text-amber-600 text-[17px]">add</span>
            </motion.span>
            <span className="flex-1 text-left text-[15px] font-bold text-amber-900/70 group-hover:text-amber-900 transition-colors">
                {invite}
            </span>
            <span className="text-[11px] font-black text-amber-600/60 uppercase tracking-widest shrink-0">
                {nombre} propositions
            </span>
        </motion.button>
    );
}

/**
 * Rappel des quatre formes d'accroche, entre le module de formation et le choix concret
 * d'une variante — voir `formes-accroche.ts` pour pourquoi ces formes ne servent pas à
 * classer les variantes automatiquement.
 *
 * Il ne donne pas les exemples de la formation : les propositions réelles de la fiche
 * viennent juste après. Il sert seulement de boussole avant le choix.
 */
function RappelFormes({ onFermer }: { onFermer: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl bg-amber-50/70 border border-amber-100 p-3 overflow-hidden"
        >
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">
                    Quatre formes qui marchent
                </p>
                <button
                    type="button"
                    onClick={onFermer}
                    aria-label="Masquer le rappel"
                    className="text-amber-400 hover:text-amber-700 transition-colors"
                >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
            </div>
            <div className="space-y-2.5 mt-2.5">
                {FORMES_ACCROCHE.map(f => (
                    <div key={f.id} className="text-[12px] leading-snug">
                        <p className="font-black text-amber-900">{f.nom}</p>
                        <p className="text-amber-700/70 text-[11.5px] mt-0.5">
                            {f.pourquoi}
                        </p>
                    </div>
                ))}
            </div>
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
                // Trait plein, jamais pointillé : le pointillé ambre est le vocabulaire de
                // l'emplacement vide (« il manque une décision ici »). L'employer aussi sur
                // les propositions faisait lire la carte survolée comme déjà choisie.
                'w-full text-left rounded-xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all active:scale-[0.98]',
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
 * Le catalogue d'idées de geste quotidien, dans une feuille montante.
 *
 * Ce choix se fait une seule fois pour tout le stage, et il est facultatif : le laisser
 * dans le flux de préparation en faisait un obstacle massif à franchir avant d'arriver au
 * contenu, alors qu'il n'est consulté qu'exceptionnellement. La feuille est ouverte depuis
 * une suggestion, jamais imposée au passage.
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
                                    Facultatif
                                </p>
                                <p className="text-lg font-black text-slate-900 leading-tight">
                                    Des idées de geste quotidien
                                </p>
                                {/* Pas de compteur « 0/2 retenu » quand rien n'est pris : un
                                    quota affiché sur une liste facultative se lit comme un
                                    objectif manqué. */}
                                <p className="text-[12px] font-bold text-slate-400 mt-0.5">
                                    {retenues.length === 0
                                        ? `À piocher si l'envie vous en dit — ${MAX_SEMAINE} au maximum`
                                        : `${retenues.length}/${MAX_SEMAINE} retenu${retenues.length > 1 ? 's' : ''}`}
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

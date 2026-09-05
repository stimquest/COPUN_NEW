'use client';

import { useId, useState, useTransition } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { PedagogicalContent, Dimension } from '@/types';
import { PILLARS } from '@/data/etages';
import { StagePreparation, toggleSujetRaconte } from '@/actions/preparation-actions';
import { actionSujetParId, ActionSujet } from '@/data/actions-sujets';
import { actionSemaineParId } from '@/data/actions-semaine';
import { niveauRepere } from '@/data/niveaux';

type Props = {
    stageId: string;
    contents: PedagogicalContent[];
    preparations: Record<string, StagePreparation>;
    /** Lecture seule sur le bilan clôturé : plus de rature possible, l'historique est figé. */
    readOnly?: boolean;
    /** Rituels transversaux choisis pour la semaine (`src/data/actions-semaine.ts`). */
    actionsSemaine?: string[];
};

/** Teintes pleines des paliers — la carte entière s'y baigne, d'où des valeurs brutes. */
const TEINTE: Record<Dimension, { vif: string; sombre: string }> = {
    COMPRENDRE: { vif: '#f59e0b', sombre: '#7c4a03' },
    OBSERVER: { vif: '#2563eb', sombre: '#16307a' },
    PROTÉGER: { vif: '#10b981', sombre: '#065f46' },
};

const PAS_PILE = 60;
const HAUTEUR_CARTE = 460;

function pilierDe(c: PedagogicalContent) {
    const d = (c.dimension ?? '').toUpperCase();
    const cle = d.startsWith('COMPR') ? 'COMPRENDRE' : d.startsWith('OBSERV') ? 'OBSERVER' : 'PROTÉGER';
    return PILLARS.find(p => p.id === cle) ?? PILLARS[0];
}

/**
 * Le fil de ma semaine — un jeu de cartes qu'on parcourt, pas une page qu'on lit.
 *
 * Une carte par sujet, à la suite. Le bandeau haut prend la couleur du pilier et porte la
 * question ; le panneau blanc montre le fil que le moniteur a réellement construit :
 * l'accroche, le geste et l'idée clé. L'explication de fond appartient à la fiche, pas à
 * cette vue de pilotage.
 *
 * Le fil est une pile de cartes : la fiche active est devant, les suivantes sont réellement
 * derrière elle et ne laissent dépasser que leur bandeau-titre. On lit le sujet de devant,
 * mais on garde le reste de la semaine dans le champ de vision.
 *
 * Vocabulaire : « raconté » entrait en collision avec le vocabulaire de l'app pour l'acte
 * de parler au groupe. L'action de marquer un sujet vu s'appelle donc « traité » côté
 * affichage ; la donnée reste `raconte` en base et dans l'action serveur, déjà nommée
 * ainsi et migrée.
 */
export default function ProgrammeCondense({ stageId, contents, preparations, readOnly = false, actionsSemaine = [] }: Props) {
    const [traites, setTraites] = useState<Record<string, boolean>>(() =>
        Object.fromEntries(contents.map(c => [c.id, !!preparations[c.id]?.raconte])),
    );
    const [actif, setActif] = useState<string | null>(() =>
        contents.find(c => !preparations[c.id]?.raconte)?.id ?? contents[0]?.id ?? null,
    );
    /** La carte avant suit le doigt sans re-rendu ; sa légère rotation rend le passage
        devant/derrière lisible plutôt qu'un simple changement de contenu. */
    const [passage, setPassage] = useState<{ id: string; sens: -1 | 1; phase: 'sortie' | 'retour' } | null>(null);
    const [, startTransition] = useTransition();

    if (contents.length === 0) {
        return (
            <Link
                href={`/stages/${stageId}/program`}
                className="flex items-center gap-3 rounded-2xl bg-white border border-slate-200 px-4 py-4 hover:border-indigo-300 transition-colors"
            >
                <span className="material-symbols-outlined text-slate-300 text-2xl shrink-0">menu_book</span>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-900">Rien à raconter pour l&apos;instant</p>
                    <p className="text-xs text-slate-400">Choisissez les sujets de la semaine</p>
                </div>
                <span className="material-symbols-outlined text-slate-300 shrink-0">chevron_right</span>
            </Link>
        );
    }

    const basculer = (contentId: string) => {
        if (readOnly) return;
        const suivant = !traites[contentId];
        setTraites(prev => ({ ...prev, [contentId]: suivant }));
        startTransition(async () => {
            const r = await toggleSujetRaconte(stageId, contentId, suivant);
            if (!r.success) setTraites(prev => ({ ...prev, [contentId]: !suivant }));
        });
    };

    const prepares = contents.filter(c => {
        const prep = preparations[c.id];
        return !!prep?.accroche_choisie && (prep.actions?.length ?? 0) > 0;
    }).length;
    const prochains = contents.filter(c => !traites[c.id]).length;
    const indexActif = Math.max(0, contents.findIndex(c => c.id === actif));
    // Trois cartes restent visibles ; l'ordre, lui, est circulaire : après la dernière,
    // la première revient derrière la pile. Ce n'est donc pas un flux qui s'épuise.
    const profondeurPile = Math.min(3, contents.length);
    const decalagePile = (profondeurPile - 1) * PAS_PILE;
    const allerAuSujet = (decalage: -1 | 1) => {
        if (passage || contents.length < 2) return;
        const id = decalage === 1 ? contents[indexActif].id
            : contents[(indexActif - 1 + contents.length) % contents.length].id;
        setPassage({ id, sens: decalage, phase: 'sortie' });
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between px-1 pb-0.5">
                <p className="text-[11px] font-bold text-slate-400">
                    {prepares} {prepares > 1 ? 'sujets prêts' : 'sujet prêt'}
                    {contents.length > prepares && ` · ${contents.length - prepares} à préparer`}
                    {contents.length > 1 && <span className="text-slate-300"> · glissez pour feuilleter</span>}
                </p>
                {prochains > 0 && (
                    <span className="text-[10px] font-black uppercase tracking-wide text-indigo-500">
                        Fiche {indexActif + 1}/{contents.length}
                    </span>
                )}
            </div>
            <div className="relative" style={{ height: HAUTEUR_CARTE + decalagePile }}>
            {contents.map((c, index) => {
                const positionPile = (index - indexActif + contents.length) % contents.length;
                const rang = Math.min(positionPile, profondeurPile - 1);
                const enPassage = passage?.id === c.id;
                const sort = enPassage && passage.phase === 'sortie';
                const prep = preparations[c.id];
                const pilier = pilierDe(c);
                const teinte = TEINTE[pilier.id];
                const fait = traites[c.id];
                const chute = prep?.chute ?? c.a_retenir;
                const actions = (prep?.actions ?? [])
                    .map(id => actionSujetParId(id, c.actions))
                    .filter((a): a is ActionSujet => !!a);
                const repere = niveauRepere(c.niveau);
                const estPret = !!prep?.accroche_choisie && actions.length > 0;
                const estProchain = !fait && c.id === contents.find(sujet => !traites[sujet.id])?.id;
                const estActif = positionPile === 0;

                return (
                    // `relative` sans `overflow-hidden` : la médaille déborde du coin, elle
                    // serait rognée si la carte coupait à ses bords. Les arrondis sont donc
                    // portés par le bandeau et le pied, pas par l'article.
                    <motion.article
                        key={c.id}
                        drag={estActif && !passage && contents.length > 1 ? 'x' : false}
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={{ left: 0.6, right: 0.6 }}
                        dragSnapToOrigin={!passage}
                        onDragEnd={estActif ? (_, info) => {
                            if (info.offset.x < -80) allerAuSujet(1);
                            if (info.offset.x > 80) allerAuSujet(-1);
                        } : undefined}
                        initial={false}
                        animate={{
                            x: sort ? -passage.sens * 340 : 0,
                            y: -rang * PAS_PILE,
                            scale: 1 - rang * 0.045,
                            rotate: sort ? -passage.sens * 12 : 0,
                        }}
                        transition={{ duration: 0.30, ease: [0.22, 0.61, 0.36, 1] }}
                        onAnimationComplete={() => {
                            if (!enPassage || !passage) return;
                            if (passage.phase === 'sortie') {
                                setActif(contents[(indexActif + passage.sens + contents.length) % contents.length].id);
                                setPassage({ ...passage, phase: 'retour' });
                            } else setPassage(null);
                        }}
                        className={clsx(
                            'absolute inset-x-0 top-0 h-[460px] rounded-[22px] bg-white overflow-hidden flex flex-col',
                            estActif ? 'z-10 touch-pan-y shadow-[var(--shadow-lift)]' : 'pointer-events-none ring-1 ring-slate-900/5',
                        )}
                        style={{
                            zIndex: enPassage && passage?.phase === 'sortie'
                                ? (passage.sens === 1 ? contents.length + 2 : 0)
                                : contents.length - positionPile,
                            top: decalagePile,
                            transformOrigin: 'center top',
                        }}
                        inert={!estActif || !!passage}
                    >
                        {/* L'ombre est portée par un calque en dessous : l'article ne peut pas
                            la porter lui-même, il n'a pas d'arrondi (la médaille doit pouvoir
                            en déborder). */}
                        <span
                            aria-hidden
                            className="absolute inset-0 rounded-[22px] shadow-sm pointer-events-none"
                        />
                        {fait && estActif && <BadgeTraite />}

                        {/* Le bandeau coloré porte la phrase à prononcer. La couleur du palier
                            baigne toute la zone au lieu d'un filet de 4px : on sait de quel
                            registre on parle avant même d'avoir lu. */}
                        <div
                            className="relative flex flex-col shrink-0 px-5 pt-3 pb-4 overflow-hidden rounded-t-[22px]"
                            style={{ background: `linear-gradient(150deg, ${teinte.vif}, ${teinte.sombre})` }}
                        >
                            <span
                                aria-hidden
                                className="material-symbols-outlined absolute -right-4 -bottom-6 text-white/12 pointer-events-none"
                                style={{ fontSize: 132 }}
                            >
                                {pilier.icon}
                            </span>

                            <div className="relative order-2 flex flex-wrap items-center gap-2 mt-3">
                                <span className="text-[10px] font-black uppercase tracking-[0.14em] text-white/75">
                                    {pilier.label}
                                </span>
                                {repere && (
                                    <span className="text-[10px] font-semibold text-white/45">· {repere}</span>
                                )}
                                <span className="ml-auto rounded-full bg-white/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-white/85">
                                    {fait ? 'Traité' : estPret ? 'Prêt' : estProchain ? 'À poursuivre' : 'À préparer'}
                                </span>
                            </div>

                            {/* La question titre la carte — c'est le sujet dont on parle.
                                L'accroche est une décision parmi d'autres, elle vit plus bas
                                avec les siennes, pas à la place du titre. Marge à droite
                                réservée à la médaille, pour que le texte ne passe pas dessous. */}
                            <h3 className={clsx(
                                'relative font-black text-white leading-[1.3] text-balance',
                                'text-[16px] min-h-10',
                            )}>
                                {c.question}
                            </h3>
                        </div>

                        {/* Le panneau montre ce qui a été décidé pour la séance ; il ne
                            répète pas l'explication de la fiche, qui se lit au besoin dans
                            le détail du sujet. */}
                        <div className={clsx('bg-white px-5 py-4 flex-1 min-h-0 overflow-y-auto', readOnly && 'rounded-b-[22px]')}>
                            {(prep?.accroche_choisie || actions.length > 0 || chute) && (
                                <div className="space-y-3.5">
                                    {prep?.accroche_choisie && (
                                        <Ligne intitule="Accroche" icone="record_voice_over" teinte={teinte.vif}>
                                            <span className="font-bold italic text-slate-900">
                                                «&nbsp;{prep.accroche_choisie}&nbsp;»
                                            </span>
                                        </Ligne>
                                    )}

                                    {actions.length > 0 && (
                                        <Ligne intitule="Geste" icone="front_hand" teinte={teinte.vif}>
                                            <span className="block font-medium text-slate-600">
                                                {actions[0].consigne}
                                            </span>
                                            {actions.length > 1 && (
                                                <span className="block mt-1 text-[11px] font-bold text-slate-400">
                                                    + {actions.length - 1} autre{actions.length > 2 ? 's' : ''} geste{actions.length > 2 ? 's' : ''}
                                                </span>
                                            )}
                                        </Ligne>
                                    )}

                                    {chute && (
                                        <Ligne intitule="Idée clé" icone="lightbulb" teinte={teinte.vif}>
                                            <span className="font-medium text-slate-600">{chute}</span>
                                        </Ligne>
                                    )}
                                </div>
                            )}

                            {!estPret && (
                                <Link
                                    href={`/stages/${stageId}/preparer`}
                                    className="inline-flex items-center gap-1.5 mt-4 text-[12.5px] font-bold hover:opacity-70 transition-opacity"
                                    style={{ color: teinte.vif }}
                                >
                                    <span className="material-symbols-outlined text-[16px]">edit_note</span>
                                    {prep?.accroche_choisie ? 'Compléter ce fil' : 'Préparer ce sujet'}
                                </Link>
                            )}
                        </div>

                        {/* Le geste « traité » est volontairement séparé du fil : raconter
                            un sujet est un état de la semaine, pas une étape de préparation. */}
                        {!readOnly && (
                            <div className="flex bg-white border-t border-slate-100 rounded-b-[22px] overflow-hidden">
                                <motion.button
                                    onClick={() => basculer(c.id)}
                                    aria-pressed={fait}
                                    whileTap={{ scale: 0.985 }}
                                    className="flex-1 flex items-center justify-center gap-2 py-3.5 text-[12.5px] font-black text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    {fait ? 'Ce sujet n’est pas traité' : 'Marquer comme traité'}
                                </motion.button>
                            </div>
                        )}
                    </motion.article>
                );
            })}
            </div>

            {/* Le rituel : transversal à tous les sujets, donc hors de la liste. */}
            {actionsSemaine.length > 0 && (
                <div className="rounded-2xl bg-white/60 border border-dashed border-slate-200 px-4 py-3.5 mt-4">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-2">
                        Chaque jour de la semaine
                    </p>
                    <div className="space-y-2.5">
                        {actionsSemaine.map(id => {
                            const action = actionSemaineParId(id);
                            if (!action) return null;
                            return (
                                <div key={id}>
                                    <p className="text-[14px] font-bold text-slate-800 leading-snug">
                                        {action.label}
                                    </p>
                                    <p lang="fr" className="text-[12.5px] font-medium text-slate-500 leading-relaxed mt-0.5 text-justify hyphens-auto">
                                        {action.consigne}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Vers `/program` — le choix des questions — et non `/preparer`, qui règle le
                déroulé de chaque séance : deux écrans distincts. Masqué sur un bilan clôturé,
                où l'historique est figé. */}
            {!readOnly && (
                <Link
                    href={`/stages/${stageId}/program`}
                    className="flex items-center justify-center mt-1 py-3.5 rounded-2xl bg-white border border-slate-200 text-[13.5px] font-black text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 active:scale-[0.99] transition-all"
                >
                    Modifier mes questions
                </Link>
            )}
        </div>
    );
}

/**
 * La médaille — une vraie cocarde dentelée à rubans, pas une pastille de texte.
 *
 * Dessinée en SVG inline : aucune image à charger, et elle se met à l'échelle sans flou. Le
 * dégradé doré et le liseré intérieur lui donnent le relief d'un insigne. Elle sert aux deux
 * tailles — posée en grand sur la carte ouverte, réduite dans la ligne repliée — d'où la
 * séparation entre ce dessin et son placement.
 */
function Medaille() {
    // Identifiants uniques : plusieurs médailles coexistent à l'écran, et des `id` de
    // dégradé partagés se recouvriraient d'une instance à l'autre.
    const uid = useId();
    const or = `or-${uid}`;
    const ruban = `ruban-${uid}`;

    const pointes = 22;
    const dents = Array.from({ length: pointes }, (_, i) => {
        const a = (i / pointes) * Math.PI * 2;
        const r = i % 2 === 0 ? 30 : 26.5;
        return `${50 + Math.cos(a) * r},${50 + Math.sin(a) * r}`;
    }).join(' ');

    return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" aria-hidden>
            <defs>
                <linearGradient id={or} x1="0" y1="0" x2="0.4" y2="1">
                    <stop offset="0%" stopColor="#fde68a" />
                    <stop offset="45%" stopColor="#f5b31c" />
                    <stop offset="100%" stopColor="#c07807" />
                </linearGradient>
                <linearGradient id={ruban} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#dc2626" />
                    <stop offset="100%" stopColor="#991b1b" />
                </linearGradient>
            </defs>

            {/* Les deux rubans, sous la cocarde. */}
            <path d="M36 66 L28 96 L41 89 L50 97 L50 66 Z" fill={`url(#${ruban})`} />
            <path d="M64 66 L72 96 L59 89 L50 97 L50 66 Z" fill="#b91c1c" />

            <polygon points={dents} fill={`url(#${or})`} />
            <circle cx="50" cy="50" r="23" fill="none" stroke="#fff8dc" strokeOpacity=".55" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="20" fill="#fffdf5" />

            <text
                x="50" y="52"
                textAnchor="middle" dominantBaseline="middle"
                fontSize="11.5" fontWeight="900" fill="#a16207"
                style={{ letterSpacing: '0.02em' }}
            >
                FAIT
            </text>
        </svg>
    );
}

/**
 * La médaille posée sur une carte ouverte : hors du flux, inclinée, et arrivant en
 * tamponnant — un léger dépassement d'échelle pour que valider un sujet se sente.
 */
function BadgeTraite() {
    return (
        <motion.span
            initial={{ scale: 1.9, opacity: 0, rotate: -22 }}
            animate={{ scale: 1, opacity: 1, rotate: -11 }}
            transition={{ type: 'spring', stiffness: 340, damping: 15 }}
            className="pointer-events-none absolute -top-3 -right-3 z-20"
            style={{ width: 104, height: 104 }}
        >
            <Medaille />
        </motion.span>
    );
}

/** Une décision : un filet teinté, son intitulé, son contenu. */
function Ligne({
    intitule, icone, teinte, children,
}: {
    intitule: string;
    icone: string;
    teinte: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex gap-2.5">
            <span className="relative flex w-5 shrink-0 justify-center pt-0.5">
                <span
                    className="size-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${teinte}16`, color: teinte }}
                >
                    <span className="material-symbols-outlined text-[12px]">{icone}</span>
                </span>
            </span>
            <div className="flex-1 min-w-0">
                <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-0.5">
                    {intitule}
                </span>
                <div lang="fr" className="text-[13.5px] leading-[1.5] space-y-1">
                    {children}
                </div>
            </div>
        </div>
    );
}

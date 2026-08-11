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

function pilierDe(c: PedagogicalContent) {
    const d = (c.dimension ?? '').toUpperCase();
    const cle = d.startsWith('COMPR') ? 'COMPRENDRE' : d.startsWith('OBSERV') ? 'OBSERVER' : 'PROTÉGER';
    return PILLARS.find(p => p.id === cle) ?? PILLARS[0];
}

/**
 * Le fil de ma semaine — un jeu de cartes qu'on parcourt, pas une page qu'on lit.
 *
 * Une carte par sujet, à la suite. Le bandeau haut prend la couleur du palier et porte la
 * question ; le panneau blanc en dessous donne le rappel de fond — trois lignes par défaut,
 * dépliable au toucher — puis les décisions du moniteur : l'accroche, ce qu'il fait faire,
 * ce que le groupe emporte, chacune annoncée par son intitulé.
 *
 * Un sujet traité se replie en une ligne barrée : l'espace libéré sert à ceux qui restent.
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
    // Un sujet traité se replie en une ligne barrée : l'espace libéré sert à ceux qui
    // restent. Rouvert depuis cette ligne, il s'affiche en entier même s'il reste traité —
    // sinon une simple relecture le referait disparaître.
    const [ouverts, setOuverts] = useState<Record<string, boolean>>({});
    /** Explications lues en entier, par sujet. */
    const [depliees, setDepliees] = useState<Record<string, boolean>>({});
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
        // Marquer traité referme le sujet ; l'annuler le laisse ouvert.
        setOuverts(prev => ({ ...prev, [contentId]: !suivant }));
        startTransition(async () => {
            const r = await toggleSujetRaconte(stageId, contentId, suivant);
            if (!r.success) setTraites(prev => ({ ...prev, [contentId]: !suivant }));
        });
    };

    return (
        <div className="space-y-3">
            {contents.map(c => {
                const prep = preparations[c.id];
                const pilier = pilierDe(c);
                const teinte = TEINTE[pilier.id];
                const fait = traites[c.id];
                const chute = prep?.chute ?? c.a_retenir;
                const actions = (prep?.actions ?? [])
                    .map(id => actionSujetParId(id, c.actions))
                    .filter((a): a is ActionSujet => !!a);
                const repere = niveauRepere(c.niveau);
                const reduit = fait && !ouverts[c.id];
                const depliee = depliees[c.id];

                // Sujet traité : le bandeau seul, réduit à sa hauteur de titre, avec sa
                // médaille en petit. Le fond coloré passe à 45 % d'opacité — la couleur du
                // palier reste reconnaissable sans peser autant qu'un sujet à faire, là où le
                // gris franc aurait eu l'air désactivé. Le texte et la médaille gardent leur
                // pleine opacité : c'est le fond qui recule, pas le contenu.
                if (reduit) {
                    return (
                        <motion.button
                            key={c.id}
                            onClick={() => setOuverts(prev => ({ ...prev, [c.id]: true }))}
                            whileTap={{ scale: 0.985 }}
                            className="relative w-full flex items-center gap-3 rounded-[18px] pl-4 pr-3 py-2.5 text-left overflow-hidden"
                        >
                            <span
                                aria-hidden
                                className="absolute inset-0 opacity-45"
                                style={{ background: `linear-gradient(150deg, ${teinte.vif}, ${teinte.sombre})` }}
                            />
                            {/* Texte sombre, pas blanc : sur un fond à 45 % le blanc perd son
                                contraste. */}
                            <span className="relative flex-1 min-w-0 text-[13.5px] font-bold text-slate-700 leading-snug line-clamp-2">
                                {c.question}
                            </span>
                            {/* Légèrement de travers, comme la grande sur la carte ouverte :
                                d'aplomb, elle avait l'air d'une icône alignée dans la ligne. */}
                            <span
                                className="relative shrink-0"
                                style={{ width: 46, height: 46, transform: 'rotate(-9deg)' }}
                            >
                                <Medaille />
                            </span>
                        </motion.button>
                    );
                }

                return (
                    // `relative` sans `overflow-hidden` : la médaille déborde du coin, elle
                    // serait rognée si la carte coupait à ses bords. Les arrondis sont donc
                    // portés par le bandeau et le pied, pas par l'article.
                    <article key={c.id} className="relative">
                        {/* L'ombre est portée par un calque en dessous : l'article ne peut pas
                            la porter lui-même, il n'a pas d'arrondi (la médaille doit pouvoir
                            en déborder). */}
                        <span
                            aria-hidden
                            className="absolute inset-0 rounded-[22px] shadow-sm pointer-events-none"
                        />
                        {fait && <BadgeTraite />}

                        {/* Le bandeau coloré porte la phrase à prononcer. La couleur du palier
                            baigne toute la zone au lieu d'un filet de 4px : on sait de quel
                            registre on parle avant même d'avoir lu. */}
                        <div
                            className="relative px-5 pt-4 pb-5 overflow-hidden rounded-t-[22px]"
                            style={{ background: `linear-gradient(150deg, ${teinte.vif}, ${teinte.sombre})` }}
                        >
                            <span
                                aria-hidden
                                className="material-symbols-outlined absolute -right-4 -bottom-6 text-white/12 pointer-events-none"
                                style={{ fontSize: 132 }}
                            >
                                {pilier.icon}
                            </span>

                            <div className="relative flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.14em] text-white/75">
                                    {pilier.label}
                                </span>
                                {repere && (
                                    <span className="text-[10px] font-semibold text-white/45">· {repere}</span>
                                )}
                            </div>

                            {/* La question titre la carte — c'est le sujet dont on parle.
                                L'accroche est une décision parmi d'autres, elle vit plus bas
                                avec les siennes, pas à la place du titre. Marge à droite
                                réservée à la médaille, pour que le texte ne passe pas dessous. */}
                            <h3 className={clsx(
                                'relative text-[19px] font-black text-white leading-[1.3] mt-2 text-balance',
                                fait && 'pr-[76px]',
                            )}>
                                {c.question}
                            </h3>
                        </div>

                        {/* Le panneau de desserte : le rappel de fond, puis les décisions. */}
                        <div className={clsx('bg-white px-5 py-4', readOnly && 'rounded-b-[22px]')}>
                            {/* Trois lignes par défaut, la dernière s'effaçant en dégradé,
                                puis une action nommée : le masque seul montrait qu'il y avait
                                une suite sans dire comment l'atteindre. */}
                            {c.explication && (
                                <div>
                                    {/* Pas de `layout` ici : framer-motion mesure alors toutes
                                        les cartes à chaque changement de hauteur, et l'ouverture
                                        d'une explication faisait bouger l'ensemble de la liste. */}
                                    <p
                                        className="text-[12.5px] leading-relaxed text-slate-400 overflow-hidden text-justify hyphens-auto"
                                        lang="fr"
                                        style={depliee ? undefined : {
                                            maxHeight: 'calc(3 * 1.625em)',
                                            maskImage: 'linear-gradient(to bottom, #000 calc(100% - 1.2em), transparent 100%)',
                                            WebkitMaskImage: 'linear-gradient(to bottom, #000 calc(100% - 1.2em), transparent 100%)',
                                        }}
                                    >
                                        {c.explication}
                                    </p>
                                    <button
                                        onClick={() => setDepliees(prev => ({ ...prev, [c.id]: !prev[c.id] }))}
                                        aria-expanded={depliee}
                                        className="mt-1 text-[12px] font-bold text-slate-400 hover:text-slate-700 transition-colors"
                                    >
                                        {depliee ? 'Réduire' : 'Lire la suite'}
                                    </button>
                                </div>
                            )}

                            {(prep?.accroche_choisie || actions.length > 0 || chute) && (
                                <div className={clsx('space-y-3', c.explication && 'mt-4')}>
                                    {/* Une seule taille de texte pour les trois décisions : ce
                                        qui distingue l'accroche, c'est le gras et l'italique,
                                        pas des corps différents empilés. Trois tailles dans un
                                        même bloc donnaient un escalier illisible. */}
                                    {prep?.accroche_choisie && (
                                        <Ligne intitule="J'accroche avec" teinte={teinte.vif}>
                                            <span className="font-bold italic text-slate-900">
                                                «&nbsp;{prep.accroche_choisie}&nbsp;»
                                            </span>
                                        </Ligne>
                                    )}

                                    {actions.length > 0 && (
                                        <Ligne intitule="Je fais faire" teinte={teinte.vif}>
                                            {actions.map(a => (
                                                <span key={a.id} className="block font-medium text-slate-600">
                                                    {a.consigne}
                                                </span>
                                            ))}
                                        </Ligne>
                                    )}

                                    {chute && (
                                        <Ligne intitule="Ils retiennent" teinte={teinte.vif}>
                                            <span className="font-medium text-slate-600">{chute}</span>
                                        </Ligne>
                                    )}
                                </div>
                            )}

                            {!prep?.accroche_choisie && (
                                <Link
                                    href={`/stages/${stageId}/preparer`}
                                    className="inline-flex items-center gap-1.5 mt-3 text-[12.5px] font-bold text-amber-600 hover:text-amber-700 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[16px]">edit_note</span>
                                    Pas encore préparé
                                </Link>
                            )}
                        </div>

                        {/* Le geste « traité » : une bande pleine largeur en pied de carte.
                            Un sujet rouvert après coup garde un « Refermer » distinct — sans
                            lui, le refermer obligerait à le dé-marquer. */}
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

                                {fait && (
                                    <motion.button
                                        onClick={() => setOuverts(prev => ({ ...prev, [c.id]: false }))}
                                        whileTap={{ scale: 0.985 }}
                                        className="px-5 py-3.5 text-[12.5px] font-black border-l border-slate-100 transition-colors"
                                        style={{ color: teinte.vif }}
                                    >
                                        Refermer
                                    </motion.button>
                                )}
                            </div>
                        )}
                    </article>
                );
            })}

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
    intitule, teinte, children,
}: {
    intitule: string;
    teinte: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex gap-2.5">
            <span
                className="w-[3px] rounded-full shrink-0 mt-0.5 mb-0.5"
                style={{ background: teinte, opacity: 0.35 }}
            />
            <div className="flex-1 min-w-0">
                <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-0.5">
                    {intitule}
                </span>
                <div lang="fr" className="text-[13.5px] leading-[1.5] space-y-1 text-justify hyphens-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}


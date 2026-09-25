'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import clsx from 'clsx';
import {
    cartesDe, type CarteFormation, type IllustrationCarte, type LeconFormation,
    type ModulePlanifie, type SectionFormation,
} from '@/data/formation-methode';
import { marquerLeconTerminee } from '@/actions/formation-actions';
import { Motif, sceneDePlanche, type NomMotif } from './Motifs';
import { TEINTE_THEME } from '@/data/formation-teintes';
import { CoastalMark } from '@/components/design/Coastal';

import { iconeMaterial, type IconeComposant } from '@/components/ui/Icone';
const ArrowLeft = iconeMaterial('arrow_back');
const ArrowLeftRight = iconeMaterial('swap_horiz');
const Check = iconeMaterial('check');
const CircleCheck = iconeMaterial('check_circle');
const Clock = iconeMaterial('schedule');
const Cog = iconeMaterial('settings');
const Lightbulb = iconeMaterial('lightbulb');
const ListChecks = iconeMaterial('checklist');
const PenLine = iconeMaterial('edit');
const Sparkles = iconeMaterial('auto_awesome');
const X = iconeMaterial('close');

/**
 * Parcours « Savoir en parler » — liste des modules, puis lecteur en cartes.
 *
 * Format Google Primer, dont on reprend le « Rhythmic Learning » : un module n'est pas une
 * enfilade de cartes mais une suite de PILES de 3 à 5, chacune close par une carte de
 * respiration (genre `respiration`, fond sombre). Finir une pile est une micro-réussite —
 * le moniteur n'attend pas la fin du module pour sentir qu'il a appris, et chaque palier
 * est un endroit où s'arrêter sans rien perdre. Quatorze cartes d'affilée n'offraient
 * aucun de ces deux repères.
 *
 * Le lecteur ne connaît pas les piles : `cartesDe` lui donne un flux plat où les
 * respirations sont déjà intercalées. Une respiration se swipe donc exactement comme une
 * carte de contenu — c'est le même geste du début à la fin.
 *
 * Les cartes se feuillettent au doigt : glisser à gauche pour avancer, à droite pour
 * revenir. Rien n'est bloquant : un moniteur peut ignorer la formation et aller préparer
 * sa semaine directement.
 *
 * Les cartes ont six formes distinctes (voir `CarteFormation`) parce qu'une formation
 * professionnelle ne se lit pas comme une brochure : un procédé technique, un contre-exemple
 * et un exercice appellent chacun un rendu différent. C'est `RenduCarte` qui les distingue.
 *
 * Deux règles structurantes :
 * — une carte ne défile JAMAIS (elle tient dans l'écran ou elle est découpée en deux, d'où
 *   la séparation `procede` / `mecanisme`) ; un scroll interne entrerait de toute façon en
 *   conflit avec le geste de swipe, qui capte le touch ;
 * — toute carte de contenu porte un bandeau de tête de hauteur fixe : une photo quand la
 *   scène s'y prête, un motif conceptuel sinon (`Motifs.tsx`). C'est cette régularité qui
 *   fait tomber le titre au même endroit d'un swipe à l'autre. Seule la respiration y
 *   échappe, et c'est justement ce qui la signale comme palier.
 */

/** Distance de glissement à partir de laquelle la carte est considérée « lâchée ». */
const SEUIL_SWIPE = 90;

/** Rend le gras `**…**` des corrections sans embarquer un moteur Markdown pour si peu. */
function AvecGras({ texte }: { texte: string }) {
    return (
        <>
            {texte.split(/(\*\*[^*]+\*\*)/g).map((bout, i) =>
                bout.startsWith('**') && bout.endsWith('**')
                    ? <strong key={i} className="font-black text-slate-900">{bout.slice(2, -2)}</strong>
                    : <span key={i}>{bout}</span>,
            )}
        </>
    );
}

/** Paragraphes séparés par des sauts de ligne — les textes de carte en contiennent. */
function Paragraphes({ texte, className }: { texte: string; className?: string }) {
    return (
        <>
            {texte.split('\n\n').map((p, i) => (
                <p key={i} className={clsx(className, i > 0 && 'mt-3')}>
                    <AvecGras texte={p} />
                </p>
            ))}
        </>
    );
}

/**
 * Illustration de carte : une scène, pas un ornement.
 *
 * `onError` masque le bloc si le fichier n'a pas encore été déposé dans
 * `public/formation/` — un module doit rester lisible avant que ses images existent.
 */
/**
 * Bandeau de tête : photo si la carte en a une, motif conceptuel sinon.
 *
 * Toutes les cartes portent un bandeau, de la même hauteur — c'est ce qui leur donne la
 * même structure et fait tomber le titre au même endroit d'un swipe à l'autre. Une photo
 * déclarée mais absente du disque cède la place au motif, jamais à du vide.
 */
function Bandeau({ illustration, motif }: {
    illustration?: IllustrationCarte;
    motif: NomMotif;
}) {
    const [photoAbsente, setPhotoAbsente] = useState(false);
    // Les illustrations propres à une carte viennent d'abord de la planche aquarelle ; un
    // fichier isolé ne sert plus que si la planche ne le couvre pas.
    const scene = illustration ? sceneDePlanche(illustration.fichier) : null;
    const photo = illustration && !photoAbsente;

    if (scene) return <div className="-mx-6 -mt-7 mb-3.5 h-[22vh] max-h-40 min-h-24 shrink-0 overflow-hidden" role="img" aria-label={illustration?.alt}>{scene}</div>;

    return (
        // Marges négatives : le bandeau touche les bords de la carte, comme dans Primer,
        // alors que le texte garde son retrait. Hauteur en proportion de l'écran plutôt
        // qu'en pixels fixes — une bande fixe mangerait la place du texte sur petit écran.
        // `mb` aligné sur celui de `Nature`, pour que le titre tombe toujours pareil.
        <div className="-mx-6 -mt-7 mb-3.5 h-[22vh] max-h-40 min-h-24 shrink-0 overflow-hidden">
            {photo ? (
                <Image
                    width={1328} height={800} sizes="(max-width: 640px) 100vw, 600px"
                    src={`/formation/${illustration.fichier}`}
                    alt={illustration.alt}
                    onError={() => setPhotoAbsente(true)}
                    draggable={false}
                    className="w-full h-full object-cover"
                />
            ) : (
                <Motif nom={motif} />
            )}
        </div>
    );
}

/**
 * Bandeau de nature, en tête de chaque carte.
 *
 * Il n'est pas décoratif : il annonce de quel type de carte il s'agit — un procédé, des
 * règles à retenir, le mécanisme, un contre-exemple, un bilan. L'icône seule serait
 * ambiguë, d'où le libellé qui l'accompagne.
 *
 * Présent sur TOUTES les cartes, illustrées comprises : c'est lui qui garantit que le
 * titre tombe toujours à la même hauteur d'une carte à l'autre. Sans cette régularité, le
 * texte saute à chaque swipe et l'œil doit le rechercher.
 *
 * Icônes Material Symbols en trait fin (charte : un seul jeu d'icônes), réglées assez
 * légères pour s'accorder à la typographie sans alourdir la carte.
 */
function Nature({ Icone, libelle, teinte }: {
    Icone: IconeComposant;
    libelle: string;
    teinte: 'indigo' | 'emeraude' | 'rose';
}) {
    return (
        <div className={clsx(
            'flex items-center gap-1.5 mb-3.5 self-start',
            teinte === 'indigo' && 'text-indigo-500',
            teinte === 'emeraude' && 'text-emerald-600',
            teinte === 'rose' && 'text-rose-500',
        )}>
            <Icone size={15} strokeWidth={2.5} />
            <span className="text-[12px] font-bold">{libelle}</span>
        </div>
    );
}

function EnTete({ titre }: { titre: string }) {
    return <h2 className="text-[21px] font-black text-slate-900 leading-[1.15] mb-3 text-balance">{titre}</h2>;
}

function RenduCarte({ carte, onReponduChange }: {
    carte: CarteFormation;
    /** Relayé aux cartes qui peuvent devenir trop longues une fois répondues — voir
     *  `Exercice`/`VraiFaux`. Sans effet sur les autres genres. */
    onReponduChange: (repondu: boolean) => void;
}) {
    switch (carte.genre) {
        case 'texte':
            return (
                <>
                    <Bandeau illustration={carte.illustration} motif={carte.points ? 'regles' : 'comprendre'} />
                    {carte.points
                        ? <Nature Icone={ListChecks} libelle="Les règles" teinte="indigo" />
                        : <Nature Icone={Lightbulb} libelle="À comprendre" teinte="indigo" />}
                    <EnTete titre={carte.titre} />
                    <Paragraphes texte={carte.texte} className="text-[15.5px] text-slate-600 leading-[1.6]" />
                    {carte.points && (
                        // Les points sont la substance de ces cartes-là, pas un complément :
                        // encadrés et détachés du texte, ils se retiennent au premier coup d'œil.
                        <ul className="mt-5 space-y-2.5 w-full rounded-2xl bg-slate-50 px-4 py-3.5">
                            {carte.points.map(p => (
                                <li key={p} className="flex items-start gap-2.5 text-[14.5px] text-slate-800 font-bold leading-snug">
                                    <span className="size-1.5 rounded-full bg-indigo-400 mt-[7px] shrink-0" />
                                    <span>{p}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            );

        case 'procede':
            return (
                <>
                    <Bandeau illustration={carte.illustration} motif="comprendre" />
                    <Nature Icone={Sparkles} libelle="Un procédé" teinte="indigo" />
                    <EnTete titre={carte.titre} />
                    <p className="text-[15.5px] text-slate-600 leading-[1.6] mb-4">{carte.texte}</p>

                    {/* Les exemples sont des formulations réelles du catalogue : mis en
                        exergue, jamais fondus dans le texte — c'est ce que le moniteur
                        reconnaîtra ensuite dans l'app. */}
                    <div className="space-y-2">
                        {carte.exemples.map(ex => (
                            <div key={ex.texte} className="rounded-xl bg-slate-50 border-l-[3px] border-indigo-400 px-3.5 py-2.5">
                                <p className="text-[14px] text-slate-800 font-semibold italic leading-snug">
                                    « {ex.texte} »
                                </p>
                                {ex.source && (
                                    <p className="text-[12px] font-bold text-slate-400 mt-1.5">
                                        {ex.source}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                </>
            );

        case 'mecanisme':
            return (
                <>
                    <Bandeau motif="mecanisme" />
                    {/* On passe de « quoi faire » à « pourquoi ça fonctionne ». */}
                    <Nature Icone={Cog} libelle="Le mécanisme" teinte="emeraude" />
                    <EnTete titre={carte.titre} />
                    <div className="rounded-2xl bg-emerald-50 px-4 py-3.5">
                        <p className="text-[15px] text-emerald-900 leading-[1.55] font-medium">{carte.pourquoi}</p>
                    </div>

                    {carte.attention && (
                        <div className="rounded-2xl bg-amber-50 px-4 py-3.5 mt-2.5">
                            <p className="text-[12px] font-bold text-amber-600 mb-1.5">
                                À savoir
                            </p>
                            <p className="text-[14px] text-amber-900 leading-[1.55]">{carte.attention}</p>
                        </div>
                    )}
                </>
            );

        case 'contraste':
            return (
                <>
                    <Bandeau motif="contraste" />
                    <Nature Icone={ArrowLeftRight} libelle="Le contraste" teinte="rose" />
                    <EnTete titre={carte.titre} />
                    <p className="text-[15.5px] text-slate-600 leading-[1.6] mb-4">{carte.texte}</p>

                    <div className="space-y-2.5">
                        <div className="rounded-xl bg-rose-50 border border-rose-100 px-3.5 py-3">
                            <p className="text-[12px] font-bold text-rose-500 mb-1.5">
                                Ce qui ne marche pas
                            </p>
                            <p className="text-[14px] text-rose-900 italic leading-snug">« {carte.mauvais} »</p>
                        </div>
                        <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-3.5 py-3">
                            <p className="text-[12px] font-bold text-emerald-600 mb-1.5">
                                Ce qui marche
                            </p>
                            <p className="text-[14px] text-emerald-900 italic leading-snug">« {carte.bon} »</p>
                        </div>
                    </div>

                    <p className="text-[14.5px] text-slate-800 font-bold leading-snug mt-4">{carte.ecart}</p>
                </>
            );

        case 'exercice':
            return <Exercice carte={carte} onReponduChange={onReponduChange} />;

        case 'vrai_faux':
            return <VraiFaux carte={carte} onReponduChange={onReponduChange} />;

        case 'respiration':
            // Seule carte à ne pas suivre la grille commune : ni bandeau de tête, ni
            // bandeau de nature, et un contenu centré dans toute la hauteur. C'est voulu —
            // le palier doit se distinguer au premier coup d'œil du contenu qu'il ponctue.
            return (
                <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="size-14 rounded-full bg-emerald-500/20 flex items-center justify-center mb-5">
                        <Check size={26} strokeWidth={3} className="text-emerald-300" />
                    </div>

                    <p className="text-[12px] font-bold text-white/40 mb-2">
                        Étape {carte.numero} sur {carte.total}
                    </p>
                    <h2 className="text-[22px] font-black text-white leading-tight mb-3 text-balance">
                        {carte.titre}
                    </h2>
                    <p className="text-[15px] text-white/70 leading-relaxed">{carte.acquis}</p>

                    {carte.suite && (
                        <div className="mt-7 pt-5 border-t border-white/10 w-full">
                            <p className="text-[12px] font-bold text-white/40 mb-1.5">
                                La suite
                            </p>
                            <p className="text-[15px] font-bold text-white/90">{carte.suite}</p>
                        </div>
                    )}
                </div>
            );

        case 'bilan':
            return (
                <>
                    <Bandeau motif="bilan" />
                    <Nature Icone={CircleCheck} libelle="Le bilan" teinte="emeraude" />
                    <EnTete titre={carte.titre} />
                    <ul className="space-y-3">
                        {carte.retenir.map(r => (
                            <li key={r} className="flex items-start gap-2.5">
                                <Check size={17} strokeWidth={3} className="text-emerald-500 mt-[3px] shrink-0" />
                                <span className="text-[15px] text-slate-800 font-bold leading-snug">{r}</span>
                            </li>
                        ))}
                    </ul>
                    {carte.note && (
                        <p className="text-[13.5px] text-slate-500 leading-[1.55] mt-5 pt-4 border-t border-slate-100">
                            {carte.note}
                        </p>
                    )}
                </>
            );
    }
}

/**
 * Mise en situation : le moniteur répond avant de voir la correction.
 *
 * L'engagement est ce qui fait la différence entre lire une bonne pratique et l'apprendre —
 * d'où le fait de masquer la correction tant qu'aucune option n'est choisie.
 */
function Exercice({ carte, onReponduChange }: {
    carte: Extract<CarteFormation, { genre: 'exercice' }>;
    /** Signale à la carte parente de basculer du swipe vers le scroll une fois répondu —
     *  la correction peut dépasser la hauteur d'écran, et les deux gestes se disputeraient
     *  sinon le même axe vertical. */
    onReponduChange: (repondu: boolean) => void;
}) {
    const [choisi, setChoisi] = useState<string | null>(null);

    const choisir = (cle: string) => {
        setChoisi(cle);
        onReponduChange(true);
    };

    return (
        <div className="flex flex-col">
            <Bandeau motif="exercice" />
            <Nature Icone={PenLine} libelle="Mise en situation" teinte="indigo" />
            <EnTete titre={carte.titre} />
            <Paragraphes texte={carte.enonce} className="text-[15.5px] text-slate-600 leading-[1.6]" />

            <div className="space-y-2 mt-4">
                {carte.options.map(o => {
                    const actif = choisi === o.cle;
                    const juste = o.cle === carte.bonneReponse;
                    return (
                        <button
                            key={o.cle}
                            onClick={() => choisir(o.cle)}
                            disabled={choisi !== null}
                            className={clsx(
                                'w-full flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-left transition-colors',
                                choisi === null && 'border-slate-200 hover:border-indigo-300 active:bg-slate-50',
                                choisi !== null && juste && 'border-emerald-300 bg-emerald-50',
                                choisi !== null && !juste && actif && 'border-rose-300 bg-rose-50',
                                choisi !== null && !juste && !actif && 'border-slate-100 opacity-50',
                            )}
                        >
                            <span className={clsx(
                                'text-[11px] font-black shrink-0 size-5 rounded-md flex items-center justify-center mt-0.5',
                                choisi !== null && juste ? 'bg-emerald-500 text-white'
                                    : choisi !== null && actif ? 'bg-rose-400 text-white'
                                    : 'bg-slate-100 text-slate-500',
                            )}>
                                {o.cle}
                            </span>
                            <span className="text-[14px] text-slate-800 leading-snug">{o.texte}</span>
                        </button>
                    );
                })}
            </div>

            {choisi !== null && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl bg-slate-50 px-3.5 py-3 mt-3"
                >
                    <Paragraphes texte={carte.correction} className="text-[13.5px] text-slate-700 leading-[1.55]" />
                </motion.div>
            )}
        </div>
    );
}

/**
 * Renforcement léger, en fin de pile — deux boutons, pas trois options à lire.
 *
 * Contrairement à `Exercice` (mise en situation nouvelle, en fin de module), cette carte
 * réactive une notion qui vient juste d'être vue dans la pile — jamais un nouveau cas à
 * raisonner. D'où le format réduit : lu et répondu en quelques secondes, cohérent avec le
 * rythme d'une pile qu'on ne veut pas casser par un exercice long.
 */
function VraiFaux({ carte, onReponduChange }: {
    carte: Extract<CarteFormation, { genre: 'vrai_faux' }>;
    onReponduChange: (repondu: boolean) => void;
}) {
    const [choisi, setChoisi] = useState<boolean | null>(null);
    const correct = choisi !== null && choisi === carte.reponse;

    const choisir = (val: boolean) => {
        setChoisi(val);
        onReponduChange(true);
    };

    return (
        <div className="flex flex-col">
            <Bandeau motif="exercice" />
            <Nature Icone={PenLine} libelle="Vrai ou faux" teinte="indigo" />
            <EnTete titre={carte.titre} />
            <p className="text-[15.5px] text-slate-700 font-semibold leading-[1.5]">{carte.affirmation}</p>

            <div className="flex gap-2.5 mt-4">
                {([true, false] as const).map(val => {
                    const actif = choisi === val;
                    const juste = val === carte.reponse;
                    return (
                        <button
                            key={String(val)}
                            onClick={() => choisir(val)}
                            disabled={choisi !== null}
                            className={clsx(
                                'flex-1 rounded-xl border py-3 text-[14px] font-black text-center transition-colors',
                                choisi === null && 'border-slate-200 hover:border-indigo-300 active:bg-slate-50 text-slate-700',
                                choisi !== null && juste && 'border-emerald-300 bg-emerald-50 text-emerald-700',
                                choisi !== null && !juste && actif && 'border-rose-300 bg-rose-50 text-rose-600',
                                choisi !== null && !juste && !actif && 'border-slate-100 opacity-50 text-slate-400',
                            )}
                        >
                            {val ? 'Vrai' : 'Faux'}
                        </button>
                    );
                })}
            </div>

            {choisi !== null && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={clsx(
                        'rounded-xl px-3.5 py-3 mt-3',
                        correct ? 'bg-emerald-50' : 'bg-rose-50',
                    )}
                >
                    <p className={clsx(
                        'text-[13.5px] leading-[1.55]',
                        correct ? 'text-emerald-800' : 'text-rose-800',
                    )}>
                        {carte.explication}
                    </p>
                </motion.div>
            )}
        </div>
    );
}

/**
 * Une carte physique de la pile : glissable à la souris comme au doigt. Lâchée au-delà du
 * seuil, elle part hors écran ; relâchée en deçà, elle revient se recaler d'elle-même.
 */
function Carte({
    carte, actif, decalage, onSortie, onReponduChange,
}: {
    carte: CarteFormation;
    /** Seule la carte du dessus (decalage 0) répond au glissement. */
    actif: boolean;
    /** Position dans la pile visible : 0 = dessus, 1 = juste dessous, etc. */
    decalage: number;
    onSortie: (sens: 1 | -1) => void;
    /** Relayé par `CarteLecteur`, uniquement sur la carte active — sert à faire pulser le
     *  bouton « Suivant » une fois le swipe indisponible. */
    onReponduChange?: (repondu: boolean) => void;
}) {
    const x = useMotionValue(0);
    const rotation = useTransform(x, [-200, 200], [-8, 8]);
    // Glisser vers la gauche avance (voir `relacher`) : « Suite » apparaît quand x devient
    // négatif, « Retour » quand x devient positif.
    const opaciteAvant = useTransform(x, [-120, -20], [1, 0]);
    const opaciteArriere = useTransform(x, [20, 120], [0, 1]);
    /** La respiration s'habille en sombre : badges et bordures s'y adaptent. */
    const sombre = carte.genre === 'respiration';
    // Une carte `exercice`/`vrai_faux` peut dépasser la hauteur d'écran une fois la
    // correction affichée — avant, elle tient toujours dans la carte. On ne bascule donc
    // vers le scroll qu'à ce moment précis, jamais avant : le swipe reste le seul geste
    // tant qu'il n'y a rien de plus à lire.
    const [repondu, setRepondu] = useState(false);
    const swipable = actif && !repondu;

    const marquerRepondu = (val: boolean) => {
        setRepondu(val);
        onReponduChange?.(val);
    };

    const relacher = (_: unknown, info: PanInfo) => {
        if (info.offset.x <= -SEUIL_SWIPE) onSortie(1);
        else if (info.offset.x >= SEUIL_SWIPE) onSortie(-1);
    };

    return (
        <motion.div
            style={{ x: swipable ? x : 0, rotate: swipable ? rotation : 0, zIndex: 10 - decalage }}
            initial={false}
            animate={{ scale: 1 - decalage * 0.04, y: decalage * 12, opacity: decalage > 2 ? 0 : 1 }}
            exit={{ x: x.get() < 0 ? -400 : 400, opacity: 0, transition: { duration: 0.25 } }}
            drag={swipable ? 'x' : false}
            dragElastic={0.7}
            dragSnapToOrigin
            onDragEnd={relacher}
            className={clsx(
                'absolute inset-0 rounded-[28px] shadow-2xl border overflow-hidden',
                // La respiration s'habille en sombre : le palier doit se reconnaître avant
                // même d'être lu, tout en restant une carte qu'on swipe comme les autres.
                carte.genre === 'respiration'
                    ? 'bg-indigo-950 border-indigo-800/60'
                    : 'bg-white border-slate-100',
                // `touch-none` cède le geste tactile à framer-motion : sans lui le
                // navigateur garde la main et le swipe ne part jamais sur mobile. Retiré
                // dès que le scroll doit reprendre la main (voir `swipable`).
                swipable && 'cursor-grab touch-none select-none',
            )}
        >
            {/* Mise en page unique : toutes les cartes portent un bandeau de tête (photo ou
                motif), donc toutes s'ancrent en haut. C'est cette régularité qui évite au
                texte de sauter d'une carte à l'autre — pas besoin de centrer les cartes
                courtes, le bandeau leur donne déjà leur assise.

                Pas de défilement par défaut : une carte qui déborde est une carte à
                découper, et un scroll entrerait en conflit avec le swipe qui capte le
                touch. Exception assumée pour `exercice`/`vrai_faux` une fois répondu
                (`repondu`) : le scroll y remplace alors le swipe plutôt que de coexister
                avec lui, donc aucun conflit de geste. */}
            <div className={clsx('h-full px-6 py-7 flex flex-col', repondu && 'overflow-y-auto overscroll-contain')}>
                {actif && (
                    <>
                        <motion.span
                            style={{ opacity: opaciteArriere }}
                            className={clsx(
                                'absolute top-4 left-4 text-[12px] font-bold rounded-lg px-2 py-1 -rotate-12 z-10 border-2',
                                sombre
                                    ? 'text-white/40 border-white/25'
                                    : 'text-slate-300 border-slate-200',
                            )}
                        >
                            Retour
                        </motion.span>
                        <motion.span
                            style={{ opacity: opaciteAvant }}
                            className={clsx(
                                'absolute top-4 right-4 text-[12px] font-bold rounded-lg px-2 py-1 rotate-12 z-10 border-2',
                                sombre
                                    ? 'text-emerald-300 border-emerald-400/50'
                                    : 'text-indigo-400 border-indigo-300',
                            )}
                        >
                            Suite
                        </motion.span>
                    </>
                )}
                <RenduCarte carte={carte} onReponduChange={marquerRepondu} />
            </div>
        </motion.div>
    );
}

function CarteLecteur({
    lecon, onFini, onQuitter,
}: {
    lecon: LeconFormation;
    onFini: () => void;
    onQuitter: () => void;
}) {
    // Flux plat : les cartes de contenu et les respirations de fin de pile, dans l'ordre.
    // Le lecteur n'a donc aucune notion de pile à gérer — c'est  qui les intercale,
    // et une respiration se swipe exactement comme les autres cartes.
    const cartes = useMemo(() => cartesDe(lecon), [lecon]);
    const [index, setIndex] = useState(0);
    const derniere = index === cartes.length - 1;
    const courante = cartes[index];

    // Vrai dès que la carte active (exercice/vrai_faux) a reçu une réponse et bascule sur
    // le scroll — le swipe n'est alors plus disponible, d'où le bouton qui pulse pour
    // signaler que c'est désormais la seule façon d'avancer. Réinitialisé à chaque
    // changement de carte, jamais reporté d'une carte à l'autre.
    const [repondu, setRepondu] = useState(false);

    // Le swipe fait progresser dans les cartes mais ne ferme jamais le module — sur la
    // dernière carte, un swipe vers l'avant ne fait rien : fermer est une action à part,
    // volontaire, qui ne doit pas pouvoir arriver par un geste qu'on a l'habitude de
    // répéter sans y penser. Seul le clic sur « Terminer » (`terminer`, plus bas) le fait.
    const avancer = (sens: 1 | -1) => {
        if (sens === 1) {
            if (!derniere) setIndex(i => i + 1);
        } else if (index === 0) {
            onQuitter();
        } else {
            setIndex(i => i - 1);
        }
        setRepondu(false);
    };

    const terminer = () => {
        if (derniere) onFini();
        else avancer(1);
    };

    // Les cartes suivantes restent montées derrière pour que la pile se voie avant même de
    // glisser — sans ça rien ne dit qu'il y a une suite.
    const visibles = cartes
        .map((carte, i) => ({ carte, i }))
        .filter(({ i }) => i >= index && i <= index + 3);

    // Le libellé du bouton suit la nature de la carte : sur une respiration, « Suivant »
    // sonnerait comme une page de plus alors que c'est un palier franchi.
    const libelleBouton = courante.genre === 'respiration'
        ? (courante.suite ? 'Continuer' : 'Terminer le module')
        : 'Suivant';

    return (
        //  : le lecteur occupe exactement l'écran et ne défile jamais —
        // ni la page, ni les cartes. C'est ce qui garantit que le swipe est le seul geste
        // possible… et donc qu'il n'entre en concurrence avec rien.
        <div className="fixed inset-0 z-[60] bg-slate-900 flex flex-col overflow-hidden">
            {/* Une jauge par pile, segmentée en autant de traits que de cartes (respiration
                comprise) : le moniteur voit à la fois où il en est dans l'étape et combien
                d'étapes composent le module. Une seule barre ne disait ni l'un ni l'autre. */}
            <div className="mx-auto flex w-full max-w-[440px] gap-2 px-5 pt-[calc(env(safe-area-inset-top)+1rem)] pb-3">
                {lecon.piles.map((pile, iPile) => {
                    // Rang de la première carte de cette pile dans le flux, respirations
                    // des piles précédentes incluses.
                    const debut = lecon.piles
                        .slice(0, iPile)
                        .reduce((n, p) => n + p.cartes.length + 1, 0);
                    return (
                        <div key={pile.titre} className="flex gap-0.5 flex-1">
                            {Array.from({ length: pile.cartes.length + 1 }).map((_, i) => (
                                <div key={i} className="h-1 flex-1 rounded-full bg-white/20 overflow-hidden">
                                    <div className={clsx(
                                        'h-full bg-white transition-all',
                                        debut + i <= index ? 'w-full' : 'w-0',
                                    )} />
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>

            <div className="mx-auto flex w-full max-w-[440px] items-center justify-between px-5 pb-3">
                <button onClick={onQuitter} aria-label="Fermer" className="text-white/70 active:text-white">
                    <X size={22} strokeWidth={2.5} />
                </button>
                <p className="text-[12px] font-bold text-white/50">
                    {lecon.titre} · {index + 1}/{cartes.length}
                </p>
            </div>

            {/* Les cartes sont en `absolute inset-0`, qui ignore le padding : le cadre
                intérieur `relative` porte la marge avec les bords de l'écran. */}
            <div className="flex-1 px-3 pb-4 min-h-0">
                <div className="relative mx-auto h-full w-full max-w-[440px]">
                <AnimatePresence>
                    {[...visibles].reverse().map(({ carte, i }) => (
                        <Carte
                            key={i}
                            carte={carte}
                            actif={i === index}
                            decalage={i - index}
                            onSortie={avancer}
                            onReponduChange={i === index ? setRepondu : undefined}
                        />
                    ))}
                </AnimatePresence>
                </div>
            </div>

            <div className="mx-auto flex w-full max-w-[440px] gap-3 px-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-2">
                {/* La place du retour est toujours réservée : le faire apparaître décalait
                    le bouton principal d'une carte à l'autre. Sur la première carte il est
                    seulement masqué, pas retiré. */}
                <button
                    onClick={() => avancer(-1)}
                    aria-label="Carte précédente"
                    tabIndex={index > 0 ? 0 : -1}
                    className={clsx(
                        'size-[52px] shrink-0 rounded-2xl bg-white/10 text-white flex items-center justify-center transition-all',
                        index > 0 ? 'opacity-100 active:scale-95' : 'opacity-0 pointer-events-none',
                    )}
                >
                    <ArrowLeft size={20} strokeWidth={2.5} />
                </button>
                {/* Dès que le swipe cède la place au scroll (voir `repondu` dans `Carte`),
                    ce bouton devient le seul moyen d'avancer — une pulsation seule s'est
                    révélée trop discrète pour le signaler. Le fond passe en indigo plein
                    (au lieu du blanc neutre habituel) en plus de pulser : un vrai
                    changement de couleur se remarque même en vision périphérique. */}
                <motion.button
                    onClick={terminer}
                    animate={repondu ? { scale: [1, 1.04, 1] } : { scale: 1 }}
                    transition={repondu ? { duration: 1.1, repeat: Infinity, ease: 'easeInOut' } : undefined}
                    className={clsx(
                        'flex-1 py-3.5 rounded-2xl font-black text-sm transition-colors active:scale-[0.98]',
                        repondu ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40' : 'bg-white text-slate-900',
                    )}
                >
                    {libelleBouton}
                </motion.button>
            </div>
        </div>
    );
}

/**
 * Grande carte de thème, à l'accueil du parcours.
 *
 * Format compact, pensé pour que les 4 tiennent sans scroll excessif : une pastille
 * d'icône (pas une icône démesurée en fond, qui alourdissait sans rien apporter), une
 * ligne de titre, une ligne de description, une fine barre de progression et le résumé
 * de ce qui reste. Le dégradé plein reste l'énergie visuelle façon Primer — c'est la
 * densité du contenu à l'intérieur qui change, pas la couleur.
 *
 * Répond à trois questions d'un coup d'œil : où j'en suis (X/Y avec une barre), et ce
 * qu'il reste — en distinguant « pas encore fait par toi » de « pas encore écrit par
 * l'équipe », deux réalités différentes qu'un simple total confondait.
 */
function CarteTheme({ section, nbFaits, onOuvrir }: {
    section: SectionFormation;
    nbFaits: number;
    onOuvrir: () => void;
}) {
    const nbRediges = section.modules.filter(m => m.leconId).length;
    const pct = nbRediges ? Math.min(100, nbFaits / nbRediges * 100) : 0;
    const visuals = {
        pourquoi: { tone: 'var(--co-sand)', kind: 'compass' },
        'quoi-dire': { tone: 'var(--co-coral)', kind: 'talk' },
        'faire-vivre': { tone: 'var(--co-sea)', kind: 'waves' },
        methode: { tone: 'var(--co-leaf)', kind: 'leaf' },
    } as const;
    const visual = visuals[section.id];
    return <motion.button onClick={onOuvrir} whileTap={{ scale: 0.98 }} className="co-course" style={{ background: visual.tone }}>
        <CoastalMark kind={visual.kind}/>
        <h2>{section.titre}</h2>
        <div className="co-course-meta"><span>{nbRediges} modules · {section.modules.filter(m => m.leconId).reduce((total, m) => total + m.duree_min, 0)} min</span><span>{nbFaits} parcourus</span></div>
        <div className="co-progress" aria-label={`${nbFaits} modules parcourus sur ${nbRediges}`}><span style={{ width: `${pct}%` }}/></div>
    </motion.button>;
}

/**
 * Ligne de module, dans l'écran d'un thème ouvert.
 *
 * Soit un module rédigé (cliquable, coché une fois fait), soit un module annoncé mais pas
 * encore écrit (affiché pour situer le thème, non cliquable). Montrer les deux dans la
 * même liste dit une chose : voici tout ce que couvre ce thème, une partie existe déjà, le
 * reste vient.
 */
function LigneModule({ module, lecon, fait, teinte, onOuvrir }: {
    module: ModulePlanifie;
    lecon: LeconFormation | undefined;
    fait: boolean;
    teinte: { vif: string };
    onOuvrir: (lecon: LeconFormation) => void;
}) {
    const contenu = (
        <>
            <span
                className={clsx(
                    'shrink-0 size-11 rounded-xl flex items-center justify-center font-black text-sm',
                    !lecon && 'bg-slate-100 text-slate-400',
                )}
                style={lecon ? { background: fait ? undefined : `${teinte.vif}1a`, color: fait ? undefined : teinte.vif } : undefined}
            >
                {fait
                    ? <span className="size-full rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><Check size={20} strokeWidth={3} /></span>
                    : module.numero}
            </span>
            <div className="flex-1 min-w-0">
                <p className={clsx('text-sm font-black', lecon ? 'text-slate-900' : 'text-slate-500')}>
                    {module.titre}
                </p>
                <p className="text-[12px] text-slate-500 mt-0.5 leading-snug">{module.accroche}</p>
            </div>
            {lecon ? (
                <p className="text-[12px] font-bold text-slate-400 shrink-0">
                    {module.duree_min} min
                </p>
            ) : (
                <span className="flex items-center gap-1 text-[12px] font-bold text-slate-300 shrink-0">
                    <Clock size={12} strokeWidth={2.5} />
                    Bientôt
                </span>
            )}
        </>
    );

    if (!lecon) {
        // Pas de bouton : rien à ouvrir. `aria-disabled` plutôt qu'un vrai `disabled` sur
        // un élément non interactif — c'est un `div`, pas un contrôle de formulaire.
        return (
            <div
                aria-disabled="true"
                className="w-full flex items-center gap-3.5 rounded-2xl bg-white/60 border border-slate-100 px-4 py-4 opacity-70"
            >
                {contenu}
            </div>
        );
    }

    return (
        <button
            onClick={() => onOuvrir(lecon)}
            className={clsx(
                'w-full flex items-center gap-3.5 rounded-2xl bg-white border px-4 py-4 text-left transition-colors active:scale-[0.99]',
                fait ? 'border-emerald-200' : 'border-slate-200 hover:border-indigo-300',
            )}
        >
            {contenu}
        </button>
    );
}

/**
 * Écran d'un thème ouvert : son bandeau coloré plein écran (même langage que la carte
 * d'accueil, agrandi) puis la liste de ses modules.
 */
function EcranTheme({ section, leconParId, termine, onRetour, onOuvrirModule }: {
    section: SectionFormation;
    leconParId: Map<string, LeconFormation>;
    termine: Set<string>;
    onRetour: () => void;
    onOuvrirModule: (lecon: LeconFormation) => void;
}) {
    const teinte = TEINTE_THEME[section.id];
    const Icone = teinte.icone;

    return (
        <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.2 }}
            className="co-formation-overlay fixed inset-0 z-50 bg-[var(--co-paper)] overflow-y-auto"
        >
            <div
                className="relative px-6 pt-[calc(env(safe-area-inset-top)+1rem)] pb-8"
                style={{ background: `linear-gradient(150deg, ${teinte.vif}, ${teinte.sombre})` }}
            >
                <Icone
                    aria-hidden
                    size={200}
                    strokeWidth={1.5}
                    className="absolute -right-10 -bottom-14 text-white/[0.14] pointer-events-none"
                />
                <button
                    onClick={onRetour}
                    aria-label="Retour"
                    className="relative text-white/80 active:text-white mb-5"
                >
                    <ArrowLeft size={22} strokeWidth={2.5} />
                </button>
                <p className="relative text-[12px] font-bold text-white/70 mb-1.5">
                    {section.modules.length} module{section.modules.length > 1 ? 's' : ''}
                </p>
                <h1 className="relative text-[32px] font-semibold tracking-[-.045em] text-white leading-tight text-balance">
                    {section.titre}
                </h1>
                <p className="relative text-[14px] text-white/80 mt-1.5 max-w-sm">{section.description}</p>
            </div>

            <div className="px-4 py-5 space-y-2.5 max-w-lg mx-auto w-full -mt-4">
                {section.modules.map(module => (
                    <LigneModule
                        key={module.numero}
                        module={module}
                        teinte={teinte}
                        lecon={module.leconId ? leconParId.get(module.leconId) : undefined}
                        fait={!!module.leconId && termine.has(module.leconId)}
                        onOuvrir={onOuvrirModule}
                    />
                ))}
            </div>
        </motion.div>
    );
}

export function FormationClient({ plan, lecons, termine: termineInitial, parcours }: {
    plan: SectionFormation[];
    lecons: LeconFormation[];
    termine: string[];
    /** Avancement des parcours environnement, second volet du pôle formation. */
    parcours: { disponibles: number; enCours: number; termines: number };
}) {
    const [termine, setTermine] = useState(new Set(termineInitial));
    const [themeOuvert, setThemeOuvert] = useState<SectionFormation | null>(null);
    const [ouverte, setOuverte] = useState<LeconFormation | null>(null);
    const leconParId = useMemo(() => new Map(lecons.map(l => [l.id, l])), [lecons]);

    const finirLecon = (lecon: LeconFormation) => {
        setOuverte(null);
        // Optimiste : le coche ne doit pas attendre l'aller-retour serveur. En cas d'échec le
        // moniteur peut rejouer le module — `marquerLeconTerminee` est idempotent.
        setTermine(prev => new Set(prev).add(lecon.id));
        void marquerLeconTerminee(lecon.id);
    };

    const nbTermine = lecons.filter(l => termine.has(l.id)).length;
    const nbRediges = lecons.length;

    return (
        <div className="co-page">
            {/* Une seule intro : le titre, puis le cadre de la formation (on ne forme pas
                des guides nature — voir AGENTS.md), puis l'avancement. L'ancien sous-titre
                et le second surtitre empilaient cinq niveaux de texte avant les thèmes. */}
            <header className="co-formation-intro">
                <div className="flex items-start gap-2">
                {/* Retour en flèche seule, comme Explorer et les parcours. */}
                <Link href="/stages" aria-label="Retour à l’accueil" className="-ml-2 mt-5 flex size-11 shrink-0 items-center justify-center rounded-full text-encre hover:bg-white/60">
                    <span className="material-symbols-outlined" aria-hidden>arrow_back</span>
                </Link>
                <div>
                <p className="co-eyebrow">Formation</p>
                <h1>Comment parler d’environnement</h1>
                </div>
                </div>
                {/* Le message fondateur mis en exergue, comme une citation : c'est la promesse
                    de la formation, pas un paragraphe d'introduction parmi d'autres. */}
                <blockquote className="co-formation-quote">
                    <p>Moniteur avant tout, curieux de son milieu. Sans faire de vous un naturaliste, cette formation vous aide à comprendre l’essentiel de votre milieu de pratique et en parler simplement, en quelques minutes, pendant vos séances.</p>
                </blockquote>
                <div className="co-formation-avancement">
                    <span><strong>{nbTermine}</strong> / {nbRediges} modules parcourus</span>
                    <span className="co-progress"><span style={{ width: `${nbRediges ? nbTermine / nbRediges * 100 : 0}%` }}/></span>
                </div>
            </header>
            <main className="co-course-grid">
                {plan.map(section => (
                    <CarteTheme
                        key={section.id}
                        section={section}
                        nbFaits={section.modules.filter(m => m.leconId && termine.has(m.leconId)).length}
                        onOuvrir={() => setThemeOuvert(section)}
                    />
                ))}
                {/* Les parcours, 5e entrée de la formation. Ils se distinguent des quatre
                    thèmes : ce ne sont pas des modules à lire mais des sujets à approfondir
                    jusqu'à l'essai avec son groupe — d'où le fond encre et la mention « Parcours ». */}
                <Link href="/specialisation" className="co-course co-course-parcours">
                    <span className="co-course-tag">Parcours</span>
                    <CoastalMark kind="waves"/>
                    <h2>Approfondir un sujet du littoral</h2>
                    <div className="co-course-meta"><span>{parcours.disponibles} parcours</span><span>{parcours.termines} terminé{parcours.termines > 1 ? 's' : ''}</span></div>
                    <div className="co-progress" aria-label={`${parcours.termines} parcours terminés sur ${parcours.disponibles}`}><span style={{ width: `${parcours.disponibles ? parcours.termines / parcours.disponibles * 100 : 0}%` }}/></div>
                </Link>
            </main>

            <AnimatePresence>
                {themeOuvert && (
                    <EcranTheme
                        section={themeOuvert}
                        leconParId={leconParId}
                        termine={termine}
                        onRetour={() => setThemeOuvert(null)}
                        onOuvrirModule={setOuverte}
                    />
                )}
            </AnimatePresence>

            {ouverte && (
                <CarteLecteur
                    lecon={ouverte}
                    onFini={() => finirLecon(ouverte)}
                    onQuitter={() => setOuverte(null)}
                />
            )}
        </div>
    );
}

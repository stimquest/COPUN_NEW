'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { animate, motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import { saveObjectiveStatus } from '@/actions/stage-actions';
import type { StageObjectiveExecutionStatus } from '@/types';
import { iconeMaterial } from '@/components/ui/Icone';

const ArrowRight = iconeMaterial('arrow_forward');

/** Hauteur de la bande de titre qui dépasse de chaque carte de derrière. */
const DECALAGE_TITRE = 54;

/**
 * Une carte de la pile. Même mécanique que la pile Explorer : `x` suit le doigt sans rendu
 * React par frame, la rotation en dérive ; au-delà du seuil la carte sort complètement
 * avant que la suivante ne prenne sa place, sinon elle revient au centre sur un ressort.
 */
function CarteDeLaPile({ rang, multiple, onPasser, onAmener, children }: {
    rang: number;
    multiple: boolean;
    onPasser: () => void;
    onAmener: () => void;
    children: React.ReactNode;
}) {
    const estDessus = rang === 0;
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-240, 240], [-10, 10]);
    const sortie = useRef(false);

    const relacher = async (_: unknown, info: PanInfo) => {
        if (info.offset.x < -90 || info.velocity.x < -600) {
            sortie.current = true;
            await animate(x, -(window.innerWidth + 200), { duration: 0.28, ease: [0.32, 0, 0.67, 0] });
            sortie.current = false;
            onPasser();
            x.jump(0);
        } else animate(x, 0, { type: 'spring', damping: 30, stiffness: 320 });
    };

    return <motion.div
        className={estDessus ? 'co-hand-top' : 'co-hand-back'}
        style={{ zIndex: 20 - rang, x: estDessus ? x : 0, rotate: estDessus ? rotate : 0 }}
        initial={false}
        animate={{ y: -rang * DECALAGE_TITRE, scale: 1 - rang * 0.04 }}
        transition={{ type: 'spring', damping: 30, stiffness: 320 }}
        drag={estDessus && multiple ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.7, right: 0.12 }}
        dragMomentum={false}
        onDragEnd={estDessus ? relacher : undefined}
        onClick={estDessus ? undefined : onAmener}
        role={estDessus ? undefined : 'button'}
        tabIndex={estDessus ? undefined : 0}
        onKeyDown={estDessus ? undefined : event => { if (event.key === 'Enter' || event.key === ' ') onAmener(); }}>
        {children}
    </motion.div>;
}

type Objective = {
    id: string;
    question: string;
    objectif: string;
    accroche?: string;
    /** Nom de la forme de l'accroche (« Le pari »…), comme dans les cartes Explorer. */
    forme?: string;
    retenir?: string;
    action?: string | null;
    initialStatus: StageObjectiveExecutionStatus;
};

/**
 * Où en est le moniteur sur chaque sujet de sa semaine — son point de vue, pas celui du
 * groupe.
 *
 * Deux choses sont suivies dans l'application, et elles ne viennent pas de la même source :
 *
 *   - avoir abordé un sujet ne se constate que par le moniteur. C'est ce tableau : un
 *     repère personnel, qu'il tient pour lui et complète au bilan.
 *   - avoir mené l'action avec le groupe ne se déclare pas : ce sont les enfants qui la
 *     confirment au quiz de fin, et seule la caméra en fait foi. Un bouton ici ne pourrait
 *     produire qu'une déclaration du moniteur sur lui-même — rien d'opposable au club.
 *
 * D'où trois états et non un : aborder un sujet est graduel. On l'a effleuré en passant,
 * ou on a pris le temps de le traiter — et cette nuance est justement ce que le moniteur
 * veut retrouver en préparant la semaine suivante.
 */
const ETATS: { valeur: StageObjectiveExecutionStatus; libelle: string }[] = [
    { valeur: 'not_done', libelle: 'Pas encore' },
    { valeur: 'partial', libelle: 'Effleuré' },
    { valeur: 'done', libelle: 'Abordé' },
];

function ObjectiveCard({ objective, status, pending, error, choisir }: {
    objective: Objective;
    status: StageObjectiveExecutionStatus;
    pending: boolean;
    error: string | null;
    choisir: (next: StageObjectiveExecutionStatus) => void;
}) {
    return <article className="co-hand-card">
        <div className="co-week-objective-body">
            {/* Le statut n'apparaît que sur les cartes de derrière (voir CSS) : sur la carte
                ouverte, les boutons le montrent déjà. */}
            <div className="co-hand-card-head">
                <h3>{objective.question}</h3>
                {status !== 'not_done' && <span className={`co-hand-card-status co-hand-card-status-${status}`}>{ETATS.find(etat => etat.valeur === status)?.libelle}</span>}
            </div>
            {/* Se lit comme un article, au calme, pendant la préparation : l'accroche en
                citation, puis deux paragraphes à intertitre. Pas de cases. */}
            {objective.accroche && <section className="co-week-article-open">
                <p className="co-week-article-caption"><span>J’ouvre avec</span>{objective.forme && <strong>{objective.forme}</strong>}</p>
                <blockquote>« {objective.accroche} »</blockquote>
            </section>}
            {objective.action && <section className="co-week-article-groupe"><h4>Avec le groupe</h4><p>{objective.action}</p></section>}
            {objective.retenir && <section className="co-week-article-part co-week-article-retenir"><h4>À retenir</h4><p>{objective.retenir}</p></section>}
            <div className="co-week-objective-status" aria-label="Où j’en suis sur ce sujet">
                {ETATS.map(etat => (
                    <button key={etat.valeur} type="button" aria-pressed={status === etat.valeur} disabled={pending}
                        onClick={() => choisir(etat.valeur)}>
                        {etat.libelle}
                    </button>
                ))}
            </div>
            {error && <p className="co-week-objective-error" role="alert">{error}</p>}
        </div>
    </article>;
}

/**
 * Une entrée supplémentaire, au même rang que les sujets de la semaine.
 *
 * Le quiz d'animation est une chose de plus à faire vivre avec le groupe, pas un réglage
 * annexe : en lien de bas de page il se lisait comme une option de service, alors que c'est
 * un outil que le moniteur peut sortir aussi souvent que ses cartes. Il n'a pas d'états à
 * cocher — il ne valide rien, et rien ne s'y suit.
 */
export type EntreeLibre = { href: string; titre: string; detail: string };

export function WeekObjectiveTracker({ stageId, objectives, extra }: {
    stageId: string;
    objectives: Objective[];
    extra?: EntreeLibre;
}) {
    /* La carte devant est mémorisée par semaine, sur l'appareil (simple confort de
       lecture : rien de partagé). On retient l'identifiant, pas la position, pour
       rester juste si la sélection de la semaine change entre-temps. */
    const cleMemoire = `copun:pile:${stageId}`;
    const [active, setActiveState] = useState(0);
    useEffect(() => {
        try {
            const id = localStorage.getItem(cleMemoire);
            const index = objectives.findIndex(objective => objective.id === id);
            if (index > 0) { setActiveState(index); return; }
        } catch { /* stockage indisponible */ }
        // Sans carte mémorisée : la première qui n'est pas encore abordée.
        const premiere = objectives.findIndex(objective => objective.initialStatus !== 'done');
        if (premiere > 0) setActiveState(premiere);
        // Lecture unique au montage.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const setActive = (next: number | ((current: number) => number)) => setActiveState(current => {
        const index = typeof next === 'function' ? next(current) : next;
        try { localStorage.setItem(cleMemoire, objectives[index].id); } catch { /* sans effet */ }
        return index;
    });
    const [statuses, setStatuses] = useState<Record<string, StageObjectiveExecutionStatus>>(
        () => Object.fromEntries(objectives.map(objective => [objective.id, objective.initialStatus])));
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();
    const courante = objectives[Math.min(active, objectives.length - 1)];

    const choisir = (next: StageObjectiveExecutionStatus) => {
        const id = courante.id;
        const previous = statuses[id];
        setStatuses(current => ({ ...current, [id]: next }));
        setError(null);
        startTransition(async () => {
            const result = await saveObjectiveStatus(stageId, id, next);
            if (!result.success) {
                setStatuses(current => ({ ...current, [id]: previous }));
                setError('État non enregistré. Réessayez.');
            }
        });
    };
    /* Une seule pile, comme en Explorer : chaque carte de derrière est remontée d'une
       hauteur de titre, si bien que son titre dépasse au-dessus de la carte ouverte. Le
       swipe vers la gauche passe la carte (elle retourne au fond) ; un tap sur un titre
       qui dépasse amène cette carte devant. */
    /* Les cartes abordées sortent de la rotation : elles restent au fond (tout en haut,
       titre et pastille visibles) et ne reviennent devant que par un tap. La carte
       ouverte, même tout juste notée « Abordé », reste devant jusqu'au prochain swipe —
       le temps de finir de lire ou de corriger un tap. Quand tout est abordé, le swipe
       fait de nouveau tourner toutes les cartes. */
    const n = objectives.length;
    const suivantes = Array.from({ length: n - 1 }, (_, offset) => (active + 1 + offset) % n);
    const aborde = (index: number) => statuses[objectives[index].id] === 'done';
    const enRotation = suivantes.filter(index => !aborde(index));
    const toutAborde = enRotation.length === 0;
    const ordre = toutAborde ? [active, ...suivantes] : [active, ...enRotation, ...suivantes.filter(aborde)];
    const prochaine = toutAborde ? suivantes[0] : enRotation[0];

    return <div className="co-week-objectives">
        <div className="co-hand" style={{ '--pile-top': `${18 + (objectives.length - 1) * DECALAGE_TITRE}px` } as React.CSSProperties}>
            {ordre.map((index, rang) => <CarteDeLaPile key={objectives[index].id} rang={rang}
                onPasser={() => { setError(null); if (prochaine !== undefined) setActive(prochaine); }}
                onAmener={() => { setError(null); setActive(index); }}
                multiple={objectives.length > 1}>
                <ObjectiveCard objective={objectives[index]} status={statuses[objectives[index].id]}
                    pending={rang === 0 && pending} error={rang === 0 ? error : null}
                    choisir={rang === 0 ? choisir : () => {}}/>
            </CarteDeLaPile>)}
        </div>
        {n > 1 && toutAborde && aborde(active) && <p className="co-hand-fini">Tous les sujets sont abordés. Place au quiz de fin.</p>}
        {extra && <Link href={extra.href} className="co-week-objective co-week-extra">
            <span className="co-week-objective-number" aria-hidden>＋</span>
            <div className="co-week-objective-body">
                <h3>{extra.titre}</h3>
                <p>{extra.detail}</p>
                <span className="co-week-extra-action">Lancer le quiz <ArrowRight size={15}/></span>
            </div>
        </Link>}
    </div>;
}

'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import type { AffirmationVote } from '@/data/vote-fin-de-stage';
import { enregistrerVote, type ResultatAffirmation } from '@/actions/vote-actions';
import CaptureCartons from './CaptureCartons';
import type { LectureCartons } from '@/lib/detection-cartons';

import { iconeMaterial } from '@/components/ui/Icone';
const ArrowRight = iconeMaterial('arrow_forward');
const Camera = iconeMaterial('photo_camera');
const Check = iconeMaterial('check');

/**
 * Le vote de fin de stage, côté moniteur.
 *
 * L'écran ne sert qu'à LUI : il lit l'affirmation à voix haute, le groupe lève ses panneaux,
 * il compte et saisit. Les enfants ne regardent jamais ce téléphone — c'est toute la raison
 * du format vrai/faux, qui ne demande rien à lire.
 *
 * D'où la typographie : l'affirmation est énorme parce qu'elle se lit d'un coup d'œil en
 * parlant à un groupe, pas parce qu'elle doit impressionner.
 *
 * Trois réponses et non deux : sans « partagé », un groupe hésitant serait rangé dans
 * « oui » et une action jamais menée ressortirait validée — l'erreur la plus gênante pour
 * un chiffre censé servir de justificatif.
 *
 * Un seul tap par affirmation, et aucun nombre à saisir : le moniteur regarde les panneaux,
 * juge ce que le groupe a répondu, et touche. Compter les mains une par une lui coûterait
 * quarante clics sur un moment censé durer trente secondes — il ne le ferait pas deux fois.
 * La caméra, plus tard, produira le détail chiffré ; ce que le moniteur donne ici, c'est le
 * verdict du groupe.
 */
/** Ce que le groupe a répondu, tel que le moniteur l'a jugé en regardant les panneaux. */
type Reponse = 'oui' | 'non' | 'partage';

export default function VoteClient({ stageId, affirmations, resultatsInitiaux }: {
    stageId: string;
    affirmations: AffirmationVote[];
    resultatsInitiaux: ResultatAffirmation[];
}) {
    const [index, setIndex] = useState(0);
    const [reponses, setReponses] = useState<Record<string, Reponse>>({});
    /** Décompte réel quand la caméra a lu les cartons ; absent en saisie manuelle. */
    const [decomptes, setDecomptes] = useState<Record<string, LectureCartons['decompte']>>({});
    /* Cartons distincts vus par la caméra sur l'ensemble du vote : un marqueur par enfant,
       donc le nombre de participants. Il préremplit le nombre de stagiaires du bilan. */
    const [cartonsVus, setCartonsVus] = useState<number[]>([]);
    const [camera, setCamera] = useState(false);
    const [resultatsEnregistres, setResultatsEnregistres] = useState(resultatsInitiaux);
    const [termine, setTermine] = useState(resultatsInitiaux.length > 0);
    const [error, setError] = useState('');
    const [isPending, startTransition] = useTransition();

    const courante = affirmations[index];
    const reponse = reponses[courante?.id];
    const dernier = index === affirmations.length - 1;
    const repondues = affirmations.filter(a => reponses[a.id]).length;

    /** Répondre fait avancer : sur cinq affirmations, un bouton « suivant » à chaque fois
     *  doublerait les gestes sans rien apporter. La dernière reste affichée pour laisser
     *  conclure, et on peut toujours revenir corriger. */
    const repondre = (valeur: Reponse) => {
        setReponses(prev => ({ ...prev, [courante.id]: valeur }));
        if (!dernier) window.setTimeout(() => setIndex(i => i + 1), 180);
    };

    /**
     * La caméra donne un décompte, pas un verdict : on en déduit la réponse majoritaire pour
     * faire avancer le vote, tout en gardant les nombres réels — ce sont eux qui partent en
     * base, bien plus solides que le 1/0/0 de la saisie manuelle.
     */
    const appliquerLecture = (lecture: LectureCartons) => {
        const { vrai, faux, incertain } = lecture.decompte;
        const majoritaire: Reponse = vrai >= faux && vrai >= incertain ? 'oui' : faux >= incertain ? 'non' : 'partage';
        setDecomptes(prev => ({ ...prev, [courante.id]: lecture.decompte }));
        setCartonsVus(prev => [...new Set([...prev, ...lecture.cartons.map(carton => carton.id)])]);
        setCamera(false);
        repondre(majoritaire);
    };

    const enregistrer = () => {
        setError('');
        startTransition(async () => {
            // Le moniteur donne un verdict, pas un comptage : on l'écrit dans les colonnes
            // de dépouillement sous la forme 1/0/0. Le jour où la caméra comptera vraiment,
            // elle écrira des nombres réels dans ces mêmes colonnes, et la règle de majorité
            // qui les lit n'aura pas à changer.
            const resultats: ResultatAffirmation[] = affirmations
                .filter(a => reponses[a.id])
                .map(a => {
                    const r = reponses[a.id];
                    return {
                        affirmationId: a.id,
                        contentId: a.contentId,
                        actionId: a.type === 'action' ? a.actionId : null,
                        attendu: a.type === 'savoir' ? a.reponse : null,
                        // Le décompte de la caméra prime : c'est une mesure, là où le
                        // verdict saisi à la main n'est qu'un 1/0/0 conventionnel.
                        votesVrai: decomptes[a.id]?.vrai ?? (r === 'oui' ? 1 : 0),
                        votesFaux: decomptes[a.id]?.faux ?? (r === 'non' ? 1 : 0),
                        votesIncertain: decomptes[a.id]?.incertain ?? (r === 'partage' ? 1 : 0),
                        origine: decomptes[a.id] ? 'camera' : 'manuel',
                        participants: cartonsVus.length || null,
                    };
                });
            if (!resultats.length) { setError('Répondez à au moins une affirmation.'); return; }
            const res = await enregistrerVote(stageId, resultats);
            if (!res.success) { setError(res.error ?? 'Enregistrement impossible.'); return; }
            setResultatsEnregistres(resultats);
            setTermine(true);
        });
    };

    if (!affirmations.length) {
        return <main className="co-vote">
            <p className="co-vote-kicker">Le quiz de fin</p>
            <h1>Pas encore disponible</h1>
            <p className="co-vote-lead">Les cartes de cette semaine n’ont pas encore d’affirmations à faire voter. Elles arrivent au fil des mises à jour du catalogue.</p>
            <Link href="/stages/semaines" className="co-vote-secondary">Retour à ma semaine</Link>
        </main>;
    }

    if (termine) {
        // Le vote rend deux résultats distincts, et l'écran les sépare : ce que le groupe a
        // retenu regarde le moniteur, ce qu'il a confirmé alimente sa démarche et le club.
        // Les fondre en un seul chiffre reviendrait à noter le moniteur sur le travail de
        // ses stagiaires, ou à valider des actions avec un score de connaissances.
        const parAffirmation = new Map(resultatsEnregistres.map(resultat => [resultat.affirmationId, resultat]));
        const verdict = (resultat: ResultatAffirmation | undefined): Reponse | null => {
            if (!resultat) return null;
            if (resultat.votesVrai > resultat.votesFaux && resultat.votesVrai > resultat.votesIncertain) return 'oui';
            if (resultat.votesFaux > resultat.votesVrai && resultat.votesFaux > resultat.votesIncertain) return 'non';
            return 'partage';
        };
        const savoirs = affirmations.filter(a => a.type === 'savoir');
        const justes = savoirs.filter(a => verdict(parAffirmation.get(a.id)) === (a.reponse ? 'oui' : 'non')).length;
        const actions = affirmations.filter(a => a.type === 'action');
        // Seules les actions lues par la caméra valent validation : une réponse saisie par
        // le moniteur ne peut pas le valider auprès de son propre club.
        const confirmees = actions.filter(a => {
            const resultat = parAffirmation.get(a.id);
            if (!resultat || resultat.origine !== 'camera') return false;
            const total = resultat.votesVrai + resultat.votesFaux + resultat.votesIncertain;
            return total > 0 && resultat.votesVrai * 2 > total;
        }).length;
        const saisiesMain = resultatsEnregistres.filter(resultat => resultat.origine === 'manuel').length;
        return <main className="co-vote">
            <p className="co-vote-kicker">Vote terminé</p>
            <h1>Ce que votre groupe a répondu</h1>

            {!!savoirs.length && <section className="co-vote-result">
                <p className="co-vote-result-label">Ce qu’ils ont retenu</p>
                <strong>{justes} / {savoirs.length}</strong>
                <p>{justes === savoirs.length
                    ? 'Toutes les réponses étaient justes.'
                    : justes === 0
                        ? 'Ces notions méritent d’être reprises avec eux.'
                        : 'Le reste mérite d’être repris avec eux.'}</p>
            </section>}

            {!!actions.length && <section className="co-vote-result">
                <p className="co-vote-result-label">Ce qu’ils ont confirmé avoir fait</p>
                <strong>{confirmees} / {actions.length}</strong>
                <p>{confirmees > 0
                    ? `${confirmees === 1 ? 'Cette action compte' : 'Ces actions comptent'} pour votre démarche et pour celle du club.`
                    : 'Aucune action n’a été confirmée par le groupe cette fois.'}</p>
                {/* Dit franchement ce qui ne comptera pas, et pourquoi : découvrir après coup
                    qu'une semaine entière n'a rien validé serait bien plus décourageant. */}
                {saisiesMain > 0 && <p className="co-vote-result-note">
                    {saisiesMain === 1 ? 'Une réponse a été saisie à la main' : `${saisiesMain} réponses ont été saisies à la main`} :
                    elles restent dans votre suivi, mais ne sont pas validées par le groupe.
                </p>}
            </section>}

            <Link href="/stages/semaines" className="co-vote-primary">Retour à ma semaine <ArrowRight size={18}/></Link>
        </main>;
    }

    return <main className="co-vote">
        <div className="co-vote-progress" aria-hidden="true"><span style={{ width: `${((index + 1) / affirmations.length) * 100}%` }}/></div>

        {/* L'affirmation dans une carte qui occupe la hauteur disponible : c'est la seule
            chose que le moniteur doit trouver du regard en parlant à un groupe. Posée à plat
            entre un bandeau et un bouton, elle se lisait comme un paragraphe parmi d'autres,
            et le bas de l'écran restait vide alors qu'elle en est le sujet. */}
        <section className="co-vote-carte">
            {/* Le même libellé quelle que soit la nature de l'affirmation : « Question 1 sur 4 »
                ne dit rien de plus qu'un numéro, et c'est voulu. Annoncer « confirmation » ou
                « connaissances » désignerait les questions qui comptent pour les chiffres du
                club, et le moniteur comme le groupe sauraient lesquelles soigner. */}
            <p className="co-vote-etiquette">Affirmation {index + 1} sur {affirmations.length}</p>
            <blockquote className="co-vote-affirmation">{courante.texte}</blockquote>
        </section>

        {/* VRAI / FAUX quelle que soit la nature de l'affirmation — jamais « oui, on l'a fait ».
            Tout le dispositif tient à ce que rien ne distingue une confirmation d'action d'une
            question de savoir : un libellé différent les désignerait, et le moniteur saurait
            lesquelles comptent pour ses chiffres.

            « Partagé » existe pour que l'hésitation d'un groupe ne se déverse pas dans VRAI :
            c'est elle qui empêche de valider une action qui n'a pas eu lieu. */}
        {camera && <CaptureCartons onLu={appliquerLecture} onFermer={() => setCamera(false)}/>}

        {/* La caméra compte, la saisie manuelle reste disponible : réseau, lumière, cartons
            oubliés — le moniteur doit toujours pouvoir trancher d'un tap. */}
        {!camera && <button type="button" className="co-vote-primary co-vote-lancer" onClick={() => setCamera(true)}>
            <Camera size={19}/> Lire les cartons
        </button>}

        {/* La saisie manuelle vit entièrement dans ce dépliant, fermé par défaut.

            Elle doit rester atteignable — caméra en panne, contre-jour, cartons oubliés : un
            moniteur bloqué abandonnerait le quiz, et on récolterait zéro donnée plutôt que des
            données non validantes. Mais elle ne peut pas s'afficher comme une voie
            équivalente : ce que le moniteur saisit lui-même ne le valide pas auprès de son
            club, et des boutons pleine largeur à côté de la caméra suggéreraient le contraire. */}
        {!camera && <details className="co-vote-repli">
            <summary>La caméra ne marche pas ?</summary>
            <p>Ces réponses resteront dans votre suivi, mais ne compteront pas comme validées par le groupe.</p>
            <div className="co-vote-repli-choix">
                <button type="button" className="co-repli-vrai" aria-pressed={reponse === 'oui'} onClick={() => repondre('oui')}>Vrai</button>
                <button type="button" className="co-repli-faux" aria-pressed={reponse === 'non'} onClick={() => repondre('non')}>Faux</button>
                <button type="button" className="co-repli-partage" aria-pressed={reponse === 'partage'} onClick={() => repondre('partage')}>Partagé</button>
            </div>
        </details>}

        {/* Ce que la caméra a lu, une fois répondu : le moniteur doit voir sur quoi il avance. */}
        {decomptes[courante.id] && <div className="co-vote-lu">
            <Check size={17} strokeWidth={3} aria-hidden/>
            <span>
                <strong>{decomptes[courante.id].vrai} vrai · {decomptes[courante.id].faux} faux · {decomptes[courante.id].incertain} sans avis</strong>
                <small>Lu par la caméra</small>
            </span>
        </div>}
        {error && <p role="alert" className="co-vote-error">{error}</p>}

        <div className="co-vote-actions">
            {index > 0 && <button type="button" className="co-vote-secondary" onClick={() => setIndex(i => i - 1)}>Revenir</button>}
            {dernier && <button type="button" className="co-vote-primary" disabled={isPending || !repondues} onClick={enregistrer}>{isPending ? 'Enregistrement…' : 'Terminer le vote'} <ArrowRight size={18}/></button>}
            {!dernier && reponse && <button type="button" className="co-vote-secondary" onClick={() => setIndex(i => i + 1)}>Passer à la suivante</button>}
        </div>

        {repondues > 0 && <p className="co-vote-hint"><Check size={14} aria-hidden/> {repondues} réponse{repondues > 1 ? 's' : ''} sur {affirmations.length}</p>}
    </main>;
}

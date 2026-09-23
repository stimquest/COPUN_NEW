import { getStageById, getStageObjectiveReviewItems, getPedagogicalPool } from '@/services/data-service';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { composerVote } from '@/data/vote-fin-de-stage';
import { groupeDe } from '@/data/groupes';
import VoteClient from './VoteClient';

/**
 * Le vote de fin de stage a pris la place du quiz sur ce chemin.
 *
 * Le quiz existant n'a pas disparu : il reste un bon outil d'animation, et certains
 * moniteurs s'en servent volontiers. Mais il ne validait rien — le moniteur saisissait
 * lui-même les réponses, donc il ne pouvait pas servir de preuve. Le vote, lui, fait
 * répondre le groupe.
 *
 * Le quiz d'animation est déplacé sur `/stages/[id]/quiz/animation`, proposé depuis la page
 * de la semaine. Il n'a volontairement aucune sortie depuis cet écran-ci : une fois le
 * groupe réuni et le quiz de fin commencé, rien ne doit inviter à en lancer un autre.
 */
export default async function StageQuizPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const stage = await getStageById(id);
    if (!stage) return notFound();

    const [items, pool] = await Promise.all([getStageObjectiveReviewItems(id), getPedagogicalPool()]);
    const cartes = items.map(item => item.pedagogicalContent);
    // La semaine est la graine : les affirmations ne changent pas si le moniteur rouvre
    // l'écran, et il ne peut pas re-tirer jusqu'à tomber sur une série qui l'arrange.
    //
    // Réserve de questions de savoir : une carte n'en fournit qu'une, donc une semaine à une
    // seule carte ne pourrait pas tenir les quatre questions qui doivent accompagner son
    // action. On complète avec le catalogue, mais restreint aux sujets et au niveau de la
    // semaine — une question sur les oiseaux n'a rien à faire dans un vote consacré aux
    // marées, et une notion de niveau 2 serait hors de portée d'un groupe découverte.
    const groupes = new Set(cartes.map(carte => groupeDe(carte.id)?.id).filter(Boolean));
    const milieux = new Set(cartes.map(carte => groupeDe(carte.id)?.milieu).filter(Boolean));
    const niveaux = new Set(cartes.map(carte => carte.niveau));

    // Deux cercles concentriques plutôt qu'un filtre unique : huit combinaisons
    // groupe + niveau du catalogue comptent moins de quatre cartes rédigées, donc s'en tenir
    // au groupe laisserait le vote court là où il devrait compter cinq affirmations. Le
    // milieu (l'eau, le ciel, le bord, le vivant…) reste un voisinage que le groupe reconnaît.
    //
    // Le niveau, lui, ne se relâche jamais : une notion de niveau 2 serait hors de portée
    // d'un groupe découverte, et c'est le genre de question qui fait répondre « je ne sais
    // plus » sans que cela dise quoi que ce soit du travail de la semaine.
    const memeNiveau = pool.filter(carte => carte.source !== 'custom' && niveaux.has(carte.niveau));
    const reserve = [
        ...memeNiveau.filter(carte => groupes.has(groupeDe(carte.id)?.id)),
        ...memeNiveau.filter(carte => !groupes.has(groupeDe(carte.id)?.id) && milieux.has(groupeDe(carte.id)?.milieu)),
    ];
    const supabase = await createClient();
    const [{ data: preparations }, { data: resultatsEnregistres }] = await Promise.all([
        // L'action que le moniteur a retenue pour chaque carte : c'est elle qu'on fait
        // confirmer, pas une variante qu'il n'a jamais proposée au groupe.
        supabase.from('stage_preparations').select('pedagogical_content_id, actions').eq('stage_id', id),
        supabase.from('stage_vote_results')
            .select('affirmation_id, content_id, action_id, attendu, votes_vrai, votes_faux, votes_incertain, participants, origine')
            .eq('stage_id', id),
    ]);
    const choix = Object.fromEntries(
        (preparations ?? []).map(ligne => [ligne.pedagogical_content_id, ligne.actions?.[0]]),
    );

    const affirmations = composerVote(cartes, id, reserve, choix);

    return (
        <div className="co-page co-vote-page">
            <header className="co-vote-topbar">
                <Link href="/stages/semaines" aria-label="Retour à ma semaine" className="co-vote-back"><ArrowLeft size={19}/></Link>
                <div>
                    <p className="co-eyebrow">Le quiz de fin</p>
                    <strong>{stage.title}</strong>
                </div>
            </header>

            <VoteClient stageId={id} affirmations={affirmations} resultatsInitiaux={(resultatsEnregistres ?? []).map(resultat => ({
                affirmationId: resultat.affirmation_id,
                contentId: resultat.content_id,
                actionId: resultat.action_id,
                attendu: resultat.attendu,
                votesVrai: resultat.votes_vrai,
                votesFaux: resultat.votes_faux,
                votesIncertain: resultat.votes_incertain,
                participants: resultat.participants,
                origine: resultat.origine === 'camera' ? 'camera' : 'manuel',
            }))}/>
        </div>
    );
}

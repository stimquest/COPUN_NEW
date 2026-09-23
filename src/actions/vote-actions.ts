'use server';

import { requireStageOwner } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export type ResultatAffirmation = {
    affirmationId: string;
    contentId: string;
    /** Renseigné pour une confirmation d'action, absent pour une affirmation de savoir. */
    actionId?: string | null;
    /** Ce que la carte attendait (affirmations de savoir uniquement). */
    attendu?: boolean | null;
    votesVrai: number;
    votesFaux: number;
    /** « je ne sais plus » : ni pour, ni contre — mais visible. */
    votesIncertain: number;
    /**
     * D'où vient ce décompte. Seule la caméra fait foi : le moniteur ne peut pas fabriquer
     * ce que les enfants ont levé, alors qu'une saisie manuelle n'est qu'une déclaration.
     */
    origine: 'camera' | 'manuel';
    participants?: number | null;
};

/** Garde-fous de saisie : un vote de fin de stage, pas un import de masse. */
const MAX_AFFIRMATIONS = 10;
const MAX_PARTICIPANTS = 200;

/**
 * Enregistre le dépouillement du vote.
 *
 * L'upsert sur `(stage_id, affirmation_id)` rend l'opération rejouable : un moniteur qui
 * reprend le vote (réseau coupé, erreur de comptage) corrige sa saisie au lieu d'empiler
 * des lignes contradictoires.
 */
export async function enregistrerVote(stageId: string, resultats: ResultatAffirmation[]) {
    const ctx = await requireStageOwner(stageId);
    if (!ctx) return { success: false, error: 'Semaine inaccessible.' };

    if (!Array.isArray(resultats) || !resultats.length || resultats.length > MAX_AFFIRMATIONS) {
        return { success: false, error: 'Résultats invalides.' };
    }

    const entier = (v: unknown, max: number) => Number.isInteger(v) && (v as number) >= 0 && (v as number) <= max;
    for (const r of resultats) {
        if (typeof r.affirmationId !== 'string' || !r.affirmationId || r.affirmationId.length > 120) return { success: false, error: 'Résultats invalides.' };
        if (typeof r.contentId !== 'string' || !r.contentId) return { success: false, error: 'Résultats invalides.' };
        if (!entier(r.votesVrai, MAX_PARTICIPANTS) || !entier(r.votesFaux, MAX_PARTICIPANTS) || !entier(r.votesIncertain, MAX_PARTICIPANTS)) return { success: false, error: 'Résultats invalides.' };
        if (r.participants != null && !entier(r.participants, MAX_PARTICIPANTS)) return { success: false, error: 'Résultats invalides.' };
        if (r.origine !== 'camera' && r.origine !== 'manuel') return { success: false, error: 'Résultats invalides.' };
    }

    const { error } = await ctx.supabase
        .from('stage_vote_results')
        .upsert(
            resultats.map(r => ({
                stage_id: stageId,
                affirmation_id: r.affirmationId,
                content_id: r.contentId,
                action_id: r.actionId ?? null,
                attendu: r.attendu ?? null,
                votes_vrai: r.votesVrai,
                votes_faux: r.votesFaux,
                votes_incertain: r.votesIncertain,
                participants: r.participants ?? null,
                origine: r.origine,
                updated_at: new Date().toISOString(),
            })),
            { onConflict: 'stage_id,affirmation_id', ignoreDuplicates: false },
        );

    if (error) {
        console.error('[enregistrerVote]', error.message, error.details);
        return { success: false, error: 'Le vote n’a pas pu être enregistré. Réessayez.' };
    }

    revalidatePath('/stages/semaines');
    revalidatePath(`/stages/${stageId}/bilan`);
    return { success: true };
}

export type ActionConfirmee = { contentId: string; actionId: string; votesVrai: number; votesFaux: number; votesIncertain: number };

export type ResumeVote = {
    done: boolean;
    score: number;
    total: number;
    actionsConfirmees: number;
    actionsTotal: number;
};

/** Résumé persistant utilisé par « Mes semaines » et le bilan de clôture. */
export async function getResumeVote(stageId: string): Promise<ResumeVote> {
    const ctx = await requireStageOwner(stageId);
    if (!ctx) return { done: false, score: 0, total: 0, actionsConfirmees: 0, actionsTotal: 0 };

    const { data, error } = await ctx.supabase
        .from('stage_vote_results')
        .select('action_id, attendu, votes_vrai, votes_faux, votes_incertain, origine')
        .eq('stage_id', stageId);

    if (error) {
        console.error('[getResumeVote]', error.message);
        return { done: false, score: 0, total: 0, actionsConfirmees: 0, actionsTotal: 0 };
    }

    const lignes = data ?? [];
    const savoirs = lignes.filter(ligne => ligne.action_id == null && ligne.attendu != null);
    const actions = lignes.filter(ligne => ligne.action_id != null);
    const score = savoirs.filter(ligne => {
        const vraiMajoritaire = ligne.votes_vrai > ligne.votes_faux && ligne.votes_vrai > ligne.votes_incertain;
        const fauxMajoritaire = ligne.votes_faux > ligne.votes_vrai && ligne.votes_faux > ligne.votes_incertain;
        return ligne.attendu ? vraiMajoritaire : fauxMajoritaire;
    }).length;
    const actionsConfirmees = actions.filter(ligne => {
        if (ligne.origine !== 'camera') return false;
        const total = ligne.votes_vrai + ligne.votes_faux + ligne.votes_incertain;
        return total > 0 && ligne.votes_vrai * 2 > total;
    }).length;

    return {
        done: lignes.length > 0,
        score,
        total: savoirs.length,
        actionsConfirmees,
        actionsTotal: actions.length,
    };
}

/**
 * Les actions que le groupe a confirmées pour cette semaine.
 *
 * Une action est retenue quand la majorité stricte du groupe l'a confirmée — et seulement
 * si la caméra a lu les cartons. Un décompte saisi à la main reste visible au moniteur dans
 * son suivi, mais ne vaut rien pour le club : c'est lui qui l'a écrit, il ne peut pas se
 * valider lui-même. C'est toute la raison d'être du dispositif de cartons.
 *
 * Le seuil vit ici, côté application, et non dans le schéma : il relève d'un arbitrage
 * produit susceptible d'évoluer, alors que les lignes de dépouillement sont un fait à
 * conserver tel quel.
 */
export async function getActionsConfirmees(stageId: string): Promise<ActionConfirmee[]> {
    const ctx = await requireStageOwner(stageId);
    if (!ctx) return [];

    const { data, error } = await ctx.supabase
        .from('stage_vote_results')
        .select('content_id, action_id, votes_vrai, votes_faux, votes_incertain')
        .eq('stage_id', stageId)
        .eq('origine', 'camera')
        .not('action_id', 'is', null);

    if (error) {
        console.error('[getActionsConfirmees]', error.message);
        return [];
    }

    // Une action est confirmée quand la majorité du groupe l'affirme. Les « je ne sais
    // plus » ne comptent pas comme des « non » — un enfant distrait n'infirme rien — mais
    // ils entrent dans le total, donc un groupe massivement hésitant ne valide pas.
    return (data ?? [])
        .filter(row => {
            const total = (row.votes_vrai as number) + (row.votes_faux as number) + (row.votes_incertain as number);
            return total > 0 && (row.votes_vrai as number) * 2 > total;
        })
        .map(row => ({
            contentId: row.content_id as string,
            actionId: row.action_id as string,
            votesVrai: row.votes_vrai as number,
            votesFaux: row.votes_faux as number,
            votesIncertain: row.votes_incertain as number,
        }));
}

'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { PLAN_FORMATION, tousLesModules } from '@/data/formation-methode';

/** Identifiants des leçons terminées par le moniteur connecté. */
export async function getFormationProgression(): Promise<string[]> {
    const ctx = await requireAuth();
    if (!ctx) return [];

    const { data, error } = await ctx.supabase
        .from('formation_progression')
        .select('lecon_id')
        .eq('user_id', ctx.user.id);

    if (error) {
        console.warn('[getFormationProgression]', error.message);
        return [];
    }
    return (data ?? []).map(r => r.lecon_id as string);
}

/**
 * Marque une leçon terminée. Idempotent : rejouer une leçon déjà acquise ne doit pas
 * échouer — `upsert` avale le conflit sur la contrainte unique (user_id, lecon_id).
 */
export async function marquerLeconTerminee(leconId: string): Promise<{ success?: true; error?: string }> {
    const ctx = await requireAuth();
    if (!ctx) return { error: 'Non connecté.' };

    const { error } = await ctx.supabase
        .from('formation_progression')
        .upsert({ user_id: ctx.user.id, lecon_id: leconId }, { onConflict: 'user_id,lecon_id', ignoreDuplicates: true });

    if (error) return { error: error.message };

    revalidatePath('/formation');
    revalidatePath('/stages');
    return { success: true };
}

export type ProgressionTheme = {
    id: string;
    titre: string;
    nbFaits: number;
    nbRediges: number;
    nbTotal: number;
};

export type ResumeFormation = {
    nbFaits: number;
    /** Modules réellement rédigés — seuls eux comptent au dénominateur affiché ailleurs. */
    nbRediges: number;
    nbTotal: number;
    /** Premier module rédigé et non fait, pour l'inviter à continuer précisément là. */
    prochain: { titre: string; accroche: string; sectionId: string; sectionTitre: string; dureeMin: number } | null;
    /** Détail par thème — nécessaire pour un vrai dashboard, pas seulement un total global. */
    themes: ProgressionTheme[];
};

/**
 * Résumé de progression de la formation.
 *
 * Deux usages : `layout.tsx` s'en sert pour décider d'afficher le point de rappel sur
 * l'onglet « Formation » de la nav (visible depuis tout écran, tant que la formation
 * n'est pas terminée), et l'accueil `/stages` pour son simple repère vers `/formation`
 * (voir `DashboardFormation`) — le détail complet par thème vit sur `/formation`
 * lui-même, pas dupliqué ailleurs.
 *
 * Volontairement séparé de `getFormationProgression` (qui rend la liste brute d'IDs) :
 * ces deux usages n'ont besoin que d'un état condensé, jamais du détail des leçons.
 */
export async function getResumeFormation(): Promise<ResumeFormation> {
    const termine = await getFormationProgression();
    const setTermine = new Set(termine);

    const themes: ProgressionTheme[] = PLAN_FORMATION.map(section => {
        const rediges = section.modules.filter(m => m.leconId);
        return {
            id: section.id,
            titre: section.titre,
            nbFaits: rediges.filter(m => setTermine.has(m.leconId!)).length,
            nbRediges: rediges.length,
            nbTotal: section.modules.length,
        };
    });

    let prochain: ResumeFormation['prochain'] = null;
    for (const section of PLAN_FORMATION) {
        const trouve = section.modules.find(m => m.leconId && !setTermine.has(m.leconId));
        if (trouve) {
            prochain = {
                titre: trouve.titre,
                accroche: trouve.accroche,
                dureeMin: trouve.duree_min,
                sectionId: section.id,
                sectionTitre: section.titre,
            };
            break;
        }
    }

    const modules = tousLesModules().filter(m => m.leconId);
    return {
        nbFaits: modules.filter(m => setTermine.has(m.leconId!)).length,
        nbRediges: modules.length,
        nbTotal: tousLesModules().length,
        prochain,
        themes,
    };
}

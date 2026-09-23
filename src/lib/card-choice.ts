import type { PedagogicalContent } from '@/types';
import { formulationsFiche } from '@/data/formulations-fiche';

export type CardChoice = { accroche: string; actionId: string | null };
export type CardChoices = Record<string, CardChoice>;

export function resolveCardChoice(card: PedagogicalContent, choice?: Partial<CardChoice>): CardChoice {
    const hooks = formulationsFiche(card);
    return {
        accroche: hooks.some(hook => hook.texte === choice?.accroche) ? choice!.accroche! : hooks[0].texte,
        actionId: card.actions?.some(action => action.id === choice?.actionId) ? choice!.actionId! : card.actions?.[0]?.id ?? null,
    };
}

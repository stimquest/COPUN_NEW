import { z } from 'zod';
import type { PedagogicalContent, Stage } from '@/types';
import type { Tables, Json } from '@/types/database.generated';

const text = z.string().nullish().transform(v => v ?? undefined);
const strings = z.array(z.string()).nullish().transform(v => v ?? []);
// `confirmation` est optionnelle : seules les cartes déjà rédigées pour le vote de fin
// de stage la portent. Zod retirant tout champ non déclaré, l'omettre ici la supprimait
// silencieusement en sortie de `contentModel` — le vote s'ouvrait alors vide alors que la
// base était à jour.
const action = z.object({ id: z.string(), label: z.string(), consigne: z.string(), confirmation: z.string().nullish().transform(v => v ?? undefined) });
const resource = z.discriminatedUnion('type', [
    z.object({ type: z.literal('fiche_memo'), label: z.string(), fiche_memo_id: z.string() }),
    z.object({ type: z.literal('url'), label: z.string(), url: z.string() }),
]);
const contentSchema = z.object({
    id: z.string(), question: z.string(), objectif: z.string(), tip: z.string().nullish().transform(v => v ?? ''),
    explication: text, accroche: text, a_observer: text, a_retenir: text, erreur_frequente: text,
    vote_vrai: text, vote_faux: text,
    niveau: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).nullish().transform(v => v ?? 1),
    dimension: z.enum(['COMPRENDRE', 'OBSERVER', 'PROTÉGER']).nullish().transform(v => v ?? 'COMPRENDRE'),
    tags_theme: strings, tags_filtre: strings, accroches_variantes: strings,
    accroches_formes: z.array(z.object({ forme: z.enum(['pari', 'piege', 'constat', 'choix_force']), texte: z.string() })).nullish().transform(v => v ?? []),
    actions: z.array(action).nullish(), ressources: z.array(resource).nullish().transform(v => v ?? []),
    owner_id: text, club_id: text, is_public: z.boolean().nullish().transform(v => v ?? false),
    source: z.enum(['copun', 'custom']), ffv_level: z.number().nullish(), supports: strings,
});

export function contentModel(row: unknown): PedagogicalContent { return contentSchema.parse(row); }

const ressenti = z.object({ niveau: z.string(), raisons: z.array(z.string()), note: z.string() });
export function stageModel(row: Tables<'stages'>): Stage & Pick<Tables<'stages'>, 'owner_id' | 'created_at'> {
    return { ...row, selected_content: row.selected_content ?? [], suggested_thematics: row.suggested_thematics ?? [],
        ressenti: row.ressenti === null ? null : ressenti.parse(row.ressenti) };
}

export function jsonValue(value: unknown): Json { return z.json().parse(value); }

export function objectValue(value: unknown): Record<string, unknown> {
    return z.record(z.string(), z.unknown()).parse(value);
}
const section = z.object({ title: z.string(), instruction: z.string(), items: z.array(z.record(z.string(), z.unknown())) });
const gameData = z.object({ triageCotier: section.optional(), motsEnRafale: section.optional(), dilemmeDuMarin: section.optional(), leGrandQuizz: section.optional() });
export function gameModel(row: Tables<'games'>) {
    return { ...row, theme: row.theme ?? '', game_data: gameData.parse(row.game_data) };
}
export function defiModel(row: Tables<'defis'>) {
    return { ...row, tags_theme: row.tags_theme ?? [], stage_type: row.stage_type ?? [] };
}
export function exploitModel(row: Tables<'stage_exploits'> & { defis: Tables<'defis'> }) {
    return { ...row, status: z.enum(['en_cours', 'complete']).parse(row.status ?? 'en_cours'),
        preuves_url: row.preuves_url ?? [], structured_data: row.structured_data === null ? null : objectValue(row.structured_data),
        defis: defiModel(row.defis) };
}

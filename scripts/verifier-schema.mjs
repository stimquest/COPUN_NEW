/**
 * Compare le schéma réel de Supabase à ce que le code attend.
 *
 * Les migrations sont appliquées à la main via le SQL Editor : rien ne garantit qu'elles
 * l'aient toutes été, ni dans quel ordre. Une colonne manquante ne casse pas le build —
 * elle produit une erreur PostgREST à l'exécution, souvent avalée, donc une perte de
 * données silencieuse. C'est ce qui est arrivé à `stage_preparations.actions`.
 *
 *     node scripts/verifier-schema.mjs
 *
 * Le contrôle porte sur les colonnes ajoutées après coup — celles qui viennent d'une
 * migration séparée et peuvent donc manquer isolément.
 */
import { readFileSync } from 'node:fs';

const ATTENDU = {
    stage_preparations: {
        colonnes: ['accroche_choisie', 'chute', 'actions'],
        migration: '20260808140000_stage_preparations.sql, 20260808210000_recit.sql, 20260808230000_actions_sujet.sql',
    },
    stages: {
        colonnes: ['actions_semaine'],
        migration: '20260808250000_actions_semaine.sql',
    },
    pedagogical_content: {
        colonnes: ['accroche', 'accroches_variantes', 'a_observer', 'a_retenir', 'erreur_frequente', 'actions'],
        migration: '20260808110000_transmission_layer.sql, 20260808130000_accroches_variantes.sql, 20260808260000_actions_fiches.sql',
    },
};

function chargerEnv() {
    const env = {};
    for (const ligne of readFileSync('.env.local', 'utf8').split('\n')) {
        const i = ligne.indexOf('=');
        if (i < 1 || ligne.trim().startsWith('#')) continue;
        env[ligne.slice(0, i).trim()] = ligne.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    }
    return env;
}

const env = chargerEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
// Une clé publique suffit à sonder le schéma : PostgREST répond 42703 sur colonne absente
// avant d'appliquer la RLS. Les deux générations de clés Supabase sont acceptées.
const key = env.SUPABASE_SECRET_KEY
    || env.SUPABASE_SERVICE_ROLE_KEY
    || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error('URL ou clé Supabase absente de .env.local');
    process.exit(1);
}

/** PostgREST répond 42703 sur colonne absente, avant même d'appliquer la RLS. */
async function colonnePresente(table, colonne) {
    const r = await fetch(`${url}/rest/v1/${table}?select=${colonne}&limit=1`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (r.status === 200) return true;
    const corps = await r.json().catch(() => ({}));
    if (corps.code === '42703' || corps.code === 'PGRST204') return false;
    throw new Error(`${table}.${colonne} — HTTP ${r.status} ${corps.message ?? ''}`);
}

let manquantes = 0;

for (const [table, { colonnes, migration }] of Object.entries(ATTENDU)) {
    const absentes = [];
    for (const colonne of colonnes) {
        if (!(await colonnePresente(table, colonne))) absentes.push(colonne);
    }

    if (absentes.length === 0) {
        console.log(`OK       ${table} — ${colonnes.length} colonnes`);
        continue;
    }

    manquantes += absentes.length;
    console.log(`MANQUE   ${table} — ${absentes.join(', ')}`);
    console.log(`         voir ${migration}`);
    for (const c of absentes) {
        console.log(`         ALTER TABLE public.${table} ADD COLUMN IF NOT EXISTS ${c} ...;`);
    }
}

if (manquantes > 0) {
    console.log(`\n${manquantes} colonne(s) à appliquer dans le SQL Editor Supabase.`);
    process.exit(1);
}
console.log('\nSchéma conforme.');

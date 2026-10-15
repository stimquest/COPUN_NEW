import { readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { isDeepStrictEqual } from 'node:util';

// Sans --apply : contrôle uniquement. Les identifiants des cartes restent stables.
const env = { ...process.env };
for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
    const i = line.indexOf('=');
    if (i > 0 && !line.trim().startsWith('#')) env[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
}
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY;
if (!key) throw new Error('Clé serveur Supabase manquante.');
const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=representation' };
const url = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/pedagogical_content`;
const cards = JSON.parse(readFileSync('supabase/seeds/cartes-directrices.json', 'utf8'));
const ids = new Set();
for (const card of cards) {
    if (!card.id.startsWith('directrice-') || ids.has(card.id) || card.source !== 'copun' || card.niveau !== 1) throw new Error(`Carte invalide : ${card.id}`);
    ids.add(card.id);
    for (const field of ['question', 'objectif', 'explication', 'accroche', 'a_retenir']) {
        if (!card[field]?.trim()) throw new Error(`Champ manquant : ${card.id}.${field}`);
    }
    if (!card.actions?.length) throw new Error(`Action manquante : ${card.id}`);
}
async function request(query, options) {
    const response = await fetch(`${url}${query}`, { headers, ...options });
    if (!response.ok) throw new Error(`Supabase : HTTP ${response.status}`);
    return response.json();
}
const read = () => request('?select=*&id=like.directrice-*&order=id');
const before = await read();
for (const row of before.filter(row => ids.has(row.id))) {
    if (row.source !== 'copun') throw new Error(`Source inattendue : ${row.id}`);
}
const changes = cards.filter(card => {
    const row = before.find(row => row.id === card.id);
    return !row || Object.keys(card).some(field => !isDeepStrictEqual(row[field], card[field]));
});
console.log(`${cards.length} essentielles validées ; ${changes.length} à mettre à jour.`);
if (process.argv.includes('--apply') && changes.length) {
    const backup = join(tmpdir(), `copun-essential-backup-${Date.now()}.json`);
    writeFileSync(backup, JSON.stringify(before.filter(row => ids.has(row.id)), null, 2));
    console.log(`Sauvegarde : ${backup}`);
    for (const card of changes) {
        const row = before.find(row => row.id === card.id);
        // Le filtre de version empêche d'écraser une modification concurrente.
        const guard = row ? (row.updated_at ? `&updated_at=eq.${encodeURIComponent(row.updated_at)}` : `&question=eq.${encodeURIComponent(row.question)}`) : '';
        const result = await request(row ? `?id=eq.${card.id}&source=eq.copun${guard}` : '', {
            method: row ? 'PATCH' : 'POST', body: JSON.stringify(card),
        });
        if (result.length !== 1) throw new Error(`Modification concurrente ou refusée : ${card.id}`);
    }
    const after = await read();
    for (const card of cards) {
        const row = after.find(row => row.id === card.id);
        if (!row || Object.keys(card).some(field => !isDeepStrictEqual(row[field], card[field]))) throw new Error(`Vérification échouée : ${card.id}`);
    }
    console.log(`${cards.length} essentielles vérifiées dans Supabase.`);
}

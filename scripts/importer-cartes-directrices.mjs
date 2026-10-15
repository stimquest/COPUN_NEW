import { readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const env = {};
for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
    const i = line.indexOf('=');
    if (i > 0 && !line.trim().startsWith('#')) env[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
}
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY;
if (!key) throw new Error('Clé serveur Supabase manquante.');
const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
const url = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/pedagogical_content`;
const args = process.argv.slice(2);
const get = await fetch(`${url}?select=*&order=id`, { headers });
if (!get.ok) throw new Error(`Lecture Supabase impossible : HTTP ${get.status}`);
const existing = await get.json();
if (args.includes('--inspect')) {
    writeFileSync(join(tmpdir(), 'copun-catalogue-review.json'), JSON.stringify(existing, null, 2));
    console.log(JSON.stringify({ count: existing.length, cards: existing.map(card => ({ id: card.id, question: card.question })) }, null, 2));
}
if (!args.includes('--inspect')) {
const cards = JSON.parse(readFileSync('supabase/seeds/cartes-directrices.json', 'utf8'));
const ids = new Set();
for (const card of cards) {
    if (!card.id.startsWith('directrice-') || ids.has(card.id)) throw new Error('Identifiant invalide ou dupliqué.');
    ids.add(card.id);
    if (card.niveau !== 1) throw new Error(`${card.id} : une carte principale doit être au niveau Découverte.`);
    for (const field of ['question', 'objectif', 'explication', 'accroche', 'a_retenir', 'vote_vrai', 'vote_faux']) {
        if (typeof card[field] !== 'string' || !card[field].trim()) throw new Error(`${card.id} : champ ${field} manquant.`);
    }
    if (!Array.isArray(card.actions) || card.actions.length !== 1) throw new Error(`${card.id} : action manquante.`);
}
const migration = args.indexOf('--migration');
if (migration >= 0) {
    const fields = Object.keys(cards[0]);
    if (cards.some(card => Object.keys(card).join() !== fields.join())) throw new Error('Colonnes incohérentes.');
    const value = data => data === null ? 'null' : typeof data === 'boolean' ? String(data) : typeof data === 'number' ? String(data) : Array.isArray(data) && data.every(item => typeof item === 'string') ? `array[${data.map(item => `'${item.replaceAll("'", "''")}'`).join(',')}]::text[]` : `'${(typeof data === 'object' ? JSON.stringify(data) : data).replaceAll("'", "''")}'${typeof data === 'object' ? '::jsonb' : ''}`;
    const sql = `-- Cartes principales, sélectionnées et suivies comme les autres contenus.\ninsert into public.pedagogical_content (${fields.join(', ')}) values\n${cards.map(card => `(${fields.map(field => value(card[field])).join(', ')})`).join(',\n')}\non conflict (id) do nothing;\n`;
    writeFileSync(args[migration + 1], sql);
}
if (args.includes('--apply') || args.includes('--update-tags')) {
    // Ajout idempotent : aucun contenu existant n'est remplacé.
    const response = args.includes('--update-tags') ? { ok: true } : await fetch(`${url}?on_conflict=id`, {
        method: 'POST', headers: { ...headers, Prefer: 'resolution=ignore-duplicates,return=representation' }, body: JSON.stringify(cards),
    });
    if (!response.ok) throw new Error(`Ajout Supabase impossible : HTTP ${response.status}, ${(await response.json()).message}`);
    if (args.includes('--update-tags')) {
        for (const card of cards) {
            const response = await fetch(`${url}?id=eq.${card.id}`, { method: 'PATCH', headers, body: JSON.stringify({ tags_theme: card.tags_theme }) });
            if (!response.ok) throw new Error(`Mise à jour des thèmes impossible : ${card.id}`);
        }
    }
    const saved = await fetch(`${url}?id=like.directrice-*&select=*`, { headers });
    if (!saved.ok) throw new Error('Vérification Supabase impossible.');
    const rows = await saved.json();
    for (const expected of cards) {
        const actual = rows.find(row => row.id === expected.id);
        if (!actual || Object.keys(expected).some(field => JSON.stringify(actual[field]) !== JSON.stringify(expected[field]))) throw new Error(`Vérification du contenu échouée : ${expected.id}`);
    }
    console.log(`${rows.length} cartes directrices vérifiées dans Supabase.`);
} else {
    const liveCards = existing.filter(card => ids.has(card.id));
    if (liveCards.some(card => card.niveau !== 1)) throw new Error('Une carte principale Supabase n’est pas au niveau Découverte.');
    console.log(`${cards.length} cartes validées ; ${existing.filter(card => ids.has(card.id)).length} déjà présentes.`);
    console.log(`${liveCards.length} cartes principales Supabase au niveau Découverte.`);
}
}

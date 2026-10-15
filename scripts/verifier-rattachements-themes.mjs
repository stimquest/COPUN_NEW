import { readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import ts from 'typescript';

// Contrôle par défaut ; --apply ajoute uniquement les rattachements éditoriaux manquants.
const env = { ...process.env };
for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
    const i = line.indexOf('=');
    if (i > 0 && !line.trim().startsWith('#')) env[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
}
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY;
if (!key) throw new Error('Clé serveur Supabase manquante.');
const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=representation' };
const url = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/pedagogical_content`;
const etages = {};
// Utiliser le référentiel de l'interface pour que l'audit détecte aussi ses évolutions.
const compiled = ts.transpileModule(readFileSync('src/data/etages.tsx', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
new Function('exports', compiled)(etages);
const themes = etages.THEMES_BY_PILLAR;
const corrections = JSON.parse(readFileSync('supabase/seeds/rattachements-themes.json', 'utf8'));
async function request(query, options) {
    const response = await fetch(url + query, { headers, ...options });
    if (!response.ok) throw new Error(`Supabase : HTTP ${response.status}`);
    return response.json();
}
const read = () => request('?source=eq.copun&id=not.like.directrice-*&select=*&order=id');
const before = await read();
const seen = new Set();
const changes = corrections.flatMap(correction => {
    const row = before.find(row => row.id === correction.id);
    if (!row || row.dimension !== correction.dimension || seen.has(row.id) || !themes[row.dimension]?.some(theme => theme.id === correction.theme)) throw new Error(`Rattachement invalide : ${correction.id}`);
    seen.add(row.id);
    return row.tags_theme?.includes(correction.theme) ? [] : [{ before: row, tags: [...(row.tags_theme ?? []), correction.theme] }];
});
function audit(rows) {
    const missing = rows.filter(row => !themes[row.dimension]?.some(theme => row.tags_theme?.includes(theme.id)));
    if (missing.length) throw new Error(`Cartes sans thème accessible : ${missing.map(row => row.id).join(', ')}`);
    for (const [dimension, list] of Object.entries(themes)) {
        const cards = rows.filter(row => row.dimension === dimension);
        const covered = new Set(list.flatMap(theme => cards.filter(row => row.tags_theme?.includes(theme.id)).map(row => row.id)));
        if (covered.size !== cards.length) throw new Error(`Couverture incomplète : ${dimension}`);
        console.log(`${dimension} : ${covered.size}/${cards.length} cartes accessibles par les thèmes.`);
    }
}
// Refuser toute écriture si le plan ne résout pas l'intégralité des cartes orphelines.
audit(before.map(row => ({ ...row, tags_theme: changes.find(change => change.before.id === row.id)?.tags ?? row.tags_theme })));
console.log(`${changes.length} rattachements manquants.`);
if (process.argv.includes('--apply') && changes.length) {
    const backup = join(tmpdir(), `copun-themes-backup-${Date.now()}.json`);
    writeFileSync(backup, JSON.stringify(changes.map(change => change.before), null, 2));
    console.log(`Sauvegarde : ${backup}`);
    for (const change of changes) {
        const row = change.before;
        const guard = row.tags_theme === null ? 'is.null' : `eq.{${row.tags_theme.map(tag => JSON.stringify(tag)).join(',')}}`;
        const query = new URLSearchParams({ id: `eq.${row.id}`, source: 'eq.copun', dimension: `eq.${row.dimension}`, tags_theme: guard });
        const result = await request(`?${query}`, { method: 'PATCH', body: JSON.stringify({ tags_theme: change.tags }) });
        if (result.length !== 1) throw new Error(`Modification concurrente ou refusée : ${row.id}`);
    }
    const after = await read();
    for (const previous of before) {
        const actual = after.find(row => row.id === previous.id);
        const expected = { ...previous, tags_theme: changes.find(change => change.before.id === previous.id)?.tags ?? previous.tags_theme };
        if (!isDeepStrictEqual(actual, expected)) throw new Error(`Vérification échouée : ${previous.id}`);
    }
    audit(after);
    console.log('Rattachements vérifiés ; aucun autre champ modifié.');
} else if (!process.argv.includes('--apply') && changes.length) {
    console.log('Plan contrôlé. Utiliser --apply pour appliquer les ajouts.');
} else {
    audit(before);
}

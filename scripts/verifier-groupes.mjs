/**
 * Vérifie que le regroupement par phénomène couvre bien tout le catalogue :
 * chaque fiche dans exactement un groupe, aucune oubliée, aucune en double.
 *
 * Usage : node scripts/verifier-groupes.mjs
 */
import { readFileSync } from 'node:fs';

const src = readFileSync(new URL('../src/data/groupes.ts', import.meta.url), 'utf8');

// Extraction des IDs sans exécuter le TS : on rejoue plage(a,b) et les listes littérales.
const groupes = [];
for (const bloc of src.split(/\n\s{4}\{/).slice(1)) {
    const id = bloc.match(/id:\s*'([^']+)'/)?.[1];
    const fichesRaw = bloc.match(/fiches:\s*(\[[^\]]*\]|plage\(\d+,\s*\d+\))/s)?.[1];
    if (!id || !fichesRaw) continue;

    const ids = [];
    for (const m of fichesRaw.matchAll(/plage\((\d+),\s*(\d+)\)/g)) {
        for (let i = +m[1]; i <= +m[2]; i++) ids.push(i);
    }
    for (const m of fichesRaw.replace(/plage\([^)]*\)/g, '').matchAll(/\b(\d+)\b/g)) {
        ids.push(+m[1]);
    }
    groupes.push({ id, ids });
}

const vus = new Map();
const doublons = [];
for (const g of groupes) {
    for (const id of g.ids) {
        if (vus.has(id)) doublons.push(`${id} (${vus.get(id)} et ${g.id})`);
        else vus.set(id, g.id);
    }
}

// Catalogue d'origine (1-128) + fiches ajoutées depuis. À compléter quand du contenu
// est créé : une fiche absente d'ici et des groupes atterrit dans « À classer ».
const CATALOGUE = [...Array.from({ length: 128 }, (_, i) => i + 1), 200, 201, 202];
const manquants = CATALOGUE.filter(i => !vus.has(i));

console.log(`Groupes      : ${groupes.length}`);
console.log(`Fiches       : ${vus.size} / ${CATALOGUE.length}`);
groupes.forEach(g => console.log(`  ${g.id.padEnd(14)} ${g.ids.length}`));

if (doublons.length) console.log(`\n❌ Doublons  : ${doublons.join(', ')}`);
if (manquants.length) console.log(`\n❌ Manquants : ${manquants.join(', ')}`);
if (!doublons.length && !manquants.length) console.log('\n✅ Couverture complète, sans doublon.');

process.exit(doublons.length || manquants.length ? 1 : 0);

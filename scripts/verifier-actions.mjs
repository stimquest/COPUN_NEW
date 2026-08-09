/**
 * Vérifie que chaque groupe de phénomène a ses actions, et qu'aucune série n'excède la
 * limite de cinq.
 *
 * Le plafond n'est pas cosmétique : au-delà de cinq propositions, le moniteur cesse de
 * choisir et subit une liste. C'est la contrainte qui a fait échouer les versions
 * précédentes de cet écran, elle mérite donc d'être tenue par un contrôle et non par la
 * seule vigilance.
 *
 *     node scripts/verifier-actions.mjs
 */
import { readFileSync } from 'node:fs';

const MAX = 5;
const MIN = 3;

const lire = f => readFileSync(new URL(`../src/data/${f}`, import.meta.url), 'utf8');

const groupes = [...lire('groupes.ts').matchAll(/^\s{8}id: '([a-z_]+)',$/gm)].map(m => m[1]);
const actions = lire('actions-sujets.ts');

let erreurs = 0;

for (const g of groupes) {
    // Le bloc du groupe court jusqu'à la prochaine clé de premier niveau.
    const bloc = actions.match(new RegExp(`\\n    ${g}: \\[([\\s\\S]*?)\\n    \\],`));
    if (!bloc) {
        console.log(`MANQUE   ${g} — aucune action`);
        erreurs++;
        continue;
    }

    const n = (bloc[1].match(/^\s{12}id: '/gm) ?? []).length;
    if (n < MIN || n > MAX) {
        console.log(`HORS     ${g} — ${n} actions (attendu ${MIN} à ${MAX})`);
        erreurs++;
    } else {
        console.log(`OK       ${g} — ${n} actions`);
    }
}

const ids = [...actions.matchAll(/^\s{12}id: '([a-z_0-9]+)',$/gm)].map(m => m[1]);
const doublons = ids.filter((id, i) => ids.indexOf(id) !== i);
if (doublons.length) {
    console.log(`\nDOUBLONS : ${[...new Set(doublons)].join(', ')}`);
    erreurs++;
}

// Avancement du niveau fiche : les actions de groupe ne sont qu'un repli, elles
// réapparaissent à l'identique sur toutes les fiches d'un même phénomène.
// Les actions propres à une fiche vivent en base (`pedagogical_content.actions`) : on
// interroge Supabase pour connaître l'avancement, et non le fichier local qui ne porte
// plus que les replis de groupe.
const env = {};
for (const l of readFileSync('.env.local', 'utf8').split('\n')) {
    const i = l.indexOf('=');
    if (i < 1 || l.trim().startsWith('#')) continue;
    env[l.slice(0, i).trim()] = l.slice(i + 1).trim().replace(/^["']|["']$/g, '');
}

const reponse = await fetch(
    `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/pedagogical_content?select=id&actions=not.is.null`,
    {
        headers: {
            apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
    },
);
const enBase = await reponse.json();
if (!Array.isArray(enBase)) {
    console.log(`\nLecture impossible : ${enBase.message ?? 'erreur inconnue'}`);
    console.log('La migration 20260808260000_actions_fiches.sql est-elle appliquée ?');
    process.exit(1);
}
const fichesTraitees = new Set(enBase.map(f => String(f.id)));

/** Développe `plage(a, b)` comme le fait `groupes.ts` à l'exécution. */
function fichesDu(groupe) {
    const bloc = lire('groupes.ts').match(
        new RegExp(`id: '${groupe}',[\\s\\S]*?fiches: (\\[[^\\]]*\\]|plage\\([^)]*\\))`),
    );
    if (!bloc) return [];

    const numeros = [];
    for (const [, de, a] of bloc[1].matchAll(/plage\((\d+),\s*(\d+)\)/g)) {
        for (let n = Number(de); n <= Number(a); n++) numeros.push(String(n));
    }
    // Les identifiants restants, hors des appels plage().
    const reste = bloc[1].replace(/plage\([^)]*\)/g, '');
    numeros.push(...(reste.match(/\d+/g) ?? []));
    return [...new Set(numeros)];
}

const parGroupe = groupes.map(g => ({ g, fiches: fichesDu(g) }));
const totalFiches = new Set(parGroupe.flatMap(x => x.fiches)).size;

console.log(`\n${groupes.length} groupes, ${ids.length} actions.`);
console.log(`Niveau fiche : ${fichesTraitees.size}/${totalFiches} fiches ont leurs actions propres.\n`);

for (const { g, fiches } of parGroupe) {
    const faites = fiches.filter(n => fichesTraitees.has(n)).length;
    const etat = faites === fiches.length ? 'COMPLET ' : faites > 0 ? 'en cours' : '        ';
    console.log(`  ${etat} ${g.padEnd(14)} ${faites}/${fiches.length}`);
}

if (erreurs) process.exit(1);
console.log('\nCouverture groupe complète.');

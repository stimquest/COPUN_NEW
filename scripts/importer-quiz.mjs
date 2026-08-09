/**
 * Importe des corrections de cartes quiz depuis un fichier JSON, et génère la migration
 * correspondante.
 *
 *     node scripts/importer-quiz.mjs <fichier.json> <nom-migration>
 *
 * Le JSON est un tableau d'objets :
 *   {
 *     id: "<uuid de la carte existante>",   // ou null pour une carte à supprimer via `supprimer`
 *     related_objective_id: "<id de fiche>", // string | null
 *     adulte: { question, answers, correctAnswerIndex, explanation },
 *     enfant: { question, answers, correctAnswerIndex, explanation },
 *   }
 * ou { supprimer: "<uuid>" } pour retirer un doublon.
 *
 * `data` reste la version adulte au premier niveau (rétrocompatible avec le code existant
 * qui lit `data.question` etc.), et `data.version_enfant` porte la version enfant. Ça
 * remplace `version_moniteur`, qui n'a jamais été lu que par cette étiquette — même
 * fonction, nom plus clair maintenant qu'il y a un vrai choix au lancement.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const [fichier, nom] = process.argv.slice(2);
if (!fichier || !nom) {
    console.error('usage: node scripts/importer-quiz.mjs <fichier.json> <nom-migration>');
    process.exit(1);
}

const env = {};
for (const l of readFileSync('.env.local', 'utf8').split('\n')) {
    const i = l.indexOf('=');
    if (i < 1 || l.trim().startsWith('#')) continue;
    env[l.slice(0, i).trim()] = l.slice(i + 1).trim().replace(/^["']|["']$/g, '');
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const cle = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
if (!cle) { console.error('Aucune clé privilégiée dans .env.local.'); process.exit(1); }

const items = JSON.parse(readFileSync(fichier, 'utf8'));

function valide(v) {
    if (!v || typeof v !== 'object') return false;
    if (!v.question || !Array.isArray(v.answers) || v.answers.length !== 4) return false;
    if (typeof v.correctAnswerIndex !== 'number' || v.correctAnswerIndex < 0 || v.correctAnswerIndex > 3) return false;
    if (!v.explanation) return false;
    return true;
}

for (const it of items) {
    if (it.supprimer) continue;
    if (!it.id) { console.error(`entrée sans id : ${JSON.stringify(it).slice(0, 100)}`); process.exit(1); }
    if (!valide(it.adulte)) { console.error(`${it.id} : version adulte invalide`); process.exit(1); }
    if (!valide(it.enfant)) { console.error(`${it.id} : version enfant invalide`); process.exit(1); }
}

let ecrites = 0, supprimees = 0;
const sqlLignes = ['-- Corrections du quiz de fin de semaine : ' + nom + '.', '--',
    "-- Générées par scripts/importer-quiz.mjs. `data` porte la version adulte, ",
    "-- `data.version_enfant` la version enfant du même sujet. Remplace `version_moniteur`",
    '-- (même rôle, jamais exploité par un vrai choix au lancement avant ce jour).', ''];

for (const it of items) {
    if (it.supprimer) {
        const r = await fetch(`${url}/rest/v1/game_cards?id=eq.${it.supprimer}`, {
            method: 'DELETE',
            headers: { apikey: cle, Authorization: `Bearer ${cle}`, Prefer: 'return=representation' },
        });
        const corps = await r.json();
        if (r.ok && Array.isArray(corps) && corps.length > 0) supprimees++;
        else console.error(`suppression ${it.supprimer} : échec — ${JSON.stringify(corps).slice(0, 150)}`);

        sqlLignes.push(`DELETE FROM game_cards WHERE id = '${it.supprimer}';`);
        continue;
    }

    const patch = {
        related_objective_id: it.related_objective_id ?? null,
        data: {
            question: it.adulte.question,
            answers: it.adulte.answers,
            correctAnswerIndex: it.adulte.correctAnswerIndex,
            explanation: it.adulte.explanation,
            version_enfant: it.enfant,
        },
    };

    const r = await fetch(`${url}/rest/v1/game_cards?id=eq.${it.id}`, {
        method: 'PATCH',
        headers: {
            apikey: cle, Authorization: `Bearer ${cle}`,
            'Content-Type': 'application/json', Prefer: 'return=representation',
        },
        body: JSON.stringify(patch),
    });
    const corps = await r.json();
    if (r.ok && Array.isArray(corps) && corps.length > 0) ecrites++;
    else console.error(`${it.id} : échec — ${JSON.stringify(corps).slice(0, 150)}`);

    const esc = s => s.replace(/'/g, "''");
    sqlLignes.push(
        `UPDATE game_cards SET related_objective_id = ${it.related_objective_id ? `'${it.related_objective_id}'` : 'NULL'}, data = '${esc(JSON.stringify(patch.data))}'::jsonb WHERE id = '${it.id}';`,
    );
}

const horodatage = new Date().toISOString().slice(0, 19).replace(/\D/g, '');
const chemin = `supabase/migrations/${horodatage}_quiz_${nom}.sql`;
writeFileSync(chemin, sqlLignes.join('\n') + '\n', 'utf8');

console.log(`${items.length} entrées traitées.`);
console.log(`Base      : ${ecrites} écrite(s), ${supprimees} supprimée(s).`);
console.log(`Migration : ${chemin}`);

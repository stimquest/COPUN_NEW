/**
 * Importe des actions de fiche depuis un fichier JSON, et génère la migration
 * correspondante.
 *
 *     node scripts/importer-actions.mjs <fichier.json> <nom-migration>
 *
 * Le JSON est un objet { "<id de fiche>": [{ id, label, consigne }] }. Les actions
 * vivent dans `pedagogical_content.actions` : elles font partie du contenu pédagogique au
 * même titre que l'accroche ou l'idée à retenir.
 *
 * Le script écrit d'abord en base (pour valider tout de suite dans l'application), puis
 * dépose une migration SQL — indispensable pour reconstruire un environnement neuf ou
 * rattraper la production.
 *
 * Les identifiants d'action sont stables : `stage_preparations.actions` les référence
 * pour mémoriser les choix des moniteurs. En renommer un orpheline ces choix.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const [fichier, nom] = process.argv.slice(2);
if (!fichier || !nom) {
    console.error('usage: node scripts/importer-actions.mjs <fichier.json> <nom-migration>');
    process.exit(1);
}

const env = {};
for (const l of readFileSync('.env.local', 'utf8').split('\n')) {
    const i = l.indexOf('=');
    if (i < 1 || l.trim().startsWith('#')) continue;
    env[l.slice(0, i).trim()] = l.slice(i + 1).trim().replace(/^["']|["']$/g, '');
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;

// Supabase a remplacé les clés anon/service_role par publishable/secret ; les deux
// paires restent valides selon l'âge du projet. Seule une clé privilégiée écrit : la clé
// publique est soumise à la RLS, qui renvoie un 200 sans modifier aucune ligne.
const clePrivilegiee = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
const cle = clePrivilegiee || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const donnees = JSON.parse(readFileSync(fichier, 'utf8'));

// Contrôles avant écriture : une action mal formée passerait silencieusement en JSONB.
const vus = new Set();
for (const [ficheId, actions] of Object.entries(donnees)) {
    if (!Array.isArray(actions) || actions.length === 0) {
        console.error(`fiche ${ficheId} : liste vide ou invalide`);
        process.exit(1);
    }
    if (actions.length > 5) {
        console.error(`fiche ${ficheId} : ${actions.length} actions (5 maximum)`);
        process.exit(1);
    }
    for (const a of actions) {
        if (!a.id || !a.label || !a.consigne) {
            console.error(`fiche ${ficheId} : action incomplète ${JSON.stringify(a)}`);
            process.exit(1);
        }
        if (vus.has(a.id)) {
            console.error(`identifiant d'action en double : ${a.id}`);
            process.exit(1);
        }
        vus.add(a.id);
    }
}

let ecrites = 0;
const peutEcrire = Boolean(clePrivilegiee);

if (peutEcrire) {
    for (const [ficheId, actions] of Object.entries(donnees)) {
        const r = await fetch(`${url}/rest/v1/pedagogical_content?id=eq.${ficheId}`, {
            method: 'PATCH',
            headers: {
                apikey: cle,
                Authorization: `Bearer ${cle}`,
                'Content-Type': 'application/json',
                Prefer: 'return=representation',
            },
            body: JSON.stringify({ actions }),
        });

        const corps = await r.json();
        if (!r.ok || !Array.isArray(corps) || corps.length === 0) {
            console.error(`fiche ${ficheId} : échec — ${corps.message ?? `HTTP ${r.status}`}`);
            break;
        }
        ecrites++;
    }
}

const esc = s => s.replace(/'/g, "''");
const sql = [
    `-- Actions de terrain : ${nom}.`,
    '--',
    '-- Générées par scripts/importer-actions.mjs. Les actions vivent dans la fiche',
    '-- (`pedagogical_content.actions`), au même titre que l\'accroche ou l\'idée à retenir.',
    '-- Leurs identifiants sont référencés par `stage_preparations.actions` : les renommer',
    '-- orpheline les choix déjà enregistrés par les moniteurs.',
    '',
    ...Object.entries(donnees).map(
        ([ficheId, actions]) =>
            `UPDATE pedagogical_content SET actions = '${esc(JSON.stringify(actions))}'::jsonb WHERE id = '${ficheId}';`,
    ),
].join('\n');

const horodatage = new Date().toISOString().slice(0, 19).replace(/\D/g, '');
const chemin = `supabase/migrations/${horodatage}_actions_${nom}.sql`;
writeFileSync(chemin, sql + '\n', 'utf8');

const total = Object.values(donnees).reduce((n, a) => n + a.length, 0);
console.log(`${Object.keys(donnees).length} fiches, ${total} actions.`);
console.log(`Migration : ${chemin}`);

if (peutEcrire) {
    console.log(`Base      : ${ecrites} fiche(s) écrite(s).`);
} else {
    console.log('Base      : non écrite — aucune clé privilégiée dans .env.local.');
    console.log('            Ajoutez SUPABASE_SECRET_KEY=sb_secret_… (Supabase → Settings → API),');
    console.log('            ou appliquez la migration ci-dessus dans le SQL Editor.');
}

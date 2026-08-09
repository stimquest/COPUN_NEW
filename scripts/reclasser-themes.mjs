import { config } from 'dotenv';
config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Thème(s) officiel(s) assigné(s) à chaque fiche dépourvue de tags_theme valide.
// Le tags_theme existant (libre, ex. "Nuages") est remplacé par les slugs du référentiel,
// en gardant la cohérence avec la dimension (pilier) déjà en place sur la fiche.
const RECLASSEMENT = {
  // COMPRENDRE — nuages, vent : phénomènes du littoral
  '82': ['caracteristiques_littoral'],
  '83': ['caracteristiques_littoral'],
  '84': ['caracteristiques_littoral'],
  '99': ['caracteristiques_littoral'],
  '100': ['caracteristiques_littoral'],
  '101': ['caracteristiques_littoral'],
  '114': ['caracteristiques_littoral'],
  '115': ['caracteristiques_littoral'],
  '85': ['caracteristiques_littoral'],
  '102': ['caracteristiques_littoral'],
  // COMPRENDRE — courants, houle, marée, topographie côtière
  '89': ['caracteristiques_littoral'],
  '90': ['caracteristiques_littoral'],
  '91': ['caracteristiques_littoral'],
  '104': ['caracteristiques_littoral'],
  '113': ['caracteristiques_littoral'],
  '118': ['caracteristiques_littoral'],
  '119': ['caracteristiques_littoral'],
  // COMPRENDRE — oiseaux migrateurs, saisonnalité
  '86': ['biodiversite_saisonnalite'],
  '87': ['biodiversite_saisonnalite'],
  '103': ['biodiversite_saisonnalite'],
  '116': ['biodiversite_saisonnalite'],
  '117': ['biodiversite_saisonnalite'],
  // OBSERVER — posture d'observation générale
  '92': ['lecture_paysage'],
  '93': ['lecture_paysage'],
  '94': ['lecture_paysage'],
  '95': ['lecture_paysage'],
  // OBSERVER — état de la mer, houle, vent, sécurité nautique : lecture du terrain
  '96': ['lecture_paysage'],
  '97': ['lecture_paysage'],
  '105': ['lecture_paysage'],
  '106': ['lecture_paysage'],
  '107': ['lecture_paysage'],
  '108': ['lecture_paysage'],
  '121': ['lecture_paysage'],
  '122': ['lecture_paysage'],
  '123': ['lecture_paysage'],
  '124': ['lecture_paysage'],
  // PROTÉGER — protection environnement général, déchets, ressources
  '98': ['impact_presence_humaine'],
  '109': ['impact_presence_humaine'],
  '110': ['impact_presence_humaine'],
  // PROTÉGER — biodiversité littoral, réseaux de protection
  '111': ['cohabitation_vivant'],
  '112': ['cohabitation_vivant'],
  // PROTÉGER — sensibilisation, action environnementale/climatique
  '125': ['sciences_participatives'],
  '126': ['sciences_participatives'],
  '127': ['sciences_participatives'],
  '128': ['sciences_participatives'],
};

const ids = Object.keys(RECLASSEMENT);
console.log(`Reclassement de ${ids.length} fiches...`);

for (const id of ids) {
  const themes = RECLASSEMENT[id];
  const res = await fetch(`${url}/rest/v1/pedagogical_content?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ tags_theme: themes }),
  });
  if (!res.ok) {
    console.error(`Échec fiche ${id}:`, res.status, await res.text());
  } else {
    console.log(`OK ${id} -> ${themes.join(', ')}`);
  }
}

console.log('Terminé.');

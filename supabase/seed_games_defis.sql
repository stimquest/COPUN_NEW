-- Seed Data — Défis COPUN

-- Remove défis no longer in the library
-- (defi_jeu_1, defi_dechets_1, defi_collectif_5 sont désactivés via `actif`, pas supprimés,
-- pour préserver l'historique lié : points gagnés, défis déjà validés dans des semaines passées)
DELETE FROM defis WHERE id NOT IN (
    'defi_bio_2', 'defi_laisse_1', 'defi_erosion_1', 'defi_faune_1',
    'defi_bio_3', 'defi_bio_4', 'defi_dechets_1', 'defi_collectif_5',
    'defi_jeu_1', 'defi_debat_1'
);

INSERT INTO defis (id, description, instruction, type_preuve, icon, tags_theme, points) VALUES

-- ============================================================
-- FIL ROUGE — Observations récurrentes à valeur scientifique
-- Même spot, même protocole, à chaque stage
-- ============================================================

('defi_bio_2',
 'Inventaire du m²',
 'Délimitez toujours le même carré d''1 m² sur l''estran (balisé dès le premier passage). Comptez et photographiez chaque espèce présente. Notez le nombre d''individus par espèce visible.',
 'photo', 'grid_view', '{"biodiversite","caracteristiques_littoral"}', 5),

('defi_laisse_1',
 'Laisse du jour',
 'Sur 10 mètres de laisse de mer, toujours au même endroit, photographiez et catégorisez ce que vous trouvez : plastique, autres déchets, éléments naturels (algues, coquilles, bois). Comptez les déchets d''origine humaine.',
 'photo', 'water', '{"impact_presence_humaine","caracteristiques_littoral","marée"}', 5),

('defi_erosion_1',
 'Évolution de la côte',
 'Depuis le même point de vue, photographiez le même tronçon de côte (falaise, dune, berge, enrochement). Notez tout changement visible par rapport à la dernière observation.',
 'photo', 'landslide', '{"caracteristiques_littoral","impact_presence_humaine"}', 5),

('defi_faune_1',
 'Faune observée',
 'Depuis le même point d''observation, notez toutes les espèces animales visibles pendant 10 minutes (oiseaux, mammifères marins, poissons en surface). Photographiez si possible. Notez espèce, nombre estimé et comportement (repos, vol, chasse…).',
 'photo', 'visibility', '{"biodiversite","cohabitation_vivant"}', 5),

-- ============================================================
-- AVENTURE — Défis ponctuels, variés, engageants
-- ============================================================

('defi_bio_3',
 'Espèce invasive',
 'Recherchez et photographiez une espèce invasive présente sur votre site (crépidule, spartine, griffes de sorcière, crabe vert…). Notez où elle se concentre et son abondance approximative.',
 'photo', 'pest_control', '{"biodiversite","impact_presence_humaine"}', 5),

('defi_bio_4',
 'Traces de prédation',
 'Photographiez des traces d''activité animale laissées dans la nature : coquille percée par un prédateur, arête de poisson, plume arrachée, terrier, empreintes… La nature laisse des indices !',
 'photo', 'search', '{"biodiversite","cohabitation_vivant"}', 5),

('defi_dechets_1',
 'Collecte et tri de déchets',
 'Ramassez des déchets sur votre site et triez-les par matière (plastique, métal, verre, textile, autre). Photographiez le tri réalisé.',
 'photo', 'delete', '{"impact_presence_humaine"}', 5),

('defi_collectif_5',
 'Carte de l''écosystème local',
 'Le groupe dessine collectivement une carte ou schéma représentant l''écosystème de votre site : espèces observées, zones, interactions. Photographiez le résultat.',
 'photo', 'draw', '{"biodiversite","caracteristiques_littoral","transversal"}', 3),

-- ============================================================
-- CONFIANCE — Défis déclaratifs, pédagogiques
-- ============================================================

('defi_jeu_1',
 'Animer un quiz pédagogique',
 'Posez 5 questions minimum sur les thèmes environnementaux du stage. Le groupe répond collectivement à voix haute, la réponse majoritaire est retenue.',
 'quiz', 'sports_esports', '{"transversal"}', 2),

('defi_debat_1',
 'Le dilemme du marin',
 'Soumettez au groupe un dilemme environnemental (ex : pêche vs protection, tourisme vs nature). Chaque participant argumente. Le groupe vote et justifie sa décision.',
 'checkbox', 'balance', '{"transversal","cohabitation_vivant"}', 2)

ON CONFLICT (id) DO UPDATE SET
    description = EXCLUDED.description,
    instruction = EXCLUDED.instruction,
    type_preuve = EXCLUDED.type_preuve,
    icon = EXCLUDED.icon,
    tags_theme = EXCLUDED.tags_theme,
    points = EXCLUDED.points;

-- Fil rouge défis : observation récurrente au même spot
UPDATE defis SET spot_fixe = true WHERE id IN (
    'defi_bio_2',
    'defi_laisse_1',
    'defi_erosion_1',
    'defi_faune_1'
);

-- Reset spot_fixe for all other defis
UPDATE defis SET spot_fixe = false WHERE id NOT IN (
    'defi_bio_2',
    'defi_laisse_1',
    'defi_erosion_1',
    'defi_faune_1'
);

-- Défis retirés de la sélection courante (doublon avec le quiz de fin de semaine,
-- ou redondants avec d'autres défis) : désactivés, pas supprimés, pour garder l'historique.
UPDATE defis SET actif = false WHERE id IN (
    'defi_jeu_1',
    'defi_dechets_1',
    'defi_collectif_5'
);

UPDATE defis SET actif = true WHERE id NOT IN (
    'defi_jeu_1',
    'defi_dechets_1',
    'defi_collectif_5'
);

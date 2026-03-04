-- Seed Data for Games and Defis

-- Insert Defis
INSERT INTO defis (id, description, instruction, type_preuve, icon, tags_theme) VALUES
('defi_littoral_1', 'Cartographier l''estran', 'Lors de la marée basse, identifiez les différentes zones de l''estran et dessinez un croquis rapide des types de sols rencontrés (sable, rochers, vase).', 'photo', 'map', '{"caracteristiques_littoral","estran"}'),
('defi_activites_1', 'Recenser les activités locales', 'Observez et listez 3 activités humaines différentes sur votre site de pratique (pêche, plaisance, kayak, etc.). Validez en cochant la case.', 'checkbox', 'menu_book', '{"activites_humaines"}'),
('defi_bio_1', 'Identifier 3 espèces locales', 'Prenez en photo 3 espèces (animales ou végétales) distinctes rencontrées durant votre sortie et essayez de les nommer.', 'photo', 'set_meal', '{"biodiversite","cohabitation_vivant"}'),
('defi_paysage_1', 'Définir 3 amers', 'Identifiez 3 points de repère fixes et utiles (amers) sur la côte et prenez-les en photo.', 'photo', 'map', '{"lecture_paysage"}'),
('defi_reperes_1', 'Observer la montée des eaux', 'Placez un repère fixe au bord de l''eau et revenez 30 minutes plus tard pour mesurer la distance parcourue par la mer.', 'photo', 'straighten', '{"reperes_spatio_temporels","marée"}'),
('defi_meteo_1', 'Estimer la force du vent', 'Observez l''état de la mer (moutons, vagues) et estimez la force du vent sur l''échelle de Beaufort.', 'checkbox', 'air', '{"interactions_climatiques","vent"}'),
('defi_dechets_1', 'Collecte de la laisse de mer', 'Ramassez 5 déchets d''origine humaine dans la laisse de mer sans toucher aux éléments naturels (algues, bois).', 'photo', 'delete', '{"impact_presence_humaine","laisse de mer"}'),
('defi_cohabitation_1', 'Observation à distance', 'Observez un groupe d''oiseaux ou d''autres animaux marins à distance (avec des jumelles si possible) pendant 5 minutes sans les déranger.', 'checkbox', 'shield', '{"cohabitation_vivant"}'),
('defi_sciences_1', 'Contribuer à une base de données', 'Utilisez une application de sciences participatives (comme OBSenMER ou iNaturalist) pour signaler une de vos observations.', 'photo', 'biotech', '{"sciences_participatives"}'),
('defi_jeu_1', 'Animer un jeu pédagogique', 'Créez un jeu (Quiz, Vrai/Faux...) à partir des thèmes de votre programme et jouez-y avec votre groupe.', 'checkbox', 'sports_esports', '{"transversal"}')
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, instruction = EXCLUDED.instruction;

-- Insert Games
INSERT INTO game_cards (id, type, theme, related_objective_id, data) VALUES
-- Error processing CSV: ReferenceError: theme is not defined

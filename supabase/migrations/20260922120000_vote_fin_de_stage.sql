-- Le vote de fin de stage : des affirmations vraies ou fausses auxquelles le groupe
-- répond en levant un panneau, pendant que le moniteur lit à voix haute.
--
-- Deux besoins distincts, portés par deux colonnes :
--
--   `vote_vrai` / `vote_faux`  une affirmation exacte et une erreur plausible, tirées de
--                              `a_retenir` et de `erreur_frequente`. C'est le jeu : ce que
--                              le groupe a retenu de la semaine.
--
--   `actions[].confirmation`   « Cette semaine, on a … » — le groupe confirme que l'action
--                              a eu lieu. C'est la seule validation qui ne vienne pas du
--                              moniteur : il ne peut pas cocher à la place de ses stagiaires.
--
-- Pourquoi vrai/faux et pas un QCM : un choix à quatre options oblige les enfants à LIRE
-- les propositions, donc à disposer d'un écran partagé — précisément le dispositif que les
-- moniteurs refusent sur le terrain. Deux réponses se tiennent à l'oral : ils écoutent la
-- phrase et retournent leur panneau. Les 57 quiz de `game_cards` restent à quatre options
-- pour leur usage d'animation, inchangés.
--
-- Registre : ce lot couvre les 55 cartes de niveau 1 (Découverte), rédigées pour ~8 ans.
-- Le vocabulaire technique que la carte enseigne est conservé (estran, houle, patelle) ;
-- seule la langue soutenue descend d'un cran (« scruter » → « regarder au loin »). Les
-- niveaux 2 et 3 gardent le vocabulaire normal et restent à rédiger.
--
-- Les identifiants d'action ci-dessous ont été vérifiés un à un contre la base : une
-- confirmation orpheline ne serait jamais posée au groupe, et l'action resterait
-- invalidable.
ALTER TABLE pedagogical_content ADD COLUMN IF NOT EXISTS vote_vrai TEXT;
ALTER TABLE pedagogical_content ADD COLUMN IF NOT EXISTS vote_faux TEXT;

COMMENT ON COLUMN pedagogical_content.vote_vrai IS
  'Affirmation exacte pour le vote de fin de stage, à lire à voix haute (réponse : VRAI).';
COMMENT ON COLUMN pedagogical_content.vote_faux IS
  'Erreur plausible pour le vote de fin de stage (réponse : FAUX). Issue de erreur_frequente quand elle existe.';


-- #1 — Pourquoi y a-t-il plusieurs marées par jour ?
UPDATE pedagogical_content SET vote_vrai = 'En Normandie, la mer monte et descend deux fois par jour.', vote_faux = 'La mer monte une seule fois par jour.' WHERE id = '1';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f1_deux_mouvements' THEN elem || jsonb_build_object('confirmation', 'on a compté les marées d’une journée dans le calendrier des marées'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '1';

-- #2 — Comment connaît-on les heures de marée ?
UPDATE pedagogical_content SET vote_vrai = 'Pour connaître l’heure de la marée, on regarde la date et le lieu dans le calendrier des marées.', vote_faux = 'L’heure de la marée est la même partout en France.' WHERE id = '2';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f2_lire_prevision' THEN elem || jsonb_build_object('confirmation', 'on a cherché l’heure de la prochaine marée haute dans le calendrier'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '2';

-- #3 — Pourquoi l'heure de la marée n'est pas la même partout ?
UPDATE pedagogical_content SET vote_vrai = 'La marée n’arrive pas à la même heure dans tous les ports.', vote_faux = 'La marée haute est à la même heure sur toute la côte.' WHERE id = '3';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f3_deux_ports' THEN elem || jsonb_build_object('confirmation', 'on a comparé les heures de marée de deux ports'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '3';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f3_onde_carte' THEN elem || jsonb_build_object('confirmation', 'on a regardé sur une carte où se trouvent les ports'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '3';

-- #4 — Comment s'appelle la zone qui se couvre et se découvre avec la marée ?
UPDATE pedagogical_content SET vote_vrai = 'L’estran, c’est la partie de la plage que la mer recouvre et découvre.', vote_faux = 'Sur l’estran, tout est recouvert par l’eau à chaque marée.' WHERE id = '4';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f4_montrez_estran' THEN elem || jsonb_build_object('confirmation', 'on a repéré la zone que la mer découvre'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '4';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f4_six_heures_sec' THEN elem || jsonb_build_object('confirmation', 'on a comparé deux endroits de la plage sur une photo'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '4';

-- #5 — Qu’est-ce que l’étale de marée ?
UPDATE pedagogical_content SET vote_vrai = 'Quand la mer arrête de monter, le courant peut encore bouger.', vote_faux = 'Quand la mer arrête de monter, l’eau ne bouge plus du tout.' WHERE id = '5';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f5_sens_courant' THEN elem || jsonb_build_object('confirmation', 'on a regardé la hauteur de l’eau et comment elle bougeait autour d’un rocher'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '5';

-- #13 — Comment sait-on que l'eau monte et descend ?
UPDATE pedagogical_content SET vote_vrai = 'Pour voir si l’eau monte, on la compare à un rocher ou un poteau qui ne bouge pas.', vote_faux = 'Il suffit de regarder l’eau quelques secondes pour voir si elle monte.' WHERE id = '13';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f13_repere_cinq_minutes' THEN elem || jsonb_build_object('confirmation', 'on a choisi un repère et on a regardé le niveau après quelques minutes'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '13';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f13_regarde_la_monter' THEN elem || jsonb_build_object('confirmation', 'on a regardé plusieurs vagues pour voir si l’eau montait vraiment'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '13';

-- #14 — Comment sait-on jusqu'où la mer va monter ?
UPDATE pedagogical_content SET vote_vrai = 'La prochaine marée haute peut monter plus haut ou moins haut que la dernière.', vote_faux = 'La mer monte toujours jusqu’à la ligne d’algues laissée la dernière fois.' WHERE id = '14';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f14_lire_laisse' THEN elem || jsonb_build_object('confirmation', 'on a comparé plusieurs marées hautes dans le calendrier'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '14';

-- #16 — Pourquoi respecter les zones de reproduction selon les cycles de marée ?
UPDATE pedagogical_content SET vote_vrai = 'Quand la mer se retire, des animaux vivent encore sous le sable et les rochers.', vote_faux = 'Quand il n’y a plus d’eau, il n’y a plus rien de vivant.' WHERE id = '16';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f16_ca_a_l_air_vide' THEN elem || jsonb_build_object('confirmation', 'on a regardé les informations sur les animaux protégés'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '16';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f16_ou_on_marche' THEN elem || jsonb_build_object('confirmation', 'on a repéré les chemins où on a le droit de marcher'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '16';

-- #17 — Comment se forme le vent ?
UPDATE pedagogical_content SET vote_vrai = 'Le vent, c’est de l’air qui va d’un endroit où il y en a beaucoup vers un endroit où il y en a moins.', vote_faux = 'Le vent est fabriqué quelque part et envoyé vers nous.' WHERE id = '17';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f17_ballon' THEN elem || jsonb_build_object('confirmation', 'on a lâché un ballon gonflé pour voir l’air sortir'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '17';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f17_fabrique_ou' THEN elem || jsonb_build_object('confirmation', 'on a cherché d’où venait le vent'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '17';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f17_fort_ou_faible' THEN elem || jsonb_build_object('confirmation', 'on a cherché pourquoi il souffle plus fort certains jours'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '17';

-- #18 — Qu'est-ce qu'une brise thermique ?
UPDATE pedagogical_content SET vote_vrai = 'Le sable chauffe plus vite que la mer : l’air chaud monte et l’air de la mer vient prendre sa place.', vote_faux = 'Le vent de l’après-midi arrive au hasard.' WHERE id = '18';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f18_sable_ou_eau' THEN elem || jsonb_build_object('confirmation', 'on a touché le sable chaud et l’eau froide'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '18';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f18_pari_heure' THEN elem || jsonb_build_object('confirmation', 'on a parié à quelle heure le vent se lèverait'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '18';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f18_et_la_nuit' THEN elem || jsonb_build_object('confirmation', 'on a cherché ce qui se passe la nuit'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '18';

-- #20 — Comment repère-t-on d'où vient le vent ?
UPDATE pedagogical_content SET vote_vrai = 'Pour savoir d’où vient le vent, on regarde ce qu’il fait bouger autour de nous.', vote_faux = 'Il faut un appareil pour savoir d’où vient le vent.' WHERE id = '20';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f20_tous_le_doigt' THEN elem || jsonb_build_object('confirmation', 'on a montré tous ensemble d’où venait le vent'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '20';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f20_sans_instrument' THEN elem || jsonb_build_object('confirmation', 'on a cherché cinq choses qui bougent à cause du vent'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '20';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f20_oreilles_fermees' THEN elem || jsonb_build_object('confirmation', 'les yeux fermés, on a tourné jusqu’à sentir le vent en face'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '20';

-- #24 — Qu'est-ce qui fait bouger l'eau de mer ?
UPDATE pedagogical_content SET vote_vrai = 'La marée, le vent et la température de l’eau font bouger la mer.', vote_faux = 'Seul le vent fait bouger l’eau de la mer.' WHERE id = '24';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f24_quatre_indices' THEN elem || jsonb_build_object('confirmation', 'on a regardé l’eau bouger depuis le bord et on a cherché pourquoi'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '24';

-- #25 — Quels sont les différents types de courants marins ?
UPDATE pedagogical_content SET vote_vrai = 'Il existe plusieurs sortes de courants : certains sont petits, d’autres traversent des océans.', vote_faux = 'Tous les courants se ressemblent.' WHERE id = '25';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f25_identifier_courant' THEN elem || jsonb_build_object('confirmation', 'on a comparé deux courants sur des cartes'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '25';

-- #27 — Comment repère-t-on le sens du courant ?
UPDATE pedagogical_content SET vote_vrai = 'Pour voir dans quel sens va le courant, on regarde l’eau bouger par rapport à un rocher ou un poteau.', vote_faux = 'Un tourbillon suffit à savoir dans quel sens va tout le courant.' WHERE id = '27';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f27_moustache_bouee' THEN elem || jsonb_build_object('confirmation', 'on a suivi de l’écume pour voir dans quel sens allait l’eau'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '27';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f27_sans_rien_jeter' THEN elem || jsonb_build_object('confirmation', 'on a regardé à un deuxième endroit pour comparer'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '27';

-- #30 — Comment se forment les vagues ?
UPDATE pedagogical_content SET vote_vrai = 'C’est le vent qui fabrique les vagues en frottant sur l’eau.', vote_faux = 'Ce sont les bateaux qui font les vagues.' WHERE id = '30';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f30_vent_fort_vagues' THEN elem || jsonb_build_object('confirmation', 'on a cherché d’où venaient les vagues qu’on voyait'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '30';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f30_vague_ou_maree' THEN elem || jsonb_build_object('confirmation', 'on a fait la différence entre les vagues et la marée'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '30';

-- #31 — Quelle est la différence entre vagues et houle ?
UPDATE pedagogical_content SET vote_vrai = 'La houle vient de loin et ses vagues sont bien rangées ; les vagues du vent d’ici sont courtes et en désordre.', vote_faux = 'Toutes les vagues sont fabriquées par le vent qu’on sent sur place.' WHERE id = '31';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f31_range_ou_pas' THEN elem || jsonb_build_object('confirmation', 'on a regardé si les vagues étaient rangées ou en désordre'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '31';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f31_pas_de_vent_pourtant' THEN elem || jsonb_build_object('confirmation', 'on a cherché d’où venaient les vagues alors qu’il n’y avait pas de vent'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '31';

-- #33 — Comment décrirais-tu l'état de la mer ?
UPDATE pedagogical_content SET vote_vrai = 'Pour décrire la mer on dit : plate, ridée, agitée, avec ou sans moutons.', vote_faux = 'Il suffit de dire si la mer est belle ou pas.' WHERE id = '33';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f33_moutons_ou_pas' THEN elem || jsonb_build_object('confirmation', 'on a cherché l’écume blanche sur les vagues'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '33';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f33_un_seul_mot' THEN elem || jsonb_build_object('confirmation', 'chacun a choisi un mot pour décrire la mer'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '33';

-- #38 — Pourquoi la météo est-elle différente en mer qu'à terre ?
UPDATE pedagogical_content SET vote_vrai = 'Au bord de la mer, il fait moins chaud l’été et moins froid l’hiver qu’à l’intérieur des terres.', vote_faux = 'Il fait la même température à la plage et dans le village.' WHERE id = '38';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f38_parking_bord_eau' THEN elem || jsonb_build_object('confirmation', 'on a remarqué qu’il faisait plus frais au bord de l’eau'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '38';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f38_habille_pour_ou' THEN elem || jsonb_build_object('confirmation', 'on a dit sur quelle météo on s’était habillés'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '38';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f38_sable_eau_midi' THEN elem || jsonb_build_object('confirmation', 'on a touché le sable puis l’eau en plein soleil'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '38';

-- #39 — Comment se forment les nuages ?
UPDATE pedagogical_content SET vote_vrai = 'L’eau de la mer monte dans le ciel, refroidit, et forme les nuages.', vote_faux = 'Les nuages viennent de la fumée.' WHERE id = '39';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f39_ou_va_l_eau' THEN elem || jsonb_build_object('confirmation', 'on a regardé une flaque sécher'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '39';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f39_il_faut_quoi' THEN elem || jsonb_build_object('confirmation', 'on a cherché ce qu’il faut pour fabriquer un nuage'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '39';

-- #41 — Comment décrirais-tu l'état du ciel ?
UPDATE pedagogical_content SET vote_vrai = 'En regardant le ciel plusieurs fois dans la journée, on voit arriver le changement de temps.', vote_faux = 'Un seul coup d’œil au ciel suffit pour savoir le temps qu’il fera.' WHERE id = '41';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f41_trois_mots' THEN elem || jsonb_build_object('confirmation', 'chacun a décrit le ciel en trois mots'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '41';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f41_photo_mentale' THEN elem || jsonb_build_object('confirmation', 'on a comparé le ciel du départ et celui de maintenant'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '41';

-- #44 — Comment se forment les dunes ?
UPDATE pedagogical_content SET vote_vrai = 'Le vent porte le sable ; quand il rencontre une plante, le sable s’arrête et la dune grandit.', vote_faux = 'Les dunes sont là depuis toujours et ne bougent plus.' WHERE id = '44';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f44_derriere_chaque_obstacle' THEN elem || jsonb_build_object('confirmation', 'on a cherché les petits tas de sable derrière les plantes'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '44';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f44_depuis_toujours' THEN elem || jsonb_build_object('confirmation', 'on a cherché depuis quand la dune existe'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '44';

-- #46 — Comment décrirais-tu l'état de la plage ?
UPDATE pedagogical_content SET vote_vrai = 'Chaque plage est différente : son sable, ses galets, ses dunes, sa largeur.', vote_faux = 'Toutes les plages se ressemblent, c’est juste du sable.' WHERE id = '46';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f46_carte_identite' THEN elem || jsonb_build_object('confirmation', 'on a décrit notre plage en cinq points'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '46';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f46_grain_de_sable' THEN elem || jsonb_build_object('confirmation', 'on a pris une poignée de sable pour regarder les grains'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '46';

-- #48 — Pourquoi les dunes sont fragiles ?
UPDATE pedagogical_content SET vote_vrai = 'Les racines des plantes tiennent le sable comme un filet. Si on les abîme, le sable s’en va.', vote_faux = 'Une dune, c’est juste un tas de sable.' WHERE id = '48';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f48_tire_sur_l_oyat' THEN elem || jsonb_build_object('confirmation', 'on a tiré doucement sur une plante pour sentir les racines'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '48';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f48_chemin_sauvage' THEN elem || jsonb_build_object('confirmation', 'on a regardé un passage creusé dans la dune'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '48';

-- #50 — Comment s'appelle la bande colorée sur le sable, quand la mer se retire ?
UPDATE pedagogical_content SET vote_vrai = 'La laisse de mer, c’est la ligne de choses que la mer a déposées en se retirant.', vote_faux = 'Tout ce qui est sur la plage y a été jeté par des gens.' WHERE id = '50';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f50_poubelle_ou_garde_manger' THEN elem || jsonb_build_object('confirmation', 'on a décrit ce qu’il y avait dans la ligne sans y toucher'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '50';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f50_jusqu_ou_montee' THEN elem || jsonb_build_object('confirmation', 'on a cherché quelle ligne était la plus récente'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '50';

-- #51 — D'où viennent les débris de la laisse de mer ?
UPDATE pedagogical_content SET vote_vrai = 'La mer dépose des algues et du bois qui servent à la plage, et aussi nos déchets qui n’ont rien à y faire.', vote_faux = 'Tout ce qui traîne sur la plage est à ramasser.' WHERE id = '51';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f51_deux_tas' THEN elem || jsonb_build_object('confirmation', 'on a fait deux tas : ce que la mer a apporté, ce qui vient de nous'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '51';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f51_on_enleve_quoi' THEN elem || jsonb_build_object('confirmation', 'on a décidé lequel des deux tas on emportait'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '51';

-- #53 — Que peut-on trouver dans la laisse de mer ?
UPDATE pedagogical_content SET vote_vrai = 'Dans la laisse de mer, on trouve des traces de plein d’animaux qui vivent au large.', vote_faux = 'Dans la laisse de mer, il n’y a que des algues.' WHERE id = '53';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f53_cinq_choses' THEN elem || jsonb_build_object('confirmation', 'chacun a rapporté cinq choses différentes'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '53';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f53_oeuf_de_raie' THEN elem || jsonb_build_object('confirmation', 'on a cherché un œuf de raie ou un os de seiche'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '53';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f53_d_ou_ca_vient' THEN elem || jsonb_build_object('confirmation', 'on a retrouvé à quel animal appartenait un objet'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '53';

-- #57 — Pourquoi y a-t-il beaucoup de vie humaine, animale et végétale sur l'espace littoral ?
UPDATE pedagogical_content SET vote_vrai = 'La plage est un des endroits où il y a le plus de vie ; elle est juste bien cachée.', vote_faux = 'Une plage, c’est un endroit vide où il n’y a rien.' WHERE id = '57';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f57_combien_de_milieux' THEN elem || jsonb_build_object('confirmation', 'sans bouger, on a compté les endroits différents autour de nous'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '57';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f57_ca_a_l_air_vide' THEN elem || jsonb_build_object('confirmation', 'on a cherché pendant cinq minutes pour voir si la plage était vide'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '57';

-- #58 — Comment les espèces marines sont-elles adaptées à leur environnement ?
UPDATE pedagogical_content SET vote_vrai = 'Chaque animal de la plage a trouvé son truc pour survivre : une carapace, une ventouse, une coquille qui se ferme.', vote_faux = 'Les bêtes qu’on trouve sur les rochers sont des animaux banals.' WHERE id = '58';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f58_probleme_solution' THEN elem || jsonb_build_object('confirmation', 'on a inventé comment tenir six heures sans eau, avant de voir la solution de l’animal'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '58';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f58_une_bete_un_truc' THEN elem || jsonb_build_object('confirmation', 'chacun a choisi un animal et dit son astuce'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '58';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f58_arracher_patelle' THEN elem || jsonb_build_object('confirmation', 'on a essayé de décoller une patelle à la main'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '58';

-- #61 — Comment peut-on repérer des traces de présence animale sur ce site ?
UPDATE pedagogical_content SET vote_vrai = 'Les animaux laissent des traces : empreintes, plumes, coquilles percées.', vote_faux = 'Pour savoir quels animaux vivent là, il faut les voir.' WHERE id = '61';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f61_qui_est_passe' THEN elem || jsonb_build_object('confirmation', 'on a suivi des empreintes sur le sable'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '61';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f61_coquille_percee' THEN elem || jsonb_build_object('confirmation', 'on a cherché une coquille percée d’un trou'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '61';

-- #63 — Pourquoi je peux observer tout en étant discret ?
UPDATE pedagogical_content SET vote_vrai = 'On voit plus d’animaux en restant loin et silencieux qu’en s’approchant.', vote_faux = 'Pour mieux voir les animaux, il faut s’approcher au plus près.' WHERE id = '63';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f63_deux_approches' THEN elem || jsonb_build_object('confirmation', 'on s’est séparés en deux groupes pour comparer ce qu’on voyait'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '63';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f63_cinq_minutes_immobiles' THEN elem || jsonb_build_object('confirmation', 'on s’est assis en silence cinq minutes'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '63';

-- #64 — Pourquoi un dérangement peut causer du tort au « vivant » ?
UPDATE pedagogical_content SET vote_vrai = 'Quand un oiseau s’envole pour nous fuir, il dépense de l’énergie qu’il ne retrouvera pas.', vote_faux = 'Si l’oiseau revient après, il n’y a pas de problème.' WHERE id = '64';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f64_combien_d_envols' THEN elem || jsonb_build_object('confirmation', 'on a compté les fois où des oiseaux se sont envolés'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '64';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f64_il_revient_pourtant' THEN elem || jsonb_build_object('confirmation', 'on a cherché si tout était réglé quand l’oiseau revient'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '64';

-- #68 — Pourquoi on ne part pas à la même heure chaque jour ?
UPDATE pedagogical_content SET vote_vrai = 'Les horaires de sortie changent chaque jour parce que la hauteur de l’eau change.', vote_faux = 'On part à la même heure tous les jours.' WHERE id = '68';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f68_comparer_deux_jours' THEN elem || jsonb_build_object('confirmation', 'on a cherché dans les prévisions quand il y aurait assez d’eau'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '68';

-- #70 — Comment lire son environnement pour naviguer en sécurité ?
UPDATE pedagogical_content SET vote_vrai = 'Cinq minutes à regarder le ciel, la mer et le vent avant de partir évitent la plupart des ennuis.', vote_faux = 'S’il fait beau, c’est que tout va bien pour aller sur l’eau.' WHERE id = '70';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f70_cinq_minutes_avant' THEN elem || jsonb_build_object('confirmation', 'chacun a annoncé un point : vent, mer, nuages ou marée'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '70';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f70_il_fait_beau_donc' THEN elem || jsonb_build_object('confirmation', 'on a voté pour savoir si le soleil suffit à décider'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '70';

-- #73 — Comment avoir un impact minimal sur l'environnement ?
UPDATE pedagogical_content SET vote_vrai = 'Ne rien laisser derrière soi, c’est la règle la plus simple et la plus efficace.', vote_faux = 'Un petit déchet tout seul, ça ne compte pas.' WHERE id = '73';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f73_avant_apres_photo' THEN elem || jsonb_build_object('confirmation', 'on a regardé l’endroit en arrivant, puis on a comparé en partant'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '73';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f73_un_petit_dechet' THEN elem || jsonb_build_object('confirmation', 'on a compté combien de gens passent ici l’été'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '73';

-- #75 — Quelles sont les activités humaines en mer et sur le littoral ?
UPDATE pedagogical_content SET vote_vrai = 'Le bord de mer sert à travailler, à circuler et à se promener, tout en même temps.', vote_faux = 'Le bord de mer ne sert qu’aux vacances.' WHERE id = '75';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f75_carte_usages' THEN elem || jsonb_build_object('confirmation', 'on a repéré trois activités et cherché à quoi elles servaient'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '75';

-- #82 — Qu’est-ce qu’un nuage ?
UPDATE pedagogical_content SET vote_vrai = 'Un nuage, c’est des milliards de gouttes d’eau si petites qu’elles flottent.', vote_faux = 'Un nuage est un objet solide qui garde sa forme.' WHERE id = '82';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f82_regarde_le_changer' THEN elem || jsonb_build_object('confirmation', 'on a fixé un nuage deux minutes pour le voir changer'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '82';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f82_ca_pese_combien' THEN elem || jsonb_build_object('confirmation', 'on a deviné le poids de l’eau dans un nuage'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '82';

-- #83 — Pourquoi les nuages peuvent-ils être blancs ou gris foncés ?
UPDATE pedagogical_content SET vote_vrai = 'Un nuage fin laisse passer la lumière et paraît blanc ; un nuage épais la bloque et paraît gris.', vote_faux = 'Les nuages noirs sont faits d’autre chose que les blancs.' WHERE id = '83';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f83_meme_eau' THEN elem || jsonb_build_object('confirmation', 'on a comparé un nuage blanc et un nuage gris'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '83';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f83_main_devant_soleil' THEN elem || jsonb_build_object('confirmation', 'on a regardé à travers sa main puis son poing fermé'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '83';

-- #84 — Quel rôle joue un nuage dans le cycle de l’eau ?
UPDATE pedagogical_content SET vote_vrai = 'L’eau de la mer s’évapore, forme les nuages, puis retombe en pluie très loin de là.', vote_faux = 'La pluie retombe toujours là où l’eau s’est évaporée.' WHERE id = '84';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f84_d_ou_vient_la_pluie' THEN elem || jsonb_build_object('confirmation', 'on a cherché d’où venait la pluie qui tombe ici'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '84';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f84_suivre_le_nuage' THEN elem || jsonb_build_object('confirmation', 'on a suivi un nuage parti de la mer vers la terre'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '84';

-- #85 — Qu’est-ce que le vent ?
UPDATE pedagogical_content SET vote_vrai = 'Le vent, c’est de l’air qui bouge. On ne le voit pas, mais on voit ce qu’il déplace.', vote_faux = 'L’air, ce n’est rien du tout, c’est du vide.' WHERE id = '85';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f85_air_c_est_rien' THEN elem || jsonb_build_object('confirmation', 'on a fait gonfler un sac plastique avec le vent'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '85';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f85_voile_qui_pousse' THEN elem || jsonb_build_object('confirmation', 'on a tenu la voile pour sentir le vent pousser'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '85';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f85_montre_le_vent' THEN elem || jsonb_build_object('confirmation', 'on a essayé de montrer le vent lui-même'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '85';

-- #86 — Qu’entend-on par « oiseau migrateur » en Normandie ?
UPDATE pedagogical_content SET vote_vrai = 'Un oiseau migrateur fait le même voyage chaque année : un endroit pour l’hiver, un autre pour faire ses petits.', vote_faux = 'Les oiseaux qu’on voit ici vivent ici toute l’année.' WHERE id = '86';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f86_il_est_d_ici' THEN elem || jsonb_build_object('confirmation', 'on a parié si un oiseau vivait ici toute l’année'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '86';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f86_ou_il_dort_en_janvier' THEN elem || jsonb_build_object('confirmation', 'on a imaginé où il était il y a six mois'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '86';

-- #87 — Pourquoi la Normandie est-elle un territoire important pour les migrations d’oiseaux ?
UPDATE pedagogical_content SET vote_vrai = 'Les oiseaux s’arrêtent toujours aux mêmes endroits parce qu’ils y trouvent à manger.', vote_faux = 'Les oiseaux s’arrêtent n’importe où, au hasard.' WHERE id = '87';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f87_station_service' THEN elem || jsonb_build_object('confirmation', 'on a cherché ce qu’il y a à manger dans la vase'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '87';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f87_ils_fouillent_quoi' THEN elem || jsonb_build_object('confirmation', 'on a regardé un oiseau fouiller la vase, puis on a gratté au même endroit'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '87';

-- #89 — Qu’est-ce qu’un courant marin ?
UPDATE pedagogical_content SET vote_vrai = 'Le courant, c’est l’eau qui se déplace. La marée, c’est l’eau qui monte ou descend.', vote_faux = 'Le courant et la marée, c’est la même chose.' WHERE id = '89';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f89_ou_sont_les_berges' THEN elem || jsonb_build_object('confirmation', 'on a dit dans quel sens l’eau se déplaçait'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '89';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f89_montre_le' THEN elem || jsonb_build_object('confirmation', 'on a comparé le niveau sur un poteau et l’écume qui passe'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '89';

-- #90 — Qu’est-ce qu’une houle ?
UPDATE pedagogical_content SET vote_vrai = 'La houle, ce sont des vagues qui viennent d’une tempête très loin d’ici.', vote_faux = 'La houle se fabrique juste devant la plage.' WHERE id = '90';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f90_d_ou_elle_vient' THEN elem || jsonb_build_object('confirmation', 'on a essayé de deviner de combien loin venait la houle'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '90';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f90_mise_en_rang' THEN elem || jsonb_build_object('confirmation', 'on a cherché pourquoi la houle est bien rangée'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '90';

-- #91 — Pourquoi les horaires de marée changent-ils chaque jour à un même endroit ?
UPDATE pedagogical_content SET vote_vrai = 'Les heures de marée changent un peu chaque jour.', vote_faux = 'La marée haute est à la même heure tous les jours.' WHERE id = '91';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f91_lire_decalage' THEN elem || jsonb_build_object('confirmation', 'on a montré avec nos corps comment la Terre et la Lune tournent'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '91';

-- #92 — Quel rôle joue la curiosité dans l’observation de la nature ?
UPDATE pedagogical_content SET vote_vrai = 'Se poser une question aide à mieux regarder et à trouver des indices.', vote_faux = 'Pour bien observer, il suffit d’ouvrir les yeux.' WHERE id = '92';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f92_faits_hypotheses' THEN elem || jsonb_build_object('confirmation', 'chacun a choisi un détail bizarre, puis on a cherché l’indice ensemble'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '92';

-- #93 — Comment l’usage des sens (vue, ouïe, toucher…) contribue-t-il à être un bon observateur de la nature ?
UPDATE pedagogical_content SET vote_vrai = 'On observe aussi avec les oreilles et le nez, pas seulement avec les yeux.', vote_faux = 'On observe la nature seulement avec les yeux.' WHERE id = '93';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f93_ferme_les_yeux' THEN elem || jsonb_build_object('confirmation', 'les yeux fermés, on a compté les bruits différents'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '93';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f93_ca_sent_quoi' THEN elem || jsonb_build_object('confirmation', 'on a nommé les odeurs : algues, vase, sel'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '93';

-- #94 — Quel rôle joue la connaissance des espèces et des milieux dans l’observation de la nature ?
UPDATE pedagogical_content SET vote_vrai = 'Quand on sait comment vit un animal, on sait quoi regarder.', vote_faux = 'On voit les mêmes choses qu’on connaisse l’animal ou non.' WHERE id = '94';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f94_decrire_avant_nommer' THEN elem || jsonb_build_object('confirmation', 'on a décrit un animal avant de savoir ce qu’il était, puis on a regardé à nouveau'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '94';

-- #95 — Pourquoi le respect de la nature est-il une composante d’un bon observateur ?
UPDATE pedagogical_content SET vote_vrai = 'En restant discret, on protège l’animal et on le voit faire ce qu’il fait vraiment.', vote_faux = 'Si l’animal ne s’enfuit pas, c’est qu’on ne le dérange pas.' WHERE id = '95';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f95_distance_respect' THEN elem || jsonb_build_object('confirmation', 'on est restés à distance pour regarder sans déranger'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '95';

-- #96 — Qu’est-ce que l’on entend par « état de la mer » ?
UPDATE pedagogical_content SET vote_vrai = 'Pour décrire l’état de la mer, on regarde la taille des vagues mais aussi le vent et l’espace entre elles.', vote_faux = 'Il suffit de regarder la hauteur des vagues.' WHERE id = '96';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f96_pas_que_la_hauteur' THEN elem || jsonb_build_object('confirmation', 'on a décrit la mer tous ensemble'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '96';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f96_bulletin_du_groupe' THEN elem || jsonb_build_object('confirmation', 'deux d’entre nous ont annoncé l’état de la mer avant de partir'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '96';

-- #97 — Quels éléments visuels/observables pouvez-vous vérifier en bord de mer pour estimer l’état de la mer ?
UPDATE pedagogical_content SET vote_vrai = 'Depuis la plage, on voit déjà beaucoup de choses sur l’état de la mer.', vote_faux = 'Il faut être sur l’eau pour savoir comment est la mer.' WHERE id = '97';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f97_sans_mouiller_pieds' THEN elem || jsonb_build_object('confirmation', 'on a listé ce qu’on voyait de la mer depuis la plage'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '97';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f97_horizon_net' THEN elem || jsonb_build_object('confirmation', 'on a regardé si la ligne au loin était nette ou floue'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '97';

-- #98 — Pourquoi la protection de l’environnement est-elle importante pour la santé humaine ?
UPDATE pedagogical_content SET vote_vrai = 'Ce qu’on jette dans un ruisseau finit dans la mer où on se baigne.', vote_faux = 'Ce qui est jeté loin de la mer ne l’atteint jamais.' WHERE id = '98';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f98_verifier_eau' THEN elem || jsonb_build_object('confirmation', 'on a suivi une rivière jusqu’à la mer sur une carte'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '98';

-- #120 — Avant de s’engager sur l’eau quel comportement d’observation est recommandé ?
UPDATE pedagogical_content SET vote_vrai = 'Les grosses vagues arrivent par séries : il faut attendre quelques minutes pour les voir.', vote_faux = 'On voit tout de suite comment est la mer en un coup d’œil.' WHERE id = '120';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f120_cinq_minutes_du_bord' THEN elem || jsonb_build_object('confirmation', 'on n’a pas bougé pendant cinq minutes pour regarder la mer'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '120';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f120_un_coup_d_oeil_suffit' THEN elem || jsonb_build_object('confirmation', 'on a jugé la mer en trois secondes, puis après cinq minutes'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '120';

-- #200 — Pourquoi y a-t-il des méduses certains jours et pas d'autres ?
UPDATE pedagogical_content SET vote_vrai = 'Les méduses ne choisissent pas où elles vont : le vent et les courants les emportent.', vote_faux = 'Les méduses viennent vers la plage pour nous attaquer.' WHERE id = '200';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f200_ou_pousse_vent' THEN elem || jsonb_build_object('confirmation', 'on a regardé le sens du vent et cherché où étaient les méduses'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '200';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f200_elles_attaquent' THEN elem || jsonb_build_object('confirmation', 'on a cherché avec quoi une méduse pourrait nager'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '200';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f200_pari_demain' THEN elem || jsonb_build_object('confirmation', 'on a parié s’il y aurait des méduses demain'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '200';

-- #201 — Comment reconnaître les méduses qu'on croise ici ?
UPDATE pedagogical_content SET vote_vrai = 'Toutes les méduses ne piquent pas pareil ; on les reconnaît à leurs dessins.', vote_faux = 'Toutes les méduses piquent très fort.' WHERE id = '201';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f201_quatre_trefles' THEN elem || jsonb_build_object('confirmation', 'on a cherché les quatre ronds en trèfle sur une méduse'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '201';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f201_dessin_avant_nom' THEN elem || jsonb_build_object('confirmation', 'on a décrit les dessins avant de donner le nom'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '201';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f201_toutes_pareil' THEN elem || jsonb_build_object('confirmation', 'on a voté pour dire si toutes les méduses piquent'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '201';

-- #202 — Que faire quand on trouve une méduse échouée sur la plage ?
UPDATE pedagogical_content SET vote_vrai = 'Une méduse échouée pique encore, même morte depuis longtemps.', vote_faux = 'Une méduse morte ne pique plus.' WHERE id = '202';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f202_morte_donc_inoffensive' THEN elem || jsonb_build_object('confirmation', 'on a dit si on pensait qu’une méduse morte piquait'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '202';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f202_qui_vient_manger' THEN elem || jsonb_build_object('confirmation', 'on a cherché les traces d’oiseaux autour'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '202';
UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f202_fragment_invisible' THEN elem || jsonb_build_object('confirmation', 'on a remarqué qu’un bout de tentacule reste dans le sable'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '202';

-- Contrôle : aucune carte de niveau 1 ne doit rester sans affirmation, et aucune de ses
-- actions sans phrase de confirmation — sinon le vote ne peut pas valider cette action.
DO $$
DECLARE manquantes INT; sans_conf INT;
BEGIN
  SELECT count(*) INTO manquantes
    FROM pedagogical_content
   WHERE niveau = 1 AND source <> 'custom' AND (vote_vrai IS NULL OR vote_faux IS NULL);

  SELECT count(*) INTO sans_conf
    FROM pedagogical_content pc, jsonb_array_elements(pc.actions) AS a
   WHERE pc.niveau = 1 AND pc.source <> 'custom' AND a->>'confirmation' IS NULL;

  IF manquantes > 0 OR sans_conf > 0 THEN
    RAISE EXCEPTION 'Vote incomplet : % carte(s) sans affirmation, % action(s) sans confirmation', manquantes, sans_conf;
  END IF;
END $$;

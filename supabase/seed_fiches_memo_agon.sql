-- =============================================
-- Import fiches mémo — contenu local Agon-Coutainville
-- Source : memoCop.txt (contenu fourni par la référente pédagogique)
-- Toutes en statut 'brouillon' : à relire et publier depuis /ressources
-- (ou /admin) avant qu'elles soient visibles des moniteurs.
-- =============================================

INSERT INTO fiches_memo (titre, resume, contenu, tags_thematiques, tags_saisons, tags, statut)
VALUES

-- ── JAUNE — OBSERVER ──────────────────────────────────────────────

(
  'Le vivant observable à Agon-Coutainville en ce moment',
  'Oiseaux, mammifères marins, estran et flore : ce qu''on peut voir fin juin-début juillet.',
  '<p>À cette période de l''année (fin juin-début juillet), Agon-Coutainville est l''un des meilleurs sites naturalistes du littoral ouest de la Manche. La Pointe d''Agon et le Havre de la Sienne, classés et intégrés au réseau Natura 2000, concentrent une grande diversité d''espèces.</p>
<h3>Oiseaux</h3>
<ul>
<li><strong>Gravelot à collier interrompu</strong> : c''est la pleine période de nidification. Les adultes courent sur le sable sec avec leurs poussins — rester à distance des zones balisées.</li>
<li><strong>Tadorne de Belon</strong> : très visible dans les vasières et les prés salés.</li>
<li><strong>Aigrette garzette et Héron cendré</strong> : ils pêchent à marée descendante.</li>
<li><strong>Huîtrier pie, Avocette élégante</strong> et différents bécasseaux sur les bancs de sable.</li>
<li>Plusieurs espèces de goélands, sternes et cormorans.</li>
</ul>
<p>Au lever du jour ou deux heures avant la marée haute, l''activité est généralement la plus intéressante.</p>
<h3>Mammifères marins</h3>
<p>Plus discrets, mais observables :</p>
<ul>
<li><strong>Phoque veau-marin</strong> : parfois au repos sur les bancs de sable du havre, surtout à marée basse.</li>
<li><strong>Grand dauphin ou Marsouin commun</strong> : observations occasionnelles au large, davantage avec une mer calme et des jumelles.</li>
</ul>
<h3>Estran à marée basse</h3>
<p>Avec un coefficient de marée important, l''estran devient très riche : crevette grise, crabe vert, étoile de mer commune, anémone de mer, bigorneau, petits gobies, vers marins et nombreuses algues brunes et rouges dans les mares résiduelles.</p>
<h3>Flore</h3>
<p>Les dunes et prés salés sont actuellement très colorés : salicorne, lavande de mer, aster maritime, oyat (qui fixe les dunes). Plusieurs orchidées sont présentes selon les secteurs — plus de 400 espèces végétales ont été recensées sur le site.</p>
<p><em>Meilleurs moments : lever ou coucher du soleil (meilleure lumière, activité maximale de la faune), ou 2 heures avant la marée haute (oiseaux rassemblés sur les reposoirs).</em></p>',
  ARRAY['biodiversite_saisonnalite']::text[],
  ARRAY['haute_saison']::text[],
  ARRAY['Agon-Coutainville', 'faune', 'flore', 'oiseaux', 'mammifères marins', 'estran'],
  'brouillon'
),

(
  'Particularités de l''espace littoral d''Agon-Coutainville',
  'Un paysage mobile façonné par les marées : côte des Havres, dunes, prés salés, estuaire.',
  '<p>L''espace littoral d''Agon-Coutainville est remarquable par la rencontre entre la mer, un estuaire, des dunes et des prés salés. C''est un paysage en évolution permanente, façonné par les marées, les courants et le vent.</p>
<h3>Un littoral de la « Côte des Havres »</h3>
<p>Agon-Coutainville appartient à la Côte des Havres, une succession de vastes estuaires sableux typiques de la côte ouest du Cotentin. Le havre de la Sienne est l''un des plus grands de la région : à marée haute, la mer remonte loin dans les terres, puis découvre d''immenses bancs de sable et des vasières à marée basse.</p>
<h3>Un paysage en mouvement</h3>
<p>Contrairement à une côte rocheuse, ce littoral est très mobile : les dunes avancent ou reculent selon les tempêtes, les chenaux du havre changent progressivement de tracé, les bancs de sable se déplacent avec les courants, les marées (parmi les plus fortes d''Europe) remodèlent régulièrement le paysage.</p>
<h3>Une grande diversité de milieux naturels</h3>
<p>Sur quelques kilomètres seulement : plages de sable, vaste estran découvert à marée basse, dunes embryonnaires puis fixées par la végétation, mares temporaires, prés salés (herbus), vasières, l''estuaire de la Sienne.</p>
<h3>Un espace fortement protégé</h3>
<p>Site classé, réseau Natura 2000, zones naturelles d''intérêt écologique (ZNIEFF), terrains gérés par le Conservatoire du littoral.</p>
<p><em>En résumé : un écosystème vivant où marées, dunes, prés salés et estuaire interagissent en permanence — d''où sa richesse écologique et les nombreuses mesures de protection.</em></p>',
  ARRAY['caracteristiques_littoral']::text[],
  ARRAY[]::text[],
  ARRAY['Agon-Coutainville', 'dunes', 'estuaire', 'prés salés', 'Natura 2000'],
  'brouillon'
),

(
  'Activités humaines sur le littoral d''Agon-Coutainville',
  'Tourisme, sports nautiques, pêche, conchyliculture : qui utilise le littoral et comment.',
  '<p>Agon-Coutainville est une station balnéaire de la Manche où le littoral accueille de nombreuses activités humaines :</p>
<ul>
<li><strong>Tourisme balnéaire</strong> : baignade, promenade sur la digue, détente sur les plages, location de vacances.</li>
<li><strong>Activités nautiques</strong> : voile, paddle, kayak, char à voile, skimboard et surf.</li>
<li><strong>Pêche</strong> : pêche à pied (palourdes, coquillages) et pêche professionnelle.</li>
<li><strong>Conchyliculture</strong> : élevage d''huîtres et de moules, activité économique importante du littoral.</li>
<li><strong>Loisirs et sport</strong> : randonnée sur les sentiers du littoral, vélo, golf et équitation à proximité des plages.</li>
<li><strong>Protection du littoral</strong> : entretien des dunes, des digues et des espaces naturels pour lutter contre l''érosion et préserver la biodiversité.</li>
</ul>',
  ARRAY['activites_humaines']::text[],
  ARRAY[]::text[],
  ARRAY['Agon-Coutainville', 'tourisme', 'pêche', 'conchyliculture'],
  'brouillon'
),

(
  'L''élevage des huîtres et des moules à Agon-Coutainville',
  'Tables ostréicoles, bouchots mytilicoles : comment fonctionne la conchyliculture locale.',
  '<p>Les élevages d''huîtres et de moules sur le littoral d''Agon-Coutainville présentent plusieurs particularités :</p>
<ul>
<li>Ils dépendent des marées : les parcs sont découverts à marée basse, ce qui permet aux ostréiculteurs et mytiliculteurs de travailler.</li>
<li>Techniques spécifiques : les huîtres sont élevées dans des poches fixées sur des tables métalliques ; les moules sont souvent élevées sur des bouchots (pieux en bois plantés dans l''estran), où elles s''accrochent grâce à leurs filaments.</li>
<li>Ils nécessitent une eau de bonne qualité : les huîtres et les moules filtrent naturellement l''eau pour se nourrir de plancton.</li>
<li>L''élevage est long : 2 à 4 ans pour qu''une huître atteigne sa taille commerciale, 12 à 18 mois pour une moule.</li>
<li>C''est une activité économique importante : emplois locaux, marchés et restaurants.</li>
</ul>',
  ARRAY['activites_humaines']::text[],
  ARRAY[]::text[],
  ARRAY['Agon-Coutainville', 'conchyliculture', 'huîtres', 'moules'],
  'brouillon'
),

-- ── BLEU — COMPRENDRE ─────────────────────────────────────────────

(
  'Prélever des informations avec les sens sur l''environnement marin',
  'Les 5 sens comme outils d''observation en mer et sur le littoral.',
  '<p>Pour rester connecté à l''environnement marin d''Agon-Coutainville, on peut utiliser ses cinq sens :</p>
<ul>
<li><strong>La vue</strong> : observer l''état de la mer, les vagues, les marées, les nuages, les oiseaux, les dunes, les bouées et les autres bateaux.</li>
<li><strong>L''ouïe</strong> : écouter le bruit des vagues, le vent, les mouettes, les cornes de brume ou les moteurs des bateaux.</li>
<li><strong>L''odorat</strong> : sentir l''air marin, les algues, les coquillages ou les embruns.</li>
<li><strong>Le toucher</strong> : ressentir la force du vent, la température de l''air et de l''eau, le sable ou les embruns sur la peau.</li>
<li><strong>Le goût</strong> : percevoir le goût salé des embruns.</li>
</ul>
<p><em>En résumé : les sens permettent de recueillir des informations sur la météo, l''état de la mer, les marées et l''environnement.</em></p>',
  ARRAY['reperes_spatio_temporels', 'lecture_paysage']::text[],
  ARRAY[]::text[],
  ARRAY['Agon-Coutainville', 'sens', 'observation'],
  'brouillon'
),

(
  'Observer et anticiper l''état de la mer',
  'Hauteur des vagues, vent, marées, courants : ce qu''il faut regarder pour naviguer en sécurité.',
  '<p>Pour observer l''état de la mer, on regarde plusieurs éléments : la hauteur des vagues (mer calme, peu agitée, agitée ou très agitée), le vent (force et direction), les marées (montante ou descendante), la couleur de l''eau (une eau trouble peut indiquer que les vagues remuent le sable), les courants (visibles via le déplacement de l''eau, des algues ou des bouées), et la météo (ciel, nuages, prévisions).</p>
<h3>Anticiper les changements en mer</h3>
<ul>
<li>Observer le ciel : l''arrivée de gros nuages peut annoncer une dégradation du temps.</li>
<li>Surveiller le vent : s''il se renforce ou change de direction, l''état de la mer peut évoluer rapidement.</li>
<li>Regarder les vagues : elles peuvent devenir plus hautes ou plus rapprochées.</li>
<li>Tenir compte des marées : une marée montante ou descendante peut modifier les courants et la profondeur.</li>
<li>Repérer les autres bateaux pour anticiper leur trajectoire.</li>
<li>Connaître son itinéraire et les endroits où s''abriter en cas de mauvais temps.</li>
<li>Consulter les prévisions météo avant de partir.</li>
</ul>',
  ARRAY['reperes_spatio_temporels', 'interactions_climatiques']::text[],
  ARRAY[]::text[],
  ARRAY['Agon-Coutainville', 'météo', 'vent', 'sécurité'],
  'brouillon'
),

(
  'Le rythme des marées à Agon-Coutainville',
  'Marées semi-diurnes, vive-eau, morte-eau : pourquoi les marées sont si marquées ici.',
  '<p>Agon-Coutainville connaît un rythme de marées semi-diurne : deux marées hautes et deux marées basses par jour, avec un intervalle d''environ 12h25 entre deux pleines mers. L''heure des marées est donc retardée d''environ 50 minutes chaque jour.</p>
<h3>Pourquoi ce rythme ?</h3>
<ul>
<li>L''attraction gravitationnelle de la Lune (cause principale) et celle du Soleil (qui la renforce ou l''atténue selon leur position).</li>
<li>Lorsque Terre, Lune et Soleil sont alignés (nouvelle lune, pleine lune) : les attractions s''additionnent — marées de <strong>vive-eau</strong>, fort coefficient, marnage important.</li>
<li>Lorsque Lune et Soleil forment un angle droit (premier/dernier quartier) : leurs effets se compensent en partie — marées de <strong>morte-eau</strong>, moins marquées.</li>
</ul>
<p>À Agon-Coutainville, les marées sont particulièrement spectaculaires car la commune se situe sur le littoral occidental de la Manche, à proximité de la baie du Mont-Saint-Michel. La forme de cette côte et la faible profondeur des fonds marins amplifient le phénomène : lors des grandes marées, la mer peut se retirer sur plusieurs kilomètres, découvrant un vaste estran propice à la pêche à pied.</p>',
  ARRAY['caracteristiques_littoral', 'reperes_spatio_temporels']::text[],
  ARRAY[]::text[],
  ARRAY['Agon-Coutainville', 'marée', 'vive-eau', 'morte-eau'],
  'brouillon'
),

(
  'Les coefficients de marée',
  'Comprendre l''échelle de 20 à 120 et pourquoi elle varie.',
  '<p>Les coefficients de marée indiquent l''importance de l''amplitude des marées sur les côtes françaises de l''Atlantique, de la Manche et de la mer du Nord. Plus le coefficient est élevé, plus la différence entre marée haute et marée basse (le marnage) est importante.</p>
<h3>L''échelle</h3>
<ul>
<li>20 à 45 : faible coefficient — marées de morte-eau, faible amplitude.</li>
<li>45 à 70 : coefficient moyen.</li>
<li>70 à 95 : fort coefficient — grandes marées.</li>
<li>95 à 120 : très fort coefficient — très grandes marées, estran largement découvert à marée basse.</li>
</ul>
<h3>Pourquoi ça varie</h3>
<p>Lors de la nouvelle lune et de la pleine lune, les trois astres sont presque alignés : les attractions s''additionnent (marées de vive-eau, coefficients élevés). Lors des premier et dernier quartiers, Soleil et Lune forment un angle d''environ 90° par rapport à la Terre : leurs effets se compensent en partie (marées de morte-eau, coefficients faibles).</p>
<p><strong>À retenir</strong> : le coefficient ne donne pas la hauteur de la marée, mais l''importance de son amplitude.</p>',
  ARRAY['caracteristiques_littoral']::text[],
  ARRAY[]::text[],
  ARRAY['Agon-Coutainville', 'marée', 'coefficient'],
  'brouillon'
),

(
  'La règle des douzièmes',
  'Estimer rapidement la hauteur d''eau entre marée basse et marée haute.',
  '<p>La règle des douzièmes est une méthode simple qui permet d''estimer la montée ou la descente de la mer entre la marée basse et la marée haute. Elle est surtout utilisée par les plaisanciers et les pêcheurs à pied.</p>
<p><strong>Principe</strong> : entre une marée basse et une marée haute, il s''écoule environ 6 heures. La variation du niveau de la mer ne se fait pas à vitesse constante : lente au début, plus rapide au milieu, puis elle ralentit à nouveau. La hauteur totale de la marée est appelée <em>marnage</em>.</p>
<table>
<tr><th>Heure</th><th>Part du marnage</th></tr>
<tr><td>1ʳᵉ heure</td><td>1/12</td></tr>
<tr><td>2ᵉ heure</td><td>2/12</td></tr>
<tr><td>3ᵉ heure</td><td>3/12</td></tr>
<tr><td>4ᵉ heure</td><td>3/12</td></tr>
<tr><td>5ᵉ heure</td><td>2/12</td></tr>
<tr><td>6ᵉ heure</td><td>1/12</td></tr>
</table>
<p><strong>Exemple</strong> à Agon-Coutainville : marée basse à 8h, marée haute à 14h, marnage de 6m. Chaque douzième vaut 6 ÷ 12 = 0,5m. La mer monte alors d''environ : 0,5m (8h-9h), 1m (9h-10h), 1,5m (10h-11h), 1,5m (11h-12h), 1m (12h-13h), 0,5m (13h-14h).</p>
<p>⚠️ Cette règle est une approximation. Elle ne remplace pas les horaires et hauteurs de marée officiels, car les conditions locales (vents, pression atmosphérique, relief du littoral) peuvent modifier le niveau réel de la mer.</p>',
  ARRAY['caracteristiques_littoral']::text[],
  ARRAY[]::text[],
  ARRAY['Agon-Coutainville', 'marée', 'règle des douzièmes'],
  'brouillon'
),

(
  'Comment les éléments climatiques interagissent à Agon-Coutainville',
  'Vent, mer, précipitations, températures : un climat océanique doux et venteux.',
  '<p>À Agon-Coutainville, les principaux éléments du climat interagissent ainsi :</p>
<ul>
<li>Le vent venant de la Manche apporte de l''humidité et influence les températures.</li>
<li>La mer adoucit le climat : hivers relativement doux, étés frais.</li>
<li>Les précipitations sont régulières toute l''année grâce à l''air humide venu de l''océan.</li>
<li>La température et le vent favorisent l''évaporation de l''eau de mer, augmentant l''humidité de l''air et pouvant former des nuages.</li>
<li>Les tempêtes combinent vents forts, pluie et fortes marées, ce qui peut provoquer une érosion du littoral.</li>
</ul>
<p><em>En résumé : la mer, le vent, la température et les précipitations sont étroitement liés, créant un climat océanique doux, humide et souvent venteux.</em></p>',
  ARRAY['interactions_climatiques']::text[],
  ARRAY[]::text[],
  ARRAY['Agon-Coutainville', 'climat', 'vent', 'météo'],
  'brouillon'
),

(
  'Relation entre le sens du vent et la formation des dunes',
  'Comment le vent transporte le sable et façonne le cordon dunaire.',
  '<p>Le sens du vent joue un rôle essentiel dans la formation et l''évolution des dunes : il transporte le sable de la plage vers l''intérieur des terres, ce qui permet la formation des dunes et les fait évoluer au fil du temps.</p>
<ul>
<li>Lorsque le vent souffle depuis la mer vers la terre, il transporte du sable sec de la plage.</li>
<li>En rencontrant un obstacle (plantes, clôtures, relief), le sable se dépose et forme des dunes.</li>
<li>Les vents dominants façonnent les dunes : elles se développent dans la direction où le sable est transporté.</li>
<li>Si les vents sont très forts ou si les dunes ne sont pas protégées par la végétation, le sable peut être déplacé et les dunes peuvent s''éroder.</li>
</ul>
<p>À Agon-Coutainville, les vents dominants venant de la Manche participent à la formation et au maintien du cordon dunaire, qui protège l''arrière-pays des vagues et des submersions marines.</p>',
  ARRAY['interactions_climatiques', 'caracteristiques_littoral']::text[],
  ARRAY[]::text[],
  ARRAY['Agon-Coutainville', 'vent', 'dunes'],
  'brouillon'
),

(
  'Repères et amers pour naviguer près d''Agon-Coutainville',
  'Phare, dunes, clochers, balises : comment se repérer depuis la mer.',
  '<p>Quand on navigue près d''Agon-Coutainville, les marins utilisent des amers (repères visibles depuis la mer) pour se repérer :</p>
<ul>
<li>Le phare de la pointe d''Agon : repère très visible pour l''entrée du havre.</li>
<li>Le havre de Regnéville : permet de situer la côte et les chenaux.</li>
<li>Les dunes d''Agon-Coutainville : facilement reconnaissables depuis la mer.</li>
<li>Les balises et bouées : elles indiquent les chenaux, les hauts-fonds et les zones de navigation.</li>
<li>Les clochers des villages du littoral (Agon, Blainville-sur-Mer), visibles par beau temps.</li>
<li>Les parcs à huîtres et à moules, qui servent aussi de repères locaux (à éviter pendant la navigation).</li>
<li>Le château d''eau d''Agon-Coutainville : visible de loin grâce à sa hauteur.</li>
</ul>
<h3>S''orienter grâce aux îles</h3>
<ul>
<li>Si vous voyez Jersey : vous regardez vers le nord-ouest.</li>
<li>Si vous voyez Guernesey : vous regardez également vers le nord-ouest (un peu plus à l''ouest selon votre position).</li>
<li>Si vous voyez les îles Chausey : vous regardez vers le sud-ouest — et cela signifie que le temps est très clair, la visibilité excellente.</li>
</ul>',
  ARRAY['reperes_spatio_temporels', 'lecture_paysage']::text[],
  ARRAY[]::text[],
  ARRAY['Agon-Coutainville', 'amers', 'navigation', 'repères'],
  'brouillon'
),

-- ── VERT — PROTÉGER ───────────────────────────────────────────────

(
  'Bonnes pratiques pour ne pas déranger le vivant',
  'Sentiers balisés, distance avec les animaux, laisse de mer : les gestes qui protègent.',
  '<p>Il est important d''adopter des gestes simples pour protéger la faune et la flore du littoral :</p>
<ul>
<li>Rester sur les sentiers balisés pour ne pas abîmer les dunes et leur végétation.</li>
<li>Ne pas déranger les oiseaux en évitant de s''approcher des zones où ils nichent.</li>
<li>Respecter les animaux marins : ne pas les capturer inutilement, les remettre délicatement à leur place si on les observe.</li>
<li>Ne laisser aucun déchet sur la plage ou dans la mer.</li>
<li>Ne pas arracher les plantes des dunes, car elles retiennent le sable et protègent le littoral.</li>
<li>Respecter les règles de la pêche à pied (tailles minimales, quantités autorisées, périodes de pêche).</li>
<li>Éviter les zones de parcs à huîtres et à moules, espaces de travail et milieux fragiles.</li>
<li>Limiter le bruit pour ne pas effrayer les animaux.</li>
<li>Ne pas piétiner la laisse de mer.</li>
</ul>
<h3>La laisse de mer</h3>
<p>La laisse de mer est l''ensemble des éléments déposés sur la plage par les vagues et les marées. C''est un élément naturel essentiel qui nourrit les animaux, protège les dunes et contribue au bon fonctionnement de l''écosystème du littoral. Éviter de la piétiner ou de l''enlever lorsqu''elle est naturelle — ne ramasser que les déchets d''origine humaine (plastiques, canettes, etc.) en laissant les éléments naturels sur place.</p>
<h3>Qu''est-ce qu''un dérangement ?</h3>
<p>Un dérangement est une action qui gêne les animaux ou dégrade leur habitat, même involontairement. Conséquences possibles : les animaux fuient et dépensent de l''énergie, peuvent abandonner leur nid ou leurs petits, trouvent moins facilement de nourriture, leur reproduction peut être perturbée.</p>',
  ARRAY['cohabitation_vivant', 'impact_presence_humaine']::text[],
  ARRAY[]::text[],
  ARRAY['Agon-Coutainville', 'laisse de mer', 'dérangement', 'pêche à pied'],
  'brouillon'
),

(
  'L''impact humain sur l''environnement naturel',
  'Pollution, destruction d''habitats, érosion... mais aussi des impacts positifs possibles.',
  '<p>L''impact humain sur l''environnement naturel correspond à toutes les conséquences des activités des êtres humains sur la nature. Il peut être positif ou négatif.</p>
<h3>Impacts négatifs</h3>
<ul>
<li><strong>Pollution</strong> : déchets plastiques, pollution de l''eau, de l''air et du sol.</li>
<li><strong>Destruction des habitats</strong> : construction de routes, bâtiments, ports qui détruisent des milieux naturels.</li>
<li><strong>Dérangement de la faune</strong> : bruit, présence humaine, circulation dans des zones sensibles.</li>
<li><strong>Érosion des milieux naturels</strong> : piétinement des dunes, dégradation des plages.</li>
<li><strong>Surexploitation des ressources</strong> : pêche excessive, prélèvements trop importants.</li>
<li><strong>Changement climatique</strong> : lié aux émissions de gaz à effet de serre.</li>
</ul>
<h3>Impacts positifs</h3>
<ul>
<li>Protection des espaces naturels (parcs, réserves, zones protégées).</li>
<li>Actions de nettoyage des plages et des milieux naturels.</li>
<li>Sensibilisation et éducation à l''environnement.</li>
<li>Restauration des habitats (replantation de dunes, protection des espèces).</li>
</ul>',
  ARRAY['impact_presence_humaine']::text[],
  ARRAY[]::text[],
  ARRAY['Agon-Coutainville', 'impact humain', 'pollution'],
  'brouillon'
),

(
  'Réduire l''impact de la présence humaine à Agon-Coutainville',
  'Les comportements responsables à adopter sur ce littoral précis.',
  '<p>Pour réduire l''impact de la présence humaine sur le littoral d''Agon-Coutainville, il faut adopter des comportements responsables :</p>
<ul>
<li>Rester sur les chemins balisés pour protéger les dunes.</li>
<li>Ne laisser aucun déchet et ramasser les déchets trouvés sur la plage.</li>
<li>Respecter la laisse de mer, utile aux animaux et aux plantes.</li>
<li>Éviter de déranger la faune (oiseaux, coquillages, crabes…).</li>
<li>Respecter les règles de la pêche à pied et ne prélever que ce qui est autorisé.</li>
<li>Ne pas arracher les plantes des dunes.</li>
<li>Limiter le bruit pour préserver la tranquillité des animaux.</li>
<li>Utiliser les équipements prévus (parkings, poubelles, passerelles d''accès à la plage).</li>
<li>Sensibiliser les autres au respect de l''environnement.</li>
</ul>',
  ARRAY['impact_presence_humaine', 'cohabitation_vivant']::text[],
  ARRAY[]::text[],
  ARRAY['Agon-Coutainville', 'impact humain', 'bonnes pratiques'],
  'brouillon'
),

(
  'À qui transmettre des données naturalistes sur le littoral d''Agon-Coutainville',
  'Organismes, associations locales et applications de sciences participatives.',
  '<p>Si vous observez des espèces animales, végétales ou des phénomènes naturels sur le littoral d''Agon-Coutainville, vous pouvez transmettre ces informations à des organismes spécialisés :</p>
<ul>
<li><strong>Office français de la biodiversité (OFB)</strong>, qui participe à la protection de la nature.</li>
<li><strong>GRETIA</strong> (Groupe d''étude des invertébrés armoricains), pour certaines observations de la faune.</li>
<li><strong>Conservatoire du littoral</strong>, qui protège les espaces naturels du littoral.</li>
<li><strong>Parc naturel régional des Marais du Cotentin et du Bessin</strong>, qui mène des actions de suivi de la biodiversité.</li>
<li>Les associations naturalistes locales ou les services de la commune.</li>
</ul>
<h3>Associations locales</h3>
<ul>
<li><strong>CPIE du Cotentin</strong> : sorties nature et suivis de biodiversité.</li>
<li><strong>Association AVRIL</strong> : sensibilisation à l''environnement et connaissance du littoral.</li>
<li><strong>Groupe Ornithologique Normand</strong> : observation et protection des oiseaux.</li>
<li><strong>CPIE Marais du Cotentin et du Bessin</strong> : gestion des milieux naturels.</li>
<li>Les associations de protection du littoral et de randonnée locale.</li>
</ul>
<h3>Applications de sciences participatives</h3>
<ul>
<li><strong>INPN Espèces</strong> pour signaler des observations de plantes et d''animaux.</li>
<li><strong>NaturaList</strong> pour partager des observations naturalistes.</li>
</ul>',
  ARRAY['sciences_participatives']::text[],
  ARRAY[]::text[],
  ARRAY['Agon-Coutainville', 'sciences participatives', 'associations'],
  'brouillon'
);

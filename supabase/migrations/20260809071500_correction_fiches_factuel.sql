-- Corrections factuelles repérées pendant la rédaction des actions de terrain.
--
-- Trois fiches portaient des affirmations inexactes. Elles sont ici corrigées avec leurs
-- sources, en conservant le registre des autres fiches (phrases courtes, pas de jargon).

-- ── Fiche 115 : hauteur du cumulonimbus ──
--
-- « parfois jusqu'à 12 km de haut » sous-estime nettement le phénomène : les sommets se
-- situent typiquement entre 8 et 18 km, et peuvent dépasser 20 km. La formulation
-- laissait croire que 12 km était un maximum exceptionnel, alors que c'est une valeur
-- courante.
--
-- Sources : Météo-France, education.meteofrance.fr/comprendre-la-meteo/orages/les-cumulonimbus
--           Atlas international des nuages (OMM), cloudatlas.wmo.int
UPDATE pedagogical_content SET
  explication = 'Le cumulonimbus est reconnaissable à son développement vertical impressionnant : son sommet dépasse souvent 10 km et peut atteindre 18 km, bien au-dessus de l''altitude des avions de ligne, avec une forme d''enclume caractéristique. C''est le nuage responsable des orages, de la grêle et des rafales violentes — à éviter absolument en mer.',
  a_retenir = 'Le cumulonimbus monte plus haut que les avions et sa base est sombre. Il annonce pluie forte, grêle ou orage : on ne prend pas de risque.'
WHERE id = '115';

-- ── Fiche 119 : effet Coriolis ──
--
-- « en profondeur, la rotation de la Terre (effet Coriolis) dévie sa trajectoire »
-- localise à tort le phénomène en profondeur. Coriolis agit partout, y compris en
-- surface : c'est précisément là que la déviation est la plus marquée. Le courant de
-- surface part à environ 45° à droite du vent dans l'hémisphère nord (spirale d'Ekman) —
-- ce qui explique l'observation proposée par la fiche, à savoir que courant et vent ne
-- concordent pas.
--
-- L'ancienne formulation rendait d'ailleurs l'`a_observer` incohérent : si Coriolis
-- n'agissait qu'en profondeur, rien n'expliquerait l'écart visible en surface.
--
-- Sources : Futura Sciences, futura-sciences.com/planete/definitions/terre-spirale-ekman-20793
--           Wikipédia, fr.wikipedia.org/wiki/Spirale_d'Ekman
UPDATE pedagogical_content SET
  explication = 'Trois facteurs se combinent. Le vent pousse la surface de l''eau. La rotation de la Terre (effet Coriolis) dévie ensuite ce mouvement : dans l''hémisphère nord, le courant de surface part environ 45° à droite du vent — il ne suit donc jamais exactement sa direction. Enfin, la forme des côtes et des fonds marins canalise ou détourne ce déplacement.',
  a_retenir = 'Le vent pousse l''eau, la rotation de la Terre la fait dévier vers la droite, et la forme des côtes la canalise. Le courant ne suit jamais exactement le vent.',
  erreur_frequente = 'On attribue tout au vent et on s''attend à ce que le courant aille dans le même sens. Il part de biais, à cause de la rotation de la Terre.'
WHERE id = '119';

-- ── Fiche 116 : phénologie de la migration ──
--
-- Deux inexactitudes. Le suivi du Groupe ornithologique normand porte sur 1972-2019, soit
-- une cinquantaine d'années, et non « depuis les années 1980 ». Surtout, « certaines
-- avancent leur passage, d'autres le retardent » ne correspond pas au résultat publié :
-- les quatre espèces suivies (trois hirondelles et le martinet noir) avancent toutes leur
-- arrivée, de 18 jours en moyenne — de 5 jours pour le martinet noir à 24 jours pour
-- l'hirondelle de rivage.
--
-- Le chiffre est ajouté : un décalage nommé frappe davantage qu'un « décalage progressif ».
--
-- Source : Agence normande de la biodiversité et du développement durable,
--          anbdd.fr/biodiversite/connaissance/les-indicateurs-normands-de-la-biodiversite/oiseaux-migrateurs
UPDATE pedagogical_content SET
  explication = 'La phénologie, c''est le calendrier naturel des migrations : dates d''arrivée et de départ. En Normandie, les ornithologues du GONm relèvent ces dates depuis 1972. Sur une cinquantaine d''années, les hirondelles et le martinet noir arrivent en moyenne 18 jours plus tôt — de 5 jours pour le martinet noir à 24 jours pour l''hirondelle de rivage.',
  a_retenir = 'La phénologie, c''est la date à laquelle les oiseaux arrivent et repartent. En cinquante ans, les hirondelles sont arrivées de plus en plus tôt : 18 jours d''avance en moyenne.',
  erreur_frequente = 'On croit que les migrations sont réglées comme une horloge. Les dates avancent d''année en année, et c''est justement ce qui alerte les scientifiques.'
WHERE id = '116';

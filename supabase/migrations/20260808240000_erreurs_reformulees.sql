-- Reformulation du champ `erreur_frequente` là où la croyance restait implicite.
--
-- Repéré sur la fiche 58 : « On voit des animaux ordinaires. Ce sont des champions de
-- la survie dans un milieu extrême. » Sous un libellé annonçant une idée fausse, cette
-- formulation était incompréhensible — elle énonce un constat, pas une croyance, et les
-- deux phrases semblent sans rapport.
--
-- La règle appliquée : nommer explicitement ce que les enfants croient (verbe d'opinion),
-- puis la correction. Les formulations décrivant une habitude (« on regarde une seule
-- fois », « on confond X et Y ») restent lisibles et ne sont pas touchées.
--
-- Le bloc a par ailleurs été sorti du déroulé côté application : il sert à mettre le
-- moniteur à l'aise en amont, pas à lui souffler une réplique pendant la séance.

UPDATE pedagogical_content SET
  erreur_frequente = 'Les enfants croient souvent que ces bêtes sont banales. Chacune a en réalité une solution bien à elle pour survivre là où presque rien ne tient : carapace, ventouse, coquille qui se referme.'
WHERE id = '58';

UPDATE pedagogical_content SET
  erreur_frequente = 'Les enfants croient qu''une plage est un endroit vide. C''est au contraire un des milieux les plus riches qui soient — la vie y est simplement discrète.'
WHERE id = '57';

UPDATE pedagogical_content SET
  erreur_frequente = 'On croit que la dune est un tas de sable uniforme. C''est une succession de milieux différents, chacun avec ses propres plantes.'
WHERE id = '45';

UPDATE pedagogical_content SET
  erreur_frequente = 'On croit que l''air n''est rien, du vide. Le vent, c''est de l''air bien réel qui se déplace — on le sent sur la peau.'
WHERE id = '85';

UPDATE pedagogical_content SET
  erreur_frequente = 'On croit que la chaîne alimentaire commence aux poissons. Elle commence par une algue microscopique qu''on ne voit même pas, et sans elle plus rien ne mange.'
WHERE id = '59';

UPDATE pedagogical_content SET
  erreur_frequente = 'On croit que chaque élément vit de son côté. Le vent, l''eau, le sable et les animaux forment en réalité un seul système : changer une chose déplace tout le reste.'
WHERE id = '69';

UPDATE pedagogical_content SET
  erreur_frequente = 'On croit que la ligne d''algues est de la saleté. C''est le repère le plus fiable pour savoir jusqu''où l''eau va monter.'
WHERE id = '14';

UPDATE pedagogical_content SET
  erreur_frequente = 'On croit que tout ce qui traîne sur la plage est à ramasser. Les algues et le bois nourrissent la dune ; seul le plastique n''a rien à y faire.'
WHERE id = '51';

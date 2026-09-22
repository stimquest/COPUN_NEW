-- Couche transmission — premier lot : marées, vent, dunes, laisse de mer.
--
-- Les fiches disent au moniteur ce qu'il faut savoir ; il leur manquait quoi DIRE aux
-- enfants. Ce lot couvre les sujets rencontrés à chaque séance (et non des cas
-- ponctuels), avec un équilibre Comprendre / Observer / Protéger pour que chaque thème
-- soit exploitable quel que soit l'angle choisi.
--
-- Les trois variantes d'accroche sont volontairement de tons différents — question
-- directe, invitation à observer, affirmation fausse à retourner — pour que le choix du
-- moniteur soit un vrai arbitrage et pas un simulacre. Le contenu s'appuie sur le champ
-- `explication` déjà rédigé pour chaque fiche.

-- ── Les marées ───────────────────────────────────────────────────────────────
UPDATE pedagogical_content SET
  accroche = 'La mer monte et descend tous les jours. Qui la fait bouger, à votre avis ?',
  accroches_variantes = ARRAY[
    'La mer monte et descend tous les jours. Qui la fait bouger, à votre avis ?',
    'Regardez la Lune ce soir. Elle a un pouvoir sur la mer — lequel ?',
    'Plantez un bâton là où l''eau arrive. On revient dans une heure voir qui avait raison.'
  ],
  a_observer = 'Le niveau de l''eau contre un rocher ou un poteau, au début et à la fin de la séance.',
  a_retenir = 'C''est la Lune qui tire l''eau de la mer. Deux fois par jour elle monte, deux fois elle descend.',
  erreur_frequente = 'Beaucoup pensent que c''est le vent qui fait monter la mer. Le vent fait les vagues ; c''est la Lune qui fait la marée.'
WHERE id = '1';

UPDATE pedagogical_content SET
  accroche = 'Cette partie de la plage, ce matin elle était sous l''eau. Elle a un nom, vous le connaissez ?',
  accroches_variantes = ARRAY[
    'Cette partie de la plage, ce matin elle était sous l''eau. Elle a un nom, vous le connaissez ?',
    'Ici, deux fois par jour c''est la mer, deux fois par jour c''est la plage. Comment on appelle cet endroit ?',
    'Les animaux qui vivent ici ont chaud, froid, sec puis mouillé dans la même journée. Comment ils font ?'
  ],
  a_observer = 'La bande entre le haut de plage et l''eau : couleurs du sable, algues accrochées, petites flaques.',
  a_retenir = 'L''estran, c''est la partie de la plage que la mer découvre et recouvre chaque jour.',
  erreur_frequente = 'On croit que rien ne vit là parce que ça paraît vide. C''est au contraire un des endroits les plus riches — la vie est cachée sous le sable et les rochers.'
WHERE id = '4';

UPDATE pedagogical_content SET
  accroche = 'Aujourd''hui le coefficient est écrit sur le tableau. Ça veut dire quoi, à votre avis ?',
  accroches_variantes = ARRAY[
    'Aujourd''hui le coefficient est écrit sur le tableau. Ça veut dire quoi, à votre avis ?',
    'Certains jours la mer descend très loin, d''autres jours à peine. Pourquoi cette différence ?',
    'Grande marée, ça veut dire que la mer monte plus haut. Et elle descend comment ?'
  ],
  a_observer = 'Jusqu''où la mer est descendue aujourd''hui, comparé à la trace laissée les jours précédents.',
  a_retenir = 'Plus le coefficient est grand, plus la mer monte haut ET descend bas — et plus le courant est fort.',
  erreur_frequente = 'On retient seulement « la mer monte plus haut ». Elle descend aussi beaucoup plus bas, et c''est surtout le courant qui devient puissant.'
WHERE id = '7';

UPDATE pedagogical_content SET
  accroche = 'Là, maintenant : la mer monte ou elle descend ? Comment vous feriez pour le savoir ?',
  accroches_variantes = ARRAY[
    'Là, maintenant : la mer monte ou elle descend ? Comment vous feriez pour le savoir ?',
    'Choisissez un rocher et regardez bien où arrive l''eau. On y revient dans cinq minutes.',
    'Chacun choisit son rocher et le surveille. Le premier qui prouve que la mer bouge a gagné.'
  ],
  a_observer = 'Un point fixe — rocher, poteau, pied du ponton — et le niveau de l''eau à cinq minutes d''intervalle.',
  a_retenir = 'On ne voit pas la mer monter en direct. Il faut un repère fixe et un peu de patience.',
  erreur_frequente = 'On s''attend à voir l''eau bouger. C''est bien trop lent pour l''œil : seule la comparaison avec un repère le montre.'
WHERE id = '13';

UPDATE pedagogical_content SET
  accroche = 'Vous voyez cette ligne d''algues sur le sable ? Elle raconte quelque chose d''utile.',
  accroches_variantes = ARRAY[
    'Vous voyez cette ligne d''algues sur le sable ? Elle raconte quelque chose d''utile.',
    'Où est-ce qu''on peut poser nos affaires sans qu''elles finissent mouillées ? Comment on décide ?',
    'Je pose mon sac ici. Bonne idée ou pas ?'
  ],
  a_observer = 'La ligne de débris la plus haute sur la plage : algues, bois, coquillages.',
  a_retenir = 'La ligne d''algues montre jusqu''où la mer est montée. On pose ses affaires au-dessus.',
  erreur_frequente = 'On prend cette ligne pour de la saleté. C''est le repère le plus fiable pour savoir où l''eau va arriver.'
WHERE id = '14';

UPDATE pedagogical_content SET
  accroche = 'Sous vos pieds, là, il y a peut-être des milliers d''œufs. Vous les voyez ?',
  accroches_variantes = ARRAY[
    'Sous vos pieds, là, il y a peut-être des milliers d''œufs. Vous les voyez ?',
    'Cet endroit a l''air vide. Qu''est-ce qui pourrait s''y cacher, à votre avis ?',
    'Ici il n''y a rien, on peut courir partout. Qui est d''accord ?'
  ],
  a_observer = 'Le sable et le dessous des rochers : petits trous, coquilles, amas gélatineux.',
  a_retenir = 'L''estran est une nurserie. Ce qui a l''air vide est plein de vie cachée.',
  erreur_frequente = 'On pense qu''un endroit sans animal visible est un endroit sans vie. Les œufs et les jeunes sont enfouis — invisibles, mais bien là.'
WHERE id = '16';

-- ── Le vent ──────────────────────────────────────────────────────────────────
UPDATE pedagogical_content SET
  accroche = 'Le vent, ça vient d''où ? Personne ne souffle, pourtant.',
  accroches_variantes = ARRAY[
    'Le vent, ça vient d''où ? Personne ne souffle, pourtant.',
    'Quand on lâche un ballon gonflé, l''air part en sifflant. Le vent, c''est un peu pareil — pourquoi ?',
    'Trouvez-moi trois choses, autour de vous, qui prouvent qu''il y a du vent.'
  ],
  a_observer = 'Tout ce que le vent fait bouger autour de nous : drapeau, herbes, rides sur l''eau.',
  a_retenir = 'Le vent, c''est de l''air qui se déplace d''un endroit où il y en a beaucoup vers un endroit où il y en a moins.',
  erreur_frequente = 'On imagine que le vent est fabriqué quelque part. C''est simplement de l''air qui bouge pour rééquilibrer.'
WHERE id = '17';

UPDATE pedagogical_content SET
  accroche = 'Ce matin il n''y avait pas de vent. Cet après-midi il y en aura. Comment je le sais ?',
  accroches_variantes = ARRAY[
    'Ce matin il n''y avait pas de vent. Cet après-midi il y en aura. Comment je le sais ?',
    'Touchez le sable, puis l''eau. Lequel est le plus chaud ? Ça explique le vent de cet après-midi.',
    'Le vent de l''après-midi vient toujours de la mer. Pourquoi jamais de la terre ?'
  ],
  a_observer = 'La différence de température entre le sable et l''eau, et l''heure à laquelle le vent se lève.',
  a_retenir = 'La terre chauffe plus vite que la mer. L''air chaud monte, l''air frais de la mer prend sa place : ça fait du vent.',
  erreur_frequente = 'On croit que le vent de l''après-midi arrive au hasard. Il est prévisible : grand soleil le matin et pas de vent annoncent la brise.'
WHERE id = '18';

UPDATE pedagogical_content SET
  accroche = 'Sans bouger de votre place, dites-moi d''où vient le vent. Tous les indices sont là.',
  accroches_variantes = ARRAY[
    'Sans bouger de votre place, dites-moi d''où vient le vent. Tous les indices sont là.',
    'Mouillez votre doigt et levez-le en l''air. Quel côté est froid ?',
    'Tout le monde pointe le doigt d''où vient le vent. À trois, on compare.'
  ],
  a_observer = 'Le drapeau, les rides sur l''eau, les cheveux, la fumée, le sens des vagues.',
  a_retenir = 'Le vent laisse des traces partout. Il suffit de regarder ce qui bouge et de remonter le fil.',
  erreur_frequente = 'On croit qu''il faut un instrument. Le corps et le paysage suffisent largement.'
WHERE id = '20';

UPDATE pedagogical_content SET
  accroche = 'Quand on est trop toilé, on ne pense plus qu''à tenir. Qu''est-ce qu''on rate pendant ce temps ?',
  accroches_variantes = ARRAY[
    'Quand on est trop toilé, on ne pense plus qu''à tenir. Qu''est-ce qu''on rate pendant ce temps ?',
    'Trop de voile pour trop de vent : qu''est-ce qui peut arriver, à part se retourner ?',
    'Plus on a de voile, mieux c''est. Qui est d''accord ?'
  ],
  a_observer = 'Sa propre attention : est-ce qu''on regarde encore autour de soi, ou seulement son bateau ?',
  a_retenir = 'Bien réglé, on maîtrise et on peut regarder autour. En surpuissance, on ne voit plus ni les oiseaux ni les zones sensibles.',
  erreur_frequente = 'On pense qu''adapter sa voilure sert seulement à la sécurité. C''est aussi ce qui libère l''attention pour ce qui nous entoure.'
WHERE id = '23';

-- ── La plage et les dunes ────────────────────────────────────────────────────
UPDATE pedagogical_content SET
  accroche = 'Cette colline de sable, qui l''a construite ?',
  accroches_variantes = ARRAY[
    'Cette colline de sable, qui l''a construite ?',
    'Regardez derrière cette touffe d''herbe : il y a un petit tas de sable. Pourquoi juste là ?',
    'Cherchez le plus petit tas de sable derrière une plante. C''est une dune qui commence.'
  ],
  a_observer = 'Les petits amas de sable derrière chaque obstacle : touffe d''oyat, bois flotté, piquet.',
  a_retenir = 'Le vent porte le sable. Dès qu''il rencontre une plante, le sable s''arrête et s''accumule : la dune grandit.',
  erreur_frequente = 'On croit que les dunes sont là depuis toujours. Elles se construisent en permanence, grain par grain.'
WHERE id = '44';

UPDATE pedagogical_content SET
  accroche = 'Ces herbes piquantes ont l''air de rien. Pourtant sans elles, plus de dune.',
  accroches_variantes = ARRAY[
    'Ces herbes piquantes ont l''air de rien. Pourtant sans elles, plus de dune.',
    'Pourquoi on nous demande de passer par le petit chemin en bois plutôt que tout droit ?',
    'Marcher sur une dune ne casse rien, c''est juste du sable. Qui est d''accord ?'
  ],
  a_observer = 'Les racines qui affleurent, les zones tassées sans végétation, les chemins sauvages creusés par les passages.',
  a_retenir = 'Les racines des plantes tiennent le sable comme un filet. On les abîme, le sable repart.',
  erreur_frequente = 'On pense qu''une dune est un simple tas de sable. C''est un tas de sable tenu par des plantes — sans elles, il disparaît.'
WHERE id = '48';

-- ── La laisse de mer ─────────────────────────────────────────────────────────
UPDATE pedagogical_content SET
  accroche = 'Cette ligne d''algues sur le sable : c''est sale, ou c''est utile ?',
  accroches_variantes = ARRAY[
    'Cette ligne d''algues sur le sable : c''est sale, ou c''est utile ?',
    'La mer est passée par là et elle a laissé quelque chose. Quoi exactement ?',
    'Il faudrait nettoyer tout ça. Qui est d''accord ?'
  ],
  a_observer = 'Le contenu de la ligne : algues, bois, coquilles — et ce qui n''y a pas sa place.',
  a_retenir = 'La laisse de mer, c''est ce que la mer a déposé en se retirant. Ce n''est pas une poubelle, c''est un garde-manger.',
  erreur_frequente = 'On la prend pour de la saleté à enlever. Elle nourrit les oiseaux et les insectes, et elle aide à retenir le sable.'
WHERE id = '50';

UPDATE pedagogical_content SET
  accroche = 'Cinq minutes : chacun rapporte une chose trouvée dans cette ligne. On regarde ensemble.',
  accroches_variantes = ARRAY[
    'Cinq minutes : chacun rapporte une chose trouvée dans cette ligne. On regarde ensemble.',
    'Qui trouve un œuf de raie ? Un os de seiche ? Ça existe, cherchez bien.',
    'Défi : trouver cinq choses différentes dans un mètre de cette ligne.'
  ],
  a_observer = 'Coquilles vides, œufs de raie, os de seiche, bois flotté, plumes, algues de plusieurs sortes.',
  a_retenir = 'La laisse de mer raconte qui vit au large. Chaque objet vient de quelque part.',
  erreur_frequente = 'On croit qu''il n''y a que des algues. En cherchant un peu, on trouve les traces de dizaines d''espèces.'
WHERE id = '53';

UPDATE pedagogical_content SET
  accroche = 'On va nettoyer la plage. Mais tout ne se ramasse pas — comment on trie ?',
  accroches_variantes = ARRAY[
    'On va nettoyer la plage. Mais tout ne se ramasse pas — comment on trie ?',
    'Ce bois flotté, cette algue, ce bout de plastique : lequel je laisse sur place ?',
    'Une plage propre, c''est une plage où il ne reste plus rien. Qui est d''accord ?'
  ],
  a_observer = 'Le tri : ce qui vient de la mer (bois, algues, coquilles) et ce qui vient de nous (plastique, mégots, verre).',
  a_retenir = 'On ramasse ce que l''homme a laissé. On laisse ce que la mer a apporté.',
  erreur_frequente = 'On croit bien faire en ramassant tout, algues comprises. Enlever la laisse de mer prive la dune de sa nourriture et de sa protection.'
WHERE id = '55';

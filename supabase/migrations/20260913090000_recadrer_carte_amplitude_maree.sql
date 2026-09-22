-- La fiche 7 part d'un indice du terrain plutôt que du coefficient seul.
-- Le coefficient reste un repère ; les hauteurs prévues permettent de lire
-- concrètement ce qui sera couvert ou découvert sur le site.

UPDATE public.pedagogical_content
SET
  question = 'Pourquoi deux basses mers ne découvrent-elles pas toujours le même paysage ?',
  objectif = 'Faire relier les hauteurs prévues à ce que le groupe voit sur le site : une basse mer n''expose pas toujours la même portion de rivage.',
  explication = 'Le marnage est l''écart de hauteur entre une pleine mer et la basse mer qui lui est liée. Lorsqu''il est plus grand, la mer découvre généralement davantage de rivage à basse mer et le recouvre plus haut à pleine mer ; lorsqu''il est plus petit, cet écart se resserre. Le coefficient donne un repère sur cette ampleur, mais pour savoir ce qui sera réellement découvert ici, on lit les hauteurs prévues au port.',
  accroche = 'Ce rocher était découvert lors de la dernière basse mer. Aujourd''hui, l''annuaire annonce une basse mer aussi : sera-t-il forcément au sec ?',
  accroches_variantes = ARRAY[
    'Ce rocher était découvert lors de la dernière basse mer. Aujourd''hui, l''annuaire annonce une basse mer aussi : sera-t-il forcément au sec ?',
    'C''est marée basse : on devrait donc retrouver exactement la même plage que la dernière fois. Vous êtes d''accord ?',
    'Pour savoir si ce rocher sera découvert, l''heure de basse mer suffit-elle, ou faut-il aussi connaître la hauteur prévue ?'
  ],
  accroches_formes = jsonb_build_array(
    jsonb_build_object('forme', 'constat', 'texte', 'Ce rocher était découvert lors de la dernière basse mer. Aujourd''hui, l''annuaire annonce une basse mer aussi : sera-t-il forcément au sec ?'),
    jsonb_build_object('forme', 'piege', 'texte', 'C''est marée basse : on devrait donc retrouver exactement la même plage que la dernière fois. Vous êtes d''accord ?'),
    jsonb_build_object('forme', 'choix_force', 'texte', 'Pour savoir si ce rocher sera découvert, l''heure de basse mer suffit-elle, ou faut-il aussi connaître la hauteur prévue ?')
  ),
  erreur_frequente = 'Un horaire de basse mer suffit à prévoir ce qui sera découvert. Il faut aussi regarder la hauteur prévue de cette basse mer et les caractéristiques du site.',
  a_observer = 'Un rocher, un banc de sable ou un accès visible sur le site ; dans l''annuaire, les hauteurs de deux basses mers à des dates différentes.',
  a_retenir = 'Savoir que la mer est basse ne dit pas encore jusqu''où elle s''est retirée.',
  tip = 'Choisissez un repère que le groupe connaît et, si possible, une photo prise lors d''une autre basse mer. Faites d''abord formuler les hypothèses ; l''annuaire sert ensuite à expliquer la différence.',
  actions = jsonb_build_array(
    jsonb_build_object(
      'id', 'f7_meme_basse_mer',
      'label', 'Même basse mer, deux paysages',
      'consigne', 'Choisissez deux dates où l''annuaire annonce des basses mers de hauteurs nettement différentes au même port. Montrez un repère du site — rocher, banc de sable ou accès — puis demandez ce qui changera. Comparez les deux hauteurs avant de relier la différence au paysage réellement découvert.'
    )
  )
WHERE id = '7';

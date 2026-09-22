# Cohérence des cartes marées — 7 septembre 2026

## Périmètre et résultat

Lecture en base des fiches du catalogue contenant des références aux marées, coefficients, étales, courants associés ou laisses de mer, dans tous les champs éditoriaux, variantes et activités comprises. Les mentions incidentes dans des thèmes sans rapport ne constituent pas un audit scientifique complet de ces autres thèmes.

21 fiches corrigées : 1, 3, 4, 5, 7, 8, 9, 11, 12, 13, 14, 15, 16, 27, 30, 47, 50, 52, 68, 89, 106. Les fiches 2, 6, 10, 24, 25 et 91 conservent leur contenu en base ; leurs explications révisées précédemment ont également été synchronisées dans le SQL général.

## Corrections de fond

- 7, 12 : coefficient élevé et coefficient croissant ne sont pas synonymes. Présenter l’augmentation ET la diminution de l’importance des marées. Exemple 85 → 90 puis 90 → 85 ; consulter les hauteurs locales, sans conversion arbitraire des points de coefficient en centimètres.
- 8, 9, 106 : distinguer variation du niveau pendant une marée, évolution des coefficients sur plusieurs marées et vitesse du courant. La règle des douzièmes n’est pas une règle de courant.
- 14, 50, 52 : une laisse peut rester au sec pendant plusieurs marées. Ni sa date ni la prochaine limite de pleine mer ne se déduisent de sa seule hauteur ; pas de déplacement systématique à chaque marée.
- 15 : rechercher le niveau maximal pendant toute l’absence, pas seulement au retour. Un coefficient décroissant n’empêche pas une marée montante.
- 4, 13 : toute la surface de l’estran n’est pas couverte/découverte quotidiennement ; la variation du niveau n’est pas « impossible à voir ».
- 1, 3, 5 : préciser le rythme lunaire et le modèle simplifié, la propagation locale et la distinction des étales.
- 11, 16 : exemples biologiques identifiés ; abandon des pontes supposées partout et des activités de fouille pour les rechercher.
- 27, 30, 47, 89 : retirer les règles absolues sur la moustache d’écume, les durées vagues/marées, les dunes qui bougeraient à chaque marée et les courants nécessairement sans chenal.

Les accroches remplacées ne laissent pas d’anciennes variantes contradictoires. Les blocs de croyances non étayées concernés sont vides. Les identifiants des actions ont été conservés. Aucun changement d’interface, d’animation, de sélection ou de données personnelles.

## Publication et contrôles

- Sauvegarde avant publication : `avant-marees-20260907.json`.
- Contenu publié : `marees-20260907.json`.
- Transaction courte et conditionnée à l’état sauvegardé : `appliquer-marees-20260907.sql`.
- Retour arrière ciblé avec la même protection : `annuler-marees-20260907.sql`.
- Relecture après publication : 21 lignes, égalité exacte de chaque champ éditorial avec le JSON attendu.
- SQL général : 128 instructions, 128 identifiants uniques ; les 21 explications concernées correspondent au contenu publié. 26 explications anciennes ont été remplacées sur les 27 fiches synchronisées (la fiche 30 avait déjà la même explication).
- Contrôle UTF-8 et conservation des identifiants des actions.

Le dossier `supabase` reste ignoré par Git conformément à la configuration existante ; les traces sont locales. Les anciennes migrations et sauvegardes sont historiques : les rejouer peut réintroduire un ancien état éditorial.

## Sources

- SHOM, définition du marnage, marées semi-diurnes : https://refmar.shom.fr/glossaire/m
- SHOM, coefficient : https://refmar.shom.fr/glossaire/c
- SHOM, revif : https://refmar.shom.fr/glossaire/r ; déchet et décote : https://refmar.shom.fr/glossaire/d
- NOAA, vives-eaux et mortes-eaux : https://oceanservice.noaa.gov/facts/springtide.html
- NOAA, relation non universelle entre heures de hauteur et de courant : https://tidesandcurrents.noaa.gov/faq.html
- NOAA, modèle des deux renflements : https://oceanservice.noaa.gov/education/tutorial_tides/tides03_gravity.html
- SHOM, prédiction astronomique et météorologie : https://refmar.shom.fr/sites/default/files/2024-01/TIPE_generalite.pdf
- SHOM, lecture du niveau : https://www.refmar.shom.fr/instrumentation-et-mesure/echelle-de-maree
- Météo-France Nouvelle-Calédonie, lexique et approximation des douzièmes : https://meteo.nc/sites/default/files/files/editorial/Guide%20Marine_4_Lexique.pdf
- NOAA, estran et nourrissage : https://oceanservice.noaa.gov/facts/intertidal-zone.html
- OFB, laisse de mer : https://www.calameo.com/ofbiodiversite/books/003502948ae930a13ddee ; https://ofb.gouv.fr/glossaire
- Service public, dépôts liés aux vagues, flux et reflux : https://www.service-public.gouv.fr/particuliers/actualites/A15848?lang=fr
- BRGM, échanges de sable et érosion du système plage-dune : https://www.brgm.fr/fr/actualite/video/littoral-surveiller-erosion-gerer-trait-cote

Les précautions Supabase ont guidé la sauvegarde, la transaction ciblée et la vérification après écriture ; elles ne remplacent pas les sources scientifiques ci-dessus.

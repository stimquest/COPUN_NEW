# Révision éditoriale des 35 fiches du catalogue

Publiée le 6 septembre 2026 dans `pedagogical_content`, puis relue en base : comparaison exacte de chaque champ modifié avec `revision-validee-20260906.json`.

## Intention

- Restaurer le sujet des questions d’origine, avec quelques corrections de grammaire et de précision scientifique.
- Répondre effectivement à la question dans l’explication ; relier accroche, observation, activité et idée à retenir au même sujet.
- Ne pas attribuer au public des croyances inventées : `erreur_frequente` est vide sur ce lot, et l’interface masque déjà ce bloc lorsqu’il est vide.
- Conserver une accroche par fiche sans variantes artificielles. Les anciennes variantes sont remplacées en même temps.
- Garder les identifiants des fiches et des actions existantes. Aucun changement des piles, animations, filtres, sélections ou données personnelles.

Périmètre : 1, 2, 5, 6, 7, 8, 9, 10, 12, 14, 15, 24, 25, 68, 75, 76, 77, 79, 80, 81, 88, 91, 92, 94, 95, 98, 103, 106, 109, 112, 116, 125, 126, 127, 128. La fiche personnalisée de virement de bord n’est pas une fiche de ce catalogue et n’est pas modifiée par ce lot.

## Fichiers

- `revision-validee-20260906.json` : contenu final complet des champs révisés.
- `avant-revision-20260906.json` : sauvegarde préalable de ces mêmes champs.
- `appliquer-revision-20260906.sql` : transaction publiée ; refuse toute divergence avec la sauvegarde.
- `annuler-revision-20260906.sql` : retour arrière ciblé, qui refuse lui aussi d’écraser des changements ultérieurs.
- `revision-contenus.json` et `revision-vivant.json` : brouillons de rédaction ; le JSON validé fait référence.

Le dossier `supabase` est actuellement ignoré par Git dans ce projet. Ces traces existent localement mais ne seront pas incluses automatiquement dans un commit.

## Sources consultées

- NOAA, origine des deux renflements (modèle simplifié) : https://oceanservice.noaa.gov/education/tutorial_tides/tides03_gravity.html
- NOAA, vives-eaux et mortes-eaux : https://oceanservice.noaa.gov/facts/springtide.html
- NOAA, estran et alternance des possibilités de nourrissage : https://oceanservice.noaa.gov/facts/intertidal-zone.html
- SHOM, prévisions et particularités locales : https://www.refmar.shom.fr/faq ; https://services.data.shom.fr/static/specifications/notice_marees_a_la_carte2023.pdf
- ANBDD, inventaire historique de 24 mammifères marins et fréquence des espèces : https://www.anbdd.fr/biodiversite/connaissance/les-indicateurs-normands-de-la-biodiversite/les-mammiferes-marins-de-normandie/
- ANBDD, évolutions des migrations selon les espèces : https://www.anbdd.fr/biodiversite/connaissance/les-indicateurs-normands-de-la-biodiversite/oiseaux-migrateurs/
- iNaturalist, qualité et vérification des observations : https://help.inaturalist.org/en/support/solutions/articles/151000169936
- Ministère de la Transition écologique, Natura 2000 : https://www.ecologie.gouv.fr/politiques-publiques/reseau-europeen-natura-2000
- Ministère de la Santé, contrôle des eaux de baignade : https://www.baignades.sante.gouv.fr/baignades/editorial/fr/accueil.html
- GIEC, synthèse AR6, risques associés aux incréments de réchauffement : https://www.ipcc.ch/report/ar6/syr/downloads/report/IPCC_AR6_SYR_FullVolume.pdf
- Observatoire PELAGIS, suivi des contaminants : https://www.observatoire-pelagis.cnrs.fr/pelagis-2/les-programmes/suivis-des-contaminants/

La réécriture supprime notamment le chiffre non étayé de 18 jours de décalage migratoire, la confusion entre coefficient et hauteur en mètres, et l’assimilation systématique de l’étale de niveau à l’étale de courant.

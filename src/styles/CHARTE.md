# Charte COP'UN

Chaque écran pioche ici. Aucune couleur, taille ou ombre inventée localement.
Les jetons sont définis dans `src/app/globals.css` (bloc `@theme`) et utilisables
en classes Tailwind (`bg-encre`, `text-discret`, `text-corps`, `rounded-carte`,
`shadow-carte`…).

## Esprit

Carnet de terrain : papier, encre, un peu de sable et de terracotta. Calme,
éditorial, lisible. L'aquarelle est la signature visuelle ; les couleurs COP sont
les seules couleurs vives.

## Palette

| Jeton | Valeur | Usage |
|---|---|---|
| `encre` | `#173d3a` | texte principal, boutons principaux, blocs sombres |
| `encre-douce` | `#405653` | texte courant long |
| `discret` | `#62746e` | texte secondaire, légendes (pas `muted` : réservé à shadcn) |
| `papier` | `#f6f5ed` | fond de page |
| `carte` | `#fffdf8` | fond des cartes et panneaux |
| `sable` | `#f2dfa6` | sélection, badge obtenu, mise en avant douce |
| `sauge` | `#dfe8e2` | fond secondaire, boutons secondaires |
| `terracotta` | `#b97351` | accent éditorial (point du logo, citation) — avec parcimonie |
| `filet` | `#193d3b1a` | bordures et séparateurs |

### Couleurs COP — intouchables

| Repère | Couleur |
|---|---|
| Comprendre | ambre `#f59e0b` (`amber-500`) |
| Observer | bleu `#3b82f6` (`blue-500`) |
| Protéger | vert `#10b981` (`emerald-500`) |

Elles ne servent qu'à identifier un repère COP. Jamais de violet ni d'indigo :
les anciennes classes `slate-*`, `indigo-*`, `violet-*`, `purple-*` sont
redirigées dans le thème vers les neutres encre et la gamme sauge → encre. Ne pas
en écrire de nouvelles : utiliser les jetons ci-dessus.

## Texte — 4 tailles

| Jeton | Taille | Usage |
|---|---|---|
| `text-titre` | 28px | titre de page |
| `text-intertitre` | 17px | titre de carte, de bloc |
| `text-corps` | 15px | texte courant |
| `text-note` | 12px | légendes, métadonnées, boutons discrets |

Police unique : Inter. Les grands titres d'accueil peuvent dépasser (titre
éditorial), c'est l'exception.

## Étiquettes

- **Une seule étiquette en majuscules** : le surtitre de section (`.co-surtitre`,
  ex. « ME FORMER »). Rien d'autre en capitales.
- Les autres repères (« Avec le groupe », « À retenir », « J'ouvre avec »…) sont
  des **intertitres normaux** : `.co-intertitre` (12px, semi-gras, `muted`).
- `.co-eyebrow` reste un petit libellé en casse normale.

## Formes

- Rayons : `rounded-carte` (20px) pour cartes et panneaux, `rounded-bloc` (14px)
  pour blocs internes et boutons rectangulaires, `rounded-full` pour pastilles.
- Ombres : `shadow-carte` pour une carte posée, `shadow-flottant` pour la carte
  active d'une pile. Toujours teintées encre, jamais grises ni bleues.

## Icônes

Un seul jeu : **Material Symbols Outlined**, trait fin (graisse 300). Une icône
seulement si elle porte une information que le texte ne donne pas.
Les composants shadcn de base (`src/components/ui`) gardent leurs chevrons
internes.

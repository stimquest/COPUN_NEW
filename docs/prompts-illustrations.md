# Illustrations de la formation — prompts de génération

Les cartes du parcours « Savoir en parler » portent des illustrations **uniquement quand
elles montrent une scène** : un groupe qui décroche, un pari lancé, des empreintes sans
personne. Les cartes de règles, le contraste et le bilan restent sans image — leur mise en
page les rend déjà lisibles, et une illustration n'y serait que décorative.

**Où les déposer** : `public/formation/<nom>.jpg`
Le nom de fichier — extension comprise — est déclaré dans `src/data/formation-methode.ts` :
JPEG ou PNG indifféremment, mais les deux doivent concorder. Une image absente est
simplement masquée : le module reste lisible sans elle.

**Format** : 800 × 480 px environ (ratio ~5:3). Elles sont affichées en pleine largeur
de carte, hauteur fixe 144 px, recadrées au centre (`object-cover`) — l'essentiel du sujet
doit donc être au centre, pas dans les coins.

---

## Style commun à toutes les images

À reprendre dans chaque prompt pour garder une série cohérente :

> Flat vector illustration, simple geometric shapes, solid colors, no gradients, no outlines,
> no text. Muted palette: indigo blue (#6366f1), warm amber (#f59e0b), soft emerald (#10b981),
> light slate grey (#cbd5e1), off-white background (#f8fafc). Clean modern editorial style,
> similar to Google Primer app illustrations. Characters are simplified silhouettes without
> facial detail. Seaside / sailing school context.

**Points de vigilance**
- *No text* est important : du texte généré serait illisible et souvent en anglais.
- Pas de visages détaillés — des silhouettes simplifiées vieillissent mieux et évitent
  l'écueil des expressions ratées.
- Contexte littoral et sport de plein air, générique — pas spécifiquement de la voile : la
  formation vaut pour tout encadrant (voile, kayak, randonnée, escalade...). Éviter les
  bateaux ou tout équipement qui cadrerait un sport en particulier ; la scène pédagogique
  (le groupe, le moniteur) prime sur le décor.

---

## 1 · `decrochage.jpg`
**Carte** : « Le problème que ça résout »
**Ce qu'elle doit montrer** : le moment où l'explication tombe à plat.

> A sailing instructor standing on a beach speaking to a small group of children, but the
> children are looking away, distracted, turned in different directions. The instructor's
> speech bubble is grey and empty. Flat vector illustration, simple geometric shapes, solid
> colors, no gradients, no outlines, no text. Muted palette: indigo blue, warm amber, soft
> emerald, light slate grey, off-white background. Clean modern editorial style, similar to
> Google Primer app illustrations. Characters are simplified silhouettes without facial
> detail. Seaside / sailing school context.

---

## 2 · `pari.jpg`
**Carte** : « Le pari »
**Ce qu'elle doit montrer** : le moniteur prend le risque, le groupe est suspendu.

> A sailing instructor confidently making a bold claim to a group of attentive children on a
> beach, one hand raised as if announcing something surprising. A coin or a small sun-like
> shape arcs through the air above them. The children lean forward, curious and engaged.
> Flat vector illustration, simple geometric shapes, solid colors, no gradients, no outlines,
> no text. Muted palette: indigo blue, warm amber, soft emerald, light slate grey, off-white
> background. Clean modern editorial style, similar to Google Primer app illustrations.
> Characters are simplified silhouettes without facial detail. Seaside / sailing school context.

---

## 3 · `piege.jpg`
**Carte** : « Le piège »
**Ce qu'elle doit montrer** : ils s'engagent en levant la main, avant le retournement.

> A group of children on a beach enthusiastically raising their hands to agree with something,
> while the instructor watches with a knowing posture. Bright amber hands raised high against
> an off-white background. Flat vector illustration, simple geometric shapes, solid colors,
> no gradients, no outlines, no text. Muted palette: indigo blue, warm amber, soft emerald,
> light slate grey, off-white background. Clean modern editorial style, similar to Google
> Primer app illustrations. Characters are simplified silhouettes without facial detail.
> Seaside / sailing school context.

---

## 4 · `constat.jpg`
**Carte** : « Le constat intrigant »
**Ce qu'elle doit montrer** : des enfants découvrent un indice — l'attention, pas la trace.

Le sujet est le groupe penché sur quelque chose d'intrigant, pas les empreintes elles-mêmes.
Les traces doivent rester petites et discrètes, en bas de cadre.

> Two or three children crouching close together on wet sand, leaning forward and pointing at
> something small on the ground with curiosity. The children fill most of the frame, seen from
> the side. Below them, a few small delicate bird footprints in the sand, tiny and sparse. Calm
> empty beach behind them, low horizon line. Flat vector illustration, simple geometric shapes,
> solid colors, no gradients, no outlines, no text. Muted palette: indigo blue, warm amber, soft
> emerald, light slate grey, off-white background. Clean modern editorial style, similar to
> Google Primer app illustrations. Characters are simplified silhouettes without facial detail.
> Seaside context.
>
> Negative prompt: bear tracks, large paw prints, long trail of footprints, animals, realistic
> textures, outlines, text.

**Si le résultat reste mauvais** : remplacer « bird footprints » par « small marks in the sand »
— certains modèles surinterprètent toute mention d'empreinte animale.

---

## 5 · `choix.jpg`
**Carte** : « Le choix forcé »
**Ce qu'elle doit montrer** : le groupe se divise, chacun prend parti.

> A group of children on a beach split into two distinct groups facing each other, one side
> tinted indigo blue and the other warm amber, as if taking opposite sides in a debate. A
> dashed vertical line separates them. The instructor stands between the two groups. Flat
> vector illustration, simple geometric shapes, solid colors, no gradients, no outlines, no
> text. Muted palette: indigo blue, warm amber, soft emerald, light slate grey, off-white
> background. Clean modern editorial style, similar to Google Primer app illustrations.
> Characters are simplified silhouettes without facial detail. Seaside / sailing school context.

---

## Ajouter une illustration à une autre carte

1. Générer l'image, la déposer dans `public/formation/`.
2. Dans `src/data/formation-methode.ts`, ajouter sur la carte concernée :

```ts
illustration: {
    fichier: 'mon-image.jpg',
    alt: "Ce que l'image montre, pour les lecteurs d'écran",
},
```

Seules les cartes de genre `texte` et `procede` acceptent une illustration — c'est
volontaire : les autres genres n'ont pas de scène à montrer.

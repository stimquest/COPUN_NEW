/** Passer des mots d'une séance aux questions existantes, sans inventer de carte espèce. */
export const SITUATIONS_TERRAIN = [
    { mots: /\b(dauphins?|marsouins?|phoques?|cetaces?|mammiferes?)\b/, cartes: ['directrice-vivant'], piste: 'Cette rencontre peut ouvrir le sujet du vivant marin et de notre manière de l’observer.' },
    { mots: /\b(meduses?)\b/, cartes: ['directrice-vivant', 'directrice-courants'], piste: 'Vous pouvez partir du vivant rencontré, puis prolonger avec le déplacement de l’eau.' },
    { mots: /\b(oiseaux?|goelands?|mouettes?|sternes?|cormorans?|huitriers?)\b/, cartes: ['directrice-oiseaux'], piste: 'Partez de ce que fait l’oiseau pour parler de sa place sur le littoral.' },
    { mots: /\b(crabes?|crevettes?|poissons?|coquillages?|moules?|patelles?|anemones?|poulpes?|seiches?|etoiles? de mer)\b/, cartes: ['directrice-vivant'], piste: 'Cette rencontre permet de parler du milieu de vie de l’animal et des liens avec ce qui l’entoure.' },
    { mots: /\b(algues?|laisse|bois flotte)\b/, cartes: ['directrice-laisse-mer', 'directrice-vivant'], piste: 'La laisse de mer permet de relier ce qui arrive sur la plage à la vie du littoral.' },
    { mots: /\b(dechets?|plastiques?|bouteilles?|megots?|emballages?|pollution)\b/, cartes: ['directrice-pollution', 'directrice-laisse-mer'], piste: 'Vous pouvez distinguer ce qui appartient au milieu et ce qui vient des activités humaines.' },
    { mots: /\b(marees?|estran|mer (?:est )?(?:tres )?(?:basse|haute)|mer monte|mer descend|coefficient)\b/, cartes: ['directrice-marees'], piste: 'Partez du changement visible du rivage et de ses effets sur notre séance et le vivant.' },
    { mots: /\b(courants?|derive\w*|eau qui file)\b/, cartes: ['directrice-courants'], piste: 'Le déplacement de l’eau offre un point de départ pour comprendre ce qui circule avec elle.' },
    { mots: /\b(vagues?|houle|ecume|deferle\w*)\b/, cartes: ['directrice-vagues'], piste: 'Les vagues observées peuvent ouvrir une discussion sur ce qui façonne notre terrain de pratique.' },
    { mots: /\b(nuages?|vent|rafales?|brise|pluie|orage|ciel|meteo|brouillard)\b/, cartes: ['directrice-vent-ciel'], piste: 'Les indices du ciel et du vent permettent de faire raconter le lieu au groupe.' },
    { mots: /\b(dunes?|sable|erosion|falaises?)\b/, cartes: ['directrice-plage-dunes'], piste: 'Le paysage donne des indices sur ce qui transforme le littoral.' },
] as const;

export function pistesTerrain(recherche: string) {
    const texte = recherche.toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const situations = SITUATIONS_TERRAIN.filter(situation => situation.mots.test(texte));
    return { ids: new Set<string>(situations.flatMap(situation => [...situation.cartes])), pistes: [...new Set(situations.map(situation => situation.piste))] };
}

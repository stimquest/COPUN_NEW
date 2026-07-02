// Espèces courantes du littoral atlantique/Manche français, utilisées comme liste de
// départ pré-remplie pour les observations de terrain (faune + flore). Chaque club peut
// ensuite l'adapter (ajouter/retirer des espèces locales) via la configuration du défi
// "Faune observée" ou directement depuis les retours terrain.
export const DEFAULT_LITTORAL_SPECIES: { name: string; categorie: string }[] = [
    // Mammifères marins
    { name: 'Grand dauphin', categorie: 'mammifere_marin' },
    { name: 'Dauphin commun', categorie: 'mammifere_marin' },
    { name: 'Dauphin bleu et blanc', categorie: 'mammifere_marin' },
    { name: 'Marsouin commun', categorie: 'mammifere_marin' },
    { name: 'Phoque veau-marin', categorie: 'mammifere_marin' },
    { name: 'Phoque gris', categorie: 'mammifere_marin' },
    { name: 'Orque', categorie: 'mammifere_marin' },
    { name: 'Globicéphale', categorie: 'mammifere_marin' },
    { name: 'Rorqual commun', categorie: 'mammifere_marin' },
    { name: 'Petit rorqual', categorie: 'mammifere_marin' },
    { name: 'Cachalot', categorie: 'mammifere_marin' },

    // Oiseaux marins et côtiers
    { name: 'Goéland argenté', categorie: 'oiseau' },
    { name: 'Goéland marin', categorie: 'oiseau' },
    { name: 'Mouette rieuse', categorie: 'oiseau' },
    { name: 'Sterne pierregarin', categorie: 'oiseau' },
    { name: 'Cormoran huppé', categorie: 'oiseau' },
    { name: 'Grand cormoran', categorie: 'oiseau' },
    { name: 'Huîtrier pie', categorie: 'oiseau' },
    { name: 'Aigrette garzette', categorie: 'oiseau' },
    { name: 'Héron cendré', categorie: 'oiseau' },
    { name: 'Bécasseau', categorie: 'oiseau' },
    { name: 'Fou de Bassan', categorie: 'oiseau' },

    // Poissons
    { name: 'Bar commun', categorie: 'poisson' },
    { name: 'Mulet', categorie: 'poisson' },
    { name: 'Lançon', categorie: 'poisson' },
    { name: 'Blennie', categorie: 'poisson' },
    { name: 'Maquereau', categorie: 'poisson' },
    { name: 'Sardine', categorie: 'poisson' },
    { name: 'Sole', categorie: 'poisson' },
    { name: 'Turbot', categorie: 'poisson' },
    { name: 'Raie', categorie: 'poisson' },
    { name: 'Roussette (petite roussette)', categorie: 'poisson' },
    { name: 'Vive', categorie: 'poisson' },
    { name: 'Gobie', categorie: 'poisson' },
    { name: 'Hippocampe', categorie: 'poisson' },
    { name: 'Aiguille de mer', categorie: 'poisson' },

    // Méduses et invertébrés pélagiques
    { name: 'Méduse (aurélie)', categorie: 'meduse' },
    { name: 'Méduse pélagique (rhizostome)', categorie: 'meduse' },
    { name: 'Méduse boussole', categorie: 'meduse' },
    { name: 'Méduse à points blancs', categorie: 'meduse' },
    { name: 'Physalie', categorie: 'meduse' },
    { name: 'Vélelle (voilier)', categorie: 'meduse' },

    // Mollusques et crustacés de l'estran
    { name: 'Bigorneau', categorie: 'invertebre' },
    { name: 'Moule', categorie: 'invertebre' },
    { name: 'Huître', categorie: 'invertebre' },
    { name: 'Patelle', categorie: 'invertebre' },
    { name: 'Bulot', categorie: 'invertebre' },
    { name: 'Coque', categorie: 'invertebre' },
    { name: 'Palourde', categorie: 'invertebre' },
    { name: 'Pétoncle', categorie: 'invertebre' },
    { name: 'Ormeau', categorie: 'invertebre' },
    { name: 'Crabe vert', categorie: 'invertebre' },
    { name: 'Crabe enragé (dormeur)', categorie: 'invertebre' },
    { name: 'Étrille', categorie: 'invertebre' },
    { name: 'Araignée de mer', categorie: 'invertebre' },
    { name: 'Bernard-l\'ermite', categorie: 'invertebre' },
    { name: 'Crevette grise', categorie: 'invertebre' },
    { name: 'Anémone de mer', categorie: 'invertebre' },
    { name: 'Étoile de mer', categorie: 'invertebre' },
    { name: 'Oursin', categorie: 'invertebre' },
    { name: 'Concombre de mer (holothurie)', categorie: 'invertebre' },
    { name: 'Ver de vase / arénicole', categorie: 'invertebre' },
    { name: 'Balane', categorie: 'invertebre' },
    { name: 'Puce de mer (talitre)', categorie: 'invertebre' },

    // Algues de l'estran
    { name: 'Laminaire', categorie: 'flore' },
    { name: 'Fucus (varech)', categorie: 'flore' },
    { name: 'Ulve (laitue de mer)', categorie: 'flore' },
    { name: 'Zostère marine', categorie: 'flore' },
    { name: 'Chondrus (mousse d\'Irlande)', categorie: 'flore' },
    { name: 'Coralline', categorie: 'flore' },
    { name: 'Himanthale', categorie: 'flore' },
    { name: 'Sargasse', categorie: 'flore' },

    // Flore du haut de plage et de la dune
    { name: 'Oyat', categorie: 'flore' },
    { name: 'Chardon des dunes (panicaut)', categorie: 'flore' },
    { name: 'Criste marine', categorie: 'flore' },
    { name: 'Salicorne', categorie: 'flore' },
    { name: 'Chou marin', categorie: 'flore' },
    { name: 'Liseron des dunes', categorie: 'flore' },
    { name: 'Élyme des sables', categorie: 'flore' },
    { name: 'Genêt à balai (arrière-dune)', categorie: 'flore' },
];

// Types de déchets courants sur le littoral, pour accélérer la saisie du type
// d'observation "Pollution / déchets" sans avoir à ressaisir du texte libre à chaque fois.
export const DEFAULT_WASTE_TYPES: string[] = [
    'Bouteille plastique',
    'Sac plastique',
    'Emballage alimentaire',
    'Mégot de cigarette',
    'Bouchon plastique',
    'Fragment de plastique',
    'Filet / cordage de pêche',
    'Casier / matériel de pêche',
    'Canette / bidon métallique',
    'Verre',
    'Textile / vêtement',
    'Bois traité',
    'Mousse / polystyrène',
    'Masque / gant jetable',
    'Mégot de cigare',
    'Autre déchet',
];

/** Relations éditoriales. Le contenu de chaque carte est chargé depuis Supabase. */
export const CARTES_DIRECTRICES = [
    { id: 'directrice-marees', sujet: 'La marée', groupes: ['marees'] },
    { id: 'directrice-courants', sujet: 'Les courants', groupes: ['courants'] },
    { id: 'directrice-vagues', sujet: 'Les vagues', groupes: ['vagues', 'etat_mer'] },
    { id: 'directrice-vent-ciel', sujet: 'Le vent et le ciel', groupes: ['vent', 'meteo'] },
    { id: 'directrice-plage-dunes', sujet: 'La plage et les dunes', groupes: ['plage_dunes'] },
    { id: 'directrice-laisse-mer', sujet: 'La laisse de mer', groupes: ['laisse_mer'] },
    { id: 'directrice-vivant', sujet: 'Le vivant marin', groupes: ['vie_marine', 'cohabiter'] },
    { id: 'directrice-oiseaux', sujet: 'Les oiseaux', groupes: ['oiseaux'] },
    { id: 'directrice-lieu', sujet: 'Lire le lieu', groupes: ['observer'] },
    { id: 'directrice-littoral-partage', sujet: 'Les usages du littoral', groupes: ['activites', 'protection'] },
    { id: 'directrice-pollution', sujet: 'La pollution et les déchets', groupes: ['laisse_mer', 'activites'] },
] as const;

export function directriceDe(id: string) {
    return CARTES_DIRECTRICES.find(carte => carte.id === id);
}

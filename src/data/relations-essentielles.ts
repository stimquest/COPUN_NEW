import type { Dimension, PedagogicalContent } from '@/types';
import matrice from './matrice-questions-essentielles.json';

/** Sujets transversaux : le repère est celui du prolongement, pas une case de l'essentielle. */
const RELATIONS: Record<string, { codes: string[]; directes: string[] }> = {
    'directrice-marees': { codes: ['C1'], directes: ['1','2','3','4','5','6','7','8','9','10','11','12','91','13','14','15','16'] },
    'directrice-courants': { codes: ['C2'], directes: ['24','25','26','89','118','119','27','28','29'] },
    'directrice-vagues': { codes: ['C3'], directes: ['30','31','32','90','104','113','33','34','35','36','96','97','108','122','123','124','37'] },
    'directrice-vent-ciel': { codes: ['C4','O2'], directes: ['17','18','19','38','39','40','82','83','84','85','99','100','101','102','114','115','20','21','22','41','42','105','121','23','43'] },
    'directrice-plage-dunes': { codes: ['C5','P2'], directes: ['44','45','46','47','48','49','37','113'] },
    'directrice-laisse-mer': { codes: ['C6'], directes: ['50','51','52','53','54','55','56','110'] },
    'directrice-vivant': { codes: ['C7','O4','P1'], directes: ['57','58','59','60','68','69','200','61','62','88','201','63','64','65','66','67','74','128','202'] },
    'directrice-oiseaux': { codes: [], directes: ['86','87','103','116','117','57','60','61','62','63','64','65','66','16'] },
    'directrice-lieu': { codes: ['O5'], directes: ['68','69','70','71','72','73','74','92','93','94','95','105','106','107','120'] },
    'directrice-littoral-partage': { codes: ['P4','P5'], directes: ['75','76','77','78','79','109','125','126','127','67','73','80','81','111','112','72'] },
    'directrice-pollution': { codes: ['P3'], directes: ['29','51','52','53','54','55','56','76','79','98','110'] },
};

export function idsLiesEssentielle(id: string): string[] {
    const relation = RELATIONS[id];
    if (!relation) return [];
    const passerelles = matrice.passerelles
        .filter(lien => relation.codes.includes(lien.de) || relation.codes.includes(lien.vers))
        .flatMap(lien => lien.cartes);
    return [...new Set([...relation.directes, ...passerelles])];
}

export function prolongementsEssentielle(id: string, pool: PedagogicalContent[]): PedagogicalContent[] {
    const byId = new Map(pool.map(card => [card.id, card]));
    return idsLiesEssentielle(id).flatMap(id => byId.get(id) ?? []);
}

export type RepartitionCOP = Record<Dimension, number>;

/** Calculée sur les cartes disponibles, indépendamment de la recherche ou du filtre actif. */
export function repartitionsEssentielles(cartes: PedagogicalContent[], details: PedagogicalContent[]): Record<string, RepartitionCOP> {
    return Object.fromEntries(cartes.filter(carte => carte.id.startsWith('directrice-')).map(carte => {
        const repartition: RepartitionCOP = { COMPRENDRE: 0, OBSERVER: 0, 'PROTÉGER': 0 };
        for (const detail of prolongementsEssentielle(carte.id, details)) repartition[detail.dimension]++;
        return [carte.id, repartition];
    }));
}

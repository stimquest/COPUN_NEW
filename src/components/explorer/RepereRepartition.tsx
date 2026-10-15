import { PILLARS } from '@/data/etages';
import type { RepartitionCOP } from '@/data/relations-essentielles';

/** Les longueurs traduisent les proportions ; les couleurs COP ne sont pas mélangées. */
export default function RepereRepartition({ repartition, vertical = false }: {
    repartition?: RepartitionCOP;
    vertical?: boolean;
}) {
    const total = PILLARS.reduce((sum, pillar) => sum + (repartition?.[pillar.id] ?? 0), 0);
    const label = total ? PILLARS.map(pillar => `${pillar.label} : ${Math.round((repartition?.[pillar.id] ?? 0) / total * 100)} %`).join(', ') : 'Répartition indisponible';
    return <span role={vertical ? undefined : 'img'} aria-hidden={vertical || undefined} aria-label={vertical ? undefined : label} title={vertical ? undefined : label}
        className={`flex shrink-0 overflow-hidden rounded-full bg-sauge ${vertical ? 'h-5 w-1 flex-col' : 'h-1.5 w-9'}`}>
        {PILLARS.map(pillar => repartition?.[pillar.id] ? <span key={pillar.id} className={pillar.bg} style={{ flex: `${repartition[pillar.id]} 1 0%` }}/> : null)}
    </span>;
}

import Link from 'next/link';
import Image from 'next/image';
import type { SequenceProgress } from '@/actions/parcours-formation-actions';
import { PARCOURS_COP } from '@/data/parcours-cop';
import { parcoursTermine } from '@/lib/parcours-cours';

import { iconeMaterial } from '@/components/ui/Icone';
const ArrowRight = iconeMaterial('arrow_forward');

export function LearningJourney({ progressions }: { progressions: Record<string, SequenceProgress> }) {
    const disponibles = PARCOURS_COP.flatMap(domain => domain.parcours).filter(path => path.disponible);
    const valides = disponibles.filter(path => parcoursTermine(progressions[path.id])).length;
    const enCours = disponibles.filter(path => {
        const progression = progressions[path.id];
        return progression && !parcoursTermine(progression) && (progression.parcouru || progression.mission);
    }).length;
    const termines = (domain: typeof PARCOURS_COP[number]) =>
        domain.parcours.filter(path => parcoursTermine(progressions[path.id])).length;
    return <main className="co-page co-journey">
        {/* Même en-tête que la page Formation : surtitre du pôle, puis le titre. Le retour
            passe par la navigation, comme sur les autres pages du pôle. */}
        <header className="co-formation-intro flex items-start gap-2">
            {/* Retour en flèche seule, comme l'en-tête d'Explorer. */}
            <Link href="/formation" aria-label="Retour à la formation" className="-ml-2 mt-5 flex size-11 shrink-0 items-center justify-center rounded-full text-encre hover:bg-white/60">
                <span className="material-symbols-outlined" aria-hidden>arrow_back</span>
            </Link>
            <div>
                <p className="co-eyebrow">Formation</p>
                <h1>Parcours environnement</h1>
            </div>
        </header>
        {/* Le mode d'emploi en 3 étapes (Approfondir / Trouver son angle / Essayer) est
            retiré : utile une fois, à la découverte, il occupait ensuite la même place à
            chaque visite sans rien apporter de plus. Le cadre, la boussole et le statut
            réel restent — c'est l'identité de l'écran et sa seule info contextuelle. */}
        <section className="co-journey-hero">
            <div>
                <span className="co-eyebrow">La démarche COP’UN</span>
                <h2>Les repères du milieu.<br/>Pour en parler juste.</h2>
                <p className="co-journey-status">Des fiches courtes sur chaque sujet, puis un quiz pour vérifier les notions.</p>
                <p className="co-journey-status">{valides || enCours ? `Ma progression : ${enCours} en cours · ${valides} terminé${valides > 1 ? 's' : ''}` : 'Commencez par le sujet qui vous intéresse.'}</p>
            </div>
            <Image className="co-journey-compass" src="/illustrations/boussole-aquarelle.png" alt="" width={120} height={120}/>
        </section>
        <div className="co-domain-list">
            {PARCOURS_COP.map((domain, index) => <section key={domain.id} className={`co-domain co-domain-${domain.id}`}>
                <header><span className="co-domain-number">0{index + 1}</span><div><h2>{domain.titre}</h2><p>{domain.intention}</p></div>{termines(domain) > 0 && <span className="co-domain-count">{termines(domain)} / {domain.parcours.length}<small>terminé{termines(domain) > 1 ? 's' : ''}</small></span>}</header>
                <div className="co-path-grid">
                    {domain.parcours.map((path, pathIndex) => {
                        const progression = progressions[path.id];
                        const status = path.disponible ? (parcoursTermine(progression) ? 'Terminé' : progression?.parcouru ? 'Quiz à faire' : 'Commencer') : 'En préparation';
                        const body = <><span className={`co-path-illustration co-path-illustration-${index}-${pathIndex}`} aria-hidden="true"/><div><h3>{path.titre}</h3><p>{path.resume}</p></div><span className="co-path-status">{status}{path.disponible && <ArrowRight size={16}/>}</span></>;
                        return path.disponible ? <Link key={path.id} href={`/specialisation/parcours/${path.id}`} className="co-path co-path-live">{body}</Link> : <div key={path.id} className="co-path co-path-planned">{body}</div>;
                    })}
                </div>
            </section>)}
        </div>
        <Link href="/profil/carnet" className="co-quiet-link">Retrouver mes essais dans le carnet <ArrowRight size={17}/></Link>
    </main>;
}

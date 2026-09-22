import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import type { SequenceProgress } from '@/actions/parcours-formation-actions';
import { PARCOURS_COP } from '@/data/parcours-cop';

export function LearningJourney({ progressions }: { progressions: Record<string, SequenceProgress> }) {
    const disponibles = PARCOURS_COP.flatMap(domain => domain.parcours).filter(path => path.disponible);
    const valides = disponibles.filter(path => progressions[path.id]?.mission?.completed).length;
    const enCours = disponibles.filter(path => {
        const progression = progressions[path.id];
        return progression && !progression.mission?.completed && (progression.parcouru || progression.acquisVerifie || progression.mission);
    }).length;
    /* Un domaine n'affiche un compte que si le moniteur y a déjà mené quelque chose :
       le badge disait « 4 parcours » dans les trois domaines — une constante, donc aucune
       information, et une promesse démentie par les cartes « En préparation » juste en
       dessous. Il porte maintenant la progression réelle, et disparaît tant qu'elle est
       nulle plutôt que d'afficher un « 0 / 4 » décourageant à la première visite. */
    const faitsVivre = (domain: typeof PARCOURS_COP[number]) =>
        domain.parcours.filter(path => progressions[path.id]?.mission?.completed).length;
    return <main className="co-page co-journey">
        <header className="co-journey-intro">
            <p className="co-eyebrow">Parcours environnement</p>
            <p>Choisissez librement les sujets que vous souhaitez approfondir.</p>
        </header>
        <section className="co-journey-hero">
            <div>
                <span className="co-eyebrow">Votre progression</span>
                <h2>Apprendre. Essayer.<br/>Faire vivre.</h2>
                <div className="co-journey-steps" aria-label="Fonctionnement des parcours">
                    <span><strong>01</strong>Approfondir un sujet</span>
                    <span><strong>02</strong>Trouver son angle</span>
                    <span><strong>03</strong>L’essayer sur le terrain</span>
                </div>
                <p className="co-journey-status">{valides || enCours ? `${enCours} en cours · ${valides} terminé${valides > 1 ? 's' : ''}` : 'Commencez par le sujet qui vous intéresse.'}</p>
            </div>
            <Image className="co-journey-compass" src="/illustrations/boussole-aquarelle.png" alt="" width={120} height={120}/>
        </section>
        <div className="co-domain-list">
            {PARCOURS_COP.map((domain, index) => <section key={domain.id} className={`co-domain co-domain-${domain.id}`}>
                <header><span className="co-domain-number">0{index + 1}</span><div><p className="co-eyebrow">Repère COP</p><h2>{domain.titre}</h2><p>{domain.intention}</p></div>{faitsVivre(domain) > 0 && <span className="co-domain-count">{faitsVivre(domain)} / {domain.parcours.length}<small>fait{faitsVivre(domain) > 1 ? 's' : ''} vivre</small></span>}</header>
                <div className="co-path-grid">
                    {domain.parcours.map((path, pathIndex) => {
                        const progression = progressions[path.id];
                        const status = path.disponible ? (progression?.mission?.completed ? 'Fait vivre' : progression?.acquisVerifie ? 'Essai en cours' : progression?.parcouru ? 'À reprendre' : 'Commencer') : 'En préparation';
                        const body = <><span className={`co-path-illustration co-path-illustration-${index}-${pathIndex}`} aria-hidden="true"/><div><h3>{path.titre}</h3><p>{path.resume}</p></div><span className="co-path-status">{status}{path.disponible && <ArrowRight size={16}/>}</span></>;
                        return path.disponible ? <Link key={path.id} href={`/specialisation/parcours/${path.id}`} className="co-path co-path-live">{body}</Link> : <div key={path.id} className="co-path co-path-planned">{body}</div>;
                    })}
                </div>
            </section>)}
        </div>
        <Link href="/profil/carnet" className="co-quiet-link">Retrouver mes essais dans le carnet <ArrowRight size={17}/></Link>
    </main>;
}

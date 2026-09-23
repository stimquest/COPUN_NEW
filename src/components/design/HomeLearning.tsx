import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ResumeFormation } from '@/actions/formation-actions';
import type { SequenceProgress } from '@/actions/parcours-formation-actions';
import { CoastalMark } from './Coastal';
import { PARCOURS_FORMATION } from '@/data/parcours-formation';

export function HomeLearning({ firstName, resume, progressions, semaineEnCours }: {
    firstName: string;
    resume: ResumeFormation;
    progressions: Record<string, SequenceProgress>;
    /** Vrai pendant les dates d'une semaine ouverte : la tuile terrain change alors de sens. */
    semaineEnCours: boolean;
}) {
    const suivis = PARCOURS_FORMATION.map(parcours => progressions[parcours.id]);
    const termines = suivis.filter(progression => progression?.mission?.completed).length;
    const enCours = suivis.filter(progression => progression && !progression.mission?.completed && (progression.parcouru || progression.acquisVerifie || progression.mission)).length;
    const misesEnPratique = suivis.filter(progression => progression?.mission && !progression.mission.completed).length;
    return <div className="co-page co-home">
        <header className="co-welcome">
            <div className="co-home-brand">
                <Link href="/stages" className="co-wordmark">cop<span>’</span>un<span className="co-wordmark-dot">.</span></Link>
                <p>Parler d’environnement sur le terrain</p>
            </div>
            <Link href="/profil" className="co-avatar" aria-label={`Profil de ${firstName}`}>{firstName.slice(0, 1).toUpperCase()}</Link>
        </header>
        <div className="co-home-title"><h1>Dehors, tout<br/>se raconte<span>.</span></h1></div>
        <div className="co-home-bento">
            <Link href="/formation" className="co-feature co-feature-formation">
                <div className="co-feature-copy"><span className="co-eyebrow">Formation générale</span><h2>Trouver les mots.<br/>Donner envie.</h2><span className="co-inline-action">{resume.nbFaits ? 'Reprendre ma formation' : 'Commencer ma formation'} <ArrowRight size={18}/></span></div>
                <div className="co-feature-art"><CoastalMark kind="talk"/><span>{resume.nbFaits} / {resume.nbRediges}<small>modules parcourus</small></span></div>
            </Link>
            <Link href="/specialisation" className="co-home-focus">
                <div className="co-home-focus-copy">
                    <span className="co-eyebrow">Parcours environnement</span>
                    <h2>Mes parcours</h2>
                    <div className="co-home-focus-stats" aria-label="Suivi de mes parcours">
                        <span><strong>{enCours}</strong> en cours</span>
                        <span><strong>{misesEnPratique}</strong> sur le terrain</span>
                        <span><strong>{termines}</strong> terminé{termines > 1 ? 's' : ''}</span>
                    </div>
                </div>
                <span className="co-home-focus-action">Voir tous les parcours <ArrowRight size={18}/></span>
            </Link>
            <Link href="/stages/decouvrir" className="co-home-mini-card co-home-mini-discover">
                <span className="co-eyebrow">Exploration libre</span>
                <strong>Explorer les cartes-questions</strong>
                <span className="co-mini-action">Explorer <ArrowRight size={17}/></span>
            </Link>
            <Link href="/stages/semaines" className="co-home-mini-card co-home-mini-week">
                <span className="co-eyebrow">Sur le terrain</span>
                <strong>{semaineEnCours ? 'Ma semaine en cours' : 'Mes semaines'}</strong>
                <span className="co-mini-action">{semaineEnCours ? 'Reprendre' : 'Voir et organiser'} <ArrowRight size={17}/></span>
            </Link>
        </div>
    </div>;
}

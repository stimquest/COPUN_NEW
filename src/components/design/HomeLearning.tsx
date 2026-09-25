import Link from 'next/link';
import type { ResumeFormation } from '@/actions/formation-actions';
import type { SequenceProgress } from '@/actions/parcours-formation-actions';
import { CoastalMark } from './Coastal';
import { PARCOURS_FORMATION } from '@/data/parcours-formation';
import { dureeTotaleFormation } from '@/data/formation-methode';

import { iconeMaterial } from '@/components/ui/Icone';
const ArrowRight = iconeMaterial('arrow_forward');

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
        {/* Deux pôles, deux blocs : se former d'un côté, faire vivre l'environnement dans
            ses séances de l'autre. Quatre tuiles au même niveau ne disaient pas comment
            l'application est rangée. */}
        <h2 className="co-home-pole-title">Me former</h2>
        {/* Un seul bloc pour tout le pôle formation, avec deux suivis : les modules de la
            formation générale et les parcours environnement, qui en font partie. */}
        <section className="co-home-formation">
            <div className="co-home-formation-head">
                <h2>Trouver les mots.<br/>Donner envie.</h2>
                <CoastalMark kind="talk"/>
            </div>
            <div className="co-home-formation-suivis">
                <Link href="/formation">
                    <span className="co-eyebrow">Formation générale</span>
                    <strong>{resume.nbFaits} / {resume.nbRediges}<small> modules parcourus</small></strong>
                    <span className="co-progress"><span style={{ width: `${resume.nbRediges ? resume.nbFaits / resume.nbRediges * 100 : 0}%` }}/></span>
                    {/* Le temps total rassure : la formation entière tient dans une pause café longue. */}
                    <span className="co-home-formation-note">Environ {dureeTotaleFormation()} min au total</span>
                    <span className="co-inline-action">{resume.nbFaits ? 'Reprendre' : 'Commencer'} <ArrowRight size={16}/></span>
                </Link>
                <Link href="/specialisation">
                    <span className="co-eyebrow">Parcours environnement</span>
                    <strong>{enCours}<small> en cours</small> · {termines}<small> terminé{termines > 1 ? 's' : ''}</small></strong>
                    {misesEnPratique > 0 && <span className="co-home-formation-note">{misesEnPratique} essai{misesEnPratique > 1 ? 's' : ''} sur le terrain</span>}
                    <span className="co-inline-action">Voir les parcours <ArrowRight size={16}/></span>
                </Link>
            </div>
        </section>

        <h2 className="co-home-pole-title">Intégrer l’environnement dans mes séances</h2>
        <div className="co-home-bento">
            <Link href="/stages/semaines" className="co-home-mini-card co-home-mini-week">
                <span className="co-eyebrow">Sur le terrain</span>
                <strong>{semaineEnCours ? 'Ma semaine en cours' : 'Préparer une semaine'}</strong>
                <span className="co-mini-action">{semaineEnCours ? 'Reprendre' : 'Organiser'} <ArrowRight size={17}/></span>
            </Link>
            <Link href="/stages/decouvrir" className="co-home-mini-card co-home-mini-discover">
                <span className="co-eyebrow">Exploration libre</span>
                <strong>Explorer les cartes-questions</strong>
                <span className="co-mini-action">Explorer <ArrowRight size={17}/></span>
            </Link>
        </div>
    </div>;
}

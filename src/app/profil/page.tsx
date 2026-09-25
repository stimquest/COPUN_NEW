import Link from 'next/link';
import { iconeMaterial, type IconeComposant } from '@/components/ui/Icone';
import { getProfile } from '@/actions/user-actions';
import { getResumeFormation } from '@/actions/formation-actions';
import { getSequencesProgress } from '@/actions/parcours-formation-actions';
import { getResumeVote } from '@/actions/vote-actions';
import { getStages } from '@/services/data-service';
import SignOutButton from '@/components/SignOutButton';
import { SECONDARY_NAV, ADMIN_NAV } from '@/data/navigation';
import { PARCOURS_FORMATION } from '@/data/parcours-formation';
import { BADGES, badgesObtenus, type BadgeId } from '@/data/badges';

const ArrowRight = iconeMaterial('arrow_forward');

/** Material n'a pas de jumelles : tracé maison, trait fin comme les autres emblèmes. */
function Jumelles({ size = 24 }: { size?: number }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="6.5" cy="16" r="3.5"/><circle cx="17.5" cy="16" r="3.5"/><path d="M3.5 14 6 5h3l1 6"/><path d="M20.5 14 18 5h-3l-1 6"/><path d="M10 11h4"/>
    </svg>;
}

/* Ici l'icône est l'emblème lui-même : elle porte l'information, ce n'est pas un décor.
   Le sifflet est le « sports » de Material. */
const ICONES: Record<BadgeId, IconeComposant | typeof Jumelles> = {
    jumelles: Jumelles, boussole: iconeMaterial('explore'), carte: iconeMaterial('map'),
    carnet: iconeMaterial('edit_note'), sifflet: iconeMaterial('sports'), sac: iconeMaterial('backpack'),
};

export default async function ProfilPage() {
    const [profile, resume, stages, progressions] = await Promise.all([
        getProfile(),
        getResumeFormation(),
        getStages(),
        getSequencesProgress(PARCOURS_FORMATION.map(parcours => parcours.id)),
    ]);

    if (!profile) {
        return <main className="co-page co-profile-empty">
            <p>Vous n’êtes pas connecté.</p>
            <Link href="/login" className="co-primary-link">Se connecter <ArrowRight size={16}/></Link>
        </main>;
    }

    // Une semaine bouclée est une semaine dont le bilan est fait.
    const bouclees = stages.filter(stage => Boolean(stage.closed_at));
    const votes = await Promise.all(bouclees.map(stage => getResumeVote(stage.id)));
    const actionsConfirmees = votes.reduce((total, vote) => total + vote.actionsConfirmees, 0);

    const suivis = PARCOURS_FORMATION.map(parcours => progressions[parcours.id]);
    const parcoursTermines = suivis.filter(progression => progression?.mission?.completed).length;
    const parcoursEnCours = suivis.filter(progression => progression && !progression.mission?.completed && (progression.parcouru || progression.acquisVerifie || progression.mission)).length;

    const obtenus = badgesObtenus({
        modulesFaits: resume.nbFaits,
        modulesRediges: resume.nbRediges,
        parcoursTermines,
        semainesBouclees: bouclees.length,
        actionsConfirmees,
    });
    const nbObtenus = BADGES.filter(badge => obtenus[badge.id] > 0).length;

    const avatar = 'avatar_url' in profile ? profile.avatar_url : null;
    const liens = [
        { href: '/about', name: 'Guide de la démarche' },
        ...SECONDARY_NAV.filter(item => item.href !== '/profil'),
        ...(['admin', 'club_admin'].includes(profile.role ?? '') ? [ADMIN_NAV] : []),
    ];

    return <main className="co-page co-profil">
        <header className="co-profil-head">
            <span className="co-profil-avatar">
                {avatar
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={avatar} alt=""/>
                    : (profile.full_name || 'M').slice(0, 1).toUpperCase()}
            </span>
            <div>
                <h1>{profile.full_name || 'Moniteur'}</h1>
                <p>{profile.role === 'admin' ? 'Administrateur' : profile.role === 'club_admin' ? 'Responsable de club' : 'Moniteur'}{profile.clubs?.name ? ` · ${profile.clubs.name}` : ''}</p>
            </div>
        </header>

        <section className="co-profil-section">
            <h2 className="co-home-pole-title">Ma formation</h2>
            <div className="co-profil-suivis">
                <Link href="/formation">
                    <span className="co-eyebrow">Formation générale</span>
                    <strong>{resume.nbFaits} / {resume.nbRediges}<small> modules</small></strong>
                    <span className="co-progress"><span style={{ width: `${resume.nbRediges ? resume.nbFaits / resume.nbRediges * 100 : 0}%` }}/></span>
                </Link>
                <Link href="/specialisation">
                    <span className="co-eyebrow">Parcours</span>
                    <strong>{parcoursTermines}<small> terminé{parcoursTermines > 1 ? 's' : ''}</small></strong>
                    <small>{parcoursEnCours ? `${parcoursEnCours} en cours` : 'Aucun en cours'}</small>
                </Link>
            </div>
        </section>

        {/* Le sac à dos : tous les emblèmes sont visibles, les obtenus en couleur. On voit
            ce qui reste à gagner sans que rien ne soit verrouillé. */}
        <section className="co-profil-section">
            <div className="co-profil-section-head">
                <h2 className="co-home-pole-title">Mes badges</h2>
                <span>{nbObtenus} / {BADGES.length}</span>
            </div>
            <ul className="co-badges">
                {BADGES.map(badge => {
                    const Icone = ICONES[badge.id];
                    const nombre = obtenus[badge.id];
                    return <li key={badge.id} className={nombre > 0 ? 'co-badge co-badge-on' : 'co-badge'}>
                        <span className="co-badge-icon"><Icone size={26}/>{nombre > 1 && <em>×{nombre}</em>}</span>
                        <strong>{badge.nom}</strong>
                        <small>{badge.critere}</small>
                    </li>;
                })}
            </ul>
        </section>

        <section className="co-profil-section">
            <h2 className="co-home-pole-title">Mes séances</h2>
            <Link href="/profil/carnet" className="co-profil-seances">
                <span><strong>{bouclees.length}</strong> semaine{bouclees.length > 1 ? 's' : ''} bouclée{bouclees.length > 1 ? 's' : ''}</span>
                <span><strong>{actionsConfirmees}</strong> action{actionsConfirmees > 1 ? 's' : ''} confirmée{actionsConfirmees > 1 ? 's' : ''} par les groupes</span>
                <span className="co-inline-action">Mon carnet <ArrowRight size={16}/></span>
            </Link>
        </section>

        <nav className="co-profil-liens" aria-label="Outils et compte">
            {liens.map(item => <Link key={item.href} href={item.href}>{item.name}<ArrowRight size={16}/></Link>)}
        </nav>
        <div className="co-profil-signout"><SignOutButton/></div>
    </main>;
}

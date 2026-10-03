import { notFound } from 'next/navigation';
import { HomeLearning } from '@/components/design/HomeLearning';
import { LearningJourney } from '@/components/design/LearningJourney';
import { FormationClient } from '@/app/formation/FormationClient';
import { PLAN_FORMATION, LECONS_FORMATION } from '@/data/formation-methode';
import { PARCOURS_FORMATION, PARCOURS_LAISSE_DE_MER } from '@/data/parcours-formation';
import { ParcoursCoursClient } from '@/components/formation/ParcoursCoursClient';
import { PageHeading, CoastalMark } from '@/components/design/Coastal';
import { PRIMARY_NAV } from '@/data/navigation';

export default async function PreviewUI({ searchParams }: { searchParams: Promise<{ screen?: string; semaine?: string; parcours?: string; termine?: string }> }) {
    if (process.env.NODE_ENV !== 'development') notFound();
    // `?semaine=1` montre la tuile terrain telle qu'elle apparaît pendant une semaine :
    // le libellé change, et c'est justement ce qu'on vient regarder ici.
    const { screen = 'home', semaine, parcours, termine } = await searchParams;
    const sequence = PARCOURS_FORMATION.find(item => item.id === parcours) ?? PARCOURS_LAISSE_DE_MER;
    const resume = { nbFaits: 3, nbRediges: LECONS_FORMATION.length, nbTotal: LECONS_FORMATION.length, prochain: null, themes: [] };
    return <>
        {screen === 'home' && <HomeLearning firstName="Camille" resume={resume} progressions={{ 'laisse-de-mer': { parcouru: true, acquisVerifie: true, mission: null }, 'littoral-eau': { parcouru: false, acquisVerifie: false, mission: null } }} semaineEnCours={semaine === '1'}/>}
        {screen === 'formation' && <FormationClient plan={PLAN_FORMATION} lecons={LECONS_FORMATION} termine={LECONS_FORMATION.slice(0,3).map(l => l.id)} parcours={{ disponibles: 2, enCours: 1, termines: 0 }}/>}
        {screen === 'journey' && <LearningJourney progressions={{ 'laisse-de-mer': { parcouru: false, acquisVerifie: false, mission: null }, 'littoral-eau': { parcouru: false, acquisVerifie: false, mission: null } }}/>}
        {screen === 'lesson' && <main className="co-lesson-page pt-6"><ParcoursCoursClient sequence={sequence} progression={{ parcouru: termine === '1', acquisVerifie: termine === '1', mission: null }}/></main>}
        {screen === 'carnet' && <div className="co-page"><div className="co-notebook-header"><PageHeading eyebrow="Du savoir au terrain" title="Mon carnet" description="Les mots essayés. Les réactions du groupe. Ce que tu gardes." action={<CoastalMark kind="talk"/>}/></div><section className="co-empty"><h2>La première page est à toi.</h2><p>Après une découverte, note ce que tu as essayé avec ton groupe.</p></section></div>}
        <nav className="co-bottom-nav" aria-label="Aperçu de la navigation">{PRIMARY_NAV.map(({ name, icon: Icon }) => <a key={name} href="#"><span className="co-nav-icon"><Icon size={21}/></span><span>{name}</span></a>)}</nav>
    </>;
}

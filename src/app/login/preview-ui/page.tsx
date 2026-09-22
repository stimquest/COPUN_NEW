import { notFound } from 'next/navigation';
import { HomeLearning } from '@/components/design/HomeLearning';
import { LearningJourney } from '@/components/design/LearningJourney';
import { FormationClient } from '@/app/formation/FormationClient';
import { PLAN_FORMATION, LECONS_FORMATION } from '@/data/formation-methode';
import { PARCOURS_LAISSE_DE_MER } from '@/data/parcours-formation';
import { ParcoursLaisseDeMerClient } from '@/app/specialisation/parcours/laisse-de-mer/ParcoursLaisseDeMerClient';
import { PageHeading, CoastalMark } from '@/components/design/Coastal';
import { PRIMARY_NAV } from '@/data/navigation';
import pool from '@/data/pedagogical_content.json';
import type { PedagogicalContent } from '@/types';

export default async function PreviewUI({ searchParams }: { searchParams: Promise<{ screen?: string }> }) {
    if (process.env.NODE_ENV !== 'development') notFound();
    const { screen = 'home' } = await searchParams;
    const resume = { nbFaits: 3, nbRediges: LECONS_FORMATION.length, nbTotal: LECONS_FORMATION.length, prochain: null, themes: [] };
    return <>
        {screen === 'home' && <HomeLearning firstName="Camille" resume={resume} progressions={{ 'laisse-de-mer': { parcouru: true, acquisVerifie: true, mission: null }, 'littoral-eau': { parcouru: false, acquisVerifie: false, mission: null } }}/>}
        {screen === 'formation' && <FormationClient plan={PLAN_FORMATION} lecons={LECONS_FORMATION} termine={LECONS_FORMATION.slice(0,3).map(l => l.id)}/>}
        {screen === 'journey' && <LearningJourney progressions={{ 'laisse-de-mer': { parcouru: false, acquisVerifie: false, mission: null }, 'littoral-eau': { parcouru: false, acquisVerifie: false, mission: null } }}/>}
        {screen === 'lesson' && <main className="co-lesson-page pt-6"><ParcoursLaisseDeMerClient sequence={PARCOURS_LAISSE_DE_MER} progression={{ parcouru: false, acquisVerifie: false, mission: null }} cards={pool as PedagogicalContent[]} stages={[]} savedIds={[]}/></main>}
        {screen === 'carnet' && <div className="co-page"><div className="co-notebook-header"><PageHeading eyebrow="Du savoir au terrain" title="Mon carnet" description="Les mots essayés. Les réactions du groupe. Ce que tu gardes." action={<CoastalMark kind="talk"/>}/></div><section className="co-empty"><h2>La première page est à toi.</h2><p>Après une découverte, note ce que tu as essayé avec ton groupe.</p></section></div>}
        <nav className="co-bottom-nav" aria-label="Aperçu de la navigation">{PRIMARY_NAV.map(({ name, icon: Icon }) => <a key={name} href="#"><span className="co-nav-icon"><Icon size={21}/></span><span>{name}</span></a>)}</nav>
    </>;
}

import { unstable_noStore as noStore } from 'next/cache';
import Link from 'next/link';
import { getPracticeJournal } from '@/services/practice-journal';
import { CarnetClient } from './CarnetClient';
import { CoastalMark, PageHeading } from '@/components/design/Coastal';

import { iconeMaterial } from '@/components/ui/Icone';
const ArrowUpRight = iconeMaterial('north_east');
const NotebookPen = iconeMaterial('edit_note');

export default async function CarnetPage() {
    noStore();
    const journal = await getPracticeJournal();
    return <div className="co-page">
        <div className="co-notebook-header"><PageHeading eyebrow="Du savoir au terrain" title="Mon carnet" description="Les mots essayés. Les réactions du groupe. Ce que tu gardes." action={<CoastalMark kind="talk"/>}/></div>
        {journal.weeksCount === 0 && journal.formationNotes.length === 0
            ? <section className="co-empty"><NotebookPen size={32}/><h2>La première page est à toi.</h2><p>Après une découverte, note ce que tu as essayé avec ton groupe.</p><Link href="/specialisation" className="co-inline-action">Choisir un parcours <ArrowUpRight size={18}/></Link></section>
            : <CarnetClient journal={journal}/>}
    </div>;
}

import { unstable_noStore as noStore } from 'next/cache';
import Link from 'next/link';
import { getPracticeJournal } from '@/services/practice-journal';
import { CarnetClient } from './CarnetClient';
import { CoastalMark, PageHeading } from '@/components/design/Coastal';

export default async function CarnetPage() {
    noStore();
    const journal = await getPracticeJournal();
    return <div className="co-page">
        {/* Le bandeau sable du carnet, avec sa marque. La flèche de retour est dans le
            bandeau (et non au-dessus, où elle flottait) : le carnet appartient au pôle
            « Mes séances », le retour y mène. */}
        <div className="co-notebook-header flex items-start gap-2">
            {/* Comme sur les autres pages : la flèche à gauche du titre, sur la même ligne. */}
            <Link href="/stages/semaines" aria-label="Retour à mes séances" className="-ml-2 mt-5 flex size-11 shrink-0 items-center justify-center rounded-full text-encre hover:bg-white/40">
                <span className="material-symbols-outlined" aria-hidden>arrow_back</span>
            </Link>
            <div className="min-w-0 flex-1">
                <PageHeading eyebrow="Du savoir au terrain" title="Mon carnet" description="Les mots essayés. Les réactions du groupe. Ce que vous gardez." action={<CoastalMark kind="talk"/>}/>
            </div>
        </div>
        {journal.weeksCount === 0 && journal.formationNotes.length === 0
            ? <section className="rounded-carte bg-carte px-5 py-6 ring-1 ring-filet">
                <h2 className="text-intertitre font-semibold text-encre">La première page reste à écrire.</h2>
                <p className="mt-1 text-corps text-encre-douce">Votre carnet se remplit tout seul à chaque bilan de semaine.</p>
                <Link href="/stages/semaines" className="mt-4 inline-flex min-h-11 items-center rounded-full bg-encre px-5 text-note font-bold text-carte">Voir mes séances</Link>
            </section>
            : <CarnetClient journal={journal}/>}
    </div>;
}

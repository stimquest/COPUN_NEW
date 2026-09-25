import { getLeaderboard } from '@/actions/defi-actions';
import { getMyTotalPoints } from '@/actions/quiz-actions';
import ClassementClient from './ClassementClient';

export default async function ClassementPage() {
    const [monitors, clubs, myPoints] = await Promise.all([
        getLeaderboard('monitors', 20),
        getLeaderboard('clubs', 10),
        getMyTotalPoints(),
    ]);

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 pb-32">
            <header className="bg-slate-900 text-white px-6 pt-10 pb-16 relative overflow-hidden">
                <div className="absolute top-0 right-0 size-64 bg-indigo-500/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                <div className="relative z-10">
                    <p className="text-[12px] font-bold text-indigo-400 mb-2">Gamification COP&apos;UN</p>
                    <h1 className="text-4xl font-bold leading-none">Classement<br /><span className="text-slate-500">des Moniteurs</span></h1>
                </div>
            </header>

            <ClassementClient monitors={monitors} clubs={clubs} myPoints={myPoints} />
        </div>
    );
}

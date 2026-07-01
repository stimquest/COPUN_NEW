'use client';

import Link from 'next/link';
import { Stage } from '@/types';

const MONTH_THEMES: Record<number, string[]> = {
    1: ['biodiversite', 'pollution', 'conditions'],
    2: ['biodiversite', 'pollution', 'marees'],
    3: ['biodiversite', 'conditions', 'navigation'],
    4: ['biodiversite', 'marees', 'vent'],
    5: ['biodiversite', 'pollution', 'navigation'],
    6: ['pollution', 'marees', 'responsable'],
    7: ['pollution', 'responsable', 'cohabitation'],
    8: ['pollution', 'cohabitation', 'paysage'],
    9: ['biodiversite', 'marees', 'conditions'],
    10: ['biodiversite', 'paysage', 'navigation'],
    11: ['biodiversite', 'marees', 'conditions'],
    12: ['conditions', 'marees', 'pollution']
};

const THEME_LABELS: Record<string, { label: string; icon: string }> = {
    biodiversite: { label: 'Biodiversité', icon: 'flutter_dash' },
    pollution: { label: 'Pollution', icon: 'delete_sweep' },
    conditions: { label: 'Conditions', icon: 'navigation' },
    marees: { label: 'Marées', icon: 'waves' },
    navigation: { label: 'Navigation', icon: 'explore' },
    vent: { label: 'Vents', icon: 'air' },
    responsable: { label: 'Responsable', icon: 'self_improvement' },
    cohabitation: { label: 'Cohabitation', icon: 'diversity_3' },
    paysage: { label: 'Paysage', icon: 'landscape' }
};

export default function EnvironmentalGuideClient({ stage }: { stage: Stage }) {
    const currentMonth = new Date().getMonth() + 1;
    const suggestedThemes = MONTH_THEMES[currentMonth] || [];

    const suggestions = suggestedThemes.map(themeId => ({
        id: themeId,
        ...THEME_LABELS[themeId]
    }));

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 pb-32">
            <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4">
                <Link href={`/stages/${stage.id}`} className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 active:scale-95 transition-transform">
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <div>
                    <h1 className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Guide Environnemental</h1>
                    <p className="text-lg font-bold leading-none text-slate-900">Suggestions du mois</p>
                </div>
            </header>

            <main className="px-5 py-8 max-w-xl md:max-w-4xl mx-auto w-full space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <p className="text-xs font-bold text-slate-600 mb-4">
                        {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })} — Les notions environnementales suivantes pourraient être abordées ce mois-ci :
                    </p>
                    <div className="flex flex-wrap gap-3">
                        {suggestions.map(item => (
                            <div key={item.id} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-50 border border-teal-200">
                                <span className="material-symbols-outlined text-teal-600">{item.icon}</span>
                                <span className="text-sm font-bold text-teal-800">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
                    <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Pour aller plus loin</p>
                    <Link href={`/stages/${stage.id}/program`} className="block p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                        <p className="text-sm font-bold text-slate-900">Ajouter ces notions à mes objectifs</p>
                        <p className="text-[10px] text-slate-500">Accéder au programme pour intégrer ces suggestions</p>
                    </Link>
                </div>
            </main>
        </div>
    );
}
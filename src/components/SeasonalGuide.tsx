'use client';

import { useState } from 'react';
import {
    getPeriodForMonth,
    getSuggestedThematics,
    CoeffType,
    MeteoType,
    ThematicTag,
} from '@/data/seasonal-context';

const COEFF_OPTIONS: { value: CoeffType; label: string; icon: string }[] = [
    { value: 'morte_eau', label: 'Morte-eau', icon: 'water' },
    { value: 'entre_deux', label: 'Entre-deux', icon: 'waves' },
    { value: 'vive_eau', label: 'Vive-eau', icon: 'tsunami' },
];

const METEO_OPTIONS: { value: MeteoType; label: string; icon: string }[] = [
    { value: 'beau_fixe', label: 'Beau fixe', icon: 'wb_sunny' },
    { value: 'vent', label: 'Majoritairement venteux', icon: 'air' },
    { value: 'instable', label: 'Mitigé', icon: 'cloud' },
    { value: 'tempete', label: 'Agité', icon: 'thunderstorm' },
];

const THEMATIC_LABELS: Record<ThematicTag, { label: string; dimension: 'C' | 'O' | 'P'; color: string }> = {
    caracteristiques_littoral:  { label: 'Caractéristiques du littoral', dimension: 'C', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    reperes_spatio_temporels:   { label: 'Repères spatio-temporels',    dimension: 'C', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    interactions_climatiques:   { label: 'Interactions climatiques',    dimension: 'C', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    biodiversite_saisonnalite:  { label: 'Biodiversité & saisonnalité', dimension: 'C', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    activites_humaines:         { label: 'Activités humaines',          dimension: 'C', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    lecture_paysage:            { label: 'Lecture du paysage',          dimension: 'O', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    cohabitation_vivant:        { label: 'Cohabitation avec le vivant', dimension: 'P', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    impact_presence_humaine:    { label: 'Impact de la présence humaine', dimension: 'P', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    sciences_participatives:    { label: 'Sciences participatives',     dimension: 'P', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
};

const DIMENSION_COLORS: Record<'C' | 'O' | 'P', string> = {
    C: 'text-amber-500',
    O: 'text-blue-500',
    P: 'text-emerald-500',
};

type Props = {
    startDate: string;
    onSuggestions: (thematics: ThematicTag[]) => void;
    onSkip: () => void;
};

export default function SeasonalGuide({ startDate, onSuggestions, onSkip }: Props) {
    const month = startDate ? new Date(startDate).getMonth() + 1 : new Date().getMonth() + 1;
    const period = getPeriodForMonth(month);

    const [coeff, setCoeff] = useState<CoeffType | null>(null);
    const [meteo, setMeteo] = useState<MeteoType | null>(null);

    const suggestions = coeff && meteo
        ? getSuggestedThematics(period.id, coeff, meteo)
        : null;

    const handleValidate = () => {
        if (suggestions) onSuggestions(suggestions);
    };

    return (
        <div className="space-y-6">
            {/* Period context */}
            <div className="bg-slate-900 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-400 text-lg">calendar_month</span>
                    <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">{period.label}</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{period.description}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                    {period.phenomena.map(p => (
                        <span key={p} className="text-[10px] font-bold bg-white/10 text-white px-2 py-1 rounded-full">
                            {p}
                        </span>
                    ))}
                </div>
            </div>

            {/* Coefficient */}
            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                    Coefficient de marée prévu
                </label>
                <div className="grid grid-cols-3 gap-2">
                    {COEFF_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => setCoeff(opt.value)}
                            className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all font-bold text-xs ${
                                coeff === opt.value
                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                    : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                            }`}
                        >
                            <span className="material-symbols-outlined text-xl">{opt.icon}</span>
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Météo */}
            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                    Tendance météo de la semaine
                </label>
                <div className="grid grid-cols-2 gap-2">
                    {METEO_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => setMeteo(opt.value)}
                            className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all font-bold text-xs ${
                                meteo === opt.value
                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                    : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                            }`}
                        >
                            <span className="material-symbols-outlined text-xl">{opt.icon}</span>
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Suggestions */}
            {suggestions && (
                <div className="bg-indigo-50 border-2 border-indigo-100 rounded-2xl p-4 space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">
                        Thématiques suggérées
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map(tag => {
                            const info = THEMATIC_LABELS[tag];
                            return (
                                <span
                                    key={tag}
                                    className={`text-xs font-bold px-3 py-1.5 rounded-full border ${info.color}`}
                                >
                                    <span className={`font-black mr-1 ${DIMENSION_COLORS[info.dimension]}`}>
                                        {info.dimension}
                                    </span>
                                    {info.label}
                                </span>
                            );
                        })}
                    </div>
                    <p className="text-[10px] text-indigo-400">
                        Ces thématiques seront pré-sélectionnées dans votre programme. Vous pourrez les modifier à tout moment.
                    </p>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onSkip}
                    className="flex-1 h-12 border-2 border-slate-200 rounded-2xl text-xs font-black text-slate-500 uppercase tracking-wider hover:bg-slate-50 transition-all"
                >
                    Passer cette étape
                </button>
                <button
                    type="button"
                    onClick={handleValidate}
                    disabled={!suggestions}
                    className="flex-1 h-12 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider disabled:opacity-40 hover:bg-indigo-700 transition-all"
                >
                    Valider
                </button>
            </div>
        </div>
    );
}

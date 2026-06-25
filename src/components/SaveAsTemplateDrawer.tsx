'use client';

import { useState, useTransition, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    saveStageAsTemplate,
    type TemplateCondition,
    type TemplatePeriode,
    type TemplateSupport,
    type TemplateTypeStage,
    type TemplatePublic,
} from '@/actions/template-actions';
import clsx from 'clsx';

const CONDITIONS: { id: TemplateCondition; label: string; icon: string }[] = [
    { id: 'vent_fort',    label: 'Vent fort',    icon: 'air' },
    { id: 'vent_faible',  label: 'Vent faible',  icon: 'ac_unit' },
    { id: 'mer_calme',    label: 'Mer calme',    icon: 'water' },
    { id: 'mer_agitee',   label: 'Mer agitée',   icon: 'waves' },
    { id: 'pluie',        label: 'Pluie',        icon: 'rainy' },
    { id: 'grand_soleil', label: 'Grand soleil', icon: 'wb_sunny' },
    { id: 'brouillard',   label: 'Brouillard',   icon: 'foggy' },
];

const PERIODES: { id: TemplatePeriode; label: string }[] = [
    { id: 'printemps',          label: 'Printemps' },
    { id: 'juillet',            label: 'Juillet' },
    { id: 'aout',               label: 'Août' },
    { id: 'automne',            label: 'Automne' },
    { id: 'hiver',              label: 'Hiver' },
    { id: 'vacances_scolaires', label: 'Vacances scolaires' },
    { id: 'hors_vacances',      label: 'Hors vacances' },
];

const SUPPORTS: { id: TemplateSupport; label: string; icon: string }[] = [
    { id: 'catamaran_enfant',  label: 'Catamaran enfant',  icon: 'sailing' },
    { id: 'catamaran_adulte',  label: 'Catamaran adulte',  icon: 'sailing' },
    { id: 'deriveur_simple',   label: 'Dériveur simple',   icon: 'sailing' },
    { id: 'deriveur_double',   label: 'Dériveur double',   icon: 'sailing' },
    { id: 'planche_a_voile',   label: 'Planche à voile',   icon: 'kitesurfing' },
    { id: 'wing_foil',         label: 'Wing Foil',         icon: 'paragliding' },
    { id: 'kite_surf',         label: 'Kite Surf',         icon: 'paragliding' },
    { id: 'char_a_voile',      label: 'Char à voile',      icon: 'directions_car' },
    { id: 'kayak_mer',         label: 'Kayak de mer',      icon: 'rowing' },
    { id: 'sup',               label: 'SUP',               icon: 'surfing' },
    { id: 'paddle_geant',      label: 'Paddle géant',      icon: 'surfing' },
    { id: 'cerf_volant',       label: 'Cerf-volant',       icon: 'toys' },
    { id: 'marche_aquatique',  label: 'Marche aquatique',  icon: 'pool' },
];

const TYPES_STAGE: { id: TemplateTypeStage; label: string; icon: string }[] = [
    { id: 'decouverte',          label: 'Découverte',          icon: 'explore' },
    { id: 'initiation',          label: 'Initiation',          icon: 'school' },
    { id: 'perfectionnement',    label: 'Perfectionnement',    icon: 'trending_up' },
    { id: 'competition',         label: 'Compétition',         icon: 'emoji_events' },
    { id: 'randonnee',           label: 'Randonnée / Côtier',  icon: 'hiking' },
    { id: 'scolaire_classe_mer', label: 'Classe de mer',       icon: 'class' },
    { id: 'teambuilding',        label: 'Teambuilding',        icon: 'groups' },
    { id: 'evg_evjf',           label: 'EVG / EVJF',          icon: 'celebration' },
    { id: 'bien_etre',           label: 'Bien-être / Fitness', icon: 'self_improvement' },
    { id: 'secourisme_bnssa',    label: 'Secourisme / BNSSA',  icon: 'emergency' },
];

const PUBLICS: { id: TemplatePublic; label: string; icon: string }[] = [
    { id: 'enfants_7_10',    label: 'Enfants 7-10 ans',  icon: 'child_care' },
    { id: 'enfants_10_14',   label: 'Enfants 10-14 ans', icon: 'boy' },
    { id: 'ados',            label: 'Ados',              icon: 'face' },
    { id: 'adultes',         label: 'Adultes',           icon: 'person' },
    { id: 'seniors',         label: 'Seniors',           icon: 'elderly' },
    { id: 'groupes_scolaires', label: 'Groupes scolaires', icon: 'backpack' },
    { id: 'entreprises',     label: 'Entreprises',       icon: 'business' },
    { id: 'tous_niveaux',    label: 'Tous niveaux',      icon: 'diversity_3' },
];

function ChipGroup<T extends string>({
    label,
    items,
    selected,
    onToggle,
    activeColor,
}: {
    label: string;
    items: { id: T; label: string; icon?: string }[];
    selected: T[];
    onToggle: (id: T) => void;
    activeColor: string;
}) {
    return (
        <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">{label}</label>
            <div className="flex flex-wrap gap-2">
                {items.map(item => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => onToggle(item.id)}
                        className={clsx(
                            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all active:scale-95',
                            selected.includes(item.id)
                                ? `${activeColor} text-white border-transparent`
                                : 'bg-white border-slate-200 text-slate-600'
                        )}
                    >
                        {item.icon && <span className="material-symbols-outlined text-sm">{item.icon}</span>}
                        {item.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

export function SaveAsTemplateDrawer({ stageId, stageTitle, onClose }: {
    stageId: string;
    stageTitle: string;
    onClose: () => void;
}) {
    const [name, setName] = useState(stageTitle);
    const [conditions, setConditions] = useState<TemplateCondition[]>([]);
    const [periodes, setPeriodes] = useState<TemplatePeriode[]>([]);
    const [supports, setSupports] = useState<TemplateSupport[]>([]);
    const [typesStage, setTypesStage] = useState<TemplateTypeStage[]>([]);
    const [publics, setPublics] = useState<TemplatePublic[]>([]);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    const toggle = <T extends string>(list: T[], setList: (v: T[]) => void, id: T) =>
        setList(list.includes(id) ? list.filter(x => x !== id) : [...list, id]);

    const handleSave = () => {
        if (!name.trim()) return;
        startTransition(async () => {
            const res = await saveStageAsTemplate(
                stageId, name.trim(),
                conditions, periodes,
                supports, typesStage, publics
            );
            if (res.success) setSaved(true);
            else setError(res.error ?? 'Erreur');
        });
    };

    if (!mounted) return null;

    return createPortal(
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                style={{ zIndex: 9998 }}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className="fixed inset-x-0 bottom-0 rounded-t-3xl bg-white shadow-2xl max-h-[90vh] flex flex-col"
                style={{ zIndex: 9999 }}
            >
                {/* Header */}
                <div className="flex-none px-5 pt-5 pb-4 border-b border-slate-100 flex items-center gap-3">
                    <span className="material-symbols-outlined text-indigo-500 text-2xl">bookmark_add</span>
                    <div className="flex-1">
                        <h2 className="font-black text-slate-900">Sauvegarder comme modèle</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Réutilisable à la création de vos prochains stages</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="size-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 shrink-0 transition"
                    >
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>

                {/* Contenu scrollable */}
                <div className="flex-1 overflow-y-auto">
                    {saved ? (
                        <div className="px-5 py-12 flex flex-col items-center gap-4">
                            <span className="material-symbols-outlined text-5xl text-emerald-500">check_circle</span>
                            <p className="font-black text-slate-900 text-lg">Modèle sauvegardé !</p>
                            <p className="text-sm text-slate-500 text-center">Disponible lors de la création de votre prochain stage.</p>
                            <button
                                onClick={onClose}
                                className="mt-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-sm uppercase tracking-widest"
                            >
                                Fermer
                            </button>
                        </div>
                    ) : (
                        <div className="px-5 py-5 space-y-6 pb-4">

                            {/* Nom */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Nom du modèle</label>
                                <input
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="ex: Catamaran débutants vent fort"
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-900 focus:border-indigo-400 outline-none transition-colors text-sm"
                                />
                            </div>

                            {/* Support nautique */}
                            <ChipGroup
                                label="Support nautique"
                                items={SUPPORTS}
                                selected={supports}
                                onToggle={id => toggle(supports, setSupports, id)}
                                activeColor="bg-indigo-500"
                            />

                            {/* Type de stage */}
                            <ChipGroup
                                label="Type de stage"
                                items={TYPES_STAGE}
                                selected={typesStage}
                                onToggle={id => toggle(typesStage, setTypesStage, id)}
                                activeColor="bg-violet-500"
                            />

                            {/* Public */}
                            <ChipGroup
                                label="Public cible"
                                items={PUBLICS}
                                selected={publics}
                                onToggle={id => toggle(publics, setPublics, id)}
                                activeColor="bg-rose-500"
                            />

                            {/* Conditions météo */}
                            <ChipGroup
                                label="Conditions météo"
                                items={CONDITIONS}
                                selected={conditions}
                                onToggle={id => toggle(conditions, setConditions, id)}
                                activeColor="bg-sky-500"
                            />

                            {/* Période */}
                            <ChipGroup
                                label="Période"
                                items={PERIODES}
                                selected={periodes}
                                onToggle={id => toggle(periodes, setPeriodes, id)}
                                activeColor="bg-amber-500"
                            />

                            {error && (
                                <p className="text-sm text-red-600 font-semibold">{error}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* CTA sticky */}
                {!saved && (
                    <div className="flex-none px-5 pt-4 border-t border-slate-100 pb-[max(env(safe-area-inset-bottom),1rem)] md:pb-4">
                        <button
                            onClick={handleSave}
                            disabled={isPending || !name.trim()}
                            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-sm uppercase tracking-widest transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isPending
                                ? <span className="animate-spin material-symbols-outlined text-lg">progress_activity</span>
                                : <span className="material-symbols-outlined text-lg">bookmark_add</span>
                            }
                            Sauvegarder ce modèle
                        </button>
                    </div>
                )}
            </div>
        </>,
        document.body
    );
}

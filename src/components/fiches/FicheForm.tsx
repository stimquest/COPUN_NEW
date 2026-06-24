'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createFicheMemo, updateFicheMemo } from '@/actions/fiche-memo-actions';
import type { FicheMemo, CreateFicheData } from '@/actions/fiche-memo-actions';
import type { ThematicTag } from '@/data/seasonal-context';
import { THEMATIC_TAG_LABELS, SAISON_LABELS, ALL_THEMATIC_TAGS, ALL_SAISON_IDS } from './fiche-constants';
import RichTextEditor from './RichTextEditor';

interface FicheFormProps {
    fiche?: FicheMemo;
}

export default function FicheForm({ fiche }: FicheFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const [titre, setTitre] = useState(fiche?.titre ?? '');
    const [resume, setResume] = useState(fiche?.resume ?? '');
    const [contenu, setContenu] = useState(fiche?.contenu ?? '');
    const [tagsThematiques, setTagsThematiques] = useState<ThematicTag[]>(fiche?.tags_thematiques ?? []);
    const [tagsSaisons, setTagsSaisons] = useState<string[]>(fiche?.tags_saisons ?? []);
    const [tags, setTags] = useState<string[]>(fiche?.tags ?? []);
    const [tagInput, setTagInput] = useState('');

    const addTag = () => {
        const t = tagInput.trim().toLowerCase();
        if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
        setTagInput('');
    };
    const removeTag = (t: string) => setTags(prev => prev.filter(x => x !== t));

    // Le contenu WYSIWYG est de l'HTML ; on considère vide si pas de texte réel
    const contentIsEmpty = (html: string) => !html.replace(/<[^>]*>/g, '').trim();

    const toggleThematique = (tag: ThematicTag) => {
        setTagsThematiques(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const toggleSaison = (id: string) => {
        setTagsSaisons(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!titre.trim()) {
            setError('Le titre est obligatoire.');
            return;
        }
        if (contentIsEmpty(contenu)) {
            setError('Le contenu est obligatoire.');
            return;
        }

        const data: CreateFicheData = {
            titre: titre.trim(),
            resume: resume.trim() || undefined,
            contenu,
            tags_thematiques: tagsThematiques,
            tags_saisons: tagsSaisons,
            tags,
        };

        startTransition(async () => {
            if (fiche) {
                const result = await updateFicheMemo(fiche.id, data);
                if (!result.success) {
                    setError(result.error ?? 'Erreur lors de la mise à jour.');
                    return;
                }
                router.push(`/ressources/${fiche.id}`);
            } else {
                const result = await createFicheMemo(data);
                if (!result.success) {
                    setError(result.error ?? 'Erreur lors de la création.');
                    return;
                }
                router.push(`/ressources/${result.ficheId}`);
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {/* Titre */}
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                    Titre <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={titre}
                    onChange={e => setTitre(e.target.value)}
                    placeholder="Ex : Animaux marins visibles selon les saisons"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 text-slate-900 font-medium"
                    required
                />
            </div>

            {/* Résumé */}
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                    Résumé court
                    <span className="font-normal text-slate-400 ml-2">— affiché dans la liste</span>
                </label>
                <input
                    type="text"
                    value={resume}
                    onChange={e => setResume(e.target.value)}
                    placeholder="Une phrase qui résume l'essentiel de la fiche"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 text-slate-900"
                />
            </div>

            {/* Contenu — éditeur visuel */}
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                    Contenu <span className="text-red-500">*</span>
                </label>
                <RichTextEditor
                    value={contenu}
                    onChange={setContenu}
                    placeholder="Décris ici le contenu de la fiche mémo…"
                />
                <p className="text-xs text-slate-400 mt-1">
                    Utilise la barre d&apos;outils pour mettre en forme, ajouter des liens ou des images (via URL externe, sans consommer le stockage).
                </p>
            </div>

            {/* Tags thématiques */}
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                    Thèmes liés
                    <span className="font-normal text-slate-400 ml-2">— plusieurs choix possibles</span>
                </label>
                <div className="flex flex-wrap gap-2">
                    {ALL_THEMATIC_TAGS.map(tag => (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => toggleThematique(tag)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                                tagsThematiques.includes(tag)
                                    ? 'bg-teal-600 text-white border-teal-600'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
                            }`}
                        >
                            {THEMATIC_TAG_LABELS[tag]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tags saisons */}
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                    Saisons concernées
                    <span className="font-normal text-slate-400 ml-2">— plusieurs choix possibles</span>
                </label>
                <div className="flex flex-wrap gap-2">
                    {ALL_SAISON_IDS.map(id => (
                        <button
                            key={id}
                            type="button"
                            onClick={() => toggleSaison(id)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                                tagsSaisons.includes(id)
                                    ? 'bg-sky-600 text-white border-sky-600'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300'
                            }`}
                        >
                            {SAISON_LABELS[id]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tags libres (mots-clés) */}
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                    Mots-clés
                    <span className="font-normal text-slate-400 ml-2">— pour retrouver la fiche (ex : oiseaux, marée, dune)</span>
                </label>
                <div className="flex gap-2 mb-2">
                    <input
                        type="text"
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                        placeholder="Ajouter un mot-clé puis Entrée"
                        className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 text-slate-900 text-sm"
                    />
                    <button
                        type="button"
                        onClick={addTag}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold transition"
                    >
                        Ajouter
                    </button>
                </div>
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {tags.map(t => (
                            <span key={t} className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
                                #{t}
                                <button type="button" onClick={() => removeTag(t)} className="hover:text-red-600 transition">
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition disabled:opacity-50"
                >
                    <span className="material-symbols-outlined">save</span>
                    {isPending ? 'Enregistrement...' : fiche ? 'Mettre à jour' : 'Créer la fiche'}
                </button>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-3 text-slate-500 hover:text-slate-800 font-semibold transition"
                >
                    Annuler
                </button>
                {!fiche && (
                    <p className="text-sm text-slate-400 ml-auto">
                        La fiche sera créée en <strong>brouillon</strong> — un référent la publiera.
                    </p>
                )}
            </div>
        </form>
    );
}

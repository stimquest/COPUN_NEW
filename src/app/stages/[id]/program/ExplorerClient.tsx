'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import { Stage, PedagogicalContent, Dimension } from '@/types';
import { GROUPES, Groupe } from '@/data/groupes';
import { PILLARS } from '@/data/etages';
import { NIVEAUX } from '@/data/niveaux';
import { updateStagePool } from '@/actions/stage-actions';
import GroupeBloc from '@/components/explorer/GroupeBloc';
import TagsPanel from '@/components/explorer/TagsPanel';
import ChoixThemes from '@/components/explorer/ChoixThemes';
import ParSujetTerrain from '@/components/explorer/ParSujetTerrain';
import QuestionsDuSujet from '@/components/explorer/QuestionsDuSujet';
import SelectionRecapCopun from '@/components/explorer/SelectionRecapCopun';
import CardDetailModal from '@/components/CardDetailModal';

type Props = {
    stage: Stage;
    copunPool: PedagogicalContent[];
    customPool: PedagogicalContent[];
};

// 2-3 notions par semaine = bon rythme de transmission ; 5 max pour les très motivés.
// Au-delà, rien ne sera vraiment travaillé.
const MAX_OBJECTIFS = 5;

/**
 * Écran de choix des contenus.
 *
 * Remplace les trois onglets (Guidé / Explorer / Sélection) par un seul écran. Le
 * catalogue complet est l'arrivée par défaut — celui qui sait ce qu'il cherche n'a rien
 * à traverser — mais il est désormais structuré par phénomène au lieu d'être à plat,
 * avec l'arc Comprendre → Observer → Protéger visible dans chaque groupe.
 *
 * Le mode guidé devient une aide au choix appelable (« Par où commencer ? ») qui
 * pré-règle les filtres au lieu d'imposer un parcours parallèle.
 */
export default function ExplorerClient({ stage, copunPool, customPool }: Props) {
    const router = useRouter();
    const [retenues, setRetenues] = useState<string[]>(stage.selected_content ?? []);
    // Les groupes contenant déjà une sélection s'ouvrent d'emblée : en arrivant sur une
    // semaine préparée, le moniteur doit voir ses choix, pas des accordéons fermés.
    const [ouverts, setOuverts] = useState<string[]>(() => {
        const dejaPris = new Set(stage.selected_content ?? []);
        return GROUPES.filter(g => g.fiches.some(f => dejaPris.has(String(f)))).map(g => g.id);
    });
    const [recherche, setRecherche] = useState('');
    const [niveau, setNiveau] = useState<1 | 2 | 3 | 4 | null>(null);
    // Multi-sélection : COP est un arc, pas une catégorie exclusive — on veut pouvoir
    // croiser deux « comprendre » et un « observer » sur un même sujet.
    const [dimensions, setDimensions] = useState<Dimension[]>([]);
    const [ficheDetail, setFicheDetail] = useState<PedagogicalContent | null>(null);
    const [enregistre, setEnregistre] = useState(false);
    const [saving, setSaving] = useState(false);
    const [plafond, setPlafond] = useState(false);
    const [voirSelection, setVoirSelection] = useState(false);
    const [tagsOuverts, setTagsOuverts] = useState(false);
    // Stockés en minuscules : les tags existent en plusieurs casses en base.
    const [tags, setTags] = useState<string[]>([]);

    // Parcours en deux temps : on choisit d'abord un sujet par couleur (ChoixThemes), puis
    // on ouvre les questions qui y mènent (QuestionsDuSujet). L'entrée « par sujet de terrain »
    // a été supprimée — elle éparpillait au lieu de tenir la semaine sur trois couleurs.
    const [vueCopun, setVueCopun] = useState(false);
    const [sujetTerrainOuvert, setSujetTerrainOuvert] = useState(false);
    // Au plus un thème par pilier : la consigne est « un sujet pour chaque couleur ».
    const [themesChoisis, setThemesChoisis] = useState<Partial<Record<Dimension, string>>>({});

    const choisirTheme = (pilier: Dimension, themeId: string) => {
        setThemesChoisis(p => (p[pilier] === themeId
            ? Object.fromEntries(Object.entries(p).filter(([k]) => k !== pilier))
            : { ...p, [pilier]: themeId }));
    };

    const nbThemesChoisis = Object.keys(themesChoisis).length;
    // Le catalogue par phénomène (marées, vent, oiseaux…) n'a plus de point d'entrée : il
    // repartait vers l'éparpillement, alors que la semaine doit tenir sur trois sujets, un
    // par couleur. Son rendu reste en place plus bas mais n'est plus atteignable — laissé
    // le temps de confirmer que la nouvelle entrée par thèmes couvre bien tous les usages.
    const catalogueSujetOuvert = false;

    const pool = useMemo(() => [...copunPool, ...customPool], [copunPool, customPool]);

    // Rien à enregistrer si la sélection est identique à celle déjà en base : on propose
    // alors directement l'étape suivante plutôt qu'un bouton qui ne ferait rien.
    // Comparaison sans tri : l'ordre fait partie de la sélection, donc réorganiser sans
    // rien ajouter ni retirer est bien une modification à enregistrer.
    const dejaEnBase = useMemo(
        () => (stage.selected_content ?? []).join('|') === retenues.join('|'),
        [retenues, stage.selected_content],
    );

    // Les fiches déjà retenues, quel que soit le filtre courant : la sélection doit
    // rester consultable même quand elle sort du tri affiché.
    const fichesRetenues = useMemo(
        () => retenues.map(id => pool.find(f => f.id === id)).filter((f): f is PedagogicalContent => !!f),
        [retenues, pool],
    );

    const blocs = useMemo(() => {
        const correspond = (f: PedagogicalContent) => {
            if (niveau && Number(f.niveau) !== niveau) return false;
            if (dimensions.length) {
                const d = (f.dimension ?? '').toUpperCase();
                const cle = d.startsWith('COMPR') ? 'COMPRENDRE' : d.startsWith('OBSERV') ? 'OBSERVER' : 'PROTÉGER';
                if (!dimensions.includes(cle as Dimension)) return false;
            }
            if (tags.length) {
                const siens = (f.tags_filtre ?? []).map(t => String(t).trim().toLocaleLowerCase('fr'));
                // ET entre mots-clés : cumuler doit resserrer, pas élargir.
                if (!tags.every(t => siens.includes(t))) return false;
            }
            if (recherche.trim()) {
                const q = recherche.toLowerCase();
                const cible = `${f.question} ${f.objectif ?? ''} ${(f.tags_filtre ?? []).join(' ')}`.toLowerCase();
                if (!cible.includes(q)) return false;
            }
            return true;
        };

        const classees = new Set(GROUPES.flatMap(g => g.fiches.map(String)));

        const blocsCatalogue = GROUPES.map(g => {
            const ids = new Set(g.fiches.map(String));
            return { groupe: g, fiches: pool.filter(f => ids.has(f.id) && correspond(f)) };
        });

        // Filet de sécurité, pas un rangement : toute fiche hors des 12 groupes doit
        // rester visible plutôt que de disparaître sans erreur. Une fiche qui atterrit
        // dans « À classer » signale un contenu à rattacher à son groupe dans
        // `src/data/groupes.ts` — ce n'est pas sa place définitive.
        const orphelines = pool.filter(f => !classees.has(f.id) && correspond(f));
        const perso = orphelines.filter(f => f.source === 'custom');
        const horsGroupe = orphelines.filter(f => f.source !== 'custom');

        const blocsExtra: { groupe: Groupe; fiches: PedagogicalContent[] }[] = [];
        if (horsGroupe.length) {
            blocsExtra.push({
                groupe: {
                    id: '_autres', label: 'À classer', accroche: 'Pas encore rattaché à un thème',
                    icon: 'more_horiz', milieu: 'posture', fiches: [],
                },
                fiches: horsGroupe,
            });
        }
        if (perso.length) {
            blocsExtra.push({
                groupe: {
                    id: '_perso', label: 'Mes fiches', accroche: 'Contenus que j’ai créés',
                    icon: 'edit_note', milieu: 'posture', fiches: [],
                },
                fiches: perso,
            });
        }

        return [...blocsCatalogue, ...blocsExtra].filter(b => b.fiches.length > 0);
    }, [pool, niveau, dimensions, recherche, tags]);

    const total = useMemo(() => blocs.reduce((n, b) => n + b.fiches.length, 0), [blocs]);
    const filtresActifs = (niveau ? 1 : 0) + dimensions.length + tags.length + (recherche.trim() ? 1 : 0);

    const toggleFiche = (id: string) => {
        setRetenues(p => {
            if (p.includes(id)) return p.filter(x => x !== id);
            if (p.length >= MAX_OBJECTIFS) {
                setPlafond(true);
                setTimeout(() => setPlafond(false), 3000);
                return p;
            }
            return [...p, id];
        });
        setEnregistre(false);
    };


    const enregistrer = async () => {
        setSaving(true);
        const res = await updateStagePool(stage.id, retenues);
        setSaving(false);
        if (res.success) { setEnregistre(true); router.refresh(); }
        else alert('Erreur : ' + res.error);
    };

    // Résultat de l'entonnoir « par sujet » : préconfigure le catalogue phénomène
    // ci-dessous (dimensions COP + groupe ouvert), reprend le comportement d'origine.
    return (
        <div className="min-h-screen bg-[#EBF0F7] pb-40">

            <header className="sticky top-0 z-40 bg-[#EBF0F7]/95 backdrop-blur-sm px-4 pt-4 pb-3">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/stages"
                            className="size-9 rounded-full bg-white flex items-center justify-center text-slate-600 active:scale-90 transition shrink-0"
                        >
                            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                        </Link>
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none">
                                {stage.dates}
                            </p>
                            <h1 className="text-base font-black text-slate-900 leading-tight truncate mt-1">
                                {stage.title}
                            </h1>
                        </div>
                    </div>

                    {catalogueSujetOuvert && !vueCopun && (
                        <>
                            <div className="relative mt-3">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-[19px]">
                                    search
                                </span>
                                <input
                                    value={recherche}
                                    onChange={e => setRecherche(e.target.value)}
                                    placeholder="Chercher une question…"
                                    className="w-full h-11 pl-10 pr-9 rounded-xl bg-white text-sm font-medium text-slate-800 placeholder:text-slate-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                                />
                                {recherche && (
                                    <button
                                        onClick={() => setRecherche('')}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 active:scale-90 transition"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">close</span>
                                    </button>
                                )}
                            </div>

                            {/* Filtres à plat : on voit l'état du tri sans avoir à ouvrir un panneau. */}
                            <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar pb-0.5">
                                <button
                                    onClick={() => setTagsOuverts(true)}
                                    className={clsx(
                                        'shrink-0 h-8 pl-2.5 pr-3 rounded-full text-[11px] font-black uppercase tracking-wide shadow-sm transition-all active:scale-95 flex items-center gap-1',
                                        tags.length ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500',
                                    )}
                                >
                                    <span className="material-symbols-outlined text-[15px]">sell</span>
                                    {tags.length ? `${tags.length} mot${tags.length > 1 ? 's' : ''}-clé${tags.length > 1 ? 's' : ''}` : 'Mots-clés'}
                                </button>
                                <span className="w-px h-5 bg-slate-300 mx-0.5 shrink-0" />
                                {NIVEAUX.map(({ n, label }) => (
                                    <Puce key={n} actif={niveau === n} onClick={() => setNiveau(niveau === n ? null : n)}>
                                        {label}
                                    </Puce>
                                ))}
                                <span className="w-px h-5 bg-slate-300 mx-1 shrink-0" />
                                {(['COMPRENDRE', 'OBSERVER', 'PROTÉGER'] as Dimension[]).map(d => {
                                    const p = PILLARS.find(x => x.id === d);
                                    return (
                                        <Puce
                                            key={d}
                                            actif={dimensions.includes(d)}
                                            accent={p?.bg}
                                            onClick={() =>
                                                setDimensions(prev =>
                                                    prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d],
                                                )
                                            }
                                        >
                                            {p?.label}
                                        </Puce>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 pt-1 space-y-2.5">

                {/* ══ ÉTAPE 1 : LES SUJETS ══
                    Les neuf thèmes, visibles d'emblée : c'est l'arrivée, pas une option
                    derrière un menu. L'écran s'ouvrait avant sur « choisis un outil de
                    filtre », qui demandait de comprendre l'outillage avant de voir le moindre
                    contenu. */}
                {!vueCopun && !sujetTerrainOuvert && (
                    <ChoixThemes choisis={themesChoisis} onChoisir={choisirTheme} />
                )}

                {/* ══ L'AUTRE PORTE ══
                    Entrée par centre d'intérêt, ouverte depuis le lien de l'en-tête. Elle
                    remplace l'écran de choix plutôt que de s'y ajouter : c'est un autre
                    chemin vers les mêmes questions, pas une étape de plus. Contrairement au
                    regroupement « par phénomène » de l'écran suivant, qui réordonne une liste
                    déjà découpée par les paliers retenus, celle-ci attaque tout le catalogue. */}
                {!vueCopun && sujetTerrainOuvert && (
                    <>
                        <button
                            onClick={() => setSujetTerrainOuvert(false)}
                            className="inline-flex items-center gap-1.5 text-[12px] font-black text-slate-500 hover:text-slate-800 transition-colors px-1 pb-1"
                        >
                            <span className="material-symbols-outlined text-[17px]">arrow_back</span>
                            Revenir aux paliers
                        </button>
                        <ParSujetTerrain
                            pool={pool}
                            retenues={retenues}
                            onToggleFiche={toggleFiche}
                            onFicheInfo={setFicheDetail}
                        />
                    </>
                )}

                {/* ══ ÉTAPE 2 : LES QUESTIONS ══
                    N'apparaît qu'une fois au moins un sujet choisi — sans sujet, il n'y a
                    rien pour entrer. */}
                {!vueCopun && !sujetTerrainOuvert && nbThemesChoisis > 0 && (
                    <motion.button
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => setVueCopun(true)}
                        className="w-full flex items-center gap-3 mt-2 px-4 py-4 rounded-2xl bg-slate-900 text-white text-left active:scale-[0.99] transition shadow-sm"
                    >
                        <span className="size-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                        </span>
                        <span className="flex-1 min-w-0">
                            <span className="block text-sm font-black leading-tight">Par où commencer ?</span>
                            <span className="block text-[11px] text-white/60 mt-0.5">
                                Voici des questions pour entrer dans le sujet, fais ton choix
                            </span>
                        </span>
                        <span className="material-symbols-outlined text-white/40 shrink-0">chevron_right</span>
                    </motion.button>
                )}

                {/* Dernière proposition, après le chemin principal : une action possible,
                    jamais celle qu'on suggère en premier. */}
                {!vueCopun && !sujetTerrainOuvert && (
                    <button
                        onClick={() => setSujetTerrainOuvert(true)}
                        className="group inline-flex items-center gap-1.5 px-1 pt-1 text-[12px] font-bold text-slate-400 hover:text-slate-700 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[16px]">explore</span>
                        <span className="underline decoration-slate-300 underline-offset-2 group-hover:decoration-slate-500">
                            Chercher par centre d&apos;intérêt
                        </span>
                    </button>
                )}

                {vueCopun ? (
                    <>
                        <button
                            onClick={() => setVueCopun(false)}
                            className="inline-flex items-center gap-1.5 text-[12px] font-black text-slate-500 hover:text-slate-800 transition-colors px-1 pb-1"
                        >
                            <span className="material-symbols-outlined text-[17px]">arrow_back</span>
                            Changer de sujet
                        </button>
                        <QuestionsDuSujet
                            pool={pool}
                            retenues={retenues}
                            onToggleFiche={toggleFiche}
                            onFicheInfo={setFicheDetail}
                            themesInitiaux={themesChoisis}
                        />
                    </>
                ) : catalogueSujetOuvert ? (
                    <>
                        <div className="flex items-center justify-between px-1 pt-1.5 pb-0.5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                {total} question{total > 1 ? 's' : ''}{filtresActifs > 0 && ' · filtré'}
                            </p>
                            {filtresActifs > 0 && (
                                <button
                                    onClick={() => { setNiveau(null); setDimensions([]); setTags([]); setRecherche(''); }}
                                    className="text-[11px] font-bold text-indigo-500 hover:text-indigo-700 transition"
                                >
                                    Tout afficher
                                </button>
                            )}
                        </div>

                        {blocs.length === 0 ? (
                            <div className="text-center py-16 text-slate-400">
                                <span className="material-symbols-outlined text-4xl">search_off</span>
                                <p className="text-sm font-black uppercase tracking-wide mt-2">Rien ne correspond</p>
                                <p className="text-xs mt-1">Essayez d&apos;élargir les filtres.</p>
                            </div>
                        ) : (
                            blocs.map(({ groupe, fiches }) => (
                                <div key={groupe.id} id={`groupe-${groupe.id}`} className="scroll-mt-48">
                                    <GroupeBloc
                                        groupe={groupe}
                                        fiches={fiches}
                                        retenues={retenues}
                                        ouvert={ouverts.includes(groupe.id)}
                                        onToggleOuvert={() =>
                                            setOuverts(p => (p.includes(groupe.id) ? p.filter(x => x !== groupe.id) : [...p, groupe.id]))
                                        }
                                        onToggleFiche={toggleFiche}
                                        onVoirFiche={setFicheDetail}
                                    />
                                </div>
                            ))
                        )}
                    </>
                ) : retenues.length > 0 && !sujetTerrainOuvert ? (
                    /* Semaine déjà préparée : la sélection en cours, sous les sujets, par
                       pilier COP. Masquée dans la vue par centre d'intérêt, qui marque déjà
                       les questions retenues à même ses listes. */
                    <div className="pt-2">
                        <SelectionRecapCopun
                            pool={pool}
                            retenues={retenues}
                            onToggleFiche={toggleFiche}
                            onFicheInfo={setFicheDetail}
                        />
                    </div>
                ) : null}
            </main>

            {plafond && (
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[95] bg-amber-500 text-white text-sm font-black px-6 py-4 rounded-2xl shadow-2xl shadow-amber-500/40 max-w-[85vw] flex items-center gap-3">
                    <span className="material-symbols-outlined text-2xl shrink-0">warning</span>
                    5 objectifs max — mieux vaut 2-3 fiches bien travaillées.
                </div>
            )}

            {/* Affichée aussi à 0 fiche retenue tant que ce n'est pas encore enregistré :
                vider une sélection existante doit rester une action qu'on peut valider,
                pas un état invisible qui fait disparaître le bouton Enregistrer. */}
            {(retenues.length > 0 || !dejaEnBase) && (
                <div className="above-nav fixed left-0 right-0 z-40 px-4 pt-10 pb-4 bg-linear-to-t from-[#EBF0F7] via-[#EBF0F7] to-transparent pointer-events-none">
                    <div className="max-w-2xl mx-auto flex items-center gap-3 pointer-events-auto">
                        <button
                            onClick={() => setVoirSelection(true)}
                            disabled={retenues.length === 0}
                            className="flex-1 min-w-0 h-14 px-4 rounded-2xl bg-white shadow-sm flex items-center gap-2 active:scale-[0.98] transition disabled:opacity-60"
                        >
                            <span className="text-base font-black text-slate-900">{retenues.length}</span>
                            <span className="text-xs font-bold text-slate-400">/ {MAX_OBJECTIFS} retenue{retenues.length > 1 ? 's' : ''}</span>
                            {retenues.length > 0 && (
                                <span className="material-symbols-outlined text-slate-300 text-lg ml-auto">expand_less</span>
                            )}
                        </button>
                        {/* Une fois la sélection enregistrée, l'écran ne doit pas être un
                            cul-de-sac : choisir des fiches n'est pas préparer, l'étape
                            suivante est le vrai bénéfice pour le moniteur. Mais si tout a
                            été retiré, il n'y a plus de « préparer » qui tienne. */}
                        {retenues.length > 0 && (enregistre || dejaEnBase) ? (
                            <Link
                                href={`/stages/${stage.id}/preparer`}
                                className="h-14 px-7 rounded-2xl bg-indigo-600 text-white text-xs font-black tracking-[0.15em] uppercase shadow-xl active:scale-95 transition-all flex items-center gap-2"
                            >
                                Préparer
                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </Link>
                        ) : (
                            <button
                                onClick={enregistrer}
                                disabled={saving}
                                className="h-14 px-8 rounded-2xl bg-slate-900 disabled:bg-slate-300 text-white text-xs font-black tracking-[0.15em] uppercase shadow-xl active:scale-95 transition-all flex items-center gap-2"
                            >
                                {saving ? (
                                    <span className="animate-spin material-symbols-outlined text-lg">progress_activity</span>
                                ) : (
                                    <><span className="material-symbols-outlined text-lg">save</span> Enregistrer</>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Ce qui est retenu — remplace l'ancien onglet « Sélection ». Consultable à tout
                moment, indépendamment des filtres en cours. */}
            <AnimatePresence>
                {voirSelection && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setVoirSelection(false)}
                            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[70]"
                        />
                        <motion.div
                            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
                            className="fixed inset-x-0 bottom-0 z-[71] bg-[#EBF0F7] rounded-t-[2rem] max-h-[80vh] flex flex-col shadow-2xl"
                        >
                            <div className="px-5 pt-5 pb-3 flex items-center gap-3 shrink-0">
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ma sélection</p>
                                    <p className="text-lg font-black text-slate-900 leading-tight">
                                        {retenues.length} objectif{retenues.length > 1 ? 's' : ''} pour la semaine
                                    </p>
                                    {retenues.length > 1 && (
                                        <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                                            L&apos;ordre est celui du traitement — glissez pour réorganiser.
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => setVoirSelection(false)}
                                    className="size-9 rounded-full bg-white flex items-center justify-center text-slate-400 active:scale-90 transition shrink-0"
                                >
                                    <span className="material-symbols-outlined text-[20px]">close</span>
                                </button>
                            </div>

                            <Reorder.Group
                                axis="y"
                                values={retenues}
                                onReorder={ids => { setRetenues(ids); setEnregistre(false); }}
                                className="flex-1 overflow-y-auto px-5 pb-8 space-y-2"
                            >
                                {fichesRetenues.map((f, i) => (
                                    <LigneSelection
                                        key={f.id}
                                        fiche={f}
                                        rang={i + 1}
                                        onVoir={() => { setFicheDetail(f); setVoirSelection(false); }}
                                        onRetirer={() => toggleFiche(f.id)}
                                    />
                                ))}
                            </Reorder.Group>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <TagsPanel
                open={tagsOuverts}
                onClose={() => setTagsOuverts(false)}
                pool={pool}
                selection={tags}
                onToggle={t => setTags(p => (p.includes(t) ? p.filter(x => x !== t) : [...p, t]))}
                onReset={() => setTags([])}
                resultCount={total}
            />

            <CardDetailModal
                isOpen={!!ficheDetail}
                content={ficheDetail}
                onClose={() => setFicheDetail(null)}
            />

        </div>
    );
}

function Puce({
    actif, accent, onClick, children,
}: { actif: boolean; accent?: string; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            className={clsx(
                'shrink-0 h-8 px-3.5 rounded-full text-[11px] font-black uppercase tracking-wide transition-all active:scale-95',
                actif
                    ? clsx(accent ?? 'bg-slate-900', 'text-white shadow-sm')
                    : 'bg-white text-slate-500 shadow-sm',
            )}
        >
            {children}
        </button>
    );
}

/**
 * Une fiche retenue, déplaçable dans l'ordre de traitement.
 *
 * Le glisser part de la poignée seule (`dragListener={false}` + `useDragControls`) : une
 * carte entièrement draggable capturerait le geste de défilement et rendrait le panneau
 * impossible à parcourir au doigt.
 */
function LigneSelection({
    fiche,
    rang,
    onVoir,
    onRetirer,
}: {
    fiche: PedagogicalContent;
    rang: number;
    onVoir: () => void;
    onRetirer: () => void;
}) {
    const controls = useDragControls();
    const [saisi, setSaisi] = useState(false);

    const d = (fiche.dimension ?? '').toUpperCase();
    const cle = d.startsWith('COMPR') ? 'COMPRENDRE' : d.startsWith('OBSERV') ? 'OBSERVER' : 'PROTÉGER';
    const p = PILLARS.find(x => x.id === cle);

    return (
        <Reorder.Item
            value={fiche.id}
            dragListener={false}
            dragControls={controls}
            onDragStart={() => setSaisi(true)}
            onDragEnd={() => setSaisi(false)}
            className={clsx(
                'relative flex items-center gap-2 bg-white rounded-xl overflow-hidden transition-shadow',
                saisi ? 'shadow-lg shadow-indigo-500/15' : 'shadow-sm',
            )}
        >
            <span className={clsx('absolute left-0 top-0 bottom-0 w-1', p?.bg)} />

            <span className="text-[12px] font-black text-slate-300 tabular-nums shrink-0 pl-3.5 w-6">
                {rang}
            </span>

            <button onClick={onVoir} className="flex-1 min-w-0 text-left py-3">
                <span className={clsx('block text-[9px] font-black uppercase tracking-widest', p?.color)}>
                    {p?.label}
                </span>
                <span className="block text-[13px] font-bold text-slate-800 leading-snug mt-0.5">
                    {fiche.question}
                </span>
            </button>

            <span
                onPointerDown={e => controls.start(e)}
                aria-label={`Déplacer : ${fiche.question}`}
                className="size-10 flex items-center justify-center text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing touch-none shrink-0 transition-colors"
            >
                <span className="material-symbols-outlined text-[20px]">drag_indicator</span>
            </span>

            <button
                onClick={onRetirer}
                aria-label="Retirer"
                className="size-8 mr-2.5 rounded-full bg-red-50 text-red-400 flex items-center justify-center shrink-0 active:scale-90 transition"
            >
                <span className="material-symbols-outlined text-[17px]">remove</span>
            </button>
        </Reorder.Item>
    );
}

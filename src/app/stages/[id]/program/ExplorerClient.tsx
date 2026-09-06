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
import AideConditions from '@/components/explorer/AideConditions';
import FluxDecouverte from '@/components/explorer/FluxDecouverte';
import SelectionRecapCopun from '@/components/explorer/SelectionRecapCopun';
import CardDetailModal from '@/components/CardDetailModal';
import { HistoriqueMoniteur } from '@/lib/historique-moniteur';

type Props = {
    stage: Stage;
    copunPool: PedagogicalContent[];
    customPool: PedagogicalContent[];
    /** Ce que ce moniteur a déjà traité les semaines passées. */
    historique?: HistoriqueMoniteur;
    initialTheme?: string;
    initialGroup?: string;
    initialSelection?: string[];
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
export default function ExplorerClient({ stage, copunPool, customPool, historique, initialTheme, initialGroup, initialSelection = [] }: Props) {
    const router = useRouter();
    const [retenues, setRetenues] = useState<string[]>(() => Array.from(new Set([...(stage.selected_content ?? []), ...initialSelection])).slice(0, MAX_OBJECTIFS));
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
    // Deux chemins pour aborder la semaine, jamais confondus : une intention à accepter
    // (AideConditions) ou le catalogue à parcourir en flux (FluxDecouverte).
    const [aideConditionsOuverte, setAideConditionsOuverte] = useState(false);
    // Le flux est l'arrivée naturelle : on rencontre d'abord la matière, l'intention
    // reste un autre chemin possible quand le moniteur sait déjà ce qu'il cherche.
    const [modeDecouverte, setModeDecouverte] = useState(true);
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
        // Assez de marge pour que le bas de page passe SOUS la barre fixe (h-14 + dégradé)
        // et la navigation : à pb-40, le récapitulatif de sélection était coupé en deux.
        <div className="min-h-screen fond-ciel pb-52">

            {/* Bandeau d'identité : zone colorée franche dont les cartes se détachent, au
                lieu d'un empilement de blancs sur gris uniforme. */}
            <header className="bandeau-ciel px-4 pt-5 pb-6 rounded-b-[1.75rem]">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center gap-3">
                        {/* Une seule flèche pour tout l'écran : dans l'aide au choix elle
                            recule d'une étape, ailleurs elle quitte la semaine. */}
                        {aideConditionsOuverte ? (
                            <button
                                onClick={() => setAideConditionsOuverte(false)}
                                className="size-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white active:scale-90 transition shrink-0"
                                aria-label="Retour"
                            >
                                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                            </button>
                        ) : (
                            <Link
                                href="/stages"
                                className="size-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white active:scale-90 transition shrink-0"
                            >
                                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                            </Link>
                        )}
                        <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-bold text-white/60 leading-tight truncate">
                                {stage.title}
                            </p>
                            <h1 className="text-[19px] font-black text-white leading-tight truncate mt-0.5">
                                {aideConditionsOuverte ? 'Ton intention' : 'Choisir les sujets'}
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            {/* Pas de rangée de compteurs ici : reprise à mes références, elle affichait
                « 0/3 sujets » au-dessus d'une grille qui montre déjà lesquels sont choisis,
                le nombre de questions déjà présent dans la barre du bas, et un total de
                fiches inexplorées sur lequel on ne peut rien faire depuis cet écran. De la
                forme copiée sans usage. */}
            {/* Échelle d'espacement : large entre les blocs (space-y-5), serré à l'intérieur
                d'un bloc. Tout était à 2.5 — rien ne distinguait « deux sections » de « un
                titre et sa grille », d'où un écran sans respiration ni groupement lisible. */}
            <main className="max-w-2xl mx-auto px-4 pt-6 space-y-5">

                {/* L'aide au choix remplace le contenu de l'écran — elle vivait dans un
                    tiroir venu du bas, format qui convient à une action courte, pas à un
                    parcours en trois étapes avec ses propres listes défilantes. */}
                {aideConditionsOuverte && (
                    <AideConditions
                        open
                        onClose={() => setAideConditionsOuverte(false)}
                        pool={pool}
                        retenues={retenues}
                        onToggleFiche={toggleFiche}
                        onFicheInfo={setFicheDetail}
                        historique={historique}
                    />
                )}

                {/* ══ ÉTAPE 1 : LES SUJETS ══
                    Les neuf thèmes, visibles d'emblée : c'est l'arrivée, pas une option
                    derrière un menu. L'écran s'ouvrait avant sur « choisis un outil de
                    filtre », qui demandait de comprendre l'outillage avant de voir le moindre
                    contenu. */}
                {/* ══ LES DEUX CHEMINS ══
                    Ni filtre à remplir, ni case à cocher : deux façons distinctes d'aborder
                    la semaine, jamais confondues dans un seul parcours.
                    — « Intention » : je choisis d'aborder un sujet précis, comme on accepte
                      un défi — le moteur existant (conditions, niveau) reste, seule sa
                      présentation change : un choix à faire, pas un formulaire à remplir.
                    — « Découvrir » : le catalogue entier, en cartes qu'on swipe façon
                      /formation — la matière (accroche, forme, idée reçue) directement
                      visible, « garder » comme seul geste, jamais de préparation forcée. */}
                {!vueCopun && !aideConditionsOuverte && (
                    <>
                        <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-black/5">
                            <button
                                onClick={() => setModeDecouverte(true)}
                                className={clsx(
                                    'py-2.5 rounded-xl text-[12.5px] font-black transition-all',
                                    modeDecouverte ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500',
                                )}
                            >
                                Découvrir
                            </button>
                            <button
                                onClick={() => setModeDecouverte(false)}
                                className={clsx(
                                    'py-2.5 rounded-xl text-[12.5px] font-black transition-all',
                                    !modeDecouverte ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500',
                                )}
                            >
                                Ton intention
                            </button>
                        </div>

                        {modeDecouverte ? (
                            <FluxDecouverte
                                pool={pool}
                                retenues={retenues}
                                onToggleFiche={toggleFiche}
                                onFicheInfo={setFicheDetail}
                                historique={historique}
                                initialTheme={initialTheme}
                                initialGroup={initialGroup}
                            />
                        ) : (
                            <button
                                onClick={() => setAideConditionsOuverte(true)}
                                className="w-full flex items-center gap-3 px-4 py-4 rounded-[1.25rem] bg-slate-900 text-left shadow-[var(--shadow-lift)] active:scale-[0.99] transition-all"
                            >
                                <span className="size-11 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-[22px] text-cyan-300">tsunami</span>
                                </span>
                                <span className="flex-1 min-w-0">
                                    <span className="block text-[14px] font-black text-white leading-snug">
                                        Qu&apos;as-tu envie de faire vivre au groupe&nbsp;?
                                    </span>
                                    <span className="block text-[11.5px] text-white/50 mt-0.5">
                                        Le terrain t&apos;aide à trouver une porte d&apos;entrée
                                    </span>
                                </span>
                                <span className="material-symbols-outlined text-white/30 shrink-0">chevron_right</span>
                            </button>
                        )}
                    </>
                )}

                {!aideConditionsOuverte && retenues.length > 0 ? (
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
                <div className="above-nav fixed left-0 right-0 z-40 px-4 pt-10 pb-4 bg-linear-to-t from-[#e9eef7] via-[#e9eef7]/95 to-transparent pointer-events-none">
                    <div className="max-w-2xl mx-auto flex items-center gap-3 pointer-events-auto">
                        <button
                            onClick={() => setVoirSelection(true)}
                            disabled={retenues.length === 0}
                            className="flex-1 min-w-0 h-14 px-4 rounded-2xl bg-white shadow-[var(--shadow-lift)] flex items-center gap-2 active:scale-[0.98] transition disabled:opacity-60"
                        >
                            {/* « 1 / 5 retenue » se lisait comme un quota de sujets, en
                                contradiction avec la règle des trois annoncée en haut d'écran.
                                Ce sont des questions, et le plafond n'a d'intérêt qu'une fois
                                approché. */}
                            <span className="text-base font-black text-slate-900">{retenues.length}</span>
                            <span className="text-xs font-bold text-slate-400">
                                question{retenues.length > 1 ? 's' : ''} retenue{retenues.length > 1 ? 's' : ''}
                                {retenues.length >= MAX_OBJECTIFS - 1 && ` · ${MAX_OBJECTIFS} max`}
                            </span>
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
                                className="h-14 px-7 rounded-2xl bg-linear-to-br from-indigo-500 to-indigo-700 text-white text-xs font-black tracking-[0.15em] uppercase shadow-[var(--shadow-glow-indigo)] active:scale-95 transition-all flex items-center gap-2"
                            >
                                Préparer
                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </Link>
                        ) : (
                            <button
                                onClick={enregistrer}
                                disabled={saving}
                                className="h-14 px-8 rounded-2xl bg-slate-900 disabled:bg-slate-300 text-white text-xs font-black tracking-[0.15em] uppercase shadow-[var(--shadow-lift)] active:scale-95 transition-all flex items-center gap-2"
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

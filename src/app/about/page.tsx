import Image from 'next/image';
import Link from 'next/link';

const dimensions = [
    {
        key: 'COMPRENDRE',
        iconBg: 'bg-sky-100',
        iconText: 'text-sky-500',
        keyText: 'text-sky-600',
        icon: 'psychology',
        tagline: 'Les mécanismes du vivant',
        description: "Pourquoi y a-t-il des marées ? Comment se forment les dunes ? Qu'est-ce que l'estran ? Comprendre, c'est donner du sens à ce qu'on voit.",
        example: '"Pourquoi la marée remonte-t-elle plus vite à mi-chemin ?" → La règle des douzièmes.',
    },
    {
        key: 'OBSERVER',
        iconBg: 'bg-emerald-100',
        iconText: 'text-emerald-500',
        keyText: 'text-emerald-600',
        icon: 'visibility',
        tagline: 'Développer un regard',
        description: "Repérer la direction du vent, identifier des traces de prédation, lire la laisse de mer. Observer, c'est apprendre à regarder avant d'agir.",
        example: '"Qu\'est-ce que cette bande colorée sur le sable ?" → La laisse du jour, mémoire de la marée.',
    },
    {
        key: 'PROTÉGER',
        iconBg: 'bg-amber-100',
        iconText: 'text-amber-500',
        keyText: 'text-amber-600',
        icon: 'shield',
        tagline: 'Agir en sentinelle',
        description: "Respecter les zones sensibles, gérer les déchets, limiter le dérangement de la faune. Protéger, c'est passer de la connaissance à la responsabilité.",
        example: '"Comment nettoyer une plage sans nuire ?" → Ramasser les déchets humains, laisser les algues.',
    },
];

const defisExemples = [
    { icon: 'grid_view', label: 'Inventaire du m²', type: 'Fil rouge', desc: "Même carré d'estran à chaque semaine — suivi biodiversité longitudinal." },
    { icon: 'water', label: 'Laisse du jour', type: 'Fil rouge', desc: 'Catégorisation plastique / déchets / naturel sur 10 m.' },
    { icon: 'photo_camera', label: 'Espèce invasive', type: 'Aventure', desc: 'Trouver crépidule, spartine ou crabe vert sur le terrain.' },
    { icon: 'quiz', label: 'Dilemme du marin', type: 'Confiance', desc: "Débat collectif sur un choix éthique lié à l'environnement." },
];

const etapes = [
    { num: '01', title: 'Les Objectifs', icon: 'track_changes', border: 'border-sky-300', iconBg: 'bg-sky-100', iconText: 'text-sky-500', desc: 'Construire le réservoir de fiches pédagogiques adapté au groupe et à la semaine.' },
    { num: '02', title: 'Le Planning', icon: 'flag', border: 'border-amber-300', iconBg: 'bg-amber-100', iconText: 'text-amber-500', desc: 'Organiser les séances, lier les fiches aux moments clés de la journée.' },
    { num: '03', title: 'Les Défis', icon: 'eco', border: 'border-emerald-300', iconBg: 'bg-emerald-100', iconText: 'text-emerald-500', desc: 'Assigner des challenges terrain — observation, action, sciences participatives.' },
    { num: '04', title: 'Le Quiz', icon: 'quiz', border: 'border-violet-400', iconBg: 'bg-violet-100', iconText: 'text-violet-500', desc: 'Bilan de transmission : valider ce que le groupe a retenu, débloquer les points.' },
];

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50">

            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200 px-6 py-4 flex items-center gap-4">
                <Link href="/stages" className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 active:scale-95 transition-transform">
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <div>
                    <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">La méthode</p>
                    <p className="text-lg font-bold leading-none text-slate-900">Guide COPUN</p>
                </div>
            </header>

            <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 space-y-16 pb-36">

                {/* Hero */}
                <section className="bg-[#1f2249] text-white rounded-[1.5rem] p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <span className="material-symbols-outlined text-[10rem]">sailing</span>
                    </div>
                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-4 mb-2">
                            <Image src="/logo.jpg" alt="COP'UN logo" width={72} height={72} className="rounded-full shrink-0 shadow-lg" />
                            <span className="inline-block bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-500/30">
                                Pour un littoral vivant et protégé
                            </span>
                        </div>
                        <h1 className="text-4xl font-black leading-tight">
                            Comprendre.<br />Observer.<br />Protéger.<br />Ne faire qu&apos;UN.
                        </h1>
                        <p className="text-slate-300 text-base leading-relaxed max-w-sm">
                            COP&apos;UN est un outil pédagogique pour les moniteurs nautiques. Il structure l&apos;intégration de l&apos;environnement marin dans chaque séance — de la préparation du stage à l&apos;animation sur le terrain.
                        </p>
                    </div>
                </section>

                {/* Les 3 dimensions */}
                <section className="space-y-6">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">La méthode</p>
                        <h2 className="text-2xl font-black text-slate-900">Le cercle vertueux des apprentissages sens marin – environnement</h2>
                        <p className="text-sm text-slate-500 mt-1">On ne protège que ce qu&apos;on comprend. On n&apos;observe bien que ce qu&apos;on connaît.</p>
                        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                            <strong className="text-slate-700">COP&apos;UN</strong> — <span className="italic">Comprendre, Observer, Protéger, et ne faire qu&apos;UN</span> — pour être en harmonie avec l&apos;environnement.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {dimensions.map((d, i) => (
                            <div key={d.key} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                                <div className="flex items-start gap-4">
                                    <div className={`size-11 rounded-xl flex items-center justify-center shrink-0 ${d.iconBg} ${d.iconText}`}>
                                        <span className="material-symbols-outlined">{d.icon}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{i + 1} / 3</span>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${d.keyText}`}>{d.key}</span>
                                        </div>
                                        <p className="font-bold text-slate-900 mb-2">{d.tagline}</p>
                                        <p className="text-sm text-slate-600 leading-relaxed mb-3">{d.description}</p>
                                        <div className="bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-100">
                                            <p className="text-xs text-slate-500 italic leading-relaxed">{d.example}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Workflow moniteur */}
                <section className="space-y-6">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Comment ça marche</p>
                        <h2 className="text-2xl font-black text-slate-900">4 étapes, une semaine complète</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {etapes.map((e) => (
                            <div key={e.num} className={`bg-white rounded-2xl p-4 shadow-sm border-b-4 ${e.border}`}>
                                <div className={`size-9 rounded-lg ${e.iconBg} ${e.iconText} flex items-center justify-center mb-3`}>
                                    <span className="material-symbols-outlined text-lg">{e.icon}</span>
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Étape {e.num}</p>
                                <p className="font-bold text-slate-900 text-sm mb-1">{e.title}</p>
                                <p className="text-xs text-slate-500 leading-relaxed">{e.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Défis terrain */}
                <section className="space-y-6">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sur le terrain</p>
                        <h2 className="text-2xl font-black text-slate-900">Des défis, pas des exercices</h2>
                        <p className="text-sm text-slate-500 mt-1">Chaque défi laisse une trace : photo de preuve, observation consignée, données réutilisables par les chercheurs.</p>
                    </div>

                    <div className="space-y-3">
                        {defisExemples.map((d) => (
                            <div key={d.label} className="bg-white rounded-2xl px-4 py-3.5 shadow-sm flex items-center gap-4">
                                <div className="size-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-slate-500">{d.icon}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <p className="font-bold text-slate-900 text-sm">{d.label}</p>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-full">{d.type}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed">{d.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Sciences participatives */}
                <section className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 space-y-3">
                    <div className="size-11 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <span className="material-symbols-outlined">biotech</span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900">Chaque observation compte</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        Les données collectées par les clubs — inventaires d&apos;estran, suivis de laisse, observations de faune — s&apos;accumulent stage après stage. Elles rejoignent les bases de sciences participatives et deviennent utiles aux chercheurs qui étudient le littoral normand.
                    </p>
                    <p className="text-xs text-emerald-700 font-semibold">
                        Normandie : 94 sites Natura 2000 · 24 espèces de mammifères marins observées · Escale migratoire majeure
                    </p>
                </section>

                {/* Stats du contenu */}
                <section className="space-y-4">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Le contenu</p>
                        <h2 className="text-2xl font-black text-slate-900">Une base solide</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { val: '128+', label: 'fiches pédagogiques', icon: 'menu_book' },
                            { val: '500+', label: 'cartes de jeu', icon: 'style' },
                            { val: '10', label: 'défis terrain', icon: 'eco' },
                            { val: '3', label: "niveaux d'apprentissage", icon: 'school' },
                        ].map((s) => (
                            <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm text-center">
                                <span className="material-symbols-outlined text-slate-300 text-2xl mb-1 block">{s.icon}</span>
                                <p className="text-3xl font-black text-slate-900">{s.val}</p>
                                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-0.5">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="bg-[#1f2249] rounded-2xl p-6 text-white text-center space-y-4">
                    <p className="text-sm text-slate-300">Prêt à préparer votre prochaine semaine ?</p>
                    <Link href="/stages" className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 active:scale-95 transition-all font-bold px-6 py-3 rounded-2xl text-sm">
                        <span className="material-symbols-outlined text-lg">sailing</span>
                        Mes semaines
                    </Link>
                </section>

            </main>
        </div>
    );
}

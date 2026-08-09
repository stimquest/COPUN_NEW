'use client';

import { useState, useMemo } from 'react';
import { PedagogicalContent } from '@/types';
import { PILLARS, THEMES_BY_PILLAR } from '@/data/etages';
import { EtapeLayout, Reponse, BoutonContinuer } from '@/components/parcours/Etape';

const NIVEAUX = [
    { id: '1', label: 'Ils découvrent', detail: 'Première approche — on observe, on s’étonne', icon: 'visibility' },
    { id: '2', label: 'Ils commencent à connaître', detail: 'On approfondit, on relie aux gestes', icon: 'psychology' },
    { id: '3', label: 'Ils sont déjà sensibilisés', detail: 'On va vers l’engagement', icon: 'volunteer_activism' },
];

export default function DemoParcoursClient({ pool }: { pool: PedagogicalContent[] }) {
    const [etape, setEtape] = useState(1);
    const [theme, setTheme] = useState<string | null>(null);
    const [niveau, setNiveau] = useState<string | null>(null);
    const [retenues, setRetenues] = useState<string[]>([]);

    const themes = useMemo(
        () => PILLARS.flatMap(p => THEMES_BY_PILLAR[p.id].map(t => ({ ...t, pilier: p.label }))),
        [],
    );

    const fiches = useMemo(() => {
        if (!theme || !niveau) return [];
        return pool.filter(c => {
            if (String(c.niveau) !== niveau) return false;
            const ts = (Array.isArray(c.tags_theme) ? c.tags_theme : []).map(t => String(t).toLowerCase().trim());
            return ts.includes(theme.toLowerCase());
        });
    }, [pool, theme, niveau]);

    if (etape === 1) {
        return (
            <EtapeLayout
                etape={1}
                total={3}
                question="De quoi veux-tu leur parler ?"
                intro="Choisis le thème que tu veux aborder cette semaine."
            >
                {themes.map(t => (
                    <Reponse
                        key={t.id}
                        label={t.label}
                        detail={t.pilier}
                        icon={t.icon}
                        actif={theme === t.id}
                        onClick={() => { setTheme(t.id); setEtape(2); }}
                    />
                ))}
            </EtapeLayout>
        );
    }

    if (etape === 2) {
        return (
            <EtapeLayout
                etape={2}
                total={3}
                onRetour={() => setEtape(1)}
                question="Où en sont tes stagiaires ?"
                intro="Cela ajuste la profondeur du contenu proposé."
            >
                {NIVEAUX.map(n => (
                    <Reponse
                        key={n.id}
                        label={n.label}
                        detail={n.detail}
                        icon={n.icon}
                        actif={niveau === n.id}
                        onClick={() => { setNiveau(n.id); setEtape(3); }}
                    />
                ))}
            </EtapeLayout>
        );
    }

    return (
        <EtapeLayout
            etape={3}
            total={3}
            onRetour={() => setEtape(2)}
            question={fiches.length ? 'Qu’est-ce que tu retiens ?' : 'Rien sur ce croisement'}
            intro={
                fiches.length
                    ? `${fiches.length} question${fiches.length > 1 ? 's' : ''} disponible${fiches.length > 1 ? 's' : ''}. Deux ou trois suffisent pour une semaine.`
                    : 'Reviens en arrière pour choisir un autre thème ou un autre niveau.'
            }
            action={
                retenues.length > 0 ? (
                    <BoutonContinuer
                        label={`Continuer avec ${retenues.length} question${retenues.length > 1 ? 's' : ''}`}
                        onClick={() => alert('→ étape suivante : fabrication du sujet')}
                        note="Tu pourras encore les modifier ensuite"
                    />
                ) : undefined
            }
        >
            {fiches.map(f => (
                <Reponse
                    key={f.id}
                    label={f.question}
                    detail={f.accroche ? 'Prêt à transmettre' : undefined}
                    actif={retenues.includes(f.id)}
                    onClick={() =>
                        setRetenues(p => (p.includes(f.id) ? p.filter(x => x !== f.id) : [...p, f.id]))
                    }
                />
            ))}
        </EtapeLayout>
    );
}

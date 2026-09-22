'use client';
import { useEffect, useState } from 'react';
import { getAllPedagogicalContent } from '@/actions/content-actions';
import { getAllFichesMemo } from '@/actions/fiche-memo-actions';
import { FichesAdminTab } from './FichesAdminTab';

export default function FichesAdminLoader() {
    const [data, setData] = useState<Awaited<ReturnType<typeof load>> | null>(null);
    const [error, setError] = useState(false);
    useEffect(() => {
        let active = true;
        load().then(value => { if (active) setData(value); }).catch(() => { if (active) setError(true); });
        return () => { active = false; };
    }, []);
    if (error) return <p role="alert" className="p-6">Chargement impossible. Fermez puis rouvrez cet onglet pour réessayer.</p>;
    if (!data) return <p className="p-6">Chargement des fiches…</p>;
    return <FichesAdminTab initialFiches={data[0]} fichesMemo={data[1]} />;
}
function load() { return Promise.all([getAllPedagogicalContent(), getAllFichesMemo('publie')]); }

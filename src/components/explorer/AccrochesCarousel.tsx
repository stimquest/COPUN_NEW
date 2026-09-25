'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { PedagogicalContent } from '@/types';
import { formulationsFiche } from '@/data/formulations-fiche';
import { FORMES_ACCROCHE } from '@/data/formes-accroche';
import styles from './AccrochesCarousel.module.css';

import { iconeMaterial } from '@/components/ui/Icone';
const ChevronLeft = iconeMaterial('chevron_left');
const ChevronRight = iconeMaterial('chevron_right');

export default function AccrochesCarousel({ fiche, value, onChange }: { fiche: PedagogicalContent; value?: string; onChange?: (value: string) => void }) {
    const propositions = formulationsFiche(fiche);
    const [position, setPosition] = useState(0);
    const reduceMotion = useReducedMotion();
    const selected = propositions.findIndex(proposition => proposition.texte === value);
    const active = selected >= 0 ? selected : position % propositions.length;
    const canNavigate = propositions.length > 1;
    const current = propositions[active];
    const forme = 'forme' in current ? FORMES_ACCROCHE.find(item => item.id === current.forme)?.nom : undefined;
    const move = (offset: number) => {
        const next = (active + offset + propositions.length) % propositions.length;
        setPosition(next);
        onChange?.(propositions[next].texte);
    };

    return <section aria-label="Façons d’ouvrir le sujet">
        <div className={styles.heading}>
            <div className={styles.caption}>
                <span>J’ouvre avec</span>
                {forme && <span className={styles.forme}>{forme}</span>}
            </div>
            <div className={styles.controls}
                onPointerDown={event => event.stopPropagation()}
                onKeyDown={event => {
                    if (canNavigate && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
                        event.preventDefault();
                        event.stopPropagation();
                        move(event.key === 'ArrowRight' ? 1 : -1);
                    }
                }}>
                <button type="button" disabled={!canNavigate} className={styles.control} aria-label="Proposition précédente" title={canNavigate ? 'Proposition précédente' : 'Une seule proposition disponible'} onClick={() => move(-1)}>
                    <ChevronLeft size={21} strokeWidth={2} aria-hidden />
                </button>
                <button type="button" disabled={!canNavigate} className={styles.control} aria-label="Proposition suivante" title={canNavigate ? 'Proposition suivante' : 'Une seule proposition disponible'} onClick={() => move(1)}>
                    <ChevronRight size={21} strokeWidth={2} aria-hidden />
                </button>
                {!canNavigate && <span className={styles.srOnly}>Une seule proposition disponible.</span>}
            </div>
        </div>
        {/* Une cellule partagée réserve seulement la hauteur du texte le plus long :
            pas de saut de lecture, de hauteur arbitraire ou de contenu tronqué. */}
        <div className={styles.propositions} aria-live="polite" aria-atomic="true">
            {propositions.map((proposition, index) => <motion.blockquote
                key={index}
                className={styles.quote}
                aria-hidden={index !== active}
                inert={index !== active}
                style={{ pointerEvents: index === active ? 'auto' : 'none' }}
                initial={false}
                animate={{ opacity: index === active ? 1 : 0, y: reduceMotion || index === active ? 0 : 4 }}
                transition={{ duration: reduceMotion ? 0 : 0.18, ease: 'easeOut' }}>
                <span className={styles.srOnly}>{forme ? forme + '. ' : ''}Proposition {active + 1} sur {propositions.length}. </span>
                « {proposition.texte} »
            </motion.blockquote>)}
        </div>
    </section>;
}

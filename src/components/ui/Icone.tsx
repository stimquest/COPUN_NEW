import type { CSSProperties } from 'react';

/**
 * Jeu d'icônes unique de l'app : Material Symbols Outlined (voir src/styles/CHARTE.md).
 *
 * `iconeMaterial('arrow_forward')` fabrique un composant qui accepte les mêmes props que
 * les anciennes icônes Lucide (`size`, `strokeWidth`, `className`) : les écrans et les
 * données qui passaient un composant d'icône continuent de fonctionner tels quels.
 */
export type IconeProps = { size?: number; strokeWidth?: number; className?: string; style?: CSSProperties };
export type IconeComposant = (props: IconeProps) => React.JSX.Element;

/** Le trait Lucide (1 à 3) traduit en graisse Material ; 300 par défaut, trait fin. */
function graisse(strokeWidth?: number) {
    if (!strokeWidth) return 300;
    return strokeWidth >= 2.5 ? 500 : strokeWidth >= 2 ? 400 : 300;
}

export function iconeMaterial(nom: string): IconeComposant {
    function Icone({ size = 24, strokeWidth, className, style }: IconeProps) {
        return <span aria-hidden className={['material-symbols-outlined', className].filter(Boolean).join(' ')}
            style={{ fontSize: size, fontVariationSettings: `'FILL' 0, 'wght' ${graisse(strokeWidth)}, 'GRAD' 0, 'opsz' 24`, ...style }}>
            {nom}
        </span>;
    }
    Icone.displayName = `Icone(${nom})`;
    return Icone;
}

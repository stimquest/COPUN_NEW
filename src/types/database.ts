import type { Database as Generated } from './database.generated';

// PostgreSQL function arguments accept NULL; the generator currently omits it.
type Functions = Generated['public']['Functions'];
type NullableArgs<T> = T extends { Args: infer A; Returns: infer R }
    ? { Args: { [K in keyof A]: A[K] | null }; Returns: R } : T;
export type Database = Omit<Generated, 'public'> & {
    public: Omit<Generated['public'], 'Functions'> & {
        Functions: { [K in keyof Functions]: NullableArgs<Functions[K]> }
    }
};

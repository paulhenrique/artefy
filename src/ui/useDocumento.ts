import { useSyncExternalStore } from 'react';
import { assinar, obter } from '../nucleo/estado';
import type { Documento } from '../nucleo/tipos';

/** Assina o store do núcleo. Nenhum componente lê localStorage direto. */
export function useDocumento(): Documento {
  return useSyncExternalStore(assinar, obter, obter);
}

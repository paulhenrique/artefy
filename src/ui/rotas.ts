import { useEffect, useState } from 'react';

/**
 * Roteamento por hash. GitHub Pages não tem fallback de SPA, então rota em path daria
 * 404 ao recarregar; com hash, funciona em qualquer host estático.
 */

export type Rota =
  | { nome: 'eventos' }
  | { nome: 'evento-novo' }
  | { nome: 'evento'; id: string }
  | { nome: 'evento-editar'; id: string }
  | { nome: 'gerador'; eventoId: string; tipoId: string; de?: string }
  | { nome: 'geracao'; id: string }
  | { nome: 'comunidade' }
  | { nome: 'padroes' }
  | { nome: 'dados' };

export function analisarHash(hash: string): Rota {
  const [caminhoBruto = '', consultaBruta = ''] = hash.replace(/^#\/?/, '').split('?');
  const consulta = new URLSearchParams(consultaBruta);
  const partes = caminhoBruto.split('/').filter(Boolean).map(decodeURIComponent);

  if (partes[0] === 'comunidade') return { nome: 'comunidade' };
  if (partes[0] === 'padroes') return { nome: 'padroes' };
  if (partes[0] === 'dados') return { nome: 'dados' };
  if (partes[0] === 'geracao' && partes[1]) return { nome: 'geracao', id: partes[1] };

  if (partes[0] === 'evento') {
    if (partes[1] === 'novo') return { nome: 'evento-novo' };
    if (partes[1] && partes[2] === 'editar') return { nome: 'evento-editar', id: partes[1] };
    if (partes[1] && partes[2] === 'arte' && partes[3]) {
      const rota: Rota = { nome: 'gerador', eventoId: partes[1], tipoId: partes[3] };
      const de = consulta.get('de');
      return de ? { ...rota, de } : rota;
    }
    if (partes[1]) return { nome: 'evento', id: partes[1] };
  }

  return { nome: 'eventos' };
}

export function caminho(rota: Rota): string {
  switch (rota.nome) {
    case 'evento-novo':
      return '#/evento/novo';
    case 'evento':
      return `#/evento/${encodeURIComponent(rota.id)}`;
    case 'evento-editar':
      return `#/evento/${encodeURIComponent(rota.id)}/editar`;
    case 'gerador': {
      const base = `#/evento/${encodeURIComponent(rota.eventoId)}/arte/${encodeURIComponent(rota.tipoId)}`;
      return rota.de ? `${base}?de=${encodeURIComponent(rota.de)}` : base;
    }
    case 'geracao':
      return `#/geracao/${encodeURIComponent(rota.id)}`;
    case 'comunidade':
      return '#/comunidade';
    case 'padroes':
      return '#/padroes';
    case 'dados':
      return '#/dados';
    default:
      return '#/';
  }
}

export function irPara(rota: Rota): void {
  globalThis.location.hash = caminho(rota);
}

export function useRota(): Rota {
  const [rota, definirRota] = useState(() => analisarHash(globalThis.location?.hash ?? ''));

  useEffect(() => {
    const aoMudar = (): void => {
      definirRota(analisarHash(globalThis.location.hash));
      globalThis.scrollTo({ top: 0 });
    };
    globalThis.addEventListener('hashchange', aoMudar);
    return () => globalThis.removeEventListener('hashchange', aoMudar);
  }, []);

  return rota;
}

import { carregar, novoId, salvar } from './armazenamento';
import { templatePadrao } from './catalogo';
import type { Comunidade, Documento, Evento, Geracao } from './tipos';

/**
 * Store minúsculo em cima do armazenamento. A UI assina por `useSyncExternalStore`;
 * toda mutação persiste na hora, porque a app é usada no celular e perder rascunho
 * ao trocar de aba é inaceitável.
 */

let documento: Documento = carregar();
const ouvintes = new Set<() => void>();

export function assinar(ouvinte: () => void): () => void {
  ouvintes.add(ouvinte);
  return () => ouvintes.delete(ouvinte);
}

export function obter(): Documento {
  return documento;
}

function mutar(recipe: (atual: Documento) => Documento): void {
  documento = salvar(recipe(documento));
  for (const ouvinte of ouvintes) ouvinte();
}

/** Só para testes: devolve o store a um estado conhecido. */
export function substituirDocumento(novo: Documento): void {
  mutar(() => novo);
}

export function salvarComunidade(comunidade: Comunidade): void {
  mutar((atual) => ({ ...atual, comunidade }));
}

export type RascunhoDeEvento = Omit<Evento, 'id' | 'criadoEm' | 'atualizadoEm'>;

export function criarEvento(rascunho: RascunhoDeEvento): Evento {
  const agora = new Date().toISOString();
  const evento: Evento = { ...rascunho, id: novoId(), criadoEm: agora, atualizadoEm: agora };
  mutar((atual) => ({ ...atual, eventos: [evento, ...atual.eventos] }));
  return evento;
}

export function atualizarEvento(id: string, rascunho: RascunhoDeEvento): void {
  mutar((atual) => ({
    ...atual,
    eventos: atual.eventos.map((evento) =>
      evento.id === id ? { ...evento, ...rascunho, atualizadoEm: new Date().toISOString() } : evento,
    ),
  }));
}

/** Remove o evento e, junto, as gerações órfãs que ficariam apontando para o nada. */
export function removerEvento(id: string): void {
  mutar((atual) => ({
    ...atual,
    eventos: atual.eventos.filter((evento) => evento.id !== id),
    geracoes: atual.geracoes.filter((geracao) => geracao.eventoId !== id),
  }));
}

export type RascunhoDeGeracao = Omit<Geracao, 'id' | 'criadoEm'>;

export function salvarGeracao(rascunho: RascunhoDeGeracao): Geracao {
  const geracao: Geracao = { ...rascunho, id: novoId(), criadoEm: new Date().toISOString() };
  mutar((atual) => ({ ...atual, geracoes: [geracao, ...atual.geracoes] }));
  return geracao;
}

export function removerGeracao(id: string): void {
  mutar((atual) => ({ ...atual, geracoes: atual.geracoes.filter((g) => g.id !== id) }));
}

export function salvarOverrideDeTemplate(caminho: string, markdown: string): void {
  mutar((atual) => ({
    ...atual,
    overridesDeTemplate: { ...atual.overridesDeTemplate, [caminho]: markdown },
  }));
}

export function limparOverrideDeTemplate(caminho: string): void {
  mutar((atual) => {
    const overrides = { ...atual.overridesDeTemplate };
    delete overrides[caminho];
    return { ...atual, overridesDeTemplate: overrides };
  });
}

export function substituirTudo(novo: Documento): void {
  mutar(() => novo);
}

/** O texto que vale para um template: override local se houver, senão o do repositório. */
export function templateResolvido(doc: Documento, caminho: string): string {
  return doc.overridesDeTemplate[caminho] ?? templatePadrao(caminho);
}

export function temOverride(doc: Documento, caminho: string): boolean {
  return caminho in doc.overridesDeTemplate;
}

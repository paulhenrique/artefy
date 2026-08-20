import type { Comunidade, Documento, Evento, Geracao } from './tipos';
import { VERSAO_DO_SCHEMA } from './tipos';

/**
 * Único ponto do projeto que fala com o localStorage (docs/MODELO-DE-DADOS.md).
 * Nenhum componente lê ou escreve a chave direto.
 */

export const CHAVE = 'artefy:v1';
export const CHAVE_BACKUP = 'artefy:v1:backup';

export function documentoPadrao(agora = new Date()): Documento {
  return {
    schemaVersion: VERSAO_DO_SCHEMA,
    comunidade: { nome: '' },
    eventos: [],
    geracoes: [],
    overridesDeTemplate: {},
    atualizadoEm: agora.toISOString(),
  };
}

function armazem(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    // Navegador com armazenamento bloqueado. A app funciona, só não persiste.
    return null;
  }
}

function texto(valor: unknown): string | undefined {
  return typeof valor === 'string' && valor.trim() !== '' ? valor : undefined;
}

function opcional(alvo: Record<string, unknown>, chave: string, valor: unknown): void {
  const limpo = texto(valor);
  if (limpo !== undefined) alvo[chave] = limpo;
}

function normalizarEvento(bruto: unknown): Evento | null {
  if (!bruto || typeof bruto !== 'object') return null;
  const cru = bruto as Record<string, unknown>;
  const nome = texto(cru.nome);
  const data = texto(cru.data);
  if (!nome || !data) return null;

  const formato = cru.formato;
  const agora = new Date().toISOString();
  const evento: Record<string, unknown> = {
    id: texto(cru.id) ?? novoId(),
    nome,
    data,
    formato:
      formato === 'presencial' || formato === 'online' || formato === 'hibrido'
        ? formato
        : 'presencial',
    criadoEm: texto(cru.criadoEm) ?? agora,
    atualizadoEm: texto(cru.atualizadoEm) ?? agora,
  };
  for (const chave of ['edicao', 'horario', 'local', 'cidade', 'linkInscricao', 'hashtag', 'observacoes']) {
    opcional(evento, chave, cru[chave]);
  }
  return evento as Evento;
}

function normalizarGeracao(bruto: unknown): Geracao | null {
  if (!bruto || typeof bruto !== 'object') return null;
  const cru = bruto as Record<string, unknown>;
  const eventoId = texto(cru.eventoId);
  const tipoDeArteId = texto(cru.tipoDeArteId);
  const prompt = texto(cru.prompt);
  if (!eventoId || !tipoDeArteId || !prompt) return null;

  const valores: Record<string, string> = {};
  if (cru.valores && typeof cru.valores === 'object') {
    for (const [chave, valor] of Object.entries(cru.valores as Record<string, unknown>)) {
      if (typeof valor === 'string') valores[chave] = valor;
    }
  }
  return {
    id: texto(cru.id) ?? novoId(),
    eventoId,
    tipoDeArteId,
    rotulo: texto(cru.rotulo) ?? 'Geração',
    valores,
    prompt,
    criadoEm: texto(cru.criadoEm) ?? new Date().toISOString(),
  };
}

function normalizarComunidade(bruto: unknown): Comunidade {
  if (!bruto || typeof bruto !== 'object') return { nome: '' };
  const cru = bruto as Record<string, unknown>;
  const comunidade: Record<string, unknown> = { nome: texto(cru.nome) ?? '' };
  for (const chave of ['handle', 'descricao', 'identidadeVisual']) {
    opcional(comunidade, chave, cru[chave]);
  }
  return comunidade as Comunidade;
}

/**
 * Sobe qualquer documento salvo até a versão atual. Toda versão anterior precisa ter um
 * caminho aqui — nunca descartamos dado sem tentar converter antes.
 */
export function migrar(bruto: unknown): Documento {
  if (!bruto || typeof bruto !== 'object') return documentoPadrao();
  const cru = bruto as Record<string, unknown>;

  const overrides: Record<string, string> = {};
  if (cru.overridesDeTemplate && typeof cru.overridesDeTemplate === 'object') {
    for (const [chave, valor] of Object.entries(cru.overridesDeTemplate as Record<string, unknown>)) {
      if (typeof valor === 'string') overrides[chave] = valor;
    }
  }

  return {
    schemaVersion: VERSAO_DO_SCHEMA,
    comunidade: normalizarComunidade(cru.comunidade),
    eventos: Array.isArray(cru.eventos)
      ? cru.eventos.map(normalizarEvento).filter((e): e is Evento => e !== null)
      : [],
    geracoes: Array.isArray(cru.geracoes)
      ? cru.geracoes.map(normalizarGeracao).filter((g): g is Geracao => g !== null)
      : [],
    overridesDeTemplate: overrides,
    atualizadoEm: texto(cru.atualizadoEm) ?? new Date().toISOString(),
  };
}

function guardarBackup(local: Storage, bruto: string): void {
  try {
    local.setItem(CHAVE_BACKUP, bruto);
  } catch {
    /* cota cheia; seguir mesmo assim */
  }
}

function quantidade(valor: unknown): number {
  return Array.isArray(valor) ? valor.length : 0;
}

export function carregar(): Documento {
  const local = armazem();
  if (!local) return documentoPadrao();

  const bruto = local.getItem(CHAVE);
  if (bruto === null) return documentoPadrao();

  let analisado: unknown;
  try {
    analisado = JSON.parse(bruto);
  } catch {
    // Documento ilegível: guarda o original antes de partir do zero, para não perder nada.
    guardarBackup(local, bruto);
    return documentoPadrao();
  }

  const documento = migrar(analisado);

  // JSON válido mas de forma errada também é documento corrompido: a migração descarta o
  // que não dá para converter, então o bruto precisa ficar guardado do mesmo jeito.
  const cru = (analisado ?? {}) as Record<string, unknown>;
  const perdeu =
    quantidade(cru.eventos) > documento.eventos.length ||
    quantidade(cru.geracoes) > documento.geracoes.length;
  if (perdeu) guardarBackup(local, bruto);

  return documento;
}

export function salvar(documento: Documento): Documento {
  const atualizado: Documento = { ...documento, atualizadoEm: new Date().toISOString() };
  const local = armazem();
  if (local) {
    try {
      local.setItem(CHAVE, JSON.stringify(atualizado));
    } catch {
      /* modo privativo ou cota cheia: a sessão segue em memória */
    }
  }
  return atualizado;
}

export function novoId(): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function exportar(documento: Documento): string {
  return JSON.stringify(documento, null, 2);
}

export type ResultadoDeImportacao =
  | { ok: true; documento: Documento }
  | { ok: false; erro: string };

export function importar(bruto: string): ResultadoDeImportacao {
  let analisado: unknown;
  try {
    analisado = JSON.parse(bruto);
  } catch {
    return { ok: false, erro: 'O arquivo não é um JSON válido.' };
  }
  if (!analisado || typeof analisado !== 'object' || Array.isArray(analisado)) {
    return { ok: false, erro: 'O JSON não tem o formato de um backup do artefy.' };
  }
  const cru = analisado as Record<string, unknown>;
  if (!('eventos' in cru) && !('comunidade' in cru)) {
    return { ok: false, erro: 'O JSON não parece um backup do artefy (sem eventos nem comunidade).' };
  }
  return { ok: true, documento: migrar(cru) };
}

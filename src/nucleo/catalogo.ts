import yaml from 'js-yaml';
import type { ErroDeTemplate, Slot, TipoDeArte, TipoDeSlot } from './tipos';

/**
 * Carrega os templates versionados em `templates/`. Eles entram no bundle em tempo de
 * build (nada de rede no caminho principal) e continuam sendo arquivos markdown normais,
 * editáveis por commit. Ver docs/PRD.md seção 8.
 */

const TIPOS_DE_SLOT: readonly TipoDeSlot[] = ['texto', 'textoLongo', 'numero', 'data', 'selecao'];

const brutosDeArte = import.meta.glob('/templates/artes/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const brutosDeCamada = import.meta.glob('/templates/{comunidade,evento}.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export const CAMINHO_COMUNIDADE = '/templates/comunidade.md';
export const CAMINHO_EVENTO = '/templates/evento.md';

export function templatePadrao(caminho: string): string {
  const bruto = brutosDeCamada[caminho] ?? brutosDeArte[caminho];
  if (bruto === undefined) throw new Error(`template não encontrado: ${caminho}`);
  return caminho.startsWith('/templates/artes/') ? separarFrontMatter(bruto).corpo : bruto;
}

type FrontMatter = { dados: Record<string, unknown> | null; corpo: string };

export function separarFrontMatter(bruto: string): FrontMatter {
  const texto = bruto.replace(/^﻿/, '');
  const achado = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(texto);
  if (!achado || achado[1] === undefined) return { dados: null, corpo: texto.trim() };
  const dados = yaml.load(achado[1]);
  return {
    dados: dados && typeof dados === 'object' ? (dados as Record<string, unknown>) : null,
    corpo: texto.slice(achado[0].length).trim(),
  };
}

function texto(valor: unknown): string | undefined {
  return typeof valor === 'string' && valor.trim() !== '' ? valor.trim() : undefined;
}

function analisarSlot(bruto: unknown, erros: ErroDeTemplate[], onde: string): Slot | null {
  if (!bruto || typeof bruto !== 'object') {
    erros.push({ tipo: 'slot-invalido', mensagem: `${onde}: slot precisa ser um objeto` });
    return null;
  }
  const cru = bruto as Record<string, unknown>;
  const chave = texto(cru.chave);
  const rotulo = texto(cru.rotulo);
  const tipo = texto(cru.tipo) as TipoDeSlot | undefined;

  if (!chave || !/^[a-z][a-zA-Z0-9]*$/.test(chave)) {
    erros.push({
      tipo: 'slot-invalido',
      mensagem: `${onde}: "chave" precisa existir e ser camelCase sem acento`,
      detalhe: String(cru.chave ?? ''),
    });
    return null;
  }
  if (!rotulo) {
    erros.push({ tipo: 'slot-invalido', mensagem: `${onde}: slot "${chave}" sem "rotulo"` });
    return null;
  }
  if (!tipo || !TIPOS_DE_SLOT.includes(tipo)) {
    erros.push({
      tipo: 'slot-invalido',
      mensagem: `${onde}: slot "${chave}" tem tipo inválido (use ${TIPOS_DE_SLOT.join(', ')})`,
    });
    return null;
  }

  const opcoes = Array.isArray(cru.opcoes) ? cru.opcoes.map(String) : undefined;
  if (tipo === 'selecao' && (!opcoes || opcoes.length === 0)) {
    erros.push({
      tipo: 'slot-invalido',
      mensagem: `${onde}: slot "${chave}" é seleção mas não declarou "opcoes"`,
    });
    return null;
  }

  const slot: Slot = { chave, rotulo, tipo };
  if (cru.obrigatorio === true) slot.obrigatorio = true;
  const padrao = texto(cru.padrao);
  if (padrao) slot.padrao = padrao;
  const ajuda = texto(cru.ajuda);
  if (ajuda) slot.ajuda = ajuda;
  if (opcoes) slot.opcoes = opcoes;
  return slot;
}

export type LeituraDeArte = { tipo: TipoDeArte | null; erros: ErroDeTemplate[] };

export function lerTipoDeArte(caminho: string, bruto: string): LeituraDeArte {
  const erros: ErroDeTemplate[] = [];
  const { dados, corpo } = separarFrontMatter(bruto);

  if (!dados) {
    erros.push({ tipo: 'front-matter-invalido', mensagem: `${caminho}: front matter ausente` });
    return { tipo: null, erros };
  }

  const id = texto(dados.id);
  const nome = texto(dados.nome);
  const descricao = texto(dados.descricao);
  if (!id || !nome || !descricao) {
    erros.push({
      tipo: 'front-matter-invalido',
      mensagem: `${caminho}: front matter precisa de id, nome e descricao`,
    });
    return { tipo: null, erros };
  }

  const esperado = `/templates/artes/${id}.md`;
  if (caminho !== esperado) {
    erros.push({
      tipo: 'front-matter-invalido',
      mensagem: `${caminho}: id "${id}" não bate com o nome do arquivo (esperado ${esperado})`,
    });
  }

  const slotsBrutos = Array.isArray(dados.slots) ? dados.slots : [];
  const slots: Slot[] = [];
  const vistas = new Set<string>();
  for (const slotBruto of slotsBrutos) {
    const slot = analisarSlot(slotBruto, erros, caminho);
    if (!slot) continue;
    if (vistas.has(slot.chave)) {
      erros.push({ tipo: 'slot-invalido', mensagem: `${caminho}: slot "${slot.chave}" duplicado` });
      continue;
    }
    vistas.add(slot.chave);
    slots.push(slot);
  }

  const tipo: TipoDeArte = {
    id,
    nome,
    descricao,
    ordem: typeof dados.ordem === 'number' ? dados.ordem : 999,
    slots,
    corpo,
    caminho,
  };
  if (dados.serie === true) tipo.serie = true;

  return { tipo, erros };
}

export type Catalogo = { tipos: TipoDeArte[]; erros: ErroDeTemplate[] };

/** Todos os tipos de arte do repositório, ordenados. Não aplica overrides locais. */
export function carregarCatalogo(fonte: Record<string, string> = brutosDeArte): Catalogo {
  const tipos: TipoDeArte[] = [];
  const erros: ErroDeTemplate[] = [];
  for (const caminho of Object.keys(fonte).sort()) {
    const bruto = fonte[caminho];
    if (bruto === undefined) continue;
    const leitura = lerTipoDeArte(caminho, bruto);
    erros.push(...leitura.erros);
    if (leitura.tipo) tipos.push(leitura.tipo);
  }
  tipos.sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome, 'pt-BR'));
  return { tipos, erros };
}

/** Os brutos crus, usados pela validação e pelo editor de templates. */
export function brutosDoRepositorio(): Record<string, string> {
  return { ...brutosDeCamada, ...brutosDeArte };
}

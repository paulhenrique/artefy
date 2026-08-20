import type { ErroDeTemplate } from './tipos';
import { ErroDeTemplateAgregado } from './tipos';

/**
 * Motor de template do artefy. Suporta exatamente duas construções:
 *
 *   {{namespace.chave}}
 *   {{#se namespace.chave}} ... {{/se}}
 *
 * Nada além disso. Ver docs/SINTAXE-DE-TEMPLATE.md.
 */

export const NAMESPACES = ['comunidade', 'evento', 'arte'] as const;
export type Namespace = (typeof NAMESPACES)[number];

export type Contexto = Partial<Record<Namespace, Record<string, string | undefined>>>;

export type No =
  | { tipo: 'texto'; valor: string }
  | { tipo: 'variavel'; caminho: string }
  | { tipo: 'condicional'; caminho: string; filhos: No[] };

export type Compilacao = { nos: No[]; erros: ErroDeTemplate[]; variaveis: string[] };

const MARCADOR = /\{\{\s*(#se\s+[^}]+?|\/se|[^#/}][^}]*?)\s*\}\}/g;

function ehNamespaceValido(valor: string): valor is Namespace {
  return (NAMESPACES as readonly string[]).includes(valor);
}

function validarCaminho(caminho: string, erros: ErroDeTemplate[]): void {
  const partes = caminho.split('.');
  if (partes.length !== 2 || !partes[0] || !partes[1]) {
    erros.push({
      tipo: 'variavel-sem-namespace',
      mensagem: `"{{${caminho}}}" precisa ser no formato namespace.chave`,
      detalhe: caminho,
    });
    return;
  }
  if (!ehNamespaceValido(partes[0])) {
    erros.push({
      tipo: 'namespace-desconhecido',
      mensagem: `namespace "${partes[0]}" não existe (use ${NAMESPACES.join(', ')})`,
      detalhe: caminho,
    });
  }
}

/** Compila o texto em nós. Nunca lança: os problemas voltam em `erros`. */
export function compilar(texto: string): Compilacao {
  const erros: ErroDeTemplate[] = [];
  const variaveis = new Set<string>();
  const raiz: No[] = [];
  const pilha: { caminho: string; filhos: No[] }[] = [];

  const destino = (): No[] => pilha[pilha.length - 1]?.filhos ?? raiz;

  let ultimoIndice = 0;
  MARCADOR.lastIndex = 0;

  for (let achado = MARCADOR.exec(texto); achado !== null; achado = MARCADOR.exec(texto)) {
    const bruto = achado[1];
    if (bruto === undefined) continue;

    if (achado.index > ultimoIndice) {
      destino().push({ tipo: 'texto', valor: texto.slice(ultimoIndice, achado.index) });
    }
    ultimoIndice = achado.index + achado[0].length;

    if (bruto.startsWith('#se')) {
      const caminho = bruto.slice(3).trim();
      validarCaminho(caminho, erros);
      variaveis.add(caminho);
      pilha.push({ caminho, filhos: [] });
      continue;
    }

    if (bruto === '/se') {
      const aberto = pilha.pop();
      if (!aberto) {
        erros.push({ tipo: 'fechamento-sem-se', mensagem: '{{/se}} sem {{#se}} correspondente' });
        continue;
      }
      destino().push({ tipo: 'condicional', caminho: aberto.caminho, filhos: aberto.filhos });
      continue;
    }

    validarCaminho(bruto, erros);
    variaveis.add(bruto);
    destino().push({ tipo: 'variavel', caminho: bruto });
  }

  if (ultimoIndice < texto.length) {
    destino().push({ tipo: 'texto', valor: texto.slice(ultimoIndice) });
  }

  for (const aberto of pilha) {
    erros.push({
      tipo: 'se-sem-fechamento',
      mensagem: `{{#se ${aberto.caminho}}} não foi fechado com {{/se}}`,
      detalhe: aberto.caminho,
    });
  }

  return { nos: raiz, erros, variaveis: [...variaveis] };
}

/** Só as variáveis, para validação de slots. */
export function variaveisUsadas(texto: string): string[] {
  return compilar(texto).variaveis;
}

function valorDe(caminho: string, contexto: Contexto): string {
  const [ns, chave] = caminho.split('.');
  if (!ns || !chave || !ehNamespaceValido(ns)) return '';
  return contexto[ns]?.[chave]?.trim() ?? '';
}

function renderizarNos(nos: No[], contexto: Contexto): string {
  let saida = '';
  for (const no of nos) {
    if (no.tipo === 'texto') saida += no.valor;
    else if (no.tipo === 'variavel') saida += valorDe(no.caminho, contexto);
    else if (valorDe(no.caminho, contexto) !== '') saida += renderizarNos(no.filhos, contexto);
  }
  return saida;
}

/**
 * Renderiza o template. Lança `ErroDeTemplateAgregado` se a sintaxe estiver quebrada —
 * é melhor falhar visível do que entregar um prompt com `{{` no meio.
 */
export function renderizar(texto: string, contexto: Contexto, origem = 'template'): string {
  const { nos, erros } = compilar(texto);
  if (erros.length > 0) throw new ErroDeTemplateAgregado(erros, origem);
  return limpar(renderizarNos(nos, contexto));
}

/** Condicionais falsas deixam linhas vazias; o markdown fica feio e o prompt, ruidoso. */
export function limpar(texto: string): string {
  return texto
    .split('\n')
    .map((linha) => (linha.trim() === '' ? '' : linha.replace(/\s+$/, '')))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

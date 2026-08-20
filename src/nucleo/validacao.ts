import { brutosDoRepositorio, CAMINHO_COMUNIDADE, CAMINHO_EVENTO, carregarCatalogo } from './catalogo';
import { contextoDoEvento, DERIVADOS_DE_ARTE } from './compositor';
import { compilar } from './motor';
import type { ErroDeTemplate, TipoDeArte } from './tipos';

/**
 * Validação dos templates. Roda no CI (`npm run validar:templates`) e também dentro da
 * app, no editor de templates, para o usuário ver o erro antes de gerar um prompt torto.
 */

/** Chaves válidas de `evento.*`, derivadas do próprio compositor para não haver drift. */
export const CHAVES_DE_EVENTO = Object.keys(
  contextoDoEvento({
    id: '',
    nome: '',
    data: '2026-01-01',
    formato: 'presencial',
    criadoEm: '',
    atualizadoEm: '',
  }),
);

export const CHAVES_DE_COMUNIDADE = ['nome', 'handle', 'descricao', 'identidadeVisual'];

/**
 * Apelidos que não são chave literal do evento mas significam a mesma coisa. As chaves
 * literais (`nome`, `data`, `local`, …) são pegas direto de CHAVES_DE_EVENTO, para a lista
 * não ficar para trás quando um campo novo entrar no evento.
 */
const APELIDOS_PROIBIDOS: Record<string, string> = {
  nomeEvento: 'evento.nome',
  nomeDoEvento: 'evento.nome',
  tituloEvento: 'evento.nome',
  tituloDoEvento: 'evento.nome',
  dataEvento: 'evento.data',
  dataDoEvento: 'evento.data',
  horarioEvento: 'evento.horario',
  horarioDoEvento: 'evento.horario',
  localEvento: 'evento.local',
  localDoEvento: 'evento.local',
  cidadeDoEvento: 'evento.cidade',
  linkDeInscricao: 'evento.linkInscricao',
};

/** O slot repete um campo do evento? Devolve a variável que deveria ser usada. */
export function equivalenteNoEvento(chave: string): string | null {
  if (CHAVES_DE_EVENTO.includes(chave)) return `evento.${chave}`;
  return APELIDOS_PROIBIDOS[chave] ?? null;
}

function separar(caminho: string): [string, string] {
  const [ns = '', chave = ''] = caminho.split('.');
  return [ns, chave];
}

/** Valida um texto de template contra os namespaces e chaves que ele pode usar. */
export function validarTexto(
  texto: string,
  origem: string,
  permitido: Partial<Record<'comunidade' | 'evento' | 'arte', readonly string[]>>,
): ErroDeTemplate[] {
  const { erros, variaveis } = compilar(texto);
  const problemas = [...erros];

  for (const caminho of variaveis) {
    const [ns, chave] = separar(caminho);
    const chaves = permitido[ns as keyof typeof permitido];
    if (!chaves) {
      problemas.push({
        tipo: 'namespace-desconhecido',
        mensagem: `${origem}: "${caminho}" usa um namespace que não está disponível nesta camada`,
        detalhe: caminho,
      });
      continue;
    }
    if (!chaves.includes(chave)) {
      problemas.push({
        tipo: 'variavel-nao-declarada',
        mensagem: `${origem}: "${caminho}" não existe (disponíveis: ${chaves.join(', ')})`,
        detalhe: caminho,
      });
    }
  }

  return problemas;
}

export function validarTipoDeArte(tipo: TipoDeArte): ErroDeTemplate[] {
  const derivados = DERIVADOS_DE_ARTE[tipo.id] ?? {};
  const chavesDeSlot = tipo.slots.map((slot) => slot.chave);
  const origem = `artes/${tipo.id}.md`;

  const problemas = validarTexto(tipo.corpo, origem, {
    comunidade: CHAVES_DE_COMUNIDADE,
    evento: CHAVES_DE_EVENTO,
    arte: [...chavesDeSlot, ...Object.keys(derivados)],
  });

  for (const slot of tipo.slots) {
    const equivalente = equivalenteNoEvento(slot.chave);
    if (equivalente) {
      problemas.push({
        tipo: 'slot-duplica-evento',
        mensagem: `${origem}: slot "${slot.chave}" repete um campo do evento — use {{${equivalente}}}`,
        detalhe: slot.chave,
      });
    }
  }

  const usadas = new Set(
    compilar(tipo.corpo)
      .variaveis.map((caminho) => separar(caminho))
      .filter(([ns]) => ns === 'arte')
      .map(([, chave]) => chave),
  );
  // Um slot também conta como usado quando alimenta um derivado que aparece no corpo
  // (ex.: `diasRestantes` só existe para virar `chamadaContagem`).
  for (const [chave, derivado] of Object.entries(derivados)) {
    if (usadas.has(chave)) for (const fonte of derivado.fontes) usadas.add(fonte);
  }

  for (const slot of tipo.slots) {
    if (!usadas.has(slot.chave)) {
      problemas.push({
        tipo: 'slot-nao-usado',
        mensagem: `${origem}: slot "${slot.chave}" é declarado mas nunca usado no corpo`,
        detalhe: slot.chave,
      });
    }
  }

  return problemas;
}

export type Relatorio = { origem: string; erros: ErroDeTemplate[] };

/** Valida tudo que está versionado em `templates/`. */
export function validarRepositorio(): Relatorio[] {
  const brutos = brutosDoRepositorio();
  const relatorios: Relatorio[] = [];

  const comunidade = brutos[CAMINHO_COMUNIDADE];
  relatorios.push({
    origem: 'comunidade.md',
    erros: comunidade
      ? validarTexto(comunidade, 'comunidade.md', { comunidade: CHAVES_DE_COMUNIDADE })
      : [{ tipo: 'front-matter-invalido', mensagem: 'templates/comunidade.md não encontrado' }],
  });

  const evento = brutos[CAMINHO_EVENTO];
  relatorios.push({
    origem: 'evento.md',
    erros: evento
      ? validarTexto(evento, 'evento.md', {
          comunidade: CHAVES_DE_COMUNIDADE,
          evento: CHAVES_DE_EVENTO,
        })
      : [{ tipo: 'front-matter-invalido', mensagem: 'templates/evento.md não encontrado' }],
  });

  const catalogo = carregarCatalogo();
  if (catalogo.erros.length > 0) {
    relatorios.push({ origem: 'front matter', erros: catalogo.erros });
  }
  for (const tipo of catalogo.tipos) {
    relatorios.push({ origem: `artes/${tipo.id}.md`, erros: validarTipoDeArte(tipo) });
  }

  return relatorios.filter((relatorio) => relatorio.erros.length > 0);
}

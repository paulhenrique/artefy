import { chamadaDeContagem, dataExtenso, diaDaSemana } from './datas';
import type { Contexto } from './motor';
import { renderizar } from './motor';
import type { Comunidade, Evento, TipoDeArte } from './tipos';

/**
 * Monta o prompt final. A ordem das camadas — comunidade, evento, arte — é invariante
 * do produto (docs/PRD.md seção 4).
 */

export const SEPARADOR = '\n\n---\n\n';

const ROTULO_DE_FORMATO: Record<Evento['formato'], string> = {
  presencial: 'presencial',
  online: 'online',
  hibrido: 'híbrido (presencial e online)',
};

export function contextoDaComunidade(comunidade: Comunidade): Record<string, string> {
  return {
    nome: comunidade.nome,
    handle: comunidade.handle ?? '',
    descricao: comunidade.descricao ?? '',
    identidadeVisual: comunidade.identidadeVisual ?? '',
  };
}

export function contextoDoEvento(evento: Evento): Record<string, string> {
  return {
    nome: evento.nome,
    edicao: evento.edicao ?? '',
    data: evento.data,
    dataExtenso: dataExtenso(evento.data),
    diaSemana: diaDaSemana(evento.data),
    horario: evento.horario ?? '',
    local: evento.local ?? '',
    cidade: evento.cidade ?? '',
    formato: ROTULO_DE_FORMATO[evento.formato],
    linkInscricao: evento.linkInscricao ?? '',
    hashtag: evento.hashtag ?? '',
    observacoes: evento.observacoes ?? '',
  };
}

/**
 * Variáveis de `arte.*` que a app calcula em vez de o usuário digitar. Precisam estar
 * declaradas aqui para a validação de template aceitá-las (docs/SINTAXE-DE-TEMPLATE.md).
 */
export const DERIVADOS_DE_ARTE: Record<string, Record<string, readonly string[]>> = {
  // derivado -> slots que o alimentam
  'contagem-regressiva': { chamadaContagem: ['diasRestantes'] },
};

/**
 * Valores dos slots mais os derivados daquele tipo de arte. Derivados são calculados
 * aqui e nunca digitados — ver docs/SINTAXE-DE-TEMPLATE.md.
 */
export function contextoDaArte(
  tipo: TipoDeArte,
  valores: Record<string, string>,
): Record<string, string> {
  const contexto: Record<string, string> = {};
  for (const slot of tipo.slots) {
    contexto[slot.chave] = (valores[slot.chave] ?? slot.padrao ?? '').trim();
  }
  if (tipo.id === 'contagem-regressiva') {
    const dias = Number.parseInt(contexto.diasRestantes ?? '', 10);
    contexto.chamadaContagem = Number.isFinite(dias) ? chamadaDeContagem(dias) : '';
  }
  return contexto;
}

export type EntradaDeComposicao = {
  comunidade: Comunidade;
  evento: Evento;
  tipoDeArte: TipoDeArte;
  valores: Record<string, string>;
  /** Markdown das camadas 0 e 1 — já resolvido entre padrão do repo e override local. */
  templateComunidade: string;
  templateEvento: string;
  /** Corpo da camada 2 — idem. */
  templateArte: string;
};

export type Camada = { nome: string; texto: string };

export function comporCamadas(entrada: EntradaDeComposicao): Camada[] {
  const contexto: Contexto = {
    comunidade: contextoDaComunidade(entrada.comunidade),
    evento: contextoDoEvento(entrada.evento),
    arte: contextoDaArte(entrada.tipoDeArte, entrada.valores),
  };

  return [
    {
      nome: 'Comunidade',
      texto: renderizar(entrada.templateComunidade, { comunidade: contexto.comunidade }, 'comunidade.md'),
    },
    {
      nome: 'Evento',
      texto: renderizar(
        entrada.templateEvento,
        { comunidade: contexto.comunidade, evento: contexto.evento },
        'evento.md',
      ),
    },
    {
      nome: entrada.tipoDeArte.nome,
      texto: renderizar(entrada.templateArte, contexto, `artes/${entrada.tipoDeArte.id}.md`),
    },
  ];
}

export function compor(entrada: EntradaDeComposicao): string {
  return comporCamadas(entrada)
    .map((camada) => camada.texto)
    .filter((texto) => texto !== '')
    .join(SEPARADOR);
}

export type Pendencia = { chave: string; rotulo: string };

/** Slots obrigatórios ainda em branco. A UI usa para desabilitar o botão de gerar. */
export function pendencias(tipo: TipoDeArte, valores: Record<string, string>): Pendencia[] {
  return tipo.slots
    .filter((slot) => slot.obrigatorio)
    .filter((slot) => (valores[slot.chave] ?? slot.padrao ?? '').trim() === '')
    .map((slot) => ({ chave: slot.chave, rotulo: slot.rotulo }));
}

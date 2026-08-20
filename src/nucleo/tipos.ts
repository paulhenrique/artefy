/** Contratos do domínio. Ver docs/MODELO-DE-DADOS.md. */

export const VERSAO_DO_SCHEMA = 1;

export type FormatoDeEvento = 'presencial' | 'online' | 'hibrido';

export type Comunidade = {
  nome: string;
  handle?: string;
  descricao?: string;
  identidadeVisual?: string;
};

export type Evento = {
  id: string;
  nome: string;
  edicao?: string;
  /** ISO YYYY-MM-DD */
  data: string;
  horario?: string;
  local?: string;
  cidade?: string;
  formato: FormatoDeEvento;
  linkInscricao?: string;
  hashtag?: string;
  observacoes?: string;
  criadoEm: string;
  atualizadoEm: string;
};

export type Geracao = {
  id: string;
  eventoId: string;
  tipoDeArteId: string;
  rotulo: string;
  valores: Record<string, string>;
  /** Texto final congelado no momento da geração. */
  prompt: string;
  criadoEm: string;
};

export type Documento = {
  schemaVersion: number;
  comunidade: Comunidade;
  eventos: Evento[];
  geracoes: Geracao[];
  /** caminho do template -> markdown que sobrescreve o padrão do repositório */
  overridesDeTemplate: Record<string, string>;
  atualizadoEm: string;
};

export type TipoDeSlot = 'texto' | 'textoLongo' | 'numero' | 'data' | 'selecao';

export type Slot = {
  chave: string;
  rotulo: string;
  tipo: TipoDeSlot;
  obrigatorio?: boolean;
  padrao?: string;
  ajuda?: string;
  opcoes?: string[];
};

export type TipoDeArte = {
  id: string;
  nome: string;
  descricao: string;
  ordem: number;
  /** Peça pensada para ser gerada em série (ex.: contagem regressiva). */
  serie?: boolean;
  slots: Slot[];
  /** Corpo markdown do template, sem o front matter. */
  corpo: string;
  /** Caminho no repositório, usado como chave de override. */
  caminho: string;
};

export type ErroDeTemplate = {
  tipo:
    | 'variavel-sem-namespace'
    | 'namespace-desconhecido'
    | 'variavel-nao-declarada'
    | 'se-sem-fechamento'
    | 'fechamento-sem-se'
    | 'front-matter-invalido'
    | 'slot-invalido'
    | 'slot-nao-usado'
    | 'slot-duplica-evento';
  mensagem: string;
  detalhe?: string;
};

export class ErroDeTemplateAgregado extends Error {
  constructor(
    readonly erros: ErroDeTemplate[],
    readonly origem: string,
  ) {
    super(`${origem}: ${erros.length} problema(s) no template`);
    this.name = 'ErroDeTemplateAgregado';
  }
}

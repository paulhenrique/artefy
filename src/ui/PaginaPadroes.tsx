import { useMemo, useState } from 'react';
import {
  CAMINHO_COMUNIDADE,
  CAMINHO_EVENTO,
  carregarCatalogo,
  templatePadrao,
} from '../nucleo/catalogo';
import { DERIVADOS_DE_ARTE } from '../nucleo/compositor';
import {
  limparOverrideDeTemplate,
  salvarOverrideDeTemplate,
  templateResolvido,
  temOverride,
} from '../nucleo/estado';
import { CHAVES_DE_COMUNIDADE, CHAVES_DE_EVENTO, validarTexto } from '../nucleo/validacao';
import { Campo } from './componentes';
import { useDocumento } from './useDocumento';

type Alvo = { caminho: string; nome: string; camada: string; variaveis: string[] };

function comPrefixo(prefixo: string, chaves: readonly string[]): string[] {
  return chaves.map((chave) => `${prefixo}.${chave}`);
}

export function PaginaPadroes() {
  const documento = useDocumento();
  const { tipos } = carregarCatalogo();

  const alvos = useMemo<Alvo[]>(
    () => [
      {
        caminho: CAMINHO_COMUNIDADE,
        nome: 'Comunidade',
        camada: 'Camada 0 — entra em toda arte de todo evento',
        variaveis: comPrefixo('comunidade', CHAVES_DE_COMUNIDADE),
      },
      {
        caminho: CAMINHO_EVENTO,
        nome: 'Evento',
        camada: 'Camada 1 — entra em toda arte deste evento',
        variaveis: [
          ...comPrefixo('comunidade', CHAVES_DE_COMUNIDADE),
          ...comPrefixo('evento', CHAVES_DE_EVENTO),
        ],
      },
      ...tipos.map((tipo) => ({
        caminho: tipo.caminho,
        nome: tipo.nome,
        camada: 'Camada 2 — só esta arte',
        variaveis: [
          ...comPrefixo('comunidade', CHAVES_DE_COMUNIDADE),
          ...comPrefixo('evento', CHAVES_DE_EVENTO),
          ...comPrefixo('arte', [
            ...tipo.slots.map((slot) => slot.chave),
            ...Object.keys(DERIVADOS_DE_ARTE[tipo.id] ?? {}),
          ]),
        ],
      })),
    ],
    [tipos],
  );

  const [selecionado, definirSelecionado] = useState(CAMINHO_COMUNIDADE);
  const alvo = alvos.find((candidato) => candidato.caminho === selecionado) ?? alvos[0];
  const [rascunho, definirRascunho] = useState(() => templateResolvido(documento, CAMINHO_COMUNIDADE));

  const trocar = (caminho: string): void => {
    definirSelecionado(caminho);
    definirRascunho(templateResolvido(documento, caminho));
  };

  if (!alvo) return null;

  // O que vale aqui é a lista da camada, não a união de tudo: a camada 0 não enxerga
  // {{evento.*}}, e salvar um override que a usa faria o dado sumir calado do prompt.
  const permitido: Partial<Record<'comunidade' | 'evento' | 'arte', string[]>> = {};
  for (const namespace of ['comunidade', 'evento', 'arte'] as const) {
    const chaves = alvo.variaveis
      .filter((variavel) => variavel.startsWith(`${namespace}.`))
      .map((variavel) => variavel.slice(namespace.length + 1));
    if (chaves.length > 0) permitido[namespace] = chaves;
  }
  const erros = validarTexto(rascunho, alvo.nome, permitido);
  const alterado = rascunho !== templateResolvido(documento, alvo.caminho);

  return (
    <>
      <h1>Padrões</h1>
      <p className="ajuda">
        Os templates vêm versionados no repositório. O que você editar aqui fica salvo só neste
        navegador, como um rascunho — para tornar a mudança definitiva, faça o commit no arquivo
        correspondente em <code>templates/</code>.
      </p>

      <Campo id="alvo" rotulo="Template">
        <select id="alvo" value={selecionado} onChange={(e) => trocar(e.target.value)}>
          {alvos.map((candidato) => (
            <option key={candidato.caminho} value={candidato.caminho}>
              {candidato.nome}
            </option>
          ))}
        </select>
      </Campo>

      <p className="ajuda">{alvo.camada}</p>
      <p className="ajuda">
        Variáveis disponíveis:{' '}
        {alvo.variaveis.map((variavel) => (
          <code key={variavel} style={{ marginRight: 8 }}>{`{{${variavel}}}`}</code>
        ))}
      </p>

      {temOverride(documento, alvo.caminho) ? (
        <p className="aviso">Este template está sobrescrito neste navegador.</p>
      ) : null}

      {temOverride(documento, alvo.caminho) ? (
        <details>
          <summary className="ajuda" style={{ cursor: 'pointer', marginBottom: 8 }}>
            Ver o padrão do repositório, para comparar
          </summary>
          <pre className="prompt">{templatePadrao(alvo.caminho)}</pre>
        </details>
      ) : null}

      <Campo id="markdown" rotulo="Markdown">
        <textarea
          id="markdown"
          style={{ minHeight: 340, fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 13 }}
          value={rascunho}
          onChange={(e) => definirRascunho(e.target.value)}
        />
      </Campo>

      {erros.length > 0 ? (
        <p className="aviso erro">
          {erros.map((erro) => (
            <span key={erro.mensagem} style={{ display: 'block' }}>
              {erro.mensagem}
            </span>
          ))}
        </p>
      ) : null}

      <div className="acoes">
        <button
          type="button"
          className="primario"
          disabled={erros.length > 0 || !alterado}
          onClick={() => salvarOverrideDeTemplate(alvo.caminho, rascunho)}
        >
          Salvar rascunho local
        </button>
        <button
          type="button"
          disabled={!temOverride(documento, alvo.caminho)}
          onClick={() => {
            limparOverrideDeTemplate(alvo.caminho);
            definirRascunho(templatePadrao(alvo.caminho));
          }}
        >
          Voltar ao padrão do repositório
        </button>
      </div>
    </>
  );
}

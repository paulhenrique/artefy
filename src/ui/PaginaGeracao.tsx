import { CAMINHO_COMUNIDADE, CAMINHO_EVENTO, carregarCatalogo } from '../nucleo/catalogo';
import { compor } from '../nucleo/compositor';
import { removerGeracao, templateResolvido } from '../nucleo/estado';
import type { Documento, Evento, Geracao, TipoDeArte } from '../nucleo/tipos';
import { BotaoCopiar, Confirmar } from './componentes';
import { caminho, irPara } from './rotas';
import { useDocumento } from './useDocumento';

/**
 * O prompt salvo é congelado (docs/MODELO-DE-DADOS.md). Recompor com os templates atuais
 * não reescreve o histórico — serve só para avisar que o padrão mudou desde então.
 */
function desatualizada(
  documento: Documento,
  geracao: Geracao,
  evento: Evento | undefined,
  tipo: TipoDeArte | undefined,
): boolean {
  if (!evento || !tipo) return false;
  try {
    const atual = compor({
      comunidade: documento.comunidade,
      evento,
      tipoDeArte: tipo,
      valores: geracao.valores,
      templateComunidade: templateResolvido(documento, CAMINHO_COMUNIDADE),
      templateEvento: templateResolvido(documento, CAMINHO_EVENTO),
      templateArte: templateResolvido(documento, tipo.caminho),
    });
    return atual !== geracao.prompt;
  } catch {
    // Template quebrado agora não diz nada sobre o prompt já gerado.
    return false;
  }
}

export function PaginaGeracao({ id }: { id: string }) {
  const documento = useDocumento();
  const geracao = documento.geracoes.find((candidata) => candidata.id === id);
  const evento = documento.eventos.find((candidato) => candidato.id === geracao?.eventoId);
  const tipo = carregarCatalogo().tipos.find((candidato) => candidato.id === geracao?.tipoDeArteId);

  if (!geracao) {
    return (
      <>
        <h1>Geração não encontrada</h1>
        <div className="acoes">
          <button type="button" onClick={() => irPara({ nome: 'eventos' })}>
            Voltar aos eventos
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {evento ? (
        <p className="ajuda">
          <a href={caminho({ nome: 'evento', id: evento.id })}>← {evento.nome}</a>
        </p>
      ) : null}
      <h1>{geracao.rotulo}</h1>
      <p className="ajuda">
        {tipo?.nome ?? geracao.tipoDeArteId} · gerado em{' '}
        {new Date(geracao.criadoEm).toLocaleString('pt-BR')}
      </p>

      {desatualizada(documento, geracao, evento, tipo) ? (
        <p className="aviso">
          Gerado com um template anterior. O texto abaixo é o que você copiou na época e não
          muda; para usar o padrão atual, duplique e gere de novo.
        </p>
      ) : null}

      <pre className="prompt">{geracao.prompt}</pre>

      <div className="acoes">
        <BotaoCopiar texto={geracao.prompt} />
        {evento && tipo ? (
          <a
            className="etiqueta"
            href={caminho({ nome: 'gerador', eventoId: evento.id, tipoId: tipo.id, de: geracao.id })}
          >
            Duplicar e ajustar
          </a>
        ) : null}
        <Confirmar
          rotulo="Apagar"
          pergunta="Apagar esta geração?"
          aoConfirmar={() => {
            removerGeracao(geracao.id);
            irPara(evento ? { nome: 'evento', id: evento.id } : { nome: 'eventos' });
          }}
        />
      </div>
    </>
  );
}

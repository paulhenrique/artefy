import { carregarCatalogo } from '../nucleo/catalogo';
import { removerGeracao } from '../nucleo/estado';
import { BotaoCopiar, Confirmar } from './componentes';
import { caminho, irPara } from './rotas';
import { useDocumento } from './useDocumento';

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

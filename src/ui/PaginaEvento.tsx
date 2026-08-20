import { carregarCatalogo } from '../nucleo/catalogo';
import { dataCurta, dataExtenso, diasAte } from '../nucleo/datas';
import { removerGeracao } from '../nucleo/estado';
import { Confirmar, Vazio } from './componentes';
import { caminho, irPara } from './rotas';
import { useDocumento } from './useDocumento';

export function PaginaEvento({ id }: { id: string }) {
  const documento = useDocumento();
  const evento = documento.eventos.find((candidato) => candidato.id === id);
  const { tipos } = carregarCatalogo();

  if (!evento) {
    return (
      <>
        <h1>Evento não encontrado</h1>
        <p className="ajuda">Ele pode ter sido apagado neste navegador.</p>
        <div className="acoes">
          <button type="button" onClick={() => irPara({ nome: 'eventos' })}>
            Voltar aos eventos
          </button>
        </div>
      </>
    );
  }

  const dias = diasAte(evento.data);
  const geracoes = documento.geracoes.filter((geracao) => geracao.eventoId === evento.id);

  return (
    <>
      <h1>{evento.nome}</h1>
      <p className="ajuda">
        {dataCurta(evento.data)}
        {evento.horario ? ` · ${evento.horario}` : ''} · {evento.formato}
        {evento.local ? ` · ${evento.local}` : ''}
      </p>
      <p className="ajuda">
        {dataExtenso(evento.data)}
        {dias !== null && dias >= 0 ? ` — faltam ${dias} dia${dias === 1 ? '' : 's'}` : ''}
      </p>

      <div className="acoes" style={{ marginTop: 8 }}>
        <a className="etiqueta" href={caminho({ nome: 'evento-editar', id: evento.id })}>
          Editar dados do evento
        </a>
      </div>

      <h2>Gerar arte</h2>
      {tipos.map((tipo) => (
        <a
          key={tipo.id}
          className="cartao"
          href={caminho({ nome: 'gerador', eventoId: evento.id, tipoId: tipo.id })}
        >
          <strong>{tipo.nome}</strong>
          <span className="ajuda">{tipo.descricao}</span>
        </a>
      ))}

      <h2>Prompts gerados</h2>
      {geracoes.length === 0 ? (
        <Vazio>Nada gerado para este evento ainda.</Vazio>
      ) : (
        geracoes.map((geracao) => {
          const tipo = tipos.find((candidato) => candidato.id === geracao.tipoDeArteId);
          return (
            <div key={geracao.id} className="cartao">
              <strong>{geracao.rotulo}</strong>
              <span className="ajuda">
                {tipo?.nome ?? geracao.tipoDeArteId} ·{' '}
                {new Date(geracao.criadoEm).toLocaleString('pt-BR')}
              </span>
              <div className="acoes" style={{ marginTop: 10 }}>
                <a className="etiqueta" href={caminho({ nome: 'geracao', id: geracao.id })}>
                  Abrir
                </a>
                <Confirmar
                  rotulo="Apagar"
                  pergunta="Apagar esta geração?"
                  aoConfirmar={() => removerGeracao(geracao.id)}
                />
              </div>
            </div>
          );
        })
      )}
    </>
  );
}

import { dataCurta, diasAte } from '../nucleo/datas';
import type { Evento } from '../nucleo/tipos';
import { Vazio } from './componentes';
import { caminho } from './rotas';
import { useDocumento } from './useDocumento';

function situacao(evento: Evento): string {
  const dias = diasAte(evento.data);
  if (dias === null) return '';
  if (dias < 0) return `há ${Math.abs(dias)} dia${Math.abs(dias) === 1 ? '' : 's'}`;
  if (dias === 0) return 'é hoje';
  if (dias === 1) return 'é amanhã';
  return `faltam ${dias} dias`;
}

export function PaginaEventos() {
  const documento = useDocumento();
  const eventos = [...documento.eventos].sort((a, b) => b.data.localeCompare(a.data));

  return (
    <>
      <h1>Eventos</h1>
      <p className="ajuda">
        Cadastre o evento uma vez. Os dados dele entram automaticamente em toda arte que você
        gerar.
      </p>

      {documento.comunidade.nome.trim() === '' ? (
        <p className="aviso">
          Antes de gerar a primeira arte, preencha o <a href={caminho({ nome: 'comunidade' })}>perfil
          da comunidade</a> — é dele que sai a identidade visual de todas as peças.
        </p>
      ) : null}

      <div className="acoes" style={{ marginTop: 12, marginBottom: 24 }}>
        <a className="cartao" style={{ width: 'auto' }} href={caminho({ nome: 'evento-novo' })}>
          <strong>+ Novo evento</strong>
        </a>
      </div>

      {eventos.length === 0 ? (
        <Vazio>Nenhum evento ainda.</Vazio>
      ) : (
        eventos.map((evento) => (
          <a key={evento.id} className="cartao" href={caminho({ nome: 'evento', id: evento.id })}>
            <strong>
              {evento.nome}
              {evento.edicao ? ` — ${evento.edicao}` : ''}
            </strong>
            <span className="ajuda">
              {dataCurta(evento.data)}
              {evento.horario ? ` · ${evento.horario}` : ''}
              {evento.local ? ` · ${evento.local}` : ''} · {situacao(evento)}
            </span>
          </a>
        ))
      )}
    </>
  );
}

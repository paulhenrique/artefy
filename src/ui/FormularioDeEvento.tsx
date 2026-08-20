import { useState } from 'react';
import type { FormEvent } from 'react';
import { criarEvento, atualizarEvento, removerEvento } from '../nucleo/estado';
import type { RascunhoDeEvento } from '../nucleo/estado';
import { hojeISO } from '../nucleo/datas';
import type { Evento, FormatoDeEvento } from '../nucleo/tipos';
import { Campo, Confirmar } from './componentes';
import { irPara } from './rotas';

const FORMATOS: { valor: FormatoDeEvento; rotulo: string }[] = [
  { valor: 'presencial', rotulo: 'Presencial' },
  { valor: 'online', rotulo: 'Online' },
  { valor: 'hibrido', rotulo: 'Híbrido' },
];

function rascunhoDe(evento?: Evento): RascunhoDeEvento {
  return {
    nome: evento?.nome ?? '',
    edicao: evento?.edicao ?? '',
    data: evento?.data ?? hojeISO(),
    horario: evento?.horario ?? '',
    local: evento?.local ?? '',
    cidade: evento?.cidade ?? '',
    formato: evento?.formato ?? 'presencial',
    linkInscricao: evento?.linkInscricao ?? '',
    hashtag: evento?.hashtag ?? '',
    observacoes: evento?.observacoes ?? '',
  };
}

/** Estes campos são constantes do evento: valem para todas as artes dele. */
export function FormularioDeEvento({ evento }: { evento?: Evento }) {
  const [rascunho, definirRascunho] = useState(() => rascunhoDe(evento));

  const mudar = <C extends keyof RascunhoDeEvento>(chave: C, valor: RascunhoDeEvento[C]): void =>
    definirRascunho((atual) => ({ ...atual, [chave]: valor }));

  const enviar = (e: FormEvent): void => {
    e.preventDefault();
    if (evento) {
      atualizarEvento(evento.id, rascunho);
      irPara({ nome: 'evento', id: evento.id });
    } else {
      const novo = criarEvento(rascunho);
      irPara({ nome: 'evento', id: novo.id });
    }
  };

  return (
    <form onSubmit={enviar}>
      <h1>{evento ? 'Editar evento' : 'Novo evento'}</h1>
      <p className="ajuda">
        Tudo aqui é constante do evento e entra em toda arte que você gerar. Preencha uma vez.
      </p>

      <Campo id="nome" rotulo="Nome do evento">
        <input
          id="nome"
          required
          value={rascunho.nome}
          onChange={(e) => mudar('nome', e.target.value)}
        />
      </Campo>

      <div className="linha">
        <Campo id="edicao" rotulo="Edição" ajuda="Opcional. Ex.: 3ª edição">
          <input id="edicao" value={rascunho.edicao} onChange={(e) => mudar('edicao', e.target.value)} />
        </Campo>
        <Campo id="formato" rotulo="Formato">
          <select
            id="formato"
            value={rascunho.formato}
            onChange={(e) => mudar('formato', e.target.value as FormatoDeEvento)}
          >
            {FORMATOS.map((formato) => (
              <option key={formato.valor} value={formato.valor}>
                {formato.rotulo}
              </option>
            ))}
          </select>
        </Campo>
      </div>

      <div className="linha">
        <Campo id="data" rotulo="Data" ajuda="Base da contagem regressiva">
          <input
            id="data"
            type="date"
            required
            value={rascunho.data}
            onChange={(e) => mudar('data', e.target.value)}
          />
        </Campo>
        <Campo id="horario" rotulo="Horário" ajuda="Ex.: 19h00">
          <input id="horario" value={rascunho.horario} onChange={(e) => mudar('horario', e.target.value)} />
        </Campo>
      </div>

      <div className="linha">
        <Campo id="local" rotulo="Local">
          <input id="local" value={rascunho.local} onChange={(e) => mudar('local', e.target.value)} />
        </Campo>
        <Campo id="cidade" rotulo="Cidade">
          <input id="cidade" value={rascunho.cidade} onChange={(e) => mudar('cidade', e.target.value)} />
        </Campo>
      </div>

      <Campo id="link" rotulo="Link de inscrição">
        <input
          id="link"
          type="url"
          inputMode="url"
          value={rascunho.linkInscricao}
          onChange={(e) => mudar('linkInscricao', e.target.value)}
        />
      </Campo>

      <Campo id="hashtag" rotulo="Hashtag">
        <input id="hashtag" value={rascunho.hashtag} onChange={(e) => mudar('hashtag', e.target.value)} />
      </Campo>

      <Campo
        id="observacoes"
        rotulo="Observações"
        ajuda="Qualquer coisa que o gerador precise saber sobre este evento."
      >
        <textarea
          id="observacoes"
          value={rascunho.observacoes}
          onChange={(e) => mudar('observacoes', e.target.value)}
        />
      </Campo>

      <div className="acoes">
        <button type="submit" className="primario">
          Salvar
        </button>
        <button
          type="button"
          onClick={() => irPara(evento ? { nome: 'evento', id: evento.id } : { nome: 'eventos' })}
        >
          Cancelar
        </button>
        {evento ? (
          <Confirmar
            rotulo="Apagar evento"
            pergunta="Apaga o evento e as gerações dele."
            aoConfirmar={() => {
              removerEvento(evento.id);
              irPara({ nome: 'eventos' });
            }}
          />
        ) : null}
      </div>
    </form>
  );
}

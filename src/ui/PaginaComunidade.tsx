import { useState } from 'react';
import type { FormEvent } from 'react';
import { salvarComunidade } from '../nucleo/estado';
import type { Comunidade } from '../nucleo/tipos';
import { Campo } from './componentes';
import { useDocumento } from './useDocumento';

export function PaginaComunidade() {
  const documento = useDocumento();
  const [rascunho, definirRascunho] = useState<Comunidade>(() => ({ ...documento.comunidade }));
  const [salvo, definirSalvo] = useState(false);

  const mudar = (chave: keyof Comunidade, valor: string): void => {
    definirRascunho((atual) => ({ ...atual, [chave]: valor }));
    definirSalvo(false);
  };

  const enviar = (e: FormEvent): void => {
    e.preventDefault();
    salvarComunidade(rascunho);
    definirSalvo(true);
  };

  return (
    <form onSubmit={enviar}>
      <h1>Comunidade</h1>
      <p className="ajuda">
        Esta é a camada mais estável do prompt: ela entra igual em toda arte, de todo evento.
        Vale gastar um tempo aqui uma vez.
      </p>

      <Campo id="c-nome" rotulo="Nome da comunidade">
        <input id="c-nome" required value={rascunho.nome} onChange={(e) => mudar('nome', e.target.value)} />
      </Campo>

      <Campo id="c-handle" rotulo="@ nas redes" ajuda="Opcional">
        <input id="c-handle" value={rascunho.handle ?? ''} onChange={(e) => mudar('handle', e.target.value)} />
      </Campo>

      <Campo id="c-descricao" rotulo="Descrição curta" ajuda="Uma linha sobre o que a comunidade é.">
        <input
          id="c-descricao"
          value={rascunho.descricao ?? ''}
          onChange={(e) => mudar('descricao', e.target.value)}
        />
      </Campo>

      <Campo
        id="c-identidade"
        rotulo="Identidade visual"
        ajuda="Paleta, tipografia, clima, referências, o que nunca pode aparecer. Quanto mais concreto, mais consistente sai a série de artes."
      >
        <textarea
          id="c-identidade"
          style={{ minHeight: 200 }}
          value={rascunho.identidadeVisual ?? ''}
          onChange={(e) => mudar('identidadeVisual', e.target.value)}
        />
      </Campo>

      <div className="acoes">
        <button type="submit" className="primario">
          Salvar
        </button>
        <span className="ajuda" aria-live="polite">
          {salvo ? 'Salvo.' : null}
        </span>
      </div>
    </form>
  );
}

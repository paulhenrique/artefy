import { FormularioDeEvento } from './FormularioDeEvento';
import { PaginaComunidade } from './PaginaComunidade';
import { PaginaDados } from './PaginaDados';
import { PaginaEvento } from './PaginaEvento';
import { PaginaEventos } from './PaginaEventos';
import { PaginaGeracao } from './PaginaGeracao';
import { PaginaGerador } from './PaginaGerador';
import { PaginaPadroes } from './PaginaPadroes';
import { caminho, useRota } from './rotas';
import { useDocumento } from './useDocumento';

const MENU = [
  { rota: { nome: 'eventos' } as const, rotulo: 'Eventos' },
  { rota: { nome: 'comunidade' } as const, rotulo: 'Comunidade' },
  { rota: { nome: 'padroes' } as const, rotulo: 'Padrões' },
  { rota: { nome: 'dados' } as const, rotulo: 'Dados' },
];

function Conteudo() {
  const rota = useRota();
  const documento = useDocumento();

  switch (rota.nome) {
    case 'evento-novo':
      return <FormularioDeEvento />;
    case 'evento-editar': {
      const evento = documento.eventos.find((candidato) => candidato.id === rota.id);
      return evento ? <FormularioDeEvento evento={evento} /> : <PaginaEvento id={rota.id} />;
    }
    case 'evento':
      return <PaginaEvento id={rota.id} />;
    case 'gerador':
      return <PaginaGerador eventoId={rota.eventoId} tipoId={rota.tipoId} de={rota.de} />;
    case 'geracao':
      return <PaginaGeracao id={rota.id} />;
    case 'comunidade':
      return <PaginaComunidade />;
    case 'padroes':
      return <PaginaPadroes />;
    case 'dados':
      return <PaginaDados />;
    default:
      return <PaginaEventos />;
  }
}

export function App() {
  const rota = useRota();

  return (
    <div className="pagina">
      <div className="topo">
        <a className="marca" href={caminho({ nome: 'eventos' })}>
          artefy
        </a>
        <span className="ajuda">prompts de arte para eventos</span>
      </div>

      <nav className="menu" aria-label="Seções">
        {MENU.map((item) => (
          <a
            key={item.rotulo}
            href={caminho(item.rota)}
            aria-current={rota.nome === item.rota.nome ? 'page' : undefined}
          >
            {item.rotulo}
          </a>
        ))}
      </nav>

      <main>
        <Conteudo />
      </main>

      <footer className="rodape">
        Os dados ficam só neste navegador. Faça backup em <a href={caminho({ nome: 'dados' })}>Dados</a>.
      </footer>
    </div>
  );
}

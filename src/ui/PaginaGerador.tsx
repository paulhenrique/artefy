import { useMemo, useState } from 'react';
import { CAMINHO_COMUNIDADE, CAMINHO_EVENTO, carregarCatalogo } from '../nucleo/catalogo';
import { chamadaDeContagem, diasAte, marcosDeContagem } from '../nucleo/datas';
import { compor, DERIVADOS_DE_ARTE, pendencias } from '../nucleo/compositor';
import { salvarGeracao, templateResolvido } from '../nucleo/estado';
import type { Documento, Evento, Slot, TipoDeArte } from '../nucleo/tipos';
import { ErroDeTemplateAgregado } from '../nucleo/tipos';
import { BotaoCopiar, Campo } from './componentes';
import { caminho, irPara } from './rotas';
import { useDocumento } from './useDocumento';

/**
 * Numa arte de série (`serie: true` no front matter), qual slot guarda os dias. Sai do
 * registry de derivados, para nenhum id de tipo de arte ficar cravado na UI.
 */
function chaveDeDias(tipo: TipoDeArte): string | null {
  if (!tipo.serie) return null;
  const fontes = Object.values(DERIVADOS_DE_ARTE[tipo.id] ?? {}).flatMap(
    (derivado) => derivado.fontes,
  );
  const slot = tipo.slots.find((candidato) => candidato.tipo === 'numero' && fontes.includes(candidato.chave));
  return slot?.chave ?? null;
}

function valoresIniciais(tipo: TipoDeArte, base?: Record<string, string>): Record<string, string> {
  const valores: Record<string, string> = {};
  for (const slot of tipo.slots) valores[slot.chave] = base?.[slot.chave] ?? slot.padrao ?? '';
  return valores;
}

function CampoDeSlot({
  slot,
  valor,
  aoMudar,
}: {
  slot: Slot;
  valor: string;
  aoMudar: (valor: string) => void;
}) {
  const id = `slot-${slot.chave}`;
  const rotulo = slot.obrigatorio ? slot.rotulo : `${slot.rotulo} (opcional)`;

  return (
    <Campo id={id} rotulo={rotulo} ajuda={slot.ajuda}>
      {slot.tipo === 'textoLongo' ? (
        <textarea id={id} value={valor} onChange={(e) => aoMudar(e.target.value)} />
      ) : slot.tipo === 'selecao' ? (
        <select id={id} value={valor} onChange={(e) => aoMudar(e.target.value)}>
          <option value="">Escolha…</option>
          {(slot.opcoes ?? []).map((opcao) => (
            <option key={opcao} value={opcao}>
              {opcao}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={slot.tipo === 'numero' ? 'number' : slot.tipo === 'data' ? 'date' : 'text'}
          inputMode={slot.tipo === 'numero' ? 'numeric' : undefined}
          value={valor}
          onChange={(e) => aoMudar(e.target.value)}
        />
      )}
    </Campo>
  );
}

/** Atalhos da contagem regressiva: o usuário escolhe o marco, não digita o número. */
function MarcosDeContagem({
  evento,
  valor,
  aoEscolher,
}: {
  evento: Evento;
  valor: string;
  aoEscolher: (dias: string) => void;
}) {
  const restantes = diasAte(evento.data);
  if (restantes === null) return null;
  const marcos = marcosDeContagem(restantes);

  return (
    <div className="campo">
      <label htmlFor="marcos">Marcos até o evento</label>
      <div className="chips" id="marcos">
        {marcos.map((marco) => (
          <button
            key={marco}
            type="button"
            aria-pressed={valor === String(marco)}
            onClick={() => aoEscolher(String(marco))}
          >
            {chamadaDeContagem(marco)}
          </button>
        ))}
      </div>
      <p className="ajuda">
        {restantes >= 0
          ? `Hoje faltam ${restantes} dia${restantes === 1 ? '' : 's'} para o evento.`
          : 'Este evento já aconteceu.'}
      </p>
    </div>
  );
}

function montar(
  documento: Documento,
  evento: Evento,
  tipo: TipoDeArte,
  valores: Record<string, string>,
): { prompt: string; erro: string | null } {
  try {
    const prompt = compor({
      comunidade: documento.comunidade,
      evento,
      tipoDeArte: tipo,
      valores,
      templateComunidade: templateResolvido(documento, CAMINHO_COMUNIDADE),
      templateEvento: templateResolvido(documento, CAMINHO_EVENTO),
      templateArte: templateResolvido(documento, tipo.caminho),
    });
    return { prompt, erro: null };
  } catch (erro) {
    if (erro instanceof ErroDeTemplateAgregado) {
      return { prompt: '', erro: erro.erros.map((problema) => problema.mensagem).join('\n') };
    }
    throw erro;
  }
}

export function PaginaGerador({
  eventoId,
  tipoId,
  de,
}: {
  eventoId: string;
  tipoId: string;
  de?: string;
}) {
  const documento = useDocumento();
  const evento = documento.eventos.find((candidato) => candidato.id === eventoId);
  const tipo = carregarCatalogo().tipos.find((candidato) => candidato.id === tipoId);
  const origem = de ? documento.geracoes.find((geracao) => geracao.id === de) : undefined;

  const [valores, definirValores] = useState<Record<string, string>>(() =>
    tipo ? valoresIniciais(tipo, origem?.valores) : {},
  );
  const [salvo, definirSalvo] = useState(false);
  const [serie, definirSerie] = useState<{ dias: number; prompt: string }[] | null>(null);

  const resultado = useMemo(
    () => (evento && tipo ? montar(documento, evento, tipo, valores) : null),
    [documento, evento, tipo, valores],
  );

  if (!evento || !tipo || !resultado) {
    return (
      <>
        <h1>Arte não encontrada</h1>
        <div className="acoes">
          <button type="button" onClick={() => irPara({ nome: 'eventos' })}>
            Voltar aos eventos
          </button>
        </div>
      </>
    );
  }

  const chaveDia = chaveDeDias(tipo);
  const faltando = pendencias(tipo, valores);
  const mudar = (chave: string, valor: string): void => {
    definirValores((atual) => ({ ...atual, [chave]: valor }));
    definirSalvo(false);
    definirSerie(null);
  };

  /** F4: a série inteira de uma vez, um prompt por marco, já salvos no histórico. */
  const gerarSerie = (): void => {
    if (!chaveDia) return;
    const restantes = diasAte(evento.data);
    if (restantes === null) return;

    const pecas = marcosDeContagem(restantes).map((dias) => {
      const valoresDoMarco = { ...valores, [chaveDia]: String(dias) };
      return { dias, prompt: montar(documento, evento, tipo, valoresDoMarco).prompt, valoresDoMarco };
    });

    for (const peca of pecas) {
      if (peca.prompt === '') continue;
      salvarGeracao({
        eventoId: evento.id,
        tipoDeArteId: tipo.id,
        rotulo: `${tipo.nome}: ${chamadaDeContagem(peca.dias)}`,
        valores: peca.valoresDoMarco,
        prompt: peca.prompt,
      });
    }
    definirSerie(pecas.map(({ dias, prompt }) => ({ dias, prompt })));
  };

  const rotuloDaGeracao = (): string => {
    const primeiro = tipo.slots.find((slot) => slot.obrigatorio && slot.tipo !== 'selecao');
    const detalhe = primeiro ? valores[primeiro.chave]?.trim() : '';
    return detalhe ? `${tipo.nome}: ${detalhe}` : tipo.nome;
  };

  return (
    <>
      <p className="ajuda">
        <a href={caminho({ nome: 'evento', id: evento.id })}>← {evento.nome}</a>
      </p>
      <h1>{tipo.nome}</h1>
      <p className="ajuda">{tipo.descricao}</p>

      {chaveDia ? (
        <MarcosDeContagem
          evento={evento}
          valor={valores[chaveDia] ?? ''}
          aoEscolher={(dias) => mudar(chaveDia, dias)}
        />
      ) : null}

      {tipo.slots.map((slot) => (
        <CampoDeSlot
          key={slot.chave}
          slot={slot}
          valor={valores[slot.chave] ?? ''}
          aoMudar={(valor) => mudar(slot.chave, valor)}
        />
      ))}

      <h2>Prompt</h2>

      {resultado.erro ? (
        <p className="aviso erro">
          O template está quebrado, então o prompt não foi montado:
          <br />
          {resultado.erro}
        </p>
      ) : null}

      {faltando.length > 0 ? (
        <p className="aviso">
          Falta preencher: {faltando.map((pendencia) => pendencia.rotulo).join(', ')}.
        </p>
      ) : null}

      <pre className="prompt">{resultado.prompt}</pre>

      <div className="acoes">
        <BotaoCopiar texto={resultado.prompt} />
        <button
          type="button"
          disabled={faltando.length > 0 || resultado.erro !== null}
          onClick={() => {
            salvarGeracao({
              eventoId: evento.id,
              tipoDeArteId: tipo.id,
              rotulo: rotuloDaGeracao(),
              valores,
              prompt: resultado.prompt,
            });
            definirSalvo(true);
          }}
        >
          Salvar no histórico
        </button>
      </div>
      <p className="ajuda" aria-live="polite">
        {salvo ? 'Salvo no histórico deste evento.' : null}
      </p>

      {chaveDia ? (
        <>
          <h2>Série completa</h2>
          <p className="ajuda">
            Gera de uma vez um prompt para cada marco até o evento, com o mesmo layout e só o
            número mudando. Todos já entram no histórico.
          </p>
          <div className="acoes">
            <button type="button" disabled={resultado.erro !== null} onClick={gerarSerie}>
              Gerar a série
            </button>
          </div>

          {serie?.map((peca) => (
            <div key={peca.dias} className="cartao">
              <strong>{chamadaDeContagem(peca.dias)}</strong>
              <pre className="prompt" style={{ maxHeight: '30vh', marginTop: 10 }}>
                {peca.prompt}
              </pre>
              <div className="acoes">
                <BotaoCopiar texto={peca.prompt} rotulo="Copiar" primario={false} />
              </div>
            </div>
          ))}
        </>
      ) : null}
    </>
  );
}

import { describe, expect, it } from 'vitest';
import { CAMINHO_COMUNIDADE, CAMINHO_EVENTO, carregarCatalogo, templatePadrao } from './catalogo';
import { compor, comporCamadas, contextoDaArte, pendencias, SEPARADOR } from './compositor';
import type { Comunidade, Evento, TipoDeArte } from './tipos';

const comunidade: Comunidade = {
  nome: 'Dev Itapê',
  handle: '@devitape',
  identidadeVisual: 'Fundo escuro, verde-limão de destaque.',
};

const evento: Evento = {
  id: 'e1',
  nome: 'Dev Itapê Meetup',
  data: '2026-03-12',
  horario: '19h00',
  local: 'Coworking Central',
  cidade: 'Itapetininga',
  formato: 'presencial',
  criadoEm: '',
  atualizadoEm: '',
};

function tipo(id: string): TipoDeArte {
  const encontrado = carregarCatalogo().tipos.find((t) => t.id === id);
  if (!encontrado) throw new Error(`tipo ${id} não encontrado`);
  return encontrado;
}

function entrada(id: string, valores: Record<string, string>) {
  return {
    comunidade,
    evento,
    tipoDeArte: tipo(id),
    valores,
    templateComunidade: templatePadrao(CAMINHO_COMUNIDADE),
    templateEvento: templatePadrao(CAMINHO_EVENTO),
    templateArte: templatePadrao(`/templates/artes/${id}.md`),
  };
}

describe('comporCamadas', () => {
  it('devolve as três camadas na ordem do PRD', () => {
    const camadas = comporCamadas(
      entrada('palestrante', { nomePalestrante: 'Ana Souza', tituloPalestra: 'React sem medo' }),
    );
    expect(camadas.map((camada) => camada.nome)).toEqual(['Comunidade', 'Evento', 'Card de palestrante']);
  });
});

describe('compor', () => {
  it('coloca a comunidade antes do evento e o evento antes da arte', () => {
    const texto = compor(
      entrada('palestrante', { nomePalestrante: 'Ana Souza', tituloPalestra: 'React sem medo' }),
    );
    expect(texto.indexOf('Dev Itapê')).toBeLessThan(texto.indexOf('Dev Itapê Meetup'));
    expect(texto.indexOf('Dev Itapê Meetup')).toBeLessThan(texto.indexOf('Ana Souza'));
  });

  it('não deixa nenhum marcador sem resolver', () => {
    for (const t of carregarCatalogo().tipos) {
      const valores = Object.fromEntries(t.slots.map((slot) => [slot.chave, `valor de ${slot.chave}`]));
      const texto = compor(entrada(t.id, valores));
      expect(texto, t.id).not.toContain('{{');
    }
  });

  it('separa as camadas de forma visível', () => {
    expect(compor(entrada('anuncio', { chamada: 'Vem aí' }))).toContain(SEPARADOR.trim());
  });

  it('omite o que é opcional e ficou em branco', () => {
    const semLocal = { ...evento, local: undefined, cidade: undefined };
    const texto = compor({ ...entrada('anuncio', { chamada: 'Vem aí' }), evento: semLocal });
    expect(texto).not.toContain('Local:');
  });

  it('usa o dado do evento em vez de pedir de novo na arte', () => {
    const texto = compor(entrada('palestrante', { nomePalestrante: 'Ana', tituloPalestra: 'X' }));
    expect(texto).toContain('Dev Itapê Meetup');
    expect(texto).toContain('12 de março de 2026');
  });
});

describe('contextoDaArte', () => {
  it('deriva a chamada da contagem regressiva a partir dos dias', () => {
    const contexto = contextoDaArte(tipo('contagem-regressiva'), { diasRestantes: '1' });
    expect(contexto.chamadaContagem).toBe('é amanhã');
  });

  it('aplica o valor padrão do slot quando nada foi digitado', () => {
    const contexto = contextoDaArte(tipo('palestrante'), {});
    expect(contexto.formatoPeca).toBe('feed quadrado 1:1');
  });

  it('não deriva chamada quando os dias não são um número', () => {
    const contexto = contextoDaArte(tipo('contagem-regressiva'), { diasRestantes: '' });
    expect(contexto.chamadaContagem).toBe('');
  });
});

describe('pendencias', () => {
  it('aponta os obrigatórios em branco', () => {
    expect(pendencias(tipo('palestrante'), {}).map((p) => p.chave)).toEqual([
      'nomePalestrante',
      'tituloPalestra',
    ]);
  });

  it('fica vazio quando tudo obrigatório está preenchido', () => {
    const valores = { nomePalestrante: 'Ana', tituloPalestra: 'X' };
    expect(pendencias(tipo('palestrante'), valores)).toEqual([]);
  });

  it('considera preenchido o obrigatório que tem valor padrão', () => {
    const chaves = pendencias(tipo('anuncio'), { chamada: 'Vem aí' }).map((p) => p.chave);
    expect(chaves).not.toContain('formatoPeca');
  });
});

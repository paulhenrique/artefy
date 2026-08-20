import { beforeEach, describe, expect, it } from 'vitest';
import {
  CHAVE,
  CHAVE_BACKUP,
  carregar,
  documentoPadrao,
  exportar,
  importar,
  migrar,
  salvar,
} from './armazenamento';
import { VERSAO_DO_SCHEMA } from './tipos';

beforeEach(() => localStorage.clear());

describe('carregar', () => {
  it('parte do documento padrão quando não há nada salvo', () => {
    const doc = carregar();
    expect(doc.schemaVersion).toBe(VERSAO_DO_SCHEMA);
    expect(doc.eventos).toEqual([]);
  });

  it('faz round-trip do que foi salvo', () => {
    const doc = documentoPadrao();
    doc.comunidade = { nome: 'Dev Itapê' };
    salvar(doc);
    expect(carregar().comunidade.nome).toBe('Dev Itapê');
  });

  it('preserva o valor corrompido em backup antes de recomeçar', () => {
    localStorage.setItem(CHAVE, '{isso não é json');
    const doc = carregar();
    expect(doc.eventos).toEqual([]);
    expect(localStorage.getItem(CHAVE_BACKUP)).toBe('{isso não é json');
  });
});

describe('migrar', () => {
  it('sobe um documento sem schemaVersion', () => {
    const doc = migrar({ eventos: [{ nome: 'Meetup', data: '2026-03-12' }] });
    expect(doc.schemaVersion).toBe(VERSAO_DO_SCHEMA);
    expect(doc.eventos).toHaveLength(1);
    expect(doc.eventos[0]?.id).toBeTruthy();
    expect(doc.eventos[0]?.formato).toBe('presencial');
  });

  it('descarta evento sem os campos obrigatórios em vez de gravar lixo', () => {
    const doc = migrar({ eventos: [{ nome: 'Sem data' }, { nome: 'Ok', data: '2026-03-12' }] });
    expect(doc.eventos.map((evento) => evento.nome)).toEqual(['Ok']);
  });

  it('normaliza formato inválido para presencial', () => {
    const doc = migrar({ eventos: [{ nome: 'X', data: '2026-01-01', formato: 'metaverso' }] });
    expect(doc.eventos[0]?.formato).toBe('presencial');
  });

  it('mantém overrides de template', () => {
    const doc = migrar({ overridesDeTemplate: { '/templates/comunidade.md': '# meu' } });
    expect(doc.overridesDeTemplate['/templates/comunidade.md']).toBe('# meu');
  });

  it('aguenta entrada de tipo completamente errado', () => {
    expect(migrar(null).eventos).toEqual([]);
    expect(migrar('texto').eventos).toEqual([]);
    expect(migrar({ eventos: 'não é array' }).eventos).toEqual([]);
  });
});

describe('exportar e importar', () => {
  it('faz round-trip sem perder dado', () => {
    const doc = documentoPadrao();
    doc.comunidade = { nome: 'Dev Itapê', handle: '@devitape' };
    doc.eventos = [
      {
        id: 'e1',
        nome: 'Meetup',
        data: '2026-03-12',
        formato: 'hibrido',
        local: 'Coworking',
        criadoEm: '2026-01-01T00:00:00.000Z',
        atualizadoEm: '2026-01-01T00:00:00.000Z',
      },
    ];
    const resultado = importar(exportar(doc));
    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;
    expect(resultado.documento.eventos[0]?.local).toBe('Coworking');
    expect(resultado.documento.eventos[0]?.formato).toBe('hibrido');
    expect(resultado.documento.comunidade.handle).toBe('@devitape');
  });

  it('recusa JSON inválido com mensagem legível', () => {
    const resultado = importar('{{{');
    expect(resultado.ok).toBe(false);
    if (resultado.ok) return;
    expect(resultado.erro).toMatch(/JSON/);
  });

  it('recusa JSON que não é backup do artefy', () => {
    const resultado = importar('{"outra":"coisa"}');
    expect(resultado.ok).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';
import { compilar, limpar, renderizar, variaveisUsadas } from './motor';
import { ErroDeTemplateAgregado } from './tipos';

const contexto = {
  comunidade: { nome: 'Dev Itapê' },
  evento: { nome: 'Meetup', horario: '', local: 'Coworking' },
  arte: { chamada: 'Vem aí' },
};

describe('renderizar', () => {
  it('substitui variáveis por namespace', () => {
    expect(renderizar('{{comunidade.nome}} — {{arte.chamada}}', contexto)).toBe('Dev Itapê — Vem aí');
  });

  it('renderiza o bloco quando a condicional tem valor', () => {
    expect(renderizar('{{#se evento.local}}em {{evento.local}}{{/se}}', contexto)).toBe('em Coworking');
  });

  it('some com o bloco quando a condicional está vazia', () => {
    expect(renderizar('a{{#se evento.horario}} às {{evento.horario}}{{/se}}', contexto)).toBe('a');
  });

  it('trata valor ausente como vazio, não como "undefined"', () => {
    expect(renderizar('[{{evento.cidade}}]', contexto)).toBe('[]');
  });

  it('não deixa marcador para trás', () => {
    const saida = renderizar('{{comunidade.nome}} {{evento.nome}} {{arte.chamada}}', contexto);
    expect(saida).not.toContain('{{');
  });

  it('lança quando a variável não tem namespace', () => {
    expect(() => renderizar('{{nome}}', contexto)).toThrow(ErroDeTemplateAgregado);
  });

  it('lança quando o namespace não existe', () => {
    expect(() => renderizar('{{palestrante.nome}}', contexto)).toThrow(ErroDeTemplateAgregado);
  });

  it('lança quando o {{#se}} não é fechado', () => {
    expect(() => renderizar('{{#se evento.local}}x', contexto)).toThrow(ErroDeTemplateAgregado);
  });

  it('lança quando há {{/se}} sobrando', () => {
    expect(() => renderizar('x{{/se}}', contexto)).toThrow(ErroDeTemplateAgregado);
  });

  it('preserva markdown com chave simples no meio', () => {
    expect(renderizar('```js\nconst a = { b: 1 };\n```', contexto)).toContain('{ b: 1 }');
  });
});

describe('compilar', () => {
  it('reporta todos os problemas de uma vez, sem parar no primeiro', () => {
    const { erros } = compilar('{{a}} {{b}} {{#se c}}');
    expect(erros.length).toBeGreaterThanOrEqual(3);
  });

  it('lista as variáveis usadas, incluindo as de condicional', () => {
    expect(variaveisUsadas('{{#se arte.x}}{{arte.y}}{{/se}}').sort()).toEqual(['arte.x', 'arte.y']);
  });
});

describe('limpar', () => {
  it('colapsa as linhas em branco deixadas por condicionais falsas', () => {
    expect(limpar('a\n\n\n\nb')).toBe('a\n\nb');
  });

  it('remove espaço no fim das linhas e nas pontas', () => {
    expect(limpar('  \na   \n  ')).toBe('a');
  });
});

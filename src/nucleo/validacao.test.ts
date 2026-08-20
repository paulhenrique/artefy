import { describe, expect, it } from 'vitest';
import { carregarCatalogo } from './catalogo';
import { validarRepositorio, validarTexto } from './validacao';

/**
 * Este arquivo é o `npm run validar:templates`. Ele guarda as regras invioláveis de
 * docs/SINTAXE-DE-TEMPLATE.md contra todo template versionado no repositório.
 */

describe('templates do repositório', () => {
  it('não tem nenhum problema de validação', () => {
    const relatorios = validarRepositorio();
    const resumo = relatorios
      .flatMap((relatorio) => relatorio.erros.map((erro) => `[${erro.tipo}] ${erro.mensagem}`))
      .join('\n');
    expect(resumo, `\n${resumo}\n`).toBe('');
  });

  it('carrega pelo menos os seis tipos de arte da v1', () => {
    const { tipos, erros } = carregarCatalogo();
    expect(erros).toEqual([]);
    expect(tipos.map((tipo) => tipo.id).sort()).toEqual([
      'agradecimento',
      'anuncio',
      'contagem-regressiva',
      'inscricoes',
      'palestrante',
      'programacao',
    ]);
  });

  it('dá a todo slot obrigatório um rótulo em português', () => {
    for (const tipo of carregarCatalogo().tipos) {
      for (const slot of tipo.slots) {
        expect(slot.rotulo.length, `${tipo.id}.${slot.chave}`).toBeGreaterThan(2);
      }
    }
  });
});

describe('validarTexto', () => {
  it('reprova variável sem namespace', () => {
    const erros = validarTexto('olá {{nome}}', 'teste', { comunidade: ['nome'] });
    expect(erros[0]?.tipo).toBe('variavel-sem-namespace');
  });

  it('reprova namespace indisponível na camada', () => {
    const erros = validarTexto('{{arte.x}}', 'teste', { comunidade: ['nome'] });
    expect(erros[0]?.tipo).toBe('namespace-desconhecido');
  });

  it('reprova chave que não existe no namespace', () => {
    const erros = validarTexto('{{comunidade.inventada}}', 'teste', { comunidade: ['nome'] });
    expect(erros[0]?.tipo).toBe('variavel-nao-declarada');
  });

  it('aceita condicional bem formada', () => {
    const erros = validarTexto('{{#se comunidade.nome}}{{comunidade.nome}}{{/se}}', 'teste', {
      comunidade: ['nome'],
    });
    expect(erros).toEqual([]);
  });
});

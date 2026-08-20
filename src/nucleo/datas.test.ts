import { describe, expect, it } from 'vitest';
import {
  chamadaDeContagem,
  dataExtenso,
  diaDaSemana,
  diasAte,
  hojeISO,
  marcosDeContagem,
  paraDataLocal,
} from './datas';

describe('paraDataLocal', () => {
  it('interpreta a data no fuso local, sem escorregar um dia', () => {
    const data = paraDataLocal('2026-03-12');
    expect(data?.getDate()).toBe(12);
    expect(data?.getMonth()).toBe(2);
  });

  it('devolve null para entrada fora do formato', () => {
    expect(paraDataLocal('12/03/2026')).toBeNull();
    expect(paraDataLocal('')).toBeNull();
  });
});

describe('formatação', () => {
  it('escreve a data por extenso em pt-BR', () => {
    expect(dataExtenso('2026-03-12')).toContain('março');
    expect(dataExtenso('2026-03-12')).toContain('2026');
  });

  it('devolve string vazia para data inválida em vez de "Invalid Date"', () => {
    expect(dataExtenso('sem data')).toBe('');
    expect(diaDaSemana('sem data')).toBe('');
  });
});

describe('diasAte', () => {
  it('conta dias inteiros até a data', () => {
    expect(diasAte('2026-03-12', '2026-03-07')).toBe(5);
  });

  it('devolve 0 no dia do evento', () => {
    expect(diasAte('2026-03-12', '2026-03-12')).toBe(0);
  });

  it('devolve negativo depois do evento', () => {
    expect(diasAte('2026-03-12', '2026-03-15')).toBe(-3);
  });

  it('atravessa a virada de mês e de ano', () => {
    expect(diasAte('2027-01-01', '2026-12-30')).toBe(2);
  });

  it('hojeISO sai no formato do modelo de dados', () => {
    expect(hojeISO(new Date(2026, 2, 5))).toBe('2026-03-05');
  });
});

describe('chamadaDeContagem', () => {
  it('resolve os casos especiais sem o usuário digitar texto', () => {
    expect(chamadaDeContagem(0)).toBe('é hoje');
    expect(chamadaDeContagem(1)).toBe('é amanhã');
    expect(chamadaDeContagem(5)).toBe('faltam 5 dias');
    expect(chamadaDeContagem(-1)).toBe('já aconteceu');
  });
});

describe('marcosDeContagem', () => {
  it('só oferece marcos que ainda cabem antes do evento', () => {
    expect(marcosDeContagem(4)).toEqual([3, 2, 1, 0]);
  });

  it('para um evento hoje, sobra só o zero', () => {
    expect(marcosDeContagem(0)).toEqual([0]);
  });

  it('não devolve marco para evento passado', () => {
    expect(marcosDeContagem(-5)).toEqual([0]);
  });
});

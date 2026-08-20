/** Datas do artefy. Tudo em `YYYY-MM-DD` e sempre interpretado no fuso local. */

const FORMATO_ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

/** `new Date('2026-03-12')` é meia-noite UTC e pode virar o dia anterior aqui. */
export function paraDataLocal(iso: string): Date | null {
  const achado = FORMATO_ISO.exec(iso.trim());
  if (!achado) return null;
  const [, ano, mes, dia] = achado;
  const data = new Date(Number(ano), Number(mes) - 1, Number(dia));
  return Number.isNaN(data.getTime()) ? null : data;
}

export function hojeISO(agora: Date = new Date()): string {
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${agora.getFullYear()}-${mes}-${dia}`;
}

export function dataExtenso(iso: string): string {
  const data = paraDataLocal(iso);
  if (!data) return '';
  return data.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function diaDaSemana(iso: string): string {
  const data = paraDataLocal(iso);
  if (!data) return '';
  return data.toLocaleDateString('pt-BR', { weekday: 'long' });
}

export function dataCurta(iso: string): string {
  const data = paraDataLocal(iso);
  if (!data) return '';
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const MS_POR_DIA = 24 * 60 * 60 * 1000;

/** Dias inteiros entre hoje e a data do evento. Negativo = evento já passou. */
export function diasAte(iso: string, referenciaISO: string = hojeISO()): number | null {
  const alvo = paraDataLocal(iso);
  const referencia = paraDataLocal(referenciaISO);
  if (!alvo || !referencia) return null;
  return Math.round((alvo.getTime() - referencia.getTime()) / MS_POR_DIA);
}

/** O texto que vai dominar a peça de contagem regressiva. */
export function chamadaDeContagem(dias: number): string {
  if (dias < 0) return 'já aconteceu';
  if (dias === 0) return 'é hoje';
  if (dias === 1) return 'é amanhã';
  return `faltam ${dias} dias`;
}

/** Os marcos de uma série de contagem regressiva, filtrados pelos dias que ainda cabem. */
export function marcosDeContagem(diasRestantes: number): number[] {
  return [15, 10, 7, 5, 3, 2, 1, 0].filter((marco) => marco <= Math.max(diasRestantes, 0));
}

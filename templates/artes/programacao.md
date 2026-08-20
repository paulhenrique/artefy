---
id: programacao
nome: Programação
descricao: Peça com a grade de horários do evento.
ordem: 4
slots:
  - chave: grade
    rotulo: Grade
    tipo: textoLongo
    obrigatorio: true
    ajuda: "Uma linha por item, no formato: 19h00 — Título da palestra — Nome do palestrante"
  - chave: formatoPeca
    rotulo: Formato da peça
    tipo: selecao
    obrigatorio: true
    padrao: "feed quadrado 1:1"
    opcoes:
      - "feed quadrado 1:1"
      - "stories 9:16"
      - "banner horizontal 16:9"
---

# Arte — programação

Gere a arte da programação do evento no formato **{{arte.formatoPeca}}**.

## Textos que devem aparecer na peça

Título da peça: "Programação"

Nome do evento: "{{evento.nome}}" e data: "{{evento.dataExtenso}}"

Itens da grade, nesta ordem e com esta grafia exata:

{{arte.grade}}

## Composição

A grade é uma lista vertical alinhada, com o horário à esquerda em coluna própria, para que
os horários se alinhem entre si. Cada item respira do seguinte. Legibilidade vence
ornamento: se a grade for longa, reduza o ornamento, nunca o corpo do texto.

## Restrições

Reproduza os itens exatamente como listados, sem reordenar, resumir ou completar. Não
acrescente item que não esteja na lista.

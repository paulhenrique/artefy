---
id: contagem-regressiva
nome: Contagem regressiva
descricao: Série de peças de urgência — faltam N dias, é amanhã, é hoje.
ordem: 3
serie: true
slots:
  - chave: diasRestantes
    rotulo: Dias restantes
    tipo: numero
    obrigatorio: true
    ajuda: "0 = é hoje, 1 = é amanhã"
  - chave: reforco
    rotulo: Texto de reforço
    tipo: texto
    ajuda: "Ex.: Últimas vagas. Deixe vazio para uma peça mais limpa."
  - chave: formatoPeca
    rotulo: Formato da peça
    tipo: selecao
    obrigatorio: true
    padrao: "stories 9:16"
    opcoes:
      - "stories 9:16"
      - "feed quadrado 1:1"
---

# Arte — contagem regressiva

Gere uma peça de contagem regressiva no formato **{{arte.formatoPeca}}**.

## Textos que devem aparecer na peça

1. Chamada dominante, ocupando a maior parte da peça: "{{arte.chamadaContagem}}"
2. Nome do evento: "{{evento.nome}}"
3. Data: "{{evento.dataExtenso}}"{{#se evento.horario}}, horário: "{{evento.horario}}"{{/se}}
{{#se arte.reforco}}4. Reforço, pequeno: "{{arte.reforco}}"{{/se}}

## Composição

Esta peça existe para criar urgência: a contagem é enorme e domina o enquadramento; todo o
resto é rodapé. Se houver um número na chamada, ele é o maior elemento gráfico da arte.

Esta peça é uma da série de contagem regressiva. Todas as peças da série precisam ser
visualmente idênticas entre si, mudando apenas o número — mesma posição, mesmo corpo de
texto, mesmo enquadramento.

## Restrições

Nenhum texto além dos listados. Não invente contador de horas ou minutos. Não use relógio
ou ampulheta como elemento decorativo.

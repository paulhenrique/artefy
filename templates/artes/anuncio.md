---
id: anuncio
nome: Anúncio do evento
descricao: Peça principal que apresenta o evento e abre a divulgação.
ordem: 1
slots:
  - chave: chamada
    rotulo: Chamada principal
    tipo: texto
    obrigatorio: true
    ajuda: "O texto grande da peça. Ex.: Vem aí o maior encontro dev da cidade"
  - chave: subtitulo
    rotulo: Subtítulo
    tipo: texto
    ajuda: "Uma linha de apoio, opcional"
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

# Arte — anúncio do evento

Gere uma arte de anúncio do evento no formato **{{arte.formatoPeca}}**.

## Textos que devem aparecer na peça

1. Chamada principal, em maior destaque: "{{arte.chamada}}"
{{#se arte.subtitulo}}2. Subtítulo, subordinado à chamada: "{{arte.subtitulo}}"{{/se}}
3. Nome do evento: "{{evento.nome}}"
4. Data: "{{evento.dataExtenso}}"{{#se evento.horario}} e horário: "{{evento.horario}}"{{/se}}
{{#se evento.local}}5. Local: "{{evento.local}}"{{/se}}

## Composição

A chamada principal ocupa o centro óptico e é a primeira coisa que se lê. Data e local
formam um bloco menor e agrupado, claramente secundário. O nome do evento aparece como
assinatura da peça, não competindo com a chamada.

## Restrições

Nenhum texto além dos listados acima. Sem logotipo inventado, sem nomes de pessoas, sem
QR code.

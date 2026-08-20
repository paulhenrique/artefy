---
id: inscricoes
nome: Chamada de inscrições
descricao: Peça de conversão, apontando para o link de inscrição.
ordem: 5
slots:
  - chave: chamada
    rotulo: Chamada
    tipo: texto
    obrigatorio: true
    ajuda: "Ex.: Inscrições abertas"
  - chave: argumento
    rotulo: Argumento
    tipo: texto
    ajuda: "Um motivo para se inscrever agora. Ex.: vagas limitadas"
  - chave: formatoPeca
    rotulo: Formato da peça
    tipo: selecao
    obrigatorio: true
    padrao: "stories 9:16"
    opcoes:
      - "stories 9:16"
      - "feed quadrado 1:1"
---

# Arte — chamada de inscrições

Gere uma peça de chamada para inscrição no formato **{{arte.formatoPeca}}**.

## Textos que devem aparecer na peça

1. Chamada em destaque máximo: "{{arte.chamada}}"
{{#se arte.argumento}}2. Argumento, logo abaixo: "{{arte.argumento}}"{{/se}}
3. Nome do evento: "{{evento.nome}}"
4. Data: "{{evento.dataExtenso}}"
{{#se evento.linkInscricao}}5. Link, legível e sem abreviar: "{{evento.linkInscricao}}"{{/se}}

## Composição

Deixe um espaço de respiro claro em volta do link — é para onde o olho precisa terminar
indo. A chamada entra primeiro, o link fecha.

## Restrições

Nenhum texto além dos listados. Não desenhe botão falso de interface, não invente QR code,
não encurte nem altere o link.

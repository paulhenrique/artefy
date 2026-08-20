---
id: agradecimento
nome: Agradecimento pós-evento
descricao: Peça de encerramento, publicada depois que o evento aconteceu.
ordem: 6
slots:
  - chave: mensagem
    rotulo: Mensagem
    tipo: textoLongo
    obrigatorio: true
    ajuda: "Ex.: Obrigado a quem veio. Foi a maior edição até agora."
  - chave: numeros
    rotulo: Números do evento
    tipo: texto
    ajuda: "Ex.: 120 pessoas, 4 palestras. Opcional."
  - chave: formatoPeca
    rotulo: Formato da peça
    tipo: selecao
    obrigatorio: true
    padrao: "feed quadrado 1:1"
    opcoes:
      - "feed quadrado 1:1"
      - "stories 9:16"
---

# Arte — agradecimento pós-evento

Gere a peça de encerramento do evento no formato **{{arte.formatoPeca}}**.

## Textos que devem aparecer na peça

1. Mensagem principal: "{{arte.mensagem}}"
{{#se arte.numeros}}2. Números do evento, como um bloco destacado: "{{arte.numeros}}"{{/se}}
3. Nome do evento: "{{evento.nome}}"
4. Data em que aconteceu: "{{evento.dataExtenso}}"

## Composição

O tom aqui é de celebração e fechamento, não de convite — nada de urgência, nada de
chamada para ação. A mensagem é o assunto; se houver números, eles viram um bloco de
destaque próprio, com os algarismos maiores que os rótulos.

## Restrições

Nenhum texto além dos listados. Não invente números, nomes de participantes ou depoimentos.
Não inclua fotos de rostos reconhecíveis.

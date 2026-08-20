---
id: palestrante
nome: Card de palestrante
descricao: Arte individual anunciando um palestrante e a talk dele.
ordem: 2
slots:
  - chave: nomePalestrante
    rotulo: Nome do palestrante
    tipo: texto
    obrigatorio: true
    ajuda: "Grafia exata, como deve aparecer na arte"
  - chave: tituloPalestra
    rotulo: Título da palestra
    tipo: texto
    obrigatorio: true
  - chave: cargo
    rotulo: Cargo e empresa
    tipo: texto
    ajuda: "Ex.: Engenheira de Software na TOTVS"
  - chave: horarioPalestra
    rotulo: Horário da palestra
    tipo: texto
    ajuda: "Só se for diferente do horário do evento"
  - chave: descricaoFoto
    rotulo: Como tratar a foto
    tipo: textoLongo
    ajuda: "Ex.: recorte circular à direita, fundo removido. Deixe vazio se não houver foto."
  - chave: formatoPeca
    rotulo: Formato da peça
    tipo: selecao
    obrigatorio: true
    padrao: "feed quadrado 1:1"
    opcoes:
      - "feed quadrado 1:1"
      - "stories 9:16"
---

# Arte — card de palestrante

Gere o card de divulgação de um palestrante, no formato **{{arte.formatoPeca}}**.

## Textos que devem aparecer na peça

1. Nome do palestrante, em destaque, grafado exatamente assim: "{{arte.nomePalestrante}}"
{{#se arte.cargo}}2. Cargo, menor e logo abaixo do nome: "{{arte.cargo}}"{{/se}}
3. Título da palestra, com peso visual próprio: "{{arte.tituloPalestra}}"
4. Nome do evento como assinatura: "{{evento.nome}}"
5. Data: "{{evento.dataExtenso}}"
{{#se arte.horarioPalestra}}6. Horário desta palestra: "{{arte.horarioPalestra}}"{{/se}}

## Composição

{{#se arte.descricaoFoto}}Tratamento da foto: {{arte.descricaoFoto}}{{/se}}

O nome e o título da palestra são o assunto da peça e dividem o protagonismo — o nome
identifica, o título convence. Data e nome do evento ficam em um rodapé discreto.

Este card faz parte de uma série: outros palestrantes vão receber a mesma peça com nome e
título diferentes. Monte um layout que continue funcionando com um nome curto ou longo.

## Restrições

Nenhum texto além dos listados. Não escreva bio, não invente empresa, não adicione ícones
de rede social com @ inventado.

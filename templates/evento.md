# Contexto — o evento

- **Evento:** "{{evento.nome}}"{{#se evento.edicao}} — {{evento.edicao}}{{/se}}
- **Data:** {{evento.dataExtenso}} ({{evento.diaSemana}})
{{#se evento.horario}}- **Horário:** {{evento.horario}}{{/se}}
- **Formato:** {{evento.formato}}
{{#se evento.local}}- **Local:** {{evento.local}}{{/se}}
{{#se evento.cidade}}- **Cidade:** {{evento.cidade}}{{/se}}
{{#se evento.linkInscricao}}- **Inscrições:** {{evento.linkInscricao}}{{/se}}
{{#se evento.hashtag}}- **Hashtag:** {{evento.hashtag}}{{/se}}
{{#se evento.observacoes}}
Observações do evento: {{evento.observacoes}}
{{/se}}

Use essas informações como verdade. Se alguma delas não aparecer na peça, tudo bem — mas
nenhuma informação diferente destas pode aparecer.

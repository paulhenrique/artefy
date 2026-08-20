---
name: novo-tipo-de-arte
description: Adiciona um tipo de arte novo ao artefy (ex. card de patrocinador, arte de encerramento, story de bastidor). Use quando alguém pedir "quero gerar uma arte de X" e X ainda não existir em templates/artes/.
---

# Adicionar um tipo de arte

Por desenho, um tipo de arte novo é **um arquivo markdown e nada mais**. Se você se pegar
editando componente de UI ou registry em código para isso, pare: ou o desenho regrediu, ou
o pedido não é um tipo de arte novo.

## 1. Escolher o id

kebab-case, sem acento, descreve a peça e não a ocasião: `patrocinador`, não
`card-do-patrocinador-2026`. O arquivo é `templates/artes/<id>.md`.

## 2. Separar o que é slot do que não é

Passe cada dado da peça por este filtro:

- muda a cada geração desta arte → **slot**
- é constante do evento (nome, data, horário, local, link) → `{{evento.x}}`
- é constante da comunidade (nome, identidade, tom) → `{{comunidade.x}}` ou, melhor,
  não escreva nada: a camada 0 já entrega isso

Slot que duplica campo de evento é reprovado pelo `npm run validar:templates`.

## 3. Escrever o arquivo

Front matter declarando `id`, `nome`, `descricao` e `slots` (veja
`docs/SINTAXE-DE-TEMPLATE.md` para os campos de slot). Depois o corpo, que é o prompt de
geração de imagem.

Copie a estrutura de `templates/artes/palestrante.md` — ele é a referência do projeto.

No corpo:
- diga o formato e a proporção da peça;
- liste, entre aspas e com grafia exata, todo texto que deve aparecer na arte;
- descreva a hierarquia visual (o que domina, o que é secundário);
- feche com as restrições;
- **não** repita instrução de estilo visual que já está em `templates/comunidade.md`.

## 4. Verificar

```
npm run validar:templates
```

Ele checa: variável sem namespace, namespace desconhecido, `{{#se}}` sem fechamento, slot
declarado e não usado, slot usado e não declarado, e slot duplicando campo de evento.

Depois abra a app e gere a arte de verdade com um evento real. Leia o prompt montado inteiro
antes de dizer que está pronto — a validação garante sintaxe, não garante que o texto presta.

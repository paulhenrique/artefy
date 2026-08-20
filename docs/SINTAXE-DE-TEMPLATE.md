# Sintaxe de template

Os arquivos em `templates/` são markdown comum com interpolação. O motor é
propositalmente minúsculo: sem lógica, sem loops arbitrários, sem expressões.

## Namespaces

Toda variável é `{{namespace.chave}}`. Só existem três namespaces:

| Namespace | Origem | Disponível em |
|---|---|---|
| `comunidade.*` | perfil da comunidade | todas as camadas |
| `evento.*` | evento selecionado | camadas 1 e 2 |
| `arte.*` | slots do tipo de arte | apenas camada 2 |

Uma variável sem namespace é erro de validação. Uma variável de namespace desconhecido é
erro de validação.

## Condicional

```
{{#se arte.cargo}}Cargo: {{arte.cargo}}{{/se}}
```

Renderiza o bloco apenas se o valor existir e não for string vazia. Não há `senão`, não há
aninhamento. Um `{{#se}}` sem `{{/se}}` correspondente é erro de validação.

## Derivados

Alguns valores são calculados, não digitados. São expostos como variáveis normais:

| Variável | Como é calculada |
|---|---|
| `evento.dataExtenso` | `evento.data` formatada em pt-BR ("12 de março de 2026") |
| `evento.diaSemana` | dia da semana de `evento.data` |
| `arte.chamadaContagem` | para `contagem-regressiva`: "faltam 5 dias", "é amanhã", "é hoje" a partir de `arte.diasRestantes` |

Derivados são declarados no registry do tipo de arte, nunca inventados no template.

## Front matter

Cada template de arte começa com front matter YAML declarando seus slots. **O front matter
é a única declaração de slots** — o registry em código lê daí, não duplica.

```markdown
---
id: palestrante
nome: Card de palestrante
descricao: Arte individual anunciando um palestrante e sua talk.
slots:
  - chave: nomePalestrante
    rotulo: Nome do palestrante
    tipo: texto
    obrigatorio: true
  - chave: cargo
    rotulo: Cargo e empresa
    tipo: texto
    ajuda: "Ex.: Engenheira de Software na TOTVS"
---

Gere a arte de divulgação do palestrante **{{arte.nomePalestrante}}** ...
```

## Regras invioláveis

1. Um slot de arte **nunca** repete um campo do evento. Use `{{evento.x}}`.
2. `chave` é camelCase, sem acento, única dentro do tipo de arte.
3. Todo `{{arte.x}}` usado no corpo tem que estar declarado em `slots` (ou ser derivado).
4. Todo slot declarado tem que ser usado no corpo — slot morto é erro.

As regras 1–4 são verificadas por `npm run validar:templates`, que roda no CI.

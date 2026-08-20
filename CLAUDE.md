# artefy

Gerador de prompts de arte para eventos de comunidade. Site estático, 100% client-side,
dados no `localStorage`. **Não gera imagem — gera o texto do prompt** para colar no ChatGPT.

## Leia primeiro

- `docs/PRD.md` — o produto. Fonte de verdade; se um código contraria o PRD, o código está errado.
- `docs/MODELO-DE-DADOS.md` — forma do documento salvo e invariantes de persistência.
- `docs/SINTAXE-DE-TEMPLATE.md` — sintaxe dos templates e regras de slot.

## A ideia central

O prompt final é a concatenação de três camadas, sempre nesta ordem:

```
comunidade (identidade visual, constante)  →  evento (dados do evento)  →  arte (peça específica)
```

Um dado mora em **uma** camada só. Slot de arte que repete campo de evento é defeito — use
`{{evento.x}}`.

## Estrutura

```
templates/            markdown versionado; comunidade.md, evento.md, artes/*.md
docs/                 PRD e contratos
src/nucleo/           domínio: armazenamento, motor de template, catálogo, compositor
src/ui/               React, mobile-first, CSS próprio
scripts/              smoke.mjs (Playwright), publicar.sh (gh-pages)
```

A validação de templates mora em `src/nucleo/validacao.ts` e roda como teste
(`src/nucleo/validacao.test.ts`), para não duplicar a lógica do motor.

## Comandos

```
npm run dev                 servidor de desenvolvimento
npm run typecheck
npm run lint
npm run test
npm run validar:templates   checa slots e sintaxe dos templates
npm run build && npm run preview   preview serve em /artefy/, como em produção
```

## Regras do projeto

- Só `src/nucleo/armazenamento.ts` toca `localStorage`.
- Adicionar um tipo de arte = adicionar um markdown em `templates/artes/`. Se exigir código
  novo de UI, o desenho quebrou.
- Mudou a forma do documento salvo → `schemaVersion` sobe e a migração entra no mesmo PR.
- Sem backend, sem banco, sem chamada a API de IA, sem token ou segredo em lugar nenhum.
- Publicado em `/artefy/`: nada de caminho absoluto começando com `/`.

## Ferramental

Skills: `planejar-feature`, `novo-tipo-de-arte`, `publicar`.
Subagentes: `guardiao-do-prd`, `arquiteto-de-prompt`, `nucleo-dev`, `ui-dev`, `qa-artefy`,
`publicador`.

Para feature nova, comece pela skill `planejar-feature`.

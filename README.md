# artefy

Gerador de prompts de arte para eventos de comunidade.

Você cadastra o evento uma vez, escolhe o tipo de arte, preenche só o que muda naquela peça
e recebe o prompt pronto para colar no ChatGPT. **A app não gera imagem — gera o texto do
prompt.**

👉 https://paulhenrique.github.io/artefy/

## Por que existe

Divulgar um evento pede uma série de artes — anúncio, card de cada palestrante, contagem
regressiva, grade, agradecimento — e todas compartilham o mesmo contexto: a identidade
visual da comunidade e os dados do evento. Redigitar isso a cada prompt é lento e produz
artes que não parecem da mesma família.

## As três camadas

O prompt final é sempre a soma de três camadas, nesta ordem:

```
comunidade      identidade visual, paleta, tom          quase nunca muda
    ↓
evento          nome, data, horário, local, link        muda a cada evento
    ↓
arte            o objetivo daquela peça específica      muda a cada geração
```

Um dado mora em uma camada só. O card de palestrante não pergunta o nome do evento — ele
usa `{{evento.nome}}`.

## Tipos de arte

Anúncio · Card de palestrante · Contagem regressiva · Programação · Chamada de inscrições ·
Agradecimento.

Todos são arquivos markdown em [`templates/artes/`](templates/artes). Adicionar um tipo novo
é adicionar um arquivo — não há código a mexer.

## Dados

Tudo fica no `localStorage` do navegador. Sem backend, sem conta, sem banco. Para levar de um
aparelho a outro, use exportar/importar JSON em **Dados**.

## Desenvolvimento

```bash
npm install
npm run dev

npm run typecheck
npm run lint
npm run test
npm run validar:templates
npm run build && npm run preview   # preview serve em /artefy/, como em produção
```

Documentação de projeto: [`docs/PRD.md`](docs/PRD.md),
[`docs/MODELO-DE-DADOS.md`](docs/MODELO-DE-DADOS.md),
[`docs/SINTAXE-DE-TEMPLATE.md`](docs/SINTAXE-DE-TEMPLATE.md).

---
name: planejar-feature
description: Planeja uma mudança no artefy ancorada no PRD antes de escrever código. Use quando o pedido for uma feature nova, uma mudança de comportamento, um tipo de arte novo, ou qualquer coisa que atravesse mais de um arquivo. Também use quando o pedido chegar vago ("queria poder X") e for preciso transformá-lo em escopo.
---

# Planejar uma feature do artefy

O artefy é um gerador de prompts em camadas. Quase toda feature nova toca em pelo menos um
de três lugares — camada de template, núcleo, UI — e o erro mais caro do projeto é colocar
uma regra na camada errada. Este roteiro existe para decidir isso **antes** de digitar.

## 1. Ancorar

Leia `docs/PRD.md` inteiro e a parte relevante de `docs/MODELO-DE-DADOS.md` e
`docs/SINTAXE-DE-TEMPLATE.md`. Não pule por achar que já sabe: o PRD é a única fonte de
verdade e ele muda.

## 2. Classificar o pedido

Encaixe o pedido em uma destas caixas antes de qualquer outra coisa:

| Caixa | Sinal | Onde mexe |
|---|---|---|
| **Texto de prompt** | "a arte tá saindo ruim", "quero que o card mostre X" | só `templates/` — nenhum código |
| **Tipo de arte novo** | "quero uma arte de Y" | um markdown novo em `templates/artes/` (veja a skill `novo-tipo-de-arte`) |
| **Campo de evento** | o dado é constante para todas as artes daquele evento | modelo de dados + migração + formulário de evento + `templates/evento.md` |
| **Fluxo/tela** | "queria conseguir fazer Z mais rápido" | `src/ui/` consumindo núcleo existente |
| **Regra de domínio** | cálculo, validação, persistência, composição | `src/nucleo/` + testes |

Se o pedido não couber em nenhuma caixa, ele provavelmente contraria um não-objetivo do
PRD (seção 3). Diga isso ao humano antes de planejar.

## 3. As três perguntas que evitam retrabalho

1. **Esse dado já existe em outra camada?** Se sim, referencie — não duplique. Slot de arte
   que repete campo de evento é o defeito mais comum deste projeto.
2. **Isso exige código novo, ou só um markdown novo?** Se um tipo de arte novo exigir tocar
   em componente de UI, o desenho quebrou: conserte o desenho, não a feature.
3. **Isso muda a forma do documento salvo?** Se sim, `schemaVersion` sobe e a migração entra
   no mesmo PR, com teste que carrega um documento da versão anterior.

## 4. Escrever o plano

Formato: passos numerados, cada um com os arquivos que vão mudar e o critério de pronto
verificável daquele passo. Ordem obrigatória:

```
1. docs/ (se o PRD ou o modelo mudam)
2. templates/ (se a camada de texto muda)
3. src/nucleo/ + testes
4. src/ui/
5. verificação (typecheck, lint, test, validar:templates, build, smoke)
```

Nunca planeje UI antes do núcleo que ela consome.

## 5. Passar pelo guardião

Antes de implementar, mande o plano para o subagente `guardiao-do-prd`. Se ele responder
`AJUSTAR` ou `CONTRARIA O PRD`, corrija o plano — ou atualize o PRD explicitamente, no mesmo
PR, com o parágrafo que ele propôs.

## Delegação

- texto de template → `arquiteto-de-prompt`
- domínio, storage, motor → `nucleo-dev`
- telas → `ui-dev`
- verificação final → `qa-artefy`
- publicação → `publicador`

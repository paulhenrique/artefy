# PRD — artefy

> Fonte de verdade do produto. Qualquer plano, agente ou PR deve ser coerente com este
> documento. Se uma mudança contraria o PRD, o PRD é atualizado **no mesmo PR** — nunca
> divergido em silêncio.

## 1. Problema

Divulgar um evento de comunidade exige uma série de artes: anúncio, card de cada
palestrante, contagem regressiva, grade, agradecimento. Todas essas artes são geradas por
IA (ChatGPT) e todas compartilham **o mesmo contexto**: a identidade visual da comunidade e
os dados do evento. Hoje esse contexto é redigitado à mão a cada prompt, o que é lento e
produz artes inconsistentes entre si.

## 2. Solução

Um site estático que **monta prompts em camadas**. O usuário cadastra o evento uma vez,
escolhe o tipo de arte, preenche só o que é específico daquela arte, e recebe o prompt
final pronto para colar no ChatGPT.

Não gera imagem. Não chama API de IA. **Gera texto de prompt.**

## 3. Não-objetivos

- Não há backend, banco de dados, autenticação ou conta de usuário.
- Não há chamada à API da OpenAI/Anthropic/qualquer IA.
- Não há editor de imagem, upload de arquivo ou preview visual da arte.
- Não há colaboração multiusuário nem sincronização entre dispositivos (além do
  export/import manual de JSON).
- Design não é prioridade: minimalista, legível, mobile-first. Nada de design system.

## 4. As três camadas do prompt

O prompt final é a concatenação ordenada de três camadas. **Essa ordem é invariante.**

| # | Camada | Onde mora | Muda com que frequência |
|---|--------|-----------|-------------------------|
| 0 | **Comunidade** — identidade visual, paleta, tipografia, tom, regras de composição, o que nunca pode aparecer na arte | `templates/comunidade.md` (versionado no repo) + override no localStorage | Quase nunca |
| 1 | **Evento** — nome, edição, data, horário, local, formato, link de inscrição, hashtag | `templates/evento.md` (estrutura) preenchido com os dados do evento salvo | A cada evento |
| 2 | **Arte** — objetivo daquela peça específica e seus campos próprios | `templates/artes/<id>.md` + valores preenchidos no formulário | A cada geração |

Regra de ouro: **um dado nunca aparece em duas camadas.** Se é constante do evento, mora na
camada 1 e a camada 2 apenas o referencia. Se um tipo de arte precisa de um dado que já é
constante do evento, ele usa `{{evento.x}}` — não cria um slot novo.

## 5. Entidades

### Comunidade (perfil)
Uma só, global. Nome, handle/@, descrição curta, notas de identidade visual (texto livre)
e o override do template `comunidade.md`.

### Evento
O que é constante para **todas** as artes daquele evento:

| Campo | Obrigatório | Observação |
|---|---|---|
| `nome` | sim | Nome do evento |
| `edicao` | não | Ex.: "3ª edição" |
| `data` | sim | ISO `YYYY-MM-DD` — base da contagem regressiva |
| `horario` | não | Ex.: "19h00" |
| `local` | não | Nome do espaço |
| `cidade` | não | |
| `formato` | sim | `presencial` \| `online` \| `hibrido` |
| `linkInscricao` | não | |
| `hashtag` | não | |
| `observacoes` | não | Texto livre que entra na camada 1 |

### Tipo de arte
Definido por um template markdown + uma lista de **slots**. Um slot tem `chave`, `rotulo`,
`tipo` (`texto` \| `textoLongo` \| `numero` \| `data` \| `selecao`), `obrigatorio`, `padrao`,
`ajuda` e, para `selecao`, `opcoes`.

Tipos de arte na v1 (todos editáveis; a lista é extensível sem mexer em código de UI):

1. `anuncio` — anúncio/save the date do evento
2. `palestrante` — card de um palestrante e sua talk
3. `contagem-regressiva` — "faltam N dias", "é amanhã", "é hoje"
4. `programacao` — grade de horários
5. `inscricoes` — chamada para inscrição
6. `agradecimento` — pós-evento

### Geração
Um prompt já montado e salvo: `eventoId`, `tipoDeArteId`, os `valores` dos slots, o texto
final e a data. Serve de histórico e de ponto de partida para duplicar ("mesmo card, outro
palestrante").

## 6. Fluxos

**F1 — Cadastrar evento.** Formulário → salva no localStorage → aparece na lista de eventos.

**F2 — Gerar arte.** Escolhe evento → escolhe tipo de arte → preenche só os slots daquela
arte → vê o prompt montado → copia. Um clique, sem etapas intermediárias.

**F3 — Repetir arte.** Abre uma geração salva → altera o que mudou (ex.: outro palestrante)
→ copia de novo.

**F4 — Contagem regressiva em lote.** Para o tipo `contagem-regressiva`, oferecer gerar de
uma vez a série a partir da data do evento (ex.: 7, 5, 3, 1 dia e "é hoje"), já com o texto
de cada dia resolvido.

**F5 — Ajustar o padrão.** Editar o template markdown de uma camada dentro da app (override
salvo no localStorage), com botão de "voltar ao padrão do repositório". A edição definitiva
é um commit em `templates/` — o override local é o rascunho.

**F6 — Backup.** Exportar tudo (comunidade, eventos, gerações, overrides) como um JSON e
reimportar em outro dispositivo. É o único mecanismo de sincronização.

## 7. Persistência

`localStorage`, chave única `artefy:v1`, um objeto JSON com `schemaVersion`. Toda leitura
passa por uma função de migração que sabe subir versões antigas. Nunca ler `localStorage`
direto num componente.

## 8. Templates no repositório

`templates/` é versionado no GitHub e entra no bundle em tempo de build, importado como
texto bruto. Isso cumpre o objetivo da seção 9 de forma mais forte do que copiar arquivos
para o output: não há requisição de rede nenhuma no caminho principal, então a app funciona
offline e não depende do repositório estar acessível.

A edição definitiva de um template é um commit em `templates/`. Se existir override local
para aquele template, o override vence em runtime; a tela de padrões mostra o override em
edição e dá acesso ao padrão do repositório para comparação, além do botão de reset.

## 9. Restrições técnicas

- 100% client-side; publicado em GitHub Pages sob `/artefy/` (base path importa).
- Funciona no navegador do celular; layout mobile-first.
- Sem dependência de rede em runtime para o caminho principal.
- Sem chave de API, sem token, sem segredo em lugar nenhum do código ou do localStorage.

## 10. Critérios de aceite da v1

- [ ] Cadastro, edição e exclusão de eventos, persistidos entre recarregamentos.
- [ ] Os 6 tipos de arte geram prompt com as 3 camadas na ordem correta.
- [ ] Copiar o prompt em um clique.
- [ ] Contagem regressiva calcula os dias a partir da data do evento e resolve
      "amanhã"/"hoje" sem o usuário digitar o número.
- [ ] Gerações salvas podem ser reabertas e duplicadas.
- [ ] Templates editáveis com reset ao padrão do repositório.
- [ ] Export/import JSON íntegro (round-trip sem perda).
- [ ] Nenhum slot de arte duplica um campo do evento (validado por script no CI).
- [ ] Publicado e acessível em GitHub Pages.

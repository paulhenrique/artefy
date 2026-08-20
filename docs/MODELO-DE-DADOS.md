# Modelo de dados

Tudo vive em `localStorage`, chave `artefy:v1`, num único documento JSON.

```ts
type Documento = {
  schemaVersion: number;          // atual: 1
  comunidade: Comunidade;
  eventos: Evento[];
  geracoes: Geracao[];
  overridesDeTemplate: Record<string, string>; // caminho do template -> markdown
  atualizadoEm: string;           // ISO
};

type Comunidade = {
  nome: string;
  handle?: string;
  descricao?: string;
  identidadeVisual?: string;      // texto livre; entra na camada 0
};

type Evento = {
  id: string;                     // crypto.randomUUID()
  nome: string;
  edicao?: string;
  data: string;                   // YYYY-MM-DD
  horario?: string;
  local?: string;
  cidade?: string;
  formato: 'presencial' | 'online' | 'hibrido';
  linkInscricao?: string;
  hashtag?: string;
  observacoes?: string;
  criadoEm: string;
  atualizadoEm: string;
};

type Geracao = {
  id: string;
  eventoId: string;
  tipoDeArteId: string;
  rotulo: string;                 // como aparece no histórico
  valores: Record<string, string>;// valores dos slots
  prompt: string;                 // texto final montado, congelado
  criadoEm: string;
};
```

## Invariantes

- `schemaVersion` sobe sempre que a forma muda; `migrar()` cobre todas as versões
  anteriores e nunca joga dado fora sem antes tentar converter.
- Documento corrompido ou ilegível → cai para o documento padrão **sem apagar** o valor
  bruto anterior (guardado em `artefy:v1:backup`).
- `Geracao.prompt` é congelado no momento da geração. Editar template não reescreve
  histórico; a app mostra "gerado com template anterior" quando o recomposto difere.
- Nenhuma escrita direta em `localStorage` fora de `src/nucleo/armazenamento.ts`.

---
name: publicar
description: Publica o artefy no GitHub Pages. Use quando pedirem para publicar, subir, fazer deploy, ou quando o site em produção estiver desatualizado ou quebrado.
---

# Publicar o artefy

Site estático em `https://paulhenrique.github.io/artefy/`, publicado pelo workflow do
GitHub Actions a cada push na `main`.

## Antes de empurrar

```
npm run typecheck && npm run lint && npm run test && npm run validar:templates && npm run build
```

Depois `npm run preview` e **percorra o app no preview**, não no dev server. O dev server
serve na raiz e o Pages serve em `/artefy/` — bug de base path só aparece no preview.
Confira no console do navegador que nenhum template deu 404.

## Empurrar

```
git push -u origin main
```

Acompanhe o run em Actions. Quando ficar verde, abra a URL pública e confirme: a página
carrega, os templates carregam, e um prompt monta de ponta a ponta.

## Se estiver quebrado

- **Página em branco, 404 nos assets** → `base` do Vite fora de sincronia com o nome do repo.
- **404 só nos templates** → caminho montado sem `import.meta.env.BASE_URL`.
- **404 ao recarregar fora da raiz** → SPA sem fallback; confirme que `404.html` foi gerado.
- **Workflow não roda** → Settings → Pages → Source precisa estar em "GitHub Actions". Isso
  só o dono do repo consegue clicar; peça a ele.

O subagente `publicador` cuida disso ponta a ponta se você preferir delegar.

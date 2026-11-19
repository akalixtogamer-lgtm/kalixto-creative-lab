# Como trabalhar neste projeto

## Branches

- `main` é o tronco. Nada vai para lá sem PR.
- Uma branch por assunto, curta (dias, não semanas): `feat/…`, `fix/…`, `chore/…`, `docs/…`.
- Depois do merge, apague a branch (no GitHub e na sua máquina).
- Para trabalhar em duas branches ao mesmo tempo, use **worktree** em vez de clonar de novo:

  ```bash
  git worktree add ../kalixto-creative-lab-kcx feat/kcx-figma-bridge
  git worktree list
  git worktree remove ../kalixto-creative-lab-kcx   # quando terminar
  ```

## Antes de abrir um PR

```bash
npm install          # também ativa o gancho de pre-commit (husky)
npm run verificar    # formatação, lint, tipos do plugin, código gerado, testes e build
```

O mesmo conjunto roda sozinho no GitHub em todo push e PR (`.github/workflows/ci.yml`).
O pre-commit formata e corrige o lint só dos arquivos do commit (`lint-staged`).

## Regras que o lint garante

- O núcleo do KCX (`src/app/kcx`) é TypeScript puro: não importa Angular nem telas.
- `src/app/core` não importa de `src/app/pages`.
- Sem `any`.
- `src/app/efeitos-angular` e `src/app/kcx-angular` são **gerados**: mude o gerador em
  `scripts/gerar-*.ts` e rode `npm run gerar:angular` / `npm run gerar:kcx-angular`.

## Componentes salvos no navegador (KCX)

O formato guardado tem versão (`kalixto-lab:kcx-meus:v2`). Se mudar o formato do
`KcxComponente`, acrescente a conversão em `migrarComponente()`
(`src/app/kcx/meus-componentes.ts`) e um teste. Nada que deixa de validar é apagado:
vai para “Para recuperar” no KCX Studio.

## Publicar

Somente manual: GitHub → Actions → “Publicar no GitHub Pages” → digitar `PUBLICAR`.

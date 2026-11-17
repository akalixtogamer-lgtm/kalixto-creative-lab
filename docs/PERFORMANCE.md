# Performance

Este documento corresponde ao `PERFORMANCE.md` pedido no Master Prompt. Os
números vêm do `ng build --verbose` (produção) de 17/11/2026.

## Pacotes

| Pacote | Bruto | Transferido (estimado) |
|---|---|---|
| Inicial (main + estilos) — Fase 2 | 294,34 kB | 78,71 kB |
| Chunk `efeito` (página do efeito) — Fase 2, com Code Lab e Explainer | 36,06 kB | 10,46 kB |
| Chunk `biblioteca` | 53,60 kB | 12,82 kB |

A Fase 1 aumentou o pacote inicial em 0,42 kB (por causa do ícone e da rota). Os
kits só são carregados quando a Biblioteca ou a página de um efeito é aberta.

## Decisões

- **Preview em iframe:** o código do efeito roda num documento separado. Ao sair
  da página, o iframe é destruído junto com os timers e listeners, então não
  sobra nada rodando na aplicação.
- **Debounce de 120 ms** ao arrastar um slider, para não recarregar o iframe a cada pixel.
- **Kits:** animam `transform` e `opacity` sempre que possível. Quando animam
  `box-shadow`, `background-position` ou uma custom property, a ficha avisa na
  seção Performance.
- **Ponteiro:** os efeitos de ponteiro (magnético, tilt) usam
  `requestAnimationFrame` para fazer no máximo uma atualização por quadro, e só
  enquanto o ponteiro se move.
- **Busca:** a Biblioteca pré-calcula o texto de busca de cada item
  (`INDICE`). Cada tecla percorre só 70 strings já normalizadas.

## Ainda não medido

FPS, CPU, GPU e memória de cada efeito ainda não foram medidos com o
Performance panel. Isso é feito na Fase 7, com o método de medição documentado.
Nenhum número desse tipo aparece na plataforma enquanto não for medido.

## Fase 2

- **Realce de sintaxe sem `[innerHTML]`:** a primeira versão usava `[innerHTML]` e isso trazia o sanitizador de HTML do Angular para o pacote inicial (+5,5 kB). Com os trechos renderizados como texto no template, o pacote inicial voltou a 294,34 kB.
- **Componente Angular no preview sem `NgComponentOutlet`:** ele é criado com `ViewContainerRef.createComponent`, para não puxar código do `@angular/common` para o pacote inicial.
- **Componentes Angular dos kits:** cada um vira um chunk separado e só é baixado ao escolher o modo "Angular".
- **ZIP:** é gerado no navegador, sem compressão, porque os arquivos são pequenos e assim não precisa de biblioteca.

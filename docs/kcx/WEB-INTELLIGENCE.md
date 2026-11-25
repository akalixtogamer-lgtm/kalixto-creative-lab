# KCX Web Intelligence

Investiga experiências web, reconhece efeitos, gera fichas técnicas e reconstrói cada efeito como
componente KCX próprio, que segue direto para o Reference vs. Reconstruction (`/kcx/comparar`).

Não há tela nova: tudo fica na aba **Análise** da comparação.

```
Referência → Análise → Efeitos identificados → Reconstrução → Comparação → Ajustes → Aprovação → Motion Library
```

## 1. Arquitetura

```
src/app/kcx/analise/            ← núcleo (TypeScript puro, sem Angular)
  tipos.ts                      fichas, coleta do site, tecnologias, quadros, resultado
  catalogo.ts                   os 12 efeitos: o que é, como aparece no vídeo e no DOM, reconstrução, limites
  coletor.ts                    SCRIPT_COLETOR: roda no navegador da pessoa, no próprio site
  investigar.ts                 lerColeta, coletaDoHtml (HTML salvo), investigar (tecnologias + fichas)
  video.ts                      analisarSequencia: análise temporal por blocos (sem DOM)
  reconstruir.ts                ficha → componente KCX (tipo do construtor) e ficha → marco
  ler.ts                        leitura defensiva da análise guardada na comparação
src/app/kcx/construtor/tipos/movimento/efeito-web.ts
                                tipo “Efeito de movimento (web)” com os 12 efeitos
src/app/pages/kcx/kcx-comparar/cmp-analise.*   aba Análise
src/app/pages/kcx/kcx-comparar/captura.ts      quadros em tons de cinza (vídeo e frames)
```

A análise é guardada em `SessaoComparacao.analise` (fichas, investigação, resumo do vídeo e o mapa
ficha → componente). Exportar/importar a comparação leva tudo junto.

## 2. Entrada de referências

| Entrada | Como |
|---|---|
| URL | Painel A (iframe, quando o site deixa) + investigação na aba Análise |
| Vídeo MP4, MOV, WEBM | Aba Referência (guardado no IndexedDB). MOV/HEVC depende do navegador; a página explica como converter |
| Capturas de tela e sequências de imagens | Aba Referência → Enviar imagens; a análise compara os frames em ordem |

## 3. Investigação de sites

O lab está no GitHub Pages e **não pode ler o DOM de outro domínio** (CORS). Três caminhos, do mais
completo ao mais limitado:

1. **Coletor** (recomendado): a pessoa cola o script no Console do próprio navegador, com o site
   aberto. Ele **só lê** e baixa `coleta-kcx.json`; nada é enviado. Coleta: scripts, folhas de estilo
   (as de outro domínio são contadas como inacessíveis), `@keyframes`, regras com transição/animação,
   `animation-timeline`/`view-timeline`, `position: sticky`, scroll-snap, View Transitions,
   `backdrop-filter`, `:hover`, `perspective`, animações em andamento (`document.getAnimations()`, com
   o tipo de timeline), recursos carregados (`performance`), globais de bibliotecas, marcadores de
   DOM, elementos fixos/sticky e indícios de eventos.
2. **Ler HTML direto** (`fetch` com CORS): funciona só quando o site permite; quando não, a página
   explica e indica o coletor.
3. **HTML salvo**: “Salvar página como…”. Sem JavaScript rodando: globais e animações não aparecem.

### Classificação das tecnologias

| Situação | Exige |
|---|---|
| **Confirmada** | prova direta: global em `window` (ex.: `gsap`, `THREE`), script da biblioteca carregado, elemento/classe que só a biblioteca cria (`.swiper-initialized`, `html.lenis`, `lottie-player`), CSS lido (`animation-timeline`) |
| **Provável** | indício: nome de classe (`.swiper`, `.pin-spacer`), atributo (`data-framer-*`), palavra em script, canvas com biblioteca 3D (WebGL) |
| **Não identificada** | nenhum sinal; sempre listadas: GSAP, ScrollTrigger, Framer Motion, Motion, Three.js, WebGL, Lottie, Lenis, Swiper e CSS Scroll-driven Animations |

WebGL nunca é “confirmada”: abrir um contexto num canvas alteraria o site, e o coletor não faz isso.

## 4. Análise de vídeo

Cada quadro vira tons de cinza com 96 px de largura e uma grade de blocos (3 colunas). Entre dois
quadros, cada bloco busca o deslocamento vertical e horizontal que melhor explica a mudança (soma das
diferenças absolutas). Trechos seguidos com o mesmo comportamento viram um trecho da linha do tempo.

| Efeito | Regra |
|---|---|
| Rolagem | os blocos andam juntos na vertical (≥ 2 pares de quadros) |
| Parallax | na mesma rolagem, blocos a ≤ 0,75× ou ≥ 1,35× da velocidade do maior grupo |
| Sticky | blocos parados em ≥ 60% dos pares enquanto o resto rola (faixa no topo = cabeçalho fixo) |
| Card stacking | conteúdo trocando dentro da área parada |
| Horizontal scroll | deslocamento horizontal sem vertical |
| Scroll reveal | bloco liso que ganha detalhe de repente durante a rolagem |
| Profundidade | bordas se afastando (ou aproximando) do centro |
| Transição | ≥ 55% da tela muda sem deslocamento (corte em 1 par, suave em vários), ou troca numa região grande |
| Texto animado | mudança só numa faixa horizontal fina |
| Morphing | região pequena/média mudando por ≥ 3 pares sem se deslocar |
| Hover | mudança rápida em até 2 blocos com o resto parado |
| Glassmorphism | região com bem menos detalhe que a vizinhança e tão clara quanto ela, em vários quadros |
| Cursor | **não** é detectado por vídeo (gravações de celular não mostram o cursor): vem do DOM ou de marcação manual |

A curva (easing) é estimada comparando o progresso medido com as curvas comuns. O mesmo efeito na
mesma região vira **uma** ficha com as ocorrências.

Toda ficha de vídeo diz “Vídeo — sem DOM” e nunca afirma tecnologia.

## 5. Ficha técnica

Nome, tipo, origem (DOM do site / HTML salvo / vídeo / manual), confiança (alta/média/baixa), início e
fim (e ocorrências), região, evidências medidas, parâmetros (duração, distância, velocidade, direção,
fator, intensidade, curva), tecnologias ligadas (só DOM/HTML) e a entrada do catálogo (o que é, como
aparece, como o KCX reconstrói, limitações).

## 6. Reconstrução

“Reconstruir e comparar” cria um componente do tipo **Efeito de movimento (web)** (construtor), salva
em Meus componentes, põe no Painel B e cria o marco na linha do tempo.

- Só CSS e um JavaScript pequeno (IntersectionObserver, scroll e pointermove), **sem dependências**.
- Variáveis: duração do efeito, distância, intensidade, atraso entre itens, curva, estado final, além
  de cores, raio, espaço, fonte, textos e cards.
- Estados Início/Fim; responsivo (`@media (max-width: 560px)`, grade com `minmax(0, 1fr)`);
  `prefers-reduced-motion` (CSS e JS); compatibilidade e limitações declaradas.
- As medidas entram como valor inicial (`ConfigConstrutor.valores`) e continuam editáveis; reabrir no
  construtor mantém as medidas. A duração de um trecho de rolagem **não** vira duração de animação.

Depois disso o componente é um KCX comum: editar, **duplicar** (novo botão no editor, com prefixo
próprio), comparar, ajustar, versionar, aprovar, virar variante, ir para a Motion Library, entrar nas
Telas, substituir outro, trocar uma seção de molde (hero, carrossel, galeria ↔ efeito web) e exportar.

## 7. Critérios de aceitação

| # | Critério | Prova |
|---|---|---|
| 1 | Aceita URL, MP4/MOV/WEBM, capturas e sequências | aba Referência; `accept` do vídeo |
| 2 | Investiga DOM, CSS, bibliotecas, recursos, animações, scroll e transições respeitando CORS | `analise.spec.ts` (coletor rodando no jsdom, HTML salvo, coleta do DOM) + Chrome real (GSAP 3.12.5, ScrollTrigger, Three r160, Lenis, Swiper e `view()` encontrados) |
| 3 | Distingue confirmada / provável / não identificada | `analise.spec.ts` |
| 4 | Não alega DOM quando a análise é por vídeo | origem “Vídeo — sem DOM” em toda ficha de vídeo; `video.spec.ts` |
| 5 | Reconhece efeitos por análise temporal | `video.spec.ts` (sticky, parallax 0,5×, horizontal, corte, easing) + gravação real (trocas de slide de um anúncio viraram “Transição”, 10 ocorrências) |
| 6 | Ficha técnica por efeito | aba Análise |
| 7 | Cada efeito vira componente KCX com nome, categoria, preview, código, variáveis, estados, responsividade, dependências, compatibilidade e documentação | `analise.spec.ts` (12 efeitos), `construtor.spec.ts` (12 animações: pacote válido, CSS só com variáveis definidas, Figma sem falhas), Chrome real (os 12 se movem) |
| 8 | Efeito → comparação → biblioteca | Chrome real: Reconstruir → Painel B → versão → aprovação → Motion Library |
| 9 | Editar, duplicar, substituir, variante, Motion Library, Telas, moldes, exportar | `analise.spec.ts` (integração), `meus-componentes.spec.ts` (duplicar) |
| 10 | Sem regressões | `npm run verificar` (1169 testes) e `npm run build:pages` |

## 8. Limitações conhecidas

- Análise de vídeo é estimativa: confiança baixa ou média, nunca alta. Camadas sobrepostas podem virar
  uma; carrossel arrastado e scroll horizontal parecem iguais; hover e cursor dependem do que aparece.
- O coletor não lista listeners de eventos (só indícios) nem lê folhas de estilo de outro domínio.
- Bibliotecas empacotadas sem global nem marcador próprio podem ficar “não identificadas”.
- Cenas 3D reais (Three.js/WebGL) viram aproximação 2D com CSS.
- No Figma, as variantes Início/Fim mostram o mesmo quadro: o movimento fica documentado e no código.
- A auditoria automática de acessibilidade (axe) não foi rodada nesta entrega.

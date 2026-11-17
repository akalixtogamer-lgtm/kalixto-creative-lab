# Tecnologias e bibliotecas

Avaliação pedida na seção 16 do Master Prompt. Corresponde ao `TECHNOLOGIES.md`.

**Regra adotada:** usar recurso nativo quando ele resolve. Uma biblioteca só
entra quando traz ganho concreto, e seu tamanho é medido no build antes de ser
documentado.

## Já no projeto

| Tecnologia | Uso | Licença | Situação |
|---|---|---|---|
| HTML5, CSS3, SVG, JavaScript | Base de todos os kits (os 10 da Fase 1 não usam bibliotecas) | — | Em uso |
| TypeScript 6.0 | Toda a aplicação | Apache-2.0 | Em uso |
| Angular 22.2 | Aplicação, rotas lazy, signals | MIT | Em uso |
| GSAP 3.15 (+ ScrollTrigger, SplitText, MorphSVG, DrawSVG, MotionPath) | Laboratórios GSAP, Scroll, SVG e Interface | Licença padrão gratuita da GSAP, sem custo, inclusive para uso comercial e para os plugins (a partir da 3.13) | Em uso |
| Three.js 0.187 | Laboratórios Three.js e WebGL/GLSL | MIT | Em uso (chunk lazy de 614,99 kB, só nessas páginas) |
| WebGL / GLSL | Shaders do laboratório WebGL | — | Em uso via Three.js |

## Avaliadas, não instaladas

O peso de cada uma será medido no build quando houver motivo para instalar.

| Biblioteca | Finalidade | Licença | Necessidade agora |
|---|---|---|---|
| Lenis | Rolagem suave (smooth scroll) | MIT | **Não.** Rolagem suave muda a sensação de toda a página e pode atrapalhar quem usa teclado ou leitor de tela. Entra na Fase 3 como demonstração isolada, com desligamento por redução de movimento |
| Lottie (lottie-web) | Tocar animações exportadas do After Effects | MIT | Não. Só faz sentido com arquivos `.json` próprios. Avaliar na Fase 5 |
| Rive | Animações interativas com máquina de estados | MIT (runtime) | Não. Depende de arquivos `.riv` criados no editor do Rive. Avaliar na Fase 5 |
| PixiJS | Renderização 2D acelerada (WebGL) | MIT | Não. Canvas 2D nativo atende partículas simples. Avaliar se a Fase 5 precisar de milhares de sprites |
| Web Animations API | Animar via JavaScript sem biblioteca | Nativa | Já citada como alternativa nas fichas; kits com WAAPI entram na Fase 2 |
| Canvas API | Partículas e desenho procedural | Nativa | Fase 5 |

## Ferramentas de desenvolvimento

- **Testes:** Vitest e jsdom.
- **QA:** Playwright e axe-core, fora do repositório.
- **Docs:** `esbuild`, que já vem com o `@angular/build`, roda `npm run docs:efeitos` sem dependência nova.
- **Atualizações disponíveis:** `typescript` 7 e `jsdom` 31 são versões *major*. Não foram atualizados para não arriscar a compatibilidade com o Angular 22.2.

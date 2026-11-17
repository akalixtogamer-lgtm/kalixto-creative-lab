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
| Lenis 1.3.27 | Rolagem suave, **só** no kit "Rolagem suave" | MIT | Em uso desde a Fase 3. A aplicação continua com rolagem nativa |

### Bibliotecas usadas pelos kits (Fase 3)

Os kits que dependem de biblioteca recebem o arquivo minificado do próprio `node_modules`. O `angular.json` copia esses arquivos para `/vendor` no build. Os tamanhos abaixo foram medidos nesses arquivos:

| Arquivo | Tamanho | Kits |
|---|---|---|
| `gsap.min.js` (3.15.1) | 73.357 B | Revelar ao rolar com GSAP |
| `ScrollTrigger.min.js` (3.15.1) | 44.683 B | Revelar ao rolar com GSAP |
| `lenis.min.js` (1.3.27) | 18.815 B | Rolagem suave |

Eles só são baixados ao abrir a página de um desses kits e não entram no pacote inicial.

## Avaliação do Lenis (Fase 3)

- **Decisão:** instalado, mas só para o kit de demonstração, dentro do iframe isolado.
- **Por que não na aplicação inteira:** a rolagem suave muda a sensação de toda a página e pode atrapalhar quem usa teclado, leitor de tela ou rolagem por âncoras.
- **No kit:** o Lenis não é iniciado com `prefers-reduced-motion`. As âncoras usam `lenis.scrollTo` e o modo "nativo" permite comparar com `scroll-behavior: smooth`.

## Avaliadas, não instaladas

O peso de cada uma será medido no build quando houver motivo para instalar.

| Biblioteca | Finalidade | Licença | Necessidade agora |
|---|---|---|---|
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

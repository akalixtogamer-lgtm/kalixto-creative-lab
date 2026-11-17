# Segurança e isolamento

Como o laboratório executa código de exemplo sem expor a aplicação. Este
documento corresponde ao `SECURITY.md` pedido no Master Prompt.

## Preview dos efeitos (`/efeitos/:id`)

| Camada | O que faz | Onde |
|---|---|---|
| `iframe sandbox="allow-scripts"` | O documento roda numa **origem opaca**. Sem `allow-same-origin`, ele não lê o `localStorage`, os cookies nem o DOM do Angular, e não chama nada da página pai. Também não abre pop-ups, não envia formulários e não navega a página de cima | `pages/efeito/efeito.html` |
| CSP do documento | `default-src 'none'` bloqueia qualquer acesso à rede (fetch, imagens, fontes e iframes externos). Só o CSS e o JS embutidos podem rodar | `core/efeitos/sandbox.ts` (`CSP_PREVIEW`) |
| Escape de `</script>` e `</style>` | O código não consegue fechar a tag antes da hora e injetar HTML | `sandbox.ts` (`proteger`) |
| Sem `eval` / `new Function` | A aplicação nunca transforma texto em código no contexto do Angular | Verificado por busca no código |
| Atributo `sandbox` estático | O Angular recusa bind dinâmico de `sandbox` (NG0910), e isso é bom: o valor não pode ser alterado em tempo de execução | `efeito.html` |

### Verificação feita em 17/11/2026 (Chromium, Playwright)

Dentro do preview de cada um dos 10 kits:

- `localStorage` → **bloqueado** (`SecurityError`)
- `parent.document` → **bloqueado** (`SecurityError`)
- `fetch('https://example.com')` → **bloqueado** pelo CSP (`TypeError`)

O teste unitário `efeitos.spec.ts` garante que o CSP está no documento, que o
escape de `</script>` funciona e que o iframe não tem `allow-same-origin`.

## Edição de código (Code Lab, Fase 2)

- **Onde roda:** o código editado vai para o **mesmo iframe isolado**, com o mesmo sandbox e o mesmo CSP. Ele nunca é executado no contexto do Angular.
- **CSP não pode ser afrouxado:** um `<meta http-equiv="Content-Security-Policy">` escrito no HTML editado fica no `<body>` e é ignorado pelo navegador. Além disso, uma política extra só consegue *restringir* mais, nunca liberar.
- **Limite de tamanho:** 50.000 caracteres por arquivo (`LIMITE_EDICAO`), para não travar o navegador.
- **Nada é salvo:** a edição fica só na memória da página e some ao recarregar, então nenhum código é reexecutado automaticamente em outra visita. A persistência de experimentos (Fase 4) vai guardar o código como texto e não vai executar nada sozinha.
- **Sem `innerHTML`:** o realce de sintaxe renderiza trechos como texto, então o código exibido não é interpretado como HTML na página.

## O que ainda não existe

- **Importação de arquivos:** quando existir, os arquivos serão validados (tipo, tamanho, JSON com esquema) antes de qualquer uso.

## Demos dos laboratórios

As 60 demos antigas rodam no contexto do Angular, mas o código delas é fixo,
escrito no repositório. Não há código vindo do usuário. O único `innerHTML`
(`ui-cenas.ts`) monta um SVG a partir de constantes do próprio projeto.

## Dependências

`npm audit --omit=dev` em 17/11/2026: **0 vulnerabilidades**.

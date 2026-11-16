# Problemas conhecidos

| # | Descrição | Impacto | Situação |
|---|---|---|---|
| 1 | No GitHub Pages, abrir um link direto (ex.: `/labs/css`) passa pelo `404.html` — a página carrega normalmente, mas o servidor responde com código 404. | Baixo (só afeta indexação em buscadores) | Aceito |
| 2 | Botões desabilitados nos labs sem demo pareciam quebrados. | Médio (UX) | ✅ Corrigido na 0.2.0 |
| 3 | As demos do CSS Playground animam mesmo com "reduzir movimento" ativado no sistema, porque o movimento é o conteúdo da aula. A demo Floating pode ser pausada no botão. | Baixo | Reavaliar na Fase 6 (acessibilidade) |

Encontrou algo nos testes? Adicione uma linha aqui.

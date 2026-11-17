# Problemas conhecidos

| # | Descrição | Impacto | Situação |
|---|---|---|---|
| 1 | No GitHub Pages, abrir um link direto (ex.: `/labs/css`) passa pelo `404.html`: a página carrega normalmente, mas o servidor responde com código 404. | Baixo (só afeta buscadores) | Aceito — limitação do GitHub Pages |
| 2 | As demos animam mesmo com "reduzir movimento" ligado no sistema, porque o movimento é o conteúdo da aula. Animações decorativas (brilho e logo do Dashboard) respeitam a preferência. | Baixo | Aceito; Floating pode ser pausada no botão |
| 3 | Three.js Lab e WebGL & GLSL precisam de WebGL. Sem ele aparece um aviso, e o código e a explicação continuam disponíveis. | Baixo | Aceito |
| 4 | O progresso fica salvo no navegador: outro navegador, outro aparelho ou o modo anônimo começam do zero. | Baixo | Por decisão — nada sai do computador |
| 5 | Shaders e cenas 3D pesam mais em celulares simples. O palco pausa fora da tela e limita a densidade de pixels. | Médio em aparelhos fracos | Monitorar na avaliação |
| 6 | O ambiente de testes não tem WebGL: as cenas 3D e os shaders são conferidos no navegador (ver `QA.md`). | — | Documentado |

Corrigidos: botões desabilitados que pareciam quebrados (0.2.0); textos de leitor de tela alargando a página e
link "Pular para o conteúdo" cobrindo o menu (1.0.0-rc.1); contraste de texto branco sobre magenta (1.0.0-rc.1).

Encontrou algo na avaliação? Adicione uma linha aqui ou me mande.

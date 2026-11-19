# Kalixto Creative Lab — Figma Bridge

Plugin do Figma que importa pacotes **KCX** (`.kcx.json`) exportados do Kalixto Creative Lab
e cria estruturas **nativas e editáveis**: variáveis em coleções (Colors, Dimensions, Spacing,
Typography, Motion, Effects, Components), modos Dark/Light, componentes com variantes,
vínculos de variáveis, propriedades de texto e um quadro de documentação com o código-fonte.

Sem rede e sem serviços externos (`networkAccess: none`). Licença MIT.

## Instalar (modo desenvolvimento)

1. Abra o **Figma Desktop**.
2. Menu **Plugins → Development → Import plugin from manifest…**
3. Escolha o `manifest.json` desta pasta.
4. Rode em **Plugins → Development → Kalixto Creative Lab — Figma Bridge**.

## Usar

1. No lab, abra um componente em **KCX Studio** e clique em **Baixar `<id>.kcx.json`**.
2. No plugin, escolha o arquivo. Ele valida e mostra o que vai criar, o que fica editável
   e as limitações, **antes** de criar qualquer coisa.
3. Clique em **Importar no Figma**.

### Figma → Lab

Selecione o componente importado (ou uma instância) e clique em **Exportar alterações para o lab**.
O arquivo `<id>.kcx-alteracoes.json` vai para o editor KCX → **Trazer alterações do Figma**, que
mostra as diferenças e só aplica o que você marcar.

## O que o Figma não faz

- Não executa animações contínuas: duração, velocidade, easing etc. viram variáveis **documentais**
  (descrição começa com “[Documental]” e sem escopo, para não aparecerem como se controlassem algo).
- Não calcula fórmulas entre variáveis: valores derivados viram variáveis próprias com o valor calculado no lab.
- Não tem variável de gradiente: cada parada vira uma variável de cor.

## Código-fonte

`figma-bridge/src/` (este repositório). Build: `npm run figma:build`.
A validação e o plano de importação são o mesmo código do laboratório (`src/app/kcx/`).

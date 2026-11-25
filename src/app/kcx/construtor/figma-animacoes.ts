/**
 * Como cada animação do construtor aparece no Figma.
 *
 * Não existe CSS: o movimento é feito trocando de variante com Smart
 * Animate (cor, opacidade, sombra, tamanho e posição das camadas de dentro).
 * Um componente não se move sozinho, não há movimento contínuo e as camadas
 * mudam todas juntas (sem sequência). O aviso aparece quando a pessoa escolhe a
 * animação, para ela saber antes de salvar.
 */
export type NivelFigma = 'igual' | 'parcial' | 'codigo';

export interface NotaFigma {
  nivel: NivelFigma;
  /** O que acontece no Figma (frase curta, para o usuário). */
  texto: string;
}

const SO_SOMBRA =
  'O hover ganha a sombra colorida, mas não sobe: uma variante não consegue se mover sozinha.';

export const NOTAS_FIGMA: Record<string, NotaFigma> = {
  // Efeito de movimento (web)
  'efeito-web:revelar': {
    nivel: 'codigo',
    texto:
      'A entrada ao rolar fica só no código. No Figma: variantes Início e Fim com o mesmo quadro.',
  },
  'efeito-web:parallax': {
    nivel: 'codigo',
    texto: 'As camadas em velocidades diferentes dependem do scroll: ficam só no código.',
  },
  'efeito-web:sticky': {
    nivel: 'codigo',
    texto:
      'Prender ao rolar fica só no código (no protótipo do Figma, use “Fix position when scrolling”).',
  },
  'efeito-web:horizontal': {
    nivel: 'codigo',
    texto: 'O trilho que anda com o scroll fica só no código.',
  },
  'efeito-web:empilhar': {
    nivel: 'codigo',
    texto: 'Os cards empilhando com o scroll ficam só no código.',
  },
  'efeito-web:morph': { nivel: 'codigo', texto: 'A forma mudando o tempo todo fica só no código.' },
  'efeito-web:hover': {
    nivel: 'codigo',
    texto:
      'O hover (subir, crescer e brilhar) fica no código; no Figma ficam as variantes Início e Fim.',
  },
  'efeito-web:texto': {
    nivel: 'codigo',
    texto: 'A entrada palavra por palavra fica só no código.',
  },
  'efeito-web:vidro': {
    nivel: 'codigo',
    texto:
      'O desfoque do fundo fica no código; no Figma, aplique Background blur na camada se quiser.',
  },
  'efeito-web:profundidade': { nivel: 'codigo', texto: 'O zoom ao rolar fica só no código.' },
  'efeito-web:cursor': {
    nivel: 'codigo',
    texto: 'O cursor que segue e a inclinação dos cards ficam só no código.',
  },
  'efeito-web:transicao': {
    nivel: 'codigo',
    texto:
      'A troca de cena com círculo fica no código; no Figma, use Smart Animate entre duas telas.',
  },

  // Botão
  'botao:elevar': { nivel: 'parcial', texto: SO_SOMBRA },
  'botao:preencher': {
    nivel: 'parcial',
    texto:
      'O Padrão é vazado e o Hover preenchido; a cor aparece de uma vez (sem encher da esquerda para a direita).',
  },
  'botao:brilho': {
    nivel: 'codigo',
    texto:
      'O brilho pulsando o tempo todo fica só no código. Ficam as variantes Padrão e Hover (com sombra).',
  },
  'botao:pulsar': {
    nivel: 'codigo',
    texto: 'O pulso contínuo fica só no código. Ficam as variantes Padrão e Hover (com sombra).',
  },
  // Botão liga/desliga
  'botao-liga-desliga:preencher': {
    nivel: 'igual',
    texto: 'O clique troca Desligado ↔ Ligado com Smart Animate: a cor enche o botão suavemente.',
  },
  'botao-liga-desliga:pop': {
    nivel: 'parcial',
    texto:
      'O clique liga e desliga com Smart Animate (curva com mola), mas sem o pulinho de escala.',
  },
  'botao-liga-desliga:girar': {
    nivel: 'parcial',
    texto: 'O clique troca o ícone com Smart Animate; o giro do ícone fica só no código.',
  },
  // Conjunto de botões
  'botoes:elevar': { nivel: 'parcial', texto: SO_SOMBRA },
  'botoes:preencher': {
    nivel: 'parcial',
    texto:
      'O Padrão é vazado e o Hover preenchido, cada botão na sua cor; a cor aparece de uma vez.',
  },
  'botoes:brilho': {
    nivel: 'parcial',
    texto: 'O Hover ganha a sombra na cor do botão; o anel de brilho em volta fica só no código.',
  },
  // Cards
  'card-foto:zoom': {
    nivel: 'parcial',
    texto: 'O Hover ganha a sombra; o zoom da imagem fica só no código.',
  },
  'card-foto:elevar': {
    nivel: 'parcial',
    texto: 'O Hover ganha a sombra colorida, mas o card não sobe.',
  },
  'card-foto:revelar': {
    nivel: 'parcial',
    texto: 'O texto fica sobre a foto; a subida do texto no hover fica só no código.',
  },
  'card-video:play': {
    nivel: 'codigo',
    texto: 'O play pulsando fica só no código. Ficam as variantes Padrão e Hover.',
  },
  'card-video:zoom': {
    nivel: 'parcial',
    texto: 'O Hover ganha a sombra; o zoom da capa fica só no código.',
  },
  'card-video:escurecer': {
    nivel: 'parcial',
    texto: 'O Hover ganha a sombra; o escurecer da capa fica só no código.',
  },
  'card-preco:elevar': {
    nivel: 'parcial',
    texto: 'O Hover ganha a sombra colorida, mas o card não sobe.',
  },
  'card-preco:destaque': {
    nivel: 'parcial',
    texto: 'O Hover ganha a sombra; o brilho animado da borda fica só no código.',
  },
  'card-preco:entrar': {
    nivel: 'codigo',
    texto: 'A entrada das vantagens em sequência fica só no código — no Figma elas já aparecem.',
  },
  'carrossel:deslizar': {
    nivel: 'igual',
    texto: 'Uma variante por slide; as setas trocam o slide deslizando (Smart Animate).',
  },
  'carrossel:fade': {
    nivel: 'parcial',
    texto: 'A troca de slide aparece deslizando; o fade fica só no código.',
  },
  'carrossel:escala': {
    nivel: 'parcial',
    texto: 'A troca de slide aparece deslizando; o zoom do slide ativo fica só no código.',
  },
  'acordeao:suave': {
    nivel: 'igual',
    texto: 'Uma variante por pergunta aberta; clicar abre com Smart Animate.',
  },
  'acordeao:fade': {
    nivel: 'parcial',
    texto: 'A resposta abre com Smart Animate; o fade do texto fica só no código.',
  },
  'acordeao:destaque': {
    nivel: 'parcial',
    texto: 'A pergunta abre com Smart Animate; o contorno de destaque fica só no código.',
  },
  // Navegação
  'navbar:sublinhado': {
    nivel: 'parcial',
    texto:
      'Ficam as variantes Desktop, Celular e Celular aberto; o sublinhado no hover dos links fica só no código.',
  },
  'navbar:pilula': {
    nivel: 'parcial',
    texto:
      'Ficam as variantes Desktop, Celular e Celular aberto; a pílula no hover dos links fica só no código.',
  },
  'navbar:brilho': {
    nivel: 'parcial',
    texto:
      'Ficam as variantes Desktop, Celular e Celular aberto; o brilho no hover dos links fica só no código.',
  },
  'menu-sanduiche:cortina': {
    nivel: 'igual',
    texto: 'O ícone abre a variante Aberto e o X fecha, com Smart Animate.',
  },
  'menu-sanduiche:escada': {
    nivel: 'parcial',
    texto: 'O menu abre com Smart Animate, mas os itens aparecem juntos (sem sequência).',
  },
  'menu-sanduiche:fade': {
    nivel: 'igual',
    texto: 'O ícone abre a variante Aberto e o X fecha, aparecendo com Smart Animate.',
  },
  'menu-lateral:esquerda': {
    nivel: 'igual',
    texto: 'O botão abre a gaveta, que desliza com Smart Animate; o X fecha.',
  },
  'menu-lateral:direita': {
    nivel: 'igual',
    texto: 'O botão abre a gaveta, que desliza com Smart Animate; o X fecha.',
  },
  'menu-lateral:desfoque': {
    nivel: 'parcial',
    texto: 'A gaveta desliza com Smart Animate; o desfoque do fundo fica só no código.',
  },
  'abas:sublinhado': {
    nivel: 'igual',
    texto: 'Uma variante por aba; clicar troca e a linha desliza com Smart Animate.',
  },
  'abas:pilula': {
    nivel: 'igual',
    texto: 'Uma variante por aba; clicar troca e a pílula desliza com Smart Animate.',
  },
  'abas:fade': {
    nivel: 'parcial',
    texto: 'Clicar troca de aba com Smart Animate; o fade do conteúdo fica só no código.',
  },
  'tabbar:pilula': {
    nivel: 'igual',
    texto: 'Uma variante por item; tocar troca e a pílula desliza com Smart Animate.',
  },
  'tabbar:ponto': {
    nivel: 'igual',
    texto: 'Uma variante por item; tocar troca e o ponto desliza com Smart Animate.',
  },
  'tabbar:salto': {
    nivel: 'parcial',
    texto: 'Tocar troca o item ativo; o salto do ícone fica só no código.',
  },
  // Janelas e avisos
  'modal:zoom': {
    nivel: 'parcial',
    texto: 'O botão abre a variante Aberto com Smart Animate; o zoom de entrada fica só no código.',
  },
  'modal:subir': {
    nivel: 'igual',
    texto: 'O botão abre a variante Aberto e a janela sobe com Smart Animate.',
  },
  'modal:fade': {
    nivel: 'igual',
    texto: 'O botão abre a variante Aberto, aparecendo com Smart Animate.',
  },
  'toast:baixo': {
    nivel: 'igual',
    texto: 'O botão mostra o aviso, que sobe com Smart Animate. Sumir sozinho fica só no código.',
  },
  'toast:lado': {
    nivel: 'igual',
    texto:
      'O botão mostra o aviso, que entra pela direita com Smart Animate. Sumir sozinho fica só no código.',
  },
  'toast:pop': {
    nivel: 'parcial',
    texto: 'O aviso aparece com Smart Animate; o “pop” (crescer e voltar) fica só no código.',
  },
  // Formulários e seções
  'formulario:flutuante': {
    nivel: 'parcial',
    texto:
      'Ficam Padrão, Foco, Erro e Sucesso; o rótulo que flutua e a digitação ficam só no código.',
  },
  'formulario:brilho': {
    nivel: 'parcial',
    texto: 'Ficam Padrão, Foco, Erro e Sucesso; o brilho do foco fica só no código.',
  },
  'formulario:tremer': {
    nivel: 'parcial',
    texto: 'Ficam Padrão, Foco, Erro e Sucesso; o tremor no erro fica só no código.',
  },
  'hero:subir': {
    nivel: 'codigo',
    texto: 'A entrada em sequência fica só no código — no Figma a seção já aparece pronta.',
  },
  'hero:desfoque': {
    nivel: 'codigo',
    texto: 'A entrada saindo do desfoque fica só no código — no Figma a seção já aparece pronta.',
  },
  'hero:fade': {
    nivel: 'codigo',
    texto: 'A entrada com fade fica só no código — no Figma a seção já aparece pronta.',
  },
  'rodape:sublinhado': {
    nivel: 'codigo',
    texto: 'O sublinhado no hover dos links fica só no código — no Figma o rodapé é estático.',
  },
  'rodape:cor': {
    nivel: 'codigo',
    texto: 'A cor no hover dos links fica só no código — no Figma o rodapé é estático.',
  },
  'rodape:subir': {
    nivel: 'codigo',
    texto: 'Os links subindo no hover ficam só no código — no Figma o rodapé é estático.',
  },
  // Controles (Fase 2)
  'checkbox:check': {
    nivel: 'igual',
    texto: 'Clicar marca e desmarca; a caixa enche e o check aparece com Smart Animate.',
  },
  'checkbox:pop': {
    nivel: 'parcial',
    texto: 'Clicar marca e desmarca com Smart Animate; o pequeno salto fica só no código.',
  },
  'checkbox:cor': {
    nivel: 'igual',
    texto: 'Clicar marca e desmarca; a cor troca com Smart Animate.',
  },
  'radio:ponto': {
    nivel: 'igual',
    texto: 'Uma variante por opção; clicar escolhe e o ponto aparece com Smart Animate.',
  },
  'radio:anel': {
    nivel: 'parcial',
    texto: 'Uma variante por opção; o anel grosso aparece como borda colorida.',
  },
  'radio:cartao': {
    nivel: 'igual',
    texto: 'Uma variante por opção; a linha escolhida ganha fundo com Smart Animate.',
  },
  'seletor-duplo:deslizar': {
    nivel: 'igual',
    texto: 'Clicar na outra opção faz o destaque deslizar com Smart Animate.',
  },
  'seletor-duplo:mola': {
    nivel: 'igual',
    texto: 'Clicar na outra opção faz o destaque deslizar com curva de mola (Gentle).',
  },
  'seletor-duplo:sumir': {
    nivel: 'parcial',
    texto: 'No Figma o destaque desliza (Smart Animate) em vez de sumir e aparecer.',
  },
  'switch:deslizar': {
    nivel: 'igual',
    texto: 'Clicar liga e desliga; a bolinha desliza com Smart Animate.',
  },
  'switch:mola': {
    nivel: 'igual',
    texto: 'Clicar liga e desliga; a bolinha desliza com curva de mola (Gentle).',
  },
  'switch:esticar': {
    nivel: 'parcial',
    texto: 'A bolinha desliza com Smart Animate; o esticar ao apertar fica só no código.',
  },
  'breadcrumb:sublinhado': {
    nivel: 'codigo',
    texto: 'O sublinhado no hover fica só no código; no Figma a trilha é estática.',
  },
  'breadcrumb:cor': {
    nivel: 'codigo',
    texto: 'A cor no hover fica só no código; no Figma a trilha é estática.',
  },
  'breadcrumb:seta': {
    nivel: 'codigo',
    texto: 'A seta andando no hover fica só no código; no Figma a trilha é estática.',
  },
  'paginacao:pilula': {
    nivel: 'igual',
    texto: 'Uma variante por página; números e setas trocam com Smart Animate.',
  },
  'paginacao:contorno': {
    nivel: 'igual',
    texto: 'Uma variante por página; números e setas trocam com Smart Animate.',
  },
  'paginacao:sublinhado': {
    nivel: 'parcial',
    texto: 'Uma variante por página; no Figma a página atual aparece com borda, não com linha.',
  },
  'stepper:linha': {
    nivel: 'parcial',
    texto: 'Uma variante por etapa; a linha que enche entre as etapas fica só no código.',
  },
  'stepper:pulso': {
    nivel: 'parcial',
    texto: 'Uma variante por etapa; o pulso da etapa atual fica só no código.',
  },
  'stepper:simples': {
    nivel: 'igual',
    texto: 'Uma variante por etapa; Continuar avança com Smart Animate.',
  },
  'tooltip:fade': {
    nivel: 'igual',
    texto: 'Mouse enter mostra e Mouse leave esconde a dica, com Smart Animate.',
  },
  'tooltip:subir': {
    nivel: 'parcial',
    texto: 'Mouse enter mostra e Mouse leave esconde a dica; a subida fica só no código.',
  },
  'tooltip:zoom': {
    nivel: 'parcial',
    texto: 'Mouse enter mostra e Mouse leave esconde a dica; o zoom fica só no código.',
  },
  'banner:deslizar': {
    nivel: 'igual',
    texto: 'Clicar no X fecha; a faixa sobe e some com Smart Animate.',
  },
  'banner:fade': { nivel: 'igual', texto: 'Clicar no X fecha; a faixa some com Smart Animate.' },
  'banner:brilho': {
    nivel: 'parcial',
    texto: 'Clicar no X fecha; o brilho passando (contínuo) fica só no código.',
  },
  'dropdown:cair': {
    nivel: 'parcial',
    texto: 'Clicar abre e fecha, Esc fecha; a lista aparece com Smart Animate (sem a descida).',
  },
  'dropdown:fade': {
    nivel: 'igual',
    texto: 'Clicar abre e fecha, Esc fecha; a lista aparece com Smart Animate.',
  },
  'dropdown:escala': {
    nivel: 'parcial',
    texto: 'Clicar abre e fecha, Esc fecha; o crescer a partir do botão fica só no código.',
  },
  // Fase 3
  'select:cair': {
    nivel: 'parcial',
    texto:
      'Clicar abre a lista, escolher troca o valor e fecha, Esc fecha; a descida fica só no código.',
  },
  'select:fade': {
    nivel: 'igual',
    texto: 'Clicar abre a lista, escolher troca o valor e fecha, Esc fecha, com Smart Animate.',
  },
  'slider:suave': {
    nivel: 'parcial',
    texto: 'Clicar numa marca ou arrastar move a bolinha de 25 em 25 (uma variante por marca).',
  },
  'slider:mola': {
    nivel: 'parcial',
    texto: 'Como o suave, com curva de mola; no Figma o valor anda de 25 em 25.',
  },
  'mega-menu:cair': {
    nivel: 'parcial',
    texto: 'Mouse enter abre e Mouse leave fecha o painel; a descida fica só no código.',
  },
  'mega-menu:fade': {
    nivel: 'igual',
    texto: 'Mouse enter abre e Mouse leave fecha o painel, com Smart Animate.',
  },
  'fab:subir': {
    nivel: 'igual',
    texto: 'Clicar abre os atalhos, que sobem com Smart Animate; o + vira X.',
  },
  'fab:girar': {
    nivel: 'parcial',
    texto: 'Clicar abre os atalhos e o + vira X; o giro do ícone fica só no código.',
  },
  'galeria:zoom': {
    nivel: 'codigo',
    texto: 'O zoom no hover fica só no código; no Figma a grade é estática.',
  },
  'galeria:elevar': {
    nivel: 'codigo',
    texto: 'O card subindo no hover fica só no código; no Figma a grade é estática.',
  },
  'login:brilho': {
    nivel: 'codigo',
    texto:
      'O brilho no foco fica só no código; o botão (instância) tem hover e pressionar no Figma.',
  },
  'login:simples': {
    nivel: 'codigo',
    texto:
      'A borda no foco fica só no código; o botão (instância) tem hover e pressionar no Figma.',
  },
};

export function notaFigma(tipo: string, animacao: string): NotaFigma | undefined {
  return NOTAS_FIGMA[`${tipo}:${animacao}`];
}

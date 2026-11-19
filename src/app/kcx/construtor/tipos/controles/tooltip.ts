import { DefinicaoTipo } from '../../montar';
import { boolAttr, interacao, mapaBool } from './_comum';

export const TOOLTIP: DefinicaoTipo = {
  id: 'tooltip',
  nome: 'Dica (tooltip)',
  categoria: 'sobreposicao',
  uso: 'site e app',
  descricao: 'Balão com uma dica que aparece ao passar o mouse (ou focar) no botão.',
  textos: [
    { id: 'alvo', rotulo: 'Texto do botão', padrao: 'Passe o mouse' },
    { id: 'dica', rotulo: 'Dica', padrao: 'Aulas toda quinta às 19h' },
  ],
  animacoes: [
    { id: 'fade', nome: 'Aparecer', descricao: 'A dica aparece com fade.' },
    { id: 'subir', nome: 'Sobe', descricao: 'A dica sobe um pouco enquanto aparece.' },
    { id: 'zoom', nome: 'Zoom', descricao: 'A dica cresce a partir da seta.' },
  ],
  largura: 320,
  altura: 160,
  gerar(cfg, b) {
    const C = b.C;
    const v = (n: string) => b.v(n);
    const visivel = boolAttr(b, 'visivel', 'Dica visível', false, 'Mostra a dica.');
    const antes: Record<string, string> = {
      fade: 'transform: translateX(-50%);',
      subir: 'transform: translate(-50%, 8px);',
      zoom: 'transform: translateX(-50%) scale(.85); transform-origin: bottom center;',
    };
    const html = `<span class="${C}" data-visivel="false">
  <button class="${C}__alvo" type="button" aria-describedby="${C}-dica">${b.span('alvo')}</button>
  <span class="${C}__balao" id="${C}-dica" role="tooltip">${b.span('dica')}</span>
</span>`;
    const css = `.${C} { position: relative; display: inline-block; margin-top: 64px; }
.${C}__alvo { padding: .6em 1em; border: 0; border-radius: ${v('raio')}; background: ${v('superficie')}; color: ${v('texto')}; font: inherit; cursor: pointer; }
.${C}__balao { position: absolute; bottom: calc(100% + 10px); left: 50%; width: max-content; max-width: 240px; padding: .5em .75em; border-radius: calc(${v('raio')} * .75); background: ${v('texto')}; color: ${v('fundo')}; font-size: .875em; opacity: 0; pointer-events: none; ${antes[cfg.animacao] ?? antes['fade']} transition: opacity ${v('duracao')} ${v('easing')}, transform ${v('duracao')} ${v('easing')}; }
.${C}__balao::after { content: ''; position: absolute; top: 100%; left: 50%; border: 6px solid transparent; border-top-color: ${v('texto')}; transform: translateX(-50%); }
.${C}:hover .${C}__balao, .${C}:focus-within .${C}__balao, .${C}[data-visivel="true"] .${C}__balao { opacity: 1; transform: translateX(-50%); }`;
    const balao = b.pilha(
      'balao',
      'Dica',
      'horizontal',
      [
        b.noTexto('dica', 'Dica', {
          cor: b.cor('fundo'),
          tamanho: b.fonteX(0.875, 'dica-tamanho'),
        }),
      ],
      {
        px: 12,
        py: 8,
        raio: b.raio,
        larguraMax: 240,
        preenchimentos: [{ tipo: 'solido', cor: b.cor('texto') }],
        opacidade: mapaBool(visivel, 'dica-opacidade', '1', '0'),
      },
    );
    const estrutura = b.pilha(
      'tooltip',
      cfg.nome,
      'vertical',
      [
        balao,
        {
          id: 'seta',
          nome: 'Seta',
          tipo: 'svg',
          svg: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="6" viewBox="0 0 12 6"><path d="M 0 0 L 6 6 L 12 0 Z" fill="#fff"/></svg>',
          svgTraco: { cor: b.cor('texto'), espessura: 0 },
          opacidade: mapaBool(visivel, 'seta-opacidade', '1', '0'),
        },
        b.pilha('alvo-btn', 'Botão', 'horizontal', [b.noTexto('alvo', 'Texto do botão')], {
          px: 16,
          py: 10,
          raio: b.raio,
          preenchimentos: [{ tipo: 'solido', cor: b.cor('superficie') }],
        }),
      ],
      { espaco: 0, alinhar: 'centro', px: 16, py: 16 },
    );
    estrutura.autoLayout!.espaco = 0;
    return {
      html,
      css,
      estrutura,
      estados: [
        {
          id: 'oculta',
          nome: 'Oculta',
          gatilho: 'padrao',
          descricao: 'Sem a dica.',
          valores: { [visivel]: false },
        },
        {
          id: 'visivel',
          nome: 'Visível',
          gatilho: 'hover',
          descricao: 'Mouse em cima do botão.',
          valores: { [visivel]: true },
        },
      ],
      interacoes: [
        interacao('alvo-btn', 'oculta', 'visivel', 'entrar', 180),
        interacao('alvo-btn', 'visivel', 'oculta', 'sair', 180),
      ],
      animacao: {
        nome: TOOLTIP.animacoes.find((a) => a.id === cfg.animacao)?.nome ?? 'Aparecer',
        tecnica: 'css-transition',
        variaveis: ['duracao', 'easing'],
        descricao: 'Só CSS: :hover e :focus-within mostram o balão (acessível pelo teclado).',
      },
      editavel: [
        'Variantes Oculta e Visível; no protótipo, Mouse enter mostra e Mouse leave esconde',
        'Texto do botão e da dica como propriedades de texto; largura máxima de 240 px',
      ],
      tags: ['tooltip', 'dica', 'hover'],
    };
  },
};

/* ============================== Faixa de aviso (banner) ============================== */

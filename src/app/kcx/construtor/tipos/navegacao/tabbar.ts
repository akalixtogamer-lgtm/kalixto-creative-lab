import { KcxNo } from '../../../kcx.types';
import { DefinicaoTipo, svgIcone } from '../../montar';
import { ICONES_TABBAR, PADRAO_TABBAR, trocaPorIndice } from './_comum';

export const TABBAR: DefinicaoTipo = {
  id: 'tabbar',
  nome: 'Tab bar de app',
  categoria: 'navegacao',
  uso: 'app',
  descricao: 'Barra inferior de aplicativo com ícones e indicador do item ativo.',
  textos: [],
  itens: { rotulo: 'Item', padrao: ['Início', 'Buscar', 'Favoritos', 'Perfil'], min: 3, max: 5 },
  recursos: [
    {
      id: 'icones',
      nome: 'Ícones trocáveis',
      descricao:
        'Cada ícone vira instância da biblioteca KCX Ícone, com troca de instância no Figma.',
      padrao: true,
    },
  ],
  icones: [
    { id: 'item1', rotulo: 'Ícone do item 1', padrao: 'casa', recurso: 'icones' },
    { id: 'item2', rotulo: 'Ícone do item 2', padrao: 'busca', recurso: 'icones' },
    { id: 'item3', rotulo: 'Ícone do item 3', padrao: 'coracao', recurso: 'icones' },
    { id: 'item4', rotulo: 'Ícone do item 4', padrao: 'usuario', recurso: 'icones' },
    { id: 'item5', rotulo: 'Ícone do item 5', padrao: 'config', recurso: 'icones' },
  ],
  animacoes: [
    {
      id: 'pilula',
      nome: 'Pílula que desliza',
      descricao: 'Um fundo arredondado anda até o item ativo.',
    },
    { id: 'ponto', nome: 'Ponto embaixo', descricao: 'Um ponto anda até o item ativo.' },
    { id: 'salto', nome: 'Ícone que salta', descricao: 'O ícone ativo dá um pulinho.' },
  ],
  largura: 375,
  altura: 72,
  gerar(cfg, b) {
    const C = b.C;
    const v = (n: string) => b.v(n);
    const n = cfg.itens.length;
    const ativo = b.indiceAtivo('ativo', 'Item ativo', n, 'Qual item da barra está selecionado.');
    const ponto = cfg.animacao === 'ponto';
    const html = `<nav class="${C}" data-ativo="1" aria-label="Navegação do app">
  <span class="${C}__indicador" aria-hidden="true"></span>
  ${cfg.itens
    .map(
      (_, i) =>
        `<button class="${C}__item" type="button" data-n="${i + 1}"${i === 0 ? ' aria-current="page"' : ''}>${
          b.tem('icones')
            ? b.svgKcx(b.nomeIcone(`item${i + 1}`, PADRAO_TABBAR[i]), `${C}__icone`, 24)
            : svgIcone(ICONES_TABBAR[i % ICONES_TABBAR.length], `${C}__icone`)
        }${b.item(i)}</button>`,
    )
    .join('\n  ')}
</nav>`;
    const css = `.${C} { position: relative; display: grid; grid-template-columns: repeat(${n}, 1fr); width: 100%; max-width: 375px; padding: 8px; border-radius: ${v('raio')}; background: ${v('superficie')}; box-shadow: 0 10px 30px rgb(0 0 0 / .3); }
.${C}__item { position: relative; z-index: 1; display: grid; justify-items: center; gap: 2px; padding: 6px 0; border: 0; background: none; color: ${v('suave')}; font-size: calc(${v('fonte')} * .75); font-weight: 600; transition: color ${v('duracao')} ${v('easing')}; }
.${C}__item[aria-current] { color: ${ponto ? v('primaria') : v('texto')}; }
.${C}__indicador { position: absolute; left: 8px; width: calc((100% - 16px) / ${n}); transform: translateX(calc((${v('ativo')} - 1) * 100%)); transition: transform ${v('duracao')} ${v('easing')};
  ${ponto ? `bottom: 4px; height: 4px; background: radial-gradient(circle, ${v('primaria')} 2px, transparent 2.5px);` : `top: 8px; bottom: 8px; border-radius: ${v('raio')}; background: color-mix(in srgb, ${v('primaria')} ${cfg.animacao === 'salto' ? '0%' : '30%'}, transparent);`} }
${
  cfg.animacao === 'salto'
    ? `.${C}__item[aria-current] .${C}__icone { color: ${v('primaria')}; animation: ${C}-salto ${v('duracao')} ${v('easing')}; }
@keyframes ${C}-salto { 40% { transform: translateY(-6px) scale(1.1); } }`
    : ''
}`;
    const js = `// Marca o item tocado.
document.querySelectorAll('.${C}').forEach((barra) => {
  const itens = [...barra.querySelectorAll('.${C}__item')];
  itens.forEach((item, i) => item.addEventListener('click', () => {
    barra.setAttribute('data-ativo', String(i + 1));
    barra.style.setProperty('${b.P}-ativo', String(i + 1));
    itens.forEach((x) => x.removeAttribute('aria-current'));
    item.setAttribute('aria-current', 'page');
  }));
});`;
    const W = Math.floor(359 / n);
    const estrutura: KcxNo = {
      id: 'tabbar',
      nome: cfg.nome,
      tipo: 'frame',
      largura: 375,
      altura: 72,
      raio: b.raio,
      preenchimentos: [{ tipo: 'solido', cor: b.cor('superficie') }],
      efeitos: [{ tipo: 'sombra', cor: '#0000004d', raio: 30, y: 10 }],
      filhos: [
        ponto
          ? {
              id: 'indicador',
              nome: 'Indicador',
              tipo: 'elipse',
              x: b.posicao(ativo, 'indicador-x', W, 8 + W / 2 - 2),
              y: 62,
              largura: 4,
              altura: 4,
              preenchimentos: [{ tipo: 'solido', cor: b.cor('primaria') }],
            }
          : {
              id: 'indicador',
              nome: 'Indicador',
              tipo: 'retangulo',
              x: b.posicao(ativo, 'indicador-x', W, 8),
              y: 8,
              largura: W,
              altura: 56,
              raio: b.raio,
              preenchimentos: [
                { tipo: 'solido', cor: b.corAlpha('corPrimaria', 'indicador-cor', 0.3) },
              ],
            },
        ...cfg.itens.map((_, i): KcxNo =>
          b.pilha(
            `item${i + 1}`,
            `Item ${i + 1}`,
            'vertical',
            [
              b.tem('icones')
                ? b.noIcone(
                    `icone-${i + 1}`,
                    'Ícone',
                    b.nomeIcone(`item${i + 1}`, PADRAO_TABBAR[i]),
                    b.cor('texto'),
                    24,
                    { troca: `Ícone do item ${i + 1}` },
                  )
                : b.icone(`icone-${i + 1}`, 'Ícone', ICONES_TABBAR[i % ICONES_TABBAR.length], 24),
              b.noItem(i, { tamanho: b.fonteX(0.75, 'item-tamanho'), estilo: 'Semi Bold' }),
            ],
            {
              x: 8 + i * W,
              y: 8,
              largura: W,
              altura: 56,
              espaco: 2,
              alinhar: 'centro',
            },
          ),
        ),
      ],
    };
    return {
      html,
      css,
      js,
      estrutura,
      estados: cfg.itens.map((t, i) => ({
        id: `item${i + 1}`,
        nome: `Item ${i + 1}`,
        gatilho: i === 0 ? ('padrao' as const) : ('active' as const),
        descricao: `“${t}” ativo.`,
        valores: { [ativo]: i + 1 },
      })),
      interacoes: trocaPorIndice('item', 'item', n),
      animacao: {
        nome: TABBAR.animacoes.find((a) => a.id === cfg.animacao)?.nome ?? 'Indicador',
        tecnica: cfg.animacao === 'salto' ? 'css-keyframes' : 'css-transition',
        variaveis: ['duracao', 'easing', 'ativo'],
        descricao: 'Indicador com translateX pela posição do item ativo.',
      },
      editavel: [
        'Uma variante por item ativo; no protótipo, tocar num item troca a variante (Smart Animate)',
        'Ícones como vetores editáveis e rótulos como propriedades de texto',
      ],
      tags: ['bottom navigation', 'app', 'mobile'],
    };
  },
};

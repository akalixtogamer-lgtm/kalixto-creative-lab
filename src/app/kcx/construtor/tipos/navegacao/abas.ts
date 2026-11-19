import { KcxNo } from '../../../kcx.types';
import { DefinicaoTipo } from '../../montar';
import { trocaPorIndice } from './_comum';

export const ABAS: DefinicaoTipo = {
  id: 'abas',
  nome: 'Abas',
  categoria: 'navegacao',
  uso: 'site e app',
  descricao: 'Abas com indicador que desliza até a aba escolhida e troca o conteúdo.',
  textos: [],
  itens: { rotulo: 'Aba', padrao: ['Visão geral', 'Detalhes', 'Avaliações'], min: 2, max: 5 },
  animacoes: [
    {
      id: 'sublinhado',
      nome: 'Linha que desliza',
      descricao: 'Uma linha embaixo anda até a aba ativa.',
    },
    {
      id: 'pilula',
      nome: 'Pílula que desliza',
      descricao: 'Um fundo arredondado anda até a aba ativa.',
    },
    {
      id: 'fade',
      nome: 'Conteúdo com fade',
      descricao: 'Linha que desliza e o conteúdo entra com fade.',
    },
  ],
  largura: 480,
  altura: 200,
  gerar(cfg, b) {
    const C = b.C;
    const v = (n: string) => b.v(n);
    const n = cfg.itens.length;
    const ativa = b.indiceAtivo('ativa', 'Aba ativa', n, 'Qual aba aparece selecionada.');
    const paineis = cfg.itens.map((t, i) =>
      b.extra({
        id: `painel${i + 1}`,
        nome: `Conteúdo da aba ${i + 1}`,
        tipo: 'string',
        padrao: `Conteúdo de “${t}”. Troque este texto no KCX Studio ou no Figma.`,
        descricao: `Texto mostrado quando a aba ${i + 1} está ativa.`,
        grupo: 'components',
        secao: 'aparencia',
        vinculos: [
          { propriedade: 'Texto', alvo: { tipo: 'texto', seletor: `.${C}__painel-${i + 1}` } },
        ],
      }),
    );
    const pilula = cfg.animacao === 'pilula';
    const html = `<div class="${C}" data-ativa="1">
  <div class="${C}__lista" role="tablist">
    <span class="${C}__indicador" aria-hidden="true"></span>
    ${cfg.itens.map((_, i) => `<button class="${C}__aba" type="button" role="tab" id="${C}-aba-${i + 1}" aria-controls="${C}-painel-${i + 1}" aria-selected="${i === 0}" data-aba="${i + 1}">${b.item(i)}</button>`).join('\n    ')}
  </div>
  ${cfg.itens.map((_, i) => `<p class="${C}__painel ${C}__painel-${i + 1}" role="tabpanel" id="${C}-painel-${i + 1}" aria-labelledby="${C}-aba-${i + 1}" data-painel="${i + 1}"></p>`).join('\n  ')}
</div>`;
    const visiveis = cfg.itens
      .map((_, i) => `.${C}[data-ativa="${i + 1}"] [data-painel="${i + 1}"]`)
      .join(',\n');
    const css = `.${C} { width: 100%; max-width: 480px; padding: calc(${v('espaco')} * .5); border-radius: ${v('raio')}; background: ${v('superficie')}; }
.${C}__lista { position: relative; display: grid; grid-template-columns: repeat(${n}, 1fr); ${pilula ? '' : `border-bottom: 1px solid color-mix(in srgb, ${v('suave')} 25%, transparent);`} }
.${C}__aba { position: relative; z-index: 1; padding: .75em .5em; border: 0; background: none; color: ${v('suave')}; font-weight: 600; transition: color ${v('duracao')} ${v('easing')}; }
.${C}__aba[aria-selected="true"] { color: ${pilula ? v('fundo') : v('texto')}; }
.${C}__indicador { position: absolute; left: 0; width: calc(100% / ${n}); transform: translateX(calc((${v('ativa')} - 1) * 100%)); transition: transform ${v('duracao')} ${v('easing')};
  ${pilula ? `top: 4px; bottom: 4px; border-radius: ${v('raio')}; background: ${v('primaria')};` : `bottom: -1px; height: 3px; border-radius: 3px; background: ${v('primaria')};`} }
.${C}__painel { display: none; margin: 0; padding: ${v('espaco')}; color: ${v('texto')}; line-height: 1.5; }
${visiveis} { display: block;${cfg.animacao === 'fade' ? ` animation: ${C}-entra ${v('duracao')} ${v('easing')};` : ''} }
@keyframes ${C}-entra { from { opacity: 0; transform: translateY(6px); } }`;
    const js = `// Troca a aba (clique ou setas do teclado).
document.querySelectorAll('.${C}').forEach((raiz) => {
  const abas = [...raiz.querySelectorAll('[role="tab"]')];
  const ativar = (n) => {
    raiz.setAttribute('data-ativa', String(n));
    raiz.style.setProperty('${b.P}-ativa', String(n));
    abas.forEach((a, i) => { a.setAttribute('aria-selected', String(i + 1 === n)); a.tabIndex = i + 1 === n ? 0 : -1; });
  };
  abas.forEach((a, i) => {
    a.addEventListener('click', () => ativar(i + 1));
    a.addEventListener('keydown', (e) => {
      const passo = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!passo) return;
      const n = ((i + passo + abas.length) % abas.length) + 1;
      ativar(n); abas[n - 1].focus();
    });
  });
});`;
    const W = 120;
    const lista: KcxNo = {
      id: 'lista',
      nome: 'Abas',
      tipo: 'frame',
      largura: W * n,
      altura: 44,
      preenchimentos: [],
      filhos: [
        {
          id: 'indicador',
          nome: 'Indicador',
          tipo: 'retangulo',
          x: b.posicao(ativa, 'indicador-x', W, pilula ? 4 : 0),
          y: pilula ? 4 : 41,
          largura: pilula ? W - 8 : W,
          altura: pilula ? 36 : 3,
          raio: pilula ? b.raio : 2,
          preenchimentos: [{ tipo: 'solido', cor: b.cor('primaria') }],
        },
        ...cfg.itens.map((_, i): KcxNo =>
          b.pilha(
            `aba${i + 1}`,
            `Aba ${i + 1}`,
            'horizontal',
            [b.noItem(i, { estilo: 'Semi Bold' })],
            {
              x: i * W,
              y: 0,
              largura: W,
              altura: 44,
            },
          ),
        ),
      ],
    };
    const estrutura = b.pilha(
      'abas',
      cfg.nome,
      'vertical',
      [
        lista,
        ...paineis.map((id, i) => ({
          id: `painel-${i + 1}`,
          nome: `Conteúdo ${i + 1}`,
          tipo: 'texto' as const,
          visivel: b.quando(ativa, i + 1, n, `painel-${i + 1}-visivel`),
          preenchimentos: [{ tipo: 'solido' as const, cor: b.cor('texto') }],
          texto: {
            conteudo: { $var: id },
            tamanho: b.fonte,
            familia: 'Inter',
            estilo: 'Regular',
            preencher: true,
            propriedade: `Conteúdo ${i + 1}`,
          },
        })),
      ],
      {
        largura: W * n + 16,
        px: 8,
        py: 8,
        espaco: b.espaco,
        raio: b.raio,
        preenchimentos: [{ tipo: 'solido', cor: b.cor('superficie') }],
      },
    );
    return {
      html,
      css,
      js,
      estrutura,
      estados: cfg.itens.map((t, i) => ({
        id: `aba${i + 1}`,
        nome: `Aba ${i + 1}`,
        gatilho: i === 0 ? ('padrao' as const) : ('active' as const),
        descricao: `“${t}” selecionada.`,
        valores: { [ativa]: i + 1 },
      })),
      interacoes: trocaPorIndice('aba', 'aba', n),
      animacao: {
        nome: ABAS.animacoes.find((a) => a.id === cfg.animacao)?.nome ?? 'Indicador',
        tecnica: 'css-transition',
        variaveis: ['duracao', 'easing', 'ativa'],
        descricao: 'O indicador anda com translateX calculado pela aba ativa (custom property).',
      },
      editavel: [
        'Uma variante por aba; no protótipo, clicar numa aba troca a variante e o indicador desliza (Smart Animate)',
        'Nome e conteúdo de cada aba como propriedades de texto',
      ],
      limitacoes: [
        'No Figma cada aba tem largura fixa (120 px) para o indicador parar no lugar certo.',
      ],
      tags: ['tabs', 'segmented'],
    };
  },
};

/* ============================== Tab bar (app) ============================== */

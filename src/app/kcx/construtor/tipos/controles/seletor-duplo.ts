import { KcxEstado, KcxInteracao, KcxNo, KcxRef } from '../../../kcx.types';
import { DefinicaoTipo, escHtml } from '../../montar';
import { interacao, mapaBool } from './_comum';

const TAMANHOS_SEL = [
  { valor: 'p', rotulo: 'P', py: 6, fonte: 13 },
  { valor: 'm', rotulo: 'M', py: 8, fonte: 15 },
  { valor: 'g', rotulo: 'G', py: 11, fonte: 18 },
];

/**
 * Seletor de duas opções (um OU outro): Português | Inglês, Mensal | Anual,
 * Claro | Escuro. Uma variável verdadeiro/falso diz qual está escolhida:
 * falso = a primeira, verdadeiro = a segunda.
 *
 * No código: role="radiogroup" com dois role="radio" (setas do teclado
 * trocam). No Figma: estados Primeira e Segunda (e Desativado), eixo Tamanho e
 * protótipo em que clicar na outra opção faz o destaque deslizar.
 */
export const SELETOR_DUPLO: DefinicaoTipo = {
  id: 'seletor-duplo',
  nome: 'Seletor de duas opções',
  categoria: 'formularios',
  uso: 'site e app',
  descricao:
    'Escolhe uma de duas opções (Português ou Inglês, Mensal ou Anual): o destaque desliza para a opção escolhida. Valor verdadeiro/falso.',
  textos: [
    { id: 'opcaoA', rotulo: 'Primeira opção', padrao: 'Português' },
    { id: 'opcaoB', rotulo: 'Segunda opção', padrao: 'Inglês' },
  ],
  recursos: [
    { id: 'tamanhos', nome: 'Tamanhos', descricao: 'P, M e G (altura e texto).', padrao: true },
    {
      id: 'desativado',
      nome: 'Estado Desativado',
      descricao: 'Mais uma variante, apagada e sem clique.',
      padrao: true,
    },
    {
      id: 'tema',
      nome: 'Troca o tema',
      descricao:
        'No protótipo do Figma, a segunda opção troca as cores para o modo Claro e a primeira volta ao Escuro.',
      padrao: false,
    },
  ],
  animacoes: [
    { id: 'deslizar', nome: 'Desliza', descricao: 'O destaque anda suave até a outra opção.' },
    { id: 'mola', nome: 'Desliza com mola', descricao: 'Passa um pouco e volta.' },
    {
      id: 'sumir',
      nome: 'Troca suave',
      descricao: 'O destaque some de um lado e aparece no outro.',
    },
  ],
  largura: 300,
  altura: 64,
  gerar(cfg, b) {
    const C = b.C;
    const v = (n: string) => b.v(n);
    const comTamanhos = b.tem('tamanhos');
    const des = b.tem('desativado');
    const mola = cfg.animacao === 'mola';
    const easing = mola ? 'cubic-bezier(.34, 1.56, .64, 1)' : v('easing');

    /* ---------- Variáveis ---------- */
    const mapaTxt = (sim: string, nao: string) => [
      { op: 'mapa' as const, valores: { true: sim, false: nao } },
    ];
    const segunda = b.extra({
      id: 'segunda',
      nome: 'Segunda opção escolhida',
      tipo: 'boolean',
      padrao: false,
      descricao:
        'Falso = a primeira opção (ex.: Português); verdadeiro = a segunda (ex.: Inglês). No Figma, clicar troca.',
      grupo: 'components',
      secao: 'comportamento',
      vinculos: [
        {
          propriedade: 'data-segunda',
          alvo: { tipo: 'atributo', seletor: `.${C}`, atributo: 'data-segunda' },
          transformar: mapaTxt('true', 'false'),
        },
        {
          propriedade: 'aria-checked da primeira',
          alvo: { tipo: 'atributo', seletor: `.${C}__a`, atributo: 'aria-checked' },
          transformar: mapaTxt('false', 'true'),
        },
        {
          propriedade: 'aria-checked da segunda',
          alvo: { tipo: 'atributo', seletor: `.${C}__b`, atributo: 'aria-checked' },
          transformar: mapaTxt('true', 'false'),
        },
      ],
    });
    const tamanho = comTamanhos
      ? b.extra({
          id: 'tamanho',
          nome: 'Tamanho',
          tipo: 'enum',
          padrao: 'm',
          opcoes: TAMANHOS_SEL.map((t) => ({ valor: t.valor, rotulo: t.rotulo })),
          descricao: 'P, M ou G. No Figma é um eixo de variante.',
          grupo: 'dimensions',
          secao: 'aparencia',
          vinculos: [
            {
              propriedade: 'data-tamanho',
              alvo: { tipo: 'atributo', seletor: `.${C}`, atributo: 'data-tamanho' },
            },
          ],
        })
      : undefined;
    if (des)
      b.extra({
        id: 'opacidadeSeletor',
        nome: 'Opacidade do estado',
        tipo: 'float',
        padrao: 1,
        min: 0,
        max: 1,
        passo: 0.05,
        descricao: '1 normal, 0,45 desativado.',
        grupo: 'effects',
        secao: 'comportamento',
        vinculos: [{ propriedade: 'opacity', alvo: { tipo: 'css-var', nome: `${b.P}-opacidade` } }],
      });

    /* Largura de cada opção: cabe o texto mais longo no tamanho G. */
    const maior = Math.max(b.texto('opcaoA').length, b.texto('opcaoB').length, 3);
    const L = Math.max(72, Math.round(maior * 0.62 * 18 + 32));
    const PAD = 4;

    /* ---------- Código ---------- */
    const html = `<div class="${C}" role="radiogroup" aria-label="${escHtml(`${b.texto('opcaoA')} ou ${b.texto('opcaoB')}`)}" data-segunda="false"${
      tamanho ? ' data-tamanho="m"' : ''
    }>
  <span class="${C}__indicador" aria-hidden="true"></span>
  <button class="${C}__op ${C}__a ${C}__opcaoA" type="button" role="radio" aria-checked="true">${escHtml(b.texto('opcaoA'))}</button>
  <button class="${C}__op ${C}__b ${C}__opcaoB" type="button" role="radio" aria-checked="false" tabindex="-1">${escHtml(b.texto('opcaoB'))}</button>
</div>`;
    const transicao =
      cfg.animacao === 'sumir'
        ? `opacity ${v('duracao')} ${v('easing')}`
        : `transform ${v('duracao')} ${easing}`;
    const css = `.${C} {
  position: relative;
  display: inline-grid;
  grid-template-columns: 1fr 1fr;
  padding: ${PAD}px;
  border-radius: calc(${v('raio')} + ${PAD}px);
  background: color-mix(in srgb, ${v('suave')} 22%, transparent);
${des ? `  opacity: ${v('opacidade')};\n` : ''}}
.${C}__indicador {
  position: absolute;
  top: ${PAD}px;
  bottom: ${PAD}px;
  left: ${PAD}px;
  width: calc(50% - ${PAD}px);
  border-radius: ${v('raio')};
  background: ${v('primaria')};
  box-shadow: 0 2px 8px color-mix(in srgb, ${v('primaria')} 35%, transparent);
  transition: ${transicao};
}
.${C}[data-segunda="true"] .${C}__indicador { transform: translateX(100%); }${
      cfg.animacao === 'sumir'
        ? `\n.${C}[data-segunda="true"] .${C}__indicador { transform: translateX(100%); animation: ${C}-troca ${v('duracao')} ${v('easing')}; }\n@keyframes ${C}-troca { from { opacity: 0; } }`
        : ''
    }
.${C}__op {
  position: relative;
  z-index: 1;
  min-width: ${L}px;
  padding: .5em 1.1em;
  border: 0;
  border-radius: ${v('raio')};
  background: none;
  color: ${v('texto')};
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: color ${v('duracao')} ${v('easing')};
}
.${C}__op:hover { color: ${v('primaria')}; }
.${C}__op[aria-checked="true"] { color: ${v('fundo')}; }
.${C}__op:focus-visible { outline: 3px solid color-mix(in srgb, ${v('primaria')} 45%, transparent); outline-offset: 2px; }
${
  comTamanhos
    ? TAMANHOS_SEL.map(
        (t) =>
          `.${C}[data-tamanho="${t.valor}"] .${C}__op { padding: ${t.py}px 1.1em; font-size: ${t.fonte}px; }`,
      ).join('\n')
    : ''
}
.${C}[aria-disabled="true"] { opacity: .45; pointer-events: none; }`;
    const js = `document.querySelectorAll('.${C}').forEach((g) => {
  const ops = [g.querySelector('.${C}__a'), g.querySelector('.${C}__b')];
  const escolher = (i, focar) => {
    g.setAttribute('data-segunda', String(i === 1));
    ops.forEach((o, k) => {
      o.setAttribute('aria-checked', String(k === i));
      o.tabIndex = k === i ? 0 : -1;
    });
    if (focar) ops[i].focus();
    g.dispatchEvent(new CustomEvent('change', { detail: { segunda: i === 1, valor: ops[i].textContent } }));
  };
  ops.forEach((o, i) => o.addEventListener('click', () => escolher(i)));
  g.addEventListener('keydown', (e) => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
      escolher(g.getAttribute('data-segunda') === 'true' ? 0 : 1, true);
    }
  });
});`;

    /* ---------- Figma ---------- */
    const fonte: KcxRef<number> = tamanho
      ? ({
          $derivado: tamanho,
          nome: 'seletor-fonte',
          transformar: [
            {
              op: 'mapa',
              valores: Object.fromEntries(TAMANHOS_SEL.map((t) => [t.valor, String(t.fonte)])),
            },
          ],
        } as never)
      : 15;
    const py: KcxRef<number> = tamanho
      ? ({
          $derivado: tamanho,
          nome: 'seletor-py',
          transformar: [
            {
              op: 'mapa',
              valores: Object.fromEntries(TAMANHOS_SEL.map((t) => [t.valor, String(t.py)])),
            },
          ],
        } as never)
      : 8;
    const corDa = (nome: string, quandoSegunda: string, quandoPrimeira: string): KcxRef<string> =>
      ({
        $derivado: segunda,
        nome,
        transformar: [
          {
            op: 'variavelPorOpcao',
            variaveis: { true: quandoSegunda, false: quandoPrimeira },
          },
        ],
      }) as never;
    const opcao = (lado: 'a' | 'b'): KcxNo =>
      b.pilha(
        `opcao-${lado}`,
        lado === 'a' ? 'Primeira opção' : 'Segunda opção',
        'horizontal',
        [
          b.noTexto(
            lado === 'a' ? 'opcaoA' : 'opcaoB',
            lado === 'a' ? 'Primeira opção' : 'Segunda opção',
            {
              estilo: 'Semi Bold',
              tamanho: fonte,
              alinhamento: 'centro',
              preencher: true,
              cor:
                lado === 'a'
                  ? corDa('opcao-a-cor', 'corTexto', 'corFundo')
                  : corDa('opcao-b-cor', 'corFundo', 'corTexto'),
            },
          ),
        ],
        { largura: L, py, alinhar: 'centro' },
      );
    // Altura do destaque = altura de uma opção (padding + linha de texto).
    const alturaDe = (t: (typeof TAMANHOS_SEL)[number]) => t.py * 2 + Math.round(t.fonte * 1.4);
    const indicador: KcxNo = {
      id: 'indicador',
      nome: 'Destaque',
      tipo: 'retangulo',
      absoluto: true,
      x: mapaBool(segunda, 'indicador-x', String(PAD + L), String(PAD)),
      y: PAD,
      largura: L,
      altura: tamanho
        ? ({
            $derivado: tamanho,
            nome: 'indicador-altura',
            transformar: [
              {
                op: 'mapa',
                valores: Object.fromEntries(
                  TAMANHOS_SEL.map((t) => [t.valor, String(alturaDe(t))]),
                ),
              },
            ],
          } as never)
        : alturaDe(TAMANHOS_SEL[1]),
      raio: b.raio,
      preenchimentos: [{ tipo: 'solido', cor: b.cor('primaria') }],
    };
    const estrutura = b.pilha(
      'seletor',
      cfg.nome,
      'horizontal',
      [indicador, opcao('a'), opcao('b')],
      {
        px: PAD,
        py: PAD,
        raio: b.raio,
        preenchimentos: [{ tipo: 'solido', cor: b.corAlpha('corSuave', 'seletor-trilho', 0.22) }],
        opacidade: des ? { $var: 'opacidadeSeletor' } : undefined,
      },
    );

    /* ---------- Estados e protótipo ---------- */
    const base: Record<string, number> = des ? { opacidadeSeletor: 1 } : {};
    const estados: KcxEstado[] = [
      {
        id: 'primeira',
        nome: 'Primeira',
        gatilho: 'padrao',
        descricao: `"${b.texto('opcaoA')}" escolhida (falso).`,
        valores: { [segunda]: false, ...base },
      },
      {
        id: 'segunda',
        nome: 'Segunda',
        gatilho: 'active',
        descricao: `"${b.texto('opcaoB')}" escolhida (verdadeiro).`,
        valores: { [segunda]: true, ...base },
      },
      ...(des
        ? [
            {
              id: 'desativado',
              nome: 'Desativado',
              gatilho: 'desativado' as const,
              descricao: 'Não pode ser usado agora.',
              valores: { [segunda]: false, opacidadeSeletor: 0.45 },
            },
          ]
        : []),
    ];
    const curva = mola ? ('mola' as const) : undefined;
    const tema = (modo: 'Light' | 'Dark') =>
      b.tem('tema') ? [{ tipo: 'modo' as const, colecao: 'KCX · Colors', modo }] : undefined;
    const interacoes: KcxInteracao[] = [
      {
        ...interacao('opcao-b', 'primeira', 'segunda', 'clique', 260),
        curva,
        acoes: tema('Light'),
      },
      { ...interacao('opcao-a', 'segunda', 'primeira', 'clique', 260), curva, acoes: tema('Dark') },
    ];

    return {
      html,
      css,
      js,
      estrutura,
      estados,
      interacoes,
      eixos: tamanho ? [tamanho] : [],
      animacao: {
        nome: SELETOR_DUPLO.animacoes.find((a) => a.id === cfg.animacao)?.nome ?? 'Desliza',
        tecnica: cfg.animacao === 'sumir' ? 'css-keyframes' : 'css-transition',
        variaveis: ['duracao', 'easing'],
        descricao:
          'O destaque anda com translateX (ou aparece no outro lado). No Figma: clicar na outra opção troca de variante com Smart Animate.',
      },
      editavel: [
        `Variantes: Estado (Primeira, Segunda${des ? ', Desativado' : ''})${tamanho ? ' × Tamanho (P, M, G)' : ''}`,
        `Protótipo: clicar na outra opção desliza o destaque (Smart Animate${curva ? ' com mola' : ''})`,
        'Os dois textos são propriedades de texto',
      ],
      tags: ['segmented control', 'toggle', 'idioma', 'radiogroup'],
    };
  },
};

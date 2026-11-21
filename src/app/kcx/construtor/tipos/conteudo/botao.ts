import { KcxEfeito, KcxNo, KcxRef } from '../../../kcx.types';
import { estadosDs } from '../../estados-ds';
import { DefinicaoTipo } from '../../montar';
import { sombraHover, TAMANHOS, varsPreencher } from './_comum';

export const BOTAO: DefinicaoTipo = {
  id: 'botao',
  nome: 'Botão',
  categoria: 'acoes',
  uso: 'site e app',
  descricao:
    'Botão de design system: tipos (primário, secundário, terciário, destrutivo), tamanhos P/M/G, estados e ícones trocáveis.',
  textos: [
    { id: 'rotulo', rotulo: 'Texto do botão', padrao: 'Começar agora' },
    { id: 'contador', rotulo: 'Contador', padrao: '3', recurso: 'contador' },
  ],
  recursos: [
    {
      id: 'tipos',
      nome: 'Tipos',
      descricao: 'Primário, Secundário (contorno), Terciário (só texto) e Destrutivo.',
      padrao: true,
      exceto: ['preencher'],
    },
    { id: 'tamanhos', nome: 'Tamanhos', descricao: 'P, M e G (padding e texto).', padrao: true },
    {
      id: 'estados',
      nome: 'Estados',
      descricao: 'Pressionado, Foco (teclado) e Desativado, além de Padrão e Hover.',
      padrao: true,
    },
    {
      id: 'carregando',
      nome: 'Carregando',
      descricao: 'Mais um estado: o texto dá lugar a um ícone girando (spinner).',
      padrao: false,
    },
    {
      id: 'contador',
      nome: 'Contador',
      descricao: 'Selo com número no canto (notificações, carrinho), liga/desliga.',
      padrao: false,
    },
    {
      id: 'icones',
      nome: 'Ícones',
      descricao: 'Ícone à esquerda e à direita: liga/desliga e troca de ícone no Figma.',
      padrao: true,
    },
  ],
  icones: [
    { id: 'esquerda', rotulo: 'Ícone à esquerda', padrao: 'mais', recurso: 'icones' },
    { id: 'direita', rotulo: 'Ícone à direita', padrao: 'seta', recurso: 'icones' },
  ],
  animacoes: [
    {
      id: 'elevar',
      nome: 'Sobe com sombra',
      descricao: 'Sobe um pouco e ganha sombra colorida no hover.',
    },
    {
      id: 'preencher',
      nome: 'Preenche no hover',
      descricao: 'Contorno que se enche de cor no hover.',
    },
    { id: 'brilho', nome: 'Brilho pulsando', descricao: 'Um halo pulsa em volta o tempo todo.' },
    { id: 'pulsar', nome: 'Pulsa', descricao: 'O botão cresce e volta, chamando atenção.' },
  ],
  largura: 260,
  altura: 64,
  gerar(cfg, b) {
    const C = b.C;
    const v = (n: string) => b.v(n);
    const txtBtn = b.textoBotao();
    const preencher = cfg.animacao === 'preencher';
    const comTipos = b.tem('tipos') && !preencher;
    const comTamanhos = b.tem('tamanhos');
    const comEstados = b.tem('estados');
    const comIcones = b.tem('icones');
    const s = sombraHover(b, 'botao');
    const ds = comEstados ? estadosDs(b) : undefined;

    /* ---------- Variáveis dos recursos ---------- */
    const TIPOS_BTN = [
      { valor: 'primario', rotulo: 'Primário' },
      { valor: 'secundario', rotulo: 'Secundário' },
      { valor: 'terciario', rotulo: 'Terciário' },
      { valor: 'destrutivo', rotulo: 'Destrutivo' },
    ];
    const tipo = comTipos
      ? b.extra({
          id: 'tipoBotao',
          nome: 'Tipo',
          tipo: 'enum',
          padrao: 'primario',
          opcoes: TIPOS_BTN,
          descricao: 'Hierarquia do botão. No Figma é um eixo de variante.',
          grupo: 'components',
          secao: 'aparencia',
          vinculos: [
            {
              propriedade: 'data-tipo',
              alvo: { tipo: 'atributo', seletor: `.${C}`, atributo: 'data-tipo' },
            },
          ],
        })
      : undefined;
    const perigo = comTipos
      ? b.extra({
          id: 'corPerigo',
          nome: 'Cor de perigo',
          tipo: 'color',
          padrao: '#ff5c7a',
          descricao: 'Cor do botão Destrutivo (excluir, cancelar assinatura).',
          grupo: 'colors',
          secao: 'aparencia',
          vinculos: [{ propriedade: 'perigo', alvo: { tipo: 'css-var', nome: `${b.P}-perigo` } }],
        })
      : undefined;
    const tamanho = comTamanhos
      ? b.extra({
          id: 'tamanho',
          nome: 'Tamanho',
          tipo: 'enum',
          padrao: 'm',
          opcoes: TAMANHOS.map((t) => ({ valor: t.valor, rotulo: t.rotulo })),
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
    const iconeLado = (lado: 'esquerda' | 'direita', padrao: boolean) =>
      b.extra({
        id: lado === 'esquerda' ? 'iconeEsquerda' : 'iconeDireita',
        nome: lado === 'esquerda' ? 'Ícone à esquerda' : 'Ícone à direita',
        tipo: 'boolean',
        padrao,
        descricao: `Mostra o ícone ${lado === 'esquerda' ? 'antes' : 'depois'} do texto. No Figma é uma propriedade liga/desliga.`,
        grupo: 'components',
        secao: 'aparencia',
        vinculos: [
          {
            propriedade: `data-icone-${lado}`,
            alvo: { tipo: 'atributo', seletor: `.${C}`, atributo: `data-icone-${lado}` },
            transformar: [{ op: 'mapa', valores: { true: 'true', false: 'false' } }],
          },
        ],
      });
    const comCarregando = b.tem('carregando');
    const carregando = comCarregando
      ? b.extra({
          id: 'carregando',
          nome: 'Carregando',
          tipo: 'boolean',
          padrao: false,
          descricao: 'Mostra o spinner no lugar do texto (enquanto envia).',
          grupo: 'components',
          secao: 'comportamento',
          vinculos: [
            {
              propriedade: 'data-carregando',
              alvo: { tipo: 'atributo', seletor: `.${C}`, atributo: 'data-carregando' },
              transformar: [{ op: 'mapa', valores: { true: 'true', false: 'false' } }],
            },
          ],
        })
      : undefined;
    const comContador = b.tem('contador');
    const mostrarContador = comContador
      ? b.extra({
          id: 'mostrarContador',
          nome: 'Mostrar contador',
          tipo: 'boolean',
          padrao: true,
          descricao: 'Liga e desliga o selo com número. No Figma é uma propriedade liga/desliga.',
          grupo: 'components',
          secao: 'aparencia',
          vinculos: [
            {
              propriedade: 'data-contador',
              alvo: { tipo: 'atributo', seletor: `.${C}`, atributo: 'data-contador' },
              transformar: [{ op: 'mapa', valores: { true: 'true', false: 'false' } }],
            },
          ],
        })
      : undefined;
    const ie = comIcones ? iconeLado('esquerda', false) : undefined;
    const id = comIcones ? iconeLado('direita', true) : undefined;
    const nomeIe = b.nomeIcone('esquerda', 'mais');
    const nomeId = b.nomeIcone('direita', 'seta');

    /* ---------- Cores por tipo (Figma) ---------- */
    const porTipo = (
      nome: string,
      vars: Record<string, string>,
      alphas?: Record<string, number>,
    ): KcxRef<string> =>
      ({
        $derivado: tipo!,
        nome,
        transformar: [
          { op: 'variavelPorOpcao', variaveis: vars },
          ...(alphas ? [{ op: 'alphaPorOpcao', variavel: tipo!, valores: alphas }] : []),
        ],
      }) as never;
    const BASE = {
      primario: 'corPrimaria',
      secundario: 'corPrimaria',
      terciario: 'corPrimaria',
      destrutivo: perigo ?? 'corPrimaria',
    };
    const base: KcxRef<string> = tipo ? porTipo('botao-base', BASE) : b.cor('primaria');
    const fundoBtn: KcxRef<string> = tipo
      ? porTipo('botao-cor', BASE, { primario: 1, secundario: 0, terciario: 0, destrutivo: 1 })
      : b.cor('primaria');
    const contorno: KcxRef<string> | undefined = tipo
      ? porTipo('contorno-cor', BASE, { primario: 0, secundario: 1, terciario: 0, destrutivo: 0 })
      : undefined;
    const corTexto: KcxRef<string> = tipo
      ? porTipo('rotulo-cor', {
          primario: 'corTextoBotao',
          secundario: 'corPrimaria',
          terciario: 'corPrimaria',
          destrutivo: 'corTextoBotao',
        })
      : { $var: 'corTextoBotao' };
    const sombraCor: KcxRef<string> = tipo
      ? ({
          $derivado: tipo,
          nome: 'sombra-cor',
          transformar: [
            { op: 'variavelPorOpcao', variaveis: BASE },
            {
              op: 'alphaPorOpcao',
              variavel: tipo,
              valores: { primario: 1, secundario: 0.6, terciario: 0, destrutivo: 1 },
            },
            { op: 'alpha', variavel: s.id },
          ],
        } as never)
      : s.efeito.tipo === 'sombra'
        ? s.efeito.cor
        : b.cor('primaria');

    /* ---------- Tamanho (Figma) ---------- */
    const porTamanho = (campo: 'px' | 'py' | 'fonte' | 'icone', nome: string): KcxRef<number> =>
      ({
        $derivado: tamanho!,
        nome,
        transformar: [
          {
            op: 'mapa',
            valores: Object.fromEntries(
              TAMANHOS.map((t) => [
                t.valor,
                String(campo === 'icone' ? Math.round(t.fonte * 1.15) : t[campo]),
              ]),
            ),
          },
        ],
      }) as never;
    const px = tamanho ? porTamanho('px', 'botao-px') : b.espacoX(1.5, 'botao-px');
    const py = tamanho ? porTamanho('py', 'botao-py') : b.espacoX(0.75, 'botao-py');
    const fonte = tamanho ? porTamanho('fonte', 'botao-fonte') : b.fonte;

    /* ---------- Código ---------- */
    const anims: Record<string, string> = {
      elevar: `.${C}:hover, .${C}:focus-visible { transform: translateY(-3px); box-shadow: ${s.sombraCss}; }
.${C}:active { transform: translateY(0) scale(.98); }`,
      preencher: `.${C} { background: transparent; color: ${v('primaria')}; box-shadow: inset 0 0 0 2px ${v('primaria')}; isolation: isolate; overflow: hidden; }
.${C}::before { content: ''; position: absolute; inset: 0; z-index: -1; background: ${v('primaria')}; transform: scaleX(0); transform-origin: left; transition: transform ${v('duracao')} ${v('easing')}; }
.${C}:hover, .${C}:focus-visible { color: ${txtBtn}; box-shadow: inset 0 0 0 2px ${v('primaria')}, ${s.sombraCss}; }
.${C}:hover::before, .${C}:focus-visible::before { transform: scaleX(1); }`,
      brilho: `.${C} { animation: ${C}-brilho calc(${v('duracao')} * 6) ease-in-out infinite; }
@keyframes ${C}-brilho { 50% { box-shadow: ${s.sombraCss}, 0 0 0 6px color-mix(in srgb, ${v('primaria')} 25%, transparent); } }`,
      pulsar: `.${C} { animation: ${C}-pulso calc(${v('duracao')} * 5) ${v('easing')} infinite; }
.${C}:hover { animation-play-state: paused; box-shadow: ${s.sombraCss}; }
@keyframes ${C}-pulso { 50% { transform: scale(1.05); } }`,
    };
    const cssTipos = comTipos
      ? `.${C}[data-tipo="secundario"] { background: transparent; color: ${v('primaria')}; box-shadow: inset 0 0 0 1.5px ${v('primaria')}; }
.${C}[data-tipo="terciario"] { background: transparent; color: ${v('primaria')}; }
.${C}[data-tipo="terciario"]:hover { box-shadow: none; }
.${C}[data-tipo="destrutivo"] { background: ${v('perigo')}; --kcx-cor-sombra: ${v('perigo')}; }`
      : '';
    const cssTamanhos = comTamanhos
      ? TAMANHOS.map(
          (t) =>
            `.${C}[data-tamanho="${t.valor}"] { padding: ${t.py}px ${t.px}px; font-size: ${t.fonte}px; }`,
        ).join('\n')
      : '';
    const cssIcones = comIcones
      ? `.${C}__icone { flex: none; width: 1.15em; height: 1.15em; }
.${C}[data-icone-esquerda="false"] .${C}__icone--esquerda, .${C}[data-icone-direita="false"] .${C}__icone--direita { display: none; }`
      : '';
    const css = `.${C} {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: .5em;
  padding: calc(${v('espaco')} * .75) calc(${v('espaco')} * 1.5);
  border: 0;
  border-radius: ${v('raio')};
  background: ${v('primaria')};
  color: ${txtBtn};
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: transform ${v('duracao')} ${v('easing')}, box-shadow ${v('duracao')} ${v('easing')}, color ${v('duracao')} ${v('easing')}, opacity ${v('duracao')} ${v('easing')};
}
${anims[cfg.animacao] ?? anims['elevar']}
${cssTipos}
${cssTamanhos}
${cssIcones}
${ds ? ds.css(`.${C}`, v('primaria')) : ''}${
      comCarregando
        ? `
.${C}__spinner { display: none; width: 1.15em; height: 1.15em; animation: ${C}-gira .8s linear infinite; }
.${C}[data-carregando="true"] { pointer-events: none; }
.${C}[data-carregando="true"] .${C}__spinner { display: block; }
.${C}[data-carregando="true"] > :not(.${C}__spinner):not(.${C}__contador) { visibility: hidden; }
.${C}[data-carregando="true"] .${C}__spinner { position: absolute; inset: 0; margin: auto; }
@keyframes ${C}-gira { to { transform: rotate(1turn); } }`
        : ''
    }${
      comContador
        ? `
.${C}__contador { min-width: 20px; height: 20px; padding: 0 6px; border-radius: 10px; background: ${v('perigo-contador')}; color: #fff; font-size: 12px; line-height: 20px; text-align: center; }
.${C}[data-contador="false"] .${C}__contador { display: none; }`
        : ''
    }`;
    const attrs = [
      tipo ? 'data-tipo="primario"' : '',
      tamanho ? 'data-tamanho="m"' : '',
      comIcones ? 'data-icone-esquerda="false" data-icone-direita="true"' : '',
    ]
      .filter(Boolean)
      .join(' ');
    const html = `<button class="${C}" type="button"${attrs ? ' ' + attrs : ''}>${
      comIcones ? b.svgKcx(nomeIe, `${C}__icone ${C}__icone--esquerda`) : ''
    }${b.span('rotulo')}${comIcones ? b.svgKcx(nomeId, `${C}__icone ${C}__icone--direita`) : ''}${
      comCarregando ? b.svgKcx('carregando', `${C}__spinner`) : ''
    }${comContador ? b.span('contador') : ''}</button>`;

    /* ---------- Figma ---------- */
    const texto = b.noTexto('rotulo', 'Texto do botão', {
      estilo: 'Semi Bold',
      cor: corTexto,
      tamanho: fonte,
    });
    let filhos: KcxNo[] = [texto];
    if (comIcones) {
      const tam = tamanho ? porTamanho('icone', 'botao-icone') : 18;
      filhos = [
        b.noIcone('icone-esquerda', 'Ícone à esquerda', nomeIe, corTexto, tam, {
          troca: 'Ícone à esquerda (trocar)',
          visivel: { $var: ie! },
          propriedadeVisivel: 'Ícone à esquerda',
        }),
        texto,
        b.noIcone('icone-direita', 'Ícone à direita', nomeId, corTexto, tam, {
          troca: 'Ícone à direita (trocar)',
          visivel: { $var: id! },
          propriedadeVisivel: 'Ícone à direita',
        }),
      ];
    }
    if (carregando) {
      texto.visivel = b.nao(carregando, 'texto-visivel');
      filhos = [
        ...filhos,
        b.noIcone(
          'spinner',
          'Carregando',
          'carregando',
          corTexto,
          tamanho ? porTamanho('icone', 'botao-icone') : 18,
          {
            visivel: { $var: carregando },
          },
        ),
      ];
    }
    if (comContador) {
      filhos = [
        ...filhos,
        b.pilha(
          'contador',
          'Contador',
          'horizontal',
          [
            b.noTexto('contador', 'Contador', {
              estilo: 'Bold',
              tamanho: 12,
              cor: '#ffffff',
            }),
          ],
          {
            px: 6,
            py: 2,
            raio: 10,
            preenchimentos: [{ tipo: 'solido', cor: { $var: 'corContador' } }],
            visivel: { $var: mostrarContador! },
            propriedadeVisivel: 'Mostrar contador',
          },
        ),
      ];
      b.extra({
        id: 'corContador',
        nome: 'Cor do contador',
        tipo: 'color',
        padrao: '#ff5c7a',
        descricao: 'Fundo do selo com número.',
        grupo: 'colors',
        secao: 'aparencia',
        vinculos: [
          { propriedade: 'contador', alvo: { tipo: 'css-var', nome: `${b.P}-perigo-contador` } },
        ],
      });
    }
    if (ds) filhos = [ds.noRealce(corTexto), ...filhos];
    const efeitos: KcxEfeito[] = [
      { ...(s.efeito as KcxEfeito & { tipo: 'sombra' }), cor: sombraCor },
    ];
    if (ds) efeitos.push(ds.efeitoAnel(base));
    const estrutura = b.pilha('botao', cfg.nome, 'horizontal', filhos, {
      espaco: tamanho ? 8 : b.espacoX(0.5, 'botao-espaco'),
      px,
      py,
      raio: b.raio,
      preenchimentos: [{ tipo: 'solido', cor: fundoBtn }],
      traco: contorno ? { cor: contorno, espessura: 1.5 } : undefined,
      efeitos,
      opacidade: ds ? { $var: ds.opacidade } : undefined,
    });

    let estados = ds
      ? ds.estados({ padrao: { [s.id]: 0 }, pressionado: { [s.id]: 0 } })
      : s.estados;
    if (carregando) {
      estados = estados.map((e) => ({ ...e, valores: { ...e.valores, [carregando]: false } }));
      estados.push({
        id: 'carregando',
        nome: 'Carregando',
        gatilho: 'final',
        descricao: 'Enviando: spinner no lugar do texto.',
        valores: { ...estados[0].valores, [carregando]: true },
      });
    }
    if (preencher) {
      const p = varsPreencher(b);
      estrutura.preenchimentos = [
        { tipo: 'solido', cor: b.corAlpha('corPrimaria', 'botao-cor', p.cheio) },
      ];
      estrutura.traco = { cor: b.cor('primaria'), espessura: 2 };
      const rotulo = estrutura.filhos!.find((f) => f.id === 't-rotulo')!;
      rotulo.preenchimentos = [
        { tipo: 'solido', cor: { $var: 'corTextoBotao' } },
        { tipo: 'solido', cor: b.corAlpha('corPrimaria', 'rotulo-cor', p.vazio) },
      ];
      estados = estados.map((e) =>
        e.id === 'padrao' || e.id === 'foco' || e.id === 'desativado'
          ? { ...e, valores: { ...e.valores, [p.cheio]: 0, [p.vazio]: 1 } }
          : e,
      );
    }
    const editavel = [
      `Variantes: ${[
        tipo ? 'Tipo (Primário, Secundário, Terciário, Destrutivo)' : '',
        tamanho ? 'Tamanho (P, M, G)' : '',
        ds ? 'Estado (Padrão, Hover, Pressionado, Foco, Desativado)' : 'Estado (Padrão, Hover)',
      ]
        .filter(Boolean)
        .join(' × ')}`,
      ds
        ? 'Protótipo: While hovering → Hover e While pressing → Pressionado (Smart Animate)'
        : 'Protótipo: While hovering → Hover (Smart Animate)',
      'Auto Layout: o botão cresce com o texto',
    ];
    if (comIcones)
      editavel.push(
        'Ícones à esquerda e à direita: liga/desliga e troca de ícone (Instance swap) com a biblioteca KCX Ícone',
      );
    return {
      html,
      css,
      estrutura,
      estados,
      interacoes: [
        ...(ds ? ds.interacoes('botao') : s.interacoes),
        // Clicar (pressionado) mostra o carregando.
        ...(carregando && ds
          ? [
              {
                no: 'botao',
                gatilho: 'clique' as const,
                de: 'pressionado',
                para: 'carregando',
                transicao: 'smart-animate' as const,
                duracao: 150,
              },
              {
                no: 'botao',
                gatilho: 'atraso' as const,
                atraso: 1500,
                de: 'carregando',
                para: 'padrao',
                transicao: 'smart-animate' as const,
                duracao: 200,
              },
            ]
          : []),
      ],
      eixos: [tipo, tamanho].filter((x): x is string => !!x),
      animacao: {
        nome: BOTAO.animacoes.find((a) => a.id === cfg.animacao)?.nome ?? 'Hover',
        tecnica:
          cfg.animacao === 'brilho' || cfg.animacao === 'pulsar'
            ? 'css-keyframes'
            : 'css-transition',
        variaveis: ['duracao', 'easing', 'forcaSombra'],
        descricao:
          'Transição de transform e box-shadow (ou keyframes contínuos). No Figma: uma variante por estado com While hovering e While pressing.',
      },
      editavel,
      naoSuportado: ['Movimento contínuo (pulsar e brilho)'],
      tags: ['button', 'cta', 'design system'],
    };
  },
};

/* ============================== Card de foto ============================== */

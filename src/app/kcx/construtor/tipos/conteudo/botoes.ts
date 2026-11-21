import { KcxNo, KcxOperacao } from '../../../kcx.types';
import { estadosCss, estadosDs } from '../../estados-ds';
import { DefinicaoTipo } from '../../montar';
import { corDoBotao, TAMANHOS, varsPreencher } from './_comum';

export const BOTOES: DefinicaoTipo = {
  id: 'botoes',
  nome: 'Conjunto de botões',
  categoria: 'acoes',
  coresPorItem: true,
  uso: 'site e app',
  descricao:
    'Vários botões num componente só: no Figma, variantes por botão (nome e cor), tamanho (P, M, G) e estado (Padrão, Hover).',
  textos: [],
  itens: { rotulo: 'Botão', padrao: ['Entrar', 'Criar conta'], min: 1, max: 6 },
  recursos: [
    {
      id: 'estados',
      nome: 'Estados',
      descricao: 'Pressionado, Foco (teclado) e Desativado, além de Padrão e Hover.',
      padrao: true,
    },
  ],
  animacoes: [
    {
      id: 'elevar',
      nome: 'Sobe com sombra',
      descricao: 'Sobe um pouco e ganha sombra na cor do botão.',
    },
    {
      id: 'preencher',
      nome: 'Preenche no hover',
      descricao: 'Contorno que se enche de cor no hover.',
    },
    {
      id: 'brilho',
      nome: 'Brilho no hover',
      descricao: 'Um halo na cor do botão aparece no hover.',
    },
  ],
  largura: 420,
  altura: 64,
  gerar(cfg, b) {
    const C = b.C;
    const v = (n: string) => b.v(n);
    const cores = cfg.itens.map((_, i) =>
      b.extra({
        id: `corBotao${i + 1}`,
        nome: `Cor do botão ${i + 1}`,
        tipo: 'color',
        padrao: corDoBotao(cfg, i),
        descricao: `Cor do botão “${cfg.itens[i]}”.`,
        grupo: 'colors',
        secao: 'aparencia',
        vinculos: [
          { propriedade: 'background', alvo: { tipo: 'css-var', nome: `${b.P}-botao-${i + 1}` } },
        ],
      }),
    );
    const acao = b.extra({
      id: 'botaoFigma',
      nome: 'Botão',
      tipo: 'enum',
      padrao: 'b1',
      opcoes: cfg.itens.map((t, i) => ({ valor: `b${i + 1}`, rotulo: t || `Botão ${i + 1}` })),
      descricao:
        'Eixo de variante no Figma: um conjunto de variantes por botão. No código todos os botões aparecem.',
      grupo: 'components',
      secao: 'comportamento',
      vinculos: [
        {
          propriedade: 'data-destaque',
          alvo: { tipo: 'atributo', seletor: `.${C}`, atributo: 'data-destaque' },
        },
      ],
    });
    const tamanho = b.extra({
      id: 'tamanho',
      nome: 'Tamanho',
      tipo: 'enum',
      padrao: 'm',
      opcoes: TAMANHOS.map((t) => ({ valor: t.valor, rotulo: t.rotulo })),
      descricao: 'P, M ou G (padding e tamanho do texto). No Figma é um eixo de variante.',
      grupo: 'dimensions',
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: 'data-tamanho',
          alvo: { tipo: 'atributo', seletor: `.${C}`, atributo: 'data-tamanho' },
        },
      ],
    });
    const forca = b.extra({
      id: 'forcaSombra',
      nome: 'Força da sombra no hover',
      tipo: 'float',
      padrao: 0.5,
      min: 0,
      max: 1,
      passo: 0.05,
      descricao: 'Opacidade da sombra que aparece no hover.',
      grupo: 'effects',
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: 'Opacidade da sombra',
          alvo: { tipo: 'css-var', nome: `${b.P}-sombra` },
          transformar: [{ op: 'multiplicar', fator: 100 }],
          unidadeSaida: '%',
        },
      ],
    });
    const sombra = `0 10px 24px color-mix(in srgb, var(--cor) ${v('sombra')}, transparent)`;
    const efeito: Record<string, string> = {
      elevar: `.${C}__btn:hover, .${C}__btn:focus-visible { transform: translateY(-3px); box-shadow: ${sombra}; }`,
      preencher: `.${C}__btn { background: transparent; color: var(--cor); box-shadow: inset 0 0 0 2px var(--cor); }
.${C}__btn:hover, .${C}__btn:focus-visible { background: var(--cor); color: ${b.textoBotao()}; }`,
      brilho: `.${C}__btn:hover, .${C}__btn:focus-visible { box-shadow: 0 0 0 4px color-mix(in srgb, var(--cor) 25%, transparent), ${sombra}; }`,
    };
    const html = `<div class="${C}" data-tamanho="m" data-destaque="b1">
  ${cfg.itens.map((_, i) => b.item(i, 'button', `class="${C}__btn" type="button" style="--cor: ${v(`botao-${i + 1}`)}"`)).join('\n  ')}
</div>`;
    const css = `.${C} { display: flex; flex-wrap: wrap; gap: calc(${v('espaco')} * .75); align-items: center; }
.${C}__btn {
  padding: .75em 1.5em;
  border: 0;
  border-radius: ${v('raio')};
  background: var(--cor);
  color: ${b.textoBotao()};
  font-weight: 600;
  transition: transform ${v('duracao')} ${v('easing')}, box-shadow ${v('duracao')} ${v('easing')}, background ${v('duracao')} ${v('easing')}, color ${v('duracao')} ${v('easing')};
}
.${C}__btn:active { transform: translateY(0) scale(.98); }
${TAMANHOS.map((t) => `.${C}[data-tamanho="${t.valor}"] .${C}__btn { padding: ${t.py}px ${t.px}px; font-size: ${t.fonte}px; }`).join('\n')}
${efeito[cfg.animacao] ?? efeito['elevar']}
${b.tem('estados') ? estadosCss(b, `.${C}__btn`) : ''}`;
    /** Valor que depende do botão (variante): escolhe a variável do botão atual. */
    const doBotao = (prefixo: string, nome: string, extra: KcxOperacao[] = []) =>
      ({
        $derivado: acao,
        nome,
        transformar: [
          {
            op: 'variavelPorOpcao',
            variaveis: Object.fromEntries(
              cfg.itens.map((_, i) => [`b${i + 1}`, `${prefixo}${i + 1}`]),
            ),
          },
          ...extra,
        ],
      }) as never;
    const porTamanho = (campo: 'px' | 'py' | 'fonte', nome: string) =>
      ({
        $derivado: tamanho,
        nome,
        transformar: [
          {
            op: 'mapa',
            valores: Object.fromEntries(TAMANHOS.map((t) => [t.valor, String(t[campo])])),
          },
        ],
      }) as never;
    const preencher = cfg.animacao === 'preencher';
    const p = preencher ? varsPreencher(b) : undefined;
    const ds = b.tem('estados') ? estadosDs(b) : undefined;
    const corAtual = p
      ? doBotao('corBotao', 'botao-cor', [{ op: 'alpha', variavel: p.cheio }])
      : doBotao('corBotao', 'botao-cor');
    const estrutura: KcxNo = {
      id: 'botao',
      nome: cfg.nome,
      tipo: 'frame',
      raio: b.raio,
      preenchimentos: [{ tipo: 'solido', cor: corAtual }],
      traco: p ? { cor: doBotao('corBotao', 'contorno-cor'), espessura: 2 } : undefined,
      efeitos: [
        {
          tipo: 'sombra',
          x: 0,
          y: 10,
          cor: doBotao('corBotao', 'sombra-cor', [{ op: 'alpha', variavel: 'forcaSombra' }]),
          raio: {
            $derivado: forca,
            nome: 'sombra-raio',
            transformar: [{ op: 'multiplicar', fator: 48 }],
          },
        },
        ...(ds ? [ds.efeitoAnel(doBotao('corBotao', 'anel-base'))] : []),
      ],
      autoLayout: {
        direcao: 'horizontal',
        espaco: 0,
        paddingX: porTamanho('px', 'botao-px'),
        paddingY: porTamanho('py', 'botao-py'),
      },
      opacidade: ds ? { $var: ds.opacidade } : undefined,
      filhos: [
        ...(ds
          ? [
              ds.noRealce(
                p ? doBotao('corBotao', 'realce-base') : { $var: 'corFundo' },
                'realce-cor',
              ),
            ]
          : []),
        {
          id: 'rotulo',
          nome: 'Rótulo',
          tipo: 'texto',
          preenchimentos: p
            ? [
                { tipo: 'solido', cor: { $var: 'corTextoBotao' } },
                {
                  tipo: 'solido',
                  cor: doBotao('corBotao', 'rotulo-cor', [{ op: 'alpha', variavel: p.vazio }]),
                },
              ]
            : [{ tipo: 'solido', cor: { $var: 'corTextoBotao' } }],
          texto: {
            conteudo: doBotao('item', 'botao-rotulo'),
            tamanho: porTamanho('fonte', 'botao-fonte'),
            familia: 'Inter',
            estilo: 'Semi Bold',
          },
        },
      ],
    };
    void cores;
    return {
      html,
      css,
      estrutura,
      eixos: [acao, tamanho],
      estados: ds
        ? ds
            .estados({
              padrao: { [forca]: 0, ...(p ? { [p.cheio]: 0, [p.vazio]: 1 } : {}) },
              hover: { [forca]: 0.5 },
              pressionado: { [forca]: 0, ...(p ? { [p.cheio]: 1, [p.vazio]: 0 } : {}) },
            })
            .map((e) => (e.id === 'pressionado' ? { ...e, valores: { ...e.valores } } : e))
        : [
            {
              id: 'padrao',
              nome: 'Padrão',
              gatilho: 'padrao',
              descricao: 'Em repouso.',
              valores: { [forca]: 0, ...(p ? { [p.cheio]: 0, [p.vazio]: 1 } : {}) },
            },
            {
              id: 'hover',
              nome: 'Hover',
              gatilho: 'hover',
              descricao: 'Mouse por cima: sombra na cor do botão.',
              valores: { [forca]: 0.5 },
            },
          ],
      interacoes: ds
        ? ds.interacoes('botao')
        : [
            {
              no: 'botao',
              gatilho: 'hover',
              de: 'padrao',
              para: 'hover',
              transicao: 'smart-animate',
              duracao: 300,
            },
          ],
      animacao: {
        nome: BOTOES.animacoes.find((a) => a.id === cfg.animacao)?.nome ?? 'Hover',
        tecnica: 'css-transition',
        variaveis: ['duracao', 'easing', 'forcaSombra'],
        descricao: 'Transição de transform, sombra e cor no hover.',
      },
      editavel: [
        `Variantes: Botão (${cfg.itens.join(', ')}) × Tamanho (P, M, G) × Estado (${ds ? 'Padrão, Hover, Pressionado, Foco, Desativado' : 'Padrão, Hover'})`,
        'Cada variante com a cor e o nome do seu botão; o tamanho muda padding e texto',
        'Protótipo: o hover troca para a variante Hover (Smart Animate)',
      ],
      tags: ['button', 'variantes', 'design system'],
    };
  },
};

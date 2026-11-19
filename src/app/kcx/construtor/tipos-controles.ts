/**
 * Tipos de controle e navegação menores: caixa de seleção, opções (radio),
 * chave liga/desliga, trilha (breadcrumb), paginação, etapas (stepper),
 * dica (tooltip), faixa de aviso (banner) e menu suspenso (dropdown).
 */
import { KcxInteracao, KcxNo, KcxRef } from '../kcx.types';
import { Blocos, DefinicaoTipo, escHtml } from './montar';

const interacao = (
  no: string,
  de: string,
  para: string,
  gatilho: KcxInteracao['gatilho'] = 'clique',
  duracao = 260,
): KcxInteracao => ({ no, gatilho, de, para, transicao: 'smart-animate', duracao });

/** Clicar no nó i leva ao estado i, a partir de todos os outros estados. */
function porIndice(no: (i: number) => string, estado: (i: number) => string, n: number) {
  const r: KcxInteracao[] = [];
  for (let de = 1; de <= n; de++)
    for (let para = 1; para <= n; para++)
      if (de !== para) r.push(interacao(no(para), estado(de), estado(para)));
  return r;
}

/** Cor que troca conforme o índice ativo: `ativo` quando idx === i. */
function corPorIndice(
  b: Blocos,
  idx: string,
  i: number,
  n: number,
  nome: string,
  ativa: string,
  inativa: string,
  incluirZero = false,
): KcxRef<string> {
  const variaveis: Record<string, string> = {};
  for (let k = incluirZero ? 0 : 1; k <= n; k++) variaveis[String(k)] = k === i ? ativa : inativa;
  return { $derivado: idx, nome, transformar: [{ op: 'variavelPorOpcao', variaveis }] } as never;
}

const boolAttr = (b: Blocos, id: string, nome: string, padrao: boolean, descricao: string) =>
  b.extra({
    id,
    nome,
    tipo: 'boolean',
    padrao,
    descricao,
    grupo: 'components',
    secao: 'comportamento',
    vinculos: [
      {
        propriedade: `data-${id}`,
        alvo: { tipo: 'atributo', seletor: `.${b.C}`, atributo: `data-${id}` },
        transformar: [{ op: 'mapa', valores: { true: 'true', false: 'false' } }],
      },
    ],
  });

const mapaBool = (id: string, nome: string, sim: string, nao: string) =>
  ({
    $derivado: id,
    nome,
    transformar: [{ op: 'mapa', valores: { true: sim, false: nao } }],
  }) as never;

/* ============================== Caixa de seleção ============================== */

export const CHECKBOX: DefinicaoTipo = {
  id: 'checkbox',
  nome: 'Caixa de seleção',
  categoria: 'formularios',
  uso: 'site e app',
  descricao: 'Checkbox com rótulo: Desmarcado, Marcado e Desativado; clicar marca e desmarca.',
  textos: [{ id: 'rotulo', rotulo: 'Rótulo', padrao: 'Aceito receber novidades' }],
  recursos: [
    {
      id: 'desativado',
      nome: 'Estado Desativado',
      descricao: 'Mais uma variante, apagada e sem clique.',
      padrao: true,
    },
  ],
  animacoes: [
    { id: 'check', nome: 'Check que aparece', descricao: 'A caixa enche e o check aparece.' },
    { id: 'pop', nome: 'Pop', descricao: 'A caixa dá um pequeno salto ao marcar.' },
    { id: 'cor', nome: 'Só cor', descricao: 'Troca de cor suave, sem movimento.' },
  ],
  largura: 320,
  altura: 56,
  gerar(cfg, b) {
    const C = b.C;
    const v = (n: string) => b.v(n);
    const marcado = boolAttr(b, 'marcado', 'Marcado', false, 'Caixa marcada.');
    const des = b.tem('desativado');
    const html = `<label class="${C}" data-marcado="false">
  <input class="${C}__input" type="checkbox">
  <span class="${C}__caixa" aria-hidden="true">${b.svgKcx('check', `${C}__check`, 16)}</span>
  ${b.span('rotulo')}
</label>`;
    const css = `.${C} { display: inline-flex; align-items: center; gap: .65em; cursor: pointer; color: ${v('texto')}; }
.${C}__input { position: absolute; opacity: 0; width: 1px; height: 1px; }
.${C}__caixa { display: grid; place-items: center; width: 22px; height: 22px; border-radius: calc(${v('raio')} * .4); box-shadow: inset 0 0 0 2px ${v('suave')}; color: ${v('fundo')}; transition: background ${v('duracao')} ${v('easing')}, box-shadow ${v('duracao')} ${v('easing')}, transform ${v('duracao')} ${v('easing')}; }
.${C}__check { opacity: 0; transform: scale(.5); transition: opacity ${v('duracao')} ${v('easing')}, transform ${v('duracao')} ${v('easing')}; }
.${C}__input:checked + .${C}__caixa, .${C}[data-marcado="true"] .${C}__caixa { background: ${v('primaria')}; box-shadow: inset 0 0 0 2px ${v('primaria')}; }
.${C}__input:checked + .${C}__caixa .${C}__check, .${C}[data-marcado="true"] .${C}__check { opacity: 1; transform: none; }
.${C}__input:focus-visible + .${C}__caixa { outline: 3px solid color-mix(in srgb, ${v('primaria')} 45%, transparent); outline-offset: 2px; }
.${C}:has(.${C}__input:disabled) { opacity: .45; cursor: not-allowed; }
${cfg.animacao === 'pop' ? `.${C}__input:checked + .${C}__caixa { animation: ${C}-pop ${v('duracao')} ${v('easing')}; }\n@keyframes ${C}-pop { 50% { transform: scale(1.18); } }` : ''}
${cfg.animacao === 'cor' ? `.${C}__check { transform: none; }` : ''}`;
    const js = `// O atributo data-marcado acompanha o input (para o tema e o Figma).
document.querySelectorAll('.${C}').forEach((r) => {
  const i = r.querySelector('input');
  i.addEventListener('change', () => r.setAttribute('data-marcado', String(i.checked)));
});`;
    const caixa: KcxNo = {
      id: 'caixa',
      nome: 'Caixa',
      tipo: 'frame',
      largura: 22,
      altura: 22,
      raio: 6,
      preenchimentos: [
        {
          tipo: 'solido',
          cor: {
            $derivado: 'corPrimaria',
            nome: 'caixa-cor',
            transformar: [{ op: 'alpha', variavel: 'marcadoCheio' }],
          } as never,
        },
      ],
      traco: {
        cor: {
          $derivado: marcado,
          nome: 'caixa-borda',
          transformar: [
            { op: 'variavelPorOpcao', variaveis: { true: 'corPrimaria', false: 'corSuave' } },
          ],
        } as never,
        espessura: 2,
      },
      filhos: [
        {
          ...b.noIcone('check', 'Check', 'check', b.cor('fundo'), 16),
          x: 3,
          y: 3,
          opacidade: mapaBool(marcado, 'check-opacidade', '1', '0'),
        },
      ],
    };
    b.extra({
      id: 'marcadoCheio',
      nome: 'Preenchimento da caixa',
      tipo: 'float',
      padrao: 0,
      min: 0,
      max: 1,
      passo: 1,
      descricao: '0 desmarcado, 1 marcado (cor da caixa no Figma).',
      grupo: 'effects',
      secao: 'comportamento',
      vinculos: [{ propriedade: 'Preenchimento', alvo: { tipo: 'css-var', nome: `${b.P}-cheio` } }],
    });
    const estrutura = b.pilha(
      'checkbox',
      cfg.nome,
      'horizontal',
      [caixa, b.noTexto('rotulo', 'Rótulo')],
      {
        espaco: 10,
        px: 4,
        py: 4,
        opacidade: des ? { $var: 'opacidadeCheck' } : undefined,
      },
    );
    if (des)
      b.extra({
        id: 'opacidadeCheck',
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
    const base: Record<string, number> = des ? { opacidadeCheck: 1 } : {};
    return {
      html,
      css,
      js,
      estrutura,
      estados: [
        {
          id: 'desmarcado',
          nome: 'Desmarcado',
          gatilho: 'padrao',
          descricao: 'Caixa vazia.',
          valores: { [marcado]: false, marcadoCheio: 0, ...base },
        },
        {
          id: 'marcado',
          nome: 'Marcado',
          gatilho: 'active',
          descricao: 'Caixa marcada.',
          valores: { [marcado]: true, marcadoCheio: 1, ...base },
        },
        ...(des
          ? [
              {
                id: 'desativado',
                nome: 'Desativado',
                gatilho: 'desativado' as const,
                descricao: 'Não pode ser usado agora.',
                valores: { [marcado]: false, marcadoCheio: 0, opacidadeCheck: 0.45 },
              },
            ]
          : []),
      ],
      interacoes: [
        interacao('checkbox', 'desmarcado', 'marcado', 'clique', 160),
        interacao('checkbox', 'marcado', 'desmarcado', 'clique', 160),
      ],
      animacao: {
        nome: CHECKBOX.animacoes.find((a) => a.id === cfg.animacao)?.nome ?? 'Check',
        tecnica: cfg.animacao === 'pop' ? 'css-keyframes' : 'css-transition',
        variaveis: ['duracao', 'easing'],
        descricao: 'O input nativo (acessível) controla a caixa por :checked.',
      },
      editavel: [
        `Variantes Desmarcado e Marcado${des ? ' e Desativado' : ''}; clicar alterna (Smart Animate)`,
        'Rótulo como propriedade de texto',
      ],
      tags: ['checkbox', 'form', 'controle'],
    };
  },
};

/* ============================== Opções (radio) ============================== */

export const RADIO: DefinicaoTipo = {
  id: 'radio',
  nome: 'Opções (radio)',
  categoria: 'formularios',
  uso: 'site e app',
  descricao: 'Grupo de opções em que só uma fica escolhida; clicar escolhe.',
  textos: [{ id: 'titulo', rotulo: 'Pergunta', padrao: 'Qual turma você prefere?' }],
  itens: { rotulo: 'Opção', padrao: ['Manhã', 'Tarde', 'Noite'], min: 2, max: 6 },
  animacoes: [
    { id: 'ponto', nome: 'Ponto que cresce', descricao: 'O ponto do meio cresce ao escolher.' },
    { id: 'anel', nome: 'Anel grosso', descricao: 'A borda engrossa na opção escolhida.' },
    { id: 'cartao', nome: 'Cartão em destaque', descricao: 'A linha escolhida ganha fundo.' },
  ],
  largura: 320,
  altura: 200,
  gerar(cfg, b) {
    const C = b.C;
    const v = (n: string) => b.v(n);
    const n = cfg.itens.length;
    const ativa = b.indiceAtivo('escolhida', 'Opção escolhida', n, 'Qual opção está marcada.');
    const nomeGrupo = `${C}-grupo`;
    const html = `<fieldset class="${C}" data-escolhida="1">
  ${b.span('titulo', 'legend')}
  ${cfg.itens.map((_, i) => `<label class="${C}__opcao"><input type="radio" name="${nomeGrupo}" value="${i + 1}"${i === 0 ? ' checked' : ''}><span class="${C}__bola" aria-hidden="true"></span>${b.item(i)}</label>`).join('\n  ')}
</fieldset>`;
    const cartao = cfg.animacao === 'cartao';
    const css = `.${C} { display: grid; gap: .5em; margin: 0; padding: 0; border: 0; color: ${v('texto')}; }
.${C}__titulo { margin-bottom: .35em; font-weight: 600; }
.${C}__opcao { display: flex; align-items: center; gap: .65em; padding: ${cartao ? '.6em .8em' : '.2em 0'}; border-radius: ${v('raio')}; cursor: pointer; transition: background ${v('duracao')} ${v('easing')}; }
.${C}__opcao input { position: absolute; opacity: 0; }
.${C}__bola { position: relative; width: 20px; height: 20px; border-radius: 50%; box-shadow: inset 0 0 0 2px ${v('suave')}; transition: box-shadow ${v('duracao')} ${v('easing')}; }
.${C}__bola::after { content: ''; position: absolute; inset: 5px; border-radius: 50%; background: ${v('primaria')}; transform: scale(0); transition: transform ${v('duracao')} ${v('easing')}; }
.${C}__opcao:has(input:checked) .${C}__bola { box-shadow: inset 0 0 0 ${cfg.animacao === 'anel' ? '6px' : '2px'} ${v('primaria')}; }
.${C}__opcao:has(input:checked) .${C}__bola::after { transform: scale(${cfg.animacao === 'anel' ? 0 : 1}); }
${cartao ? `.${C}__opcao:has(input:checked) { background: color-mix(in srgb, ${v('primaria')} 16%, transparent); }` : ''}
.${C}__opcao:has(input:focus-visible) .${C}__bola { outline: 3px solid color-mix(in srgb, ${v('primaria')} 45%, transparent); outline-offset: 2px; }`;
    const js = `document.querySelectorAll('.${C}').forEach((r) =>
  r.addEventListener('change', (e) => r.setAttribute('data-escolhida', e.target.value)));`;
    const estrutura = b.pilha(
      'radio',
      cfg.nome,
      'vertical',
      [
        b.noTexto('titulo', 'Pergunta', { estilo: 'Semi Bold' }),
        ...cfg.itens.map((_, i) =>
          b.pilha(
            `opcao${i + 1}`,
            `Opção ${i + 1}`,
            'horizontal',
            [
              {
                id: `bola${i + 1}`,
                nome: 'Bola',
                tipo: 'frame',
                largura: 20,
                altura: 20,
                raio: 10,
                preenchimentos: [],
                traco: {
                  cor: corPorIndice(
                    b,
                    ativa,
                    i + 1,
                    n,
                    `bola-${i + 1}-borda`,
                    'corPrimaria',
                    'corSuave',
                  ),
                  espessura: cfg.animacao === 'anel' ? 3 : 2,
                },
                filhos: [
                  {
                    id: `ponto${i + 1}`,
                    nome: 'Ponto',
                    tipo: 'elipse',
                    x: 5,
                    y: 5,
                    largura: 10,
                    altura: 10,
                    preenchimentos: [{ tipo: 'solido', cor: b.cor('primaria') }],
                    visivel: b.quando(ativa, i + 1, n, `ponto-${i + 1}-visivel`),
                  },
                ],
              },
              b.noItem(i),
            ],
            {
              espaco: 10,
              px: cartao ? 12 : 0,
              py: cartao ? 8 : 4,
              raio: b.raio,
              encher: true,
              preenchimentos: cartao
                ? [
                    {
                      tipo: 'solido',
                      cor: {
                        $derivado: ativa,
                        nome: `opcao-${i + 1}-fundo`,
                        transformar: [
                          {
                            op: 'variavelPorOpcao',
                            variaveis: Object.fromEntries(
                              cfg.itens.map((_, k) => [
                                String(k + 1),
                                k === i ? 'corPrimaria' : 'corFundo',
                              ]),
                            ),
                          },
                          {
                            op: 'alpha',
                            valor: 0.16,
                          },
                        ],
                      } as never,
                    },
                  ]
                : [],
            },
          ),
        ),
      ],
      { espaco: 8, px: 4, py: 4 },
    );
    return {
      html,
      css,
      js,
      estrutura,
      estados: cfg.itens.map((t, i) => ({
        id: `opcao${i + 1}`,
        nome: t || `Opção ${i + 1}`,
        gatilho: i === 0 ? ('padrao' as const) : ('active' as const),
        descricao: `“${t}” escolhida.`,
        valores: { [ativa]: i + 1 },
      })),
      interacoes: porIndice(
        (i) => `opcao${i}`,
        (i) => `opcao${i}`,
        n,
      ),
      animacao: {
        nome: RADIO.animacoes.find((a) => a.id === cfg.animacao)?.nome ?? 'Ponto',
        tecnica: 'css-transition',
        variaveis: ['duracao', 'easing', 'escolhida'],
        descricao: 'Inputs radio nativos; :has(input:checked) desenha a opção escolhida.',
      },
      editavel: [
        'Uma variante por opção escolhida; clicar numa opção troca (Smart Animate)',
        'Pergunta e opções como propriedades de texto',
      ],
      tags: ['radio', 'form', 'controle'],
    };
  },
};

/* ============================== Chave liga/desliga ============================== */

export const SWITCH: DefinicaoTipo = {
  id: 'switch',
  nome: 'Chave liga/desliga',
  categoria: 'formularios',
  uso: 'app',
  descricao: 'Switch com rótulo: a bolinha desliza ao ligar. Também serve de botão liga/desliga.',
  textos: [{ id: 'rotulo', rotulo: 'Rótulo', padrao: 'Modo escuro' }],
  recursos: [
    {
      id: 'desativado',
      nome: 'Estado Desativado',
      descricao: 'Mais uma variante, apagada e sem clique.',
      padrao: true,
    },
  ],
  animacoes: [
    { id: 'deslizar', nome: 'Desliza', descricao: 'A bolinha anda suave até o outro lado.' },
    { id: 'mola', nome: 'Desliza com mola', descricao: 'Passa um pouco e volta (efeito mola).' },
    { id: 'esticar', nome: 'Estica', descricao: 'A bolinha estica enquanto anda.' },
  ],
  largura: 260,
  altura: 56,
  gerar(cfg, b) {
    const C = b.C;
    const v = (n: string) => b.v(n);
    const ligado = boolAttr(b, 'ligado', 'Ligado', false, 'Chave ligada.');
    const des = b.tem('desativado');
    const easing =
      cfg.animacao === 'mola' ? 'cubic-bezier(.34, 1.56, .64, 1)' : (v('easing') as string);
    const html = `<label class="${C}" data-ligado="false">
  ${b.span('rotulo')}
  <input class="${C}__input" type="checkbox" role="switch">
  <span class="${C}__trilho" aria-hidden="true"><span class="${C}__bola"></span></span>
</label>`;
    const css = `.${C} { display: inline-flex; align-items: center; gap: .75em; cursor: pointer; color: ${v('texto')}; }
.${C}__input { position: absolute; opacity: 0; }
.${C}__trilho { position: relative; width: 44px; height: 26px; border-radius: 13px; background: color-mix(in srgb, ${v('suave')} 45%, transparent); transition: background ${v('duracao')} ${v('easing')}; }
.${C}__bola { position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 10px; background: #fff; box-shadow: 0 1px 3px rgb(0 0 0 / .3); transition: transform ${v('duracao')} ${easing}, width ${v('duracao')} ${v('easing')}; }
.${C}__input:checked + .${C}__trilho, .${C}[data-ligado="true"] .${C}__trilho { background: ${v('primaria')}; }
.${C}__input:checked + .${C}__trilho .${C}__bola, .${C}[data-ligado="true"] .${C}__bola { transform: translateX(18px); }
${cfg.animacao === 'esticar' ? `.${C}:active .${C}__bola { width: 26px; }\n.${C}__input:checked + .${C}__trilho .${C}__bola { transform: translateX(18px); }\n.${C}:active .${C}__input:checked + .${C}__trilho .${C}__bola { transform: translateX(12px); }` : ''}
.${C}__input:focus-visible + .${C}__trilho { outline: 3px solid color-mix(in srgb, ${v('primaria')} 45%, transparent); outline-offset: 2px; }
.${C}:has(.${C}__input:disabled) { opacity: .45; cursor: not-allowed; }`;
    const js = `document.querySelectorAll('.${C}').forEach((r) => {
  const i = r.querySelector('input');
  i.addEventListener('change', () => r.setAttribute('data-ligado', String(i.checked)));
});`;
    if (des)
      b.extra({
        id: 'opacidadeChave',
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
    const trilho: KcxNo = {
      id: 'trilho',
      nome: 'Trilho',
      tipo: 'frame',
      largura: 44,
      altura: 26,
      raio: 13,
      preenchimentos: [
        {
          tipo: 'solido',
          cor: {
            $derivado: ligado,
            nome: 'trilho-cor',
            transformar: [
              { op: 'variavelPorOpcao', variaveis: { true: 'corPrimaria', false: 'corSuave' } },
            ],
          } as never,
        },
      ],
      filhos: [
        {
          id: 'bola',
          nome: 'Bolinha',
          tipo: 'elipse',
          x: mapaBool(ligado, 'bola-x', '21', '3'),
          y: 3,
          largura: 20,
          altura: 20,
          preenchimentos: [{ tipo: 'solido', cor: '#ffffff' }],
          efeitos: [{ tipo: 'sombra', cor: '#0000004d', raio: 3, y: 1 }],
        },
      ],
    };
    const estrutura = b.pilha(
      'switch',
      cfg.nome,
      'horizontal',
      [b.noTexto('rotulo', 'Rótulo'), trilho],
      { espaco: 12, px: 4, py: 4, opacidade: des ? { $var: 'opacidadeChave' } : undefined },
    );
    const base: Record<string, number> = des ? { opacidadeChave: 1 } : {};
    const curva = cfg.animacao === 'mola' ? ('mola' as const) : undefined;
    return {
      html,
      css,
      js,
      estrutura,
      estados: [
        {
          id: 'desligado',
          nome: 'Desligado',
          gatilho: 'padrao',
          descricao: 'Chave desligada.',
          valores: { [ligado]: false, ...base },
        },
        {
          id: 'ligado',
          nome: 'Ligado',
          gatilho: 'active',
          descricao: 'Chave ligada.',
          valores: { [ligado]: true, ...base },
        },
        ...(des
          ? [
              {
                id: 'desativado',
                nome: 'Desativado',
                gatilho: 'desativado' as const,
                descricao: 'Não pode ser usada agora.',
                valores: { [ligado]: false, opacidadeChave: 0.45 },
              },
            ]
          : []),
      ],
      interacoes: [
        { ...interacao('switch', 'desligado', 'ligado', 'clique', 240), curva },
        { ...interacao('switch', 'ligado', 'desligado', 'clique', 240), curva },
      ],
      animacao: {
        nome: SWITCH.animacoes.find((a) => a.id === cfg.animacao)?.nome ?? 'Desliza',
        tecnica: 'css-transition',
        variaveis: ['duracao', 'easing'],
        descricao: 'Checkbox nativo com role="switch"; a bolinha anda com translateX.',
      },
      editavel: [
        `Variantes Desligado e Ligado${des ? ' e Desativado' : ''}; clicar alterna e a bolinha desliza (Smart Animate${curva ? ' com mola' : ''})`,
        'Rótulo como propriedade de texto',
      ],
      tags: ['switch', 'toggle', 'controle'],
    };
  },
};

/* ============================== Trilha (breadcrumb) ============================== */

export const BREADCRUMB: DefinicaoTipo = {
  id: 'breadcrumb',
  nome: 'Trilha (breadcrumb)',
  categoria: 'navegacao',
  uso: 'site',
  descricao: 'Mostra onde a pessoa está: Início › Seção › Página atual.',
  textos: [],
  itens: { rotulo: 'Página', padrao: ['Início', 'Aulas', 'Samba no pé'], min: 2, max: 6 },
  icones: [{ id: 'separador', rotulo: 'Separador', padrao: 'direita' }],
  animacoes: [
    { id: 'sublinhado', nome: 'Sublinhado', descricao: 'O link ganha sublinhado no hover.' },
    { id: 'cor', nome: 'Cor', descricao: 'O link acende na cor principal.' },
    { id: 'seta', nome: 'Seta que anda', descricao: 'O separador anda um pouco no hover.' },
  ],
  largura: 420,
  altura: 48,
  gerar(cfg, b) {
    const C = b.C;
    const v = (n: string) => b.v(n);
    const n = cfg.itens.length;
    const sep = b.nomeIcone('separador', 'direita');
    const html = `<nav class="${C}" aria-label="Você está em">
  <ol class="${C}__lista">
    ${cfg.itens
      .map((_, i) =>
        i === n - 1
          ? `<li>${b.item(i, 'span', 'aria-current="page"')}</li>`
          : `<li>${b.item(i, 'a', 'href="#"')}${b.svgKcx(sep, `${C}__sep`, 16)}</li>`,
      )
      .join('\n    ')}
  </ol>
</nav>`;
    const efeito: Record<string, string> = {
      sublinhado: `.${C} a:hover { text-decoration: underline; text-underline-offset: 3px; }`,
      cor: `.${C} a:hover { color: ${v('primaria')}; }`,
      seta: `.${C} li:hover .${C}__sep { transform: translateX(3px); }`,
    };
    const css = `.${C}__lista { display: flex; flex-wrap: wrap; align-items: center; gap: .35em; margin: 0; padding: 0; list-style: none; }
.${C}__lista li { display: inline-flex; align-items: center; gap: .35em; }
.${C} a { color: ${v('suave')}; text-decoration: none; transition: color ${v('duracao')} ${v('easing')}; }
.${C} [aria-current] { color: ${v('texto')}; font-weight: 600; }
.${C}__sep { color: ${v('suave')}; transition: transform ${v('duracao')} ${v('easing')}; }
${efeito[cfg.animacao] ?? efeito['cor']}`;
    const filhos: KcxNo[] = [];
    cfg.itens.forEach((_, i) => {
      filhos.push(
        b.noItem(i, {
          cor: i === n - 1 ? b.cor('texto') : b.cor('suave'),
          estilo: i === n - 1 ? 'Semi Bold' : 'Regular',
        }),
      );
      if (i < n - 1)
        filhos.push(
          b.noIcone(`sep-${i + 1}`, 'Separador', sep, b.cor('suave'), 16, {
            troca: 'Separador (trocar)',
          }),
        );
    });
    const estrutura = b.pilha('breadcrumb', cfg.nome, 'horizontal', filhos, {
      espaco: 6,
      px: 4,
      py: 4,
      autoLayout: {
        direcao: 'horizontal',
        espaco: 6,
        paddingX: 4,
        paddingY: 4,
        alinhar: 'centro',
        quebrar: true,
      },
      larguraMax: 600,
    });
    return {
      html,
      css,
      estrutura,
      animacao: {
        nome: BREADCRUMB.animacoes.find((a) => a.id === cfg.animacao)?.nome ?? 'Hover',
        tecnica: 'css-transition',
        variaveis: ['duracao', 'easing'],
        descricao: 'Lista ordenada (ol) com aria-current na página atual.',
        figma: 'documental',
      },
      editavel: [
        'Páginas como propriedades de texto; a última é a atual',
        'Separador trocável (Instance swap) da biblioteca KCX Ícone',
        'Auto Layout com quebra de linha (Wrap) e largura máxima',
      ],
      naoSuportado: ['O efeito de hover dos links'],
      tags: ['breadcrumb', 'navegação'],
    };
  },
};

/* ============================== Paginação ============================== */

export const PAGINACAO: DefinicaoTipo = {
  id: 'paginacao',
  nome: 'Paginação',
  categoria: 'navegacao',
  uso: 'site e app',
  descricao: 'Números de página com anterior e próxima; a página atual fica destacada.',
  textos: [],
  itens: { rotulo: 'Página', padrao: ['1', '2', '3', '4', '5'], min: 3, max: 7 },
  animacoes: [
    { id: 'pilula', nome: 'Pílula', descricao: 'A página atual fica dentro de um fundo.' },
    { id: 'contorno', nome: 'Contorno', descricao: 'A página atual ganha borda.' },
    { id: 'sublinhado', nome: 'Sublinhado', descricao: 'Uma linha embaixo da página atual.' },
  ],
  largura: 420,
  altura: 56,
  gerar(cfg, b) {
    const C = b.C;
    const v = (n: string) => b.v(n);
    const n = cfg.itens.length;
    const atual = b.indiceAtivo('pagina', 'Página atual', n, 'Qual página está aberta.');
    const html = `<nav class="${C}" data-pagina="1" aria-label="Páginas">
  <button class="${C}__seta" type="button" data-passo="-1" aria-label="Página anterior">${b.svgKcx('esquerda', `${C}__icone`, 18)}</button>
  ${cfg.itens.map((_, i) => `<button class="${C}__pag" type="button" data-n="${i + 1}"${i === 0 ? ' aria-current="page"' : ''}>${b.item(i)}</button>`).join('\n  ')}
  <button class="${C}__seta" type="button" data-passo="1" aria-label="Próxima página">${b.svgKcx('direita', `${C}__icone`, 18)}</button>
</nav>`;
    const marca: Record<string, string> = {
      pilula: `background: ${v('primaria')}; color: ${v('fundo')};`,
      contorno: `box-shadow: inset 0 0 0 2px ${v('primaria')}; color: ${v('primaria')};`,
      sublinhado: `color: ${v('primaria')}; box-shadow: inset 0 -3px 0 ${v('primaria')};`,
    };
    const css = `.${C} { display: flex; align-items: center; gap: .25em; }
.${C}__pag, .${C}__seta { display: grid; place-items: center; min-width: 38px; height: 38px; padding: 0 .5em; border: 0; border-radius: calc(${v('raio')} * .75); background: none; color: ${v('texto')}; font: inherit; font-weight: 600; cursor: pointer; transition: background ${v('duracao')} ${v('easing')}, color ${v('duracao')} ${v('easing')}; }
.${C}__pag:hover, .${C}__seta:hover { background: color-mix(in srgb, ${v('primaria')} 14%, transparent); }
.${C}__pag[aria-current] { ${marca[cfg.animacao] ?? marca['pilula']} }`;
    const js = `document.querySelectorAll('.${C}').forEach((r) => {
  const pags = [...r.querySelectorAll('.${C}__pag')];
  const ir = (n) => {
    n = Math.max(1, Math.min(pags.length, n));
    r.setAttribute('data-pagina', String(n));
    pags.forEach((p, i) => i + 1 === n ? p.setAttribute('aria-current', 'page') : p.removeAttribute('aria-current'));
  };
  pags.forEach((p, i) => p.addEventListener('click', () => ir(i + 1)));
  r.querySelectorAll('[data-passo]').forEach((s) => s.addEventListener('click', () => ir(Number(r.getAttribute('data-pagina')) + Number(s.dataset.passo))));
});`;
    const fundoAtivo = cfg.animacao === 'pilula';
    const filhos: KcxNo[] = [
      b.pilha(
        'anterior',
        'Anterior',
        'horizontal',
        [b.noIcone('ico-ant', 'Seta', 'esquerda', b.cor('texto'), 18)],
        { px: 10, py: 10, raio: b.raio },
      ),
      ...cfg.itens.map((_, i) =>
        b.pilha(
          `pag${i + 1}`,
          `Página ${i + 1}`,
          'horizontal',
          [
            b.noItem(i, {
              estilo: 'Semi Bold',
              cor: corPorIndice(
                b,
                atual,
                i + 1,
                n,
                `pag-${i + 1}-texto`,
                fundoAtivo ? 'corFundo' : 'corPrimaria',
                'corTexto',
              ),
            }),
          ],
          {
            px: 14,
            py: 9,
            raio: b.raio,
            larguraMin: 38,
            preenchimentos: fundoAtivo
              ? [
                  {
                    tipo: 'solido',
                    cor: {
                      $derivado: atual,
                      nome: `pag-${i + 1}-fundo`,
                      transformar: [
                        {
                          op: 'variavelPorOpcao',
                          variaveis: Object.fromEntries(
                            cfg.itens.map((_, k) => [String(k + 1), 'corPrimaria']),
                          ),
                        },
                        {
                          op: 'alphaPorOpcao',
                          variavel: atual,
                          valores: Object.fromEntries(
                            cfg.itens.map((_, k) => [String(k + 1), k === i ? 1 : 0]),
                          ),
                        },
                      ],
                    } as never,
                  },
                ]
              : [],
            traco: !fundoAtivo
              ? {
                  cor: {
                    $derivado: atual,
                    nome: `pag-${i + 1}-borda`,
                    transformar: [
                      {
                        op: 'variavelPorOpcao',
                        variaveis: Object.fromEntries(
                          cfg.itens.map((_, k) => [String(k + 1), 'corPrimaria']),
                        ),
                      },
                      {
                        op: 'alphaPorOpcao',
                        variavel: atual,
                        valores: Object.fromEntries(
                          cfg.itens.map((_, k) => [String(k + 1), k === i ? 1 : 0]),
                        ),
                      },
                    ],
                  } as never,
                  espessura: 2,
                }
              : undefined,
          },
        ),
      ),
      b.pilha(
        'proxima',
        'Próxima',
        'horizontal',
        [b.noIcone('ico-prox', 'Seta', 'direita', b.cor('texto'), 18)],
        { px: 10, py: 10, raio: b.raio },
      ),
    ];
    const estrutura = b.pilha('paginacao', cfg.nome, 'horizontal', filhos, {
      espaco: 4,
      px: 4,
      py: 4,
    });
    const inter: KcxInteracao[] = porIndice(
      (i) => `pag${i}`,
      (i) => `pagina${i}`,
      n,
    );
    for (let i = 1; i <= n; i++) {
      if (i < n) inter.push(interacao('proxima', `pagina${i}`, `pagina${i + 1}`));
      if (i > 1) inter.push(interacao('anterior', `pagina${i}`, `pagina${i - 1}`));
    }
    return {
      html,
      css,
      js,
      estrutura,
      estados: cfg.itens.map((t, i) => ({
        id: `pagina${i + 1}`,
        nome: `Página ${t || i + 1}`,
        gatilho: i === 0 ? ('padrao' as const) : ('active' as const),
        descricao: `Página ${t} aberta.`,
        valores: { [atual]: i + 1 },
      })),
      interacoes: inter,
      animacao: {
        nome: PAGINACAO.animacoes.find((a) => a.id === cfg.animacao)?.nome ?? 'Pílula',
        tecnica: 'css-transition',
        variaveis: ['duracao', 'easing', 'pagina'],
        descricao: 'aria-current marca a página; as setas andam uma página.',
      },
      editavel: [
        'Uma variante por página; clicar no número ou nas setas troca (Smart Animate)',
        'Números como propriedades de texto; largura mínima de 38 px em cada página',
      ],
      tags: ['paginação', 'pagination', 'navegação'],
    };
  },
};

/* ============================== Etapas (stepper) ============================== */

export const STEPPER: DefinicaoTipo = {
  id: 'stepper',
  nome: 'Etapas (stepper)',
  categoria: 'navegacao',
  uso: 'site e app',
  descricao: 'Etapas numeradas de um cadastro ou compra: as feitas ganham check.',
  textos: [{ id: 'proximo', rotulo: 'Botão próximo', padrao: 'Continuar' }],
  itens: { rotulo: 'Etapa', padrao: ['Dados', 'Turma', 'Pagamento'], min: 2, max: 6 },
  animacoes: [
    { id: 'linha', nome: 'Linha que enche', descricao: 'A linha entre as etapas enche de cor.' },
    { id: 'pulso', nome: 'Etapa atual pulsa', descricao: 'O círculo da etapa atual pulsa.' },
    { id: 'simples', nome: 'Simples', descricao: 'Só a troca de cor, sem movimento.' },
  ],
  largura: 520,
  altura: 140,
  gerar(cfg, b) {
    const C = b.C;
    const v = (n: string) => b.v(n);
    const n = cfg.itens.length;
    const atual = b.indiceAtivo('etapa', 'Etapa atual', n, 'Em qual etapa a pessoa está.');
    const html = `<div class="${C}" data-etapa="1">
  <ol class="${C}__lista">
    ${cfg.itens.map((_, i) => `<li class="${C}__etapa" data-n="${i + 1}"><span class="${C}__num">${i + 1}${b.svgKcx('check', `${C}__ok`, 16)}</span>${b.item(i)}</li>`).join('\n    ')}
  </ol>
  <button class="${C}__proximo" type="button">${b.span('proximo')}</button>
</div>`;
    const feitas = (sel: string) =>
      cfg.itens
        .map((_, i) =>
          cfg.itens
            .slice(0, i)
            .map((__, k) => `.${C}[data-etapa="${i + 1}"] .${C}__etapa[data-n="${k + 1}"]${sel}`)
            .join(', '),
        )
        .filter(Boolean)
        .join(', ');
    const atuais = cfg.itens
      .map((_, i) => `.${C}[data-etapa="${i + 1}"] .${C}__etapa[data-n="${i + 1}"] .${C}__num`)
      .join(', ');
    const css = `.${C} { display: grid; gap: ${v('espaco')}; }
.${C}__lista { display: flex; margin: 0; padding: 0; list-style: none; }
.${C}__etapa { position: relative; display: grid; flex: 1; justify-items: center; gap: .4em; color: ${v('suave')}; font-size: .9em; text-align: center; }
.${C}__etapa + .${C}__etapa::before { content: ''; position: absolute; top: 15px; right: 50%; left: -50%; height: 2px; background: color-mix(in srgb, ${v('suave')} 35%, transparent); z-index: 0; ${cfg.animacao === 'linha' ? `background-image: linear-gradient(${v('primaria')}, ${v('primaria')}); background-repeat: no-repeat; background-size: 0 100%; transition: background-size ${v('duracao')} ${v('easing')};` : ''} }
.${C}__num { position: relative; z-index: 1; display: grid; place-items: center; width: 32px; height: 32px; border-radius: 50%; background: ${v('superficie')}; box-shadow: inset 0 0 0 2px color-mix(in srgb, ${v('suave')} 45%, transparent); color: ${v('texto')}; font-weight: 700; transition: background ${v('duracao')} ${v('easing')}, box-shadow ${v('duracao')} ${v('easing')}; }
.${C}__ok { display: none; }
${atuais} { box-shadow: inset 0 0 0 2px ${v('primaria')}; color: ${v('primaria')};${cfg.animacao === 'pulso' ? ` animation: ${C}-pulso 1.6s ease-in-out infinite;` : ''} }
@keyframes ${C}-pulso { 50% { box-shadow: inset 0 0 0 2px ${v('primaria')}, 0 0 0 6px color-mix(in srgb, ${v('primaria')} 25%, transparent); } }
${feitas(' .' + C + '__num')} { background: ${v('primaria')}; box-shadow: none; color: transparent; }
${feitas(' .' + C + '__ok')} { position: absolute; display: block; color: ${v('fundo')}; }
${
  cfg.animacao === 'linha' && n > 1
    ? `${cfg.itens
        .map((_, i) =>
          cfg.itens
            .slice(1, i + 1)
            .map((__, k) => `.${C}[data-etapa="${i + 1}"] .${C}__etapa[data-n="${k + 2}"]::before`)
            .join(', '),
        )
        .filter(Boolean)
        .join(', ')} { background-size: 100% 100%; }`
    : ''
}
.${C}__proximo { justify-self: end; padding: .65em 1.2em; border: 0; border-radius: ${v('raio')}; background: ${v('primaria')}; color: ${v('fundo')}; font-weight: 600; cursor: pointer; }`;
    const js = `document.querySelectorAll('.${C}').forEach((r) => {
  const total = r.querySelectorAll('.${C}__etapa').length;
  r.querySelector('.${C}__proximo').addEventListener('click', () => {
    const n = Number(r.getAttribute('data-etapa'));
    r.setAttribute('data-etapa', String(n >= total ? 1 : n + 1));
  });
});`;
    const W = 120;
    const etapas: KcxNo[] = cfg.itens.map((_, i) => {
      const k = i + 1;
      const estado = (nome: string, feito: string, atualV: string, futuro: string) =>
        ({
          $derivado: atual,
          nome,
          transformar: [
            {
              op: 'variavelPorOpcao',
              variaveis: Object.fromEntries(
                cfg.itens.map((__, j) => [
                  String(j + 1),
                  j + 1 > k ? feito : j + 1 === k ? atualV : futuro,
                ]),
              ),
            },
          ],
        }) as never;
      return b.pilha(
        `etapa${k}`,
        `Etapa ${k}`,
        'vertical',
        [
          {
            id: `circulo${k}`,
            nome: 'Círculo',
            tipo: 'frame',
            largura: 32,
            altura: 32,
            raio: 16,
            preenchimentos: [
              {
                tipo: 'solido',
                cor: estado(`etapa-${k}-fundo`, 'corPrimaria', 'corSuperficie', 'corSuperficie'),
              },
            ],
            traco: {
              cor: estado(`etapa-${k}-borda`, 'corPrimaria', 'corPrimaria', 'corSuave'),
              espessura: 2,
            },
            filhos: [
              {
                id: `num${k}`,
                nome: 'Número',
                tipo: 'texto',
                x: k > 9 ? 8 : 12,
                y: 7,
                visivel: b.quando(atual, 0, n, `num-${k}-x`) as never,
                preenchimentos: [
                  {
                    tipo: 'solido',
                    cor: estado(`etapa-${k}-num`, 'corFundo', 'corPrimaria', 'corTexto'),
                  },
                ],
                texto: {
                  conteudo: String(k),
                  tamanho: 14,
                  familia: 'Inter',
                  estilo: 'Bold',
                },
              },
              {
                ...b.noIcone(`ok${k}`, 'Check', 'check', b.cor('fundo'), 16),
                x: 8,
                y: 8,
                visivel: {
                  $derivado: atual,
                  nome: `ok-${k}-visivel`,
                  transformar: [
                    {
                      op: 'mapa',
                      valores: Object.fromEntries(
                        cfg.itens.map((__, j) => [String(j + 1), j + 1 > k ? 'true' : 'false']),
                      ),
                    },
                  ],
                } as never,
              },
            ],
          },
          b.noItem(i, {
            tamanho: b.fonteX(0.9, 'etapa-tamanho'),
            cor: estado(`etapa-${k}-rotulo`, 'corTexto', 'corPrimaria', 'corSuave'),
          }),
        ],
        { espaco: 6, alinhar: 'centro', largura: W },
      );
    });
    // O número some quando a etapa já foi feita (o check aparece).
    for (let i = 0; i < n; i++) {
      const num = etapas[i].filhos![0].filhos![0];
      num.visivel = {
        $derivado: atual,
        nome: `num-${i + 1}-visivel`,
        transformar: [
          {
            op: 'mapa',
            valores: Object.fromEntries(
              cfg.itens.map((__, j) => [String(j + 1), j + 1 > i + 1 ? 'false' : 'true']),
            ),
          },
        ],
      } as never;
    }
    const estrutura = b.pilha(
      'stepper',
      cfg.nome,
      'vertical',
      [
        b.pilha('lista', 'Etapas', 'horizontal', etapas, { espaco: 0, alinhar: 'inicio' }),
        b.noBotao('proximo-btn', 'proximo', 'Botão próximo'),
      ],
      {
        espaco: b.espaco,
        px: b.espaco,
        py: b.espaco,
        alinhar: 'fim',
        raio: b.raio,
        preenchimentos: [{ tipo: 'solido', cor: b.cor('fundo') }],
      },
    );
    const inter: KcxInteracao[] = [];
    for (let i = 1; i <= n; i++) {
      inter.push(interacao('proximo-btn', `etapa${i}`, `etapa${i >= n ? 1 : i + 1}`));
      for (let k = 1; k < i; k++) inter.push(interacao(`etapa${k}`, `etapa${i}`, `etapa${k}`));
    }
    return {
      html,
      css,
      js,
      estrutura,
      estados: cfg.itens.map((t, i) => ({
        id: `etapa${i + 1}`,
        nome: `Etapa ${i + 1}`,
        gatilho: i === 0 ? ('padrao' as const) : ('active' as const),
        descricao: `Na etapa “${t}”.`,
        valores: { [atual]: i + 1 },
      })),
      interacoes: inter,
      animacao: {
        nome: STEPPER.animacoes.find((a) => a.id === cfg.animacao)?.nome ?? 'Etapas',
        tecnica: cfg.animacao === 'pulso' ? 'css-keyframes' : 'css-transition',
        variaveis: ['duracao', 'easing', 'etapa'],
        descricao: 'data-etapa na raiz pinta as feitas, a atual e as próximas.',
      },
      editavel: [
        'Uma variante por etapa; Continuar avança e clicar numa etapa feita volta (Smart Animate)',
        'Etapas feitas ganham check; nomes como propriedades de texto',
      ],
      parcial: cfg.animacao === 'linha' ? ['A linha que enche entre as etapas fica no código'] : [],
      tags: ['stepper', 'etapas', 'wizard'],
    };
  },
};

/* ============================== Dica (tooltip) ============================== */

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

export const BANNER: DefinicaoTipo = {
  id: 'banner',
  nome: 'Faixa de aviso (banner)',
  categoria: 'sobreposicao',
  uso: 'site',
  descricao: 'Faixa no topo da página com mensagem, link e botão de fechar.',
  textos: [
    { id: 'texto', rotulo: 'Mensagem', padrao: 'Inscrições abertas para dezembro!' },
    { id: 'link', rotulo: 'Link', padrao: 'Garantir vaga' },
  ],
  icones: [{ id: 'icone', rotulo: 'Ícone', padrao: 'sino' }],
  animacoes: [
    { id: 'deslizar', nome: 'Some subindo', descricao: 'Ao fechar, a faixa sobe e some.' },
    { id: 'fade', nome: 'Some com fade', descricao: 'Ao fechar, a faixa some devagar.' },
    {
      id: 'brilho',
      nome: 'Brilho passando',
      descricao: 'Um brilho passa pela faixa de vez em quando.',
    },
  ],
  largura: 720,
  altura: 72,
  gerar(cfg, b) {
    const C = b.C;
    const v = (n: string) => b.v(n);
    const aberto = boolAttr(b, 'aberto', 'Faixa aberta', true, 'Mostra a faixa.');
    const ic = b.nomeIcone('icone', 'sino');
    const html = `<div class="${C}" data-aberto="true" role="region" aria-label="Aviso">
  ${b.svgKcx(ic, `${C}__icone`, 20)}
  ${b.span('texto', 'p')}
  <a class="${C}__link" href="#">${b.span('link')}</a>
  <button class="${C}__fechar" type="button" aria-label="Fechar aviso">${b.svgKcx('fechar', `${C}__x`, 18)}</button>
</div>`;
    const css = `.${C} { position: relative; display: flex; align-items: center; gap: .75em; width: 100%; max-width: 720px; padding: .7em 1em; overflow: hidden; border-radius: ${v('raio')}; background: ${v('primaria')}; color: ${v('fundo')}; transition: transform ${v('duracao')} ${v('easing')}, opacity ${v('duracao')} ${v('easing')}, max-height ${v('duracao')} ${v('easing')}; max-height: 120px; }
.${C}__texto { flex: 1; margin: 0; font-weight: 600; }
.${C}__link { color: inherit; font-weight: 700; text-underline-offset: 3px; }
.${C}__fechar { display: grid; place-items: center; padding: .3em; border: 0; border-radius: 50%; background: none; color: inherit; cursor: pointer; }
.${C}__fechar:hover { background: color-mix(in srgb, ${v('fundo')} 15%, transparent); }
.${C}[data-aberto="false"] { ${cfg.animacao === 'fade' ? 'opacity: 0;' : 'transform: translateY(-100%); opacity: 0;'} max-height: 0; padding-block: 0; pointer-events: none; }
${cfg.animacao === 'brilho' ? `.${C}::before { content: ''; position: absolute; inset: 0; background: linear-gradient(100deg, transparent 30%, color-mix(in srgb, #fff 35%, transparent) 50%, transparent 70%); transform: translateX(-100%); animation: ${C}-brilho 4s ease-in-out infinite; }\n@keyframes ${C}-brilho { 60%, 100% { transform: translateX(100%); } }` : ''}`;
    const js = `document.querySelectorAll('.${C}').forEach((r) =>
  r.querySelector('.${C}__fechar').addEventListener('click', () => r.setAttribute('data-aberto', 'false')));`;
    const faixa = b.pilha(
      'faixa',
      'Faixa',
      'horizontal',
      [
        b.noIcone('icone', 'Ícone', ic, b.cor('fundo'), 20, { troca: 'Ícone (trocar)' }),
        b.noTexto('texto', 'Mensagem', {
          cor: b.cor('fundo'),
          estilo: 'Semi Bold',
          preencher: true,
        }),
        b.noTexto('link', 'Link', { cor: b.cor('fundo'), estilo: 'Bold' }),
        b.noIcone('fechar', 'Fechar', 'fechar', b.cor('fundo'), 18),
      ],
      {
        largura: 720,
        espaco: 12,
        px: 16,
        py: 12,
        raio: b.raio,
        preenchimentos: [{ tipo: 'solido', cor: b.cor('primaria') }],
        y: mapaBool(aberto, 'faixa-y', '0', '-72'),
        opacidade: mapaBool(aberto, 'faixa-opacidade', '1', '0'),
      },
    );
    const estrutura: KcxNo = {
      id: 'banner',
      nome: cfg.nome,
      tipo: 'frame',
      largura: 720,
      altura: 72,
      recortar: true,
      preenchimentos: [],
      filhos: [{ ...faixa, x: 0 }],
    };
    return {
      html,
      css,
      js,
      estrutura,
      estados: [
        {
          id: 'aberta',
          nome: 'Aberta',
          gatilho: 'padrao',
          descricao: 'Faixa à mostra.',
          valores: { [aberto]: true },
        },
        {
          id: 'fechada',
          nome: 'Fechada',
          gatilho: 'final',
          descricao: 'Depois de fechar.',
          valores: { [aberto]: false },
        },
      ],
      interacoes: [interacao('fechar', 'aberta', 'fechada', 'clique', 300)],
      animacao: {
        nome: BANNER.animacoes.find((a) => a.id === cfg.animacao)?.nome ?? 'Fechar',
        tecnica: cfg.animacao === 'brilho' ? 'css-keyframes' : 'css-transition',
        variaveis: ['duracao', 'easing'],
        descricao: 'data-aberto na raiz; ao fechar a faixa encolhe e some.',
      },
      editavel: [
        'Variantes Aberta e Fechada; clicar no X fecha (Smart Animate)',
        'Ícone trocável (Instance swap); mensagem e link como propriedades de texto',
      ],
      naoSuportado: cfg.animacao === 'brilho' ? ['O brilho passando (contínuo)'] : [],
      tags: ['banner', 'aviso', 'faixa'],
    };
  },
};

/* ============================== Menu suspenso (dropdown) ============================== */

export const DROPDOWN: DefinicaoTipo = {
  id: 'dropdown',
  nome: 'Menu suspenso',
  categoria: 'navegacao',
  uso: 'site e app',
  descricao: 'Botão que abre uma lista de opções (submenu); Esc ou clicar de novo fecha.',
  textos: [{ id: 'botao', rotulo: 'Texto do botão', padrao: 'Aulas' }],
  itens: {
    rotulo: 'Opção',
    padrao: ['Samba no pé', 'Forró', 'Dança de salão', 'Jazz funk'],
    min: 2,
    max: 8,
  },
  animacoes: [
    { id: 'cair', nome: 'Cai suave', descricao: 'A lista desce um pouco enquanto aparece.' },
    { id: 'fade', nome: 'Aparecer', descricao: 'A lista aparece com fade.' },
    { id: 'escala', nome: 'Cresce', descricao: 'A lista cresce a partir do botão.' },
  ],
  largura: 320,
  altura: 260,
  gerar(cfg, b) {
    const C = b.C;
    const v = (n: string) => b.v(n);
    const aberto = b.estadoAberto('aberto', 'Menu aberto', 'Mostra a lista aberta.');
    const fechado: Record<string, string> = {
      cair: 'transform: translateY(-8px);',
      fade: '',
      escala: 'transform: scale(.92); transform-origin: top left;',
    };
    const html = `<div class="${C}" data-aberto="false">
  <button class="${C}__botao" type="button" aria-haspopup="true" aria-expanded="false">${b.span('botao')}${b.svgKcx('baixo', `${C}__seta`, 18)}</button>
  <ul class="${C}__lista" role="menu">
    ${cfg.itens.map((_, i) => `<li role="none">${b.item(i, 'a', 'role="menuitem" href="#"')}</li>`).join('\n    ')}
  </ul>
</div>`;
    const css = `.${C} { position: relative; display: inline-block; }
.${C}__botao { display: inline-flex; align-items: center; gap: .4em; padding: .6em 1em; border: 0; border-radius: ${v('raio')}; background: ${v('superficie')}; color: ${v('texto')}; font: inherit; font-weight: 600; cursor: pointer; }
.${C}__seta { transition: transform ${v('duracao')} ${v('easing')}; }
.${C}[data-aberto="true"] .${C}__seta { transform: rotate(180deg); }
.${C}__lista { position: absolute; top: calc(100% + 6px); left: 0; z-index: 10; display: grid; min-width: 200px; margin: 0; padding: .35em; list-style: none; border-radius: ${v('raio')}; background: ${v('superficie')}; box-shadow: 0 12px 32px rgb(0 0 0 / .35); opacity: 0; visibility: hidden; ${fechado[cfg.animacao] ?? ''} transition: opacity ${v('duracao')} ${v('easing')}, transform ${v('duracao')} ${v('easing')}, visibility ${v('duracao')}; }
.${C}[data-aberto="true"] .${C}__lista { opacity: 1; visibility: visible; transform: none; }
.${C}__lista a { display: block; padding: .55em .75em; border-radius: calc(${v('raio')} * .6); color: ${v('texto')}; text-decoration: none; }
.${C}__lista a:hover, .${C}__lista a:focus-visible { background: color-mix(in srgb, ${v('primaria')} 18%, transparent); }`;
    const js = `document.querySelectorAll('.${C}').forEach((r) => {
  const b = r.querySelector('.${C}__botao');
  const definir = (sim) => { r.setAttribute('data-aberto', String(sim)); b.setAttribute('aria-expanded', String(sim)); };
  b.addEventListener('click', () => definir(r.getAttribute('data-aberto') !== 'true'));
  r.addEventListener('keydown', (e) => { if (e.key === 'Escape') { definir(false); b.focus(); } });
  document.addEventListener('click', (e) => { if (!r.contains(e.target)) definir(false); });
});`;
    const lista = b.pilha(
      'lista',
      'Lista',
      'vertical',
      cfg.itens.map((_, i) =>
        b.pilha(
          `opcao${i + 1}`,
          `Opção ${i + 1}`,
          'horizontal',
          [b.noItem(i, { preencher: true })],
          {
            px: 12,
            py: 9,
            raio: 8,
            encher: true,
          },
        ),
      ),
      {
        larguraMin: 200,
        px: 6,
        py: 6,
        espaco: 2,
        raio: b.raio,
        preenchimentos: [{ tipo: 'solido', cor: b.cor('superficie') }],
        efeitos: [{ tipo: 'sombra', cor: '#00000059', raio: 32, y: 12 }],
        visivel: { $var: aberto },
      },
    );
    const estrutura = b.pilha(
      'dropdown',
      cfg.nome,
      'vertical',
      [
        b.pilha(
          'botao',
          'Botão',
          'horizontal',
          [
            b.noTexto('botao', 'Texto do botão', { estilo: 'Semi Bold' }),
            b.noIcone(
              'seta',
              'Seta',
              mapaBool(aberto, 'seta-icone', 'cima', 'baixo'),
              b.cor('texto'),
              18,
            ),
          ],
          {
            espaco: 6,
            px: 16,
            py: 10,
            raio: b.raio,
            preenchimentos: [{ tipo: 'solido', cor: b.cor('superficie') }],
          },
        ),
        lista,
      ],
      { espaco: 6, px: 4, py: 4, alinhar: 'inicio' },
    );
    return {
      html,
      css,
      js,
      estrutura,
      estados: [
        {
          id: 'fechado',
          nome: 'Fechado',
          gatilho: 'padrao',
          descricao: 'Só o botão.',
          valores: { [aberto]: false },
        },
        {
          id: 'aberto',
          nome: 'Aberto',
          gatilho: 'active',
          descricao: 'Lista à mostra.',
          valores: { [aberto]: true },
        },
      ],
      interacoes: [
        interacao('botao', 'fechado', 'aberto', 'clique', 200),
        interacao('botao', 'aberto', 'fechado', 'clique', 200),
        ...cfg.itens.map((_, i) => interacao(`opcao${i + 1}`, 'aberto', 'fechado', 'clique', 160)),
        { ...interacao('dropdown', 'aberto', 'fechado', 'tecla', 160), tecla: 'Escape' },
      ],
      animacao: {
        nome: DROPDOWN.animacoes.find((a) => a.id === cfg.animacao)?.nome ?? 'Abrir',
        tecnica: 'css-transition',
        variaveis: ['duracao', 'easing'],
        descricao: 'data-aberto na raiz; Esc e clique fora fecham (aria-expanded acompanha).',
      },
      editavel: [
        'Variantes Fechado e Aberto; clicar no botão abre e fecha, escolher uma opção fecha, Esc fecha',
        'Opções como propriedades de texto; lista com largura mínima de 200 px',
      ],
      tags: ['dropdown', 'submenu', 'menu'],
    };
  },
};

export const TIPOS_CONTROLES: DefinicaoTipo[] = [
  CHECKBOX,
  RADIO,
  SWITCH,
  BREADCRUMB,
  PAGINACAO,
  STEPPER,
  TOOLTIP,
  BANNER,
  DROPDOWN,
];

void escHtml;

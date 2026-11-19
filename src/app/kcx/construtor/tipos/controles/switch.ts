import { KcxNo } from '../../../kcx.types';
import { DefinicaoTipo } from '../../montar';
import { boolAttr, interacao, mapaBool } from './_comum';

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
    {
      id: 'tema',
      nome: 'Troca o tema',
      descricao:
        'No protótipo do Figma, ligar troca as cores para o modo Claro e desligar volta ao Escuro (Set variable mode).',
      padrao: false,
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
        {
          ...interacao('switch', 'desligado', 'ligado', 'clique', 240),
          curva,
          acoes: b.tem('tema')
            ? [{ tipo: 'modo' as const, colecao: 'KCX · Colors', modo: 'Light' }]
            : undefined,
        },
        {
          ...interacao('switch', 'ligado', 'desligado', 'clique', 240),
          curva,
          acoes: b.tem('tema')
            ? [{ tipo: 'modo' as const, colecao: 'KCX · Colors', modo: 'Dark' }]
            : undefined,
        },
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

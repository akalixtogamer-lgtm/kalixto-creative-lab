import { KcxNo } from '../../../kcx.types';
import { DefinicaoTipo } from '../../montar';
import { boolAttr, interacao, mapaBool } from './_comum';

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

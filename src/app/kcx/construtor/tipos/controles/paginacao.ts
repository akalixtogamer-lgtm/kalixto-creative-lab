import { KcxInteracao, KcxNo } from '../../../kcx.types';
import { DefinicaoTipo } from '../../montar';
import { corPorIndice, interacao, porIndice } from './_comum';

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

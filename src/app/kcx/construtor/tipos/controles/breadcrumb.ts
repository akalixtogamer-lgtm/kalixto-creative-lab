import { KcxNo } from '../../../kcx.types';
import { DefinicaoTipo } from '../../montar';

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

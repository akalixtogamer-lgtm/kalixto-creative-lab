import { KcxEstado, KcxInteracao } from '../../../kcx.types';
import { DefinicaoTipo, ICONES, svgIcone } from '../../montar';
import { interacao } from './_comum';

export const ACORDEAO: DefinicaoTipo = {
  id: 'acordeao',
  nome: 'Acordeão (FAQ)',
  categoria: 'conteudo',
  uso: 'site e app',
  descricao: 'Perguntas que abrem a resposta com animação suave (uma de cada vez).',
  textos: [],
  itens: {
    rotulo: 'Pergunta',
    padrao: ['Preciso ter experiência?', 'Qual roupa usar?', 'Posso fazer aula experimental?'],
    min: 2,
    max: 8,
  },
  animacoes: [
    { id: 'suave', nome: 'Abre suave', descricao: 'A resposta cresce com a altura certa.' },
    { id: 'fade', nome: 'Abre com fade', descricao: 'Cresce e o texto aparece com fade.' },
    {
      id: 'destaque',
      nome: 'Item aberto em destaque',
      descricao: 'Cresce e o item aberto ganha borda colorida.',
    },
  ],
  largura: 420,
  altura: 280,
  gerar(cfg, b) {
    const C = b.C;
    const v = (n: string) => b.v(n);
    const n = cfg.itens.length;
    const aberto = b.extra({
      id: 'abertoItem',
      nome: 'Pergunta aberta',
      tipo: 'number',
      padrao: 1,
      min: 0,
      max: n,
      passo: 1,
      descricao: 'Qual pergunta aparece aberta (0 = todas fechadas).',
      grupo: 'components',
      secao: 'comportamento',
      vinculos: [
        {
          propriedade: 'data-aberto',
          alvo: { tipo: 'atributo', seletor: `.${C}`, atributo: 'data-aberto' },
        },
      ],
    });
    const respostas = cfg.itens.map((_, i) =>
      b.extra({
        id: `resposta${i + 1}`,
        nome: `Resposta ${i + 1}`,
        tipo: 'string',
        padrao:
          [
            'Não! A turma começa do zero.',
            'Roupa confortável e tênis ou sapatilha.',
            'Sim, a primeira aula é por nossa conta.',
          ][i] ?? 'Escreva a resposta aqui.',
        descricao: `Resposta da pergunta ${i + 1}.`,
        grupo: 'components',
        secao: 'aparencia',
        vinculos: [
          { propriedade: 'Texto', alvo: { tipo: 'texto', seletor: `.${C}__texto-${i + 1}` } },
        ],
      }),
    );
    const html = `<div class="${C}" data-aberto="1">
  ${cfg.itens
    .map(
      (_, i) => `<div class="${C}__item" data-n="${i + 1}">
    <h3 class="${C}__cab"><button class="${C}__pergunta" type="button" id="${C}-p-${i + 1}" aria-controls="${C}-r-${i + 1}" aria-expanded="${i === 0}">${b.item(i)}${svgIcone(ICONES.baixo, `${C}__seta`, 20)}</button></h3>
    <div class="${C}__resposta" id="${C}-r-${i + 1}" role="region" aria-labelledby="${C}-p-${i + 1}"><div class="${C}__resposta-in"><p class="${C}__texto-${i + 1}"></p></div></div>
  </div>`,
    )
    .join('\n  ')}
</div>`;
    const abertos = cfg.itens.map((_, i) => `.${C}[data-aberto="${i + 1}"] [data-n="${i + 1}"]`);
    const css = `.${C} { display: grid; gap: 8px; width: 100%; max-width: 420px; }
.${C}__item { border-radius: ${v('raio')}; background: ${v('superficie')}; box-shadow: inset 0 0 0 1px transparent; transition: box-shadow ${v('duracao')} ${v('easing')}; }
.${C}__cab { margin: 0; font-size: 1em; }
.${C}__pergunta { display: flex; align-items: center; justify-content: space-between; gap: 1em; width: 100%; padding: calc(${v('espaco')} * .85) ${v('espaco')}; border: 0; background: none; font-weight: 600; text-align: left; }
.${C}__seta { flex: none; color: ${v('suave')}; transition: transform ${v('duracao')} ${v('easing')}; }
.${C}__resposta { display: grid; grid-template-rows: 0fr; transition: grid-template-rows ${v('duracao')} ${v('easing')}; }
.${C}__resposta-in { overflow: hidden; }
.${C}__resposta p { margin: 0; padding: 0 ${v('espaco')} ${v('espaco')}; color: ${v('suave')}; line-height: 1.55;${cfg.animacao === 'fade' ? ` opacity: 0; transition: opacity ${v('duracao')} ${v('easing')};` : ''} }
${abertos.map((s) => `${s} .${C}__resposta`).join(',\n')} { grid-template-rows: 1fr; }
${abertos.map((s) => `${s} .${C}__seta`).join(',\n')} { transform: rotate(180deg); color: ${v('primaria')}; }
${cfg.animacao === 'fade' ? `${abertos.map((s) => `${s} .${C}__resposta p`).join(',\n')} { opacity: 1; }` : ''}
${cfg.animacao === 'destaque' ? `${abertos.join(',\n')} { box-shadow: inset 0 0 0 2px ${v('primaria')}; }` : ''}`;
    const js = `// Uma pergunta aberta por vez; clicar de novo fecha.
document.querySelectorAll('.${C}').forEach((raiz) => {
  const botoes = [...raiz.querySelectorAll('.${C}__pergunta')];
  botoes.forEach((b, i) => b.addEventListener('click', () => {
    const n = raiz.getAttribute('data-aberto') === String(i + 1) ? 0 : i + 1;
    raiz.setAttribute('data-aberto', String(n));
    botoes.forEach((x, j) => x.setAttribute('aria-expanded', String(j + 1 === n)));
  }));
});`;
    const estrutura = b.pilha(
      'acordeao',
      cfg.nome,
      'vertical',
      cfg.itens.map((_, i) =>
        b.pilha(
          `bloco-${i + 1}`,
          `Pergunta ${i + 1}`,
          'vertical',
          [
            b.pilha(
              `cab-${i + 1}`,
              'Cabeçalho',
              'horizontal',
              [
                b.noItem(i, { estilo: 'Semi Bold', preencher: true }),
                b.icone(`seta-${i + 1}`, 'Seta', ICONES.baixo, 20, b.cor('suave')),
              ],
              {
                espaco: b.espaco,
                encher: true,
              },
            ),
            {
              id: `resposta-${i + 1}`,
              nome: 'Resposta',
              tipo: 'texto',
              visivel: b.quando(aberto, i + 1, n, `resposta-${i + 1}-visivel`, true),
              preenchimentos: [{ tipo: 'solido', cor: b.cor('suave') }],
              texto: {
                conteudo: { $var: respostas[i] },
                tamanho: b.fonte,
                familia: 'Inter',
                estilo: 'Regular',
                preencher: true,
                propriedade: `Resposta ${i + 1}`,
              },
            },
          ],
          {
            espaco: b.espacoX(0.6, 'bloco-gap'),
            px: b.espaco,
            py: b.espacoX(0.85, 'bloco-py'),
            raio: b.raio,
            encher: true,
            preenchimentos: [{ tipo: 'solido', cor: b.cor('superficie') }],
          },
        ),
      ),
      { largura: 420, espaco: 8 },
    );
    const estados: KcxEstado[] = [
      {
        id: 'fechado',
        nome: 'Todas fechadas',
        gatilho: 'padrao',
        descricao: 'Nenhuma resposta aberta.',
        valores: { [aberto]: 0 },
      },
      ...cfg.itens.map((t, i) => ({
        id: `aberto${i + 1}`,
        nome: `Pergunta ${i + 1} aberta`,
        gatilho: 'active' as const,
        descricao: `“${t}” aberta.`,
        valores: { [aberto]: i + 1 },
      })),
    ];
    const interacoes: KcxInteracao[] = [];
    for (const e of estados)
      for (let i = 1; i <= n; i++)
        interacoes.push(
          interacao(`cab-${i}`, e.id, e.id === `aberto${i}` ? 'fechado' : `aberto${i}`),
        );
    return {
      html,
      css,
      js,
      estrutura,
      estados,
      interacoes,
      animacao: {
        nome: ACORDEAO.animacoes.find((a) => a.id === cfg.animacao)?.nome ?? 'Abre suave',
        tecnica: 'css-transition',
        variaveis: ['duracao', 'easing', 'abertoItem'],
        descricao: 'grid-template-rows 0fr → 1fr (altura automática animada) e seta girando.',
      },
      editavel: [
        'Uma variante por pergunta aberta + “Todas fechadas”; no protótipo, clicar abre e fecha',
        'Perguntas e respostas como propriedades de texto',
      ],
      parcial: ['A seta girando fica no código'],
      tags: ['faq', 'accordion', 'perguntas'],
    };
  },
};

/* ============================== Card de preço ============================== */

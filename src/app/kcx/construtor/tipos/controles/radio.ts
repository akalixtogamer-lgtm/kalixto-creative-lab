import { DefinicaoTipo } from '../../montar';
import { corPorIndice, porIndice } from './_comum';

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

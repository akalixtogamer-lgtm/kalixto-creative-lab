import { KcxInteracao, KcxRef } from '../../../kcx.types';
import { DefinicaoTipo } from '../../montar';
import { interacao, mapaBool } from './_comum';

export const SELECT: DefinicaoTipo = {
  id: 'select',
  nome: 'Seleção (select)',
  categoria: 'formularios',
  uso: 'site e app',
  descricao: 'Campo que abre a lista de opções e mostra a escolhida (com check).',
  textos: [{ id: 'rotulo', rotulo: 'Rótulo do campo', padrao: 'Estilo de dança' }],
  itens: { rotulo: 'Opção', padrao: ['Samba', 'Forró', 'Zouk', 'Bolero'], min: 2, max: 8 },
  animacoes: [
    { id: 'cair', nome: 'Lista que cai', descricao: 'A lista aparece logo abaixo do campo.' },
    { id: 'fade', nome: 'Aparecer', descricao: 'A lista aparece com fade.' },
  ],
  largura: 320,
  altura: 320,
  gerar(cfg, b) {
    const C = b.C;
    const v = (n: string) => b.v(n);
    const n = cfg.itens.length;
    const aberto = b.estadoAberto('aberto', 'Lista aberta', 'Mostra a lista aberta.');
    const escolhida = b.extra({
      id: 'escolhida',
      nome: 'Opção escolhida',
      tipo: 'enum',
      padrao: 'o1',
      opcoes: cfg.itens.map((t, i) => ({ valor: `o${i + 1}`, rotulo: t || `Opção ${i + 1}` })),
      descricao: 'Qual opção aparece no campo. No Figma é um eixo de variante.',
      grupo: 'components',
      secao: 'comportamento',
      vinculos: [
        {
          propriedade: 'data-escolhida',
          alvo: { tipo: 'atributo', seletor: `.${C}`, atributo: 'data-escolhida' },
        },
      ],
    });
    const html = `<label class="${C}" data-aberto="false" data-escolhida="o1">
  ${b.span('rotulo')}
  <select class="${C}__select">
    ${cfg.itens.map((_, i) => `<option value="o${i + 1}">${b.item(i, 'span')}</option>`).join('\n    ')}
  </select>
</label>`;
    const css = `.${C} { display: grid; gap: .4em; width: 100%; max-width: 320px; color: ${v('texto')}; }
.${C}__rotulo { font-size: .875em; color: ${v('suave')}; }
.${C}__select { appearance: none; width: 100%; padding: .75em 2.5em .75em .9em; border: 1px solid color-mix(in srgb, ${v('suave')} 45%, transparent); border-radius: ${v('raio')}; background: ${v('superficie')} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E") no-repeat right .8em center; color: inherit; font: inherit; transition: border-color ${v('duracao')} ${v('easing')}; }
.${C}__select:focus { outline: none; border-color: ${v('primaria')}; box-shadow: 0 0 0 3px color-mix(in srgb, ${v('primaria')} 30%, transparent); }`;
    const js = `document.querySelectorAll('.${C}').forEach((r) => {
  const s = r.querySelector('select');
  s.addEventListener('change', () => r.setAttribute('data-escolhida', s.value));
});`;
    const textoEscolhido: KcxRef<string> = {
      $derivado: escolhida,
      nome: 'valor-escolhido',
      transformar: [
        {
          op: 'variavelPorOpcao',
          variaveis: Object.fromEntries(cfg.itens.map((_, i) => [`o${i + 1}`, b.idItem(i)])),
        },
      ],
    } as never;
    const estrutura = b.pilha(
      'select',
      cfg.nome,
      'vertical',
      [
        b.noTexto('rotulo', 'Rótulo do campo', {
          cor: b.cor('suave'),
          tamanho: b.fonteX(0.875, 'rotulo-tamanho'),
        }),
        b.pilha(
          'campo',
          'Campo',
          'horizontal',
          [
            {
              id: 'valor',
              nome: 'Valor',
              tipo: 'texto',
              preenchimentos: [{ tipo: 'solido', cor: b.cor('texto') }],
              texto: {
                conteudo: textoEscolhido,
                tamanho: b.fonte,
                familia: 'Inter',
                estilo: 'Regular',
                preencher: true,
              },
            },
            b.noIcone(
              'seta',
              'Seta',
              mapaBool(aberto, 'seta-icone', 'cima', 'baixo'),
              b.cor('suave'),
              18,
            ),
          ],
          {
            px: 14,
            py: 11,
            espaco: 8,
            raio: b.raio,
            encher: true,
            preenchimentos: [{ tipo: 'solido', cor: b.cor('superficie') }],
            traco: {
              cor: {
                $derivado: aberto,
                nome: 'campo-borda',
                transformar: [
                  { op: 'variavelPorOpcao', variaveis: { true: 'corPrimaria', false: 'corSuave' } },
                ],
              } as never,
              espessura: 1,
            },
          },
        ),
        b.pilha(
          'lista',
          'Lista',
          'vertical',
          cfg.itens.map((_, i) =>
            b.pilha(
              `opcao${i + 1}`,
              `Opção ${i + 1}`,
              'horizontal',
              [
                b.noItem(i, { preencher: true }),
                {
                  ...b.noIcone(`ok${i + 1}`, 'Check', 'check', b.cor('primaria'), 16),
                  visivel: {
                    $derivado: escolhida,
                    nome: `ok-${i + 1}-visivel`,
                    transformar: [
                      {
                        op: 'mapa',
                        valores: Object.fromEntries(
                          cfg.itens.map((__, k) => [`o${k + 1}`, k === i ? 'true' : 'false']),
                        ),
                      },
                    ],
                  } as never,
                },
              ],
              { px: 12, py: 9, raio: 8, espaco: 8, encher: true },
            ),
          ),
          {
            px: 6,
            py: 6,
            espaco: 2,
            raio: b.raio,
            encher: true,
            preenchimentos: [{ tipo: 'solido', cor: b.cor('superficie') }],
            efeitos: [{ tipo: 'sombra', cor: '#00000059', raio: 28, y: 10 }],
            visivel: { $var: aberto },
          },
        ),
      ],
      { largura: 320, espaco: 6, px: 4, py: 4 },
    );
    const inter: KcxInteracao[] = [
      interacao('campo', 'fechado', 'aberto'),
      interacao('campo', 'aberto', 'fechado'),
      { ...interacao('select', 'aberto', 'fechado', 'tecla'), tecla: 'Escape' },
    ];
    cfg.itens.forEach((_, i) =>
      inter.push({
        ...interacao(`opcao${i + 1}`, 'aberto', 'fechado', 'clique', 180),
        muda: { [escolhida]: `o${i + 1}` },
      }),
    );
    void n;
    return {
      html,
      css,
      js,
      estrutura,
      eixos: [escolhida],
      estados: [
        {
          id: 'fechado',
          nome: 'Fechado',
          gatilho: 'padrao',
          descricao: 'Mostra a opção escolhida.',
          valores: { [aberto]: false },
        },
        {
          id: 'aberto',
          nome: 'Aberto',
          gatilho: 'active',
          descricao: 'Lista de opções aberta.',
          valores: { [aberto]: true },
        },
      ],
      interacoes: inter,
      animacao: {
        nome: SELECT.animacoes.find((a) => a.id === cfg.animacao)?.nome ?? 'Abrir',
        tecnica: 'css-transition',
        variaveis: ['duracao', 'easing'],
        descricao: 'No código é um <select> nativo (acessível, teclado e celular).',
      },
      editavel: [
        'Variantes Fechado/Aberto × Opção escolhida; clicar abre, escolher fecha e troca o valor, Esc fecha',
        'Opções como propriedades de texto; check na opção escolhida',
      ],
      parcial: ['No código a lista é a do navegador (select nativo)'],
      tags: ['select', 'form', 'dropdown'],
    };
  },
};

/* ============================== Controle deslizante (slider) ============================== */

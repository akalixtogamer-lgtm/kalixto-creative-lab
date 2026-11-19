import { KcxInteracao, KcxNo } from '../../../kcx.types';
import { DefinicaoTipo } from '../../montar';
import { interacao } from './_comum';

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

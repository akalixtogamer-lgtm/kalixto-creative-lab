import { KcxInteracao, KcxNo } from '../../../kcx.types';
import { DefinicaoTipo, escHtml, ICONES, svgIcone } from '../../montar';
import { interacao } from './_comum';

export const CARROSSEL: DefinicaoTipo = {
  id: 'carrossel',
  nome: 'Carrossel',
  categoria: 'conteudo',
  uso: 'site e app',
  descricao:
    'Até 15 slides ou cards com setas, pontos, teclado e troca automática. No desktop mostra 1, 3 ou 4 por vez; no celular, 1.',
  textos: [{ id: 'legenda', rotulo: 'Legenda', padrao: 'Use as setas, os pontos ou o teclado' }],
  itens: {
    rotulo: 'Slide',
    padrao: [
      'Turma de samba',
      'Aulão de sábado',
      'Festival de dança',
      'Forró pé de serra',
      'Jazz funk',
      'Dança de salão',
    ],
    min: 2,
    max: 15,
  },
  subItens: {
    rotulo: 'Subtítulo',
    recurso: 'subtitulo',
    padrao: [
      'Toda quinta, 19h',
      'Sábado, 10h',
      'Dezembro',
      'Sexta, 20h',
      'Terça, 18h',
      'Quarta, 19h',
    ],
  },
  recursos: [
    {
      id: 'subtitulo',
      nome: 'Subtítulo no slide',
      descricao: 'Uma linha menor abaixo do título de cada slide.',
      padrao: true,
    },
    {
      id: 'automatico',
      nome: 'Passa sozinho',
      descricao: 'No protótipo do Figma, o slide avança sozinho a cada 3 s (After delay).',
      padrao: true,
    },
    {
      id: 'arrastar',
      nome: 'Arrastar',
      descricao:
        'No protótipo do Figma, arrastar o carrossel passa para o próximo slide (On drag).',
      padrao: true,
    },
    {
      id: 'teclado',
      nome: 'Setas do teclado',
      descricao: 'No protótipo do Figma, ← e → trocam o slide (gatilho de tecla).',
      padrao: true,
    },
  ],
  animacoes: [
    { id: 'deslizar', nome: 'Desliza', descricao: 'Os slides andam para o lado.' },
    { id: 'fade', nome: 'Troca com fade', descricao: 'Um slide some e o outro aparece.' },
    { id: 'escala', nome: 'Desliza com zoom', descricao: 'Desliza e o slide ativo fica maior.' },
  ],
  porTela: 3,
  largura: 960,
  altura: 420,
  gerar(cfg, b) {
    const C = b.C;
    const v = (n: string) => b.v(n);
    const n = cfg.itens.length;
    // Cards por vez no desktop (1, 3 ou 4); nunca mais que os slides que existem.
    const k = Math.min(n, [1, 3, 4].includes(cfg.porTela ?? 1) ? (cfg.porTela ?? 1) : 1);
    const posicoes = n - k + 1;
    const ativo = b.indiceAtivo(
      'ativo',
      k > 1 ? 'Primeiro card à mostra' : 'Slide ativo',
      posicoes,
      k > 1 ? 'Qual card aparece primeiro (à esquerda).' : 'Qual slide aparece.',
    );
    b.extra({
      id: 'porTela',
      nome: 'Cards por vez (desktop)',
      tipo: 'number',
      padrao: k,
      min: 1,
      max: 4,
      passo: 1,
      descricao:
        'Quantos aparecem juntos em telas largas. Com o carrossel estreito (celular, até 440 px) é sempre 1.',
      grupo: 'components',
      secao: 'aparencia',
      vinculos: [{ propriedade: '--por-tela', alvo: { tipo: 'css-var', nome: `${b.P}-por-tela` } }],
    });
    const auto = b.extra({
      id: 'automatico',
      nome: 'Troca automática',
      tipo: 'boolean',
      padrao: false,
      descricao: 'Passa sozinho a cada 4 segundos (pausa com o mouse em cima).',
      grupo: 'motion',
      secao: 'comportamento',
      vinculos: [
        {
          propriedade: 'data-automatico',
          alvo: { tipo: 'atributo', seletor: `.${C}`, atributo: 'data-automatico' },
          transformar: [{ op: 'mapa', valores: { true: 'true', false: 'false' } }],
        },
      ],
    });
    const fade = cfg.animacao === 'fade';
    const comSub = b.tem('subtitulo');
    const html = `<section class="${C}" data-ativo="1" data-automatico="false" aria-roledescription="carrossel" aria-label="${escHtml(cfg.nome)}">
  <div class="${C}__janela">
    <div class="${C}__trilho">
      ${cfg.itens.map((_, i) => `<article class="${C}__slide" data-slide="${i + 1}" aria-roledescription="slide" aria-label="${i + 1} de ${n}" style="--h:${i * 47}deg"><div class="${C}__textos">${b.item(i, 'h3')}${comSub ? b.subItem(i, 'p', `class="${C}__sub"`) : ''}</div></article>`).join('\n      ')}
    </div>
    <button class="${C}__seta ${C}__seta--ant" type="button" aria-label="Slide anterior">${svgIcone(ICONES.esquerda, `${C}__icone`)}</button>
    <button class="${C}__seta ${C}__seta--prox" type="button" aria-label="Próximo slide">${svgIcone(ICONES.direita, `${C}__icone`)}</button>
  </div>
  <div class="${C}__pontos">
    ${cfg.itens.map((_, i) => `<button class="${C}__ponto" type="button" data-ir="${i + 1}" aria-label="Ir para o slide ${i + 1}"></button>`).join('\n    ')}
  </div>
  ${b.span('legenda', 'p')}
</section>`;
    const regrasAtivo = cfg.itens
      .map((_, i) => `.${C}[data-ativo="${i + 1}"] [data-slide="${i + 1}"]`)
      .join(',\n');
    const pontosAtivos = cfg.itens
      .map((_, i) => `.${C}[data-ativo="${i + 1}"] [data-ir="${i + 1}"]`)
      .join(',\n');
    const css = `.${C} { --por: ${v('por-tela')}; --gap: ${k > 1 ? `calc(${v('espaco')} * .75)` : '0px'}; width: 100%; max-width: ${k > 1 ? 1040 : 480}px; container-type: inline-size; }
.${C}__janela { position: relative; overflow: hidden; border-radius: ${v('raio')}; ${k > 1 ? '' : 'aspect-ratio: 16 / 9;'} }
.${C}__trilho { display: ${fade && k === 1 ? 'grid' : 'flex'}; gap: var(--gap); height: 100%; ${fade && k === 1 ? '' : `transform: translateX(calc((${v('ativo')} - 1) * -1 * (100% + var(--gap)) / var(--por))); transition: transform ${v('duracao')} ${v('easing')};`} }
.${C}__slide { ${fade && k === 1 ? 'grid-area: 1 / 1; opacity: 0; transition: opacity ' + v('duracao') + ' ' + v('easing') + ';' : 'flex: 0 0 calc((100% - (var(--por) - 1) * var(--gap)) / var(--por));'}${k > 1 ? ` aspect-ratio: 3 / 4; border-radius: ${v('raio')};` : ''} min-width: 0; overflow: hidden; display: grid; place-items: end start; padding: calc(${v('espaco')} * 1.25); background: linear-gradient(135deg, ${v('primaria')}, ${v('superficie')}); filter: hue-rotate(var(--h)); ${cfg.animacao === 'escala' ? `transform: scale(.88); opacity: .6; transition: transform ${v('duracao')} ${v('easing')}, opacity ${v('duracao')} ${v('easing')};` : ''} }
.${C}__textos { display: grid; gap: .25em; }
.${C}__sub { margin: 0; color: rgb(255 255 255 / .85); font-size: calc(${v('fonte')} * ${k > 1 ? 0.8125 : 0.9375}); text-shadow: 0 1px 8px rgb(0 0 0 / .4); }
.${C}__slide h3 { margin: 0; font-size: calc(${v('fonte')} * ${k > 1 ? 1.125 : 1.5}); overflow-wrap: anywhere; color: #fff; text-shadow: 0 2px 12px rgb(0 0 0 / .4); }
${regrasAtivo} { opacity: 1; transform: none; }
.${C}__seta { position: absolute; top: 50%; display: grid; place-items: center; width: 44px; height: 44px; border: 0; border-radius: 50%; background: color-mix(in srgb, ${v('fundo')} 70%, transparent); color: ${v('texto')}; transform: translateY(-50%); }
.${C}__seta--ant { left: 10px; }
.${C}__seta--prox { right: 10px; }
.${C}__pontos { display: flex; justify-content: center; gap: 8px; margin-top: calc(${v('espaco')} * .75); }
.${C}__ponto { width: 8px; height: 8px; padding: 0; border: 0; border-radius: 999px; background: ${v('suave')}; opacity: .5; transition: width ${v('duracao')} ${v('easing')}, opacity ${v('duracao')} ${v('easing')}, background ${v('duracao')} ${v('easing')}; }
${pontosAtivos} { width: 24px; opacity: 1; background: ${v('primaria')}; }${
      k > 1
        ? `\n@container (min-width: 441px) { ${cfg.itens
            .slice(posicoes)
            .map((_, j) => `.${C} [data-ir="${posicoes + j + 1}"]`)
            .join(', ')} { display: none; } }`
        : ''
    }
.${C}__legenda { margin: calc(${v('espaco')} * .5) 0 0; color: ${v('suave')}; text-align: center; font-size: .875em; }
@container (max-width: 440px) { .${C}__janela, .${C}__pontos { --por: 1; } }`;
    const js = `// Setas, pontos, teclado e troca automática (pausa no hover e no foco).
document.querySelectorAll('.${C}').forEach((raiz) => {
  const slides = raiz.querySelectorAll('.${C}__slide').length;
  // Quantos aparecem juntos agora (3 ou 4 no desktop, 1 no celular).
  const porVez = () => Math.max(1, Math.round(Number(getComputedStyle(raiz.querySelector('.${C}__janela')).getPropertyValue('--por')) || 1));
  const atual = () => Number(raiz.getAttribute('data-ativo')) || 1;
  const ir = (n) => {
    const total = Math.max(1, slides - porVez() + 1);
    const alvo = ((n - 1 + total) % total) + 1;
    raiz.setAttribute('data-ativo', String(alvo));
    raiz.style.setProperty('${b.P}-ativo', String(alvo));
  };
  raiz.querySelector('.${C}__seta--ant').addEventListener('click', () => ir(atual() - 1));
  raiz.querySelector('.${C}__seta--prox').addEventListener('click', () => ir(atual() + 1));
  raiz.querySelectorAll('[data-ir]').forEach((p) => p.addEventListener('click', () => ir(Number(p.dataset.ir))));
  raiz.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') ir(atual() - 1); if (e.key === 'ArrowRight') ir(atual() + 1); });
  let pausado = false;
  raiz.addEventListener('mouseenter', () => (pausado = true));
  raiz.addEventListener('mouseleave', () => (pausado = false));
  raiz.addEventListener('focusin', () => (pausado = true));
  raiz.addEventListener('focusout', () => (pausado = false));
  setInterval(() => { if (raiz.getAttribute('data-automatico') === 'true' && !pausado) ir(atual() + 1); }, 4000);
});`;
    const GAP = k > 1 ? 16 : 0;
    const W = k > 1 ? 960 : 480;
    const L = (W - GAP * (k - 1)) / k;
    const H = k > 1 ? Math.round((L * 4) / 3) : 270;
    const slides: KcxNo = {
      id: 'trilho',
      nome: 'Trilho',
      tipo: 'frame',
      x: b.posicao(ativo, 'trilho-x', -(L + GAP)),
      y: 0,
      largura: L * n + GAP * (n - 1),
      altura: H,
      preenchimentos: [],
      filhos: cfg.itens.map((_, i) =>
        b.pilha(
          `slide-${i + 1}`,
          `Slide ${i + 1}`,
          'horizontal',
          [
            b.pilha(
              `slide-${i + 1}-textos`,
              'Textos',
              'vertical',
              [
                b.noItem(i, {
                  tamanho: b.fonteX(k > 1 ? 1.125 : 1.5, 'slide-tamanho'),
                  estilo: 'Bold',
                  cor: '#ffffff',
                }),
                ...(comSub
                  ? [
                      b.noSubItem(i, {
                        tamanho: b.fonteX(k > 1 ? 0.8125 : 0.9375, 'sub-tamanho'),
                        cor: '#ffffffd9',
                      }),
                    ]
                  : []),
              ],
              { espaco: 4 },
            ),
          ],
          {
            x: i * (L + GAP),
            y: 0,
            largura: L,
            altura: H,
            ...(k > 1 ? { raio: b.raio } : {}),
            preenchimentos: [
              {
                tipo: 'gradiente-linear',
                angulo: 135 + i * 40,
                paradas: [
                  { posicao: 0, cor: b.cor('primaria') },
                  { posicao: 1, cor: b.cor('superficie') },
                ],
              },
            ],
          },
        ),
      ),
    };
    const seta = (id: string, nome: string, x: number, d: string): KcxNo => ({
      id,
      nome,
      tipo: 'frame',
      x,
      y: H / 2 - 22,
      largura: 44,
      altura: 44,
      raio: 22,
      preenchimentos: [{ tipo: 'solido', cor: b.corAlpha('corFundo', 'seta-fundo', 0.7) }],
      filhos: [{ ...b.icone(`${id}-icone`, 'Ícone', d), x: 10, y: 10 }],
    });
    const janela: KcxNo = {
      id: 'janela',
      nome: 'Janela',
      tipo: 'frame',
      largura: W,
      altura: H,
      raio: b.raio,
      recortar: true,
      preenchimentos: [],
      filhos: [
        slides,
        seta('seta-ant', 'Seta anterior', 10, ICONES.esquerda),
        seta('seta-prox', 'Próximo', W - 54, ICONES.direita),
      ],
    };
    const pontos: KcxNo = {
      id: 'pontos',
      nome: 'Pontos',
      tipo: 'frame',
      largura: posicoes * 16 + 16,
      altura: 8,
      preenchimentos: [],
      filhos: [
        ...cfg.itens.slice(0, posicoes).map((_, i): KcxNo => ({
          id: `ponto-${i + 1}`,
          nome: `Ponto ${i + 1}`,
          tipo: 'elipse',
          x: i * 16,
          y: 0,
          largura: 8,
          altura: 8,
          opacidade: 0.5,
          preenchimentos: [{ tipo: 'solido', cor: b.cor('suave') }],
        })),
        {
          id: 'ponto-ativo',
          nome: 'Ponto ativo',
          tipo: 'retangulo',
          x: b.posicao(ativo, 'ponto-x', 16),
          y: 0,
          largura: 24,
          altura: 8,
          raio: 4,
          preenchimentos: [{ tipo: 'solido', cor: b.cor('primaria') }],
        },
      ],
    };
    const estrutura = b.pilha(
      'carrossel',
      cfg.nome,
      'vertical',
      [
        janela,
        pontos,
        b.noTexto('legenda', 'Legenda', {
          cor: b.cor('suave'),
          tamanho: b.fonteX(0.875, 'legenda-tamanho'),
        }),
      ],
      {
        espaco: b.espacoX(0.75, 'carrossel-gap'),
        largura: W,
        alinhar: 'centro',
      },
    );
    const interacoes: KcxInteracao[] = [];
    const P = posicoes;
    for (let i = 1; i <= P; i++) {
      interacoes.push(interacao('seta-prox', `slide${i}`, `slide${(i % P) + 1}`));
      interacoes.push(interacao('seta-ant', `slide${i}`, `slide${((i - 2 + P) % P) + 1}`));
      if (b.tem('automatico'))
        interacoes.push({
          ...interacao('carrossel', `slide${i}`, `slide${(i % P) + 1}`),
          gatilho: 'atraso',
          atraso: 3000,
          duracao: 500,
        });
      if (b.tem('arrastar'))
        interacoes.push({
          ...interacao('carrossel', `slide${i}`, `slide${(i % P) + 1}`),
          gatilho: 'arrastar',
        });
      if (b.tem('teclado')) {
        interacoes.push({
          ...interacao('carrossel', `slide${i}`, `slide${(i % P) + 1}`),
          gatilho: 'tecla',
          tecla: 'ArrowRight',
        });
        interacoes.push({
          ...interacao('carrossel', `slide${i}`, `slide${((i - 2 + P) % P) + 1}`),
          gatilho: 'tecla',
          tecla: 'ArrowLeft',
        });
      }
    }
    return {
      html,
      css,
      js,
      estrutura,
      estados: cfg.itens.slice(0, posicoes).map((t, i) => ({
        id: `slide${i + 1}`,
        nome: k > 1 ? `Cards ${i + 1}–${i + k}` : `Slide ${i + 1}`,
        gatilho: i === 0 ? ('padrao' as const) : ('active' as const),
        descricao: k > 1 ? `Do “${t}” ao “${cfg.itens[i + k - 1]}” à mostra.` : `“${t}” à mostra.`,
        valores: { [ativo]: i + 1, [auto]: false },
      })),
      interacoes,
      animacao: {
        nome: CARROSSEL.animacoes.find((a) => a.id === cfg.animacao)?.nome ?? 'Desliza',
        tecnica: 'css-transition',
        variaveis: ['duracao', 'easing', 'ativo'],
        descricao: 'Trilho com translateX pela posição do slide ativo (ou opacidade no fade).',
      },
      editavel: [
        'Uma variante por slide; no protótipo, as setas passam e voltam com Smart Animate (o trilho desliza de verdade)',
        'Slides como frames nativos: troque o gradiente por fotos',
        'Ponto ativo anda junto',
        ...(k > 1
          ? [
              `${k} cards por vez no desktop; no código, no celular (carrossel com até 440 px) mostra 1 por vez`,
            ]
          : []),
      ],
      parcial: ['No Figma, fade e zoom também aparecem como deslize'],
      naoSuportado: ['Troca automática e arrastar com o dedo'],
      tags: ['slider', 'galeria', 'carousel'],
    };
  },
};

/* ============================== Acordeão (FAQ) ============================== */

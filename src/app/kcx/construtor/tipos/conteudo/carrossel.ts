import { KcxInteracao, KcxNo } from '../../../kcx.types';
import { DefinicaoTipo, escHtml, ICONES, svgIcone } from '../../montar';
import { interacao } from './_comum';

export const CARROSSEL: DefinicaoTipo = {
  id: 'carrossel',
  nome: 'Carrossel',
  categoria: 'conteudo',
  uso: 'site e app',
  descricao: 'Slides com setas, pontos, teclado e troca automática opcional.',
  textos: [{ id: 'legenda', rotulo: 'Legenda', padrao: 'Use as setas, os pontos ou o teclado' }],
  itens: {
    rotulo: 'Slide',
    padrao: ['Turma de samba', 'Aulão de sábado', 'Festival de dança'],
    min: 2,
    max: 6,
  },
  recursos: [
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
  largura: 480,
  altura: 330,
  gerar(cfg, b) {
    const C = b.C;
    const v = (n: string) => b.v(n);
    const n = cfg.itens.length;
    const ativo = b.indiceAtivo('ativo', 'Slide ativo', n, 'Qual slide aparece.');
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
    const html = `<section class="${C}" data-ativo="1" data-automatico="false" aria-roledescription="carrossel" aria-label="${escHtml(cfg.nome)}">
  <div class="${C}__janela">
    <div class="${C}__trilho">
      ${cfg.itens.map((_, i) => `<article class="${C}__slide" data-slide="${i + 1}" aria-roledescription="slide" aria-label="${i + 1} de ${n}" style="--h:${i * 47}deg">${b.item(i, 'h3')}</article>`).join('\n      ')}
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
    const css = `.${C} { width: 100%; max-width: 480px; }
.${C}__janela { position: relative; overflow: hidden; border-radius: ${v('raio')}; aspect-ratio: 16 / 9; }
.${C}__trilho { display: ${fade ? 'grid' : 'flex'}; height: 100%; ${fade ? '' : `transform: translateX(calc((${v('ativo')} - 1) * -100%)); transition: transform ${v('duracao')} ${v('easing')};`} }
.${C}__slide { ${fade ? 'grid-area: 1 / 1; opacity: 0; transition: opacity ' + v('duracao') + ' ' + v('easing') + ';' : 'flex: 0 0 100%;'} display: grid; place-items: end start; padding: calc(${v('espaco')} * 1.25); background: linear-gradient(135deg, ${v('primaria')}, ${v('superficie')}); filter: hue-rotate(var(--h)); ${cfg.animacao === 'escala' ? `transform: scale(.88); opacity: .6; transition: transform ${v('duracao')} ${v('easing')}, opacity ${v('duracao')} ${v('easing')};` : ''} }
.${C}__slide h3 { margin: 0; font-size: calc(${v('fonte')} * 1.5); color: #fff; text-shadow: 0 2px 12px rgb(0 0 0 / .4); }
${regrasAtivo} { opacity: 1; transform: none; }
.${C}__seta { position: absolute; top: 50%; display: grid; place-items: center; width: 44px; height: 44px; border: 0; border-radius: 50%; background: color-mix(in srgb, ${v('fundo')} 70%, transparent); color: ${v('texto')}; transform: translateY(-50%); }
.${C}__seta--ant { left: 10px; }
.${C}__seta--prox { right: 10px; }
.${C}__pontos { display: flex; justify-content: center; gap: 8px; margin-top: calc(${v('espaco')} * .75); }
.${C}__ponto { width: 8px; height: 8px; padding: 0; border: 0; border-radius: 999px; background: ${v('suave')}; opacity: .5; transition: width ${v('duracao')} ${v('easing')}, opacity ${v('duracao')} ${v('easing')}, background ${v('duracao')} ${v('easing')}; }
${pontosAtivos} { width: 24px; opacity: 1; background: ${v('primaria')}; }
.${C}__legenda { margin: calc(${v('espaco')} * .5) 0 0; color: ${v('suave')}; text-align: center; font-size: .875em; }`;
    const js = `// Setas, pontos, teclado e troca automática (pausa no hover e no foco).
document.querySelectorAll('.${C}').forEach((raiz) => {
  const total = raiz.querySelectorAll('.${C}__slide').length;
  const atual = () => Number(raiz.getAttribute('data-ativo')) || 1;
  const ir = (n) => {
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
    const W = 480;
    const H = 270;
    const slides: KcxNo = {
      id: 'trilho',
      nome: 'Trilho',
      tipo: 'frame',
      x: b.posicao(ativo, 'trilho-x', -W),
      y: 0,
      largura: W * n,
      altura: H,
      preenchimentos: [],
      filhos: cfg.itens.map((_, i) =>
        b.pilha(
          `slide-${i + 1}`,
          `Slide ${i + 1}`,
          'horizontal',
          [
            b.noItem(i, {
              tamanho: b.fonteX(1.5, 'slide-tamanho'),
              estilo: 'Bold',
              cor: '#ffffff',
            }),
          ],
          {
            x: i * W,
            y: 0,
            largura: W,
            altura: H,
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
      largura: n * 16 + 16,
      altura: 8,
      preenchimentos: [],
      filhos: [
        ...cfg.itens.map((_, i): KcxNo => ({
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
    for (let i = 1; i <= n; i++) {
      interacoes.push(interacao('seta-prox', `slide${i}`, `slide${(i % n) + 1}`));
      interacoes.push(interacao('seta-ant', `slide${i}`, `slide${((i - 2 + n) % n) + 1}`));
      if (b.tem('automatico'))
        interacoes.push({
          ...interacao('carrossel', `slide${i}`, `slide${(i % n) + 1}`),
          gatilho: 'atraso',
          atraso: 3000,
          duracao: 500,
        });
      if (b.tem('arrastar'))
        interacoes.push({
          ...interacao('carrossel', `slide${i}`, `slide${(i % n) + 1}`),
          gatilho: 'arrastar',
        });
      if (b.tem('teclado')) {
        interacoes.push({
          ...interacao('carrossel', `slide${i}`, `slide${(i % n) + 1}`),
          gatilho: 'tecla',
          tecla: 'ArrowRight',
        });
        interacoes.push({
          ...interacao('carrossel', `slide${i}`, `slide${((i - 2 + n) % n) + 1}`),
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
      estados: cfg.itens.map((t, i) => ({
        id: `slide${i + 1}`,
        nome: `Slide ${i + 1}`,
        gatilho: i === 0 ? ('padrao' as const) : ('active' as const),
        descricao: `“${t}” à mostra.`,
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
      ],
      parcial: ['No Figma, fade e zoom também aparecem como deslize'],
      naoSuportado: ['Troca automática e arrastar com o dedo'],
      tags: ['slider', 'galeria', 'carousel'],
    };
  },
};

/* ============================== Acordeão (FAQ) ============================== */

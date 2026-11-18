/** Tipos do construtor: botão, cards (foto, vídeo, preço), carrossel e acordeão. */
import { KcxEfeito, KcxEstado, KcxInteracao, KcxNo, KcxOperacao } from '../kcx.types';
import { Blocos, ConfigConstrutor, DefinicaoTipo, ICONES, escHtml, svgIcone } from './montar';

const interacao = (
  no: string,
  de: string,
  para: string,
  gatilho: KcxInteracao['gatilho'] = 'clique',
): KcxInteracao => ({ no, gatilho, de, para, transicao: 'smart-animate', duracao: 300 });

/** Força da sombra no hover (variável + efeito do Figma + estados Padrão/Hover). */
function sombraHover(b: Blocos, noRaiz: string) {
  const id = b.extra({
    id: 'forcaSombra',
    nome: 'Força da sombra no hover',
    tipo: 'float',
    padrao: 0.55,
    min: 0,
    max: 1,
    passo: 0.05,
    descricao: 'Opacidade da sombra colorida que aparece no hover.',
    grupo: 'effects',
    secao: 'aparencia',
    vinculos: [
      {
        propriedade: 'Opacidade da sombra (color-mix)',
        alvo: { tipo: 'css-var', nome: `${b.P}-sombra` },
        transformar: [{ op: 'multiplicar', fator: 100 }],
        unidadeSaida: '%',
      },
    ],
  });
  const efeito: KcxEfeito = {
    tipo: 'sombra',
    x: 0,
    y: 10,
    raio: 28,
    cor: b.corAlpha('corPrimaria', 'sombra-cor', id),
  };
  const estados: KcxEstado[] = [
    {
      id: 'padrao',
      nome: 'Padrão',
      gatilho: 'padrao',
      descricao: 'Em repouso.',
      valores: { [id]: 0 },
    },
    {
      id: 'hover',
      nome: 'Hover',
      gatilho: 'hover',
      descricao: 'Mouse por cima (ou foco).',
      valores: {},
    },
  ];
  return {
    efeito,
    estados,
    interacoes: [interacao(noRaiz, 'padrao', 'hover', 'hover')],
    sombraCss: `0 10px 28px color-mix(in srgb, ${b.v('primaria')} ${b.v('sombra')}, transparent)`,
  };
}

/** Imagem padrão (gradiente nas cores do tema) quando a pessoa não escolheu uma. */
function imagemPadrao(cfg: ConfigConstrutor, rotulo = 'Sua imagem aqui'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${cfg.cores.primaria}"/><stop offset="1" stop-color="${cfg.cores.superficie}"/></linearGradient></defs><rect width="640" height="400" fill="url(#g)"/><text x="320" y="210" text-anchor="middle" font-family="Inter, sans-serif" font-size="28" fill="#ffffff" fill-opacity=".8">${rotulo}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const gradienteMidia = (b: Blocos) => [
  {
    tipo: 'gradiente-linear' as const,
    angulo: 135,
    paradas: [
      { posicao: 0, cor: b.cor('primaria') },
      { posicao: 1, cor: b.cor('superficie') },
    ],
  },
];

/* ============================== Botão ============================== */

export const BOTAO: DefinicaoTipo = {
  id: 'botao',
  nome: 'Botão',
  categoria: 'acoes',
  uso: 'site e app',
  descricao: 'Botão de ação com o texto que você quiser e uma animação de destaque.',
  textos: [{ id: 'rotulo', rotulo: 'Texto do botão', padrao: 'Começar agora' }],
  animacoes: [
    {
      id: 'elevar',
      nome: 'Sobe com sombra',
      descricao: 'Sobe um pouco e ganha sombra colorida no hover.',
    },
    {
      id: 'preencher',
      nome: 'Preenche no hover',
      descricao: 'Contorno que se enche de cor no hover.',
    },
    { id: 'brilho', nome: 'Brilho pulsando', descricao: 'Um halo pulsa em volta o tempo todo.' },
    { id: 'pulsar', nome: 'Pulsa', descricao: 'O botão cresce e volta, chamando atenção.' },
  ],
  largura: 220,
  altura: 56,
  gerar(cfg, b) {
    const C = b.C;
    const v = (n: string) => b.v(n);
    const s = sombraHover(b, 'botao');
    const anims: Record<string, string> = {
      elevar: `.${C}:hover, .${C}:focus-visible { transform: translateY(-3px); box-shadow: ${s.sombraCss}; }
.${C}:active { transform: translateY(0) scale(.98); }`,
      preencher: `.${C} { background: transparent; color: ${v('primaria')}; box-shadow: inset 0 0 0 2px ${v('primaria')}; isolation: isolate; overflow: hidden; }
.${C}::before { content: ''; position: absolute; inset: 0; z-index: -1; background: ${v('primaria')}; transform: scaleX(0); transform-origin: left; transition: transform ${v('duracao')} ${v('easing')}; }
.${C}:hover, .${C}:focus-visible { color: ${v('fundo')}; box-shadow: inset 0 0 0 2px ${v('primaria')}, ${s.sombraCss}; }
.${C}:hover::before, .${C}:focus-visible::before { transform: scaleX(1); }`,
      brilho: `.${C} { animation: ${C}-brilho calc(${v('duracao')} * 6) ease-in-out infinite; }
@keyframes ${C}-brilho { 50% { box-shadow: ${s.sombraCss}, 0 0 0 6px color-mix(in srgb, ${v('primaria')} 25%, transparent); } }`,
      pulsar: `.${C} { animation: ${C}-pulso calc(${v('duracao')} * 5) ${v('easing')} infinite; }
.${C}:hover { animation-play-state: paused; box-shadow: ${s.sombraCss}; }
@keyframes ${C}-pulso { 50% { transform: scale(1.05); } }`,
    };
    const css = `.${C} {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: calc(${v('espaco')} * .75) calc(${v('espaco')} * 1.5);
  border: 0;
  border-radius: ${v('raio')};
  background: ${v('primaria')};
  color: ${v('fundo')};
  font-weight: 600;
  transition: transform ${v('duracao')} ${v('easing')}, box-shadow ${v('duracao')} ${v('easing')}, color ${v('duracao')} ${v('easing')};
}
${anims[cfg.animacao] ?? anims['elevar']}`;
    const html = `<button class="${C}" type="button">${b.span('rotulo')}</button>`;
    const estrutura = b.noBotao('botao', 'rotulo', 'Texto do botão', 'primario', {
      nome: cfg.nome,
      efeitos: [s.efeito],
    });
    return {
      html,
      css,
      estrutura,
      estados: s.estados,
      interacoes: s.interacoes,
      animacao: {
        nome: BOTAO.animacoes.find((a) => a.id === cfg.animacao)?.nome ?? 'Hover',
        tecnica:
          cfg.animacao === 'brilho' || cfg.animacao === 'pulsar'
            ? 'css-keyframes'
            : 'css-transition',
        variaveis: ['duracao', 'easing', 'forcaSombra'],
        descricao:
          'Transição de transform e box-shadow (ou keyframes contínuos). No Figma: variantes Padrão e Hover com “While hovering”.',
      },
      editavel: [
        'Variantes Padrão e Hover; no protótipo, o hover troca sozinho (Smart Animate)',
        'Auto Layout: o botão cresce com o texto',
      ],
      naoSuportado: ['Movimento contínuo (pulsar e brilho)'],
      tags: ['button', 'cta'],
    };
  },
};

/* ============================== Card de foto ============================== */

export const CARD_FOTO: DefinicaoTipo = {
  id: 'card-foto',
  nome: 'Card de foto',
  categoria: 'conteudo',
  uso: 'site e app',
  descricao: 'Card com imagem, título, texto e botão.',
  midia: 'imagem',
  textos: [
    { id: 'titulo', rotulo: 'Título', padrao: 'Aula de samba no pé' },
    {
      id: 'texto',
      rotulo: 'Descrição',
      padrao: 'Toda quinta, 19h, com turma iniciante e avançada.',
    },
    { id: 'botao', rotulo: 'Botão', padrao: 'Ver mais' },
  ],
  animacoes: [
    { id: 'zoom', nome: 'Zoom na imagem', descricao: 'A imagem aproxima devagar no hover.' },
    { id: 'elevar', nome: 'Card sobe', descricao: 'O card sobe e ganha sombra colorida.' },
    {
      id: 'revelar',
      nome: 'Texto sobe sobre a foto',
      descricao: 'O texto fica sobre a imagem e sobe no hover.',
    },
  ],
  largura: 320,
  altura: 380,
  gerar(cfg, b) {
    const C = b.C;
    const v = (n: string) => b.v(n);
    const s = sombraHover(b, 'card');
    b.extra({
      id: 'imagem',
      nome: 'Imagem (URL)',
      tipo: 'string',
      padrao: cfg.midia || imagemPadrao(cfg),
      descricao:
        'Endereço da imagem (https://… ou data:). No Figma, arraste a foto para a camada Imagem.',
      grupo: 'components',
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: 'src da imagem',
          alvo: { tipo: 'atributo', seletor: `.${C}__img`, atributo: 'src' },
        },
      ],
    });
    const revelar = cfg.animacao === 'revelar';
    const html = `<article class="${C}">
  <div class="${C}__midia"><img class="${C}__img" src="" alt="${escHtml(b.texto('titulo'))}" loading="lazy"></div>
  <div class="${C}__corpo">
    ${b.span('titulo', 'h3')}
    ${b.span('texto', 'p')}
    <a class="${C}__acao" href="#">${b.span('botao')}</a>
  </div>
</article>`;
    const efeito: Record<string, string> = {
      zoom: `.${C}:hover .${C}__img { transform: scale(1.08); }`,
      elevar: `.${C}:hover { transform: translateY(-6px); box-shadow: ${s.sombraCss}; }`,
      revelar: `.${C}__corpo { position: absolute; inset: auto 0 0 0; background: linear-gradient(transparent, color-mix(in srgb, ${v('fundo')} 92%, transparent) 40%); transform: translateY(calc(100% - 4.2em)); transition: transform ${v('duracao')} ${v('easing')}; }
.${C}:hover .${C}__corpo, .${C}:focus-within .${C}__corpo { transform: none; }
.${C}__midia { aspect-ratio: 4 / 5; }`,
    };
    const css = `.${C} { position: relative; width: 100%; max-width: 320px; overflow: hidden; border-radius: ${v('raio')}; background: ${v('superficie')}; transition: transform ${v('duracao')} ${v('easing')}, box-shadow ${v('duracao')} ${v('easing')}; }
.${C}__midia { aspect-ratio: 16 / 10; overflow: hidden; background: linear-gradient(135deg, ${v('primaria')}, ${v('superficie')}); }
.${C}__img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform calc(${v('duracao')} * 2) ${v('easing')}; }
.${C}__corpo { display: grid; gap: calc(${v('espaco')} * .5); padding: ${v('espaco')}; }
.${C}__titulo { margin: 0; font-size: calc(${v('fonte')} * 1.25); }
.${C}__texto { margin: 0; color: ${v('suave')}; line-height: 1.5; }
.${C}__acao { justify-self: start; padding: .55em 1em; border-radius: ${v('raio')}; background: ${v('primaria')}; color: ${v('fundo')}; font-weight: 600; text-decoration: none; }
${efeito[cfg.animacao] ?? efeito['zoom']}`;
    const corpo = b.pilha(
      'corpo',
      'Conteúdo',
      'vertical',
      [
        b.noTexto('titulo', 'Título', {
          tamanho: b.fonteX(1.25, 'titulo-tamanho'),
          estilo: 'Bold',
          preencher: true,
        }),
        b.noTexto('texto', 'Descrição', { cor: b.cor('suave'), preencher: true }),
        b.noBotao('acao', 'botao', 'Botão'),
      ],
      { espaco: b.espacoX(0.5, 'corpo-gap'), px: b.espaco, py: b.espaco, encher: true },
    );
    const estrutura: KcxNo = b.pilha(
      'card',
      cfg.nome,
      'vertical',
      [
        {
          id: 'imagem',
          nome: 'Imagem',
          tipo: 'retangulo',
          largura: 320,
          altura: revelar ? 400 : 200,
          preenchimentos: gradienteMidia(b),
        },
        corpo,
      ],
      {
        largura: 320,
        raio: b.raio,
        recortar: true,
        preenchimentos: [{ tipo: 'solido', cor: b.cor('superficie') }],
        efeitos: [s.efeito],
      },
    );
    return {
      html,
      css,
      estrutura,
      estados: s.estados,
      interacoes: s.interacoes,
      animacao: {
        nome: CARD_FOTO.animacoes.find((a) => a.id === cfg.animacao)?.nome ?? 'Hover',
        tecnica: 'css-transition',
        variaveis: ['duracao', 'easing', 'forcaSombra'],
        descricao: 'Transições no hover (imagem, card ou texto).',
      },
      editavel: [
        'A camada Imagem é um retângulo nativo: arraste a sua foto para ela no Figma',
        'Variantes Padrão e Hover (sombra colorida), com “While hovering” no protótipo',
      ],
      parcial: ['Zoom da imagem e subida do texto ficam no código'],
      limitacoes: [
        'A imagem do lab não vai para o Figma automaticamente (o plugin não baixa arquivos da internet).',
      ],
      tags: ['card', 'foto', 'imagem'],
    };
  },
};

/* ============================== Card de vídeo ============================== */

export const CARD_VIDEO: DefinicaoTipo = {
  id: 'card-video',
  nome: 'Card de vídeo',
  categoria: 'conteudo',
  uso: 'site e app',
  descricao: 'Card com vídeo, botão de play, título e descrição.',
  midia: 'video',
  textos: [
    { id: 'titulo', rotulo: 'Título', padrao: 'Passo básico do forró' },
    { id: 'texto', rotulo: 'Descrição', padrao: 'Aula rápida para treinar em casa.' },
    { id: 'tempo', rotulo: 'Duração', padrao: '3:42' },
  ],
  animacoes: [
    { id: 'play', nome: 'Play pulsando', descricao: 'O botão de play pulsa até a pessoa clicar.' },
    { id: 'zoom', nome: 'Zoom na capa', descricao: 'A capa aproxima no hover.' },
    {
      id: 'escurecer',
      nome: 'Capa escurece',
      descricao: 'A capa escurece e o play cresce no hover.',
    },
  ],
  largura: 320,
  altura: 320,
  gerar(cfg, b) {
    const C = b.C;
    const v = (n: string) => b.v(n);
    const s = sombraHover(b, 'card');
    b.extra({
      id: 'video',
      nome: 'Vídeo (URL)',
      tipo: 'string',
      padrao: cfg.midia || '',
      descricao: 'Endereço do vídeo .mp4/.webm (https://…). Vazio: o card mostra só a capa.',
      grupo: 'components',
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: 'data-src do vídeo',
          alvo: { tipo: 'atributo', seletor: `.${C}__video`, atributo: 'data-src' },
        },
      ],
    });
    const html = `<article class="${C}" data-tocando="false">
  <div class="${C}__midia">
    <video class="${C}__video" data-src="" preload="none" playsinline></video>
    <button class="${C}__play" type="button" aria-label="Reproduzir vídeo">${svgIcone(ICONES.play, `${C}__icone`, 28)}</button>
    ${b.span('tempo')}
  </div>
  <div class="${C}__corpo">
    ${b.span('titulo', 'h3')}
    ${b.span('texto', 'p')}
  </div>
</article>`;
    const efeito: Record<string, string> = {
      play: `.${C}[data-tocando="false"] .${C}__play { animation: ${C}-pulso calc(${v('duracao')} * 5) ease-in-out infinite; }
@keyframes ${C}-pulso { 50% { box-shadow: 0 0 0 12px color-mix(in srgb, ${v('primaria')} 30%, transparent); } }`,
      zoom: `.${C}:hover .${C}__midia::before { transform: scale(1.08); }`,
      escurecer: `.${C}:hover .${C}__midia::after { opacity: 1; }
.${C}:hover .${C}__play { transform: translate(-50%, -50%) scale(1.15); }`,
    };
    const css = `.${C} { width: 100%; max-width: 320px; overflow: hidden; border-radius: ${v('raio')}; background: ${v('superficie')}; transition: box-shadow ${v('duracao')} ${v('easing')}; }
.${C}:hover { box-shadow: ${s.sombraCss}; }
.${C}__midia { position: relative; aspect-ratio: 16 / 9; overflow: hidden; }
.${C}__midia::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, ${v('primaria')}, ${v('superficie')}); transition: transform calc(${v('duracao')} * 2) ${v('easing')}; }
.${C}__midia::after { content: ''; position: absolute; inset: 0; background: rgb(0 0 0 / .35); opacity: 0; pointer-events: none; transition: opacity ${v('duracao')} ${v('easing')}; }
.${C}__video { position: relative; z-index: 1; display: block; width: 100%; height: 100%; object-fit: cover; }
.${C}[data-tocando="false"] .${C}__video:not([src]) { visibility: hidden; }
.${C}__play { position: absolute; z-index: 2; top: 50%; left: 50%; display: grid; place-items: center; width: 64px; height: 64px; padding: 0 0 0 4px; border: 0; border-radius: 50%; background: ${v('primaria')}; color: ${v('fundo')}; transform: translate(-50%, -50%); transition: transform ${v('duracao')} ${v('easing')}, opacity ${v('duracao')} ${v('easing')}; }
.${C}[data-tocando="true"] .${C}__play { opacity: 0; pointer-events: none; }
.${C}__tempo { position: absolute; z-index: 2; right: 8px; bottom: 8px; padding: 2px 8px; border-radius: 999px; background: rgb(0 0 0 / .6); color: #fff; font-size: .8em; }
.${C}__corpo { display: grid; gap: calc(${v('espaco')} * .35); padding: ${v('espaco')}; }
.${C}__titulo { margin: 0; font-size: calc(${v('fonte')} * 1.125); }
.${C}__texto { margin: 0; color: ${v('suave')}; }
${efeito[cfg.animacao] ?? efeito['play']}`;
    const js = `// Play/pause; o vídeo só carrega quando a pessoa clica.
document.querySelectorAll('.${C}').forEach((card) => {
  const video = card.querySelector('.${C}__video');
  const play = card.querySelector('.${C}__play');
  play.addEventListener('click', () => {
    const src = video.getAttribute('data-src');
    if (!src) { play.setAttribute('aria-label', 'Nenhum vídeo escolhido'); return; }
    if (video.getAttribute('src') !== src) video.setAttribute('src', src);
    video.controls = true;
    video.play();
  });
  video.addEventListener('play', () => card.setAttribute('data-tocando', 'true'));
  video.addEventListener('pause', () => card.setAttribute('data-tocando', 'false'));
});`;
    const midia: KcxNo = {
      id: 'midia',
      nome: 'Capa do vídeo',
      tipo: 'frame',
      largura: 320,
      altura: 180,
      preenchimentos: gradienteMidia(b),
      recortar: true,
      filhos: [
        {
          id: 'play',
          nome: 'Play',
          tipo: 'elipse',
          x: 128,
          y: 58,
          largura: 64,
          altura: 64,
          preenchimentos: [{ tipo: 'solido', cor: b.cor('primaria') }],
        },
        { ...b.icone('icone-play', 'Ícone play', ICONES.play, 28, b.cor('fundo')), x: 148, y: 76 },
        b.pilha(
          'selo-tempo',
          'Duração',
          'horizontal',
          [
            b.noTexto('tempo', 'Duração', {
              tamanho: b.fonteX(0.8, 'tempo-tamanho'),
              cor: '#ffffff',
            }),
          ],
          {
            x: 262,
            y: 148,
            px: 8,
            py: 2,
            raio: 999,
            preenchimentos: [{ tipo: 'solido', cor: '#00000099' }],
          },
        ),
      ],
    };
    const estrutura = b.pilha(
      'card',
      cfg.nome,
      'vertical',
      [
        midia,
        b.pilha(
          'corpo',
          'Conteúdo',
          'vertical',
          [
            b.noTexto('titulo', 'Título', {
              tamanho: b.fonteX(1.125, 'titulo-tamanho'),
              estilo: 'Bold',
              preencher: true,
            }),
            b.noTexto('texto', 'Descrição', { cor: b.cor('suave'), preencher: true }),
          ],
          { espaco: b.espacoX(0.35, 'corpo-gap'), px: b.espaco, py: b.espaco, encher: true },
        ),
      ],
      {
        largura: 320,
        raio: b.raio,
        recortar: true,
        preenchimentos: [{ tipo: 'solido', cor: b.cor('superficie') }],
        efeitos: [s.efeito],
      },
    );
    return {
      html,
      css,
      js,
      estrutura,
      estados: s.estados,
      interacoes: s.interacoes,
      animacao: {
        nome: CARD_VIDEO.animacoes.find((a) => a.id === cfg.animacao)?.nome ?? 'Play',
        tecnica: cfg.animacao === 'play' ? 'css-keyframes' : 'css-transition',
        variaveis: ['duracao', 'easing', 'forcaSombra'],
        descricao: 'Botão de play animado; o vídeo só é baixado no clique (preload none).',
      },
      editavel: [
        'Capa como frame nativo: troque o gradiente por um print do vídeo',
        'Play e selo de duração editáveis',
      ],
      naoSuportado: ['Tocar o vídeo dentro do Figma'],
      limitacoes: [
        'O vídeo não vai para o Figma: plugin só cria vídeo em plano pago e com o arquivo enviado. A capa fica como imagem/gradiente.',
      ],
      tags: ['video', 'player', 'card'],
    };
  },
};

/* ============================== Carrossel ============================== */

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

export const CARD_PRECO: DefinicaoTipo = {
  id: 'card-preco',
  nome: 'Card de preço',
  categoria: 'conteudo',
  uso: 'site',
  descricao: 'Plano com preço, lista de vantagens e botão de assinar.',
  textos: [
    { id: 'plano', rotulo: 'Nome do plano', padrao: 'Plano Pro' },
    { id: 'preco', rotulo: 'Preço', padrao: 'R$ 89' },
    { id: 'periodo', rotulo: 'Período', padrao: '/mês' },
    { id: 'descricao', rotulo: 'Descrição', padrao: 'Para quem quer treinar toda semana.' },
    { id: 'botao', rotulo: 'Botão', padrao: 'Assinar agora' },
  ],
  itens: {
    rotulo: 'Vantagem',
    padrao: ['2 aulas por semana', 'Acesso às gravações', 'Aulão mensal', 'Grupo da turma'],
    min: 1,
    max: 8,
  },
  animacoes: [
    { id: 'elevar', nome: 'Card sobe', descricao: 'Sobe e ganha sombra colorida no hover.' },
    { id: 'destaque', nome: 'Borda que brilha', descricao: 'A borda acende no hover.' },
    {
      id: 'entrar',
      nome: 'Vantagens em sequência',
      descricao: 'As vantagens entram uma a uma ao carregar.',
    },
  ],
  largura: 320,
  altura: 440,
  gerar(cfg, b) {
    const C = b.C;
    const v = (n: string) => b.v(n);
    const s = sombraHover(b, 'card');
    const html = `<article class="${C}">
  ${b.span('plano', 'h3')}
  <p class="${C}__valor">${b.span('preco', 'strong')}${b.span('periodo')}</p>
  ${b.span('descricao', 'p')}
  <ul class="${C}__lista">
    ${cfg.itens.map((_, i) => `<li style="--i:${i}">${svgIcone(ICONES.check, `${C}__check`, 18)}${b.item(i)}</li>`).join('\n    ')}
  </ul>
  <a class="${C}__acao" href="#">${b.span('botao')}</a>
</article>`;
    const efeito: Record<string, string> = {
      elevar: `.${C}:hover { transform: translateY(-6px); box-shadow: ${s.sombraCss}; }`,
      destaque: `.${C}:hover { box-shadow: inset 0 0 0 2px ${v('primaria')}, ${s.sombraCss}; }`,
      entrar: `.${C}__lista li { animation: ${C}-entra ${v('duracao')} ${v('easing')} both; animation-delay: calc(var(--i) * 90ms); }
@keyframes ${C}-entra { from { opacity: 0; transform: translateX(-10px); } }
.${C}:hover { box-shadow: ${s.sombraCss}; }`,
    };
    const css = `.${C} { display: grid; gap: calc(${v('espaco')} * .75); width: 100%; max-width: 320px; padding: calc(${v('espaco')} * 1.5); border-radius: ${v('raio')}; background: ${v('superficie')}; box-shadow: inset 0 0 0 1px color-mix(in srgb, ${v('primaria')} 40%, transparent); transition: transform ${v('duracao')} ${v('easing')}, box-shadow ${v('duracao')} ${v('easing')}; }
.${C}__plano { margin: 0; color: ${v('primaria')}; font-size: calc(${v('fonte')} * .875); letter-spacing: .08em; text-transform: uppercase; }
.${C}__valor { margin: 0; }
.${C}__preco { font-size: calc(${v('fonte')} * 2.5); }
.${C}__periodo { color: ${v('suave')}; }
.${C}__descricao { margin: 0; color: ${v('suave')}; }
.${C}__lista { display: grid; gap: .55em; margin: 0; padding: 0; list-style: none; }
.${C}__lista li { display: flex; align-items: center; gap: .55em; }
.${C}__check { flex: none; color: ${v('primaria')}; }
.${C}__acao { padding: .75em 1em; border-radius: ${v('raio')}; background: ${v('primaria')}; color: ${v('fundo')}; font-weight: 600; text-align: center; text-decoration: none; }
${efeito[cfg.animacao] ?? efeito['elevar']}`;
    const estrutura = b.pilha(
      'card',
      cfg.nome,
      'vertical',
      [
        b.noTexto('plano', 'Nome do plano', {
          cor: b.cor('primaria'),
          tamanho: b.fonteX(0.875, 'plano-tamanho'),
          estilo: 'Semi Bold',
          caixaAlta: true,
          preencher: true,
        }),
        b.pilha(
          'valor',
          'Preço',
          'horizontal',
          [
            b.noTexto('preco', 'Preço', {
              tamanho: b.fonteX(2.5, 'preco-tamanho'),
              estilo: 'Bold',
            }),
            b.noTexto('periodo', 'Período', { cor: b.cor('suave') }),
          ],
          { espaco: 4 },
        ),
        b.noTexto('descricao', 'Descrição', { cor: b.cor('suave'), preencher: true }),
        b.pilha(
          'lista',
          'Vantagens',
          'vertical',
          cfg.itens.map((_, i) =>
            b.pilha(
              `vantagem-${i + 1}`,
              `Vantagem ${i + 1}`,
              'horizontal',
              [
                b.icone(`check-${i + 1}`, 'Check', ICONES.check, 18, b.cor('primaria')),
                b.noItem(i, { preencher: true }),
              ],
              { espaco: 8, encher: true },
            ),
          ),
          { espaco: b.espacoX(0.55, 'lista-gap'), encher: true },
        ),
        b.noBotao('acao', 'botao', 'Botão', 'primario', { encher: true }),
      ],
      {
        largura: 320,
        espaco: b.espacoX(0.75, 'card-gap'),
        px: b.espacoX(1.5, 'card-px'),
        py: b.espacoX(1.5, 'card-py'),
        raio: b.raio,
        preenchimentos: [{ tipo: 'solido', cor: b.cor('superficie') }],
        traco: { cor: b.corAlpha('corPrimaria', 'borda', 0.4), espessura: 1 },
        efeitos: [s.efeito],
      },
    );
    return {
      html,
      css,
      estrutura,
      estados: s.estados,
      interacoes: s.interacoes,
      animacao: {
        nome: CARD_PRECO.animacoes.find((a) => a.id === cfg.animacao)?.nome ?? 'Hover',
        tecnica: cfg.animacao === 'entrar' ? 'css-keyframes' : 'css-transition',
        variaveis: ['duracao', 'easing', 'forcaSombra'],
        descricao: 'Hover com transform/box-shadow (ou entrada em sequência das vantagens).',
      },
      editavel: [
        'Lista de vantagens com ícone de check como vetor',
        'Variantes Padrão e Hover com “While hovering”',
      ],
      tags: ['pricing', 'plano', 'preço'],
    };
  },
};

/* ============================== Conjunto de botões (variantes) ============================== */

const PALETA_BOTOES = ['#d4119f', '#7c3aed', '#22e3ff', '#3ddc97', '#ffb547', '#ff5c7a'];
const TAMANHOS = [
  { valor: 'p', rotulo: 'P', px: 16, py: 8, fonte: 14 },
  { valor: 'm', rotulo: 'M', px: 24, py: 12, fonte: 16 },
  { valor: 'g', rotulo: 'G', px: 32, py: 16, fonte: 20 },
];

export const BOTOES: DefinicaoTipo = {
  id: 'botoes',
  nome: 'Conjunto de botões',
  categoria: 'acoes',
  uso: 'site e app',
  descricao:
    'Vários botões num componente só: no Figma, variantes por botão (nome e cor), tamanho (P, M, G) e estado (Padrão, Hover).',
  textos: [],
  itens: { rotulo: 'Botão', padrao: ['Entrar', 'Criar conta'], min: 1, max: 6 },
  animacoes: [
    {
      id: 'elevar',
      nome: 'Sobe com sombra',
      descricao: 'Sobe um pouco e ganha sombra na cor do botão.',
    },
    {
      id: 'preencher',
      nome: 'Preenche no hover',
      descricao: 'Contorno que se enche de cor no hover.',
    },
    {
      id: 'brilho',
      nome: 'Brilho no hover',
      descricao: 'Um halo na cor do botão aparece no hover.',
    },
  ],
  largura: 420,
  altura: 64,
  gerar(cfg, b) {
    const C = b.C;
    const v = (n: string) => b.v(n);
    const n = cfg.itens.length;
    const cores = cfg.itens.map((_, i) =>
      b.extra({
        id: `corBotao${i + 1}`,
        nome: `Cor do botão ${i + 1}`,
        tipo: 'color',
        padrao: i === 0 ? cfg.cores.primaria : PALETA_BOTOES[i % PALETA_BOTOES.length],
        descricao: `Cor do botão “${cfg.itens[i]}”.`,
        grupo: 'colors',
        secao: 'aparencia',
        vinculos: [
          { propriedade: 'background', alvo: { tipo: 'css-var', nome: `${b.P}-botao-${i + 1}` } },
        ],
      }),
    );
    const acao = b.extra({
      id: 'botaoFigma',
      nome: 'Botão',
      tipo: 'enum',
      padrao: 'b1',
      opcoes: cfg.itens.map((t, i) => ({ valor: `b${i + 1}`, rotulo: t || `Botão ${i + 1}` })),
      descricao:
        'Eixo de variante no Figma: um conjunto de variantes por botão. No código todos os botões aparecem.',
      grupo: 'components',
      secao: 'comportamento',
      vinculos: [
        {
          propriedade: 'data-destaque',
          alvo: { tipo: 'atributo', seletor: `.${C}`, atributo: 'data-destaque' },
        },
      ],
    });
    const tamanho = b.extra({
      id: 'tamanho',
      nome: 'Tamanho',
      tipo: 'enum',
      padrao: 'm',
      opcoes: TAMANHOS.map((t) => ({ valor: t.valor, rotulo: t.rotulo })),
      descricao: 'P, M ou G (padding e tamanho do texto). No Figma é um eixo de variante.',
      grupo: 'dimensions',
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: 'data-tamanho',
          alvo: { tipo: 'atributo', seletor: `.${C}`, atributo: 'data-tamanho' },
        },
      ],
    });
    const forca = b.extra({
      id: 'forcaSombra',
      nome: 'Força da sombra no hover',
      tipo: 'float',
      padrao: 0.5,
      min: 0,
      max: 1,
      passo: 0.05,
      descricao: 'Opacidade da sombra que aparece no hover.',
      grupo: 'effects',
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: 'Opacidade da sombra',
          alvo: { tipo: 'css-var', nome: `${b.P}-sombra` },
          transformar: [{ op: 'multiplicar', fator: 100 }],
          unidadeSaida: '%',
        },
      ],
    });
    const sombra = `0 10px 24px color-mix(in srgb, var(--cor) ${v('sombra')}, transparent)`;
    const efeito: Record<string, string> = {
      elevar: `.${C}__btn:hover, .${C}__btn:focus-visible { transform: translateY(-3px); box-shadow: ${sombra}; }`,
      preencher: `.${C}__btn { background: transparent; color: var(--cor); box-shadow: inset 0 0 0 2px var(--cor); }
.${C}__btn:hover, .${C}__btn:focus-visible { background: var(--cor); color: ${v('fundo')}; }`,
      brilho: `.${C}__btn:hover, .${C}__btn:focus-visible { box-shadow: 0 0 0 4px color-mix(in srgb, var(--cor) 25%, transparent), ${sombra}; }`,
    };
    const html = `<div class="${C}" data-tamanho="m" data-destaque="b1">
  ${cfg.itens.map((_, i) => b.item(i, 'button', `class="${C}__btn" type="button" style="--cor: ${v(`botao-${i + 1}`)}"`)).join('\n  ')}
</div>`;
    const css = `.${C} { display: flex; flex-wrap: wrap; gap: calc(${v('espaco')} * .75); align-items: center; }
.${C}__btn {
  padding: .75em 1.5em;
  border: 0;
  border-radius: ${v('raio')};
  background: var(--cor);
  color: ${v('fundo')};
  font-weight: 600;
  transition: transform ${v('duracao')} ${v('easing')}, box-shadow ${v('duracao')} ${v('easing')}, background ${v('duracao')} ${v('easing')}, color ${v('duracao')} ${v('easing')};
}
.${C}__btn:active { transform: translateY(0) scale(.98); }
${TAMANHOS.map((t) => `.${C}[data-tamanho="${t.valor}"] .${C}__btn { padding: ${t.py}px ${t.px}px; font-size: ${t.fonte}px; }`).join('\n')}
${efeito[cfg.animacao] ?? efeito['elevar']}`;
    /** Valor que depende do botão (variante): escolhe a variável do botão atual. */
    const doBotao = (prefixo: string, nome: string, extra: KcxOperacao[] = []) =>
      ({
        $derivado: acao,
        nome,
        transformar: [
          {
            op: 'variavelPorOpcao',
            variaveis: Object.fromEntries(
              cfg.itens.map((_, i) => [`b${i + 1}`, `${prefixo}${i + 1}`]),
            ),
          },
          ...extra,
        ],
      }) as never;
    const porTamanho = (campo: 'px' | 'py' | 'fonte', nome: string) =>
      ({
        $derivado: tamanho,
        nome,
        transformar: [
          {
            op: 'mapa',
            valores: Object.fromEntries(TAMANHOS.map((t) => [t.valor, String(t[campo])])),
          },
        ],
      }) as never;
    const preencher = cfg.animacao === 'preencher';
    const corAtual = doBotao('corBotao', 'botao-cor');
    const estrutura: KcxNo = {
      id: 'botao',
      nome: cfg.nome,
      tipo: 'frame',
      raio: b.raio,
      preenchimentos: preencher ? [] : [{ tipo: 'solido', cor: corAtual }],
      traco: preencher ? { cor: corAtual, espessura: 2 } : undefined,
      efeitos: [
        {
          tipo: 'sombra',
          x: 0,
          y: 10,
          cor: doBotao('corBotao', 'sombra-cor', [{ op: 'alpha', valor: 0.5 }]),
          raio: {
            $derivado: forca,
            nome: 'sombra-raio',
            transformar: [{ op: 'multiplicar', fator: 48 }],
          },
        },
      ],
      autoLayout: {
        direcao: 'horizontal',
        espaco: 0,
        paddingX: porTamanho('px', 'botao-px'),
        paddingY: porTamanho('py', 'botao-py'),
      },
      filhos: [
        {
          id: 'rotulo',
          nome: 'Rótulo',
          tipo: 'texto',
          preenchimentos: [{ tipo: 'solido', cor: preencher ? corAtual : { $var: 'corFundo' } }],
          texto: {
            conteudo: doBotao('item', 'botao-rotulo'),
            tamanho: porTamanho('fonte', 'botao-fonte'),
            familia: 'Inter',
            estilo: 'Semi Bold',
          },
        },
      ],
    };
    void cores;
    return {
      html,
      css,
      estrutura,
      eixos: [acao, tamanho],
      estados: [
        {
          id: 'padrao',
          nome: 'Padrão',
          gatilho: 'padrao',
          descricao: 'Em repouso.',
          valores: { [forca]: 0 },
        },
        {
          id: 'hover',
          nome: 'Hover',
          gatilho: 'hover',
          descricao: 'Mouse por cima: sombra na cor do botão.',
          valores: { [forca]: 0.5 },
        },
      ],
      interacoes: [
        {
          no: 'botao',
          gatilho: 'hover',
          de: 'padrao',
          para: 'hover',
          transicao: 'smart-animate',
          duracao: 300,
        },
      ],
      animacao: {
        nome: BOTOES.animacoes.find((a) => a.id === cfg.animacao)?.nome ?? 'Hover',
        tecnica: 'css-transition',
        variaveis: ['duracao', 'easing', 'forcaSombra'],
        descricao: 'Transição de transform, sombra e cor no hover.',
      },
      editavel: [
        `Variantes: Botão (${cfg.itens.join(', ')}) × Tamanho (P, M, G) × Estado (Padrão, Hover)`,
        'Cada variante com a cor e o nome do seu botão; o tamanho muda padding e texto',
        'Protótipo: o hover troca para a variante Hover (Smart Animate)',
      ],
      tags: ['button', 'variantes', 'design system'],
    };
  },
};

export const TIPOS_CONTEUDO = [
  BOTAO,
  BOTOES,
  CARD_FOTO,
  CARD_VIDEO,
  CARROSSEL,
  ACORDEAO,
  CARD_PRECO,
];

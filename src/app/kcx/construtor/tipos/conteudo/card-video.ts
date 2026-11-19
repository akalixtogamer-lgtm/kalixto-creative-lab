import { KcxNo } from '../../../kcx.types';
import { DefinicaoTipo, ICONES, svgIcone } from '../../montar';
import { gradienteMidia, sombraHover } from './_comum';

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
  recursos: [
    {
      id: 'partes',
      nome: 'Partes liga/desliga',
      descricao: 'Mostrar ou ocultar cada parte do card na instância do Figma.',
      padrao: true,
    },
  ],
  partes: [
    { no: 't-tempo', nome: 'Duração', classe: 'tempo' },
    { no: 't-titulo', nome: 'Título', classe: 'titulo' },
    { no: 't-texto', nome: 'Descrição', classe: 'texto' },
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

import { KcxNo } from '../../../kcx.types';
import { DefinicaoTipo, escHtml } from '../../montar';
import { gradienteMidia, imagemPadrao, sombraHover } from './_comum';

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
  recursos: [
    {
      id: 'partes',
      nome: 'Partes liga/desliga',
      descricao: 'Mostrar ou ocultar cada parte do card na instância do Figma.',
      padrao: true,
    },
    {
      id: 'slot',
      nome: 'Conteúdo livre (slot)',
      descricao: 'Área no card onde você coloca qualquer coisa na instância do Figma.',
      padrao: true,
    },
  ],
  partes: [
    { no: 'imagem', nome: 'Imagem', classe: 'midia' },
    { no: 't-titulo', nome: 'Título', classe: 'titulo' },
    { no: 't-texto', nome: 'Descrição', classe: 'texto' },
    { no: 'acao', nome: 'Botão', classe: 'acao' },
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
        ...(b.tem('slot')
          ? [
              b.pilha(
                'extra',
                'Conteúdo livre',
                'vertical',
                [
                  {
                    id: 'extra-dica',
                    nome: 'Dica',
                    tipo: 'texto',
                    preenchimentos: [{ tipo: 'solido', cor: b.cor('suave') }],
                    texto: {
                      conteudo: 'Coloque aqui o que quiser',
                      tamanho: 12,
                      familia: 'Inter',
                      estilo: 'Regular',
                    },
                  },
                ],
                { espaco: 8, px: 8, py: 8, encher: true, slot: 'Conteúdo livre' },
              ),
            ]
          : []),
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

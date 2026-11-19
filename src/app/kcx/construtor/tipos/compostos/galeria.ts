import { KcxNo } from '../../../kcx.types';
import { DefinicaoTipo } from '../../montar';

export const GALERIA: DefinicaoTipo = {
  id: 'galeria',
  nome: 'Galeria em grade',
  categoria: 'conteudo',
  uso: 'site e app',
  descricao: 'Grade de cards (fotos com título) que se reorganiza no celular.',
  textos: [],
  itens: {
    rotulo: 'Card',
    padrao: ['Samba', 'Forró', 'Zouk', 'Bolero', 'Hip hop', 'Jazz funk'],
    min: 2,
    max: 12,
  },
  recursos: [
    {
      id: 'grade',
      nome: 'Grade do Figma (Grid)',
      descricao: 'Usa o layout Grid do Figma (3 colunas). Desligado, usa Auto Layout com quebra.',
      padrao: true,
    },
  ],
  animacoes: [
    { id: 'zoom', nome: 'Zoom na foto', descricao: 'A foto aproxima no hover.' },
    { id: 'elevar', nome: 'Card sobe', descricao: 'O card sobe e ganha sombra.' },
  ],
  largura: 640,
  altura: 460,
  gerar(cfg, b) {
    const C = b.C;
    const v = (n: string) => b.v(n);
    const html = `<ul class="${C}">
  ${cfg.itens.map((_, i) => `<li class="${C}__card" style="--h:${(i * 47) % 360}deg"><div class="${C}__foto"></div>${b.item(i, 'span')}</li>`).join('\n  ')}
</ul>`;
    const css = `.${C} { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: ${v('espaco')}; width: 100%; max-width: 640px; margin: 0; padding: 0; list-style: none; }
.${C}__card { overflow: hidden; border-radius: ${v('raio')}; background: ${v('superficie')}; color: ${v('texto')}; font-weight: 600; transition: transform ${v('duracao')} ${v('easing')}, box-shadow ${v('duracao')} ${v('easing')}; }
.${C}__card > span { display: block; padding: .7em .9em; }
.${C}__foto { aspect-ratio: 4 / 3; background: linear-gradient(135deg, ${v('primaria')}, ${v('superficie')}); filter: hue-rotate(var(--h)); transition: transform ${v('duracao')} ${v('easing')}; }
${cfg.animacao === 'zoom' ? `.${C}__card:hover .${C}__foto { transform: scale(1.08); }` : `.${C}__card:hover { transform: translateY(-4px); box-shadow: 0 12px 28px color-mix(in srgb, ${v('primaria')} 40%, transparent); }`}`;
    const cards = cfg.itens.map((_, i): KcxNo =>
      b.pilha(
        `card${i + 1}`,
        `Card ${i + 1}`,
        'vertical',
        [
          {
            id: `foto${i + 1}`,
            nome: 'Foto',
            tipo: 'retangulo',
            largura: 180,
            altura: 135,
            encher: true,
            preenchimentos: [
              {
                tipo: 'gradiente-linear',
                angulo: 135 + i * 20,
                paradas: [
                  { posicao: 0, cor: b.cor('primaria') },
                  { posicao: 1, cor: b.cor('superficie') },
                ],
              },
            ],
          },
          b.pilha(
            '',
            'Título',
            'horizontal',
            [b.noItem(i, { estilo: 'Semi Bold', preencher: true })],
            {
              px: 12,
              py: 10,
              encher: true,
            },
          ),
        ],
        {
          largura: 180,
          raio: b.raio,
          recortar: true,
          preenchimentos: [{ tipo: 'solido', cor: b.cor('superficie') }],
        },
      ),
    );
    cards.forEach((c, i) => {
      c.filhos![1].id = `titulo${i + 1}`;
    });
    const estrutura: KcxNo = b.tem('grade')
      ? {
          id: 'galeria',
          nome: cfg.nome,
          tipo: 'frame',
          preenchimentos: [],
          grade: { colunas: 3, espaco: b.espaco },
          filhos: cards,
        }
      : b.pilha('galeria', cfg.nome, 'horizontal', cards, {
          espaco: b.espaco,
          largura: 180 * 3 + 32,
          quebrar: true,
          alinhar: 'inicio',
        });
    return {
      html,
      css,
      estrutura,
      animacao: {
        nome: GALERIA.animacoes.find((a) => a.id === cfg.animacao)?.nome ?? 'Hover',
        tecnica: 'css-transition',
        variaveis: ['duracao', 'easing'],
        descricao: 'CSS Grid com auto-fill: as colunas se ajustam à largura.',
        figma: 'documental',
      },
      editavel: [
        b.tem('grade')
          ? 'Layout Grid do Figma com 3 colunas e espaço por variável'
          : 'Auto Layout com quebra de linha (Wrap)',
        'Títulos como propriedades de texto; arraste fotos para as camadas Foto',
      ],
      naoSuportado: ['O efeito de hover dos cards'],
      tags: ['galeria', 'grid', 'cards'],
    };
  },
};

/* ============================== Login ============================== */

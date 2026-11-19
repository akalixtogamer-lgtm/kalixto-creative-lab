import { construirComponente, DefinicaoTipo } from '../../montar';
import { BOTAO } from '../conteudo/botao';

export const HERO: DefinicaoTipo = {
  id: 'hero',
  nome: 'Hero (topo da página)',
  categoria: 'secoes',
  uso: 'site',
  descricao: 'Abertura de página com selo, título grande, texto e dois botões.',
  textos: [
    { id: 'selo', rotulo: 'Selo', padrao: 'Novas turmas' },
    { id: 'titulo', rotulo: 'Título', padrao: 'Dance do seu jeito, no seu ritmo' },
    {
      id: 'subtitulo',
      rotulo: 'Subtítulo',
      padrao: 'Aulas de samba, forró e dança de salão para todos os níveis.',
    },
    { id: 'botao1', rotulo: 'Botão principal', padrao: 'Agendar aula' },
    { id: 'botao2', rotulo: 'Botão secundário', padrao: 'Ver horários' },
  ],
  recursos: [
    {
      id: 'instancias',
      nome: 'Botões como componente',
      descricao:
        'Os botões viram instâncias de um Botão (com tipos e estados) que vai junto para o Figma.',
      padrao: true,
    },
  ],
  animacoes: [
    {
      id: 'subir',
      nome: 'Sobe em sequência',
      descricao: 'Selo, título, texto e botões sobem um depois do outro.',
    },
    {
      id: 'desfoque',
      nome: 'Sai do desfoque',
      descricao: 'Os elementos aparecem saindo do desfoque.',
    },
    { id: 'fade', nome: 'Aparecer', descricao: 'Tudo aparece com fade.' },
  ],
  largura: 720,
  altura: 420,
  gerar(cfg, b) {
    const C = b.C;
    const v = (n: string) => b.v(n);
    const de: Record<string, string> = {
      subir: 'opacity: 0; transform: translateY(24px);',
      desfoque: 'opacity: 0; filter: blur(12px);',
      fade: 'opacity: 0;',
    };
    const sub = b.tem('instancias')
      ? construirComponente(BOTAO, {
          tipo: 'botao',
          nome: `${cfg.nome} · Botão`,
          id: `${b.id}-botao`,
          textos: { rotulo: cfg.textos['botao1'] ?? 'Agendar aula' },
          itens: [],
          animacao: 'elevar',
          cores: cfg.cores,
          raio: cfg.raio,
          recursos: { tipos: true, tamanhos: false, estados: true, icones: false },
          icones: {},
          modos: cfg.modos,
        })
      : undefined;
    const html = `<section class="${C}">
  ${b.span('selo', 'span', 'style="--i:0"')}
  ${b.span('titulo', 'h1', 'style="--i:1"')}
  ${b.span('subtitulo', 'p', 'style="--i:2"')}
  <div class="${C}__acoes" style="--i:3">
    <a class="${C}__primario" href="#">${b.span('botao1')}</a>
    <a class="${C}__secundario" href="#">${b.span('botao2')}</a>
  </div>
</section>`;
    const css = `.${C} { display: grid; justify-items: center; gap: calc(${v('espaco')} * 1); width: 100%; max-width: 720px; padding: calc(${v('espaco')} * 3) calc(${v('espaco')} * 2); border-radius: ${v('raio')}; background: radial-gradient(120% 80% at 50% 0%, color-mix(in srgb, ${v('primaria')} 30%, ${v('fundo')}), ${v('fundo')}); text-align: center; }
.${C} > * { animation: ${C}-entra calc(${v('duracao')} * 2) ${v('easing')} both; animation-delay: calc(var(--i) * ${v('duracao')} * .4); }
@keyframes ${C}-entra { from { ${de[cfg.animacao] ?? de['subir']} } }
.${C}__selo { padding: .35em .9em; border-radius: 999px; background: color-mix(in srgb, ${v('primaria')} 20%, transparent); color: ${v('primaria')}; font-size: .85em; font-weight: 600; }
.${C}__titulo { max-width: 16ch; margin: 0; font-size: clamp(calc(${v('fonte')} * 2), 6vw, calc(${v('fonte')} * 3.5)); line-height: 1.05; }
.${C}__subtitulo { max-width: 46ch; margin: 0; color: ${v('suave')}; font-size: calc(${v('fonte')} * 1.125); line-height: 1.55; }
.${C}__acoes { display: flex; flex-wrap: wrap; justify-content: center; gap: calc(${v('espaco')} * .75); margin-top: calc(${v('espaco')} * .5); }
.${C}__primario, .${C}__secundario { padding: .8em 1.4em; border-radius: ${v('raio')}; font-weight: 600; text-decoration: none; }
.${C}__primario { background: ${v('primaria')}; color: ${v('fundo')}; }
.${C}__secundario { color: ${v('texto')}; box-shadow: inset 0 0 0 1px color-mix(in srgb, ${v('suave')} 50%, transparent); }`;
    const estrutura = b.pilha(
      'hero',
      cfg.nome,
      'vertical',
      [
        b.pilha(
          'selo-fundo',
          'Selo',
          'horizontal',
          [
            b.noTexto('selo', 'Selo', {
              cor: b.cor('primaria'),
              estilo: 'Semi Bold',
              tamanho: b.fonteX(0.85, 'selo-tamanho'),
            }),
          ],
          {
            px: 14,
            py: 5,
            raio: 999,
            preenchimentos: [{ tipo: 'solido', cor: b.corAlpha('corPrimaria', 'selo-cor', 0.2) }],
          },
        ),
        b.noTexto('titulo', 'Título', {
          tamanho: b.fonteX(3.5, 'titulo-tamanho'),
          estilo: 'Bold',
          alinhamento: 'centro',
          preencher: true,
        }),
        b.noTexto('subtitulo', 'Subtítulo', {
          tamanho: b.fonteX(1.125, 'subtitulo-tamanho'),
          cor: b.cor('suave'),
          alinhamento: 'centro',
          preencher: true,
        }),
        b.pilha(
          'acoes',
          'Botões',
          'horizontal',
          sub
            ? [
                {
                  id: 'primario',
                  nome: 'Botão principal',
                  tipo: 'instancia',
                  instancia: {
                    componente: sub.id,
                    variante: { Estado: 'Padrão', Tipo: 'Primário' },
                    textos: { 'Texto do botão': { $var: b.idTexto('botao1') } },
                  },
                },
                {
                  id: 'secundario',
                  nome: 'Botão secundário',
                  tipo: 'instancia',
                  instancia: {
                    componente: sub.id,
                    variante: { Estado: 'Padrão', Tipo: 'Secundário' },
                    textos: { 'Texto do botão': { $var: b.idTexto('botao2') } },
                  },
                },
              ]
            : [
                b.noBotao('primario', 'botao1', 'Botão principal'),
                b.noBotao('secundario', 'botao2', 'Botão secundário', 'secundario'),
              ],
          { espaco: b.espacoX(0.75, 'acoes-gap') },
        ),
      ],
      {
        largura: 720,
        alinhar: 'centro',
        espaco: b.espaco,
        px: b.espacoX(2, 'hero-px'),
        py: b.espacoX(3, 'hero-py'),
        raio: b.raio,
        preenchimentos: [
          {
            tipo: 'gradiente-linear',
            angulo: 180,
            paradas: [
              { posicao: 0, cor: b.corAlpha('corPrimaria', 'hero-topo', 0.3) },
              { posicao: 1, cor: b.cor('fundo') },
            ],
          },
        ],
      },
    );
    return {
      html,
      css,
      estrutura,
      animacao: {
        nome: HERO.animacoes.find((a) => a.id === cfg.animacao)?.nome ?? 'Entrada',
        tecnica: 'css-keyframes',
        variaveis: ['duracao', 'easing'],
        descricao: 'Entrada com @keyframes e atraso em sequência (--i).',
        figma: 'documental',
      },
      editavel: [
        'Seção com Auto Layout centralizado: título e textos quebram linha sozinhos',
        sub
          ? `Botões são instâncias de “${sub.nome}” (Primário e Secundário, com hover e pressionar): mude o botão e o hero acompanha`
          : 'Dois botões (principal e secundário)',
      ],
      naoSuportado: ['A entrada em sequência (fica no código)'],
      subcomponentes: sub ? [sub] : undefined,
      tags: ['hero', 'landing', 'banner'],
    };
  },
};

/* ============================== Rodapé ============================== */

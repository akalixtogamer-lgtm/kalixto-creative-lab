import { DefinicaoTipo } from '../../montar';
import { REDES } from './_comum';

export const RODAPE: DefinicaoTipo = {
  id: 'rodape',
  nome: 'Rodapé',
  categoria: 'secoes',
  uso: 'site',
  descricao: 'Rodapé com marca, frase, links e direitos autorais.',
  textos: [
    { id: 'marca', rotulo: 'Marca', padrao: 'Kalixto' },
    { id: 'frase', rotulo: 'Frase', padrao: 'Dança, tecnologia e cultura no Rio de Janeiro.' },
    { id: 'direitos', rotulo: 'Direitos', padrao: '© 2026 Kalixto. Todos os direitos reservados.' },
  ],
  itens: {
    rotulo: 'Link',
    padrao: ['Sobre', 'Aulas', 'Agenda', 'Contato', 'Instagram'],
    min: 1,
    max: 8,
  },
  recursos: [
    {
      id: 'redes',
      nome: 'Redes sociais',
      descricao: 'Três ícones de redes, cada um liga/desliga e trocável no Figma.',
      padrao: true,
    },
  ],
  icones: [
    { id: 'rede1', rotulo: 'Rede 1', padrao: 'instagram', recurso: 'redes' },
    { id: 'rede2', rotulo: 'Rede 2', padrao: 'whatsapp', recurso: 'redes' },
    { id: 'rede3', rotulo: 'Rede 3', padrao: 'youtube', recurso: 'redes' },
  ],
  animacoes: [
    {
      id: 'sublinhado',
      nome: 'Sublinhado nos links',
      descricao: 'Uma linha cresce sob o link no hover.',
    },
    { id: 'cor', nome: 'Cor nos links', descricao: 'O link muda para a cor principal.' },
    { id: 'subir', nome: 'Links sobem', descricao: 'O link sobe um pouco no hover.' },
  ],
  largura: 720,
  altura: 200,
  gerar(cfg, b) {
    const C = b.C;
    const v = (n: string) => b.v(n);
    const efeito: Record<string, string> = {
      sublinhado: `.${C}__links a { background: linear-gradient(${v('primaria')}, ${v('primaria')}) left bottom / 0 2px no-repeat; transition: background-size ${v('duracao')} ${v('easing')}, color ${v('duracao')} ${v('easing')}; }
.${C}__links a:hover { background-size: 100% 2px; color: ${v('texto')}; }`,
      cor: `.${C}__links a:hover { color: ${v('primaria')}; }`,
      subir: `.${C}__links a:hover { transform: translateY(-3px); color: ${v('texto')}; }`,
    };
    const html = `<footer class="${C}">
  <div class="${C}__topo">
    <div>${b.span('marca', 'strong')}${b.span('frase', 'p')}</div>
    <nav class="${C}__links" aria-label="Rodapé">${cfg.itens.map((_, i) => b.item(i, 'a', 'href="#"')).join('')}</nav>
  </div>
  ${
    b.tem('redes')
      ? `<div class="${C}__redes">${REDES.map((r, k) => `<a href="#" aria-label="${r}">${b.svgKcx(b.nomeIcone(`rede${k + 1}`, r), `${C}__rede`, 22)}</a>`).join('')}</div>`
      : ''
  }
  ${b.span('direitos', 'small')}
</footer>`;
    const css = `.${C} { display: grid; gap: calc(${v('espaco')} * 1.5); width: 100%; max-width: 720px; padding: calc(${v('espaco')} * 2); border-radius: ${v('raio')}; background: ${v('superficie')}; }
.${C}__topo { display: flex; flex-wrap: wrap; justify-content: space-between; gap: ${v('espaco')}; }
.${C}__marca { font-size: calc(${v('fonte')} * 1.35); }
.${C}__frase { max-width: 32ch; margin: .35em 0 0; color: ${v('suave')}; }
.${C}__links { display: flex; flex-wrap: wrap; align-content: start; gap: .5em 1.25em; }
.${C}__links a { display: inline-block; color: ${v('suave')}; text-decoration: none; transition: color ${v('duracao')} ${v('easing')}, transform ${v('duracao')} ${v('easing')}; }
${efeito[cfg.animacao] ?? efeito['sublinhado']}
.${C}__redes { display: flex; gap: .75em; }
.${C}__redes a { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 50%; background: color-mix(in srgb, ${v('primaria')} 16%, transparent); color: ${v('primaria')}; transition: transform ${v('duracao')} ${v('easing')}; }
.${C}__redes a:hover { transform: translateY(-2px); }
.${C}__direitos { padding-top: ${v('espaco')}; border-top: 1px solid color-mix(in srgb, ${v('suave')} 25%, transparent); color: ${v('suave')}; }`;
    const estrutura = b.pilha(
      'rodape',
      cfg.nome,
      'vertical',
      [
        b.pilha(
          'topo',
          'Topo',
          'horizontal',
          [
            b.pilha(
              'marca-bloco',
              'Marca',
              'vertical',
              [
                b.noTexto('marca', 'Marca', {
                  tamanho: b.fonteX(1.35, 'marca-tamanho'),
                  estilo: 'Bold',
                }),
                b.noTexto('frase', 'Frase', { cor: b.cor('suave') }),
              ],
              { espaco: 6, encher: true },
            ),
            b.pilha(
              'links',
              'Links',
              'horizontal',
              cfg.itens.map((_, i) => b.noItem(i, { cor: b.cor('suave') })),
              { espaco: b.espacoX(1.25, 'links-gap') },
            ),
          ],
          { espaco: b.espaco, encher: true },
        ),
        ...(b.tem('redes')
          ? [
              b.pilha(
                'redes',
                'Redes sociais',
                'horizontal',
                REDES.map((r, k) =>
                  b.pilha(
                    `rede-${k + 1}`,
                    `Rede ${k + 1}`,
                    'horizontal',
                    [
                      b.noIcone(
                        `rede-icone-${k + 1}`,
                        'Ícone',
                        b.nomeIcone(`rede${k + 1}`, r),
                        b.cor('primaria'),
                        22,
                        { troca: `Rede ${k + 1} (trocar)` },
                      ),
                    ],
                    {
                      px: 9,
                      py: 9,
                      raio: 20,
                      preenchimentos: [
                        { tipo: 'solido', cor: b.corAlpha('corPrimaria', 'rede-fundo', 0.16) },
                      ],
                      propriedadeVisivel: `Mostrar rede ${k + 1}`,
                    },
                  ),
                ),
                { espaco: 12 },
              ),
            ]
          : []),
        b.noTexto('direitos', 'Direitos', {
          cor: b.cor('suave'),
          tamanho: b.fonteX(0.85, 'direitos-tamanho'),
          preencher: true,
        }),
      ],
      {
        largura: 720,
        espaco: b.espacoX(1.5, 'rodape-gap'),
        px: b.espacoX(2, 'rodape-px'),
        py: b.espacoX(2, 'rodape-py'),
        raio: b.raio,
        preenchimentos: [{ tipo: 'solido', cor: b.cor('superficie') }],
      },
    );
    return {
      html,
      css,
      estrutura,
      animacao: {
        nome: RODAPE.animacoes.find((a) => a.id === cfg.animacao)?.nome ?? 'Hover',
        tecnica: 'css-transition',
        variaveis: ['duracao', 'easing'],
        descricao: 'Hover dos links com transition.',
        figma: 'documental',
      },
      editavel: [
        'Links como propriedades de texto',
        'Auto Layout: a marca ocupa o espaço e os links ficam à direita',
      ],
      naoSuportado: ['O efeito de hover dos links'],
      tags: ['footer', 'rodapé'],
    };
  },
};

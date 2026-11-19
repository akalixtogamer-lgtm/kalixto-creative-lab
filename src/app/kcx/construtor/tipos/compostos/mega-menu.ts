import { DefinicaoTipo } from '../../montar';
import { interacao, mapaBool } from './_comum';

export const MEGA_MENU: DefinicaoTipo = {
  id: 'mega-menu',
  nome: 'Mega menu',
  categoria: 'navegacao',
  uso: 'site',
  descricao: 'Item do menu que abre um painel largo com colunas de links e um destaque.',
  textos: [
    { id: 'botao', rotulo: 'Item do menu', padrao: 'Aulas' },
    { id: 'destaque', rotulo: 'Destaque', padrao: 'Aula experimental grátis' },
  ],
  itens: {
    rotulo: 'Link',
    padrao: ['Samba', 'Forró', 'Zouk', 'Bolero', 'Hip hop', 'Jazz funk'],
    min: 3,
    max: 9,
  },
  animacoes: [
    { id: 'cair', nome: 'Cai suave', descricao: 'O painel desce um pouco ao abrir.' },
    { id: 'fade', nome: 'Aparecer', descricao: 'O painel aparece com fade.' },
  ],
  largura: 640,
  altura: 320,
  gerar(cfg, b) {
    const C = b.C;
    const v = (n: string) => b.v(n);
    const aberto = b.estadoAberto('aberto', 'Painel aberto', 'Mostra o painel aberto.');
    const colunas = 3;
    const porColuna = Math.ceil(cfg.itens.length / colunas);
    const grupos = Array.from({ length: colunas }, (_, k) =>
      cfg.itens.map((_, i) => i).slice(k * porColuna, (k + 1) * porColuna),
    ).filter((g) => g.length);
    const html = `<div class="${C}" data-aberto="false">
  <button class="${C}__botao" type="button" aria-expanded="false">${b.span('botao')}${b.svgKcx('baixo', `${C}__seta`, 16)}</button>
  <div class="${C}__painel">
    ${grupos.map((g) => `<ul class="${C}__coluna">${g.map((i) => `<li>${b.item(i, 'a', 'href="#"')}</li>`).join('')}</ul>`).join('\n    ')}
    <a class="${C}__destaque" href="#">${b.span('destaque')}</a>
  </div>
</div>`;
    const css = `.${C} { position: relative; display: inline-block; }
.${C}__botao { display: inline-flex; align-items: center; gap: .35em; padding: .55em .9em; border: 0; border-radius: ${v('raio')}; background: none; color: ${v('texto')}; font: inherit; font-weight: 600; cursor: pointer; }
.${C}__botao:hover, .${C}[data-aberto="true"] .${C}__botao { background: color-mix(in srgb, ${v('primaria')} 14%, transparent); }
.${C}__painel { position: absolute; top: calc(100% + 8px); left: 0; z-index: 10; display: grid; grid-template-columns: repeat(${grupos.length}, minmax(120px, 1fr)) 200px; gap: ${v('espaco')}; width: max-content; padding: ${v('espaco')}; border-radius: ${v('raio')}; background: ${v('superficie')}; box-shadow: 0 16px 40px rgb(0 0 0 / .35); opacity: 0; visibility: hidden; ${cfg.animacao === 'cair' ? 'transform: translateY(-8px);' : ''} transition: opacity ${v('duracao')} ${v('easing')}, transform ${v('duracao')} ${v('easing')}, visibility ${v('duracao')}; }
.${C}:hover .${C}__painel, .${C}:focus-within .${C}__painel, .${C}[data-aberto="true"] .${C}__painel { opacity: 1; visibility: visible; transform: none; }
.${C}__coluna { display: grid; gap: .35em; margin: 0; padding: 0; list-style: none; }
.${C}__coluna a { color: ${v('suave')}; text-decoration: none; }
.${C}__coluna a:hover { color: ${v('texto')}; }
.${C}__destaque { display: grid; place-items: end start; min-height: 120px; padding: .8em; border-radius: calc(${v('raio')} * .75); background: linear-gradient(135deg, ${v('primaria')}, ${v('superficie')}); color: #fff; font-weight: 700; text-decoration: none; }`;
    const js = `document.querySelectorAll('.${C}').forEach((r) => {
  const b = r.querySelector('.${C}__botao');
  b.addEventListener('click', () => { const s = r.getAttribute('data-aberto') !== 'true'; r.setAttribute('data-aberto', String(s)); b.setAttribute('aria-expanded', String(s)); });
  r.addEventListener('keydown', (e) => { if (e.key === 'Escape') r.setAttribute('data-aberto', 'false'); });
});`;
    const painel = b.pilha(
      'painel',
      'Painel',
      'horizontal',
      [
        ...grupos.map((g, k) =>
          b.pilha(
            `coluna${k + 1}`,
            `Coluna ${k + 1}`,
            'vertical',
            g.map((i) => b.noItem(i, { cor: b.cor('suave') })),
            { espaco: 8, larguraMin: 120 },
          ),
        ),
        b.pilha(
          'destaque',
          'Destaque',
          'vertical',
          [b.noTexto('destaque', 'Destaque', { cor: '#ffffff', estilo: 'Bold', preencher: true })],
          {
            largura: 200,
            altura: 120,
            px: 12,
            py: 12,
            alinhar: 'inicio',
            raio: b.raio,
            preenchimentos: [
              {
                tipo: 'gradiente-linear',
                angulo: 135,
                paradas: [
                  { posicao: 0, cor: b.cor('primaria') },
                  { posicao: 1, cor: b.cor('superficie') },
                ],
              },
            ],
          },
        ),
      ],
      {
        espaco: b.espaco,
        px: b.espaco,
        py: b.espaco,
        alinhar: 'inicio',
        raio: b.raio,
        preenchimentos: [{ tipo: 'solido', cor: b.cor('superficie') }],
        efeitos: [{ tipo: 'sombra', cor: '#00000059', raio: 40, y: 16 }],
        visivel: { $var: aberto },
      },
    );
    const estrutura = b.pilha(
      'mega',
      cfg.nome,
      'vertical',
      [
        b.pilha(
          'botao',
          'Item do menu',
          'horizontal',
          [
            b.noTexto('botao', 'Item do menu', { estilo: 'Semi Bold' }),
            b.noIcone(
              'seta',
              'Seta',
              mapaBool(aberto, 'seta-icone', 'cima', 'baixo'),
              b.cor('texto'),
              16,
            ),
          ],
          { espaco: 6, px: 14, py: 9, raio: b.raio },
        ),
        painel,
      ],
      { espaco: 8, px: 4, py: 4, alinhar: 'inicio' },
    );
    return {
      html,
      css,
      js,
      estrutura,
      estados: [
        {
          id: 'fechado',
          nome: 'Fechado',
          gatilho: 'padrao',
          descricao: 'Só o item do menu.',
          valores: { [aberto]: false },
        },
        {
          id: 'aberto',
          nome: 'Aberto',
          gatilho: 'hover',
          descricao: 'Painel aberto.',
          valores: { [aberto]: true },
        },
      ],
      interacoes: [
        interacao('botao', 'fechado', 'aberto', 'entrar', 200),
        interacao('mega', 'aberto', 'fechado', 'sair', 200),
        { ...interacao('mega', 'aberto', 'fechado', 'tecla', 160), tecla: 'Escape' },
      ],
      animacao: {
        nome: MEGA_MENU.animacoes.find((a) => a.id === cfg.animacao)?.nome ?? 'Abrir',
        tecnica: 'css-transition',
        variaveis: ['duracao', 'easing'],
        descricao: 'Abre no hover, no foco (teclado) e no clique; Esc fecha.',
      },
      editavel: [
        'Variantes Fechado e Aberto; passar o mouse abre (Mouse enter) e sair fecha (Mouse leave); Esc fecha',
        `Links em ${grupos.length} colunas e um destaque, todos como propriedades de texto`,
      ],
      tags: ['mega menu', 'menu', 'navegação'],
    };
  },
};

/* ============================== Botão flutuante (FAB) ============================== */

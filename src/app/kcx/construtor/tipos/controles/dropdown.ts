import { DefinicaoTipo } from '../../montar';
import { interacao, mapaBool } from './_comum';

export const DROPDOWN: DefinicaoTipo = {
  id: 'dropdown',
  nome: 'Menu suspenso',
  categoria: 'navegacao',
  uso: 'site e app',
  descricao: 'Botão que abre uma lista de opções (submenu); Esc ou clicar de novo fecha.',
  textos: [{ id: 'botao', rotulo: 'Texto do botão', padrao: 'Aulas' }],
  itens: {
    rotulo: 'Opção',
    padrao: ['Samba no pé', 'Forró', 'Dança de salão', 'Jazz funk'],
    min: 2,
    max: 8,
  },
  animacoes: [
    { id: 'cair', nome: 'Cai suave', descricao: 'A lista desce um pouco enquanto aparece.' },
    { id: 'fade', nome: 'Aparecer', descricao: 'A lista aparece com fade.' },
    { id: 'escala', nome: 'Cresce', descricao: 'A lista cresce a partir do botão.' },
  ],
  largura: 320,
  altura: 260,
  gerar(cfg, b) {
    const C = b.C;
    const v = (n: string) => b.v(n);
    const aberto = b.estadoAberto('aberto', 'Menu aberto', 'Mostra a lista aberta.');
    const fechado: Record<string, string> = {
      cair: 'transform: translateY(-8px);',
      fade: '',
      escala: 'transform: scale(.92); transform-origin: top left;',
    };
    const html = `<div class="${C}" data-aberto="false">
  <button class="${C}__botao" type="button" aria-haspopup="true" aria-expanded="false">${b.span('botao')}${b.svgKcx('baixo', `${C}__seta`, 18)}</button>
  <ul class="${C}__lista" role="menu">
    ${cfg.itens.map((_, i) => `<li role="none">${b.item(i, 'a', 'role="menuitem" href="#"')}</li>`).join('\n    ')}
  </ul>
</div>`;
    const css = `.${C} { position: relative; display: inline-block; }
.${C}__botao { display: inline-flex; align-items: center; gap: .4em; padding: .6em 1em; border: 0; border-radius: ${v('raio')}; background: ${v('superficie')}; color: ${v('texto')}; font: inherit; font-weight: 600; cursor: pointer; }
.${C}__seta { transition: transform ${v('duracao')} ${v('easing')}; }
.${C}[data-aberto="true"] .${C}__seta { transform: rotate(180deg); }
.${C}__lista { position: absolute; top: calc(100% + 6px); left: 0; z-index: 10; display: grid; min-width: 200px; margin: 0; padding: .35em; list-style: none; border-radius: ${v('raio')}; background: ${v('superficie')}; box-shadow: 0 12px 32px rgb(0 0 0 / .35); opacity: 0; visibility: hidden; ${fechado[cfg.animacao] ?? ''} transition: opacity ${v('duracao')} ${v('easing')}, transform ${v('duracao')} ${v('easing')}, visibility ${v('duracao')}; }
.${C}[data-aberto="true"] .${C}__lista { opacity: 1; visibility: visible; transform: none; }
.${C}__lista a { display: block; padding: .55em .75em; border-radius: calc(${v('raio')} * .6); color: ${v('texto')}; text-decoration: none; }
.${C}__lista a:hover, .${C}__lista a:focus-visible { background: color-mix(in srgb, ${v('primaria')} 18%, transparent); }`;
    const js = `document.querySelectorAll('.${C}').forEach((r) => {
  const b = r.querySelector('.${C}__botao');
  const definir = (sim) => { r.setAttribute('data-aberto', String(sim)); b.setAttribute('aria-expanded', String(sim)); };
  b.addEventListener('click', () => definir(r.getAttribute('data-aberto') !== 'true'));
  r.addEventListener('keydown', (e) => { if (e.key === 'Escape') { definir(false); b.focus(); } });
  document.addEventListener('click', (e) => { if (!r.contains(e.target)) definir(false); });
});`;
    const lista = b.pilha(
      'lista',
      'Lista',
      'vertical',
      cfg.itens.map((_, i) =>
        b.pilha(
          `opcao${i + 1}`,
          `Opção ${i + 1}`,
          'horizontal',
          [b.noItem(i, { preencher: true })],
          {
            px: 12,
            py: 9,
            raio: 8,
            encher: true,
          },
        ),
      ),
      {
        larguraMin: 200,
        px: 6,
        py: 6,
        espaco: 2,
        raio: b.raio,
        preenchimentos: [{ tipo: 'solido', cor: b.cor('superficie') }],
        efeitos: [{ tipo: 'sombra', cor: '#00000059', raio: 32, y: 12 }],
        visivel: { $var: aberto },
      },
    );
    const estrutura = b.pilha(
      'dropdown',
      cfg.nome,
      'vertical',
      [
        b.pilha(
          'botao',
          'Botão',
          'horizontal',
          [
            b.noTexto('botao', 'Texto do botão', { estilo: 'Semi Bold' }),
            b.noIcone(
              'seta',
              'Seta',
              mapaBool(aberto, 'seta-icone', 'cima', 'baixo'),
              b.cor('texto'),
              18,
            ),
          ],
          {
            espaco: 6,
            px: 16,
            py: 10,
            raio: b.raio,
            preenchimentos: [{ tipo: 'solido', cor: b.cor('superficie') }],
          },
        ),
        lista,
      ],
      { espaco: 6, px: 4, py: 4, alinhar: 'inicio' },
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
          descricao: 'Só o botão.',
          valores: { [aberto]: false },
        },
        {
          id: 'aberto',
          nome: 'Aberto',
          gatilho: 'active',
          descricao: 'Lista à mostra.',
          valores: { [aberto]: true },
        },
      ],
      interacoes: [
        interacao('botao', 'fechado', 'aberto', 'clique', 200),
        interacao('botao', 'aberto', 'fechado', 'clique', 200),
        ...cfg.itens.map((_, i) => interacao(`opcao${i + 1}`, 'aberto', 'fechado', 'clique', 160)),
        { ...interacao('dropdown', 'aberto', 'fechado', 'tecla', 160), tecla: 'Escape' },
      ],
      animacao: {
        nome: DROPDOWN.animacoes.find((a) => a.id === cfg.animacao)?.nome ?? 'Abrir',
        tecnica: 'css-transition',
        variaveis: ['duracao', 'easing'],
        descricao: 'data-aberto na raiz; Esc e clique fora fecham (aria-expanded acompanha).',
      },
      editavel: [
        'Variantes Fechado e Aberto; clicar no botão abre e fecha, escolher uma opção fecha, Esc fecha',
        'Opções como propriedades de texto; lista com largura mínima de 200 px',
      ],
      tags: ['dropdown', 'submenu', 'menu'],
    };
  },
};

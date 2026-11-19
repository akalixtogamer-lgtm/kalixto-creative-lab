import { KcxNo } from '../../../kcx.types';
import { DefinicaoTipo, ICONES } from '../../montar';
import { interacao } from './_comum';

export const MENU_SANDUICHE: DefinicaoTipo = {
  id: 'menu-sanduiche',
  nome: 'Menu sanduíche',
  categoria: 'navegacao',
  uso: 'app',
  descricao: 'Cabeçalho de celular com ícone que vira X e abre a lista de links.',
  textos: [
    { id: 'marca', rotulo: 'Marca', padrao: 'Kalixto' },
    { id: 'cta', rotulo: 'Botão', padrao: 'Entrar' },
  ],
  itens: { rotulo: 'Link', padrao: ['Início', 'Aulas', 'Agenda', 'Contato'], min: 2, max: 8 },
  animacoes: [
    { id: 'cortina', nome: 'Cortina', descricao: 'O menu desce como uma cortina.' },
    { id: 'escada', nome: 'Itens em sequência', descricao: 'Os links entram um depois do outro.' },
    { id: 'fade', nome: 'Aparecer', descricao: 'O menu aparece com fade.' },
  ],
  largura: 375,
  altura: 360,
  gerar(cfg, b) {
    const C = b.C;
    const v = (n: string) => b.v(n);
    const aberto = b.estadoAberto();
    const itens = cfg.itens
      .map((_, i) => b.item(i, 'a', `href="#" style="--i:${i}"`))
      .join('\n      ');
    const entrada =
      cfg.animacao === 'escada'
        ? `.${C}__painel a, .${C}__botao { opacity: 0; transform: translateY(-8px); transition: opacity ${v('duracao')} ${v('easing')}, transform ${v('duracao')} ${v('easing')}; transition-delay: calc(var(--i, ${cfg.itens.length}) * 60ms); }
.${C}[data-aberto="true"] .${C}__painel a, .${C}[data-aberto="true"] .${C}__botao { opacity: 1; transform: none; }`
        : cfg.animacao === 'fade'
          ? `.${C}__painel-in { opacity: 0; transition: opacity ${v('duracao')} ${v('easing')}; }
.${C}[data-aberto="true"] .${C}__painel-in { opacity: 1; }`
          : '';
    const html = `<div class="${C}" data-aberto="false">
  <div class="${C}__barra">
    ${b.span('marca', 'strong')}
    <button class="${C}__burger" type="button" aria-expanded="false" aria-label="Abrir menu"><span></span><span></span><span></span></button>
  </div>
  <nav class="${C}__painel" aria-label="Menu">
    <div class="${C}__painel-in">
      ${itens}
      <a class="${C}__botao" href="#" style="--i:${cfg.itens.length}">${b.span('cta')}</a>
    </div>
  </nav>
</div>`;
    const css = `.${C} { width: 100%; max-width: 375px; background: ${v('fundo')}; border-radius: ${v('raio')}; overflow: hidden; border: 1px solid color-mix(in srgb, ${v('suave')} 25%, transparent); }
.${C}__barra { display: flex; align-items: center; justify-content: space-between; padding: calc(${v('espaco')} * .75) ${v('espaco')}; }
.${C}__marca { font-size: calc(${v('fonte')} * 1.25); font-weight: 700; }
.${C}__burger { position: relative; width: 40px; height: 40px; border: 0; border-radius: calc(${v('raio')} * .75); background: color-mix(in srgb, ${v('primaria')} 14%, transparent); }
.${C}__burger span { position: absolute; left: 10px; right: 10px; height: 2px; border-radius: 2px; background: ${v('texto')}; transition: transform ${v('duracao')} ${v('easing')}, opacity ${v('duracao')} ${v('easing')}; }
.${C}__burger span:nth-child(1) { top: 13px; }
.${C}__burger span:nth-child(2) { top: 19px; }
.${C}__burger span:nth-child(3) { top: 25px; }
.${C}[data-aberto="true"] .${C}__burger span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
.${C}[data-aberto="true"] .${C}__burger span:nth-child(2) { opacity: 0; }
.${C}[data-aberto="true"] .${C}__burger span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }
.${C}__painel { display: grid; grid-template-rows: 0fr; transition: grid-template-rows ${v('duracao')} ${v('easing')}; }
.${C}[data-aberto="true"] .${C}__painel { grid-template-rows: 1fr; }
.${C}__painel-in { display: grid; gap: calc(${v('espaco')} * .25); padding: 0 ${v('espaco')}; overflow: hidden; }
.${C}[data-aberto="true"] .${C}__painel-in { padding-bottom: ${v('espaco')}; }
.${C}__painel a { padding: .55em 0; color: ${v('texto')}; font-size: calc(${v('fonte')} * 1.125); font-weight: 600; text-decoration: none; border-bottom: 1px solid color-mix(in srgb, ${v('suave')} 20%, transparent); }
.${C}__botao { margin-top: calc(${v('espaco')} * .5); padding: .7em 1em; border-radius: ${v('raio')}; background: ${v('primaria')}; color: ${v('fundo')}; font-weight: 600; text-align: center; text-decoration: none; }
${entrada}`;
    const js = `// O ícone vira X e o menu abre; Esc fecha.
document.querySelectorAll('.${C}').forEach((menu) => {
  const botao = menu.querySelector('.${C}__burger');
  const definir = (aberto) => {
    menu.setAttribute('data-aberto', String(aberto));
    botao.setAttribute('aria-expanded', String(aberto));
    botao.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
  };
  botao.addEventListener('click', () => definir(menu.getAttribute('data-aberto') !== 'true'));
  menu.addEventListener('keydown', (e) => { if (e.key === 'Escape') definir(false); });
});`;
    const estrutura: KcxNo = b.pilha(
      'menu',
      cfg.nome,
      'vertical',
      [
        b.pilha(
          'barra',
          'Barra',
          'horizontal',
          [
            b.noTexto('marca', 'Marca', {
              tamanho: b.fonteX(1.25, 'marca-tamanho'),
              estilo: 'Bold',
              preencher: true,
            }),
            { ...b.icone('burger', 'Abrir', ICONES.menu), visivel: b.nao(aberto, 'mostrar-abrir') },
            { ...b.icone('fechar', 'Fechar', ICONES.fechar), visivel: { $var: aberto } },
          ],
          { espaco: b.espaco, px: b.espaco, py: b.espacoX(0.75, 'barra-py'), encher: true },
        ),
        b.pilha(
          'painel',
          'Lista',
          'vertical',
          [
            ...cfg.itens.map((_, i) =>
              b.noItem(i, { tamanho: b.fonteX(1.125, 'item-tamanho'), estilo: 'Semi Bold' }),
            ),
            b.noBotao('botao', 'cta', 'Botão'),
          ],
          {
            espaco: b.espacoX(0.9, 'lista-gap'),
            px: b.espaco,
            py: b.espaco,
            visivel: { $var: aberto },
            encher: true,
          },
        ),
      ],
      {
        largura: 375,
        raio: b.raio,
        preenchimentos: [{ tipo: 'solido', cor: b.cor('fundo') }],
        recortar: true,
      },
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
          descricao: 'Só a barra.',
          valores: { [aberto]: false },
        },
        {
          id: 'aberto',
          nome: 'Aberto',
          gatilho: 'active',
          descricao: 'Lista de links aberta.',
          valores: { [aberto]: true },
        },
      ],
      interacoes: [
        interacao('burger', 'fechado', 'aberto'),
        interacao('fechar', 'aberto', 'fechado'),
      ],
      animacao: {
        nome: MENU_SANDUICHE.animacoes.find((a) => a.id === cfg.animacao)?.nome ?? 'Abrir menu',
        tecnica: 'css-transition',
        variaveis: ['duracao', 'easing'],
        descricao:
          'Ícone vira X com transform; a lista abre com grid-template-rows (e fade ou sequência, conforme a escolha).',
      },
      editavel: [
        'Variantes Fechado e Aberto; no protótipo, o ícone abre e o X fecha (Smart Animate)',
        'Ícones de menu e fechar como vetores editáveis',
      ],
      parcial: [
        'O desenho do X animado (as 3 linhas girando) fica no código; no Figma são dois ícones',
      ],
      tags: ['menu', 'mobile', 'hamburger'],
    };
  },
};

/* ============================== Menu lateral ============================== */

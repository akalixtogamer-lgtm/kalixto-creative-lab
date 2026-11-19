/** Tipos do construtor: navegação (navbar, menu sanduíche, menu lateral, abas, tab bar). */
import { KcxEstado, KcxInteracao, KcxNo } from '../kcx.types';
import { Blocos, DefinicaoTipo, ICONES, escHtml, svgIcone } from './montar';

const interacao = (
  no: string,
  de: string,
  para: string,
  gatilho: KcxInteracao['gatilho'] = 'clique',
): KcxInteracao => ({ no, gatilho, de, para, transicao: 'smart-animate', duracao: 320 });

/** Interações "clicar no item i leva ao estado i" a partir de todos os outros estados. */
function trocaPorIndice(prefixoNo: string, prefixoEstado: string, total: number): KcxInteracao[] {
  const r: KcxInteracao[] = [];
  for (let de = 1; de <= total; de++)
    for (let para = 1; para <= total; para++)
      if (de !== para)
        r.push(
          interacao(`${prefixoNo}${para}`, `${prefixoEstado}${de}`, `${prefixoEstado}${para}`),
        );
  return r;
}

/** Repete as regras do modo mobile para a container query e para o atributo data-vista. */
function mobile(b: Blocos, largura: number, regras: string): string {
  const escopo = (sel: string) =>
    regras.replace(/(^|\})\s*([^{}@]+)\{/g, (_, fim: string, seletores: string) => {
      const lista = seletores
        .split(',')
        .map((x) => `${sel} ${x.trim()}`)
        .join(', ');
      return `${fim}\n${lista} {`;
    });
  return `@container ${b.C} (max-width: ${largura}px) {${escopo(`.${b.C}`)}\n}\n${escopo(`.${b.C}[data-vista="true"]`)}`;
}

function textoBotao(b: Blocos, slot: string): string {
  return `<a class="${b.c('botao')}" href="#">${b.span(slot)}</a>`;
}

/* ============================== Navbar ============================== */

export const NAVBAR: DefinicaoTipo = {
  id: 'navbar',
  nome: 'Navbar',
  categoria: 'navegacao',
  uso: 'site',
  descricao:
    'Barra de navegação do site com marca, links e botão. Em telas estreitas vira menu sanduíche sozinha.',
  textos: [
    { id: 'marca', rotulo: 'Marca', padrao: 'Kalixto' },
    { id: 'cta', rotulo: 'Botão', padrao: 'Contato' },
  ],
  itens: { rotulo: 'Link', padrao: ['Início', 'Sobre', 'Serviços', 'Portfólio'], min: 2, max: 7 },
  recursos: [
    {
      id: 'ativo',
      nome: 'Página ativa',
      descricao: 'Eixo de variante com o link da página atual destacado (um por link).',
      padrao: true,
    },
  ],
  animacoes: [
    {
      id: 'sublinhado',
      nome: 'Sublinhado que cresce',
      descricao: 'Uma linha cresce sob o link no hover e marca a página atual.',
    },
    {
      id: 'pilula',
      nome: 'Pílula no hover',
      descricao: 'Um fundo arredondado aparece atrás do link.',
    },
    { id: 'brilho', nome: 'Brilho no texto', descricao: 'O link acende na cor principal.' },
  ],
  largura: 960,
  altura: 72,
  gerar(cfg, b) {
    const { C, v } = { C: b.C, v: (n: string) => b.v(n) };
    b.dim(
      'largura',
      'Largura máxima',
      960,
      320,
      1440,
      'largura',
      'Largura máxima da barra (no Figma, a largura de cada variante).',
    );
    const vista = b.extra({
      id: 'vistaMobile',
      nome: 'Ver como celular',
      tipo: 'boolean',
      padrao: false,
      descricao:
        'Força a versão de celular (menu sanduíche). No site, ela aparece sozinha abaixo de 720 px.',
      grupo: 'components',
      secao: 'comportamento',
      vinculos: [
        {
          propriedade: 'data-vista na raiz',
          alvo: { tipo: 'atributo', seletor: `.${C}`, atributo: 'data-vista' },
          transformar: [{ op: 'mapa', valores: { true: 'true', false: 'false' } }],
        },
      ],
    });
    const aberto = b.estadoAberto('aberto', 'Menu aberto', 'Mostra o menu do celular aberto.');
    const n = cfg.itens.length;
    const comAtivo = b.tem('ativo');
    const ativo = comAtivo
      ? b.extra({
          id: 'paginaAtiva',
          nome: 'Página ativa',
          tipo: 'enum',
          padrao: 'p1',
          opcoes: cfg.itens.map((t, i) => ({ valor: `p${i + 1}`, rotulo: t || `Link ${i + 1}` })),
          descricao: 'Link da página atual (destacado). No Figma é um eixo de variante.',
          grupo: 'components',
          secao: 'comportamento',
          vinculos: [
            {
              propriedade: 'data-ativo',
              alvo: { tipo: 'atributo', seletor: `.${C}`, atributo: 'data-ativo' },
            },
          ],
        })
      : undefined;
    const links = cfg.itens
      .map((_, i) =>
        b.item(i, 'a', `href="#"${i === 0 && !comAtivo ? ' aria-current="page"' : ''}`),
      )
      .join('\n      ');
    const selAtivo = comAtivo
      ? cfg.itens
          .map((_, i) => `.${C}[data-ativo="p${i + 1}"] .${C}__links a:nth-child(${i + 1})`)
          .join(', ')
      : '';
    const efeito =
      cfg.animacao === 'pilula'
        ? `.${C}__links a:hover, .${C}__links a[aria-current] { background: color-mix(in srgb, ${v('primaria')} 18%, transparent); color: ${v('texto')}; }`
        : cfg.animacao === 'brilho'
          ? `.${C}__links a:hover, .${C}__links a[aria-current] { color: ${v('primaria')}; text-shadow: 0 0 14px color-mix(in srgb, ${v('primaria')} 70%, transparent); }`
          : `.${C}__links a::after { content: ''; position: absolute; left: .7em; right: .7em; bottom: .2em; height: 2px; border-radius: 2px; background: ${v('primaria')}; transform: scaleX(0); transform-origin: left; transition: transform ${v('duracao')} ${v('easing')}; }
.${C}__links a:hover::after, .${C}__links a[aria-current]::after { transform: scaleX(1); }
.${C}__links a:hover, .${C}__links a[aria-current] { color: ${v('texto')}; }`;
    const efeitoFinal = comAtivo
      ? efeito.replaceAll(
          `.${C}__links a[aria-current]`,
          `.${C}__links a[aria-current], ${selAtivo}`,
        )
      : efeito;
    const html = `<header class="${C}" data-aberto="false" data-vista="false"${comAtivo ? ' data-ativo="p1"' : ''}>
  <div class="${C}__barra">
    ${b.span('marca', 'strong')}
    <nav class="${C}__links" aria-label="Principal">
      ${links}
    </nav>
    ${textoBotao(b, 'cta')}
    <button class="${C}__burger" type="button" aria-expanded="false" aria-label="Abrir menu">${svgIcone(ICONES.menu, `${C}__icone`)}</button>
  </div>
  <nav class="${C}__painel" aria-label="Menu do celular">
    <div class="${C}__painel-in">
      ${cfg.itens.map((_, i) => b.item(i, 'a', 'href="#"')).join('\n      ')}
    </div>
  </nav>
</header>`;
    const css = `.${C} {
  container: ${C} / inline-size;
  width: 100%;
  max-width: ${v('largura')};
  background: ${v('fundo')};
  border-radius: ${v('raio')};
  border: 1px solid color-mix(in srgb, ${v('suave')} 25%, transparent);
}
.${C}__barra { display: flex; align-items: center; gap: ${v('espaco')}; padding: calc(${v('espaco')} * .75) ${v('espaco')}; }
.${C}__marca { margin-right: auto; font-size: calc(${v('fonte')} * 1.25); font-weight: 700; }
.${C}__links { display: flex; gap: calc(${v('espaco')} * .25); }
.${C}__links a, .${C}__painel a {
  position: relative;
  padding: .45em .7em;
  border-radius: calc(${v('raio')} * .75);
  color: ${v('suave')};
  text-decoration: none;
  transition: color ${v('duracao')} ${v('easing')}, background ${v('duracao')} ${v('easing')}, text-shadow ${v('duracao')} ${v('easing')};
}
${efeitoFinal}
.${C}__botao { padding: .6em 1.1em; border-radius: ${v('raio')}; background: ${v('primaria')}; color: ${v('fundo')}; font-weight: 600; text-decoration: none; white-space: nowrap; }
.${C}__burger { display: none; padding: .3em; border: 0; background: none; }
.${C}__painel { display: none; grid-template-rows: 0fr; transition: grid-template-rows ${v('duracao')} ${v('easing')}; }
.${C}__painel-in { display: grid; gap: 2px; padding: 0 ${v('espaco')}; overflow: hidden; }
.${C}[data-aberto="true"] .${C}__painel { grid-template-rows: 1fr; }
.${C}[data-aberto="true"] .${C}__painel-in { padding-bottom: ${v('espaco')}; }
${mobile(
  b,
  720,
  `.${C}__links, .${C}__botao { display: none; }
.${C}__burger { display: inline-flex; }
.${C}__painel { display: grid; }`,
)}`;
    const js = `// Abre e fecha o menu do celular (aria-expanded acompanha).
document.querySelectorAll('.${C}').forEach((nav) => {
  const botao = nav.querySelector('.${C}__burger');
  botao.addEventListener('click', () => {
    const aberto = nav.getAttribute('data-aberto') !== 'true';
    nav.setAttribute('data-aberto', String(aberto));
    botao.setAttribute('aria-expanded', String(aberto));
    botao.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
  });
});`;
    const linksFigma = cfg.itens.map((_, i) =>
      b.noItem(i, {
        cor: ativo
          ? ({
              $derivado: ativo,
              nome: `link-${i + 1}-cor`,
              transformar: [
                {
                  op: 'variavelPorOpcao',
                  variaveis: Object.fromEntries(
                    cfg.itens.map((_, k) => [`p${k + 1}`, k === i ? 'corPrimaria' : 'corSuave']),
                  ),
                },
              ],
            } as never)
          : i === 0
            ? b.cor('texto')
            : b.cor('suave'),
        estilo: ativo ? 'Medium' : undefined,
      }),
    );
    const estrutura: KcxNo = b.pilha(
      'navbar',
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
            b.pilha('links', 'Links', 'horizontal', linksFigma, {
              espaco: b.espacoX(1.25, 'links-gap'),
              visivel: b.nao(vista, 'mostrar-links'),
            }),
            b.noBotao('botao', 'cta', 'Botão', 'primario', {
              visivel: b.nao(vista, 'mostrar-botao'),
            }),
            { ...b.icone('burger', 'Menu sanduíche', ICONES.menu), visivel: { $var: vista } },
          ],
          { espaco: b.espaco, px: b.espaco, py: b.espacoX(0.75, 'barra-py'), encher: true },
        ),
        b.pilha(
          'painel',
          'Menu do celular',
          'vertical',
          cfg.itens.map((_, i) =>
            b.noItem(i, { tamanho: b.fonteX(1.125, 'painel-tamanho'), prefixo: 'painel-item' }),
          ),
          {
            espaco: b.espacoX(0.75, 'painel-gap'),
            px: b.espaco,
            py: b.espaco,
            visivel: { $var: aberto },
            encher: true,
          },
        ),
      ],
      {
        largura: { $var: 'largura' },
        raio: b.raio,
        preenchimentos: [{ tipo: 'solido', cor: b.cor('fundo') }],
        recortar: true,
      },
    );
    const estados: KcxEstado[] = [
      {
        id: 'desktop',
        nome: 'Desktop',
        gatilho: 'padrao',
        descricao: 'Tela larga: links e botão na barra.',
        valores: { [vista]: false, [aberto]: false, largura: 960 },
      },
      {
        id: 'mobile',
        nome: 'Celular',
        gatilho: 'padrao',
        descricao: 'Tela estreita: menu sanduíche fechado.',
        valores: { [vista]: true, [aberto]: false, largura: 375 },
      },
      {
        id: 'mobile-aberto',
        nome: 'Celular aberto',
        gatilho: 'active',
        descricao: 'Menu do celular aberto.',
        valores: { [vista]: true, [aberto]: true, largura: 375 },
      },
    ];
    return {
      html,
      css,
      js,
      estrutura,
      estados,
      eixos: ativo ? [ativo] : undefined,
      interacoes: [
        // Clicar num link leva à variante com aquele link ativo.
        ...(ativo
          ? cfg.itens.map((_, i) => ({
              ...interacao(`item-${i + 1}`, 'desktop', 'desktop'),
              muda: { [ativo]: `p${i + 1}` },
            }))
          : []),
        interacao('burger', 'mobile', 'mobile-aberto'),
        interacao('burger', 'mobile-aberto', 'mobile'),
      ],
      animacao: {
        nome: NAVBAR.animacoes.find((a) => a.id === cfg.animacao)?.nome ?? 'Hover dos links',
        tecnica: 'css-transition',
        variaveis: ['duracao', 'easing', 'corPrimaria'],
        descricao:
          'Hover dos links em CSS; o menu do celular abre com grid-template-rows (0fr → 1fr).',
      },
      editavel: [
        `${n} links como propriedades de texto`,
        'Variantes Desktop, Celular e Celular aberto; no protótipo, clicar no ícone abre e fecha (Smart Animate)',
        'Largura por variável; a barra e o menu esticam juntos (Fill)',
        ...(ativo ? ['Eixo Página ativa: o link da página atual na cor principal'] : []),
      ],
      parcial: ['O efeito de hover dos links fica no código'],
      tags: ['menu', 'header', 'responsivo'],
    };
  },
};

/* ============================== Menu sanduíche ============================== */

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

export const MENU_LATERAL: DefinicaoTipo = {
  id: 'menu-lateral',
  nome: 'Menu lateral',
  categoria: 'navegacao',
  uso: 'app',
  descricao: 'Gaveta que desliza da lateral com fundo escurecido; fecha no X, no fundo ou com Esc.',
  textos: [
    { id: 'abrir', rotulo: 'Botão de abrir', padrao: 'Menu' },
    { id: 'titulo', rotulo: 'Título do menu', padrao: 'Navegação' },
  ],
  itens: {
    rotulo: 'Item',
    padrao: ['Início', 'Perfil', 'Mensagens', 'Configurações', 'Sair'],
    min: 2,
    max: 9,
  },
  animacoes: [
    { id: 'esquerda', nome: 'Desliza da esquerda', descricao: 'A gaveta entra pela esquerda.' },
    { id: 'direita', nome: 'Desliza da direita', descricao: 'A gaveta entra pela direita.' },
    {
      id: 'desfoque',
      nome: 'Esquerda com fundo desfocado',
      descricao: 'Entra pela esquerda e desfoca o que está atrás.',
    },
  ],
  largura: 375,
  altura: 560,
  gerar(cfg, b) {
    const C = b.C;
    const v = (n: string) => b.v(n);
    const aberto = b.estadoAberto();
    b.dim('largura', 'Largura da gaveta', 280, 200, 420, 'largura', 'Largura do menu lateral.');
    const direita = cfg.animacao === 'direita';
    const lado = direita
      ? 'right: 0; transform: translateX(100%);'
      : 'left: 0; transform: translateX(-100%);';
    const html = `<div class="${C}" data-aberto="false">
  <button class="${C}__gatilho" type="button" aria-expanded="false" aria-controls="${C}-gaveta">${svgIcone(ICONES.menu, `${C}__icone`, 20)}${b.span('abrir')}</button>
  <div class="${C}__fundo"></div>
  <aside class="${C}__gaveta" id="${C}-gaveta" aria-label="${escHtml(b.texto('titulo'))}">
    <div class="${C}__topo">${b.span('titulo', 'strong')}<button class="${C}__fechar" type="button" aria-label="Fechar menu">${svgIcone(ICONES.fechar, `${C}__icone`, 20)}</button></div>
    <nav class="${C}__lista">
      ${cfg.itens.map((_, i) => b.item(i, 'a', `href="#"${i === 0 ? ' aria-current="page"' : ''}`)).join('\n      ')}
    </nav>
  </aside>
</div>`;
    const css = `.${C} { position: relative; width: 100%; max-width: 375px; min-height: 480px; overflow: hidden; border-radius: ${v('raio')}; background: ${v('fundo')}; }
.${C}__gatilho { display: inline-flex; align-items: center; gap: .5em; margin: ${v('espaco')}; padding: .55em .9em; border: 0; border-radius: ${v('raio')}; background: ${v('superficie')}; }
.${C}__fundo { position: absolute; inset: 0; background: rgb(0 0 0 / .5); opacity: 0; pointer-events: none; transition: opacity ${v('duracao')} ${v('easing')}${cfg.animacao === 'desfoque' ? `, backdrop-filter ${v('duracao')} ${v('easing')}` : ''}; }
.${C}__gaveta { position: absolute; top: 0; bottom: 0; ${lado} width: min(${v('largura')}, 85%); display: flex; flex-direction: column; gap: calc(${v('espaco')} * .5); padding: ${v('espaco')}; background: ${v('superficie')}; box-shadow: 0 0 40px rgb(0 0 0 / .35); transition: transform ${v('duracao')} ${v('easing')}; }
.${C}__topo { display: flex; align-items: center; justify-content: space-between; font-size: calc(${v('fonte')} * 1.125); }
.${C}__fechar { display: inline-flex; padding: .3em; border: 0; border-radius: 50%; background: none; }
.${C}__lista { display: grid; gap: 2px; }
.${C}__lista a { padding: .65em .8em; border-radius: calc(${v('raio')} * .75); color: ${v('suave')}; text-decoration: none; transition: background ${v('duracao')} ${v('easing')}, color ${v('duracao')} ${v('easing')}; }
.${C}__lista a:hover, .${C}__lista a[aria-current] { background: color-mix(in srgb, ${v('primaria')} 18%, transparent); color: ${v('texto')}; }
.${C}[data-aberto="true"] .${C}__fundo { opacity: 1; pointer-events: auto;${cfg.animacao === 'desfoque' ? ' backdrop-filter: blur(4px);' : ''} }
.${C}[data-aberto="true"] .${C}__gaveta { transform: none; }`;
    const js = `// Abre a gaveta; fecha no X, no fundo escurecido ou com Esc.
document.querySelectorAll('.${C}').forEach((raiz) => {
  const gatilho = raiz.querySelector('.${C}__gatilho');
  const definir = (aberto) => {
    raiz.setAttribute('data-aberto', String(aberto));
    gatilho.setAttribute('aria-expanded', String(aberto));
    if (aberto) raiz.querySelector('.${C}__fechar').focus(); else gatilho.focus();
  };
  gatilho.addEventListener('click', () => definir(true));
  raiz.querySelector('.${C}__fechar').addEventListener('click', () => definir(false));
  raiz.querySelector('.${C}__fundo').addEventListener('click', () => definir(false));
  raiz.addEventListener('keydown', (e) => { if (e.key === 'Escape') definir(false); });
});`;
    const L = 375;
    const W = 280;
    const xAberto = direita ? L - W : 0;
    const xFechado = direita ? L : -W;
    const gaveta: KcxNo = b.pilha(
      'gaveta',
      'Gaveta',
      'vertical',
      [
        b.pilha(
          'topo',
          'Topo',
          'horizontal',
          [
            b.noTexto('titulo', 'Título do menu', {
              tamanho: b.fonteX(1.125, 'titulo-tamanho'),
              estilo: 'Bold',
              preencher: true,
            }),
            b.icone('fechar', 'Fechar', ICONES.fechar, 20),
          ],
          { encher: true },
        ),
        ...cfg.itens.map((_, i) =>
          b.pilha(
            `linha-${i + 1}`,
            `Item ${i + 1}`,
            'horizontal',
            [b.noItem(i, { cor: i === 0 ? b.cor('texto') : b.cor('suave'), preencher: true })],
            {
              px: b.espacoX(0.75, 'item-px'),
              py: b.espacoX(0.6, 'item-py'),
              raio: b.raio,
              encher: true,
              preenchimentos:
                i === 0
                  ? [{ tipo: 'solido', cor: b.corAlpha('corPrimaria', 'item-ativo', 0.18) }]
                  : [],
            },
          ),
        ),
      ],
      {
        largura: W,
        altura: 560,
        x: {
          $derivado: aberto,
          nome: 'gaveta-x',
          transformar: [
            { op: 'mapa', valores: { true: String(xAberto), false: String(xFechado) } },
          ],
        } as never,
        y: 0,
        espaco: b.espacoX(0.5, 'gaveta-gap'),
        px: b.espaco,
        py: b.espaco,
        preenchimentos: [{ tipo: 'solido', cor: b.cor('superficie') }],
      },
    );
    const estrutura: KcxNo = {
      id: 'tela',
      nome: cfg.nome,
      tipo: 'frame',
      largura: L,
      altura: 560,
      raio: b.raio,
      recortar: true,
      preenchimentos: [{ tipo: 'solido', cor: b.cor('fundo') }],
      filhos: [
        b.pilha(
          'gatilho',
          'Botão de abrir',
          'horizontal',
          [b.icone('icone-abrir', 'Ícone', ICONES.menu, 20), b.noTexto('abrir', 'Botão de abrir')],
          {
            x: 16,
            y: 16,
            espaco: 8,
            px: b.espacoX(0.9, 'gatilho-px'),
            py: b.espacoX(0.55, 'gatilho-py'),
            raio: b.raio,
            preenchimentos: [{ tipo: 'solido', cor: b.cor('superficie') }],
          },
        ),
        {
          id: 'fundo',
          nome: 'Fundo escurecido',
          tipo: 'retangulo',
          x: 0,
          y: 0,
          largura: L,
          altura: 560,
          preenchimentos: [{ tipo: 'solido', cor: '#00000080' }],
          visivel: { $var: aberto },
        },
        gaveta,
      ],
    };
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
          descricao: 'Gaveta fora da tela.',
          valores: { [aberto]: false },
        },
        {
          id: 'aberto',
          nome: 'Aberto',
          gatilho: 'active',
          descricao: 'Gaveta aberta sobre o fundo escurecido.',
          valores: { [aberto]: true },
        },
      ],
      interacoes: [
        interacao('gatilho', 'fechado', 'aberto'),
        interacao('fechar', 'aberto', 'fechado'),
        interacao('fundo', 'aberto', 'fechado'),
      ],
      animacao: {
        nome: MENU_LATERAL.animacoes.find((a) => a.id === cfg.animacao)?.nome ?? 'Gaveta',
        tecnica: 'css-transition',
        variaveis: ['duracao', 'easing', 'largura'],
        descricao:
          'transform translateX na gaveta e opacidade no fundo. No Figma a gaveta muda de posição entre as variantes e o Smart Animate faz o deslize.',
      },
      editavel: [
        'Variantes Fechado e Aberto: a gaveta está fora da tela no Fechado e o Smart Animate desliza de verdade',
        'Protótipo: o botão abre; o X e o fundo fecham',
      ],
      limitacoes: [
        'No Figma a largura da gaveta é fixa (280 px) para o deslize bater com a posição; no código ela segue a variável.',
      ],
      tags: ['drawer', 'sidebar', 'off-canvas'],
    };
  },
};

/* ============================== Abas ============================== */

export const ABAS: DefinicaoTipo = {
  id: 'abas',
  nome: 'Abas',
  categoria: 'navegacao',
  uso: 'site e app',
  descricao: 'Abas com indicador que desliza até a aba escolhida e troca o conteúdo.',
  textos: [],
  itens: { rotulo: 'Aba', padrao: ['Visão geral', 'Detalhes', 'Avaliações'], min: 2, max: 5 },
  animacoes: [
    {
      id: 'sublinhado',
      nome: 'Linha que desliza',
      descricao: 'Uma linha embaixo anda até a aba ativa.',
    },
    {
      id: 'pilula',
      nome: 'Pílula que desliza',
      descricao: 'Um fundo arredondado anda até a aba ativa.',
    },
    {
      id: 'fade',
      nome: 'Conteúdo com fade',
      descricao: 'Linha que desliza e o conteúdo entra com fade.',
    },
  ],
  largura: 480,
  altura: 200,
  gerar(cfg, b) {
    const C = b.C;
    const v = (n: string) => b.v(n);
    const n = cfg.itens.length;
    const ativa = b.indiceAtivo('ativa', 'Aba ativa', n, 'Qual aba aparece selecionada.');
    const paineis = cfg.itens.map((t, i) =>
      b.extra({
        id: `painel${i + 1}`,
        nome: `Conteúdo da aba ${i + 1}`,
        tipo: 'string',
        padrao: `Conteúdo de “${t}”. Troque este texto no KCX Studio ou no Figma.`,
        descricao: `Texto mostrado quando a aba ${i + 1} está ativa.`,
        grupo: 'components',
        secao: 'aparencia',
        vinculos: [
          { propriedade: 'Texto', alvo: { tipo: 'texto', seletor: `.${C}__painel-${i + 1}` } },
        ],
      }),
    );
    const pilula = cfg.animacao === 'pilula';
    const html = `<div class="${C}" data-ativa="1">
  <div class="${C}__lista" role="tablist">
    <span class="${C}__indicador" aria-hidden="true"></span>
    ${cfg.itens.map((_, i) => `<button class="${C}__aba" type="button" role="tab" id="${C}-aba-${i + 1}" aria-controls="${C}-painel-${i + 1}" aria-selected="${i === 0}" data-aba="${i + 1}">${b.item(i)}</button>`).join('\n    ')}
  </div>
  ${cfg.itens.map((_, i) => `<p class="${C}__painel ${C}__painel-${i + 1}" role="tabpanel" id="${C}-painel-${i + 1}" aria-labelledby="${C}-aba-${i + 1}" data-painel="${i + 1}"></p>`).join('\n  ')}
</div>`;
    const visiveis = cfg.itens
      .map((_, i) => `.${C}[data-ativa="${i + 1}"] [data-painel="${i + 1}"]`)
      .join(',\n');
    const css = `.${C} { width: 100%; max-width: 480px; padding: calc(${v('espaco')} * .5); border-radius: ${v('raio')}; background: ${v('superficie')}; }
.${C}__lista { position: relative; display: grid; grid-template-columns: repeat(${n}, 1fr); ${pilula ? '' : `border-bottom: 1px solid color-mix(in srgb, ${v('suave')} 25%, transparent);`} }
.${C}__aba { position: relative; z-index: 1; padding: .75em .5em; border: 0; background: none; color: ${v('suave')}; font-weight: 600; transition: color ${v('duracao')} ${v('easing')}; }
.${C}__aba[aria-selected="true"] { color: ${pilula ? v('fundo') : v('texto')}; }
.${C}__indicador { position: absolute; left: 0; width: calc(100% / ${n}); transform: translateX(calc((${v('ativa')} - 1) * 100%)); transition: transform ${v('duracao')} ${v('easing')};
  ${pilula ? `top: 4px; bottom: 4px; border-radius: ${v('raio')}; background: ${v('primaria')};` : `bottom: -1px; height: 3px; border-radius: 3px; background: ${v('primaria')};`} }
.${C}__painel { display: none; margin: 0; padding: ${v('espaco')}; color: ${v('texto')}; line-height: 1.5; }
${visiveis} { display: block;${cfg.animacao === 'fade' ? ` animation: ${C}-entra ${v('duracao')} ${v('easing')};` : ''} }
@keyframes ${C}-entra { from { opacity: 0; transform: translateY(6px); } }`;
    const js = `// Troca a aba (clique ou setas do teclado).
document.querySelectorAll('.${C}').forEach((raiz) => {
  const abas = [...raiz.querySelectorAll('[role="tab"]')];
  const ativar = (n) => {
    raiz.setAttribute('data-ativa', String(n));
    raiz.style.setProperty('${b.P}-ativa', String(n));
    abas.forEach((a, i) => { a.setAttribute('aria-selected', String(i + 1 === n)); a.tabIndex = i + 1 === n ? 0 : -1; });
  };
  abas.forEach((a, i) => {
    a.addEventListener('click', () => ativar(i + 1));
    a.addEventListener('keydown', (e) => {
      const passo = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!passo) return;
      const n = ((i + passo + abas.length) % abas.length) + 1;
      ativar(n); abas[n - 1].focus();
    });
  });
});`;
    const W = 120;
    const lista: KcxNo = {
      id: 'lista',
      nome: 'Abas',
      tipo: 'frame',
      largura: W * n,
      altura: 44,
      preenchimentos: [],
      filhos: [
        {
          id: 'indicador',
          nome: 'Indicador',
          tipo: 'retangulo',
          x: b.posicao(ativa, 'indicador-x', W, pilula ? 4 : 0),
          y: pilula ? 4 : 41,
          largura: pilula ? W - 8 : W,
          altura: pilula ? 36 : 3,
          raio: pilula ? b.raio : 2,
          preenchimentos: [{ tipo: 'solido', cor: b.cor('primaria') }],
        },
        ...cfg.itens.map((_, i): KcxNo =>
          b.pilha(
            `aba${i + 1}`,
            `Aba ${i + 1}`,
            'horizontal',
            [b.noItem(i, { estilo: 'Semi Bold' })],
            {
              x: i * W,
              y: 0,
              largura: W,
              altura: 44,
            },
          ),
        ),
      ],
    };
    const estrutura = b.pilha(
      'abas',
      cfg.nome,
      'vertical',
      [
        lista,
        ...paineis.map((id, i) => ({
          id: `painel-${i + 1}`,
          nome: `Conteúdo ${i + 1}`,
          tipo: 'texto' as const,
          visivel: b.quando(ativa, i + 1, n, `painel-${i + 1}-visivel`),
          preenchimentos: [{ tipo: 'solido' as const, cor: b.cor('texto') }],
          texto: {
            conteudo: { $var: id },
            tamanho: b.fonte,
            familia: 'Inter',
            estilo: 'Regular',
            preencher: true,
            propriedade: `Conteúdo ${i + 1}`,
          },
        })),
      ],
      {
        largura: W * n + 16,
        px: 8,
        py: 8,
        espaco: b.espaco,
        raio: b.raio,
        preenchimentos: [{ tipo: 'solido', cor: b.cor('superficie') }],
      },
    );
    return {
      html,
      css,
      js,
      estrutura,
      estados: cfg.itens.map((t, i) => ({
        id: `aba${i + 1}`,
        nome: `Aba ${i + 1}`,
        gatilho: i === 0 ? ('padrao' as const) : ('active' as const),
        descricao: `“${t}” selecionada.`,
        valores: { [ativa]: i + 1 },
      })),
      interacoes: trocaPorIndice('aba', 'aba', n),
      animacao: {
        nome: ABAS.animacoes.find((a) => a.id === cfg.animacao)?.nome ?? 'Indicador',
        tecnica: 'css-transition',
        variaveis: ['duracao', 'easing', 'ativa'],
        descricao: 'O indicador anda com translateX calculado pela aba ativa (custom property).',
      },
      editavel: [
        'Uma variante por aba; no protótipo, clicar numa aba troca a variante e o indicador desliza (Smart Animate)',
        'Nome e conteúdo de cada aba como propriedades de texto',
      ],
      limitacoes: [
        'No Figma cada aba tem largura fixa (120 px) para o indicador parar no lugar certo.',
      ],
      tags: ['tabs', 'segmented'],
    };
  },
};

/* ============================== Tab bar (app) ============================== */

const PADRAO_TABBAR = ['casa', 'busca', 'coracao', 'usuario', 'config'];

const ICONES_TABBAR = [
  ICONES.casa,
  'M 11 4 C 15 4 18 7 18 11 C 18 15 15 18 11 18 C 7 18 4 15 4 11 C 4 7 7 4 11 4 M 16 16 L 20 20',
  'M 12 20 L 4.5 12.5 C 2 10 3.5 5 7.5 5 C 9.5 5 11 6.5 12 8 C 13 6.5 14.5 5 16.5 5 C 20.5 5 22 10 19.5 12.5 Z',
  'M 12 4 C 14.2 4 16 5.8 16 8 C 16 10.2 14.2 12 12 12 C 9.8 12 8 10.2 8 8 C 8 5.8 9.8 4 12 4 M 5 20 C 5 16.5 8 14 12 14 C 16 14 19 16.5 19 20',
  'M 5 6 L 19 6 L 19 18 L 5 18 Z M 5 10 L 19 10',
];

export const TABBAR: DefinicaoTipo = {
  id: 'tabbar',
  nome: 'Tab bar de app',
  categoria: 'navegacao',
  uso: 'app',
  descricao: 'Barra inferior de aplicativo com ícones e indicador do item ativo.',
  textos: [],
  itens: { rotulo: 'Item', padrao: ['Início', 'Buscar', 'Favoritos', 'Perfil'], min: 3, max: 5 },
  recursos: [
    {
      id: 'icones',
      nome: 'Ícones trocáveis',
      descricao:
        'Cada ícone vira instância da biblioteca KCX Ícone, com troca de instância no Figma.',
      padrao: true,
    },
  ],
  icones: [
    { id: 'item1', rotulo: 'Ícone do item 1', padrao: 'casa', recurso: 'icones' },
    { id: 'item2', rotulo: 'Ícone do item 2', padrao: 'busca', recurso: 'icones' },
    { id: 'item3', rotulo: 'Ícone do item 3', padrao: 'coracao', recurso: 'icones' },
    { id: 'item4', rotulo: 'Ícone do item 4', padrao: 'usuario', recurso: 'icones' },
    { id: 'item5', rotulo: 'Ícone do item 5', padrao: 'config', recurso: 'icones' },
  ],
  animacoes: [
    {
      id: 'pilula',
      nome: 'Pílula que desliza',
      descricao: 'Um fundo arredondado anda até o item ativo.',
    },
    { id: 'ponto', nome: 'Ponto embaixo', descricao: 'Um ponto anda até o item ativo.' },
    { id: 'salto', nome: 'Ícone que salta', descricao: 'O ícone ativo dá um pulinho.' },
  ],
  largura: 375,
  altura: 72,
  gerar(cfg, b) {
    const C = b.C;
    const v = (n: string) => b.v(n);
    const n = cfg.itens.length;
    const ativo = b.indiceAtivo('ativo', 'Item ativo', n, 'Qual item da barra está selecionado.');
    const ponto = cfg.animacao === 'ponto';
    const html = `<nav class="${C}" data-ativo="1" aria-label="Navegação do app">
  <span class="${C}__indicador" aria-hidden="true"></span>
  ${cfg.itens
    .map(
      (_, i) =>
        `<button class="${C}__item" type="button" data-n="${i + 1}"${i === 0 ? ' aria-current="page"' : ''}>${
          b.tem('icones')
            ? b.svgKcx(b.nomeIcone(`item${i + 1}`, PADRAO_TABBAR[i]), `${C}__icone`, 24)
            : svgIcone(ICONES_TABBAR[i % ICONES_TABBAR.length], `${C}__icone`)
        }${b.item(i)}</button>`,
    )
    .join('\n  ')}
</nav>`;
    const css = `.${C} { position: relative; display: grid; grid-template-columns: repeat(${n}, 1fr); width: 100%; max-width: 375px; padding: 8px; border-radius: ${v('raio')}; background: ${v('superficie')}; box-shadow: 0 10px 30px rgb(0 0 0 / .3); }
.${C}__item { position: relative; z-index: 1; display: grid; justify-items: center; gap: 2px; padding: 6px 0; border: 0; background: none; color: ${v('suave')}; font-size: calc(${v('fonte')} * .75); font-weight: 600; transition: color ${v('duracao')} ${v('easing')}; }
.${C}__item[aria-current] { color: ${ponto ? v('primaria') : v('texto')}; }
.${C}__indicador { position: absolute; left: 8px; width: calc((100% - 16px) / ${n}); transform: translateX(calc((${v('ativo')} - 1) * 100%)); transition: transform ${v('duracao')} ${v('easing')};
  ${ponto ? `bottom: 4px; height: 4px; background: radial-gradient(circle, ${v('primaria')} 2px, transparent 2.5px);` : `top: 8px; bottom: 8px; border-radius: ${v('raio')}; background: color-mix(in srgb, ${v('primaria')} ${cfg.animacao === 'salto' ? '0%' : '30%'}, transparent);`} }
${
  cfg.animacao === 'salto'
    ? `.${C}__item[aria-current] .${C}__icone { color: ${v('primaria')}; animation: ${C}-salto ${v('duracao')} ${v('easing')}; }
@keyframes ${C}-salto { 40% { transform: translateY(-6px) scale(1.1); } }`
    : ''
}`;
    const js = `// Marca o item tocado.
document.querySelectorAll('.${C}').forEach((barra) => {
  const itens = [...barra.querySelectorAll('.${C}__item')];
  itens.forEach((item, i) => item.addEventListener('click', () => {
    barra.setAttribute('data-ativo', String(i + 1));
    barra.style.setProperty('${b.P}-ativo', String(i + 1));
    itens.forEach((x) => x.removeAttribute('aria-current'));
    item.setAttribute('aria-current', 'page');
  }));
});`;
    const W = Math.floor(359 / n);
    const estrutura: KcxNo = {
      id: 'tabbar',
      nome: cfg.nome,
      tipo: 'frame',
      largura: 375,
      altura: 72,
      raio: b.raio,
      preenchimentos: [{ tipo: 'solido', cor: b.cor('superficie') }],
      efeitos: [{ tipo: 'sombra', cor: '#0000004d', raio: 30, y: 10 }],
      filhos: [
        ponto
          ? {
              id: 'indicador',
              nome: 'Indicador',
              tipo: 'elipse',
              x: b.posicao(ativo, 'indicador-x', W, 8 + W / 2 - 2),
              y: 62,
              largura: 4,
              altura: 4,
              preenchimentos: [{ tipo: 'solido', cor: b.cor('primaria') }],
            }
          : {
              id: 'indicador',
              nome: 'Indicador',
              tipo: 'retangulo',
              x: b.posicao(ativo, 'indicador-x', W, 8),
              y: 8,
              largura: W,
              altura: 56,
              raio: b.raio,
              preenchimentos: [
                { tipo: 'solido', cor: b.corAlpha('corPrimaria', 'indicador-cor', 0.3) },
              ],
            },
        ...cfg.itens.map((_, i): KcxNo =>
          b.pilha(
            `item${i + 1}`,
            `Item ${i + 1}`,
            'vertical',
            [
              b.tem('icones')
                ? b.noIcone(
                    `icone-${i + 1}`,
                    'Ícone',
                    b.nomeIcone(`item${i + 1}`, PADRAO_TABBAR[i]),
                    b.cor('texto'),
                    24,
                    { troca: `Ícone do item ${i + 1}` },
                  )
                : b.icone(`icone-${i + 1}`, 'Ícone', ICONES_TABBAR[i % ICONES_TABBAR.length], 24),
              b.noItem(i, { tamanho: b.fonteX(0.75, 'item-tamanho'), estilo: 'Semi Bold' }),
            ],
            {
              x: 8 + i * W,
              y: 8,
              largura: W,
              altura: 56,
              espaco: 2,
              alinhar: 'centro',
            },
          ),
        ),
      ],
    };
    return {
      html,
      css,
      js,
      estrutura,
      estados: cfg.itens.map((t, i) => ({
        id: `item${i + 1}`,
        nome: `Item ${i + 1}`,
        gatilho: i === 0 ? ('padrao' as const) : ('active' as const),
        descricao: `“${t}” ativo.`,
        valores: { [ativo]: i + 1 },
      })),
      interacoes: trocaPorIndice('item', 'item', n),
      animacao: {
        nome: TABBAR.animacoes.find((a) => a.id === cfg.animacao)?.nome ?? 'Indicador',
        tecnica: cfg.animacao === 'salto' ? 'css-keyframes' : 'css-transition',
        variaveis: ['duracao', 'easing', 'ativo'],
        descricao: 'Indicador com translateX pela posição do item ativo.',
      },
      editavel: [
        'Uma variante por item ativo; no protótipo, tocar num item troca a variante (Smart Animate)',
        'Ícones como vetores editáveis e rótulos como propriedades de texto',
      ],
      tags: ['bottom navigation', 'app', 'mobile'],
    };
  },
};

export const TIPOS_NAVEGACAO = [NAVBAR, MENU_SANDUICHE, MENU_LATERAL, ABAS, TABBAR];

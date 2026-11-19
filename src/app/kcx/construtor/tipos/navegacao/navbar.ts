import { KcxEstado, KcxNo } from '../../../kcx.types';
import { DefinicaoTipo, ICONES, svgIcone } from '../../montar';
import { interacao, mobile, textoBotao } from './_comum';

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

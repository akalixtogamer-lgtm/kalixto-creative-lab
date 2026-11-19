import { KcxNo } from '../../../kcx.types';
import { DefinicaoTipo, escHtml, ICONES, svgIcone } from '../../montar';
import { interacao } from './_comum';

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

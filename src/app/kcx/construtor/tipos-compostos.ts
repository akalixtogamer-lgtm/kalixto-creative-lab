/**
 * Tipos da Fase 3: seleção (select), controle deslizante (slider), mega menu,
 * botão flutuante (FAB), galeria em grade e login montado com instâncias.
 */
import { KcxInteracao, KcxNo, KcxRef } from '../kcx.types';
import { BOTAO } from './tipos-conteudo';
import { Blocos, DefinicaoTipo, construirComponente } from './montar';

const interacao = (
  no: string,
  de: string,
  para: string,
  gatilho: KcxInteracao['gatilho'] = 'clique',
  duracao = 240,
): KcxInteracao => ({ no, gatilho, de, para, transicao: 'smart-animate', duracao });

const mapaBool = (id: string, nome: string, sim: string, nao: string) =>
  ({
    $derivado: id,
    nome,
    transformar: [{ op: 'mapa', valores: { true: sim, false: nao } }],
  }) as never;

/* ============================== Seleção (select) ============================== */

export const SELECT: DefinicaoTipo = {
  id: 'select',
  nome: 'Seleção (select)',
  categoria: 'formularios',
  uso: 'site e app',
  descricao: 'Campo que abre a lista de opções e mostra a escolhida (com check).',
  textos: [{ id: 'rotulo', rotulo: 'Rótulo do campo', padrao: 'Estilo de dança' }],
  itens: { rotulo: 'Opção', padrao: ['Samba', 'Forró', 'Zouk', 'Bolero'], min: 2, max: 8 },
  animacoes: [
    { id: 'cair', nome: 'Lista que cai', descricao: 'A lista aparece logo abaixo do campo.' },
    { id: 'fade', nome: 'Aparecer', descricao: 'A lista aparece com fade.' },
  ],
  largura: 320,
  altura: 320,
  gerar(cfg, b) {
    const C = b.C;
    const v = (n: string) => b.v(n);
    const n = cfg.itens.length;
    const aberto = b.estadoAberto('aberto', 'Lista aberta', 'Mostra a lista aberta.');
    const escolhida = b.extra({
      id: 'escolhida',
      nome: 'Opção escolhida',
      tipo: 'enum',
      padrao: 'o1',
      opcoes: cfg.itens.map((t, i) => ({ valor: `o${i + 1}`, rotulo: t || `Opção ${i + 1}` })),
      descricao: 'Qual opção aparece no campo. No Figma é um eixo de variante.',
      grupo: 'components',
      secao: 'comportamento',
      vinculos: [
        {
          propriedade: 'data-escolhida',
          alvo: { tipo: 'atributo', seletor: `.${C}`, atributo: 'data-escolhida' },
        },
      ],
    });
    const html = `<label class="${C}" data-aberto="false" data-escolhida="o1">
  ${b.span('rotulo')}
  <select class="${C}__select">
    ${cfg.itens.map((_, i) => `<option value="o${i + 1}">${b.item(i, 'span')}</option>`).join('\n    ')}
  </select>
</label>`;
    const css = `.${C} { display: grid; gap: .4em; width: 100%; max-width: 320px; color: ${v('texto')}; }
.${C}__rotulo { font-size: .875em; color: ${v('suave')}; }
.${C}__select { appearance: none; width: 100%; padding: .75em 2.5em .75em .9em; border: 1px solid color-mix(in srgb, ${v('suave')} 45%, transparent); border-radius: ${v('raio')}; background: ${v('superficie')} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E") no-repeat right .8em center; color: inherit; font: inherit; transition: border-color ${v('duracao')} ${v('easing')}; }
.${C}__select:focus { outline: none; border-color: ${v('primaria')}; box-shadow: 0 0 0 3px color-mix(in srgb, ${v('primaria')} 30%, transparent); }`;
    const js = `document.querySelectorAll('.${C}').forEach((r) => {
  const s = r.querySelector('select');
  s.addEventListener('change', () => r.setAttribute('data-escolhida', s.value));
});`;
    const textoEscolhido: KcxRef<string> = {
      $derivado: escolhida,
      nome: 'valor-escolhido',
      transformar: [
        {
          op: 'variavelPorOpcao',
          variaveis: Object.fromEntries(cfg.itens.map((_, i) => [`o${i + 1}`, b.idItem(i)])),
        },
      ],
    } as never;
    const estrutura = b.pilha(
      'select',
      cfg.nome,
      'vertical',
      [
        b.noTexto('rotulo', 'Rótulo do campo', {
          cor: b.cor('suave'),
          tamanho: b.fonteX(0.875, 'rotulo-tamanho'),
        }),
        b.pilha(
          'campo',
          'Campo',
          'horizontal',
          [
            {
              id: 'valor',
              nome: 'Valor',
              tipo: 'texto',
              preenchimentos: [{ tipo: 'solido', cor: b.cor('texto') }],
              texto: {
                conteudo: textoEscolhido,
                tamanho: b.fonte,
                familia: 'Inter',
                estilo: 'Regular',
                preencher: true,
              },
            },
            b.noIcone(
              'seta',
              'Seta',
              mapaBool(aberto, 'seta-icone', 'cima', 'baixo'),
              b.cor('suave'),
              18,
            ),
          ],
          {
            px: 14,
            py: 11,
            espaco: 8,
            raio: b.raio,
            encher: true,
            preenchimentos: [{ tipo: 'solido', cor: b.cor('superficie') }],
            traco: {
              cor: {
                $derivado: aberto,
                nome: 'campo-borda',
                transformar: [
                  { op: 'variavelPorOpcao', variaveis: { true: 'corPrimaria', false: 'corSuave' } },
                ],
              } as never,
              espessura: 1,
            },
          },
        ),
        b.pilha(
          'lista',
          'Lista',
          'vertical',
          cfg.itens.map((_, i) =>
            b.pilha(
              `opcao${i + 1}`,
              `Opção ${i + 1}`,
              'horizontal',
              [
                b.noItem(i, { preencher: true }),
                {
                  ...b.noIcone(`ok${i + 1}`, 'Check', 'check', b.cor('primaria'), 16),
                  visivel: {
                    $derivado: escolhida,
                    nome: `ok-${i + 1}-visivel`,
                    transformar: [
                      {
                        op: 'mapa',
                        valores: Object.fromEntries(
                          cfg.itens.map((__, k) => [`o${k + 1}`, k === i ? 'true' : 'false']),
                        ),
                      },
                    ],
                  } as never,
                },
              ],
              { px: 12, py: 9, raio: 8, espaco: 8, encher: true },
            ),
          ),
          {
            px: 6,
            py: 6,
            espaco: 2,
            raio: b.raio,
            encher: true,
            preenchimentos: [{ tipo: 'solido', cor: b.cor('superficie') }],
            efeitos: [{ tipo: 'sombra', cor: '#00000059', raio: 28, y: 10 }],
            visivel: { $var: aberto },
          },
        ),
      ],
      { largura: 320, espaco: 6, px: 4, py: 4 },
    );
    const inter: KcxInteracao[] = [
      interacao('campo', 'fechado', 'aberto'),
      interacao('campo', 'aberto', 'fechado'),
      { ...interacao('select', 'aberto', 'fechado', 'tecla'), tecla: 'Escape' },
    ];
    cfg.itens.forEach((_, i) =>
      inter.push({
        ...interacao(`opcao${i + 1}`, 'aberto', 'fechado', 'clique', 180),
        muda: { [escolhida]: `o${i + 1}` },
      }),
    );
    void n;
    return {
      html,
      css,
      js,
      estrutura,
      eixos: [escolhida],
      estados: [
        {
          id: 'fechado',
          nome: 'Fechado',
          gatilho: 'padrao',
          descricao: 'Mostra a opção escolhida.',
          valores: { [aberto]: false },
        },
        {
          id: 'aberto',
          nome: 'Aberto',
          gatilho: 'active',
          descricao: 'Lista de opções aberta.',
          valores: { [aberto]: true },
        },
      ],
      interacoes: inter,
      animacao: {
        nome: SELECT.animacoes.find((a) => a.id === cfg.animacao)?.nome ?? 'Abrir',
        tecnica: 'css-transition',
        variaveis: ['duracao', 'easing'],
        descricao: 'No código é um <select> nativo (acessível, teclado e celular).',
      },
      editavel: [
        'Variantes Fechado/Aberto × Opção escolhida; clicar abre, escolher fecha e troca o valor, Esc fecha',
        'Opções como propriedades de texto; check na opção escolhida',
      ],
      parcial: ['No código a lista é a do navegador (select nativo)'],
      tags: ['select', 'form', 'dropdown'],
    };
  },
};

/* ============================== Controle deslizante (slider) ============================== */

export const SLIDER: DefinicaoTipo = {
  id: 'slider',
  nome: 'Controle deslizante',
  categoria: 'formularios',
  uso: 'site e app',
  descricao: 'Slider de valor (volume, preço, nível) com marcas de 0 a 100.',
  textos: [{ id: 'rotulo', rotulo: 'Rótulo', padrao: 'Volume' }],
  animacoes: [
    { id: 'suave', nome: 'Suave', descricao: 'A bolinha anda suave entre as marcas.' },
    { id: 'mola', nome: 'Com mola', descricao: 'A bolinha passa um pouco e volta.' },
  ],
  largura: 360,
  altura: 100,
  gerar(cfg, b) {
    const C = b.C;
    const v = (n: string) => b.v(n);
    const PASSOS = [0, 25, 50, 75, 100];
    const valor = b.extra({
      id: 'valor',
      nome: 'Valor',
      tipo: 'number',
      padrao: 50,
      min: 0,
      max: 100,
      passo: 1,
      descricao: 'Valor do slider (0 a 100).',
      grupo: 'components',
      secao: 'comportamento',
      vinculos: [{ propriedade: '--valor', alvo: { tipo: 'css-var', nome: `${b.P}-valor` } }],
    });
    const html = `<label class="${C}">
  <span class="${C}__topo">${b.span('rotulo')}<output class="${C}__saida">50</output></span>
  <input class="${C}__input" type="range" min="0" max="100" value="50">
</label>`;
    const css = `.${C} { display: grid; gap: .5em; width: 100%; max-width: 360px; color: ${v('texto')}; }
.${C}__topo { display: flex; justify-content: space-between; font-weight: 600; }
.${C}__saida { color: ${v('primaria')}; }
.${C}__input { width: 100%; accent-color: ${v('primaria')}; }`;
    const js = `document.querySelectorAll('.${C}').forEach((r) => {
  const i = r.querySelector('input'); const o = r.querySelector('output');
  i.addEventListener('input', () => { o.value = i.value; r.style.setProperty('${b.P}-valor', i.value); });
});`;
    const W = 320;
    const x = {
      $derivado: valor,
      nome: 'bola-x',
      transformar: [{ op: 'mapear', de: [0, 100], para: [0, W - 20] }],
    } as never;
    const larg = {
      $derivado: valor,
      nome: 'cheio-largura',
      transformar: [{ op: 'mapear', de: [0, 100], para: [1, W] }],
    } as never;
    const trilho: KcxNo = {
      id: 'trilho',
      nome: 'Trilho',
      tipo: 'frame',
      largura: W,
      altura: 20,
      preenchimentos: [],
      filhos: [
        {
          id: 'fundo',
          nome: 'Fundo',
          tipo: 'retangulo',
          x: 0,
          y: 8,
          largura: W,
          altura: 4,
          raio: 2,
          preenchimentos: [{ tipo: 'solido', cor: b.corAlpha('corSuave', 'trilho-fundo', 0.4) }],
        },
        {
          id: 'cheio',
          nome: 'Preenchido',
          tipo: 'retangulo',
          x: 0,
          y: 8,
          largura: larg,
          altura: 4,
          raio: 2,
          preenchimentos: [{ tipo: 'solido', cor: b.cor('primaria') }],
        },
        ...PASSOS.map((p, i): KcxNo => ({
          id: `marca${i + 1}`,
          nome: `Marca ${p}`,
          tipo: 'retangulo',
          x: Math.round((p / 100) * (W - 20)),
          y: 0,
          largura: 20,
          altura: 20,
          preenchimentos: [],
        })),
        {
          id: 'bola',
          nome: 'Bolinha',
          tipo: 'elipse',
          x,
          y: 0,
          largura: 20,
          altura: 20,
          preenchimentos: [{ tipo: 'solido', cor: '#ffffff' }],
          traco: { cor: b.cor('primaria'), espessura: 3 },
          efeitos: [{ tipo: 'sombra', cor: '#0000004d', raio: 4, y: 1 }],
        },
      ],
    };
    const estrutura = b.pilha(
      'slider',
      cfg.nome,
      'vertical',
      [
        b.pilha(
          'topo',
          'Topo',
          'horizontal',
          [
            b.noTexto('rotulo', 'Rótulo', { estilo: 'Semi Bold', preencher: true }),
            {
              id: 'saida',
              nome: 'Valor',
              tipo: 'texto',
              preenchimentos: [{ tipo: 'solido', cor: b.cor('primaria') }],
              texto: {
                conteudo: { $derivado: valor, nome: 'valor-texto', transformar: [] } as never,
                tamanho: b.fonte,
                familia: 'Inter',
                estilo: 'Bold',
              },
            },
          ],
          { espaco: 8, encher: true },
        ),
        trilho,
      ],
      { largura: W + 8, espaco: 8, px: 4, py: 4 },
    );
    const curva = cfg.animacao === 'mola' ? ('mola' as const) : undefined;
    const inter: KcxInteracao[] = [];
    PASSOS.forEach((_, de) => {
      PASSOS.forEach((__, para) => {
        if (de !== para)
          inter.push({ ...interacao(`marca${para + 1}`, `v${de}`, `v${para}`), curva });
      });
      if (de < PASSOS.length - 1)
        inter.push({ ...interacao('bola', `v${de}`, `v${de + 1}`, 'arrastar'), curva });
    });
    return {
      html,
      css,
      js,
      estrutura,
      estados: PASSOS.map((p, i) => ({
        id: `v${i}`,
        nome: `Valor ${p}`,
        gatilho: i === 2 ? ('padrao' as const) : ('active' as const),
        descricao: `Valor em ${p}.`,
        valores: { [valor]: p },
      })),
      interacoes: inter,
      animacao: {
        nome: SLIDER.animacoes.find((a) => a.id === cfg.animacao)?.nome ?? 'Suave',
        tecnica: 'css-transition',
        variaveis: ['valor'],
        descricao: 'No código é um <input type="range"> nativo; o número acompanha.',
      },
      editavel: [
        'Variantes de 0, 25, 50, 75 e 100; clicar numa marca leva a bolinha até lá e arrastar avança (Smart Animate)',
        'Rótulo como propriedade de texto',
      ],
      parcial: ['No Figma o valor anda de 25 em 25 (uma variante por marca)'],
      tags: ['slider', 'range', 'controle'],
    };
  },
};

/* ============================== Mega menu ============================== */

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

export const FAB: DefinicaoTipo = {
  id: 'fab',
  nome: 'Botão flutuante (FAB)',
  categoria: 'acoes',
  uso: 'app',
  descricao: 'Botão redondo no canto da tela que abre atalhos (speed dial).',
  textos: [],
  itens: { rotulo: 'Atalho', padrao: ['Nova aula', 'Agenda', 'Mensagem'], min: 1, max: 4 },
  icones: [
    { id: 'principal', rotulo: 'Ícone principal', padrao: 'mais' },
    { id: 'item1', rotulo: 'Ícone do atalho 1', padrao: 'editar' },
    { id: 'item2', rotulo: 'Ícone do atalho 2', padrao: 'calendario' },
    { id: 'item3', rotulo: 'Ícone do atalho 3', padrao: 'email' },
    { id: 'item4', rotulo: 'Ícone do atalho 4', padrao: 'estrela' },
  ],
  animacoes: [
    { id: 'subir', nome: 'Atalhos sobem', descricao: 'Os atalhos sobem e aparecem.' },
    { id: 'girar', nome: 'Ícone gira', descricao: 'O + gira e vira X ao abrir.' },
  ],
  largura: 360,
  altura: 420,
  gerar(cfg, b) {
    const C = b.C;
    const v = (n: string) => b.v(n);
    const aberto = b.estadoAberto('aberto', 'Atalhos abertos', 'Mostra os atalhos.');
    const ico = (i: number) =>
      b.nomeIcone(`item${i + 1}`, ['editar', 'calendario', 'email', 'estrela'][i] ?? 'mais');
    const principal = b.nomeIcone('principal', 'mais');
    const html = `<div class="${C}" data-aberto="false">
  <ul class="${C}__atalhos">
    ${cfg.itens.map((_, i) => `<li style="--i:${i}"><button type="button" class="${C}__atalho">${b.item(i, 'span')}${b.svgKcx(ico(i), `${C}__mini`, 20)}</button></li>`).join('\n    ')}
  </ul>
  <button class="${C}__fab" type="button" aria-expanded="false" aria-label="Atalhos">${b.svgKcx(principal, `${C}__icone`, 26)}</button>
</div>`;
    const css = `.${C} { position: fixed; right: 24px; bottom: 24px; display: grid; justify-items: end; gap: .75em; }
.${C}__fab { display: grid; place-items: center; width: 60px; height: 60px; border: 0; border-radius: 50%; background: ${v('primaria')}; color: ${v('fundo')}; box-shadow: 0 10px 28px color-mix(in srgb, ${v('primaria')} 55%, transparent); cursor: pointer; transition: transform ${v('duracao')} ${v('easing')}; }
.${C}__icone { transition: transform ${v('duracao')} ${v('easing')}; }
.${C}[data-aberto="true"] .${C}__icone { transform: rotate(${cfg.animacao === 'girar' ? '135deg' : '45deg'}); }
.${C}__atalhos { display: grid; justify-items: end; gap: .6em; margin: 0; padding: 0; list-style: none; }
.${C}__atalhos li { opacity: 0; transform: translateY(12px); pointer-events: none; transition: opacity ${v('duracao')} ${v('easing')}, transform ${v('duracao')} ${v('easing')}; transition-delay: calc(var(--i) * 40ms); }
.${C}[data-aberto="true"] .${C}__atalhos li { opacity: 1; transform: none; pointer-events: auto; }
.${C}__atalho { display: inline-flex; align-items: center; gap: .6em; padding: .45em .5em .45em .9em; border: 0; border-radius: 999px; background: ${v('superficie')}; color: ${v('texto')}; font: inherit; box-shadow: 0 6px 18px rgb(0 0 0 / .3); cursor: pointer; }
.${C}__mini { color: ${v('primaria')}; }`;
    const js = `document.querySelectorAll('.${C}').forEach((r) => {
  const b = r.querySelector('.${C}__fab');
  b.addEventListener('click', () => { const s = r.getAttribute('data-aberto') !== 'true'; r.setAttribute('data-aberto', String(s)); b.setAttribute('aria-expanded', String(s)); });
});`;
    const W = 360;
    const H = 420;
    const atalhos = b.pilha(
      'atalhos',
      'Atalhos',
      'vertical',
      cfg.itens.map((_, i) =>
        b.pilha(
          `atalho${i + 1}`,
          `Atalho ${i + 1}`,
          'horizontal',
          [
            b.noItem(i),
            b.noIcone(`mini${i + 1}`, 'Ícone', ico(i), b.cor('primaria'), 20, {
              troca: `Ícone do atalho ${i + 1}`,
            }),
          ],
          {
            espaco: 10,
            px: 14,
            py: 8,
            raio: 20,
            preenchimentos: [{ tipo: 'solido', cor: b.cor('superficie') }],
            efeitos: [{ tipo: 'sombra', cor: '#0000004d', raio: 18, y: 6 }],
          },
        ),
      ),
      {
        espaco: 10,
        alinhar: 'fim',
        x: W - 24 - 200,
        y: mapaBool(
          aberto,
          'atalhos-y',
          String(H - 24 - 60 - 16 - cfg.itens.length * 46),
          String(H - 24 - 60 - 16 - cfg.itens.length * 46 + 16),
        ),
        largura: 200,
        opacidade: mapaBool(aberto, 'atalhos-opacidade', '1', '0'),
      },
    );
    const fab: KcxNo = {
      id: 'fab',
      nome: 'Botão',
      tipo: 'frame',
      x: W - 24 - 60,
      y: H - 24 - 60,
      largura: 60,
      altura: 60,
      raio: 30,
      preenchimentos: [{ tipo: 'solido', cor: b.cor('primaria') }],
      efeitos: [
        { tipo: 'sombra', cor: b.corAlpha('corPrimaria', 'fab-sombra', 0.55), raio: 28, y: 10 },
      ],
      filhos: [
        {
          ...b.noIcone(
            'icone',
            'Ícone',
            mapaBool(aberto, 'fab-icone', 'fechar', principal),
            b.cor('fundo'),
            26,
          ),
          x: 17,
          y: 17,
        },
      ],
    };
    const estrutura: KcxNo = {
      id: 'tela',
      nome: cfg.nome,
      tipo: 'frame',
      largura: W,
      altura: H,
      raio: b.raio,
      recortar: true,
      preenchimentos: [{ tipo: 'solido', cor: b.cor('fundo') }],
      filhos: [atalhos, fab],
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
          descricao: 'Só o botão.',
          valores: { [aberto]: false },
        },
        {
          id: 'aberto',
          nome: 'Aberto',
          gatilho: 'active',
          descricao: 'Atalhos à mostra.',
          valores: { [aberto]: true },
        },
      ],
      interacoes: [
        interacao('fab', 'fechado', 'aberto', 'clique', 260),
        interacao('fab', 'aberto', 'fechado', 'clique', 220),
        ...cfg.itens.map((_, i) => interacao(`atalho${i + 1}`, 'aberto', 'fechado', 'clique', 200)),
      ],
      animacao: {
        nome: FAB.animacoes.find((a) => a.id === cfg.animacao)?.nome ?? 'Abrir',
        tecnica: 'css-transition',
        variaveis: ['duracao', 'easing'],
        descricao: 'position: fixed no canto; os atalhos sobem em sequência.',
      },
      editavel: [
        'Variantes Fechado e Aberto; clicar no botão abre e fecha; o + vira X',
        'Ícones trocáveis (Instance swap) e atalhos como propriedades de texto',
      ],
      limitacoes: [
        'No Figma, para o botão ficar parado ao rolar a tela, marque “Fix position when scrolling” na instância (o plugin não consegue marcar).',
      ],
      tags: ['fab', 'speed dial', 'app'],
    };
  },
};

/* ============================== Galeria em grade ============================== */

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

export const LOGIN: DefinicaoTipo = {
  id: 'login',
  nome: 'Login',
  categoria: 'formularios',
  uso: 'site e app',
  descricao: 'Tela de entrar com e-mail, senha e botão — o botão é instância do Botão.',
  textos: [
    { id: 'titulo', rotulo: 'Título', padrao: 'Entrar' },
    { id: 'email', rotulo: 'Campo de e-mail', padrao: 'Seu e-mail' },
    { id: 'senha', rotulo: 'Campo de senha', padrao: 'Sua senha' },
    { id: 'botao', rotulo: 'Botão', padrao: 'Entrar' },
    { id: 'link', rotulo: 'Link', padrao: 'Esqueci minha senha' },
  ],
  recursos: [
    {
      id: 'instancias',
      nome: 'Botão como componente',
      descricao: 'O botão vira instância de um Botão (com tipos e estados) que vai junto.',
      padrao: true,
    },
  ],
  animacoes: [
    { id: 'brilho', nome: 'Brilho no foco', descricao: 'O campo acende ao ser focado.' },
    { id: 'simples', nome: 'Simples', descricao: 'Só a borda muda no foco.' },
  ],
  largura: 380,
  altura: 420,
  gerar(cfg, b) {
    const C = b.C;
    const v = (n: string) => b.v(n);
    const sub = b.tem('instancias')
      ? construirComponente(BOTAO, {
          tipo: 'botao',
          nome: `${cfg.nome} · Botão`,
          id: `${b.id}-botao`,
          textos: { rotulo: cfg.textos['botao'] ?? 'Entrar' },
          itens: [],
          animacao: 'elevar',
          cores: cfg.cores,
          raio: cfg.raio,
          recursos: {
            tipos: true,
            tamanhos: false,
            estados: true,
            icones: false,
            carregando: true,
          },
          icones: {},
          modos: cfg.modos,
        })
      : undefined;
    const html = `<form class="${C}" novalidate>
  ${b.span('titulo', 'h2')}
  <label class="${C}__campo">${b.svgKcx('email', `${C}__icone`, 18)}<input type="email" required autocomplete="email" placeholder=" ">${b.span('email')}</label>
  <label class="${C}__campo">${b.svgKcx('cadeado', `${C}__icone`, 18)}<input type="password" required autocomplete="current-password" placeholder=" ">${b.span('senha')}</label>
  <button class="${C}__botao" type="submit">${b.span('botao')}</button>
  <a class="${C}__link" href="#">${b.span('link')}</a>
</form>`;
    const css = `.${C} { display: grid; gap: calc(${v('espaco')} * .75); width: 100%; max-width: 380px; padding: calc(${v('espaco')} * 1.5); border-radius: ${v('raio')}; background: ${v('superficie')}; color: ${v('texto')}; }
.${C}__titulo { margin: 0 0 .25em; font-size: calc(${v('fonte')} * 1.5); }
.${C}__campo { position: relative; }
.${C}__campo input { width: 100%; padding: .85em .9em .85em 2.6em; border: 1px solid color-mix(in srgb, ${v('suave')} 45%, transparent); border-radius: ${v('raio')}; background: ${v('fundo')}; color: inherit; font: inherit; outline: none; transition: border-color ${v('duracao')} ${v('easing')}, box-shadow ${v('duracao')} ${v('easing')}; }
.${C}__campo input:focus { border-color: ${v('primaria')};${cfg.animacao === 'brilho' ? ` box-shadow: 0 0 0 4px color-mix(in srgb, ${v('primaria')} 25%, transparent);` : ''} }
.${C}__campo > span { position: absolute; left: 2.65em; top: 50%; color: ${v('suave')}; transform: translateY(-50%); pointer-events: none; }
.${C}__campo input:not(:placeholder-shown) + span { opacity: 0; }
.${C}__icone { position: absolute; left: .85em; top: 50%; color: ${v('suave')}; transform: translateY(-50%); }
.${C}__botao { padding: .85em; border: 0; border-radius: ${v('raio')}; background: ${v('primaria')}; color: ${v('fundo')}; font: inherit; font-weight: 700; cursor: pointer; }
.${C}__link { justify-self: center; color: ${v('suave')}; font-size: .9em; }`;
    const js = `document.querySelectorAll('.${C}').forEach((f) => f.addEventListener('submit', (e) => { e.preventDefault(); f.reportValidity(); }));`;
    const campo = (id: string, slot: string, rotulo: string, icone: string): KcxNo =>
      b.pilha(
        id,
        rotulo,
        'horizontal',
        [
          b.noIcone(`${id}-icone`, 'Ícone', icone, b.cor('suave'), 18),
          b.noTexto(slot, rotulo, { cor: b.cor('suave'), preencher: true }),
        ],
        {
          espaco: 10,
          px: 14,
          py: 12,
          raio: b.raio,
          encher: true,
          preenchimentos: [{ tipo: 'solido', cor: b.cor('fundo') }],
          traco: { cor: b.corAlpha('corSuave', `${id}-borda`, 0.45), espessura: 1 },
        },
      );
    const botao: KcxNo = sub
      ? {
          id: 'entrar',
          nome: 'Botão',
          tipo: 'instancia',
          encher: true,
          instancia: {
            componente: sub.id,
            variante: { Estado: 'Padrão', Tipo: 'Primário' },
            textos: { 'Texto do botão': { $var: b.idTexto('botao') } },
          },
        }
      : b.noBotao('entrar', 'botao', 'Botão', 'primario', { encher: true });
    const estrutura = b.pilha(
      'login',
      cfg.nome,
      'vertical',
      [
        b.noTexto('titulo', 'Título', { tamanho: b.fonteX(1.5, 'titulo-tamanho'), estilo: 'Bold' }),
        campo('campo-email', 'email', 'Campo de e-mail', 'email'),
        campo('campo-senha', 'senha', 'Campo de senha', 'cadeado'),
        botao,
        b.noTexto('link', 'Link', { cor: b.cor('suave'), tamanho: b.fonteX(0.9, 'link-tamanho') }),
      ],
      {
        largura: 380,
        espaco: b.espacoX(0.75, 'login-gap'),
        px: b.espacoX(1.5, 'login-px'),
        py: b.espacoX(1.5, 'login-py'),
        alinhar: 'centro',
        raio: b.raio,
        preenchimentos: [{ tipo: 'solido', cor: b.cor('superficie') }],
      },
    );
    estrutura.filhos![0].texto!.preencher = true;
    return {
      html,
      css,
      js,
      estrutura,
      subcomponentes: sub ? [sub] : undefined,
      animacao: {
        nome: LOGIN.animacoes.find((a) => a.id === cfg.animacao)?.nome ?? 'Foco',
        tecnica: 'css-transition',
        variaveis: ['duracao', 'easing'],
        descricao: 'Campos nativos (e-mail e senha) com autocomplete; validação do navegador.',
        figma: 'documental',
      },
      editavel: [
        sub
          ? `O botão é instância de “${sub.nome}” (com hover, pressionar e carregando)`
          : 'Botão desenhado no próprio componente',
        'Título, campos e link como propriedades de texto',
      ],
      parcial: ['No Figma os campos não aceitam digitação (são desenho)'],
      limitacoes: ['O login não envia nada: ligue ao seu back-end.'],
      tags: ['login', 'form', 'auth'],
    };
  },
};

export const TIPOS_COMPOSTOS: DefinicaoTipo[] = [SELECT, SLIDER, MEGA_MENU, FAB, GALERIA, LOGIN];

void ((b: Blocos) => b);

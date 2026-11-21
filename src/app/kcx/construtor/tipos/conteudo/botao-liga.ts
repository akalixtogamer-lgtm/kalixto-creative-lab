import { KcxEstado, KcxInteracao, KcxNo, KcxRef } from '../../../kcx.types';
import { estadosDs } from '../../estados-ds';
import { DefinicaoTipo, escHtml } from '../../montar';
import { TAMANHOS } from './_comum';

/**
 * Botão liga/desliga (toggle button): Seguir/Seguindo, Favoritar, Silenciar…
 * Desligado = contorno; Ligado = cheio, com texto e ícone próprios.
 *
 * No código: <button aria-pressed> que alterna ao clicar. No Figma: estados
 * Desligado e Ligado (× Hover, Pressionado, Foco e Desativado), eixo Tamanho e
 * protótipo em que o clique liga e desliga (Smart Animate).
 */
export const BOTAO_LIGA: DefinicaoTipo = {
  id: 'botao-liga-desliga',
  nome: 'Botão liga/desliga',
  categoria: 'acoes',
  uso: 'site e app',
  descricao:
    'Botão que alterna entre desligado e ligado (Seguir/Seguindo, Favoritar): texto e ícone próprios em cada lado, tamanhos P/M/G e estados.',
  textos: [
    { id: 'rotulo', rotulo: 'Texto desligado', padrao: 'Seguir' },
    { id: 'rotuloLigado', rotulo: 'Texto ligado', padrao: 'Seguindo', recurso: 'textoMuda' },
  ],
  recursos: [
    { id: 'tamanhos', nome: 'Tamanhos', descricao: 'P, M e G (padding e texto).', padrao: true },
    {
      id: 'estados',
      nome: 'Estados',
      descricao: 'Hover, Pressionado, Foco e Desativado, ligado e desligado.',
      padrao: true,
    },
    {
      id: 'textoMuda',
      nome: 'Texto muda ao ligar',
      descricao: 'Um texto para cada lado (ex.: Seguir → Seguindo).',
      padrao: true,
    },
    {
      id: 'icones',
      nome: 'Ícones',
      descricao: 'Um ícone para cada lado (ex.: mais → check), trocáveis no Figma.',
      padrao: true,
    },
  ],
  icones: [
    { id: 'desligado', rotulo: 'Ícone desligado', padrao: 'mais', recurso: 'icones' },
    { id: 'ligado', rotulo: 'Ícone ligado', padrao: 'check', recurso: 'icones' },
  ],
  animacoes: [
    { id: 'preencher', nome: 'Preenche', descricao: 'A cor enche o botão suavemente ao ligar.' },
    { id: 'pop', nome: 'Pop', descricao: 'Dá um pulinho ao ligar.' },
    { id: 'girar', nome: 'Ícone gira', descricao: 'O ícone entra girando ao trocar.' },
  ],
  largura: 260,
  altura: 64,
  gerar(cfg, b) {
    const C = b.C;
    const v = (n: string) => b.v(n);
    const comTamanhos = b.tem('tamanhos');
    const comEstados = b.tem('estados');
    const comTexto = b.tem('textoMuda');
    const comIcones = b.tem('icones');
    const ds = comEstados ? estadosDs(b) : undefined;

    /* ---------- Variáveis ---------- */
    const mapaTxt = [{ op: 'mapa' as const, valores: { true: 'true', false: 'false' } }];
    const ligado = b.extra({
      id: 'ligado',
      nome: 'Ligado',
      tipo: 'boolean',
      padrao: false,
      descricao: 'Botão ligado (cheio) ou desligado (contorno). No Figma, o clique alterna.',
      grupo: 'components',
      secao: 'comportamento',
      vinculos: [
        {
          propriedade: 'data-ligado',
          alvo: { tipo: 'atributo', seletor: `.${C}`, atributo: 'data-ligado' },
          transformar: mapaTxt,
        },
        {
          propriedade: 'aria-pressed',
          alvo: { tipo: 'atributo', seletor: `.${C}`, atributo: 'aria-pressed' },
          transformar: mapaTxt,
        },
      ],
    });
    const tamanho = comTamanhos
      ? b.extra({
          id: 'tamanho',
          nome: 'Tamanho',
          tipo: 'enum',
          padrao: 'm',
          opcoes: TAMANHOS.map((t) => ({ valor: t.valor, rotulo: t.rotulo })),
          descricao: 'P, M ou G. No Figma é um eixo de variante.',
          grupo: 'dimensions',
          secao: 'aparencia',
          vinculos: [
            {
              propriedade: 'data-tamanho',
              alvo: { tipo: 'atributo', seletor: `.${C}`, atributo: 'data-tamanho' },
            },
          ],
        })
      : undefined;
    const nomeOff = b.nomeIcone('desligado', 'mais');
    const nomeOn = b.nomeIcone('ligado', 'check');

    /* ---------- Cores por lado (Figma) ---------- */
    const porLado = (nome: string, sim: string, nao: string): KcxRef<string> =>
      ({
        $derivado: ligado,
        nome,
        transformar: [{ op: 'variavelPorOpcao', variaveis: { true: sim, false: nao } }],
      }) as never;
    const fundo: KcxRef<string> = {
      $derivado: ligado,
      nome: 'liga-fundo',
      transformar: [
        { op: 'variavelPorOpcao', variaveis: { true: 'corPrimaria', false: 'corPrimaria' } },
        { op: 'alphaPorOpcao', variavel: ligado, valores: { true: 1, false: 0 } },
      ],
    } as never;
    const corTexto = porLado('liga-texto', 'corFundo', 'corPrimaria');

    /* ---------- Tamanho (Figma) ---------- */
    const porTamanho = (campo: 'px' | 'py' | 'fonte' | 'icone', nome: string): KcxRef<number> =>
      ({
        $derivado: tamanho!,
        nome,
        transformar: [
          {
            op: 'mapa',
            valores: Object.fromEntries(
              TAMANHOS.map((t) => [
                t.valor,
                String(campo === 'icone' ? Math.round(t.fonte * 1.15) : t[campo]),
              ]),
            ),
          },
        ],
      }) as never;
    const px = tamanho ? porTamanho('px', 'liga-px') : b.espacoX(1.5, 'liga-px');
    const py = tamanho ? porTamanho('py', 'liga-py') : b.espacoX(0.75, 'liga-py');
    const fonte = tamanho ? porTamanho('fonte', 'liga-fonte') : b.fonte;
    const tamIcone = tamanho ? porTamanho('icone', 'liga-icone') : 18;

    /* ---------- Código ---------- */
    const anim: Record<string, string> = {
      preencher: '',
      pop: `.${C}[data-ligado="true"] { animation: ${C}-pop calc(${v('duracao')} * 1.5) ${v('easing')}; }
@keyframes ${C}-pop { 40% { transform: scale(1.08); } }`,
      girar: `.${C}[data-ligado="true"] .${C}__icone--ligado { animation: ${C}-gira calc(${v('duracao')} * 1.5) ${v('easing')}; }
@keyframes ${C}-gira { from { transform: rotate(-180deg) scale(.4); opacity: 0; } }`,
    };
    const css = `.${C} {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: .5em;
  padding: calc(${v('espaco')} * .75) calc(${v('espaco')} * 1.5);
  border: 1.5px solid ${v('primaria')};
  border-radius: ${v('raio')};
  background: transparent;
  color: ${v('primaria')};
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: background ${v('duracao')} ${v('easing')}, color ${v('duracao')} ${v('easing')}, transform ${v('duracao')} ${v('easing')};
}
.${C}[data-ligado="true"] { background: ${v('primaria')}; color: ${v('fundo')}; }
.${C}__ligado { display: none; }
.${C}[data-ligado="true"] .${C}__ligado { display: inline; }
.${C}[data-ligado="true"] .${C}__desligado { display: none; }
.${C}__icone { flex: none; width: 1.15em; height: 1.15em; }
${anim[cfg.animacao] ?? ''}
${
  comTamanhos
    ? TAMANHOS.map(
        (t) =>
          `.${C}[data-tamanho="${t.valor}"] { padding: ${t.py}px ${t.px}px; font-size: ${t.fonte}px; }`,
      ).join('\n')
    : ''
}
${ds ? ds.css(`.${C}`, v('primaria')) : ''}`;
    const svg = (nome: string, lado: 'ligado' | 'desligado') =>
      b.svgKcx(nome, `${C}__icone ${C}__icone--${lado} ${C}__${lado}`);
    const rotuloOff = `<span class="${C}__rotulo${comTexto ? ` ${C}__desligado` : ''}">${escHtml(b.texto('rotulo'))}</span>`;
    const rotuloOn = comTexto
      ? `<span class="${C}__rotuloLigado ${C}__ligado">${escHtml(b.texto('rotuloLigado'))}</span>`
      : '';
    const html = `<button class="${C}" type="button" aria-pressed="false" data-ligado="false"${
      tamanho ? ' data-tamanho="m"' : ''
    }>${comIcones ? svg(nomeOff, 'desligado') + svg(nomeOn, 'ligado') : ''}${rotuloOff}${rotuloOn}</button>`;
    const js = `document.querySelectorAll('.${C}').forEach((bt) => {
  bt.addEventListener('click', () => {
    const on = bt.getAttribute('aria-pressed') !== 'true';
    bt.setAttribute('aria-pressed', String(on));
    bt.setAttribute('data-ligado', String(on));
  });
});`;

    /* ---------- Figma ---------- */
    const txtOff = b.noTexto('rotulo', 'Texto desligado', {
      estilo: 'Semi Bold',
      cor: corTexto,
      tamanho: fonte,
    });
    const filhos: KcxNo[] = [];
    if (comIcones)
      filhos.push(
        b.noIcone('icone-desligado', 'Ícone desligado', nomeOff, corTexto, tamIcone, {
          troca: 'Ícone desligado (trocar)',
          visivel: b.nao(ligado, 'icone-off-visivel'),
        }),
        b.noIcone('icone-ligado', 'Ícone ligado', nomeOn, corTexto, tamIcone, {
          troca: 'Ícone ligado (trocar)',
          visivel: { $var: ligado },
        }),
      );
    if (comTexto) {
      txtOff.visivel = b.nao(ligado, 'texto-off-visivel');
      const txtOn = b.noTexto('rotuloLigado', 'Texto ligado', {
        estilo: 'Semi Bold',
        cor: corTexto,
        tamanho: fonte,
      });
      txtOn.visivel = { $var: ligado };
      filhos.push(txtOff, txtOn);
    } else filhos.push(txtOff);
    const estrutura = b.pilha(
      'botao-liga',
      cfg.nome,
      'horizontal',
      ds ? [ds.noRealce(corTexto), ...filhos] : filhos,
      {
        espaco: tamanho ? 8 : b.espacoX(0.5, 'liga-espaco'),
        px,
        py,
        raio: b.raio,
        alinhar: 'centro',
        preenchimentos: [{ tipo: 'solido', cor: fundo }],
        traco: { cor: b.cor('primaria'), espessura: 1.5 },
        efeitos: ds ? [ds.efeitoAnel(b.cor('primaria'))] : undefined,
        opacidade: ds ? { $var: ds.opacidade } : undefined,
      },
    );

    /* ---------- Estados e protótipo ---------- */
    let estados: KcxEstado[];
    let interacoes: KcxInteracao[];
    const clique = (de: string, para: string): KcxInteracao => ({
      no: 'botao-liga',
      gatilho: 'clique',
      de,
      para,
      transicao: 'smart-animate',
      duracao: 220,
      ...(cfg.animacao === 'pop' ? { curva: 'mola' as const } : {}),
    });
    if (ds) {
      const off = ds.estados().map((e) => ({
        ...e,
        nome: e.id === 'padrao' ? 'Desligado' : `Desligado · ${e.nome}`,
        valores: { ...e.valores, [ligado]: false },
      }));
      const on = ds.estados().map((e) => ({
        ...e,
        id: e.id === 'padrao' ? 'ligado' : `ligado-${e.id}`,
        nome: e.id === 'padrao' ? 'Ligado' : `Ligado · ${e.nome}`,
        gatilho: e.gatilho === 'padrao' ? ('final' as const) : e.gatilho,
        descricao: `${e.descricao} (ligado)`,
        valores: { ...ds.estados()[0].valores, ...e.valores, [ligado]: true },
      }));
      estados = [...off, ...on];
      interacoes = [
        ...ds.interacoes('botao-liga'),
        ...ds.interacoes('botao-liga').map((i) => ({
          ...i,
          de: `ligado${i.de === 'padrao' ? '' : `-${i.de}`}`,
          para: `ligado-${i.para}`,
        })),
        // Clicar no hover liga/desliga (fica no hover do outro lado).
        clique('hover', 'ligado-hover'),
        clique('ligado-hover', 'hover'),
      ];
    } else {
      estados = [
        {
          id: 'padrao',
          nome: 'Desligado',
          gatilho: 'padrao',
          descricao: 'Desligado.',
          valores: { [ligado]: false },
        },
        {
          id: 'ligado',
          nome: 'Ligado',
          gatilho: 'final',
          descricao: 'Ligado.',
          valores: { [ligado]: true },
        },
      ];
      interacoes = [clique('padrao', 'ligado'), clique('ligado', 'padrao')];
    }

    return {
      html,
      css,
      js,
      estrutura,
      estados,
      interacoes,
      eixos: tamanho ? [tamanho] : [],
      animacao: {
        nome: BOTAO_LIGA.animacoes.find((a) => a.id === cfg.animacao)?.nome ?? 'Preenche',
        tecnica: cfg.animacao === 'preencher' ? 'css-transition' : 'css-keyframes',
        variaveis: ['duracao', 'easing'],
        descricao:
          'Transição de cor ao alternar (e pulinho ou giro do ícone). No Figma: o clique troca de variante com Smart Animate.',
      },
      editavel: [
        `Variantes: Estado (${ds ? 'Desligado e Ligado × Padrão, Hover, Pressionado, Foco, Desativado' : 'Desligado, Ligado'})${tamanho ? ' × Tamanho (P, M, G)' : ''}`,
        ds
          ? 'Protótipo: While hovering → Hover e On click no Hover → liga/desliga (Smart Animate)'
          : 'Protótipo: On click → liga/desliga (Smart Animate)',
        ...(comIcones ? ['Ícone de cada lado trocável (Instance swap)'] : []),
        'Auto Layout: o botão cresce com o texto',
      ],
      naoSuportado: cfg.animacao === 'preencher' ? [] : ['Pulinho e giro do ícone (só no código)'],
      tags: ['toggle', 'button', 'aria-pressed', 'design system'],
    };
  },
};

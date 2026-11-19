import { KcxNo } from '../../../kcx.types';
import { DefinicaoTipo, ICONES, svgIcone } from '../../montar';
import { interacao } from './_comum';

export const TOAST: DefinicaoTipo = {
  id: 'toast',
  nome: 'Aviso (toast)',
  categoria: 'sobreposicao',
  uso: 'site e app',
  descricao: 'Aviso que aparece no canto e some sozinho, com botão de ação.',
  textos: [
    { id: 'mostrar', rotulo: 'Botão de teste', padrao: 'Salvar' },
    { id: 'titulo', rotulo: 'Título', padrao: 'Tudo salvo!' },
    { id: 'texto', rotulo: 'Texto', padrao: 'Suas alterações foram guardadas.' },
    { id: 'acao', rotulo: 'Ação', padrao: 'Desfazer' },
  ],
  recursos: [
    {
      id: 'tipos',
      nome: 'Tipos de aviso',
      descricao: 'Sucesso, Erro, Alerta e Info: cada um com cor e ícone (eixo de variante).',
      padrao: true,
    },
    {
      id: 'atraso',
      nome: 'Some sozinho',
      descricao: 'No protótipo do Figma, o aviso volta a Oculto depois de 4 s (After delay).',
      padrao: true,
    },
  ],
  animacoes: [
    { id: 'baixo', nome: 'Sobe de baixo', descricao: 'Entra subindo pela parte de baixo.' },
    { id: 'lado', nome: 'Entra pela direita', descricao: 'Desliza da lateral direita.' },
    { id: 'pop', nome: 'Pop', descricao: 'Aparece crescendo com um pequeno salto.' },
  ],
  largura: 420,
  altura: 260,
  gerar(cfg, b) {
    const C = b.C;
    const v = (n: string) => b.v(n);
    const aberto = b.estadoAberto('visivel', 'Aviso visível', 'Mostra o aviso.');
    const comTipos = b.tem('tipos');
    const TIPOS_AVISO = [
      { valor: 'sucesso', rotulo: 'Sucesso', cor: '#2ee59d', icone: 'sucesso' },
      { valor: 'erro', rotulo: 'Erro', cor: '#ff5c7a', icone: 'erro' },
      { valor: 'alerta', rotulo: 'Alerta', cor: '#ffb547', icone: 'alerta' },
      { valor: 'info', rotulo: 'Info', cor: '#4da3ff', icone: 'info' },
    ];
    const tipoAviso = comTipos
      ? b.extra({
          id: 'tipoAviso',
          nome: 'Tipo de aviso',
          tipo: 'enum',
          padrao: 'sucesso',
          opcoes: TIPOS_AVISO.map((t) => ({ valor: t.valor, rotulo: t.rotulo })),
          descricao: 'Sucesso, Erro, Alerta ou Info. No Figma é um eixo de variante.',
          grupo: 'components',
          secao: 'aparencia',
          vinculos: [
            {
              propriedade: 'data-tipo',
              alvo: { tipo: 'atributo', seletor: `.${C}`, atributo: 'data-tipo' },
            },
          ],
        })
      : undefined;
    const corTipoVars = comTipos
      ? Object.fromEntries(
          TIPOS_AVISO.map((t) => [
            t.valor,
            b.extra({
              id: `cor${t.rotulo}`,
              nome: `Cor de ${t.rotulo.toLowerCase()}`,
              tipo: 'color',
              padrao: t.cor,
              descricao: `Cor do aviso de ${t.rotulo.toLowerCase()}.`,
              grupo: 'colors',
              secao: 'aparencia',
              vinculos: [
                { propriedade: t.valor, alvo: { tipo: 'css-var', nome: `${b.P}-${t.valor}` } },
              ],
            }),
          ]),
        )
      : {};
    const corDoTipo = (nome: string, alpha?: number) =>
      comTipos
        ? ({
            $derivado: tipoAviso!,
            nome,
            transformar: [
              { op: 'variavelPorOpcao', variaveis: corTipoVars },
              ...(alpha !== undefined ? [{ op: 'alpha', valor: alpha }] : []),
            ],
          } as never)
        : alpha !== undefined
          ? b.corAlpha('corPrimaria', nome, alpha)
          : b.cor('primaria');
    const fora: Record<string, string> = {
      baixo: 'transform: translateY(calc(100% + 24px));',
      lado: 'transform: translateX(calc(100% + 24px));',
      pop: 'transform: scale(.6); opacity: 0;',
    };
    const html = `<div class="${C}" data-visivel="false"${comTipos ? ' data-tipo="sucesso"' : ''}>
  <button class="${C}__mostrar" type="button">${b.span('mostrar')}</button>
  <div class="${C}__aviso" role="status" aria-live="polite">
    <span class="${C}__marca">${
      comTipos
        ? TIPOS_AVISO.map((t) => b.svgKcx(t.icone, `${C}__icone ${C}__icone--${t.valor}`, 18)).join(
            '',
          )
        : svgIcone(ICONES.check, `${C}__icone`, 18)
    }</span>
    <div class="${C}__msg">${b.span('titulo', 'strong')}${b.span('texto')}</div>
    <button class="${C}__botao" type="button">${b.span('acao')}</button>
    <button class="${C}__fechar" type="button" aria-label="Fechar aviso">${svgIcone(ICONES.fechar, `${C}__icone`, 16)}</button>
  </div>
</div>`;
    const css = `.${C} { position: relative; width: 100%; max-width: 420px; min-height: 240px; overflow: hidden; border-radius: ${v('raio')}; background: ${v('fundo')}; }
.${C}__mostrar { margin: ${v('espaco')}; padding: .65em 1.1em; border: 0; border-radius: ${v('raio')}; background: ${v('primaria')}; color: ${v('fundo')}; font-weight: 600; }
.${C}__aviso { position: absolute; right: ${v('espaco')}; bottom: ${v('espaco')}; left: ${v('espaco')}; display: flex; align-items: center; gap: .75em; padding: calc(${v('espaco')} * .75); border-radius: ${v('raio')}; background: ${v('superficie')}; box-shadow: 0 12px 32px rgb(0 0 0 / .35); ${fora[cfg.animacao] ?? fora['baixo']} transition: transform ${v('duracao')} ${v('easing')}, opacity ${v('duracao')} ${v('easing')}; }
.${C}[data-visivel="true"] .${C}__aviso { transform: none; opacity: 1; }
.${C}__marca { display: grid; place-items: center; flex: none; width: 32px; height: 32px; border-radius: 50%; background: color-mix(in srgb, ${v('primaria')} 25%, transparent); color: ${v('primaria')}; }
.${C}__msg { display: grid; flex: 1; gap: 2px; }
.${C}__texto { color: ${v('suave')}; font-size: .9em; }
.${C}__botao { padding: .4em .7em; border: 0; border-radius: calc(${v('raio')} * .75); background: none; color: ${v('primaria')}; font-weight: 600; }
.${C}__fechar { display: grid; place-items: center; padding: .3em; border: 0; background: none; color: ${v('suave')}; }${
      comTipos
        ? `
${TIPOS_AVISO.map(
  (
    t,
  ) => `.${C}[data-tipo="${t.valor}"] .${C}__marca { background: color-mix(in srgb, ${v(t.valor)} 22%, transparent); color: ${v(t.valor)}; }
.${C}:not([data-tipo="${t.valor}"]) .${C}__icone--${t.valor} { display: none; }`,
).join('\n')}`
        : ''
    }`;
    const js = `// Mostra o aviso e esconde depois de 4 s (o mouse em cima segura).
document.querySelectorAll('.${C}').forEach((raiz) => {
  let tempo;
  const definir = (sim) => {
    raiz.setAttribute('data-visivel', String(sim));
    clearTimeout(tempo);
    if (sim) tempo = setTimeout(() => definir(false), 4000);
  };
  raiz.querySelector('.${C}__mostrar').addEventListener('click', () => definir(true));
  raiz.querySelector('.${C}__fechar').addEventListener('click', () => definir(false));
  raiz.querySelector('.${C}__botao').addEventListener('click', () => definir(false));
  const aviso = raiz.querySelector('.${C}__aviso');
  aviso.addEventListener('mouseenter', () => clearTimeout(tempo));
  aviso.addEventListener('mouseleave', () => { if (raiz.getAttribute('data-visivel') === 'true') definir(true); });
});`;
    const W = 420;
    const H = 260;
    const yFora = cfg.animacao === 'baixo' ? H + 8 : H - 88;
    const xFora = cfg.animacao === 'lado' ? W + 8 : 16;
    const aviso: KcxNo = b.pilha(
      'aviso',
      'Aviso',
      'horizontal',
      [
        {
          id: 'marca',
          nome: 'Ícone',
          tipo: 'frame',
          largura: 32,
          altura: 32,
          raio: 16,
          preenchimentos: [{ tipo: 'solido', cor: corDoTipo('marca-fundo', 0.25) }],
          filhos: [
            comTipos
              ? {
                  ...b.noIcone(
                    'check',
                    'Ícone',
                    {
                      $derivado: tipoAviso!,
                      nome: 'aviso-icone',
                      transformar: [
                        {
                          op: 'mapa',
                          valores: Object.fromEntries(TIPOS_AVISO.map((t) => [t.valor, t.icone])),
                        },
                      ],
                    } as never,
                    corDoTipo('marca-cor'),
                    18,
                  ),
                  x: 7,
                  y: 7,
                }
              : { ...b.icone('check', 'Check', ICONES.check, 18, b.cor('primaria')), x: 7, y: 7 },
          ],
        },
        b.pilha(
          'msg',
          'Mensagem',
          'vertical',
          [
            b.noTexto('titulo', 'Título', { estilo: 'Bold', preencher: true }),
            b.noTexto('texto', 'Texto', {
              cor: b.cor('suave'),
              tamanho: b.fonteX(0.9, 'texto-tamanho'),
              preencher: true,
            }),
          ],
          { espaco: 2, encher: true },
        ),
        b.noTexto('acao', 'Ação', { cor: b.cor('primaria'), estilo: 'Semi Bold' }),
        b.icone('fechar', 'Fechar', ICONES.fechar, 16, b.cor('suave')),
      ],
      {
        x: {
          $derivado: aberto,
          nome: 'aviso-x',
          transformar: [{ op: 'mapa', valores: { true: '16', false: String(xFora) } }],
        },
        y: {
          $derivado: aberto,
          nome: 'aviso-y',
          transformar: [{ op: 'mapa', valores: { true: String(H - 88), false: String(yFora) } }],
        },
        largura: W - 32,
        espaco: b.espacoX(0.75, 'aviso-gap'),
        px: b.espacoX(0.75, 'aviso-px'),
        py: b.espacoX(0.75, 'aviso-py'),
        raio: b.raio,
        opacidade:
          cfg.animacao === 'pop'
            ? {
                $derivado: aberto,
                nome: 'aviso-opacidade',
                transformar: [{ op: 'mapa', valores: { true: '1', false: '0' } }],
              }
            : undefined,
        preenchimentos: [{ tipo: 'solido', cor: b.cor('superficie') }],
        efeitos: [{ tipo: 'sombra', cor: '#00000059', raio: 32, y: 12 }],
      },
    );
    const estrutura: KcxNo = {
      id: 'tela',
      nome: cfg.nome,
      tipo: 'frame',
      largura: W,
      altura: H,
      raio: b.raio,
      recortar: true,
      preenchimentos: [{ tipo: 'solido', cor: b.cor('fundo') }],
      filhos: [
        b.noBotao('mostrar-btn', 'mostrar', 'Botão de teste', 'primario', { x: 16, y: 16 }),
        aviso,
      ],
    };
    return {
      html,
      css,
      js,
      estrutura,
      estados: [
        {
          id: 'oculto',
          nome: 'Oculto',
          gatilho: 'padrao',
          descricao: 'Aviso fora da tela.',
          valores: { [aberto]: false },
        },
        {
          id: 'visivel',
          nome: 'Visível',
          gatilho: 'active',
          descricao: 'Aviso à mostra.',
          valores: { [aberto]: true },
        },
      ],
      eixos: tipoAviso ? [tipoAviso] : undefined,
      interacoes: [
        interacao('mostrar-btn', 'oculto', 'visivel'),
        interacao('fechar', 'visivel', 'oculto'),
        interacao('t-acao', 'visivel', 'oculto'),
        ...(b.tem('atraso')
          ? [
              {
                ...interacao('tela', 'visivel', 'oculto'),
                gatilho: 'atraso' as const,
                atraso: 4000,
              },
            ]
          : []),
      ],
      animacao: {
        nome: TOAST.animacoes.find((a) => a.id === cfg.animacao)?.nome ?? 'Entrada',
        tecnica: 'css-transition',
        variaveis: ['duracao', 'easing'],
        descricao: 'transform/opacity com transition; some sozinho depois de 4 s.',
      },
      editavel: [
        'Variantes Oculto e Visível: o aviso muda de posição e o Smart Animate faz a entrada',
        'Protótipo: o botão mostra; o X e a ação escondem',
        ...(comTipos ? ['Eixo Tipo: Sucesso, Erro, Alerta e Info, cada um com cor e ícone'] : []),
        ...(b.tem('atraso') ? ['Protótipo: depois de 4 s o aviso some sozinho (After delay)'] : []),
      ],
      naoSuportado: b.tem('atraso')
        ? []
        : ['Sumir sozinho depois de 4 s (no Figma, use “After delay” se quiser)'],
      tags: ['toast', 'snackbar', 'notificação', 'alerta'],
    };
  },
};

/* ============================== Formulário ============================== */

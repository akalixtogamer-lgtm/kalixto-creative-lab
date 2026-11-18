/** Tipos do construtor: modal, aviso (toast), formulário, hero e rodapé. */
import { KcxInteracao, KcxNo } from '../kcx.types';
import { DefinicaoTipo, ICONES, escHtml, svgIcone } from './montar';

const interacao = (no: string, de: string, para: string): KcxInteracao => ({
  no,
  gatilho: 'clique',
  de,
  para,
  transicao: 'smart-animate',
  duracao: 300,
});

/* ============================== Modal ============================== */

export const MODAL: DefinicaoTipo = {
  id: 'modal',
  nome: 'Modal (janela)',
  categoria: 'sobreposicao',
  uso: 'site e app',
  descricao:
    'Janela por cima da página com título, texto e dois botões (usa <dialog> nativo: foco e Esc já funcionam).',
  textos: [
    { id: 'abrir', rotulo: 'Botão que abre', padrao: 'Abrir janela' },
    { id: 'titulo', rotulo: 'Título', padrao: 'Confirmar inscrição?' },
    { id: 'texto', rotulo: 'Texto', padrao: 'Você vai receber o link da aula no seu e-mail.' },
    { id: 'confirmar', rotulo: 'Botão confirmar', padrao: 'Confirmar' },
    { id: 'cancelar', rotulo: 'Botão cancelar', padrao: 'Cancelar' },
  ],
  animacoes: [
    { id: 'zoom', nome: 'Zoom', descricao: 'A janela cresce do centro.' },
    { id: 'subir', nome: 'Sobe de baixo', descricao: 'A janela sobe um pouco ao aparecer.' },
    { id: 'fade', nome: 'Aparecer', descricao: 'A janela aparece com fade.' },
  ],
  largura: 480,
  altura: 360,
  gerar(cfg, b) {
    const C = b.C;
    const v = (n: string) => b.v(n);
    const aberto = b.estadoAberto('aberto', 'Janela aberta', 'Mostra a janela aberta.');
    const inicio: Record<string, string> = {
      zoom: 'opacity: 0; transform: scale(.9);',
      subir: 'opacity: 0; transform: translateY(24px);',
      fade: 'opacity: 0;',
    };
    const html = `<div class="${C}" data-aberto="false">
  <button class="${C}__abrir" type="button">${b.span('abrir')}</button>
  <dialog class="${C}__janela" aria-labelledby="${C}-titulo">
    ${b.span('titulo', 'h2', `id="${C}-titulo"`)}
    ${b.span('texto', 'p')}
    <div class="${C}__acoes">
      <button class="${C}__secundario" type="button" data-fechar>${b.span('cancelar')}</button>
      <button class="${C}__primario" type="button" data-fechar>${b.span('confirmar')}</button>
    </div>
  </dialog>
</div>`;
    const css = `.${C} { display: grid; place-items: center; min-height: 320px; }
.${C}__abrir, .${C}__primario { padding: .7em 1.2em; border: 0; border-radius: ${v('raio')}; background: ${v('primaria')}; color: ${v('fundo')}; font-weight: 600; }
.${C}__secundario { padding: .7em 1.2em; border: 1px solid color-mix(in srgb, ${v('suave')} 50%, transparent); border-radius: ${v('raio')}; background: none; }
.${C}__janela { width: min(400px, calc(100% - 32px)); padding: calc(${v('espaco')} * 1.5); border: 0; border-radius: ${v('raio')}; background: ${v('superficie')}; color: ${v('texto')}; box-shadow: 0 24px 60px rgb(0 0 0 / .45); }
.${C}__janela[open] { animation: ${C}-entra ${v('duracao')} ${v('easing')}; }
.${C}__janela::backdrop { background: rgb(0 0 0 / .55); backdrop-filter: blur(3px); }
.${C}__janela[open]::backdrop { animation: ${C}-fundo ${v('duracao')} ${v('easing')}; }
@keyframes ${C}-entra { from { ${inicio[cfg.animacao] ?? inicio['zoom']} } }
@keyframes ${C}-fundo { from { opacity: 0; } }
.${C}__titulo { margin: 0 0 .4em; font-size: calc(${v('fonte')} * 1.35); }
.${C}__texto { margin: 0; color: ${v('suave')}; line-height: 1.5; }
.${C}__acoes { display: flex; justify-content: flex-end; gap: calc(${v('espaco')} * .5); margin-top: calc(${v('espaco')} * 1.25); }`;
    const js = `// <dialog> nativo: showModal() prende o foco e Esc fecha.
document.querySelectorAll('.${C}').forEach((raiz) => {
  const janela = raiz.querySelector('.${C}__janela');
  const sincronizar = () => {
    const quer = raiz.getAttribute('data-aberto') === 'true';
    if (quer && !janela.open) janela.showModal();
    if (!quer && janela.open) janela.close();
  };
  raiz.querySelector('.${C}__abrir').addEventListener('click', () => { raiz.setAttribute('data-aberto', 'true'); sincronizar(); });
  raiz.querySelectorAll('[data-fechar]').forEach((b) => b.addEventListener('click', () => { raiz.setAttribute('data-aberto', 'false'); sincronizar(); }));
  janela.addEventListener('close', () => raiz.setAttribute('data-aberto', 'false'));
  janela.addEventListener('click', (e) => { if (e.target === janela) { raiz.setAttribute('data-aberto', 'false'); sincronizar(); } });
  new MutationObserver(sincronizar).observe(raiz, { attributes: true, attributeFilter: ['data-aberto'] });
  sincronizar();
});`;
    const W = 480;
    const H = 360;
    const janela: KcxNo = b.pilha(
      'janela',
      'Janela',
      'vertical',
      [
        b.noTexto('titulo', 'Título', {
          tamanho: b.fonteX(1.35, 'titulo-tamanho'),
          estilo: 'Bold',
          preencher: true,
        }),
        b.noTexto('texto', 'Texto', { cor: b.cor('suave'), preencher: true }),
        b.pilha(
          'acoes',
          'Ações',
          'horizontal',
          [
            b.noBotao('cancelar-btn', 'cancelar', 'Botão cancelar', 'secundario'),
            b.noBotao('confirmar-btn', 'confirmar', 'Botão confirmar'),
          ],
          { espaco: b.espacoX(0.5, 'acoes-gap') },
        ),
      ],
      {
        x: 48,
        y: {
          $derivado: aberto,
          nome: 'janela-y',
          transformar: [
            { op: 'mapa', valores: { true: '78', false: cfg.animacao === 'subir' ? '102' : '78' } },
          ],
        },
        largura: 384,
        espaco: b.espacoX(0.75, 'janela-gap'),
        px: b.espacoX(1.5, 'janela-px'),
        py: b.espacoX(1.5, 'janela-py'),
        raio: b.raio,
        visivel: { $var: aberto },
        preenchimentos: [{ tipo: 'solido', cor: b.cor('superficie') }],
        efeitos: [{ tipo: 'sombra', cor: '#00000073', raio: 60, y: 24 }],
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
        b.noBotao('abrir-btn', 'abrir', 'Botão que abre', 'primario', { x: 170, y: 156 }),
        {
          id: 'fundo',
          nome: 'Fundo escurecido',
          tipo: 'retangulo',
          x: 0,
          y: 0,
          largura: W,
          altura: H,
          visivel: { $var: aberto },
          preenchimentos: [{ tipo: 'solido', cor: '#0000008c' }],
        },
        janela,
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
          descricao: 'Só o botão.',
          valores: { [aberto]: false },
        },
        {
          id: 'aberto',
          nome: 'Aberto',
          gatilho: 'active',
          descricao: 'Janela aberta sobre o fundo escurecido.',
          valores: { [aberto]: true },
        },
      ],
      interacoes: [
        interacao('abrir-btn', 'fechado', 'aberto'),
        interacao('cancelar-btn', 'aberto', 'fechado'),
        interacao('confirmar-btn', 'aberto', 'fechado'),
        interacao('fundo', 'aberto', 'fechado'),
      ],
      animacao: {
        nome: MODAL.animacoes.find((a) => a.id === cfg.animacao)?.nome ?? 'Entrada',
        tecnica: 'css-keyframes',
        variaveis: ['duracao', 'easing'],
        descricao: '@keyframes na abertura do <dialog> e do ::backdrop.',
      },
      editavel: [
        'Variantes Fechado e Aberto; no protótipo, o botão abre e Cancelar, Confirmar ou o fundo fecham',
        'Janela com Auto Layout: cresce com o texto',
      ],
      tags: ['dialog', 'popup', 'janela'],
    };
  },
};

/* ============================== Aviso (toast) ============================== */

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
    const fora: Record<string, string> = {
      baixo: 'transform: translateY(calc(100% + 24px));',
      lado: 'transform: translateX(calc(100% + 24px));',
      pop: 'transform: scale(.6); opacity: 0;',
    };
    const html = `<div class="${C}" data-visivel="false">
  <button class="${C}__mostrar" type="button">${b.span('mostrar')}</button>
  <div class="${C}__aviso" role="status" aria-live="polite">
    <span class="${C}__marca">${svgIcone(ICONES.check, `${C}__icone`, 18)}</span>
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
.${C}__fechar { display: grid; place-items: center; padding: .3em; border: 0; background: none; color: ${v('suave')}; }`;
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
          preenchimentos: [{ tipo: 'solido', cor: b.corAlpha('corPrimaria', 'marca-fundo', 0.25) }],
          filhos: [
            { ...b.icone('check', 'Check', ICONES.check, 18, b.cor('primaria')), x: 7, y: 7 },
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
      interacoes: [
        interacao('mostrar-btn', 'oculto', 'visivel'),
        interacao('fechar', 'visivel', 'oculto'),
        interacao('t-acao', 'visivel', 'oculto'),
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
      ],
      naoSuportado: ['Sumir sozinho depois de 4 s (no Figma, use “After delay” se quiser)'],
      tags: ['toast', 'snackbar', 'notificação', 'alerta'],
    };
  },
};

/* ============================== Formulário ============================== */

export const FORMULARIO: DefinicaoTipo = {
  id: 'formulario',
  nome: 'Formulário',
  categoria: 'formularios',
  uso: 'site e app',
  descricao: 'Campo de e-mail com rótulo, botão e mensagem de erro (newsletter, login, contato).',
  textos: [
    { id: 'titulo', rotulo: 'Título', padrao: 'Receba a agenda das aulas' },
    { id: 'rotulo', rotulo: 'Rótulo do campo', padrao: 'Seu e-mail' },
    { id: 'botao', rotulo: 'Botão', padrao: 'Quero receber' },
    { id: 'erro', rotulo: 'Mensagem de erro', padrao: 'Digite um e-mail válido.' },
    { id: 'sucesso', rotulo: 'Mensagem de sucesso', padrao: 'Pronto! Confira seu e-mail.' },
  ],
  animacoes: [
    {
      id: 'flutuante',
      nome: 'Rótulo que flutua',
      descricao: 'O rótulo sobe quando a pessoa digita.',
    },
    { id: 'brilho', nome: 'Brilho no foco', descricao: 'O campo acende ao receber foco.' },
    {
      id: 'tremer',
      nome: 'Treme no erro',
      descricao: 'O campo treme quando o e-mail está errado.',
    },
  ],
  largura: 420,
  altura: 240,
  gerar(cfg, b) {
    const C = b.C;
    const v = (n: string) => b.v(n);
    const estado = b.extra({
      id: 'situacao',
      nome: 'Situação do campo',
      tipo: 'enum',
      padrao: 'padrao',
      opcoes: [
        { valor: 'padrao', rotulo: 'Padrão' },
        { valor: 'foco', rotulo: 'Foco' },
        { valor: 'erro', rotulo: 'Erro' },
        { valor: 'sucesso', rotulo: 'Sucesso' },
      ],
      descricao: 'Mostra o formulário em cada situação (no site, muda sozinho).',
      grupo: 'components',
      secao: 'comportamento',
      vinculos: [
        {
          propriedade: 'data-situacao',
          alvo: { tipo: 'atributo', seletor: `.${C}`, atributo: 'data-situacao' },
        },
      ],
    });
    const html = `<form class="${C}" data-situacao="padrao" novalidate>
  ${b.span('titulo', 'h3')}
  <div class="${C}__linha">
    <label class="${C}__campo">
      <input class="${C}__input" type="email" name="email" placeholder=" " autocomplete="email" required aria-describedby="${C}-msg">
      ${b.span('rotulo')}
    </label>
    <button class="${C}__enviar" type="submit">${b.span('botao')}</button>
  </div>
  <p class="${C}__msg" id="${C}-msg" aria-live="polite">${b.span('erro')}${b.span('sucesso')}</p>
</form>`;
    const flutuante = cfg.animacao === 'flutuante';
    const css = `.${C} { display: grid; gap: calc(${v('espaco')} * .75); width: 100%; max-width: 420px; padding: calc(${v('espaco')} * 1.25); border-radius: ${v('raio')}; background: ${v('superficie')}; }
.${C}__titulo { margin: 0; font-size: calc(${v('fonte')} * 1.25); }
.${C}__linha { display: flex; flex-wrap: wrap; gap: calc(${v('espaco')} * .5); }
.${C}__campo { position: relative; flex: 1 1 200px; }
.${C}__input { width: 100%; padding: ${flutuante ? '1.35em .9em .45em' : '.8em .9em'}; border: 1px solid color-mix(in srgb, ${v('suave')} 45%, transparent); border-radius: ${v('raio')}; background: ${v('fundo')}; color: ${v('texto')}; font: inherit; outline: none; transition: border-color ${v('duracao')} ${v('easing')}, box-shadow ${v('duracao')} ${v('easing')}; }
.${C}__rotulo { position: absolute; left: .95em; top: 50%; color: ${v('suave')}; pointer-events: none; transform: translateY(-50%); transform-origin: left; transition: transform ${v('duracao')} ${v('easing')}, color ${v('duracao')} ${v('easing')}; }
${flutuante ? `.${C}__input:focus + .${C}__rotulo, .${C}__input:not(:placeholder-shown) + .${C}__rotulo { transform: translateY(-115%) scale(.78); color: ${v('primaria')}; }` : `.${C}__input:focus + .${C}__rotulo, .${C}__input:not(:placeholder-shown) + .${C}__rotulo { opacity: 0; }`}
.${C}__input:focus, .${C}[data-situacao="foco"] .${C}__input { border-color: ${v('primaria')};${cfg.animacao === 'brilho' ? ` box-shadow: 0 0 0 4px color-mix(in srgb, ${v('primaria')} 25%, transparent), 0 0 24px color-mix(in srgb, ${v('primaria')} 35%, transparent);` : ''} }
.${C}[data-situacao="erro"] .${C}__input { border-color: #ff5c7a;${cfg.animacao === 'tremer' ? ` animation: ${C}-treme 360ms ease;` : ''} }
@keyframes ${C}-treme { 20%, 60% { transform: translateX(-6px); } 40%, 80% { transform: translateX(6px); } }
.${C}__enviar { padding: .8em 1.2em; border: 0; border-radius: ${v('raio')}; background: ${v('primaria')}; color: ${v('fundo')}; font-weight: 600; }
.${C}__msg { min-height: 1.4em; margin: 0; font-size: .9em; }
.${C}__msg > span { display: none; }
.${C}[data-situacao="erro"] .${C}__erro { display: inline; color: #ff5c7a; }
.${C}[data-situacao="sucesso"] .${C}__sucesso { display: inline; color: #3ddc97; }`;
    const js = `// Valida o e-mail no envio (não manda para lugar nenhum: ligue ao seu back-end).
document.querySelectorAll('.${C}').forEach((form) => {
  const input = form.querySelector('.${C}__input');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const ok = input.checkValidity();
    form.setAttribute('data-situacao', ok ? 'sucesso' : 'erro');
    input.setAttribute('aria-invalid', String(!ok));
    if (!ok) input.focus();
  });
  input.addEventListener('input', () => { if (form.getAttribute('data-situacao') !== 'padrao') form.setAttribute('data-situacao', 'foco'); });
});`;
    const sit = (id: string, nome: string, valor: string) =>
      ({
        $derivado: estado,
        nome,
        transformar: [
          {
            op: 'mapa',
            valores: {
              padrao: 'false',
              foco: 'false',
              erro: 'false',
              sucesso: 'false',
              [valor]: 'true',
            },
          },
        ],
      }) as never;
    const borda = {
      $derivado: estado,
      nome: 'campo-borda',
      transformar: [{ op: 'mapa', valores: { padrao: '1', foco: '2', erro: '2', sucesso: '1' } }],
    } as never;
    const estrutura = b.pilha(
      'form',
      cfg.nome,
      'vertical',
      [
        b.noTexto('titulo', 'Título', {
          tamanho: b.fonteX(1.25, 'titulo-tamanho'),
          estilo: 'Bold',
          preencher: true,
        }),
        b.pilha(
          'linha',
          'Linha',
          'horizontal',
          [
            b.pilha(
              'campo',
              'Campo',
              'horizontal',
              [b.noTexto('rotulo', 'Rótulo do campo', { cor: b.cor('suave'), preencher: true })],
              {
                px: b.espacoX(0.9, 'campo-px'),
                py: b.espacoX(0.8, 'campo-py'),
                raio: b.raio,
                encher: true,
                preenchimentos: [{ tipo: 'solido', cor: b.cor('fundo') }],
                traco: { cor: b.cor('primaria'), espessura: borda },
              },
            ),
            b.noBotao('enviar', 'botao', 'Botão'),
          ],
          { espaco: b.espacoX(0.5, 'linha-gap'), encher: true },
        ),
        {
          ...b.noTexto('erro', 'Mensagem de erro', {
            cor: '#ff5c7a',
            tamanho: b.fonteX(0.9, 'msg-tamanho'),
            preencher: true,
          }),
          visivel: sit(estado, 'erro-visivel', 'erro'),
        },
        {
          ...b.noTexto('sucesso', 'Mensagem de sucesso', {
            cor: '#3ddc97',
            tamanho: b.fonteX(0.9, 'msg-tamanho'),
            preencher: true,
          }),
          visivel: sit(estado, 'sucesso-visivel', 'sucesso'),
        },
      ],
      {
        largura: 420,
        espaco: b.espacoX(0.75, 'form-gap'),
        px: b.espacoX(1.25, 'form-px'),
        py: b.espacoX(1.25, 'form-py'),
        raio: b.raio,
        preenchimentos: [{ tipo: 'solido', cor: b.cor('superficie') }],
      },
    );
    return {
      html,
      css,
      js,
      estrutura,
      estados: [
        {
          id: 'padrao',
          nome: 'Padrão',
          gatilho: 'padrao',
          descricao: 'Campo vazio.',
          valores: { [estado]: 'padrao' },
        },
        {
          id: 'foco',
          nome: 'Foco',
          gatilho: 'focus',
          descricao: 'Campo selecionado.',
          valores: { [estado]: 'foco' },
        },
        {
          id: 'erro',
          nome: 'Erro',
          gatilho: 'active',
          descricao: 'E-mail inválido.',
          valores: { [estado]: 'erro' },
        },
        {
          id: 'sucesso',
          nome: 'Sucesso',
          gatilho: 'final',
          descricao: 'Enviado.',
          valores: { [estado]: 'sucesso' },
        },
      ],
      interacoes: [
        interacao('campo', 'padrao', 'foco'),
        interacao('enviar', 'foco', 'sucesso'),
        interacao('enviar', 'padrao', 'erro'),
        interacao('campo', 'erro', 'foco'),
      ],
      animacao: {
        nome: FORMULARIO.animacoes.find((a) => a.id === cfg.animacao)?.nome ?? 'Foco',
        tecnica: cfg.animacao === 'tremer' ? 'css-keyframes' : 'css-transition',
        variaveis: ['duracao', 'easing', 'situacao'],
        descricao:
          'Rótulo com transform no foco (:placeholder-shown), borda e mensagens por data-situacao.',
      },
      editavel: [
        'Variantes Padrão, Foco, Erro e Sucesso; no protótipo, clicar no campo e no botão percorre as situações',
        'Rótulo, botão e mensagens como propriedades de texto',
      ],
      parcial: [
        'No Figma o campo não aceita digitação (é desenho); o rótulo flutuante fica no código',
      ],
      limitacoes: [
        'O formulário valida o e-mail mas não envia para lugar nenhum: ligue ao seu back-end.',
      ],
      tags: ['form', 'input', 'newsletter', 'login'],
    };
  },
};

/* ============================== Hero ============================== */

export const HERO: DefinicaoTipo = {
  id: 'hero',
  nome: 'Hero (topo da página)',
  categoria: 'secoes',
  uso: 'site',
  descricao: 'Abertura de página com selo, título grande, texto e dois botões.',
  textos: [
    { id: 'selo', rotulo: 'Selo', padrao: 'Novas turmas' },
    { id: 'titulo', rotulo: 'Título', padrao: 'Dance do seu jeito, no seu ritmo' },
    {
      id: 'subtitulo',
      rotulo: 'Subtítulo',
      padrao: 'Aulas de samba, forró e dança de salão para todos os níveis.',
    },
    { id: 'botao1', rotulo: 'Botão principal', padrao: 'Agendar aula' },
    { id: 'botao2', rotulo: 'Botão secundário', padrao: 'Ver horários' },
  ],
  animacoes: [
    {
      id: 'subir',
      nome: 'Sobe em sequência',
      descricao: 'Selo, título, texto e botões sobem um depois do outro.',
    },
    {
      id: 'desfoque',
      nome: 'Sai do desfoque',
      descricao: 'Os elementos aparecem saindo do desfoque.',
    },
    { id: 'fade', nome: 'Aparecer', descricao: 'Tudo aparece com fade.' },
  ],
  largura: 720,
  altura: 420,
  gerar(cfg, b) {
    const C = b.C;
    const v = (n: string) => b.v(n);
    const de: Record<string, string> = {
      subir: 'opacity: 0; transform: translateY(24px);',
      desfoque: 'opacity: 0; filter: blur(12px);',
      fade: 'opacity: 0;',
    };
    const html = `<section class="${C}">
  ${b.span('selo', 'span', 'style="--i:0"')}
  ${b.span('titulo', 'h1', 'style="--i:1"')}
  ${b.span('subtitulo', 'p', 'style="--i:2"')}
  <div class="${C}__acoes" style="--i:3">
    <a class="${C}__primario" href="#">${b.span('botao1')}</a>
    <a class="${C}__secundario" href="#">${b.span('botao2')}</a>
  </div>
</section>`;
    const css = `.${C} { display: grid; justify-items: center; gap: calc(${v('espaco')} * 1); width: 100%; max-width: 720px; padding: calc(${v('espaco')} * 3) calc(${v('espaco')} * 2); border-radius: ${v('raio')}; background: radial-gradient(120% 80% at 50% 0%, color-mix(in srgb, ${v('primaria')} 30%, ${v('fundo')}), ${v('fundo')}); text-align: center; }
.${C} > * { animation: ${C}-entra calc(${v('duracao')} * 2) ${v('easing')} both; animation-delay: calc(var(--i) * ${v('duracao')} * .4); }
@keyframes ${C}-entra { from { ${de[cfg.animacao] ?? de['subir']} } }
.${C}__selo { padding: .35em .9em; border-radius: 999px; background: color-mix(in srgb, ${v('primaria')} 20%, transparent); color: ${v('primaria')}; font-size: .85em; font-weight: 600; }
.${C}__titulo { max-width: 16ch; margin: 0; font-size: clamp(calc(${v('fonte')} * 2), 6vw, calc(${v('fonte')} * 3.5)); line-height: 1.05; }
.${C}__subtitulo { max-width: 46ch; margin: 0; color: ${v('suave')}; font-size: calc(${v('fonte')} * 1.125); line-height: 1.55; }
.${C}__acoes { display: flex; flex-wrap: wrap; justify-content: center; gap: calc(${v('espaco')} * .75); margin-top: calc(${v('espaco')} * .5); }
.${C}__primario, .${C}__secundario { padding: .8em 1.4em; border-radius: ${v('raio')}; font-weight: 600; text-decoration: none; }
.${C}__primario { background: ${v('primaria')}; color: ${v('fundo')}; }
.${C}__secundario { color: ${v('texto')}; box-shadow: inset 0 0 0 1px color-mix(in srgb, ${v('suave')} 50%, transparent); }`;
    const estrutura = b.pilha(
      'hero',
      cfg.nome,
      'vertical',
      [
        b.pilha(
          'selo-fundo',
          'Selo',
          'horizontal',
          [
            b.noTexto('selo', 'Selo', {
              cor: b.cor('primaria'),
              estilo: 'Semi Bold',
              tamanho: b.fonteX(0.85, 'selo-tamanho'),
            }),
          ],
          {
            px: 14,
            py: 5,
            raio: 999,
            preenchimentos: [{ tipo: 'solido', cor: b.corAlpha('corPrimaria', 'selo-cor', 0.2) }],
          },
        ),
        b.noTexto('titulo', 'Título', {
          tamanho: b.fonteX(3.5, 'titulo-tamanho'),
          estilo: 'Bold',
          alinhamento: 'centro',
          preencher: true,
        }),
        b.noTexto('subtitulo', 'Subtítulo', {
          tamanho: b.fonteX(1.125, 'subtitulo-tamanho'),
          cor: b.cor('suave'),
          alinhamento: 'centro',
          preencher: true,
        }),
        b.pilha(
          'acoes',
          'Botões',
          'horizontal',
          [
            b.noBotao('primario', 'botao1', 'Botão principal'),
            b.noBotao('secundario', 'botao2', 'Botão secundário', 'secundario'),
          ],
          { espaco: b.espacoX(0.75, 'acoes-gap') },
        ),
      ],
      {
        largura: 720,
        alinhar: 'centro',
        espaco: b.espaco,
        px: b.espacoX(2, 'hero-px'),
        py: b.espacoX(3, 'hero-py'),
        raio: b.raio,
        preenchimentos: [
          {
            tipo: 'gradiente-linear',
            angulo: 180,
            paradas: [
              { posicao: 0, cor: b.corAlpha('corPrimaria', 'hero-topo', 0.3) },
              { posicao: 1, cor: b.cor('fundo') },
            ],
          },
        ],
      },
    );
    return {
      html,
      css,
      estrutura,
      animacao: {
        nome: HERO.animacoes.find((a) => a.id === cfg.animacao)?.nome ?? 'Entrada',
        tecnica: 'css-keyframes',
        variaveis: ['duracao', 'easing'],
        descricao: 'Entrada com @keyframes e atraso em sequência (--i).',
        figma: 'documental',
      },
      editavel: [
        'Seção com Auto Layout centralizado: título e textos quebram linha sozinhos',
        'Dois botões (principal e secundário)',
      ],
      naoSuportado: ['A entrada em sequência (fica no código)'],
      tags: ['hero', 'landing', 'banner'],
    };
  },
};

/* ============================== Rodapé ============================== */

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
  ${b.span('direitos', 'small')}
</footer>`;
    const css = `.${C} { display: grid; gap: calc(${v('espaco')} * 1.5); width: 100%; max-width: 720px; padding: calc(${v('espaco')} * 2); border-radius: ${v('raio')}; background: ${v('superficie')}; }
.${C}__topo { display: flex; flex-wrap: wrap; justify-content: space-between; gap: ${v('espaco')}; }
.${C}__marca { font-size: calc(${v('fonte')} * 1.35); }
.${C}__frase { max-width: 32ch; margin: .35em 0 0; color: ${v('suave')}; }
.${C}__links { display: flex; flex-wrap: wrap; align-content: start; gap: .5em 1.25em; }
.${C}__links a { display: inline-block; color: ${v('suave')}; text-decoration: none; transition: color ${v('duracao')} ${v('easing')}, transform ${v('duracao')} ${v('easing')}; }
${efeito[cfg.animacao] ?? efeito['sublinhado']}
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

export const TIPOS_SECOES = [MODAL, TOAST, FORMULARIO, HERO, RODAPE];

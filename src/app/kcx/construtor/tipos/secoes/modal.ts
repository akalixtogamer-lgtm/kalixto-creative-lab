import { KcxNo } from '../../../kcx.types';
import { DefinicaoTipo } from '../../montar';
import { interacao } from './_comum';

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
  recursos: [
    {
      id: 'slot',
      nome: 'Conteúdo livre (slot)',
      descricao: 'Área na janela onde você coloca qualquer coisa na instância do Figma.',
      padrao: true,
    },
    {
      id: 'overlay',
      nome: 'Protótipo com overlay',
      descricao: 'Cria uma tela de exemplo: clicar abre a janela por cima (Open overlay) e fecha.',
      padrao: true,
    },
    {
      id: 'esc',
      nome: 'Esc fecha',
      descricao: 'No protótipo do Figma, a tecla Esc fecha a janela.',
      padrao: true,
    },
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
        ...(b.tem('slot')
          ? [
              b.pilha(
                'extra',
                'Conteúdo livre',
                'vertical',
                [
                  {
                    id: 'extra-dica',
                    nome: 'Dica',
                    tipo: 'texto',
                    preenchimentos: [{ tipo: 'solido', cor: b.cor('suave') }],
                    texto: {
                      conteudo: 'Coloque aqui o que quiser',
                      tamanho: 12,
                      familia: 'Inter',
                      estilo: 'Regular',
                    },
                  },
                ],
                { espaco: 8, px: 8, py: 8, encher: true, slot: 'Conteúdo livre' },
              ),
            ]
          : []),
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
        ...(b.tem('esc')
          ? [
              {
                ...interacao('tela', 'aberto', 'fechado'),
                gatilho: 'tecla' as const,
                tecla: 'Escape',
              },
            ]
          : []),
      ],
      prototipo: b.tem('overlay')
        ? {
            overlay: {
              de: 'fechado',
              no: 'abrir-btn',
              overlay: 'aberto',
              fechar: ['cancelar-btn', 'confirmar-btn'],
            },
          }
        : undefined,
      animacao: {
        nome: MODAL.animacoes.find((a) => a.id === cfg.animacao)?.nome ?? 'Entrada',
        tecnica: 'css-keyframes',
        variaveis: ['duracao', 'easing'],
        descricao: '@keyframes na abertura do <dialog> e do ::backdrop.',
      },
      editavel: [
        'Variantes Fechado e Aberto; no protótipo, o botão abre e Cancelar, Confirmar ou o fundo fecham',
        'Janela com Auto Layout: cresce com o texto',
        ...(b.tem('slot') ? ['Slot “Conteúdo livre”: coloque qualquer conteúdo na janela'] : []),
        ...(b.tem('overlay')
          ? ['Tela de protótipo: o botão abre a janela como overlay e Cancelar/Confirmar fecham']
          : []),
        ...(b.tem('esc') ? ['Protótipo: Esc fecha a janela'] : []),
      ],
      tags: ['dialog', 'popup', 'janela'],
    };
  },
};

/* ============================== Aviso (toast) ============================== */

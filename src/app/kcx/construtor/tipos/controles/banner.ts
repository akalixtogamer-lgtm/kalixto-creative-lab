import { KcxNo } from '../../../kcx.types';
import { DefinicaoTipo } from '../../montar';
import { boolAttr, interacao, mapaBool } from './_comum';

export const BANNER: DefinicaoTipo = {
  id: 'banner',
  nome: 'Faixa de aviso (banner)',
  categoria: 'sobreposicao',
  uso: 'site',
  descricao: 'Faixa no topo da página com mensagem, link e botão de fechar.',
  textos: [
    { id: 'texto', rotulo: 'Mensagem', padrao: 'Inscrições abertas para dezembro!' },
    { id: 'link', rotulo: 'Link', padrao: 'Garantir vaga' },
  ],
  icones: [{ id: 'icone', rotulo: 'Ícone', padrao: 'sino' }],
  animacoes: [
    { id: 'deslizar', nome: 'Some subindo', descricao: 'Ao fechar, a faixa sobe e some.' },
    { id: 'fade', nome: 'Some com fade', descricao: 'Ao fechar, a faixa some devagar.' },
    {
      id: 'brilho',
      nome: 'Brilho passando',
      descricao: 'Um brilho passa pela faixa de vez em quando.',
    },
  ],
  largura: 720,
  altura: 72,
  gerar(cfg, b) {
    const C = b.C;
    const v = (n: string) => b.v(n);
    const aberto = boolAttr(b, 'aberto', 'Faixa aberta', true, 'Mostra a faixa.');
    const ic = b.nomeIcone('icone', 'sino');
    const html = `<div class="${C}" data-aberto="true" role="region" aria-label="Aviso">
  ${b.svgKcx(ic, `${C}__icone`, 20)}
  ${b.span('texto', 'p')}
  <a class="${C}__link" href="#">${b.span('link')}</a>
  <button class="${C}__fechar" type="button" aria-label="Fechar aviso">${b.svgKcx('fechar', `${C}__x`, 18)}</button>
</div>`;
    const css = `.${C} { position: relative; display: flex; align-items: center; gap: .75em; width: 100%; max-width: 720px; padding: .7em 1em; overflow: hidden; border-radius: ${v('raio')}; background: ${v('primaria')}; color: ${v('fundo')}; transition: transform ${v('duracao')} ${v('easing')}, opacity ${v('duracao')} ${v('easing')}, max-height ${v('duracao')} ${v('easing')}; max-height: 120px; }
.${C}__texto { flex: 1; margin: 0; font-weight: 600; }
.${C}__link { color: inherit; font-weight: 700; text-underline-offset: 3px; }
.${C}__fechar { display: grid; place-items: center; padding: .3em; border: 0; border-radius: 50%; background: none; color: inherit; cursor: pointer; }
.${C}__fechar:hover { background: color-mix(in srgb, ${v('fundo')} 15%, transparent); }
.${C}[data-aberto="false"] { ${cfg.animacao === 'fade' ? 'opacity: 0;' : 'transform: translateY(-100%); opacity: 0;'} max-height: 0; padding-block: 0; pointer-events: none; }
${cfg.animacao === 'brilho' ? `.${C}::before { content: ''; position: absolute; inset: 0; background: linear-gradient(100deg, transparent 30%, color-mix(in srgb, #fff 35%, transparent) 50%, transparent 70%); transform: translateX(-100%); animation: ${C}-brilho 4s ease-in-out infinite; }\n@keyframes ${C}-brilho { 60%, 100% { transform: translateX(100%); } }` : ''}`;
    const js = `document.querySelectorAll('.${C}').forEach((r) =>
  r.querySelector('.${C}__fechar').addEventListener('click', () => r.setAttribute('data-aberto', 'false')));`;
    const faixa = b.pilha(
      'faixa',
      'Faixa',
      'horizontal',
      [
        b.noIcone('icone', 'Ícone', ic, b.cor('fundo'), 20, { troca: 'Ícone (trocar)' }),
        b.noTexto('texto', 'Mensagem', {
          cor: b.cor('fundo'),
          estilo: 'Semi Bold',
          preencher: true,
        }),
        b.noTexto('link', 'Link', { cor: b.cor('fundo'), estilo: 'Bold' }),
        b.noIcone('fechar', 'Fechar', 'fechar', b.cor('fundo'), 18),
      ],
      {
        largura: 720,
        espaco: 12,
        px: 16,
        py: 12,
        raio: b.raio,
        preenchimentos: [{ tipo: 'solido', cor: b.cor('primaria') }],
        y: mapaBool(aberto, 'faixa-y', '0', '-72'),
        opacidade: mapaBool(aberto, 'faixa-opacidade', '1', '0'),
      },
    );
    const estrutura: KcxNo = {
      id: 'banner',
      nome: cfg.nome,
      tipo: 'frame',
      largura: 720,
      altura: 72,
      recortar: true,
      preenchimentos: [],
      filhos: [{ ...faixa, x: 0 }],
    };
    return {
      html,
      css,
      js,
      estrutura,
      estados: [
        {
          id: 'aberta',
          nome: 'Aberta',
          gatilho: 'padrao',
          descricao: 'Faixa à mostra.',
          valores: { [aberto]: true },
        },
        {
          id: 'fechada',
          nome: 'Fechada',
          gatilho: 'final',
          descricao: 'Depois de fechar.',
          valores: { [aberto]: false },
        },
      ],
      interacoes: [interacao('fechar', 'aberta', 'fechada', 'clique', 300)],
      animacao: {
        nome: BANNER.animacoes.find((a) => a.id === cfg.animacao)?.nome ?? 'Fechar',
        tecnica: cfg.animacao === 'brilho' ? 'css-keyframes' : 'css-transition',
        variaveis: ['duracao', 'easing'],
        descricao: 'data-aberto na raiz; ao fechar a faixa encolhe e some.',
      },
      editavel: [
        'Variantes Aberta e Fechada; clicar no X fecha (Smart Animate)',
        'Ícone trocável (Instance swap); mensagem e link como propriedades de texto',
      ],
      naoSuportado: cfg.animacao === 'brilho' ? ['O brilho passando (contínuo)'] : [],
      tags: ['banner', 'aviso', 'faixa'],
    };
  },
};

/* ============================== Menu suspenso (dropdown) ============================== */

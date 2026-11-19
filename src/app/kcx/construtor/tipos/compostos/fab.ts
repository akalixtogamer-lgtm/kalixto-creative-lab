import { KcxNo } from '../../../kcx.types';
import { DefinicaoTipo } from '../../montar';
import { interacao, mapaBool } from './_comum';

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

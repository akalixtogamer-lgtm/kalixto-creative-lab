import { DefinicaoTipo, ICONES, svgIcone } from '../../montar';
import { sombraHover } from './_comum';

export const CARD_PRECO: DefinicaoTipo = {
  id: 'card-preco',
  nome: 'Card de preço',
  categoria: 'conteudo',
  uso: 'site',
  descricao: 'Plano com preço, lista de vantagens e botão de assinar.',
  textos: [
    { id: 'plano', rotulo: 'Nome do plano', padrao: 'Plano Pro' },
    { id: 'preco', rotulo: 'Preço', padrao: 'R$ 89' },
    { id: 'periodo', rotulo: 'Período', padrao: '/mês' },
    { id: 'descricao', rotulo: 'Descrição', padrao: 'Para quem quer treinar toda semana.' },
    { id: 'botao', rotulo: 'Botão', padrao: 'Assinar agora' },
  ],
  itens: {
    rotulo: 'Vantagem',
    padrao: ['2 aulas por semana', 'Acesso às gravações', 'Aulão mensal', 'Grupo da turma'],
    min: 1,
    max: 8,
  },
  recursos: [
    {
      id: 'partes',
      nome: 'Partes liga/desliga',
      descricao: 'Mostrar ou ocultar cada parte do card na instância do Figma.',
      padrao: true,
    },
  ],
  partes: [
    { no: 't-descricao', nome: 'Descrição', classe: 'descricao' },
    { no: 'lista', nome: 'Vantagens', classe: 'lista' },
    { no: 'acao', nome: 'Botão', classe: 'acao' },
  ],
  animacoes: [
    { id: 'elevar', nome: 'Card sobe', descricao: 'Sobe e ganha sombra colorida no hover.' },
    { id: 'destaque', nome: 'Borda que brilha', descricao: 'A borda acende no hover.' },
    {
      id: 'entrar',
      nome: 'Vantagens em sequência',
      descricao: 'As vantagens entram uma a uma ao carregar.',
    },
  ],
  largura: 320,
  altura: 440,
  gerar(cfg, b) {
    const C = b.C;
    const v = (n: string) => b.v(n);
    const s = sombraHover(b, 'card');
    const html = `<article class="${C}">
  ${b.span('plano', 'h3')}
  <p class="${C}__valor">${b.span('preco', 'strong')}${b.span('periodo')}</p>
  ${b.span('descricao', 'p')}
  <ul class="${C}__lista">
    ${cfg.itens.map((_, i) => `<li style="--i:${i}">${svgIcone(ICONES.check, `${C}__check`, 18)}${b.item(i)}</li>`).join('\n    ')}
  </ul>
  <a class="${C}__acao" href="#">${b.span('botao')}</a>
</article>`;
    const efeito: Record<string, string> = {
      elevar: `.${C}:hover { transform: translateY(-6px); box-shadow: ${s.sombraCss}; }`,
      destaque: `.${C}:hover { box-shadow: inset 0 0 0 2px ${v('primaria')}, ${s.sombraCss}; }`,
      entrar: `.${C}__lista li { animation: ${C}-entra ${v('duracao')} ${v('easing')} both; animation-delay: calc(var(--i) * 90ms); }
@keyframes ${C}-entra { from { opacity: 0; transform: translateX(-10px); } }
.${C}:hover { box-shadow: ${s.sombraCss}; }`,
    };
    const css = `.${C} { display: grid; gap: calc(${v('espaco')} * .75); width: 100%; max-width: 320px; padding: calc(${v('espaco')} * 1.5); border-radius: ${v('raio')}; background: ${v('superficie')}; box-shadow: inset 0 0 0 1px color-mix(in srgb, ${v('primaria')} 40%, transparent); transition: transform ${v('duracao')} ${v('easing')}, box-shadow ${v('duracao')} ${v('easing')}; }
.${C}__plano { margin: 0; color: ${v('primaria')}; font-size: calc(${v('fonte')} * .875); letter-spacing: .08em; text-transform: uppercase; }
.${C}__valor { margin: 0; }
.${C}__preco { font-size: calc(${v('fonte')} * 2.5); }
.${C}__periodo { color: ${v('suave')}; }
.${C}__descricao { margin: 0; color: ${v('suave')}; }
.${C}__lista { display: grid; gap: .55em; margin: 0; padding: 0; list-style: none; }
.${C}__lista li { display: flex; align-items: center; gap: .55em; }
.${C}__check { flex: none; color: ${v('primaria')}; }
.${C}__acao { padding: .75em 1em; border-radius: ${v('raio')}; background: ${v('primaria')}; color: ${v('fundo')}; font-weight: 600; text-align: center; text-decoration: none; }
${efeito[cfg.animacao] ?? efeito['elevar']}`;
    const estrutura = b.pilha(
      'card',
      cfg.nome,
      'vertical',
      [
        b.noTexto('plano', 'Nome do plano', {
          cor: b.cor('primaria'),
          tamanho: b.fonteX(0.875, 'plano-tamanho'),
          estilo: 'Semi Bold',
          caixaAlta: true,
          preencher: true,
        }),
        b.pilha(
          'valor',
          'Preço',
          'horizontal',
          [
            b.noTexto('preco', 'Preço', {
              tamanho: b.fonteX(2.5, 'preco-tamanho'),
              estilo: 'Bold',
            }),
            b.noTexto('periodo', 'Período', { cor: b.cor('suave') }),
          ],
          { espaco: 4 },
        ),
        b.noTexto('descricao', 'Descrição', { cor: b.cor('suave'), preencher: true }),
        b.pilha(
          'lista',
          'Vantagens',
          'vertical',
          cfg.itens.map((_, i) =>
            b.pilha(
              `vantagem-${i + 1}`,
              `Vantagem ${i + 1}`,
              'horizontal',
              [
                b.icone(`check-${i + 1}`, 'Check', ICONES.check, 18, b.cor('primaria')),
                b.noItem(i, { preencher: true }),
              ],
              { espaco: 8, encher: true },
            ),
          ),
          { espaco: b.espacoX(0.55, 'lista-gap'), encher: true },
        ),
        b.noBotao('acao', 'botao', 'Botão', 'primario', { encher: true }),
      ],
      {
        largura: 320,
        espaco: b.espacoX(0.75, 'card-gap'),
        px: b.espacoX(1.5, 'card-px'),
        py: b.espacoX(1.5, 'card-py'),
        raio: b.raio,
        preenchimentos: [{ tipo: 'solido', cor: b.cor('superficie') }],
        traco: { cor: b.corAlpha('corPrimaria', 'borda', 0.4), espessura: 1 },
        efeitos: [s.efeito],
      },
    );
    return {
      html,
      css,
      estrutura,
      estados: s.estados,
      interacoes: s.interacoes,
      animacao: {
        nome: CARD_PRECO.animacoes.find((a) => a.id === cfg.animacao)?.nome ?? 'Hover',
        tecnica: cfg.animacao === 'entrar' ? 'css-keyframes' : 'css-transition',
        variaveis: ['duracao', 'easing', 'forcaSombra'],
        descricao: 'Hover com transform/box-shadow (ou entrada em sequência das vantagens).',
      },
      editavel: [
        'Lista de vantagens com ícone de check como vetor',
        'Variantes Padrão e Hover com “While hovering”',
      ],
      tags: ['pricing', 'plano', 'preço'],
    };
  },
};

/* ============================== Conjunto de botões (variantes) ============================== */

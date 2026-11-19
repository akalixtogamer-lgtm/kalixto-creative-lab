import { KcxInteracao, KcxNo } from '../../../kcx.types';
import { DefinicaoTipo } from '../../montar';
import { interacao } from './_comum';

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

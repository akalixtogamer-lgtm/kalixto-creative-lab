/**
 * Ponte entre a Biblioteca de efeitos (kits) e o KCX.
 *
 * Qualquer kit vira um pacote KCX de NÍVEL 3 (pacote de desenvolvimento):
 * código-fonte, parâmetros como variáveis (que controlam o gerador do kit no
 * lab), dependências, licença e documentação. No Figma ele vira um quadro de
 * documentação com o código guardado — sem prometer reproduzir a animação.
 */
import { BIBLIOTECAS } from '../core/efeitos/bibliotecas';
import { CodigoKit, EffectKit } from '../core/models/effect-sheet.model';
import { Valores as ValoresKit } from '../core/models/demo.model';
import { corValida } from './unidades';
import { KcxComponente, KcxUnidade, KcxVariavel } from './kcx.types';
import { LICENCA_MIT } from './componentes/_base';

const UNIDADES: Record<string, KcxUnidade> = {
  px: 'px',
  ms: 'ms',
  s: 's',
  '°': 'deg',
  deg: 'deg',
  '%': '%',
  rem: 'rem',
  x: 'x',
};

function variavelDoParam(p: EffectKit['params'][number], valor: string | number): KcxVariavel {
  const vinculos = [
    {
      propriedade: `Parâmetro "${p.rotulo}" do gerador do kit`,
      alvo: { tipo: 'parametro-gerador' as const, parametro: p.id },
    },
  ];
  const id = p.id
    .replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
    .replace(/^[^a-zA-Z]+/, 'p');
  if (p.tipo === 'range') {
    const unidade = UNIDADES[p.unidade] ?? '';
    const tipo =
      unidade === 'ms' || unidade === 's'
        ? 'time'
        : unidade === 'px' || unidade === '%' || unidade === 'rem'
          ? 'dimension'
          : Number.isInteger(p.passo)
            ? 'number'
            : 'float';
    return {
      id,
      nome: p.rotulo,
      tipo,
      padrao: p.padrao,
      valor: Number(valor),
      unidade,
      min: p.min,
      max: p.max,
      passo: p.passo,
      descricao: `Parâmetro do kit (${p.min}–${p.max}${p.unidade}).`,
      grupo: tipo === 'time' ? 'motion' : tipo === 'dimension' ? 'dimensions' : 'effects',
      secao: tipo === 'time' ? 'animacao' : 'aparencia',
      vinculos,
      exportavel: true,
    };
  }
  const cores = p.opcoes.every((o) => corValida(o.valor));
  return {
    id,
    nome: p.rotulo,
    tipo: cores ? 'color' : 'enum',
    padrao: p.padrao,
    valor: String(valor),
    ...(cores ? {} : { opcoes: p.opcoes.map((o) => ({ valor: o.valor, rotulo: o.rotulo })) }),
    descricao: cores
      ? `Cor do kit (opções: ${p.opcoes.map((o) => o.rotulo).join(', ')}).`
      : 'Opção do kit.',
    grupo: cores ? 'colors' : 'components',
    secao: 'aparencia',
    vinculos,
    exportavel: true,
  };
}

/** Converte um kit da biblioteca em componente KCX nível 3. */
export function kitParaKcx(
  kit: EffectKit,
  valores: ValoresKit,
  codigo: CodigoKit,
  hoje = new Date().toISOString().slice(0, 10),
): KcxComponente {
  const f = kit.ficha;
  const libs = (kit.bibliotecas ?? []).map((id) => BIBLIOTECAS[id]);
  const variaveis = kit.params.map((p) => variavelDoParam(p, valores[p.id] ?? p.padrao));
  return {
    id: f.id,
    nome: f.nomeAmigavel,
    categoria: f.categoria,
    descricao: f.descricao,
    tecnologia: f.tecnologias,
    versao: '1.0.0',
    licenca: LICENCA_MIT,
    metadados: {
      autor: 'dev-Kalixto',
      tags: f.tags,
      criadoEm: f.validadoEm,
      atualizadoEm: hoje,
      largura: 640,
      altura: 360,
    },
    codigo: { html: codigo.html, css: codigo.css, js: codigo.js },
    variaveis,
    estados: [],
    presets: [],
    dependencias: libs.map((b) => ({
      nome: b.nome,
      versao: b.versao,
      licenca: b.licenca,
      url: b.licencaUrl,
      obrigatoria: true,
    })),
    estrutura: {
      id: 'raiz',
      nome: f.nomeAmigavel,
      tipo: 'frame',
      largura: 640,
      altura: 360,
      raio: 16,
      preenchimentos: [{ tipo: 'solido', cor: '#0b0a14' }],
      autoLayout: { direcao: 'vertical', espaco: 12, paddingX: 32, paddingY: 32 },
      filhos: [
        {
          id: 'titulo',
          nome: 'Título',
          tipo: 'texto',
          preenchimentos: [{ tipo: 'solido', cor: '#f4f2ff' }],
          texto: {
            conteudo: f.nomeAmigavel,
            tamanho: 28,
            familia: 'Inter',
            estilo: 'Bold',
            propriedade: 'Título',
          },
        },
        {
          id: 'descricao',
          nome: 'Descrição',
          tipo: 'texto',
          preenchimentos: [{ tipo: 'solido', cor: '#c9c3ea' }],
          texto: { conteudo: f.descricao, tamanho: 14, familia: 'Inter', estilo: 'Regular' },
        },
        {
          id: 'aviso',
          nome: 'Aviso',
          tipo: 'texto',
          preenchimentos: [{ tipo: 'solido', cor: '#22e3ff' }],
          texto: {
            conteudo:
              'Pacote de desenvolvimento (nível 3): a animação roda no navegador. Código guardado no componente.',
            tamanho: 12,
            familia: 'Inter',
            estilo: 'Regular',
          },
        },
      ],
    },
    animacoes: [
      {
        id: 'efeito',
        nome: f.nomeTecnico,
        tecnica: f.tecnologias.includes('WebGL')
          ? 'webgl'
          : f.tecnologias.includes('Canvas')
            ? 'canvas'
            : f.tecnologias.includes('JavaScript')
              ? 'js'
              : 'css-keyframes',
        variaveis: variaveis.map((v) => v.id),
        figma: 'documental',
        nivel: 3,
        descricao: f.objetivoVisual,
      },
    ],
    compatibilidade: {
      navegadores: f.compatibilidade,
      reducedMotion: /reduced-motion/.test(codigo.css + codigo.js),
      figma: {
        nivel: 3,
        editavel: ['Quadro de documentação (título e descrição)'],
        parcial: [],
        naoSuportado: [
          'A animação (roda só no navegador)',
          'Os parâmetros (viram variáveis documentais)',
        ],
        limitacoes: [
          'Nível 3 — pacote de desenvolvimento: o efeito depende do navegador e não é reproduzido no Figma.',
          'Os parâmetros controlam o gerador de código do kit no laboratório; no Figma ficam como variáveis documentais.',
          ...(libs.length
            ? [
                `Depende de ${libs.map((l) => `${l.nome} ${l.versao} (npm: ${l.pacoteNpm})`).join(', ')}.`,
              ]
            : []),
          ...(kit.bibliotecas?.some((b) => b === 'gsap' || b === 'scrolltrigger')
            ? [
                'GSAP usa a licença Standard "No Charge" (gratuita, não é open source): liberada em sites e apps, mas proíbe uso em ferramentas visuais de animação sem código que concorram com o Webflow. Confira antes de redistribuir.',
              ]
            : []),
          ...f.limitacoes,
        ],
      },
    },
  };
}

/**
 * Telas: componentes empilhados como seções de uma página, num dispositivo
 * (desktop ou celular) e numa fidelidade (wireframe de baixa, média ou alta).
 *
 * - Alta: os componentes como são (cores e tokens da fundação).
 * - Média: tudo em escala de cinza, fiel à luminosidade; fotos viram áreas vazias.
 * - Baixa: poucos cinzas claros, a partir da versão clara; fotos viram áreas vazias.
 *
 * A tela vira um componente KCX cujo frame tem uma instância de cada seção:
 * no Figma, cada seção continua ligada ao seu componente.
 */
import { KcxComponente, KcxNo, KcxVariavel } from '../kcx.types';
import { aplicarAtributosNoHtml } from '../documento';
import { blocoRoot, resolverSaidas, valoresAtuais } from '../resolver';
import { corHex, lerCor } from '../unidades';
import { FUNDACAO_PADRAO, KcxFundacao, construtorDaFundacao } from '../fundacao';
import { ConfigConstrutor, DefinicaoTipo, construirComponente, slug } from './montar';

export type Fidelidade = 'baixa' | 'media' | 'alta';
export type Dispositivo = 'desktop' | 'celular';

export const DISPOSITIVOS: Record<Dispositivo, { nome: string; largura: number; altura: number }> =
  {
    desktop: { nome: 'Desktop', largura: 1440, altura: 900 },
    celular: { nome: 'Celular', largura: 390, altura: 844 },
  };

export const FIDELIDADES: Record<Fidelidade, { nome: string; descricao: string }> = {
  baixa: {
    nome: 'Baixa',
    descricao: 'Caixas em poucos cinzas, sem fotos: estrutura e hierarquia.',
  },
  media: {
    nome: 'Média',
    descricao: 'Escala de cinza fiel ao contraste, sem fotos: layout e textos.',
  },
  alta: { nome: 'Alta', descricao: 'Como vai ficar: cores, fotos e tokens da fundação.' },
};

export interface Tela {
  nome: string;
  dispositivo: Dispositivo;
  fidelidade: Fidelidade;
  /** Ids dos componentes, de cima para baixo (pode repetir). */
  secoes: string[];
  /** Fundo da página: liso (cor de fundo) ou colorido (gradiente, para ver vidro). */
  fundo?: 'liso' | 'colorido';
  /**
   * Posição livre (como no Figma): cada seção fica onde foi arrastada. Ausente =
   * empilhado (uma seção embaixo da outra, responsivo).
   */
  livre?: boolean;
  /** Posição de cada seção no modo livre (mesma ordem de `secoes`), em px do dispositivo. */
  posicoes?: { x: number; y: number }[];
  /** Altura da página no modo livre (px); ausente = calculada pelas seções. */
  alturaPagina?: number;
}

/** Posições válidas para todas as seções (as que faltam vão para baixo da última). */
export function posicoesDaTela(
  tela: Tela,
  comps: (KcxComponente | undefined)[],
): { x: number; y: number }[] {
  const W = DISPOSITIVOS[tela.dispositivo].largura;
  const r: { x: number; y: number }[] = [];
  let fundo = 32;
  tela.secoes.forEach((_, i) => {
    const p = tela.posicoes?.[i];
    const c = comps[i];
    const h = c?.metadados.altura || 200;
    if (p && Number.isFinite(p.x) && Number.isFinite(p.y))
      r.push({ x: Math.round(p.x), y: Math.round(p.y) });
    else
      r.push({ x: Math.max(0, Math.round((W - Math.min(W, c ? larguraDe(c) : W)) / 2)), y: fundo });
    fundo = Math.max(fundo, r[i].y + h + 32);
  });
  return r;
}

/* ============================== Fidelidade ============================== */

const luminancia = (hex: string) => {
  const c = lerCor(hex);
  return { l: (0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b) / 255, a: c.a };
};

/** Cor na fidelidade pedida (alta = a própria cor). */
export function corNaFidelidade(cor: string, fid: Fidelidade): string {
  if (fid === 'alta') return cor;
  let c: { l: number; a: number };
  try {
    c = luminancia(cor);
  } catch {
    return cor;
  }
  if (fid === 'media') {
    const v = Math.round(c.l * 255);
    return corHex({ r: v, g: v, b: v, a: c.a });
  }
  const cinza = c.l > 0.97 ? 255 : c.l > 0.8 ? 237 : c.l > 0.45 ? 200 : 110;
  return corHex({ r: cinza, g: cinza, b: cinza, a: c.a });
}

const HEX = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g;

/** Troca toda cor hex dentro de textos (SVG, gradientes, sombras) pela fidelidade. */
function cinzasProfundos<T>(valor: T, fid: Fidelidade): T {
  if (typeof valor === 'string') return valor.replace(HEX, (h) => corNaFidelidade(h, fid)) as T;
  if (Array.isArray(valor)) return valor.map((v) => cinzasProfundos(v, fid)) as T;
  if (valor && typeof valor === 'object')
    return Object.fromEntries(
      Object.entries(valor).map(([k, v]) => [k, cinzasProfundos(v, fid)]),
    ) as T;
  return valor;
}

/** Bloco cinza (SVG 4×4 #c8c8c8) no lugar de fotos e logos nos wireframes. */
const CINZA_IMG =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNjOGM4YzgiLz48L3N2Zz4=';

/** Preenchimentos de imagem viram cinza (wireframe não mostra fotos). */
function semFotos(n: KcxNo): KcxNo {
  return {
    ...n,
    ...(n.preenchimentos
      ? {
          preenchimentos: n.preenchimentos.map((p) =>
            p.tipo === 'imagem' ? { tipo: 'solido' as const, cor: '#c8c8c8' } : p,
          ),
        }
      : {}),
    ...(n.filhos ? { filhos: n.filhos.map(semFotos) } : {}),
  };
}

const ehImagem = (v: KcxVariavel) =>
  v.tipo === 'string' &&
  v.vinculos.some((x) => x.alvo.tipo === 'atributo' && x.alvo.atributo === 'src');

/** Cópia do componente (e dos subcomponentes) na fidelidade pedida, com id próprio. */
export function aplicarFidelidade(comp: KcxComponente, fid: Fidelidade): KcxComponente {
  if (fid === 'alta') return comp;
  const c = structuredClone(comp);
  const sufixo = (id: string) => `${id}-wireframe-${fid}`;
  c.id = sufixo(comp.id);
  c.nome = `${comp.nome} · wireframe ${FIDELIDADES[fid].nome.toLowerCase()}`;
  for (const v of c.variaveis) {
    if (v.tipo === 'color') {
      // A baixa parte da versão clara (wireframe é sempre claro).
      const base = String(fid === 'baixa' ? (v.modos?.light ?? v.valor) : v.valor);
      v.valor = v.padrao = corNaFidelidade(base, fid);
      if (v.modos) {
        const { light, dark, ...resto } = v.modos;
        v.modos =
          fid === 'baixa'
            ? resto
            : {
                ...resto,
                ...(light !== undefined ? { light: corNaFidelidade(String(light), fid) } : {}),
                ...(dark !== undefined ? { dark: corNaFidelidade(String(dark), fid) } : {}),
              };
      }
    } else if (ehImagem(v)) v.valor = v.padrao = '';
    else {
      // Gradientes, sombras e SVGs guardam cores dentro do valor.
      v.valor = cinzasProfundos(v.valor, fid);
      v.padrao = cinzasProfundos(v.padrao, fid);
      if (v.modos) v.modos = cinzasProfundos(v.modos, fid);
    }
  }
  c.estrutura = semFotos(cinzasProfundos(c.estrutura, fid));
  c.codigo = cinzasProfundos(c.codigo, fid);
  // Fotos e logos (PNG/JPG…) viram um bloco cinza no wireframe.
  c.codigo = {
    ...c.codigo,
    html: c.codigo.html.replace(
      /data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/]+=*/g,
      CINZA_IMG,
    ),
  };
  // Presets e estados guardam valores de cor: também passam pela fidelidade.
  const cores = new Set(c.variaveis.filter((v) => v.tipo === 'color').map((v) => v.id));
  for (const e of c.estados)
    for (const k of Object.keys(e.valores))
      e.valores[k] = cores.has(k)
        ? corNaFidelidade(String(e.valores[k]), fid)
        : cinzasProfundos(e.valores[k], fid);
  c.presets = [];
  if (c.subcomponentes?.length) {
    const mapa = new Map(c.subcomponentes.map((s) => [s.id, sufixo(s.id)]));
    c.subcomponentes = c.subcomponentes.map((s) => aplicarFidelidade(s, fid));
    const trocar = (n: KcxNo) => {
      if (n.instancia && mapa.has(n.instancia.componente))
        n.instancia.componente = mapa.get(n.instancia.componente)!;
      (n.filhos ?? []).forEach(trocar);
    };
    trocar(c.estrutura);
  }
  return c;
}

/* ============================== Tela ============================== */

/** Largura do frame raiz de um componente (para avisar o que não cabe no celular). */
export function larguraDe(c: KcxComponente): number {
  const l = c.estrutura.largura;
  return typeof l === 'number' ? l : c.metadados.largura;
}

/** Seções mais largas que o dispositivo. */
export function naoCabem(tela: Tela, comps: KcxComponente[]): string[] {
  const W = DISPOSITIVOS[tela.dispositivo].largura;
  return comps.filter((c) => larguraDe(c) > W).map((c) => `${c.nome} (${larguraDe(c)} px)`);
}

/**
 * Monta a tela como componente KCX: um frame do tamanho do dispositivo com uma
 * instância de cada seção (os componentes vão junto como subcomponentes).
 */
export function montarTela(
  tela: Tela,
  componentes: KcxComponente[],
  fundacao: KcxFundacao = FUNDACAO_PADRAO,
): KcxComponente {
  const disp = DISPOSITIVOS[tela.dispositivo];
  const porId = new Map(componentes.map((c) => [c.id, c]));
  const secoes = tela.secoes.map((id) => porId.get(id)).filter((c): c is KcxComponente => !!c);
  const subs = [
    ...new Map(secoes.map((c) => [c.id, aplicarFidelidade(c, tela.fidelidade)])).values(),
  ];
  const subDe = (id: string) =>
    subs.find((s) => s.id === id || s.id === `${id}-wireframe-${tela.fidelidade}`)!;
  const def: DefinicaoTipo = {
    id: 'tela',
    nome: 'Tela',
    categoria: 'secoes',
    uso: tela.dispositivo === 'celular' ? 'app' : 'site',
    descricao: `Tela ${disp.nome.toLowerCase()} (${disp.largura} × ${disp.altura}) em fidelidade ${FIDELIDADES[tela.fidelidade].nome.toLowerCase()}.`,
    textos: [],
    animacoes: [{ id: 'nenhuma', nome: 'Sem animação', descricao: 'Tela estática.' }],
    largura: disp.largura,
    altura: disp.altura,
    gerar(cfg, b) {
      const C = b.C;
      const colorido = tela.fundo === 'colorido';
      const tons = (['primaria', 'destaque', 'secundaria'] as const).map((t) =>
        corNaFidelidade(fundacao.cores[t].escuro, tela.fidelidade),
      );
      const fundoCss = colorido
        ? `linear-gradient(135deg, ${tons[0]}, ${tons[1]} 50%, ${tons[2]})`
        : b.v('fundo');
      const livre = !!tela.livre;
      const pos = livre
        ? posicoesDaTela(
            tela,
            tela.secoes.map((id) => porId.get(id)),
          )
        : [];
      const alturaLivre = Math.max(
        disp.altura,
        tela.alturaPagina ?? 0,
        ...pos.map((p, i) => p.y + (secoes[i]?.metadados.altura || 200) + 32),
      );
      const css = [
        livre
          ? `.${C} { position: relative; width: ${disp.largura}px; height: ${alturaLivre}px; margin: 0 auto; background: ${fundoCss}; overflow: hidden; }\n.${C}__secao { position: absolute; }\n${pos.map((p, i) => `.${C}__secao:nth-of-type(${i + 1}) { left: ${p.x}px; top: ${p.y}px; }`).join('\n')}`
          : `.${C} { display: flex; flex-direction: column; align-items: center; gap: 32px; width: 100%; max-width: ${disp.largura}px; min-height: ${disp.altura}px; margin: 0 auto; padding: 32px 0; background: ${fundoCss}; }`,
        ...subs.map(
          (s) =>
            `/* ${s.nome} */\n${blocoRoot(resolverSaidas(s.variaveis, valoresAtuais(s.variaveis)))}\n${s.codigo.css}`,
        ),
      ].join('\n\n');
      const html = `<main class="${C}">\n${secoes
        .map((s) => {
          const sub = subDe(s.id);
          const html = aplicarAtributosNoHtml(
            sub.codigo.html,
            resolverSaidas(sub.variaveis, valoresAtuais(sub.variaveis)),
          );
          return `  <section class="${C}__secao">\n${html}\n  </section>`;
        })
        .join('\n')}\n</main>`;
      const filhos: KcxNo[] = secoes.map((s, i) => ({
        id: `secao-${i + 1}`,
        nome: s.nome,
        tipo: 'instancia',
        instancia: { componente: subDe(s.id).id },
        ...(livre ? { x: pos[i].x, y: pos[i].y } : {}),
      }));
      const preenchimentoTela: KcxNo['preenchimentos'] = [
        colorido
          ? {
              tipo: 'gradiente-linear',
              angulo: 135,
              paradas: tons.map((cor, i) => ({ posicao: i / 2, cor })),
            }
          : { tipo: 'solido', cor: b.cor('fundo') },
      ];
      const estrutura: KcxNo = livre
        ? {
            id: 'tela',
            nome: cfg.nome,
            tipo: 'frame',
            largura: disp.largura,
            altura: alturaLivre,
            preenchimentos: preenchimentoTela,
            filhos,
          }
        : {
            ...b.pilha('tela', cfg.nome, 'vertical', filhos, {
              espaco: 32,
              py: 32,
              alinhar: 'centro',
              largura: disp.largura,
              preenchimentos: [
                colorido
                  ? {
                      tipo: 'gradiente-linear',
                      angulo: 135,
                      paradas: tons.map((cor, i) => ({ posicao: i / 2, cor })),
                    }
                  : { tipo: 'solido', cor: b.cor('fundo') },
              ],
            }),
          };
      return {
        html,
        css,
        js:
          subs
            .map((s) => s.codigo.js)
            .filter(Boolean)
            .join('\n\n') || undefined,
        estrutura,
        subcomponentes: subs,
        animacao: {
          nome: 'Sem animação',
          tecnica: 'css-transition',
          variaveis: [],
          descricao: 'Tela estática.',
        },
        editavel: [
          'Cada seção é uma instância do componente: edite o componente e a tela acompanha',
        ],
        limitacoes: naoCabem(tela, secoes).map(
          (x) => `${x} é mais larga que a tela ${disp.nome.toLowerCase()} (${disp.largura} px).`,
        ),
        tags: ['tela', tela.dispositivo, `wireframe-${tela.fidelidade}`],
      };
    },
  };
  const f = construtorDaFundacao(fundacao);
  const cfg: ConfigConstrutor = {
    tipo: 'tela',
    nome: tela.nome,
    id: `${slug(tela.nome)}-${tela.dispositivo}-${tela.fidelidade}`,
    textos: {},
    itens: [],
    animacao: 'nenhuma',
    midia: '',
    ...f,
  };
  return aplicarFidelidadeRaiz(construirComponente(def, cfg), tela.fidelidade);
}

/** As cores da própria tela (fundo) também seguem a fidelidade; os subcomponentes já vieram prontos. */
function aplicarFidelidadeRaiz(c: KcxComponente, fid: Fidelidade): KcxComponente {
  if (fid === 'alta') return c;
  const subs = c.subcomponentes;
  const t = aplicarFidelidade({ ...c, subcomponentes: undefined }, fid);
  return { ...t, id: c.id, nome: c.nome, subcomponentes: subs };
}

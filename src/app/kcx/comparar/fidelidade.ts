/**
 * Painel de fidelidade: compara a referência e a reconstrução critério por
 * critério, sempre com a MEDIDA e a REGRA à vista. Não existe nota geral: cada
 * critério diz "corresponde", "próximo", "difere" ou "sem medição" (e o que
 * falta para medir).
 *
 * Três tipos de correspondência:
 * - visual: o que se vê parado (composição, posição, proporção, texto, cor, camadas);
 * - comportamental: o que se vê em movimento (efeitos, duração, easing, interações);
 * - técnica: se a reconstrução é boa de manter (variáveis, movimento reduzido,
 *   desempenho, responsividade). Usar a mesma tecnologia da referência NÃO conta.
 */
import type { KcxComponente } from '../kcx.types';
import { validarComponente } from '../validar';
import { distanciaEasing } from './easing';
import { caixaNaEscala, centro, corVisivel, deltaE, difPercentual, formatarTempo } from './medidas';
import type {
  Caixa,
  EstadoCriterio,
  GrupoFidelidade,
  IdCriterio,
  Medida,
  MedicaoElemento,
  ResultadoCriterio,
  ResumoFidelidade,
  SessaoComparacao,
} from './tipos';

type Estado = Medida['estado'];

const ORDEM: Estado[] = ['corresponde', 'proximo', 'difere'];
const pior = (lista: Estado[]): Estado =>
  lista.reduce<Estado>((a, b) => (ORDEM.indexOf(b) > ORDEM.indexOf(a) ? b : a), 'corresponde');

/** Estado por limites: até `ok` corresponde, até `perto` é próximo. */
export const porLimite = (valor: number, ok: number, perto: number): Estado =>
  valor <= ok ? 'corresponde' : valor <= perto ? 'proximo' : 'difere';

const br = (n: number) => (Math.round(n * 10) / 10).toLocaleString('pt-BR');
const px = (n: number) => `${br(n)} px`;
const pct = (n: number) => `${br(n)}%`;

export const CRITERIOS: {
  id: IdCriterio;
  nome: string;
  grupo: GrupoFidelidade;
  criterio: string;
  comoMedir: string;
}[] = [
  {
    id: 'composicao',
    nome: 'Composição visual',
    grupo: 'visual',
    criterio: 'Centro de cada elemento em % do palco: até 2% corresponde, até 5% é próximo.',
    comoMedir:
      'Marque elementos no frame da referência e escolha o elemento equivalente na reconstrução.',
  },
  {
    id: 'posicionamento',
    nome: 'Posicionamento',
    grupo: 'visual',
    criterio:
      'Maior entre Δx e Δy, já na escala e no alinhamento do overlay: até 4 px corresponde, até 12 px é próximo.',
    comoMedir: 'Marque elementos nos dois lados e clique em "Medir reconstrução".',
  },
  {
    id: 'proporcoes',
    nome: 'Proporções',
    grupo: 'visual',
    criterio:
      'Diferença de largura e de proporção (largura ÷ altura): até 3% corresponde, até 8% é próximo.',
    comoMedir: 'Marque elementos nos dois lados e clique em "Medir reconstrução".',
  },
  {
    id: 'tipografia',
    nome: 'Tipografia',
    grupo: 'visual',
    criterio:
      'Tamanho: até 1 px corresponde, até 3 px é próximo. Família igual corresponde; peso até 100 de diferença é próximo.',
    comoMedir: 'No elemento de texto, informe o tamanho (ou a família) visto na referência.',
  },
  {
    id: 'cores',
    nome: 'Cores',
    grupo: 'visual',
    criterio: 'ΔE 2000: até 2,3 (ninguém percebe) corresponde, até 6 é próximo.',
    comoMedir: 'Use o conta-gotas no frame da referência e diga se compara com o texto ou o fundo.',
  },
  {
    id: 'camadas',
    nome: 'Camadas',
    grupo: 'visual',
    criterio: 'Para cada par de elementos, quem fica na frente é o mesmo nos dois lados.',
    comoMedir:
      'Informe a ordem das camadas na referência (1 = na frente) em dois ou mais elementos.',
  },
  {
    id: 'efeitos',
    nome: 'Efeitos',
    grupo: 'comportamental',
    criterio:
      'Cada efeito anotado na referência tem um momento ou elemento equivalente na reconstrução.',
    comoMedir: 'Crie marcos do tipo "efeito" na linha do tempo da referência.',
  },
  {
    id: 'duracao',
    nome: 'Duração',
    grupo: 'comportamental',
    criterio: 'Até 50 ms ou 5% de diferença corresponde; até 150 ms ou 15% é próximo.',
    comoMedir:
      'Marque início e fim do efeito na referência e na reconstrução (ou ligue o marco a um elemento animado).',
  },
  {
    id: 'easing',
    nome: 'Easing',
    grupo: 'comportamental',
    criterio: 'Maior distância entre as curvas (0 a 1): até 0,05 corresponde, até 0,15 é próximo.',
    comoMedir:
      'Escolha a curva vista na referência no marco e ligue o marco a um elemento animado.',
  },
  {
    id: 'interacoes',
    nome: 'Interações',
    grupo: 'comportamental',
    criterio: 'Reproduzido corresponde; implementado diferente é próximo; não implementado difere.',
    comoMedir: 'Liste os comportamentos da referência e teste na aba Interaction test.',
  },
  {
    id: 'responsividade',
    nome: 'Responsividade',
    grupo: 'tecnica',
    criterio: 'Em cada largura testada, nada passa da borda (sem rolagem horizontal).',
    comoMedir: 'Veja a reconstrução em celular, tablet e desktop e clique em "Medir reconstrução".',
  },
  {
    id: 'variaveis',
    nome: 'Ligada às variáveis',
    grupo: 'tecnica',
    criterio: 'O componente passa na validação KCX e todo ajuste é uma variável editável.',
    comoMedir: 'Escolha um componente para a reconstrução.',
  },
  {
    id: 'movimentoReduzido',
    nome: 'Movimento reduzido',
    grupo: 'tecnica',
    criterio: 'Quem pede menos movimento (prefers-reduced-motion) recebe uma versão calma.',
    comoMedir: 'Escolha um componente para a reconstrução.',
  },
  {
    id: 'desempenho',
    nome: 'Desempenho da animação',
    grupo: 'tecnica',
    criterio:
      'Os keyframes animam só transform, opacity e filter (sem recalcular o layout). Propriedades de layout são "próximo".',
    comoMedir: 'Escolha um componente para a reconstrução.',
  },
];

/** Caixa da reconstrução no espaço da referência (overlay). */
function alinhar(c: Caixa, al: SessaoComparacao['alinhamento']): Caixa {
  return {
    x: c.x * al.escala + al.x,
    y: c.y * al.escala + al.y,
    largura: c.largura * al.escala,
    altura: c.altura * al.escala,
  };
}

interface Par {
  nome: string;
  ref: Caixa;
  rec: Caixa;
  med: MedicaoElemento;
  k: number;
  elemento: SessaoComparacao['referencia']['elementos'][number];
}

function pares(s: SessaoComparacao): Par[] {
  const m = s.medicoes;
  if (!m) return [];
  const out: Par[] = [];
  for (const e of s.referencia.elementos) {
    const med = e.seletorRec ? m.elementos[e.seletorRec] : undefined;
    if (!med) continue;
    const frame = s.referencia.frames.find((f) => f.id === e.frameId);
    const larguraRef = frame?.largura || s.referencia.largura || m.palco.largura;
    const k = larguraRef ? m.palco.largura / larguraRef : 1;
    out.push({
      nome: e.nome,
      ref: e.caixaRef ? caixaNaEscala(e.caixaRef, larguraRef, m.palco.largura) : med.caixa,
      rec: alinhar(med.caixa, s.alinhamento),
      med,
      k,
      elemento: e,
    });
  }
  return out;
}

const CSS_BARATAS = new Set([
  'transform',
  'translate',
  'scale',
  'rotate',
  'opacity',
  'filter',
  'backdrop-filter',
  'offset-distance',
  'clip-path',
]);

/** Propriedades usadas dentro de @keyframes. */
export function propriedadesAnimadas(css: string): string[] {
  const out = new Set<string>();
  const re = /@keyframes\s+[^{]+\{/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    let i = m.index + m[0].length;
    let prof = 1;
    const ini = i;
    while (i < css.length && prof > 0) {
      if (css[i] === '{') prof++;
      else if (css[i] === '}') prof--;
      i++;
    }
    const corpo = css.slice(ini, i - 1);
    for (const d of corpo.matchAll(/([a-z-]+)\s*:/g)) {
      if (!d[1].startsWith('--')) out.add(d[1]);
    }
  }
  return [...out].sort();
}

export function avaliarFidelidade(s: SessaoComparacao, comp?: KcxComponente): ResultadoCriterio[] {
  const lista = pares(s);
  const medidas: Partial<Record<IdCriterio, Medida[]>> = {};
  const add = (id: IdCriterio, item: string, diferenca: string, estado: Estado, seletor?: string) =>
    (medidas[id] ??= []).push(
      seletor ? { item, diferenca, estado, seletor } : { item, diferenca, estado },
    );
  const palco = s.medicoes?.palco;

  for (const p of lista) {
    if (!p.elemento.caixaRef) continue;
    const dx = Math.abs(p.rec.x - p.ref.x);
    const dy = Math.abs(p.rec.y - p.ref.y);
    add(
      'posicionamento',
      p.nome,
      `Δx ${px(dx)} · Δy ${px(dy)}`,
      porLimite(Math.max(dx, dy), 4, 12),
      p.elemento.seletorRec,
    );
    if (palco && palco.largura && palco.altura) {
      const a = centro(p.ref);
      const b = centro(p.rec);
      const dcx = (Math.abs(a.x - b.x) / palco.largura) * 100;
      const dcy = (Math.abs(a.y - b.y) / palco.altura) * 100;
      add(
        'composicao',
        p.nome,
        `centro deslocado ${pct(dcx)} × ${pct(dcy)} do palco`,
        porLimite(Math.max(dcx, dcy), 2, 5),
        p.elemento.seletorRec,
      );
    }
    if (p.ref.largura > 0 && p.ref.altura > 0 && p.rec.altura > 0) {
      const dl = difPercentual(p.rec.largura, p.ref.largura);
      const dp = difPercentual(p.rec.largura / p.rec.altura, p.ref.largura / p.ref.altura);
      add(
        'proporcoes',
        p.nome,
        `largura ${pct(dl)} · proporção ${pct(dp)}`,
        porLimite(Math.max(dl, dp), 3, 8),
        p.elemento.seletorRec,
      );
    }
  }

  for (const p of lista) {
    const e = p.elemento;
    if (e.fonteRef) {
      const ref = e.fonteRef * p.k;
      const d = Math.abs(p.med.fonte * s.alinhamento.escala - ref);
      add(
        'tipografia',
        `${p.nome} · tamanho`,
        `${px(p.med.fonte * s.alinhamento.escala)} vs ${px(ref)} (Δ ${px(d)})`,
        porLimite(d, 1, 3),
        e.seletorRec,
      );
    }
    if (e.familiaRef) {
      const norm = (f: string) => f.split(',')[0].replace(/["']/g, '').trim().toLowerCase();
      const igual = norm(e.familiaRef) === norm(p.med.familia);
      add(
        'tipografia',
        `${p.nome} · família`,
        `${norm(p.med.familia) || '—'} vs ${norm(e.familiaRef)}`,
        igual ? 'corresponde' : 'difere',
        e.seletorRec,
      );
    }
    if (e.pesoRef) {
      const d = Math.abs(p.med.peso - e.pesoRef);
      add(
        'tipografia',
        `${p.nome} · peso`,
        `${p.med.peso} vs ${e.pesoRef}`,
        d === 0 ? 'corresponde' : d <= 100 ? 'proximo' : 'difere',
        e.seletorRec,
      );
    }
    if (e.corRef) {
      const alvo = e.corAlvo === 'fundo' ? p.med.corFundo : p.med.corTexto;
      if (corVisivel(alvo)) {
        try {
          const d = deltaE(alvo, e.corRef);
          add(
            'cores',
            `${p.nome} · ${e.corAlvo === 'fundo' ? 'fundo' : 'texto'}`,
            `ΔE ${d.toLocaleString('pt-BR')}`,
            porLimite(d, 2.3, 6),
            e.seletorRec,
          );
        } catch {
          /* cor ilegível: fica sem medição */
        }
      } else
        add(
          'cores',
          `${p.nome} · fundo`,
          'fundo transparente na reconstrução',
          'difere',
          e.seletorRec,
        );
    }
  }

  const comCamada = lista.filter((p) => p.elemento.camadaRef !== undefined);
  for (let i = 0; i < comCamada.length; i++)
    for (let j = i + 1; j < comCamada.length; j++) {
      const a = comCamada[i];
      const b = comCamada[j];
      const refAFrente = (a.elemento.camadaRef as number) < (b.elemento.camadaRef as number);
      const recAFrente = a.med.camada < b.med.camada;
      const [f, t] = refAFrente ? [a, b] : [b, a];
      add(
        'camadas',
        `${a.nome} × ${b.nome}`,
        `${f.nome} na frente de ${t.nome}${refAFrente === recAFrente ? '' : ' só na referência'}`,
        refAFrente === recAFrente ? 'corresponde' : 'difere',
      );
    }

  const medidoDe = (sel?: string) => (sel ? s.medicoes?.elementos[sel] : undefined);
  for (const m of s.referencia.marcos) {
    if (m.tipo === 'efeito' && m.ref !== null) {
      const tem = m.rec !== null || !!m.seletorRec;
      add(
        'efeitos',
        m.nome,
        tem
          ? `em ${m.rec !== null ? formatarTempo(m.rec) : m.seletorRec}`
          : 'sem equivalente na reconstrução',
        tem ? 'corresponde' : 'difere',
      );
    }
    const med = medidoDe(m.seletorRec);
    const movRec = med?.animacoes[0] ?? med?.transicoes[0];
    if (m.ref !== null && m.refFim != null && m.refFim > m.ref) {
      const dRef = (m.refFim - m.ref) * 1000;
      let dRec: number | null = null;
      if (m.rec !== null && m.recFim != null && m.recFim > m.rec) dRec = (m.recFim - m.rec) * 1000;
      else if (movRec) dRec = movRec.duracao;
      if (dRec !== null) {
        const dif = Math.abs(dRec - dRef);
        const rel = difPercentual(dRec, dRef);
        const estado: Estado =
          dif <= 50 || rel <= 5 ? 'corresponde' : dif <= 150 || rel <= 15 ? 'proximo' : 'difere';
        add(
          'duracao',
          m.nome,
          `${formatarTempo(dRec / 1000)} vs ${formatarTempo(dRef / 1000)} (Δ ${Math.round(dif)} ms · ${pct(rel)})`,
          estado,
          m.seletorRec,
        );
      }
    }
    if (m.easingRef && movRec?.easing) {
      const d = distanciaEasing(movRec.easing, m.easingRef);
      if (d !== null)
        add(
          'easing',
          m.nome,
          `${movRec.easing} vs ${m.easingRef} (distância ${d.toLocaleString('pt-BR')})`,
          porLimite(d, 0.05, 0.15),
          m.seletorRec,
        );
    }
  }

  for (const c of s.referencia.comportamentos) {
    if (c.status === 'nao-testado') continue;
    const estado: Estado =
      c.status === 'reproduzido' ? 'corresponde' : c.status === 'difere' ? 'proximo' : 'difere';
    const rotulo = {
      reproduzido: 'reproduzido',
      difere: 'implementado, mas diferente',
      'nao-implementado': 'não implementado',
    }[c.status];
    add('interacoes', `${c.tipo} · ${c.descricao}`, rotulo, estado, c.seletorRec);
  }

  for (const v of s.medicoes?.viewports ?? [])
    add(
      'responsividade',
      `${v.largura} px`,
      v.transborda
        ? `passa da borda: ${v.foraDaTela.slice(0, 3).join(', ') || 'conteúdo largo'}`
        : 'cabe sem rolagem lateral',
      v.transborda ? 'difere' : 'corresponde',
    );

  if (comp) {
    const erros = validarComponente(comp, comp.id);
    const ajustes = s.atual.ajustes.length;
    add(
      'variaveis',
      comp.nome,
      erros.length
        ? `${erros.length} problema(s): ${erros[0].mensagem}`
        : `${comp.variaveis.length} variáveis · ${ajustes} ajuste(s) ligados`,
      erros.length ? 'difere' : 'corresponde',
    );
    const anima = propriedadesAnimadas(comp.codigo.css);
    const reduzido =
      /prefers-reduced-motion/.test(comp.codigo.css) || comp.compatibilidade.reducedMotion;
    add(
      'movimentoReduzido',
      comp.nome,
      anima.length === 0 && !/transition/.test(comp.codigo.css)
        ? 'sem movimento'
        : reduzido
          ? 'tem versão calma'
          : 'sem prefers-reduced-motion',
      anima.length === 0 || reduzido ? 'corresponde' : 'difere',
    );
    const caras = anima.filter((p) => !CSS_BARATAS.has(p));
    add(
      'desempenho',
      comp.nome,
      anima.length === 0
        ? 'sem keyframes'
        : caras.length
          ? `anima ${caras.join(', ')}`
          : `anima só ${anima.join(', ')}`,
      caras.length ? 'proximo' : 'corresponde',
    );
  }

  return CRITERIOS.map((c) => {
    const ms = medidas[c.id] ?? [];
    const r: ResultadoCriterio = {
      id: c.id,
      nome: c.nome,
      grupo: c.grupo,
      estado: ms.length ? pior(ms.map((m) => m.estado)) : 'sem-medicao',
      criterio: c.criterio,
      medidas: ms,
    };
    if (!ms.length) r.comoMedir = c.comoMedir;
    return r;
  });
}

export function resumir(rs: ResultadoCriterio[]): ResumoFidelidade {
  const conta = (e: EstadoCriterio) => rs.filter((r) => r.estado === e).length;
  return {
    corresponde: conta('corresponde'),
    proximo: conta('proximo'),
    difere: conta('difere'),
    semMedicao: conta('sem-medicao'),
    criterios: Object.fromEntries(rs.map((r) => [r.id, r.estado])),
  };
}

export const ROTULO_ESTADO: Record<EstadoCriterio, string> = {
  corresponde: 'Corresponde',
  proximo: 'Próximo',
  difere: 'Difere',
  'sem-medicao': 'Sem medição',
};

export const ROTULO_GRUPO: Record<GrupoFidelidade, string> = {
  visual: 'Correspondência visual',
  comportamental: 'Correspondência comportamental',
  tecnica: 'Correspondência técnica',
};

/**
 * Composição de componentes KCX: várias animações juntas, cada uma com as
 * suas variáveis, mais variáveis compartilhadas que alimentam várias camadas
 * ao mesmo tempo (sem tirar a independência dos parâmetros de cada uma).
 */
import { CSP_PREVIEW } from '../core/efeitos/sandbox';
import { CSS_PALCO_KCX, aplicarAtributosNoHtml } from './documento';
import { KcxComponente, KcxComposicao, KcxValor } from './kcx.types';
import {
  Saidas,
  Valores,
  blocoRoot,
  normalizarValor,
  resolverSaidas,
  valoresAtuais,
} from './resolver';
import { RUNTIME_PREVIEW } from './runtime';
import { clonar, criarPacote } from './serializar';

export const COMPOSICAO_PADRAO: KcxComposicao = {
  id: 'hero-neon',
  nome: 'Hero Neon',
  camadas: [
    {
      componente: 'animated-gradient',
      prefixo: 'fundo',
      papel: 'fundo',
      valores: { title: '', width: 720 },
    },
    { componente: 'svg-motion', prefixo: 'linha', papel: 'sobreposicao', valores: {} },
    { componente: 'neon-glow', prefixo: 'botao', papel: 'centro', valores: { label: 'Começar' } },
  ],
  compartilhadas: [
    {
      id: 'corDestaque',
      nome: 'Cor de destaque',
      tipo: 'color',
      valor: '#ff2bd6',
      alvos: ['botao.primaryColor', 'linha.accentColor'],
    },
    {
      id: 'velocidade',
      nome: 'Velocidade geral',
      tipo: 'float',
      valor: 1,
      alvos: ['fundo.speed', 'linha.speed', 'botao.speed'],
    },
  ],
};

export interface CamadaResolvida {
  prefixo: string;
  papel: string;
  componente: KcxComponente;
  /** Valores finais: padrão ← camada ← compartilhadas. */
  valores: Valores;
  /** Variáveis desta camada que vêm de uma compartilhada. */
  herdadas: Record<string, string>;
}

/** Valores de cada camada, já com as variáveis compartilhadas aplicadas. */
export function resolverComposicao(
  composicao: KcxComposicao,
  componentes: KcxComponente[],
  compartilhadas: Record<string, KcxValor> = {},
  porCamada: Record<string, Valores> = {},
): CamadaResolvida[] {
  return composicao.camadas.map((cam) => {
    const comp = componentes.find((c) => c.id === cam.componente);
    if (!comp) throw new Error(`KCX: componente "${cam.componente}" não encontrado.`);
    const valores: Valores = {
      ...valoresAtuais(comp.variaveis),
      ...cam.valores,
      ...(porCamada[cam.prefixo] ?? {}),
    };
    const herdadas: Record<string, string> = {};
    for (const s of composicao.compartilhadas) {
      const valor = compartilhadas[s.id] ?? s.valor;
      for (const alvo of s.alvos) {
        const [prefixo, varId] = alvo.split('.');
        if (prefixo !== cam.prefixo) continue;
        const v = comp.variaveis.find((x) => x.id === varId);
        if (!v) continue;
        valores[varId] = normalizarValor(v, valor);
        herdadas[varId] = s.id;
      }
    }
    return { prefixo: cam.prefixo, papel: cam.papel, componente: comp, valores, herdadas };
  });
}

export function saidasComposicao(camadas: CamadaResolvida[]): Saidas {
  const s: Saidas = { cssVars: {}, atributos: [], textos: [] };
  for (const c of camadas) {
    const r = resolverSaidas(c.componente.variaveis, c.valores);
    Object.assign(s.cssVars, r.cssVars);
    s.atributos.push(...r.atributos);
    s.textos.push(...r.textos);
  }
  return s;
}

const CSS_COMPOSICAO = `/* Composição */
.kcx-composicao { display: grid; place-items: center; width: min(100%, 760px); }
.kcx-composicao > * { grid-area: 1 / 1; }
.kcx-composicao__conteudo { display: grid; justify-items: center; gap: 12px; padding: 24px; }`;

export function documentoComposicao(composicao: KcxComposicao, camadas: CamadaResolvida[]): string {
  const saidas = saidasComposicao(camadas);
  const fundo = camadas.filter((c) => c.papel === 'fundo');
  const conteudo = camadas.filter((c) => c.papel !== 'fundo');
  const html = `<div class="kcx-composicao" data-kcx="${composicao.id}">
${fundo.map((c) => c.componente.codigo.html).join('\n')}
<div class="kcx-composicao__conteudo">
${conteudo.map((c) => c.componente.codigo.html).join('\n')}
</div>
</div>`;
  const css = [
    CSS_PALCO_KCX,
    blocoRoot(saidas),
    CSS_COMPOSICAO,
    ...camadas.map((c) => c.componente.codigo.css.trim()),
  ].join('\n\n');
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${CSP_PREVIEW}">
<title>${composicao.nome.replace(/[<>&"]/g, '')} · Composição KCX</title>
<style>
${css.replace(/<\/style/gi, '<\\/style')}
</style>
</head>
<body>
${aplicarAtributosNoHtml(html, saidas)}
<script>
${RUNTIME_PREVIEW}
</script>
</body>
</html>
`;
}

/** Pacote KCX da composição: os componentes (com os valores das camadas) + a composição. */
export function pacoteComposicao(
  composicao: KcxComposicao,
  camadas: CamadaResolvida[],
  compartilhadas: Record<string, KcxValor> = {},
) {
  const comp = clonar(composicao);
  comp.compartilhadas = comp.compartilhadas.map((s) => ({
    ...s,
    valor: compartilhadas[s.id] ?? s.valor,
  }));
  comp.camadas = comp.camadas.map((c) => ({
    ...c,
    valores: camadas.find((x) => x.prefixo === c.prefixo)?.valores ?? c.valores,
  }));
  return criarPacote(
    camadas.map((c) => c.componente),
    {
      id: composicao.id,
      nome: composicao.nome,
      versao: '1.0.0',
      composicao: comp,
      valores: Object.fromEntries(camadas.map((c) => [c.componente.id, c.valores])),
    },
  );
}

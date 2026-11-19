/* eslint-disable @typescript-eslint/no-explicit-any */
import { easingFigma } from '../../figma-plano';
import { Figma, No, CHAVE_PLUGIN, variaveisLocais } from './tipos';

/* ============================== Figma → Lab ============================== */

const kebab = (s: string) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .toLowerCase();
const hex2 = (n: number) =>
  Math.round(Math.min(1, Math.max(0, n)) * 255)
    .toString(16)
    .padStart(2, '0');

/**
 * Lê os valores atuais das variáveis de um componente importado e monta o
 * arquivo de alterações (kcx-alteracoes) para o laboratório comparar.
 * Só volta o que tem caminho de volta: variáveis diretas, documentais e
 * paradas de gradiente. Derivadas (calculadas no lab) não voltam.
 */
export async function lerAlteracoes(
  figma: Figma,
  no: No,
): Promise<{ arquivo: object; ignoradas: string[] } | { erro: string }> {
  let alvo = no;
  while (alvo && !alvo.getSharedPluginData?.(CHAVE_PLUGIN, 'componente')) {
    alvo =
      alvo.type === 'INSTANCE' && alvo.getMainComponentAsync
        ? await alvo.getMainComponentAsync()
        : alvo.parent;
    if (alvo?.type === 'PAGE' || alvo?.type === 'DOCUMENT') alvo = null;
  }
  if (!alvo)
    return { erro: 'Selecione um componente importado pelo Figma Bridge (ou uma instância dele).' };
  const compId = alvo.getSharedPluginData(CHAVE_PLUGIN, 'componente');
  let pacote: any;
  try {
    pacote = JSON.parse(alvo.getSharedPluginData(CHAVE_PLUGIN, 'pacote'));
  } catch {
    return { erro: 'O componente não guarda o pacote KCX; importe de novo pelo Figma Bridge.' };
  }
  const comp = pacote.componentes.find((c: any) => c.id === compId);
  const locais = await variaveisLocais(figma);
  const colecoes = await figma.variables.getLocalVariableCollectionsAsync();
  const porNome = new Map(locais.map((v: any) => [v.name, v]));
  const ler = async (v: any) => {
    const col = colecoes.find((c: any) => c.id === v.variableCollectionId);
    let x = v.valuesByMode[col?.defaultModeId ?? Object.keys(v.valuesByMode)[0]];
    for (let i = 0; x && typeof x === 'object' && x.type === 'VARIABLE_ALIAS' && i < 5; i++) {
      const a = await figma.variables.getVariableByIdAsync(x.id);
      const ca = colecoes.find((c: any) => c.id === a?.variableCollectionId);
      x = a?.valuesByMode[ca?.defaultModeId ?? Object.keys(a?.valuesByMode ?? {})[0]];
    }
    return x;
  };
  const valores: Record<string, unknown> = {};
  const ignoradas: string[] = [];
  for (const kv of comp.variaveis) {
    const nome = `${compId}/${kebab(kv.id)}`;
    if (kv.tipo === 'gradient') {
      const paradas = [];
      for (let i = 1; porNome.has(`${nome}/stop-${i}`); i++) {
        const c = await ler(porNome.get(`${nome}/stop-${i}`));
        const orig = [...kv.valor.paradas].sort((a: any, b: any) => a.posicao - b.posicao)[i - 1];
        paradas.push({
          cor: `#${hex2(c.r)}${hex2(c.g)}${hex2(c.b)}${c.a < 1 ? hex2(c.a) : ''}`,
          posicao: orig?.posicao ?? i - 1,
        });
      }
      if (paradas.length >= 2) valores[kv.id] = { angulo: kv.valor.angulo, paradas };
      continue;
    }
    const v = porNome.get(nome);
    if (!v) {
      ignoradas.push(kv.id);
      continue;
    }
    const x = await ler(v);
    if (v.resolvedType === 'COLOR')
      valores[kv.id] = `#${hex2(x.r)}${hex2(x.g)}${hex2(x.b)}${x.a < 1 ? hex2(x.a) : ''}`;
    else if (v.resolvedType === 'FLOAT')
      valores[kv.id] = (v.scopes ?? []).includes('OPACITY') ? Math.round(x * 10) / 1000 : x;
    else if (v.resolvedType === 'TIMING')
      valores[kv.id] = kv.unidade === 'ms' ? Math.round(x * 1000) : x;
    else if (v.resolvedType === 'EASING') {
      const b = x?.easingFunctionCubicBezier;
      const op = (kv.opcoes ?? []).find((o: any) => {
        const e = easingFigma(
          kv.vinculos.flatMap((l: any) => l.transformar ?? []).find((o2: any) => o2.op === 'mapa')
            ?.valores?.[o.valor] ?? o.valor,
        );
        const c = e?.easingFunctionCubicBezier;
        return (
          c && b && ['x1', 'y1', 'x2', 'y2'].every((k) => Math.abs((c as any)[k] - b[k]) < 1e-3)
        );
      });
      if (op) valores[kv.id] = op.valor;
      else ignoradas.push(kv.id);
    } else valores[kv.id] = x;
  }
  return {
    arquivo: {
      formato: 'kcx-alteracoes',
      schemaVersion: pacote.schemaVersion,
      pacote: pacote.id,
      componente: compId,
      versao: comp.versao,
      exportadoEm: new Date().toISOString(),
      valores,
    },
    ignoradas,
  };
}

/**
 * Validação de pacotes KCX (sem dependências).
 *
 * Além da forma do JSON, garante as regras do KCX:
 * - toda variável tem pelo menos um vínculo com uma propriedade real;
 * - valores padrão, atuais, de estados e de presets são válidos;
 * - referências na estrutura visual apontam para variáveis que existem.
 */
import {
  KCX_TECNOLOGIAS,
  KCX_FORMATO,
  KCX_SCHEMA_VERSION,
  KcxComponente,
  KcxNo,
  KcxOperacao,
  KcxPacote,
  KcxRef,
  KcxTipoVariavel,
  KcxVariavel,
} from './kcx.types';
import { validarValor } from './resolver';

export interface ProblemaKcx {
  caminho: string;
  mensagem: string;
}

export interface ResultadoValidacao {
  valido: boolean;
  erros: ProblemaKcx[];
  avisos: ProblemaKcx[];
}

export const TIPOS: KcxTipoVariavel[] = [
  'color',
  'number',
  'float',
  'boolean',
  'string',
  'enum',
  'dimension',
  'time',
  'gradient',
  'transform',
];
const GRUPOS = ['colors', 'dimensions', 'spacing', 'typography', 'motion', 'effects', 'components'];
const SECOES = ['aparencia', 'animacao', 'comportamento'];
const UNIDADES = ['', 'px', 'rem', 'em', '%', 'ms', 's', 'deg', 'turn', 'rad', 'x'];
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ID_VAR = /^[a-zA-Z][a-zA-Z0-9]*$/;
const SEMVER = /^\d+\.\d+\.\d+(?:-[0-9a-z.-]+)?$/i;

const ehObjeto = (x: unknown): x is Record<string, unknown> =>
  !!x && typeof x === 'object' && !Array.isArray(x);
const ehTexto = (x: unknown): x is string => typeof x === 'string' && x.trim() !== '';

export function ehRefVariavel(r: unknown): r is { $var: string } {
  return ehObjeto(r) && typeof r['$var'] === 'string';
}
export function ehRefDerivada(
  r: unknown,
): r is { $derivado: string; nome: string; transformar?: KcxOperacao[] } {
  return ehObjeto(r) && typeof r['$derivado'] === 'string';
}

function validarVariavel(
  v: KcxVariavel,
  c: string,
  todas: Set<string>,
  erros: ProblemaKcx[],
): void {
  const e = (campo: string, mensagem: string) => erros.push({ caminho: `${c}.${campo}`, mensagem });
  if (!ehTexto(v.id) || !ID_VAR.test(v.id))
    e('id', 'ID da variável deve ser camelCase (ex.: primaryColor).');
  if (!ehTexto(v.nome)) e('nome', 'Nome obrigatório.');
  if (!TIPOS.includes(v.tipo)) e('tipo', `Tipo "${String(v.tipo)}" não suportado.`);
  if (!GRUPOS.includes(v.grupo)) e('grupo', `Grupo "${String(v.grupo)}" inválido.`);
  if (!SECOES.includes(v.secao)) e('secao', `Seção "${String(v.secao)}" inválida.`);
  if (v.unidade !== undefined && !UNIDADES.includes(v.unidade))
    e('unidade', `Unidade "${v.unidade}" inválida.`);
  if (typeof v.descricao !== 'string') e('descricao', 'Descrição obrigatória.');
  if (typeof v.exportavel !== 'boolean') e('exportavel', 'Defina se a variável é exportável.');
  if (v.min !== undefined && v.max !== undefined && v.min > v.max)
    e('min', 'Mínimo maior que o máximo.');
  if (v.tipo === 'enum' && !(v.opcoes && v.opcoes.length >= 2))
    e('opcoes', 'Enum precisa de 2 ou mais opções.');
  if (!TIPOS.includes(v.tipo)) return;
  for (const p of validarValor(v, v.padrao)) e('padrao', p);
  for (const p of validarValor(v, v.valor)) e('valor', p);
  if (v.modos) {
    for (const [m, val] of Object.entries(v.modos))
      for (const p of validarValor(v, val)) e(`modos.${m}`, p);
  }
  if (!Array.isArray(v.vinculos) || v.vinculos.length === 0) {
    e(
      'vinculos',
      'A variável não controla nenhuma propriedade. Variáveis sem vínculo não são permitidas no KCX.',
    );
    return;
  }
  v.vinculos.forEach((vin, i) => {
    const cv = `vinculos[${i}]`;
    if (!ehTexto(vin.propriedade)) e(`${cv}.propriedade`, 'Descreva a propriedade controlada.');
    if (vin.alvo?.tipo === 'css-var') {
      if (!/^--kcx-[a-z0-9-]+$/.test(vin.alvo.nome))
        e(`${cv}.alvo.nome`, 'Custom property precisa começar com --kcx- (minúsculas e hífens).');
    } else if (vin.alvo?.tipo === 'atributo') {
      if (!ehTexto(vin.alvo.seletor) || !ehTexto(vin.alvo.atributo))
        e(`${cv}.alvo`, 'Seletor e atributo obrigatórios.');
      if (/^on/i.test(vin.alvo.atributo ?? ''))
        e(`${cv}.alvo.atributo`, 'Atributos de evento (on*) não são permitidos.');
    } else if (vin.alvo?.tipo === 'texto') {
      if (!ehTexto(vin.alvo.seletor)) e(`${cv}.alvo.seletor`, 'Seletor obrigatório.');
    } else e(`${cv}.alvo`, 'Alvo deve ser css-var, atributo ou texto.');
    for (const o of vin.transformar ?? []) {
      if (o.op === 'pontoNoCaminho' || o.op === 'tracoNoCaminho') {
        e(`${cv}.transformar`, `A operação ${o.op} só pode ser usada na estrutura visual.`);
      }
      if (
        (o.op === 'multiplicarPorVariavel' ||
          o.op === 'dividirPorVariavel' ||
          o.op === 'somarVariavel' ||
          (o.op === 'alpha' && o.variavel)) &&
        !todas.has((o as { variavel: string }).variavel)
      ) {
        e(
          `${cv}.transformar`,
          `Operação ${o.op} usa a variável "${(o as { variavel: string }).variavel}", que não existe.`,
        );
      }
      if (o.op === 'mapa' && v.tipo === 'enum') {
        const faltam = (v.opcoes ?? [])
          .filter((op) => !(op.valor in o.valores))
          .map((op) => op.valor);
        if (faltam.length) e(`${cv}.transformar`, `Mapa sem valor para: ${faltam.join(', ')}.`);
      }
      if (
        o.op === 'mapa' &&
        v.tipo === 'boolean' &&
        !('true' in o.valores && 'false' in o.valores)
      ) {
        e(`${cv}.transformar`, 'Mapa de boolean precisa de "true" e "false".');
      }
    }
  });
}

function percorrer(
  no: KcxNo,
  f: (no: KcxNo, caminho: string) => void,
  caminho = 'estrutura',
): void {
  f(no, caminho);
  no.filhos?.forEach((filho, i) => percorrer(filho, f, `${caminho}.filhos[${i}]`));
}

/** Todas as referências ($var / $derivado) de um nó, com o campo onde estão. */
export function refsDoNo(no: KcxNo): { campo: string; ref: KcxRef<unknown> }[] {
  const out: { campo: string; ref: KcxRef<unknown> }[] = [];
  const add = (campo: string, ref: unknown) => {
    if (ehRefVariavel(ref) || ehRefDerivada(ref)) out.push({ campo, ref: ref as KcxRef<unknown> });
  };
  (
    ['x', 'y', 'largura', 'altura', 'raio', 'opacidade', 'visivel', 'rotacao', 'svg'] as const
  ).forEach((k) => add(k, no[k]));
  no.preenchimentos?.forEach((p, i) => {
    if (p.tipo === 'solido') add(`preenchimentos[${i}].cor`, p.cor);
    else if (p.tipo === 'gradiente-variavel') {
      add(`preenchimentos[${i}].variavel`, { $var: p.variavel });
      add(`preenchimentos[${i}].tamanho`, p.tamanho);
      add(`preenchimentos[${i}].deslocamento`, p.deslocamento);
    } else {
      add(`preenchimentos[${i}].angulo`, p.angulo);
      p.paradas.forEach((s, j) => add(`preenchimentos[${i}].paradas[${j}].cor`, s.cor));
    }
  });
  const pintura = (
    p: KcxNo['preenchimentos'] extends (infer P)[] | undefined ? P : never,
    campo: string,
  ) => {
    if (p.tipo === 'solido') add(`${campo}.cor`, p.cor);
    else if (p.tipo === 'gradiente-variavel') {
      add(`${campo}.variavel`, { $var: p.variavel });
      add(`${campo}.tamanho`, p.tamanho);
      add(`${campo}.deslocamento`, p.deslocamento);
    } else {
      add(`${campo}.angulo`, p.angulo);
      p.paradas.forEach((s, j) => add(`${campo}.paradas[${j}].cor`, s.cor));
    }
  };
  if (no.traco) {
    if (no.traco.cor !== undefined) add('traco.cor', no.traco.cor);
    if (no.traco.pintura) pintura(no.traco.pintura, 'traco.pintura');
    add('traco.espessura', no.traco.espessura);
  }
  if (no.arco) {
    add('arco.inicio', no.arco.inicio);
    add('arco.fim', no.arco.fim);
    add('arco.interno', no.arco.interno);
  }
  if (no.svgTraco) {
    add('svgTraco.cor', no.svgTraco.cor);
    add('svgTraco.espessura', no.svgTraco.espessura);
  }
  no.efeitos?.forEach((ef, i) => {
    add(`efeitos[${i}].raio`, ef.raio);
    if (ef.tipo === 'sombra') {
      add(`efeitos[${i}].cor`, ef.cor);
      add(`efeitos[${i}].espalhar`, ef.espalhar);
    }
  });
  if (no.texto) {
    add('texto.conteudo', no.texto.conteudo);
    add('texto.tamanho', no.texto.tamanho);
    add('texto.espacamento', no.texto.espacamento);
  }
  if (no.autoLayout) {
    add('autoLayout.espaco', no.autoLayout.espaco);
    add('autoLayout.paddingX', no.autoLayout.paddingX);
    add('autoLayout.paddingY', no.autoLayout.paddingY);
  }
  return out;
}

export function validarComponente(comp: KcxComponente, c: string): ProblemaKcx[] {
  const erros: ProblemaKcx[] = [];
  const e = (campo: string, mensagem: string) => erros.push({ caminho: `${c}.${campo}`, mensagem });
  if (!ehObjeto(comp)) return [{ caminho: c, mensagem: 'Componente deve ser um objeto.' }];
  if (!ehTexto(comp.id) || !ID.test(comp.id)) e('id', 'ID deve ser kebab-case (ex.: neon-glow).');
  for (const k of ['nome', 'categoria', 'descricao'] as const)
    if (!ehTexto(comp[k])) e(k, 'Campo obrigatório.');
  if (!ehTexto(comp.versao) || !SEMVER.test(comp.versao))
    e('versao', 'Versão deve seguir SemVer (1.0.0).');
  if (!ehObjeto(comp.licenca) || !ehTexto(comp.licenca.spdx))
    e('licenca', 'Licença (SPDX) obrigatória.');
  if (
    !ehObjeto(comp.codigo) ||
    typeof comp.codigo.html !== 'string' ||
    typeof comp.codigo.css !== 'string' ||
    typeof comp.codigo.js !== 'string'
  ) {
    e('codigo', 'Código-fonte (html, css, js) obrigatório.');
  }
  if (!Array.isArray(comp.variaveis)) {
    e('variaveis', 'Lista de variáveis obrigatória.');
    return erros;
  }
  const ids = new Set<string>();
  comp.variaveis.forEach((v, i) => {
    if (ids.has(v?.id)) e(`variaveis[${i}].id`, `ID "${v.id}" repetido.`);
    ids.add(v?.id);
  });
  const porId = new Map(comp.variaveis.map((v) => [v.id, v]));
  comp.variaveis.forEach((v, i) => validarVariavel(v, `${c}.variaveis[${i}]`, ids, erros));

  const valoresOk = (valores: unknown, campo: string) => {
    if (!ehObjeto(valores)) {
      e(campo, 'Valores devem ser um objeto.');
      return;
    }
    for (const [k, val] of Object.entries(valores)) {
      const v = porId.get(k);
      if (!v) e(campo, `Variável "${k}" não existe.`);
      else for (const p of validarValor(v, val)) e(campo, p);
    }
  };
  (comp.estados ?? []).forEach((s, i) => {
    valoresOk(s.valores, `estados[${i}].valores`);
    for (const d of s.derivar ?? []) {
      if (!porId.has(d.variavel) || !porId.has(d.de))
        e(`estados[${i}].derivar`, `Derivação usa variável inexistente (${d.variavel} ← ${d.de}).`);
    }
  });
  (comp.presets ?? []).forEach((p, i) => {
    if (!ehTexto(p.id) || !ehTexto(p.nome)) e(`presets[${i}]`, 'Preset precisa de id e nome.');
    valoresOk(p.valores, `presets[${i}].valores`);
  });

  if (!ehObjeto(comp.estrutura)) e('estrutura', 'Estrutura visual obrigatória.');
  else {
    const nos = new Set<string>();
    percorrer(comp.estrutura, (no, cam) => {
      if (nos.has(no.id))
        erros.push({ caminho: `${c}.${cam}.id`, mensagem: `Nó "${no.id}" repetido.` });
      nos.add(no.id);
      for (const { campo, ref } of refsDoNo(no)) {
        const id = ehRefVariavel(ref) ? ref.$var : (ref as { $derivado: string }).$derivado;
        if (!porId.has(id))
          erros.push({
            caminho: `${c}.${cam}.${campo}`,
            mensagem: `Referência a "${id}", que não existe.`,
          });
        if (ehRefDerivada(ref) && !ehTexto(ref.nome))
          erros.push({
            caminho: `${c}.${cam}.${campo}`,
            mensagem: 'Valor derivado precisa de nome.',
          });
      }
    });
  }
  for (const eixo of comp.compatibilidade?.figma?.eixosVariante ?? []) {
    if (porId.get(eixo)?.tipo !== 'enum')
      e('compatibilidade.figma.eixosVariante', `"${eixo}" precisa ser uma variável enum.`);
  }
  if (![1, 2].includes(comp.compatibilidade?.figma?.nivel))
    e('compatibilidade.figma.nivel', 'Nível deve ser 1 (nativo) ou 2 (parcial).');
  const fora = (comp.tecnologia ?? []).filter(
    (t) => !(KCX_TECNOLOGIAS as readonly string[]).includes(t),
  );
  if (fora.length)
    e(
      'tecnologia',
      `O KCX aceita só ${KCX_TECNOLOGIAS.join(', ')} (recebido: ${fora.join(', ')}).`,
    );
  if ((comp.dependencias ?? []).length)
    e('dependencias', 'Componentes KCX não usam bibliotecas externas.');
  return erros;
}

/** Valida um pacote KCX completo (objeto já lido do JSON). */
export function validarPacote(p: unknown): ResultadoValidacao {
  const erros: ProblemaKcx[] = [];
  const avisos: ProblemaKcx[] = [];
  if (!ehObjeto(p))
    return {
      valido: false,
      erros: [{ caminho: '', mensagem: 'O arquivo não é um objeto JSON.' }],
      avisos,
    };
  const pkg = p as unknown as KcxPacote;
  if (pkg.formato !== KCX_FORMATO)
    erros.push({ caminho: 'formato', mensagem: 'Não é um pacote KCX (formato ≠ "kcx").' });
  const major = String(pkg.schemaVersion ?? '').split('.')[0];
  if (!SEMVER.test(String(pkg.schemaVersion)))
    erros.push({ caminho: 'schemaVersion', mensagem: 'schemaVersion ausente ou inválido.' });
  else if (major !== KCX_SCHEMA_VERSION.split('.')[0]) {
    erros.push({
      caminho: 'schemaVersion',
      mensagem: `Schema ${pkg.schemaVersion} incompatível com ${KCX_SCHEMA_VERSION}.`,
    });
  } else if (pkg.schemaVersion !== KCX_SCHEMA_VERSION) {
    avisos.push({
      caminho: 'schemaVersion',
      mensagem: `Schema ${pkg.schemaVersion}; este leitor implementa ${KCX_SCHEMA_VERSION}.`,
    });
  }
  if (!ehTexto(pkg.id)) erros.push({ caminho: 'id', mensagem: 'ID do pacote obrigatório.' });
  if (!SEMVER.test(String(pkg.versao)))
    erros.push({ caminho: 'versao', mensagem: 'Versão do pacote deve seguir SemVer.' });
  if (!ehTexto(pkg.criadoEm) || Number.isNaN(Date.parse(pkg.criadoEm)))
    erros.push({ caminho: 'criadoEm', mensagem: 'Data de criação inválida.' });
  if (!ehObjeto(pkg.origem) || !ehTexto(pkg.origem.ferramenta))
    erros.push({ caminho: 'origem', mensagem: 'Origem obrigatória.' });
  if (!Array.isArray(pkg.historico))
    erros.push({
      caminho: 'historico',
      mensagem: 'Histórico de alterações obrigatório (pode ser vazio).',
    });
  if (!Array.isArray(pkg.dependencias))
    erros.push({
      caminho: 'dependencias',
      mensagem: 'Lista de dependências obrigatória (pode ser vazia).',
    });
  if (!Array.isArray(pkg.componentes) || pkg.componentes.length === 0) {
    erros.push({
      caminho: 'componentes',
      mensagem: 'O pacote precisa de pelo menos um componente.',
    });
  } else {
    const ids = new Set<string>();
    pkg.componentes.forEach((comp, i) => {
      if (ids.has(comp?.id))
        erros.push({
          caminho: `componentes[${i}].id`,
          mensagem: `Componente "${comp.id}" repetido.`,
        });
      ids.add(comp?.id);
      erros.push(...validarComponente(comp, `componentes[${i}]`));
    });
    const comp = pkg.composicao;
    if (comp) {
      const prefixos = new Set<string>();
      comp.camadas.forEach((cam, i) => {
        if (!ids.has(cam.componente))
          erros.push({
            caminho: `composicao.camadas[${i}]`,
            mensagem: `Componente "${cam.componente}" não está no pacote.`,
          });
        if (comp.camadas.filter((c) => c.componente === cam.componente).length > 1) {
          erros.push({
            caminho: `composicao.camadas[${i}]`,
            mensagem: `"${cam.componente}" aparece em mais de uma camada (as custom properties colidiriam).`,
          });
        }
        if (prefixos.has(cam.prefixo))
          erros.push({
            caminho: `composicao.camadas[${i}].prefixo`,
            mensagem: `Prefixo "${cam.prefixo}" repetido.`,
          });
        prefixos.add(cam.prefixo);
      });
      comp.compartilhadas.forEach((s, i) => {
        for (const alvo of s.alvos) {
          const [prefixo, varId] = alvo.split('.');
          const camada = comp.camadas.find((c) => c.prefixo === prefixo);
          const kc = pkg.componentes.find((k) => k.id === camada?.componente);
          const v = kc?.variaveis.find((x) => x.id === varId);
          if (!v)
            erros.push({
              caminho: `composicao.compartilhadas[${i}].alvos`,
              mensagem: `Alvo "${alvo}" não existe.`,
            });
          else if (v.tipo !== s.tipo)
            erros.push({
              caminho: `composicao.compartilhadas[${i}].alvos`,
              mensagem: `Alvo "${alvo}" é ${v.tipo}, não ${s.tipo}.`,
            });
        }
      });
    }
  }
  return { valido: erros.length === 0, erros, avisos };
}

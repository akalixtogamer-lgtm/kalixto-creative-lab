/**
 * Versão Angular de um componente KCX: um componente standalone em que cada
 * variável KCX é um input() com signal. Os vínculos são calculados pelo mesmo
 * resolver do runtime (kcx-runtime.ts) e aplicados como custom properties no
 * elemento do componente — o CSS é o mesmo do lab.
 *
 * Uso: <kcx-neon-glow primaryColor="#8b5cf6" [glowIntensity]="1.6" label="Gravando" />
 */
import { KcxComponente, KcxVariavel } from './kcx.types';
import { Valores, valoresAtuais } from './resolver';
import { RESOLVER_JS, configRuntime } from './runtime';

export interface CodigoAngularKcx {
  /** Nome base dos arquivos (ex.: "neon-glow"). */
  arquivo: string;
  ts: string;
  html: string;
  css: string;
}

/** "neon-glow" → "KcxNeonGlow". */
export function classeAngular(id: string): string {
  return 'Kcx' + id.replace(/(^|-)([a-z0-9])/g, (_, __, c: string) => c.toUpperCase());
}

function tipoTs(v: KcxVariavel): string {
  switch (v.tipo) {
    case 'boolean':
      return 'boolean';
    case 'string':
    case 'color':
      return 'string';
    case 'enum':
      return (v.opcoes ?? []).map((o) => JSON.stringify(o.valor)).join(' | ') || 'string';
    case 'gradient':
      return '{ angulo: number; paradas: { cor: string; posicao: number }[] }';
    case 'transform':
      return '{ x: number; y: number; escala: number; rotacao: number }';
    default:
      return 'number';
  }
}

/** Arquivo compartilhado pelos componentes: o cálculo dos vínculos. */
export const RUNTIME_ANGULAR = `// @ts-nocheck
/**
 * KCX — cálculo dos vínculos (variável → propriedade). É o mesmo código do
 * kcx-runtime.js exportado, testado contra o resolver do laboratório.
 * Licença MIT · Kalixto Component Exchange.
 */
${RESOLVER_JS}

export interface KcxSaidas {
  cssVars: Record<string, string>;
  atributos: { seletor: string; atributo: string; valor: string }[];
  textos: { seletor: string; valor: string }[];
}

export function resolverKcx(variaveis: readonly unknown[], valores: Record<string, unknown>): KcxSaidas {
  return resolver(variaveis, valores);
}
`;

export function angularKcx(comp: KcxComponente, valores: Valores = {}): CodigoAngularKcx {
  const atuais = valoresAtuais(comp.variaveis, valores);
  const classe = classeAngular(comp.id);
  const inputs = comp.variaveis
    .map((v) => {
      const doc = `  /** ${v.nome} — ${v.descricao.replace(/\*\//g, '*∕')} Controla: ${v.vinculos.map((l) => l.propriedade).join('; ')}. */`;
      return `${doc}\n  readonly ${v.id} = input<${tipoTs(v)}>(${JSON.stringify(atuais[v.id])});`;
    })
    .join('\n\n');
  const leitura = comp.variaveis.map((v) => `      ${v.id}: this.${v.id}(),`).join('\n');
  const ts = `import { Component, ElementRef, ViewEncapsulation, afterRenderEffect, computed, inject, input } from '@angular/core';
import { resolverKcx } from '../kcx-runtime';

/** Vínculos das variáveis (gerado pelo Kalixto Creative Lab — KCX ${comp.id} v${comp.versao}). */
const VARIAVEIS = ${JSON.stringify(configRuntime(comp.variaveis.map((v) => ({ ...v, valor: atuais[v.id] }))))} as const;

/**
 * ${comp.nome} — ${comp.descricao}
 * Cada input é uma variável KCX: mudar o valor muda o componente na hora.
 * Licença ${comp.licenca.spdx}.
 */
@Component({
  selector: 'kcx-${comp.id}',
  templateUrl: './${comp.id}.component.html',
  styleUrl: './${comp.id}.component.css',
  // Sem encapsulamento: as animações usam o nome do @keyframes vindo de uma custom property.
  // As classes já têm o prefixo kcx-${comp.id}, então não vazam para o resto da página.
  encapsulation: ViewEncapsulation.None,
  host: { '[style]': 'saidas().cssVars' },
})
export class ${classe} {
${inputs}

  /** Valores finais de cada propriedade vinculada. */
  protected readonly saidas = computed(() =>
    resolverKcx(VARIAVEIS, {
${leitura}
    }),
  );

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    // Atributos (ex.: d de um path) e textos vinculados às variáveis.
    afterRenderEffect(() => {
      const s = this.saidas();
      const raiz = this.el.nativeElement;
      for (const a of s.atributos) {
        if (/^on/i.test(a.atributo)) continue;
        raiz.querySelectorAll(a.seletor).forEach((n) => n.setAttribute(a.atributo, a.valor));
      }
      for (const t of s.textos) raiz.querySelectorAll(t.seletor).forEach((n) => (n.textContent = t.valor));
    });
  }
}
`;
  const css = `/* ${comp.nome} — KCX (os valores chegam como custom properties no elemento kcx-${comp.id}) */
kcx-${comp.id} { display: contents; }

${comp.codigo.css.trim()}
`;
  return { arquivo: comp.id, ts, html: comp.codigo.html.trim() + '\n', css };
}

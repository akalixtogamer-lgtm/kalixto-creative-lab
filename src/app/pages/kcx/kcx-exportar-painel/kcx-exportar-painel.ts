import { Component, computed, inject, input, signal } from '@angular/core';
import { KcxFundacaoService } from '../kcx-fundacao.service';
import { KcxComponente, KcxModoExportacao } from '../../../kcx/kcx.types';
import { Valores } from '../../../kcx/resolver';
import { serializar } from '../../../kcx/serializar';
import { planejarFigma } from '../../../kcx/figma-plano';
import {
  MODOS_EXPORTACAO,
  arquivosCodigo,
  pacoteDoEditor,
  svgEstatico,
  tokensW3C,
} from '../../../kcx/exportar-kcx';
import { criarZip } from '../../../shared/utils/zip';
import { Icon } from '../../../shared/components/icon/icon';
import { baixarArquivo } from '../kcx-estado.service';

const TECNICA: Record<string, string> = {
  'css-keyframes': 'CSS @keyframes',
  'css-transition': 'CSS transition',
  'css-motion-path': 'CSS Motion Path',
  waapi: 'Web Animations API',
  canvas: 'Canvas',
  webgl: 'WebGL',
  js: 'JavaScript',
};

/** Arquivos do plugin publicados junto com o lab (npm run figma:build). */
export const ARQUIVOS_PLUGIN = ['manifest.json', 'code.js', 'ui.html', 'LEIA-ME.md'];

/**
 * Painel "Exportar para Figma": mostra, ANTES de exportar, exatamente o que
 * o plugin Figma Bridge vai criar e o que continua editável.
 */
@Component({
  selector: 'kx-kcx-exportar-painel',
  imports: [Icon],
  templateUrl: './kcx-exportar-painel.html',
  styleUrl: './kcx-exportar-painel.css',
})
export class KcxExportarPainel {
  readonly comp = input.required<KcxComponente>();
  readonly valores = input.required<Valores>();
  readonly presetAtivo = input<string | undefined>();

  protected readonly modos = MODOS_EXPORTACAO;
  protected readonly modo = signal<KcxModoExportacao>('completo');
  protected readonly tecnica = TECNICA;
  protected readonly msgPlugin = signal('');

  private readonly fundacao = inject(KcxFundacaoService);
  /** O pacote leva a fundação (tokens) quando ela está ligada: no Figma o componente vira alias dos tokens. */
  protected readonly pacote = computed(() => {
    const p = pacoteDoEditor(this.comp(), this.valores(), this.modo(), this.presetAtivo());
    const f = this.fundacao.paraPacote();
    return f ? { ...p, fundacao: structuredClone(f) } : p;
  });
  protected readonly plano = computed(() => planejarFigma(this.pacote(), this.modo()));
  protected readonly svg = computed(() => svgEstatico(this.comp(), this.valores()));
  protected readonly svgUrl = computed(
    () => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(this.svg()),
  );
  protected readonly colecoesTexto = computed(() =>
    this.plano()
      .colecoes.map((c) => c.nome + (c.modos.length > 1 ? ` (${c.modos.join('/')})` : ''))
      .join(', '),
  );
  protected readonly variaveis = computed(() => this.plano().colecoes.flatMap((c) => c.variaveis));
  protected readonly comPropriedadeTexto = computed(() => {
    const out: string[] = [];
    const visitar = (n: { texto?: { propriedade?: string }; filhos: unknown[] }) => {
      if (n.texto?.propriedade) out.push(n.texto.propriedade);
      (n.filhos as (typeof n)[]).forEach(visitar);
    };
    const v = this.plano().componentes[0]?.variantes[0];
    if (v) visitar(v.arvore as never);
    return out;
  });
  protected readonly eixos = computed(() => {
    const v = this.plano().componentes[0]?.variantes ?? [];
    const props: Record<string, Set<string>> = {};
    for (const x of v)
      for (const [k, val] of Object.entries(x.propriedades)) (props[k] ??= new Set()).add(val);
    return Object.entries(props).map(([k, s]) => `${k}: ${[...s].join(', ')}`);
  });

  protected valorTexto(v: unknown): string {
    if (v && typeof v === 'object' && 'alias' in (v as object))
      return `→ ${(v as { alias: string }).alias}`;
    if (v && typeof v === 'object' && 'easingFunctionCubicBezier' in (v as object)) {
      const b = (v as { easingFunctionCubicBezier: Record<string, number> })
        .easingFunctionCubicBezier;
      return `cubic-bezier(${b['x1']}, ${b['y1']}, ${b['x2']}, ${b['y2']})`;
    }
    if (v && typeof v === 'object') {
      const c = v as { r: number; g: number; b: number; a: number };
      const h = (n: number) =>
        Math.round(n * 255)
          .toString(16)
          .padStart(2, '0');
      return `#${h(c.r)}${h(c.g)}${h(c.b)}${c.a < 1 ? h(c.a) : ''}`;
    }
    return String(v);
  }

  protected valoresDe(pv: { valores: Record<string, unknown> }): string {
    return Object.entries(pv.valores)
      .map(([m, v]) => (m === 'Valor' ? this.valorTexto(v) : `${m}: ${this.valorTexto(v)}`))
      .join(' · ');
  }

  protected baixarKcx(): void {
    baixarArquivo(serializar(this.pacote()), `${this.comp().id}.kcx.json`, 'application/json');
  }

  protected baixarCodigo(): void {
    baixarArquivo(
      criarZip(arquivosCodigo(this.comp(), this.valores())),
      `${this.comp().id}-kcx.zip`,
      'application/zip',
    );
  }

  protected baixarTokens(): void {
    baixarArquivo(
      JSON.stringify(tokensW3C(this.comp(), this.valores()), null, 2) + '\n',
      `${this.comp().id}.tokens.json`,
      'application/json',
    );
  }

  protected baixarSvg(): void {
    baixarArquivo(this.svg(), `${this.comp().id}.svg`, 'image/svg+xml');
  }

  /** Baixa o plugin Figma Bridge (arquivos publicados com o lab) como .zip. */
  protected async baixarPlugin(): Promise<void> {
    this.msgPlugin.set('Preparando o plugin…');
    try {
      const base = document.baseURI;
      const arquivos = await Promise.all(
        ARQUIVOS_PLUGIN.map(async (nome) => {
          const r = await fetch(new URL(`figma-bridge/${nome}`, base));
          if (!r.ok) throw new Error(nome);
          return { nome: `kalixto-figma-bridge/${nome}`, conteudo: await r.text() };
        }),
      );
      baixarArquivo(criarZip(arquivos), 'kalixto-figma-bridge.zip', 'application/zip');
      this.msgPlugin.set(
        'Plugin baixado. No Figma: Plugins → Development → Import plugin from manifest…',
      );
    } catch {
      this.msgPlugin.set(
        'Os arquivos do plugin não estão nesta publicação. Rode "npm run figma:build" e use a pasta figma-bridge/dist.',
      );
    }
  }
}

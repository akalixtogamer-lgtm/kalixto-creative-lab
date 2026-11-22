import {
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import {
  Caixa,
  ConfigConstrutor,
  DISPOSITIVOS,
  Dispositivo,
  FIDELIDADES,
  Fidelidade,
  Guia,
  ModoAlinhar,
  TIPOS_CONSTRUTOR,
  Tela,
  alinhar,
  distribuirVertical,
  empilhar,
  encaixar,
  montarDoConstrutor,
  montarTela,
  naoCabem,
  posicoesDaTela,
  slug,
  tipoConstrutor,
} from '../../../kcx/construtor';
import { idLivre } from '../../../kcx/meus-componentes';
import { TROCAS_SUGERIDAS, trocarTipo } from '../../../kcx/projeto/moldes';
import { planejarFigma } from '../../../kcx/figma-plano';
import { KcxComponente } from '../../../kcx/kcx.types';
import { documentoDaTela } from '../../../kcx/plano-html';
import { criarPacote, serializar } from '../../../kcx/serializar';
import { Icon } from '../../../shared/components/icon/icon';
import { KcxEstadoService, baixarArquivo } from '../kcx-estado.service';
import { KcxFundacaoService } from '../kcx-fundacao.service';
import { KcxMeusService } from '../kcx-meus.service';
import { KcxProjetoService, LIMITE_TELAS } from '../kcx-projeto.service';

/**
 * Telas (/kcx/telas): empilha componentes como seções de uma página e mostra
 * num mockup de desktop ou de celular, em wireframe de baixa, média ou alta
 * fidelidade. Exporta para o Figma com cada seção como instância.
 */
@Component({
  selector: 'kx-kcx-telas',
  imports: [RouterLink, Icon],
  templateUrl: './kcx-telas.html',
  styleUrl: './kcx-telas.css',
})
export class KcxTelas {
  /** ?com=<id>: já começa com este componente na tela. */
  readonly com = input<string>();

  private readonly meus = inject(KcxMeusService);
  private readonly fundacaoSrv = inject(KcxFundacaoService);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly dispositivos = Object.entries(DISPOSITIVOS) as [
    Dispositivo,
    (typeof DISPOSITIVOS)[Dispositivo],
  ][];
  protected readonly fidelidades = Object.entries(FIDELIDADES) as [
    Fidelidade,
    (typeof FIDELIDADES)[Fidelidade],
  ][];
  protected readonly zooms = [0.25, 0.4, 0.5, 0.75, 1];

  protected readonly projeto = inject(KcxProjetoService);
  protected readonly limiteTelas = LIMITE_TELAS;
  /** A página aberta (o projeto pode ter várias). */
  protected readonly tela = this.projeto.atual;
  protected readonly zoom = signal(0.5);
  protected readonly disponiveis = computed(() => this.meus.todos());

  constructor() {
    // Componente vindo do editor/montador entra no fim da tela (uma vez).
    effect(() => {
      const id = this.com();
      if (!id || !this.meus.buscar(id)) return;
      untracked(() => {
        if (!this.tela().secoes.includes(id)) this.alterar((t) => t.secoes.push(id));
      });
    });
  }

  private readonly estado = inject(KcxEstadoService);
  /** Seções com os valores editados no editor (ex.: vidro ligado). */
  protected readonly secoes = computed(() =>
    this.tela()
      .secoes.map((id) => this.meus.buscar(id))
      .filter((c): c is KcxComponente => !!c)
      .map((c) => {
        const vals = this.estado.valores(c);
        return {
          ...c,
          variaveis: c.variaveis.map((v) => ({ ...v, valor: vals[v.id] ?? v.valor })),
        };
      }),
  );
  protected readonly dispositivo = computed(() => DISPOSITIVOS[this.tela().dispositivo]);
  protected readonly fidelidade = computed(() => FIDELIDADES[this.tela().fidelidade]);
  protected readonly avisos = computed(() => naoCabem(this.tela(), this.secoes()));

  protected readonly resultado = computed<{ comp?: KcxComponente; erro?: string }>(() => {
    if (!this.secoes().length) return {};
    try {
      return { comp: montarTela(this.tela(), this.secoes(), this.fundacaoSrv.fundacao()) };
    } catch (e) {
      return { erro: (e as Error).message };
    }
  });

  protected readonly documento = computed<SafeHtml | null>(() => {
    const c = this.resultado().comp;
    if (!c) return null;
    try {
      const plano = planejarFigma(criarPacote([c]), 'visual');
      const raiz = plano.componentes.find((x) => x.id === c.id)?.variantes[0]?.arvore;
      if (!raiz) return null;
      return this.sanitizer.bypassSecurityTrustHtml(documentoDaTela(raiz, '#d9d6e6', true));
    } catch {
      return null;
    }
  });

  private alterar(mudar: (t: Tela) => void): void {
    this.projeto.alterarTela(this.tela().id, mudar);
  }

  /* ---------- Páginas do projeto ---------- */
  protected novaPagina(): void {
    this.projeto.novaTela();
  }
  protected excluirPagina(): void {
    const t = this.tela();
    if (t.secoes.length && !globalThis.confirm?.(`Excluir a página "${t.nome}"?`)) return;
    this.projeto.excluir(t.id);
  }

  protected definir<K extends keyof Tela>(campo: K, valor: Tela[K]): void {
    this.alterar((t) => (t[campo] = valor));
    if (campo === 'dispositivo') this.zoom.set(valor === 'celular' ? 1 : 0.5);
  }

  protected adicionar(id: string): void {
    this.alterar((t) => {
      t.secoes.push(id);
      if (t.livre) {
        // Entra embaixo da última seção, centralizada.
        const c = this.meus.buscar(id);
        const W = DISPOSITIVOS[t.dispositivo].largura;
        const fundo = Math.max(
          32,
          ...this.caixas().map((b) => b.y + b.h + 32),
          ...(t.posicoes ?? []).map((p) => p.y + 120),
        );
        t.posicoes = [
          ...posicoesDaTela({ ...t, secoes: t.secoes.slice(0, -1) }, []),
          {
            x: Math.max(0, Math.round((W - Math.min(W, c?.metadados.largura || W)) / 2)),
            y: fundo,
          },
        ];
      }
    });
  }

  /* ---------- Mockup: medidas das seções ---------- */
  private readonly frame = viewChild<ElementRef<HTMLIFrameElement>>('frame');
  /** Onde cada seção está dentro do mockup (px do aparelho) e a rolagem atual. */
  protected readonly caixas = signal<Caixa[]>([]);
  protected readonly rolagem = signal(0);
  protected readonly arrastando = signal<number | null>(null);
  protected readonly alvo = signal<number | null>(null);

  private ouvirMockup = (() => {
    const ouvir = (e: MessageEvent) => {
      if (e.source !== this.frame()?.nativeElement.contentWindow) return;
      const d = (e.data as { kcxTela?: { secoes: unknown; rolagem: unknown } })?.kcxTela;
      if (!d || !Array.isArray(d.secoes)) return;
      this.caixas.set(
        d.secoes
          .filter((b): b is Caixa =>
            ['x', 'y', 'w', 'h'].every((k) => Number.isFinite((b as Record<string, number>)?.[k])),
          )
          .slice(0, 50),
      );
      this.rolagem.set(Number(d.rolagem) || 0);
    };
    globalThis.addEventListener?.('message', ouvir);
    inject(DestroyRef).onDestroy(() => globalThis.removeEventListener?.('message', ouvir));
    return true;
  })();

  /* ---------- Lista: reordenar (arrastar com mouse ou dedo) ---------- */
  protected comecarArrastar(i: number, e: DragEvent): void {
    this.arrastando.set(i);
    e.dataTransfer?.setData('text/plain', String(i));
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
  }
  protected sobre(j: number, e: DragEvent): void {
    if (this.arrastando() === null) return;
    e.preventDefault();
    this.alvo.set(j);
  }
  protected soltar(j: number, e: DragEvent): void {
    e.preventDefault();
    const i = this.arrastando();
    this.terminarArrastar();
    if (i !== null) this.reordenar(i, j);
  }
  protected terminarArrastar(): void {
    this.arrastando.set(null);
    this.alvo.set(null);
  }
  /** Muda a ordem (no modo livre, a ordem é a camada: a última fica por cima). */
  private reordenar(i: number, j: number): void {
    if (i === j) return;
    this.alterar((t) => {
      const [x] = t.secoes.splice(i, 1);
      t.secoes.splice(j, 0, x);
      if (t.posicoes) {
        const [p] = t.posicoes.splice(i, 1);
        if (p) t.posicoes.splice(j, 0, p);
      }
    });
    this.selecionadas.set([j]);
  }
  protected mover(i: number, d: -1 | 1): void {
    const j = i + d;
    if (j >= 0 && j < this.tela().secoes.length) this.reordenar(i, j);
  }
  protected remover(i: number): void {
    this.alterar((t) => {
      t.secoes.splice(i, 1);
      t.posicoes?.splice(i, 1);
    });
    this.selecionadas.set([]);
  }

  /* ---------- Arrastar no mockup (ponteiro: mouse, caneta e toque) ---------- */
  protected readonly livre = computed(() => !!this.tela().livre);
  protected readonly selecionadas = signal<number[]>([]);
  protected readonly guias = signal<Guia[]>([]);
  /** Posições durante o arraste (antes de soltar). */
  protected readonly temporarias = signal<Map<number, { x: number; y: number }> | null>(null);
  protected readonly ima = signal(true);
  private gesto: {
    i: number;
    id: number;
    x0: number;
    y0: number;
    origem: Map<number, { x: number; y: number }>;
    moveu: boolean;
  } | null = null;

  /** Caixa de cada seção como aparece agora (com o arraste em andamento). */
  protected readonly caixasVisiveis = computed<Caixa[]>(() => {
    const tmp = this.temporarias();
    const pos = this.tela().posicoes;
    return this.caixas().map((b, i) => {
      const t = tmp?.get(i);
      if (t) return { ...b, x: t.x, y: t.y };
      const p = this.livre() ? pos?.[i] : undefined;
      return p ? { ...b, x: p.x, y: p.y } : b;
    });
  });

  protected selecionar(i: number, somar: boolean): void {
    const atual = this.selecionadas();
    this.selecionadas.set(
      somar ? (atual.includes(i) ? atual.filter((x) => x !== i) : [...atual, i]) : [i],
    );
  }

  protected tocar(i: number, e: PointerEvent): void {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const somar = e.shiftKey || e.metaKey || e.ctrlKey;
    if (!this.selecionadas().includes(i) || somar) this.selecionar(i, somar);
    try {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      /* ponteiro já solto */
    }
    const cx = this.caixasVisiveis();
    const sel = this.livre() ? this.selecionadas() : [i];
    this.gesto = {
      i,
      id: e.pointerId,
      x0: e.clientX,
      y0: e.clientY,
      origem: new Map(sel.filter((k) => cx[k]).map((k) => [k, { x: cx[k].x, y: cx[k].y }])),
      moveu: false,
    };
    e.preventDefault();
  }

  protected arrastarPonteiro(e: PointerEvent): void {
    const g = this.gesto;
    if (!g || e.pointerId !== g.id) return;
    const z = this.zoom();
    const dx = (e.clientX - g.x0) / z;
    const dy = (e.clientY - g.y0) / z;
    if (!g.moveu && Math.hypot(dx, dy) < 3) return;
    g.moveu = true;
    if (!this.livre()) {
      // Empilhado: o ponteiro escolhe para onde a seção vai na ordem.
      this.arrastando.set(g.i);
      const cx = this.caixas();
      const y = cx[g.i] ? cx[g.i].y + cx[g.i].h / 2 + dy : 0;
      const j = cx.findIndex((b) => y < b.y + b.h / 2);
      this.alvo.set(j === -1 ? cx.length - 1 : j);
      return;
    }
    const base = g.origem.get(g.i)!;
    const caixa = this.caixas()[g.i];
    let ddx = dx;
    let ddy = dy;
    if (this.ima() && !e.altKey && caixa) {
      const outras = this.caixasVisiveis().filter((_, k) => !g.origem.has(k));
      const r = encaixar(
        { ...caixa, x: base.x + dx, y: base.y + dy },
        outras,
        this.dispositivo().largura,
      );
      ddx = r.x - base.x;
      ddy = r.y - base.y;
      this.guias.set(r.guias);
    } else this.guias.set([]);
    const tmp = new Map<number, { x: number; y: number }>();
    for (const [k, o] of g.origem)
      tmp.set(k, { x: Math.round(o.x + ddx), y: Math.max(0, Math.round(o.y + ddy)) });
    this.temporarias.set(tmp);
    // Move já dentro do mockup, sem esperar soltar.
    const win = this.frame()?.nativeElement.contentWindow;
    for (const [k, p] of tmp) win?.postMessage({ kcxMover: { i: k, x: p.x, y: p.y } }, '*');
  }

  protected soltarPonteiro(e: PointerEvent): void {
    const g = this.gesto;
    if (!g || e.pointerId !== g.id) return;
    this.gesto = null;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      /* já liberado */
    }
    this.guias.set([]);
    if (!this.livre()) {
      const j = this.alvo();
      this.terminarArrastar();
      if (g.moveu && j !== null) this.reordenar(g.i, j);
      return;
    }
    const tmp = this.temporarias();
    this.temporarias.set(null);
    if (g.moveu && tmp) this.aplicarPosicoes(tmp);
  }

  /** Grava novas posições (só as que mudaram) e ajusta a altura da página. */
  private aplicarPosicoes(novas: Map<number, { x: number; y: number }>): void {
    const cx = this.caixas();
    this.alterar((t) => {
      const pos = posicoesDaTela(
        t,
        t.secoes.map((id) => this.meus.buscar(id)),
      );
      for (const [k, p] of novas) if (pos[k]) pos[k] = p;
      t.posicoes = pos;
      t.alturaPagina = Math.max(
        DISPOSITIVOS[t.dispositivo].altura,
        ...pos.map((p, k) => p.y + (cx[k]?.h ?? 200) + 32),
      );
    });
  }

  protected tecla(i: number, e: KeyboardEvent): void {
    const passo = e.shiftKey ? 10 : 1;
    const d = {
      ArrowLeft: [-passo, 0],
      ArrowRight: [passo, 0],
      ArrowUp: [0, -passo],
      ArrowDown: [0, passo],
    }[e.key];
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      this.remover(i);
      return;
    }
    if (!d) return;
    e.preventDefault();
    if (!this.livre()) {
      if (d[1]) this.mover(i, d[1] > 0 ? 1 : -1);
      return;
    }
    const sel = this.selecionadas().includes(i) ? this.selecionadas() : [i];
    const cx = this.caixasVisiveis();
    this.aplicarPosicoes(
      new Map(
        sel
          .filter((k) => cx[k])
          .map((k) => [k, { x: cx[k].x + d[0], y: Math.max(0, cx[k].y + d[1]) }]),
      ),
    );
  }

  /* ---------- Modo livre: ligar, alinhar, distribuir ---------- */
  protected definirLivre(livre: boolean): void {
    const cx = this.caixas();
    this.alterar((t) => {
      t.livre = livre;
      if (livre && (!t.posicoes || t.posicoes.length !== t.secoes.length)) {
        // Começa exatamente onde as seções estavam empilhadas.
        t.posicoes =
          cx.length === t.secoes.length
            ? cx.map((b) => ({ x: Math.round(b.x), y: Math.round(b.y) }))
            : posicoesDaTela(
                { ...t, posicoes: undefined },
                t.secoes.map((id) => this.meus.buscar(id)),
              );
        t.alturaPagina = Math.max(
          DISPOSITIVOS[t.dispositivo].altura,
          ...cx.map((b) => b.y + b.h + 32),
        );
      }
    });
  }

  protected alinharSel(modo: ModoAlinhar): void {
    const novas = alinhar(
      this.caixasVisiveis(),
      this.selecionadas(),
      modo,
      this.dispositivo().largura,
    );
    this.aplicarPosicoes(new Map(this.selecionadas().map((k) => [k, novas[k]])));
  }
  protected distribuir(): void {
    const sel =
      this.selecionadas().length > 1 ? this.selecionadas() : this.caixas().map((_, k) => k);
    const novas = distribuirVertical(this.caixasVisiveis(), sel);
    this.aplicarPosicoes(new Map(sel.map((k) => [k, novas[k]])));
  }
  protected reempilhar(): void {
    const novas = empilhar(this.caixas(), this.dispositivo().largura);
    this.aplicarPosicoes(new Map(novas.map((p, k) => [k, p])));
  }
  protected definirXY(eixo: 'x' | 'y', valor: string): void {
    const i = this.selecionadas()[0];
    const n = Math.round(Number(valor));
    const b = this.caixasVisiveis()[i];
    if (i === undefined || !b || !Number.isFinite(n)) return;
    this.aplicarPosicoes(
      new Map([[i, { x: eixo === 'x' ? n : b.x, y: eixo === 'y' ? Math.max(0, n) : b.y }]]),
    );
  }

  /* ---------- Trocar uma seção por outro componente ---------- */
  protected readonly tipos = TIPOS_CONSTRUTOR;
  protected sugestoes(id: string): { id: string; nome: string }[] {
    const cfg = this.meus.buscar(id)?.origemCriacao?.config as ConfigConstrutor | undefined;
    if (!cfg?.tipo) return [];
    const primeiro = TROCAS_SUGERIDAS[cfg.tipo] ?? [];
    return [
      ...primeiro,
      ...TIPOS_CONSTRUTOR.map((t) => t.id).filter((t) => t !== cfg.tipo && !primeiro.includes(t)),
    ].map((t) => ({ id: t, nome: tipoConstrutor(t)?.nome ?? t }));
  }
  protected readonly erroTroca = signal('');
  protected trocar(i: number, valor: string): void {
    this.erroTroca.set('');
    if (!valor) return;
    let novoId = valor.startsWith('comp:') ? valor.slice(5) : '';
    if (valor.startsWith('tipo:')) {
      const atual = this.meus.buscar(this.tela().secoes[i]);
      const cfg = atual?.origemCriacao?.config as ConfigConstrutor | undefined;
      const novo = cfg && trocarTipo(cfg, valor.slice(5));
      if (!novo) return;
      const id = idLivre(slug(`${novo.nome} ${novo.tipo}`), this.meus.ids());
      try {
        const comp = montarDoConstrutor({ ...novo, id });
        const erros = this.meus.salvar(comp);
        if (erros.length) {
          this.erroTroca.set(erros[0]);
          return;
        }
        novoId = id;
      } catch (e) {
        this.erroTroca.set((e as Error).message);
        return;
      }
    }
    if (!novoId || !this.meus.buscar(novoId)) return;
    this.alterar((t) => (t.secoes[i] = novoId));
  }

  protected valor(e: Event): string {
    return (e.target as HTMLInputElement).value;
  }

  /** Pacote com a tela (e as seções como subcomponentes) para o Figma Bridge. */
  protected baixarFigma(): void {
    const c = this.resultado().comp;
    if (!c) return;
    const p = criarPacote([c], { fundacao: this.fundacaoSrv.paraPacote(), nome: c.nome });
    baixarArquivo(serializar(p), `${c.id}.kcx.json`, 'application/json');
  }
}

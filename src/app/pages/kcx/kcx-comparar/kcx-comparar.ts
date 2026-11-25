import {
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { SlicePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  AJUSTES,
  Ajuste,
  Caixa,
  Comportamento,
  CRITERIOS,
  DefinicaoAjuste,
  EASINGS_COMUNS,
  ElementoPar,
  EstadoCriterio,
  GATILHOS,
  GrupoFidelidade,
  Marco,
  MsgEvento,
  PropriedadeAjuste,
  ROTULO_ESTADO,
  ROTULO_GRUPO,
  SessaoComparacao,
  StatusComportamento,
  TIPOS_COMPORTAMENTO,
  TipoComportamento,
  TipoMarco,
  TipoReferencia,
  VersaoReconstrucao,
  LIMITE_FRAMES,
  LIMITE_VERSOES,
  aplicarAjustes,
  aplicarNaTela,
  aprovarVersao,
  assinaturaAjustes,
  avaliarFidelidade,
  caminhoEasing,
  comInspetor,
  comMotionLibrary,
  compararVersoes,
  componenteDaReconstrucao,
  criarVersao,
  definicaoAjuste,
  duplicarVersao,
  formatarTempo,
  idParaNovo,
  lerMsgInspetor,
  naMotionLibrary,
  normalizarAjuste,
  novoIdAjuste,
  novoIdCmp,
  resumir,
  tempoNaReconstrucao,
  tempoNaReferencia,
  urlSegura,
  valorInicial,
  valoresDosAjustes,
  varianteDaReconstrucao,
  MedicaoElemento,
  OndeNaTela,
  TAG_MOTION_LIBRARY,
} from '../../../kcx/comparar';
import { montarDocumentoKcx } from '../../../kcx/documento';
import { KcxComponente, KcxValor } from '../../../kcx/kcx.types';
import { resolverSaidas, valoresAtuais } from '../../../kcx/resolver';
import { Icon } from '../../../shared/components/icon/icon';
import { KcxControles, MudancaVariavel } from '../kcx-controles/kcx-controles';
import { KcxComparacaoService } from '../kcx-comparacao.service';
import { baixarArquivo, lerArquivo } from '../kcx-estado.service';
import { KcxExportarPainel } from '../kcx-exportar-painel/kcx-exportar-painel';
import { KcxMeusService } from '../kcx-meus.service';
import { KcxPreview } from '../kcx-preview/kcx-preview';
import { KcxProjetoService } from '../kcx-projeto.service';
import { extrairFrames, frameDoVideo, framesDeImagens } from './captura';
import { CmpReferencia, Ferramenta, VistaReferencia } from './cmp-referencia';
import { CmpAnalise } from './cmp-analise';

type Modo = 'lado' | 'overlay' | 'sync' | 'interacao';
type Aba = 'referencia' | 'analise' | 'ajustes' | 'fidelidade' | 'versoes' | 'aprovacao';
type Viewport = 'referencia' | 'celular' | 'tablet' | 'desktop';
/** Para onde vai o próximo elemento escolhido na reconstrução. */
type Destino = { tipo: 'ajuste' } | { tipo: 'elemento' | 'marco' | 'comportamento'; id: string };

const VIEWPORTS: Record<
  Exclude<Viewport, 'referencia'>,
  { nome: string; largura: number; altura: number }
> = {
  celular: { nome: 'Celular', largura: 390, altura: 844 },
  tablet: { nome: 'Tablet', largura: 834, altura: 1112 },
  desktop: { nome: 'Desktop', largura: 1440, altura: 900 },
};

/**
 * Reference vs. Reconstruction (/kcx/comparar).
 *
 * Painel A mostra a referência (site, vídeo ou frames, com estados, linha do
 * tempo e anotações). Painel B mostra a reconstrução: um componente KCX
 * com o inspetor embutido. Quatro modos: lado a lado, overlay, motion sync e
 * teste de interação. Embaixo: análise da referência, ajustes, fidelidade,
 * versões e aprovação.
 */
@Component({
  selector: 'kx-kcx-comparar',
  imports: [
    RouterLink,
    SlicePipe,
    Icon,
    KcxPreview,
    KcxControles,
    KcxExportarPainel,
    CmpReferencia,
    CmpAnalise,
  ],
  templateUrl: './kcx-comparar.html',
  styleUrls: ['./kcx-comparar.css', './kcx-comparar-paineis.css'],
})
export class KcxComparar {
  private readonly cmp = inject(KcxComparacaoService);
  private readonly meus = inject(KcxMeusService);
  private readonly projeto = inject(KcxProjetoService);
  private readonly rota = inject(ActivatedRoute);

  protected readonly sessoes = this.cmp.sessoes;
  protected readonly sessao = this.cmp.atual;
  protected readonly carregado = this.cmp.carregado;
  protected readonly avisoArmazenamento = this.cmp.aviso;
  protected readonly componentes = this.meus.todos;
  protected readonly telas = this.projeto.telas;

  protected readonly ajustesDisponiveis = AJUSTES;
  protected readonly gruposAjuste = [...new Set(AJUSTES.map((a) => a.grupo))];
  protected readonly gatilhos = GATILHOS;
  protected readonly easings = EASINGS_COMUNS;
  protected readonly tiposComportamento = TIPOS_COMPORTAMENTO;
  protected readonly rotuloEstado = ROTULO_ESTADO;
  protected readonly rotuloGrupo = ROTULO_GRUPO;
  protected readonly grupos: GrupoFidelidade[] = ['visual', 'comportamental', 'tecnica'];
  protected readonly viewports = VIEWPORTS;
  protected readonly limiteFrames = LIMITE_FRAMES;
  protected readonly limiteVersoes = LIMITE_VERSOES;
  protected readonly fmt = formatarTempo;
  protected readonly caminhoEasing = caminhoEasing;

  /* ============================== Sessão ============================== */

  protected readonly nomeNova = signal('');
  protected readonly componenteNova = signal('');
  protected readonly msg = signal('');

  protected criarSessao(): void {
    const comp = this.componenteNova() || this.componentes()[0]?.id;
    if (!comp) return;
    const s = this.cmp.criar(this.nomeNova() || 'Nova comparação', comp);
    if (s) {
      this.nomeNova.set('');
      this.aba.set('referencia');
    }
  }

  protected selecionarSessao(id: string): void {
    this.cmp.selecionar(id);
  }

  protected renomear(nome: string): void {
    const n = nome.trim().slice(0, 120);
    if (n) this.alterar((s) => (s.nome = n));
  }

  protected excluirSessao(): void {
    const s = this.sessao();
    if (
      s &&
      confirm(`Excluir a comparação “${s.nome}”? A referência e as versões somem deste navegador.`)
    )
      this.cmp.excluir(s.id);
  }

  protected exportarSessao(): void {
    const s = this.sessao();
    if (!s) return;
    baixarArquivo(
      JSON.stringify(s, null, 2) + '\n',
      `${idParaNovo(s.nome, [])}.kcx-comparacao.json`,
      'application/json',
    );
  }

  protected async importarSessao(e: Event): Promise<void> {
    const texto = await lerArquivo(e);
    if (!texto) return;
    try {
      const s = this.cmp.importar(JSON.parse(texto));
      this.msg.set(
        s
          ? `Comparação “${s.nome}” importada (o vídeo não vem no arquivo: envie de novo).`
          : 'Arquivo não é uma comparação KCX.',
      );
    } catch {
      this.msg.set('Arquivo não é um JSON válido.');
    }
  }

  private alterar(mudar: (s: SessaoComparacao) => void): void {
    this.cmp.alterar(mudar);
  }

  /* ============================== Reconstrução ============================== */

  protected readonly base = computed<KcxComponente | undefined>(() => {
    const s = this.sessao();
    return s ? this.meus.buscar(s.atual.componenteId) : undefined;
  });
  protected readonly ajustes = computed<Ajuste[]>(() => this.sessao()?.atual.ajustes ?? []);
  protected readonly comp = computed<KcxComponente | null>(() => {
    const b = this.base();
    return b ? aplicarAjustes(b, this.ajustes()).comp : null;
  });
  protected readonly valoresBase = computed<Record<string, KcxValor>>(() => {
    const b = this.base();
    return b ? { ...valoresAtuais(b.variaveis), ...(this.sessao()?.atual.valores ?? {}) } : {};
  });
  protected readonly valores = computed(() => ({
    ...this.valoresBase(),
    ...valoresDosAjustes(this.ajustes()),
  }));
  protected readonly saidas = computed(() => {
    const c = this.comp();
    return c
      ? resolverSaidas(c.variaveis, this.valores())
      : { cssVars: {}, atributos: [], textos: [] };
  });
  /** Muda só quando o CÓDIGO muda (componente, seletores, propriedades): valores não recarregam. */
  private readonly assinatura = computed(
    () =>
      `${this.base()?.id ?? ''}§${this.base()?.metadados.atualizadoEm ?? ''}§${assinaturaAjustes(this.ajustes())}§${this.fundoTransparente()}`,
  );
  protected readonly documento = computed(() => {
    this.assinatura();
    return untracked(() => {
      const c = this.comp();
      if (!c) return '';
      return comInspetor(
        montarDocumentoKcx(c, this.valores(), {
          modo: 'preview',
          ...(this.fundoTransparente() ? { fundo: 'transparent' } : {}),
        }),
      );
    });
  });

  protected trocarComponente(id: string): void {
    if (!this.meus.buscar(id)) return;
    this.alterar((s) => {
      s.atual.componenteId = id;
      s.atual.valores = {};
    });
    this.selecionado.set(null);
  }

  protected mudarVariavel(m: MudancaVariavel): void {
    this.alterar((s) => (s.atual.valores[m.id] = m.valor));
  }

  protected restaurarVariaveis(): void {
    this.alterar((s) => (s.atual.valores = {}));
  }

  /* ============================== Palco ============================== */

  protected readonly modo = signal<Modo>('lado');
  protected readonly viewport = signal<Viewport>('referencia');
  protected readonly zoom = signal(0.5);
  protected readonly split = signal(50);
  protected readonly vista = signal<VistaReferencia>('video');
  protected readonly frameId = signal('');
  protected readonly ferramenta = signal<Ferramenta>('nenhuma');
  protected readonly videoUrl = signal('');
  protected readonly erroVideo = signal('');

  private readonly palco = viewChild<ElementRef<HTMLElement>>('palco');
  private readonly refPainel = viewChild<CmpReferencia>('refPainel');
  private readonly preview = viewChild<KcxPreview>('preview');

  protected readonly referencia = computed(() => this.sessao()?.referencia ?? null);

  protected readonly largura = computed(() => {
    const v = this.viewport();
    if (v !== 'referencia') return VIEWPORTS[v].largura;
    const r = this.referencia();
    return r && r.tipo !== 'url' ? Math.round(r.largura) : 1440;
  });
  protected readonly altura = computed(() => {
    const r = this.referencia();
    const v = this.viewport();
    if (r && r.tipo !== 'url' && r.largura > 0)
      return Math.round((this.largura() * r.altura) / r.largura);
    return v === 'referencia' ? 900 : VIEWPORTS[v].altura;
  });
  protected readonly frameAtual = computed(() => {
    const r = this.referencia();
    if (!r) return null;
    return r.frames.find((f) => f.id === this.frameId()) ?? r.frames[0] ?? null;
  });

  protected readonly fundoTransparente = signal(false);
  protected readonly opacidade = signal(0.5);
  protected readonly mistura = signal<'normal' | 'difference'>('normal');
  protected readonly alinhamento = computed(
    () => this.sessao()?.alinhamento ?? { x: 0, y: 0, escala: 1 },
  );

  protected definirAlinhamento(campo: 'x' | 'y' | 'escala', bruto: string | number): void {
    const n = Number(bruto);
    if (!Number.isFinite(n)) return;
    const lim = campo === 'escala' ? [0.05, 10] : [-5000, 5000];
    this.alterar((s) => (s.alinhamento[campo] = Math.min(lim[1], Math.max(lim[0], n))));
  }

  protected empurrar(dx: number, dy: number): void {
    const a = this.alinhamento();
    this.alterar((s) => {
      s.alinhamento.x = a.x + dx;
      s.alinhamento.y = a.y + dy;
    });
  }

  protected zerarAlinhamento(): void {
    this.alterar((s) => (s.alinhamento = { x: 0, y: 0, escala: 1 }));
  }

  protected ajustarZoom(): void {
    const el = this.palco()?.nativeElement;
    if (!el) return;
    const disponivel =
      this.modo() === 'overlay' ? el.clientWidth - 24 : (el.clientWidth * this.split()) / 100 - 32;
    // Cabe na largura do painel e na altura da janela (referências em pé, como stories).
    const alturaUtil = Math.max(240, window.innerHeight * 0.72);
    const z = Math.min(
      1.5,
      Math.max(0.1, Math.min(disponivel / this.largura(), alturaUtil / this.altura())),
    );
    this.zoom.set(Math.round(z * 100) / 100);
  }

  protected mudarModo(m: Modo): void {
    this.modo.set(m);
    this.fundoTransparente.set(m === 'overlay' && this.fundoTransparente());
    this.preview()?.mandar({ kcxCmp: 'log', ativo: m === 'interacao' });
    if (m !== 'sync') this.soltarSync();
    queueMicrotask(() => this.ajustarZoom());
  }

  /* ---------- divisor do lado a lado ---------- */
  protected arrastarDivisor(e: PointerEvent): void {
    const palco = this.palco()?.nativeElement;
    if (!palco) return;
    const alvo = e.currentTarget as HTMLElement;
    alvo.setPointerCapture(e.pointerId);
    const r = palco.getBoundingClientRect();
    const mover = (ev: PointerEvent) =>
      this.split.set(Math.min(85, Math.max(15, ((ev.clientX - r.left) / r.width) * 100)));
    const parar = () => {
      alvo.removeEventListener('pointermove', mover);
      alvo.removeEventListener('pointerup', parar);
    };
    alvo.addEventListener('pointermove', mover);
    alvo.addEventListener('pointerup', parar);
  }

  protected teclaDivisor(e: KeyboardEvent): void {
    if (e.key === 'ArrowLeft') this.split.update((x) => Math.max(15, x - 2));
    if (e.key === 'ArrowRight') this.split.update((x) => Math.min(85, x + 2));
  }

  /* ============================== Referência ============================== */

  protected readonly urlDigitada = signal('');
  protected readonly quantosFrames = signal(8);
  protected readonly trabalhando = signal('');

  protected definirTipo(t: TipoReferencia): void {
    this.alterar((s) => (s.referencia.tipo = t));
    this.vista.set(t === 'url' ? 'site' : t === 'video' ? 'video' : 'frame');
  }

  protected abrirUrl(): void {
    let u = this.urlDigitada().trim();
    if (u && !/^https?:\/\//i.test(u)) u = `https://${u}`;
    if (!urlSegura(u, location.origin)) {
      this.msg.set(
        'Use um endereço http(s) de outro site (o próprio lab não pode ser a referência).',
      );
      return;
    }
    this.alterar((s) => {
      s.referencia.tipo = 'url';
      s.referencia.url = u;
      s.referencia.nome = new URL(u).hostname;
      s.referencia.largura = this.largura();
      s.referencia.altura = this.altura();
    });
    this.vista.set('site');
    this.msg.set('');
  }

  protected async enviarVideo(e: Event): Promise<void> {
    const input = e.target as HTMLInputElement;
    const arq = input.files?.[0];
    input.value = '';
    const s = this.sessao();
    if (!arq || !s) return;
    if (!arq.type.startsWith('video/')) {
      this.msg.set('Escolha um arquivo de vídeo (MP4, WebM ou MOV).');
      return;
    }
    this.erroVideo.set('');
    this.trocarVideo(URL.createObjectURL(arq));
    const chave = await this.cmp.salvarVideo(s.id, arq);
    this.alterar((x) => {
      x.referencia.tipo = 'video';
      x.referencia.nome = arq.name.replace(/\.[^.]+$/, '');
      x.referencia.videoNome = arq.name;
      if (chave) x.referencia.videoChave = chave;
      else delete x.referencia.videoChave;
    });
    this.vista.set('video');
    this.msg.set(
      chave ? '' : 'Vídeo grande demais para guardar no navegador: ele vale até recarregar.',
    );
  }

  private trocarVideo(url: string): void {
    const antigo = this.videoUrl();
    if (antigo) URL.revokeObjectURL(antigo);
    this.videoUrl.set(url);
  }

  protected aoCarregarVideo(m: { duracao: number; largura: number; altura: number }): void {
    this.alterar((s) => {
      s.referencia.duracao = Math.round(m.duracao * 1000) / 1000;
      s.referencia.largura = m.largura;
      s.referencia.altura = m.altura;
    });
    queueMicrotask(() => this.ajustarZoom());
  }

  protected async extrair(): Promise<void> {
    const url = this.videoUrl();
    if (!url) return;
    this.trabalhando.set('Extraindo frames…');
    try {
      const frames = await extrairFrames(url, this.quantosFrames());
      this.alterar(
        (s) => (s.referencia.frames = [...s.referencia.frames, ...frames].slice(-LIMITE_FRAMES)),
      );
      this.frameId.set(frames[0]?.id ?? '');
    } catch (err) {
      this.msg.set((err as Error).message);
    } finally {
      this.trabalhando.set('');
    }
  }

  protected capturarAgora(): void {
    const v = this.refPainel()?.elementoVideo;
    if (!v || !v.videoWidth) return;
    const f = frameDoVideo(v, `${formatarTempo(v.currentTime)}`);
    this.alterar((s) => (s.referencia.frames = [...s.referencia.frames, f].slice(-LIMITE_FRAMES)));
    this.frameId.set(f.id);
  }

  protected async enviarImagens(e: Event): Promise<void> {
    const input = e.target as HTMLInputElement;
    const arqs = [...(input.files ?? [])];
    input.value = '';
    if (!arqs.length) return;
    this.trabalhando.set('Lendo imagens…');
    try {
      const frames = await framesDeImagens(arqs);
      if (!frames.length) return;
      this.alterar((s) => {
        s.referencia.frames = [...s.referencia.frames, ...frames].slice(-LIMITE_FRAMES);
        if (s.referencia.tipo !== 'video') {
          s.referencia.tipo = s.referencia.tipo === 'url' ? 'url' : 'frames';
          if (s.referencia.tipo === 'frames') {
            s.referencia.largura = frames[0].largura;
            s.referencia.altura = frames[0].altura;
          }
        }
      });
      this.frameId.set(frames[0].id);
      this.vista.set('frame');
    } finally {
      this.trabalhando.set('');
    }
  }

  protected removerFrame(id: string): void {
    this.alterar((s) => {
      s.referencia.frames = s.referencia.frames.filter((f) => f.id !== id);
      for (const e of s.referencia.elementos) if (e.frameId === id) delete e.frameId;
    });
  }

  protected verFrame(id: string): void {
    this.frameId.set(id);
    this.vista.set('frame');
    const f = this.referencia()?.frames.find((x) => x.id === id);
    if (f?.tempo != null) this.refPainel()?.irPara(f.tempo);
  }

  /* ---------- marcos (sequência temporal) ---------- */

  protected readonly tiposMarco: { id: TipoMarco; nome: string }[] = [
    { id: 'estado', nome: 'Estado' },
    { id: 'efeito', nome: 'Efeito' },
    { id: 'interacao', nome: 'Interação' },
  ];

  protected readonly marcos = computed(() =>
    [...(this.referencia()?.marcos ?? [])].sort(
      (a, b) => (a.ref ?? Infinity) - (b.ref ?? Infinity),
    ),
  );

  protected novoMarco(tipo: TipoMarco = 'estado'): void {
    const tRef = this.tempoRef();
    const m: Marco = {
      id: novoIdCmp('marco'),
      nome: `${tipo === 'efeito' ? 'Efeito' : tipo === 'interacao' ? 'Interação' : 'Estado'} ${(this.referencia()?.marcos.length ?? 0) + 1}`,
      tipo,
      ref: this.referencia()?.tipo === 'video' ? Math.round(tRef * 100) / 100 : null,
      rec: null,
    };
    if (this.vista() === 'frame' && this.frameAtual()) m.frameId = this.frameAtual()!.id;
    this.alterar((s) => s.referencia.marcos.push(m));
  }

  protected mudarMarco<K extends keyof Marco>(id: string, campo: K, valor: Marco[K]): void {
    this.alterar((s) => {
      const m = s.referencia.marcos.find((x) => x.id === id);
      if (!m) return;
      if (valor === undefined || valor === '') delete m[campo];
      else m[campo] = valor;
    });
  }

  protected tempoDigitado(
    id: string,
    campo: 'ref' | 'refFim' | 'rec' | 'recFim',
    bruto: string,
  ): void {
    const t = bruto.trim() === '' ? null : Number(bruto.replace(',', '.'));
    if (t !== null && !(Number.isFinite(t) && t >= 0)) return;
    this.mudarMarco(id, campo, t);
  }

  /** "Agora": usa o tempo atual do vídeo (ref) ou da reconstrução (rec). */
  protected marcarAgora(id: string, campo: 'ref' | 'refFim' | 'rec' | 'recFim'): void {
    const t = campo.startsWith('ref') ? this.tempoRef() : this.tempoRec() / 1000;
    this.mudarMarco(id, campo, Math.round(t * 100) / 100);
  }

  protected removerMarco(id: string): void {
    this.alterar((s) => (s.referencia.marcos = s.referencia.marcos.filter((m) => m.id !== id)));
  }

  /* ---------- elementos (anotações) ---------- */

  protected readonly elementoAtivo = signal('');

  protected novoElemento(): void {
    const e: ElementoPar = {
      id: novoIdCmp('el'),
      nome: `Elemento ${(this.referencia()?.elementos.length ?? 0) + 1}`,
    };
    if (this.frameAtual()) e.frameId = this.frameAtual()!.id;
    this.alterar((s) => s.referencia.elementos.push(e));
    this.elementoAtivo.set(e.id);
  }

  protected mudarElemento<K extends keyof ElementoPar>(
    id: string,
    campo: K,
    valor: ElementoPar[K] | undefined,
  ): void {
    this.alterar((s) => {
      const e = s.referencia.elementos.find((x) => x.id === id);
      if (!e) return;
      if (
        valor === undefined ||
        valor === '' ||
        (typeof valor === 'number' && !Number.isFinite(valor))
      )
        delete e[campo];
      else e[campo] = valor;
    });
  }

  protected numeroElemento(
    id: string,
    campo: 'fonteRef' | 'pesoRef' | 'camadaRef',
    bruto: string,
  ): void {
    const n = Number(bruto.replace(',', '.'));
    this.mudarElemento(id, campo, bruto.trim() && n > 0 ? n : undefined);
  }

  protected removerElemento(id: string): void {
    this.alterar(
      (s) => (s.referencia.elementos = s.referencia.elementos.filter((e) => e.id !== id)),
    );
  }

  protected usarFerramenta(f: Ferramenta, elementoId: string): void {
    this.elementoAtivo.set(elementoId);
    this.ferramenta.set(this.ferramenta() === f ? 'nenhuma' : f);
    if (f !== 'nenhuma' && this.vista() === 'site')
      this.vista.set(this.frameAtual() ? 'frame' : 'video');
  }

  protected caixaDesenhada(c: Caixa): void {
    const id = this.elementoAtivo();
    const frame = this.vista() === 'frame' ? this.frameAtual() : null;
    this.alterar((s) => {
      const e = s.referencia.elementos.find((x) => x.id === id);
      if (!e) return;
      e.caixaRef = c;
      if (frame) e.frameId = frame.id;
      else delete e.frameId;
    });
    this.ferramenta.set('nenhuma');
  }

  protected corColhida(cor: string): void {
    const id = this.elementoAtivo();
    this.alterar((s) => {
      const e = s.referencia.elementos.find((x) => x.id === id);
      if (e) {
        e.corRef = cor;
        e.corAlvo ??= 'texto';
      }
    });
    this.ferramenta.set('nenhuma');
  }

  /* ============================== Inspetor (Painel B) ============================== */

  protected readonly inspecionando = signal(false);
  protected readonly destino = signal<Destino>({ tipo: 'ajuste' });
  protected readonly selecionado = signal<{
    seletor: string;
    nome: string;
    medicao?: MedicaoElemento;
  } | null>(null);
  protected readonly eventos = signal<(MsgEvento & { quando: number })[]>([]);
  private esperandoMedidas: ((ok: boolean) => void) | null = null;

  protected escolherNaReconstrucao(d: Destino): void {
    this.destino.set(d);
    this.inspecionando.set(true);
    this.preview()?.mandar({ kcxCmp: 'inspecionar', ativo: true });
  }

  protected pararInspecao(): void {
    this.inspecionando.set(false);
    this.preview()?.mandar({ kcxCmp: 'inspecionar', ativo: false });
  }

  protected destacar(seletor: string, rotulo?: string): void {
    this.preview()?.mandar({ kcxCmp: 'destacar', seletor, rotulo });
  }

  protected aoMensagem(dado: unknown): void {
    const m = lerMsgInspetor(dado);
    if (!m) return;
    switch (m.kcxCmp) {
      case 'selecionado': {
        this.pararInspecao();
        const d = this.destino();
        if (d.tipo === 'ajuste') {
          this.selecionado.set({ seletor: m.seletor, nome: m.nome, medicao: m.medicao });
          this.aba.set('ajustes');
        } else if (d.tipo === 'elemento') this.mudarElemento(d.id, 'seletorRec', m.seletor);
        else if (d.tipo === 'marco') this.mudarMarco(d.id, 'seletorRec', m.seletor);
        else this.mudarComportamento(d.id, 'seletorRec', m.seletor);
        this.destino.set({ tipo: 'ajuste' });
        break;
      }
      case 'medidas':
        this.alterar((s) => {
          const vps = (s.medicoes?.viewports ?? []).filter((v) => v.largura !== m.viewport.largura);
          s.medicoes = {
            palco: m.palco,
            elementos: { ...(s.medicoes?.elementos ?? {}), ...m.elementos },
            viewports: [...vps, m.viewport].sort((a, b) => a.largura - b.largura).slice(-6),
          };
        });
        this.esperandoMedidas?.(true);
        this.esperandoMedidas = null;
        break;
      case 'tempo':
        this.tempoRec.set(m.ms);
        if (m.total > 0) this.totalRec.set(m.total);
        break;
      case 'evento':
        if (this.modo() === 'interacao')
          this.eventos.update((l) => [{ ...m, quando: Date.now() }, ...l].slice(0, 40));
        break;
    }
  }

  /* ============================== Motion sync ============================== */

  protected readonly tempoRef = signal(0);
  protected readonly tempoRec = signal(0);
  protected readonly totalRec = signal(0);
  protected readonly tocandoSync = signal(false);
  protected readonly velocidadeSync = signal(1);
  protected readonly velocidades = [0.1, 0.25, 0.5, 1, 1.5, 2];
  private quadro = 0;

  protected readonly duracaoRef = computed(() => this.referencia()?.duracao ?? 0);
  protected readonly paresSync = computed(
    () => (this.referencia()?.marcos ?? []).filter((m) => m.ref !== null && m.rec !== null).length,
  );
  /** Escala da régua: o maior entre a referência e o equivalente na reconstrução. */
  protected readonly fimRegua = computed(() =>
    Math.max(
      this.duracaoRef(),
      0.5,
      tempoNaReferencia(this.totalRec() / 1000, this.referencia()?.marcos ?? []),
    ),
  );

  private recPara(tRef: number): number {
    return tempoNaReconstrucao(tRef, this.referencia()?.marcos ?? []) * 1000;
  }

  protected irParaSync(tRef: number): void {
    const t = Math.max(0, tRef);
    this.tempoRef.set(t);
    this.refPainel()?.irPara(t);
    this.preview()?.mandar({ kcxCmp: 'irPara', ms: this.recPara(t) });
  }

  protected alternarSync(): void {
    if (this.tocandoSync()) {
      this.tocandoSync.set(false);
      this.refPainel()?.pausar();
      cancelAnimationFrame(this.quadro);
      return;
    }
    this.tocandoSync.set(true);
    const painel = this.refPainel();
    const temVideo = !!painel?.elementoVideo && this.vista() === 'video';
    painel?.velocidade(this.velocidadeSync());
    if (temVideo) painel?.tocar();
    let antes = performance.now();
    const passo = (agora: number) => {
      if (!this.tocandoSync()) return;
      const dt = ((agora - antes) / 1000) * this.velocidadeSync();
      antes = agora;
      // Com vídeo, o relógio é o do vídeo (tempo real); sem vídeo, um relógio próprio.
      const t = temVideo ? (painel?.tempoAtual ?? 0) : this.tempoRef() + dt;
      if (t >= this.fimRegua() && !(temVideo && painel?.tocando)) {
        this.tocandoSync.set(false);
        return;
      }
      this.tempoRef.set(t);
      this.preview()?.mandar({ kcxCmp: 'irPara', ms: this.recPara(t) });
      this.quadro = requestAnimationFrame(passo);
    };
    this.quadro = requestAnimationFrame(passo);
  }

  protected reiniciarSync(): void {
    this.tocandoSync.set(false);
    cancelAnimationFrame(this.quadro);
    this.refPainel()?.pausar();
    this.irParaSync(0);
  }

  protected mudarVelocidadeSync(v: number): void {
    this.velocidadeSync.set(v);
    this.refPainel()?.velocidade(v);
  }

  /** Avança para o próximo (ou anterior) estado/marco. */
  protected passoEstado(direcao: 1 | -1): void {
    const ms = this.marcos().filter((m) => m.ref !== null || m.rec !== null);
    if (!ms.length) return;
    const t = this.tempoRef();
    const tempoDe = (m: Marco) =>
      m.ref ?? tempoNaReferencia(m.rec ?? 0, this.referencia()?.marcos ?? []);
    const alvo =
      direcao === 1
        ? ms.find((m) => tempoDe(m) > t + 0.01)
        : [...ms].reverse().find((m) => tempoDe(m) < t - 0.01);
    if (!alvo) return;
    if (alvo.frameId && this.vista() === 'frame') this.frameId.set(alvo.frameId);
    if (alvo.ref === null && alvo.rec !== null) {
      // Marco só da reconstrução (referência interativa): vai direto ao tempo dela.
      this.tempoRef.set(tempoDe(alvo));
      this.preview()?.mandar({ kcxCmp: 'irPara', ms: alvo.rec * 1000 });
    } else this.irParaSync(tempoDe(alvo));
  }

  private soltarSync(): void {
    this.tocandoSync.set(false);
    cancelAnimationFrame(this.quadro);
    this.preview()?.mandar({ kcxCmp: 'soltar' });
  }

  protected posicao(t: number | null | undefined): number {
    return t == null ? 0 : Math.min(100, (t / this.fimRegua()) * 100);
  }

  protected clicarRegua(e: MouseEvent): void {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    this.irParaSync(((e.clientX - r.left) / r.width) * this.fimRegua());
  }

  /* ============================== Interaction test ============================== */

  protected novoComportamento(tipo: TipoComportamento = 'hover'): void {
    const c: Comportamento = {
      id: novoIdCmp('comp'),
      tipo,
      descricao: TIPOS_COMPORTAMENTO.find((t) => t.id === tipo)!.nome,
      status: 'nao-testado',
    };
    this.alterar((s) => s.referencia.comportamentos.push(c));
  }

  protected mudarComportamento<K extends keyof Comportamento>(
    id: string,
    campo: K,
    valor: Comportamento[K] | undefined,
  ): void {
    this.alterar((s) => {
      const c = s.referencia.comportamentos.find((x) => x.id === id);
      if (!c) return;
      if (valor === undefined || valor === '') delete c[campo];
      else c[campo] = valor;
    });
  }

  protected removerComportamento(id: string): void {
    this.alterar(
      (s) => (s.referencia.comportamentos = s.referencia.comportamentos.filter((c) => c.id !== id)),
    );
  }

  /** Último evento do log que combina com o comportamento (tipo e elemento). */
  protected eventoDe(c: Comportamento): (MsgEvento & { quando: number }) | undefined {
    const tipos: Record<TipoComportamento, string[]> = {
      hover: ['hover'],
      scroll: ['scroll'],
      clique: ['clique'],
      arrastar: ['arrastar'],
      expandir: ['clique'],
      recolher: ['clique'],
      transicao: ['hover', 'clique', 'scroll'],
      navegacao: ['navegacao', 'clique'],
    };
    return this.eventos().find(
      (e) =>
        tipos[c.tipo].includes(e.tipo) &&
        (!c.seletorRec ||
          e.seletor === c.seletorRec ||
          e.seletor.startsWith(c.seletorRec) ||
          c.seletorRec.startsWith(e.seletor)) &&
        e.efeitos.length > 0,
    );
  }

  protected usarEvidencia(c: Comportamento): void {
    const e = this.eventoDe(c);
    if (!e) return;
    this.alterar((s) => {
      const x = s.referencia.comportamentos.find((y) => y.id === c.id);
      if (!x) return;
      x.evidencia = `${e.tipo} em ${e.seletor} → ${e.efeitos.join('; ')}`.slice(0, 600);
      if (x.status === 'nao-testado') x.status = 'reproduzido';
      x.seletorRec ??= e.seletor;
    });
  }

  protected readonly contagemComportamentos = computed(() => {
    const l = this.referencia()?.comportamentos ?? [];
    const n = (st: StatusComportamento) => l.filter((c) => c.status === st).length;
    return {
      reproduzido: n('reproduzido'),
      difere: n('difere'),
      falta: n('nao-implementado'),
      naoTestado: n('nao-testado'),
    };
  });

  /* ============================== Ajustes ============================== */

  protected readonly ajustesPorElemento = computed(() => {
    const mapa = new Map<string, { seletor: string; elemento: string; itens: Ajuste[] }>();
    for (const a of this.ajustes()) {
      const g = mapa.get(a.seletor) ?? { seletor: a.seletor, elemento: a.elemento, itens: [] };
      g.itens.push(a);
      mapa.set(a.seletor, g);
    }
    return [...mapa.values()];
  });

  protected definicao(p: PropriedadeAjuste): DefinicaoAjuste {
    return definicaoAjuste(p);
  }

  protected opcoesAjuste(a: Ajuste): { valor: string; rotulo: string }[] {
    if (a.propriedade === 'gatilho') return GATILHOS;
    const base = EASINGS_COMUNS.map((e) => ({ valor: e.valor, rotulo: e.nome }));
    const v = String(a.valor);
    return base.some((o) => o.valor === v)
      ? base
      : [{ valor: v, rotulo: `${v} (medido)` }, ...base];
  }

  protected adicionarAjuste(p: PropriedadeAjuste): void {
    const sel = this.selecionado();
    if (!sel) return;
    const ja = this.ajustes().find(
      (a) => a.seletor === sel.seletor && a.propriedade === p && a.escopo.tipo === 'todos',
    );
    if (ja) {
      document.getElementById(`aj-${ja.id}`)?.focus();
      return;
    }
    const m = sel.medicao ?? this.sessao()?.medicoes?.elementos[sel.seletor];
    const a: Ajuste = {
      id: novoIdAjuste(),
      seletor: sel.seletor,
      elemento: sel.nome.replace(/[“”"]/g, '').slice(0, 40) || 'Elemento',
      propriedade: p,
      valor: valorInicial(p, m),
      escopo: { tipo: 'todos' },
    };
    if (p === 'velocidade') a.base = m?.animacoes[0]?.duracao || m?.transicoes[0]?.duracao || 1000;
    this.alterar((s) => s.atual.ajustes.push(normalizarAjuste(a)));
  }

  protected mudarAjuste(id: string, bruto: unknown): void {
    this.alterar((s) => {
      const i = s.atual.ajustes.findIndex((a) => a.id === id);
      if (i === -1) return;
      const a = s.atual.ajustes[i];
      const d = definicaoAjuste(a.propriedade);
      const valor = d.tipo === 'color' || d.tipo === 'enum' ? String(bruto) : Number(bruto);
      s.atual.ajustes[i] = normalizarAjuste({ ...a, valor });
    });
  }

  protected mudarEscopo(id: string, tipo: string, largura?: string): void {
    this.alterar((s) => {
      const i = s.atual.ajustes.findIndex((a) => a.id === id);
      if (i === -1) return;
      const a = s.atual.ajustes[i];
      const t = tipo === 'ate' || tipo === 'acima' ? tipo : 'todos';
      s.atual.ajustes[i] = normalizarAjuste({
        ...a,
        escopo: {
          tipo: t,
          largura: largura !== undefined ? Number(largura) : (a.escopo.largura ?? 768),
        },
      });
    });
  }

  protected removerAjuste(id: string): void {
    this.alterar((s) => (s.atual.ajustes = s.atual.ajustes.filter((a) => a.id !== id)));
  }

  protected selecionarSeletor(seletor: string, nome?: string): void {
    const med = this.sessao()?.medicoes?.elementos[seletor];
    const aj = this.ajustes().find((a) => a.seletor === seletor);
    this.selecionado.set({
      seletor,
      nome: nome ?? aj?.elemento ?? seletor,
      ...(med ? { medicao: med } : {}),
    });
    this.destacar(seletor, nome);
    this.aba.set('ajustes');
  }

  /* ============================== Fidelidade ============================== */

  protected readonly resultados = computed(() => {
    const s = this.sessao();
    return s ? avaliarFidelidade(s, this.comp() ?? undefined) : [];
  });
  protected readonly resumo = computed(() => resumir(this.resultados()));
  protected readonly criteriosPorGrupo = computed(() =>
    this.grupos.map((g) => ({ grupo: g, itens: this.resultados().filter((r) => r.grupo === g) })),
  );
  protected readonly medindo = signal(false);

  /** Seletores que interessam medir (pares, marcos, comportamentos, ajustes). */
  private seletores(): string[] {
    const s = this.sessao();
    if (!s) return [];
    return [
      ...new Set(
        [
          ...s.referencia.elementos.map((e) => e.seletorRec),
          ...s.referencia.marcos.map((m) => m.seletorRec),
          ...s.referencia.comportamentos.map((c) => c.seletorRec),
          ...s.atual.ajustes.map((a) => a.seletor),
        ].filter((x): x is string => !!x),
      ),
    ];
  }

  private pedirMedidas(): Promise<boolean> {
    return new Promise((ok) => {
      this.esperandoMedidas = ok;
      this.preview()?.mandar({ kcxCmp: 'medir', seletores: this.seletores() });
      setTimeout(() => {
        if (this.esperandoMedidas === ok) {
          this.esperandoMedidas = null;
          ok(false);
        }
      }, 2500);
    });
  }

  protected async medir(): Promise<void> {
    this.medindo.set(true);
    const ok = await this.pedirMedidas();
    this.medindo.set(false);
    if (!ok)
      this.msg.set('A reconstrução não respondeu. Espere o preview carregar e tente de novo.');
  }

  /** Mede em celular, tablet e desktop e volta ao viewport de antes. */
  protected async medirViewports(): Promise<void> {
    const antes = this.viewport();
    this.medindo.set(true);
    for (const v of ['celular', 'tablet', 'desktop'] as const) {
      this.viewport.set(v);
      await new Promise((r) => setTimeout(r, 450));
      await this.pedirMedidas();
    }
    this.viewport.set(antes);
    await new Promise((r) => setTimeout(r, 300));
    await this.pedirMedidas();
    this.medindo.set(false);
  }

  protected classeEstado(e: EstadoCriterio): string {
    return `cmp__estado cmp__estado--${e}`;
  }

  /* ============================== Versões ============================== */

  protected readonly nomeVersao = signal('');
  protected readonly obsVersao = signal('');
  protected readonly versaoA = signal('');
  protected readonly versaoB = signal('');

  protected readonly versoes = computed(() => [...(this.sessao()?.versoes ?? [])].reverse());
  protected readonly aprovada = computed(
    () => this.sessao()?.versoes.find((v) => v.aprovada) ?? null,
  );

  protected salvarVersao(): void {
    const s = this.sessao();
    const b = this.base();
    if (!s || !b) return;
    if (s.versoes.length >= LIMITE_VERSOES) {
      this.msg.set(
        `Limite de ${LIMITE_VERSOES} versões: exporte a comparação ou duplique a sessão.`,
      );
      return;
    }
    const v = criarVersao(s, b, this.resultados(), this.nomeVersao(), this.obsVersao());
    this.alterar((x) => x.versoes.push(v));
    this.nomeVersao.set('');
    this.obsVersao.set('');
    this.versaoB.set(v.id);
  }

  protected restaurar(v: VersaoReconstrucao): void {
    if (
      !confirm(`Voltar o Painel B para “${v.nome}”? O que não estiver salvo numa versão se perde.`)
    )
      return;
    this.alterar((s) => (s.atual = structuredClone(v.estado)));
  }

  protected duplicar(v: VersaoReconstrucao): void {
    this.alterar((s) => {
      if (s.versoes.length < LIMITE_VERSOES) s.versoes.push(duplicarVersao(v));
    });
  }

  protected aprovar(v: VersaoReconstrucao | null): void {
    if (v) {
      const r = v.comparacao;
      const ok = confirm(
        `Aprovar “${v.nome}”?\n\nNa hora de salvar, a fidelidade estava assim: ${r.corresponde} corresponde, ${r.proximo} próximo, ${r.difere} difere, ${r.semMedicao} sem medição.\nA aprovação é sua: os números são só apoio.`,
      );
      if (!ok) return;
    }
    this.alterar((s) => (s.versoes = aprovarVersao(s.versoes, v?.id ?? null)));
    if (v) this.aba.set('aprovacao');
  }

  protected excluirVersao(v: VersaoReconstrucao): void {
    if (!confirm(`Excluir a versão “${v.nome}”?`)) return;
    this.alterar((s) => (s.versoes = s.versoes.filter((x) => x.id !== v.id)));
  }

  protected readonly diferencas = computed(() => {
    const s = this.sessao();
    const a = s?.versoes.find((v) => v.id === this.versaoA());
    const b = s?.versoes.find((v) => v.id === this.versaoB());
    if (!a || !b || a.id === b.id) return null;
    const nomes = Object.fromEntries((this.base()?.variaveis ?? []).map((v) => [v.id, v.nome]));
    return { a, b, lista: compararVersoes(a, b, nomes) };
  });

  protected rotuloCriterio(id: string): string {
    return CRITERIOS.find((c) => c.id === id)?.nome ?? id;
  }

  /* ============================== Aprovação e integração ============================== */

  protected readonly nomeComponente = signal('');
  protected readonly telaAlvo = signal('');
  protected readonly ondeTela = signal<'fim' | 'inicio' | string>('fim');
  protected readonly substituirAlvo = signal('');
  protected readonly resultadoAcao = signal<{ texto: string; id?: string; tela?: boolean } | null>(
    null,
  );

  private readonly baseAprovada = computed(() => {
    const v = this.aprovada();
    return v ? this.meus.buscar(v.estado.componenteId) : undefined;
  });
  /** O componente que sai da versão aprovada (prévia, sem salvar). */
  protected readonly compAprovado = computed<KcxComponente | null>(() => {
    const v = this.aprovada();
    const b = this.baseAprovada();
    if (!v || !b) return null;
    return componenteDaReconstrucao(b, v.estado, {
      id: this.sessao()?.salvoComo || 'reconstrucao',
      nome: this.nomeComponente() || this.sessao()?.nome || b.nome,
    });
  });
  protected readonly valoresAprovado = computed(() => {
    const c = this.compAprovado();
    return c ? valoresAtuais(c.variaveis) : {};
  });
  protected readonly salvo = computed(() => {
    const id = this.sessao()?.salvoComo;
    return id ? this.meus.buscar(id) : undefined;
  });
  protected readonly meusComponentes = this.meus.meus;
  protected readonly secoesTelaAlvo = computed(() => {
    const t = this.telas().find((x) => x.id === this.telaAlvo());
    return (t?.secoes ?? []).map((id, i) => ({
      i,
      nome: this.meus.buscar(id)?.nome ?? '(apagado)',
    }));
  });

  private salvarComponente(c: KcxComponente, texto: string): boolean {
    const erros = this.meus.salvar(c);
    if (erros.length) {
      this.resultadoAcao.set({ texto: erros[0] });
      return false;
    }
    this.resultadoAcao.set({ texto, id: c.id });
    return true;
  }

  protected salvarComoComponente(tags: string[] = []): KcxComponente | null {
    const v = this.aprovada();
    const b = this.baseAprovada();
    const s = this.sessao();
    if (!v || !b || !s) return null;
    const nome = this.nomeComponente().trim() || s.nome;
    const id = idParaNovo(nome, this.meus.ids());
    const c = componenteDaReconstrucao(b, v.estado, { id, nome, tags });
    if (!this.salvarComponente(c, `“${c.nome}” está em Meus componentes.`)) return null;
    this.alterar((x) => (x.salvoComo = c.id));
    return c;
  }

  protected criarVariante(): void {
    const v = this.aprovada();
    const b = this.baseAprovada();
    if (!v || !b) return;
    const c = varianteDaReconstrucao(
      b,
      v.estado,
      this.meus.ids(),
      this.nomeComponente().trim() || `${b.nome} · variante`,
    );
    this.salvarComponente(c, `Variante “${c.nome}” criada a partir de “${b.nome}”.`);
  }

  protected adicionarMotionLibrary(): void {
    const ja = this.salvo();
    if (ja) {
      if (naMotionLibrary(ja)) {
        this.resultadoAcao.set({ texto: `“${ja.nome}” já está na Motion Library.`, id: ja.id });
        return;
      }
      this.salvarComponente(comMotionLibrary(ja, true), `“${ja.nome}” entrou na Motion Library.`);
      return;
    }
    const c = this.salvarComoComponente([TAG_MOTION_LIBRARY]);
    if (c)
      this.resultadoAcao.set({
        texto: `“${c.nome}” foi salvo e entrou na Motion Library.`,
        id: c.id,
      });
  }

  protected aplicarEmPagina(): void {
    const tela = this.telas().find((t) => t.id === this.telaAlvo());
    if (!tela) return;
    const c = this.salvo() ?? this.salvarComoComponente();
    if (!c) return;
    const o = this.ondeTela();
    const onde: OndeNaTela =
      o === 'fim'
        ? { tipo: 'fim' }
        : o === 'inicio'
          ? { tipo: 'inicio' }
          : { tipo: 'substituir', indice: Number(o) };
    this.projeto.alterarTela(tela.id, (t) => Object.assign(t, aplicarNaTela(t, c.id, onde)));
    this.projeto.selecionar(tela.id);
    this.resultadoAcao.set({
      texto: `“${c.nome}” foi colocado na página “${tela.nome}”.`,
      id: c.id,
      tela: true,
    });
  }

  protected substituir(): void {
    const alvo = this.meus.meus().find((c) => c.id === this.substituirAlvo());
    const v = this.aprovada();
    const b = this.baseAprovada();
    if (!alvo || !v || !b) return;
    if (
      !confirm(
        `Substituir “${alvo.nome}” pela reconstrução aprovada? Páginas que usam esse componente passam a mostrar a reconstrução.`,
      )
    )
      return;
    const c = componenteDaReconstrucao(b, v.estado, {
      id: alvo.id,
      nome: alvo.nome,
      tags: naMotionLibrary(alvo) ? [TAG_MOTION_LIBRARY] : [],
    });
    if (this.salvarComponente(c, `“${alvo.nome}” agora é a reconstrução aprovada.`))
      this.alterar((x) => (x.salvoComo = c.id));
  }

  protected continuarEditando(): void {
    this.aba.set('ajustes');
    document.getElementById('cmp-palco')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ============================== Web Intelligence ============================== */

  /** Uma ficha pediu para ver um momento da referência. */
  protected verMomento(t: number): void {
    if (this.videoUrl()) this.vista.set('video');
    this.tempoRef.set(t);
    this.refPainel()?.pausar();
    this.refPainel()?.irPara(t);
    document.getElementById('cmp-palco')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /** Um efeito virou componente e está no Painel B: vai para a comparação. */
  protected aoReconstruir(): void {
    this.selecionado.set(null);
    this.mudarModo('lado');
    document.getElementById('cmp-palco')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ============================== Abas e ciclo de vida ============================== */

  protected readonly aba = signal<Aba>('referencia');

  constructor() {
    const qp = this.rota.snapshot.queryParamMap.get('componente');
    if (qp) this.componenteNova.set(qp);

    // Sessão trocada: carrega o vídeo guardado e escolhe a vista certa.
    let ultimaSessao = '';
    effect(() => {
      const s = this.sessao();
      if (!s || s.id === ultimaSessao) return;
      ultimaSessao = s.id;
      untracked(() => {
        this.selecionado.set(null);
        this.eventos.set([]);
        this.erroVideo.set('');
        this.trocarVideo('');
        this.frameId.set(s.referencia.frames[0]?.id ?? '');
        this.urlDigitada.set(s.referencia.url ?? '');
        this.vista.set(
          s.referencia.tipo === 'url' ? 'site' : s.referencia.tipo === 'video' ? 'video' : 'frame',
        );
        const chave = s.referencia.videoChave;
        if (chave)
          void this.cmp.lerVideo(chave).then((b) => {
            if (b && this.sessao()?.id === s.id) this.trocarVideo(URL.createObjectURL(b));
          });
        queueMicrotask(() => this.ajustarZoom());
      });
    });

    // Documento novo: o inspetor volta a registrar eventos no modo de interação.
    effect(() => {
      this.documento();
      untracked(() => {
        if (this.modo() === 'interacao')
          setTimeout(() => this.preview()?.mandar({ kcxCmp: 'log', ativo: true }), 300);
      });
    });

    inject(DestroyRef).onDestroy(() => {
      cancelAnimationFrame(this.quadro);
      this.trocarVideo('');
    });
  }

  protected valorDe(e: Event): string {
    return (e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value;
  }

  protected marcado(e: Event): boolean {
    return (e.target as HTMLInputElement).checked;
  }
}

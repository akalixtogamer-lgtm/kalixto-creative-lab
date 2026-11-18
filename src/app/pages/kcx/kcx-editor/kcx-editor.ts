import {
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { KcxMeusService } from '../kcx-meus.service';
import { montarDocumentoKcx } from '../../../kcx/documento';
import { KcxCodigo, KcxValor } from '../../../kcx/kcx.types';
import { Valores, resolverSaidas, valoresPadrao } from '../../../kcx/resolver';
import { Breadcrumb, Migalha } from '../../../shared/components/breadcrumb/breadcrumb';
import { Icon } from '../../../shared/components/icon/icon';
import { KcxControles, MudancaVariavel } from '../kcx-controles/kcx-controles';
import { KcxEstadoService } from '../kcx-estado.service';
import { AcaoPreview, KcxPreview } from '../kcx-preview/kcx-preview';
import { KcxPresetsPainel } from '../kcx-presets-painel/kcx-presets-painel';
import { KcxCodigoPainel } from '../kcx-codigo-painel/kcx-codigo-painel';
import { KcxExportarPainel } from '../kcx-exportar-painel/kcx-exportar-painel';
import { KcxImportarPainel } from '../kcx-importar-painel/kcx-importar-painel';

const NIVEL_ROTULO = {
  1: 'Nível 1 — nativo editável',
  2: 'Nível 2 — parcialmente editável',
} as const;

/**
 * Editor de um componente KCX (/kcx/:id).
 *
 * Três camadas sincronizadas: variáveis (controles) → preview (postMessage,
 * sem recarregar) → código (bloco :root gerado). Editar o código no modo
 * avançado devolve os valores para as variáveis.
 */
@Component({
  selector: 'kx-kcx-editor',
  imports: [
    RouterLink,
    Breadcrumb,
    Icon,
    KcxControles,
    KcxPreview,
    KcxPresetsPainel,
    KcxCodigoPainel,
    KcxExportarPainel,
    KcxImportarPainel,
  ],
  templateUrl: './kcx-editor.html',
  styleUrl: './kcx-editor.css',
})
export class KcxEditor {
  readonly id = input.required<string>();
  private readonly estado = inject(KcxEstadoService);
  private readonly title = inject(Title);

  private readonly meus = inject(KcxMeusService);
  private readonly router = inject(Router);
  protected readonly comp = computed(() => this.meus.buscar(this.id()));
  /** Criado pela pessoa (construtor ou Figma): pode reabrir no construtor e excluir. */
  protected readonly ehMeu = computed(() => this.meus.ehMeu(this.id()));
  protected readonly doConstrutor = computed(
    () => this.comp()?.origemCriacao?.tipo === 'construtor',
  );

  protected excluir(): void {
    const c = this.comp();
    if (!c || !confirm(`Excluir "${c.nome}" dos seus componentes? Isso não pode ser desfeito.`))
      return;
    this.meus.remover(c.id);
    void this.router.navigateByUrl('/kcx');
  }
  protected readonly nivelRotulo = NIVEL_ROTULO;

  /** Valores atuais das variáveis (salvos no navegador). */
  protected readonly valores = linkedSignal<Valores>(() => {
    const c = this.comp();
    return c ? this.estado.valores(c) : {};
  });
  protected readonly saidas = computed(() => {
    const c = this.comp();
    return c
      ? resolverSaidas(c.variaveis, this.valores())
      : { cssVars: {}, atributos: [], textos: [] };
  });

  /** Código editado no modo avançado (null = código original do componente). */
  protected readonly codigoEditado = linkedSignal<KcxCodigo | null>(() => {
    this.comp();
    return null;
  });
  protected readonly presetAtivo = linkedSignal<string | undefined>(() => {
    this.comp();
    return undefined;
  });

  /**
   * Documento do preview. Depende do CÓDIGO, não dos valores (lidos sem
   * rastrear): mudar uma variável não recarrega o iframe.
   */
  protected readonly documento = computed(() => {
    const c = this.comp();
    if (!c) return '';
    const codigo = this.codigoEditado() ?? undefined;
    return montarDocumentoKcx(c, untracked(this.valores), { modo: 'preview', codigo });
  });

  /* ---------- Comparação antes/depois ---------- */
  protected readonly comparando = signal(false);
  protected readonly referencia = signal<'padrao' | 'snapshot'>('padrao');
  private readonly snapshot = signal<Valores>({});
  protected readonly valoresAntes = computed(() => {
    const c = this.comp();
    if (!c) return {};
    return this.referencia() === 'padrao' ? valoresPadrao(c.variaveis) : this.snapshot();
  });
  protected readonly saidasAntes = computed(() => {
    const c = this.comp();
    return c
      ? resolverSaidas(c.variaveis, this.valoresAntes())
      : { cssVars: {}, atributos: [], textos: [] };
  });
  protected readonly documentoAntes = computed(() => {
    const c = this.comp();
    if (!c) return '';
    return montarDocumentoKcx(c, untracked(this.valoresAntes), {
      modo: 'preview',
      codigo: this.codigoEditado() ?? undefined,
    });
  });
  protected readonly alteradas = computed(() => {
    const c = this.comp();
    if (!c) return [];
    const antes = this.valoresAntes();
    return c.variaveis
      .filter((v) => JSON.stringify(antes[v.id]) !== JSON.stringify(this.valores()[v.id]))
      .map((v) => v.nome);
  });

  /* ---------- Reprodução ---------- */
  protected readonly pausado = signal(false);
  protected readonly velocidade = signal(1);
  protected readonly velocidades = [0.25, 0.5, 1, 1.5, 2];
  private readonly preview = viewChild<KcxPreview>('preview');
  private readonly previewAntes = viewChild<KcxPreview>('previewAntes');

  protected readonly vizinhos = computed(() => {
    const todos = this.meus.todos();
    const i = todos.findIndex((c) => c.id === this.id());
    return { anterior: todos[i - 1], proximo: todos[i + 1] };
  });

  protected readonly migalhas = computed<Migalha[]>(() => [
    { rotulo: 'KCX Studio', rota: '/kcx' },
    { rotulo: this.comp()?.nome ?? 'Componente não encontrado' },
  ]);

  constructor() {
    effect(() => {
      const c = this.comp();
      this.title.setTitle(
        `${c ? c.nome : 'Componente não encontrado'} · KCX Studio · Kalixto Creative Lab`,
      );
    });
    // Guarda os valores no navegador (base da comparação Figma → Lab).
    effect(() => {
      const c = this.comp();
      const v = this.valores();
      if (c) untracked(() => this.estado.salvar(c, v));
    });
  }

  protected mudar(m: MudancaVariavel): void {
    this.valores.update((v) => ({ ...v, [m.id]: m.valor }));
    this.presetAtivo.set(undefined);
  }

  protected aplicarValores(e: { valores: Record<string, KcxValor>; preset?: string }): void {
    this.valores.update((v) => ({ ...v, ...e.valores }));
    this.presetAtivo.set(e.preset);
  }

  protected restaurar(): void {
    const c = this.comp();
    if (!c) return;
    this.valores.set(valoresPadrao(c.variaveis));
    this.presetAtivo.set(undefined);
  }

  protected aplicarCodigo(e: { codigo: KcxCodigo | null; valores: Valores }): void {
    this.codigoEditado.set(e.codigo);
    this.valores.update((v) => ({ ...v, ...e.valores }));
  }

  protected alternarComparacao(): void {
    if (!this.comparando()) this.snapshot.set({ ...this.valores() });
    this.comparando.update((x) => !x);
  }

  protected fixarReferencia(): void {
    this.snapshot.set({ ...this.valores() });
    this.referencia.set('snapshot');
  }

  protected controlar(acao: AcaoPreview, valor?: number): void {
    if (acao === 'pausar') this.pausado.set(true);
    if (acao === 'tocar') this.pausado.set(false);
    if (acao === 'velocidade' && valor) this.velocidade.set(valor);
    this.preview()?.controlar(acao, valor);
    this.previewAntes()?.controlar(acao, valor);
  }

  protected alternarPausa(): void {
    this.controlar(this.pausado() ? 'tocar' : 'pausar');
  }

  protected mudarVelocidade(bruto: string): void {
    this.controlar('velocidade', Number(bruto));
  }
}

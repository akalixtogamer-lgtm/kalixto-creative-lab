import {
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import {
  ConfigFeedback,
  ExibicaoFeedback,
  ICONES_FEEDBACK,
  LIMITES,
  MensagemFeedback,
  POSICOES_FEEDBACK,
  ROTULO_POSICAO,
  ROTULO_TIPO,
  ResultadoSimulado,
  TIPOS_FEEDBACK,
  TipoFeedback,
} from '../../../kcx/feedback';

/**
 * Seção "Mensagens e Feedback" do painel de propriedades do editor KCX
 * (só para botões). Edita as mensagens; quem roda a operação é o editor.
 */
@Component({
  selector: 'kx-kcx-feedback-painel',
  templateUrl: './kcx-feedback-painel.html',
  styleUrl: './kcx-feedback-painel.css',
})
export class KcxFeedbackPainel {
  readonly config = model.required<ConfigFeedback>();
  /** Há uma operação de teste rodando. */
  readonly ocupado = input(false);
  readonly testar = output<TipoFeedback>();
  readonly simular = output<void>();

  protected readonly tipos = TIPOS_FEEDBACK;
  protected readonly rotuloTipo = ROTULO_TIPO;
  protected readonly posicoes = POSICOES_FEEDBACK;
  protected readonly rotuloPosicao = ROTULO_POSICAO;
  protected readonly icones = Object.entries(ICONES_FEEDBACK);
  protected readonly limites = LIMITES;
  protected readonly resultados: { id: ResultadoSimulado; rotulo: string }[] = [
    { id: 'sucesso', rotulo: 'Sucesso' },
    { id: 'erro', rotulo: 'Falha' },
    { id: 'pendencia', rotulo: 'Concluída com pendência' },
    { id: 'info', rotulo: 'Concluída com informação' },
  ];

  protected readonly tipo = signal<TipoFeedback>('success');
  protected readonly msg = computed(() => this.config().mensagens[this.tipo()]);

  protected mudarGeral(campo: 'ativo', valor: boolean): void {
    this.config.update((c) => ({ ...c, [campo]: valor }));
  }

  protected mudar<K extends keyof MensagemFeedback>(campo: K, valor: MensagemFeedback[K]): void {
    const t = this.tipo();
    this.config.update((c) => ({
      ...c,
      mensagens: { ...c.mensagens, [t]: { ...c.mensagens[t], [campo]: valor } },
    }));
  }

  /** Número dentro do limite (fora dele, o campo é ignorado). */
  protected mudarNumero(
    campo: 'duracao' | 'largura' | 'raio',
    e: Event,
    limite: readonly [number, number],
  ): void {
    const n = Math.round(Number((e.target as HTMLInputElement).value));
    if (Number.isFinite(n) && n >= limite[0] && n <= limite[1]) this.mudar(campo, n);
  }

  protected mudarSimulacao(campo: 'resultado' | 'atrasoMs', valor: string): void {
    this.config.update((c) => {
      const s = { ...c.simulacao };
      if (campo === 'resultado') s.resultado = valor as ResultadoSimulado;
      else {
        const n = Math.round(Number(valor));
        if (!Number.isFinite(n) || n < LIMITES.atraso[0] || n > LIMITES.atraso[1]) return c;
        s.atrasoMs = n;
      }
      return { ...c, simulacao: s };
    });
  }

  protected valor(e: Event): string {
    return (e.target as HTMLInputElement).value;
  }
  protected marcado(e: Event): boolean {
    return (e.target as HTMLInputElement).checked;
  }
}

/**
 * Mensagem exibida sobre o preview. Some sozinha pela duração (0 = até
 * fechar); LOADING só é trocada quando a operação termina.
 */
@Component({
  selector: 'kx-kcx-feedback-toast',
  host: {
    '[class]': "'kcxf-toast kcxf-toast--' + m().posicao",
    '[attr.role]': "m().tipo === 'error' ? 'alert' : 'status'",
    '[attr.aria-live]': "m().tipo === 'error' ? 'assertive' : 'polite'",
    '[attr.data-tipo]': 'm().tipo',
    '[style.--kcxf-fundo]': 'm().corFundo',
    '[style.--kcxf-texto]': 'm().corTexto',
    '[style.--kcxf-largura.px]': 'm().largura',
    '[style.--kcxf-raio.px]': 'm().raio',
  },
  template: `
    @if (simbolo(); as s) {
      <span class="kcxf-toast__icone" aria-hidden="true">{{ s }}</span>
    }
    <div class="kcxf-toast__corpo">
      @if (m().titulo) {
        <strong>{{ m().titulo }}</strong>
      }
      @if (m().mensagem) {
        <span>{{ m().mensagem }}</span>
      }
      @if (m().detalhe) {
        <small>{{ m().detalhe }}</small>
      }
    </div>
    @if (m().tipo !== 'loading') {
      <button
        type="button"
        class="kcxf-toast__fechar"
        aria-label="Fechar mensagem"
        (click)="fechar.emit()"
      >
        ✕
      </button>
    }
  `,
  styleUrl: './kcx-feedback-toast.css',
})
export class KcxFeedbackToast {
  readonly m = input.required<ExibicaoFeedback>();
  readonly fechar = output<void>();
  protected readonly simbolo = computed(() => ICONES_FEEDBACK[this.m().icone] ?? '');

  constructor() {
    let timer: ReturnType<typeof setTimeout> | undefined;
    inject(DestroyRef).onDestroy(() => clearTimeout(timer));
    effect(() => {
      const m = this.m();
      clearTimeout(timer);
      if (m.tipo !== 'loading' && m.duracao > 0)
        timer = setTimeout(() => this.fechar.emit(), m.duracao);
    });
  }
}

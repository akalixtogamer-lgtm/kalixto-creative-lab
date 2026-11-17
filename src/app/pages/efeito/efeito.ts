import {
  Component,
  ElementRef,
  inject,
  computed,
  effect,
  input,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { findCategoria } from '../../core/efeitos/categorias';
import { EFFECT_REGISTRY, findKit } from '../../core/efeitos/registry';
import { montarDocumento } from '../../core/efeitos/sandbox';
import { ParamDef, Valor, Valores } from '../../core/models/demo.model';
import {
  CodigoKit,
  EffectKit,
  INTERACAO_ROTULO,
  NIVEL_FICHA_ROTULO,
} from '../../core/models/effect-sheet.model';
import { Breadcrumb, Migalha } from '../../shared/components/breadcrumb/breadcrumb';
import { CodeViewer } from '../../shared/components/code-viewer/code-viewer';
import { DemoControls } from '../../shared/components/demo-controls/demo-controls';
import { Icon } from '../../shared/components/icon/icon';

type Aba = keyof CodigoKit;

function padrao(kit: EffectKit): Valores {
  return Object.fromEntries(kit.params.map((p) => [p.id, p.padrao]));
}

/**
 * Página de um efeito (/efeitos/:id): preview isolado, controles, código e ficha técnica.
 *
 * O preview é um iframe sandbox="allow-scripts" (o Angular exige o atributo
 * estático no template, ver SANDBOX_PREVIEW) (sem allow-same-origin) que
 * recebe o documento montado a partir do código gerado — o mesmo texto que
 * aparece nas abas e que é baixado. Código e preview não podem divergir.
 */
@Component({
  selector: 'kx-efeito',
  imports: [RouterLink, Breadcrumb, CodeViewer, DemoControls, Icon],
  templateUrl: './efeito.html',
  styleUrl: './efeito.css',
})
export class Efeito {
  /** Parâmetro de rota :id (withComponentInputBinding). */
  readonly id = input.required<string>();

  protected readonly kit = computed(() => findKit(this.id()));
  protected readonly ficha = computed(() => this.kit()?.ficha);
  protected readonly categoria = computed(() => findCategoria(this.ficha()?.categoria ?? ''));

  /** Valores dos controles; voltam ao padrão quando o efeito muda. */
  protected readonly valores = linkedSignal<Valores>(() => {
    const k = this.kit();
    return k ? padrao(k) : {};
  });

  protected readonly codigo = computed<CodigoKit | null>(() => {
    const k = this.kit();
    return k ? k.gerar(this.valores()) : null;
  });

  protected readonly documento = computed(() => {
    const c = this.codigo();
    const f = this.ficha();
    return c && f ? montarDocumento(f.nomeAmigavel, c) : '';
  });

  protected readonly aba = signal<Aba>('html');
  protected readonly abas: { id: Aba; rotulo: string; linguagem: string }[] = [
    { id: 'html', rotulo: 'HTML', linguagem: 'HTML' },
    { id: 'css', rotulo: 'CSS', linguagem: 'CSS' },
    { id: 'js', rotulo: 'JavaScript', linguagem: 'JS' },
  ];

  protected readonly nivelRotulo = NIVEL_FICHA_ROTULO;
  protected readonly interacoesTexto = computed(() =>
    (this.ficha()?.interacoes ?? []).map((i) => INTERACAO_ROTULO[i]).join(', '),
  );

  protected readonly vizinhos = computed(() => {
    const i = EFFECT_REGISTRY.findIndex((k) => k.ficha.id === this.id());
    return {
      anterior: i > 0 ? EFFECT_REGISTRY[i - 1].ficha : undefined,
      proximo: i >= 0 && i < EFFECT_REGISTRY.length - 1 ? EFFECT_REGISTRY[i + 1].ficha : undefined,
    };
  });

  protected readonly migalhas = computed<Migalha[]>(() => [
    { rotulo: 'Biblioteca', rota: '/biblioteca' },
    { rotulo: this.categoria()?.nome ?? 'Efeito', rota: '/biblioteca' },
    { rotulo: this.ficha()?.nomeAmigavel ?? 'Efeito não encontrado' },
  ]);

  private readonly frame = viewChild<ElementRef<HTMLIFrameElement>>('frame');
  private timer?: ReturnType<typeof setTimeout>;

  private readonly title = inject(Title);

  constructor() {
    effect(() => {
      const f = this.ficha();
      this.title.setTitle(`${f ? f.nomeAmigavel : 'Efeito não encontrado'} · Kalixto Creative Lab`);
    });
    // Atualiza o preview quando o código muda. O pequeno atraso evita
    // recarregar o iframe a cada pixel enquanto o slider é arrastado.
    // srcdoc é atribuído direto no elemento: o conteúdo é o código do próprio
    // kit e roda isolado pelo sandbox, sem acesso a esta página.
    effect((onCleanup) => {
      const doc = this.documento();
      const el = this.frame()?.nativeElement;
      if (!el) return;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => (el.srcdoc = doc), 120);
      onCleanup(() => clearTimeout(this.timer));
    });
  }

  protected alterar(e: { param: ParamDef; valor: Valor }): void {
    this.valores.update((v) => ({ ...v, [e.param.id]: e.valor }));
  }

  protected restaurar(): void {
    const k = this.kit();
    if (k) this.valores.set(padrao(k));
  }

  /** Recarrega o preview com o mesmo código (reinicia animações). */
  protected reiniciar(): void {
    const el = this.frame()?.nativeElement;
    if (!el) return;
    el.srcdoc = '';
    el.srcdoc = this.documento();
  }

  protected baixar(): void {
    const f = this.ficha();
    if (!f) return;
    const blob = new Blob([this.documento()], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${f.id}.html`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  protected teclaAba(ev: KeyboardEvent, i: number): void {
    const n = this.abas.length;
    const alvo = ev.key === 'ArrowRight' ? (i + 1) % n : ev.key === 'ArrowLeft' ? (i - 1 + n) % n : -1;
    if (alvo < 0) return;
    ev.preventDefault();
    this.aba.set(this.abas[alvo].id);
    (document.getElementById(`aba-${this.abas[alvo].id}`) as HTMLElement | null)?.focus();
  }
}

import {
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { eixosDoComponente, planejarFigma, variantesDoComponente } from '../../../kcx/figma-plano';
import { KcxComponente } from '../../../kcx/kcx.types';
import { CoresGrade, documentoDaGrade, documentoDaVariante } from '../../../kcx/plano-html';
import { TemaService } from '../../../core/services/tema.service';
import { Valores } from '../../../kcx/resolver';
import { criarPacote } from '../../../kcx/serializar';

interface Miniatura {
  nome: string;
  props: Record<string, string>;
  doc: SafeHtml;
}

/**
 * Seletor de variantes: um grupo de botões por eixo (Estado, Tamanho, …).
 * Escolher uma opção troca a variante `selecionada`; quem usa o componente
 * aplica `valoresDe(selecionada)` no preview. Com `grade`, mostra também todas
 * as variantes desenhadas como ficam no Figma — clicar numa seleciona.
 */
@Component({
  selector: 'kx-kcx-variantes',
  templateUrl: './kcx-variantes.html',
  styleUrl: './kcx-variantes.css',
})
export class KcxVariantes {
  readonly comp = input.required<KcxComponente>();
  /** Valores atuais das variáveis (o que o usuário já mexeu). */
  readonly valores = input<Valores>({});
  /** Nome da variante escolhida ("Estado=Hover, Tamanho=G"); vazio = a primeira. */
  readonly selecionada = model<string>('');
  /** Mostrar a grade com todas as variantes. */
  readonly grade = input(false);
  /** Altura de cada miniatura da grade. */
  readonly alturaMiniatura = input(150);

  private readonly sanitizer = inject(DomSanitizer);

  protected readonly variantes = computed(() => {
    try {
      return variantesDoComponente(this.comp(), this.valores());
    } catch {
      return [];
    }
  });
  protected readonly eixos = computed(() => {
    try {
      return eixosDoComponente(this.comp());
    } catch {
      return [];
    }
  });

  protected readonly atual = computed<ReturnType<typeof variantesDoComponente>[number] | undefined>(
    () => {
      const vs = this.variantes();
      return vs.find((v) => v.nome === this.selecionada()) ?? vs[0];
    },
  );

  /** Mostrar, abaixo dos botões, a variante escolhida como fica no Figma. */
  readonly previa = input(true);
  /** Altura da prévia da variante escolhida. */
  readonly alturaPrevia = input(200);
  /** Fundo atrás das prévias (valor de `background`, ex.: `fundoColorido(...)`). */
  readonly fundo = input<string>('#0b0a14');

  /** Mostrar os botões de cada eixo. */
  readonly seletores = input(true);

  private readonly plano = computed(() => {
    const c = this.comp();
    try {
      return planejarFigma(criarPacote([{ ...c, variaveis: comValores(c, this.valores()) }]))
        .componentes[0];
    } catch {
      return {
        variantes: [] as ReturnType<typeof planejarFigma>['componentes'][number]['variantes'],
      };
    }
  });

  protected readonly previaAtual = computed<Miniatura | null>(() => {
    if (!this.previa()) return null;
    const nome = this.atual()?.nome;
    const v = this.plano().variantes.find((x) => x.nome === nome) ?? this.plano().variantes[0];
    if (!v) return null;
    return {
      nome: v.nome,
      props: v.propriedades,
      doc: this.sanitizer.bypassSecurityTrustHtml(documentoDaVariante(v.arvore, this.fundo())),
    };
  });

  private readonly tema = inject(TemaService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly gradeFrame = viewChild<ElementRef<HTMLIFrameElement>>('gradeFrame');
  protected readonly alturaGrade = signal(200);

  /**
   * UM documento com todas as variantes (antes era um iframe por variante:
   * 60 documentos no Botão padrão). Ele avisa por mensagem qual foi clicada.
   */
  protected readonly gradeDoc = computed<SafeHtml | null>(() => {
    if (!this.grade()) return null;
    const vs = this.plano().variantes;
    if (!vs.length) return null;
    this.tema.tema(); // refaz as cores ao trocar o tema
    return this.sanitizer.bypassSecurityTrustHtml(
      documentoDaGrade(
        vs.map((v) => ({ arvore: v.arvore, rotulo: this.rotulo(v.propriedades) })),
        {
          altura: this.alturaMiniatura(),
          fundo: this.fundo(),
          cores: this.coresDoTema(),
          selecionada: untracked(() => this.indiceAtual()),
        },
      ),
    );
  });

  private indiceAtual(): number {
    const nome = this.atual()?.nome;
    return Math.max(
      0,
      this.plano().variantes.findIndex((v) => v.nome === nome),
    );
  }

  constructor() {
    const aoReceber = (e: MessageEvent) => {
      const frame = this.gradeFrame()?.nativeElement;
      if (!frame || e.source !== frame.contentWindow || !e.data || typeof e.data !== 'object')
        return;
      const d = e.data as { kcxVariante?: unknown; kcxAltura?: unknown };
      if (typeof d.kcxAltura === 'number') this.alturaGrade.set(Math.ceil(d.kcxAltura));
      if (typeof d.kcxVariante === 'number') {
        const v = this.plano().variantes[d.kcxVariante];
        if (v) this.selecionada.set(v.nome);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('message', aoReceber);
      inject(DestroyRef).onDestroy(() => window.removeEventListener('message', aoReceber));
    }
    // Trocar a variante pelos botões dos eixos só marca a nova célula, sem recarregar a grade.
    effect(() => {
      this.atual();
      this.enviarSelecao();
    });
  }

  protected enviarSelecao(): void {
    this.gradeFrame()?.nativeElement.contentWindow?.postMessage(
      { kcxSelecionada: this.indiceAtual() },
      '*',
    );
  }

  private coresDoTema(): CoresGrade | undefined {
    if (typeof getComputedStyle === 'undefined') return undefined;
    const st = getComputedStyle(this.host.nativeElement);
    const v = (n: string) => st.getPropertyValue(n).trim();
    const cores: CoresGrade = {
      borda: v('--kx-border'),
      bordaForte: v('--kx-border-strong'),
      superficie: v('--kx-surface'),
      destaque: v('--kx-ciano'),
      texto: v('--kx-text'),
      textoSuave: v('--kx-text-soft'),
    };
    return Object.values(cores).every(Boolean) ? cores : undefined;
  }

  protected escolher(eixo: string, opcao: string): void {
    const alvo = { ...this.atual()?.props, [eixo]: opcao };
    const v = this.variantes().find((x) =>
      Object.entries(alvo).every(([k, o]) => x.props[k] === o),
    );
    if (v) this.selecionada.set(v.nome);
  }

  protected rotulo(props: Record<string, string>): string {
    return Object.values(props).join(' · ');
  }
}

/** Copia o componente com os valores atuais como valor das variáveis. */
function comValores(c: KcxComponente, valores: Valores): KcxComponente['variaveis'] {
  return c.variaveis.map((v) => (v.id in valores ? { ...v, valor: valores[v.id] } : v));
}

export { valoresDaVariante } from '../../../kcx/figma-plano';

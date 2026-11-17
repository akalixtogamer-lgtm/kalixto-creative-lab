import { Component, computed, input, linkedSignal, output, signal } from '@angular/core';
import { CodigoAngular, CodigoKit } from '../../../core/models/effect-sheet.model';
import { CodeViewer } from '../../../shared/components/code-viewer/code-viewer';
import { Icon } from '../../../shared/components/icon/icon';
import { diffLinhas } from '../../../shared/utils/diff';

type Arquivo = 'html' | 'css' | 'js' | 'ng-ts' | 'ng-html' | 'ng-css';

/** Tamanho máximo de cada arquivo editado (evita travar o navegador com textos enormes). */
export const LIMITE_EDICAO = 50_000;

interface Aba {
  id: Arquivo;
  rotulo: string;
  linguagem: string;
  editavel: boolean;
}

/**
 * Code Lab: abas de código (HTML, CSS, JS e a versão Angular), edição dos
 * arquivos HTML/CSS/JS, execução no preview isolado e comparação com o original.
 */
@Component({
  selector: 'kx-code-lab',
  imports: [CodeViewer, Icon],
  templateUrl: './code-lab.html',
  styleUrl: './code-lab.css',
})
export class CodeLab {
  readonly id = input.required<string>();
  /** Código gerado pelos controles. */
  readonly gerado = input.required<CodigoKit>();
  /** Código editado em execução no preview (null = usando o gerado). */
  readonly editado = input<CodigoKit | null>(null);
  readonly angular = input.required<CodigoAngular>();

  /** Executar o código editado no preview. */
  readonly executar = output<CodigoKit>();
  /** Voltar ao código gerado pelos controles. */
  readonly restaurar = output<void>();

  protected readonly abas: Aba[] = [
    { id: 'html', rotulo: 'HTML', linguagem: 'HTML', editavel: true },
    { id: 'css', rotulo: 'CSS', linguagem: 'CSS', editavel: true },
    { id: 'js', rotulo: 'JavaScript', linguagem: 'JS', editavel: true },
    { id: 'ng-ts', rotulo: 'Angular · TS', linguagem: 'TypeScript', editavel: false },
    { id: 'ng-html', rotulo: 'Angular · HTML', linguagem: 'HTML', editavel: false },
    { id: 'ng-css', rotulo: 'Angular · CSS', linguagem: 'CSS', editavel: false },
  ];
  protected readonly aba = signal<Arquivo>('html');
  protected readonly abaAtual = computed(() => this.abas.find((a) => a.id === this.aba())!);

  /** Código que está no preview agora. */
  protected readonly atual = computed(() => this.editado() ?? this.gerado());

  protected readonly editando = signal(false);
  /** Rascunho da edição; recomeça do código atual sempre que ele muda. */
  protected readonly rascunho = linkedSignal<CodigoKit>(() => ({ ...this.atual() }));
  protected readonly textoRascunho = computed(() => {
    const a = this.aba();
    return a === 'html' || a === 'css' || a === 'js' ? this.rascunho()[a] : '';
  });
  protected readonly erro = signal('');
  protected readonly verDiff = signal(false);

  protected readonly texto = computed(() => {
    const a = this.aba();
    const ng = this.angular();
    switch (a) {
      case 'ng-ts':
        return ng.ts;
      case 'ng-html':
        return ng.html;
      case 'ng-css':
        return ng.css;
      default:
        return this.atual()[a];
    }
  });

  protected readonly nomeArquivo = computed(() => {
    const id = this.id();
    const nomes: Record<Arquivo, string> = {
      html: 'index.html',
      css: 'styles.css',
      js: 'script.js',
      'ng-ts': `${id}.ts`,
      'ng-html': `${id}.html`,
      'ng-css': `${id}.css`,
    };
    return nomes[this.aba()];
  });

  /** Diferenças entre o código gerado e o editado, no arquivo da aba atual. */
  protected readonly diff = computed(() => {
    const e = this.editado();
    const a = this.aba();
    if (!e || !this.abaAtual().editavel) return [];
    return diffLinhas(this.gerado()[a as keyof CodigoKit], e[a as keyof CodigoKit]);
  });
  protected readonly totalAlteracoes = computed(
    () => this.diff().filter((l) => l.tipo !== 'igual').length,
  );

  protected escolher(id: Arquivo): void {
    this.aba.set(id);
  }

  protected teclaAba(ev: KeyboardEvent, i: number): void {
    const n = this.abas.length;
    const alvo =
      ev.key === 'ArrowRight' ? (i + 1) % n : ev.key === 'ArrowLeft' ? (i - 1 + n) % n : -1;
    if (alvo < 0) return;
    ev.preventDefault();
    this.aba.set(this.abas[alvo].id);
    document.getElementById(`cl-aba-${this.abas[alvo].id}`)?.focus();
  }

  protected comecarEdicao(): void {
    if (!this.abaAtual().editavel) this.aba.set('html');
    this.rascunho.set({ ...this.atual() });
    this.erro.set('');
    this.editando.set(true);
  }

  protected digitar(valor: string): void {
    const a = this.aba() as keyof CodigoKit;
    this.rascunho.update((r) => ({ ...r, [a]: valor }));
  }

  /** Tab insere dois espaços; Esc sai do campo (para quem navega pelo teclado). */
  protected teclaEditor(ev: KeyboardEvent): void {
    const area = ev.target as HTMLTextAreaElement;
    if (ev.key === 'Escape') {
      area.blur();
      return;
    }
    if (ev.key !== 'Tab' || ev.shiftKey) return;
    ev.preventDefault();
    const { selectionStart: i, selectionEnd: f, value } = area;
    area.value = value.slice(0, i) + '  ' + value.slice(f);
    area.selectionStart = area.selectionEnd = i + 2;
    this.digitar(area.value);
  }

  protected aplicar(): void {
    const r = this.rascunho();
    const grande = (['html', 'css', 'js'] as const).find((k) => r[k].length > LIMITE_EDICAO);
    if (grande) {
      this.erro.set(`O arquivo ${grande.toUpperCase()} passou de ${LIMITE_EDICAO.toLocaleString('pt-BR')} caracteres.`);
      return;
    }
    this.erro.set('');
    this.editando.set(false);
    this.executar.emit({ ...r });
  }

  protected cancelar(): void {
    this.editando.set(false);
    this.erro.set('');
  }

  protected voltarAoOriginal(): void {
    this.editando.set(false);
    this.verDiff.set(false);
    this.restaurar.emit();
  }
}

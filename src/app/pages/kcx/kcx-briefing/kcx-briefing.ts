import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  CAMPOS_BRIEFING,
  CampoBriefing,
  LIMITE_CAMPO,
  arquivoDoBriefing,
  briefingDoJson,
  briefingDoTexto,
  briefingParaMarkdown,
  briefingVazio,
  itensDoCampo,
  progressoBriefing,
} from '../../../kcx/projeto/briefing';
import { textoDoDocx } from '../../../kcx/projeto/docx';
import { Icon } from '../../../shared/components/icon/icon';
import { baixarArquivo } from '../kcx-estado.service';
import { KcxProjetoService } from '../kcx-projeto.service';

const LIMITE_TEXTO = 2 * 1024 * 1024;

/**
 * Briefing (/kcx/briefing): importa um .docx, .txt, .md (ou o próprio .json),
 * reconhece os campos e deixa tudo editável. As páginas listadas viram
 * páginas das Telas e do mapa de navegação.
 */
@Component({
  selector: 'kx-kcx-briefing',
  imports: [RouterLink, Icon],
  templateUrl: './kcx-briefing.html',
  styleUrl: './kcx-briefing.css',
})
export class KcxBriefingPagina {
  private readonly projeto = inject(KcxProjetoService);
  protected readonly campos = CAMPOS_BRIEFING;
  protected readonly limite = LIMITE_CAMPO;
  protected readonly b = this.projeto.briefing;
  protected readonly progresso = computed(() => progressoBriefing(this.b()));
  protected readonly paginas = computed(() => itensDoCampo(this.b().paginas));
  protected readonly status = signal<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);
  protected readonly reconhecidos = signal<Set<CampoBriefing>>(new Set());
  protected readonly sobre = signal(false);
  /** Ao importar com o briefing já preenchido: junta (só campos vazios) ou troca tudo. */
  protected readonly modo = signal<'juntar' | 'trocar'>('trocar');
  protected readonly temConteudo = computed(() =>
    CAMPOS_BRIEFING.some((c) => this.b()[c.id].trim()),
  );

  protected definir(id: CampoBriefing, valor: string): void {
    this.projeto.briefing.update((b) => ({ ...b, [id]: valor.slice(0, LIMITE_CAMPO) }));
  }
  protected valor(e: Event): string {
    return (e.target as HTMLInputElement).value;
  }

  protected escolher(e: Event): void {
    const input = e.target as HTMLInputElement;
    const arq = input.files?.[0];
    input.value = '';
    if (arq) void this.importar(arq);
  }
  protected soltar(e: DragEvent): void {
    e.preventDefault();
    this.sobre.set(false);
    const arq = e.dataTransfer?.files?.[0];
    if (arq) void this.importar(arq);
  }
  protected arrastarSobre(e: DragEvent): void {
    e.preventDefault();
    this.sobre.set(true);
  }

  private async importar(arq: File): Promise<void> {
    const nome = arq.name.toLowerCase();
    try {
      let lido;
      if (nome.endsWith('.docx')) {
        lido = briefingDoTexto(await textoDoDocx(await arq.arrayBuffer()));
      } else if (/\.(txt|md|markdown|json)$/.test(nome) || arq.type.startsWith('text/')) {
        if (arq.size > LIMITE_TEXTO) throw new Error('O arquivo passa de 2 MB.');
        const texto = await arq.text();
        if (nome.endsWith('.json')) {
          let json: unknown;
          try {
            json = JSON.parse(texto);
          } catch {
            throw new Error('JSON inválido.');
          }
          const b = briefingDoJson(json);
          if (!b) throw new Error('Este JSON não tem campos de briefing.');
          lido = {
            briefing: b,
            reconhecidos: CAMPOS_BRIEFING.filter((c) => b[c.id].trim()).map((c) => c.id),
          };
        } else lido = briefingDoTexto(texto);
      } else if (nome.endsWith('.doc') || nome.endsWith('.pdf')) {
        throw new Error(
          'Arquivos .doc e .pdf ainda não: no Word, use Arquivo → Salvar como → .docx (ou copie o texto para um .txt).',
        );
      } else throw new Error('Use um arquivo .docx, .txt, .md ou .json.');

      const atual = this.b();
      const novo =
        this.modo() === 'juntar'
          ? Object.fromEntries(
              CAMPOS_BRIEFING.map((c) => [
                c.id,
                atual[c.id].trim() ? atual[c.id] : lido.briefing[c.id],
              ]),
            )
          : lido.briefing;
      this.projeto.briefing.set(novo as typeof atual);
      this.reconhecidos.set(new Set(lido.reconhecidos));
      const n = lido.reconhecidos.length;
      this.status.set({
        tipo: 'ok',
        texto: n
          ? `${arq.name}: ${n} campo(s) reconhecido(s). Confira abaixo; o que não tinha título foi para Observações.`
          : `${arq.name}: nenhum título reconhecido, o texto foi para Observações. Distribua nos campos.`,
      });
    } catch (e) {
      this.status.set({ tipo: 'erro', texto: (e as Error).message });
    }
  }

  protected criarPaginas(): void {
    const n = this.projeto.criarPaginas(this.paginas());
    this.status.set({
      tipo: 'ok',
      texto: n
        ? `${n} página(s) criada(s) nas Telas. Agora ligue-as no mapa de navegação.`
        : 'Essas páginas já existem nas Telas.',
    });
  }

  private nomeArquivo(): string {
    return (
      (this.b().projeto || 'briefing')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'briefing'
    );
  }
  protected baixarMd(): void {
    baixarArquivo(
      briefingParaMarkdown(this.b()),
      `${this.nomeArquivo()}-briefing.md`,
      'text/markdown',
    );
  }
  protected baixarJson(): void {
    baixarArquivo(
      arquivoDoBriefing(this.b()),
      `${this.nomeArquivo()}.kcx-briefing.json`,
      'application/json',
    );
  }
  protected limpar(): void {
    if (!globalThis.confirm?.('Apagar todo o briefing?')) return;
    this.projeto.briefing.set(briefingVazio());
    this.reconhecidos.set(new Set());
    this.status.set(null);
  }
}

import { Component, computed, input, output, signal } from '@angular/core';
import { KcxAlteracoesFigma, KcxComponente, KcxValor } from '../../../kcx/kcx.types';
import { Valores, valoresAtuais } from '../../../kcx/resolver';
import {
  DiferencaValor,
  compararValores,
  compararVersoes,
  desserializar,
} from '../../../kcx/serializar';
import { Icon } from '../../../shared/components/icon/icon';
import { lerArquivo } from '../kcx-estado.service';

/**
 * Figma → Lab: lê um arquivo de alterações (gerado pelo plugin) ou um pacote
 * .kcx.json, mostra as diferenças e só aplica o que o usuário marcar.
 * Nada é sobrescrito automaticamente.
 */
@Component({
  selector: 'kx-kcx-importar-painel',
  imports: [Icon],
  templateUrl: './kcx-importar-painel.html',
  styleUrl: './kcx-importar-painel.css',
})
export class KcxImportarPainel {
  readonly comp = input.required<KcxComponente>();
  readonly valores = input.required<Valores>();
  readonly aplicar = output<Record<string, KcxValor>>();

  protected readonly diferencas = signal<DiferencaValor[]>([]);
  protected readonly marcadas = signal<Set<string>>(new Set());
  protected readonly info = signal('');
  protected readonly erro = signal('');
  protected readonly lido = signal(false);
  protected readonly qtdMarcadas = computed(() => this.marcadas().size);

  /** Processa o texto de um arquivo (separado do evento para poder testar). */
  processar(texto: string): void {
    this.erro.set('');
    this.info.set('');
    this.diferencas.set([]);
    this.lido.set(false);
    let recebidos: Valores | null = null;
    let origem = '';
    let bruto: { formato?: string } | null = null;
    try {
      bruto = JSON.parse(texto);
    } catch {
      this.erro.set('O arquivo não é um JSON válido.');
      return;
    }
    if (bruto?.formato === 'kcx-alteracoes') {
      const alt = bruto as unknown as KcxAlteracoesFigma;
      if (alt.componente !== this.comp().id) {
        this.erro.set(
          `As alterações são do componente "${alt.componente}", não de "${this.comp().id}".`,
        );
        return;
      }
      recebidos = alt.valores ?? {};
      origem = `Alterações exportadas do Figma em ${new Date(alt.exportadoEm).toLocaleString('pt-BR')} (versão ${alt.versao}).`;
    } else {
      const r = desserializar(texto);
      if (!r.ok) {
        this.erro.set(
          `${r.erro} ${
            r.validacao?.erros
              .slice(0, 3)
              .map((e) => `${e.caminho}: ${e.mensagem}`)
              .join(' · ') ?? ''
          }`,
        );
        return;
      }
      const c = r.pacote.componentes.find((x) => x.id === this.comp().id);
      if (!c) {
        this.erro.set(`O pacote não contém o componente "${this.comp().id}".`);
        return;
      }
      recebidos = valoresAtuais(c.variaveis);
      const cmp = compararVersoes(c.versao, this.comp().versao);
      origem = `Pacote "${r.pacote.nome}" (componente v${c.versao}${cmp !== 0 ? `, o lab está na v${this.comp().versao}` : ''}).`;
    }
    const r = compararValores(this.comp().variaveis, this.valores(), recebidos);
    this.diferencas.set(r.diferencas);
    this.marcadas.set(new Set(r.diferencas.filter((d) => d.valido).map((d) => d.variavel)));
    this.lido.set(true);
    this.info.set(
      `${origem} ${r.diferencas.length} diferença(s).` +
        (r.desconhecidas.length
          ? ` Ignoradas (não existem aqui): ${r.desconhecidas.join(', ')}.`
          : ''),
    );
  }

  protected async escolher(e: Event): Promise<void> {
    const texto = await lerArquivo(e);
    if (texto !== null) this.processar(texto);
  }

  protected alternar(id: string, marcado: boolean): void {
    this.marcadas.update((s) => {
      const n = new Set(s);
      if (marcado) n.add(id);
      else n.delete(id);
      return n;
    });
  }

  protected aplicarMarcadas(): void {
    const v: Record<string, KcxValor> = {};
    for (const d of this.diferencas())
      if (this.marcadas().has(d.variavel) && d.valido) v[d.variavel] = d.depois;
    this.aplicar.emit(v);
    this.info.set(`${Object.keys(v).length} variável(is) atualizada(s) no lab.`);
    this.diferencas.set([]);
    this.marcadas.set(new Set());
  }

  protected mostrar(x: KcxValor): string {
    return typeof x === 'object' ? JSON.stringify(x) : String(x);
  }
}

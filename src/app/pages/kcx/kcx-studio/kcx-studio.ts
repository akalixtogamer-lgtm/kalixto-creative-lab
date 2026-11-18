import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KCX_COMPONENTES } from '../../../kcx/componentes';
import { TIPOS_CONSTRUTOR } from '../../../kcx/construtor';
import { KcxMeusService } from '../kcx-meus.service';
import { KCX_SCHEMA_VERSION, KcxPacote } from '../../../kcx/kcx.types';
import { svgEstatico } from '../../../kcx/exportar-kcx';
import { PlanoFigma, planejarFigma } from '../../../kcx/figma-plano';
import { ResultadoValidacao } from '../../../kcx/validar';
import { desserializar } from '../../../kcx/serializar';
import { KCX_JSON_SCHEMA } from '../../../kcx/kcx.schema';
import { Icon } from '../../../shared/components/icon/icon';
import { baixarArquivo, lerArquivo } from '../kcx-estado.service';

/** KCX Studio (/kcx): componentes, validador de arquivos e explicação do formato. */
@Component({
  selector: 'kx-kcx-studio',
  imports: [RouterLink, Icon],
  templateUrl: './kcx-studio.html',
  styleUrl: './kcx-studio.css',
})
export class KcxStudio {
  protected readonly versao = KCX_SCHEMA_VERSION;
  private readonly servicoMeus = inject(KcxMeusService);
  protected readonly meus = this.servicoMeus.meus;
  protected readonly totalTipos = TIPOS_CONSTRUTOR.length;
  protected readonly importacao = signal<{ salvos: string[]; erros: string[] } | null>(null);

  /** Adiciona aos "Meus componentes" um .kcx.json (ex.: enviado pelo Figma Bridge). */
  protected async importarMeus(e: Event): Promise<void> {
    const texto = await lerArquivo(e);
    if (texto === null) return;
    const r = desserializar(texto);
    if (!r.ok) {
      this.importacao.set({ salvos: [], erros: [r.erro] });
      return;
    }
    this.importacao.set(this.servicoMeus.importar(r.pacote));
  }
  protected readonly cards = KCX_COMPONENTES.map((c) => ({
    comp: c,
    svg: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgEstatico(c, {})),
    vinculos: c.variaveis.reduce((s, v) => s + v.vinculos.length, 0),
  }));

  protected readonly arquivo = signal('');
  protected readonly validacao = signal<ResultadoValidacao | null>(null);
  protected readonly erroLeitura = signal('');
  protected readonly pacote = signal<KcxPacote | null>(null);
  protected readonly plano = computed<PlanoFigma | null>(() => {
    const p = this.pacote();
    return p ? planejarFigma(p) : null;
  });

  protected conhecido(id: string): boolean {
    return !!this.servicoMeus.buscar(id);
  }

  protected async validar(e: Event): Promise<void> {
    const input = e.target as HTMLInputElement;
    this.arquivo.set(input.files?.[0]?.name ?? '');
    const texto = await lerArquivo(e);
    if (texto !== null) this.validarTexto(texto);
  }

  validarTexto(texto: string): void {
    const r = desserializar(texto);
    this.validacao.set(r.validacao ?? null);
    this.erroLeitura.set(r.ok ? '' : r.erro);
    this.pacote.set(r.ok ? r.pacote : null);
  }

  protected baixarSchema(): void {
    baixarArquivo(
      JSON.stringify(KCX_JSON_SCHEMA, null, 2) + '\n',
      'kcx.schema.json',
      'application/schema+json',
    );
  }
}

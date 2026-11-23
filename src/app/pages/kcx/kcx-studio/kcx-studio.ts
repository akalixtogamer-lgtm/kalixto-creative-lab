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
import { KcxImportarDs } from '../kcx-importar-ds/kcx-importar-ds';
import { TAG_MOTION_LIBRARY } from '../../../kcx/comparar';
import { baixarArquivo, lerArquivo } from '../kcx-estado.service';

interface ResultadoImportacao {
  salvos: string[];
  /** Ids que já existiam nos "Meus componentes" e foram trocados pela versão do arquivo. */
  substituidos: string[];
  erros: string[];
}

/** Aceita .kcx.json, .json e .kcx (alguns navegadores salvam o download do plugin sem o .json). */
export const ACEITA_KCX = '.json,.kcx,application/json';

/** KCX Studio (/kcx): componentes, validador de arquivos e explicação do formato. */
@Component({
  selector: 'kx-kcx-studio',
  imports: [RouterLink, Icon, KcxImportarDs],
  templateUrl: './kcx-studio.html',
  styleUrl: './kcx-studio.css',
})
export class KcxStudio {
  protected readonly versao = KCX_SCHEMA_VERSION;
  protected readonly aceita = ACEITA_KCX;
  private readonly servicoMeus = inject(KcxMeusService);
  protected readonly meus = this.servicoMeus.meus;
  protected readonly recuperaveis = this.servicoMeus.recuperaveis;
  /** Componentes marcados para a Motion Library (vêm do comparador). */
  protected readonly motionLibrary = computed(() =>
    this.meus().filter((c) => c.metadados.tags.includes(TAG_MOTION_LIBRARY)),
  );

  protected baixarRecuperavel(i: number): void {
    const r = this.recuperaveis()[i];
    if (!r) return;
    const id = (r.componente as { id?: unknown } | null)?.id;
    baixarArquivo(
      JSON.stringify(r.componente, null, 2) + '\n',
      `${typeof id === 'string' ? id : 'componente'}-recuperado.json`,
      'application/json',
    );
  }

  protected descartarRecuperavel(i: number): void {
    this.servicoMeus.descartarRecuperavel(i);
  }

  protected nomeRecuperavel(c: unknown): string {
    const o = (c ?? {}) as { nome?: unknown; id?: unknown };
    return typeof o.nome === 'string' ? o.nome : typeof o.id === 'string' ? o.id : 'Sem nome';
  }
  protected readonly totalTipos = TIPOS_CONSTRUTOR.length;
  protected readonly importacao = signal<ResultadoImportacao | null>(null);

  /** Adiciona aos "Meus componentes" um .kcx.json (ex.: enviado pelo Figma Bridge). */
  protected async importarMeus(e: Event): Promise<void> {
    const texto = await lerArquivo(e);
    if (texto === null) return;
    const r = desserializar(texto);
    if (!r.ok) {
      this.importacao.set({ salvos: [], substituidos: [], erros: [r.erro] });
      return;
    }
    this.adicionar(r.pacote);
  }

  /** Salva o pacote nos "Meus componentes" e diz quais entraram e quais foram substituídos. */
  adicionar(p: KcxPacote): void {
    const existiam = new Set(this.meus().map((c) => c.id));
    const r = this.servicoMeus.importar(p);
    this.importacao.set({
      ...r,
      substituidos: r.salvos.filter((id) => existiam.has(id)),
    });
  }

  protected nomeDe(id: string): string {
    return this.servicoMeus.buscar(id)?.nome ?? id;
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

  /** Algum componente do pacote validado ainda não está nos "Meus componentes". */
  protected readonly faltaAdicionar = computed(
    () => !!this.pacote()?.componentes.some((c) => !this.servicoMeus.ehMeu(c.id)),
  );

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

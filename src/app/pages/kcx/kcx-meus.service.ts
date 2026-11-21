import { Injectable, computed, signal } from '@angular/core';
import { KCX_COMPONENTES } from '../../kcx/componentes';
import { comTamanhoEditavel, comVidroEditavel } from '../../kcx/construtor';
import { KcxComponente, KcxPacote } from '../../kcx/kcx.types';
import { KcxRecuperavel, RepositorioMeusComponentes } from '../../kcx/meus-componentes';

const CHAVE_CAMADAS_VIDRO = 'kalixto-lab:kcx-vidro-camada:v1';

function lerCamadas(): Record<string, string> {
  try {
    const x = JSON.parse(globalThis.localStorage?.getItem(CHAVE_CAMADAS_VIDRO) ?? '{}');
    return x && typeof x === 'object' ? x : {};
  } catch {
    return {};
  }
}

/**
 * Componentes de referência + os criados pela pessoa (construtor ou Figma).
 * Todos ganham as variáveis "Vidro · …" (desligadas por padrão), ligadas à
 * camada escolhida no editor.
 */
@Injectable({ providedIn: 'root' })
export class KcxMeusService {
  private readonly repo = new RepositorioMeusComponentes();
  readonly meus = signal<KcxComponente[]>(this.repo.listar());
  /** Guardados que não passam mais na validação: nunca somem sem a pessoa decidir. */
  readonly recuperaveis = signal<KcxRecuperavel[]>(this.repo.recuperaveis());
  /** Camada do vidro escolhida por componente (id → id da camada). */
  readonly camadasVidro = signal<Record<string, string>>(lerCamadas());
  private readonly comVidro = computed(() =>
    [...KCX_COMPONENTES, ...this.meus()].map((c) => {
      try {
        return comVidroEditavel(comTamanhoEditavel(c), this.camadasVidro()[c.id]);
      } catch {
        return { comp: c, camada: '', avisos: [] as string[] };
      }
    }),
  );
  readonly todos = computed(() => this.comVidro().map((r) => r.comp));

  /** Camada com vidro e o que não sai igual no código/Figma. */
  vidro(id: string): { camada: string; avisos: string[] } | undefined {
    return this.comVidro().find((r) => r.comp.id === id);
  }

  definirCamadaVidro(id: string, camada: string): void {
    const novo = { ...this.camadasVidro(), [id]: camada };
    this.camadasVidro.set(novo);
    try {
      globalThis.localStorage?.setItem(CHAVE_CAMADAS_VIDRO, JSON.stringify(novo));
    } catch {
      /* sem armazenamento: vale até recarregar */
    }
  }

  buscar(id: string): KcxComponente | undefined {
    return this.todos().find((c) => c.id === id);
  }

  ehMeu(id: string): boolean {
    return this.meus().some((c) => c.id === id);
  }

  /** Ids já usados (referência + meus), para não sobrescrever um componente sem querer. */
  ids(): string[] {
    return this.todos().map((c) => c.id);
  }

  salvar(comp: KcxComponente): string[] {
    if (KCX_COMPONENTES.some((c) => c.id === comp.id))
      return [`"${comp.id}" é o id de um componente de referência; escolha outro nome.`];
    const erros = this.repo.salvar(comp);
    if (!erros.length) this.meus.set(this.repo.listar());
    return erros;
  }

  remover(id: string): void {
    this.repo.remover(id);
    this.meus.set(this.repo.listar());
  }

  descartarRecuperavel(indice: number): void {
    this.repo.descartarRecuperavel(indice);
    this.recuperaveis.set(this.repo.recuperaveis());
  }

  importar(p: KcxPacote): { salvos: string[]; erros: string[] } {
    const conflitos = p.componentes.filter((c) => KCX_COMPONENTES.some((r) => r.id === c.id));
    if (conflitos.length)
      return {
        salvos: [],
        erros: conflitos.map((c) => `"${c.id}" é um componente de referência.`),
      };
    const r = this.repo.importarPacote(p);
    this.meus.set(this.repo.listar());
    return r;
  }
}

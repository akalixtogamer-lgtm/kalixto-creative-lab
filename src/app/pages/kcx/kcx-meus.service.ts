import { Injectable, computed, signal } from '@angular/core';
import { KCX_COMPONENTES } from '../../kcx/componentes';
import { KcxComponente, KcxPacote } from '../../kcx/kcx.types';
import { RepositorioMeusComponentes } from '../../kcx/meus-componentes';

/** Componentes de referência + os criados pela pessoa (construtor ou Figma). */
@Injectable({ providedIn: 'root' })
export class KcxMeusService {
  private readonly repo = new RepositorioMeusComponentes();
  readonly meus = signal<KcxComponente[]>(this.repo.listar());
  readonly todos = computed(() => [...KCX_COMPONENTES, ...this.meus()]);

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

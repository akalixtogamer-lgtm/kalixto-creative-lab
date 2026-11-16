import { NIVEL_ROTULO } from '../../core/models/demo.model';
import { EffectNivel } from '../../core/models/effect.model';
import { Component, computed, input, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/components/icon/icon';
import { EFFECTS } from '../../core/data/effects.data';
import { LABS, findLab } from '../../core/data/labs.data';
import { PageHeader } from '../../shared/components/page-header/page-header';

/**
 * Biblioteca de Efeitos — estrutura da Fase 1.
 * Lista o catálogo com filtro por laboratório e busca por texto.
 * Aceita ?lab=css na URL para já abrir filtrada.
 */
@Component({
  selector: 'kx-biblioteca',
  imports: [FormsModule, NgTemplateOutlet, RouterLink, Icon, PageHeader],
  templateUrl: './biblioteca.html',
  styleUrl: './biblioteca.css',
})
export class Biblioteca {
  /** O template recebe o efeito sem tipo (ng-template), por isso a função. */
  protected rotuloNivel(nivel: EffectNivel): string {
    return NIVEL_ROTULO[nivel];
  }
  /** Query param ?lab= (withComponentInputBinding). */
  readonly lab = input<string>();

  protected readonly labs = LABS.filter((l) => EFFECTS.some((e) => e.labId === l.id));
  protected readonly busca = signal('');
  protected readonly filtroManual = signal<string | null>(null);

  /** O filtro escolhido na tela tem prioridade sobre o da URL. */
  protected readonly filtroLab = computed(() => this.filtroManual() ?? this.lab() ?? 'todos');

  protected readonly efeitos = computed(() => {
    const termo = this.busca().trim().toLowerCase();
    const lab = this.filtroLab();
    return EFFECTS.filter(
      (e) =>
        (lab === 'todos' || e.labId === lab) &&
        (!termo || `${e.nome} ${e.topico} ${e.descricao}`.toLowerCase().includes(termo)),
    );
  });

  protected nomeLab(id: string): string {
    return findLab(id)?.titulo ?? id;
  }

  protected acentoLab(id: string): string {
    return findLab(id)?.acento ?? 'magenta';
  }
}

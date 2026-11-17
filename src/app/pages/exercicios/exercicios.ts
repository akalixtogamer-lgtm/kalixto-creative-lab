import { Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { EXERCICIOS, Questao } from '../../core/data/exercicios.data';
import { LABS, findLab } from '../../core/data/labs.data';
import { ProgressoService } from '../../core/services/progresso.service';
import { PageHeader } from '../../shared/components/page-header/page-header';

/**
 * Exercícios: perguntas de múltipla escolha por laboratório,
 * com correção na hora e explicação. As respostas ficam salvas no navegador.
 */
@Component({
  selector: 'kx-exercicios',
  imports: [PageHeader],
  templateUrl: './exercicios.html',
  styleUrl: './exercicios.css',
})
export class Exercicios {
  private readonly router = inject(Router);
  protected readonly progresso = inject(ProgressoService);

  /** ?lab= na URL */
  readonly lab = input<string>();

  protected readonly labs = LABS.filter((l) => EXERCICIOS.some((q) => q.labId === l.id));
  protected readonly labAtual = computed(() => findLab(this.lab()) ?? this.labs[0]);
  protected readonly questoes = computed(() => EXERCICIOS.filter((q) => q.labId === this.labAtual().id));
  /** Alternativa clicada nesta visita (para destacar a escolhida). */
  protected readonly escolhas = signal<Record<string, number>>({});

  protected readonly placar = computed(() => {
    const r = this.progresso.exercicios();
    const qs = this.questoes();
    return {
      respondidas: qs.filter((q) => q.id in r).length,
      acertos: qs.filter((q) => r[q.id]).length,
      total: qs.length,
    };
  });
  protected readonly geral = computed(() => {
    const r = this.progresso.exercicios();
    return { acertos: EXERCICIOS.filter((q) => r[q.id]).length, total: EXERCICIOS.length };
  });

  trocarLab(id: string): void {
    this.router.navigate([], { queryParams: { lab: id }, replaceUrl: true });
  }

  responder(q: Questao, i: number): void {
    if (this.respondida(q)) return;
    this.escolhas.update((e) => ({ ...e, [q.id]: i }));
    this.progresso.responder(q.id, i === q.correta);
  }

  refazer(): void {
    const ids = this.questoes().map((q) => q.id);
    this.progresso.refazer(ids);
    this.escolhas.update((e) => Object.fromEntries(Object.entries(e).filter(([k]) => !ids.includes(k))));
  }

  protected respondida(q: Questao): boolean {
    return q.id in this.progresso.exercicios();
  }

  protected acertou(q: Questao): boolean {
    return this.progresso.exercicios()[q.id] === true;
  }

  /** Estado visual de cada alternativa depois de responder. */
  protected estado(q: Questao, i: number): string {
    if (!this.respondida(q)) return '';
    if (i === q.correta) return 'is-correta';
    return this.escolhas()[q.id] === i ? 'is-errada' : 'is-apagada';
  }

  protected letra(i: number): string {
    return 'ABCD'[i];
  }

  protected contagem(labId: string): string {
    const r = this.progresso.exercicios();
    const qs = EXERCICIOS.filter((q) => q.labId === labId);
    return `${qs.filter((q) => r[q.id]).length}/${qs.length}`;
  }
}

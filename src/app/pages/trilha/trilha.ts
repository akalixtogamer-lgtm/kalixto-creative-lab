import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DEMOS_POR_LAB } from '../../core/data/effects.data';
import { EXERCICIOS } from '../../core/data/exercicios.data';
import { LABS } from '../../core/data/labs.data';
import { NIVEL_ROTULO } from '../../core/models/demo.model';
import { ProgressoService } from '../../core/services/progresso.service';
import { Icon } from '../../shared/components/icon/icon';
import { PageHeader } from '../../shared/components/page-header/page-header';

/**
 * Trilha de aprendizagem: todos os laboratórios em ordem, com o que já foi
 * executado, os desafios concluídos e um botão para continuar de onde parou.
 */
@Component({
  selector: 'kx-trilha',
  imports: [RouterLink, Icon, PageHeader],
  templateUrl: './trilha.html',
  styleUrl: './trilha.css',
})
export class Trilha {
  protected readonly progresso = inject(ProgressoService);
  protected readonly nivel = NIVEL_ROTULO;
  protected readonly confirmarZerar = signal(false);

  /** Módulos da trilha: só laboratórios que já têm demos. */
  protected readonly modulos = computed(() => {
    const feitas = this.progresso.executadas();
    const desafios = this.progresso.desafios();
    const respostas = this.progresso.exercicios();
    return LABS.filter((l) => DEMOS_POR_LAB[l.id]).map((lab) => {
      const passos = DEMOS_POR_LAB[lab.id].map((d) => ({
        demo: d,
        feita: feitas.has(`${lab.id}:${d.id}`),
        desafio: !!d.desafio,
        desafioFeito: desafios.has(`${lab.id}:${d.id}`),
      }));
      const questoes = EXERCICIOS.filter((q) => q.labId === lab.id);
      const feitos = passos.filter((p) => p.feita).length;
      return {
        lab,
        passos,
        feitos,
        pct: Math.round((feitos / passos.length) * 100),
        desafiosFeitos: passos.filter((p) => p.desafioFeito).length,
        acertos: questoes.filter((q) => respostas[q.id]).length,
        questoes: questoes.length,
      };
    });
  });

  protected readonly total = computed(() => {
    const m = this.modulos();
    const passos = m.reduce((s, x) => s + x.passos.length, 0);
    const feitos = m.reduce((s, x) => s + x.feitos, 0);
    const desafios = m.reduce((s, x) => s + x.desafiosFeitos, 0);
    return { passos, feitos, desafios, pct: passos ? Math.round((feitos / passos) * 100) : 0 };
  });

  /** Próxima demo ainda não executada, na ordem da trilha. */
  protected readonly proxima = computed(() => {
    for (const m of this.modulos()) {
      const p = m.passos.find((x) => !x.feita);
      if (p) return { lab: m.lab, demo: p.demo };
    }
    return undefined;
  });

  zerar(): void {
    if (!this.confirmarZerar()) {
      this.confirmarZerar.set(true);
      return;
    }
    this.progresso.zerar();
    this.confirmarZerar.set(false);
  }
}

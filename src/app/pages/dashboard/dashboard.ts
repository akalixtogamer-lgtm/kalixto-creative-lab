import { Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LABS } from '../../core/data/labs.data';
import { EFFECTS } from '../../core/data/effects.data';
import { FASES } from '../../core/data/roadmap.data';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';

/** Página inicial: visão geral dos laboratórios e da fase atual. */
@Component({
  selector: 'kx-dashboard',
  imports: [RouterLink, StatusBadge],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  protected readonly labs = LABS;
  protected readonly faseAtual = FASES.find((f) => f.situacao === 'em-andamento') ?? FASES[0];

  protected readonly labsMvp = computed(() => this.labs.filter((l) => l.fase === 2));
  protected readonly labsFuturos = computed(() => this.labs.filter((l) => l.fase > 2));

  protected readonly stats = [
    { valor: LABS.length, rotulo: 'laboratórios no roadmap' },
    { valor: EFFECTS.length, rotulo: 'efeitos catalogados' },
    { valor: EFFECTS.filter((e) => e.implementado).length, rotulo: 'efeitos implementados' },
    { valor: `${this.faseAtual.numero}/${FASES.length}`, rotulo: 'fase atual' },
  ];
}

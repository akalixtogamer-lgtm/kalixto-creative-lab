import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LABS } from '../../core/data/labs.data';
import { EFFECTS } from '../../core/data/effects.data';
import { FASES } from '../../core/data/roadmap.data';
import { Lab } from '../../core/models/lab.model';
import { Icon } from '../../shared/components/icon/icon';
import { Logo } from '../../shared/components/logo/logo';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';

/** Página inicial: o que fazer primeiro, laboratórios e andamento. */
@Component({
  selector: 'kx-dashboard',
  imports: [RouterLink, Icon, Logo, StatusBadge],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  protected readonly faseAtual = FASES.find((f) => f.situacao === 'em-andamento') ?? FASES[0];
  protected readonly labsMvp = LABS.filter((l) => l.fase === 2);
  protected readonly labsFuturos = LABS.filter((l) => l.fase > 2);
  protected readonly primeiroDisponivel = LABS.find((l) => l.disponivel);

  protected readonly passos = [
    { titulo: 'Escolha um laboratório', texto: 'Comece pelos que estão marcados como “Pronto para testar”.' },
    { titulo: 'Ajuste e execute', texto: 'Mexa nos controles e clique em Executar para ver o efeito.' },
    { titulo: 'Entenda e copie', texto: 'O código muda junto com os controles. Leia a explicação e copie.' },
  ];

  protected readonly stats = [
    { valor: EFFECTS.filter((e) => e.implementado).length, rotulo: 'demos interativas' },
    { valor: LABS.filter((l) => l.disponivel).length, rotulo: `de ${LABS.length} laboratórios prontos` },
    { valor: `${this.faseAtual.numero}/${FASES.length}`, rotulo: 'fase do roadmap' },
  ];

  /** Quantas demos do laboratório já estão prontas. */
  protected progresso(lab: Lab): { feitos: number; total: number; pct: number } {
    const efeitos = EFFECTS.filter((e) => e.labId === lab.id);
    const feitos = efeitos.filter((e) => e.implementado).length;
    const total = Math.max(lab.topicos.length, efeitos.length);
    return { feitos, total, pct: Math.round((feitos / total) * 100) };
  }
}

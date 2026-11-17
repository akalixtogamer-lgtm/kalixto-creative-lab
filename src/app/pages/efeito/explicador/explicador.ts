import { Component, computed, input, signal } from '@angular/core';
import { EffectKit } from '../../../core/models/effect-sheet.model';

type Nivel = 'iniciante' | 'intermediario' | 'avancado';

/**
 * Code Explainer: a explicação do efeito em três níveis + glossário dos
 * termos que aparecem no código (o teste garante que cada termo existe no código).
 */
@Component({
  selector: 'kx-explicador',
  templateUrl: './explicador.html',
  styleUrl: './explicador.css',
})
export class Explicador {
  readonly kit = input.required<EffectKit>();

  protected readonly niveis: { id: Nivel; rotulo: string; descricao: string }[] = [
    { id: 'iniciante', rotulo: 'Iniciante', descricao: 'Conceitos, sem jargão' },
    { id: 'intermediario', rotulo: 'Intermediário', descricao: 'Lógica e propriedades' },
    { id: 'avancado', rotulo: 'Avançado', descricao: 'Arquitetura e performance' },
  ];
  protected readonly nivel = signal<Nivel>('iniciante');

  protected readonly paragrafos = computed(() => {
    const k = this.kit();
    const n = this.nivel();
    return n === 'intermediario' ? k.ficha.explicacao : k.niveis[n];
  });
}

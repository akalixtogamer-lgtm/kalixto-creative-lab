import { Component, ElementRef, computed, effect, inject, input, output, signal, untracked, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { vizinhos } from '../../../core/data/labs.data';
import {
  LabDemo,
  NIVEL_ROTULO,
  ParamDef,
  Preset,
  Valor,
  Valores,
  cumpreMeta,
} from '../../../core/models/demo.model';
import { Lab } from '../../../core/models/lab.model';
import { ProgressoService } from '../../../core/services/progresso.service';
import { Breadcrumb } from '../breadcrumb/breadcrumb';
import { CodeViewer } from '../code-viewer/code-viewer';
import { DemoControls } from '../demo-controls/demo-controls';
import { Icon } from '../icon/icon';
import { StatusBadge } from '../status-badge/status-badge';

/**
 * Layout comum de todos os laboratórios.
 *
 * O laboratório entrega só o palco (projetado com o atributo `palco`) e
 * reage aos eventos executar / reiniciar / mudou. Todo o resto — seletor
 * de demos, controles, presets, desafio, código, explicação, navegação e
 * registro de progresso — fica aqui, igual para todos.
 *
 * Uso:
 *   <kx-lab-layout [lab]="lab" [demos]="demos" [atual]="atual()" [valores]="valores()"
 *     [codigo]="codigo()" (executar)="executar()" (reiniciar)="reiniciar()"
 *     (mudou)="alterar($event.param, $event.valor)" (aplicar)="aplicar($event)">
 *     <div palco #palco class="palco">…</div>
 *   </kx-lab-layout>
 */
@Component({
  selector: 'kx-lab-layout',
  imports: [RouterLink, Breadcrumb, CodeViewer, DemoControls, Icon, StatusBadge],
  templateUrl: './lab-layout.html',
  styleUrl: './lab-layout.css',
})
export class LabLayout {
  private readonly router = inject(Router);
  protected readonly progresso = inject(ProgressoService);
  private readonly seletor = viewChild<ElementRef<HTMLElement>>('seletor');

  readonly lab = input.required<Lab>();
  readonly demos = input.required<LabDemo[]>();
  readonly atual = input.required<LabDemo>();
  readonly valores = input.required<Valores>();
  readonly codigo = input.required<string>();
  readonly linguagem = input('CSS');
  /** Esconde o botão principal (labs em que tudo é ao vivo). */
  readonly semExecutar = input(false);

  readonly executar = output<void>();
  readonly reiniciar = output<void>();
  readonly mudou = output<{ param: ParamDef; valor: Valor }>();
  readonly aplicar = output<Valores>();

  protected readonly nivel = NIVEL_ROTULO;
  protected readonly nomePreset = signal('');
  protected readonly comemorar = signal(false);

  protected readonly navegacao = computed(() => vizinhos(this.lab().id));
  protected readonly indice = computed(() => this.demos().indexOf(this.atual()));
  protected readonly anterior = computed(() => this.demos()[this.indice() - 1]);
  protected readonly proxima = computed(() => this.demos()[this.indice() + 1]);

  protected readonly meusPresets = computed(() => this.progresso.presets(this.lab().id, this.atual().id));
  protected readonly desafioFeito = computed(() =>
    this.progresso.desafios().has(`${this.lab().id}:${this.atual().id}`),
  );
  protected readonly metaAtingida = computed(() => {
    const d = this.atual().desafio;
    return !!d && cumpreMeta(this.valores(), d.meta);
  });

  /** Sem botão Executar: o lab inteiro é ao vivo ou só esta demo. */
  protected readonly aoVivo = computed(() => this.semExecutar() || !!this.atual().aoVivo);

  constructor() {
    // Demos ao vivo: o desafio conclui assim que os valores batem
    effect(() => {
      if (this.atual().aoVivo && this.metaAtingida() && !this.desafioFeito()) {
        untracked(() => this.concluirDesafio());
      }
    });
  }

  protected onMudou(evento: { param: ParamDef; valor: Valor }): void {
    this.mudou.emit(evento);
    if (this.aoVivo()) this.progresso.marcarExecutada(this.lab().id, this.atual().id);
  }

  selecionar(id: string): void {
    this.router
      .navigate([], { queryParams: { demo: id }, replaceUrl: true })
      .then(() =>
        this.seletor()
          ?.nativeElement.querySelector('.is-active')
          ?.scrollIntoView?.({ block: 'nearest', inline: 'center', behavior: 'smooth' }),
      );
  }

  protected rodar(): void {
    this.executar.emit();
    const { id } = this.atual();
    this.progresso.marcarExecutada(this.lab().id, id);
    if (this.metaAtingida() && !this.desafioFeito()) this.concluirDesafio();
  }

  private concluirDesafio(): void {
    this.progresso.marcarExecutada(this.lab().id, this.atual().id);
    this.progresso.concluirDesafio(this.lab().id, this.atual().id);
    this.comemorar.set(true);
    setTimeout(() => this.comemorar.set(false), 2600);
  }

  protected usarPreset(p: Preset): void {
    this.aplicar.emit({ ...this.valores(), ...p.valores });
  }

  protected salvarPreset(): void {
    const nome = this.nomePreset().trim();
    if (!nome) return;
    this.progresso.salvarPreset(this.lab().id, this.atual().id, nome, this.valores());
    this.nomePreset.set('');
  }

  protected removerPreset(p: Preset): void {
    this.progresso.removerPreset(this.lab().id, this.atual().id, p.nome);
  }

  protected feita(id: string): boolean {
    return this.progresso.executadas().has(`${this.lab().id}:${id}`);
  }

  protected numero(i: number): string {
    return String(i + 1).padStart(2, '0');
  }
}

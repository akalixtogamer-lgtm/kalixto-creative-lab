import { Component, inject, input, output, signal, computed } from '@angular/core';
import { KcxComponente, KcxPreset, KcxValor } from '../../../kcx/kcx.types';
import { Valores } from '../../../kcx/resolver';
import { PresetUsuario } from '../../../kcx/presets';
import { Icon } from '../../../shared/components/icon/icon';
import { KcxEstadoService, baixarArquivo, lerArquivo } from '../kcx-estado.service';

/**
 * Presets: conjuntos de valores de variáveis.
 * Criar, duplicar, renomear, editar (salvar os valores atuais), excluir,
 * exportar, importar e restaurar os valores padrão.
 */
@Component({
  selector: 'kx-kcx-presets-painel',
  imports: [Icon],
  templateUrl: './kcx-presets-painel.html',
  styleUrl: './kcx-presets-painel.css',
})
export class KcxPresetsPainel {
  readonly comp = input.required<KcxComponente>();
  readonly valores = input.required<Valores>();
  readonly ativo = input<string | undefined>();
  readonly aplicar = output<{ valores: Record<string, KcxValor>; preset?: string }>();
  readonly restaurar = output<void>();

  private readonly estado = inject(KcxEstadoService);
  /** Força a releitura da lista depois de cada alteração. */
  private readonly versao = signal(0);
  protected readonly meus = computed<PresetUsuario[]>(() => {
    this.versao();
    return this.estado.presets.listar(this.comp().id);
  });
  protected readonly editando = signal<string | null>(null);
  protected readonly mensagem = signal('');

  private recarregar(msg = ''): void {
    this.versao.update((n) => n + 1);
    this.mensagem.set(msg);
  }

  protected usar(p: KcxPreset): void {
    this.aplicar.emit({ valores: p.valores, preset: p.id });
    this.mensagem.set(`Preset “${p.nome}” aplicado.`);
  }

  protected criar(nome: string): void {
    const p = this.estado.presets.criar(this.comp(), nome, this.valores());
    this.recarregar(`Preset “${p.nome}” criado com os valores atuais.`);
  }

  protected duplicar(p: KcxPreset): void {
    const novo = this.estado.presets.duplicar(this.comp(), p);
    this.recarregar(`“${novo.nome}” criado.`);
  }

  protected renomear(p: PresetUsuario, nome: string): void {
    this.estado.presets.renomear(this.comp().id, p.id, nome);
    this.editando.set(null);
    this.recarregar('Preset renomeado.');
  }

  protected salvarAtuais(p: PresetUsuario): void {
    this.estado.presets.atualizar(this.comp(), p.id, this.valores());
    this.recarregar(`“${p.nome}” atualizado com os valores atuais.`);
  }

  protected remover(p: PresetUsuario): void {
    this.estado.presets.remover(this.comp().id, p.id);
    this.recarregar(`“${p.nome}” excluído.`);
  }

  protected exportar(): void {
    const arq = this.estado.presets.exportar(this.comp().id, [
      ...this.comp().presets,
      ...this.meus(),
    ]);
    baixarArquivo(
      JSON.stringify(arq, null, 2) + '\n',
      `${this.comp().id}.kcx-presets.json`,
      'application/json',
    );
  }

  protected async importar(e: Event): Promise<void> {
    const texto = await lerArquivo(e);
    if (texto === null) return;
    const r = this.estado.presets.importar(this.comp(), texto);
    this.recarregar(
      r.importados.length
        ? `${r.importados.length} preset(s) importado(s).${r.erros.length ? ' Avisos: ' + r.erros.join(' ') : ''}`
        : `Nada importado. ${r.erros.join(' ')}`,
    );
  }

  protected resumo(p: KcxPreset): string {
    return Object.keys(p.valores)
      .map((k) => this.comp().variaveis.find((v) => v.id === k)?.nome ?? k)
      .join(', ');
  }
}

import { Component, computed, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KCX_COMPONENTES } from '../../../kcx/componentes';
import {
  COMPOSICAO_PADRAO,
  documentoComposicao,
  pacoteComposicao,
  resolverComposicao,
  saidasComposicao,
} from '../../../kcx/composicao';
import { planejarFigma } from '../../../kcx/figma-plano';
import { KcxValor, KcxVariavel } from '../../../kcx/kcx.types';
import { Valores } from '../../../kcx/resolver';
import { serializar } from '../../../kcx/serializar';
import { Breadcrumb } from '../../../shared/components/breadcrumb/breadcrumb';
import { Icon } from '../../../shared/components/icon/icon';
import { KcxControles, MudancaVariavel } from '../kcx-controles/kcx-controles';
import { KcxPreview } from '../kcx-preview/kcx-preview';
import { baixarArquivo } from '../kcx-estado.service';

/**
 * Composição (/kcx/compor): várias animações num só componente.
 * Cada camada mantém as próprias variáveis; as compartilhadas alimentam
 * várias camadas ao mesmo tempo.
 */
@Component({
  selector: 'kx-kcx-compositor',
  imports: [RouterLink, Breadcrumb, Icon, KcxControles, KcxPreview],
  templateUrl: './kcx-compositor.html',
  styleUrl: './kcx-compositor.css',
})
export class KcxCompositor {
  protected readonly composicao = COMPOSICAO_PADRAO;
  protected readonly compartilhadas = signal<Record<string, KcxValor>>({});
  protected readonly porCamada = signal<Record<string, Valores>>({});
  protected readonly aberta = signal<string>('botao');

  protected readonly camadas = computed(() =>
    resolverComposicao(this.composicao, KCX_COMPONENTES, this.compartilhadas(), this.porCamada()),
  );
  protected readonly saidas = computed(() => saidasComposicao(this.camadas()));
  /** Recarrega só se a estrutura mudar (nunca ao mexer em variáveis). */
  protected readonly documento = computed(() =>
    documentoComposicao(this.composicao, untracked(this.camadas)),
  );

  /** Variáveis compartilhadas como variáveis editáveis (tipo e limites vêm do primeiro alvo). */
  protected readonly varsCompartilhadas = computed<KcxVariavel[]>(() =>
    this.composicao.compartilhadas.map((s) => {
      const [prefixo, varId] = s.alvos[0].split('.');
      const cam = this.composicao.camadas.find((c) => c.prefixo === prefixo)!;
      const base = KCX_COMPONENTES.find((c) => c.id === cam.componente)!.variaveis.find(
        (v) => v.id === varId,
      )!;
      return {
        ...base,
        id: s.id,
        nome: s.nome,
        padrao: s.valor,
        valor: this.compartilhadas()[s.id] ?? s.valor,
        descricao: `Compartilhada: ${s.alvos.join(', ')}`,
        vinculos: s.alvos.map((a) => ({
          propriedade: a,
          alvo: { tipo: 'css-var' as const, nome: '--kcx-composicao' },
        })),
      };
    }),
  );
  protected readonly valoresCompartilhados = computed(() =>
    Object.fromEntries(this.varsCompartilhadas().map((v) => [v.id, v.valor])),
  );

  protected readonly plano = computed(() =>
    planejarFigma(pacoteComposicao(this.composicao, this.camadas(), this.compartilhadas())),
  );

  protected mudarCompartilhada(m: MudancaVariavel): void {
    this.compartilhadas.update((v) => ({ ...v, [m.id]: m.valor }));
  }

  protected mudarCamada(prefixo: string, m: MudancaVariavel): void {
    this.porCamada.update((v) => ({ ...v, [prefixo]: { ...(v[prefixo] ?? {}), [m.id]: m.valor } }));
  }

  protected restaurar(): void {
    this.compartilhadas.set({});
    this.porCamada.set({});
  }

  protected baixar(): void {
    const p = pacoteComposicao(this.composicao, this.camadas(), this.compartilhadas());
    baixarArquivo(serializar(p), `${this.composicao.id}.kcx.json`, 'application/json');
  }
}

import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import {
  DISPOSITIVOS,
  Dispositivo,
  FIDELIDADES,
  Fidelidade,
  Tela,
  montarTela,
  naoCabem,
} from '../../../kcx/construtor';
import { planejarFigma } from '../../../kcx/figma-plano';
import { KcxComponente } from '../../../kcx/kcx.types';
import { documentoDaTela } from '../../../kcx/plano-html';
import { criarPacote, serializar } from '../../../kcx/serializar';
import { Icon } from '../../../shared/components/icon/icon';
import { baixarArquivo } from '../kcx-estado.service';
import { KcxFundacaoService } from '../kcx-fundacao.service';
import { KcxMeusService } from '../kcx-meus.service';

const CHAVE_TELA = 'kalixto-lab:kcx-tela:v1';

function lerTela(): Tela | null {
  try {
    const t = JSON.parse(globalThis.localStorage?.getItem(CHAVE_TELA) ?? 'null') as Tela | null;
    return t && Array.isArray(t.secoes) ? t : null;
  } catch {
    return null;
  }
}

/**
 * Telas (/kcx/telas): empilha componentes como seções de uma página e mostra
 * num mockup de desktop ou de celular, em wireframe de baixa, média ou alta
 * fidelidade. Exporta para o Figma com cada seção como instância.
 */
@Component({
  selector: 'kx-kcx-telas',
  imports: [RouterLink, Icon],
  templateUrl: './kcx-telas.html',
  styleUrl: './kcx-telas.css',
})
export class KcxTelas {
  /** ?com=<id>: já começa com este componente na tela. */
  readonly com = input<string>();

  private readonly meus = inject(KcxMeusService);
  private readonly fundacaoSrv = inject(KcxFundacaoService);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly dispositivos = Object.entries(DISPOSITIVOS) as [
    Dispositivo,
    (typeof DISPOSITIVOS)[Dispositivo],
  ][];
  protected readonly fidelidades = Object.entries(FIDELIDADES) as [
    Fidelidade,
    (typeof FIDELIDADES)[Fidelidade],
  ][];
  protected readonly zooms = [0.25, 0.4, 0.5, 0.75, 1];

  protected readonly tela = signal<Tela>(
    lerTela() ?? { nome: 'Página inicial', dispositivo: 'desktop', fidelidade: 'alta', secoes: [] },
  );
  protected readonly zoom = signal(0.5);
  protected readonly disponiveis = computed(() => this.meus.todos());

  constructor() {
    // Componente vindo do editor/montador entra no fim da tela (uma vez).
    effect(() => {
      const id = this.com();
      if (!id || !this.meus.buscar(id)) return;
      untracked(() => {
        if (!this.tela().secoes.includes(id)) this.alterar((t) => t.secoes.push(id));
      });
    });
    effect(() => {
      try {
        globalThis.localStorage?.setItem(CHAVE_TELA, JSON.stringify(this.tela()));
      } catch {
        /* sem armazenamento: segue em memória */
      }
    });
  }

  protected readonly secoes = computed(() =>
    this.tela()
      .secoes.map((id) => this.meus.buscar(id))
      .filter((c): c is KcxComponente => !!c),
  );
  protected readonly dispositivo = computed(() => DISPOSITIVOS[this.tela().dispositivo]);
  protected readonly fidelidade = computed(() => FIDELIDADES[this.tela().fidelidade]);
  protected readonly avisos = computed(() => naoCabem(this.tela(), this.secoes()));

  protected readonly resultado = computed<{ comp?: KcxComponente; erro?: string }>(() => {
    if (!this.secoes().length) return {};
    try {
      return { comp: montarTela(this.tela(), this.secoes(), this.fundacaoSrv.fundacao()) };
    } catch (e) {
      return { erro: (e as Error).message };
    }
  });

  protected readonly documento = computed<SafeHtml | null>(() => {
    const c = this.resultado().comp;
    if (!c) return null;
    try {
      const plano = planejarFigma(criarPacote([c]), 'visual');
      const raiz = plano.componentes.find((x) => x.id === c.id)?.variantes[0]?.arvore;
      if (!raiz) return null;
      return this.sanitizer.bypassSecurityTrustHtml(documentoDaTela(raiz, '#d9d6e6'));
    } catch {
      return null;
    }
  });

  private alterar(mudar: (t: Tela) => void): void {
    const t = structuredClone(this.tela());
    mudar(t);
    this.tela.set(t);
  }

  protected definir<K extends keyof Tela>(campo: K, valor: Tela[K]): void {
    this.alterar((t) => (t[campo] = valor));
    if (campo === 'dispositivo') this.zoom.set(valor === 'celular' ? 1 : 0.5);
  }

  protected adicionar(id: string): void {
    this.alterar((t) => t.secoes.push(id));
  }
  protected mover(i: number, d: -1 | 1): void {
    this.alterar((t) => {
      const j = i + d;
      if (j < 0 || j >= t.secoes.length) return;
      [t.secoes[i], t.secoes[j]] = [t.secoes[j], t.secoes[i]];
    });
  }
  protected remover(i: number): void {
    this.alterar((t) => t.secoes.splice(i, 1));
  }
  protected valor(e: Event): string {
    return (e.target as HTMLInputElement).value;
  }

  /** Pacote com a tela (e as seções como subcomponentes) para o Figma Bridge. */
  protected baixarFigma(): void {
    const c = this.resultado().comp;
    if (!c) return;
    const p = criarPacote([c], { fundacao: this.fundacaoSrv.paraPacote(), nome: c.nome });
    baixarArquivo(serializar(p), `${c.id}.kcx.json`, 'application/json');
  }
}

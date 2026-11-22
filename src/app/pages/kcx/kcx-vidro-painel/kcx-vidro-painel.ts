import { Component, computed, inject, input, output, signal } from '@angular/core';
import {
  AjustesVidro,
  IDS_VIDRO,
  PRESETS_VIDRO,
  ajustesAtuais,
  camadasParaVidro,
  temVidroEditavel,
  valoresVidro,
} from '../../../kcx/construtor';
import { KcxComponente, KcxValor } from '../../../kcx/kcx.types';
import { Valores } from '../../../kcx/resolver';
import { ControleNumero } from '../../../shared/components/controle-numero/controle-numero';
import { KcxMeusService } from '../kcx-meus.service';
import { KcxVidrosService, LIMITE_VIDROS } from '../kcx-vidros.service';
import { LuzDial } from './luz-dial';

interface Controle {
  id: string;
  nome: string;
  min: number;
  max: number;
  passo: number;
  /** Valor guardado × escala = o que aparece (0–1 aparece como 0–100). */
  escala: number;
  unidade: string;
}

const C = (
  id: string,
  nome: string,
  min: number,
  max: number,
  passo: number,
  escala = 1,
  unidade = '',
): Controle => ({ id, nome, min, max, passo, escala, unidade });

/** Na ordem do painel Glass do Figma, depois a superfície (fundo, véu, borda). */
const CONTROLES_VIDRO: Controle[] = [
  C(IDS_VIDRO.refracao, 'Refração', 0, 1, 0.01, 100),
  C(IDS_VIDRO.profundidade, 'Profundidade', 1, 100, 1),
  C(IDS_VIDRO.dispersao, 'Dispersão', 0, 1, 0.01, 100),
  C(IDS_VIDRO.desfoque, 'Gelo', 0, 40, 1, 1, 'px'),
  C(IDS_VIDRO.splay, 'Splay', 0, 1, 0.01, 100),
];
const CONTROLES_SUPERFICIE: Controle[] = [
  C(IDS_VIDRO.fundo, 'Fundo', 0, 1, 0.01, 100, '%'),
  C(IDS_VIDRO.veu, 'Véu claro', 0, 1, 0.01, 100, '%'),
  C(IDS_VIDRO.borda, 'Borda', 0, 1, 0.01, 100, '%'),
];

/**
 * Efeito vidro dentro da edição de qualquer componente, no modelo do painel
 * Glass do Figma: luz (ângulo e intensidade), refração, profundidade,
 * dispersão, gelo e splay. Tem vidros prontos e "Meus vidros" (salvos para
 * aplicar em outros componentes).
 */
@Component({
  selector: 'kx-kcx-vidro-painel',
  imports: [ControleNumero, LuzDial],
  templateUrl: './kcx-vidro-painel.html',
  styleUrl: './kcx-vidro-painel.css',
})
export class KcxVidroPainel {
  readonly comp = input.required<KcxComponente>();
  readonly valores = input.required<Valores>();
  readonly aplicar = output<Record<string, KcxValor>>();

  private readonly meus = inject(KcxMeusService);
  protected readonly vidros = inject(KcxVidrosService);
  protected readonly presets = PRESETS_VIDRO;
  protected readonly limite = LIMITE_VIDROS;
  protected readonly ids = IDS_VIDRO;

  protected readonly disponivel = computed(() => temVidroEditavel(this.comp()));
  protected readonly camadas = computed(() => camadasParaVidro(this.comp()));
  protected readonly info = computed(() => this.meus.vidro(this.comp().id));
  private readonly existe = computed(() => new Set(this.comp().variaveis.map((v) => v.id)));
  /** Componente salvo antes desta versão: só tem fundo, véu, borda e desfoque. */
  protected readonly temLuz = computed(() => this.existe().has(IDS_VIDRO.luz));
  protected readonly controlesVidro = computed(() =>
    CONTROLES_VIDRO.filter((c) => this.existe().has(c.id)),
  );
  protected readonly controlesSuperficie = computed(() =>
    CONTROLES_SUPERFICIE.filter((c) => this.existe().has(c.id)),
  );

  /** Ligado = algum valor de vidro fora do padrão. */
  protected readonly ligado = computed(() => {
    const padrao = valoresVidro(this.comp(), false);
    return Object.entries(padrao).some(([id, v]) => (this.valores()[id] ?? v) !== v);
  });
  private readonly atuais = computed(() => ajustesAtuais(this.comp(), this.valores()));
  /** Qual vidro pronto ou salvo bate com os valores atuais (para destacar o chip). */
  protected readonly escolhido = computed(() => {
    if (!this.ligado()) return null;
    const a = this.atuais();
    const igual = (b: AjustesVidro) =>
      Object.entries(b).every(
        ([k, v]) => a[k as keyof AjustesVidro] === undefined || a[k as keyof AjustesVidro] === v,
      );
    return (
      this.presets.find((p) => igual(p.ajustes))?.id ??
      this.vidros.salvos().find((s) => igual(s.ajustes))?.id ??
      null
    );
  });
  protected readonly nomeNovo = signal('');
  protected readonly mensagem = signal('');

  protected valor(id: string): number {
    const v = this.comp().variaveis.find((x) => x.id === id);
    return Number(this.valores()[id] ?? v?.valor ?? 0);
  }

  protected alternar(): void {
    this.aplicar.emit(valoresVidro(this.comp(), !this.ligado()));
  }
  protected usar(ajustes: AjustesVidro): void {
    this.aplicar.emit(valoresVidro(this.comp(), true, ajustes));
  }
  protected mudar(id: string, v: number): void {
    this.aplicar.emit({ [id]: v });
  }
  protected trocarCamada(e: Event): void {
    const ligado = this.ligado();
    const a = this.atuais();
    this.meus.definirCamadaVidro(this.comp().id, (e.target as HTMLSelectElement).value);
    // Os ids das variáveis mudam com a camada: reaplica o efeito se estava ligado.
    if (ligado) queueMicrotask(() => this.aplicar.emit(valoresVidro(this.comp(), true, a)));
  }
  protected recuo(nivel: number): string {
    return '  '.repeat(nivel);
  }

  protected salvar(): void {
    const nome = this.nomeNovo().trim();
    if (!nome) return;
    const v = this.vidros.salvar(nome, this.atuais());
    this.mensagem.set(
      v
        ? `"${v.nome}" salvo. Ele aparece em Meus vidros na edição de qualquer componente.`
        : `Limite de ${LIMITE_VIDROS} vidros salvos: apague algum antes.`,
    );
    if (v) this.nomeNovo.set('');
  }
  protected apagar(id: string, nome: string): void {
    if (globalThis.confirm?.(`Apagar o vidro "${nome}"?`)) this.vidros.remover(id);
  }
  protected texto(e: Event): string {
    return (e.target as HTMLInputElement).value;
  }
}

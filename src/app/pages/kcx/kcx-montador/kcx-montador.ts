import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  CamadaMontada,
  ConfigConstrutor,
  MODELOS_MONTADOR,
  ModeloMontador,
  Montagem,
  TipoCamada,
  acharCamada,
  configMontada,
  montagemPadrao,
  montarDoConstrutor,
  novaCamada,
  paiDe,
  slug,
  todasCamadas,
  validarMontagem,
} from '../../../kcx/construtor';
import {
  CHAVES_ESPACO,
  CHAVES_RAIO,
  CHAVES_SOMBRA,
  NIVEIS_TEXTO,
  NOMES_COR,
  NOMES_TEXTO,
  TOKENS_COR,
} from '../../../kcx/fundacao';
import { ICONES_KCX } from '../../../kcx/icones';
import { KcxComponente } from '../../../kcx/kcx.types';
import { idLivre } from '../../../kcx/meus-componentes';
import { Icon } from '../../../shared/components/icon/icon';
import { KcxFundacaoService } from '../kcx-fundacao.service';
import { KcxMeusService } from '../kcx-meus.service';
import { KcxVariantes } from '../kcx-variantes/kcx-variantes';

/**
 * Montador visual (/kcx/montar): monta um componente do zero com camadas
 * (caixa, texto, ícone, imagem). Cada propriedade é um token da fundação, então
 * no Figma o componente sai ligado ao design system.
 */
@Component({
  selector: 'kx-kcx-montador',
  imports: [RouterLink, Icon, NgTemplateOutlet, KcxVariantes],
  templateUrl: './kcx-montador.html',
  styleUrl: './kcx-montador.css',
})
export class KcxMontador {
  /** ?de=<id>: reabre um componente montado salvo. */
  readonly de = input<string>();

  private readonly meus = inject(KcxMeusService);
  private readonly router = inject(Router);
  private readonly fundacaoSrv = inject(KcxFundacaoService);
  protected readonly fundacao = this.fundacaoSrv.fundacao;

  protected readonly tokensCor = TOKENS_COR;
  protected readonly nomesCor = NOMES_COR;
  protected readonly niveis = NIVEIS_TEXTO;
  protected readonly nomesTexto = NOMES_TEXTO;
  protected readonly raios = CHAVES_RAIO;
  protected readonly espacos = CHAVES_ESPACO;
  protected readonly sombras = CHAVES_SOMBRA;
  protected readonly icones = Object.keys(ICONES_KCX);
  protected readonly tiposNovos: { tipo: TipoCamada; rotulo: string }[] = [
    { tipo: 'caixa', rotulo: 'Caixa' },
    { tipo: 'texto', rotulo: 'Texto' },
    { tipo: 'icone', rotulo: 'Ícone' },
    { tipo: 'imagem', rotulo: 'Imagem' },
  ];

  private readonly original = computed(() => {
    const id = this.de();
    const c = id ? this.meus.buscar(id) : undefined;
    const cfg = c?.origemCriacao?.config as ConfigConstrutor | undefined;
    return c && cfg?.tipo === 'montado' && cfg.montagem ? { comp: c, cfg } : undefined;
  });

  protected readonly nome = linkedSignal(() => this.original()?.cfg.nome ?? 'Meu componente');
  protected readonly montagem = linkedSignal<Montagem>(() =>
    structuredClone(this.original()?.cfg.montagem ?? montagemPadrao()),
  );
  /** Camada selecionada: só volta para a principal quando outro componente é aberto. */
  protected readonly selecionada = linkedSignal(() => {
    this.original();
    return 'raiz';
  });
  protected readonly variante = signal('');
  protected readonly erros = signal<string[]>([]);

  protected readonly camada = computed(
    () => acharCamada(this.montagem().raiz, this.selecionada()) ?? this.montagem().raiz,
  );
  protected readonly problemas = computed(() => validarMontagem(this.montagem()));

  private readonly idFinal = computed(
    () => this.original()?.comp.id ?? idLivre(slug(this.nome()), this.meus.ids()),
  );

  protected readonly resultado = computed<{ comp?: KcxComponente; erro?: string }>(() => {
    if (this.problemas().length) return { erro: this.problemas()[0] };
    try {
      const cfg = configMontada(this.nome(), this.montagem(), this.fundacao(), this.idFinal());
      return { comp: montarDoConstrutor(cfg) };
    } catch (e) {
      return { erro: (e as Error).message };
    }
  });

  /** Variantes no Figma: estados × opções de cada eixo (Tipo, Tamanho). */
  protected readonly variantesFigma = computed(() => {
    const c = this.resultado().comp;
    if (!c) return 0;
    const eixos = c.compatibilidade.figma.eixosVariante ?? [];
    return eixos.reduce(
      (n, id) => n * (c.variaveis.find((v) => v.id === id)?.opcoes?.length ?? 1),
      c.estados.length,
    );
  });

  /* ---------------------------- edição ---------------------------- */

  private editar(mudar: (m: Montagem) => void): void {
    const m = structuredClone(this.montagem());
    mudar(m);
    this.montagem.set(m);
  }

  protected mudar<K extends keyof CamadaMontada>(campo: K, valor: CamadaMontada[K]): void {
    const id = this.selecionada();
    this.editar((m) => {
      const c = acharCamada(m.raiz, id);
      if (!c) return;
      if (valor === '' || valor === null || valor === undefined) delete c[campo];
      else c[campo] = valor;
    });
  }

  protected opcional<T extends string>(e: Event): T | null {
    const v = (e.target as HTMLSelectElement).value;
    return (v === '' ? null : v) as T | null;
  }
  protected valor(e: Event): string {
    return (e.target as HTMLInputElement).value;
  }
  protected numero(e: Event): number {
    return Math.max(0, Number((e.target as HTMLInputElement).value) || 0);
  }

  protected adicionar(tipo: TipoCamada): void {
    const ids = todasCamadas(this.montagem().raiz).map((c) => c.id);
    const nova = novaCamada(tipo, ids);
    const sel = this.selecionada();
    this.editar((m) => {
      const atual = acharCamada(m.raiz, sel) ?? m.raiz;
      const destino = atual.tipo === 'caixa' ? atual : (paiDe(m.raiz, atual.id) ?? m.raiz);
      (destino.filhos ??= []).push(nova);
    });
    this.selecionada.set(nova.id);
  }

  protected mover(delta: -1 | 1): void {
    const id = this.selecionada();
    this.editar((m) => {
      const pai = paiDe(m.raiz, id);
      if (!pai?.filhos) return;
      const i = pai.filhos.findIndex((f) => f.id === id);
      const j = i + delta;
      if (j < 0 || j >= pai.filhos.length) return;
      [pai.filhos[i], pai.filhos[j]] = [pai.filhos[j], pai.filhos[i]];
    });
  }

  protected duplicar(): void {
    const id = this.selecionada();
    let novoId = id;
    this.editar((m) => {
      const pai = paiDe(m.raiz, id);
      const c = acharCamada(m.raiz, id);
      if (!pai?.filhos || !c) return;
      const ocupados = todasCamadas(m.raiz).map((x) => x.id);
      const copia = structuredClone(c);
      for (const x of todasCamadas(copia)) {
        let n = 2;
        while (ocupados.includes(`${x.id}-${n}`)) n++;
        x.id = `${x.id}-${n}`;
        ocupados.push(x.id);
      }
      copia.nome = `${c.nome} (cópia)`;
      novoId = copia.id;
      pai.filhos.splice(pai.filhos.indexOf(c) + 1, 0, copia);
    });
    this.selecionada.set(novoId);
  }

  protected excluir(): void {
    const id = this.selecionada();
    let paiId = this.montagem().raiz.id;
    this.editar((m) => {
      const pai = paiDe(m.raiz, id);
      if (!pai?.filhos) return;
      paiId = pai.id;
      pai.filhos = pai.filhos.filter((f) => f.id !== id);
    });
    this.selecionada.set(paiId);
  }

  protected readonly modelos = MODELOS_MONTADOR;

  /** Troca a montagem pelo modelo escolhido (a anterior é descartada). */
  protected usarModelo(m: ModeloMontador): void {
    this.montagem.set(m.criar());
    this.nome.set(m.sugestao);
    this.selecionada.set('raiz');
  }

  protected eixo(nome: 'tipo' | 'tamanho', ligado: boolean): void {
    this.editar((m) => (m.eixos = { ...m.eixos, [nome]: ligado }));
  }

  protected marcado(e: Event): boolean {
    return (e.target as HTMLInputElement).checked;
  }

  protected recomecar(): void {
    this.montagem.set(montagemPadrao());
    this.selecionada.set('raiz');
  }

  protected ehRaiz(): boolean {
    return this.selecionada() === this.montagem().raiz.id;
  }

  protected salvar(): void {
    const c = this.resultado().comp;
    if (!c) return;
    const erros = this.meus.salvar(c);
    this.erros.set(erros);
    if (!erros.length) void this.router.navigate(['/kcx', c.id]);
  }

  protected corDe(t: string | null | undefined): string {
    const c = t ? this.fundacao().cores[t as (typeof TOKENS_COR)[number]] : undefined;
    return c?.escuro ?? 'transparent';
  }
  protected rotuloTipo(c: CamadaMontada): string {
    return { caixa: '▢', texto: 'T', icone: '★', imagem: '▣' }[c.tipo];
  }
}

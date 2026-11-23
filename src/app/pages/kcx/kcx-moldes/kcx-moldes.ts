import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { montarTela } from '../../../kcx/construtor';
import { findKit } from '../../../core/efeitos/registry';
import { planejarFigma } from '../../../kcx/figma-plano';
import { KcxFundacao } from '../../../kcx/fundacao';
import { documentoDaTela } from '../../../kcx/plano-html';
import {
  MOLDES,
  Molde,
  fundacaoDoMolde,
  montarMolde,
  previaMolde,
} from '../../../kcx/projeto/moldes';
import { criarPacote } from '../../../kcx/serializar';
import { Icon } from '../../../shared/components/icon/icon';
import { lerArquivo } from '../kcx-estado.service';
import { KcxFundacaoService } from '../kcx-fundacao.service';
import { KcxMeusService } from '../kcx-meus.service';
import { KcxProjetoService } from '../kcx-projeto.service';

type Estilo = 'molde' | 'minha';

/**
 * Moldes de página (/kcx/moldes): páginas prontas por área, montadas com os
 * componentes do construtor. Dá para ver com as cores do molde ou com a sua
 * Fundação (ou importar um design system), e trocar as seções depois nas Telas.
 */
@Component({
  selector: 'kx-kcx-moldes',
  imports: [RouterLink, Icon],
  templateUrl: './kcx-moldes.html',
  styleUrl: './kcx-moldes.css',
})
export class KcxMoldesPagina {
  private readonly fundacaoSrv = inject(KcxFundacaoService);
  private readonly meus = inject(KcxMeusService);
  private readonly projeto = inject(KcxProjetoService);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly moldes = MOLDES;
  protected readonly estilo = signal<Estilo>('molde');
  protected readonly aberto = signal<string>(MOLDES[0].id);
  protected readonly mensagem = signal<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);
  protected readonly minha = this.fundacaoSrv.fundacao;
  /** A prévia tem 1280 px de largura: a escala faz caber na moldura. */
  protected readonly escala = signal(0.5);
  private readonly moldura = viewChild<ElementRef<HTMLElement>>('moldura');

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const el = this.moldura()?.nativeElement;
      if (!el || typeof ResizeObserver === 'undefined') return;
      const ro = new ResizeObserver(() => this.escala.set(el.clientWidth / 1280));
      ro.observe(el);
      destroyRef.onDestroy(() => ro.disconnect());
    });
  }

  protected fundacaoPara(m: Molde): KcxFundacao {
    return this.estilo() === 'molde' ? fundacaoDoMolde(m) : this.minha();
  }

  protected readonly molde = computed(
    () => MOLDES.find((m) => m.id === this.aberto()) ?? MOLDES[0],
  );
  protected readonly fundacao = computed(() => this.fundacaoPara(this.molde()));
  protected readonly paleta = computed(() => {
    const c = this.fundacao().cores;
    return (['primaria', 'secundaria', 'destaque', 'fundo', 'superficie', 'texto'] as const).map(
      (t) => c[t].escuro,
    );
  });
  protected readonly animacoes = computed(() =>
    this.molde().animacoes.map((id) => ({ id, nome: findKit(id)?.ficha.nomeAmigavel ?? id })),
  );

  /** Prévia da primeira página do molde, no tamanho de um notebook (1280 px). */
  protected readonly previa = computed<SafeHtml | null>(() => {
    const m = this.molde();
    const f = this.fundacao();
    try {
      const comps = previaMolde(m, f);
      const tela = montarTela(
        {
          nome: m.nome,
          dispositivo: 'desktop',
          fidelidade: 'alta',
          secoes: comps.map((c) => c.id),
        },
        comps,
        f,
      );
      const raiz = planejarFigma(criarPacote([tela]), 'visual').componentes.find(
        (x) => x.id === tela.id,
      )?.variantes[0]?.arvore;
      return raiz
        ? this.sanitizer.bypassSecurityTrustHtml(documentoDaTela(raiz, f.cores.fundo.escuro))
        : null;
    } catch {
      return null;
    }
  });

  protected async importarDs(e: Event): Promise<void> {
    const texto = await lerArquivo(e);
    if (texto === null) return;
    const r = this.fundacaoSrv.importarTexto(texto);
    if (!r.ok) {
      this.mensagem.set({ tipo: 'erro', texto: r.erro });
      return;
    }
    this.estilo.set('minha');
    this.mensagem.set({
      tipo: 'ok',
      texto: `Design system "${r.nome}" importado: os moldes agora usam as cores e fontes dele.`,
    });
  }

  /** Cria as páginas do molde nas Telas (e as ligações no mapa). */
  protected usar(m: Molde): void {
    const doMolde = this.estilo() === 'molde';
    if (
      doMolde &&
      !globalThis.confirm?.(
        `Usar as cores e fontes do molde "${m.nome}" na sua Fundação? Ela é trocada (exporte antes, na Fundação, se quiser guardar a atual).`,
      )
    )
      return;
    const f = this.fundacaoPara(m);
    const r = montarMolde(m, f, this.meus.ids());
    const erros = [...r.erros];
    for (const c of r.componentes) erros.push(...this.meus.salvar(c));
    if (erros.length) {
      this.mensagem.set({ tipo: 'erro', texto: erros[0] });
      return;
    }
    if (doMolde) this.fundacaoSrv.definir(f);
    // A página inicial vazia (de quem ainda não montou nada) dá lugar ao molde.
    const vazias = this.projeto
      .telas()
      .filter((t) => !t.secoes.length)
      .map((t) => t.id);
    const ids: string[] = [];
    for (const p of r.paginas) {
      const t = this.projeto.novaTela(`${m.area} · ${p.nome}`);
      if (!t) break;
      this.projeto.alterarTela(t.id, (x) => (x.secoes = p.secoes));
      ids.push(t.id);
    }
    this.projeto.alterarNavegacao((n) => {
      for (const l of r.ligacoes)
        if (ids[l.de] && ids[l.para])
          n.ligacoes.push({ id: l.id, de: ids[l.de], para: ids[l.para], gatilho: l.gatilho });
    });
    for (const id of vazias) this.projeto.excluir(id);
    if (ids[0]) this.projeto.selecionar(ids[0]);
    void this.router.navigate(['/kcx/telas']);
  }
}

import { Component, computed, inject, input, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import {
  CORES_CLARO,
  CORES_ESCURO,
  CoresDiagrama,
  Diagrama,
  Fluxo,
  LIMITE_FLUXOS,
  LIMITE_LIGACOES,
  LIMITE_PASSOS,
  Passo,
  TIPOS_PASSO,
  TipoPasso,
  analisarFluxo,
  analisarMapa,
  arquivoDoDiagrama,
  diagramaDoFluxo,
  diagramaDoMapa,
  diagramaSvg,
  fluxoDoCaminho,
  inicioDe,
  ligacoesValidas,
  novoId,
} from '../../../kcx/projeto/navegacao';
import { Icon } from '../../../shared/components/icon/icon';
import { baixarArquivo } from '../kcx-estado.service';
import { KcxFundacaoService } from '../kcx-fundacao.service';
import { KcxProjetoService } from '../kcx-projeto.service';

type Aba = 'mapa' | 'fluxos';

/**
 * Mapa de navegação e fluxos de interação (/kcx/mapa), a partir das páginas
 * das Telas. Baixa em SVG e em .kcx-diagrama.json para o Figma Bridge.
 */
@Component({
  selector: 'kx-kcx-mapa',
  imports: [RouterLink, Icon],
  templateUrl: './kcx-mapa.html',
  styleUrl: './kcx-mapa.css',
})
export class KcxMapaPagina {
  /** ?aba=fluxos abre direto nos fluxos. */
  readonly aba = input<Aba>();

  private readonly projeto = inject(KcxProjetoService);
  private readonly fundacaoSrv = inject(KcxFundacaoService);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly tipos = Object.entries(TIPOS_PASSO) as [
    TipoPasso,
    (typeof TIPOS_PASSO)[TipoPasso],
  ][];
  protected readonly limiteLigacoes = LIMITE_LIGACOES;
  protected readonly limitePassos = LIMITE_PASSOS;
  protected readonly limiteFluxos = LIMITE_FLUXOS;

  private readonly abaEscolhida = signal<Aba | null>(null);
  protected readonly abaAtual = computed<Aba>(() => this.abaEscolhida() ?? this.aba() ?? 'mapa');
  protected readonly tema = signal<'escuro' | 'claro'>('escuro');
  protected readonly paginas = this.projeto.paginas;
  protected readonly nav = this.projeto.navegacao;
  protected readonly inicio = computed(() => inicioDe(this.paginas(), this.nav()));
  protected readonly ligacoes = computed(() => ligacoesValidas(this.paginas(), this.nav()));
  protected readonly selecionada = signal<string | null>(null);

  private readonly cores = computed<CoresDiagrama>(() => {
    const base = this.tema() === 'escuro' ? CORES_ESCURO : CORES_CLARO;
    const primaria = this.fundacaoSrv.fundacao().cores.primaria[this.tema()];
    return { ...base, acento: /^#[0-9a-f]{6}$/i.test(primaria) ? primaria : base.acento };
  });

  /* ------------------------------ Mapa ------------------------------ */
  protected readonly diagramaMapa = computed(() => diagramaDoMapa(this.paginas(), this.nav()));
  protected readonly svgMapa = computed<SafeHtml>(() =>
    this.sanitizer.bypassSecurityTrustHtml(
      diagramaSvg(this.diagramaMapa(), this.cores(), this.selecionada() ?? undefined),
    ),
  );
  protected readonly avisosMapa = computed(() => analisarMapa(this.paginas(), this.nav()));
  protected readonly nomeDe = (id: string) =>
    this.paginas().find((p) => p.id === id)?.nome ?? '(apagada)';

  // Formulário "nova ligação"
  protected readonly novaDe = signal('');
  protected readonly novaPara = signal('');
  protected readonly novoGatilho = signal('');

  protected trocarAba(a: Aba): void {
    this.abaEscolhida.set(a);
    this.selecionada.set(null);
  }

  protected clicarNoMapa(e: Event): void {
    const id = (e.target as Element).closest?.('[data-no]')?.getAttribute('data-no');
    if (!id) return;
    if (this.abaAtual() === 'mapa') {
      this.selecionada.set(id);
      this.novaDe.set(id);
    } else {
      this.selecionada.set(id);
      globalThis.document
        ?.getElementById('passo-' + id)
        ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  protected definirInicio(id: string): void {
    this.projeto.alterarNavegacao((n) => (n.inicio = id));
  }

  protected adicionarLigacao(): void {
    const de = this.novaDe() || this.inicio() || '';
    const para = this.novaPara();
    if (!de || !para || de === para || this.nav().ligacoes.length >= LIMITE_LIGACOES) return;
    this.projeto.alterarNavegacao((n) =>
      n.ligacoes.push({
        id: novoId('lig'),
        de,
        para,
        gatilho: this.novoGatilho().trim().slice(0, 120),
      }),
    );
    this.novoGatilho.set('');
    this.novaPara.set('');
  }
  protected alterarLigacao(id: string, campo: 'de' | 'para' | 'gatilho', v: string): void {
    this.projeto.alterarNavegacao((n) => {
      const l = n.ligacoes.find((x) => x.id === id);
      if (l) l[campo] = v.slice(0, 120);
    });
  }
  protected removerLigacao(id: string): void {
    this.projeto.alterarNavegacao((n) => (n.ligacoes = n.ligacoes.filter((l) => l.id !== id)));
  }
  /** Liga a página escolhida de volta ao início (o "logo/voltar" que falta em becos). */
  protected voltarAoInicio(id: string): void {
    const ini = this.inicio();
    if (!ini || ini === id) return;
    this.projeto.alterarNavegacao((n) =>
      n.ligacoes.push({ id: novoId('lig'), de: id, para: ini, gatilho: 'Logo / Voltar' }),
    );
  }

  /* ----------------------------- Fluxos ----------------------------- */
  protected readonly fluxos = computed(() => this.nav().fluxos);
  private readonly fluxoEscolhido = signal<string | null>(null);
  protected readonly fluxo = computed<Fluxo | undefined>(
    () => this.fluxos().find((f) => f.id === this.fluxoEscolhido()) ?? this.fluxos()[0],
  );
  protected readonly diagramaFluxo = computed(() => {
    const f = this.fluxo();
    return f ? diagramaDoFluxo(f, this.paginas()) : null;
  });
  protected readonly svgFluxo = computed<SafeHtml | null>(() => {
    const d = this.diagramaFluxo();
    return d
      ? this.sanitizer.bypassSecurityTrustHtml(
          diagramaSvg(d, this.cores(), this.selecionada() ?? undefined),
        )
      : null;
  });
  protected readonly avisosFluxo = computed(() => {
    const f = this.fluxo();
    return f ? analisarFluxo(f, this.paginas()) : [];
  });
  protected readonly gerarDe = signal('');
  protected readonly gerarPara = signal('');
  protected readonly gerarNome = signal('');
  protected readonly erroGerar = signal('');

  protected escolherFluxo(id: string): void {
    this.fluxoEscolhido.set(id);
    this.selecionada.set(null);
  }

  private alterarFluxo(mudar: (f: Fluxo) => void): void {
    const id = this.fluxo()?.id;
    if (!id) return;
    this.projeto.alterarNavegacao((n) => {
      const f = n.fluxos.find((x) => x.id === id);
      if (f) mudar(f);
    });
  }

  protected novoFluxo(): void {
    if (this.fluxos().length >= LIMITE_FLUXOS) return;
    const f: Fluxo = {
      id: novoId('fluxo'),
      nome: `Fluxo ${this.fluxos().length + 1}`,
      objetivo: '',
      passos: [
        { id: novoId('p'), tipo: 'inicio', rotulo: 'Começa aqui' },
        { id: novoId('p'), tipo: 'fim', rotulo: 'Tarefa concluída' },
      ],
    };
    this.projeto.alterarNavegacao((n) => n.fluxos.push(f));
    this.fluxoEscolhido.set(f.id);
  }

  protected gerarDoMapa(): void {
    const de = this.gerarDe() || this.inicio() || '';
    const para = this.gerarPara();
    if (!de || !para) return;
    const f = fluxoDoCaminho(this.paginas(), this.nav(), de, para, this.gerarNome().trim());
    if (!f) {
      this.erroGerar.set(
        `Não há caminho de "${this.nomeDe(de)}" até "${this.nomeDe(para)}" no mapa. Crie as ligações primeiro.`,
      );
      return;
    }
    if (this.fluxos().length >= LIMITE_FLUXOS) return;
    this.erroGerar.set('');
    this.projeto.alterarNavegacao((n) => n.fluxos.push(f));
    this.fluxoEscolhido.set(f.id);
    this.gerarNome.set('');
  }

  protected excluirFluxo(): void {
    const f = this.fluxo();
    if (!f || !globalThis.confirm?.(`Excluir o fluxo "${f.nome}"?`)) return;
    this.projeto.alterarNavegacao((n) => (n.fluxos = n.fluxos.filter((x) => x.id !== f.id)));
    this.fluxoEscolhido.set(null);
  }

  protected definirFluxo(campo: 'nome' | 'objetivo', v: string): void {
    this.alterarFluxo((f) => (f[campo] = v.slice(0, campo === 'nome' ? 80 : 200)));
  }

  protected adicionarPasso(tipo: TipoPasso): void {
    this.alterarFluxo((f) => {
      if (f.passos.length >= LIMITE_PASSOS) return;
      const p: Passo = { id: novoId('p'), tipo, rotulo: '' };
      if (tipo === 'tela' && this.paginas()[0]) {
        p.telaId = this.paginas()[0].id;
        p.rotulo = this.paginas()[0].nome;
      }
      // Entra antes do último Fim, para o caminho continuar fazendo sentido.
      const fim = f.passos.map((x) => x.tipo).lastIndexOf('fim');
      if (fim >= 0 && tipo !== 'fim') f.passos.splice(fim, 0, p);
      else f.passos.push(p);
      // Decisão nasce com o "sim" seguindo em frente; falta só escolher o "não".
      if (tipo === 'decisao') {
        const seguinte = f.passos[f.passos.indexOf(p) + 1];
        if (seguinte) p.sim = seguinte.id;
      }
      this.selecionada.set(p.id);
    });
  }

  protected definirPasso(
    id: string,
    campo: 'tipo' | 'rotulo' | 'telaId' | 'proximo' | 'sim' | 'nao',
    v: string,
  ): void {
    this.alterarFluxo((f) => {
      const p = f.passos.find((x) => x.id === id);
      if (!p) return;
      if (campo === 'tipo') {
        p.tipo = v as TipoPasso;
        if (p.tipo !== 'tela') delete p.telaId;
        if (p.tipo !== 'decisao') {
          delete p.sim;
          delete p.nao;
        } else delete p.proximo;
        return;
      }
      if (campo === 'rotulo') {
        p.rotulo = v.slice(0, 120);
        return;
      }
      if (!v) delete p[campo];
      else p[campo] = v;
      // Escolheu a página: o rótulo acompanha se estava vazio ou era o nome da anterior.
      if (campo === 'telaId') {
        const nomes = this.paginas().map((x) => x.nome);
        if (!p.rotulo || nomes.includes(p.rotulo)) p.rotulo = this.nomeDe(v);
      }
    });
  }

  protected moverPasso(i: number, d: -1 | 1): void {
    this.alterarFluxo((f) => {
      const j = i + d;
      if (j < 0 || j >= f.passos.length) return;
      [f.passos[i], f.passos[j]] = [f.passos[j], f.passos[i]];
    });
  }

  protected removerPasso(id: string): void {
    this.alterarFluxo((f) => {
      f.passos = f.passos.filter((p) => p.id !== id);
      for (const p of f.passos)
        for (const k of ['proximo', 'sim', 'nao'] as const) if (p[k] === id) delete p[k];
    });
  }

  protected rotuloPasso(p: Passo): string {
    return p.rotulo || TIPOS_PASSO[p.tipo].nome;
  }

  /* --------------------------- Exportação --------------------------- */
  private diagramaAtual(): Diagrama | null {
    return this.abaAtual() === 'mapa' ? this.diagramaMapa() : this.diagramaFluxo();
  }
  private nomeArquivo(d: Diagrama): string {
    return (
      d.nome
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'diagrama'
    );
  }
  protected baixarSvg(): void {
    const d = this.diagramaAtual();
    if (d)
      baixarArquivo(diagramaSvg(d, this.cores()), `${this.nomeArquivo(d)}.svg`, 'image/svg+xml');
  }
  protected baixarFigma(): void {
    const d = this.diagramaAtual();
    if (d)
      baixarArquivo(
        arquivoDoDiagrama(d, this.cores()),
        `${this.nomeArquivo(d)}.kcx-diagrama.json`,
        'application/json',
      );
  }

  protected valor(e: Event): string {
    return (e.target as HTMLInputElement).value;
  }
}

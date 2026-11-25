import { Component, computed, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  CATALOGO_EFEITOS,
  Confianca,
  FichaEfeito,
  OrigemAnalise,
  ResultadoInvestigacao,
  SCRIPT_COLETOR,
  StatusTecnologia,
  TipoEfeitoWeb,
  analisarSequencia,
  coletaDoHtml,
  entradaCatalogo,
  investigar,
  lerColeta,
  marcoDaFicha,
  reconstruirFicha,
} from '../../../kcx/analise';
import { SessaoComparacao, formatarTempo, novoIdCmp, urlSegura } from '../../../kcx/comparar';
import { lerArquivo } from '../kcx-estado.service';
import { KcxComparacaoService } from '../kcx-comparacao.service';
import { KcxFundacaoService } from '../kcx-fundacao.service';
import { KcxMeusService } from '../kcx-meus.service';
import { quadrosDoVideo, quadrosDosFrames } from './captura';

/**
 * Aba "Análise" do Reference vs. Reconstruction (KCX Web Intelligence):
 * investiga o site, analisa a gravação, mostra as fichas técnicas e
 * transforma cada efeito num componente KCX que vai direto para a comparação.
 */
@Component({
  selector: 'kx-cmp-analise',
  imports: [RouterLink],
  templateUrl: './cmp-analise.html',
  styleUrl: './cmp-analise.css',
})
export class CmpAnalise {
  private readonly cmp = inject(KcxComparacaoService);
  private readonly meus = inject(KcxMeusService);
  private readonly fundacao = inject(KcxFundacaoService);

  readonly sessao = input.required<SessaoComparacao>();
  readonly videoUrl = input<string>('');
  /** Ir a um tempo da referência (segundos). */
  readonly irPara = output<number>();
  /** Um componente reconstruído foi posto no Painel B. */
  readonly reconstruido = output<string>();

  protected readonly catalogo = CATALOGO_EFEITOS;
  protected readonly fmt = formatarTempo;
  protected readonly analise = computed(
    () => this.sessao().analise ?? { fichas: [], reconstruidos: {} },
  );
  protected readonly investigacao = computed(() => this.analise().investigacao ?? null);
  protected readonly msg = signal<{ ok: boolean; texto: string } | null>(null);
  protected readonly trabalhando = signal('');
  protected readonly fps = signal(8);
  protected readonly urlSite = signal('');
  protected readonly coletorCopiado = signal(false);
  protected readonly aberta = signal('');
  protected readonly tipoManual = signal<TipoEfeitoWeb>('cursor');

  protected readonly rotuloOrigem: Record<OrigemAnalise, string> = {
    dom: 'DOM do site',
    html: 'HTML salvo',
    video: 'Vídeo — sem DOM',
    manual: 'Marcação manual',
  };
  protected readonly rotuloConfianca: Record<Confianca, string> = {
    alta: 'alta',
    media: 'média',
    baixa: 'baixa',
  };
  protected readonly rotuloStatus: Record<StatusTecnologia, string> = {
    confirmada: 'Confirmada',
    provavel: 'Provável',
    'nao-identificada': 'Não identificada',
  };
  protected readonly grupos: StatusTecnologia[] = ['confirmada', 'provavel', 'nao-identificada'];
  protected tecnologiasCom(status: StatusTecnologia) {
    return this.investigacao()?.tecnologias.filter((t) => t.status === status) ?? [];
  }
  protected entrada = entradaCatalogo;

  private guardar(mudar: (a: NonNullable<SessaoComparacao['analise']>) => void): void {
    this.cmp.alterar((s) => {
      s.analise ??= { fichas: [], reconstruidos: {} };
      mudar(s.analise);
    });
  }

  /** Junta fichas novas às que já existem, trocando as da mesma origem. */
  private trocarFichas(origens: OrigemAnalise[], novas: FichaEfeito[]): void {
    this.guardar((a) => {
      a.fichas = [...a.fichas.filter((f) => !origens.includes(f.origem)), ...novas].slice(0, 80);
    });
  }

  /* ---------- vídeo e imagens ---------- */

  protected async analisarVideo(): Promise<void> {
    const url = this.videoUrl();
    if (!url) return;
    this.msg.set(null);
    try {
      this.trabalhando.set('Lendo os quadros do vídeo…');
      const { quadros, largura } = await quadrosDoVideo(url, this.fps(), 240, (n, t) =>
        this.trabalhando.set(`Lendo os quadros do vídeo… ${n}/${t}`),
      );
      this.trabalhando.set('Comparando os quadros…');
      await new Promise((r) => setTimeout(r));
      const r = analisarSequencia(quadros, { larguraReferencia: largura });
      const { fichas, ...resumo } = r;
      this.trocarFichas(['video'], fichas);
      this.guardar((a) => (a.video = resumo));
      this.msg.set({
        ok: true,
        texto: `${r.quadros} quadros analisados em ${formatarTempo(r.duracao)}: ${fichas.length} efeito(s) identificado(s).`,
      });
    } catch (e) {
      this.msg.set({ ok: false, texto: (e as Error).message || 'Não foi possível ler o vídeo.' });
    } finally {
      this.trabalhando.set('');
    }
  }

  protected async analisarFrames(): Promise<void> {
    const frames = this.sessao().referencia.frames;
    if (frames.length < 2) return;
    this.msg.set(null);
    try {
      this.trabalhando.set('Comparando as imagens…');
      const { quadros, largura } = await quadrosDosFrames(frames);
      const r = analisarSequencia(quadros, { larguraReferencia: largura });
      const { fichas, ...resumo } = r;
      this.trocarFichas(['video'], fichas);
      this.guardar((a) => (a.video = resumo));
      this.msg.set({
        ok: true,
        texto: `${quadros.length} imagens comparadas em sequência: ${fichas.length} efeito(s).`,
      });
    } catch {
      this.msg.set({ ok: false, texto: 'Não foi possível ler as imagens.' });
    } finally {
      this.trabalhando.set('');
    }
  }

  /* ---------- site ---------- */

  private aplicarInvestigacao(r: ResultadoInvestigacao): void {
    this.trocarFichas(['dom', 'html'], r.fichas);
    this.guardar((a) => (a.investigacao = { ...r, fichas: [] }));
    const conf = r.tecnologias.filter((t) => t.status === 'confirmada').length;
    this.msg.set({
      ok: true,
      texto: `Site investigado (${r.origem === 'dom' ? 'DOM pelo coletor' : 'HTML'}): ${conf} tecnologia(s) confirmada(s), ${r.fichas.length} efeito(s).`,
    });
  }

  protected async lerDireto(): Promise<void> {
    let u = this.urlSite().trim() || this.sessao().referencia.url || '';
    if (u && !/^https?:\/\//i.test(u)) u = `https://${u}`;
    if (!urlSegura(u, location.origin)) {
      this.msg.set({ ok: false, texto: 'Informe um endereço http(s) de outro site.' });
      return;
    }
    this.msg.set(null);
    this.trabalhando.set('Pedindo o HTML ao site…');
    try {
      const resp = await fetch(u, { mode: 'cors', credentials: 'omit' });
      if (!resp.ok) throw new Error(String(resp.status));
      this.aplicarInvestigacao(investigar(coletaDoHtml(await resp.text(), u)));
    } catch {
      this.msg.set({
        ok: false,
        texto:
          'O site não deixa outro endereço ler o HTML dele (CORS) — é o comum, e o lab respeita. Use o coletor abaixo (roda no seu navegador, no próprio site) ou salve a página como .html e importe.',
      });
    } finally {
      this.trabalhando.set('');
    }
  }

  protected async copiarColetor(): Promise<void> {
    try {
      await navigator.clipboard.writeText(SCRIPT_COLETOR);
      this.coletorCopiado.set(true);
    } catch {
      this.aberta.set('coletor');
      this.msg.set({
        ok: false,
        texto: 'O navegador não deixou copiar: selecione o código abaixo e copie.',
      });
    }
  }

  protected readonly scriptColetor = SCRIPT_COLETOR;

  protected async importarColeta(e: Event): Promise<void> {
    const texto = await lerArquivo(e);
    if (!texto) return;
    try {
      const c = lerColeta(JSON.parse(texto));
      if (!c) throw new Error();
      this.aplicarInvestigacao(investigar(c));
    } catch {
      this.msg.set({ ok: false, texto: 'Arquivo não é uma coleta KCX (coleta-kcx.json).' });
    }
  }

  protected async importarHtml(e: Event): Promise<void> {
    const texto = await lerArquivo(e);
    if (!texto) return;
    this.aplicarInvestigacao(investigar(coletaDoHtml(texto, this.sessao().referencia.url ?? '')));
  }

  /* ---------- fichas ---------- */

  protected readonly fichas = computed(() =>
    [...this.analise().fichas].sort((a, b) => {
      const o = { alta: 0, media: 1, baixa: 2 } as const;
      return o[a.confianca] - o[b.confianca] || (a.inicio ?? 0) - (b.inicio ?? 0);
    }),
  );

  protected parametrosDe(f: FichaEfeito): string[] {
    const p = f.parametros;
    return [
      p.duracao ? `duração ${formatarTempo(p.duracao / 1000)}` : '',
      p.distancia ? `distância ${p.distancia} px` : '',
      p.velocidade ? `${p.velocidade} px/s` : '',
      p.direcao ? `para ${p.direcao}` : '',
      p.fator ? `fator ${p.fator.toLocaleString('pt-BR')}×` : '',
      p.intensidade ? `intensidade ${p.intensidade.toLocaleString('pt-BR')}` : '',
      p.easing ? `curva ${p.easing}` : '',
    ].filter(Boolean);
  }

  protected componenteDe(f: FichaEfeito): string | undefined {
    const id = this.analise().reconstruidos[f.id];
    return id && this.meus.buscar(id) ? id : undefined;
  }

  protected marcar(f: FichaEfeito): void {
    this.cmp.alterar((s) => s.referencia.marcos.push(marcoDaFicha(f, novoIdCmp('marco'))));
    this.msg.set({ ok: true, texto: `“${f.nome}” entrou na sequência temporal (aba Referência).` });
  }

  protected reconstruir(f: FichaEfeito): void {
    const s = this.sessao();
    if (
      s.atual.ajustes.length &&
      !confirm(
        'O Painel B tem ajustes. Trocar a reconstrução por este efeito? (Salve uma versão antes se quiser guardar.)',
      )
    )
      return;
    try {
      const r = reconstruirFicha(f, {
        ocupados: this.meus.ids(),
        fundacao: this.fundacao.paraPacote(),
      });
      const erros = this.meus.salvar(r.comp);
      if (erros.length) {
        this.msg.set({ ok: false, texto: erros[0] });
        return;
      }
      this.cmp.alterar((x) => {
        x.atual = { componenteId: r.comp.id, valores: {}, ajustes: [] };
        x.analise ??= { fichas: [], reconstruidos: {} };
        x.analise.reconstruidos[f.id] = r.comp.id;
        if (
          f.inicio !== null &&
          !x.referencia.marcos.some((m) => m.nome === f.nome && m.ref === f.inicio)
        )
          x.referencia.marcos.push(marcoDaFicha(f, novoIdCmp('marco')));
      });
      this.msg.set({
        ok: true,
        texto: `“${r.comp.nome}” criado e posto no Painel B. ${r.notas.join(' ')}`,
      });
      this.reconstruido.emit(r.comp.id);
    } catch (e) {
      this.msg.set({ ok: false, texto: (e as Error).message });
    }
  }

  protected remover(f: FichaEfeito): void {
    this.guardar((a) => (a.fichas = a.fichas.filter((x) => x.id !== f.id)));
  }

  protected adicionarManual(): void {
    const tipo = this.tipoManual();
    const f: FichaEfeito = {
      id: novoIdCmp('ficha'),
      tipo,
      nome: entradaCatalogo(tipo).nome,
      origem: 'manual',
      confianca: 'media',
      inicio: null,
      fim: null,
      evidencias: ['Marcado à mão a partir da referência.'],
      parametros: {},
    };
    this.guardar((a) => a.fichas.push(f));
  }

  protected alternar(id: string): void {
    this.aberta.update((x) => (x === id ? '' : id));
  }
}

import { Component, computed, inject, signal } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ehImagemValida } from '../../../kcx/logo';
import { lerImagem } from '../../../kcx/logo-arquivo';
import { RouterLink } from '@angular/router';
import {
  CHAVES_ESPACO,
  CHAVES_RAIO,
  CHAVES_SOMBRA,
  ChaveEspaco,
  ChaveRaio,
  ChaveSombra,
  EstiloTextoFundacao,
  KcxFundacao,
  NIVEIS_TEXTO,
  NOMES_COR,
  NOMES_TEXTO,
  NivelTexto,
  SombraFundacao,
  TOKENS_COR,
  TokenCor,
  completarFundacao,
  cssDaFundacao,
  validarFundacao,
} from '../../../kcx/fundacao';
import { criarPacote, serializar } from '../../../kcx/serializar';
import { Icon } from '../../../shared/components/icon/icon';
import { baixarArquivo, lerArquivo } from '../kcx-estado.service';
import { KcxFundacaoService } from '../kcx-fundacao.service';

type Tema = 'escuro' | 'claro';

/** Fontes já carregadas pelo lab (a prévia mostra de verdade); outras caem no padrão do sistema. */
export const FONTES_SUGERIDAS = [
  'Inter',
  'Space Grotesk',
  'JetBrains Mono',
  'Poppins',
  'Montserrat',
  'Roboto',
  'Open Sans',
  'Lato',
  'DM Sans',
  'Playfair Display',
];

/**
 * Fundação do design system (/kcx/fundacao): cores claro/escuro, fontes,
 * escala de texto, raios, espaços e sombras, com prévia ao vivo. É a base que
 * todos os componentes usam e que vai para o Figma como variáveis e estilos.
 */
@Component({
  selector: 'kx-kcx-fundacao',
  imports: [RouterLink, Icon],
  templateUrl: './kcx-fundacao.html',
  styleUrl: './kcx-fundacao.css',
})
export class KcxFundacaoPagina {
  private readonly servico = inject(KcxFundacaoService);
  protected readonly f = this.servico.fundacao;
  protected readonly erros = this.servico.erros;
  protected readonly usarNoFigma = this.servico.usarNoFigma;
  protected readonly tema = signal<Tema>('escuro');
  protected readonly aviso = signal('');

  protected readonly tokensCor = TOKENS_COR;
  protected readonly nomesCor = NOMES_COR;
  protected readonly niveis = NIVEIS_TEXTO;
  protected readonly nomesTexto = NOMES_TEXTO;
  protected readonly raios = CHAVES_RAIO;
  protected readonly espacos = CHAVES_ESPACO;
  protected readonly sombras = CHAVES_SOMBRA;
  protected readonly fontes = FONTES_SUGERIDAS;
  protected readonly pesos = [400, 500, 600, 700, 800];
  protected readonly temas: Tema[] = ['escuro', 'claro'];
  protected readonly chavesFonte = ['titulo', 'corpo', 'mono'] as const;
  protected readonly camposSombra = ['x', 'y', 'raio', 'espalhar'] as const;

  /** Custom properties da prévia, no tema escolhido. */
  protected readonly estiloPrevia = computed(() => varsDaPrevia(this.f(), this.tema()));
  protected readonly css = computed(() => cssDaFundacao(this.f()));

  private readonly sanitizer = inject(DomSanitizer);
  /** Prévia da logo (só imagens validadas: sem script). */
  protected readonly logoUrl = computed<SafeUrl | null>(() => {
    const l = this.f().logo;
    return l && ehImagemValida(l.src) ? this.sanitizer.bypassSecurityTrustUrl(l.src) : null;
  });

  protected async enviarLogo(e: Event): Promise<void> {
    const input = e.target as HTMLInputElement;
    const arquivo = input.files?.[0];
    input.value = '';
    if (!arquivo) return;
    try {
      const logo = await lerImagem(arquivo);
      const erros = this.servico.alterar((f) => (f.logo = logo));
      this.aviso.set(erros.length ? erros[0] : `Logo "${arquivo.name}" salva na fundação.`);
    } catch (err) {
      this.aviso.set((err as Error).message);
    }
  }

  protected tirarLogo(): void {
    this.servico.alterar((f) => delete f.logo);
    this.aviso.set('Logo removida da fundação.');
  }

  protected valor(e: Event): string {
    return (e.target as HTMLInputElement).value;
  }
  protected numero(e: Event): number {
    return Number((e.target as HTMLInputElement).value);
  }

  protected nome(texto: string): void {
    this.servico.alterar((f) => (f.nome = texto));
  }
  protected cor(t: TokenCor, tema: Tema, hex: string): void {
    if (!/^#[0-9a-f]{6}$/i.test(hex)) return;
    this.servico.alterar((f) => (f.cores[t][tema] = hex.toLowerCase()));
  }
  protected fonte(k: 'titulo' | 'corpo' | 'mono', nome: string): void {
    if (nome.trim()) this.servico.alterar((f) => (f.fontes[k] = nome.trim()));
  }
  protected texto<K extends keyof EstiloTextoFundacao>(
    n: NivelTexto,
    campo: K,
    v: EstiloTextoFundacao[K],
  ): void {
    this.servico.alterar((f) => (f.texto[n][campo] = v));
  }
  protected raio(k: ChaveRaio, v: number): void {
    if (v >= 0) this.servico.alterar((f) => (f.raios[k] = v));
  }
  protected espaco(k: ChaveEspaco, v: number): void {
    if (v >= 0) this.servico.alterar((f) => (f.espacos[k] = v));
  }
  protected sombra(k: ChaveSombra, campo: keyof SombraFundacao, v: number): void {
    this.servico.alterar((f) => (f.sombras[k][campo] = v));
  }
  protected definirUso(usar: boolean): void {
    this.servico.definirUsoNoFigma(usar);
  }

  protected restaurar(): void {
    this.servico.restaurarPadrao();
    this.avisar('Fundação Kalixto restaurada.');
  }

  protected baixarCss(): void {
    baixarArquivo(this.css(), `${slug(this.f().nome)}-fundacao.css`, 'text/css');
  }
  protected baixarJson(): void {
    baixarArquivo(
      JSON.stringify(this.f(), null, 2) + '\n',
      `${slug(this.f().nome)}.fundacao.json`,
      'application/json',
    );
  }
  /** Pacote KCX só com a fundação: o Figma Bridge cria as variáveis e os estilos. */
  protected baixarFigma(): void {
    const p = criarPacote([], {
      fundacao: this.f(),
      id: `fundacao-${slug(this.f().nome)}`,
      nome: `Fundação ${this.f().nome}`,
      versao: this.f().versao,
    });
    baixarArquivo(serializar(p), `${slug(this.f().nome)}-fundacao.kcx.json`, 'application/json');
  }

  protected async importar(e: Event): Promise<void> {
    const texto = await lerArquivo(e);
    if (texto === null) return;
    try {
      const bruto = JSON.parse(texto) as Partial<KcxFundacao> & { fundacao?: KcxFundacao };
      // Aceita a fundação pura ou um pacote KCX que leve uma.
      const f = completarFundacao(bruto.fundacao ?? bruto);
      const erros = validarFundacao(f);
      if (erros.length) {
        this.avisar(`Arquivo inválido: ${erros[0]}`);
        return;
      }
      this.servico.definir(f);
      this.avisar(`Fundação "${f.nome}" importada.`);
    } catch {
      this.avisar('O arquivo não é um JSON válido.');
    }
  }

  private avisar(t: string): void {
    this.aviso.set(t);
  }
}

function slug(s: string): string {
  return (
    s
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'fundacao'
  );
}

/** Custom properties para a prévia (mesmos nomes do CSS exportado). */
export function varsDaPrevia(f: KcxFundacao, tema: Tema): Record<string, string> {
  const out: Record<string, string> = {};
  for (const t of TOKENS_COR) out[`--kx-cor-${t}`] = f.cores[t][tema];
  for (const k of CHAVES_RAIO) out[`--kx-raio-${k}`] = `${f.raios[k]}px`;
  for (const k of CHAVES_ESPACO) out[`--kx-espaco-${k}`] = `${f.espacos[k]}px`;
  out['--kx-fonte-titulo'] = `'${f.fontes.titulo}', system-ui, sans-serif`;
  out['--kx-fonte-corpo'] = `'${f.fontes.corpo}', system-ui, sans-serif`;
  out['--kx-fonte-mono'] = `'${f.fontes.mono}', ui-monospace, monospace`;
  for (const k of CHAVES_SOMBRA) {
    const s = f.sombras[k];
    out[`--kx-sombra-${k}`] =
      `${s.x}px ${s.y}px ${s.raio}px ${s.espalhar}px rgb(0 0 0 / ${s.opacidade})`;
  }
  return out;
}

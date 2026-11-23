import { Component, computed, inject, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { cssDaFundacao } from '../../../kcx/fundacao';
import { planejarFigma } from '../../../kcx/figma-plano';
import {
  ComponenteGuia,
  TemaGuia,
  contrastesDaFundacao,
  guiaDoDesignSystem,
} from '../../../kcx/guia-design-system';
import { criarPacote } from '../../../kcx/serializar';
import { Icon } from '../../../shared/components/icon/icon';
import { baixarArquivo } from '../kcx-estado.service';
import { KcxFundacaoService } from '../kcx-fundacao.service';
import { KcxMeusService } from '../kcx-meus.service';
import { KcxImportarDs } from '../kcx-importar-ds/kcx-importar-ds';

/**
 * Guia do design system (/kcx/design-system): toda a identidade visual a
 * partir da Fundação, num documento só (o mesmo que se baixa e imprime).
 */
@Component({
  selector: 'kx-kcx-design-system',
  imports: [RouterLink, Icon, KcxImportarDs],
  templateUrl: './kcx-design-system.html',
  styleUrl: './kcx-design-system.css',
})
export class KcxDesignSystemPagina {
  private readonly fundacaoSrv = inject(KcxFundacaoService);
  private readonly meus = inject(KcxMeusService);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly f = this.fundacaoSrv.fundacao;
  protected readonly tema = signal<TemaGuia>('escuro');
  protected readonly comComponentes = signal(true);

  /** Meus componentes (ou, se ainda não há, os da biblioteca), como ficam no Figma. */
  private readonly componentes = computed<ComponenteGuia[]>(() => {
    const lista = this.meus.meus().length ? this.meus.meus() : this.meus.todos().slice(0, 6);
    return lista.map((c) => {
      let arvore;
      let variantes = c.estados.length || 1;
      try {
        const p = planejarFigma(criarPacote([c])).componentes[0];
        arvore = p.variantes[0]?.arvore;
        variantes = p.variantes.length;
      } catch {
        arvore = undefined;
      }
      return {
        nome: c.nome,
        categoria: c.categoria,
        variantes,
        arvore,
        largura: c.metadados.largura,
        altura: c.metadados.altura,
      };
    });
  });

  private readonly html = computed(() =>
    guiaDoDesignSystem(this.f(), {
      tema: this.tema(),
      componentes: this.comComponentes() ? this.componentes() : [],
    }),
  );
  protected readonly documento = computed<SafeHtml>(() =>
    this.sanitizer.bypassSecurityTrustHtml(this.html()),
  );
  protected readonly falhas = computed(() =>
    contrastesDaFundacao(this.f(), this.tema()).filter((p) => p.nota === 'Falha'),
  );

  private nomeArquivo(): string {
    return (
      this.f()
        .nome.normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'design-system'
    );
  }
  protected baixarGuia(): void {
    baixarArquivo(this.html(), `${this.nomeArquivo()}-design-system.html`, 'text/html');
  }
  protected readonly gerandoPdf = signal(false);
  protected readonly erroPdf = signal('');

  /** Logo da Fundação em PNG/JPG (SVG, WebP e GIF passam por um canvas). */
  private async logoParaPdf(): Promise<{ bytes: Uint8Array; tipo: 'png' | 'jpg' } | undefined> {
    const logo = this.f().logo;
    if (!logo?.src) return undefined;
    const m = logo.src.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/);
    const bytes = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    if (m) return { bytes: bytes(m[2]), tipo: m[1] === 'png' ? 'png' : 'jpg' };
    try {
      const img = new Image();
      img.src = logo.src;
      await img.decode();
      const k = Math.min(2, 800 / Math.max(img.naturalWidth || logo.largura, 1));
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round((img.naturalWidth || logo.largura) * k));
      c.height = Math.max(1, Math.round((img.naturalHeight || logo.altura) * k));
      c.getContext('2d')?.drawImage(img, 0, 0, c.width, c.height);
      return { bytes: bytes(c.toDataURL('image/png').split(',')[1]), tipo: 'png' };
    } catch {
      return undefined;
    }
  }

  protected async baixarPdf(): Promise<void> {
    if (this.gerandoPdf()) return;
    this.gerandoPdf.set(true);
    this.erroPdf.set('');
    try {
      const { pdfDoDesignSystem } = await import('../../../kcx/pdf-design-system');
      const bytes = await pdfDoDesignSystem(this.f(), {
        tema: this.tema(),
        data: new Date().toLocaleDateString('pt-BR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        logo: await this.logoParaPdf(),
        componentes: this.comComponentes()
          ? this.componentes().map((c) => ({
              nome: c.nome,
              categoria: c.categoria,
              variantes: c.variantes,
            }))
          : [],
      });
      baixarArquivo(bytes, `${this.nomeArquivo()}-design-system.pdf`, 'application/pdf');
    } catch (e) {
      this.erroPdf.set(`Não deu para gerar o PDF: ${(e as Error).message}`);
    } finally {
      this.gerandoPdf.set(false);
    }
  }

  protected baixarCss(): void {
    baixarArquivo(cssDaFundacao(this.f()), `${this.nomeArquivo()}-tokens.css`, 'text/css');
  }
}

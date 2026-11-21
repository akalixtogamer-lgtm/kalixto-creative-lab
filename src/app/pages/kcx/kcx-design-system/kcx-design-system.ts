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

/**
 * Guia do design system (/kcx/design-system): toda a identidade visual a
 * partir da Fundação, num documento só (o mesmo que se baixa e imprime).
 */
@Component({
  selector: 'kx-kcx-design-system',
  imports: [RouterLink, Icon],
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
  protected baixarCss(): void {
    baixarArquivo(cssDaFundacao(this.f()), `${this.nomeArquivo()}-tokens.css`, 'text/css');
  }
}

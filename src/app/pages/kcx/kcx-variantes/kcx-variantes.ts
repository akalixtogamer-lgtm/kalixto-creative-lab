import { Component, computed, inject, input, model } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { eixosDoComponente, planejarFigma, variantesDoComponente } from '../../../kcx/figma-plano';
import { KcxComponente } from '../../../kcx/kcx.types';
import { documentoDaVariante } from '../../../kcx/plano-html';
import { Valores } from '../../../kcx/resolver';
import { criarPacote } from '../../../kcx/serializar';

interface Miniatura {
  nome: string;
  props: Record<string, string>;
  doc: SafeHtml;
}

/**
 * Seletor de variantes: um grupo de botões por eixo (Estado, Tamanho, …).
 * Escolher uma opção troca a variante `selecionada`; quem usa o componente
 * aplica `valoresDe(selecionada)` no preview. Com `grade`, mostra também todas
 * as variantes desenhadas como ficam no Figma — clicar numa seleciona.
 */
@Component({
  selector: 'kx-kcx-variantes',
  templateUrl: './kcx-variantes.html',
  styleUrl: './kcx-variantes.css',
})
export class KcxVariantes {
  readonly comp = input.required<KcxComponente>();
  /** Valores atuais das variáveis (o que o usuário já mexeu). */
  readonly valores = input<Valores>({});
  /** Nome da variante escolhida ("Estado=Hover, Tamanho=G"); vazio = a primeira. */
  readonly selecionada = model<string>('');
  /** Mostrar a grade com todas as variantes. */
  readonly grade = input(false);
  /** Altura de cada miniatura da grade. */
  readonly alturaMiniatura = input(150);

  private readonly sanitizer = inject(DomSanitizer);

  protected readonly variantes = computed(() => {
    try {
      return variantesDoComponente(this.comp(), this.valores());
    } catch {
      return [];
    }
  });
  protected readonly eixos = computed(() => {
    try {
      return eixosDoComponente(this.comp());
    } catch {
      return [];
    }
  });

  protected readonly atual = computed(() => {
    const vs = this.variantes();
    return vs.find((v) => v.nome === this.selecionada()) ?? vs[0];
  });

  /** Mostrar, abaixo dos botões, a variante escolhida como fica no Figma. */
  readonly previa = input(true);
  /** Altura da prévia da variante escolhida. */
  readonly alturaPrevia = input(200);

  /** Mostrar os botões de cada eixo. */
  readonly seletores = input(true);

  private readonly plano = computed(() => {
    const c = this.comp();
    try {
      return planejarFigma(criarPacote([{ ...c, variaveis: comValores(c, this.valores()) }]))
        .componentes[0];
    } catch {
      return {
        variantes: [] as ReturnType<typeof planejarFigma>['componentes'][number]['variantes'],
      };
    }
  });

  protected readonly previaAtual = computed<Miniatura | null>(() => {
    if (!this.previa()) return null;
    const nome = this.atual()?.nome;
    const v = this.plano().variantes.find((x) => x.nome === nome) ?? this.plano().variantes[0];
    if (!v) return null;
    return {
      nome: v.nome,
      props: v.propriedades,
      doc: this.sanitizer.bypassSecurityTrustHtml(documentoDaVariante(v.arvore)),
    };
  });

  protected readonly miniaturas = computed<Miniatura[]>(() => {
    if (!this.grade()) return [];
    const p = this.plano();
    return p.variantes.map((v) => ({
      nome: v.nome,
      props: v.propriedades,
      doc: this.sanitizer.bypassSecurityTrustHtml(documentoDaVariante(v.arvore)),
    }));
  });

  protected escolher(eixo: string, opcao: string): void {
    const alvo = { ...this.atual()?.props, [eixo]: opcao };
    const v = this.variantes().find((x) =>
      Object.entries(alvo).every(([k, o]) => x.props[k] === o),
    );
    if (v) this.selecionada.set(v.nome);
  }

  protected rotulo(props: Record<string, string>): string {
    return Object.values(props).join(' · ');
  }
}

/** Copia o componente com os valores atuais como valor das variáveis. */
function comValores(c: KcxComponente, valores: Valores): KcxComponente['variaveis'] {
  return c.variaveis.map((v) => (v.id in valores ? { ...v, valor: valores[v.id] } : v));
}

export { valoresDaVariante } from '../../../kcx/figma-plano';

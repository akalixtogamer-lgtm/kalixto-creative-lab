import { Component, computed, input, linkedSignal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  EntradaGlossario,
  GLOSSARIO,
  TIPO_ROTULO,
  TipoEntrada,
  normalizar,
} from '../../core/efeitos/glossario';
import { Icon } from '../../shared/components/icon/icon';
import { PageHeader } from '../../shared/components/page-header/page-header';

type FiltroTipo = 'todos' | TipoEntrada;

const LETRAS = ['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];

/**
 * Glossário A–Z (/glossario): todos os itens do lab em ordem alfabética,
 * com busca, filtro por tipo e índice de letras. Cada item leva direto
 * para onde dá para testar e copiar o código.
 */
@Component({
  selector: 'kx-glossario',
  imports: [FormsModule, RouterLink, Icon, PageHeader],
  templateUrl: './glossario.html',
  styleUrl: './glossario.css',
})
export class Glossario {
  /** Busca vinda da URL (?q=), para compartilhar um resultado. */
  readonly q = input<string>('');

  protected readonly busca = linkedSignal(() => this.q() ?? '');
  protected readonly tipo = signal<FiltroTipo>('todos');
  protected readonly tipoRotulo = TIPO_ROTULO;

  protected readonly totais = {
    todos: GLOSSARIO.length,
    efeito: GLOSSARIO.filter((e) => e.tipo === 'efeito').length,
    demo: GLOSSARIO.filter((e) => e.tipo === 'demo').length,
    termo: GLOSSARIO.filter((e) => e.tipo === 'termo').length,
  };

  protected readonly filtros: { id: FiltroTipo; rotulo: string }[] = [
    { id: 'todos', rotulo: 'Tudo' },
    { id: 'efeito', rotulo: 'Efeitos' },
    { id: 'demo', rotulo: 'Demos dos labs' },
    { id: 'termo', rotulo: 'Termos de código' },
  ];

  protected readonly encontrados = computed<EntradaGlossario[]>(() => {
    const termos = normalizar(this.busca().trim()).split(/\s+/).filter(Boolean);
    const tipo = this.tipo();
    return GLOSSARIO.filter(
      (e) => (tipo === 'todos' || e.tipo === tipo) && termos.every((t) => e.busca.includes(t)),
    );
  });

  /** Entradas agrupadas por letra, só as letras que têm itens. */
  protected readonly grupos = computed(() =>
    LETRAS.map((letra) => ({ letra, itens: this.encontrados().filter((e) => e.letra === letra) })).filter(
      (g) => g.itens.length > 0,
    ),
  );

  protected readonly letras = computed(() => {
    const comItens = new Set(this.grupos().map((g) => g.letra));
    return LETRAS.map((l) => ({ letra: l, ativa: comItens.has(l) }));
  });

  protected idLetra(letra: string): string {
    return letra === '#' ? 'letra-num' : 'letra-' + letra;
  }

  protected irPara(letra: string): void {
    const alvo = document.getElementById(this.idLetra(letra));
    alvo?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    alvo?.focus({ preventScroll: true });
  }

  protected limpar(): void {
    this.busca.set('');
    this.tipo.set('todos');
  }
}

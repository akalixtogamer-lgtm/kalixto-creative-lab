import { Component, computed, inject, input, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CATEGORIAS, findCategoria } from '../../core/efeitos/categorias';
import { CATALOGO, EFFECT_REGISTRY, ItemCatalogo } from '../../core/efeitos/registry';
import { LABS, findLab } from '../../core/data/labs.data';
import {
  INTERACAO_ROTULO,
  Interacao,
  NIVEL_FICHA_ROTULO,
  NIVEL_ORDEM,
  NivelFicha,
} from '../../core/models/effect-sheet.model';
import { ProgressoService } from '../../core/services/progresso.service';
import { Icon } from '../../shared/components/icon/icon';
import { PageHeader } from '../../shared/components/page-header/page-header';

type Ordem = 'padrao' | 'az' | 'nivel';

/** Texto onde a busca procura: nome, descrição, tecnologias, categoria, aplicações e tags. */
function textoBusca(i: ItemCatalogo): string {
  return [
    i.nome,
    i.descricao,
    i.origem,
    i.tecnologias.join(' '),
    findCategoria(i.categoria)?.nome ?? '',
    i.aplicacoes.join(' '),
    i.tags.join(' '),
  ]
    .join(' ')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

const INDICE = new Map(CATALOGO.map((i) => [i.chave, textoBusca(i)]));

/**
 * Biblioteca de efeitos: kits com ficha técnica completa + as demos dos laboratórios.
 * Aceita ?lab=css e ?categoria=tipografia na URL para já abrir filtrada.
 */
@Component({
  selector: 'kx-biblioteca',
  imports: [FormsModule, NgTemplateOutlet, RouterLink, Icon, PageHeader],
  templateUrl: './biblioteca.html',
  styleUrl: './biblioteca.css',
})
export class Biblioteca {
  /** Query params (withComponentInputBinding). */
  readonly lab = input<string>();
  readonly categoria = input<string>();

  protected readonly labs = LABS.filter((l) => CATALOGO.some((e) => e.labId === l.id));
  protected readonly categorias = CATEGORIAS.map((c) => ({
    ...c,
    total: CATALOGO.filter((i) => i.categoria === c.id).length,
  }));
  protected readonly totalKits = EFFECT_REGISTRY.length;
  protected readonly totalDemos = CATALOGO.length - EFFECT_REGISTRY.length;
  protected readonly nivelRotulo = NIVEL_FICHA_ROTULO;
  protected readonly interacoes = Object.entries(INTERACAO_ROTULO).filter(([k]) =>
    CATALOGO.some((i) => i.interacoes.includes(k as Interacao)),
  ) as [Interacao, string][];

  private readonly progresso = inject(ProgressoService);
  protected readonly busca = signal('');
  protected readonly filtroNivel = signal<'todos' | NivelFicha>('todos');
  protected readonly filtroSituacao = signal<'todos' | 'feitos' | 'pendentes'>('todos');
  protected readonly filtroTipo = signal<'todos' | 'kit' | 'demo'>('todos');
  protected readonly filtroInteracao = signal<'todos' | Interacao>('todos');
  protected readonly filtroDependencia = signal<'todos' | 'nenhuma' | 'gsap' | 'three'>('todos');
  protected readonly ordem = signal<Ordem>('padrao');
  protected readonly labManual = signal<string | null>(null);
  protected readonly categoriaManual = signal<string | null>(null);

  /** O filtro escolhido na tela tem prioridade sobre o da URL. */
  protected readonly filtroLab = computed(() => this.labManual() ?? this.lab() ?? 'todos');
  protected readonly filtroCategoria = computed(
    () => this.categoriaManual() ?? this.categoria() ?? 'todos',
  );

  protected readonly efeitos = computed(() => {
    const termo = this.busca().trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const lab = this.filtroLab();
    const cat = this.filtroCategoria();
    const nivel = this.filtroNivel();
    const situacao = this.filtroSituacao();
    const tipo = this.filtroTipo();
    const inter = this.filtroInteracao();
    const dep = this.filtroDependencia();
    const feitas = this.progresso.executadas();

    const lista = CATALOGO.filter(
      (e) =>
        (tipo === 'todos' || e.tipo === tipo) &&
        (lab === 'todos' || e.labId === lab) &&
        (cat === 'todos' || e.categoria === cat) &&
        (nivel === 'todos' || e.nivel === nivel) &&
        (inter === 'todos' || e.interacoes.includes(inter)) &&
        (dep === 'todos' ||
          (dep === 'nenhuma' ? e.dependencias.length === 0 : e.dependencias.includes(dep))) &&
        (situacao === 'todos' ||
          (e.tipo === 'demo' &&
            feitas.has(`${e.labId}:${e.demoId}`) === (situacao === 'feitos'))) &&
        (!termo || termo.split(/\s+/).every((t) => INDICE.get(e.chave)!.includes(t))),
    );

    const ordem = this.ordem();
    if (ordem === 'az') return [...lista].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    if (ordem === 'nivel')
      return [...lista].sort(
        (a, b) =>
          NIVEL_ORDEM[a.nivel] - NIVEL_ORDEM[b.nivel] || a.nome.localeCompare(b.nome, 'pt-BR'),
      );
    return lista;
  });

  protected readonly filtrando = computed(
    () =>
      !!this.busca().trim() ||
      [
        this.filtroLab(),
        this.filtroCategoria(),
        this.filtroNivel(),
        this.filtroSituacao(),
        this.filtroTipo(),
        this.filtroInteracao(),
        this.filtroDependencia(),
      ].some((v) => v !== 'todos'),
  );

  protected limpar(): void {
    this.busca.set('');
    this.labManual.set('todos');
    this.categoriaManual.set('todos');
    this.filtroNivel.set('todos');
    this.filtroSituacao.set('todos');
    this.filtroTipo.set('todos');
    this.filtroInteracao.set('todos');
    this.filtroDependencia.set('todos');
    this.ordem.set('padrao');
  }

  protected feito(e: ItemCatalogo): boolean {
    return e.tipo === 'demo' && this.progresso.executadas().has(`${e.labId}:${e.demoId}`);
  }

  /** O template recebe o item sem tipo (ng-template), por isso a função. */
  protected rotuloNivel(nivel: NivelFicha): string {
    return NIVEL_FICHA_ROTULO[nivel];
  }

  protected nomeCategoria(id: string): string {
    return findCategoria(id)?.nome ?? id;
  }

  protected acento(e: ItemCatalogo): string {
    return e.labId ? (findLab(e.labId)?.acento ?? 'magenta') : 'ciano';
  }
}

import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  CATEGORIAS_CONSTRUTOR,
  ConfigConstrutor,
  CoresConstrutor,
  corDoBotao,
  notaFigma,
  NivelFigma,
  RecursoTipo,
  DefinicaoTipo,
  TIPOS_CONSTRUTOR,
  configPadrao,
  montarDoConstrutor,
  slug,
  tipoConstrutor,
} from '../../../kcx/construtor';
import { montarDocumentoKcx } from '../../../kcx/documento';
import { KcxComponente } from '../../../kcx/kcx.types';
import { idLivre } from '../../../kcx/meus-componentes';
import { planejarFigma } from '../../../kcx/figma-plano';
import { criarPacote } from '../../../kcx/serializar';
import { resolverSaidas } from '../../../kcx/resolver';
import { Icon } from '../../../shared/components/icon/icon';
import { KcxMeusService } from '../kcx-meus.service';
import { KcxPreview } from '../kcx-preview/kcx-preview';
import { ICONES_KCX } from '../../../kcx/icones';
import { PlanoComponente, PlanoNo } from '../../../kcx/figma-plano';

/** Propriedades de componente que o Figma vai mostrar (texto, liga/desliga, troca de ícone). */
function contarPropriedades(c: PlanoComponente): number {
  const nomes = new Set<string>();
  const ver = (n: PlanoNo) => {
    if (n.texto?.propriedade) nomes.add('t:' + n.texto.propriedade);
    if (n.propriedadeVisivel) nomes.add('v:' + n.propriedadeVisivel);
    if (n.icone?.propriedade) nomes.add('i:' + n.icone.propriedade);
    n.filhos.forEach(ver);
  };
  c.variantes.forEach((v) => ver(v.arvore));
  return nomes.size;
}
import { KcxVariantes, valoresDaVariante } from '../kcx-variantes/kcx-variantes';

export type PassoCriar = 1 | 2 | 3;

/** Paletas prontas: um clique troca as quatro cores. */
export const PALETAS: { nome: string; cores: CoresConstrutor }[] = [
  {
    nome: 'Kalixto',
    cores: { primaria: '#d4119f', fundo: '#0b0a14', superficie: '#1a1530', texto: '#f4f2ff' },
  },
  {
    nome: 'Oceano',
    cores: { primaria: '#2563eb', fundo: '#06121f', superficie: '#0f2238', texto: '#e8f1ff' },
  },
  {
    nome: 'Floresta',
    cores: { primaria: '#16a34a', fundo: '#07140d', superficie: '#11261a', texto: '#eafff1' },
  },
  {
    nome: 'Pôr do sol',
    cores: { primaria: '#f97316', fundo: '#1a0b05', superficie: '#2b150b', texto: '#fff3ea' },
  },
  {
    nome: 'Claro',
    cores: { primaria: '#7c3aed', fundo: '#ffffff', superficie: '#f3f0ff', texto: '#1b1530' },
  },
  {
    nome: 'Preto e branco',
    cores: { primaria: '#111111', fundo: '#ffffff', superficie: '#f2f2f2', texto: '#111111' },
  },
];

/** Limite da imagem enviada (fica no navegador, dentro do componente). */
const LIMITE_IMAGEM = 1_500_000;

/**
 * Construtor do KCX Studio (/kcx/criar): escolha o tipo, dê os nomes, escolha a
 * animação e as cores; o componente sai com código, variáveis e estrutura do
 * Figma (variantes + interações). ?tipo=<id> abre um tipo; ?de=<id> reabre um
 * componente seu para continuar editando.
 */
@Component({
  selector: 'kx-kcx-criar',
  imports: [RouterLink, Icon, KcxPreview, KcxVariantes],
  templateUrl: './kcx-criar.html',
  styleUrl: './kcx-criar.css',
})
export class KcxCriar {
  readonly tipo = input<string>();
  readonly de = input<string>();
  private readonly meus = inject(KcxMeusService);
  private readonly router = inject(Router);

  protected readonly paletas = PALETAS;
  protected readonly curvas = [
    { id: '', nome: 'Suave (padrão)' },
    { id: 'entrada-saida', nome: 'Entrada e saída suaves' },
    { id: 'linear', nome: 'Linear' },
    { id: 'mola', nome: 'Mola (passa e volta)' },
    { id: 'quique', nome: 'Quique' },
  ];

  /** Etapa: 1 tipo · 2 personalizar · 3 revisar e salvar. */
  protected readonly passo = linkedSignal<PassoCriar>(() => (this.de() || this.tipo() ? 2 : 1));
  /** Variante mostrada no preview (vazio = a primeira). */
  protected readonly variante = signal('');

  protected readonly categorias = CATEGORIAS_CONSTRUTOR.map((c) => ({
    ...c,
    tipos: TIPOS_CONSTRUTOR.filter((t) => t.categoria === c.id),
  })).filter((c) => c.tipos.length);

  /** Componente que está sendo reeditado (?de=). */
  private readonly original = computed(() => {
    const id = this.de();
    const c = id ? this.meus.buscar(id) : undefined;
    return c?.origemCriacao?.tipo === 'construtor' ? c : undefined;
  });

  protected readonly cfg = linkedSignal<ConfigConstrutor>(() => {
    const o = this.original();
    if (o) return structuredClone(o.origemCriacao!.config as ConfigConstrutor);
    const def = tipoConstrutor(this.tipo() ?? '') ?? TIPOS_CONSTRUTOR[0];
    return configPadrao(def, `Meu ${def.nome.toLowerCase()}`);
  });

  protected readonly def = computed<DefinicaoTipo>(
    () => tipoConstrutor(this.cfg().tipo) ?? TIPOS_CONSTRUTOR[0],
  );

  /** Id que será salvo: o do componente reeditado ou um livre a partir do nome. */
  protected readonly idFinal = computed(() => {
    const o = this.original();
    if (o) return o.id;
    return idLivre(slug(this.cfg().nome), this.meus.ids());
  });

  protected readonly resultado = computed<{ comp?: KcxComponente; erro?: string }>(() => {
    try {
      return { comp: montarDoConstrutor({ ...this.cfg(), id: this.idFinal() }) };
    } catch (e) {
      return { erro: (e as Error).message };
    }
  });

  protected readonly documento = computed(() => {
    const c = this.resultado().comp;
    return c ? montarDocumentoKcx(c, {}, { modo: 'preview' }) : '';
  });

  protected readonly saidas = computed(() => {
    const c = this.resultado().comp;
    return c
      ? resolverSaidas(c.variaveis, valoresDaVariante(c, this.variante()))
      : { cssVars: {}, atributos: [], textos: [] };
  });

  /** Resumo do que vai para o Figma. */
  protected readonly figma = computed(() => {
    const c = this.resultado().comp;
    if (!c) return null;
    const plano = planejarFigma(criarPacote([c]));
    const p = plano.componentes[0];
    return {
      variantes: p.variantes.map((v) => v.nome),
      interacoes: p.interacoes?.length ?? 0,
      propriedades: contarPropriedades(p),
      variaveis: plano.colecoes.reduce(
        (s, col) => s + col.variaveis.filter((v) => v.nome.startsWith(`${c.id}/`)).length,
        0,
      ),
      editavel: c.compatibilidade.figma.editavel,
    };
  });

  /** "Estado=Hover, Tamanho=G" → "Hover · G" (vazio = a primeira variante). */
  protected readonly rotuloVariante = computed(() => {
    const nome = this.variante() || this.figma()?.variantes[0] || '';
    return nome
      .replace(/[^=,]+=/g, '')
      .split(',')
      .map((x) => x.trim())
      .join(' · ');
  });

  /** Como a animação escolhida aparece no Figma. */
  protected readonly notaAnimacao = computed(() => notaFigma(this.cfg().tipo, this.cfg().animacao));

  protected nivelDe(animacao: string): NivelFigma | undefined {
    return notaFigma(this.cfg().tipo, animacao)?.nivel;
  }

  protected readonly rotuloNivel: Record<NivelFigma, string> = {
    igual: 'Igual no Figma',
    parcial: 'Parte no Figma',
    codigo: 'Só no código',
  };

  protected readonly nomeAnimacao = computed(
    () => this.def().animacoes.find((a) => a.id === this.cfg().animacao)?.nome ?? '—',
  );

  protected readonly erros = signal<string[]>([]);
  protected readonly avisoImagem = signal('');

  /* ---------- Edição ---------- */

  protected escolherTipo(def: DefinicaoTipo): void {
    if (def.id !== this.cfg().tipo) {
      const atual = this.cfg();
      const novo = configPadrao(def, `Meu ${def.nome.toLowerCase()}`);
      this.cfg.set({ ...novo, cores: atual.cores, raio: atual.raio });
      this.variante.set('');
    }
    this.erros.set([]);
    this.irPara(2);
  }

  protected irPara(p: PassoCriar): void {
    if (p === 3 && !this.resultado().comp) return;
    this.passo.set(p);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected readonly textosVisiveis = computed(() =>
    this.def().textos.filter((t) => !t.recurso || this.recursoLigado(t.recurso)),
  );

  /* ---------- Recursos do Figma ---------- */
  protected readonly recursosLigados = computed(() =>
    (this.def().recursos ?? [])
      .filter((r) => this.recursoLigado(r.id) && !this.recursoBloqueado(r))
      .map((r) => r.nome),
  );

  protected readonly nomesIcones = Object.keys(ICONES_KCX);

  protected recursoLigado(id: string): boolean {
    return this.cfg().recursos?.[id] === true;
  }

  protected recursoBloqueado(r: RecursoTipo): boolean {
    return !!r.exceto?.includes(this.cfg().animacao);
  }

  protected mudarRecurso(id: string, ligado: boolean): void {
    this.cfg.update((c) => ({ ...c, recursos: { ...c.recursos, [id]: ligado } }));
    this.variante.set('');
  }

  protected lugarVisivel(l: { id: string; recurso?: string }): boolean {
    if (l.recurso && !this.recursoLigado(l.recurso)) return false;
    const m = /^item(\d+)$/.exec(l.id);
    return !m || Number(m[1]) <= this.cfg().itens.length;
  }

  protected iconeEscolhido(lugar: string, padrao: string): string {
    return this.cfg().icones?.[lugar] ?? padrao;
  }

  protected caminhoIcone(nome: string): string {
    return ICONES_KCX[nome] ?? '';
  }

  protected mudarIcone(lugar: string, nome: string): void {
    this.cfg.update((c) => ({ ...c, icones: { ...c.icones, [lugar]: nome } }));
  }

  protected aplicarPaleta(cores: CoresConstrutor): void {
    this.cfg.update((c) => ({ ...c, cores: { ...cores }, coresItens: undefined }));
  }

  protected paletaAtiva(cores: CoresConstrutor): boolean {
    const a = this.cfg().cores;
    return (Object.keys(cores) as (keyof CoresConstrutor)[]).every(
      (k) => a[k].toLowerCase() === cores[k].toLowerCase(),
    );
  }

  /** Cor do item i (tipos com uma cor por item). */
  protected corItem(i: number): string {
    return corDoBotao(this.cfg(), i);
  }

  protected mudarCorItem(i: number, cor: string): void {
    this.cfg.update((c) => {
      const cores = c.itens.map((_, j) => corDoBotao(c, j));
      cores[i] = cor;
      return { ...c, coresItens: cores };
    });
  }

  protected mudar<K extends keyof ConfigConstrutor>(campo: K, valor: ConfigConstrutor[K]): void {
    this.cfg.update((c) => ({ ...c, [campo]: valor }));
  }

  protected mudarTexto(slot: string, valor: string): void {
    this.cfg.update((c) => ({ ...c, textos: { ...c.textos, [slot]: valor } }));
  }

  protected mudarCor(nome: keyof ConfigConstrutor['cores'], valor: string): void {
    this.cfg.update((c) => ({ ...c, cores: { ...c.cores, [nome]: valor } }));
  }

  protected mudarItem(i: number, valor: string): void {
    this.cfg.update((c) => ({ ...c, itens: c.itens.map((x, j) => (j === i ? valor : x)) }));
  }

  protected adicionarItem(): void {
    const d = this.def().itens;
    if (!d || this.cfg().itens.length >= d.max) return;
    this.cfg.update((c) => ({
      ...c,
      itens: [...c.itens, `${d.rotulo} ${c.itens.length + 1}`],
      coresItens: c.coresItens ? [...c.coresItens, ''] : undefined,
    }));
  }

  protected removerItem(i: number): void {
    const d = this.def().itens;
    if (!d || this.cfg().itens.length <= d.min) return;
    this.cfg.update((c) => ({
      ...c,
      itens: c.itens.filter((_, j) => j !== i),
      coresItens: c.coresItens?.filter((_, j) => j !== i),
    }));
    this.variante.set('');
  }

  protected moverItem(i: number, passo: -1 | 1): void {
    const c = this.cfg();
    const j = i + passo;
    if (j < 0 || j >= c.itens.length) return;
    const troca = <T>(xs: T[]) => {
      const r = [...xs];
      [r[i], r[j]] = [r[j], r[i]];
      return r;
    };
    const cores = c.itens.map((_, k) => corDoBotao(c, k));
    this.cfg.set({
      ...c,
      itens: troca(c.itens),
      coresItens: this.def().coresPorItem ? troca(cores) : c.coresItens,
    });
  }

  protected valor(e: Event): string {
    return (e.target as HTMLInputElement).value;
  }

  protected enviarMidia(e: Event): void {
    const arquivo = (e.target as HTMLInputElement).files?.[0];
    this.avisoImagem.set('');
    if (!arquivo) return;
    if (this.def().midia === 'video') {
      this.avisoImagem.set(
        'Vídeo: cole um endereço https://… (arquivos de vídeo são grandes demais para guardar no navegador).',
      );
      return;
    }
    if (arquivo.size > LIMITE_IMAGEM) {
      this.avisoImagem.set('Imagem maior que 1,5 MB: use uma menor ou cole um endereço https://.');
      return;
    }
    const leitor = new FileReader();
    leitor.onload = () => this.mudar('midia', String(leitor.result));
    leitor.readAsDataURL(arquivo);
  }

  protected salvar(): void {
    const c = this.resultado().comp;
    if (!c) return;
    const erros = this.meus.salvar(c);
    this.erros.set(erros);
    if (!erros.length) void this.router.navigate(['/kcx', c.id]);
  }
}

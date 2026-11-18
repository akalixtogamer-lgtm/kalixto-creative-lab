import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  CATEGORIAS_CONSTRUTOR,
  ConfigConstrutor,
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
import { resolverSaidas, valoresAtuais } from '../../../kcx/resolver';
import { Icon } from '../../../shared/components/icon/icon';
import { KcxMeusService } from '../kcx-meus.service';
import { KcxPreview } from '../kcx-preview/kcx-preview';

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
  imports: [RouterLink, Icon, KcxPreview],
  templateUrl: './kcx-criar.html',
  styleUrl: './kcx-criar.css',
})
export class KcxCriar {
  readonly tipo = input<string>();
  readonly de = input<string>();
  private readonly meus = inject(KcxMeusService);
  private readonly router = inject(Router);

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
      ? resolverSaidas(c.variaveis, valoresAtuais(c.variaveis))
      : { cssVars: {}, atributos: [], textos: [] };
  });

  /** Resumo do que vai para o Figma. */
  protected readonly figma = computed(() => {
    const c = this.resultado().comp;
    if (!c) return null;
    const plano = planejarFigma(criarPacote([c]));
    const p = plano.componentes[0];
    return {
      variantes: p.variantes.map((v) => v.nome.replace(/^Estado=/, '')),
      interacoes: p.interacoes?.length ?? 0,
      variaveis: plano.colecoes.reduce(
        (s, col) => s + col.variaveis.filter((v) => v.nome.startsWith(`${c.id}/`)).length,
        0,
      ),
      editavel: c.compatibilidade.figma.editavel,
    };
  });

  protected readonly erros = signal<string[]>([]);
  protected readonly avisoImagem = signal('');

  /* ---------- Edição ---------- */

  protected escolherTipo(def: DefinicaoTipo): void {
    const atual = this.cfg();
    const novo = configPadrao(def, `Meu ${def.nome.toLowerCase()}`);
    this.cfg.set({ ...novo, cores: atual.cores, raio: atual.raio });
    this.erros.set([]);
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
    this.cfg.update((c) => ({ ...c, itens: [...c.itens, `${d.rotulo} ${c.itens.length + 1}`] }));
  }

  protected removerItem(i: number): void {
    const d = this.def().itens;
    if (!d || this.cfg().itens.length <= d.min) return;
    this.cfg.update((c) => ({ ...c, itens: c.itens.filter((_, j) => j !== i) }));
  }

  protected moverItem(i: number, passo: -1 | 1): void {
    const itens = [...this.cfg().itens];
    const j = i + passo;
    if (j < 0 || j >= itens.length) return;
    [itens[i], itens[j]] = [itens[j], itens[i]];
    this.mudar('itens', itens);
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

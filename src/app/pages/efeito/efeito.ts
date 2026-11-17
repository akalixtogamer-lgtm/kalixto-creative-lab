import {
  Component,
  ElementRef,
  Type,
  ViewContainerRef,
  inject,
  computed,
  effect,
  input,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { findCategoria } from '../../core/efeitos/categorias';
import { EFFECT_REGISTRY, findKit } from '../../core/efeitos/registry';
import { montarDocumento } from '../../core/efeitos/sandbox';
import { montarPacote } from '../../core/efeitos/exportar';
import { BIBLIOTECAS, carregarBiblioteca } from '../../core/efeitos/bibliotecas';
import { COMPONENTES_ANGULAR } from '../../efeitos-angular';
import { criarZip } from '../../shared/utils/zip';
import { CodeLab } from './code-lab/code-lab';
import { Explicador } from './explicador/explicador';
import { ParamDef, Valor, Valores } from '../../core/models/demo.model';
import {
  CodigoAngular,
  CodigoKit,
  EffectKit,
  INTERACAO_ROTULO,
  NIVEL_FICHA_ROTULO,
} from '../../core/models/effect-sheet.model';
import { Breadcrumb, Migalha } from '../../shared/components/breadcrumb/breadcrumb';
import { DemoControls } from '../../shared/components/demo-controls/demo-controls';
import { Icon } from '../../shared/components/icon/icon';

function padrao(kit: EffectKit): Valores {
  return Object.fromEntries(kit.params.map((p) => [p.id, p.padrao]));
}

/**
 * Página de um efeito (/efeitos/:id): preview isolado, controles, código e ficha técnica.
 *
 * O preview é um iframe sandbox="allow-scripts" (o Angular exige o atributo
 * estático no template, ver SANDBOX_PREVIEW) (sem allow-same-origin) que
 * recebe o documento montado a partir do código gerado — o mesmo texto que
 * aparece nas abas e que é baixado. Código e preview não podem divergir.
 */
@Component({
  selector: 'kx-efeito',
  imports: [RouterLink, Breadcrumb, CodeLab, DemoControls, Explicador, Icon],
  templateUrl: './efeito.html',
  styleUrl: './efeito.css',
})
export class Efeito {
  /** Parâmetro de rota :id (withComponentInputBinding). */
  readonly id = input.required<string>();

  protected readonly kit = computed(() => findKit(this.id()));
  protected readonly ficha = computed(() => this.kit()?.ficha);
  protected readonly categoria = computed(() => findCategoria(this.ficha()?.categoria ?? ''));

  /** Valores dos controles; voltam ao padrão quando o efeito muda. */
  protected readonly valores = linkedSignal<Valores>(() => {
    const k = this.kit();
    return k ? padrao(k) : {};
  });

  /** Código gerado pelos controles. */
  protected readonly gerado = computed<CodigoKit | null>(() => {
    const k = this.kit();
    return k ? k.gerar(this.valores()) : null;
  });

  /** Código editado no Code Lab (null = usando o gerado). Some ao trocar de efeito. */
  protected readonly editado = linkedSignal<CodigoKit | null>(() => {
    this.kit();
    return null;
  });

  /** Código em execução no preview. */
  protected readonly codigo = computed(() => this.editado() ?? this.gerado());

  protected readonly angular = computed<CodigoAngular | null>(() => {
    const k = this.kit();
    return k ? k.angular(this.valores()) : null;
  });

  /** Preview: código isolado (iframe) ou o componente Angular compilado no app. */
  protected readonly modoPreview = linkedSignal<'isolado' | 'angular'>(() => {
    this.kit();
    return 'isolado';
  });
  protected readonly componenteAngular = signal<Type<unknown> | null>(null);
  protected readonly valoresAlterados = computed(() => {
    const k = this.kit();
    if (!k) return false;
    const p = padrao(k);
    return Object.keys(p).some((key) => String(p[key]) !== String(this.valores()[key]));
  });

  /** Bibliotecas do kit (GSAP, Lenis…), com o código já baixado do próprio app. */
  protected readonly bibliotecas = computed(() =>
    (this.kit()?.bibliotecas ?? []).map((id) => BIBLIOTECAS[id]),
  );
  private readonly codigoBibliotecas = signal<{ id: string; nome: string; codigo: string }[] | null>(null);
  protected readonly erroBibliotecas = signal('');
  protected readonly bibliotecasProntas = computed(() => {
    const libs = this.bibliotecas();
    const carregadas = this.codigoBibliotecas();
    return libs.length === 0 || (!!carregadas && carregadas.length === libs.length && carregadas.every((c, i) => c.id === libs[i].id));
  });
  protected readonly nomesBibliotecas = computed(() => this.bibliotecas().map((b) => b.nome).join(' e '));
  protected readonly angularDisponivel = computed(() => this.kit()?.previewAngular !== false);

  protected readonly documento = computed(() => {
    const c = this.codigo();
    const f = this.ficha();
    if (!c || !f || !this.bibliotecasProntas()) return '';
    const libs = this.bibliotecas().length ? (this.codigoBibliotecas() ?? []) : [];
    return montarDocumento(f.nomeAmigavel, c, libs.map((l) => ({ nome: `${l.nome}`, codigo: l.codigo })));
  });

  protected readonly nivelRotulo = NIVEL_FICHA_ROTULO;
  protected readonly interacoesTexto = computed(() =>
    (this.ficha()?.interacoes ?? []).map((i) => INTERACAO_ROTULO[i]).join(', '),
  );

  protected readonly vizinhos = computed(() => {
    const i = EFFECT_REGISTRY.findIndex((k) => k.ficha.id === this.id());
    return {
      anterior: i > 0 ? EFFECT_REGISTRY[i - 1].ficha : undefined,
      proximo: i >= 0 && i < EFFECT_REGISTRY.length - 1 ? EFFECT_REGISTRY[i + 1].ficha : undefined,
    };
  });

  protected readonly migalhas = computed<Migalha[]>(() => [
    { rotulo: 'Biblioteca', rota: '/biblioteca' },
    { rotulo: this.categoria()?.nome ?? 'Efeito', rota: '/biblioteca' },
    { rotulo: this.ficha()?.nomeAmigavel ?? 'Efeito não encontrado' },
  ]);

  private readonly frameHost = viewChild<ElementRef<HTMLElement>>('frameHost');
  /** Onde o componente Angular do efeito é criado (sem NgComponentOutlet, para não pesar o pacote inicial). */
  private readonly ngHost = viewChild('ngHost', { read: ViewContainerRef });
  private timer?: ReturnType<typeof setTimeout>;

  private readonly title = inject(Title);

  constructor() {
    // Baixa as bibliotecas do kit (uma vez por sessão) antes de montar o preview.
    effect(() => {
      const libs = this.bibliotecas();
      this.codigoBibliotecas.set(null);
      this.erroBibliotecas.set('');
      if (!libs.length) return;
      Promise.all(libs.map((l) => carregarBiblioteca(l.id)))
        .then((codigos) => {
          if (this.bibliotecas() !== libs) return;
          this.codigoBibliotecas.set(
            libs.map((l, i) => ({ id: l.id, nome: `${l.nome} ${l.versao} — ${l.licenca}`, codigo: codigos[i] })),
          );
        })
        .catch(() => this.erroBibliotecas.set('Não foi possível carregar as bibliotecas do efeito.'));
    });

    // Carrega o componente Angular do efeito só quando o modo Angular é escolhido.
    effect(() => {
      const id = this.id();
      if (this.modoPreview() !== 'angular') return;
      this.componenteAngular.set(null);
      COMPONENTES_ANGULAR[id]?.().then((c) => {
        if (this.id() === id) this.componenteAngular.set(c);
      });
    });

    // Cria o componente carregado dentro do palco Angular.
    effect(() => {
      const host = this.ngHost();
      const c = this.componenteAngular();
      if (!host) return;
      host.clear();
      if (c) host.createComponent(c);
    });

    effect(() => {
      const f = this.ficha();
      this.title.setTitle(`${f ? f.nomeAmigavel : 'Efeito não encontrado'} · Kalixto Creative Lab`);
    });
    // Atualiza o preview quando o código muda. O pequeno atraso evita
    // recarregar o iframe a cada pixel enquanto o slider é arrastado.
    // O conteúdo é o código do próprio kit e roda isolado pelo sandbox,
    // sem acesso a esta página.
    effect((onCleanup) => {
      const doc = this.documento();
      const host = this.frameHost()?.nativeElement;
      if (!host || !doc) return;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.mostrar(host, doc), 120);
      onCleanup(() => clearTimeout(this.timer));
    });
  }

  protected alterar(e: { param: ParamDef; valor: Valor }): void {
    this.valores.update((v) => ({ ...v, [e.param.id]: e.valor }));
  }

  protected restaurar(): void {
    const k = this.kit();
    if (k) this.valores.set(padrao(k));
  }

  /** Recarrega o preview com o mesmo código (reinicia animações). */
  protected reiniciar(): void {
    const host = this.frameHost()?.nativeElement;
    const doc = this.documento();
    if (host && doc) this.mostrar(host, doc);
  }

  /**
   * Troca o iframe por um novo já com o documento.
   *
   * Mudar o srcdoc de um iframe que já está na página cria uma entrada no
   * histórico do navegador: cada ajuste no controle virava um "Voltar" a mais,
   * e parecia que a página tinha aberto várias vezes. Um iframe novo carrega
   * o primeiro documento sem criar entrada. O clone mantém o sandbox, a classe
   * e o título do iframe do template.
   */
  private mostrar(host: HTMLElement, doc: string): void {
    const atual = host.querySelector('iframe');
    if (!atual) return;
    const novo = atual.cloneNode(false) as HTMLIFrameElement;
    const f = this.ficha();
    if (f) novo.title = `Preview do efeito ${f.nomeAmigavel}`;
    novo.srcdoc = doc;
    host.replaceChildren(novo);
  }

  protected baixar(): void {
    const f = this.ficha();
    if (!f) return;
    this.salvar(new Blob([this.documento()], { type: 'text/html;charset=utf-8' }), `${f.id}.html`);
  }

  private salvar(blob: Blob, nome: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nome;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  protected baixarPacote(): void {
    const k = this.kit();
    const c = this.codigo();
    const ng = this.angular();
    if (!k || !c || !ng) return;
    const libs = (this.codigoBibliotecas() ?? []).map((l, i) => ({
      biblioteca: this.bibliotecas()[i],
      codigo: l.codigo,
    }));
    const arquivos = montarPacote(k, this.valores(), c, ng, !!this.editado(), libs);
    this.salvar(new Blob([criarZip(arquivos) as BlobPart], { type: 'application/zip' }), `${k.ficha.id}.zip`);
  }

  protected executarEditado(c: CodigoKit): void {
    this.modoPreview.set('isolado');
    this.editado.set(c);
  }

  protected restaurarOriginal(): void {
    this.editado.set(null);
  }
}

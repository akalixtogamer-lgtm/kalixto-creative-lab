import { describe, expect, it } from 'vitest';
import { lerSessao, novaSessao } from '../comparar';
import { validarComponente } from '../validar';
import { resolverSaidas } from '../resolver';
import {
  CATALOGO_EFEITOS,
  FichaEfeito,
  SCRIPT_COLETOR,
  coletaDoHtml,
  easingDoConstrutor,
  investigar,
  lerColeta,
  lerFicha,
  marcoDaFicha,
  reconstruirFicha,
  valoresDaFicha,
} from './index';

const HTML = `<!doctype html><html><head><title>Estúdio Exemplo</title>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
<link rel="stylesheet" href="/estilo.css">
<style>
  .topo { position: sticky; top: 0; }
  .vidro { backdrop-filter: blur(12px); }
  .card { animation: revealUp 1s; animation-timeline: view(); transition: transform .3s }
  .card:hover { transform: translateY(-4px) }
  @keyframes revealUp { from { opacity: 0 } }
</style></head>
<body><div class="swiper"><div class="swiper-wrapper"></div></div><canvas></canvas></body></html>`;

const status = (r: ReturnType<typeof investigar>, id: string) =>
  r.tecnologias.find((t) => t.id === id)?.status;

describe('Web Intelligence · investigação de sites', () => {
  it('HTML salvo: confirma o que está escrito e não afirma o que só o JS mostraria', () => {
    const c = coletaDoHtml(HTML, 'https://exemplo.com/');
    expect(c.origem).toBe('html');
    const r = investigar(c);
    expect(status(r, 'gsap')).toBe('confirmada');
    expect(status(r, 'scrolltrigger')).toBe('confirmada');
    expect(status(r, 'scroll-driven')).toBe('confirmada');
    expect(status(r, 'swiper')).toBe('provavel');
    expect(status(r, 'lottie')).toBe('nao-identificada');
    expect(status(r, 'webgl')).toBe('provavel');
    // As 10 tecnologias pedidas sempre aparecem, mesmo sem sinal.
    for (const id of [
      'gsap',
      'scrolltrigger',
      'framer-motion',
      'motion',
      'three',
      'webgl',
      'lottie',
      'lenis',
      'swiper',
      'scroll-driven',
    ])
      expect(
        r.tecnologias.some((t) => t.id === id),
        id,
      ).toBe(true);
    const tipos = r.fichas.map((f) => f.tipo);
    expect(tipos).toEqual(
      expect.arrayContaining(['sticky', 'vidro', 'revelar', 'hover', 'horizontal']),
    );
    expect(r.fichas.every((f) => f.origem === 'html')).toBe(true);
    expect(r.limites.join(' ')).toContain('nenhum JavaScript rodou');
    // A folha externa não foi lida e isso aparece.
    expect(c.css.inacessiveis).toBe(1);
  });

  it('coleta do DOM: globais e classes criadas pela biblioteca confirmam', () => {
    const c = lerColeta({
      formato: 'kcx-coleta',
      versao: 1,
      origem: 'dom',
      url: 'https://exemplo.com',
      titulo: 'Ex',
      coletadoEm: '2026-11-25T00:00:00Z',
      scripts: [],
      marcadoresInline: [],
      estilos: [],
      globais: { THREE: '160', Lenis: true, qualquer: 'x' },
      marcadoresDom: { 'html.lenis': 1, '.pin-spacer': 2 },
      css: {
        keyframes: ['blobMorph'],
        inacessiveis: 2,
        regrasComTransicao: 0,
        regrasComAnimacao: 0,
        scrollDriven: [],
        sticky: 0,
        scrollSnap: 0,
        viewTransitions: true,
        backdropFilter: 0,
        hover: 0,
        perspective: 0,
      },
      animacoes: [
        {
          alvo: 'div.hero',
          nome: 'sobe',
          duracao: 800,
          easing: 'ease-out',
          timeline: 'scroll',
          iteracoes: 1,
        },
      ],
      recursos: [{ nome: 'https://exemplo.com/a.js', tipo: 'script', bytes: 2048 }],
      elementos: { canvas: 1, video: 0, svg: 0, iframes: 0, fixosOuSticky: [] },
      indiciosEventos: { 'cursor: none no CSS': 1 },
      avisos: [],
    })!;
    expect(c).not.toBeNull();
    expect(c.globais).not.toHaveProperty('qualquer');
    const r = investigar(c);
    expect(status(r, 'three')).toBe('confirmada');
    expect(r.tecnologias.find((t) => t.id === 'three')!.versao).toBe('160');
    expect(status(r, 'lenis')).toBe('confirmada');
    expect(status(r, 'scroll-driven')).toBe('confirmada');
    expect(status(r, 'scrolltrigger')).toBe('provavel');
    expect(status(r, 'webgl')).toBe('provavel');
    expect(status(r, 'view-transitions')).toBe('confirmada');
    const tipos = r.fichas.map((f) => f.tipo);
    expect(tipos).toEqual(
      expect.arrayContaining([
        'parallax',
        'sticky',
        'morph',
        'profundidade',
        'cursor',
        'transicao',
      ]),
    );
    expect(r.resumo.join(' ')).toContain('Lenis');
    expect(lerColeta({ formato: 'outro' })).toBeNull();
  });

  it('o coletor roda numa página e produz uma coleta válida', () => {
    document.body.innerHTML =
      '<div class="swiper swiper-initialized"></div><header style="position:sticky;top:0">x</header>';
    const criar = URL.createObjectURL;
    URL.createObjectURL = () => 'blob:teste';
    try {
      const bruto = new Function(`return ${SCRIPT_COLETOR}`)() as unknown;
      const c = lerColeta(bruto)!;
      expect(c.origem).toBe('dom');
      expect(c.marcadoresDom['.swiper-initialized']).toBe(1);
      expect(investigar(c).tecnologias.find((t) => t.id === 'swiper')!.status).toBe('confirmada');
    } finally {
      URL.createObjectURL = criar;
      document.body.innerHTML = '';
    }
  });
});

const ficha = (extra: Partial<FichaEfeito>): FichaEfeito => ({
  id: 'f1',
  tipo: 'revelar',
  nome: 'Scroll reveal',
  origem: 'video',
  confianca: 'media',
  inicio: 1,
  fim: 2.5,
  evidencias: ['bloco ganhou detalhe'],
  parametros: {},
  ...extra,
});

describe('Web Intelligence · reconstrução', () => {
  it('cada efeito do catálogo vira um componente KCX válido', () => {
    for (const e of CATALOGO_EFEITOS) {
      const { comp } = reconstruirFicha(ficha({ tipo: e.tipo, nome: e.nome }), { ocupados: [] });
      expect(validarComponente(comp, comp.id), e.tipo).toEqual([]);
      expect(comp.origemCriacao?.tipo).toBe('construtor');
      expect((comp.origemCriacao!.config as { animacao: string }).animacao).toBe(e.tipo);
      for (const k of [
        'nome',
        'categoria',
        'descricao',
        'codigo',
        'variaveis',
        'estados',
        'compatibilidade',
        'dependencias',
      ])
        expect(comp, `${e.tipo}.${k}`).toHaveProperty(k);
      expect(comp.estados.map((s) => s.id)).toEqual(['inicio', 'fim']);
      expect(comp.codigo.css).toContain('@media (max-width: 560px)');
      expect(comp.codigo.css).toContain('prefers-reduced-motion');
      expect(comp.dependencias).toEqual([]);
    }
  });

  it('as medidas da ficha viram o padrão das variáveis (e só as que fazem sentido)', () => {
    const r = reconstruirFicha(
      ficha({
        tipo: 'parallax',
        nome: 'Parallax',
        parametros: { fator: 0.5, duracao: 3000, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
      }),
      { ocupados: ['parallax-da-referencia'] },
    );
    expect(r.comp.id).toBe('parallax-da-referencia-2');
    const v = (id: string) => r.comp.variaveis.find((x) => x.id === id)!;
    expect(v('intensidade').padrao).toBe(0.6);
    // Duração de um trecho de rolagem não é a duração do movimento.
    expect(v('duracaoMovimento').padrao).toBe(900);
    expect(v('easing').padrao).toBe('suave');
    expect(resolverSaidas(r.comp.variaveis).cssVars).toHaveProperty(
      `--kcx-${r.comp.id}-intensidade`,
      '0.6',
    );
    // A configuração guarda os valores: reabrir no construtor mantém as medidas.
    expect(
      (r.comp.origemCriacao!.config as { valores: Record<string, unknown> }).valores,
    ).toMatchObject({ intensidade: 0.6 });

    const t = valoresDaFicha(ficha({ tipo: 'texto', parametros: { duracao: 640, atraso: 60 } }));
    expect(t.valores).toMatchObject({ duracaoMovimento: 640, atrasoItens: 60 });
    expect(valoresDaFicha(ficha({})).notas[0]).toContain('valores padrão');
    expect(easingDoConstrutor('linear')!.valor).toBe('linear');
  });

  it('a ficha vira marco da comparação', () => {
    const m = marcoDaFicha(ficha({ parametros: { easing: 'ease-out' } }), 'm1');
    expect(m).toMatchObject({ tipo: 'efeito', ref: 1, refFim: 2.5, easingRef: 'ease-out' });
  });
});

describe('Web Intelligence · guardar e ler', () => {
  it('a análise volta igual na sessão, e o que é inválido fica de fora', () => {
    const s = novaSessao('Teste', 'neon-glow');
    s.analise = {
      fichas: [ficha({}), { ...ficha({}), tipo: 'inventado' as never }],
      reconstruidos: { f1: 'revelar-da-referencia', ruim: 'NÃO VALE' },
    };
    const lida = lerSessao(JSON.parse(JSON.stringify(s)))!;
    expect(lida.analise!.fichas).toHaveLength(1);
    expect(lida.analise!.reconstruidos).toEqual({ f1: 'revelar-da-referencia' });
    expect(lerFicha({ tipo: 'sticky', parametros: { fator: 999 } })!.parametros.fator).toBe(20);
  });
});

describe('Web Intelligence · integração com o resto do KCX', () => {
  it('o efeito reconstruído entra em moldes, Telas, Motion Library, cópia e exportação', async () => {
    const { MOLDES, configDaSecao, trocarTipo } = await import('../projeto/moldes');
    const { FUNDACAO_PADRAO } = await import('../fundacao');
    const { montarDoConstrutor, montarTela } = await import('../construtor');
    const { aplicarNaTela, componenteDaReconstrucao, comMotionLibrary, naMotionLibrary } =
      await import('../comparar');
    const { duplicarComponente } = await import('../meus-componentes');
    const { arquivosCodigo } = await import('../exportar-kcx');

    // Moldes: a seção hero do molde pode virar um efeito web.
    const hero = MOLDES[0].paginas[0].secoes.find((x) => x.tipo === 'hero')!;
    const cfgHero = configDaSecao(hero, FUNDACAO_PADRAO)!;
    const cfg = trocarTipo(cfgHero, 'efeito-web')!;
    const doMolde = montarDoConstrutor({ ...cfg, id: 'hero-em-movimento' });
    expect(validarComponente(doMolde, doMolde.id)).toEqual([]);
    expect(doMolde.variaveis.find((v) => v.id === 'textoTitulo')!.padrao).toBe(
      cfgHero.textos['titulo'],
    );

    // Telas: a reconstrução entra numa página e a tela continua válida.
    const { comp } = reconstruirFicha(ficha({ tipo: 'sticky', nome: 'Sticky section' }), {
      ocupados: [],
    });
    const tela = aplicarNaTela(
      { nome: 'Início', dispositivo: 'desktop' as const, fidelidade: 'alta' as const, secoes: [] },
      comp.id,
      { tipo: 'fim' },
    );
    const montada = montarTela(tela, [comp]);
    expect(validarComponente(montada, montada.id)).toEqual([]);

    // Aprovação e Motion Library preservam as variáveis editáveis.
    const aprovado = comMotionLibrary(
      componenteDaReconstrucao(
        comp,
        { componenteId: comp.id, valores: { intensidade: 0.9 }, ajustes: [] },
        { id: 'sticky-aprovado', nome: 'Sticky aprovado' },
      ),
      true,
    );
    expect(naMotionLibrary(aprovado)).toBe(true);
    expect(aprovado.variaveis.find((v) => v.id === 'intensidade')!.padrao).toBe(0.9);
    expect(validarComponente(aprovado, aprovado.id)).toEqual([]);

    // Duplicar e exportar.
    const copia = duplicarComponente(comp, [comp.id]);
    expect(validarComponente(copia, copia.id)).toEqual([]);
    expect(arquivosCodigo(copia, {}).some((a) => a.nome.endsWith('/index.html'))).toBe(true);
  });
});

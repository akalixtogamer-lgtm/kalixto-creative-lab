import { describe, expect, it } from 'vitest';
import { HOVER_LIFT, NEON_GLOW } from '../componentes';
import { resolverSaidas } from '../resolver';
import { validarComponente } from '../validar';
import {
  Ajuste,
  SessaoComparacao,
  aplicarAjustes,
  aplicarNaTela,
  aprovarVersao,
  assinaturaAjustes,
  avaliarFidelidade,
  comInspetor,
  comMotionLibrary,
  compararVersoes,
  componenteDaReconstrucao,
  criarVersao,
  deltaE,
  distanciaEasing,
  duplicarVersao,
  lerEasing,
  lerMsgInspetor,
  lerSessao,
  naMotionLibrary,
  novaSessao,
  propriedadesAnimadas,
  resumir,
  SCRIPT_INSPETOR,
  seletorSeguro,
  tempoNaReconstrucao,
  tempoNaReferencia,
  urlSegura,
  valorInicial,
  varianteDaReconstrucao,
} from './index';

const aj = (p: Partial<Ajuste> & Pick<Ajuste, 'id' | 'propriedade' | 'valor'>): Ajuste => ({
  seletor: '.kcx-neon-glow',
  elemento: 'Botão',
  escopo: { tipo: 'todos' },
  ...p,
});

function sessaoCom(extra: (s: SessaoComparacao) => void = () => {}): SessaoComparacao {
  const s = novaSessao('Teste', NEON_GLOW.id, new Date('2026-11-22T10:00:00Z'));
  s.referencia.largura = 800;
  s.referencia.altura = 600;
  extra(s);
  return s;
}

describe('easing', () => {
  it('reconhece palavras, cubic-bezier, steps e linear()', () => {
    expect(lerEasing('ease-out')!(0.5)).toBeGreaterThan(0.5);
    expect(lerEasing('linear')!(0.3)).toBeCloseTo(0.3);
    expect(lerEasing('steps(4, end)')!(0.3)).toBe(0.25);
    expect(lerEasing('linear(0, 0.8 50%, 1)')!(0.5)).toBeCloseTo(0.8);
    expect(lerEasing('qualquer coisa')).toBeNull();
    expect(lerEasing('cubic-bezier(2, 0, 1, 1)')).toBeNull();
  });

  it('ease-out e o cubic-bezier equivalente têm distância zero', () => {
    expect(distanciaEasing('ease-out', 'cubic-bezier(0, 0, 0.58, 1)')).toBe(0);
    expect(distanciaEasing('linear', 'ease-in')!).toBeGreaterThan(0.1);
    expect(distanciaEasing('linear', '???')).toBeNull();
  });
});

describe('medidas', () => {
  it('ΔE 2000 é zero para a mesma cor e grande para cores opostas', () => {
    expect(deltaE('#7b2eff', 'rgb(123, 46, 255)')).toBe(0);
    expect(deltaE('#000000', '#ffffff')).toBeGreaterThan(90);
    expect(deltaE('#ff2daa', '#ff2eab')).toBeLessThan(1);
  });

  it('sincroniza tempos que não são iguais nos dois lados', () => {
    const marcos = [
      { id: 'a', nome: 'A', tipo: 'estado' as const, ref: 1, rec: 0.5 },
      { id: 'b', nome: 'B', tipo: 'estado' as const, ref: 3, rec: 1.5 },
    ];
    expect(tempoNaReconstrucao(2, marcos)).toBeCloseTo(1);
    expect(tempoNaReconstrucao(5, marcos)).toBeCloseTo(2.5);
    expect(tempoNaReferencia(1, marcos)).toBeCloseTo(2);
    // Sem marcos pareados: 1:1.
    expect(tempoNaReconstrucao(4, [])).toBe(4);
  });
});

describe('ajustes', () => {
  it('cada ajuste vira uma variável KCX válida ligada ao CSS', () => {
    const ajustes = [
      aj({ id: 'aj1', propriedade: 'x', valor: 12 }),
      aj({ id: 'aj2', propriedade: 'y', valor: -4 }),
      aj({ id: 'aj3', propriedade: 'corFundo', valor: '#7b2eff' }),
      aj({ id: 'aj4', propriedade: 'easing', valor: 'ease-out' }),
      aj({ id: 'aj5', propriedade: 'velocidade', valor: 2, base: 1200 }),
      aj({ id: 'aj6', propriedade: 'gatilho', valor: 'clique' }),
      aj({
        id: 'aj7',
        propriedade: 'opacidade',
        valor: 0.5,
        escopo: { tipo: 'ate', largura: 600 },
      }),
    ];
    const { comp, ignorados } = aplicarAjustes(NEON_GLOW, ajustes);
    expect(ignorados).toEqual([]);
    expect(validarComponente(comp, comp.id)).toEqual([]);
    expect(comp.variaveis.filter((v) => v.id.startsWith('aj'))).toHaveLength(7);
    expect(comp.codigo.css).toContain('translate: var(--kcx-aj1) var(--kcx-aj2);');
    expect(comp.codigo.css).toContain('animation-duration: calc(1200ms / var(--kcx-aj5));');
    expect(comp.codigo.css).toContain('@media (max-width: 600px)');
    expect(comp.codigo.css).toContain(':not(#kcx-ajuste)');
    expect(comp.codigo.js).toContain('data-kcx-gatilho');
    const s = resolverSaidas(comp.variaveis);
    expect(s.cssVars['--kcx-aj1']).toBe('12px');
    expect(s.cssVars['--kcx-aj3']).toBe('#7b2eff');
    expect(s.atributos).toContainEqual({
      seletor: '.kcx-neon-glow',
      atributo: 'data-kcx-gatilho',
      valor: 'clique',
    });
    // O componente base não muda.
    expect(NEON_GLOW.codigo.css).not.toContain('KCX · ajustes');
  });

  it('reaplicar não duplica o bloco de CSS e recusa seletores perigosos', () => {
    const um = aplicarAjustes(NEON_GLOW, [aj({ id: 'aj1', propriedade: 'x', valor: 1 })]).comp;
    const dois = aplicarAjustes(um, [aj({ id: 'aj2', propriedade: 'y', valor: 1 })]).comp;
    expect(dois.codigo.css.match(/KCX · ajustes/g)).toHaveLength(1);
    const r = aplicarAjustes(NEON_GLOW, [
      aj({ id: 'aj9', propriedade: 'x', valor: 1, seletor: 'a{}</style><script>' }),
    ]);
    expect(r.ignorados).toHaveLength(1);
    expect(seletorSeguro('.a > b:nth-of-type(2)')).toBe(true);
    expect(seletorSeguro('.a { color: red }')).toBe(false);
  });

  it('valor inicial vem da medição e só o código entra na assinatura', () => {
    expect(
      valorInicial('duracao', {
        animacoes: [{ nome: 'x', duracao: 900, atraso: 0, easing: 'ease' }],
        transicoes: [],
      } as never),
    ).toBe(900);
    const a = [aj({ id: 'aj1', propriedade: 'x', valor: 1 })];
    const b = [aj({ id: 'aj1', propriedade: 'x', valor: 50 })];
    expect(assinaturaAjustes(a)).toBe(assinaturaAjustes(b));
  });
});

describe('fidelidade', () => {
  it('sem dados, nenhum critério recebe nota inventada', () => {
    const r = avaliarFidelidade(sessaoCom());
    const visuais = r.filter((c) => c.grupo === 'visual');
    expect(visuais.every((c) => c.estado === 'sem-medicao' && !!c.comoMedir)).toBe(true);
  });

  it('mede posição, proporção, cor, tipografia, duração, easing e interações', () => {
    const s = sessaoCom((s) => {
      s.referencia.elementos = [
        {
          id: 'e1',
          nome: 'Título',
          caixaRef: { x: 100, y: 50, largura: 400, altura: 80 },
          corRef: '#ffffff',
          corAlvo: 'texto',
          fonteRef: 48,
          seletorRec: '.titulo',
        },
      ];
      s.referencia.marcos = [
        {
          id: 'm1',
          nome: 'Entrada',
          tipo: 'efeito',
          ref: 0,
          refFim: 0.6,
          rec: 0,
          recFim: 0.62,
          easingRef: 'ease-out',
          seletorRec: '.titulo',
        },
      ];
      s.referencia.comportamentos = [
        { id: 'c1', tipo: 'hover', descricao: 'Card sobe', status: 'reproduzido' },
        { id: 'c2', tipo: 'clique', descricao: 'Abre menu', status: 'nao-implementado' },
      ];
      // Palco com metade da largura da referência: tudo na escala 0,5.
      s.medicoes = {
        palco: { largura: 400, altura: 300 },
        elementos: {
          '.titulo': {
            seletor: '.titulo',
            caixa: { x: 52, y: 25, largura: 200, altura: 40 },
            corTexto: 'rgba(255, 255, 255, 1)',
            corFundo: 'rgba(0, 0, 0, 0)',
            fonte: 24,
            familia: 'Inter',
            peso: 700,
            opacidade: 1,
            padding: 0,
            gap: 0,
            camada: 0,
            animacoes: [
              { nome: 'entrar', duracao: 620, atraso: 0, easing: 'cubic-bezier(0, 0, 0.58, 1)' },
            ],
            transicoes: [],
          },
        },
        viewports: [
          { largura: 390, transborda: true, foraDaTela: ['.hero'] },
          { largura: 1440, transborda: false, foraDaTela: [] },
        ],
      };
    });
    const r = Object.fromEntries(avaliarFidelidade(s, NEON_GLOW).map((c) => [c.id, c]));
    expect(r['posicionamento'].estado).toBe('corresponde');
    expect(r['posicionamento'].medidas[0].diferenca).toContain('Δx 2 px');
    expect(r['proporcoes'].estado).toBe('corresponde');
    expect(r['cores'].estado).toBe('corresponde');
    expect(r['tipografia'].estado).toBe('corresponde');
    expect(r['duracao'].estado).toBe('corresponde');
    expect(r['easing'].estado).toBe('corresponde');
    expect(r['interacoes'].estado).toBe('difere');
    expect(r['responsividade'].estado).toBe('difere');
    expect(r['variaveis'].estado).toBe('corresponde');
    const resumo = resumir(Object.values(r));
    expect(resumo.corresponde + resumo.proximo + resumo.difere + resumo.semMedicao).toBe(14);
  });

  it('o alinhamento do overlay entra na medida de posição', () => {
    const s = sessaoCom((s) => {
      s.alinhamento = { x: 20, y: 0, escala: 1 };
      s.referencia.elementos = [
        {
          id: 'e',
          nome: 'Card',
          caixaRef: { x: 0, y: 0, largura: 100, altura: 100 },
          seletorRec: '.c',
        },
      ];
      s.medicoes = {
        palco: { largura: 800, altura: 600 },
        elementos: {
          '.c': {
            caixa: { x: 0, y: 0, largura: 100, altura: 100 },
            animacoes: [],
            transicoes: [],
          } as never,
        },
        viewports: [],
      };
    });
    const pos = avaliarFidelidade(s).find((c) => c.id === 'posicionamento')!;
    expect(pos.estado).toBe('difere');
  });

  it('lista as propriedades animadas nos keyframes', () => {
    expect(
      propriedadesAnimadas(
        '@keyframes a { from { opacity: 0; transform: x } to { width: 10px } } .b { color: red }',
      ),
    ).toEqual(['opacity', 'transform', 'width']);
  });
});

describe('sessão e versões', () => {
  it('lê de volta o que salvou e descarta o que é perigoso', () => {
    const s = sessaoCom((s) => {
      s.referencia.url = 'javascript:alert(1)';
      s.referencia.frames = [
        { id: 'f1', tempo: 1, src: 'data:image/jpeg;base64,AAAA', largura: 10, altura: 10 },
        { id: 'f2', tempo: 2, src: 'https://evil.example/x.png', largura: 10, altura: 10 },
      ];
      s.atual.ajustes = [
        aj({ id: 'aj1', propriedade: 'x', valor: 9999 }),
        aj({ id: 'aj2', propriedade: 'x', valor: 1, seletor: '}</style>' }),
      ];
    });
    const lida = lerSessao(JSON.parse(JSON.stringify(s)))!;
    expect(lida.referencia.url).toBeUndefined();
    expect(lida.referencia.frames.map((f) => f.id)).toEqual(['f1']);
    expect(lida.atual.ajustes).toHaveLength(1);
    expect(lida.atual.ajustes[0].valor).toBe(800);
    expect(lerSessao({ formato: 'outro' })).toBeNull();
  });

  it('versões registram o que mudou, comparam, duplicam e só uma fica aprovada', () => {
    const s = sessaoCom();
    s.atual.valores = { [NEON_GLOW.variaveis[0].id]: NEON_GLOW.variaveis[0].padrao };
    const v1 = criarVersao(s, NEON_GLOW, avaliarFidelidade(s), 'Primeira', '');
    expect(v1.modificadas).toEqual([]);
    const cor = NEON_GLOW.variaveis.find((v) => v.tipo === 'color')!;
    s.atual.valores = { [cor.id]: '#00d9ff' };
    s.atual.ajustes = [aj({ id: 'aj1', propriedade: 'escala', valor: 1.2 })];
    const v2 = criarVersao(s, NEON_GLOW, avaliarFidelidade(s), '', 'mais azul');
    expect(v2.nome).toBe('Versão 1');
    expect(v2.modificadas).toContain(cor.nome);
    expect(v2.componentes).toEqual([NEON_GLOW.id]);
    const dif = compararVersoes(v1, v2, { [cor.id]: cor.nome });
    expect(dif.map((d) => d.campo)).toEqual(expect.arrayContaining([cor.nome, 'Botão · escala']));
    const copia = duplicarVersao(v2);
    expect(copia.id).not.toBe(v2.id);
    const aprovadas = aprovarVersao([v1, v2, copia], v2.id);
    expect(aprovadas.filter((v) => v.aprovada).map((v) => v.id)).toEqual([v2.id]);
  });
});

describe('integração', () => {
  it('o componente aprovado continua editável: padrão = valor aprovado, ajustes = variáveis', () => {
    const cor = HOVER_LIFT.variaveis.find((v) => v.tipo === 'color')!;
    const estado = {
      componenteId: HOVER_LIFT.id,
      valores: { [cor.id]: '#ff2daa' },
      ajustes: [aj({ id: 'aj1', propriedade: 'rotacao', valor: 3, seletor: '.kcx-hover-lift' })],
    };
    const c = componenteDaReconstrucao(HOVER_LIFT, estado, {
      id: 'glass-card',
      nome: 'Glass Card',
    });
    expect(validarComponente(c, c.id)).toEqual([]);
    expect(c.variaveis.find((v) => v.id === cor.id)!.padrao).toBe('#ff2daa');
    expect(c.variaveis.find((v) => v.id === 'aj1')!.valor).toBe(3);
    expect(c.metadados.tags).toEqual(
      expect.arrayContaining(['reconstrucao', 'reconstrucao-de:hover-lift']),
    );
    expect(c.origemCriacao).toBeUndefined();

    const v = varianteDaReconstrucao(HOVER_LIFT, estado, ['card-variante'], 'Card variante');
    expect(v.id).toBe('card-variante-2');
    expect(validarComponente(v, v.id)).toEqual([]);

    const m = comMotionLibrary(c, true);
    expect(naMotionLibrary(m)).toBe(true);
    expect(naMotionLibrary(comMotionLibrary(m, false))).toBe(false);
  });

  it('aplica numa página das Telas sem mexer no resto', () => {
    const tela = {
      nome: 'Início',
      dispositivo: 'desktop' as const,
      fidelidade: 'alta' as const,
      secoes: ['nav', 'hero'],
    };
    expect(aplicarNaTela(tela, 'novo', { tipo: 'fim' }).secoes).toEqual(['nav', 'hero', 'novo']);
    expect(aplicarNaTela(tela, 'novo', { tipo: 'substituir', indice: 1 }).secoes).toEqual([
      'nav',
      'novo',
    ]);
    expect(aplicarNaTela(tela, 'novo', { tipo: 'inicio' }).secoes).toEqual(['novo', 'nav', 'hero']);
    expect(tela.secoes).toEqual(['nav', 'hero']);
  });
});

describe('inspetor', () => {
  it('é JavaScript válido e entra antes de </body>', () => {
    expect(() => new Function(SCRIPT_INSPETOR)).not.toThrow();
    const doc = comInspetor('<html><body><p>x</p></body></html>');
    expect(doc.indexOf('kcxCmp')).toBeLessThan(doc.indexOf('</body>'));
  });

  it('só aceita mensagens com a forma certa', () => {
    expect(lerMsgInspetor({ kcxCmp: 'tempo', ms: 10, total: 100 })).not.toBeNull();
    expect(lerMsgInspetor({ kcxCmp: 'tempo', ms: 'x' })).toBeNull();
    expect(
      lerMsgInspetor({ kcxCmp: 'evento', tipo: 'hover', seletor: '.a', efeitos: [] }),
    ).not.toBeNull();
    expect(lerMsgInspetor('oi')).toBeNull();
  });

  it('só abre sites http(s) de fora do app', () => {
    expect(urlSegura('https://exemplo.com')).toBe(true);
    expect(urlSegura('javascript:alert(1)')).toBe(false);
    expect(urlSegura('https://lab.dev/x', 'https://lab.dev')).toBe(false);
  });
});

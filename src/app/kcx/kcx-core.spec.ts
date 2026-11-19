import { describe, expect, it } from 'vitest';
import { KCX_COMPONENTES, NEON_GLOW, ANIMATED_GRADIENT_KCX, SVG_MOTION } from './componentes';
import { KcxComponente, KcxPacote, KcxVariavel } from './kcx.types';
import {
  aplicarOperacoes,
  blocoRoot,
  lerBlocoRoot,
  normalizarValor,
  resolverSaidas,
  validarValor,
  valoresPadrao,
} from './resolver';
import {
  clonar,
  compararValores,
  criarPacote,
  desserializar,
  mesclarAtualizacao,
  serializar,
} from './serializar';
import { validarPacote } from './validar';
import { comAlpha, converter, corFigma, corDeFigma, lerCor } from './unidades';
import { comprimento, pontoEm } from './svg-caminho';
import { runtimeStandalone } from './runtime';

const AGORA = new Date('2026-11-18T12:00:00Z');

/** Valor aleatório válido para uma variável (para testes de consistência). */
function aleatorio(v: KcxVariavel, r: () => number): unknown {
  switch (v.tipo) {
    case 'color':
      return (
        '#' +
        Math.floor(r() * 0xffffff)
          .toString(16)
          .padStart(6, '0')
      );
    case 'boolean':
      return r() > 0.5;
    case 'string':
      return 'Texto ' + Math.floor(r() * 100);
    case 'enum':
      return v.opcoes![Math.floor(r() * v.opcoes!.length)].valor;
    case 'gradient':
      return {
        angulo: Math.round(r() * 360),
        paradas: [
          { cor: '#112233', posicao: 0 },
          { cor: '#ff00aa', posicao: r() },
          { cor: '#00ffcc', posicao: 1 },
        ],
      };
    case 'transform':
      return { x: r() * 10, y: r() * 10, escala: 1, rotacao: r() * 90 };
    default: {
      const n = (v.min ?? 0) + r() * ((v.max ?? 100) - (v.min ?? 0));
      return v.tipo === 'number' ? Math.round(n) : n;
    }
  }
}

function semente(s: number) {
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

describe('KCX — unidades e cores', () => {
  it('converte tempo, comprimento e ângulo', () => {
    expect(converter(1500, 'ms', 's')).toBe(1.5);
    expect(converter(2, 'rem', 'px')).toBe(32);
    expect(converter(0.5, 'turn', 'deg')).toBe(180);
    expect(() => converter(1, 'px', 's')).toThrow();
  });
  it('lê e escreve cores, com alpha e no formato do Figma', () => {
    expect(lerCor('#f0a')).toEqual({ r: 255, g: 0, b: 170, a: 1 });
    expect(lerCor('rgba(10, 20, 30, 0.5)')).toEqual({ r: 10, g: 20, b: 30, a: 0.5 });
    expect(comAlpha('#ff2bd6', 0.5)).toBe('#ff2bd680');
    expect(corDeFigma(corFigma('#22e3ff'))).toBe('#22e3ff');
  });
  it('mede caminhos SVG e encontra pontos', () => {
    expect(comprimento('M 0 0 L 30 40')).toBeCloseTo(50);
    expect(pontoEm('M 0 0 L 100 0', 0.25)).toEqual({ x: 25, y: 0 });
  });
});

describe('KCX — schema e validação', () => {
  const pacote = criarPacote(KCX_COMPONENTES, { agora: AGORA });

  it('os 3 componentes de referência formam um pacote válido', () => {
    const r = validarPacote(pacote);
    expect(r.erros).toEqual([]);
    expect(r.valido).toBe(true);
  });

  it('serializa e desserializa sem perder nada', () => {
    const lido = desserializar(serializar(pacote));
    expect(lido.ok).toBe(true);
    if (lido.ok) expect(lido.pacote).toEqual(pacote);
  });

  it('rejeita JSON quebrado, formato errado e schema incompatível', () => {
    expect(desserializar('{').ok).toBe(false);
    expect(validarPacote({ ...pacote, formato: 'outro' }).valido).toBe(false);
    expect(validarPacote({ ...pacote, schemaVersion: '2.0.0' }).valido).toBe(false);
  });

  it('proíbe variável sem vínculo (variável que não controla nada)', () => {
    const p = clonar(pacote) as KcxPacote;
    p.componentes[0].variaveis[0].vinculos = [];
    const r = validarPacote(p);
    expect(r.valido).toBe(false);
    expect(r.erros.some((e) => e.mensagem.includes('não controla nenhuma propriedade'))).toBe(true);
  });

  it('detecta referência quebrada na estrutura e valores inválidos em presets', () => {
    const p = clonar(pacote) as KcxPacote;
    p.componentes[0].estrutura.opacidade = { $var: 'naoExiste' };
    p.componentes[0].presets[0].valores = { primaryColor: 'azul' };
    const r = validarPacote(p);
    expect(r.erros.some((e) => e.mensagem.includes('naoExiste'))).toBe(true);
    expect(r.erros.some((e) => e.mensagem.includes('cor inválida'))).toBe(true);
  });

  it('bloqueia atributos de evento e custom properties fora do padrão', () => {
    const p = clonar(pacote) as KcxPacote;
    p.componentes[0].variaveis[0].vinculos = [
      { propriedade: 'x', alvo: { tipo: 'atributo', seletor: 'button', atributo: 'onclick' } },
      { propriedade: 'y', alvo: { tipo: 'css-var', nome: '--cor' } },
    ];
    const msgs = validarPacote(p)
      .erros.map((e) => e.mensagem)
      .join(' ');
    expect(msgs).toContain('on*');
    expect(msgs).toContain('--kcx-');
  });
});

describe('KCX — tipos de variável', () => {
  const v = (extra: Partial<KcxVariavel>): KcxVariavel => ({
    id: 'x',
    nome: 'x',
    tipo: 'float',
    padrao: 1,
    valor: 1,
    descricao: '',
    grupo: 'effects',
    secao: 'aparencia',
    vinculos: [{ propriedade: 'p', alvo: { tipo: 'css-var', nome: '--kcx-x' } }],
    exportavel: true,
    ...extra,
  });
  it('valida os 10 tipos', () => {
    expect(validarValor(v({ tipo: 'color' }), '#fff')).toEqual([]);
    expect(validarValor(v({ tipo: 'color' }), 'roxo')).toHaveLength(1);
    expect(validarValor(v({ tipo: 'number' }), 1.5)).toHaveLength(1);
    expect(validarValor(v({ tipo: 'float', min: 0, max: 1 }), 2)).toHaveLength(1);
    expect(validarValor(v({ tipo: 'boolean' }), 'sim')).toHaveLength(1);
    expect(validarValor(v({ tipo: 'string' }), 'ok')).toEqual([]);
    expect(
      validarValor(
        v({
          tipo: 'enum',
          opcoes: [
            { valor: 'a', rotulo: 'a' },
            { valor: 'b', rotulo: 'b' },
          ],
        }),
        'c',
      ),
    ).toHaveLength(1);
    expect(validarValor(v({ tipo: 'dimension' }), 12)).toEqual([]);
    expect(validarValor(v({ tipo: 'time' }), 'rápido')).toHaveLength(1);
    expect(
      validarValor(v({ tipo: 'gradient' }), { angulo: 0, paradas: [{ cor: '#000', posicao: 0 }] }),
    ).toHaveLength(1);
    expect(validarValor(v({ tipo: 'transform' }), { x: 0, y: 0, escala: 1, rotacao: 0 })).toEqual(
      [],
    );
  });
  it('normaliza valores de fora (limita, arredonda, recusa lixo)', () => {
    expect(normalizarValor(v({ min: 0, max: 2 }), 9)).toBe(2);
    expect(normalizarValor(v({ tipo: 'number', min: 0, max: 10 }), '3.7')).toBe(4);
    expect(normalizarValor(v({ padrao: 1 }), 'abc')).toBe(1);
    expect(normalizarValor(v({ tipo: 'boolean', padrao: false }), 'true')).toBe(true);
  });
  it('operações: mapear, dividir, converter, mapa, alpha', () => {
    const f = v({});
    expect(aplicarOperacoes(f, 1, [{ op: 'mapear', de: [0, 2], para: [0, 10] }])).toBe(5);
    expect(aplicarOperacoes(f, 2, [{ op: 'dividir', numerador: 240 }])).toBe(120);
    expect(aplicarOperacoes(v({ unidade: 'ms' }), 1500, [{ op: 'converter', para: 's' }])).toBe(
      1.5,
    );
    expect(aplicarOperacoes(f, 'a', [{ op: 'mapa', valores: { a: 'A' } }])).toBe('A');
    expect(aplicarOperacoes(f, '#ffffff', [{ op: 'alpha', valor: 0.5 }])).toBe('#ffffff80');
  });
});

describe('KCX — variáveis controlam o componente (critérios 1 a 4)', () => {
  const css = (c: KcxComponente, valores = {}) => resolverSaidas(c.variaveis, valores).cssVars;

  it('alterar a duração muda a duração real da animação', () => {
    expect(css(NEON_GLOW)['--kcx-neon-glow-duration']).toBe('2s');
    expect(css(NEON_GLOW, { pulseDuration: 4.5 })['--kcx-neon-glow-duration']).toBe('4.5s');
    expect(NEON_GLOW.codigo.css).toContain(
      'calc(var(--kcx-neon-glow-duration) / var(--kcx-neon-glow-speed))',
    );
  });

  it('alterar a cor muda a aparência real', () => {
    expect(css(NEON_GLOW, { primaryColor: '#00ff00' })['--kcx-neon-glow-primary']).toBe('#00ff00');
    expect(css(ANIMATED_GRADIENT_KCX)['--kcx-animated-gradient-image']).toBe(
      'linear-gradient(120deg, #ff2bd6 0%, #8b5cf6 50%, #22e3ff 100%)',
    );
  });

  it('a intensidade é uma variável vinculada a 4 propriedades', () => {
    const baixa = css(NEON_GLOW, { glowIntensity: 0.2 });
    const alta = css(NEON_GLOW, { glowIntensity: 1.8 });
    for (const k of ['layer-alpha', 'filter', 'reach', 'inner']) {
      expect(Number.parseFloat(alta[`--kcx-neon-glow-${k}`])).toBeGreaterThan(
        Number.parseFloat(baixa[`--kcx-neon-glow-${k}`]),
      );
    }
    expect(alta['--kcx-neon-glow-reach']).toBe('43.2px'); // 1.8 × 24px
  });

  it('a velocidade controla a duração e as transições', () => {
    expect(css(NEON_GLOW, { speed: 2 })['--kcx-neon-glow-transition']).toBe('120ms');
    expect(css(NEON_GLOW, { speed: 2 })['--kcx-neon-glow-speed']).toBe('2');
  });

  it('atraso em ms vira segundos no CSS; enum e boolean viram valores CSS', () => {
    const s = css(ANIMATED_GRADIENT_KCX, {
      delay: 1500,
      easing: 'linear',
      loop: false,
      autoplay: false,
    });
    expect(s['--kcx-animated-gradient-delay']).toBe('1.5s');
    expect(s['--kcx-animated-gradient-easing']).toBe('linear');
    expect(s['--kcx-animated-gradient-iterations']).toBe('1');
    expect(s['--kcx-animated-gradient-play']).toBe('paused');
  });

  it('a forma troca o atributo d e o offset-path ao mesmo tempo', () => {
    const s = resolverSaidas(SVG_MOTION.variaveis, { shape: 'zigue' });
    expect(s.atributos[0].valor).toContain('L 80 30');
    expect(s.cssVars['--kcx-svg-motion-path']).toContain('path("M 10 130');
  });

  it('textos vão para o textContent', () => {
    expect(resolverSaidas(NEON_GLOW.variaveis, { label: 'Gravando' }).textos).toEqual([
      { seletor: '.kcx-neon-glow__rotulo', valor: 'Gravando' },
    ]);
  });

  it('toda custom property calculada é usada no CSS do componente (nada decorativo)', () => {
    for (const c of KCX_COMPONENTES) {
      for (const nome of Object.keys(css(c)))
        expect(c.codigo.css, `${c.id}: ${nome}`).toContain(`var(${nome})`);
    }
  });

  it('nenhuma combinação aleatória de valores gera NaN, Infinity ou undefined', () => {
    const r = semente(42);
    for (const c of KCX_COMPONENTES) {
      for (let i = 0; i < 200; i++) {
        const valores = Object.fromEntries(c.variaveis.map((v) => [v.id, aleatorio(v, r)]));
        const s = resolverSaidas(c.variaveis, valores as never);
        for (const [k, val] of Object.entries(s.cssVars))
          expect(val, `${c.id} ${k}`).not.toMatch(/NaN|Infinity|undefined/);
      }
    }
  });
});

describe('KCX — sincronização código ↔ variáveis', () => {
  it('o bloco :root editado à mão volta para as variáveis', () => {
    const bloco = blocoRoot(resolverSaidas(NEON_GLOW.variaveis)).replace(
      '--kcx-neon-glow-blur: 14px',
      '--kcx-neon-glow-blur: 30px',
    );
    const r = lerBlocoRoot(bloco, NEON_GLOW.variaveis);
    expect(r.valores['blur']).toBe(30);
    expect(r.ignoradas).toContain('glowIntensity'); // vinculada com fórmula: só pelo controle
  });
  it('valor inválido no código é recusado', () => {
    const bloco = ':root { --kcx-neon-glow-blur: 999px; }';
    expect(lerBlocoRoot(bloco, NEON_GLOW.variaveis).erros[0]).toContain('máximo');
  });
});

describe('KCX — runtime standalone = resolver TypeScript', () => {
  it('o mesmo cálculo em JS puro dá o mesmo resultado para 300 combinações', () => {
    const r = semente(7);
    for (const c of KCX_COMPONENTES) {
      const codigo = runtimeStandalone(c.id, c.variaveis);
      new Function(codigo)();
      const api = (
        window as unknown as { KCX: Record<string, { resolve: (v: object) => unknown }> }
      ).KCX[c.id];
      for (let i = 0; i < 100; i++) {
        const valores = Object.fromEntries(c.variaveis.map((v) => [v.id, aleatorio(v, r)]));
        expect(api.resolve(valores)).toEqual(resolverSaidas(c.variaveis, valores as never));
      }
    }
  });
  it('KCX.set aplica na hora no documento (sem recarregar)', async () => {
    document.body.innerHTML = '<span class="kcx-neon-glow__rotulo">Ao vivo</span>';
    new Function(runtimeStandalone('neon-glow', NEON_GLOW.variaveis))();
    const kcx = (window as unknown as { KCX: { set: (k: string, v: unknown) => void } }).KCX;
    kcx.set('blur', 33);
    kcx.set('label', 'Gravando');
    expect(document.documentElement.style.getPropertyValue('--kcx-neon-glow-blur')).toBe('33px');
    expect(document.querySelector('.kcx-neon-glow__rotulo')!.textContent).toBe('Gravando');
    kcx.set('blur', 999); // fora do intervalo: limitado ao máximo
    expect(document.documentElement.style.getPropertyValue('--kcx-neon-glow-blur')).toBe('40px');
  });
});

describe('KCX — versionamento e ida e volta', () => {
  it('atualização mantém personalizações e informa mudanças', () => {
    const novo = clonar(NEON_GLOW);
    novo.versao = '1.1.0';
    novo.variaveis = novo.variaveis.filter((v) => v.id !== 'hoverBoost');
    novo.variaveis.find((v) => v.id === 'blur')!.max = 20;
    const r = mesclarAtualizacao(novo, { primaryColor: '#123456', blur: 35, hoverBoost: 1.2 });
    expect(r.valores['primaryColor']).toBe('#123456');
    expect(r.mantidas).toContain('primaryColor');
    expect(r.ajustadas).toEqual(['blur']);
    expect(r.valores['blur']).toBe(20);
    expect(r.removidas).toEqual(['hoverBoost']);
    expect(r.novas.length).toBeGreaterThan(0);
  });
  it('compara valores vindos do Figma sem aplicar nada', () => {
    const atuais = valoresPadrao(NEON_GLOW.variaveis);
    const r = compararValores(NEON_GLOW.variaveis, atuais, {
      primaryColor: '#000000',
      blur: 14,
      outra: 1,
      radius: 99,
    });
    expect(r.diferencas.map((d) => d.variavel)).toEqual(['primaryColor', 'radius']);
    expect(r.diferencas[1].valido).toBe(false);
    expect(r.desconhecidas).toEqual(['outra']);
    expect(atuais['primaryColor']).toBe('#ff2bd6');
  });
});

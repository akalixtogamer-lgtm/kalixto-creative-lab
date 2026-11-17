import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { Valores } from '../models/demo.model';
import { CATEGORIAS } from './categorias';
import { CATALOGO, EFFECT_REGISTRY, demosSemCategoria, findKit } from './registry';
import { CSP_PREVIEW, SANDBOX_PREVIEW, montarDocumento } from './sandbox';
import { EFFECTS } from '../data/effects.data';

const padrao = (id: string): Valores =>
  Object.fromEntries(findKit(id)!.params.map((p) => [p.id, p.padrao]));

describe('Efeitos · registro e fichas', () => {
  it('tem as 15 categorias do mapa, com ids únicos', () => {
    expect(CATEGORIAS.length).toBe(15);
    expect(new Set(CATEGORIAS.map((c) => c.id)).size).toBe(15);
  });

  it('ids dos kits são únicos e em kebab-case', () => {
    const ids = EFFECT_REGISTRY.map((k) => k.ficha.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it('entrega os 10 efeitos da Fase 1', () => {
    expect(EFFECT_REGISTRY.map((k) => k.ficha.id).sort()).toEqual(
      [
        'animated-border',
        'animated-gradient',
        'button-hover',
        'card-tilt',
        'fade-in',
        'glow-button',
        'magnetic-button',
        'scale-reveal',
        'slide-in',
        'text-reveal',
      ].sort(),
    );
  });

  for (const kit of EFFECT_REGISTRY) {
    const f = kit.ficha;
    describe(f.id, () => {
      it('ficha completa (nenhum campo obrigatório vazio)', () => {
        const textos = [
          f.nomeTecnico, f.nomeAmigavel, f.subcategoria, f.descricao, f.objetivoVisual,
          f.alternativa, f.compatibilidade, f.responsividade, f.acessibilidade, f.performance,
        ];
        for (const t of textos) expect(t.trim().length).toBeGreaterThan(3);
        for (const l of [f.aplicacoes, f.tecnologias, f.interacoes, f.tags, f.explicacao, f.limitacoes, f.referencias]) {
          expect(l.length).toBeGreaterThan(0);
        }
        expect(CATEGORIAS.some((c) => c.id === f.categoria)).toBe(true);
        expect(f.validadoEm).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        for (const r of f.referencias) expect(r.url).toMatch(/^https:\/\//);
      });

      it('valores padrão respeitam os limites e o passo de cada controle', () => {
        for (const p of kit.params) {
          if (p.tipo === 'range') {
            expect(p.padrao).toBeGreaterThanOrEqual(p.min);
            expect(p.padrao).toBeLessThanOrEqual(p.max);
            const passos = (p.padrao - p.min) / p.passo;
            expect(Math.abs(passos - Math.round(passos))).toBeLessThan(1e-6);
          } else {
            expect(p.opcoes.some((o) => o.valor === p.padrao)).toBe(true);
          }
        }
      });

      it('gera HTML, CSS e JS sem valores quebrados', () => {
        const c = kit.gerar(padrao(f.id));
        for (const parte of [c.html, c.css, c.js]) {
          expect(parte.length).toBeGreaterThan(0);
          expect(parte).not.toMatch(/undefined|NaN|\[object Object\]/);
        }
      });

      it('todo controle muda o código gerado (nenhum controle decorativo)', () => {
        const base = padrao(f.id);
        const original = JSON.stringify(kit.gerar(base));
        for (const p of kit.params) {
          const outro =
            p.tipo === 'range'
              ? p.padrao === p.max ? p.min : p.max
              : p.opcoes.find((o) => o.valor !== p.padrao)!.valor;
          // controles que só aparecem com outra opção ligada (ex.: velocidade do pulso)
          const alterado = JSON.stringify(kit.gerar({ ...base, [p.id]: outro }));
          expect(alterado, `controle "${p.id}" não altera o código`).not.toBe(original);
        }
      });

      it('respeita prefers-reduced-motion no CSS ou no JS', () => {
        const c = kit.gerar(padrao(f.id));
        expect(`${c.css}\n${c.js}`).toContain('prefers-reduced-motion');
      });
    });
  }

  it('toda demo dos laboratórios tem categoria no mapa', () => {
    expect(demosSemCategoria()).toEqual([]);
  });

  it('o catálogo reúne kits e demos sem chaves repetidas', () => {
    expect(CATALOGO.length).toBe(EFFECT_REGISTRY.length + EFFECTS.length);
    expect(new Set(CATALOGO.map((i) => i.chave)).size).toBe(CATALOGO.length);
  });
});

describe('Efeitos · documento isolado (sandbox)', () => {
  const c = findKit('fade-in')!.gerar(padrao('fade-in'));
  const doc = montarDocumento('Fade <x>', c);

  it('traz o CSP que bloqueia rede e o código completo do kit', () => {
    expect(CSP_PREVIEW).toContain("default-src 'none'");
    expect(doc).toContain(CSP_PREVIEW);
    expect(doc).toContain(c.css);
    expect(doc).toContain(c.html);
    expect(doc).toContain(c.js);
    expect(doc).not.toContain('<x>');
  });

  it('não deixa o código fechar a tag <script> antes da hora', () => {
    const d = montarDocumento('t', { html: '', css: '', js: 'const s = "</script><b>";' });
    expect(d.match(/<\/script>/g)?.length).toBe(1);
  });

  it('sandbox só com allow-scripts (sem allow-same-origin)', () => {
    expect(SANDBOX_PREVIEW).toBe('allow-scripts');
  });
});

describe('Efeitos · páginas', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes, withComponentInputBinding())],
    });
    harness = await RouterTestingHarness.create();
  });

  it('abre a ficha de um efeito por link direto', async () => {
    await harness.navigateByUrl('/efeitos/magnetic-button');
    const el = harness.routeNativeElement!;
    expect(el.querySelector('h1')?.textContent).toContain('Botão magnético');
    expect(el.textContent).toContain('Ficha técnica');
    const frame = el.querySelector('iframe')!;
    expect(frame.getAttribute('sandbox')).toBe(SANDBOX_PREVIEW);
    expect(el.querySelectorAll('[role="tab"]').length).toBe(3);
  });

  it('mostra aviso quando o efeito não existe', async () => {
    await harness.navigateByUrl('/efeitos/nao-existe');
    expect(harness.routeNativeElement?.textContent).toContain('Efeito não encontrado');
  });

  it('a Biblioteca lista kits e demos e filtra por categoria da URL', async () => {
    await harness.navigateByUrl('/biblioteca');
    expect(harness.routeNativeElement?.textContent).toContain(`${CATALOGO.length} efeito(s) encontrado(s)`);
    await harness.navigateByUrl('/biblioteca?categoria=tipografia');
    const total = CATALOGO.filter((i) => i.categoria === 'tipografia').length;
    expect(harness.routeNativeElement?.textContent).toContain(`${total} efeito(s) encontrado(s)`);
  });

  it('/efeitos sem id leva para a Biblioteca', async () => {
    await harness.navigateByUrl('/efeitos');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain('Biblioteca');
  });
});

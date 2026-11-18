import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { EFFECTS } from '../../core/data/effects.data';
import { GLOSSARIO, arquivoDoTermo, letraDe } from '../../core/efeitos/glossario';
import { EFFECT_REGISTRY, findKit } from '../../core/efeitos/registry';

describe('Glossário A–Z · dados', () => {
  it('tem todos os efeitos e todas as demos prontas, sem chaves repetidas', () => {
    const efeitos = GLOSSARIO.filter((e) => e.tipo === 'efeito');
    const demos = GLOSSARIO.filter((e) => e.tipo === 'demo');
    expect(efeitos.length).toBe(EFFECT_REGISTRY.length);
    expect(demos.length).toBe(EFFECTS.filter((e) => e.implementado && e.demoId).length);
    expect(new Set(GLOSSARIO.map((e) => e.chave)).size).toBe(GLOSSARIO.length);
  });

  it('reúne os termos de código dos kits (um termo repetido vira uma entrada)', () => {
    const termos = GLOSSARIO.filter((e) => e.tipo === 'termo');
    expect(termos.length).toBeGreaterThan(50);
    const sticky = termos.find((t) => t.nome === 'position: sticky');
    expect(sticky?.links.length).toBeGreaterThan(1);
  });

  it('está em ordem alfabética e cada item tem letra e link', () => {
    for (const e of GLOSSARIO) {
      expect(e.letra).toMatch(/^[A-Z#]$/);
      expect(e.links.length).toBeGreaterThan(0);
    }
    expect(letraDe('-webkit-text-stroke')).toBe('W');
    expect(letraDe('Ágil')).toBe('A');
  });

  it('efeitos levam à página do efeito e ao Code Lab; demos levam ao laboratório', () => {
    const e = GLOSSARIO.find((i) => i.chave === 'efeito:lens-focus')!;
    expect(e.links[0].rota).toEqual(['/efeitos', 'lens-focus']);
    expect(e.links[1].fragmento).toBe('ef-codigo');
    const d = GLOSSARIO.find((i) => i.tipo === 'demo')!;
    expect(d.links[0].rota[0]).toBe('/labs');
    expect(d.links[0].query?.['demo']).toBeTruthy();
  });

  it('termo abre a aba do arquivo onde ele aparece', () => {
    expect(arquivoDoTermo(findKit('lens-focus')!, 'mask-image')).toBe('css');
    expect(arquivoDoTermo(findKit('kinetic-captions')!, 'replaceChildren')).toBe('js');
  });
});

describe('Glossário A–Z · página', () => {
  let harness: RouterTestingHarness;
  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes, withComponentInputBinding())] });
    harness = await RouterTestingHarness.create();
  });

  it('lista tudo e filtra pela busca da URL', async () => {
    await harness.navigateByUrl('/glossario');
    const el = harness.routeNativeElement!;
    expect(el.querySelector('h1')?.textContent).toContain('Glossário');
    expect(el.textContent).toContain(`${GLOSSARIO.length} item(ns) encontrado(s)`);
    await harness.navigateByUrl('/glossario?q=lente');
    expect(harness.routeNativeElement!.textContent).toContain('Lente de foco');
    expect(harness.routeNativeElement!.textContent).not.toContain(`${GLOSSARIO.length} item(ns)`);
  });

  it('filtra por tipo', async () => {
    await harness.navigateByUrl('/glossario');
    const el = harness.routeNativeElement!;
    ([...el.querySelectorAll('.gl__tipo')].find((b) => b.textContent?.includes('Termos')) as HTMLButtonElement).click();
    harness.detectChanges();
    const total = GLOSSARIO.filter((e) => e.tipo === 'termo').length;
    expect(el.textContent).toContain(`${total} item(ns) encontrado(s)`);
  });

  it('?arquivo=css abre o Code Lab na aba CSS', async () => {
    await harness.navigateByUrl('/efeitos/lens-focus?arquivo=css');
    const aba = harness.routeNativeElement!.querySelector('#cl-aba-css');
    expect(aba?.getAttribute('aria-selected')).toBe('true');
  });
});

import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { SCROLL_DEMOS } from '../../core/data/scroll-demos.data';

/** Testes funcionais do Laboratório 03 — Scroll Lab (Fase 2). */
describe('Scroll Lab', () => {
  let harness: RouterTestingHarness;
  const el = () => harness.routeNativeElement as HTMLElement;
  const codigo = () => el().querySelector('.cv__codigo')?.textContent ?? '';

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes, withComponentInputBinding())],
    });
    harness = await RouterTestingHarness.create();
  });

  it('abre com todas as demos e janela de rolagem', async () => {
    await harness.navigateByUrl('/labs/scroll');
    expect(el().querySelector('h1')?.textContent).toContain('Scroll Lab');
    expect(el().querySelectorAll('.pg__demo-btn').length).toBe(SCROLL_DEMOS.length);
    expect(el().querySelector('.s-rolagem')).toBeTruthy();
    expect(codigo()).toContain('ScrollTrigger');
  });

  it.each(SCROLL_DEMOS.map((d) => d.id))('abre a demo "%s" pela URL', async (id) => {
    await harness.navigateByUrl(`/labs/scroll?demo=${id}`);
    const demo = SCROLL_DEMOS.find((d) => d.id === id)!;
    expect(el().querySelector('#demo-titulo')?.textContent).toContain(demo.titulo);
    expect(el().querySelector('.s-rolagem')?.children.length).toBeGreaterThan(0);
  });

  it('horizontal: o número de painéis segue o controle', async () => {
    await harness.navigateByUrl('/labs/scroll?demo=horizontal');
    const sel = el().querySelector<HTMLSelectElement>('#p-paineis')!;
    sel.value = '5';
    sel.dispatchEvent(new Event('change'));
    harness.detectChanges();
    expect(el().querySelectorAll('.s-paineltz').length).toBe(5);
    expect(codigo()).toBeTruthy();
  });

  it('presets trocam os valores e o código', async () => {
    await harness.navigateByUrl('/labs/scroll?demo=scrub');
    const preset = [...el().querySelectorAll<HTMLButtonElement>('.presets__chip')].find((b) =>
      b.textContent?.includes('Manteiga'),
    )!;
    preset.click();
    harness.detectChanges();
    expect(codigo()).toContain('scrub: 2');
    expect(codigo()).toContain('rotation: 720');
  });
});

describe('Scroll Lab · Navbar ao rolar', () => {
  it('mostra navbar e hero, e o código muda para o modo "esconde"', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes, withComponentInputBinding())],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/labs/scroll?demo=navbar');
    const el = harness.routeNativeElement as HTMLElement;
    expect(el.querySelector('.s-nav')).toBeTruthy();
    expect(el.querySelector('.s-hero')).toBeTruthy();
    const sel = el.querySelector<HTMLSelectElement>('#p-comportamento')!;
    sel.value = 'esconde';
    sel.dispatchEvent(new Event('change'));
    harness.detectChanges();
    expect(el.querySelector('.cv__codigo')?.textContent).toContain('self.direction');
  });
});

import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { DIVISORES_SVG, UI_DEMOS, svgDivisor } from '../../core/data/ui-demos.data';

/** Testes do Laboratório 07 — Interface Lab. */
describe('Interface Lab', () => {
  let harness: RouterTestingHarness;
  const el = () => harness.routeNativeElement as HTMLElement;
  const codigo = () => el().querySelector('.cv__codigo')?.textContent ?? '';
  const escolher = (id: string, valor: string) => {
    const s = el().querySelector<HTMLSelectElement>(`#p-${id}`)!;
    s.value = valor;
    s.dispatchEvent(new Event('change'));
    harness.detectChanges();
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes, withComponentInputBinding())] });
    harness = await RouterTestingHarness.create();
  });

  it('abre com todas as demos', async () => {
    await harness.navigateByUrl('/labs/ui');
    expect(el().querySelector('h1')?.textContent).toContain('Interface Lab');
    expect(el().querySelectorAll('.pg__demo-btn').length).toBe(UI_DEMOS.length);
  });

  it.each(UI_DEMOS.map((d) => d.id))('abre a demo "%s"', async (id) => {
    await harness.navigateByUrl(`/labs/ui?demo=${id}`);
    expect(el().querySelector('#demo-titulo')?.textContent).toContain(UI_DEMOS.find((d) => d.id === id)!.titulo);
    expect(el().querySelector('.palco')?.children.length).toBeGreaterThan(0);
  });

  it('divisores: todas as formas têm caminho válido e o palco desenha as camadas', async () => {
    for (const [id, d] of Object.entries(DIVISORES_SVG)) {
      expect(d.camadas.length, id).toBeGreaterThan(0);
      d.camadas.forEach((c) => expect(c.d, id).toMatch(/^M[\d.,\sLQTCAZ-]+Z$/));
    }
    await harness.navigateByUrl('/labs/ui?demo=divisores-svg');
    escolher('forma', 'montanhas');
    expect(el().querySelectorAll('.u-divs__svg path').length).toBe(3);
    expect(codigo()).toContain('opacity="0.3"');
  });

  it('divisores: inverter e espelhar entram no código', () => {
    const svg = svgDivisor({ forma: 'livro', altura: 120, inverter: 'true', espelhar: 'true' });
    expect(svg).toContain('scaleY(-1) scaleX(-1)');
    expect(svg).toContain('height: 120px');
  });

  it('bento: trocar o layout muda as áreas da grade', async () => {
    await harness.navigateByUrl('/labs/ui?demo=bento');
    escolher('layout', 'mosaico');
    expect(el().querySelector<HTMLElement>('.u-bento')!.style.gridTemplateAreas).toContain('"a b c"');
  });

  it('tipografia: o código acompanha o estilo', async () => {
    await harness.navigateByUrl('/labs/ui?demo=tipografia-vazada');
    escolher('estilo', 'preenche');
    expect(codigo()).toContain('background-clip: text');
    expect(el().querySelector('.u-tipo')?.classList).toContain('u-tipo--preenche');
  });
});

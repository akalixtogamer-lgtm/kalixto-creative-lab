import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { GLSL_DEMOS, SHADERS } from '../../core/data/glsl-demos.data';
import { valoresPadrao } from '../../core/models/demo.model';

/** Testes do Laboratório 06 — WebGL & GLSL (os shaders são conferidos no navegador). */
describe('WebGL & GLSL', () => {
  let harness: RouterTestingHarness;
  const el = () => harness.routeNativeElement as HTMLElement;
  const codigo = () => el().querySelector('.cv__codigo')?.textContent ?? '';

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes, withComponentInputBinding())] });
    harness = await RouterTestingHarness.create();
  });

  it('abre com 7 demos e mostra o código GLSL', async () => {
    await harness.navigateByUrl('/labs/webgl');
    expect(el().querySelector('h1')?.textContent).toContain('WebGL');
    expect(el().querySelectorAll('.pg__demo-btn').length).toBe(7);
    expect(codigo()).toContain('gl_FragColor');
  });

  it.each(GLSL_DEMOS.map((d) => d.id))('demo "%s": todo uniform usado pelos controles existe no shader', (id) => {
    const s = SHADERS[id];
    const demo = GLSL_DEMOS.find((d) => d.id === id)!;
    const fonte = s.vertex + s.fragment;
    for (const nome of Object.keys(s.uniforms(valoresPadrao(demo)))) {
      expect(fonte, `uniform ${nome} em ${id}`).toContain(`uniform `);
      expect(fonte).toMatch(new RegExp(`uniform \\w+ ${nome};`));
    }
  });

  it('o código do Code Viewer acompanha o controle', async () => {
    await harness.navigateByUrl('/labs/webgl?demo=glsl');
    const r = el().querySelector<HTMLInputElement>('#p-aneis')!;
    r.value = '20';
    r.dispatchEvent(new Event('input'));
    harness.detectChanges();
    expect(codigo()).toContain('uAneis: { value: 20 }');
  });
});

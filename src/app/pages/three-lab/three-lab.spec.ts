import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { THREE_DEMOS } from '../../core/data/three-demos.data';
import { ProgressoService } from '../../core/services/progresso.service';

/**
 * Testes do Laboratório 05 — Three.js Lab.
 * O ambiente de testes (jsdom) não tem WebGL: aqui validamos a página,
 * os dados, o código e a mensagem alternativa. As cenas 3D são
 * conferidas no navegador (ver docs/QA.md).
 */
describe('Three.js Lab', () => {
  let harness: RouterTestingHarness;
  const el = () => harness.routeNativeElement as HTMLElement;
  const codigo = () => el().querySelector('.cv__codigo')?.textContent ?? '';

  beforeEach(async () => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter(routes, withComponentInputBinding())] });
    harness = await RouterTestingHarness.create();
  });

  it('abre com 9 demos e avisa quando não há WebGL', async () => {
    await harness.navigateByUrl('/labs/three');
    expect(el().querySelector('h1')?.textContent).toContain('Three.js Lab');
    expect(el().querySelectorAll('.pg__demo-btn').length).toBe(9);
    expect(el().textContent).toContain('não conseguiu ativar o WebGL');
  });

  it.each(THREE_DEMOS.map((d) => d.id))('abre a demo "%s" com código Three.js', async (id) => {
    await harness.navigateByUrl(`/labs/three?demo=${id}`);
    expect(el().querySelector('#demo-titulo')?.textContent).toContain(THREE_DEMOS.find((d) => d.id === id)!.titulo);
    expect(codigo().length).toBeGreaterThan(40);
  });

  it('o código acompanha a geometria escolhida', async () => {
    await harness.navigateByUrl('/labs/three?demo=geometria');
    const sel = el().querySelector<HTMLSelectElement>('#p-forma')!;
    sel.value = 'no';
    sel.dispatchEvent(new Event('change'));
    harness.detectChanges();
    expect(codigo()).toContain('TorusKnotGeometry');
  });

  it('demos ao vivo não têm botão Executar e contam como feitas ao mexer', async () => {
    await harness.navigateByUrl('/labs/three?demo=mouse');
    expect(el().querySelector('.pg__toolbar .kx-btn--primary')).toBeNull();
    const r = el().querySelector<HTMLInputElement>('#p-intensidade')!;
    r.value = '1';
    r.dispatchEvent(new Event('input'));
    harness.detectChanges();
    expect(TestBed.inject(ProgressoService).foiExecutada('three', 'mouse')).toBe(true);
  });

  it('desafio de demo ao vivo conclui sozinho quando os valores batem', async () => {
    await harness.navigateByUrl('/labs/three?demo=raycasting');
    const sel = el().querySelector<HTMLSelectElement>('#p-cor')!;
    sel.value = '#f5f3ff';
    sel.dispatchEvent(new Event('change'));
    const r = el().querySelector<HTMLInputElement>('#p-escala')!;
    r.value = '1.6';
    r.dispatchEvent(new Event('input'));
    harness.detectChanges();
    await harness.fixture.whenStable();
    expect(TestBed.inject(ProgressoService).desafioConcluido('three', 'raycasting')).toBe(true);
  });
});

import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { gsap } from 'gsap';
import { routes } from '../../app.routes';
import { GSAP_DEMOS } from '../../core/data/gsap-demos.data';

/** Testes funcionais do Laboratório 02 — GSAP Studio (Fase 2). */
describe('GSAP Studio', () => {
  let harness: RouterTestingHarness;
  const el = () => harness.routeNativeElement as HTMLElement;
  const codigo = () => el().querySelector('.cv__codigo')?.textContent ?? '';
  const clicar = (texto: string) => {
    const b = [...el().querySelectorAll('button')].find((x) => x.textContent?.includes(texto));
    b!.click();
    harness.detectChanges();
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes, withComponentInputBinding())] });
    harness = await RouterTestingHarness.create();
  });

  it('abre na primeira demo com todas as demos no seletor', async () => {
    await harness.navigateByUrl('/labs/gsap');
    expect(el().querySelector('h1')?.textContent).toContain('GSAP Studio');
    expect(el().querySelectorAll('.pg__demo-btn').length).toBe(GSAP_DEMOS.length);
    expect(codigo()).toContain('gsap.to(".caixa"');
  });

  it.each(GSAP_DEMOS.map((d) => d.id))('abre a demo "%s" pela URL', async (id) => {
    await harness.navigateByUrl(`/labs/gsap?demo=${id}`);
    const demo = GSAP_DEMOS.find((d) => d.id === id)!;
    expect(el().querySelector('#demo-titulo')?.textContent).toContain(demo.titulo);
    expect(el().querySelector('.palco')?.children.length).toBeGreaterThan(0);
  });

  it('o código acompanha os controles', async () => {
    await harness.navigateByUrl('/labs/gsap?demo=to');
    const x = el().querySelector<HTMLInputElement>('#p-x')!;
    x.value = '100';
    x.dispatchEvent(new Event('input'));
    harness.detectChanges();
    expect(codigo()).toContain('x: 100');
  });

  it('Executar em from() aplica o estado inicial na hora', async () => {
    await harness.navigateByUrl('/labs/gsap?demo=from');
    clicar('Executar entrada');
    const titulo = el().querySelector<HTMLElement>('.g-titulo')!;
    expect(Number(titulo.style.opacity)).toBeLessThan(1);
  });

  it('Reiniciar desfaz a animação (sem estilos do GSAP)', async () => {
    await harness.navigateByUrl('/labs/gsap?demo=from');
    clicar('Executar entrada');
    clicar('Reiniciar');
    expect(el().querySelector<HTMLElement>('.g-titulo')!.style.opacity).toBe('');
  });

  it('easing: a curva muda com o tipo escolhido', async () => {
    await harness.navigateByUrl('/labs/gsap?demo=easing');
    const caminho = () => el().querySelector('.g-curva-linha')?.getAttribute('d');
    const antes = caminho();
    const tipo = el().querySelector<HTMLSelectElement>('#p-tipo')!;
    tipo.value = 'bounce';
    tipo.dispatchEvent(new Event('change'));
    harness.detectChanges();
    expect(caminho()).not.toBe(antes);
    expect(codigo()).toContain('bounce.out');
  });

  it('player: a barra de progresso controla a timeline', async () => {
    await harness.navigateByUrl('/labs/gsap?demo=reproducao');
    await harness.fixture.whenStable();
    const barra = el().querySelector<HTMLInputElement>('.g-player__progresso input')!;
    barra.value = '0.5';
    barra.dispatchEvent(new Event('input'));
    harness.detectChanges();
    expect(el().querySelector('.g-player__progresso output')?.textContent).toContain('50%');
    expect(gsap.getProperty(el().querySelector('.g-card')!, 'x')).not.toBe(0);
  });
});

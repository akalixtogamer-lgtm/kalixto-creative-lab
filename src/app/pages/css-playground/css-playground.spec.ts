import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { CSS_DEMOS } from '../../core/data/css-demos.data';

/** Testes funcionais do Laboratório 01 — CSS Playground (Fase 2). */
describe('CSS Playground', () => {
  let harness: RouterTestingHarness;
  const el = () => harness.routeNativeElement as HTMLElement;
  const codigo = () => el().querySelector('.cv__codigo')?.textContent ?? '';
  const botao = (texto: string) =>
    [...el().querySelectorAll('button')].find((b) => b.textContent?.includes(texto)) as HTMLButtonElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes, withComponentInputBinding())] });
    harness = await RouterTestingHarness.create();
  });

  it('abre na primeira demo com código e controles', async () => {
    await harness.navigateByUrl('/labs/css');
    expect(el().querySelector('h1')?.textContent).toContain('CSS Playground');
    expect(el().querySelector('#demo-titulo')?.textContent).toContain(CSS_DEMOS[0].titulo);
    expect(codigo()).toContain('transition');
    expect(el().querySelectorAll('.ctrl').length).toBe(CSS_DEMOS[0].params.length);
  });

  it('lista as 8 demos no seletor', async () => {
    await harness.navigateByUrl('/labs/css');
    expect(el().querySelectorAll('.pg__demo-btn').length).toBe(8);
  });

  it.each(CSS_DEMOS.map((d) => d.id))('abre a demo "%s" pela URL', async (id) => {
    await harness.navigateByUrl(`/labs/css?demo=${id}`);
    const demo = CSS_DEMOS.find((d) => d.id === id)!;
    expect(el().querySelector('#demo-titulo')?.textContent).toContain(demo.titulo);
    expect(el().querySelector('.palco')?.children.length).toBeGreaterThan(0);
  });

  it('o código acompanha o controle', async () => {
    await harness.navigateByUrl('/labs/css?demo=transitions');
    const range = el().querySelector<HTMLInputElement>('#p-dur')!;
    range.value = '1500';
    range.dispatchEvent(new Event('input'));
    harness.detectChanges();
    expect(codigo()).toContain('1500ms');
    expect(el().querySelector('output')?.textContent).toContain('1500ms');
  });

  it('Executar alterna o estado e Reiniciar volta ao padrão', async () => {
    await harness.navigateByUrl('/labs/css?demo=transitions');
    botao('Alternar estado').click();
    harness.detectChanges();
    expect(el().querySelector('.d-trans')?.classList).toContain('ativo');

    const range = el().querySelector<HTMLInputElement>('#p-dur')!;
    range.value = '1500';
    range.dispatchEvent(new Event('input'));
    botao('Reiniciar').click();
    harness.detectChanges();
    expect(el().querySelector('.d-trans')?.classList).not.toContain('ativo');
    expect(codigo()).toContain('600ms');
  });

  it('trocar o select muda o código (clip-path)', async () => {
    await harness.navigateByUrl('/labs/css?demo=clip-path');
    const select = el().querySelector<HTMLSelectElement>('#p-forma')!;
    select.value = 'cortina';
    select.dispatchEvent(new Event('change'));
    harness.detectChanges();
    expect(codigo()).toContain('inset(0 100% 0 0)');
  });

  it('microinteração: clicar no coração curte', async () => {
    await harness.navigateByUrl('/labs/css?demo=microinteracoes');
    el().querySelector<HTMLButtonElement>('.d-curtir')!.click();
    harness.detectChanges();
    expect(el().querySelector('.d-curtir')?.getAttribute('aria-pressed')).toBe('true');
    expect(el().textContent).toContain('129 curtidas');
  });

  it('a biblioteca leva direto para a demo', async () => {
    await harness.navigateByUrl('/biblioteca?lab=css');
    const link = el().querySelector<HTMLAnchorElement>('a.kx-card');
    expect(link?.getAttribute('href')).toContain('/labs/css?demo=');
  });
});

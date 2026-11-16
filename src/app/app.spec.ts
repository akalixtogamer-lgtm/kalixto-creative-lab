import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { LABS } from './core/data/labs.data';
import { EFFECTS } from './core/data/effects.data';

/**
 * Testes da Fase 1 — critério: aplicação executável,
 * arquitetura organizada e navegação funcional.
 */
describe('Fase 1 · Navegação', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes, withComponentInputBinding())],
    });
    harness = await RouterTestingHarness.create();
  });

  /** Texto de toda a tela (menu + página). */
  const texto = () => (harness.fixture.nativeElement as HTMLElement).textContent ?? '';

  it('abre o Dashboard na rota inicial', async () => {
    await harness.navigateByUrl('/');
    expect(texto()).toContain('CREATIVE LAB');
    expect(texto()).toContain('Laboratórios do MVP');
  });

  it('o menu lista todos os laboratórios', async () => {
    await harness.navigateByUrl('/');
    for (const lab of LABS) {
      expect(texto()).toContain(lab.titulo);
    }
  });

  it.each(LABS.map((l) => l.id))('abre a página do laboratório "%s"', async (id) => {
    await harness.navigateByUrl(`/labs/${id}`);
    const lab = LABS.find((l) => l.id === id)!;
    const h1 = harness.routeNativeElement?.querySelector('h1');
    expect(h1?.textContent).toContain(lab.titulo);
  });

  it('labs de Three.js e WebGL aparecem como bloqueados', async () => {
    await harness.navigateByUrl('/labs/three');
    expect(harness.routeNativeElement?.textContent).toContain('Laboratório bloqueado');
  });

  it('id de laboratório inválido mostra mensagem de não encontrado', async () => {
    await harness.navigateByUrl('/labs/nao-existe');
    expect(harness.routeNativeElement?.textContent).toContain('Laboratório não encontrado');
  });

  it('abre Biblioteca, Design System e Roadmap', async () => {
    await harness.navigateByUrl('/biblioteca');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain('Biblioteca');
    await harness.navigateByUrl('/design-system');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain('Design System');
    await harness.navigateByUrl('/roadmap');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain('Roadmap');
  });

  it('rota inexistente cai na página 404', async () => {
    await harness.navigateByUrl('/qualquer-coisa');
    expect(harness.routeNativeElement?.textContent).toContain('Página não encontrada');
  });

  it('biblioteca filtra pelo laboratório da URL (?lab=gsap)', async () => {
    await harness.navigateByUrl('/biblioteca?lab=gsap');
    const total = EFFECTS.filter((e) => e.labId === 'gsap').length;
    expect(harness.routeNativeElement?.textContent).toContain(`${total} efeito(s) encontrado(s)`);
  });
});

describe('Fase 1 · Dados', () => {
  it('ids de laboratórios e efeitos são únicos', () => {
    expect(new Set(LABS.map((l) => l.id)).size).toBe(LABS.length);
    expect(new Set(EFFECTS.map((e) => e.id)).size).toBe(EFFECTS.length);
  });

  it('todo efeito aponta para um laboratório existente', () => {
    for (const e of EFFECTS) {
      expect(LABS.some((l) => l.id === e.labId)).toBe(true);
    }
  });

  it('Three.js e WebGL não estão no MVP (regra do roadmap)', () => {
    for (const id of ['three', 'webgl']) {
      const lab = LABS.find((l) => l.id === id)!;
      expect(lab.fase).toBeGreaterThan(3);
      expect(lab.status).toBe('bloqueado');
    }
  });
});

import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../app.routes';
import { EXERCICIOS } from '../core/data/exercicios.data';
import { SVG_DEMOS } from '../core/data/svg-demos.data';
import { ProgressoService } from '../core/services/progresso.service';

/** Testes da Fase 3 — organização educacional. */
describe('Fase 3', () => {
  let harness: RouterTestingHarness;
  const el = () => harness.routeNativeElement as HTMLElement;
  const botao = (texto: string) =>
    [...el().querySelectorAll<HTMLButtonElement>('button')].find((b) =>
      b.textContent?.includes(texto),
    )!;

  beforeEach(async () => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter(routes, withComponentInputBinding())],
    });
    harness = await RouterTestingHarness.create();
  });

  describe('SVG Lab', () => {
    it.each(SVG_DEMOS.map((d) => d.id))('abre a demo "%s"', async (id) => {
      await harness.navigateByUrl(`/labs/svg?demo=${id}`);
      expect(el().querySelector('#demo-titulo')?.textContent).toContain(
        SVG_DEMOS.find((d) => d.id === id)!.titulo,
      );
      expect(el().querySelector('.palco svg')).toBeTruthy();
    });
  });

  describe('Progresso e desafios', () => {
    it('Executar marca a demo como feita e salva no navegador', async () => {
      await harness.navigateByUrl('/labs/css?demo=hover');
      botao('Simular hover').click();
      harness.detectChanges();
      expect(TestBed.inject(ProgressoService).foiExecutada('css', 'hover')).toBe(true);
      expect(localStorage.getItem('kalixto-lab:progresso:v1')).toContain('css:hover');
    });

    it('desafio conclui quando os valores batem e o usuário executa', async () => {
      await harness.navigateByUrl('/labs/css?demo=hover');
      const sel = el().querySelector<HTMLSelectElement>('#p-estilo')!;
      sel.value = 'preencher';
      sel.dispatchEvent(new Event('change'));
      const dur = el().querySelector<HTMLInputElement>('#p-dur')!;
      dur.value = '150';
      dur.dispatchEvent(new Event('input'));
      harness.detectChanges();
      expect(el().querySelector('.desafio')?.classList).toContain('is-pronto');
      botao('Simular hover').click();
      harness.detectChanges();
      expect(TestBed.inject(ProgressoService).desafioConcluido('css', 'hover')).toBe(true);
      expect(el().textContent).toContain('Desafio concluído');
    });

    it('presets do usuário são salvos e aparecem na lista', async () => {
      await harness.navigateByUrl('/labs/gsap?demo=to');
      const input = el().querySelector<HTMLInputElement>('#nome-preset')!;
      input.value = 'Meu giro';
      input.dispatchEvent(new Event('input'));
      harness.detectChanges();
      el().querySelector<HTMLFormElement>('.presets__salvar')!.dispatchEvent(new Event('submit'));
      harness.detectChanges();
      expect(el().textContent).toContain('★ Meu giro');
      expect(TestBed.inject(ProgressoService).presets('gsap', 'to')[0].nome).toBe('Meu giro');
    });
  });

  describe('Trilha', () => {
    it('mostra todos os laboratórios com demos e começa em 0%', async () => {
      await harness.navigateByUrl('/trilha');
      expect(el().querySelector('h1')?.textContent).toContain('Trilha');
      expect(el().querySelectorAll('.modulo').length).toBeGreaterThanOrEqual(4);
      expect(el().textContent).toContain('0%');
      expect(el().textContent).toContain('Começar');
    });

    it('zerar pede confirmação antes de apagar', async () => {
      TestBed.inject(ProgressoService).marcarExecutada('css', 'hover');
      await harness.navigateByUrl('/trilha');
      botao('Zerar progresso').click();
      harness.detectChanges();
      expect(TestBed.inject(ProgressoService).foiExecutada('css', 'hover')).toBe(true);
      botao('Clique de novo').click();
      harness.detectChanges();
      expect(TestBed.inject(ProgressoService).foiExecutada('css', 'hover')).toBe(false);
    });
  });

  describe('Exercícios', () => {
    it('corrige a resposta e mostra a explicação', async () => {
      await harness.navigateByUrl('/exercicios?lab=css');
      const q = EXERCICIOS.find((x) => x.labId === 'css')!;
      const alternativas = el()
        .querySelectorAll<HTMLButtonElement>('.questao')[0]
        .querySelectorAll('.alternativa');
      (alternativas[q.correta] as HTMLButtonElement).click();
      harness.detectChanges();
      expect(el().textContent).toContain('Correto!');
      expect(el().textContent).toContain(q.explicacao);
    });

    it('todas as questões têm alternativa correta válida', () => {
      for (const q of EXERCICIOS) {
        expect(q.correta).toBeGreaterThanOrEqual(0);
        expect(q.correta).toBeLessThan(q.alternativas.length);
      }
    });
  });

  describe('Comparador', () => {
    it('mostra a tabela e troca o código do efeito', async () => {
      await harness.navigateByUrl('/comparador');
      expect(el().querySelectorAll('tbody tr').length).toBe(6);
      botao('Sequência de 3').click();
      harness.detectChanges();
      expect(el().textContent).toContain('gsap.timeline()');
    });
  });
});

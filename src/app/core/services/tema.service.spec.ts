import { TestBed } from '@angular/core/testing';
import { CHAVE_TEMA, TemaService } from './tema.service';
import { TemaToggle } from '../../shared/components/tema-toggle/tema-toggle';

describe('Tema claro / escuro', () => {
  beforeEach(() => localStorage.removeItem(CHAVE_TEMA));

  it('alterna, aplica data-tema no <html> e salva a escolha', () => {
    const tema = TestBed.inject(TemaService);
    const inicial = tema.tema();
    TestBed.tick();
    expect(document.documentElement.dataset['tema']).toBe(inicial);
    tema.alternar();
    TestBed.tick();
    const novo = inicial === 'escuro' ? 'claro' : 'escuro';
    expect(document.documentElement.dataset['tema']).toBe(novo);
    expect(localStorage.getItem(CHAVE_TEMA)).toBe(novo);
  });

  it('o botão diz para qual modo vai e troca ao clicar', () => {
    const f = TestBed.createComponent(TemaToggle);
    f.detectChanges();
    const botao = (f.nativeElement as HTMLElement).querySelector('button')!;
    const antes = botao.getAttribute('aria-label');
    expect(antes).toMatch(/^Mudar para o modo (claro|escuro)$/);
    botao.click();
    f.detectChanges();
    expect(botao.getAttribute('aria-label')).not.toBe(antes);
  });
});

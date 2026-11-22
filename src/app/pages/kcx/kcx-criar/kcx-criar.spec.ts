import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { routes } from '../../../app.routes';
import { configPadrao, montarDoConstrutor, tipoConstrutor } from '../../../kcx/construtor';
import { KcxEstadoService } from '../kcx-estado.service';
import { KcxMeusService } from '../kcx-meus.service';

const IMAGEM = 'data:image/png;base64,iVBORw0KGgo=';

async function abrir(url: string) {
  TestBed.configureTestingModule({
    providers: [provideRouter(routes, withComponentInputBinding())],
  });
  const h = await RouterTestingHarness.create();
  await h.navigateByUrl(url);
  h.detectChanges();
  return h;
}

afterEach(() => localStorage.clear());

describe('Construtor · imagem enviada', () => {
  it('não trava a validação do formulário depois de enviar uma imagem', async () => {
    const h = await abrir('/kcx/criar?tipo=card-foto');
    const criar = h.fixture.debugElement.query((d) => d.nativeElement?.tagName === 'KX-KCX-CRIAR')
      .componentInstance as {
      mudar: (k: string, v: string) => void;
      cfg: () => { midia?: string };
    };
    criar.mudar('midia', IMAGEM);
    h.detectChanges();

    const el = h.fixture.nativeElement as HTMLElement;
    const url = el.querySelector('input[type="url"]') as HTMLInputElement;
    expect(url.value).toBe('');
    expect(url.validity.valid).toBe(true);
    expect((el.querySelector('form.kcxc__form') as HTMLFormElement).checkValidity()).toBe(true);
    expect(el.textContent).toContain('Imagem enviada ✓');

    // Sair do campo vazio não apaga a imagem enviada…
    url.dispatchEvent(new Event('change'));
    h.detectChanges();
    expect(criar.cfg().midia).toBe(IMAGEM);

    // …e colar um endereço troca a imagem.
    url.value = 'https://exemplo.com/foto.jpg';
    url.dispatchEvent(new Event('change'));
    h.detectChanges();
    expect(criar.cfg().midia).toBe('https://exemplo.com/foto.jpg');
  });
});

describe('Editar no construtor · valores salvos no editor', () => {
  it('textos alterados no construtor aparecem no editor e os outros ajustes continuam', () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    const meus = TestBed.inject(KcxMeusService);
    const estado = TestBed.inject(KcxEstadoService);

    const def = tipoConstrutor('card-foto')!;
    const cfg = configPadrao(def, 'Card teste');
    const v1 = montarDoConstrutor(cfg);
    expect(meus.salvar(v1)).toEqual([]);

    // O editor salva todos os valores atuais, com um ajuste de raio.
    const salvos = estado.valores(meus.buscar(v1.id)!);
    const raio = v1.variaveis.find((v) => v.tipo === 'dimension' || v.tipo === 'number')!;
    estado.salvar(v1, { ...salvos, [raio.id]: 33 });

    // Reaberto no construtor, o subtítulo muda.
    const v2 = montarDoConstrutor({
      ...cfg,
      textos: { ...cfg.textos, subtitulo: 'Glass Experience · camadas' },
    });
    expect(meus.salvar(v2)).toEqual([]);

    const depois = estado.valores(meus.buscar(v2.id)!);
    const sub = v2.variaveis.find((v) => v.valor === 'Glass Experience · camadas')!;
    expect(depois[sub.id]).toBe('Glass Experience · camadas');
    expect(depois[raio.id]).toBe(33);
  });
});

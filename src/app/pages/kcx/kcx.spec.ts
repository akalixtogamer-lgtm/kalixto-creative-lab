import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { KCX_COMPONENTES, NEON_GLOW } from '../../kcx/componentes';
import { RepositorioPresets } from '../../kcx/presets';
import { criarPacote, serializar } from '../../kcx/serializar';

function storageFalso(): Storage {
  const m = new Map<string, string>();
  return {
    get length() {
      return m.size;
    },
    clear: () => m.clear(),
    getItem: (k) => m.get(k) ?? null,
    key: (i) => [...m.keys()][i] ?? null,
    removeItem: (k) => void m.delete(k),
    setItem: (k, v) => void m.set(k, v),
  };
}

async function abrir(url: string) {
  TestBed.configureTestingModule({
    providers: [provideRouter(routes, withComponentInputBinding())],
  });
  const h = await RouterTestingHarness.create();
  await h.navigateByUrl(url);
  h.detectChanges();
  return h;
}

describe('KCX · presets do usuário', () => {
  it('cria, duplica, renomeia, edita, exporta, importa e exclui', () => {
    const r = new RepositorioPresets(storageFalso());
    const p = r.criar(NEON_GLOW, 'Meu neon', { primaryColor: '#123456', blur: 99, naoExiste: 1 });
    expect(p.valores).toEqual({ primaryColor: '#123456', blur: 40 }); // limitado e sem chaves desconhecidas
    const c = r.duplicar(NEON_GLOW, p);
    expect(c.nome).toBe('Meu neon (cópia)');
    r.renomear('neon-glow', c.id, 'Outro');
    r.atualizar(NEON_GLOW, c.id, { radius: 20 });
    expect(r.listar('neon-glow').map((x) => [x.nome, x.valores])).toEqual([
      ['Meu neon', { primaryColor: '#123456', blur: 40 }],
      ['Outro', { radius: 20 }],
    ]);
    const arquivo = JSON.stringify(r.exportar('neon-glow'));
    r.remover('neon-glow', p.id);
    r.remover('neon-glow', c.id);
    expect(r.listar('neon-glow')).toEqual([]);
    const imp = r.importar(NEON_GLOW, arquivo);
    expect(imp.importados).toHaveLength(2);
    expect(
      r.importar(NEON_GLOW, '{"formato":"kcx-presets","componente":"svg-motion","presets":[]}')
        .erros[0],
    ).toContain('svg-motion');
  });
});

describe('KCX · páginas', () => {
  it('o KCX Studio lista os três componentes e valida um arquivo', async () => {
    const h = await abrir('/kcx');
    const el = h.routeNativeElement!;
    for (const c of KCX_COMPONENTES) expect(el.textContent).toContain(c.nome);
    const studio = h.fixture.debugElement.query((d) => d.nativeElement?.tagName === 'KX-KCX-STUDIO')
      .componentInstance as { validarTexto: (t: string) => void };
    studio.validarTexto(serializar(criarPacote([NEON_GLOW])));
    h.detectChanges();
    expect(el.textContent).toContain('é um pacote KCX válido');
    studio.validarTexto('{"formato":"kcx"}');
    h.detectChanges();
    expect(el.querySelector('.kcxs__problemas')).toBeTruthy();
  });

  it('o editor muda a variável sem recarregar o preview e mantém o código sincronizado', async () => {
    const h = await abrir('/kcx/neon-glow');
    const el = h.routeNativeElement!;
    const preview = el.querySelector('kx-kcx-preview')!;
    const frame = preview.querySelector('iframe')!;
    const enviados: unknown[] = [];
    // O runtime ainda não respondeu "pronto" no jsdom: simulamos para medir as mensagens.
    window.dispatchEvent(
      new MessageEvent('message', { data: { kcx: 'pronto' }, source: frame.contentWindow }),
    );
    frame.contentWindow!.postMessage = ((m: unknown) =>
      enviados.push(m)) as typeof window.postMessage;
    const campo = el.querySelector('[aria-label="Desfoque (valor exato)"]') as HTMLInputElement;
    campo.value = '30';
    campo.dispatchEvent(new Event('change'));
    h.detectChanges();
    await h.fixture.whenStable();
    expect(preview.querySelector('iframe')).toBe(frame); // mesmo iframe: nada recarregou
    const ultima = enviados.at(-1) as { kcx: string; cssVars: Record<string, string> };
    expect(ultima.kcx).toBe('set');
    expect(ultima.cssVars['--kcx-neon-glow-blur']).toBe('30px');
    expect(el.querySelector('kx-kcx-codigo-painel')!.textContent).toContain(
      '--kcx-neon-glow-blur: 30px',
    );
  });

  it('o painel de exportação mostra o que vai ser criado e marca as variáveis documentais', async () => {
    const h = await abrir('/kcx/neon-glow');
    const painel = h.routeNativeElement!.querySelector('kx-kcx-exportar-painel')!;
    expect(painel.textContent).toContain('Variáveis detectadas');
    expect(painel.textContent).toContain('neon-glow/primary-color');
    expect(painel.textContent).toContain('documental');
    expect(painel.querySelectorAll('input[name="kcxx-modo"]').length).toBe(5);
  });

  it('importar alterações mostra as diferenças antes de aplicar', async () => {
    const h = await abrir('/kcx/neon-glow');
    const dbg = h.routeDebugElement!.query((d) => d.name === 'kx-kcx-importar-painel');
    const painel = dbg.componentInstance as { processar: (t: string) => void };
    painel.processar(
      JSON.stringify({
        formato: 'kcx-alteracoes',
        schemaVersion: '1.0.0',
        pacote: 'neon-glow',
        componente: 'neon-glow',
        versao: '1.0.0',
        exportadoEm: '2026-11-18T12:00:00Z',
        valores: { primaryColor: '#00ff00', radius: 999 },
      }),
    );
    h.detectChanges();
    const linhas = dbg.nativeElement.querySelectorAll('tbody tr');
    expect(linhas.length).toBe(2);
    expect((linhas[1].querySelector('input') as HTMLInputElement).disabled).toBe(true); // 999 é inválido
  });

  it('a composição abre com as três camadas e as variáveis compartilhadas', async () => {
    const h = await abrir('/kcx/compor');
    const el = h.routeNativeElement!;
    expect(el.querySelectorAll('.kcxm__camada').length).toBe(3);
    expect(el.textContent).toContain('Cor de destaque');
    expect(el.textContent).toContain('Vem da variável compartilhada');
  });

  it('importar do Figma lista o componente com o botão para editar; validar oferece adicionar', async () => {
    localStorage.clear();
    const h = await abrir('/kcx');
    const el = h.routeNativeElement!;
    const studio = h.fixture.debugElement.query((d) => d.nativeElement?.tagName === 'KX-KCX-STUDIO')
      .componentInstance as { validarTexto: (t: string) => void; adicionar: (p: unknown) => void };
    const doFigma = { ...NEON_GLOW, id: 'card-do-figma', nome: 'Card do Figma' };
    const pacote = criarPacote([doFigma]);

    studio.validarTexto(serializar(pacote));
    h.detectChanges();
    expect(el.textContent).toContain('Conferir não adiciona o componente');
    const botao = [...el.querySelectorAll('button')].find((b) =>
      b.textContent!.includes('Adicionar aos meus componentes'),
    )!;
    expect(botao).toBeTruthy();
    botao.click();
    h.detectChanges();

    const link = el.querySelector('.kcxs__importados a') as HTMLAnchorElement;
    expect(link.textContent).toContain('Editar “Card do Figma”');
    expect(link.getAttribute('href')).toBe('/kcx/card-do-figma');
    expect(el.querySelector('#kcxs-meus')).toBeTruthy();

    // De novo: avisa que substituiu.
    studio.adicionar(pacote);
    h.detectChanges();
    expect(el.textContent).toContain('substituiu a versão que já estava no lab');
    localStorage.clear();
  });
});

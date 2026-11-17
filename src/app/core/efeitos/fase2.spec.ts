import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { COMPONENTES_ANGULAR } from '../../efeitos-angular';
import { diffLinhas } from '../../shared/utils/diff';
import { realcarLinhas } from '../../shared/utils/realce';
import { crc32, criarZip } from '../../shared/utils/zip';
import { Valores } from '../models/demo.model';
import { montarPacote } from './exportar';
import { EFFECT_REGISTRY, findKit } from './registry';

const padrao = (id: string): Valores =>
  Object.fromEntries(findKit(id)!.params.map((p) => [p.id, p.padrao]));

describe('Fase 2 · versão Angular dos kits', () => {
  it('existe um componente Angular para cada kit', () => {
    expect(Object.keys(COMPONENTES_ANGULAR).sort()).toEqual(EFFECT_REGISTRY.map((k) => k.ficha.id).sort());
  });

  for (const kit of EFFECT_REGISTRY) {
    const id = kit.ficha.id;

    it(`${id}: o componente Angular compila e renderiza`, async () => {
      const tipo = await COMPONENTES_ANGULAR[id]();
      const f = TestBed.createComponent(tipo);
      f.detectChanges();
      await f.whenStable();
      const el = f.nativeElement as HTMLElement;
      // renderizou elementos (a barra de progresso, por exemplo, não tem texto)
      expect(el.querySelector('*')).not.toBeNull();
      f.destroy();
    });

    it(`${id}: a versão Angular usa os mesmos valores dos controles`, () => {
      const v = padrao(id);
      const css = kit.angular(v).css;
      // o CSS do efeito (sem o palco) é o mesmo da versão HTML/CSS/JS
      // o bloco da página rolável (body, intro/fim) fica de fora do componente
      const cssKit = kit.gerar(v).css.replace(/\/\* Página da demonstração[\s\S]*?\n}\n\.intro, \.fim \{[\s\S]*?\n}\n*/, '');
      for (const linha of cssKit.split('\n').filter((l) => l.includes('ms') || l.includes('px'))) {
        // linhas em vh são do conteúdo de demonstração (texto longo), não do efeito
        if (!/height: 100%|padding: 24px|gap: 24px|vh;/.test(linha)) expect(css).toContain(linha.trim());
      }
    });
  }

  it('text-reveal Angular separa as letras e mantém o aria-label', async () => {
    const f = TestBed.createComponent(await COMPONENTES_ANGULAR['text-reveal']());
    f.detectChanges();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('h1')!.getAttribute('aria-label')).toBe('Experimente. Entenda. Codifique.');
    expect(el.querySelectorAll('.palavra').length).toBe(3);
    expect(el.querySelectorAll('.parte').length).toBe('Experimente.Entenda.Codifique.'.length);
  });
});

describe('Fase 2 · Code Explainer', () => {
  for (const kit of EFFECT_REGISTRY) {
    it(`${kit.ficha.id}: três níveis preenchidos e glossário presente no código`, () => {
      expect(kit.niveis.iniciante.length).toBeGreaterThan(1);
      expect(kit.ficha.explicacao.length).toBeGreaterThan(1);
      expect(kit.niveis.avancado.length).toBeGreaterThan(1);
      expect(kit.glossario.length).toBeGreaterThan(2);
      const c = kit.gerar(padrao(kit.ficha.id));
      const tudo = `${c.html}\n${c.css}\n${c.js}`;
      for (const g of kit.glossario) expect(tudo, `"${g.termo}" não aparece no código`).toContain(g.termo);
    });
  }
});

describe('Fase 2 · utilitários', () => {
  it('crc32 bate com o valor de referência', () => {
    expect(crc32(new TextEncoder().encode('123456789'))).toBe(0xcbf43926);
  });

  it('zip tem assinaturas e diretório central corretos', () => {
    const z = criarZip([{ nome: 'a/b.txt', conteudo: 'olá' }]);
    const v = new DataView(z.buffer);
    expect(v.getUint32(0, true)).toBe(0x04034b50);
    expect(v.getUint32(z.length - 22, true)).toBe(0x06054b50);
    expect(v.getUint16(z.length - 22 + 10, true)).toBe(1);
  });

  it('diff aponta linhas adicionadas e removidas', () => {
    const d = diffLinhas('a\nb\nc', 'a\nx\nc');
    expect(d.map((l) => l.tipo)).toEqual(['igual', 'removida', 'adicionada', 'igual']);
  });

  it('realce mantém o texto original e o número de linhas', () => {
    const codigo = '<b>\n/* oi\nfim */ x';
    const linhas = realcarLinhas(codigo, 'css');
    expect(linhas.length).toBe(3);
    expect(linhas.map((l) => l.map((t) => t.t).join('')).join('\n')).toBe(codigo);
    expect(linhas[1][0].c).toBe('tk-comentario');
  });

  it('pacote tem os 7 arquivos e o README cita os valores', () => {
    const k = findKit('glow-button')!;
    const v = padrao('glow-button');
    const p = montarPacote(k, v, k.gerar(v), k.angular(v), false);
    expect(p.map((a) => a.nome)).toEqual([
      'glow-button/README.md',
      'glow-button/index.html',
      'glow-button/styles.css',
      'glow-button/script.js',
      'glow-button/angular/glow-button.ts',
      'glow-button/angular/glow-button.html',
      'glow-button/angular/glow-button.css',
    ]);
    expect(p[0].conteudo).toContain('**intensidade:** 16px');
    expect(p[1].conteudo).toContain('<link rel="stylesheet" href="styles.css">');
  });
});

describe('Fase 2 · Code Lab na página', () => {
  let harness: RouterTestingHarness;
  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes, withComponentInputBinding())] });
    harness = await RouterTestingHarness.create();
  });

  it('editar, executar e restaurar o original', async () => {
    await harness.navigateByUrl('/efeitos/fade-in');
    const el = harness.routeNativeElement!;
    const botao = (t: string) =>
      [...el.querySelectorAll('button')].find((b) => b.textContent?.includes(t)) as HTMLButtonElement;

    expect(el.querySelectorAll('[role="tab"]').length).toBe(6);
    botao('Editar código').click();
    harness.detectChanges();
    const area = el.querySelector('textarea') as HTMLTextAreaElement;
    expect(area.value).toContain('fade-in');
    area.value = '<p>meu teste</p>';
    area.dispatchEvent(new Event('input'));
    botao('Executar no preview').click();
    harness.detectChanges();

    expect(el.textContent).toContain('seu código editado');
    expect((el.querySelector('fieldset.ef__ctrls') as HTMLFieldSetElement).disabled).toBe(true);

    botao('Comparar com o original').click();
    harness.detectChanges();
    expect(el.querySelector('.cl__dl.is-add')?.textContent).toContain('meu teste');

    botao('Restaurar original').click();
    harness.detectChanges();
    expect(el.textContent).not.toContain('seu código editado');
    expect((el.querySelector('fieldset.ef__ctrls') as HTMLFieldSetElement).disabled).toBe(false);
  });

  it('modo Angular carrega o componente compilado', async () => {
    await harness.navigateByUrl('/efeitos/glow-button');
    const el = harness.routeNativeElement!;
    ([...el.querySelectorAll('.ef__modo-btn')].find((b) => b.textContent?.includes('Angular')) as HTMLButtonElement).click();
    harness.detectChanges();
    await new Promise((r) => setTimeout(r, 0));
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(el.querySelector('.ef__ng app-glow-button button.neon')).toBeTruthy();
  });
});

import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KCX_COMPONENTES } from '../kcx/componentes';
import { classeAngular } from '../kcx/angular';
import { resolverSaidas } from '../kcx/resolver';
import * as componentes from './index';

const porClasse = componentes as unknown as Record<string, Type<unknown>>;

describe('KCX · componentes Angular', () => {
  for (const c of KCX_COMPONENTES) {
    it(`${c.id}: compila, aplica as variáveis como custom properties e reage aos inputs`, async () => {
      const Cls = porClasse[classeAngular(c.id)];
      expect(Cls, classeAngular(c.id)).toBeTruthy();
      const f = TestBed.createComponent(Cls);
      f.detectChanges();
      await f.whenStable();
      const host = f.nativeElement as HTMLElement;
      const padrao = resolverSaidas(c.variaveis);
      for (const [k, v] of Object.entries(padrao.cssVars))
        expect(host.style.getPropertyValue(k), `${c.id} ${k}`).toBe(v);

      // Muda uma cor e um número pelo input: o elemento recebe o valor novo.
      const cor = c.variaveis.find((v) => v.tipo === 'color')!;
      f.componentRef.setInput(cor.id, '#123456');
      const num = c.variaveis.find((v) => v.tipo === 'dimension')!;
      f.componentRef.setInput(num.id, num.max!);
      f.detectChanges();
      await f.whenStable();
      const esperado = resolverSaidas(c.variaveis, { [cor.id]: '#123456', [num.id]: num.max! });
      for (const [k, v] of Object.entries(esperado.cssVars))
        expect(host.style.getPropertyValue(k), `${c.id} ${k}`).toBe(v);

      // Textos vinculados (rótulo/título) seguem o input.
      const texto = c.variaveis.find(
        (v) => v.tipo === 'string' && v.vinculos[0].alvo.tipo === 'texto',
      );
      if (texto && texto.vinculos[0].alvo.tipo === 'texto') {
        f.componentRef.setInput(texto.id, 'Texto do teste');
        f.detectChanges();
        await f.whenStable();
        TestBed.tick();
        expect(host.querySelector(texto.vinculos[0].alvo.seletor)!.textContent).toBe(
          'Texto do teste',
        );
      }
    });
  }
});

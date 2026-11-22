import { describe, expect, it } from 'vitest';
import { KcxVariavel } from './kcx.types';
import { valoresAposAtualizacao } from './resolver';

function v(
  id: string,
  valor: KcxVariavel['valor'],
  tipo: KcxVariavel['tipo'] = 'string',
): KcxVariavel {
  return { id, tipo, valor, padrao: valor } as KcxVariavel;
}

describe('valoresAposAtualizacao', () => {
  it('esquece o valor salvo de uma variável cujo valor de base mudou', () => {
    const r = valoresAposAtualizacao(
      { textoTitulo: 'Antigo', corPrimaria: '#ff0000' },
      [v('textoTitulo', 'Antigo'), v('corPrimaria', '#7c3aed', 'color')],
      [v('textoTitulo', 'Novo'), v('corPrimaria', '#7c3aed', 'color')],
    );
    expect(r).toEqual({ corPrimaria: '#ff0000' });
  });

  it('mantém os ajustes que a nova versão não tocou e as variáveis que ela não traz', () => {
    const salvos = { raio: 20, 'vidro-ligado': true };
    const r = valoresAposAtualizacao(salvos, [v('raio', 12, 'number')], [v('raio', 12, 'number')]);
    expect(r).toEqual(salvos);
  });

  it('esquece variáveis novas e as que trocaram de tipo', () => {
    const r = valoresAposAtualizacao(
      { a: 1, b: 'x' },
      [v('b', 'x')],
      [v('a', 2, 'number'), v('b', 'x', 'color')],
    );
    expect(r).toEqual({});
  });
});

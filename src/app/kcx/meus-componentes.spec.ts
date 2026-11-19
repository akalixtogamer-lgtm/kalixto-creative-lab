import { describe, expect, it } from 'vitest';
import { KCX_COMPONENTES } from './componentes';
import {
  CHAVE_MEUS,
  CHAVE_MEUS_V1,
  RepositorioMeusComponentes,
  VERSAO_ARMAZENAMENTO,
} from './meus-componentes';

class Memoria {
  dados = new Map<string, string>();
  getItem(k: string) {
    return this.dados.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.dados.set(k, v);
  }
}

const valido = () => ({ ...structuredClone(KCX_COMPONENTES[0]), id: 'meu-botao' });
const quebrado = { id: 'quebrado', nome: 'Sem raiz' };

describe('RepositorioMeusComponentes', () => {
  it('migra o formato v1 para v2 sem perder nada e mantém o v1 como backup', () => {
    const m = new Memoria();
    const v1 = JSON.stringify([valido(), quebrado]);
    m.setItem(CHAVE_MEUS_V1, v1);
    const repo = new RepositorioMeusComponentes(m);

    expect(repo.listar().map((c) => c.id)).toEqual(['meu-botao']);
    expect(repo.recuperaveis()).toHaveLength(1);
    expect(repo.recuperaveis()[0].componente).toEqual(quebrado);
    expect(repo.recuperaveis()[0].erros.length).toBeGreaterThan(0);

    const v2 = JSON.parse(m.getItem(CHAVE_MEUS)!);
    expect(v2.versao).toBe(VERSAO_ARMAZENAMENTO);
    expect(m.getItem(CHAVE_MEUS_V1)).toBe(v1);
  });

  it('salvar e remover não apagam os recuperáveis', () => {
    const m = new Memoria();
    m.setItem(CHAVE_MEUS_V1, JSON.stringify([quebrado]));
    const repo = new RepositorioMeusComponentes(m);
    expect(repo.salvar(valido())).toEqual([]);
    repo.remover('meu-botao');
    expect(repo.listar()).toEqual([]);
    expect(repo.recuperaveis()).toHaveLength(1);
    repo.descartarRecuperavel(0);
    expect(repo.recuperaveis()).toEqual([]);
  });

  it('um componente que deixa de validar vai para recuperáveis, não some', () => {
    const m = new Memoria();
    m.setItem(
      CHAVE_MEUS,
      JSON.stringify({ versao: 2, componentes: [valido(), quebrado], recuperaveis: [] }),
    );
    const repo = new RepositorioMeusComponentes(m);
    expect(repo.listar().map((c) => c.id)).toEqual(['meu-botao']);
    repo.salvar({ ...valido(), id: 'outro' });
    const g = JSON.parse(m.getItem(CHAVE_MEUS)!);
    expect(g.componentes.map((c: { id: string }) => c.id)).toEqual(['outro', 'meu-botao']);
    expect(g.recuperaveis[0].componente).toEqual(quebrado);
  });

  it('JSON corrompido não é sobrescrito na leitura', () => {
    const m = new Memoria();
    m.setItem(CHAVE_MEUS, '{quebrado');
    const repo = new RepositorioMeusComponentes(m);
    expect(repo.listar()).toEqual([]);
    expect(m.getItem(CHAVE_MEUS)).toBe('{quebrado');
    repo.salvar(valido());
    expect(m.getItem(`${CHAVE_MEUS}:corrompido`)).toBe('{quebrado');
    expect(repo.listar().map((c) => c.id)).toEqual(['meu-botao']);
  });

  it('recusa salvar um componente inválido', () => {
    const repo = new RepositorioMeusComponentes(new Memoria());
    expect(repo.salvar(quebrado as never).length).toBeGreaterThan(0);
  });
});

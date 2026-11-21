import { describe, expect, it } from 'vitest';
import {
  TIPOS_CONSTRUTOR,
  configPadrao,
  montarDoConstrutor,
  temMarca,
  tipoConstrutor,
} from './construtor';
import { aplicarFidelidade } from './construtor/tela';
import { importarNoFigma } from './figma/construir';
import { criarFigmaMock } from './figma/figma-mock';
import { PlanoNo, planejarFigma } from './figma-plano';
import { FUNDACAO_PADRAO, completarFundacao, validarFundacao } from './fundacao';
import { KcxLogo, noDaImagem, problemaDaImagem } from './logo';
import { planoParaHtml } from './plano-html';
import { criarPacote, serializar } from './serializar';
import { validarComponente } from './validar';

// PNG 1×1 transparente.
const PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
const SVG_TXT =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 30"><rect width="100" height="30" fill="#d4119f"/></svg>';
const SVG = `data:image/svg+xml;base64,${btoa(SVG_TXT)}`;
const logoPng: KcxLogo = { src: PNG, largura: 200, altura: 50, nome: 'logo.png' };
const logoSvg: KcxLogo = { src: SVG, largura: 100, altura: 30, nome: 'logo.svg' };

const achar = (n: PlanoNo, id: string): PlanoNo | undefined =>
  n.id === id ? n : n.filhos.map((f) => achar(f, id)).find(Boolean);

describe('Logo e imagens enviadas', () => {
  it('aceita PNG/SVG e recusa SVG com script, arquivo grande ou outro formato', () => {
    expect(problemaDaImagem(PNG)).toBeNull();
    expect(problemaDaImagem(SVG)).toBeNull();
    const ruim = `data:image/svg+xml;base64,${btoa('<svg onload="alert(1)"></svg>')}`;
    expect(problemaDaImagem(ruim)).toContain('script');
    expect(problemaDaImagem('https://exemplo.com/logo.png')).toContain('arquivo de imagem');
    expect(problemaDaImagem(`data:image/png;base64,${'A'.repeat(600_000)}`)).toContain('grande');
  });

  it('a fundação guarda a logo (e recusa logo inválida)', () => {
    const f = completarFundacao({ ...FUNDACAO_PADRAO, logo: logoPng });
    expect(f.logo?.src).toBe(PNG);
    expect(validarFundacao(f)).toEqual([]);
    expect(
      validarFundacao({ ...f, logo: { src: 'x', largura: 1, altura: 1 } }).join(' '),
    ).toContain('logo');
  });

  it.each(TIPOS_CONSTRUTOR.filter(temMarca).map((t) => [t.id, t] as const))(
    '%s: a logo entra no lugar do texto da marca (código e Figma)',
    async (_id, def) => {
      for (const logo of [logoPng, logoSvg]) {
        const c = montarDoConstrutor({ ...configPadrao(def), logo, alturaLogo: 32 });
        expect(validarComponente(c, c.id)).toEqual([]);
        expect(c.codigo.html).toContain(`src="${logo.src}"`);
        expect(c.codigo.html).toMatch(/<img class="[^"]+__marca [^"]+__logo"/);
        const pacote = criarPacote([c]);
        const plano = planejarFigma(pacote);
        const no = achar(plano.componentes[0].variantes[0].arvore, 'logo')!;
        expect(no).toBeTruthy();
        if (logo === logoSvg) expect(no.tipo).toBe('svg');
        else expect(no.preenchimentos[0]).toMatchObject({ tipo: 'imagem', ajuste: 'FIT' });
        const mock = criarFigmaMock();
        const rel = await importarNoFigma(mock.figma, plano, serializar(pacote), 'atualizar');
        expect(rel.vinculosFalhos).toEqual([]);
        expect(rel.avisos.filter((a) => a.includes('imagem'))).toEqual([]);
      }
    },
  );

  it('imagem no preview do Figma e cinza no wireframe', () => {
    const def = tipoConstrutor('navbar')!;
    const c = montarDoConstrutor({ ...configPadrao(def), logo: logoPng });
    const raiz = planejarFigma(criarPacote([c])).componentes[0].variantes[0].arvore;
    expect(planoParaHtml(raiz)).toContain(`url("${PNG}") center / contain no-repeat`);
    const w = aplicarFidelidade(c, 'media');
    expect(JSON.stringify(w.estrutura)).not.toContain('data:image/png');
    expect(w.codigo.html).not.toContain('data:image/png');
  });

  it('noDaImagem: SVG vira vetor, PNG vira retângulo com imagem', () => {
    expect(noDaImagem('a', 'A', SVG, 100, 30).tipo).toBe('svg');
    expect(noDaImagem('b', 'B', PNG, 80, 20, 'preencher').preenchimentos![0]).toEqual({
      tipo: 'imagem',
      src: PNG,
      ajuste: 'preencher',
    });
  });
});

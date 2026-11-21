import { describe, expect, it } from 'vitest';
import { configPadrao, montarDoConstrutor, tipoConstrutor } from '../..';
import { PlanoNo, planejarFigma } from '../../../figma-plano';
import { criarPacote } from '../../../serializar';
import { validarComponente } from '../../../validar';

const ids = (n: PlanoNo): string[] => [n.id, ...n.filhos.flatMap(ids)];

describe('Cards com subtítulo', () => {
  it.each(['card-foto', 'card-video'])('%s: subtítulo no código, no Figma e liga/desliga', (id) => {
    const cfg = configPadrao(tipoConstrutor(id)!);
    const c = montarDoConstrutor({ ...cfg, textos: { ...cfg.textos, subtitulo: 'Zona Sul' } });
    expect(validarComponente(c, c.id)).toEqual([]);
    expect(c.codigo.html).toMatch(/<p class="[^"]+__subtitulo">Zona Sul<\/p>/);
    const arvore = planejarFigma(criarPacote([c])).componentes[0].variantes[0].arvore;
    const ordem = ids(arvore);
    expect(ordem.indexOf('t-subtitulo')).toBeGreaterThan(ordem.indexOf('t-titulo'));
    expect(ordem.indexOf('t-subtitulo')).toBeLessThan(ordem.indexOf('t-texto'));
    expect(c.variaveis.some((v) => v.id === 'mostrarSubtitulo')).toBe(true);
    const sem = montarDoConstrutor({ ...cfg, recursos: { ...cfg.recursos, subtitulo: false } });
    expect(sem.codigo.html).not.toContain('__subtitulo');
  });
});

import { PDFDocument } from 'pdf-lib';
import { describe, expect, it } from 'vitest';
import { FUNDACAO_PADRAO, completarFundacao } from './fundacao';
import { pdfDoDesignSystem, textoPdf } from './pdf-design-system';

// PNG 1×1 transparente
const PNG = Uint8Array.from(
  atob(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  ),
  (c) => c.charCodeAt(0),
);

describe('Design system em PDF', () => {
  it('troca o que as fontes padrão do PDF não têm', () => {
    expect(textoPdf('Ação → próxima −45° ✓ “ok” · R$ 49,90')).toBe(
      'Ação -> próxima -45° ok “ok” · R$ 49,90',
    );
    expect(textoPdf('emoji 🎉')).toBe('emoji ?');
  });

  it('gera um PDF A4 com capa, sumário e as seções, com logo e componentes', async () => {
    const f = completarFundacao({
      ...structuredClone(FUNDACAO_PADRAO),
      nome: 'Estúdio Ação → Dança',
      funcoes: { primaria: 'Botões principais — “Inscreva-se” ✓' },
    });
    const bytes = await pdfDoDesignSystem(f, {
      tema: 'claro',
      data: '21 de novembro de 2026',
      logo: { bytes: PNG, tipo: 'png' },
      componentes: [{ nome: 'Botão', categoria: 'Ações', variantes: 12 }],
    });
    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe('%PDF-');
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(10);
    const [w, h] = [doc.getPage(0).getWidth(), doc.getPage(0).getHeight()];
    expect(Math.round(w)).toBe(595);
    expect(Math.round(h)).toBe(842);
    expect(doc.getTitle()).toContain('Design system');
  });

  it('logo inválida não impede o PDF', async () => {
    const bytes = await pdfDoDesignSystem(FUNDACAO_PADRAO, {
      logo: { bytes: new Uint8Array([1, 2, 3]), tipo: 'png' },
    });
    expect((await PDFDocument.load(bytes)).getPageCount()).toBeGreaterThan(5);
  });
});

import { describe, expect, it } from 'vitest';
import {
  arquivoDoBriefing,
  briefingDoJson,
  briefingDoTexto,
  briefingParaMarkdown,
  itensDoCampo,
  progressoBriefing,
} from './briefing';
import { entradasDoZip, textoDoDocx, textoDoXmlWord } from './docx';
import {
  LIMITE_MOODBOARD,
  moodboardHtml,
  paletaDePixels,
  paletaGeral,
  recusarArquivo,
  reduzir,
  sugerirPapeis,
  vagas,
} from './moodboard';
import {
  Fluxo,
  Navegacao,
  PaginaMapa,
  analisarFluxo,
  analisarMapa,
  arestasDoFluxo,
  arquivoDoDiagrama,
  diagramaDoFluxo,
  diagramaDoMapa,
  diagramaSvg,
  fluxoDoCaminho,
  lerArquivoDiagrama,
  lerNavegacao,
  quebrar,
} from './navegacao';

/** ZIP mínimo (método deflate) com as entradas dadas. */
async function zip(arquivos: Record<string, string>): Promise<ArrayBuffer> {
  const enc = new TextEncoder();
  const locais: Uint8Array[] = [];
  const centrais: Uint8Array[] = [];
  let pos = 0;
  for (const [nome, conteudo] of Object.entries(arquivos)) {
    const n = enc.encode(nome);
    const original = enc.encode(conteudo);
    const dados = new Uint8Array(
      await new Response(
        new Response(original).body!.pipeThrough(new CompressionStream('deflate-raw')),
      ).arrayBuffer(),
    );
    const l = new Uint8Array(30 + n.length + dados.length);
    const lv = new DataView(l.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(8, 8, true);
    lv.setUint32(18, dados.length, true);
    lv.setUint32(22, original.length, true);
    lv.setUint16(26, n.length, true);
    l.set(n, 30);
    l.set(dados, 30 + n.length);
    const c = new Uint8Array(46 + n.length);
    const cv = new DataView(c.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(10, 8, true);
    cv.setUint32(20, dados.length, true);
    cv.setUint32(24, original.length, true);
    cv.setUint16(28, n.length, true);
    cv.setUint32(42, pos, true);
    c.set(n, 46);
    locais.push(l);
    centrais.push(c);
    pos += l.length;
  }
  const tamCentral = centrais.reduce((s, c) => s + c.length, 0);
  const fim = new Uint8Array(22);
  const fv = new DataView(fim.buffer);
  fv.setUint32(0, 0x06054b50, true);
  fv.setUint16(8, centrais.length, true);
  fv.setUint16(10, centrais.length, true);
  fv.setUint32(12, tamCentral, true);
  fv.setUint32(16, pos, true);
  const tudo = new Uint8Array(pos + tamCentral + 22);
  let p = 0;
  for (const b of [...locais, ...centrais, fim]) {
    tudo.set(b, p);
    p += b.length;
  }
  return tudo.buffer;
}

const paragrafos = (linhas: string[]) =>
  `<?xml version="1.0"?><w:document><w:body>${linhas
    .map((l) => `<w:p><w:r><w:t>${l}</w:t></w:r></w:p>`)
    .join('')}</w:body></w:document>`;

describe('Briefing', () => {
  const texto = `Briefing - Café Aurora
Cliente: Aurora Cafés Especiais
## Objetivo
Aumentar as encomendas online em 30%.
Público-alvo: jovens de 20 a 35 anos que trabalham remoto.
TOM DE VOZ
Acolhedor, artesanal e moderno.
Páginas
- Home
- Sobre
- Cardápio
- Contato
Prazo: 15/12
Uma frase sem rótulo que fica nas observações.`;

  it('reconhece os campos, o título e as listas (Sobre e Contato continuam itens)', () => {
    const { briefing: b, reconhecidos } = briefingDoTexto(texto);
    expect(b.projeto).toBe('Café Aurora');
    expect(b.cliente).toBe('Aurora Cafés Especiais');
    expect(b.objetivo).toContain('30%');
    expect(b.publico).toContain('20 a 35');
    expect(b.tom).toBe('Acolhedor, artesanal e moderno.');
    expect(itensDoCampo(b.paginas)).toEqual(['Home', 'Sobre', 'Cardápio', 'Contato']);
    expect(b.prazo).toBe('15/12');
    expect(b.observacoes).toBe('Uma frase sem rótulo que fica nas observações.');
    expect(reconhecidos).toEqual(
      expect.arrayContaining([
        'projeto',
        'cliente',
        'objetivo',
        'publico',
        'tom',
        'paginas',
        'prazo',
      ]),
    );
    expect(b.contexto).toBe('');
  });

  it('texto sem rótulos vai para Observações; JSON e Markdown fazem ida e volta', () => {
    const { briefing } = briefingDoTexto('Queremos um site novo, moderno e rápido.');
    expect(briefing.observacoes).toContain('site novo');
    const b = briefingDoTexto(texto).briefing;
    expect(briefingDoJson(JSON.parse(arquivoDoBriefing(b)))).toEqual(b);
    expect(briefingDoJson({ objetivo: 'x' })?.objetivo).toBe('x');
    expect(briefingDoJson({ nada: 1 })).toBeNull();
    const md = briefingParaMarkdown(b);
    expect(md).toMatch(/^# Briefing — Café Aurora/);
    expect(md).toContain('## Público-alvo');
    expect(progressoBriefing(b).faltam).toEqual(['Entregas']);
  });

  it('lê o texto de um .docx (zip com deflate) e entidades do XML', async () => {
    const arquivo = await zip({
      '[Content_Types].xml': '<Types/>',
      'word/document.xml': paragrafos([
        'Projeto: Loja &amp; Café',
        'Objetivo',
        'Vender mais &#233; melhor',
      ]),
    });
    expect(entradasDoZip(new Uint8Array(arquivo)).map((e) => e.nome)).toContain(
      'word/document.xml',
    );
    const t = await textoDoDocx(arquivo);
    expect(t).toBe('Projeto: Loja & Café\nObjetivo\nVender mais é melhor');
    expect(briefingDoTexto(t).briefing.objetivo).toBe('Vender mais é melhor');
    expect(textoDoXmlWord('<w:p><w:r><w:t>a</w:t><w:tab/><w:t>b</w:t></w:r></w:p>')).toBe('a\tb');
    await expect(textoDoDocx(new TextEncoder().encode('não é zip').buffer)).rejects.toThrow(/docx/);
  });
});

describe('Moodboard', () => {
  it('limita a 20 imagens, recusa tipos e reduz mantendo a proporção', () => {
    expect(LIMITE_MOODBOARD).toBe(20);
    expect(vagas(18, 5)).toEqual({ entram: 2, sobram: 3 });
    expect(vagas(20, 1)).toEqual({ entram: 0, sobram: 1 });
    expect(recusarArquivo({ type: 'image/svg+xml', size: 10, name: 'a.svg' })).toMatch(/PNG/);
    expect(recusarArquivo({ type: 'image/png', size: 20e6, name: 'a.png' })).toMatch(/15 MB/);
    expect(recusarArquivo({ type: 'image/jpeg', size: 1e5, name: 'a.jpg' })).toBeNull();
    expect(reduzir(4000, 2000)).toEqual({ l: 1600, a: 800 });
    expect(reduzir(300, 200)).toEqual({ l: 300, a: 200 });
  });

  it('tira a paleta dos pixels, junta as das imagens e sugere papéis', () => {
    const px: number[] = [];
    const pinta = (n: number, r: number, g: number, b: number, a = 255) => {
      for (let i = 0; i < n; i++) px.push(r, g, b, a);
    };
    pinta(60, 212, 17, 159);
    pinta(30, 15, 12, 25);
    pinta(20, 250, 248, 240);
    pinta(10, 214, 18, 160); // quase igual à primeira: não repete
    pinta(50, 0, 255, 0, 0); // transparente: ignorado
    const p = paletaDePixels(px, 5);
    expect(p[0]).toBe('#d4119f');
    expect(p).toHaveLength(3);
    const geral = paletaGeral([{ cores: p }, { cores: ['#22e3ff', '#0f0c19'] }]);
    expect(geral).toContain('#22e3ff');
    const papeis = sugerirPapeis(geral);
    expect(papeis.primaria).toBeDefined();
    expect(papeis.fundo).toBe('#0f0c19');
    expect(papeis.texto).toBe('#faf8f0');
  });

  it('exporta um HTML autônomo, escapando textos e recusando src estranho', () => {
    const html = moodboardHtml(
      {
        titulo: 'Aurora <script>',
        palavras: 'acolhedor, artesanal',
        layout: 'mosaico',
        imagens: [
          {
            id: '1',
            nome: 'a',
            legenda: 'Grãos "torrados"',
            src: 'data:image/png;base64,iVBORw0KGgo=',
            largura: 10,
            altura: 10,
            cores: ['#d4119f', 'red;x'],
          },
          {
            id: '2',
            nome: 'b',
            legenda: '',
            src: 'javascript:alert(1)',
            largura: 1,
            altura: 1,
            cores: [],
          },
        ],
      },
      { objetivo: 'Vender mais' },
    );
    expect(html).toContain('Aurora &lt;script&gt;');
    expect(html).toContain('Grãos &quot;torrados&quot;');
    expect(html).toContain('<li>artesanal</li>');
    expect(html).toContain('Vender mais');
    expect(html).not.toContain('javascript:');
    expect(html).not.toContain('red;x');
    expect(html.match(/<figure>/g)).toHaveLength(1);
  });
});

describe('Mapa de navegação e fluxos', () => {
  const paginas: PaginaMapa[] = [
    { id: 'home', nome: 'Home', secoes: ['Navbar', 'Hero', 'Rodapé'] },
    { id: 'cardapio', nome: 'Cardápio', secoes: ['Navbar', 'Cards'] },
    { id: 'produto', nome: 'Produto', secoes: [] },
    { id: 'carrinho', nome: 'Carrinho', secoes: [] },
    { id: 'perdida', nome: 'Perdida', secoes: [] },
  ];
  const nav: Navegacao = {
    ligacoes: [
      { id: 'a', de: 'home', para: 'cardapio', gatilho: 'Menu → Cardápio' },
      { id: 'b', de: 'cardapio', para: 'produto', gatilho: 'Clique no card' },
      { id: 'c', de: 'produto', para: 'carrinho', gatilho: 'Adicionar' },
      { id: 'd', de: 'carrinho', para: 'home', gatilho: 'Logo' },
      { id: 'e', de: 'home', para: 'apagada', gatilho: 'x' },
    ],
    fluxos: [],
  };

  it('aponta páginas sem entrada e becos sem saída', () => {
    const av = analisarMapa(paginas, nav);
    expect(av.find((a) => a.alvo === 'perdida' && a.nivel === 'erro')).toBeTruthy();
    expect(av.find((a) => a.alvo === 'perdida' && /lugar nenhum/.test(a.texto))).toBeTruthy();
    expect(av.some((a) => a.alvo === 'carrinho')).toBe(false);
  });

  it('desenha o mapa em camadas (cliques do início) com volta tracejada', () => {
    const d = diagramaDoMapa(paginas, nav);
    const y = (id: string) => d.nos.find((n) => n.id === id)!.y;
    expect(y('home')).toBeLessThan(y('cardapio'));
    expect(y('cardapio')).toBeLessThan(y('produto'));
    expect(y('produto')).toBeLessThan(y('carrinho'));
    expect(d.nos.find((n) => n.id === 'home')!.etiqueta).toBe('INÍCIO');
    expect(d.nos.find((n) => n.id === 'perdida')!.estado).toBe('erro');
    expect(d.arestas).toHaveLength(4); // a ligação para página apagada some
    expect(d.arestas.find((a) => a.de === 'carrinho')!.volta).toBe(true);
    expect(Math.min(...d.nos.map((n) => n.x))).toBeGreaterThan(0);
    const svg = diagramaSvg(d);
    expect(svg).toMatch(/^<svg /);
    expect(svg).toContain('data-no="cardapio"');
    expect(svg).toContain('Menu → Cardápio');
    expect(svg).toContain('stroke-dasharray');
  });

  it('gera o fluxo pelo menor caminho e analisa decisões', () => {
    const f = fluxoDoCaminho(paginas, nav, 'home', 'carrinho', 'Comprar café')!;
    expect(f.passos.map((p) => p.tipo)).toEqual([
      'inicio',
      'tela',
      'acao',
      'tela',
      'acao',
      'tela',
      'acao',
      'tela',
      'fim',
    ]);
    expect(f.passos[2].rotulo).toBe('Menu → Cardápio');
    expect(fluxoDoCaminho(paginas, nav, 'home', 'perdida', 'x')).toBeNull();
    expect(analisarFluxo(f, paginas)).toEqual([]);

    const comDecisao: Fluxo = {
      id: 'f',
      nome: 'Login',
      objetivo: '',
      passos: [
        { id: 'i', tipo: 'inicio', rotulo: 'Abre o app' },
        { id: 'q', tipo: 'decisao', rotulo: 'Tem conta?', sim: 'l', nao: 'c' },
        { id: 'c', tipo: 'acao', rotulo: 'Cria conta', proximo: 'l' },
        { id: 'l', tipo: 'acao', rotulo: 'Entra' },
        { id: 'fim', tipo: 'fim', rotulo: 'Logado' },
        { id: 'solto', tipo: 'acao', rotulo: 'Sem caminho', proximo: 'fim' },
      ],
    };
    expect(arestasDoFluxo(comDecisao)).toContainEqual({ de: 'q', para: 'c', rotulo: 'Não' });
    expect(analisarFluxo(comDecisao, paginas).some((a) => a.alvo === 'solto')).toBe(true);
    const d = diagramaDoFluxo(comDecisao, paginas);
    const y = (id: string) => d.nos.find((n) => n.id === id)!.y;
    // "Entra" fica abaixo de "Cria conta" (caminho mais longo), sem seta subindo.
    expect(y('l')).toBeGreaterThan(y('c'));
    expect(d.nos.find((n) => n.id === 'q')!.forma).toBe('losango');
    expect(d.arestas.filter((a) => a.de !== 'solto').every((a) => !a.volta)).toBe(true);
  });

  it('lê dados salvos com segurança e valida o arquivo para o Figma', () => {
    const n = lerNavegacao({
      inicio: 'home',
      ligacoes: [{ de: 'a', para: 'b', gatilho: 1 }, { de: '', para: 'b' }, null],
      fluxos: [{ nome: 'F', passos: [{ tipo: 'hack', rotulo: 'x', proximo: 'y' }] }],
    });
    expect(n.ligacoes).toHaveLength(1);
    expect(n.ligacoes[0].gatilho).toBe('');
    expect(n.fluxos[0].passos[0].tipo).toBe('acao');
    expect(lerNavegacao(null)).toEqual({ inicio: undefined, ligacoes: [], fluxos: [] });

    const arq = arquivoDoDiagrama(diagramaDoMapa(paginas, nav));
    const r = lerArquivoDiagrama(arq);
    expect('diagrama' in r && r.diagrama.nos.length).toBe(5);
    const ruim = JSON.parse(arq);
    ruim.diagrama.arestas[0].d = 'M0 0"/><script>';
    expect(lerArquivoDiagrama(JSON.stringify(ruim))).toEqual({
      erro: 'Seta inválida no diagrama.',
    });
    expect(lerArquivoDiagrama('{"formato":"x"}')).toEqual({ erro: 'Não é um diagrama KCX.' });
  });

  it('quebra textos longos em linhas', () => {
    expect(quebrar('Clique no botão de comprar agora mesmo', 14, 2)).toEqual([
      'Clique no',
      'botão de…',
    ]);
    expect(quebrar('Curto', 10)).toEqual(['Curto']);
  });
});

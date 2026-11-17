import { BibliotecaId } from '../models/effect-sheet.model';

/**
 * Bibliotecas que alguns kits usam. Os arquivos .min.js são copiados de
 * node_modules para /vendor no build (angular.json → assets), então o preview
 * os embute no documento isolado sem acessar a internet.
 */
export interface Biblioteca {
  id: BibliotecaId;
  nome: string;
  versao: string;
  /** Caminho servido pelo app (relativo ao base href). */
  arquivo: string;
  /** Nome do arquivo dentro do pacote .zip (pasta vendor/). */
  nomeArquivo: string;
  pacoteNpm: string;
  licenca: string;
  licencaUrl: string;
  /** Global que o arquivo cria no window. */
  global: string;
}

export const BIBLIOTECAS: Record<BibliotecaId, Biblioteca> = {
  gsap: {
    id: 'gsap',
    nome: 'GSAP',
    versao: '3.15.1',
    arquivo: 'vendor/gsap/gsap.min.js',
    nomeArquivo: 'gsap.min.js',
    pacoteNpm: 'gsap',
    licenca: 'GreenSock Standard License (gratuita, inclusive para uso comercial)',
    licencaUrl: 'https://gsap.com/standard-license',
    global: 'gsap',
  },
  scrolltrigger: {
    id: 'scrolltrigger',
    nome: 'ScrollTrigger (plugin do GSAP)',
    versao: '3.15.1',
    arquivo: 'vendor/gsap/ScrollTrigger.min.js',
    nomeArquivo: 'ScrollTrigger.min.js',
    pacoteNpm: 'gsap',
    licenca: 'GreenSock Standard License (gratuita, inclusive para uso comercial)',
    licencaUrl: 'https://gsap.com/standard-license',
    global: 'ScrollTrigger',
  },
  lenis: {
    id: 'lenis',
    nome: 'Lenis',
    versao: '1.3.27',
    arquivo: 'vendor/lenis/lenis.min.js',
    nomeArquivo: 'lenis.min.js',
    pacoteNpm: 'lenis',
    licenca: 'MIT',
    licencaUrl: 'https://github.com/darkroomengineering/lenis/blob/main/LICENSE',
    global: 'Lenis',
  },
};

const cache = new Map<BibliotecaId, Promise<string>>();

/** Baixa (uma vez) o código de uma biblioteca do próprio app. */
export function carregarBiblioteca(id: BibliotecaId): Promise<string> {
  let p = cache.get(id);
  if (!p) {
    const url = new URL(BIBLIOTECAS[id].arquivo, document.baseURI).href;
    p = fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status} ao carregar ${url}`);
        return r.text();
      })
      // o mapa de fonte não existe dentro do documento isolado
      .then((t) => t.replace(/\/\/# sourceMappingURL=\S+\s*$/, ''));
    p.catch(() => cache.delete(id));
    cache.set(id, p);
  }
  return p;
}

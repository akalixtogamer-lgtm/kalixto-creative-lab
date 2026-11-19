/**
 * Biblioteca de ícones do KCX: traços de 2 px numa grade de 24 × 24
 * (`currentColor` no código). No Figma cada ícone vira um componente
 * "KCX Ícone/<nome>" e os componentes usam instâncias deles, com troca de
 * instância (Instance swap) entre os ícones da biblioteca.
 */
export const ICONES_KCX: Record<string, string> = {
  menu: 'M 4 7 L 20 7 M 4 12 L 20 12 M 4 17 L 20 17',
  fechar: 'M 6 6 L 18 18 M 18 6 L 6 18',
  esquerda: 'M 15 5 L 8 12 L 15 19',
  direita: 'M 9 5 L 16 12 L 9 19',
  baixo: 'M 6 9 L 12 15 L 18 9',
  cima: 'M 6 15 L 12 9 L 18 15',
  play: 'M 8 5 L 19 12 L 8 19 Z',
  check: 'M 5 12 L 10 17 L 19 7',
  info: 'M 12 11 L 12 17 M 12 7 L 12 7.5 M 21 12 A 9 9 0 1 1 3 12 A 9 9 0 1 1 21 12',
  casa: 'M 4 11 L 12 4 L 20 11 L 20 20 L 4 20 Z',
  seta: 'M 5 12 L 19 12 M 13 6 L 19 12 L 13 18',
  voltar: 'M 19 12 L 5 12 M 11 6 L 5 12 L 11 18',
  mais: 'M 12 5 L 12 19 M 5 12 L 19 12',
  menos: 'M 5 12 L 19 12',
  busca: 'M 10.5 4 A 6.5 6.5 0 1 1 10.5 17 A 6.5 6.5 0 1 1 10.5 4 M 15.5 15.5 L 20 20',
  usuario: 'M 12 4 A 4 4 0 1 1 12 12 A 4 4 0 1 1 12 4 M 4 20 C 5 16 8 14 12 14 C 16 14 19 16 20 20',
  coracao:
    'M 12 20 C 5 15 3 11.5 3 8.5 C 3 6 5 4 7.5 4 C 9.5 4 11 5.2 12 7 C 13 5.2 14.5 4 16.5 4 C 19 4 21 6 21 8.5 C 21 11.5 19 15 12 20 Z',
  estrela:
    'M 12 3.5 L 14.6 9 L 20.5 9.6 L 16 13.5 L 17.3 19.5 L 12 16.4 L 6.7 19.5 L 8 13.5 L 3.5 9.6 L 9.4 9 Z',
  sino: 'M 6 16 L 6 11 C 6 7.5 8.5 5 12 5 C 15.5 5 18 7.5 18 11 L 18 16 L 20 18 L 4 18 Z M 10 21 L 14 21',
  carrinho: 'M 3 4 L 6 4 L 8 15 L 18 15 L 20 7 L 7 7 M 9 19 L 9 19.5 M 17 19 L 17 19.5',
  email: 'M 3 6 L 21 6 L 21 18 L 3 18 Z M 3 6 L 12 13 L 21 6',
  telefone:
    'M 5 4 L 9 4 L 10.5 8 L 8.5 9.5 C 9.5 11.5 12.5 14.5 14.5 15.5 L 16 13.5 L 20 15 L 20 19 C 11.5 19 5 12.5 5 4 Z',
  calendario: 'M 4 6 L 20 6 L 20 20 L 4 20 Z M 4 10 L 20 10 M 8 3 L 8 7 M 16 3 L 16 7',
  relogio: 'M 21 12 A 9 9 0 1 1 3 12 A 9 9 0 1 1 21 12 M 12 7 L 12 12 L 15.5 14',
  download: 'M 12 4 L 12 15 M 7 10 L 12 15 L 17 10 M 5 19 L 19 19',
  upload: 'M 12 15 L 12 4 M 7 9 L 12 4 L 17 9 M 5 19 L 19 19',
  editar: 'M 4 20 L 8 19 L 19 8 L 16 5 L 5 16 Z M 14 7 L 17 10',
  lixeira: 'M 4 7 L 20 7 M 9 7 L 9 4 L 15 4 L 15 7 M 6 7 L 7 20 L 17 20 L 18 7',
  config:
    'M 12 9 A 3 3 0 1 1 12 15 A 3 3 0 1 1 12 9 M 12 3 L 12 5.5 M 12 18.5 L 12 21 M 3 12 L 5.5 12 M 18.5 12 L 21 12 M 5.6 5.6 L 7.4 7.4 M 16.6 16.6 L 18.4 18.4 M 5.6 18.4 L 7.4 16.6 M 16.6 7.4 L 18.4 5.6',
  sair: 'M 14 4 L 20 4 L 20 20 L 14 20 M 10 8 L 6 12 L 10 16 M 6 12 L 16 12',
  alerta: 'M 12 4 L 21 19 L 3 19 Z M 12 10 L 12 14 M 12 16.5 L 12 17',
  erro: 'M 21 12 A 9 9 0 1 1 3 12 A 9 9 0 1 1 21 12 M 9 9 L 15 15 M 15 9 L 9 15',
  sucesso: 'M 21 12 A 9 9 0 1 1 3 12 A 9 9 0 1 1 21 12 M 8 12 L 11 15 L 16 9',
  cadeado:
    'M 6 11 L 18 11 L 18 20 L 6 20 Z M 8.5 11 L 8.5 8 C 8.5 6 10 4.5 12 4.5 C 14 4.5 15.5 6 15.5 8 L 15.5 11',
  olho: 'M 2.5 12 C 5 7.5 8.5 5.5 12 5.5 C 15.5 5.5 19 7.5 21.5 12 C 19 16.5 15.5 18.5 12 18.5 C 8.5 18.5 5 16.5 2.5 12 Z M 12 9.5 A 2.5 2.5 0 1 1 12 14.5 A 2.5 2.5 0 1 1 12 9.5',
  compartilhar: 'M 12 15 L 12 4 M 8 8 L 12 4 L 16 8 M 6 12 L 6 20 L 18 20 L 18 12',
  instagram:
    'M 4 8 C 4 5.8 5.8 4 8 4 L 16 4 C 18.2 4 20 5.8 20 8 L 20 16 C 20 18.2 18.2 20 16 20 L 8 20 C 5.8 20 4 18.2 4 16 Z M 12 8.5 A 3.5 3.5 0 1 1 12 15.5 A 3.5 3.5 0 1 1 12 8.5 M 16.8 7.2 L 16.8 7.3',
  whatsapp:
    'M 4 20 L 5.2 16.2 C 4.4 14.9 4 13.5 4 12 C 4 7.6 7.6 4 12 4 C 16.4 4 20 7.6 20 12 C 20 16.4 16.4 20 12 20 C 10.5 20 9.1 19.6 7.8 18.8 Z',
  youtube:
    'M 3 7.5 C 3 6 4 5 5.5 5 L 18.5 5 C 20 5 21 6 21 7.5 L 21 16.5 C 21 18 20 19 18.5 19 L 5.5 19 C 4 19 3 18 3 16.5 Z M 10 9 L 15 12 L 10 15 Z',
  carregando: 'M 12 3 A 9 9 0 1 1 3 12',
};

export type NomeIcone = keyof typeof ICONES_KCX;

/** Opções de ícone para variáveis enum (valor = nome do ícone). */
export function opcoesDeIcone(nomes: string[] = Object.keys(ICONES_KCX)) {
  return nomes.map((n) => ({ valor: n, rotulo: n }));
}

/** SVG completo de um ícone (para o Figma e para prévias). */
export function svgDoIcone(nome: string, cor = '#000000', tamanho = 24): string {
  const d = ICONES_KCX[nome] ?? ICONES_KCX['mais'];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tamanho}" height="${tamanho}" viewBox="0 0 24 24" fill="none"><path d="${d}" stroke="${cor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

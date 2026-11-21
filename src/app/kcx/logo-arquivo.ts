/**
 * Leitura de imagem do computador (só no navegador: usa File, FileReader e Image).
 * Separado de logo.ts para o núcleo continuar rodando no plugin do Figma.
 */
import { KcxLogo, MAX_BYTES_IMAGEM, problemaDaImagem } from './logo';

/** Lê um arquivo do computador e devolve a logo (data URL + tamanho natural). */
export async function lerImagem(arquivo: File): Promise<KcxLogo> {
  if (arquivo.size > MAX_BYTES_IMAGEM)
    throw new Error(`Imagem muito grande: até ${Math.round(MAX_BYTES_IMAGEM / 1024)} KB.`);
  const src = await new Promise<string>((ok, erro) => {
    const r = new FileReader();
    r.onload = () => ok(String(r.result));
    r.onerror = () => erro(new Error('Não deu para ler o arquivo.'));
    r.readAsDataURL(arquivo);
  });
  const p = problemaDaImagem(src);
  if (p) throw new Error(p);
  const { largura, altura } = await new Promise<{ largura: number; altura: number }>((ok) => {
    const img = new Image();
    img.onload = () => ok({ largura: img.naturalWidth || 200, altura: img.naturalHeight || 60 });
    img.onerror = () => ok({ largura: 200, altura: 60 });
    img.src = src;
  });
  return { src, largura, altura, nome: arquivo.name };
}

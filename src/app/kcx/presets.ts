/**
 * Presets do usuário: conjuntos de valores de variáveis (nunca cópias do
 * componente). Guardados no localStorage, com exportação e importação.
 */
import { KCX_SCHEMA_VERSION, KcxArquivoPresets, KcxComponente, KcxPreset } from './kcx.types';
import { Valores, normalizarValor, validarValor } from './resolver';

export const CHAVE_PRESETS = 'kalixto-lab:kcx-presets:v1';

export interface PresetUsuario extends KcxPreset {
  componente: string;
  criadoEm: string;
  atualizadoEm: string;
}

function lerTudo(storage: Storage | null): PresetUsuario[] {
  try {
    const bruto = storage?.getItem(CHAVE_PRESETS);
    const lista = bruto ? (JSON.parse(bruto) as PresetUsuario[]) : [];
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

function slug(nome: string): string {
  return (
    nome
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'preset'
  );
}

/** Só guarda valores de variáveis que existem e são válidos. */
export function limparValores(comp: KcxComponente, valores: Valores): Valores {
  const out: Valores = {};
  for (const v of comp.variaveis)
    if (v.id in valores) out[v.id] = normalizarValor(v, valores[v.id]);
  return out;
}

export class RepositorioPresets {
  /** Presets da sessão quando o navegador bloqueia o armazenamento. */
  private memoria: PresetUsuario[] | null = null;

  constructor(
    private readonly storage: Storage | null,
    private readonly agora: () => Date = () => new Date(),
  ) {}

  private todos(): PresetUsuario[] {
    return this.memoria ?? lerTudo(this.storage);
  }

  private gravar(lista: PresetUsuario[]): void {
    try {
      this.storage?.setItem(CHAVE_PRESETS, JSON.stringify(lista));
      this.memoria = this.storage ? null : lista;
    } catch {
      this.memoria = lista;
    }
  }

  listar(componente: string): PresetUsuario[] {
    return this.todos().filter((p) => p.componente === componente);
  }

  private idLivre(componente: string, nome: string): string {
    const base = `usuario-${slug(nome)}`;
    const usados = new Set(this.listar(componente).map((p) => p.id));
    let id = base;
    for (let i = 2; usados.has(id); i++) id = `${base}-${i}`;
    return id;
  }

  criar(comp: KcxComponente, nome: string, valores: Valores, descricao?: string): PresetUsuario {
    const quando = this.agora().toISOString();
    const p: PresetUsuario = {
      id: this.idLivre(comp.id, nome),
      nome: nome.trim() || 'Meu preset',
      ...(descricao ? { descricao } : {}),
      valores: limparValores(comp, valores),
      componente: comp.id,
      criadoEm: quando,
      atualizadoEm: quando,
    };
    this.gravar([...this.todos(), p]);
    return p;
  }

  duplicar(comp: KcxComponente, origem: KcxPreset): PresetUsuario {
    return this.criar(comp, `${origem.nome} (cópia)`, origem.valores, origem.descricao);
  }

  renomear(componente: string, id: string, nome: string): void {
    this.alterar(componente, id, (p) => ({ ...p, nome: nome.trim() || p.nome }));
  }

  /** Editar = salvar os valores atuais por cima do preset. */
  atualizar(comp: KcxComponente, id: string, valores: Valores): void {
    this.alterar(comp.id, id, (p) => ({ ...p, valores: limparValores(comp, valores) }));
  }

  remover(componente: string, id: string): void {
    this.gravar(this.todos().filter((p) => !(p.componente === componente && p.id === id)));
  }

  private alterar(componente: string, id: string, f: (p: PresetUsuario) => PresetUsuario): void {
    this.gravar(
      this.todos().map((p) =>
        p.componente === componente && p.id === id
          ? { ...f(p), atualizadoEm: this.agora().toISOString() }
          : p,
      ),
    );
  }

  exportar(componente: string, presets: KcxPreset[] = this.listar(componente)): KcxArquivoPresets {
    return {
      formato: 'kcx-presets',
      schemaVersion: KCX_SCHEMA_VERSION,
      componente,
      presets: presets.map(({ id, nome, descricao, valores }) => ({
        id,
        nome,
        ...(descricao ? { descricao } : {}),
        valores,
      })),
    };
  }

  /** Importa um arquivo de presets; valores inválidos são descartados e informados. */
  importar(comp: KcxComponente, texto: string): { importados: PresetUsuario[]; erros: string[] } {
    const erros: string[] = [];
    let arq: KcxArquivoPresets;
    try {
      arq = JSON.parse(texto) as KcxArquivoPresets;
    } catch {
      return { importados: [], erros: ['O arquivo não é um JSON válido.'] };
    }
    if (arq?.formato !== 'kcx-presets' || !Array.isArray(arq.presets)) {
      return {
        importados: [],
        erros: ['Não é um arquivo de presets KCX (formato "kcx-presets").'],
      };
    }
    if (arq.componente !== comp.id) {
      return {
        importados: [],
        erros: [`Os presets são de "${arq.componente}", não de "${comp.id}".`],
      };
    }
    const importados: PresetUsuario[] = [];
    for (const p of arq.presets) {
      const valores: Valores = {};
      for (const [k, val] of Object.entries(p.valores ?? {})) {
        const v = comp.variaveis.find((x) => x.id === k);
        if (!v) erros.push(`${p.nome}: variável "${k}" não existe — ignorada.`);
        else if (validarValor(v, val).length)
          erros.push(`${p.nome}: ${validarValor(v, val)[0]} — ignorado.`);
        else valores[k] = val;
      }
      importados.push(this.criar(comp, String(p.nome ?? 'Preset importado'), valores, p.descricao));
    }
    return { importados, erros };
  }
}

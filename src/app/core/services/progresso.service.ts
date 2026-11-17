import { Injectable, computed, signal } from '@angular/core';
import { Preset, Valores } from '../models/demo.model';

/**
 * Progresso do estudante, salvo no navegador (localStorage).
 * Nada sai do computador: cada navegador guarda o próprio progresso.
 *
 * Chave de demo: "lab:demo" (ex.: "css:hover").
 */
interface Estado {
  executadas: string[];
  desafios: string[];
  /** id da questão → acertou? */
  exercicios: Record<string, boolean>;
  presets: Record<string, Preset[]>;
  ultima?: { lab: string; demo: string };
}

const CHAVE = 'kalixto-lab:progresso:v1';
const VAZIO: Estado = { executadas: [], desafios: [], exercicios: {}, presets: {} };

export const chaveDemo = (lab: string, demo: string) => `${lab}:${demo}`;

@Injectable({ providedIn: 'root' })
export class ProgressoService {
  private readonly estado = signal<Estado>(this.ler());

  readonly executadas = computed(() => new Set(this.estado().executadas));
  readonly desafios = computed(() => new Set(this.estado().desafios));
  readonly exercicios = computed(() => this.estado().exercicios);
  readonly ultima = computed(() => this.estado().ultima);

  foiExecutada(lab: string, demo: string): boolean {
    return this.executadas().has(chaveDemo(lab, demo));
  }

  desafioConcluido(lab: string, demo: string): boolean {
    return this.desafios().has(chaveDemo(lab, demo));
  }

  marcarExecutada(lab: string, demo: string): void {
    const k = chaveDemo(lab, demo);
    this.atualizar((e) => ({
      ...e,
      executadas: e.executadas.includes(k) ? e.executadas : [...e.executadas, k],
      ultima: { lab, demo },
    }));
  }

  concluirDesafio(lab: string, demo: string): void {
    const k = chaveDemo(lab, demo);
    if (this.estado().desafios.includes(k)) return;
    this.atualizar((e) => ({ ...e, desafios: [...e.desafios, k] }));
  }

  responder(questao: string, acertou: boolean): void {
    this.atualizar((e) => ({ ...e, exercicios: { ...e.exercicios, [questao]: acertou } }));
  }

  presets(lab: string, demo: string): Preset[] {
    return this.estado().presets[chaveDemo(lab, demo)] ?? [];
  }

  salvarPreset(lab: string, demo: string, nome: string, valores: Valores): void {
    const k = chaveDemo(lab, demo);
    this.atualizar((e) => {
      const lista = (e.presets[k] ?? []).filter((p) => p.nome !== nome);
      return { ...e, presets: { ...e.presets, [k]: [...lista, { nome, valores: { ...valores } }] } };
    });
  }

  removerPreset(lab: string, demo: string, nome: string): void {
    const k = chaveDemo(lab, demo);
    this.atualizar((e) => ({
      ...e,
      presets: { ...e.presets, [k]: (e.presets[k] ?? []).filter((p) => p.nome !== nome) },
    }));
  }

  zerar(): void {
    this.atualizar(() => ({ ...VAZIO }));
  }

  /* ---------- armazenamento ---------- */

  private atualizar(fn: (e: Estado) => Estado): void {
    this.estado.update(fn);
    try {
      localStorage.setItem(CHAVE, JSON.stringify(this.estado()));
    } catch {
      // Modo anônimo ou armazenamento cheio: o progresso vale só nesta sessão
    }
  }

  private ler(): Estado {
    try {
      const bruto = localStorage.getItem(CHAVE);
      return bruto ? { ...VAZIO, ...JSON.parse(bruto) } : { ...VAZIO };
    } catch {
      return { ...VAZIO };
    }
  }
}

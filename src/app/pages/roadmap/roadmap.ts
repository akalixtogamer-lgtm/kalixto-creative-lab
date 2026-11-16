import { Component } from '@angular/core';
import { FASES, FaseSituacao } from '../../core/data/roadmap.data';
import { PageHeader } from '../../shared/components/page-header/page-header';

/** Linha do tempo das 6 fases do roadmap + critérios de passagem. */
@Component({
  selector: 'kx-roadmap',
  imports: [PageHeader],
  templateUrl: './roadmap.html',
  styleUrl: './roadmap.css',
})
export class Roadmap {
  protected readonly fases = FASES;

  protected readonly rotulos: Record<FaseSituacao, string> = {
    'em-andamento': 'Em andamento',
    proxima: 'Próxima',
    futura: 'Futura',
    concluida: 'Concluída',
  };

  /** Critérios de passagem entre fases (seção 16). */
  protected readonly criterios = [
    'Funcionalidade implementada',
    'Demonstração executável',
    'Código-fonte disponível',
    'Explicação didática',
    'Controles funcionando',
    'Responsividade validada',
    'Ausência de erros críticos',
    'Performance aceitável',
    'Documentação atualizada',
  ];
}

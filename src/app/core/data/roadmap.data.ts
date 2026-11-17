/**
 * Fases do roadmap (seção 15 do briefing).
 * Atualize `situacao` somente depois de validar os critérios da seção 16.
 */
export type FaseSituacao = 'em-andamento' | 'proxima' | 'futura' | 'concluida';

export interface Fase {
  numero: number;
  titulo: string;
  situacao: FaseSituacao;
  entregas: string[];
  criterio: string;
}

export const FASES: Fase[] = [
  {
    numero: 1,
    titulo: 'Fundação Angular',
    situacao: 'concluida',
    entregas: [
      'Configuração do Angular',
      'Verificação das versões e dependências',
      'Arquitetura de componentes',
      'Design System Kalixto',
      'Dashboard',
      'Navegação',
      'Estrutura da biblioteca de efeitos',
    ],
    criterio: 'Aplicação executável, arquitetura organizada e navegação funcional.',
  },
  {
    numero: 2,
    titulo: 'MVP Funcional',
    situacao: 'concluida',
    entregas: [
      'CSS Playground — pronto para testar',
      'GSAP Studio — pronto para testar',
      'Scroll Lab — pronto para testar',
      'Code Viewer',
      'Documentação dos efeitos',
      'Controles interativos',
      'Botões de execução e reinicialização',
      'Testes funcionais',
    ],
    criterio: 'Os três laboratórios funcionais e validados.',
  },
  {
    numero: 3,
    titulo: 'Organização Educacional',
    situacao: 'concluida',
    entregas: [
      'Biblioteca de efeitos',
      'SVG Lab',
      'Comparador de tecnologias',
      'Trilha de aprendizagem',
      'Exercícios e desafios',
      'Presets',
      'Persistência local do progresso',
    ],
    criterio: 'Estudar, consultar, comparar e experimentar os efeitos já implementados.',
  },
  {
    numero: 4,
    titulo: 'Three.js e Experiências 3D',
    situacao: 'concluida',
    entregas: ['Cenas, câmeras, luzes, materiais', 'Raycasting', 'Modelos GLTF/GLB'],
    criterio: 'Laboratório 3D funcional, com controles e demonstrações documentadas.',
  },
  {
    numero: 5,
    titulo: 'WebGL e GLSL',
    situacao: 'futura',
    entregas: ['Vertex e Fragment Shaders', 'Noise e Distortion', 'Transições com shaders'],
    criterio: 'Demonstrações gráficas avançadas com documentação e código funcional.',
  },
  {
    numero: 6,
    titulo: 'Otimização e Consolidação',
    situacao: 'futura',
    entregas: ['QA completo', 'Acessibilidade e performance', 'Documentação final', 'Deploy'],
    criterio: 'Projeto pronto para publicação.',
  },
];

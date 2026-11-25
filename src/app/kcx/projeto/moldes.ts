/**
 * Moldes de página por área (dança, games, livros…): páginas já montadas com
 * componentes do construtor, textos da área, uma Fundação sugerida (cores e
 * fontes) e as animações que combinam. TS puro: a página só salva o resultado.
 */
import {
  ConfigConstrutor,
  configPadrao,
  montarDoConstrutor,
  slug,
  temMarca,
  tipoConstrutor,
} from '../construtor';
import {
  FUNDACAO_PADRAO,
  KcxFundacao,
  TokenCor,
  completarFundacao,
  construtorDaFundacao,
} from '../fundacao';
import { KcxComponente } from '../kcx.types';
import { idLivre } from '../meus-componentes';
import { Ligacao, novoId } from './navegacao';

export interface SecaoMolde {
  /** Tipo do construtor (navbar, hero, carrossel…). */
  tipo: string;
  /** Nome do componente (aparece nas Telas). */
  nome: string;
  textos?: Record<string, string>;
  itens?: string[];
  subItens?: string[];
  porTela?: number;
}

export interface PaginaMolde {
  nome: string;
  secoes: SecaoMolde[];
}

export interface Molde {
  id: string;
  area: string;
  nome: string;
  descricao: string;
  /** Cores do tema escuro (o claro mantém fundo e texto do padrão). */
  cores: Partial<Record<TokenCor, string>>;
  fontes: { titulo: string; corpo: string };
  /** Ids da Biblioteca de efeitos que combinam com a área. */
  animacoes: string[];
  paginas: PaginaMolde[];
}

/* ------------------------------- Os moldes ------------------------------- */

const navbar = (marca: string, itens: string[], cta: string): SecaoMolde => ({
  tipo: 'navbar',
  nome: 'Navbar',
  textos: { marca, cta },
  itens,
});
const rodape = (marca: string, frase: string, itens: string[]): SecaoMolde => ({
  tipo: 'rodape',
  nome: 'Rodapé',
  textos: { marca, frase, direitos: `© 2026 ${marca}. Todos os direitos reservados.` },
  itens,
});

export const MOLDES: Molde[] = [
  {
    id: 'danca',
    area: 'Dança',
    nome: 'Estúdio de dança',
    descricao: 'Turmas, aulas em vídeo, planos e agendamento de aula experimental.',
    cores: {
      primaria: '#e0115f',
      secundaria: '#ffb703',
      destaque: '#00d1b2',
      fundo: '#14080f',
      superficie: '#241520',
      borda: '#4a2b3d',
      texto: '#fff4f8',
      'texto-suave': '#d2b3c2',
      'sobre-primaria': '#ffffff',
    },
    fontes: { titulo: 'Bebas Neue', corpo: 'Poppins' },
    animacoes: ['kinetic-captions', 'echo-text', 'sticky-stack', 'ripple-halo', 'magnetic-button'],
    paginas: [
      {
        nome: 'Início',
        secoes: [
          navbar('Ritmo Estúdio', ['Turmas', 'Planos', 'Contato'], 'Aula grátis'),
          {
            tipo: 'hero',
            nome: 'Hero',
            textos: {
              selo: 'Matrículas abertas',
              titulo: 'Dance do seu jeito, no seu ritmo',
              subtitulo: 'Samba, forró, hip hop e dança de salão para todos os níveis.',
              botao1: 'Agendar aula grátis',
              botao2: 'Ver horários',
            },
          },
          {
            tipo: 'carrossel',
            nome: 'Turmas',
            itens: ['Samba no pé', 'Forró', 'Hip hop', 'Dança de salão', 'Jazz funk'],
            subItens: ['Seg e qua · 19h', 'Ter · 20h', 'Sáb · 10h', 'Qui · 19h', 'Sex · 18h'],
            porTela: 3,
          },
          {
            tipo: 'card-video',
            nome: 'Aula em vídeo',
            textos: {
              titulo: 'Passo básico do forró',
              subtitulo: 'Forró · aula 1',
              texto: 'Treine em casa antes da primeira aula.',
              tempo: '3:42',
            },
          },
          {
            tipo: 'formulario',
            nome: 'Agendamento',
            textos: {
              titulo: 'Agende sua aula experimental',
              rotulo: 'Seu e-mail',
              botao: 'Quero dançar',
              erro: 'Digite um e-mail válido.',
              sucesso: 'Pronto! Enviamos os horários.',
            },
          },
          rodape('Ritmo Estúdio', 'Dança para todos os corpos e idades.', [
            'Turmas',
            'Planos',
            'Contato',
          ]),
        ],
      },
      {
        nome: 'Planos',
        secoes: [
          navbar('Ritmo Estúdio', ['Turmas', 'Planos', 'Contato'], 'Aula grátis'),
          {
            tipo: 'seletor-duplo',
            nome: 'Mensal ou avulso',
            textos: { opcaoA: 'Mensal', opcaoB: 'Aula avulsa' },
          },
          {
            tipo: 'card-preco',
            nome: 'Plano',
            textos: {
              plano: 'Plano Livre',
              preco: 'R$ 149',
              periodo: '/mês',
              descricao: 'Todas as turmas, quantas vezes quiser.',
              botao: 'Assinar',
            },
            itens: ['Aulas ilimitadas', 'Aulão mensal', 'Vídeos das aulas'],
          },
          {
            tipo: 'acordeao',
            nome: 'Dúvidas',
            itens: ['Preciso ter experiência?', 'Qual roupa usar?', 'Posso trocar de turma?'],
          },
          rodape('Ritmo Estúdio', 'Dança para todos os corpos e idades.', [
            'Turmas',
            'Planos',
            'Contato',
          ]),
        ],
      },
    ],
  },
  {
    id: 'games',
    area: 'Games',
    nome: 'Lançamento de jogo',
    descricao: 'Trailer, personagens, plataformas, inscrição no torneio e pré-venda.',
    cores: {
      primaria: '#7c3aed',
      secundaria: '#22d3ee',
      destaque: '#f43f5e',
      fundo: '#07070f',
      superficie: '#12122a',
      borda: '#2c2c5a',
      texto: '#eef0ff',
      'texto-suave': '#a3a9d6',
      'sobre-primaria': '#ffffff',
    },
    fontes: { titulo: 'Orbitron', corpo: 'Rajdhani' },
    animacoes: [
      'glitch-text',
      'particle-field',
      'depth-zoom-title',
      'spotlight-cards',
      'preloader-counter',
    ],
    paginas: [
      {
        nome: 'Início',
        secoes: [
          navbar('NEON RIFT', ['Jogo', 'Torneio', 'Pré-venda'], 'Jogar agora'),
          {
            tipo: 'hero',
            nome: 'Hero',
            textos: {
              selo: 'Temporada 1',
              titulo: 'Entre na fenda. Saia lenda.',
              subtitulo: 'Batalhas 5v5 em arenas que mudam a cada partida.',
              botao1: 'Baixar grátis',
              botao2: 'Ver trailer',
            },
          },
          {
            tipo: 'card-video',
            nome: 'Trailer',
            textos: {
              titulo: 'Trailer oficial',
              subtitulo: 'Temporada 1',
              texto: 'Conheça as novas arenas e os heróis.',
              tempo: '1:58',
            },
          },
          {
            tipo: 'galeria',
            nome: 'Personagens',
            itens: ['Vex', 'Kaira', 'Bolt', 'Nyx', 'Ronin', 'Echo'],
          },
          { tipo: 'abas', nome: 'Plataformas', itens: ['PC', 'Console', 'Celular'] },
          rodape('NEON RIFT', 'Um jogo de arena competitivo.', ['Jogo', 'Torneio', 'Suporte']),
        ],
      },
      {
        nome: 'Torneio',
        secoes: [
          navbar('NEON RIFT', ['Jogo', 'Torneio', 'Pré-venda'], 'Jogar agora'),
          {
            tipo: 'stepper',
            nome: 'Inscrição',
            textos: { proximo: 'Continuar' },
            itens: ['Time', 'Jogadores', 'Confirmação'],
          },
          {
            tipo: 'formulario',
            nome: 'Inscrição do time',
            textos: {
              titulo: 'Inscreva seu time',
              rotulo: 'E-mail do capitão',
              botao: 'Inscrever',
              erro: 'Digite um e-mail válido.',
              sucesso: 'Time inscrito!',
            },
          },
          {
            tipo: 'acordeao',
            nome: 'Regras',
            itens: ['Quem pode jogar?', 'Qual a premiação?', 'Como funcionam as chaves?'],
          },
          rodape('NEON RIFT', 'Um jogo de arena competitivo.', ['Jogo', 'Torneio', 'Suporte']),
        ],
      },
    ],
  },
  {
    id: 'livros',
    area: 'Livros',
    nome: 'Autor e livraria',
    descricao: 'Lançamento do livro, trechos, clube de leitura e compra.',
    cores: {
      primaria: '#b5502f',
      secundaria: '#5b7f66',
      destaque: '#d9a441',
      fundo: '#1b1714',
      superficie: '#2a241f',
      borda: '#4a3f35',
      texto: '#f7efe3',
      'texto-suave': '#c9baa6',
      'sobre-primaria': '#ffffff',
    },
    fontes: { titulo: 'Playfair Display', corpo: 'Lora' },
    animacoes: [
      'text-reveal',
      'curtain-reveal',
      'image-ribbon',
      'scroll-reveal',
      'hover-image-list',
    ],
    paginas: [
      {
        nome: 'Início',
        secoes: [
          navbar('Marina Alves', ['Livros', 'Clube', 'Agenda'], 'Comprar'),
          {
            tipo: 'hero',
            nome: 'Hero',
            textos: {
              selo: 'Lançamento',
              titulo: 'O mar guarda os nomes',
              subtitulo: 'Um romance sobre memória, família e o litoral do Rio.',
              botao1: 'Comprar o livro',
              botao2: 'Ler um trecho',
            },
          },
          {
            tipo: 'carrossel',
            nome: 'Livros',
            itens: ['O mar guarda os nomes', 'Casa de vidro', 'Cartas para depois', 'Areia fina'],
            subItens: ['Romance · 2026', 'Contos · 2023', 'Crônicas · 2021', 'Poesia · 2019'],
            porTela: 3,
          },
          {
            tipo: 'card-foto',
            nome: 'Sobre a autora',
            textos: {
              titulo: 'Marina Alves',
              subtitulo: 'Escritora carioca',
              texto: 'Quatro livros publicados e um clube de leitura com 2 mil leitores.',
              botao: 'Conhecer',
            },
          },
          {
            tipo: 'formulario',
            nome: 'Newsletter',
            textos: {
              titulo: 'Receba um capítulo grátis',
              rotulo: 'Seu e-mail',
              botao: 'Quero ler',
              erro: 'Digite um e-mail válido.',
              sucesso: 'Confira seu e-mail!',
            },
          },
          rodape('Marina Alves', 'Histórias que cabem no bolso.', ['Livros', 'Clube', 'Imprensa']),
        ],
      },
      {
        nome: 'Clube',
        secoes: [
          navbar('Marina Alves', ['Livros', 'Clube', 'Agenda'], 'Comprar'),
          {
            tipo: 'card-preco',
            nome: 'Assinatura do clube',
            textos: {
              plano: 'Clube do mês',
              preco: 'R$ 59',
              periodo: '/mês',
              descricao: 'Um livro por mês e encontros online.',
              botao: 'Entrar no clube',
            },
            itens: ['1 livro por mês', 'Encontro com a autora', 'Marcador exclusivo'],
          },
          {
            tipo: 'acordeao',
            nome: 'Perguntas',
            itens: ['Como recebo o livro?', 'Posso cancelar?', 'Os encontros ficam gravados?'],
          },
          rodape('Marina Alves', 'Histórias que cabem no bolso.', ['Livros', 'Clube', 'Imprensa']),
        ],
      },
    ],
  },
  {
    id: 'musica',
    area: 'Música',
    nome: 'Artista e shows',
    descricao: 'Novo single, agenda de shows, vídeos e ingressos.',
    cores: {
      primaria: '#c43d0c',
      secundaria: '#7c3aed',
      destaque: '#facc15',
      fundo: '#0c0a10',
      superficie: '#1a1622',
      borda: '#352c44',
      texto: '#fbf7ff',
      'texto-suave': '#b9b0c8',
      'sobre-primaria': '#ffffff',
    },
    fontes: { titulo: 'Anton', corpo: 'Inter' },
    animacoes: ['light-beams', 'kinetic-captions', 'ripple-halo', 'image-sequence', 'glow-button'],
    paginas: [
      {
        nome: 'Início',
        secoes: [
          navbar('LUA NOVA', ['Música', 'Shows', 'Loja'], 'Ingressos'),
          {
            tipo: 'hero',
            nome: 'Hero',
            textos: {
              selo: 'Novo single',
              titulo: 'Céu de neon',
              subtitulo: 'Já nas plataformas. Turnê pelo Brasil a partir de março.',
              botao1: 'Ouvir agora',
              botao2: 'Ver shows',
            },
          },
          {
            tipo: 'card-video',
            nome: 'Clipe',
            textos: {
              titulo: 'Céu de neon (clipe)',
              subtitulo: 'Lua Nova',
              texto: 'Gravado ao vivo no Circo Voador.',
              tempo: '4:12',
            },
          },
          {
            tipo: 'carrossel',
            nome: 'Agenda',
            itens: ['Rio de Janeiro', 'São Paulo', 'Belo Horizonte', 'Salvador'],
            subItens: [
              '12 mar · Circo Voador',
              '19 mar · Audio',
              '26 mar · Mister Rock',
              '2 abr · Concha Acústica',
            ],
            porTela: 3,
          },
          rodape('LUA NOVA', 'Música para dançar de olhos fechados.', [
            'Música',
            'Shows',
            'Contato',
          ]),
        ],
      },
      {
        nome: 'Shows',
        secoes: [
          navbar('LUA NOVA', ['Música', 'Shows', 'Loja'], 'Ingressos'),
          {
            tipo: 'banner',
            nome: 'Aviso',
            textos: { texto: 'Rio esgotado! Sessão extra no dia 13.', link: 'Comprar' },
          },
          {
            tipo: 'select',
            nome: 'Cidade',
            textos: { rotulo: 'Escolha a cidade' },
            itens: ['Rio de Janeiro', 'São Paulo', 'Belo Horizonte', 'Salvador'],
          },
          {
            tipo: 'card-preco',
            nome: 'Ingresso',
            textos: {
              plano: 'Pista',
              preco: 'R$ 90',
              periodo: 'meia',
              descricao: 'Entrada a partir das 21h.',
              botao: 'Comprar',
            },
            itens: ['Acesso à pista', 'Meet & greet por sorteio'],
          },
          rodape('LUA NOVA', 'Música para dançar de olhos fechados.', [
            'Música',
            'Shows',
            'Contato',
          ]),
        ],
      },
    ],
  },
  {
    id: 'cafe',
    area: 'Café e restaurante',
    nome: 'Cafeteria',
    descricao: 'Cardápio, grãos da casa, clube de assinatura e reservas.',
    cores: {
      primaria: '#a65a2a',
      secundaria: '#4b6b4f',
      destaque: '#e8b04b',
      fundo: '#17110d',
      superficie: '#261c16',
      borda: '#45352a',
      texto: '#f6ece2',
      'texto-suave': '#c8b4a1',
      'sobre-primaria': '#ffffff',
    },
    fontes: { titulo: 'DM Serif Display', corpo: 'DM Sans' },
    animacoes: [
      'image-sequence',
      'arch-window-reveal',
      'sticky-stack',
      'spotlight-cards',
      'scroll-reveal',
    ],
    paginas: [
      {
        nome: 'Início',
        secoes: [
          navbar('Origem Café', ['Cardápio', 'Grãos', 'Clube'], 'Reservar'),
          {
            tipo: 'hero',
            nome: 'Hero',
            textos: {
              selo: 'Torra da semana',
              titulo: 'Café que nasce no grão',
              subtitulo: 'Grãos de pequenos produtores, torrados aqui na casa.',
              botao1: 'Ver cardápio',
              botao2: 'Reservar mesa',
            },
          },
          {
            tipo: 'galeria',
            nome: 'Cardápio',
            itens: [
              'Espresso',
              'Cold brew',
              'Cappuccino',
              'Pão de queijo',
              'Bolo de fubá',
              'Torrada da casa',
            ],
          },
          {
            tipo: 'card-preco',
            nome: 'Clube do café',
            textos: {
              plano: 'Clube Origem',
              preco: 'R$ 79',
              periodo: '/mês',
              descricao: '500 g de café especial em casa todo mês.',
              botao: 'Assinar',
            },
            itens: ['Grão ou moído', 'Frete grátis no Rio', '10% na loja'],
          },
          rodape('Origem Café', 'Botafogo, Rio de Janeiro · todos os dias, 8h às 20h.', [
            'Cardápio',
            'Clube',
            'Contato',
          ]),
        ],
      },
      {
        nome: 'Reservas',
        secoes: [
          navbar('Origem Café', ['Cardápio', 'Grãos', 'Clube'], 'Reservar'),
          {
            tipo: 'radio',
            nome: 'Horário',
            textos: { titulo: 'Qual horário?' },
            itens: ['Café da manhã', 'Almoço', 'Fim de tarde'],
          },
          {
            tipo: 'formulario',
            nome: 'Reserva',
            textos: {
              titulo: 'Reserve sua mesa',
              rotulo: 'Seu e-mail',
              botao: 'Reservar',
              erro: 'Digite um e-mail válido.',
              sucesso: 'Reserva enviada!',
            },
          },
          rodape('Origem Café', 'Botafogo, Rio de Janeiro · todos os dias, 8h às 20h.', [
            'Cardápio',
            'Clube',
            'Contato',
          ]),
        ],
      },
    ],
  },
  {
    id: 'moda',
    area: 'Moda',
    nome: 'Marca de moda',
    descricao: 'Coleção, lookbook, compra e lista de espera.',
    cores: {
      primaria: '#f5f5f4',
      secundaria: '#a8a29e',
      destaque: '#c9a227',
      fundo: '#0a0a0a',
      superficie: '#171717',
      borda: '#2e2e2e',
      texto: '#fafafa',
      'texto-suave': '#a3a3a3',
      'sobre-primaria': '#111111',
    },
    fontes: { titulo: 'Cormorant Garamond', corpo: 'Montserrat' },
    animacoes: [
      'depth-zoom-title',
      'theme-wipe',
      'image-distortion',
      'expanding-gallery',
      'custom-cursor',
    ],
    paginas: [
      {
        nome: 'Início',
        secoes: [
          navbar('ATELIÊ ONDA', ['Coleção', 'Lookbook', 'Lojas'], 'Comprar'),
          {
            tipo: 'hero',
            nome: 'Hero',
            textos: {
              selo: 'Verão 2027',
              titulo: 'Leve como a maré',
              subtitulo: 'Linho, algodão orgânico e cores do litoral.',
              botao1: 'Ver coleção',
              botao2: 'Lookbook',
            },
          },
          {
            tipo: 'galeria',
            nome: 'Coleção',
            itens: [
              'Vestido Areia',
              'Camisa Brisa',
              'Calça Duna',
              'Saia Concha',
              'Blazer Névoa',
              'Bolsa Rede',
            ],
          },
          {
            tipo: 'carrossel',
            nome: 'Lookbook',
            itens: ['Manhã na praia', 'Fim de tarde', 'Noite de verão'],
            subItens: ['Look 01', 'Look 02', 'Look 03'],
            porTela: 1,
          },
          rodape('ATELIÊ ONDA', 'Moda feita devagar, no Rio.', ['Coleção', 'Trocas', 'Contato']),
        ],
      },
      {
        nome: 'Lista de espera',
        secoes: [
          navbar('ATELIÊ ONDA', ['Coleção', 'Lookbook', 'Lojas'], 'Comprar'),
          {
            tipo: 'formulario',
            nome: 'Lista de espera',
            textos: {
              titulo: 'Seja a primeira a saber',
              rotulo: 'Seu e-mail',
              botao: 'Entrar na lista',
              erro: 'Digite um e-mail válido.',
              sucesso: 'Você está na lista!',
            },
          },
          {
            tipo: 'acordeao',
            nome: 'Trocas e envio',
            itens: ['Qual o prazo de entrega?', 'Como faço uma troca?', 'Vocês têm loja física?'],
          },
          rodape('ATELIÊ ONDA', 'Moda feita devagar, no Rio.', ['Coleção', 'Trocas', 'Contato']),
        ],
      },
    ],
  },
  {
    id: 'curso',
    area: 'Curso e educação',
    nome: 'Curso online',
    descricao: 'Trilha de módulos, aula grátis, preço e dúvidas.',
    cores: {
      primaria: '#2563eb',
      secundaria: '#10b981',
      destaque: '#f59e0b',
      fundo: '#0b1020',
      superficie: '#141b31',
      borda: '#2a3560',
      texto: '#eef2ff',
      'texto-suave': '#aab5d6',
      'sobre-primaria': '#ffffff',
    },
    fontes: { titulo: 'Sora', corpo: 'Inter' },
    animacoes: [
      'step-unlock',
      'typewriter-prompt',
      'gauge-meter',
      'scroll-progress',
      'text-reveal',
    ],
    paginas: [
      {
        nome: 'Início',
        secoes: [
          navbar('Código Livre', ['Curso', 'Módulos', 'Preço'], 'Começar'),
          {
            tipo: 'hero',
            nome: 'Hero',
            textos: {
              selo: 'Turma de março',
              titulo: 'Do zero ao primeiro site em 8 semanas',
              subtitulo: 'HTML, CSS, JavaScript e Angular com projetos reais.',
              botao1: 'Assistir aula grátis',
              botao2: 'Ver módulos',
            },
          },
          {
            tipo: 'stepper',
            nome: 'Trilha',
            textos: { proximo: 'Próximo módulo' },
            itens: ['HTML', 'CSS', 'JavaScript', 'Angular', 'Projeto final'],
          },
          {
            tipo: 'card-video',
            nome: 'Aula grátis',
            textos: {
              titulo: 'Seu primeiro HTML',
              subtitulo: 'Módulo 1 · aula 1',
              texto: 'Uma página no ar em 15 minutos.',
              tempo: '14:30',
            },
          },
          rodape('Código Livre', 'Ensino de programação para quem está começando.', [
            'Curso',
            'Bolsas',
            'Contato',
          ]),
        ],
      },
      {
        nome: 'Preço',
        secoes: [
          navbar('Código Livre', ['Curso', 'Módulos', 'Preço'], 'Começar'),
          {
            tipo: 'seletor-duplo',
            nome: 'À vista ou parcelado',
            textos: { opcaoA: 'À vista', opcaoB: 'Parcelado' },
          },
          {
            tipo: 'card-preco',
            nome: 'Plano completo',
            textos: {
              plano: 'Completo',
              preco: 'R$ 497',
              periodo: 'ou 12x R$ 49',
              descricao: 'Todos os módulos e mentoria em grupo.',
              botao: 'Matricular',
            },
            itens: ['8 módulos', 'Mentoria semanal', 'Certificado'],
          },
          {
            tipo: 'acordeao',
            nome: 'Dúvidas',
            itens: [
              'Preciso saber programar?',
              'Por quanto tempo tenho acesso?',
              'Tem certificado?',
            ],
          },
          rodape('Código Livre', 'Ensino de programação para quem está começando.', [
            'Curso',
            'Bolsas',
            'Contato',
          ]),
        ],
      },
    ],
  },
  {
    id: 'portfolio',
    area: 'Portfólio',
    nome: 'Portfólio criativo',
    descricao: 'Apresentação, projetos, serviços e contato.',
    cores: {
      ...Object.fromEntries(Object.entries(FUNDACAO_PADRAO.cores).map(([k, v]) => [k, v.escuro])),
    },
    fontes: { titulo: FUNDACAO_PADRAO.fontes.titulo, corpo: FUNDACAO_PADRAO.fontes.corpo },
    animacoes: [
      'preloader-counter',
      'text-scramble',
      'hover-image-list',
      'custom-cursor',
      'magnetic-button',
    ],
    paginas: [
      {
        nome: 'Início',
        secoes: [
          navbar('Seu Nome', ['Projetos', 'Serviços', 'Contato'], 'Falar comigo'),
          {
            tipo: 'hero',
            nome: 'Hero',
            textos: {
              selo: 'Disponível para projetos',
              titulo: 'Design e código que se mexem',
              subtitulo: 'Sites, interfaces e animações para marcas com personalidade.',
              botao1: 'Ver projetos',
              botao2: 'Contato',
            },
          },
          {
            tipo: 'galeria',
            nome: 'Projetos',
            itens: ['Café Origem', 'Neon Rift', 'Ritmo Estúdio', 'Ateliê Onda'],
          },
          { tipo: 'abas', nome: 'Serviços', itens: ['Sites', 'Interfaces', 'Motion'] },
          rodape('Seu Nome', 'Rio de Janeiro · trabalho remoto.', [
            'Projetos',
            'GitHub',
            'LinkedIn',
          ]),
        ],
      },
      {
        nome: 'Contato',
        secoes: [
          navbar('Seu Nome', ['Projetos', 'Serviços', 'Contato'], 'Falar comigo'),
          {
            tipo: 'formulario',
            nome: 'Contato',
            textos: {
              titulo: 'Vamos conversar?',
              rotulo: 'Seu e-mail',
              botao: 'Enviar',
              erro: 'Digite um e-mail válido.',
              sucesso: 'Mensagem enviada!',
            },
          },
          rodape('Seu Nome', 'Rio de Janeiro · trabalho remoto.', [
            'Projetos',
            'GitHub',
            'LinkedIn',
          ]),
        ],
      },
    ],
  },
];

/* ------------------------------ Construção ------------------------------ */

/** Fundação sugerida pelo molde: cores do tema escuro, marca também no claro, e as fontes. */
export function fundacaoDoMolde(m: Molde): KcxFundacao {
  const f = structuredClone(FUNDACAO_PADRAO);
  f.nome = m.nome;
  for (const [t, cor] of Object.entries(m.cores) as [TokenCor, string][]) {
    f.cores[t].escuro = cor;
    if (['primaria', 'secundaria', 'destaque', 'sobre-primaria'].includes(t))
      f.cores[t].claro = cor;
  }
  f.fontes = { ...f.fontes, titulo: m.fontes.titulo, corpo: m.fontes.corpo };
  return completarFundacao(f);
}

/** Config do construtor de uma seção, com os tokens da fundação e a logo (se houver). */
export function configDaSecao(s: SecaoMolde, f: KcxFundacao): ConfigConstrutor | null {
  const def = tipoConstrutor(s.tipo);
  if (!def) return null;
  const base = configPadrao(def, s.nome);
  const cfg: ConfigConstrutor = { ...base, ...construtorDaFundacao(f) };
  for (const t of def.textos) if (s.textos?.[t.id] !== undefined) cfg.textos[t.id] = s.textos[t.id];
  if (def.itens && s.itens?.length)
    cfg.itens = s.itens
      .slice(0, def.itens.max)
      .concat(def.itens.padrao)
      .slice(0, Math.max(def.itens.min, Math.min(def.itens.max, s.itens.length)));
  if (s.subItens) cfg.subItens = s.subItens.slice(0, cfg.itens.length);
  if (s.porTela) cfg.porTela = s.porTela;
  if (f.logo && temMarca(def)) cfg.logo = f.logo;
  return cfg;
}

/**
 * Troca o tipo de um componente criado no construtor, mantendo nome, cores,
 * textos com o mesmo nome e a lista (ex.: Galeria → Carrossel).
 */
export function trocarTipo(cfg: ConfigConstrutor, novoTipo: string): ConfigConstrutor | null {
  const def = tipoConstrutor(novoTipo);
  if (!def) return null;
  const base = configPadrao(def, cfg.nome);
  const novo: ConfigConstrutor = {
    ...base,
    cores: { ...cfg.cores },
    raio: cfg.raio,
    ...(cfg.temaOposto ? { temaOposto: cfg.temaOposto } : {}),
    ...(cfg.corSuave ? { corSuave: cfg.corSuave } : {}),
    ...(cfg.logo && temMarca(def) ? { logo: cfg.logo } : {}),
  };
  for (const t of def.textos)
    if (cfg.textos[t.id] !== undefined) novo.textos[t.id] = cfg.textos[t.id];
  // Títulos parecidos com outro nome (ex.: "titulo" ↔ "plano").
  const primeiro = cfg.textos['titulo'] ?? cfg.textos['plano'] ?? cfg.textos['rotulo'];
  for (const k of ['titulo', 'plano', 'rotulo'])
    if (primeiro && def.textos.some((t) => t.id === k) && cfg.textos[k] === undefined)
      novo.textos[k] = primeiro;
  if (def.itens && cfg.itens.length) {
    const lista = [...cfg.itens];
    while (lista.length < def.itens.min)
      lista.push(def.itens.padrao[lista.length] ?? `Item ${lista.length + 1}`);
    novo.itens = lista.slice(0, def.itens.max);
    if (cfg.subItens) novo.subItens = cfg.subItens.slice(0, novo.itens.length);
  }
  if (cfg.porTela) novo.porTela = cfg.porTela;
  return novo;
}

/** Tipos que fazem papel parecido (sugestões para trocar uma seção). */
export const TROCAS_SUGERIDAS: Record<string, string[]> = {
  navbar: ['menu-sanduiche', 'mega-menu'],
  'menu-sanduiche': ['navbar', 'menu-lateral'],
  'mega-menu': ['navbar'],
  hero: ['card-foto', 'card-video', 'banner', 'efeito-web'],
  carrossel: ['galeria', 'abas', 'card-foto', 'efeito-web'],
  galeria: ['carrossel', 'abas', 'efeito-web'],
  'card-foto': ['card-video', 'carrossel', 'hero'],
  'card-video': ['card-foto', 'hero'],
  'card-preco': ['card-foto', 'acordeao'],
  acordeao: ['abas', 'galeria'],
  abas: ['acordeao', 'carrossel'],
  formulario: ['login', 'modal'],
  login: ['formulario'],
  stepper: ['abas', 'breadcrumb'],
  'seletor-duplo': ['switch', 'radio'],
  radio: ['select', 'seletor-duplo'],
  select: ['radio', 'dropdown'],
  banner: ['toast', 'hero'],
  rodape: ['navbar'],
  // Efeitos reconstruídos de referências podem entrar no lugar de seções de conteúdo.
  'efeito-web': ['hero', 'carrossel', 'galeria'],
};

export interface ResultadoMolde {
  fundacao: KcxFundacao;
  componentes: KcxComponente[];
  paginas: { nome: string; secoes: string[] }[];
  /** Ligações do mapa: do início para cada página (menu) e de volta (logo). */
  ligacoes: (Omit<Ligacao, 'de' | 'para'> & { de: number; para: number })[];
  erros: string[];
}

/** Monta as páginas do molde: um componente por seção (repetidas são reaproveitadas). */
export function montarMolde(m: Molde, f: KcxFundacao, idsOcupados: string[]): ResultadoMolde {
  const ocupados = [...idsOcupados];
  const componentes: KcxComponente[] = [];
  const porAssinatura = new Map<string, string>();
  const erros: string[] = [];
  const paginas = m.paginas.map((p) => ({
    nome: p.nome,
    secoes: p.secoes
      .map((s) => {
        const chave = JSON.stringify(s);
        if (porAssinatura.has(chave)) return porAssinatura.get(chave)!;
        const cfg = configDaSecao(s, f);
        if (!cfg) {
          erros.push(`Tipo "${s.tipo}" não existe.`);
          return null;
        }
        const id = idLivre(slug(`${m.id} ${s.nome}`), ocupados);
        ocupados.push(id);
        try {
          const comp = montarDoConstrutor({ ...cfg, id });
          componentes.push(comp);
          porAssinatura.set(chave, id);
          return id;
        } catch (e) {
          erros.push(`${s.nome}: ${(e as Error).message}`);
          return null;
        }
      })
      .filter((x): x is string => !!x),
  }));
  const ligacoes = paginas.slice(1).flatMap((p, i) => [
    { id: novoId('lig'), de: 0, para: i + 1, gatilho: `Menu → ${p.nome}` },
    { id: novoId('lig'), de: i + 1, para: 0, gatilho: 'Logo' },
  ]);
  return { fundacao: f, componentes, paginas, ligacoes, erros };
}

/** Prévia sem salvar: os componentes da primeira página. */
export function previaMolde(m: Molde, f: KcxFundacao): KcxComponente[] {
  return m.paginas[0].secoes
    .map((s, i) => {
      const cfg = configDaSecao(s, f);
      if (!cfg) return null;
      try {
        return montarDoConstrutor({ ...cfg, id: `previa-${m.id}-${i}` });
      } catch {
        return null;
      }
    })
    .filter((c): c is KcxComponente => !!c);
}

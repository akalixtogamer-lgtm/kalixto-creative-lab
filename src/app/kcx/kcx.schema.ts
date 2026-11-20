/**
 * JSON Schema (draft 2020-12) do formato KCX 1.0.0.
 * Descreve a forma do arquivo para outras ferramentas. As regras de
 * significado (vínculos obrigatórios, referências, valores por tipo) ficam
 * em validar.ts. Publicado em docs/kcx/kcx.schema.json (`npm run kcx:schema`).
 */
import { KCX_SCHEMA_VERSION } from './kcx.types';

const ref = (nome: string) => ({ $ref: `#/$defs/${nome}` });
const texto = { type: 'string', minLength: 1 };
const semver = { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+(?:-[0-9A-Za-z.-]+)?$' };
const kref = (base: object) => ({
  oneOf: [
    base,
    {
      type: 'object',
      required: ['$var'],
      properties: { $var: { type: 'string' } },
      additionalProperties: false,
    },
    {
      type: 'object',
      required: ['$derivado', 'nome'],
      properties: {
        $derivado: { type: 'string' },
        nome: texto,
        transformar: { type: 'array', items: ref('operacao') },
      },
      additionalProperties: false,
    },
  ],
});

export const KCX_JSON_SCHEMA = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'https://akalixtogamer-lgtm.github.io/kalixto-creative-lab/kcx/kcx.schema.json',
  title: `KCX — Kalixto Component Exchange ${KCX_SCHEMA_VERSION}`,
  description: 'Formato aberto de troca de componentes animados com variáveis funcionais.',
  type: 'object',
  required: [
    'formato',
    'schemaVersion',
    'id',
    'versao',
    'nome',
    'criadoEm',
    'origem',
    'exportacao',
    'componentes',
    'dependencias',
    'historico',
  ],
  properties: {
    formato: { const: 'kcx' },
    schemaVersion: semver,
    id: texto,
    versao: semver,
    nome: texto,
    criadoEm: { type: 'string', format: 'date-time' },
    origem: {
      type: 'object',
      required: ['ferramenta', 'versao'],
      properties: { ferramenta: texto, versao: texto, url: { type: 'string' } },
    },
    exportacao: {
      type: 'object',
      required: ['modo'],
      properties: {
        modo: { enum: ['completo', 'visual', 'variaveis', 'componentes-variaveis', 'pacote'] },
        presetAplicado: { type: 'string' },
      },
    },
    componentes: { type: 'array', items: ref('componente') },
    composicao: ref('composicao'),
    fundacao: {
      type: 'object',
      description:
        'Fundação do design system (tokens): cores claro/escuro, fontes, escala de texto, raios, espaços e sombras.',
      required: [
        'formato',
        'versao',
        'nome',
        'cores',
        'fontes',
        'texto',
        'raios',
        'espacos',
        'sombras',
      ],
      properties: {
        formato: { const: 'kcx-fundacao' },
        versao: semver,
        nome: texto,
        cores: { type: 'object' },
        fontes: { type: 'object' },
        texto: { type: 'object' },
        raios: { type: 'object' },
        espacos: { type: 'object' },
        sombras: { type: 'object' },
      },
    },
    dependencias: { type: 'array', items: ref('dependencia') },
    historico: {
      type: 'array',
      items: {
        type: 'object',
        required: ['versao', 'data', 'descricao'],
        properties: { versao: semver, data: { type: 'string' }, descricao: { type: 'string' } },
      },
    },
  },
  $defs: {
    operacao: {
      type: 'object',
      required: ['op'],
      properties: {
        op: {
          enum: [
            'multiplicar',
            'somar',
            'mapear',
            'limitar',
            'arredondar',
            'dividir',
            'multiplicarPorVariavel',
            'dividirPorVariavel',
            'somarVariavel',
            'alpha',
            'converter',
            'mapa',
            'pontoNoCaminho',
            'tracoNoCaminho',
            'variavelPorOpcao',
            'alphaPorOpcao',
          ],
        },
      },
    },
    vinculo: {
      type: 'object',
      required: ['propriedade', 'alvo'],
      properties: {
        propriedade: texto,
        alvo: {
          oneOf: [
            {
              type: 'object',
              required: ['tipo', 'nome'],
              properties: {
                tipo: { const: 'css-var' },
                nome: { type: 'string', pattern: '^--kcx-[a-z0-9-]+$' },
              },
            },
            {
              type: 'object',
              required: ['tipo', 'seletor', 'atributo'],
              properties: {
                tipo: { const: 'atributo' },
                seletor: texto,
                atributo: { type: 'string', pattern: '^(?![oO][nN]).+' },
              },
            },
            {
              type: 'object',
              required: ['tipo', 'seletor'],
              properties: { tipo: { const: 'texto' }, seletor: texto },
            },
          ],
        },
        transformar: { type: 'array', items: ref('operacao') },
        unidadeSaida: { type: 'string' },
      },
    },
    variavel: {
      type: 'object',
      required: [
        'id',
        'nome',
        'tipo',
        'padrao',
        'valor',
        'descricao',
        'grupo',
        'secao',
        'vinculos',
        'exportavel',
      ],
      properties: {
        id: { type: 'string', pattern: '^[a-zA-Z][a-zA-Z0-9]*$' },
        nome: texto,
        tipo: {
          enum: [
            'color',
            'number',
            'float',
            'boolean',
            'string',
            'enum',
            'dimension',
            'time',
            'gradient',
            'transform',
          ],
        },
        padrao: {},
        valor: {},
        unidade: { enum: ['', 'px', 'rem', 'em', '%', 'ms', 's', 'deg', 'turn', 'rad', 'x'] },
        min: { type: 'number' },
        max: { type: 'number' },
        passo: { type: 'number' },
        opcoes: { type: 'array', items: { type: 'object', required: ['valor', 'rotulo'] } },
        descricao: { type: 'string' },
        grupo: {
          enum: [
            'colors',
            'dimensions',
            'spacing',
            'typography',
            'motion',
            'effects',
            'components',
          ],
        },
        secao: { enum: ['aparencia', 'animacao', 'comportamento'] },
        vinculos: { type: 'array', minItems: 1, items: ref('vinculo') },
        exportavel: { type: 'boolean' },
        modos: { type: 'object', properties: { light: {}, dark: {}, celular: {} } },
      },
    },
    no: {
      type: 'object',
      required: ['id', 'nome', 'tipo'],
      properties: {
        id: texto,
        nome: texto,
        tipo: { enum: ['frame', 'retangulo', 'elipse', 'texto', 'svg', 'icone', 'instancia'] },
        x: kref({ type: 'number' }),
        y: kref({ type: 'number' }),
        largura: kref({ type: 'number' }),
        altura: kref({ type: 'number' }),
        raio: kref({ type: 'number' }),
        opacidade: kref({ type: 'number' }),
        visivel: kref({ type: 'boolean' }),
        svg: kref({ type: 'string' }),
        filhos: { type: 'array', items: ref('no') },
      },
    },
    estado: {
      type: 'object',
      required: ['id', 'nome', 'gatilho', 'descricao', 'valores'],
      properties: {
        gatilho: {
          enum: ['padrao', 'hover', 'focus', 'active', 'desativado', 'inicial', 'final'],
        },
        valores: { type: 'object' },
        derivar: {
          type: 'array',
          items: {
            type: 'object',
            required: ['variavel', 'de', 'op'],
            properties: { op: { enum: ['copiar', 'multiplicar'] } },
          },
        },
      },
    },
    preset: {
      type: 'object',
      required: ['id', 'nome', 'valores'],
      properties: {
        id: texto,
        nome: texto,
        descricao: { type: 'string' },
        valores: { type: 'object' },
      },
    },
    dependencia: {
      type: 'object',
      required: ['nome', 'versao', 'licenca', 'url', 'obrigatoria'],
      properties: {
        nome: texto,
        versao: texto,
        licenca: texto,
        url: { type: 'string' },
        obrigatoria: { type: 'boolean' },
      },
    },
    componente: {
      type: 'object',
      required: [
        'id',
        'nome',
        'categoria',
        'descricao',
        'tecnologia',
        'versao',
        'licenca',
        'metadados',
        'codigo',
        'variaveis',
        'estados',
        'presets',
        'dependencias',
        'estrutura',
        'animacoes',
        'compatibilidade',
      ],
      properties: {
        id: { type: 'string', pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' },
        nome: texto,
        categoria: texto,
        descricao: texto,
        tecnologia: {
          type: 'array',
          items: { enum: ['HTML', 'CSS', 'SVG', 'Angular', 'TypeScript'] },
        },
        versao: semver,
        licenca: {
          type: 'object',
          required: ['spdx', 'usoComercial', 'modificacao', 'redistribuicao', 'autor'],
          properties: {
            spdx: texto,
            usoComercial: { type: 'boolean' },
            modificacao: { type: 'boolean' },
            redistribuicao: { type: 'boolean' },
            autor: { type: 'string' },
          },
        },
        metadados: {
          type: 'object',
          required: ['autor', 'tags', 'criadoEm', 'atualizadoEm', 'largura', 'altura'],
        },
        codigo: {
          type: 'object',
          required: ['html', 'css', 'js'],
          properties: {
            html: { type: 'string' },
            css: { type: 'string' },
            js: { type: 'string' },
            svg: { type: 'string' },
          },
        },
        variaveis: { type: 'array', items: ref('variavel') },
        estados: { type: 'array', items: ref('estado') },
        presets: { type: 'array', items: ref('preset') },
        dependencias: { type: 'array', maxItems: 0, items: ref('dependencia') },
        estrutura: ref('no'),
        animacoes: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id', 'nome', 'tecnica', 'variaveis', 'figma', 'nivel', 'descricao'],
            properties: {
              nivel: { enum: [1, 2] },
              figma: { enum: ['variantes', 'documental'] },
            },
          },
        },
        compatibilidade: {
          type: 'object',
          required: ['navegadores', 'reducedMotion', 'figma'],
          properties: {
            figma: {
              type: 'object',
              required: ['nivel', 'editavel', 'parcial', 'naoSuportado', 'limitacoes'],
              properties: {
                nivel: { enum: [1, 2] },
                eixosVariante: { type: 'array', items: { type: 'string' } },
              },
            },
          },
        },
      },
    },
    composicao: {
      type: 'object',
      required: ['id', 'nome', 'camadas', 'compartilhadas'],
      properties: {
        camadas: {
          type: 'array',
          items: {
            type: 'object',
            required: ['componente', 'prefixo', 'papel', 'valores'],
            properties: { papel: { enum: ['fundo', 'centro', 'sobreposicao'] } },
          },
        },
        compartilhadas: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id', 'nome', 'tipo', 'valor', 'alvos'],
            properties: {
              alvos: {
                type: 'array',
                items: { type: 'string', pattern: '^[a-z0-9-]+\\.[a-zA-Z0-9]+$' },
              },
            },
          },
        },
      },
    },
  },
} as const;

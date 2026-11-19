import { ParamDef, Valores } from '../models/demo.model';
import { CodigoAngular, CodigoKit, EffectKit } from '../models/effect-sheet.model';
import { ArquivoZip } from '../../shared/utils/zip';
import { findCategoria } from './categorias';
import { BIBLIOTECAS, Biblioteca } from './bibliotecas';

/** index.html do pacote: arquivos separados, como num projeto real. */
export function htmlDoPacote(titulo: string, html: string, libs: Biblioteca[] = []): string {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${titulo.replace(/[<>&"]/g, '')}</title>
<link rel="stylesheet" href="styles.css">
${libs.map((l) => `<script src="vendor/${l.nomeArquivo}" defer></script>\n`).join('')}<script src="script.js" defer></script>
</head>
<body>
${html}
</body>
</html>
`;
}

function valorTexto(p: ParamDef, v: Valores): string {
  const x = v[p.id];
  return p.tipo === 'range'
    ? `${x}${p.unidade}`
    : (p.opcoes.find((o) => o.valor === x)?.rotulo ?? String(x));
}

/** README do pacote, gerado a partir da ficha técnica. */
export function readmeDoPacote(kit: EffectKit, v: Valores, editado: boolean): string {
  const f = kit.ficha;
  const id = f.id;
  const classe = id.replace(/(^|-)([a-z0-9])/g, (_, __, c: string) => c.toUpperCase());
  return `# ${f.nomeAmigavel} (${f.nomeTecnico})

${f.descricao}

Exportado do **Kalixto Creative Lab** · categoria ${findCategoria(f.categoria)?.nome ?? f.categoria} › ${f.subcategoria} · nível ${f.nivel}.

## Arquivos

| Arquivo | O que é |
|---|---|
| \`index.html\` | Página de exemplo; abra direto no navegador |
| \`styles.css\` | Estilos do efeito (inclui o palco escuro da demonstração) |
| \`script.js\` | Comportamento do efeito${f.tecnologias.includes('JavaScript') ? '' : ' (este efeito não usa JavaScript)'} |
| \`angular/${id}.ts\`, \`.html\`, \`.css\` | O mesmo efeito como componente Angular standalone |${
    kit.bibliotecas?.length
      ? '\n| `vendor/` | Bibliotecas usadas pelo efeito (sem precisar de internet) |'
      : ''
  }

${
  editado
    ? '> **Atenção:** `index.html`, `styles.css` e `script.js` contêm as suas edições feitas no Code Lab. A pasta `angular/` foi gerada a partir dos valores dos controles, sem essas edições.\n\n'
    : ''
}## Valores usados

${kit.params.map((p) => `- **${p.rotulo}:** ${valorTexto(p, v)}`).join('\n')}

## Como usar

**HTML/CSS/JS:** copie o conteúdo de \`styles.css\` e \`script.js\` para o seu projeto e use a marcação de \`index.html\`. O bloco "Palco da demonstração" no CSS só centraliza o exemplo — você pode removê-lo.

**Angular (17+):** copie a pasta \`angular/\` para \`src/app/${id}/\` e importe o componente:

\`\`\`ts
import { ${classe} } from './${id}/${id}';

@Component({ imports: [${classe}], template: '<app-${id} />' })
\`\`\`

## Dependências

${
  kit.bibliotecas?.length
    ? kit.bibliotecas
        .map((id) => BIBLIOTECAS[id])
        .map(
          (b) =>
            `- **${b.nome} ${b.versao}** — \`vendor/${b.nomeArquivo}\` (licença: [${b.licenca}](${b.licencaUrl})). Em projetos com npm: \`npm install ${b.pacoteNpm}\`.`,
        )
        .join('\n')
    : 'Nenhuma — só recursos nativos do navegador.'
}

## Compatibilidade

${f.compatibilidade}

## Acessibilidade

${f.acessibilidade}

## Limitações

${f.limitacoes.map((l) => `- ${l}`).join('\n')}

## Referências

${f.referencias.map((r) => `- [${r.titulo}](${r.url})`).join('\n')}

---
Código de exemplo gerado pelo Kalixto Creative Lab. Não inclui recursos de terceiros.
`;
}

/** Lista de arquivos do pacote .zip de um efeito. */
export function montarPacote(
  kit: EffectKit,
  valores: Valores,
  codigo: CodigoKit,
  angular: CodigoAngular,
  editado: boolean,
  bibliotecas: { biblioteca: Biblioteca; codigo: string }[] = [],
): ArquivoZip[] {
  const id = kit.ficha.id;
  return [
    { nome: `${id}/README.md`, conteudo: readmeDoPacote(kit, valores, editado) },
    {
      nome: `${id}/index.html`,
      conteudo: htmlDoPacote(
        kit.ficha.nomeAmigavel,
        codigo.html,
        bibliotecas.map((b) => b.biblioteca),
      ),
    },
    { nome: `${id}/styles.css`, conteudo: codigo.css + '\n' },
    { nome: `${id}/script.js`, conteudo: codigo.js + '\n' },
    { nome: `${id}/angular/${id}.ts`, conteudo: angular.ts },
    { nome: `${id}/angular/${id}.html`, conteudo: angular.html },
    { nome: `${id}/angular/${id}.css`, conteudo: angular.css },
    ...bibliotecas.map((b) => ({
      nome: `${id}/vendor/${b.biblioteca.nomeArquivo}`,
      conteudo: b.codigo,
    })),
  ];
}

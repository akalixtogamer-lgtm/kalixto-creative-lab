"""Gera docs/CATALOGO-DE-EFEITOS.md e docs/efeitos/<id>.md a partir do registro.
Uso: npm run docs:efeitos  (o JSON vem de scripts/exportar-efeitos.ts)."""
import json, sys, os
d = json.load(sys.stdin)
NIV = {'iniciante': 'Iniciante', 'intermediario': 'Intermediário', 'avancado': 'Avançado', 'experimental': 'Experimental'}
INT = {'hover': 'Hover', 'click': 'Clique', 'scroll': 'Rolagem', 'drag': 'Arrastar', 'mouse': 'Movimento do mouse',
       'touch': 'Toque', 'autoplay': 'Automático', 'keyboard': 'Teclado', 'audio': 'Áudio'}
cat = {c['id']: c for c in d['categorias']}
os.makedirs('docs/efeitos', exist_ok=True)

for k in d['kits']:
    f = k['ficha']; c = k['codigo']
    linhas = [f"# {f['nomeAmigavel']} (`{f['id']}`)", '',
              '> Gerado a partir de `src/app/core/efeitos/kits/' + f['id'] + '.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.', '',
              f"{f['descricao']}", '',
              '| Campo | Valor |', '|---|---|',
              f"| Nome técnico | {f['nomeTecnico']} |",
              f"| Categoria | {cat[f['categoria']]['numero']} · {cat[f['categoria']]['nome']} › {f['subcategoria']} |",
              f"| Nível | {NIV[f['nivel']]} |",
              f"| Tecnologias | {', '.join(f['tecnologias'])} |",
              f"| Dependências | {', '.join(f['dependencias']) or 'nenhuma'} |",
              f"| Interação | {', '.join(INT[i] for i in f['interacoes'])} |",
              f"| Status | {f['status']} em {f['validadoEm']} |",
              f"| Tags | {', '.join(f['tags'])} |", '',
              '## Objetivo visual', '', f['objetivoVisual'], '',
              '## Aplicações', ''] + [f'- {a}' for a in f['aplicacoes']] + ['',
              '## Como funciona', ''] + [f'{n}. {p}' for n, p in enumerate(f['explicacao'], 1)] + ['',
              '## Parâmetros', '', '| Controle | Tipo | Padrão | Faixa / opções |', '|---|---|---|---|']
    for p in k['params']:
        if p['tipo'] == 'range':
            linhas.append(f"| {p['rotulo']} | range | {p['padrao']}{p['unidade']} | {p['min']}–{p['max']}{p['unidade']} (passo {p['passo']}) |")
        else:
            linhas.append(f"| {p['rotulo']} | seleção | {p['padrao']} | {', '.join(o['rotulo'] for o in p['opcoes'])} |")
    linhas += ['', '## Outra forma de fazer', '', f['alternativa'], '',
               '## Compatibilidade', '', f['compatibilidade'], '',
               '## Responsividade', '', f['responsividade'], '',
               '## Acessibilidade', '', f['acessibilidade'], '',
               '## Performance', '', f['performance'], '',
               '## Limitações', ''] + [f'- {l}' for l in f['limitacoes']] + ['',
               '## Referências', ''] + [f"- [{r['titulo']}]({r['url']})" for r in f['referencias']] + ['',
               '## Código (valores padrão)', '', 'Arquivo único, igual ao baixado pelo botão “Baixar” na página do efeito:', '',
               '```html', k['documento'].rstrip(), '```', '']
    open(f"docs/efeitos/{f['id']}.md", 'w').write('\n'.join(linhas))

# índice
out = ['# Catálogo de efeitos', '',
       '> Gerado por `npm run docs:efeitos` a partir do registro (`src/app/core/efeitos/registry.ts`).', '',
       f"Total: **{len(d['catalogo'])}** itens — **{len(d['kits'])} kits** com ficha técnica completa e "
       f"**{len(d['catalogo']) - len(d['kits'])} demos** dos laboratórios.", '',
       '| # | Categoria | Kits | Demos |', '|---|---|---|---|']
for c in d['categorias']:
    ks = sum(1 for i in d['catalogo'] if i['categoria'] == c['id'] and i['tipo'] == 'kit')
    ds = sum(1 for i in d['catalogo'] if i['categoria'] == c['id'] and i['tipo'] == 'demo')
    out.append(f"| {c['numero']} | {c['nome']} | {ks} | {ds} |")
for c in d['categorias']:
    itens = [i for i in d['catalogo'] if i['categoria'] == c['id']]
    out += ['', f"## {c['numero']} · {c['nome']}", '', c['descricao'], '']
    if not itens:
        out.append('_Nenhum efeito implementado ainda nesta categoria._'); continue
    out += ['| Efeito | Tipo | Nível | Onde |', '|---|---|---|---|']
    for i in itens:
        if i['tipo'] == 'kit':
            iid = i['chave'].split(':', 1)[1]
            out.append(f"| [{i['nome']}](efeitos/{iid}.md) | Kit (ficha completa) | {NIV[i['nivel']]} | `/efeitos/{iid}` |")
        else:
            _, lab, demo = i['chave'].split(':')
            out.append(f"| {i['nome']} | Demo | {NIV[i['nivel']]} | `/labs/{lab}?demo={demo}` |")
open('docs/CATALOGO-DE-EFEITOS.md', 'w').write('\n'.join(out) + '\n')
print('docs gerados:', len(d['kits']), 'fichas')

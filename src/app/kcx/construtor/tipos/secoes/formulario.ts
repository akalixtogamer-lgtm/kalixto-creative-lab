import { DefinicaoTipo } from '../../montar';
import { interacao } from './_comum';

export const FORMULARIO: DefinicaoTipo = {
  id: 'formulario',
  nome: 'Formulário',
  categoria: 'formularios',
  uso: 'site e app',
  descricao: 'Campo de e-mail com rótulo, botão e mensagem de erro (newsletter, login, contato).',
  textos: [
    { id: 'titulo', rotulo: 'Título', padrao: 'Receba a agenda das aulas' },
    { id: 'rotulo', rotulo: 'Rótulo do campo', padrao: 'Seu e-mail' },
    { id: 'botao', rotulo: 'Botão', padrao: 'Quero receber' },
    { id: 'erro', rotulo: 'Mensagem de erro', padrao: 'Digite um e-mail válido.' },
    { id: 'sucesso', rotulo: 'Mensagem de sucesso', padrao: 'Pronto! Confira seu e-mail.' },
  ],
  recursos: [
    {
      id: 'desativado',
      nome: 'Estado Desativado',
      descricao: 'Mais uma variante: o formulário apagado, sem poder usar.',
      padrao: true,
    },
    {
      id: 'icone',
      nome: 'Ícone no campo',
      descricao: 'Ícone à esquerda do campo, liga/desliga e trocável no Figma.',
      padrao: true,
    },
    {
      id: 'partes',
      nome: 'Partes liga/desliga',
      descricao: 'Mostrar ou ocultar o título na instância do Figma.',
      padrao: true,
    },
  ],
  partes: [{ no: 't-titulo', nome: 'Título', classe: 'titulo' }],
  icones: [{ id: 'campo', rotulo: 'Ícone do campo', padrao: 'email', recurso: 'icone' }],
  animacoes: [
    {
      id: 'flutuante',
      nome: 'Rótulo que flutua',
      descricao: 'O rótulo sobe quando a pessoa digita.',
    },
    { id: 'brilho', nome: 'Brilho no foco', descricao: 'O campo acende ao receber foco.' },
    {
      id: 'tremer',
      nome: 'Treme no erro',
      descricao: 'O campo treme quando o e-mail está errado.',
    },
  ],
  largura: 420,
  altura: 240,
  gerar(cfg, b) {
    const C = b.C;
    const v = (n: string) => b.v(n);
    const estado = b.extra({
      id: 'situacao',
      nome: 'Situação do campo',
      tipo: 'enum',
      padrao: 'padrao',
      opcoes: [
        { valor: 'padrao', rotulo: 'Padrão' },
        { valor: 'foco', rotulo: 'Foco' },
        { valor: 'erro', rotulo: 'Erro' },
        { valor: 'sucesso', rotulo: 'Sucesso' },
        ...(b.tem('desativado') ? [{ valor: 'desativado', rotulo: 'Desativado' }] : []),
      ],
      descricao: 'Mostra o formulário em cada situação (no site, muda sozinho).',
      grupo: 'components',
      secao: 'comportamento',
      vinculos: [
        {
          propriedade: 'data-situacao',
          alvo: { tipo: 'atributo', seletor: `.${C}`, atributo: 'data-situacao' },
        },
      ],
    });
    const mostrarIcone = b.tem('icone')
      ? b.extra({
          id: 'mostrarIcone',
          nome: 'Mostrar ícone do campo',
          tipo: 'boolean',
          padrao: true,
          descricao: 'Liga e desliga o ícone do campo. No Figma é uma propriedade liga/desliga.',
          grupo: 'components',
          secao: 'aparencia',
          vinculos: [
            {
              propriedade: 'data-icone',
              alvo: { tipo: 'atributo', seletor: `.${C}`, atributo: 'data-icone' },
              transformar: [{ op: 'mapa', valores: { true: 'true', false: 'false' } }],
            },
          ],
        })
      : undefined;
    const html = `<form class="${C}" data-situacao="padrao" novalidate>
  ${b.span('titulo', 'h3')}
  <div class="${C}__linha">
    <label class="${C}__campo">
      ${b.tem('icone') ? b.svgKcx(b.nomeIcone('campo', 'email'), `${C}__icone`, 18) : ''}
      <input class="${C}__input" type="email" name="email" placeholder=" " autocomplete="email" required aria-describedby="${C}-msg">
      ${b.span('rotulo')}
    </label>
    <button class="${C}__enviar" type="submit">${b.span('botao')}</button>
  </div>
  <p class="${C}__msg" id="${C}-msg" aria-live="polite">${b.span('erro')}${b.span('sucesso')}</p>
</form>`;
    const flutuante = cfg.animacao === 'flutuante';
    const css = `.${C} { display: grid; gap: calc(${v('espaco')} * .75); width: 100%; max-width: 420px; padding: calc(${v('espaco')} * 1.25); border-radius: ${v('raio')}; background: ${v('superficie')}; }
.${C}__titulo { margin: 0; font-size: calc(${v('fonte')} * 1.25); }
.${C}__linha { display: flex; flex-wrap: wrap; gap: calc(${v('espaco')} * .5); }
.${C}__campo { position: relative; flex: 1 1 200px; }
.${C}__input { width: 100%; padding: ${flutuante ? '1.35em .9em .45em' : '.8em .9em'}; border: 1px solid color-mix(in srgb, ${v('suave')} 45%, transparent); border-radius: ${v('raio')}; background: ${v('fundo')}; color: ${v('texto')}; font: inherit; outline: none; transition: border-color ${v('duracao')} ${v('easing')}, box-shadow ${v('duracao')} ${v('easing')}; }
.${C}__rotulo { position: absolute; left: .95em; top: 50%; color: ${v('suave')}; pointer-events: none; transform: translateY(-50%); transform-origin: left; transition: transform ${v('duracao')} ${v('easing')}, color ${v('duracao')} ${v('easing')}; }
${flutuante ? `.${C}__input:focus + .${C}__rotulo, .${C}__input:not(:placeholder-shown) + .${C}__rotulo { transform: translateY(-115%) scale(.78); color: ${v('primaria')}; }` : `.${C}__input:focus + .${C}__rotulo, .${C}__input:not(:placeholder-shown) + .${C}__rotulo { opacity: 0; }`}
.${C}__input:focus, .${C}[data-situacao="foco"] .${C}__input { border-color: ${v('primaria')};${cfg.animacao === 'brilho' ? ` box-shadow: 0 0 0 4px color-mix(in srgb, ${v('primaria')} 25%, transparent), 0 0 24px color-mix(in srgb, ${v('primaria')} 35%, transparent);` : ''} }
.${C}[data-situacao="erro"] .${C}__input { border-color: #ff5c7a;${cfg.animacao === 'tremer' ? ` animation: ${C}-treme 360ms ease;` : ''} }
@keyframes ${C}-treme { 20%, 60% { transform: translateX(-6px); } 40%, 80% { transform: translateX(6px); } }
.${C}__enviar { padding: .8em 1.2em; border: 0; border-radius: ${v('raio')}; background: ${v('primaria')}; color: ${v('fundo')}; font-weight: 600; }
.${C}__msg { min-height: 1.4em; margin: 0; font-size: .9em; }
.${C}__msg > span { display: none; }
.${C}[data-situacao="erro"] .${C}__erro { display: inline; color: #ff5c7a; }
.${C}[data-situacao="sucesso"] .${C}__sucesso { display: inline; color: #3ddc97; }${
      b.tem('desativado')
        ? `
.${C}[data-situacao="desativado"] { opacity: .45; pointer-events: none; }`
        : ''
    }${
      b.tem('icone')
        ? `
.${C}__icone { position: absolute; left: .85em; top: 50%; transform: translateY(-50%); color: ${v('suave')}; pointer-events: none; }
.${C}__icone ~ .${C}__input { padding-left: 2.6em; }
.${C}__icone ~ .${C}__rotulo { left: 2.65em; }
.${C}[data-icone="false"] .${C}__icone { display: none; }
.${C}[data-icone="false"] .${C}__input { padding-left: .9em; }
.${C}[data-icone="false"] .${C}__rotulo { left: .95em; }`
        : ''
    }`;
    const js = `// Valida o e-mail no envio (não manda para lugar nenhum: ligue ao seu back-end).
document.querySelectorAll('.${C}').forEach((form) => {
  const input = form.querySelector('.${C}__input');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const ok = input.checkValidity();
    form.setAttribute('data-situacao', ok ? 'sucesso' : 'erro');
    input.setAttribute('aria-invalid', String(!ok));
    if (!ok) input.focus();
  });
  input.addEventListener('input', () => { if (form.getAttribute('data-situacao') !== 'padrao') form.setAttribute('data-situacao', 'foco'); });
});`;
    const sit = (id: string, nome: string, valor: string) =>
      ({
        $derivado: estado,
        nome,
        transformar: [
          {
            op: 'mapa',
            valores: {
              padrao: 'false',
              foco: 'false',
              erro: 'false',
              sucesso: 'false',
              desativado: 'false',
              [valor]: 'true',
            },
          },
        ],
      }) as never;
    const borda = {
      $derivado: estado,
      nome: 'campo-borda',
      transformar: [
        {
          op: 'mapa',
          valores: { padrao: '1', foco: '2', erro: '2', sucesso: '1', desativado: '1' },
        },
      ],
    } as never;
    const estrutura = b.pilha(
      'form',
      cfg.nome,
      'vertical',
      [
        b.noTexto('titulo', 'Título', {
          tamanho: b.fonteX(1.25, 'titulo-tamanho'),
          estilo: 'Bold',
          preencher: true,
        }),
        b.pilha(
          'linha',
          'Linha',
          'horizontal',
          [
            b.pilha(
              'campo',
              'Campo',
              'horizontal',
              [
                ...(b.tem('icone')
                  ? [
                      b.noIcone(
                        'icone-campo',
                        'Ícone do campo',
                        b.nomeIcone('campo', 'email'),
                        b.cor('suave'),
                        18,
                        {
                          troca: 'Ícone do campo (trocar)',
                          visivel: { $var: mostrarIcone! },
                          propriedadeVisivel: 'Ícone do campo',
                        },
                      ),
                    ]
                  : []),
                b.noTexto('rotulo', 'Rótulo do campo', { cor: b.cor('suave'), preencher: true }),
              ],
              {
                espaco: 8,
                px: b.espacoX(0.9, 'campo-px'),
                py: b.espacoX(0.8, 'campo-py'),
                raio: b.raio,
                encher: true,
                preenchimentos: [{ tipo: 'solido', cor: b.cor('fundo') }],
                traco: { cor: b.cor('primaria'), espessura: borda },
              },
            ),
            b.noBotao('enviar', 'botao', 'Botão'),
          ],
          { espaco: b.espacoX(0.5, 'linha-gap'), encher: true },
        ),
        {
          ...b.noTexto('erro', 'Mensagem de erro', {
            cor: '#ff5c7a',
            tamanho: b.fonteX(0.9, 'msg-tamanho'),
            preencher: true,
          }),
          visivel: sit(estado, 'erro-visivel', 'erro'),
        },
        {
          ...b.noTexto('sucesso', 'Mensagem de sucesso', {
            cor: '#3ddc97',
            tamanho: b.fonteX(0.9, 'msg-tamanho'),
            preencher: true,
          }),
          visivel: sit(estado, 'sucesso-visivel', 'sucesso'),
        },
      ],
      {
        largura: 420,
        espaco: b.espacoX(0.75, 'form-gap'),
        px: b.espacoX(1.25, 'form-px'),
        py: b.espacoX(1.25, 'form-py'),
        raio: b.raio,
        preenchimentos: [{ tipo: 'solido', cor: b.cor('superficie') }],
        opacidade: b.tem('desativado')
          ? ({
              $derivado: estado,
              nome: 'form-opacidade',
              transformar: [
                {
                  op: 'mapa',
                  valores: {
                    padrao: '1',
                    foco: '1',
                    erro: '1',
                    sucesso: '1',
                    desativado: '0.45',
                  },
                },
              ],
            } as never)
          : undefined,
      },
    );
    return {
      html,
      css,
      js,
      estrutura,
      estados: [
        {
          id: 'padrao',
          nome: 'Padrão',
          gatilho: 'padrao',
          descricao: 'Campo vazio.',
          valores: { [estado]: 'padrao' },
        },
        {
          id: 'foco',
          nome: 'Foco',
          gatilho: 'focus',
          descricao: 'Campo selecionado.',
          valores: { [estado]: 'foco' },
        },
        {
          id: 'erro',
          nome: 'Erro',
          gatilho: 'active',
          descricao: 'E-mail inválido.',
          valores: { [estado]: 'erro' },
        },
        {
          id: 'sucesso',
          nome: 'Sucesso',
          gatilho: 'final',
          descricao: 'Enviado.',
          valores: { [estado]: 'sucesso' },
        },
        ...(b.tem('desativado')
          ? [
              {
                id: 'desativado',
                nome: 'Desativado',
                gatilho: 'desativado' as const,
                descricao: 'Não pode ser usado agora.',
                valores: { [estado]: 'desativado' },
              },
            ]
          : []),
      ],
      interacoes: [
        interacao('campo', 'padrao', 'foco'),
        interacao('enviar', 'foco', 'sucesso'),
        interacao('enviar', 'padrao', 'erro'),
        interacao('campo', 'erro', 'foco'),
      ],
      animacao: {
        nome: FORMULARIO.animacoes.find((a) => a.id === cfg.animacao)?.nome ?? 'Foco',
        tecnica: cfg.animacao === 'tremer' ? 'css-keyframes' : 'css-transition',
        variaveis: ['duracao', 'easing', 'situacao'],
        descricao:
          'Rótulo com transform no foco (:placeholder-shown), borda e mensagens por data-situacao.',
      },
      editavel: [
        'Variantes Padrão, Foco, Erro e Sucesso; no protótipo, clicar no campo e no botão percorre as situações',
        'Rótulo, botão e mensagens como propriedades de texto',
      ],
      parcial: [
        'No Figma o campo não aceita digitação (é desenho); o rótulo flutuante fica no código',
      ],
      limitacoes: [
        'O formulário valida o e-mail mas não envia para lugar nenhum: ligue ao seu back-end.',
      ],
      tags: ['form', 'input', 'newsletter', 'login'],
    };
  },
};

/* ============================== Hero ============================== */

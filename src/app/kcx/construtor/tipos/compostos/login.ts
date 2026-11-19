import { KcxNo } from '../../../kcx.types';
import { construirComponente, DefinicaoTipo } from '../../montar';
import { BOTAO } from '../conteudo/botao';

export const LOGIN: DefinicaoTipo = {
  id: 'login',
  nome: 'Login',
  categoria: 'formularios',
  uso: 'site e app',
  descricao: 'Tela de entrar com e-mail, senha e botão — o botão é instância do Botão.',
  textos: [
    { id: 'titulo', rotulo: 'Título', padrao: 'Entrar' },
    { id: 'email', rotulo: 'Campo de e-mail', padrao: 'Seu e-mail' },
    { id: 'senha', rotulo: 'Campo de senha', padrao: 'Sua senha' },
    { id: 'botao', rotulo: 'Botão', padrao: 'Entrar' },
    { id: 'link', rotulo: 'Link', padrao: 'Esqueci minha senha' },
  ],
  recursos: [
    {
      id: 'instancias',
      nome: 'Botão como componente',
      descricao: 'O botão vira instância de um Botão (com tipos e estados) que vai junto.',
      padrao: true,
    },
  ],
  animacoes: [
    { id: 'brilho', nome: 'Brilho no foco', descricao: 'O campo acende ao ser focado.' },
    { id: 'simples', nome: 'Simples', descricao: 'Só a borda muda no foco.' },
  ],
  largura: 380,
  altura: 420,
  gerar(cfg, b) {
    const C = b.C;
    const v = (n: string) => b.v(n);
    const sub = b.tem('instancias')
      ? construirComponente(BOTAO, {
          tipo: 'botao',
          nome: `${cfg.nome} · Botão`,
          id: `${b.id}-botao`,
          textos: { rotulo: cfg.textos['botao'] ?? 'Entrar' },
          itens: [],
          animacao: 'elevar',
          cores: cfg.cores,
          raio: cfg.raio,
          recursos: {
            tipos: true,
            tamanhos: false,
            estados: true,
            icones: false,
            carregando: true,
          },
          icones: {},
          modos: cfg.modos,
        })
      : undefined;
    const html = `<form class="${C}" novalidate>
  ${b.span('titulo', 'h2')}
  <label class="${C}__campo">${b.svgKcx('email', `${C}__icone`, 18)}<input type="email" required autocomplete="email" placeholder=" ">${b.span('email')}</label>
  <label class="${C}__campo">${b.svgKcx('cadeado', `${C}__icone`, 18)}<input type="password" required autocomplete="current-password" placeholder=" ">${b.span('senha')}</label>
  <button class="${C}__botao" type="submit">${b.span('botao')}</button>
  <a class="${C}__link" href="#">${b.span('link')}</a>
</form>`;
    const css = `.${C} { display: grid; gap: calc(${v('espaco')} * .75); width: 100%; max-width: 380px; padding: calc(${v('espaco')} * 1.5); border-radius: ${v('raio')}; background: ${v('superficie')}; color: ${v('texto')}; }
.${C}__titulo { margin: 0 0 .25em; font-size: calc(${v('fonte')} * 1.5); }
.${C}__campo { position: relative; }
.${C}__campo input { width: 100%; padding: .85em .9em .85em 2.6em; border: 1px solid color-mix(in srgb, ${v('suave')} 45%, transparent); border-radius: ${v('raio')}; background: ${v('fundo')}; color: inherit; font: inherit; outline: none; transition: border-color ${v('duracao')} ${v('easing')}, box-shadow ${v('duracao')} ${v('easing')}; }
.${C}__campo input:focus { border-color: ${v('primaria')};${cfg.animacao === 'brilho' ? ` box-shadow: 0 0 0 4px color-mix(in srgb, ${v('primaria')} 25%, transparent);` : ''} }
.${C}__campo > span { position: absolute; left: 2.65em; top: 50%; color: ${v('suave')}; transform: translateY(-50%); pointer-events: none; }
.${C}__campo input:not(:placeholder-shown) + span { opacity: 0; }
.${C}__icone { position: absolute; left: .85em; top: 50%; color: ${v('suave')}; transform: translateY(-50%); }
.${C}__botao { padding: .85em; border: 0; border-radius: ${v('raio')}; background: ${v('primaria')}; color: ${v('fundo')}; font: inherit; font-weight: 700; cursor: pointer; }
.${C}__link { justify-self: center; color: ${v('suave')}; font-size: .9em; }`;
    const js = `document.querySelectorAll('.${C}').forEach((f) => f.addEventListener('submit', (e) => { e.preventDefault(); f.reportValidity(); }));`;
    const campo = (id: string, slot: string, rotulo: string, icone: string): KcxNo =>
      b.pilha(
        id,
        rotulo,
        'horizontal',
        [
          b.noIcone(`${id}-icone`, 'Ícone', icone, b.cor('suave'), 18),
          b.noTexto(slot, rotulo, { cor: b.cor('suave'), preencher: true }),
        ],
        {
          espaco: 10,
          px: 14,
          py: 12,
          raio: b.raio,
          encher: true,
          preenchimentos: [{ tipo: 'solido', cor: b.cor('fundo') }],
          traco: { cor: b.corAlpha('corSuave', `${id}-borda`, 0.45), espessura: 1 },
        },
      );
    const botao: KcxNo = sub
      ? {
          id: 'entrar',
          nome: 'Botão',
          tipo: 'instancia',
          encher: true,
          instancia: {
            componente: sub.id,
            variante: { Estado: 'Padrão', Tipo: 'Primário' },
            textos: { 'Texto do botão': { $var: b.idTexto('botao') } },
          },
        }
      : b.noBotao('entrar', 'botao', 'Botão', 'primario', { encher: true });
    const estrutura = b.pilha(
      'login',
      cfg.nome,
      'vertical',
      [
        b.noTexto('titulo', 'Título', { tamanho: b.fonteX(1.5, 'titulo-tamanho'), estilo: 'Bold' }),
        campo('campo-email', 'email', 'Campo de e-mail', 'email'),
        campo('campo-senha', 'senha', 'Campo de senha', 'cadeado'),
        botao,
        b.noTexto('link', 'Link', { cor: b.cor('suave'), tamanho: b.fonteX(0.9, 'link-tamanho') }),
      ],
      {
        largura: 380,
        espaco: b.espacoX(0.75, 'login-gap'),
        px: b.espacoX(1.5, 'login-px'),
        py: b.espacoX(1.5, 'login-py'),
        alinhar: 'centro',
        raio: b.raio,
        preenchimentos: [{ tipo: 'solido', cor: b.cor('superficie') }],
      },
    );
    estrutura.filhos![0].texto!.preencher = true;
    return {
      html,
      css,
      js,
      estrutura,
      subcomponentes: sub ? [sub] : undefined,
      animacao: {
        nome: LOGIN.animacoes.find((a) => a.id === cfg.animacao)?.nome ?? 'Foco',
        tecnica: 'css-transition',
        variaveis: ['duracao', 'easing'],
        descricao: 'Campos nativos (e-mail e senha) com autocomplete; validação do navegador.',
        figma: 'documental',
      },
      editavel: [
        sub
          ? `O botão é instância de “${sub.nome}” (com hover, pressionar e carregando)`
          : 'Botão desenhado no próprio componente',
        'Título, campos e link como propriedades de texto',
      ],
      parcial: ['No Figma os campos não aceitam digitação (são desenho)'],
      limitacoes: ['O login não envia nada: ligue ao seu back-end.'],
      tags: ['login', 'form', 'auth'],
    };
  },
};

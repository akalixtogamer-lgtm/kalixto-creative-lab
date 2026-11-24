import {
  ExibicaoFeedback,
  TIPOS_FEEDBACK,
  ehBotao,
  executarComFeedback,
  feedbackPadrao,
  normalizarFeedback,
  operacaoSimulada,
} from './feedback';

const semEspera = () => Promise.resolve();

async function rodar(resultado: 'sucesso' | 'erro' | 'pendencia' | 'info', cfg = feedbackPadrao()) {
  const exibidas: (ExibicaoFeedback | null)[] = [];
  const tipo = await executarComFeedback(operacaoSimulada(resultado, 0, semEspera), cfg, (m) =>
    exibidas.push(m),
  );
  return { tipo, exibidas };
}

describe('Mensagens e Feedback', () => {
  it('mostra LOADING enquanto roda e SUCCESS quando a operação conclui', async () => {
    const { tipo, exibidas } = await rodar('sucesso');
    expect(tipo).toBe('success');
    expect(exibidas.map((m) => m?.tipo)).toEqual(['loading', 'success']);
  });

  it('operação que falha mostra ERROR e nunca SUCCESS', async () => {
    const { tipo, exibidas } = await rodar('erro');
    expect(tipo).toBe('error');
    expect(exibidas.map((m) => m?.tipo)).toEqual(['loading', 'error']);
    expect(exibidas.at(-1)?.detalhe).toContain('Falha');
  });

  it('falha com a mensagem de erro desativada não vira sucesso', async () => {
    const cfg = feedbackPadrao();
    cfg.mensagens.error.ativo = false;
    const { tipo, exibidas } = await rodar('erro', cfg);
    expect(tipo).toBe('error');
    expect(exibidas.at(-1)).toBeNull();
    expect(exibidas.some((m) => m?.tipo === 'success')).toBe(false);
  });

  it('pendência vira WARNING e informação vira INFO', async () => {
    expect((await rodar('pendencia')).tipo).toBe('warning');
    expect((await rodar('info')).tipo).toBe('info');
  });

  it('sem LOADING ativo, só a mensagem do resultado aparece', async () => {
    const cfg = feedbackPadrao();
    cfg.mensagens.loading.ativo = false;
    const { exibidas } = await rodar('sucesso', cfg);
    expect(exibidas.map((m) => m?.tipo)).toEqual(['success']);
  });

  it('exceção da própria operação (não simulada) também vira ERROR', async () => {
    const exibidas: (ExibicaoFeedback | null)[] = [];
    const tipo = await executarComFeedback(
      () => Promise.reject(new Error('rede caiu')),
      feedbackPadrao(),
      (m) => exibidas.push(m),
    );
    expect(tipo).toBe('error');
    expect(exibidas.at(-1)?.detalhe).toBe('rede caiu');
  });

  it('normaliza configuração salva antiga ou corrompida sem perder o que é válido', () => {
    const cfg = normalizarFeedback({
      ativo: false,
      mensagens: {
        success: { titulo: 'Salvo!', corFundo: 'javascript:alert(1)', largura: 9999, posicao: 'x' },
      },
      simulacao: { resultado: 'qualquer', atrasoMs: -5 },
    });
    expect(cfg.ativo).toBe(false);
    expect(cfg.mensagens.success.titulo).toBe('Salvo!');
    expect(cfg.mensagens.success.corFundo).toBe(feedbackPadrao().mensagens.success.corFundo);
    expect(cfg.mensagens.success.largura).toBe(640);
    expect(cfg.mensagens.success.posicao).toBe('base-centro');
    expect(cfg.simulacao).toEqual({ resultado: 'sucesso', atrasoMs: 0 });
    for (const t of TIPOS_FEEDBACK) expect(cfg.mensagens[t]).toBeTruthy();
    expect(normalizarFeedback('lixo')).toEqual(feedbackPadrao());
  });

  it('a configuração sobrevive a JSON (persistência)', () => {
    const cfg = feedbackPadrao();
    cfg.mensagens.warning.titulo = 'Falta revisar';
    cfg.mensagens.info.raio = 20;
    expect(normalizarFeedback(JSON.parse(JSON.stringify(cfg)))).toEqual(cfg);
  });

  it('reconhece botões', () => {
    expect(ehBotao({ categoria: 'acoes', codigo: { html: '<div></div>' } })).toBe(true);
    expect(ehBotao({ categoria: 'conteudo', codigo: { html: '<button>Ok</button>' } })).toBe(true);
    expect(ehBotao({ categoria: 'conteudo', codigo: { html: '<div>Card</div>' } })).toBe(false);
  });
});

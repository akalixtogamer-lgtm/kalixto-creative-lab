/**
 * Runtime KCX: o pequeno script que liga as variáveis ao componente
 * dentro do navegador.
 *
 * - RUNTIME_PREVIEW: roda dentro do iframe do laboratório. Recebe, por
 *   postMessage, os valores já calculados e aplica nas custom properties e
 *   atributos. NADA é recarregado: a animação continua rodando e só muda.
 *   Também atende Reproduzir, Pausar, Reiniciar e Velocidade.
 * - runtimeStandalone(): vai no código exportado. Traz o mesmo cálculo de
 *   vínculos em JavaScript puro e expõe `KCX.set(id, valor)` para controlar
 *   o componente fora do laboratório. Um teste compara este cálculo com o
 *   resolver TypeScript para garantir que os dois nunca divergem.
 */
import { KcxVariavel } from './kcx.types';

/** Funções que aplicam saídas e controles (comuns aos dois runtimes). */
const APLICAR = String.raw`
  var estado = { pausado: false, velocidade: 1 };
  function seguro(attr, valor) {
    return !/^on/i.test(attr) && !/^\s*javascript:/i.test(String(valor));
  }
  function aplicarSaidas(s) {
    var raiz = document.documentElement;
    Object.keys(s.cssVars || {}).forEach(function (k) {
      if (k.indexOf('--kcx-') === 0) raiz.style.setProperty(k, String(s.cssVars[k]));
    });
    (s.atributos || []).forEach(function (a) {
      if (!seguro(a.atributo, a.valor)) return;
      document.querySelectorAll(a.seletor).forEach(function (el) { el.setAttribute(a.atributo, a.valor); });
    });
    (s.textos || []).forEach(function (t) {
      document.querySelectorAll(t.seletor).forEach(function (el) { el.textContent = t.valor; });
    });
    requestAnimationFrame(sincronizarAnimacoes);
  }
  function animacoes() {
    return document.getAnimations ? document.getAnimations() : [];
  }
  function sincronizarAnimacoes() {
    animacoes().forEach(function (a) {
      a.playbackRate = estado.velocidade;
      if (estado.pausado) a.pause();
    });
  }
  function controlar(acao, valor) {
    if (acao === 'pausar') { estado.pausado = true; animacoes().forEach(function (a) { a.pause(); }); }
    if (acao === 'tocar') { estado.pausado = false; animacoes().forEach(function (a) { a.play(); }); }
    if (acao === 'reiniciar') {
      animacoes().forEach(function (a) { a.cancel(); a.play(); if (estado.pausado) a.pause(); });
    }
    if (acao === 'velocidade' && typeof valor === 'number' && valor > 0) {
      estado.velocidade = valor;
      sincronizarAnimacoes();
    }
  }
  document.addEventListener('animationstart', sincronizarAnimacoes);
`;

/** Script do preview (dentro do iframe sandbox, sem acesso ao app). */
export const RUNTIME_PREVIEW = `(function () {
${APLICAR}
  window.addEventListener('message', function (e) {
    if (e.source !== window.parent || !e.data || typeof e.data !== 'object') return;
    if (e.data.kcx === 'set') aplicarSaidas(e.data);
    if (e.data.kcx === 'controle') controlar(e.data.acao, e.data.valor);
  });
  window.parent.postMessage({ kcx: 'pronto' }, '*');
})();`;

/** Cálculo dos vínculos em JS puro (espelho de resolver.ts). */
const RESOLVER = String.raw`
  function arred(n, c) { var f = Math.pow(10, c === undefined ? 4 : c); return Math.round(n * f) / f; }
  var BASE = { '': 1, x: 1, px: 1, rem: 16, em: 16, '%': 1, ms: 1, s: 1000, deg: 1, turn: 360, rad: 180 / Math.PI };
  var FAM = { '': 'n', x: 'n', px: 'c', rem: 'c', em: 'c', '%': 'p', ms: 't', s: 't', deg: 'a', turn: 'a', rad: 'a' };
  function lerCor(c) {
    var t = String(c).trim();
    var m = /^rgba?\(\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*(?:[,/]\s*([\d.]+%?)\s*)?\)$/i.exec(t);
    if (m) {
      var a = m[4] === undefined ? 1 : (m[4].slice(-1) === '%' ? Number(m[4].slice(0, -1)) / 100 : Number(m[4]));
      return { r: +m[1], g: +m[2], b: +m[3], a: a };
    }
    var h = t.slice(1);
    if (h.length <= 4) h = h.split('').map(function (x) { return x + x; }).join('');
    var n = function (i) { return parseInt(h.slice(i, i + 2), 16); };
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? arred(n(6) / 255, 3) : 1 };
  }
  function hex2(n) { return ('0' + Math.round(Math.min(255, Math.max(0, n))).toString(16)).slice(-2); }
  function corHex(c) { var b = '#' + hex2(c.r) + hex2(c.g) + hex2(c.b); return c.a >= 1 ? b : b + hex2(c.a * 255); }
  function comAlpha(c, a) { var x = lerCor(c); x.a = arred(x.a * Math.min(1, Math.max(0, a)), 3); return corHex(x); }
  function valorDe(id, valores, vars) {
    if (id in valores) return valores[id];
    for (var i = 0; i < vars.length; i++) if (vars[i].id === id) return vars[i].valor;
  }
  function operar(v, x, ops, valores, vars) {
    var u = v.unidade || '';
    (ops || []).forEach(function (o) {
      if (o.op === 'multiplicar') x = x * o.fator;
      else if (o.op === 'somar') x = x + o.valor;
      else if (o.op === 'mapear') x = o.de[1] === o.de[0] ? o.para[0] : o.para[0] + ((x - o.de[0]) * (o.para[1] - o.para[0])) / (o.de[1] - o.de[0]);
      else if (o.op === 'limitar') { if (o.min !== undefined) x = Math.max(o.min, x); if (o.max !== undefined) x = Math.min(o.max, x); }
      else if (o.op === 'arredondar') x = arred(x, o.casas);
      else if (o.op === 'dividir') x = x === 0 ? o.numerador : o.numerador / x;
      else if (o.op === 'multiplicarPorVariavel') x = x * valorDe(o.variavel, valores, vars);
      else if (o.op === 'somarVariavel') x = x + o.fator * valorDe(o.variavel, valores, vars);
      else if (o.op === 'alpha') x = comAlpha(x, o.variavel ? valorDe(o.variavel, valores, vars) : (o.valor === undefined ? 1 : o.valor));
      else if (o.op === 'converter') { if (FAM[u] !== FAM[o.para] && u !== o.para) throw new Error('KCX: unidade'); x = (x * BASE[u]) / BASE[o.para]; u = o.para; }
      else if (o.op === 'mapa') x = o.valores[String(x)];
    });
    return x;
  }
  function textoCss(v, x, vin) {
    if (typeof x === 'number') return arred(x) + (vin.unidadeSaida || '');
    if (typeof x === 'boolean') return x ? '1' : '0';
    if (typeof x === 'string') return x;
    if (v.tipo === 'gradient') {
      return 'linear-gradient(' + x.angulo + 'deg, ' + x.paradas.slice().sort(function (a, b) { return a.posicao - b.posicao; })
        .map(function (p) { return p.cor + ' ' + arred(p.posicao * 100, 2) + '%'; }).join(', ') + ')';
    }
    return 'translate(' + x.x + 'px, ' + x.y + 'px) scale(' + x.escala + ') rotate(' + x.rotacao + 'deg)';
  }
  function resolver(vars, valores) {
    var atuais = {};
    vars.forEach(function (v) { atuais[v.id] = v.id in valores ? valores[v.id] : v.valor; });
    var s = { cssVars: {}, atributos: [], textos: [] };
    vars.forEach(function (v) {
      v.vinculos.forEach(function (vin) {
        if (vin.alvo.tipo === 'parametro-gerador') return;
        var x = operar(v, atuais[v.id], vin.transformar, atuais, vars);
        if (typeof x === 'number' && !isFinite(x)) x = operar(v, v.padrao, vin.transformar, {}, vars);
        var t = textoCss(v, x, vin);
        if (vin.alvo.tipo === 'css-var') s.cssVars[vin.alvo.nome] = t;
        else if (vin.alvo.tipo === 'atributo') s.atributos.push({ seletor: vin.alvo.seletor, atributo: vin.alvo.atributo, valor: t });
        else s.textos.push({ seletor: vin.alvo.seletor, valor: t });
      });
    });
    return s;
  }
`;

/** Só o que o runtime precisa de cada variável (sem textos de interface). */
export function configRuntime(variaveis: KcxVariavel[]) {
  return variaveis.map(({ id, tipo, padrao, valor, unidade, min, max, vinculos }) => ({
    id,
    tipo,
    padrao,
    valor,
    unidade,
    min,
    max,
    vinculos,
  }));
}

/**
 * Runtime para o código exportado. Uso no seu projeto:
 *   KCX.set('primaryColor', '#ff2bd6');  KCX.pause();  KCX.speed(0.5);
 */
export function runtimeStandalone(componenteId: string, variaveis: KcxVariavel[]): string {
  return `/* KCX runtime — ${componenteId}. Kalixto Component Exchange, licença MIT. */
(function () {
${APLICAR}
${RESOLVER}
  var vars = ${JSON.stringify(configRuntime(variaveis))};
  var valores = {};
  function limitar(v, x) {
    if (typeof x !== 'number') return x;
    if (v.min !== undefined) x = Math.max(v.min, x);
    if (v.max !== undefined) x = Math.min(v.max, x);
    return x;
  }
  var api = {
    id: ${JSON.stringify(componenteId)},
    variaveis: vars.map(function (v) { return v.id; }),
    get: function (id) { return valorDe(id, valores, vars); },
    set: function (id, x) {
      var v = vars.filter(function (y) { return y.id === id; })[0];
      if (!v) throw new Error('KCX: variável desconhecida "' + id + '"');
      valores[id] = limitar(v, x);
      aplicarSaidas(resolver(vars, valores));
    },
    apply: function (obj) { Object.keys(obj).forEach(function (k) { valores[k] = obj[k]; }); aplicarSaidas(resolver(vars, valores)); },
    resolve: function (obj) { return resolver(vars, obj || valores); },
    play: function () { controlar('tocar'); },
    pause: function () { controlar('pausar'); },
    restart: function () { controlar('reiniciar'); },
    speed: function (n) { controlar('velocidade', n); }
  };
  window.KCX = window.KCX || {};
  window.KCX[${JSON.stringify(componenteId)}] = api;
  window.KCX.set = api.set; window.KCX.get = api.get; window.KCX.apply = api.apply;
  window.KCX.play = api.play; window.KCX.pause = api.pause; window.KCX.restart = api.restart; window.KCX.speed = api.speed;
  window.addEventListener('message', function (e) {
    if (e.source !== window.parent || !e.data || typeof e.data !== 'object') return;
    if (e.data.kcx === 'set') aplicarSaidas(e.data);
    if (e.data.kcx === 'controle') controlar(e.data.acao, e.data.valor);
  });
})();`;
}

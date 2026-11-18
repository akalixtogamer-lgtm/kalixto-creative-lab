// @ts-nocheck
/**
 * KCX — cálculo dos vínculos (variável → propriedade). É o mesmo código do
 * kcx-runtime.js exportado, testado contra o resolver do laboratório.
 * Licença MIT · Kalixto Component Exchange.
 */

function arred(n, c) {
  var f = Math.pow(10, c === undefined ? 4 : c);
  return Math.round(n * f) / f;
}
var BASE = {
  '': 1,
  x: 1,
  px: 1,
  rem: 16,
  em: 16,
  '%': 1,
  ms: 1,
  s: 1000,
  deg: 1,
  turn: 360,
  rad: 180 / Math.PI,
};
var FAM = {
  '': 'n',
  x: 'n',
  px: 'c',
  rem: 'c',
  em: 'c',
  '%': 'p',
  ms: 't',
  s: 't',
  deg: 'a',
  turn: 'a',
  rad: 'a',
};
function lerCor(c) {
  var t = String(c).trim();
  var m =
    /^rgba?\(\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*(?:[,/]\s*([\d.]+%?)\s*)?\)$/i.exec(
      t,
    );
  if (m) {
    var a =
      m[4] === undefined
        ? 1
        : m[4].slice(-1) === '%'
          ? Number(m[4].slice(0, -1)) / 100
          : Number(m[4]);
    return { r: +m[1], g: +m[2], b: +m[3], a: a };
  }
  var h = t.slice(1);
  if (h.length <= 4)
    h = h
      .split('')
      .map(function (x) {
        return x + x;
      })
      .join('');
  var n = function (i) {
    return parseInt(h.slice(i, i + 2), 16);
  };
  return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? arred(n(6) / 255, 3) : 1 };
}
function hex2(n) {
  return ('0' + Math.round(Math.min(255, Math.max(0, n))).toString(16)).slice(-2);
}
function corHex(c) {
  var b = '#' + hex2(c.r) + hex2(c.g) + hex2(c.b);
  return c.a >= 1 ? b : b + hex2(c.a * 255);
}
function comAlpha(c, a) {
  var x = lerCor(c);
  x.a = arred(x.a * Math.min(1, Math.max(0, a)), 3);
  return corHex(x);
}
function valorDe(id, valores, vars) {
  if (id in valores) return valores[id];
  for (var i = 0; i < vars.length; i++) if (vars[i].id === id) return vars[i].valor;
}
function operar(v, x, ops, valores, vars) {
  var u = v.unidade || '';
  (ops || []).forEach(function (o) {
    if (o.op === 'multiplicar') x = x * o.fator;
    else if (o.op === 'somar') x = x + o.valor;
    else if (o.op === 'mapear')
      x =
        o.de[1] === o.de[0]
          ? o.para[0]
          : o.para[0] + ((x - o.de[0]) * (o.para[1] - o.para[0])) / (o.de[1] - o.de[0]);
    else if (o.op === 'limitar') {
      if (o.min !== undefined) x = Math.max(o.min, x);
      if (o.max !== undefined) x = Math.min(o.max, x);
    } else if (o.op === 'arredondar') x = arred(x, o.casas);
    else if (o.op === 'dividir') x = x === 0 ? o.numerador : o.numerador / x;
    else if (o.op === 'multiplicarPorVariavel') x = x * valorDe(o.variavel, valores, vars);
    else if (o.op === 'dividirPorVariavel') {
      var dv = valorDe(o.variavel, valores, vars);
      x = dv === 0 ? 0 : x / dv;
    } else if (o.op === 'somarVariavel') x = x + o.fator * valorDe(o.variavel, valores, vars);
    else if (o.op === 'alpha')
      x = comAlpha(
        x,
        o.variavel ? valorDe(o.variavel, valores, vars) : o.valor === undefined ? 1 : o.valor,
      );
    else if (o.op === 'converter') {
      if (FAM[u] !== FAM[o.para] && u !== o.para) throw new Error('KCX: unidade');
      x = (x * BASE[u]) / BASE[o.para];
      u = o.para;
    } else if (o.op === 'mapa') x = o.valores[String(x)];
  });
  return x;
}
function textoCss(v, x, vin) {
  if (typeof x === 'number') return arred(x) + (vin.unidadeSaida || '');
  if (typeof x === 'boolean') return x ? '1' : '0';
  if (typeof x === 'string') return x;
  if (v.tipo === 'gradient') {
    return (
      'linear-gradient(' +
      x.angulo +
      'deg, ' +
      x.paradas
        .slice()
        .sort(function (a, b) {
          return a.posicao - b.posicao;
        })
        .map(function (p) {
          return p.cor + ' ' + arred(p.posicao * 100, 2) + '%';
        })
        .join(', ') +
      ')'
    );
  }
  return (
    'translate(' + x.x + 'px, ' + x.y + 'px) scale(' + x.escala + ') rotate(' + x.rotacao + 'deg)'
  );
}
function resolver(vars, valores) {
  var atuais = {};
  vars.forEach(function (v) {
    atuais[v.id] = v.id in valores ? valores[v.id] : v.valor;
  });
  var s = { cssVars: {}, atributos: [], textos: [] };
  vars.forEach(function (v) {
    v.vinculos.forEach(function (vin) {
      var x = operar(v, atuais[v.id], vin.transformar, atuais, vars);
      if (typeof x === 'number' && !isFinite(x)) x = operar(v, v.padrao, vin.transformar, {}, vars);
      var t = textoCss(v, x, vin);
      if (vin.alvo.tipo === 'css-var') s.cssVars[vin.alvo.nome] = t;
      else if (vin.alvo.tipo === 'atributo')
        s.atributos.push({ seletor: vin.alvo.seletor, atributo: vin.alvo.atributo, valor: t });
      else s.textos.push({ seletor: vin.alvo.seletor, valor: t });
    });
  });
  return s;
}

export interface KcxSaidas {
  cssVars: Record<string, string>;
  atributos: { seletor: string; atributo: string; valor: string }[];
  textos: { seletor: string; valor: string }[];
}

export function resolverKcx(
  variaveis: readonly unknown[],
  valores: Record<string, unknown>,
): KcxSaidas {
  return resolver(variaveis, valores);
}

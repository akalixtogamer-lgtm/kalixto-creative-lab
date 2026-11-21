/* Kalixto Creative Lab — Figma Bridge · KCX · MIT */
"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __objRest = (source, exclude) => {
    var target = {};
    for (var prop in source)
      if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
        target[prop] = source[prop];
    if (source != null && __getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(source)) {
        if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
          target[prop] = source[prop];
      }
    return target;
  };
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // src/app/kcx/kcx.types.ts
  var KCX_SCHEMA_VERSION = "1.0.0";
  var KCX_FORMATO = "kcx";
  var KCX_TECNOLOGIAS = ["HTML", "CSS", "SVG", "Angular", "TypeScript"];

  // src/app/kcx/unidades.ts
  var BASE_REM = 16;
  var FAMILIA = {
    "": "nenhuma",
    x: "nenhuma",
    px: "comprimento",
    rem: "comprimento",
    em: "comprimento",
    "%": "proporcao",
    ms: "tempo",
    s: "tempo",
    deg: "angulo",
    turn: "angulo",
    rad: "angulo"
  };
  var PARA_BASE = {
    "": 1,
    x: 1,
    px: 1,
    rem: BASE_REM,
    em: BASE_REM,
    "%": 1,
    ms: 1,
    s: 1e3,
    deg: 1,
    turn: 360,
    rad: 180 / Math.PI
  };
  function conversivel(de, para) {
    return de === para || FAMILIA[de] === FAMILIA[para] && FAMILIA[de] !== "nenhuma";
  }
  function converter(valor, de, para) {
    if (de === para) return valor;
    if (!conversivel(de, para)) {
      throw new Error(
        `KCX: n\xE3o d\xE1 para converter "${de || "sem unidade"}" em "${para || "sem unidade"}".`
      );
    }
    return valor * PARA_BASE[de] / PARA_BASE[para];
  }
  function arredondar(n, casas = 4) {
    const f = 10 ** casas;
    return Math.round(n * f) / f;
  }
  var HEX = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
  var RGB = /^rgba?\(\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*(?:[,/]\s*([\d.]+%?)\s*)?\)$/i;
  function corValida(c) {
    return typeof c === "string" && (HEX.test(c.trim()) || lerRgb(c.trim()) !== null);
  }
  function lerRgb(c) {
    const m = RGB.exec(c);
    if (!m) return null;
    const [r, g, b] = [m[1], m[2], m[3]].map(Number);
    if ([r, g, b].some((x) => x > 255)) return null;
    let a = 1;
    if (m[4] !== void 0) a = m[4].endsWith("%") ? Number(m[4].slice(0, -1)) / 100 : Number(m[4]);
    if (!(a >= 0 && a <= 1)) return null;
    return { r, g, b, a };
  }
  function lerCor(c) {
    const t = c.trim();
    const rgb4 = lerRgb(t);
    if (rgb4) return rgb4;
    if (!HEX.test(t)) throw new Error(`KCX: cor inv\xE1lida "${c}".`);
    let h = t.slice(1);
    if (h.length <= 4) h = [...h].map((x) => x + x).join("");
    const n = (i) => parseInt(h.slice(i, i + 2), 16);
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? arredondar(n(6) / 255, 3) : 1 };
  }
  var hex2 = (n) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, "0");
  function corHex(c) {
    const base = `#${hex2(c.r)}${hex2(c.g)}${hex2(c.b)}`;
    return c.a >= 1 ? base : base + hex2(c.a * 255);
  }
  function comAlpha(c, alpha) {
    const rgba = lerCor(c);
    const a = Math.min(1, Math.max(0, alpha));
    return corHex(__spreadProps(__spreadValues({}, rgba), { a: arredondar(rgba.a * a, 3) }));
  }
  function corFigma(c) {
    const { r, g, b, a } = lerCor(c);
    return { r: arredondar(r / 255), g: arredondar(g / 255), b: arredondar(b / 255), a };
  }
  function corDeFigma(c) {
    var _a;
    return corHex({ r: c.r * 255, g: c.g * 255, b: c.b * 255, a: (_a = c.a) != null ? _a : 1 });
  }

  // src/app/kcx/svg-caminho.ts
  function amostrar(d, passos = 32) {
    var _a;
    const tokens = (_a = d.match(/[MLHVCSQZ]|-?\d*\.?\d+(?:e-?\d+)?/gi)) != null ? _a : [];
    const pts = [];
    let i = 0;
    let cmd = "";
    let atual = { x: 0, y: 0 };
    let inicio = { x: 0, y: 0 };
    let ultimoControle = null;
    const num = () => Number(tokens[i++]);
    const cubica = (p0, p1, p2, p3) => {
      for (let k = 1; k <= passos; k++) {
        const t = k / passos;
        const u = 1 - t;
        pts.push({
          x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
          y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y
        });
      }
    };
    while (i < tokens.length) {
      if (/^[MLHVCSQZ]$/i.test(tokens[i])) cmd = tokens[i++];
      if (/[a-z]/.test(cmd) && cmd !== "z")
        throw new Error(`KCX: comando relativo "${cmd}" n\xE3o suportado; use absolutos.`);
      switch (cmd.toUpperCase()) {
        case "M":
          atual = { x: num(), y: num() };
          inicio = atual;
          pts.push(atual);
          cmd = "L";
          ultimoControle = null;
          break;
        case "L":
          atual = { x: num(), y: num() };
          pts.push(atual);
          ultimoControle = null;
          break;
        case "H":
          atual = { x: num(), y: atual.y };
          pts.push(atual);
          ultimoControle = null;
          break;
        case "V":
          atual = { x: atual.x, y: num() };
          pts.push(atual);
          ultimoControle = null;
          break;
        case "C": {
          const c1 = { x: num(), y: num() };
          const c2 = { x: num(), y: num() };
          const fim = { x: num(), y: num() };
          cubica(atual, c1, c2, fim);
          ultimoControle = c2;
          atual = fim;
          break;
        }
        case "S": {
          const c1 = ultimoControle ? { x: 2 * atual.x - ultimoControle.x, y: 2 * atual.y - ultimoControle.y } : atual;
          const c2 = { x: num(), y: num() };
          const fim = { x: num(), y: num() };
          cubica(atual, c1, c2, fim);
          ultimoControle = c2;
          atual = fim;
          break;
        }
        case "Q": {
          const c = { x: num(), y: num() };
          const fim = { x: num(), y: num() };
          cubica(
            atual,
            { x: atual.x + 2 / 3 * (c.x - atual.x), y: atual.y + 2 / 3 * (c.y - atual.y) },
            { x: fim.x + 2 / 3 * (c.x - fim.x), y: fim.y + 2 / 3 * (c.y - fim.y) },
            fim
          );
          ultimoControle = null;
          atual = fim;
          break;
        }
        case "Z":
          atual = inicio;
          pts.push(atual);
          ultimoControle = null;
          break;
        default:
          throw new Error(`KCX: comando "${cmd}" n\xE3o suportado.`);
      }
    }
    return pts;
  }
  var dist = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);
  function comprimento(d) {
    const p = amostrar(d);
    let total = 0;
    for (let k = 1; k < p.length; k++) total += dist(p[k - 1], p[k]);
    return total;
  }
  function pontoEm(d, t) {
    const p = amostrar(d);
    const alvo = Math.min(1, Math.max(0, t)) * comprimento(d);
    let andado = 0;
    for (let k = 1; k < p.length; k++) {
      const seg = dist(p[k - 1], p[k]);
      if (andado + seg >= alvo) {
        const f = seg === 0 ? 0 : (alvo - andado) / seg;
        return {
          x: p[k - 1].x + (p[k].x - p[k - 1].x) * f,
          y: p[k - 1].y + (p[k].y - p[k - 1].y) * f
        };
      }
      andado += seg;
    }
    return p[p.length - 1];
  }
  function cortarCaminho(d, alvo) {
    const p = amostrar(d);
    const r = (n) => Math.round(n * 100) / 100;
    const saida = [p[0]];
    let andado = 0;
    for (let k = 1; k < p.length; k++) {
      const seg = dist(p[k - 1], p[k]);
      if (andado + seg >= alvo) {
        const f = seg === 0 ? 0 : (alvo - andado) / seg;
        saida.push({
          x: p[k - 1].x + (p[k].x - p[k - 1].x) * f,
          y: p[k - 1].y + (p[k].y - p[k - 1].y) * f
        });
        break;
      }
      saida.push(p[k]);
      andado += seg;
    }
    if (saida.length === 1) saida.push({ x: saida[0].x + 0.01, y: saida[0].y });
    return saida.map((q, i) => `${i ? "L" : "M"} ${r(q.x)} ${r(q.y)}`).join(" ");
  }
  function cortarSvg(svg, alvo) {
    return svg.replace(/(<path[^>]*\sd=")([^"]+)(")/, (_, a, d, b) => a + cortarCaminho(d, alvo) + b);
  }
  function comprimentoSvg(svg) {
    const m = /<path[^>]*\sd="([^"]+)"/.exec(svg);
    return m ? comprimento(m[1]) : 0;
  }

  // src/app/kcx/resolver.ts
  var NUMERICOS = /* @__PURE__ */ new Set(["number", "float", "dimension", "time"]);
  function ehNumerico(v) {
    return NUMERICOS.has(v.tipo);
  }
  function ehGradiente(x) {
    const g = x;
    return !!g && typeof g === "object" && typeof g.angulo === "number" && Array.isArray(g.paradas) && g.paradas.length >= 2 && g.paradas.every(
      (p) => corValida(p == null ? void 0 : p.cor) && typeof p.posicao === "number" && p.posicao >= 0 && p.posicao <= 1
    );
  }
  function ehTransformacao(x) {
    const t = x;
    return !!t && typeof t === "object" && ["x", "y", "escala", "rotacao"].every((k) => Number.isFinite(t[k]));
  }
  function validarValor(v, valor) {
    var _a;
    const e = [];
    switch (v.tipo) {
      case "color":
        if (!corValida(valor)) e.push(`"${v.id}": cor inv\xE1lida (${String(valor)}).`);
        break;
      case "boolean":
        if (typeof valor !== "boolean") e.push(`"${v.id}": esperado verdadeiro/falso.`);
        break;
      case "string":
        if (typeof valor !== "string") e.push(`"${v.id}": esperado texto.`);
        break;
      case "enum":
        if (!((_a = v.opcoes) == null ? void 0 : _a.some((o) => o.valor === valor)))
          e.push(`"${v.id}": op\xE7\xE3o "${String(valor)}" n\xE3o existe.`);
        break;
      case "gradient":
        if (!ehGradiente(valor))
          e.push(`"${v.id}": gradiente inv\xE1lido (\xE2ngulo + 2 ou mais paradas com cor e posi\xE7\xE3o 0\u20131).`);
        break;
      case "transform":
        if (!ehTransformacao(valor))
          e.push(`"${v.id}": transforma\xE7\xE3o inv\xE1lida (x, y, escala, rota\xE7\xE3o num\xE9ricos).`);
        break;
      default: {
        if (typeof valor !== "number" || !Number.isFinite(valor)) {
          e.push(`"${v.id}": esperado n\xFAmero.`);
          break;
        }
        if (v.min !== void 0 && valor < v.min)
          e.push(`"${v.id}": ${valor} abaixo do m\xEDnimo ${v.min}.`);
        if (v.max !== void 0 && valor > v.max)
          e.push(`"${v.id}": ${valor} acima do m\xE1ximo ${v.max}.`);
        if (v.tipo === "number" && !Number.isInteger(valor))
          e.push(`"${v.id}": esperado n\xFAmero inteiro.`);
      }
    }
    return e;
  }
  function normalizarValor(v, valor) {
    if (ehNumerico(v)) {
      let n = typeof valor === "string" && valor.trim() !== "" ? Number(valor) : valor;
      if (typeof n !== "number" || !Number.isFinite(n)) return v.padrao;
      if (v.min !== void 0) n = Math.max(v.min, n);
      if (v.max !== void 0) n = Math.min(v.max, n);
      if (v.tipo === "number") n = Math.round(n);
      return arredondar(n);
    }
    if (v.tipo === "boolean" && (valor === "true" || valor === "false")) return valor === "true";
    return validarValor(v, valor).length ? v.padrao : valor;
  }
  function comoNumero(x, id) {
    if (typeof x !== "number") throw new Error(`KCX: a opera\xE7\xE3o em "${id}" precisa de n\xFAmero.`);
    return x;
  }
  function aplicarOperacoes(variavel2, valor, ops = [], valores = {}, todas = []) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s;
    let x = valor;
    let unidade = (_a = variavel2.unidade) != null ? _a : "";
    for (const o of ops) {
      switch (o.op) {
        case "multiplicar":
          x = comoNumero(x, variavel2.id) * o.fator;
          break;
        case "somar":
          x = comoNumero(x, variavel2.id) + o.valor;
          break;
        case "mapear": {
          const n = comoNumero(x, variavel2.id);
          const [a, b] = o.de;
          const [c, d] = o.para;
          x = b === a ? c : c + (n - a) * (d - c) / (b - a);
          break;
        }
        case "limitar": {
          let n = comoNumero(x, variavel2.id);
          if (o.min !== void 0) n = Math.max(o.min, n);
          if (o.max !== void 0) n = Math.min(o.max, n);
          x = n;
          break;
        }
        case "arredondar":
          x = arredondar(comoNumero(x, variavel2.id), o.casas);
          break;
        case "dividir": {
          const n = comoNumero(x, variavel2.id);
          x = n === 0 ? o.numerador : o.numerador / n;
          break;
        }
        case "multiplicarPorVariavel": {
          const outra = (_c = valores[o.variavel]) != null ? _c : (_b = todas.find((t) => t.id === o.variavel)) == null ? void 0 : _b.valor;
          x = comoNumero(x, variavel2.id) * comoNumero(outra, o.variavel);
          break;
        }
        case "dividirPorVariavel": {
          const outra = comoNumero(
            (_e = valores[o.variavel]) != null ? _e : (_d = todas.find((t) => t.id === o.variavel)) == null ? void 0 : _d.valor,
            o.variavel
          );
          x = outra === 0 ? 0 : comoNumero(x, variavel2.id) / outra;
          break;
        }
        case "variavelPorOpcao": {
          const alvo = o.variaveis[String(x)];
          x = (_h = alvo && ((_g = valores[alvo]) != null ? _g : (_f = todas.find((t) => t.id === alvo)) == null ? void 0 : _f.valor)) != null ? _h : x;
          break;
        }
        case "alphaPorOpcao": {
          if (typeof x !== "string")
            throw new Error(`KCX: alphaPorOpcao em "${variavel2.id}" precisa de cor.`);
          const op = String((_j = valores[o.variavel]) != null ? _j : (_i = todas.find((t) => t.id === o.variavel)) == null ? void 0 : _i.valor);
          x = comAlpha(x, (_k = o.valores[op]) != null ? _k : 1);
          break;
        }
        case "somarVariavel": {
          const outra = (_m = valores[o.variavel]) != null ? _m : (_l = todas.find((t) => t.id === o.variavel)) == null ? void 0 : _l.valor;
          x = comoNumero(x, variavel2.id) + o.fator * comoNumero(outra, o.variavel);
          break;
        }
        case "alpha": {
          if (typeof x !== "string")
            throw new Error(`KCX: alpha em "${variavel2.id}" precisa de cor.`);
          const a = o.variavel ? (_o = valores[o.variavel]) != null ? _o : (_n = todas.find((t) => t.id === o.variavel)) == null ? void 0 : _n.valor : o.valor;
          x = comAlpha(x, comoNumero(a != null ? a : 1, (_p = o.variavel) != null ? _p : variavel2.id));
          break;
        }
        case "converter":
          if (!conversivel(unidade, o.para))
            throw new Error(`KCX: "${variavel2.id}" n\xE3o converte ${unidade} \u2192 ${o.para}.`);
          x = converter(comoNumero(x, variavel2.id), unidade, o.para);
          unidade = o.para;
          break;
        case "mapa": {
          const chave = String(x);
          if (!(chave in o.valores))
            throw new Error(`KCX: "${variavel2.id}" sem mapa para "${chave}".`);
          x = o.valores[chave];
          break;
        }
        case "pontoNoCaminho":
        case "tracoNoCaminho": {
          const forma = String((_r = valores[o.variavel]) != null ? _r : (_q = todas.find((t2) => t2.id === o.variavel)) == null ? void 0 : _q.valor);
          const d = o.caminhos[forma];
          if (!d) throw new Error(`KCX: caminho "${forma}" n\xE3o encontrado.`);
          const t = comoNumero(x, variavel2.id);
          x = o.op === "tracoNoCaminho" ? comprimento(d) * t : pontoEm(d, t)[o.eixo] + ((_s = o.somar) != null ? _s : 0);
          break;
        }
      }
    }
    return x;
  }
  function valoresAtuais(variaveis, valores = {}) {
    return Object.fromEntries(variaveis.map((v) => {
      var _a;
      return [v.id, (_a = valores[v.id]) != null ? _a : v.valor];
    }));
  }

  // src/app/kcx/logo.ts
  var MAX_BYTES_IMAGEM = 400 * 1024;
  var RASTER = /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/]+=*$/;
  var SVG_B64 = /^data:image\/svg\+xml;base64,([A-Za-z0-9+/]+=*)$/;
  var SVG_TXT = new RegExp("^data:image\\/svg\\+xml(;charset=utf-8)?,(.+)$", "is");
  var PERIGOSO = /<script|<foreignObject|\son[a-z]+\s*=|javascript:|<iframe|<embed|<object/i;
  var B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  function decodificarBase64(b64) {
    const limpo = b64.replace(/=+$/, "");
    const bytes = [];
    let buf = 0;
    let bits = 0;
    for (const ch of limpo) {
      const v = B64.indexOf(ch);
      if (v < 0) throw new Error("base64 inv\xE1lido");
      buf = buf << 6 | v;
      bits += 6;
      if (bits >= 8) {
        bits -= 8;
        bytes.push(buf >> bits & 255);
      }
    }
    let out = "";
    for (let i = 0; i < bytes.length; i++) {
      const b = bytes[i];
      if (b < 128) out += String.fromCharCode(b);
      else if (b >= 192 && b < 224)
        out += String.fromCharCode((b & 31) << 6 | bytes[++i] & 63);
      else if (b >= 224 && b < 240)
        out += String.fromCharCode(
          (b & 15) << 12 | (bytes[++i] & 63) << 6 | bytes[++i] & 63
        );
      else {
        const cp = (b & 7) << 18 | (bytes[++i] & 63) << 12 | (bytes[++i] & 63) << 6 | bytes[++i] & 63;
        out += String.fromCodePoint(cp);
      }
    }
    return out;
  }
  function svgDaDataUrl(src) {
    try {
      const b = SVG_B64.exec(src);
      if (b) return decodificarBase64(b[1]);
      const t = SVG_TXT.exec(src);
      if (t) return decodeURIComponent(t[2]);
    } catch (e) {
      return null;
    }
    return null;
  }
  function problemaDaImagem(src) {
    if (typeof src !== "string" || !src.startsWith("data:image/"))
      return "Envie um arquivo de imagem (PNG, JPG, WebP, GIF ou SVG).";
    if (src.length * 0.75 > MAX_BYTES_IMAGEM)
      return `Imagem muito grande: at\xE9 ${Math.round(MAX_BYTES_IMAGEM / 1024)} KB.`;
    if (RASTER.test(src)) return null;
    const svg = svgDaDataUrl(src);
    if (svg === null) return "Formato n\xE3o aceito: use PNG, JPG, WebP, GIF ou SVG.";
    if (!/<svg[\s>]/i.test(svg)) return "O arquivo SVG n\xE3o tem uma tag <svg>.";
    if (PERIGOSO.test(svg)) return "Este SVG tem script ou eventos: exporte de novo sem eles.";
    return null;
  }
  function validarLogo(l) {
    const o = l;
    if (!o || typeof o !== "object") return ["logo precisa ser um objeto."];
    const erros = [];
    const p = problemaDaImagem(o.src);
    if (p) erros.push(`logo: ${p}`);
    for (const k of ["largura", "altura"])
      if (!(Number(o[k]) > 0 && Number(o[k]) <= 1e4)) erros.push(`logo.${k} precisa ser > 0.`);
    return erros;
  }

  // src/app/kcx/cores.ts
  var rgb = (hex3) => {
    const h = hex3.replace("#", "").slice(0, 6);
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  };
  var hex = (c) => "#" + c.map(
    (x) => Math.round(Math.min(255, Math.max(0, x))).toString(16).padStart(2, "0")
  ).join("");
  var misturar = (a, b, t) => {
    const x = rgb(a);
    const y = rgb(b);
    return hex(x.map((v, i) => v + (y[i] - v) * t));
  };
  var PASSOS_ESCALA = [
    [50, -0.92],
    [100, -0.82],
    [200, -0.66],
    [300, -0.46],
    [400, -0.24],
    [500, 0],
    [600, 0.14],
    [700, 0.3],
    [800, 0.46],
    [900, 0.62]
  ];
  function escalaTonal(base) {
    return PASSOS_ESCALA.map(([passo, t]) => ({
      passo,
      cor: t === 0 ? base.toLowerCase().slice(0, 7) : t < 0 ? misturar(base, "#ffffff", -t) : misturar(base, "#000000", t)
    }));
  }

  // src/app/kcx/fundacao.ts
  var FORMATO_FUNDACAO = "kcx-fundacao";
  var VERSAO_FUNDACAO = "1.0.0";
  var TOKENS_COR = [
    "primaria",
    "secundaria",
    "destaque",
    "fundo",
    "superficie",
    "borda",
    "texto",
    "texto-suave",
    "sobre-primaria",
    "perigo",
    "sucesso",
    "aviso"
  ];
  var NOMES_COR = {
    primaria: "Prim\xE1ria",
    secundaria: "Secund\xE1ria",
    destaque: "Destaque",
    fundo: "Fundo",
    superficie: "Superf\xEDcie",
    borda: "Borda",
    texto: "Texto",
    "texto-suave": "Texto suave",
    "sobre-primaria": "Texto sobre a prim\xE1ria",
    perigo: "Perigo",
    sucesso: "Sucesso",
    aviso: "Aviso"
  };
  var NIVEIS_TEXTO = ["display", "h1", "h2", "h3", "corpo", "pequeno", "legenda"];
  var NOMES_TEXTO = {
    display: "Display",
    h1: "H1",
    h2: "H2",
    h3: "H3",
    corpo: "Corpo",
    pequeno: "Pequeno",
    legenda: "Legenda"
  };
  var CHAVES_RAIO = ["p", "m", "g", "pill"];
  var CHAVES_ESPACO = ["1", "2", "3", "4", "6", "8", "12", "16"];
  var CHAVES_SOMBRA = ["p", "m", "g"];
  var MOVIMENTO_PADRAO = {
    rapido: 150,
    normal: 300,
    lento: 500,
    easing: "cubic-bezier(0.22, 1, 0.36, 1)"
  };
  var LAYOUT_PADRAO = {
    container: 1200,
    colunas: 12,
    gutter: 24,
    margem: 16,
    tablet: 768,
    desktop: 1024
  };
  var FUNCOES_COR = {
    primaria: "A\xE7\xE3o principal: bot\xF5es de destaque, links, item ativo, foco. Use com modera\xE7\xE3o para n\xE3o perder a for\xE7a.",
    secundaria: "A\xE7\xF5es e elementos de apoio: bot\xF5es secund\xE1rios, selos, gr\xE1ficos. Complementa a prim\xE1ria.",
    destaque: "Detalhes que precisam saltar aos olhos: novidades, badges, realces pontuais.",
    fundo: "Fundo da p\xE1gina. Base de todas as outras cores.",
    superficie: "Cards, pain\xE9is, menus e janelas: tudo que fica \u201Cpor cima\u201D do fundo.",
    borda: "Divis\xF3rias, contornos de campos e cards.",
    texto: "T\xEDtulos e texto corrido. Precisa de contraste alto com o fundo e a superf\xEDcie.",
    "texto-suave": "Textos de apoio: legendas, descri\xE7\xF5es, placeholders, datas.",
    "sobre-primaria": "Texto e \xEDcones em cima da cor prim\xE1ria (ex.: r\xF3tulo do bot\xE3o principal).",
    perigo: "Erros, a\xE7\xF5es destrutivas (excluir) e alertas cr\xEDticos.",
    sucesso: "Confirma\xE7\xF5es, conclu\xEDdo, valores positivos.",
    aviso: "Aten\xE7\xE3o sem ser erro: pend\xEAncias, limites pr\xF3ximos."
  };
  var FUNDACAO_PADRAO = {
    formato: FORMATO_FUNDACAO,
    versao: VERSAO_FUNDACAO,
    nome: "Kalixto",
    cores: {
      primaria: { escuro: "#d4119f", claro: "#b00d84" },
      secundaria: { escuro: "#7c3aed", claro: "#6d28d9" },
      destaque: { escuro: "#22e3ff", claro: "#0891b2" },
      fundo: { escuro: "#0b0a14", claro: "#ffffff" },
      superficie: { escuro: "#1a1530", claro: "#f3f1fb" },
      borda: { escuro: "#2e2850", claro: "#dcd8ec" },
      texto: { escuro: "#f4f2ff", claro: "#1a1530" },
      "texto-suave": { escuro: "#a9a3c9", claro: "#5b5675" },
      "sobre-primaria": { escuro: "#ffffff", claro: "#ffffff" },
      perigo: { escuro: "#ff5c7a", claro: "#dc2626" },
      sucesso: { escuro: "#3ddc97", claro: "#15803d" },
      aviso: { escuro: "#ffb547", claro: "#b45309" }
    },
    fontes: { titulo: "Space Grotesk", corpo: "Inter", mono: "JetBrains Mono" },
    texto: {
      display: {
        familia: "titulo",
        peso: 700,
        tamanho: 56,
        tamanhoCelular: 40,
        altura: 1.1,
        espacamento: -1
      },
      h1: {
        familia: "titulo",
        peso: 700,
        tamanho: 40,
        tamanhoCelular: 32,
        altura: 1.15,
        espacamento: -0.5
      },
      h2: {
        familia: "titulo",
        peso: 700,
        tamanho: 32,
        tamanhoCelular: 26,
        altura: 1.2,
        espacamento: 0
      },
      h3: {
        familia: "titulo",
        peso: 600,
        tamanho: 24,
        tamanhoCelular: 20,
        altura: 1.3,
        espacamento: 0
      },
      corpo: {
        familia: "corpo",
        peso: 400,
        tamanho: 16,
        tamanhoCelular: 15,
        altura: 1.5,
        espacamento: 0
      },
      pequeno: {
        familia: "corpo",
        peso: 400,
        tamanho: 14,
        tamanhoCelular: 13,
        altura: 1.45,
        espacamento: 0
      },
      legenda: {
        familia: "corpo",
        peso: 500,
        tamanho: 12,
        tamanhoCelular: 12,
        altura: 1.4,
        espacamento: 0.4
      }
    },
    raios: { p: 6, m: 12, g: 20, pill: 999 },
    espacos: { "1": 4, "2": 8, "3": 12, "4": 16, "6": 24, "8": 32, "12": 48, "16": 64 },
    sombras: {
      p: { x: 0, y: 2, raio: 6, espalhar: 0, opacidade: 0.18 },
      m: { x: 0, y: 8, raio: 24, espalhar: -4, opacidade: 0.24 },
      g: { x: 0, y: 20, raio: 48, espalhar: -8, opacidade: 0.32 }
    }
  };
  var HEX2 = /^#[0-9a-f]{6}([0-9a-f]{2})?$/i;
  function validarFundacao(f) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    const erros = [];
    const o = f;
    if (!o || typeof o !== "object") return ["A funda\xE7\xE3o n\xE3o \xE9 um objeto."];
    if (o.formato !== FORMATO_FUNDACAO) erros.push(`formato deve ser "${FORMATO_FUNDACAO}".`);
    if (typeof o.nome !== "string" || !o.nome.trim()) erros.push("nome obrigat\xF3rio.");
    if (o.logo !== void 0) erros.push(...validarLogo(o.logo));
    if (o.movimento !== void 0) {
      const m = o.movimento;
      for (const k of ["rapido", "normal", "lento"])
        if (!(Number(m == null ? void 0 : m[k]) >= 0 && Number(m == null ? void 0 : m[k]) <= 5e3))
          erros.push(`movimento.${k} precisa ser de 0 a 5000 ms.`);
      if (!/^cubic-bezier\(\s*[-\d.]+\s*,\s*[-\d.]+\s*,\s*[-\d.]+\s*,\s*[-\d.]+\s*\)$/.test(
        (_a = m == null ? void 0 : m.easing) != null ? _a : ""
      ))
        erros.push("movimento.easing precisa ser cubic-bezier(x1, y1, x2, y2).");
    }
    if (o.layout !== void 0) {
      const l = o.layout;
      for (const k of ["container", "colunas", "gutter", "margem", "tablet", "desktop"])
        if (!(Number(l == null ? void 0 : l[k]) >= 0 && Number(l == null ? void 0 : l[k]) <= 4e3)) erros.push(`layout.${k} inv\xE1lido.`);
      if (!(Number(l == null ? void 0 : l.colunas) >= 1 && Number(l == null ? void 0 : l.colunas) <= 24))
        erros.push("layout.colunas vai de 1 a 24.");
    }
    for (const t of TOKENS_COR) {
      const c = (_b = o.cores) == null ? void 0 : _b[t];
      if (!c || !HEX2.test((_c = c.escuro) != null ? _c : "") || !HEX2.test((_d = c.claro) != null ? _d : ""))
        erros.push(`cores.${t}: precisa de "escuro" e "claro" em hex (#rrggbb).`);
    }
    for (const k of ["titulo", "corpo", "mono"])
      if (typeof ((_e = o.fontes) == null ? void 0 : _e[k]) !== "string" || !o.fontes[k].trim())
        erros.push(`fontes.${k} obrigat\xF3ria.`);
    for (const n of NIVEIS_TEXTO) {
      const e = (_f = o.texto) == null ? void 0 : _f[n];
      if (!e || !(e.tamanho > 0) || !(e.tamanhoCelular > 0) || !(e.altura > 0) || !(e.peso >= 100))
        erros.push(`texto.${n}: tamanho, tamanhoCelular, altura e peso positivos.`);
    }
    for (const k of CHAVES_RAIO)
      if (!(Number((_g = o.raios) == null ? void 0 : _g[k]) >= 0)) erros.push(`raios.${k} precisa ser um n\xFAmero \u2265 0.`);
    for (const k of CHAVES_ESPACO)
      if (!(Number((_h = o.espacos) == null ? void 0 : _h[k]) >= 0)) erros.push(`espacos.${k} precisa ser um n\xFAmero \u2265 0.`);
    for (const k of CHAVES_SOMBRA) {
      const s = (_i = o.sombras) == null ? void 0 : _i[k];
      if (!s || [s.x, s.y, s.raio, s.espalhar, s.opacidade].some((x) => typeof x !== "number"))
        erros.push(`sombras.${k}: x, y, raio, espalhar e opacidade num\xE9ricos.`);
    }
    return erros;
  }
  function completarFundacao(f) {
    var _a, _b;
    const p = FUNDACAO_PADRAO;
    return __spreadProps(__spreadValues(__spreadValues(__spreadValues({
      formato: FORMATO_FUNDACAO,
      versao: (_a = f.versao) != null ? _a : p.versao,
      nome: ((_b = f.nome) == null ? void 0 : _b.trim()) || p.nome,
      cores: __spreadValues(__spreadValues({}, p.cores), f.cores),
      fontes: __spreadValues(__spreadValues({}, p.fontes), f.fontes),
      texto: Object.fromEntries(
        NIVEIS_TEXTO.map((n) => {
          var _a2;
          return [n, __spreadValues(__spreadValues({}, p.texto[n]), (_a2 = f.texto) == null ? void 0 : _a2[n])];
        })
      ),
      raios: __spreadValues(__spreadValues({}, p.raios), f.raios),
      espacos: __spreadValues(__spreadValues({}, p.espacos), f.espacos),
      sombras: Object.fromEntries(
        CHAVES_SOMBRA.map((k) => {
          var _a2;
          return [k, __spreadValues(__spreadValues({}, p.sombras[k]), (_a2 = f.sombras) == null ? void 0 : _a2[k])];
        })
      )
    }, f.logo && !validarLogo(f.logo).length ? { logo: f.logo } : {}), f.funcoes ? { funcoes: textosValidos(f.funcoes, TOKENS_COR) } : {}), f.usoTexto ? { usoTexto: textosValidos(f.usoTexto, NIVEIS_TEXTO) } : {}), {
      movimento: __spreadValues(__spreadValues({}, MOVIMENTO_PADRAO), f.movimento),
      layout: __spreadValues(__spreadValues({}, LAYOUT_PADRAO), f.layout)
    });
  }
  function textosValidos(o, chaves) {
    const r = {};
    for (const k of chaves) {
      const t = o == null ? void 0 : o[k];
      if (typeof t === "string" && t.trim()) r[k] = t.trim().slice(0, 300);
    }
    return r;
  }
  var funcaoDaCor = (f, t) => {
    var _a;
    return ((_a = f.funcoes) == null ? void 0 : _a[t]) || FUNCOES_COR[t];
  };
  var PREFIXO_FUNDACAO = "Funda\xE7\xE3o";
  var nomeTokenCor = (t) => `${PREFIXO_FUNDACAO}/cor/${t}`;
  var nomeTokenRaio = (k) => `${PREFIXO_FUNDACAO}/raio/${k}`;
  var nomeTokenEspaco = (k) => `${PREFIXO_FUNDACAO}/espaco/${k}`;
  var nomeTokenTamanho = (n) => `${PREFIXO_FUNDACAO}/texto/${n}/tamanho`;
  var nomeTokenFonte = (k) => `${PREFIXO_FUNDACAO}/fonte/${k}`;
  var nomeEstiloTexto = (n) => `${PREFIXO_FUNDACAO}/${NOMES_TEXTO[n]}`;
  var nomeEstiloSombra = (k) => `${PREFIXO_FUNDACAO}/Sombra ${k.toUpperCase()}`;
  var cssVar = (s) => `--kx-${s.replace(/\//g, "-")}`;
  function estiloDoPeso(peso2) {
    if (peso2 >= 800) return "Extra Bold";
    if (peso2 >= 700) return "Bold";
    if (peso2 >= 600) return "Semi Bold";
    if (peso2 >= 500) return "Medium";
    return "Regular";
  }
  var COLECAO_CORES = "KCX \xB7 Colors";
  var COLECAO_ESPACO = "KCX \xB7 Spacing";
  var COLECAO_DIMENSOES = "KCX \xB7 Dimensions";
  var COLECAO_TIPOGRAFIA = "KCX \xB7 Typography";
  function variaveisDaFundacao(f) {
    var _a, _b;
    const out = [];
    const base = (nome, colecao, tipo, valores, escopos, descricao) => ({
      nome,
      colecao,
      tipo,
      valores,
      escopos,
      descricao,
      codigoWeb: `var(${cssVar(nome.slice(PREFIXO_FUNDACAO.length + 1))})`,
      origem: "fundacao",
      variavelKcx: nome,
      vinculadaA: []
    });
    for (const t of TOKENS_COR)
      out.push(
        base(
          nomeTokenCor(t),
          COLECAO_CORES,
          "COLOR",
          { Dark: corFigma(f.cores[t].escuro), Light: corFigma(f.cores[t].claro) },
          t.startsWith("texto") || t === "sobre-primaria" ? ["TEXT_FILL", "STROKE_COLOR"] : ["ALL_FILLS", "STROKE_COLOR", "EFFECT_COLOR"],
          `${NOMES_COR[t]}: ${funcaoDaCor(f, t)}`
        )
      );
    for (const k of CHAVES_RAIO)
      out.push(
        base(
          nomeTokenRaio(k),
          COLECAO_DIMENSOES,
          "FLOAT",
          { Desktop: f.raios[k], Celular: f.raios[k] },
          ["CORNER_RADIUS"],
          `Raio ${k.toUpperCase()} da funda\xE7\xE3o.`
        )
      );
    for (const k of CHAVES_ESPACO)
      out.push(
        base(
          nomeTokenEspaco(k),
          COLECAO_ESPACO,
          "FLOAT",
          { Desktop: f.espacos[k], Celular: f.espacos[k] },
          ["GAP", "WIDTH_HEIGHT"],
          `Espa\xE7o ${k} (${f.espacos[k]} px) da funda\xE7\xE3o.`
        )
      );
    for (const n of NIVEIS_TEXTO)
      out.push(
        base(
          nomeTokenTamanho(n),
          COLECAO_TIPOGRAFIA,
          "FLOAT",
          { Desktop: f.texto[n].tamanho, Celular: f.texto[n].tamanhoCelular },
          ["FONT_SIZE"],
          `Tamanho do texto ${NOMES_TEXTO[n]} (desktop e celular).`
        )
      );
    for (const k of ["titulo", "corpo", "mono"])
      out.push(
        base(
          nomeTokenFonte(k),
          COLECAO_TIPOGRAFIA,
          "STRING",
          { Desktop: f.fontes[k], Celular: f.fontes[k] },
          ["FONT_FAMILY"],
          `Fam\xEDlia da fonte de ${k === "titulo" ? "t\xEDtulos" : k === "corpo" ? "texto corrido" : "c\xF3digo"}.`
        )
      );
    for (const t of TOKENS_ESCALA) {
      const e = escalaTonal(f.cores[t].escuro);
      const c = escalaTonal(f.cores[t].claro);
      e.forEach(
        ({ passo }, i) => out.push(
          base(
            `${PREFIXO_FUNDACAO}/escala/${t}/${passo}`,
            COLECAO_CORES,
            "COLOR",
            { Dark: corFigma(e[i].cor), Light: corFigma(c[i].cor) },
            ["ALL_FILLS", "STROKE_COLOR", "TEXT_FILL", "EFFECT_COLOR"],
            `Escala de ${NOMES_COR[t]}: ${passo} (${passo < 500 ? "mais clara" : passo > 500 ? "mais escura" : "a pr\xF3pria cor"}).`
          )
        )
      );
    }
    const mov = (_a = f.movimento) != null ? _a : MOVIMENTO_PADRAO;
    for (const k of ["rapido", "normal", "lento"])
      out.push(
        base(
          `${PREFIXO_FUNDACAO}/movimento/${k}`,
          COLECAO_DIMENSOES,
          "FLOAT",
          { Desktop: mov[k], Celular: mov[k] },
          [],
          `[Documental] Dura\xE7\xE3o ${k} das anima\xE7\xF5es: ${mov[k]} ms (${mov.easing}).`
        )
      );
    const lay = (_b = f.layout) != null ? _b : LAYOUT_PADRAO;
    for (const k of ["container", "colunas", "gutter", "margem"])
      out.push(
        base(
          `${PREFIXO_FUNDACAO}/layout/${k}`,
          COLECAO_DIMENSOES,
          "FLOAT",
          { Desktop: lay[k], Celular: k === "colunas" ? 4 : k === "gutter" ? lay.margem : lay[k] },
          k === "gutter" || k === "margem" ? ["GAP"] : k === "container" ? ["WIDTH_HEIGHT"] : [],
          `Layout: ${k} (${k === "colunas" ? "colunas do grid" : "px"}).`
        )
      );
    return out;
  }
  var TOKENS_ESCALA = [
    "primaria",
    "secundaria",
    "destaque",
    "perigo",
    "sucesso",
    "aviso"
  ];
  function planoDaFundacao(f) {
    return {
      nome: f.nome,
      versao: f.versao,
      estilosTexto: NIVEIS_TEXTO.map((n) => {
        const e = f.texto[n];
        return {
          nome: nomeEstiloTexto(n),
          nivel: n,
          familia: f.fontes[e.familia],
          estilo: estiloDoPeso(e.peso),
          tamanho: e.tamanho,
          alturaLinha: Math.round(e.tamanho * e.altura),
          espacamento: e.espacamento,
          variavelTamanho: nomeTokenTamanho(n),
          descricao: `${NOMES_TEXTO[n]}: ${f.fontes[e.familia]} ${e.peso}, ${e.tamanho}/${Math.round(e.tamanho * e.altura)} px (celular ${e.tamanhoCelular} px).`
        };
      }),
      estilosSombra: CHAVES_SOMBRA.map((k) => {
        const s = f.sombras[k];
        return {
          nome: nomeEstiloSombra(k),
          sombra: {
            x: s.x,
            y: s.y,
            raio: s.raio,
            espalhar: s.espalhar,
            cor: { r: 0, g: 0, b: 0, a: s.opacidade }
          },
          descricao: `Sombra ${k.toUpperCase()}: ${s.x} ${s.y} ${s.raio} ${s.espalhar}, preto a ${Math.round(s.opacidade * 100)}%.`
        };
      })
    };
  }
  var igual = (a, b) => {
    var _a, _b;
    if (a === void 0 || b === void 0) return false;
    if (typeof a === "object" && typeof b === "object" && "r" in a && "r" in b) {
      const p = (x) => Math.round(x * 255);
      return p(a.r) === p(b.r) && p(a.g) === p(b.g) && p(a.b) === p(b.b) && Math.round(((_a = a.a) != null ? _a : 1) * 100) === Math.round(((_b = b.a) != null ? _b : 1) * 100);
    }
    return a === b;
  };
  function candidatos(pv, todos) {
    const tokens = todos.filter((t) => !/\/(escala|layout|movimento)\//.test(t.nome));
    if (pv.tipo === "COLOR") return tokens.filter((t) => t.tipo === "COLOR");
    if (pv.tipo !== "FLOAT") return [];
    if (pv.escopos.includes("CORNER_RADIUS"))
      return tokens.filter((t) => t.escopos.includes("CORNER_RADIUS"));
    if (pv.escopos.includes("FONT_SIZE"))
      return tokens.filter((t) => t.escopos.includes("FONT_SIZE"));
    if (pv.escopos.includes("GAP")) return tokens.filter((t) => t.escopos.includes("GAP"));
    return [];
  }
  function ligarAFundacao(plano, f) {
    const tokens = plano.colecoes.flatMap((c) => c.variaveis).filter((v) => v.origem === "fundacao");
    let ligadas = 0;
    for (const c of plano.colecoes)
      for (const pv of c.variaveis) {
        if (pv.origem === "fundacao" || pv.origem === "documental") continue;
        const modos = Object.keys(pv.valores);
        if (modos.some(
          (m) => typeof pv.valores[m] === "object" && pv.valores[m] !== null && "alias" in pv.valores[m]
        ))
          continue;
        const [m0, m1] = modos;
        const proprio = m1 !== void 0 && !igual(pv.valores[m0], pv.valores[m1]);
        const alvo = candidatos(pv, tokens).find(
          (t) => igual(pv.valores[m0], t.valores[m0]) && (!proprio || igual(pv.valores[m1], t.valores[m1]))
        );
        if (!alvo) continue;
        pv.valores = Object.fromEntries(modos.map((m) => [m, { alias: alvo.nome }]));
        pv.descricao = `${pv.descricao} \u2192 usa o token ${alvo.nome}.`;
        if (!alvo.vinculadaA.includes(pv.nome)) alvo.vinculadaA.push(`${pv.nome} (alias)`);
        ligadas++;
      }
    const estilos = NIVEIS_TEXTO.map((n) => ({
      n,
      familia: f.fontes[f.texto[n].familia],
      estilo: estiloDoPeso(f.texto[n].peso),
      tamanho: f.texto[n].tamanho
    }));
    const marcar = (no) => {
      const t = no.texto;
      if (t) {
        const e = estilos.find(
          (x) => x.tamanho === Number(t.tamanho.valor) && x.familia === t.familia && x.estilo === t.estilo
        );
        if (e) t.estiloTexto = nomeEstiloTexto(e.n);
      }
      no.filhos.forEach(marcar);
    };
    for (const comp of plano.componentes) for (const v of comp.variantes) marcar(v.arvore);
    return ligadas;
  }

  // src/app/kcx/validar.ts
  var TIPOS = [
    "color",
    "number",
    "float",
    "boolean",
    "string",
    "enum",
    "dimension",
    "time",
    "gradient",
    "transform"
  ];
  var GRUPOS = ["colors", "dimensions", "spacing", "typography", "motion", "effects", "components"];
  var SECOES = ["aparencia", "animacao", "comportamento"];
  var UNIDADES = ["", "px", "rem", "em", "%", "ms", "s", "deg", "turn", "rad", "x"];
  var ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  var ID_VAR = /^[a-zA-Z][a-zA-Z0-9]*$/;
  var SEMVER = /^\d+\.\d+\.\d+(?:-[0-9a-z.-]+)?$/i;
  var ehObjeto = (x) => !!x && typeof x === "object" && !Array.isArray(x);
  var ehTexto = (x) => typeof x === "string" && x.trim() !== "";
  function ehRefVariavel(r) {
    return ehObjeto(r) && typeof r["$var"] === "string";
  }
  function ehRefDerivada(r) {
    return ehObjeto(r) && typeof r["$derivado"] === "string";
  }
  function validarVariavel(v, c, todas, erros) {
    const e = (campo, mensagem) => erros.push({ caminho: `${c}.${campo}`, mensagem });
    if (!ehTexto(v.id) || !ID_VAR.test(v.id))
      e("id", "ID da vari\xE1vel deve ser camelCase (ex.: primaryColor).");
    if (!ehTexto(v.nome)) e("nome", "Nome obrigat\xF3rio.");
    if (!TIPOS.includes(v.tipo)) e("tipo", `Tipo "${String(v.tipo)}" n\xE3o suportado.`);
    if (!GRUPOS.includes(v.grupo)) e("grupo", `Grupo "${String(v.grupo)}" inv\xE1lido.`);
    if (!SECOES.includes(v.secao)) e("secao", `Se\xE7\xE3o "${String(v.secao)}" inv\xE1lida.`);
    if (v.unidade !== void 0 && !UNIDADES.includes(v.unidade))
      e("unidade", `Unidade "${v.unidade}" inv\xE1lida.`);
    if (typeof v.descricao !== "string") e("descricao", "Descri\xE7\xE3o obrigat\xF3ria.");
    if (typeof v.exportavel !== "boolean") e("exportavel", "Defina se a vari\xE1vel \xE9 export\xE1vel.");
    if (v.min !== void 0 && v.max !== void 0 && v.min > v.max)
      e("min", "M\xEDnimo maior que o m\xE1ximo.");
    if (v.tipo === "enum" && !(v.opcoes && v.opcoes.length >= 2))
      e("opcoes", "Enum precisa de 2 ou mais op\xE7\xF5es.");
    if (!TIPOS.includes(v.tipo)) return;
    for (const p of validarValor(v, v.padrao)) e("padrao", p);
    for (const p of validarValor(v, v.valor)) e("valor", p);
    if (v.modos) {
      for (const [m, val] of Object.entries(v.modos))
        for (const p of validarValor(v, val)) e(`modos.${m}`, p);
    }
    if (!Array.isArray(v.vinculos) || v.vinculos.length === 0) {
      e(
        "vinculos",
        "A vari\xE1vel n\xE3o controla nenhuma propriedade. Vari\xE1veis sem v\xEDnculo n\xE3o s\xE3o permitidas no KCX."
      );
      return;
    }
    v.vinculos.forEach((vin, i) => {
      var _a, _b, _c, _d, _e, _f;
      const cv = `vinculos[${i}]`;
      if (!ehTexto(vin.propriedade)) e(`${cv}.propriedade`, "Descreva a propriedade controlada.");
      if (((_a = vin.alvo) == null ? void 0 : _a.tipo) === "css-var") {
        if (!/^--kcx-[a-z0-9-]+$/.test(vin.alvo.nome))
          e(`${cv}.alvo.nome`, "Custom property precisa come\xE7ar com --kcx- (min\xFAsculas e h\xEDfens).");
      } else if (((_b = vin.alvo) == null ? void 0 : _b.tipo) === "atributo") {
        if (!ehTexto(vin.alvo.seletor) || !ehTexto(vin.alvo.atributo))
          e(`${cv}.alvo`, "Seletor e atributo obrigat\xF3rios.");
        if (/^on/i.test((_c = vin.alvo.atributo) != null ? _c : ""))
          e(`${cv}.alvo.atributo`, "Atributos de evento (on*) n\xE3o s\xE3o permitidos.");
      } else if (((_d = vin.alvo) == null ? void 0 : _d.tipo) === "texto") {
        if (!ehTexto(vin.alvo.seletor)) e(`${cv}.alvo.seletor`, "Seletor obrigat\xF3rio.");
      } else e(`${cv}.alvo`, "Alvo deve ser css-var, atributo ou texto.");
      for (const o of (_e = vin.transformar) != null ? _e : []) {
        if (o.op === "pontoNoCaminho" || o.op === "tracoNoCaminho" || o.op === "variavelPorOpcao" || o.op === "alphaPorOpcao") {
          e(`${cv}.transformar`, `A opera\xE7\xE3o ${o.op} s\xF3 pode ser usada na estrutura visual.`);
        }
        if ((o.op === "multiplicarPorVariavel" || o.op === "dividirPorVariavel" || o.op === "somarVariavel" || o.op === "alpha" && o.variavel) && !todas.has(o.variavel)) {
          e(
            `${cv}.transformar`,
            `Opera\xE7\xE3o ${o.op} usa a vari\xE1vel "${o.variavel}", que n\xE3o existe.`
          );
        }
        if (o.op === "mapa" && v.tipo === "enum") {
          const faltam = ((_f = v.opcoes) != null ? _f : []).filter((op) => !(op.valor in o.valores)).map((op) => op.valor);
          if (faltam.length) e(`${cv}.transformar`, `Mapa sem valor para: ${faltam.join(", ")}.`);
        }
        if (o.op === "mapa" && v.tipo === "boolean" && !("true" in o.valores && "false" in o.valores)) {
          e(`${cv}.transformar`, 'Mapa de boolean precisa de "true" e "false".');
        }
      }
    });
  }
  function percorrer(no, f, caminho = "estrutura") {
    var _a;
    f(no, caminho);
    (_a = no.filhos) == null ? void 0 : _a.forEach((filho, i) => percorrer(filho, f, `${caminho}.filhos[${i}]`));
  }
  function refsDoNo(no) {
    var _a, _b, _c, _d, _e;
    const out = [];
    const add = (campo, ref) => {
      if (ehRefVariavel(ref) || ehRefDerivada(ref)) out.push({ campo, ref });
    };
    ["x", "y", "largura", "altura", "raio", "opacidade", "visivel", "rotacao", "svg"].forEach((k) => add(k, no[k]));
    (_a = no.preenchimentos) == null ? void 0 : _a.forEach((p, i) => {
      if (p.tipo === "solido") add(`preenchimentos[${i}].cor`, p.cor);
      else if (p.tipo === "imagem") return;
      else if (p.tipo === "gradiente-variavel") {
        add(`preenchimentos[${i}].variavel`, { $var: p.variavel });
        add(`preenchimentos[${i}].tamanho`, p.tamanho);
        add(`preenchimentos[${i}].deslocamento`, p.deslocamento);
      } else {
        add(`preenchimentos[${i}].angulo`, p.angulo);
        p.paradas.forEach((s, j) => add(`preenchimentos[${i}].paradas[${j}].cor`, s.cor));
      }
    });
    const pintura = (p, campo) => {
      if (p.tipo === "solido") add(`${campo}.cor`, p.cor);
      else if (p.tipo === "imagem") return;
      else if (p.tipo === "gradiente-variavel") {
        add(`${campo}.variavel`, { $var: p.variavel });
        add(`${campo}.tamanho`, p.tamanho);
        add(`${campo}.deslocamento`, p.deslocamento);
      } else {
        add(`${campo}.angulo`, p.angulo);
        p.paradas.forEach((s, j) => add(`${campo}.paradas[${j}].cor`, s.cor));
      }
    };
    if (no.traco) {
      if (no.traco.cor !== void 0) add("traco.cor", no.traco.cor);
      if (no.traco.pintura) pintura(no.traco.pintura, "traco.pintura");
      add("traco.espessura", no.traco.espessura);
    }
    if (no.arco) {
      add("arco.inicio", no.arco.inicio);
      add("arco.fim", no.arco.fim);
      add("arco.interno", no.arco.interno);
    }
    for (const [k, r] of Object.entries((_c = (_b = no.instancia) == null ? void 0 : _b.textos) != null ? _c : {})) add(`instancia.textos.${k}`, r);
    if (no.icone) {
      add("icone.nome", no.icone.nome);
      add("icone.cor", no.icone.cor);
    }
    if (no.svgTraco) {
      add("svgTraco.cor", no.svgTraco.cor);
      add("svgTraco.espessura", no.svgTraco.espessura);
    }
    (_d = no.efeitos) == null ? void 0 : _d.forEach((ef, i) => {
      add(`efeitos[${i}].raio`, ef.raio);
      if (ef.tipo === "sombra") {
        add(`efeitos[${i}].cor`, ef.cor);
        add(`efeitos[${i}].espalhar`, ef.espalhar);
      }
    });
    if (no.texto) {
      add("texto.conteudo", no.texto.conteudo);
      add("texto.tamanho", no.texto.tamanho);
      add("texto.espacamento", no.texto.espacamento);
    }
    add("larguraMin", no.larguraMin);
    add("larguraMax", no.larguraMax);
    if ((_e = no.autoLayout) == null ? void 0 : _e.lados)
      for (const [k, r] of Object.entries(no.autoLayout.lados)) add(`autoLayout.lados.${k}`, r);
    if (no.autoLayout) {
      add("autoLayout.espaco", no.autoLayout.espaco);
      add("autoLayout.paddingX", no.autoLayout.paddingX);
      add("autoLayout.paddingY", no.autoLayout.paddingY);
    }
    return out;
  }
  function validarComponente(comp, c) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
    const erros = [];
    const e = (campo, mensagem) => erros.push({ caminho: `${c}.${campo}`, mensagem });
    if (!ehObjeto(comp)) return [{ caminho: c, mensagem: "Componente deve ser um objeto." }];
    if (!ehTexto(comp.id) || !ID.test(comp.id)) e("id", "ID deve ser kebab-case (ex.: neon-glow).");
    for (const k of ["nome", "categoria", "descricao"])
      if (!ehTexto(comp[k])) e(k, "Campo obrigat\xF3rio.");
    if (!ehTexto(comp.versao) || !SEMVER.test(comp.versao))
      e("versao", "Vers\xE3o deve seguir SemVer (1.0.0).");
    if (!ehObjeto(comp.licenca) || !ehTexto(comp.licenca.spdx))
      e("licenca", "Licen\xE7a (SPDX) obrigat\xF3ria.");
    if (!ehObjeto(comp.codigo) || typeof comp.codigo.html !== "string" || typeof comp.codigo.css !== "string" || typeof comp.codigo.js !== "string") {
      e("codigo", "C\xF3digo-fonte (html, css, js) obrigat\xF3rio.");
    }
    if (!Array.isArray(comp.variaveis)) {
      e("variaveis", "Lista de vari\xE1veis obrigat\xF3ria.");
      return erros;
    }
    const ids = /* @__PURE__ */ new Set();
    comp.variaveis.forEach((v, i) => {
      if (ids.has(v == null ? void 0 : v.id)) e(`variaveis[${i}].id`, `ID "${v.id}" repetido.`);
      ids.add(v == null ? void 0 : v.id);
    });
    const porId2 = new Map(comp.variaveis.map((v) => [v.id, v]));
    comp.variaveis.forEach((v, i) => validarVariavel(v, `${c}.variaveis[${i}]`, ids, erros));
    const valoresOk = (valores, campo) => {
      if (!ehObjeto(valores)) {
        e(campo, "Valores devem ser um objeto.");
        return;
      }
      for (const [k, val] of Object.entries(valores)) {
        const v = porId2.get(k);
        if (!v) e(campo, `Vari\xE1vel "${k}" n\xE3o existe.`);
        else for (const p of validarValor(v, val)) e(campo, p);
      }
    };
    ((_a = comp.estados) != null ? _a : []).forEach((s, i) => {
      var _a2;
      valoresOk(s.valores, `estados[${i}].valores`);
      for (const d of (_a2 = s.derivar) != null ? _a2 : []) {
        if (!porId2.has(d.variavel) || !porId2.has(d.de))
          e(`estados[${i}].derivar`, `Deriva\xE7\xE3o usa vari\xE1vel inexistente (${d.variavel} \u2190 ${d.de}).`);
      }
    });
    ((_b = comp.presets) != null ? _b : []).forEach((p, i) => {
      if (!ehTexto(p.id) || !ehTexto(p.nome)) e(`presets[${i}]`, "Preset precisa de id e nome.");
      valoresOk(p.valores, `presets[${i}].valores`);
    });
    if (!ehObjeto(comp.estrutura)) e("estrutura", "Estrutura visual obrigat\xF3ria.");
    else {
      const nos = /* @__PURE__ */ new Set();
      percorrer(comp.estrutura, (no, cam) => {
        if (nos.has(no.id))
          erros.push({ caminho: `${c}.${cam}.id`, mensagem: `N\xF3 "${no.id}" repetido.` });
        nos.add(no.id);
        for (const { campo, ref } of refsDoNo(no)) {
          const id = ehRefVariavel(ref) ? ref.$var : ref.$derivado;
          if (!porId2.has(id))
            erros.push({
              caminho: `${c}.${cam}.${campo}`,
              mensagem: `Refer\xEAncia a "${id}", que n\xE3o existe.`
            });
          if (ehRefDerivada(ref) && !ehTexto(ref.nome))
            erros.push({
              caminho: `${c}.${cam}.${campo}`,
              mensagem: "Valor derivado precisa de nome."
            });
        }
      });
    }
    for (const eixo of (_e = (_d = (_c = comp.compatibilidade) == null ? void 0 : _c.figma) == null ? void 0 : _d.eixosVariante) != null ? _e : []) {
      if (((_f = porId2.get(eixo)) == null ? void 0 : _f.tipo) !== "enum")
        e("compatibilidade.figma.eixosVariante", `"${eixo}" precisa ser uma vari\xE1vel enum.`);
    }
    if (![1, 2].includes((_h = (_g = comp.compatibilidade) == null ? void 0 : _g.figma) == null ? void 0 : _h.nivel))
      e("compatibilidade.figma.nivel", "N\xEDvel deve ser 1 (nativo) ou 2 (parcial).");
    const fora = ((_i = comp.tecnologia) != null ? _i : []).filter(
      (t) => !KCX_TECNOLOGIAS.includes(t)
    );
    if (fora.length)
      e(
        "tecnologia",
        `O KCX aceita s\xF3 ${KCX_TECNOLOGIAS.join(", ")} (recebido: ${fora.join(", ")}).`
      );
    if (((_j = comp.dependencias) != null ? _j : []).length)
      e("dependencias", "Componentes KCX n\xE3o usam bibliotecas externas.");
    return erros;
  }
  function validarPacote(p) {
    var _a;
    const erros = [];
    const avisos = [];
    if (!ehObjeto(p))
      return {
        valido: false,
        erros: [{ caminho: "", mensagem: "O arquivo n\xE3o \xE9 um objeto JSON." }],
        avisos
      };
    const pkg = p;
    if (pkg.formato !== KCX_FORMATO)
      erros.push({ caminho: "formato", mensagem: 'N\xE3o \xE9 um pacote KCX (formato \u2260 "kcx").' });
    const major = String((_a = pkg.schemaVersion) != null ? _a : "").split(".")[0];
    if (!SEMVER.test(String(pkg.schemaVersion)))
      erros.push({ caminho: "schemaVersion", mensagem: "schemaVersion ausente ou inv\xE1lido." });
    else if (major !== KCX_SCHEMA_VERSION.split(".")[0]) {
      erros.push({
        caminho: "schemaVersion",
        mensagem: `Schema ${pkg.schemaVersion} incompat\xEDvel com ${KCX_SCHEMA_VERSION}.`
      });
    } else if (pkg.schemaVersion !== KCX_SCHEMA_VERSION) {
      avisos.push({
        caminho: "schemaVersion",
        mensagem: `Schema ${pkg.schemaVersion}; este leitor implementa ${KCX_SCHEMA_VERSION}.`
      });
    }
    if (!ehTexto(pkg.id)) erros.push({ caminho: "id", mensagem: "ID do pacote obrigat\xF3rio." });
    if (!SEMVER.test(String(pkg.versao)))
      erros.push({ caminho: "versao", mensagem: "Vers\xE3o do pacote deve seguir SemVer." });
    if (!ehTexto(pkg.criadoEm) || Number.isNaN(Date.parse(pkg.criadoEm)))
      erros.push({ caminho: "criadoEm", mensagem: "Data de cria\xE7\xE3o inv\xE1lida." });
    if (!ehObjeto(pkg.origem) || !ehTexto(pkg.origem.ferramenta))
      erros.push({ caminho: "origem", mensagem: "Origem obrigat\xF3ria." });
    if (!Array.isArray(pkg.historico))
      erros.push({
        caminho: "historico",
        mensagem: "Hist\xF3rico de altera\xE7\xF5es obrigat\xF3rio (pode ser vazio)."
      });
    if (!Array.isArray(pkg.dependencias))
      erros.push({
        caminho: "dependencias",
        mensagem: "Lista de depend\xEAncias obrigat\xF3ria (pode ser vazia)."
      });
    if (pkg.fundacao !== void 0)
      erros.push(...validarFundacao(pkg.fundacao).map((m) => ({ caminho: "fundacao", mensagem: m })));
    if (!Array.isArray(pkg.componentes) || pkg.componentes.length === 0 && !pkg.fundacao) {
      erros.push({
        caminho: "componentes",
        mensagem: "O pacote precisa de pelo menos um componente (ou de uma funda\xE7\xE3o)."
      });
    } else {
      const ids = /* @__PURE__ */ new Set();
      pkg.componentes.forEach((comp2, i) => {
        if (ids.has(comp2 == null ? void 0 : comp2.id))
          erros.push({
            caminho: `componentes[${i}].id`,
            mensagem: `Componente "${comp2.id}" repetido.`
          });
        ids.add(comp2 == null ? void 0 : comp2.id);
        erros.push(...validarComponente(comp2, `componentes[${i}]`));
      });
      const comp = pkg.composicao;
      if (comp) {
        const prefixos = /* @__PURE__ */ new Set();
        comp.camadas.forEach((cam, i) => {
          if (!ids.has(cam.componente))
            erros.push({
              caminho: `composicao.camadas[${i}]`,
              mensagem: `Componente "${cam.componente}" n\xE3o est\xE1 no pacote.`
            });
          if (comp.camadas.filter((c) => c.componente === cam.componente).length > 1) {
            erros.push({
              caminho: `composicao.camadas[${i}]`,
              mensagem: `"${cam.componente}" aparece em mais de uma camada (as custom properties colidiriam).`
            });
          }
          if (prefixos.has(cam.prefixo))
            erros.push({
              caminho: `composicao.camadas[${i}].prefixo`,
              mensagem: `Prefixo "${cam.prefixo}" repetido.`
            });
          prefixos.add(cam.prefixo);
        });
        comp.compartilhadas.forEach((s, i) => {
          for (const alvo of s.alvos) {
            const [prefixo, varId] = alvo.split(".");
            const camada = comp.camadas.find((c) => c.prefixo === prefixo);
            const kc = pkg.componentes.find((k) => k.id === (camada == null ? void 0 : camada.componente));
            const v = kc == null ? void 0 : kc.variaveis.find((x) => x.id === varId);
            if (!v)
              erros.push({
                caminho: `composicao.compartilhadas[${i}].alvos`,
                mensagem: `Alvo "${alvo}" n\xE3o existe.`
              });
            else if (v.tipo !== s.tipo)
              erros.push({
                caminho: `composicao.compartilhadas[${i}].alvos`,
                mensagem: `Alvo "${alvo}" \xE9 ${v.tipo}, n\xE3o ${s.tipo}.`
              });
          }
        });
      }
    }
    return { valido: erros.length === 0, erros, avisos };
  }

  // src/app/kcx/serializar.ts
  var ORIGEM_LAB = { ferramenta: "Kalixto Creative Lab", versao: "1.10.0-rc.1" };
  function clonar(x) {
    return JSON.parse(JSON.stringify(x));
  }
  function criarPacote(componentes, opcoes = {}) {
    var _a, _b, _c, _d, _e, _f, _g;
    const agora = ((_a = opcoes.agora) != null ? _a : /* @__PURE__ */ new Date()).toISOString();
    const achatados = [];
    const vistos = /* @__PURE__ */ new Set();
    const incluir = (c) => {
      if (vistos.has(c.id)) return;
      vistos.add(c.id);
      const _a2 = c, { subcomponentes: subs } = _a2, resto = __objRest(_a2, ["subcomponentes"]);
      achatados.push(resto);
      for (const s of subs != null ? subs : []) incluir(s);
    };
    componentes.forEach(incluir);
    const comps = achatados.map((c) => {
      var _a2, _b2;
      const copia = clonar(c);
      const vals = (_b2 = (_a2 = opcoes.valores) == null ? void 0 : _a2[c.id]) != null ? _b2 : {};
      copia.variaveis = copia.variaveis.map(
        (v) => v.id in vals ? __spreadProps(__spreadValues({}, v), { valor: normalizarValor(v, vals[v.id]) }) : v
      );
      return copia;
    });
    const deps = /* @__PURE__ */ new Map();
    comps.forEach((c) => c.dependencias.forEach((d) => deps.set(d.nome, d)));
    return __spreadProps(__spreadValues(__spreadValues({
      formato: KCX_FORMATO,
      schemaVersion: KCX_SCHEMA_VERSION,
      id: (_b = opcoes.id) != null ? _b : comps.length === 1 ? comps[0].id : "composicao",
      versao: (_c = opcoes.versao) != null ? _c : comps.length === 1 ? comps[0].versao : "1.0.0",
      nome: (_d = opcoes.nome) != null ? _d : comps.length === 1 ? comps[0].nome : "Composi\xE7\xE3o KCX",
      criadoEm: agora,
      origem: __spreadValues({}, ORIGEM_LAB),
      exportacao: __spreadValues({
        modo: (_e = opcoes.modo) != null ? _e : "completo"
      }, opcoes.presetAplicado ? { presetAplicado: opcoes.presetAplicado } : {}),
      componentes: comps
    }, opcoes.composicao ? { composicao: clonar(opcoes.composicao) } : {}), opcoes.fundacao ? { fundacao: clonar(opcoes.fundacao) } : {}), {
      dependencias: [...deps.values()],
      historico: (_g = opcoes.historico) != null ? _g : [
        {
          versao: (_f = opcoes.versao) != null ? _f : "1.0.0",
          data: agora.slice(0, 10),
          descricao: "Exportado do Kalixto Creative Lab."
        }
      ]
    });
  }
  function serializar(p) {
    return JSON.stringify(p, null, 2) + "\n";
  }
  var MIGRACOES = {};
  function migrar(bruto) {
    let p = bruto;
    for (let i = 0; i < 10; i++) {
      const m = MIGRACOES[String(p["schemaVersion"])];
      if (!m) break;
      p = m(p);
    }
    return p;
  }
  function desserializar(texto2) {
    let bruto;
    try {
      bruto = JSON.parse(texto2);
    } catch (e) {
      return { ok: false, erro: `JSON inv\xE1lido: ${e.message}` };
    }
    if (!bruto || typeof bruto !== "object")
      return { ok: false, erro: "O arquivo n\xE3o cont\xE9m um objeto JSON." };
    const migrado = migrar(bruto);
    const validacao = validarPacote(migrado);
    if (!validacao.valido) {
      return {
        ok: false,
        erro: `Pacote KCX inv\xE1lido (${validacao.erros.length} problema(s)).`,
        validacao
      };
    }
    return { ok: true, pacote: migrado, validacao };
  }

  // src/app/kcx/componentes/_base.ts
  var LICENCA_MIT = {
    spdx: "MIT",
    usoComercial: true,
    modificacao: true,
    redistribuicao: true,
    autor: "Wallace Toledo (dev-Kalixto) \u2014 Kalixto Creative Lab"
  };
  function variavel(v) {
    return __spreadProps(__spreadValues({ exportavel: true }, v), { valor: v.padrao });
  }
  var EASINGS_KCX = [
    { valor: "suave", rotulo: "suave (expo out)" },
    { valor: "elastico", rotulo: "el\xE1stico (back out)" },
    { valor: "ease-in-out", rotulo: "ease-in-out" },
    { valor: "linear", rotulo: "linear" }
  ];
  var MAPA_EASING = {
    suave: "cubic-bezier(0.22, 1, 0.36, 1)",
    elastico: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    "ease-in-out": "ease-in-out",
    linear: "linear"
  };

  // src/app/kcx/figma/ler-selecao.ts
  var kebab = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "componente";
  var camel = (s) => {
    const k = kebab(s).replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
    return /^[a-z]/.test(k) ? k : `v${k}`;
  };
  var esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  function limparSvg(svg) {
    return svg.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*')/gi, "").replace(/(href\s*=\s*["'])\s*javascript:[^"']*/gi, "$1#").replace(/<\?xml[^>]*>/g, "").trim();
  }
  var PESO = {
    thin: 100,
    extralight: 200,
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900
  };
  var peso = (estilo) => {
    var _a;
    return (_a = PESO[estilo.toLowerCase().replace(/[\s-]|italic/g, "")]) != null ? _a : 400;
  };
  var ALINHA = {
    MIN: "flex-start",
    CENTER: "center",
    MAX: "flex-end",
    SPACE_BETWEEN: "space-between",
    BASELINE: "baseline"
  };
  var ANIMACOES = [
    { valor: "nenhuma", rotulo: "Nenhuma" },
    { valor: "entrada-subir", rotulo: "Entrada: sobe" },
    { valor: "entrada-fade", rotulo: "Entrada: aparece" },
    { valor: "entrada-zoom", rotulo: "Entrada: zoom" },
    { valor: "entrada-desfoque", rotulo: "Entrada: sai do desfoque" },
    { valor: "hover-elevar", rotulo: "Hover: sobe com sombra" },
    { valor: "hover-brilho", rotulo: "Hover: brilho" },
    { valor: "hover-crescer", rotulo: "Hover: cresce" },
    { valor: "pulsar", rotulo: "Cont\xEDnua: pulsa" },
    { valor: "flutuar", rotulo: "Cont\xEDnua: flutua" }
  ];
  async function lerSelecao(figma2, selecionado, op = {}) {
    var _a, _b, _c, _d, _e;
    let raiz = selecionado;
    const avisos = [];
    if (raiz.type === "COMPONENT_SET") {
      avisos.push(
        `\u201C${raiz.name}\u201D tem ${raiz.children.length} variantes; foi importada a variante padr\xE3o.`
      );
      raiz = (_a = raiz.defaultVariant) != null ? _a : raiz.children[0];
    }
    const pai = selecionado.parent;
    const nome = (pai == null ? void 0 : pai.type) === "COMPONENT_SET" ? `${pai.name} \u2014 ${String(selecionado.name).split(",").map((p) => p.split("=").pop().trim()).join(" ")}` : String(selecionado.name || "Componente do Figma");
    const id = (_b = op.id) != null ? _b : kebab(nome);
    const P = `--kcx-${id}`;
    const C = `kcx-${id}`;
    const vars = [];
    const porCor = /* @__PURE__ */ new Map();
    const porRaio = /* @__PURE__ */ new Map();
    const porEspaco = /* @__PURE__ */ new Map();
    const nomesVar = /* @__PURE__ */ new Map();
    const ids = /* @__PURE__ */ new Set();
    let contador = 0;
    const css = [];
    const idUnico = (base) => {
      let x = base;
      let n = 2;
      while (ids.has(x)) x = `${base}${n++}`;
      ids.add(x);
      return x;
    };
    const nomeLigado = async (alias) => {
      var _a2;
      if (!(alias == null ? void 0 : alias.id) || !((_a2 = figma2 == null ? void 0 : figma2.variables) == null ? void 0 : _a2.getVariableByIdAsync)) return void 0;
      if (nomesVar.has(alias.id)) return nomesVar.get(alias.id);
      try {
        const v2 = await figma2.variables.getVariableByIdAsync(alias.id);
        const n = (v2 == null ? void 0 : v2.name) ? String(v2.name).split("/").pop() : void 0;
        if (n) nomesVar.set(alias.id, n);
        return n;
      } catch (e) {
        return void 0;
      }
    };
    const corVar = async (cor, opacidade = 1, alias) => {
      var _a2;
      const hex3 = corDeFigma({ r: cor.r, g: cor.g, b: cor.b, a: ((_a2 = cor.a) != null ? _a2 : 1) * opacidade });
      const existente = porCor.get(hex3);
      if (existente) return existente;
      const ligado = await nomeLigado(alias);
      const vid = idUnico(
        ligado ? camel(/^cor\b/i.test(ligado) ? ligado : `cor ${ligado}`) : `cor${porCor.size + 1}`
      );
      porCor.set(hex3, vid);
      vars.push(
        variavel({
          id: vid,
          nome: ligado ? /^cor\b/i.test(ligado) ? ligado : `Cor ${ligado}` : `Cor ${porCor.size}`,
          tipo: "color",
          padrao: hex3,
          descricao: ligado ? `Vinda da vari\xE1vel \u201C${ligado}\u201D do Figma.` : "Cor lida do Figma.",
          grupo: "colors",
          secao: "aparencia",
          vinculos: [{ propriedade: "cor", alvo: { tipo: "css-var", nome: `${P}-${kebab(vid)}` } }]
        })
      );
      return vid;
    };
    const dimVar = (mapa, valor, prefixo, rotulo) => {
      const r2 = Math.round(valor * 100) / 100;
      const existente = mapa.get(r2);
      if (existente) return existente;
      const vid = idUnico(`${prefixo}${mapa.size + 1}`);
      mapa.set(r2, vid);
      vars.push(
        variavel({
          id: vid,
          nome: `${rotulo} ${mapa.size}`,
          tipo: "dimension",
          padrao: r2,
          min: 0,
          max: Math.max(64, Math.ceil(r2 * 3)),
          passo: 1,
          unidade: "px",
          descricao: `${rotulo} lido do Figma (${r2} px).`,
          grupo: prefixo === "raio" ? "dimensions" : "spacing",
          secao: "aparencia",
          vinculos: [
            {
              propriedade: rotulo.toLowerCase(),
              alvo: { tipo: "css-var", nome: `${P}-${kebab(vid)}` },
              unidadeSaida: "px"
            }
          ]
        })
      );
      return vid;
    };
    const v = (vid) => `var(${P}-${kebab(vid)})`;
    const pinturas = async (no) => {
      var _a2, _b2, _c2, _d2, _e2, _f;
      const saida = { css: [], kcx: [] };
      const fills = Array.isArray(no.fills) ? no.fills.filter((f) => f.visible !== false) : [];
      for (const f of [...fills].reverse()) {
        if (f.type === "SOLID") {
          const vid = await corVar(f.color, (_a2 = f.opacity) != null ? _a2 : 1, (_b2 = f.boundVariables) == null ? void 0 : _b2.color);
          saida.css.push(v(vid));
          saida.kcx.unshift({ tipo: "solido", cor: { $var: vid } });
        } else if (f.type === "GRADIENT_LINEAR" || f.type === "GRADIENT_RADIAL" || f.type === "GRADIENT_ANGULAR") {
          const paradas = [];
          for (const s of (_c2 = f.gradientStops) != null ? _c2 : [])
            paradas.push({
              posicao: s.position,
              cor: {
                $var: await corVar(s.color, (_d2 = f.opacity) != null ? _d2 : 1, (_e2 = s.boundVariables) == null ? void 0 : _e2.color)
              }
            });
          const m = (_f = f.gradientTransform) != null ? _f : [
            [1, 0, 0],
            [0, 1, 0]
          ];
          const angulo = Math.round(Math.atan2(m[0][1], m[0][0]) * 180 / Math.PI + 90);
          const lista = paradas.map((p) => `${v(p.cor.$var)} ${Math.round(p.posicao * 100)}%`).join(", ");
          saida.css.push(
            f.type === "GRADIENT_RADIAL" ? `radial-gradient(circle, ${lista})` : f.type === "GRADIENT_ANGULAR" ? `conic-gradient(from ${angulo}deg, ${lista})` : `linear-gradient(${angulo}deg, ${lista})`
          );
          saida.kcx.unshift({
            tipo: f.type === "GRADIENT_ANGULAR" ? "gradiente-conico" : "gradiente-linear",
            angulo,
            paradas
          });
        } else if (f.type === "IMAGE") {
          avisos.push(
            `\u201C${no.name}\u201D: imagem do Figma n\xE3o \xE9 exportada; ficou um fundo neutro (troque no c\xF3digo).`
          );
          saida.css.push("linear-gradient(135deg, #3a3357, #1a1530)");
        }
      }
      return saida;
    };
    const sombras = async (no) => {
      var _a2, _b2, _c2, _d2, _e2, _f, _g;
      const r2 = { css: [], filtro: [], fundo: [] };
      for (const e of Array.isArray(no.effects) ? no.effects : []) {
        if (e.visible === false) continue;
        if (e.type === "DROP_SHADOW" || e.type === "INNER_SHADOW") {
          const vid = await corVar(e.color, 1, (_a2 = e.boundVariables) == null ? void 0 : _a2.color);
          r2.css.push(
            `${e.type === "INNER_SHADOW" ? "inset " : ""}${(_c2 = (_b2 = e.offset) == null ? void 0 : _b2.x) != null ? _c2 : 0}px ${(_e2 = (_d2 = e.offset) == null ? void 0 : _d2.y) != null ? _e2 : 0}px ${(_f = e.radius) != null ? _f : 0}px ${(_g = e.spread) != null ? _g : 0}px ${v(vid)}`
          );
        } else if (e.type === "LAYER_BLUR") r2.filtro.push(`blur(${e.radius}px)`);
        else if (e.type === "BACKGROUND_BLUR") r2.fundo.push(`blur(${e.radius}px)`);
      }
      return r2;
    };
    const converter2 = async (no, paiAutoLayout, primeiro) => {
      var _a2, _b2, _c2, _d2, _e2, _f, _g, _h, _i, _j, _k, _l;
      if (no.visible === false) return null;
      const n = ++contador;
      const cls = primeiro ? C : `${C}__n${n}`;
      const nid = idUnico(primeiro ? "raiz" : `n${n}-${kebab(no.name).slice(0, 20)}`);
      const regras = [];
      const kcx = { id: nid, nome: String(no.name || `Camada ${n}`), tipo: "frame" };
      const ehTexto2 = no.type === "TEXT";
      const ehVetor = ["VECTOR", "BOOLEAN_OPERATION", "STAR", "POLYGON", "LINE"].includes(no.type);
      const al = no.layoutMode && no.layoutMode !== "NONE" ? no.layoutMode : null;
      if (paiAutoLayout === null && !primeiro)
        regras.push(
          "position: absolute",
          `left: ${Math.round(no.x)}px`,
          `top: ${Math.round(no.y)}px`
        );
      if (paiAutoLayout !== null && no.layoutPositioning === "ABSOLUTE")
        regras.push(
          "position: absolute",
          `left: ${Math.round(no.x)}px`,
          `top: ${Math.round(no.y)}px`
        );
      const sh = (_a2 = no.layoutSizingHorizontal) != null ? _a2 : "FIXED";
      const sv = (_b2 = no.layoutSizingVertical) != null ? _b2 : "FIXED";
      if (!ehTexto2 || no.textAutoResize === "NONE" || no.textAutoResize === "HEIGHT") {
        if (sh === "FILL")
          regras.push(paiAutoLayout === "HORIZONTAL" ? "flex: 1 1 0" : "align-self: stretch");
        else if (sh === "FIXED" || !al) regras.push(`width: ${Math.round(no.width)}px`);
      }
      if (!ehTexto2 || no.textAutoResize === "NONE") {
        if (sv === "FILL")
          regras.push(paiAutoLayout === "VERTICAL" ? "flex: 1 1 0" : "align-self: stretch");
        else if (sv === "FIXED" || !al) regras.push(`height: ${Math.round(no.height)}px`);
      }
      if (primeiro) regras.push("max-width: 100%");
      if (typeof no.opacity === "number" && no.opacity < 1) {
        regras.push(`opacity: ${Math.round(no.opacity * 100) / 100}`);
        kcx.opacidade = Math.round(no.opacity * 100) / 100;
      }
      if (no.rotation) regras.push(`rotate: ${-Math.round(no.rotation)}deg`);
      if (!ehTexto2) {
        kcx.largura = Math.round(no.width);
        kcx.altura = Math.round(no.height);
      }
      if (paiAutoLayout === null && !primeiro) {
        kcx.x = Math.round(no.x);
        kcx.y = Math.round(no.y);
      }
      if (ehVetor) {
        let svg = "";
        try {
          svg = limparSvg(String(await no.exportAsync({ format: "SVG_STRING" })));
        } catch (e) {
          avisos.push(`\u201C${no.name}\u201D: vetor n\xE3o exportado.`);
        }
        css.push(`.${cls} { ${regras.join("; ")}; display: block; }`);
        kcx.tipo = "svg";
        kcx.svg = svg || '<svg xmlns="http://www.w3.org/2000/svg"/>';
        delete kcx.largura;
        delete kcx.altura;
        return { html: svg.replace("<svg", `<svg class="${cls}" aria-hidden="true"`), kcx };
      }
      if (ehTexto2) {
        const tid = idUnico(camel(`texto ${no.name}`));
        const conteudo = String((_c2 = no.characters) != null ? _c2 : "");
        vars.push(
          variavel({
            id: tid,
            nome: `Texto: ${no.name}`,
            tipo: "string",
            padrao: conteudo,
            descricao: "Texto lido do Figma.",
            grupo: "components",
            secao: "aparencia",
            vinculos: [{ propriedade: "Texto", alvo: { tipo: "texto", seletor: `.${cls}` } }]
          })
        );
        const fonte = no.fontName && typeof no.fontName === "object" ? no.fontName : { family: "Inter", style: "Regular" };
        const tamanho = typeof no.fontSize === "number" ? no.fontSize : 16;
        const p2 = await pinturas(no);
        regras.push(
          `font-family: '${String(fonte.family).replace(/'/g, "")}', Inter, system-ui, sans-serif`,
          `font-size: ${tamanho}px`,
          `font-weight: ${peso(String(fonte.style))}`,
          "margin: 0"
        );
        if (/italic/i.test(String(fonte.style))) regras.push("font-style: italic");
        if (p2.css.length)
          regras.push(
            p2.css[0].includes("gradient") ? `background: ${p2.css[0]}; -webkit-background-clip: text; background-clip: text; color: transparent` : `color: ${p2.css[0]}`
          );
        if (no.letterSpacing && typeof no.letterSpacing === "object" && no.letterSpacing.value)
          regras.push(
            `letter-spacing: ${no.letterSpacing.unit === "PERCENT" ? `${no.letterSpacing.value / 100}em` : `${no.letterSpacing.value}px`}`
          );
        if (no.lineHeight && typeof no.lineHeight === "object" && no.lineHeight.unit !== "AUTO")
          regras.push(
            `line-height: ${no.lineHeight.unit === "PERCENT" ? no.lineHeight.value / 100 : `${no.lineHeight.value}px`}`
          );
        if (no.textAlignHorizontal && no.textAlignHorizontal !== "LEFT")
          regras.push(
            `text-align: ${String(no.textAlignHorizontal).toLowerCase().replace("justified", "justify")}`
          );
        if (no.textCase === "UPPER") regras.push("text-transform: uppercase");
        if (no.textCase === "LOWER") regras.push("text-transform: lowercase");
        css.push(`.${cls} { ${regras.join("; ")}; }`);
        kcx.tipo = "texto";
        kcx.preenchimentos = p2.kcx.length ? [p2.kcx[0]] : [{ tipo: "solido", cor: "#000000" }];
        kcx.texto = {
          conteudo: { $var: tid },
          tamanho,
          familia: String(fonte.family),
          estilo: String(fonte.style),
          alinhamento: no.textAlignHorizontal === "CENTER" ? "centro" : no.textAlignHorizontal === "RIGHT" ? "direita" : void 0,
          caixaAlta: no.textCase === "UPPER" || void 0,
          preencher: sh === "FILL" || void 0,
          propriedade: String(no.name)
        };
        if (sh === "FILL") kcx.encher = true;
        return { html: `<p class="${cls}">${esc(conteudo)}</p>`, kcx };
      }
      if (no.type === "ELLIPSE") {
        kcx.tipo = "elipse";
        regras.push("border-radius: 50%");
      } else if (no.type === "RECTANGLE") kcx.tipo = "retangulo";
      const p = await pinturas(no);
      if (p.css.length) regras.push(`background: ${p.css.join(", ")}`);
      kcx.preenchimentos = p.kcx;
      if (no.type !== "ELLIPSE" && typeof no.cornerRadius === "number" && no.cornerRadius > 0) {
        const rid = dimVar(porRaio, no.cornerRadius, "raio", "Arredondamento");
        regras.push(`border-radius: ${v(rid)}`);
        kcx.raio = { $var: rid };
      } else if (no.type !== "ELLIPSE" && [no.topLeftRadius, no.topRightRadius, no.bottomRightRadius, no.bottomLeftRadius].some(
        (x) => x > 0
      )) {
        regras.push(
          `border-radius: ${[no.topLeftRadius, no.topRightRadius, no.bottomRightRadius, no.bottomLeftRadius].map((x) => `${x != null ? x : 0}px`).join(" ")}`
        );
      }
      const tracos = Array.isArray(no.strokes) ? no.strokes.filter((s2) => s2.visible !== false && s2.type === "SOLID") : [];
      if (tracos.length && no.strokeWeight > 0) {
        const vid = await corVar(
          tracos[0].color,
          (_d2 = tracos[0].opacity) != null ? _d2 : 1,
          (_e2 = tracos[0].boundVariables) == null ? void 0 : _e2.color
        );
        regras.push(
          no.strokeAlign === "OUTSIDE" ? `outline: ${no.strokeWeight}px solid ${v(vid)}` : `box-shadow: inset 0 0 0 ${no.strokeWeight}px ${v(vid)}`
        );
        kcx.traco = { cor: { $var: vid }, espessura: no.strokeWeight };
      }
      const s = await sombras(no);
      const insetBorda = regras.find((r2) => r2.startsWith("box-shadow: inset"));
      if (s.css.length) {
        if (insetBorda) regras.splice(regras.indexOf(insetBorda), 1);
        regras.push(
          `box-shadow: ${[insetBorda == null ? void 0 : insetBorda.replace("box-shadow: ", ""), ...s.css].filter(Boolean).join(", ")}`
        );
      }
      if (s.filtro.length) regras.push(`filter: ${s.filtro.join(" ")}`);
      if (s.fundo.length) regras.push(`backdrop-filter: ${s.fundo.join(" ")}`);
      if (no.clipsContent) {
        regras.push("overflow: hidden");
        kcx.recortar = true;
      }
      if (al) {
        const gap = (_f = no.itemSpacing) != null ? _f : 0;
        const gid = gap > 0 ? dimVar(porEspaco, gap, "espaco", "Espa\xE7amento") : null;
        const px = (_g = no.paddingLeft) != null ? _g : 0;
        const py = (_h = no.paddingTop) != null ? _h : 0;
        const pxid = px > 0 ? dimVar(porEspaco, px, "espaco", "Espa\xE7amento") : null;
        const pyid = py > 0 ? dimVar(porEspaco, py, "espaco", "Espa\xE7amento") : null;
        regras.push(
          "display: flex",
          `flex-direction: ${al === "HORIZONTAL" ? "row" : "column"}`,
          `justify-content: ${(_i = ALINHA[no.primaryAxisAlignItems]) != null ? _i : "flex-start"}`,
          `align-items: ${(_j = ALINHA[no.counterAxisAlignItems]) != null ? _j : "flex-start"}`,
          `gap: ${gid ? v(gid) : "0"}`,
          `padding: ${pyid ? v(pyid) : "0"} ${no.paddingRight === px ? pxid ? v(pxid) : "0" : `${(_k = no.paddingRight) != null ? _k : 0}px`} ${no.paddingBottom === py ? pyid ? v(pyid) : "0" : `${(_l = no.paddingBottom) != null ? _l : 0}px`} ${pxid ? v(pxid) : "0"}`
        );
        if (no.layoutWrap === "WRAP") regras.push("flex-wrap: wrap");
        kcx.autoLayout = {
          direcao: al === "HORIZONTAL" ? "horizontal" : "vertical",
          espaco: gid ? { $var: gid } : 0,
          paddingX: pxid ? { $var: pxid } : 0,
          paddingY: pyid ? { $var: pyid } : 0
        };
        if (sh !== "FIXED") delete kcx.largura;
        if (sv !== "FIXED") delete kcx.altura;
      } else if (Array.isArray(no.children) && no.children.length) regras.push("position: relative");
      if (sh === "FILL") kcx.encher = true;
      css.push(`.${cls} { ${regras.join("; ")}; }`);
      const filhos = [];
      kcx.filhos = [];
      let i = 0;
      for (const f of Array.isArray(no.children) ? no.children : []) {
        const r2 = await converter2(f, al, false);
        if (!r2) continue;
        filhos.push(primeiro ? r2.html.replace(/^<(\w+)/, `<$1 style="--i:${i++}"`) : r2.html);
        kcx.filhos.push(r2.kcx);
      }
      if (!kcx.filhos.length) delete kcx.filhos;
      const html2 = filhos.length ? `<div class="${cls}">
${filhos.map((h) => "  " + h).join("\n")}
</div>` : `<div class="${cls}"></div>`;
      return { html: html2, kcx };
    };
    const r = await converter2(raiz, null, true);
    if (!r) throw new Error("A camada selecionada est\xE1 oculta.");
    const destaque = porCor.values().next().value;
    const corDestaque = destaque ? v(destaque) : "rgb(255 255 255 / .6)";
    vars.push(
      variavel({
        id: "animacao",
        nome: "Anima\xE7\xE3o",
        tipo: "enum",
        padrao: "entrada-subir",
        opcoes: ANIMACOES,
        descricao: "Escolha a anima\xE7\xE3o do componente: entrada, hover ou cont\xEDnua.",
        grupo: "motion",
        secao: "animacao",
        vinculos: [
          {
            propriedade: "data-animacao na raiz",
            alvo: { tipo: "atributo", seletor: `.${C}`, atributo: "data-animacao" }
          }
        ]
      }),
      variavel({
        id: "emSequencia",
        nome: "Elementos em sequ\xEAncia",
        tipo: "boolean",
        padrao: false,
        descricao: "Na entrada, cada elemento de dentro aparece um depois do outro.",
        grupo: "motion",
        secao: "animacao",
        vinculos: [
          {
            propriedade: "data-sequencia na raiz",
            alvo: { tipo: "atributo", seletor: `.${C}`, atributo: "data-sequencia" },
            transformar: [{ op: "mapa", valores: { true: "true", false: "false" } }]
          }
        ]
      }),
      variavel({
        id: "duracao",
        nome: "Dura\xE7\xE3o",
        tipo: "time",
        padrao: 500,
        min: 100,
        max: 3e3,
        passo: 50,
        unidade: "ms",
        descricao: "Tempo da anima\xE7\xE3o.",
        grupo: "motion",
        secao: "animacao",
        vinculos: [
          {
            propriedade: "animation/transition-duration",
            alvo: { tipo: "css-var", nome: `${P}-duracao` },
            unidadeSaida: "ms"
          }
        ]
      }),
      variavel({
        id: "easing",
        nome: "Curva",
        tipo: "enum",
        padrao: "suave",
        opcoes: EASINGS_KCX,
        descricao: "Acelera\xE7\xE3o do movimento.",
        grupo: "motion",
        secao: "animacao",
        vinculos: [
          {
            propriedade: "timing-function",
            alvo: { tipo: "css-var", nome: `${P}-easing` },
            transformar: [{ op: "mapa", valores: MAPA_EASING }]
          }
        ]
      })
    );
    const D = `var(${P}-duracao)`;
    const E = `var(${P}-easing)`;
    const entrada = (nomeAnim) => `.${C}[data-animacao="entrada-${nomeAnim}"]:not([data-sequencia="true"]), .${C}[data-animacao="entrada-${nomeAnim}"][data-sequencia="true"] > * { animation: ${C}-${nomeAnim} ${D} ${E} both; }`;
    const cssAnim = `
/* Anima\xE7\xF5es (escolha na vari\xE1vel "Anima\xE7\xE3o" do KCX Studio) */
.${C} { transition: transform ${D} ${E}, box-shadow ${D} ${E}, filter ${D} ${E}; }
${entrada("subir")}
${entrada("fade")}
${entrada("zoom")}
${entrada("desfoque")}
.${C}[data-sequencia="true"] > * { animation-delay: calc(var(--i, 0) * ${D} * .25) !important; }
@keyframes ${C}-subir { from { opacity: 0; transform: translateY(24px); } }
@keyframes ${C}-fade { from { opacity: 0; } }
@keyframes ${C}-zoom { from { opacity: 0; transform: scale(.85); } }
@keyframes ${C}-desfoque { from { opacity: 0; filter: blur(12px); } }
.${C}[data-animacao="hover-elevar"]:hover { transform: translateY(-6px); box-shadow: 0 16px 32px color-mix(in srgb, ${corDestaque} 45%, transparent); }
.${C}[data-animacao="hover-brilho"]:hover { box-shadow: 0 0 28px color-mix(in srgb, ${corDestaque} 70%, transparent); filter: brightness(1.08); }
.${C}[data-animacao="hover-crescer"]:hover { transform: scale(1.04); }
.${C}[data-animacao="pulsar"] { animation: ${C}-pulsar calc(${D} * 4) ease-in-out infinite; }
.${C}[data-animacao="flutuar"] { animation: ${C}-flutuar calc(${D} * 6) ease-in-out infinite; }
@keyframes ${C}-pulsar { 50% { transform: scale(1.04); } }
@keyframes ${C}-flutuar { 50% { transform: translateY(-8px); } }
@media (prefers-reduced-motion: reduce) { .${C}, .${C} * { animation: none !important; transition-duration: 1ms !important; } }`;
    const hoje = ((_c = op.agora) != null ? _c : /* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const html = r.html.replace(
      `class="${C}"`,
      `class="${C}" data-animacao="entrada-subir" data-sequencia="false"`
    );
    return {
      id,
      nome,
      categoria: "figma",
      descricao: `Importado do Figma (\u201C${nome}\u201D).${avisos.length ? " " + avisos.join(" ") : ""}`,
      tecnologia: ["HTML", "CSS", "SVG", "Angular"],
      versao: "1.0.0",
      licenca: LICENCA_MIT,
      metadados: {
        autor: "Importado do Figma pelo Figma Bridge",
        tags: ["figma", "importado"],
        criadoEm: hoje,
        atualizadoEm: hoje,
        largura: Math.round((_d = raiz.width) != null ? _d : 320),
        altura: Math.round((_e = raiz.height) != null ? _e : 200)
      },
      variaveis: vars,
      codigo: {
        html,
        css: `/* ${nome} \u2014 importado do Figma pelo Kalixto Creative Lab (KCX) */
.${C}, .${C} * { box-sizing: border-box; }
${css.join("\n")}
${cssAnim}`,
        js: "// Sem JavaScript: as anima\xE7\xF5es s\xE3o CSS."
      },
      estados: [
        {
          id: "padrao",
          nome: "Padr\xE3o",
          gatilho: "padrao",
          descricao: "Como estava no Figma.",
          valores: {}
        }
      ],
      presets: [
        {
          id: "entrada",
          nome: "Entrada em sequ\xEAncia",
          valores: { animacao: "entrada-subir", emSequencia: true }
        },
        { id: "hover", nome: "Hover com sombra", valores: { animacao: "hover-elevar" } },
        { id: "flutuar", nome: "Flutuando", valores: { animacao: "flutuar", duracao: 800 } }
      ],
      dependencias: [],
      estrutura: r.kcx,
      animacoes: [
        {
          id: "animacao",
          nome: "Anima\xE7\xE3o escolhida no Studio",
          tecnica: "css-keyframes",
          variaveis: ["animacao", "emSequencia", "duracao", "easing"],
          figma: "documental",
          nivel: 2,
          descricao: "Entradas, hover e anima\xE7\xF5es cont\xEDnuas em CSS, escolhidas pela vari\xE1vel \u201CAnima\xE7\xE3o\u201D."
        }
      ],
      compatibilidade: {
        navegadores: "Chrome, Edge, Firefox e Safari atuais.",
        reducedMotion: true,
        figma: {
          nivel: 2,
          editavel: [
            "Estrutura, cores, textos, arredondamentos e espa\xE7amentos do desenho original",
            "Ao reexportar para o Figma, tudo volta ligado a vari\xE1veis"
          ],
          parcial: avisos,
          naoSuportado: ["A anima\xE7\xE3o escolhida no Studio (fica no c\xF3digo)"],
          limitacoes: [
            "Imagens do Figma n\xE3o s\xE3o exportadas pelo plugin; troque no c\xF3digo ou no Figma.",
            "S\xF3 a variante padr\xE3o de um conjunto de variantes \xE9 importada."
          ]
        }
      },
      origemCriacao: { tipo: "figma" }
    };
  }

  // src/app/kcx/figma/ler-design-system.ts
  var norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  var PISTAS_COR = [
    [
      "sobre-primaria",
      /\b(on primary|sobre primaria|primary foreground|primary contrast|on brand)\b/
    ],
    [
      "texto-suave",
      /\b(text (secondary|muted|subtle|soft)|muted|texto (suave|secundario)|foreground muted|subtle)\b/
    ],
    ["secundaria", /\b(secondary|secundaria)\b/],
    ["destaque", /\b(accent|destaque|highlight|tertiary)\b/],
    ["perigo", /\b(danger|error|erro|perigo|destructive|negative)\b/],
    ["sucesso", /\b(success|sucesso|positive)\b/],
    ["aviso", /\b(warning|aviso|alerta|caution)\b/],
    ["superficie", /\b(surface|superficie|card|panel|elevated)\b/],
    ["borda", /\b(border|borda|stroke|outline|divider)\b/],
    ["fundo", /\b(background|fundo|bg|canvas|page)\b/],
    ["texto", /\b(text|texto|foreground|fg|on background|on surface)\b/],
    ["primaria", /\b(primary|primaria|brand|marca|principal)\b/]
  ];
  var ehEscuro = (m) => /dark|escuro|noite|night/i.test(m);
  var ehClaro = (m) => /light|claro|dia|day/i.test(m);
  var HEX3 = /^#[0-9a-f]{6}$/i;
  function pesoDe(estilo) {
    const e = estilo.toLowerCase();
    if (/black|heavy|extra ?bold|ultra ?bold/.test(e)) return 800;
    if (/semi ?bold|demi/.test(e)) return 600;
    if (/bold/.test(e)) return 700;
    if (/medium/.test(e)) return 500;
    return 400;
  }
  function nivelDe(nome) {
    const n = norm(nome);
    if (/\b(display|hero|jumbo)\b/.test(n)) return "display";
    if (/\b(h1|heading 1|title 1|titulo 1|headline 1|title large)\b/.test(n)) return "h1";
    if (/\b(h2|heading 2|title 2|titulo 2|headline 2|title medium)\b/.test(n)) return "h2";
    if (/\b(h3|heading 3|title 3|titulo 3|headline 3|title small|subtitle|subtitulo)\b/.test(n))
      return "h3";
    if (/\b(caption|legenda|overline|label small|tiny)\b/.test(n)) return "legenda";
    if (/\b(small|pequeno|body small|label|footnote)\b/.test(n)) return "pequeno";
    if (/\b(body|corpo|paragraph|paragrafo|text|texto|regular|base)\b/.test(n)) return "corpo";
    return null;
  }
  var celular = (px) => px <= 20 ? px : Math.round(px * 0.8);
  function fundacaoDoFigma(ds) {
    var _a, _b, _c, _d, _e, _f, _g;
    const reconhecido = [];
    const padrao = [];
    const f = JSON.parse(JSON.stringify(FUNDACAO_PADRAO));
    f.nome = ((_a = ds.arquivo) == null ? void 0 : _a.trim()) || "Design system do Figma";
    const cores = ds.variaveis.filter((v) => v.tipo === "COLOR");
    const usado = /* @__PURE__ */ new Set();
    for (const [token, pista] of PISTAS_COR) {
      const candidatas = cores.filter((v2) => !usado.has(v2.nome) && pista.test(norm(v2.nome)));
      const v = (_b = candidatas.find((c2) => /\b(500|base|default|padrao|main)\b/.test(norm(c2.nome)))) != null ? _b : candidatas.sort((a, b) => a.nome.length - b.nome.length)[0];
      if (!v) {
        padrao.push(`cor ${token}`);
        continue;
      }
      const modos = Object.keys(v.valores);
      const escuro = modos.find(ehEscuro);
      const claro = modos.find(ehClaro);
      const um = String(v.valores[modos[0]]);
      const e = String(escuro ? v.valores[escuro] : claro ? v.valores[claro] : um);
      const c = String(claro ? v.valores[claro] : um);
      if (!HEX3.test(e) || !HEX3.test(c)) {
        padrao.push(`cor ${token}`);
        continue;
      }
      usado.add(v.nome);
      f.cores[token] = { escuro: e.toLowerCase(), claro: c.toLowerCase() };
      reconhecido.push(`cor ${token} \u2190 "${v.nome}"`);
    }
    const porNivel = /* @__PURE__ */ new Map();
    for (const s of ds.estilosTexto) {
      const n = nivelDe(s.nome);
      if (n && !porNivel.has(n)) porNivel.set(n, s);
    }
    const titulo = (_d = (_c = porNivel.get("h1")) != null ? _c : porNivel.get("display")) != null ? _d : porNivel.get("h2");
    const corpo = (_e = porNivel.get("corpo")) != null ? _e : porNivel.get("pequeno");
    if (titulo) f.fontes.titulo = titulo.familia;
    if (corpo) f.fontes.corpo = corpo.familia;
    const mono = ds.estilosTexto.find((s) => /mono|code|codigo/i.test(s.familia + " " + s.nome));
    if (mono) f.fontes.mono = mono.familia;
    for (const n of NIVEIS_TEXTO) {
      const s = porNivel.get(n);
      if (!s) {
        padrao.push(`texto ${n}`);
        continue;
      }
      const t = {
        familia: s.familia === f.fontes.titulo && n !== "corpo" ? "titulo" : "corpo",
        peso: pesoDe(s.estilo),
        tamanho: Math.round(s.tamanho),
        tamanhoCelular: celular(Math.round(s.tamanho)),
        altura: s.alturaLinha ? Math.round(s.alturaLinha / s.tamanho * 100) / 100 : f.texto[n].altura,
        espacamento: Math.round(((_f = s.espacamento) != null ? _f : 0) * 10) / 10
      };
      f.texto[n] = t;
      reconhecido.push(`texto ${n} \u2190 "${s.nome}" (${s.familia} ${t.tamanho}px)`);
    }
    const numeros = ds.variaveis.filter((v) => v.tipo === "FLOAT");
    const valor = (v) => Number(v.valores[Object.keys(v.valores)[0]]);
    const espacos = numeros.filter(
      (v) => /\b(spacing|space|espaco|espacamento|gap|padding|margin|size)\b/.test(
        norm(`${v.colecao} ${v.nome}`)
      )
    );
    if (espacos.length) {
      const lista = espacos.map(valor).filter((x) => x > 0 && x <= 512);
      for (const k of CHAVES_ESPACO) {
        const alvo = Number(k) * 4;
        const melhor = lista.reduce(
          (m, x) => m === null || Math.abs(x - alvo) < Math.abs(m - alvo) ? x : m,
          null
        );
        if (melhor !== null && Math.abs(melhor - alvo) <= alvo * 0.5) {
          f.espacos[k] = melhor;
        } else padrao.push(`espa\xE7o ${k}`);
      }
      reconhecido.push(`espa\xE7os \u2190 ${espacos.length} vari\xE1vel(is)`);
    } else padrao.push("espa\xE7os");
    const raios = numeros.filter(
      (v) => /\b(radius|raio|radii|corner|rounded)\b/.test(norm(`${v.colecao} ${v.nome}`))
    );
    if (raios.length) {
      const pista = {
        p: /\b(sm|small|s|p|pequeno|xs)\b/,
        m: /\b(md|medium|m|medio|default|base)\b/,
        g: /\b(lg|large|l|g|grande|xl)\b/,
        pill: /\b(full|pill|round|circle|999|9999)\b/
      };
      for (const k of CHAVES_RAIO) {
        const v = raios.find((r) => pista[k].test(norm(r.nome)));
        if (v) {
          f.raios[k] = valor(v);
          reconhecido.push(`raio ${k} \u2190 "${v.nome}"`);
        } else padrao.push(`raio ${k}`);
      }
    } else padrao.push("raios");
    const sombras = (_g = ds.sombras) != null ? _g : [];
    if (sombras.length) {
      const ord = [...sombras].sort((a, b) => a.raio - b.raio);
      const pega = (i) => ord[Math.min(ord.length - 1, i)];
      ["p", "m", "g"].forEach((k, i) => {
        const s = pega(Math.round(i * (ord.length - 1) / 2));
        f.sombras[k] = { x: s.x, y: s.y, raio: s.raio, espalhar: s.espalhar, opacidade: s.opacidade };
      });
      reconhecido.push(`sombras \u2190 ${sombras.length} estilo(s) de efeito`);
    } else padrao.push("sombras");
    return { fundacao: completarFundacao(f), reconhecido, padrao };
  }
  var hexDe = (c) => "#" + [c.r, c.g, c.b].map(
    (x) => Math.round(Math.min(1, Math.max(0, x)) * 255).toString(16).padStart(2, "0")
  ).join("");
  async function lerDesignSystem(figma2) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r;
    const colecoes = (_a = await figma2.variables.getLocalVariableCollectionsAsync()) != null ? _a : [];
    const variaveis = [];
    const resolver = async (valor, modo, prof = 0) => {
      var _a2;
      const v = valor;
      if (v && v.type === "VARIABLE_ALIAS" && v.id && prof < 5) {
        const alvo = await figma2.variables.getVariableByIdAsync(v.id);
        if (!alvo) return void 0;
        const val = (_a2 = alvo.valuesByMode[modo]) != null ? _a2 : Object.values(alvo.valuesByMode)[0];
        return resolver(val, modo, prof + 1);
      }
      return valor;
    };
    for (const col of colecoes) {
      for (const id of (_b = col.variableIds) != null ? _b : []) {
        const v = await figma2.variables.getVariableByIdAsync(id);
        if (!v || v.resolvedType !== "COLOR" && v.resolvedType !== "FLOAT") continue;
        const valores = {};
        for (const m of (_c = col.modes) != null ? _c : []) {
          const bruto = await resolver(v.valuesByMode[m.modeId], m.modeId);
          if (v.resolvedType === "COLOR" && bruto && typeof bruto === "object")
            valores[m.name] = hexDe(bruto);
          else if (typeof bruto === "number") valores[m.name] = bruto;
        }
        if (Object.keys(valores).length)
          variaveis.push({ nome: v.name, colecao: col.name, tipo: v.resolvedType, valores });
      }
    }
    const textos = (_e = await ((_d = figma2.getLocalTextStylesAsync) == null ? void 0 : _d.call(figma2))) != null ? _e : [];
    const estilosTexto = textos.map((s) => {
      var _a2, _b2, _c2, _d2, _e2, _f2, _g2, _h2;
      return {
        nome: s.name,
        familia: (_b2 = (_a2 = s.fontName) == null ? void 0 : _a2.family) != null ? _b2 : "Inter",
        estilo: (_d2 = (_c2 = s.fontName) == null ? void 0 : _c2.style) != null ? _d2 : "Regular",
        tamanho: Number(s.fontSize) || 16,
        alturaLinha: ((_e2 = s.lineHeight) == null ? void 0 : _e2.unit) === "PIXELS" ? s.lineHeight.value : ((_f2 = s.lineHeight) == null ? void 0 : _f2.unit) === "PERCENT" ? s.lineHeight.value / 100 * (Number(s.fontSize) || 16) : void 0,
        espacamento: ((_g2 = s.letterSpacing) == null ? void 0 : _g2.unit) === "PIXELS" ? s.letterSpacing.value : ((_h2 = s.letterSpacing) == null ? void 0 : _h2.unit) === "PERCENT" ? s.letterSpacing.value / 100 * (Number(s.fontSize) || 16) : 0
      };
    });
    const efeitos = (_g = await ((_f = figma2.getLocalEffectStylesAsync) == null ? void 0 : _f.call(figma2))) != null ? _g : [];
    const sombras = [];
    for (const e of efeitos) {
      const s = ((_h = e.effects) != null ? _h : []).find((x) => x.type === "DROP_SHADOW");
      if (s)
        sombras.push({
          nome: e.name,
          x: (_j = (_i = s.offset) == null ? void 0 : _i.x) != null ? _j : 0,
          y: (_l = (_k = s.offset) == null ? void 0 : _k.y) != null ? _l : 0,
          raio: (_m = s.radius) != null ? _m : 0,
          espalhar: (_n = s.spread) != null ? _n : 0,
          opacidade: Math.round(((_p = (_o = s.color) == null ? void 0 : _o.a) != null ? _p : 0.25) * 100) / 100
        });
    }
    return { arquivo: (_r = (_q = figma2.root) == null ? void 0 : _q.name) != null ? _r : "Figma", variaveis, estilosTexto, sombras };
  }

  // src/app/kcx/icones.ts
  var ICONES_KCX = {
    menu: "M 4 7 L 20 7 M 4 12 L 20 12 M 4 17 L 20 17",
    fechar: "M 6 6 L 18 18 M 18 6 L 6 18",
    esquerda: "M 15 5 L 8 12 L 15 19",
    direita: "M 9 5 L 16 12 L 9 19",
    baixo: "M 6 9 L 12 15 L 18 9",
    cima: "M 6 15 L 12 9 L 18 15",
    play: "M 8 5 L 19 12 L 8 19 Z",
    check: "M 5 12 L 10 17 L 19 7",
    info: "M 12 11 L 12 17 M 12 7 L 12 7.5 M 21 12 A 9 9 0 1 1 3 12 A 9 9 0 1 1 21 12",
    casa: "M 4 11 L 12 4 L 20 11 L 20 20 L 4 20 Z",
    seta: "M 5 12 L 19 12 M 13 6 L 19 12 L 13 18",
    voltar: "M 19 12 L 5 12 M 11 6 L 5 12 L 11 18",
    mais: "M 12 5 L 12 19 M 5 12 L 19 12",
    menos: "M 5 12 L 19 12",
    busca: "M 10.5 4 A 6.5 6.5 0 1 1 10.5 17 A 6.5 6.5 0 1 1 10.5 4 M 15.5 15.5 L 20 20",
    usuario: "M 12 4 A 4 4 0 1 1 12 12 A 4 4 0 1 1 12 4 M 4 20 C 5 16 8 14 12 14 C 16 14 19 16 20 20",
    coracao: "M 12 20 C 5 15 3 11.5 3 8.5 C 3 6 5 4 7.5 4 C 9.5 4 11 5.2 12 7 C 13 5.2 14.5 4 16.5 4 C 19 4 21 6 21 8.5 C 21 11.5 19 15 12 20 Z",
    estrela: "M 12 3.5 L 14.6 9 L 20.5 9.6 L 16 13.5 L 17.3 19.5 L 12 16.4 L 6.7 19.5 L 8 13.5 L 3.5 9.6 L 9.4 9 Z",
    sino: "M 6 16 L 6 11 C 6 7.5 8.5 5 12 5 C 15.5 5 18 7.5 18 11 L 18 16 L 20 18 L 4 18 Z M 10 21 L 14 21",
    carrinho: "M 3 4 L 6 4 L 8 15 L 18 15 L 20 7 L 7 7 M 9 19 L 9 19.5 M 17 19 L 17 19.5",
    email: "M 3 6 L 21 6 L 21 18 L 3 18 Z M 3 6 L 12 13 L 21 6",
    telefone: "M 5 4 L 9 4 L 10.5 8 L 8.5 9.5 C 9.5 11.5 12.5 14.5 14.5 15.5 L 16 13.5 L 20 15 L 20 19 C 11.5 19 5 12.5 5 4 Z",
    calendario: "M 4 6 L 20 6 L 20 20 L 4 20 Z M 4 10 L 20 10 M 8 3 L 8 7 M 16 3 L 16 7",
    relogio: "M 21 12 A 9 9 0 1 1 3 12 A 9 9 0 1 1 21 12 M 12 7 L 12 12 L 15.5 14",
    download: "M 12 4 L 12 15 M 7 10 L 12 15 L 17 10 M 5 19 L 19 19",
    upload: "M 12 15 L 12 4 M 7 9 L 12 4 L 17 9 M 5 19 L 19 19",
    editar: "M 4 20 L 8 19 L 19 8 L 16 5 L 5 16 Z M 14 7 L 17 10",
    lixeira: "M 4 7 L 20 7 M 9 7 L 9 4 L 15 4 L 15 7 M 6 7 L 7 20 L 17 20 L 18 7",
    config: "M 12 9 A 3 3 0 1 1 12 15 A 3 3 0 1 1 12 9 M 12 3 L 12 5.5 M 12 18.5 L 12 21 M 3 12 L 5.5 12 M 18.5 12 L 21 12 M 5.6 5.6 L 7.4 7.4 M 16.6 16.6 L 18.4 18.4 M 5.6 18.4 L 7.4 16.6 M 16.6 7.4 L 18.4 5.6",
    sair: "M 14 4 L 20 4 L 20 20 L 14 20 M 10 8 L 6 12 L 10 16 M 6 12 L 16 12",
    alerta: "M 12 4 L 21 19 L 3 19 Z M 12 10 L 12 14 M 12 16.5 L 12 17",
    erro: "M 21 12 A 9 9 0 1 1 3 12 A 9 9 0 1 1 21 12 M 9 9 L 15 15 M 15 9 L 9 15",
    sucesso: "M 21 12 A 9 9 0 1 1 3 12 A 9 9 0 1 1 21 12 M 8 12 L 11 15 L 16 9",
    cadeado: "M 6 11 L 18 11 L 18 20 L 6 20 Z M 8.5 11 L 8.5 8 C 8.5 6 10 4.5 12 4.5 C 14 4.5 15.5 6 15.5 8 L 15.5 11",
    olho: "M 2.5 12 C 5 7.5 8.5 5.5 12 5.5 C 15.5 5.5 19 7.5 21.5 12 C 19 16.5 15.5 18.5 12 18.5 C 8.5 18.5 5 16.5 2.5 12 Z M 12 9.5 A 2.5 2.5 0 1 1 12 14.5 A 2.5 2.5 0 1 1 12 9.5",
    compartilhar: "M 12 15 L 12 4 M 8 8 L 12 4 L 16 8 M 6 12 L 6 20 L 18 20 L 18 12",
    instagram: "M 4 8 C 4 5.8 5.8 4 8 4 L 16 4 C 18.2 4 20 5.8 20 8 L 20 16 C 20 18.2 18.2 20 16 20 L 8 20 C 5.8 20 4 18.2 4 16 Z M 12 8.5 A 3.5 3.5 0 1 1 12 15.5 A 3.5 3.5 0 1 1 12 8.5 M 16.8 7.2 L 16.8 7.3",
    whatsapp: "M 4 20 L 5.2 16.2 C 4.4 14.9 4 13.5 4 12 C 4 7.6 7.6 4 12 4 C 16.4 4 20 7.6 20 12 C 20 16.4 16.4 20 12 20 C 10.5 20 9.1 19.6 7.8 18.8 Z",
    youtube: "M 3 7.5 C 3 6 4 5 5.5 5 L 18.5 5 C 20 5 21 6 21 7.5 L 21 16.5 C 21 18 20 19 18.5 19 L 5.5 19 C 4 19 3 18 3 16.5 Z M 10 9 L 15 12 L 10 15 Z",
    carregando: "M 12 3 A 9 9 0 1 1 3 12"
  };

  // src/app/kcx/figma-plano.ts
  function easingFigma(css) {
    const nomes = {
      linear: [0, 0, 1, 1],
      ease: [0.25, 0.1, 0.25, 1],
      "ease-in": [0.42, 0, 1, 1],
      "ease-out": [0, 0, 0.58, 1],
      "ease-in-out": [0.42, 0, 0.58, 1]
    };
    const m = /^cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)$/.exec(
      css.trim()
    );
    const p = m ? m.slice(1).map(Number) : nomes[css.trim()];
    return p ? {
      type: "CUSTOM_CUBIC_BEZIER",
      easingFunctionCubicBezier: { x1: p[0], y1: p[1], x2: p[2], y2: p[3] }
    } : null;
  }
  function curvasDoEnum(v) {
    var _a, _b, _c;
    if (v.tipo !== "enum") return null;
    const mapa = v.vinculos.flatMap((l) => {
      var _a2;
      return (_a2 = l.transformar) != null ? _a2 : [];
    }).find((o) => o.op === "mapa");
    const fonte = mapa && mapa.op === "mapa" ? mapa.valores : Object.fromEntries(((_a = v.opcoes) != null ? _a : []).map((o) => [o.valor, o.valor]));
    const out = {};
    for (const o of (_b = v.opcoes) != null ? _b : []) {
      const e = easingFigma((_c = fonte[o.valor]) != null ? _c : "");
      if (!e) return null;
      out[o.valor] = e;
    }
    return out;
  }
  var OPACIDADE_EM_PORCENTAGEM = true;
  var COLECOES = {
    colors: "KCX \xB7 Colors",
    dimensions: "KCX \xB7 Dimensions",
    spacing: "KCX \xB7 Spacing",
    typography: "KCX \xB7 Typography",
    motion: "KCX \xB7 Motion",
    effects: "KCX \xB7 Effects",
    components: "KCX \xB7 Components"
  };
  var kebab2 = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
  function tipoFigma(v) {
    if (v.tipo === "color") return "COLOR";
    if (v.tipo === "boolean") return "BOOLEAN";
    if (v.tipo === "string" || v.tipo === "enum") return "STRING";
    return "FLOAT";
  }
  function valorFigma(v, x, campo) {
    if (v.tipo === "color" || (campo == null ? void 0 : campo.tipo) === "COLOR") return corFigma(String(x));
    if (typeof x === "number" && (campo == null ? void 0 : campo.porcentagem)) return Math.round(x * 1e3) / 10;
    if (typeof x === "boolean" || typeof x === "number" || typeof x === "string") return x;
    return JSON.stringify(x);
  }
  var CAMPOS = {
    largura: { tipo: "FLOAT", escopo: ["WIDTH_HEIGHT"], vinculavel: true, rotulo: "largura" },
    altura: { tipo: "FLOAT", escopo: ["WIDTH_HEIGHT"], vinculavel: true, rotulo: "altura" },
    raio: { tipo: "FLOAT", escopo: ["CORNER_RADIUS"], vinculavel: true, rotulo: "raio" },
    opacidade: {
      tipo: "FLOAT",
      escopo: ["OPACITY"],
      vinculavel: true,
      porcentagem: OPACIDADE_EM_PORCENTAGEM,
      rotulo: "opacidade"
    },
    visivel: { tipo: "BOOLEAN", escopo: ["ALL_SCOPES"], vinculavel: true, rotulo: "visibilidade" },
    corPreenchimento: {
      tipo: "COLOR",
      escopo: ["ALL_FILLS"],
      vinculavel: true,
      rotulo: "preenchimento"
    },
    corParada: {
      tipo: "COLOR",
      escopo: ["ALL_FILLS"],
      vinculavel: true,
      rotulo: "parada do gradiente"
    },
    corTraco: { tipo: "COLOR", escopo: ["STROKE_COLOR"], vinculavel: true, rotulo: "cor do tra\xE7o" },
    espessura: {
      tipo: "FLOAT",
      escopo: ["STROKE_FLOAT"],
      vinculavel: true,
      rotulo: "espessura do tra\xE7o"
    },
    corEfeito: { tipo: "COLOR", escopo: ["EFFECT_COLOR"], vinculavel: true, rotulo: "cor do efeito" },
    raioEfeito: {
      tipo: "FLOAT",
      escopo: ["EFFECT_FLOAT"],
      vinculavel: true,
      rotulo: "raio do efeito"
    },
    conteudo: { tipo: "STRING", escopo: ["TEXT_CONTENT"], vinculavel: true, rotulo: "texto" },
    tamanhoFonte: {
      tipo: "FLOAT",
      escopo: ["FONT_SIZE"],
      vinculavel: true,
      rotulo: "tamanho da fonte"
    },
    espacamento: {
      tipo: "FLOAT",
      escopo: ["LETTER_SPACING"],
      vinculavel: true,
      rotulo: "espa\xE7amento entre letras"
    },
    gap: { tipo: "FLOAT", escopo: ["GAP"], vinculavel: true, rotulo: "espa\xE7o do Auto Layout" },
    padding: { tipo: "FLOAT", escopo: ["GAP"], vinculavel: true, rotulo: "padding" },
    fixo: { tipo: "FLOAT", escopo: [], vinculavel: false, rotulo: "valor fixo" }
  };
  function nomeVar(comp, sufixo, nome) {
    return sufixo ? `${comp}/${sufixo}/${nome}` : `${comp}/${nome}`;
  }
  function porId(comp, id) {
    const v = comp.variaveis.find((x) => x.id === id);
    if (!v) throw new Error(`KCX: vari\xE1vel ${id} n\xE3o existe em ${comp.id}`);
    return v;
  }
  function valorNoModo(v, atual, m) {
    if (atual !== v.valor || !v.modos) return atual;
    if (m === "Light" && v.modos.light !== void 0) return v.modos.light;
    if (m === "Dark" && v.modos.dark !== void 0) return v.modos.dark;
    if (m === "Celular" && v.modos.celular !== void 0) return v.modos.celular;
    return atual;
  }
  function valoresNoModo(comp, valores, m) {
    const r = __spreadValues({}, valores);
    for (const v of comp.variaveis) if (v.modos) r[v.id] = valorNoModo(v, valores[v.id], m);
    return r;
  }
  function valoresPorModo(v, atual, modos, campo, transformar) {
    const t = transformar != null ? transformar : ((x) => x);
    const out = {};
    for (const m of modos) {
      const bruto = valorNoModo(v, atual, m);
      out[m] = valorFigma(v, t(bruto), campo);
    }
    return out;
  }
  function difereDaBase(ctx, ids) {
    return ids.some((id) => JSON.stringify(ctx.valores[id]) !== JSON.stringify(ctx.base[id]));
  }
  function idsDeOps(ops = []) {
    return ops.flatMap(
      (o) => o.op === "variavelPorOpcao" ? Object.values(o.variaveis) : "variavel" in o && o.variavel ? [o.variavel] : []
    );
  }
  function resolverRef(ref, campo, onde, ctx) {
    var _a, _b;
    if (ref === void 0) return void 0;
    const { comp, valores } = ctx;
    if (ehRefVariavel(ref)) {
      const v = porId(comp, ref.$var);
      const atual = valores[v.id];
      const valor = v.tipo === "color" ? corFigma(String(atual)) : atual;
      if (!ctx.usarVariaveis || !campo.vinculavel || !v.exportavel) return { valor };
      const sufixo = difereDaBase(ctx, [v.id]) ? ctx.sufixo : "";
      const nome = nomeVar(comp.id, sufixo, kebab2(v.id));
      ctx.registrar(
        {
          nome,
          colecao: COLECOES[v.grupo],
          tipo: campo.tipo,
          valores: valoresPorModo(v, atual, ctx.modos, campo),
          escopos: campo.escopo,
          descricao: `${v.nome} \u2014 ${v.descricao}${sufixo ? ` (valor da variante ${sufixo})` : ""}`,
          codigoWeb: ((_a = v.vinculos.find((x) => {
            var _a2;
            return x.alvo.tipo === "css-var" && !((_a2 = x.transformar) == null ? void 0 : _a2.length);
          })) == null ? void 0 : _a.alvo.tipo) === "css-var" ? `var(${v.vinculos.find((x) => {
            var _a2;
            return x.alvo.tipo === "css-var" && !((_a2 = x.transformar) == null ? void 0 : _a2.length);
          }).alvo.nome})` : void 0,
          origem: sufixo ? "estado" : "direta",
          variavelKcx: v.id,
          vinculadaA: []
        },
        onde
      );
      return { valor, variavel: nome };
    }
    if (ehRefDerivada(ref)) {
      const v = porId(comp, ref.$derivado);
      const bruto = aplicarOperacoes(v, valores[v.id], ref.transformar, valores, comp.variaveis);
      const calc = campo.tipo === "BOOLEAN" ? bruto === true || bruto === "true" : campo.tipo === "FLOAT" && typeof bruto === "string" && bruto.trim() !== "" && !isNaN(Number(bruto)) ? Number(bruto) : bruto;
      const valor = campo.tipo === "COLOR" ? corFigma(String(calc)) : calc;
      if (!ctx.usarVariaveis || !campo.vinculavel) return { valor };
      const sufixo = difereDaBase(ctx, [v.id, ...idsDeOps(ref.transformar)]) ? ctx.sufixo : "";
      const nome = nomeVar(comp.id, sufixo, ref.nome);
      const grupo = campo.tipo === "COLOR" ? "colors" : v.grupo === "motion" ? "effects" : v.grupo;
      ctx.registrar(
        {
          nome,
          colecao: COLECOES[grupo],
          tipo: campo.tipo,
          valores: Object.fromEntries(
            ctx.modos.map((m) => {
              if (m === "Valor") return [m, valorFigma(v, calc, campo)];
              const vm = valoresNoModo(comp, valores, m);
              let x;
              try {
                x = aplicarOperacoes(v, vm[v.id], ref.transformar, vm, comp.variaveis);
              } catch (e) {
                x = bruto;
              }
              const c = campo.tipo === "BOOLEAN" ? x === true || x === "true" : campo.tipo === "FLOAT" && typeof x === "string" && !isNaN(Number(x)) ? Number(x) : x;
              return [m, valorFigma(v, c, campo)];
            })
          ),
          escopos: campo.escopo,
          descricao: `Derivada de "${v.nome}" no lab (${((_b = ref.transformar) != null ? _b : []).map((o) => o.op).join(" \u2192 ") || "c\xF3pia"}). O Figma n\xE3o recalcula f\xF3rmulas: edite aqui ou reexporte do lab.`,
          origem: sufixo ? "estado" : "derivada",
          variavelKcx: v.id,
          vinculadaA: []
        },
        onde
      );
      return { valor, variavel: nome };
    }
    const literal2 = campo.tipo === "COLOR" ? corFigma(String(ref)) : ref;
    return { valor: literal2 };
  }
  function corRef(ref, campo, onde, ctx) {
    return resolverRef(ref, campo, onde, ctx);
  }
  function literal(ref, ctx) {
    if (ref === void 0) return void 0;
    const r = resolverRef(ref, CAMPOS["fixo"], "", __spreadProps(__spreadValues({}, ctx), { usarVariaveis: false }));
    return r ? Number(r.valor) : void 0;
  }
  function matrizGradiente(anguloCss, tamanhoPct = 100, deslocPct = 0) {
    const t = anguloCss * Math.PI / 180;
    const d = { x: Math.sin(t), y: -Math.cos(t) };
    const n = { x: Math.cos(t), y: Math.sin(t) };
    const L = Math.abs(d.x) + Math.abs(d.y) || 1;
    const S = Math.max(1, tamanhoPct / 100);
    const off = { x: deslocPct / 100 * (S - 1), y: 0.5 * (S - 1) };
    const c = { x: 0.5, y: 0.5 };
    const r = (k) => Math.round(k * 1e4) / 1e4 || 0;
    const linha = (u) => [
      r(u.x / (S * L)),
      r(u.y / (S * L)),
      r((u.x * (off.x / S - c.x) + u.y * (off.y / S - c.y)) / L + 0.5)
    ];
    return [linha(d), linha(n)];
  }
  function matrizConica(anguloCss) {
    const t = (anguloCss - 90) * Math.PI / 180;
    const c = Math.cos(t);
    const s = Math.sin(t);
    const r = (k) => Math.round(k * 1e4) / 1e4 || 0;
    return [
      [r(c), r(s), r(0.5 - 0.5 * c - 0.5 * s)],
      [r(-s), r(c), r(0.5 + 0.5 * s - 0.5 * c)]
    ];
  }
  function planejarNo(no, ctx, caminho) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
    const onde = (campo) => `${ctx.comp.nome} \u203A ${caminho} \u203A ${campo}`;
    const p = {
      id: no.id,
      nome: no.nome,
      tipo: no.tipo,
      x: literal(no.x, ctx),
      y: literal(no.y, ctx),
      rotacao: literal(no.rotacao, ctx),
      largura: resolverRef(no.largura, CAMPOS["largura"], onde("largura"), ctx),
      altura: resolverRef(no.altura, CAMPOS["altura"], onde("altura"), ctx),
      raio: resolverRef(no.raio, CAMPOS["raio"], onde("raio"), ctx),
      opacidade: resolverRef(no.opacidade, CAMPOS["opacidade"], onde("opacidade"), ctx),
      visivel: resolverRef(no.visivel, CAMPOS["visivel"], onde("visibilidade"), ctx),
      preenchimentos: [],
      efeitos: [],
      recortar: !!no.recortar,
      absoluto: !!no.absoluto,
      encher: no.encher || void 0,
      filhos: []
    };
    const pintura = (f, rotulo, campoCor) => {
      var _a2, _b2, _c2;
      if (f.tipo === "solido")
        return { tipo: "solido", cor: corRef(f.cor, campoCor, onde(rotulo), ctx) };
      if (f.tipo === "imagem")
        return { tipo: "imagem", src: f.src, ajuste: f.ajuste === "preencher" ? "FILL" : "FIT" };
      if (f.tipo === "gradiente-linear" || f.tipo === "gradiente-conico") {
        const ang = (_a2 = literal(f.angulo, ctx)) != null ? _a2 : f.tipo === "gradiente-linear" ? 90 : 0;
        return {
          tipo: "gradiente",
          subtipo: f.tipo === "gradiente-conico" ? "GRADIENT_ANGULAR" : "GRADIENT_LINEAR",
          transformacao: f.tipo === "gradiente-conico" ? matrizConica(ang) : matrizGradiente(ang),
          paradas: f.paradas.map((s) => ({
            posicao: s.posicao,
            cor: corRef(s.cor, CAMPOS["corParada"], onde(`${rotulo} \u203A parada ${s.posicao}`), ctx)
          }))
        };
      }
      const v = porId(ctx.comp, f.variavel);
      const g = ctx.valores[v.id];
      const tamanho = (_b2 = literal(f.tamanho, ctx)) != null ? _b2 : 100;
      const desloc = (_c2 = literal(f.deslocamento, ctx)) != null ? _c2 : 0;
      return {
        tipo: "gradiente",
        subtipo: "GRADIENT_LINEAR",
        transformacao: matrizGradiente(g.angulo, tamanho, desloc),
        paradas: [...g.paradas].sort((a, b) => a.posicao - b.posicao).map((s, j) => {
          const cor = corFigma(s.cor);
          if (!ctx.usarVariaveis) return { posicao: s.posicao, cor: { valor: cor } };
          const sufixo = difereDaBase(ctx, [v.id]) ? ctx.sufixo : "";
          const nome = nomeVar(ctx.comp.id, sufixo, `${kebab2(v.id)}/stop-${j + 1}`);
          ctx.registrar(
            {
              nome,
              colecao: COLECOES["colors"],
              tipo: "COLOR",
              valores: Object.fromEntries(ctx.modos.map((m) => [m, cor])),
              escopos: CAMPOS["corParada"].escopo,
              descricao: `Parada ${j + 1} de "${v.nome}" (posi\xE7\xE3o ${Math.round(s.posicao * 100)}%). Representa\xE7\xE3o do gradiente: uma vari\xE1vel de cor por parada.`,
              origem: "parada",
              variavelKcx: v.id,
              vinculadaA: []
            },
            onde(`${rotulo} \u203A parada ${j + 1}`)
          );
          return { posicao: s.posicao, cor: { valor: cor, variavel: nome } };
        })
      };
    };
    ((_a = no.preenchimentos) != null ? _a : []).forEach(
      (f, i) => p.preenchimentos.push(
        pintura(f, i ? `preenchimento ${i + 1}` : "preenchimento", CAMPOS["corPreenchimento"])
      )
    );
    if (no.traco) {
      const base = (_c = no.traco.pintura) != null ? _c : {
        tipo: "solido",
        cor: (_b = no.traco.cor) != null ? _b : "#000000"
      };
      p.traco = {
        pintura: pintura(base, "tra\xE7o", CAMPOS["corTraco"]),
        espessura: resolverRef(
          no.traco.espessura,
          CAMPOS["espessura"],
          onde("espessura do tra\xE7o"),
          ctx
        )
      };
    }
    if (no.arco) {
      const rad = (g) => Math.round(g * Math.PI / 180 * 1e4) / 1e4;
      p.arco = {
        inicio: rad((_d = literal(no.arco.inicio, ctx)) != null ? _d : 0),
        fim: rad((_e = literal(no.arco.fim, ctx)) != null ? _e : 360),
        interno: Math.min(0.99, Math.max(0, (_f = literal(no.arco.interno, ctx)) != null ? _f : 0))
      };
    }
    if (no.restricoes) p.restricoes = { horizontal: no.restricoes.h, vertical: no.restricoes.v };
    if (no.propriedadeVisivel) p.propriedadeVisivel = no.propriedadeVisivel;
    ((_g = no.efeitos) != null ? _g : []).forEach((ef, i) => {
      var _a2, _b2, _c2;
      if (ef.tipo === "sombra") {
        p.efeitos.push({
          tipo: "DROP_SHADOW",
          cor: corRef(ef.cor, CAMPOS["corEfeito"], onde(`sombra ${i + 1} \u203A cor`), ctx),
          raio: resolverRef(ef.raio, CAMPOS["raioEfeito"], onde(`sombra ${i + 1} \u203A raio`), ctx),
          espalhar: resolverRef(
            (_a2 = ef.espalhar) != null ? _a2 : 0,
            CAMPOS["raioEfeito"],
            onde(`sombra ${i + 1} \u203A espalhamento`),
            ctx
          ),
          x: (_b2 = ef.x) != null ? _b2 : 0,
          y: (_c2 = ef.y) != null ? _c2 : 0
        });
      } else {
        p.efeitos.push({
          tipo: ef.tipo === "desfoque-camada" ? "LAYER_BLUR" : "BACKGROUND_BLUR",
          raio: resolverRef(ef.raio, CAMPOS["raioEfeito"], onde(`desfoque ${i + 1}`), ctx)
        });
      }
    });
    if (no.texto) {
      p.texto = {
        conteudo: resolverRef(no.texto.conteudo, CAMPOS["conteudo"], onde("texto"), ctx),
        tamanho: resolverRef(
          no.texto.tamanho,
          CAMPOS["tamanhoFonte"],
          onde("tamanho da fonte"),
          ctx
        ),
        espacamento: resolverRef(
          no.texto.espacamento,
          CAMPOS["espacamento"],
          onde("espa\xE7amento"),
          ctx
        ),
        familia: no.texto.familia,
        estilo: no.texto.estilo,
        caixaAlta: !!no.texto.caixaAlta,
        alinhamento: no.texto.alinhamento === "centro" ? "CENTER" : no.texto.alinhamento === "direita" ? "RIGHT" : "LEFT",
        preencher: !!no.texto.preencher,
        propriedade: no.texto.propriedade
      };
    }
    if (no.slot) p.slot = no.slot;
    if (no.grade) {
      const n = ((_h = no.filhos) != null ? _h : []).length;
      p.grade = {
        colunas: no.grade.colunas,
        linhas: Math.max(1, Math.ceil(n / no.grade.colunas)),
        espaco: resolverRef(no.grade.espaco, CAMPOS["gap"], onde("espa\xE7o da grade"), ctx)
      };
    }
    if (no.instancia) {
      const alvo = (_i = ctx.planejados) == null ? void 0 : _i.get(no.instancia.componente);
      if (alvo) {
        const quer = (_j = no.instancia.variante) != null ? _j : {};
        const v = (_k = alvo.variantes.find(
          (x) => Object.entries(quer).every(([k, val]) => x.propriedades[k] === val)
        )) != null ? _k : alvo.variantes[0];
        const textos = {};
        for (const [prop, ref] of Object.entries((_l = no.instancia.textos) != null ? _l : {})) {
          const r = resolverRef(ref, __spreadProps(__spreadValues({}, CAMPOS["fixo"]), { tipo: "STRING" }), "", __spreadProps(__spreadValues({}, ctx), {
            usarVariaveis: false
          }));
          textos[prop] = String((_m = r == null ? void 0 : r.valor) != null ? _m : "");
        }
        const trocar = (n) => {
          var _a2;
          return __spreadProps(__spreadValues({}, n), {
            texto: ((_a2 = n.texto) == null ? void 0 : _a2.propriedade) && n.texto.propriedade in textos ? __spreadProps(__spreadValues({}, n.texto), { conteudo: { valor: textos[n.texto.propriedade] } }) : n.texto,
            filhos: n.filhos.map(trocar)
          });
        };
        p.instancia = {
          componente: alvo.id,
          nome: alvo.nome,
          variante: v.nome,
          textos,
          arvore: trocar(v.arvore)
        };
      }
    }
    if (no.icone) {
      const r = resolverRef(no.icone.nome, __spreadProps(__spreadValues({}, CAMPOS["fixo"]), { tipo: "STRING" }), "", __spreadProps(__spreadValues({}, ctx), {
        usarVariaveis: false
      }));
      const nome = String((_n = r == null ? void 0 : r.valor) != null ? _n : "mais");
      p.icone = {
        nome: nome in ICONES_KCX ? nome : "mais",
        cor: corRef(no.icone.cor, CAMPOS["corTraco"], onde("cor do \xEDcone"), ctx),
        tamanho: (_o = literal(no.icone.tamanho, ctx)) != null ? _o : 20,
        propriedade: no.icone.propriedade
      };
    }
    if (no.svg !== void 0) {
      const r = resolverRef(no.svg, __spreadProps(__spreadValues({}, CAMPOS["fixo"]), { tipo: "STRING" }), "", __spreadProps(__spreadValues({}, ctx), {
        usarVariaveis: false
      }));
      p.svg = String((_p = r == null ? void 0 : r.valor) != null ? _p : "");
    }
    if (no.svgTraco) {
      p.svgTraco = {
        cor: corRef(no.svgTraco.cor, CAMPOS["corTraco"], onde("cor do tra\xE7o"), ctx),
        espessura: resolverRef(
          no.svgTraco.espessura,
          CAMPOS["espessura"],
          onde("espessura do tra\xE7o"),
          ctx
        ),
        tracejado: (_q = no.svgTraco.tracejado) == null ? void 0 : _q.map((t) => {
          var _a2;
          return Math.round(((_a2 = literal(t, ctx)) != null ? _a2 : 0) * 100) / 100;
        })
      };
    }
    let parcial = false;
    const tr = (_r = p.svgTraco) == null ? void 0 : _r.tracejado;
    if (p.svg && tr && tr.length === 2) {
      const total = comprimentoSvg(p.svg);
      if (total > 0 && tr[1] >= total) {
        if (tr[0] < total - 0.5) {
          p.svg = cortarSvg(p.svg, tr[0]);
          parcial = true;
        }
        p.svgTraco = __spreadProps(__spreadValues({}, p.svgTraco), { tracejado: void 0 });
      }
    }
    if (no.peca && p.svg && parcial) {
    } else if (no.peca && p.svg) {
      const eixo = porId(ctx.comp, no.peca.eixo);
      const rotulo = (_u = (_t = (_s = eixo.opcoes) == null ? void 0 : _s.find((o) => o.valor === ctx.valores[eixo.id])) == null ? void 0 : _t.rotulo) != null ? _u : String(ctx.valores[eixo.id]);
      p.peca = { nome: no.peca.nome, variante: rotulo };
      let peca = ctx.pecas.get(no.peca.nome);
      if (!peca)
        ctx.pecas.set(no.peca.nome, peca = { nome: no.peca.nome, eixo: eixo.id, opcoes: [] });
      if (!peca.opcoes.some((o) => o.rotulo === rotulo)) {
        const traco = (_v = p.svgTraco) != null ? _v : {
          cor: { valor: { r: 0, g: 0, b: 0, a: 1 } },
          espessura: { valor: 1 }
        };
        peca.opcoes.push({
          rotulo,
          svg: p.svg,
          traco: { cor: traco.cor, espessura: traco.espessura }
        });
        const ordem = ((_w = eixo.opcoes) != null ? _w : []).map((o) => o.rotulo);
        peca.opcoes.sort((a, b) => ordem.indexOf(a.rotulo) - ordem.indexOf(b.rotulo));
      }
    }
    if (no.autoLayout) {
      p.autoLayout = {
        alinhar: no.autoLayout.alinhar === "inicio" ? "MIN" : no.autoLayout.alinhar === "fim" ? "MAX" : void 0,
        direcao: no.autoLayout.direcao === "horizontal" ? "HORIZONTAL" : "VERTICAL",
        espaco: resolverRef(no.autoLayout.espaco, CAMPOS["gap"], onde("espa\xE7o"), ctx),
        paddingX: resolverRef(
          no.autoLayout.paddingX,
          CAMPOS["padding"],
          onde("padding horizontal"),
          ctx
        ),
        paddingY: resolverRef(
          no.autoLayout.paddingY,
          CAMPOS["padding"],
          onde("padding vertical"),
          ctx
        ),
        quebrar: no.autoLayout.quebrar || void 0,
        distribuir: no.autoLayout.distribuir || void 0
      };
      const l = no.autoLayout.lados;
      if (l) {
        const lado = (r, nome) => r === void 0 ? void 0 : resolverRef(r, CAMPOS["padding"], onde(nome), ctx);
        p.autoLayout.lados = {
          cima: lado(l.cima, "padding de cima"),
          baixo: lado(l.baixo, "padding de baixo"),
          esquerda: lado(l.esquerda, "padding da esquerda"),
          direita: lado(l.direita, "padding da direita")
        };
      }
    }
    if (no.larguraMin !== void 0)
      p.larguraMin = resolverRef(no.larguraMin, CAMPOS["largura"], onde("largura m\xEDnima"), ctx);
    if (no.larguraMax !== void 0)
      p.larguraMax = resolverRef(no.larguraMax, CAMPOS["largura"], onde("largura m\xE1xima"), ctx);
    p.filhos = ((_x = no.filhos) != null ? _x : []).map((f) => planejarNo(f, ctx, `${caminho} \u203A ${f.nome}`));
    return p;
  }
  function combinacoes(comp, atuais) {
    var _a;
    const estados = comp.estados.length ? comp.estados : [
      {
        id: "padrao",
        nome: "Padr\xE3o",
        valores: {},
        derivar: []
      }
    ];
    const eixos = ((_a = comp.compatibilidade.figma.eixosVariante) != null ? _a : []).map((id) => porId(comp, id));
    let combos = estados.map(
      (s) => {
        var _a2, _b, _c;
        const vals = __spreadValues(__spreadValues({}, atuais), s.valores);
        for (const d of (_a2 = s.derivar) != null ? _a2 : []) {
          const alvo = porId(comp, d.variavel);
          let x = d.op === "copiar" ? vals[d.de] : Number(vals[d.variavel]) * Number(vals[d.de]);
          if (typeof x === "number")
            x = Math.min((_b = alvo.max) != null ? _b : Infinity, Math.max((_c = alvo.min) != null ? _c : -Infinity, x));
          vals[d.variavel] = x;
        }
        return { props: { Estado: s.nome }, valores: vals, partes: [s.id] };
      }
    );
    for (const eixo of eixos) {
      combos = combos.flatMap(
        (c) => {
          var _a2;
          return ((_a2 = eixo.opcoes) != null ? _a2 : []).map((o) => ({
            props: __spreadProps(__spreadValues({}, c.props), { [eixo.nome]: o.rotulo }),
            valores: __spreadProps(__spreadValues({}, c.valores), { [eixo.id]: o.valor }),
            partes: [...c.partes, o.valor]
          }));
        }
      );
    }
    return combos.map((c) => ({
      nome: Object.entries(c.props).map(([k, v]) => `${k}=${v}`).join(", "),
      props: c.props,
      valores: c.valores,
      sufixo: c.partes.join("-")
    }));
  }
  function prototipoDe(comp, variantes) {
    var _a;
    const o = (_a = comp.prototipo) == null ? void 0 : _a.overlay;
    if (!o) return void 0;
    const nomeDe = (id) => {
      var _a2;
      const e = comp.estados.find((x) => x.id === id);
      return (_a2 = variantes.find((v) => v.propriedades["Estado"] === (e == null ? void 0 : e.nome))) == null ? void 0 : _a2.nome;
    };
    const de = nomeDe(o.de);
    const ov = nomeDe(o.overlay);
    return de && ov ? { overlay: { de, no: o.no, overlay: ov, fechar: o.fechar } } : void 0;
  }
  function planejarFigma(pacote, modo = pacote.exportacao.modo) {
    var _a, _b, _c, _d, _e, _f, _g;
    const usarVariaveis = modo !== "visual";
    const criarComponentes = modo !== "variaveis";
    const vars = /* @__PURE__ */ new Map();
    const avisos = [];
    const fundacao = pacote.fundacao && !validarFundacao(pacote.fundacao).length && usarVariaveis ? pacote.fundacao : void 0;
    if (pacote.fundacao && !fundacao && usarVariaveis)
      avisos.push("A funda\xE7\xE3o do pacote \xE9 inv\xE1lida e foi ignorada.");
    const temModos = !!fundacao || pacote.componentes.some(
      (c) => c.variaveis.some((v) => {
        var _a2, _b2;
        return ((_a2 = v.modos) == null ? void 0 : _a2.light) !== void 0 || ((_b2 = v.modos) == null ? void 0 : _b2.dark) !== void 0;
      })
    );
    const temTelas = !!fundacao || pacote.componentes.some((c) => c.variaveis.some((v) => {
      var _a2;
      return ((_a2 = v.modos) == null ? void 0 : _a2.celular) !== void 0;
    }));
    const COLECOES_TELA = [COLECOES.spacing, COLECOES.dimensions, COLECOES.typography];
    const modosDe = (colecao) => temModos && colecao === COLECOES.colors ? ["Dark", "Light"] : temTelas && COLECOES_TELA.includes(colecao) ? ["Desktop", "Celular"] : ["Valor"];
    const registrar = (pv, onde) => {
      pv.valores = Object.fromEntries(
        modosDe(pv.colecao).map((m) => {
          var _a2, _b2, _c2, _d2;
          return [
            m,
            (_d2 = (_c2 = (_b2 = (_a2 = pv.valores[m]) != null ? _a2 : pv.valores["Dark"]) != null ? _b2 : pv.valores["Desktop"]) != null ? _c2 : pv.valores["Valor"]) != null ? _d2 : Object.values(pv.valores)[0]
          ];
        })
      );
      const existente = vars.get(pv.nome);
      if (existente) {
        if (JSON.stringify(existente.valores) !== JSON.stringify(pv.valores) && existente.origem !== "estado") {
          avisos.push(
            `A vari\xE1vel ${pv.nome} recebeu valores diferentes em camadas diferentes; foi mantido o primeiro.`
          );
        }
        if (onde && !existente.vinculadaA.includes(onde)) existente.vinculadaA.push(onde);
        return;
      }
      vars.set(pv.nome, __spreadProps(__spreadValues({}, pv), { vinculadaA: onde ? [onde] : [] }));
    };
    if (fundacao) for (const t of variaveisDaFundacao(fundacao)) registrar(t, "");
    const componentes = [];
    const planejados = /* @__PURE__ */ new Map();
    const usaDe = (c) => {
      const out = [];
      const ver = (n) => {
        var _a2;
        if (n.instancia) out.push(n.instancia.componente);
        (_a2 = n.filhos) == null ? void 0 : _a2.forEach(ver);
      };
      ver(c.estrutura);
      return out;
    };
    const ordemPlano = [];
    const visitar = (c, pilha) => {
      if (ordemPlano.includes(c) || pilha.has(c.id)) return;
      pilha.add(c.id);
      for (const id of usaDe(c)) {
        const d = pacote.componentes.find((x) => x.id === id);
        if (d) visitar(d, pilha);
      }
      ordemPlano.push(c);
    };
    pacote.componentes.forEach((c) => visitar(c, /* @__PURE__ */ new Set()));
    for (const comp of ordemPlano) {
      const atuais = valoresAtuais(comp.variaveis);
      const combos = combinacoes(comp, atuais);
      const base = (_b = (_a = combos[0]) == null ? void 0 : _a.valores) != null ? _b : atuais;
      const pecas = /* @__PURE__ */ new Map();
      const variantes = combos.map((c, i) => {
        const ctx = {
          comp,
          valores: c.valores,
          base,
          sufixo: i === 0 ? "" : c.sufixo,
          usarVariaveis,
          modos: [],
          registrar,
          pecas,
          planejados
        };
        ctx.modos = [
          ...temModos ? ["Dark", "Light"] : [],
          ...temTelas ? ["Desktop", "Celular"] : [],
          "Valor"
        ];
        return {
          nome: c.nome,
          propriedades: c.props,
          arvore: planejarNo(comp.estrutura, ctx, comp.estrutura.nome)
        };
      });
      if (usarVariaveis) {
        for (const v of comp.variaveis) {
          if (!v.exportavel) continue;
          const ehEixo = (_c = comp.compatibilidade.figma.eixosVariante) == null ? void 0 : _c.includes(v.id);
          const usada = [...vars.values()].some(
            (pv) => pv.variavelKcx === v.id && pv.nome.startsWith(`${comp.id}/`) && pv.vinculadaA.length
          );
          if (usada || ehEixo) continue;
          if (v.tipo === "gradient" || v.tipo === "transform") {
            avisos.push(
              `${comp.nome}: "${v.nome}" (${v.tipo}) n\xE3o tem representa\xE7\xE3o vincul\xE1vel no Figma; fica no c\xF3digo.`
            );
            continue;
          }
          const curvas = curvasDoEnum(v);
          const tipoDoc = v.tipo === "time" ? "TIMING" : curvas ? "EASING" : tipoFigma(v);
          const emSegundos = (x) => v.unidade === "ms" ? Number(x) / 1e3 : Number(x);
          const valoresDoc = tipoDoc === "TIMING" ? { Valor: emSegundos(atuais[v.id]) } : tipoDoc === "EASING" ? { Valor: curvas[String(atuais[v.id])] } : valoresPorModo(v, atuais[v.id], temModos ? ["Dark", "Light", "Valor"] : ["Valor"]);
          registrar(
            {
              nome: nomeVar(comp.id, "", kebab2(v.id)),
              colecao: COLECOES[v.grupo],
              tipo: tipoDoc,
              valores: valoresDoc,
              escopos: [],
              descricao: `[Documental \u2014 n\xE3o execut\xE1vel no Figma] ${v.nome}: ${v.descricao} Controla no c\xF3digo: ${v.vinculos.map((x) => x.propriedade).join("; ")}.`,
              codigoWeb: v.vinculos[0].alvo.tipo === "css-var" ? `var(${v.vinculos[0].alvo.nome})` : void 0,
              origem: "documental",
              variavelKcx: v.id,
              vinculadaA: []
            },
            ""
          );
        }
      }
      const interacoes = [];
      for (const it of (_d = comp.interacoes) != null ? _d : []) {
        const de = comp.estados.find((e) => e.id === it.de);
        const para = comp.estados.find((e) => e.id === it.para);
        if (!de || !para) {
          avisos.push(`${comp.nome}: intera\xE7\xE3o com estado inexistente (${it.de} \u2192 ${it.para}).`);
          continue;
        }
        const muda = {};
        for (const [vid, valor] of Object.entries((_e = it.muda) != null ? _e : {})) {
          const ev = comp.variaveis.find((x) => x.id === vid);
          const rot = (_g = (_f = ev == null ? void 0 : ev.opcoes) == null ? void 0 : _f.find((o) => o.valor === valor)) == null ? void 0 : _g.rotulo;
          if (ev && rot) muda[ev.nome] = rot;
        }
        for (const v of variantes.filter((x) => x.propriedades["Estado"] === de.nome)) {
          const alvo = variantes.find(
            (x) => Object.entries(__spreadValues(__spreadProps(__spreadValues({}, v.propriedades), { Estado: para.nome }), muda)).every(
              ([k, val]) => x.propriedades[k] === val
            )
          );
          if (alvo && alvo.nome !== v.nome)
            interacoes.push({
              variante: v.nome,
              no: it.no,
              gatilho: it.gatilho,
              destino: alvo.nome,
              transicao: it.transicao,
              duracao: it.duracao,
              curva: it.curva,
              direcao: it.direcao,
              atraso: it.atraso,
              tecla: it.tecla,
              acoes: it.acoes
            });
        }
      }
      if (criarComponentes) {
        const f = comp.compatibilidade.figma;
        componentes.push({
          id: comp.id,
          nome: comp.nome,
          versao: comp.versao,
          pacote: pacote.id,
          nivel: f.nivel,
          descricao: comp.descricao,
          variantes,
          pecas: [...pecas.values()],
          limitacoes: f.limitacoes,
          editavel: f.editavel,
          parcial: f.parcial,
          naoSuportado: f.naoSuportado,
          codigo: { html: comp.codigo.html, css: comp.codigo.css, js: comp.codigo.js },
          largura: comp.metadados.largura,
          altura: comp.metadados.altura,
          interacoes: interacoes.length ? interacoes : void 0,
          prototipo: prototipoDe(comp, variantes),
          usa: usaDe(comp).length ? [...new Set(usaDe(comp))] : void 0
        });
        planejados.set(comp.id, componentes[componentes.length - 1]);
      }
    }
    componentes.sort(
      (a, b) => pacote.componentes.findIndex((c) => c.id === a.id) - pacote.componentes.findIndex((c) => c.id === b.id)
    );
    if (usarVariaveis && pacote.composicao) {
      for (const s of pacote.composicao.compartilhadas) {
        const nome = `${pacote.composicao.id}/${kebab2(s.id)}`;
        const primeiroAlvo = s.alvos[0].split(".");
        const cam = pacote.composicao.camadas.find((c) => c.prefixo === primeiroAlvo[0]);
        const comp = pacote.componentes.find((c) => c.id === (cam == null ? void 0 : cam.componente));
        const v = comp == null ? void 0 : comp.variaveis.find((x) => x.id === primeiroAlvo[1]);
        if (!v) continue;
        registrar(
          {
            nome,
            colecao: COLECOES.components,
            tipo: tipoFigma(v),
            valores: { Valor: valorFigma(v, s.valor) },
            escopos: ["ALL_SCOPES"],
            descricao: `Compartilhada da composi\xE7\xE3o "${pacote.composicao.nome}": controla ${s.alvos.join(", ")}.`,
            origem: "compartilhada",
            variavelKcx: s.id,
            vinculadaA: []
          },
          ""
        );
        for (const alvo of s.alvos) {
          const [prefixo, varId] = alvo.split(".");
          const camada = pacote.composicao.camadas.find((c) => c.prefixo === prefixo);
          const alvoNome = nomeVar(camada.componente, "", kebab2(varId));
          const pv = vars.get(alvoNome);
          if (pv) {
            pv.valores = Object.fromEntries(Object.keys(pv.valores).map((m) => [m, { alias: nome }]));
            vars.get(nome).vinculadaA.push(`${alvoNome} (alias)`);
          }
        }
      }
    }
    const colecoes = [];
    for (const pv of vars.values()) {
      let c = colecoes.find((x) => x.nome === pv.colecao);
      if (!c) colecoes.push(c = { nome: pv.colecao, modos: modosDe(pv.colecao), variaveis: [] });
      c.variaveis.push(pv);
    }
    const ordem = Object.values(COLECOES);
    colecoes.sort((a, b) => ordem.indexOf(a.nome) - ordem.indexOf(b.nome));
    const contar = (n) => 1 + n.filhos.reduce((s, f) => s + contar(f), 0);
    const temIcone = (n) => !!n.icone || n.filhos.some(temIcone);
    const usaIcones = componentes.some((c) => c.variantes.some((v) => temIcone(v.arvore)));
    const plano = {
      modo,
      icones: usaIcones ? __spreadValues({}, ICONES_KCX) : void 0,
      fundacao: fundacao ? planoDaFundacao(fundacao) : void 0,
      pacote: { id: pacote.id, versao: pacote.versao, nome: pacote.nome },
      colecoes,
      componentes,
      composicao: pacote.composicao && criarComponentes ? {
        nome: pacote.composicao.nome,
        camadas: pacote.composicao.camadas.map((c) => ({
          componente: c.componente,
          papel: c.papel
        }))
      } : void 0,
      documentacao: modo === "completo" || modo === "pacote",
      avisos,
      resumo: {
        variaveis: 0,
        vinculadas: 0,
        documentais: 0,
        componentes: componentes.length,
        variantes: componentes.reduce((s, c) => s + c.variantes.length, 0),
        camadas: componentes.reduce(
          (s, c) => s + c.variantes.reduce((t, v) => t + contar(v.arvore), 0),
          0
        )
      }
    };
    if (fundacao) {
      const ligadas = ligarAFundacao(plano, fundacao);
      if (ligadas)
        avisos.push(`${ligadas} vari\xE1veis dos componentes usam tokens da funda\xE7\xE3o (alias).`);
    }
    const todas = colecoes.flatMap((c) => c.variaveis);
    plano.resumo.variaveis = todas.length;
    plano.resumo.vinculadas = todas.filter((v) => v.vinculadaA.length > 0).length;
    plano.resumo.documentais = todas.filter((v) => v.origem === "documental").length;
    return plano;
  }

  // src/app/kcx/figma/construir/tipos.ts
  var CHAVE_PLUGIN = "kcx";
  function rgb2(c) {
    return { r: c.r, g: c.g, b: c.b };
  }
  async function variaveisLocais(figma2) {
    return figma2.variables.getLocalVariablesAsync ? await figma2.variables.getLocalVariablesAsync() : [];
  }

  // src/app/kcx/figma/construir/duplicados.ts
  async function detectarDuplicados(figma2, plano) {
    const colecoes = await figma2.variables.getLocalVariableCollectionsAsync();
    const vars = await variaveisLocais(figma2);
    const nomesCol = new Set(colecoes.map((c) => c.name));
    const existentes = [];
    for (const c of plano.colecoes) {
      const col = colecoes.find((x) => x.name === c.nome);
      if (!col) continue;
      for (const v of c.variaveis)
        if (vars.some((x) => x.name === v.nome && x.variableCollectionId === col.id))
          existentes.push(v.nome);
    }
    const componentes = [];
    const pagina = figma2.currentPage;
    const nos = pagina.findAllWithCriteria ? pagina.findAllWithCriteria({ types: ["COMPONENT_SET", "COMPONENT"] }) : [];
    for (const n of nos) {
      let id = "";
      try {
        id = n.getSharedPluginData(CHAVE_PLUGIN, "componente");
      } catch (e) {
      }
      if (id && plano.componentes.some((c) => c.id === id)) componentes.push(`${n.name} (${id})`);
    }
    return {
      colecoes: plano.colecoes.filter((c) => nomesCol.has(c.nome)).map((c) => c.nome),
      variaveis: existentes,
      componentes
    };
  }

  // src/app/kcx/figma/construir/prototipo.ts
  function gatilhoFigma(it) {
    var _a;
    switch (it.gatilho) {
      case "hover":
        return { type: "ON_HOVER" };
      case "pressionar":
        return { type: "ON_PRESS" };
      case "entrar":
        return { type: "MOUSE_ENTER", delay: 0 };
      case "sair":
        return { type: "MOUSE_LEAVE", delay: 0 };
      case "atraso":
        return { type: "AFTER_TIMEOUT", timeout: Math.max(0, ((_a = it.atraso) != null ? _a : 1e3) / 1e3) };
      case "arrastar":
        return { type: "ON_DRAG" };
      case "tecla":
        return { type: "ON_KEY_DOWN", device: "KEYBOARD", keyCodes: [codigoTecla(it.tecla)] };
      default:
        return { type: "ON_CLICK" };
    }
  }
  function codigoTecla(tecla = "Escape") {
    var _a;
    const mapa = {
      Escape: 27,
      Enter: 13,
      " ": 32,
      Espaco: 32,
      ArrowLeft: 37,
      ArrowUp: 38,
      ArrowRight: 39,
      ArrowDown: 40,
      Tab: 9
    };
    return (_a = mapa[tecla]) != null ? _a : tecla.length === 1 ? tecla.toUpperCase().charCodeAt(0) : 27;
  }
  function transicaoFigma(it, trocaDeVariante = true) {
    var _a;
    if (it.transicao === "instantanea") return null;
    const easing = it.curva === "linear" ? { type: "LINEAR" } : it.curva === "entrada-saida" ? { type: "EASE_IN_AND_OUT" } : it.curva === "mola" ? { type: "GENTLE" } : it.curva === "quique" ? { type: "BOUNCY" } : { type: "EASE_OUT" };
    const duration = it.duracao / 1e3;
    if ((it.transicao === "mover" || it.transicao === "empurrar") && !trocaDeVariante) {
      const dir = { esquerda: "LEFT", direita: "RIGHT", cima: "TOP", baixo: "BOTTOM" }[(_a = it.direcao) != null ? _a : "esquerda"];
      return {
        type: it.transicao === "mover" ? "MOVE_IN" : "PUSH",
        direction: dir,
        matchLayers: false,
        easing,
        duration
      };
    }
    return { type: it.transicao === "dissolver" ? "DISSOLVE" : "SMART_ANIMATE", easing, duration };
  }

  // src/app/kcx/figma/construir/base-variaveis.ts
  var BaseVariaveis = class {
    constructor(figma2, plano, pacoteJson, duplicados) {
      __publicField(this, "figma", figma2);
      __publicField(this, "plano", plano);
      __publicField(this, "pacoteJson", pacoteJson);
      __publicField(this, "duplicados", duplicados);
      /** Coleções criadas (nome → id e modos), para a ação de trocar modo. */
      __publicField(this, "colecoesFigma", /* @__PURE__ */ new Map());
      __publicField(this, "vars", /* @__PURE__ */ new Map());
      __publicField(this, "rel", {
        colecoes: [],
        variaveisCriadas: [],
        variaveisAtualizadas: [],
        vinculos: 0,
        vinculosFalhos: [],
        componentes: [],
        pecas: [],
        propriedades: [],
        exemplos: [],
        interacoes: [],
        avisos: []
      });
      __publicField(this, "fontePadrao", { family: "Inter", style: "Regular" });
      __publicField(this, "fontesOk", /* @__PURE__ */ new Set());
      /** Estilos de texto da fundação já criados (nome → estilo). */
      __publicField(this, "estilosTexto", /* @__PURE__ */ new Map());
      /** Textos que recebem um estilo da fundação depois de montados. */
      __publicField(this, "textosComEstilo", []);
    }
    /** Estilos de texto e de sombra da fundação (atualiza os que já existem pelo nome). */
    async criarEstilos() {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      const fund = this.plano.fundacao;
      const f = this.figma;
      if (!fund || typeof f.createTextStyle !== "function") return;
      const textos = (_b = await ((_a = f.getLocalTextStylesAsync) == null ? void 0 : _a.call(f))) != null ? _b : [];
      const efeitos = (_d = await ((_c = f.getLocalEffectStylesAsync) == null ? void 0 : _c.call(f))) != null ? _d : [];
      const estilos = (_f = (_e = this.rel).estilos) != null ? _f : _e.estilos = [];
      for (const e of fund.estilosTexto) {
        let fonte = { family: e.familia, style: e.estilo };
        try {
          await f.loadFontAsync(fonte);
        } catch (e2) {
          this.rel.avisos.push(
            `Fonte ${e.familia} ${e.estilo} indispon\xEDvel no Figma; o estilo ${e.nome} usa Inter.`
          );
          fonte = { family: "Inter", style: e.estilo };
          try {
            await f.loadFontAsync(fonte);
          } catch (e3) {
            fonte = { family: "Inter", style: "Regular" };
            await f.loadFontAsync(fonte);
          }
        }
        const st = (_g = textos.find((t) => t.name === e.nome)) != null ? _g : f.createTextStyle();
        st.name = e.nome;
        st.description = e.descricao;
        st.fontName = fonte;
        st.fontSize = e.tamanho;
        st.lineHeight = { value: e.alturaLinha, unit: "PIXELS" };
        st.letterSpacing = { value: e.espacamento, unit: "PIXELS" };
        const v = this.vars.get(e.variavelTamanho);
        if (v)
          try {
            st.setBoundVariable("fontSize", v);
            this.rel.vinculos++;
          } catch (err) {
            this.rel.vinculosFalhos.push(`${e.nome} \u203A fontSize: ${err.message}`);
          }
        this.estilosTexto.set(e.nome, st);
        this.fontesOk.add(`${fonte.family}|${fonte.style}`);
        estilos.push(`${e.nome} (texto)`);
      }
      for (const e of fund.estilosSombra) {
        const st = (_h = efeitos.find((t) => t.name === e.nome)) != null ? _h : f.createEffectStyle();
        st.name = e.nome;
        st.description = e.descricao;
        st.effects = [
          {
            type: "DROP_SHADOW",
            color: e.sombra.cor,
            offset: { x: e.sombra.x, y: e.sombra.y },
            radius: e.sombra.raio,
            spread: e.sombra.espalhar,
            visible: true,
            blendMode: "NORMAL",
            showShadowBehindNode: false
          }
        ];
        estilos.push(`${e.nome} (sombra)`);
      }
    }
    /** Aplica os estilos de texto da fundação nos textos marcados pelo plano. */
    async aplicarEstilosTexto() {
      for (const { no, estilo } of this.textosComEstilo) {
        const st = this.estilosTexto.get(estilo);
        if (!st) continue;
        try {
          if (typeof no.setTextStyleIdAsync === "function") await no.setTextStyleIdAsync(st.id);
          else no.textStyleId = st.id;
        } catch (err) {
          this.rel.avisos.push(
            `Estilo ${estilo} n\xE3o aplicado em "${no.name}": ${err.message}`
          );
        }
      }
    }
    /* ------------------------------ Variáveis ------------------------------ */
    async criarVariaveis() {
      var _a, _b, _c;
      const f = this.figma;
      const colecoes = await f.variables.getLocalVariableCollectionsAsync();
      const existentes = await variaveisLocais(f);
      const pendentesAlias = [];
      for (const c of this.plano.colecoes) {
        let col = colecoes.find((x) => x.name === c.nome);
        const criada = !col;
        if (!col) col = f.variables.createVariableCollection(c.nome);
        const modoIds = {};
        const unicoEmExistente = !criada && c.modos.length === 1 && !col.modes.some((x) => x.name === c.modos[0]);
        if (unicoEmExistente) modoIds[c.modos[0]] = col.modes[0].modeId;
        else
          c.modos.forEach((m, i) => {
            const achado = col.modes.find((x) => x.name === m);
            if (achado) modoIds[m] = achado.modeId;
            else if (i === 0 && criada) {
              col.renameMode(col.modes[0].modeId, m);
              modoIds[m] = col.modes[0].modeId;
            } else {
              try {
                modoIds[m] = col.addMode(m);
              } catch (e) {
                this.rel.avisos.push(
                  `Modo "${m}" n\xE3o foi criado em ${c.nome} (o plano do Figma limita a quantidade de modos). Usado s\xF3 o primeiro modo.`
                );
              }
            }
          });
        const descobertos = col.modes.map((x) => x.modeId).filter((id) => !Object.values(modoIds).includes(id));
        this.rel.colecoes.push({ nome: c.nome, criada, modos: Object.keys(modoIds) });
        this.colecoesFigma.set(c.nome, { id: col.id, modos: modoIds });
        for (const pv of c.variaveis) {
          let v = existentes.find(
            (x) => x.name === pv.nome && x.variableCollectionId === col.id
          );
          let nome = pv.nome;
          if (v && this.duplicados === "copia") {
            let i = 2;
            while (existentes.some(
              (x) => x.name === `${pv.nome} ${i}` && x.variableCollectionId === col.id
            ))
              i++;
            nome = `${pv.nome} ${i}`;
            v = void 0;
          }
          let tipo = pv.tipo;
          if (v) this.rel.variaveisAtualizadas.push(nome);
          else {
            try {
              v = f.variables.createVariable(nome, col, tipo);
            } catch (e) {
              tipo = tipo === "TIMING" ? "FLOAT" : "STRING";
              v = f.variables.createVariable(nome, col, tipo);
              this.rel.avisos.push(`${nome}: tipo ${pv.tipo} indispon\xEDvel; criada como ${tipo}.`);
            }
            this.rel.variaveisCriadas.push(nome);
          }
          v.description = pv.descricao;
          if (["COLOR", "FLOAT", "STRING"].includes((_a = v.resolvedType) != null ? _a : tipo)) {
            try {
              v.scopes = pv.vinculadaA.length || pv.origem === "compartilhada" ? pv.escopos : [];
            } catch (e) {
            }
          }
          if (pv.codigoWeb) {
            try {
              v.setVariableCodeSyntax("WEB", pv.codigoWeb);
            } catch (e) {
            }
          }
          try {
            v.setSharedPluginData(
              CHAVE_PLUGIN,
              "variavel",
              JSON.stringify({ kcx: pv.variavelKcx, origem: pv.origem, nome: pv.nome })
            );
          } catch (e) {
          }
          const entradas = Object.entries(pv.valores);
          for (const [i, [modo, valor]] of entradas.entries()) {
            const id = (_b = modoIds[modo]) != null ? _b : Object.values(modoIds)[0];
            if (!id) continue;
            const ids = i === 0 ? [id, ...descobertos] : [id];
            for (const alvoModo of ids) {
              if (valor && typeof valor === "object" && "alias" in valor)
                pendentesAlias.push({ variavel: v, modo: alvoModo, alvo: valor.alias });
              else
                v.setValueForMode(
                  alvoModo,
                  this.valorParaFigma(__spreadProps(__spreadValues({}, pv), { tipo: (_c = v.resolvedType) != null ? _c : tipo }), valor)
                );
            }
          }
          this.vars.set(pv.nome, v);
        }
      }
      for (const p of pendentesAlias) {
        const alvo = this.vars.get(p.alvo);
        if (alvo) p.variavel.setValueForMode(p.modo, f.variables.createVariableAlias(alvo));
      }
    }
    valorParaFigma(pv, valor) {
      if ((pv.tipo === "COLOR" || pv.tipo === "EASING") && typeof valor === "object") return valor;
      if (pv.tipo === "FLOAT" || pv.tipo === "TIMING") return Number(valor);
      if (pv.tipo === "BOOLEAN") return valor === true || valor === "true";
      return typeof valor === "object" ? JSON.stringify(valor) : String(valor);
    }
    /* ------------------------------ Vínculos ------------------------------ */
    variavel(prop) {
      var _a;
      if (!(prop == null ? void 0 : prop.variavel) || this.plano.modo === "visual") return null;
      return (_a = this.vars.get(prop.variavel)) != null ? _a : null;
    }
    vincular(no, campo, prop, onde) {
      const v = this.variavel(prop);
      if (!v) return;
      try {
        no.setBoundVariable(campo, v);
        this.rel.vinculos++;
      } catch (e) {
        this.rel.vinculosFalhos.push(`${onde} \u203A ${campo}: ${e.message}`);
      }
    }
    /** Campos de texto: tenta o nó inteiro e, se o Figma recusar, o intervalo do texto. */
    vincularTexto(no, campo, prop, onde) {
      const v = this.variavel(prop);
      if (!v) return;
      try {
        no.setBoundVariable(campo, v);
        this.rel.vinculos++;
      } catch (e) {
        try {
          no.setRangeBoundVariable(0, no.characters.length, campo, v);
          this.rel.vinculos++;
        } catch (e2) {
          this.rel.vinculosFalhos.push(`${onde} \u203A ${campo}: ${e2.message}`);
        }
      }
    }
    pintura(p, onde) {
      var _a;
      const f = this.figma;
      if (p.tipo === "imagem") {
        try {
          const b64 = p.src.slice(p.src.indexOf(",") + 1);
          const img = f.createImage(f.base64Decode(b64));
          return { type: "IMAGE", imageHash: img.hash, scaleMode: p.ajuste, visible: true };
        } catch (e) {
          this.rel.avisos.push(`${onde}: imagem n\xE3o importada (${e.message}).`);
          return { type: "SOLID", color: { r: 0.54, g: 0.52, b: 0.66 }, visible: true };
        }
      }
      if (p.tipo === "solido") {
        let paint = {
          type: "SOLID",
          color: rgb2(p.cor.valor),
          opacity: p.cor.valor.a,
          visible: true
        };
        const v = this.variavel(p.cor);
        if (v) {
          try {
            paint = f.variables.setBoundVariableForPaint(paint, "color", v);
            this.rel.vinculos++;
          } catch (e) {
            this.rel.vinculosFalhos.push(`${onde} \u203A preenchimento: ${e.message}`);
          }
        }
        return paint;
      }
      return {
        type: (_a = p.subtipo) != null ? _a : "GRADIENT_LINEAR",
        gradientTransform: p.transformacao,
        visible: true,
        gradientStops: p.paradas.map((s) => {
          const v = this.variavel(s.cor);
          const stop = { position: s.posicao, color: s.cor.valor };
          if (v) {
            stop.boundVariables = { color: f.variables.createVariableAlias(v) };
            this.rel.vinculos++;
          }
          return stop;
        })
      };
    }
    efeitos(no, p, onde) {
      const f = this.figma;
      if (!p.efeitos.length) return;
      no.effects = p.efeitos.map((ef) => {
        let e;
        if (ef.tipo === "DROP_SHADOW") {
          e = {
            type: "DROP_SHADOW",
            color: ef.cor.valor,
            offset: { x: ef.x, y: ef.y },
            radius: Number(ef.raio.valor),
            spread: Number(ef.espalhar.valor),
            visible: true,
            blendMode: "NORMAL",
            showShadowBehindNode: false
          };
          for (const [campo, prop] of [
            ["radius", ef.raio],
            ["color", ef.cor],
            ["spread", ef.espalhar]
          ]) {
            const v = this.variavel(prop);
            if (!v) continue;
            try {
              e = f.variables.setBoundVariableForEffect(e, campo, v);
              this.rel.vinculos++;
            } catch (err) {
              this.rel.vinculosFalhos.push(`${onde} \u203A sombra.${campo}: ${err.message}`);
            }
          }
        } else {
          e = { type: ef.tipo, blurType: "NORMAL", radius: Number(ef.raio.valor), visible: true };
          const v = this.variavel(ef.raio);
          if (v) {
            try {
              e = f.variables.setBoundVariableForEffect(e, "radius", v);
              this.rel.vinculos++;
            } catch (err) {
              this.rel.vinculosFalhos.push(`${onde} \u203A desfoque: ${err.message}`);
            }
          }
        }
        return e;
      });
    }
    /* ------------------------------ Fontes ------------------------------ */
    async carregarFontes() {
      const fontes = /* @__PURE__ */ new Map();
      const visitar = (n) => {
        if (n.texto)
          fontes.set(`${n.texto.familia}|${n.texto.estilo}`, {
            family: n.texto.familia,
            style: n.texto.estilo
          });
        n.filhos.forEach(visitar);
      };
      this.plano.componentes.forEach((c) => c.variantes.forEach((v) => visitar(v.arvore)));
      fontes.set("Inter|Regular", this.fontePadrao);
      fontes.set("Inter|Bold", { family: "Inter", style: "Bold" });
      for (const [k, fonte] of fontes) {
        try {
          await this.figma.loadFontAsync(fonte);
          this.fontesOk.add(k);
        } catch (e) {
          this.rel.avisos.push(
            `Fonte ${fonte.family} ${fonte.style} indispon\xEDvel; usada Inter Regular.`
          );
        }
      }
    }
    fonte(familia, estilo) {
      return this.fontesOk.has(`${familia}|${estilo}`) ? { family: familia, style: estilo } : this.fontePadrao;
    }
  };

  // src/app/kcx/figma/construir/base-nos.ts
  var BaseNos = class extends BaseVariaveis {
    constructor() {
      super(...arguments);
      /** Nós de cada variante (para ligar as interações do protótipo). */
      __publicField(this, "nosPorVariante", /* @__PURE__ */ new Map());
      /* ------------------------------ Camadas ------------------------------ */
      /** Componentes das peças reutilizáveis já criados: "peça|variante" → componente. */
      __publicField(this, "pecas", /* @__PURE__ */ new Map());
      /** Componentes principais já criados (id KCX → componente ou conjunto). */
      __publicField(this, "principais", /* @__PURE__ */ new Map());
      /** Componentes da biblioteca de ícones (nome → componente). */
      __publicField(this, "icones", /* @__PURE__ */ new Map());
    }
    /** Aplica traço (cor/espessura vinculadas) aos vetores de um SVG importado. */
    tracarVetores(vetores, traco, onde) {
      for (const vet of vetores) {
        vet.strokes = [this.pintura({ tipo: "solido", cor: traco.cor }, onde)];
        vet.strokeWeight = Number(traco.espessura.valor);
        this.vincular(vet, "strokeWeight", traco.espessura, onde);
        vet.strokeCap = "ROUND";
        vet.strokeJoin = "ROUND";
        vet.fills = [];
        try {
          vet.constraints = { horizontal: "SCALE", vertical: "SCALE" };
        } catch (e) {
        }
      }
    }
    /**
     * Biblioteca "KCX · Ícones": um componente por ícone ("KCX Ícone/<nome>"),
     * 24 × 24, traço de 2 px. Reaproveita a biblioteca que já estiver na página.
     */
    construirIcones(x, y) {
      const lista = this.plano.icones;
      if (!lista) return null;
      const f = this.figma;
      const existentes = (() => {
        try {
          return f.currentPage.findAll(
            (n) => n.type === "COMPONENT" && /^KCX Ícone\//.test(n.name)
          );
        } catch (e) {
          return [];
        }
      })();
      for (const e of existentes) this.icones.set(e.name.replace(/^KCX Ícone\//, ""), e);
      const faltam = Object.keys(lista).filter((n) => !this.icones.has(n));
      if (!faltam.length) return null;
      const quadro = f.createFrame();
      quadro.name = "KCX \xB7 \xCDcones";
      quadro.layoutMode = "HORIZONTAL";
      quadro.layoutWrap = "WRAP";
      quadro.itemSpacing = 16;
      quadro.counterAxisSpacing = 16;
      quadro.paddingLeft = quadro.paddingRight = quadro.paddingTop = quadro.paddingBottom = 24;
      quadro.primaryAxisSizingMode = "FIXED";
      quadro.counterAxisSizingMode = "AUTO";
      quadro.resize(24 * 8 + 16 * 7 + 48, 100);
      quadro.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
      quadro.cornerRadius = 12;
      for (const nome of faltam) {
        const svg = f.createNodeFromSvg(
          `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="${lista[nome]}" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
        );
        const comp = f.createComponent();
        comp.name = `KCX \xCDcone/${nome}`;
        comp.resize(24, 24);
        comp.fills = [];
        comp.clipsContent = false;
        const vetores = svg.findAll ? svg.findAll((n) => n.type === "VECTOR") : [];
        for (const v of vetores) {
          const vx = v.absoluteTransform ? v.absoluteTransform[0][2] - svg.x : v.x;
          const vy = v.absoluteTransform ? v.absoluteTransform[1][2] - svg.y : v.y;
          comp.appendChild(v);
          v.x = vx;
          v.y = vy;
          v.name = "Tra\xE7o";
        }
        svg.remove();
        this.tracarVetores(
          vetores,
          { cor: { valor: { r: 0, g: 0, b: 0, a: 1 } }, espessura: { valor: 2 } },
          `\xCDcone ${nome}`
        );
        comp.description = `\xCDcone da biblioteca KCX. Troque nos componentes pela propriedade de \xEDcone (Instance swap).`;
        quadro.appendChild(comp);
        this.icones.set(nome, comp);
      }
      quadro.x = x;
      quadro.y = y;
      f.currentPage.appendChild(quadro);
      this.rel.pecas.push({ nome: quadro.name, id: quadro.id, variantes: faltam.length });
      return quadro;
    }
    /**
     * Peças reutilizáveis: um componente com uma variante por opção (ex.:
     * "SVG Motion · Caminho", Forma=onda/laço/zigue-zague). As variantes do
     * componente principal usam instâncias dela: editar o desenho na peça
     * atualiza todas as variantes.
     */
    construirPecas(c, x, y) {
      const f = this.figma;
      let ultimo = null;
      let cursorY = y;
      for (const peca of c.pecas) {
        const comps = [];
        for (const op of peca.opcoes) {
          const svg = f.createNodeFromSvg(op.svg);
          const comp = f.createComponent();
          comp.name = c.pecas.length && peca.opcoes.length > 1 ? `Forma=${op.rotulo}` : `${c.nome} \xB7 ${peca.nome}`;
          comp.resize(Math.max(1, svg.width), Math.max(1, svg.height));
          comp.fills = [];
          comp.clipsContent = false;
          const vetores = svg.findAll ? svg.findAll((n) => n.type === "VECTOR") : [];
          for (const v of vetores) {
            const vx = v.absoluteTransform ? v.absoluteTransform[0][2] - svg.x : v.x;
            const vy = v.absoluteTransform ? v.absoluteTransform[1][2] - svg.y : v.y;
            comp.appendChild(v);
            v.x = vx;
            v.y = vy;
          }
          svg.remove();
          this.tracarVetores(vetores, op.traco, `${c.nome} \u203A ${peca.nome} \u203A ${op.rotulo}`);
          comps.push(comp);
          this.pecas.set(`${peca.nome}|${op.rotulo}`, comp);
        }
        let raiz;
        if (comps.length > 1) {
          raiz = f.combineAsVariants(comps, f.currentPage);
          semTracejado(raiz);
          comps.forEach((k, i) => {
            k.x = 20;
            k.y = 20 + i * (k.height + 40);
          });
          raiz.layoutMode = "NONE";
          try {
            raiz.resizeWithoutConstraints(
              Math.max(...comps.map((k) => k.width)) + 40,
              comps.reduce((s, k) => s + k.height + 40, 0) + 20
            );
          } catch (e) {
          }
        } else {
          raiz = comps[0];
          f.currentPage.appendChild(raiz);
        }
        raiz.name = `${c.nome} \xB7 ${peca.nome}`;
        raiz.description = `Pe\xE7a reutiliz\xE1vel de ${c.nome}. Edite o desenho aqui: todas as variantes de ${c.nome} usam inst\xE2ncias desta pe\xE7a.`;
        raiz.x = x;
        raiz.y = cursorY;
        cursorY += raiz.height + 60;
        this.rel.pecas.push({ nome: raiz.name, id: raiz.id, variantes: comps.length });
        ultimo = raiz;
      }
      return ultimo;
    }
    construirNo(p, alvo, paiAutoLayout, onde, refs) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
      const f = this.figma;
      let no;
      const local = `${onde} \u203A ${p.nome}`;
      const pecaComp = p.peca ? this.pecas.get(`${p.peca.nome}|${p.peca.variante}`) : void 0;
      const iconeComp = p.tipo === "icone" && p.icone ? this.icones.get(p.icone.nome) : void 0;
      const principalInst = p.tipo === "instancia" && p.instancia ? this.principais.get(p.instancia.componente) : void 0;
      if (p.tipo === "instancia" && p.instancia && principalInst) {
        const variante = principalInst.type === "COMPONENT_SET" ? (_a = principalInst.children.find((c) => c.name === p.instancia.variante)) != null ? _a : principalInst.defaultVariant : principalInst;
        no = variante.createInstance();
        const props = (_b = no.componentProperties) != null ? _b : {};
        const novos = {};
        for (const [nome, valor] of Object.entries(p.instancia.textos)) {
          const chave = Object.keys(props).find((k) => k === nome || k.startsWith(`${nome}#`));
          if (chave) novos[chave] = valor;
        }
        if (Object.keys(novos).length) {
          try {
            no.setProperties(novos);
          } catch (e) {
            this.rel.avisos.push(`${local}: textos da inst\xE2ncia: ${e.message}`);
          }
        }
      } else if (p.tipo === "instancia") {
        no = f.createFrame();
        no.fills = [];
        this.rel.avisos.push(`${local}: componente "${(_c = p.instancia) == null ? void 0 : _c.componente}" n\xE3o encontrado.`);
      } else if (p.slot && refs.raiz && typeof refs.raiz.createSlot === "function") {
        no = refs.raiz.createSlot();
        no.fills = [];
        ((_d = refs.slots) != null ? _d : refs.slots = []).push(p.slot);
      } else if (p.tipo === "icone" && p.icone && iconeComp) {
        no = iconeComp.createInstance();
        const t = p.icone.tamanho;
        try {
          no.resize(t, t);
        } catch (e) {
        }
        const vetores = no.findAll ? no.findAll((x) => x.type === "VECTOR") : [];
        for (const v of vetores) {
          v.strokes = [this.pintura({ tipo: "solido", cor: p.icone.cor }, local)];
        }
        if (p.icone.propriedade)
          ((_e = refs.icone) != null ? _e : refs.icone = []).push({ no, prop: p.icone.propriedade, plano: p });
      } else if (p.tipo === "icone") {
        no = f.createFrame();
        no.fills = [];
        no.resize((_g = (_f = p.icone) == null ? void 0 : _f.tamanho) != null ? _g : 20, (_i = (_h = p.icone) == null ? void 0 : _h.tamanho) != null ? _i : 20);
        this.rel.avisos.push(`${local}: \xEDcone "${(_j = p.icone) == null ? void 0 : _j.nome}" fora da biblioteca.`);
      } else if (p.tipo === "svg" && pecaComp) {
        no = pecaComp.createInstance();
        if ((_l = (_k = p.svgTraco) == null ? void 0 : _k.tracejado) == null ? void 0 : _l.length) {
          for (const v of no.findAll((x) => x.type === "VECTOR"))
            v.dashPattern = p.svgTraco.tracejado;
        }
      } else if (p.tipo === "svg") {
        no = f.createNodeFromSvg((_m = p.svg) != null ? _m : '<svg xmlns="http://www.w3.org/2000/svg"/>');
        no.fills = [];
        const vetores = no.findAll ? no.findAll((x) => x.type === "VECTOR") : [];
        if (p.svgTraco) {
          this.tracarVetores(vetores, p.svgTraco, local);
          if ((_n = p.svgTraco.tracejado) == null ? void 0 : _n.length)
            for (const v of vetores) v.dashPattern = p.svgTraco.tracejado;
        }
      } else if (p.tipo === "texto" && p.texto) {
        no = f.createText();
        no.fontName = this.fonte(p.texto.familia, p.texto.estilo);
        no.characters = String(p.texto.conteudo.valor);
        no.fontSize = Number(p.texto.tamanho.valor);
        if (p.texto.espacamento)
          no.letterSpacing = { value: Number(p.texto.espacamento.valor), unit: "PIXELS" };
        if (p.texto.caixaAlta) no.textCase = "UPPER";
        no.textAlignHorizontal = p.texto.alinhamento;
        no.textAutoResize = "WIDTH_AND_HEIGHT";
        if (!p.texto.propriedade) this.vincular(no, "characters", p.texto.conteudo, local);
        this.vincularTexto(no, "fontSize", p.texto.tamanho, local);
        if (p.texto.espacamento) this.vincularTexto(no, "letterSpacing", p.texto.espacamento, local);
        if (p.texto.propriedade) refs.texto.push({ no, prop: p.texto.propriedade, plano: p });
        if (p.texto.estiloTexto) this.textosComEstilo.push({ no, estilo: p.texto.estiloTexto });
      } else if (p.tipo === "elipse") {
        no = f.createEllipse();
      } else if (p.tipo === "retangulo") {
        no = f.createRectangle();
      } else {
        no = alvo != null ? alvo : f.createFrame();
        no.fills = [];
        no.clipsContent = p.recortar;
      }
      no.name = p.nome;
      if (p.id) (_o = refs.nos) == null ? void 0 : _o.set(p.id, no);
      if (p.grade) {
        try {
          no.layoutMode = "GRID";
          no.gridColumnCount = p.grade.colunas;
          no.gridRowCount = p.grade.linhas;
          no.gridColumnGap = no.gridRowGap = Number(p.grade.espaco.valor);
          this.vincular(no, "gridColumnGap", p.grade.espaco, local);
          this.vincular(no, "gridRowGap", p.grade.espaco, local);
        } catch (e) {
          no.layoutMode = "HORIZONTAL";
          no.layoutWrap = "WRAP";
          no.itemSpacing = no.counterAxisSpacing = Number(p.grade.espaco.valor);
        }
        no.primaryAxisSizingMode = "AUTO";
        no.counterAxisSizingMode = "AUTO";
      }
      if (p.tipo === "frame" && p.autoLayout) {
        no.layoutMode = p.autoLayout.direcao;
        no.primaryAxisAlignItems = p.autoLayout.distribuir ? "SPACE_BETWEEN" : "CENTER";
        no.counterAxisAlignItems = (_p = p.autoLayout.alinhar) != null ? _p : "CENTER";
        no.itemSpacing = Number(p.autoLayout.espaco.valor);
        no.paddingLeft = no.paddingRight = Number(p.autoLayout.paddingX.valor);
        no.paddingTop = no.paddingBottom = Number(p.autoLayout.paddingY.valor);
        this.vincular(no, "itemSpacing", p.autoLayout.espaco, local);
        const lados = (_q = p.autoLayout.lados) != null ? _q : {};
        const porLado = [
          ["paddingLeft", (_r = lados.esquerda) != null ? _r : p.autoLayout.paddingX],
          ["paddingRight", (_s = lados.direita) != null ? _s : p.autoLayout.paddingX],
          ["paddingTop", (_t = lados.cima) != null ? _t : p.autoLayout.paddingY],
          ["paddingBottom", (_u = lados.baixo) != null ? _u : p.autoLayout.paddingY]
        ];
        for (const [campo, prop] of porLado) {
          no[campo] = Number(prop.valor);
          this.vincular(no, campo, prop, local);
        }
        if (p.autoLayout.quebrar) {
          try {
            no.layoutWrap = "WRAP";
            no.counterAxisSpacing = Number(p.autoLayout.espaco.valor);
            this.vincular(no, "counterAxisSpacing", p.autoLayout.espaco, local);
          } catch (e) {
          }
        }
        const hor = p.autoLayout.direcao === "HORIZONTAL";
        const principal = hor ? p.largura : p.altura;
        const cruzado = hor ? p.altura : p.largura;
        no.primaryAxisSizingMode = principal !== void 0 ? "FIXED" : "AUTO";
        no.counterAxisSizingMode = cruzado !== void 0 ? "FIXED" : "AUTO";
      }
      if ((p.largura || p.altura) && p.tipo !== "texto") {
        const auto = p.tipo === "frame" && p.autoLayout;
        if (p.largura && p.altura)
          no.resize(Math.max(0.01, Number(p.largura.valor)), Math.max(0.01, Number(p.altura.valor)));
        else if (p.largura && auto)
          no.resize(Math.max(0.01, Number(p.largura.valor)), Math.max(0.01, no.height));
        else if (p.altura && auto)
          no.resize(Math.max(0.01, no.width), Math.max(0.01, Number(p.altura.valor)));
        if (auto && !(p.largura && p.altura)) {
          const hor = p.autoLayout.direcao === "HORIZONTAL";
          const cresceNoPrincipal = p.largura ? !hor : hor;
          if (cresceNoPrincipal) no.primaryAxisSizingMode = "AUTO";
          else no.counterAxisSizingMode = "AUTO";
        }
        if (p.largura) this.vincular(no, "width", p.largura, local);
        if (p.altura) this.vincular(no, "height", p.altura, local);
      }
      for (const [campo, prop] of [
        ["minWidth", p.larguraMin],
        ["maxWidth", p.larguraMax]
      ]) {
        if (!prop) continue;
        try {
          no[campo] = Number(prop.valor);
          this.vincular(no, campo, prop, local);
        } catch (e) {
          this.rel.avisos.push(`${local}: ${campo} s\xF3 vale em Auto Layout.`);
        }
      }
      if (!paiAutoLayout || p.absoluto) {
        if (p.x !== void 0) no.x = p.x;
        if (p.y !== void 0) no.y = p.y;
      }
      if (p.rotacao) no.rotation = p.rotacao;
      if (p.arco && p.tipo === "elipse") {
        no.arcData = {
          startingAngle: p.arco.inicio,
          endingAngle: p.arco.fim,
          innerRadius: p.arco.interno
        };
      }
      if (p.opacidade) {
        no.opacity = Math.min(1, Math.max(0, Number(p.opacidade.valor)));
        this.vincular(no, "opacity", p.opacidade, local);
      }
      if (p.visivel) {
        no.visible = p.visivel.valor !== false;
        if (!p.propriedadeVisivel) this.vincular(no, "visible", p.visivel, local);
      }
      if (p.propriedadeVisivel) refs.visivel.push({ no, prop: p.propriedadeVisivel, plano: p });
      if (p.raio && "cornerRadius" in no) {
        no.cornerRadius = Number(p.raio.valor);
        for (const canto of [
          "topLeftRadius",
          "topRightRadius",
          "bottomLeftRadius",
          "bottomRightRadius"
        ])
          this.vincular(no, canto, p.raio, local);
      }
      if (p.preenchimentos.length && p.tipo !== "svg")
        no.fills = p.preenchimentos.map((x) => this.pintura(x, local));
      if (p.traco) {
        no.strokes = [this.pintura(p.traco.pintura, local)];
        no.strokeWeight = Number(p.traco.espessura.valor);
        no.strokeAlign = "INSIDE";
        this.vincular(no, "strokeWeight", p.traco.espessura, local);
      }
      this.efeitos(no, p, local);
      const absolutos = [];
      for (const filho of p.filhos) {
        const n = this.construirNo(filho, null, !!p.autoLayout || !!p.grade, local, refs);
        no.appendChild(n);
        if (p.autoLayout && filho.absoluto) {
          n.layoutPositioning = "ABSOLUTE";
          absolutos.push({ no: n, plano: filho });
        } else if (p.autoLayout && ((_v = filho.texto) == null ? void 0 : _v.preencher)) {
          n.layoutSizingHorizontal = "FILL";
          n.textAutoResize = "HEIGHT";
        } else if (p.autoLayout && filho.encher) {
          try {
            n.layoutSizingHorizontal = "FILL";
          } catch (e) {
          }
        }
        if (filho.restricoes) {
          try {
            n.constraints = filho.restricoes;
          } catch (e) {
          }
        }
      }
      for (const a of absolutos) {
        if (((_w = a.plano.restricoes) == null ? void 0 : _w.horizontal) === "STRETCH") {
          a.no.x = 0;
          a.no.resize(Math.max(0.01, no.width), a.no.height);
        }
        if (((_x = a.plano.restricoes) == null ? void 0 : _x.vertical) === "STRETCH") {
          a.no.y = 0;
          a.no.resize(a.no.width, Math.max(0.01, no.height));
        }
      }
      return no;
    }
    /** Cria as propriedades de componente (texto e visibilidade) e liga as camadas a elas. */
    propriedades(principal, refsPorVariante) {
      var _a, _b, _c, _d, _e;
      const f = this.figma;
      const tipos = [
        { lista: "texto", tipo: "TEXT", campo: "characters" },
        { lista: "visivel", tipo: "BOOLEAN", campo: "visible" }
      ];
      for (const t of tipos) {
        const nomes = new Set(refsPorVariante.flatMap((r) => r[t.lista].map((x) => x.prop)));
        for (const nome of nomes) {
          const ref = refsPorVariante.flatMap((r) => r[t.lista]).find((r) => r.prop === nome);
          const prop = t.tipo === "TEXT" ? ref.plano.texto.conteudo : ref.plano.visivel;
          const literal2 = t.tipo === "TEXT" ? String((_a = prop == null ? void 0 : prop.valor) != null ? _a : "") : prop ? prop.valor !== false : true;
          const v = this.variavel(prop);
          let chave;
          try {
            chave = principal.addComponentProperty(
              nome,
              t.tipo,
              v ? f.variables.createVariableAlias(v) : literal2
            );
          } catch (e) {
            chave = principal.addComponentProperty(nome, t.tipo, literal2);
            this.rel.avisos.push(
              `Propriedade "${nome}": o padr\xE3o n\xE3o p\xF4de ser ligado \xE0 vari\xE1vel; ficou com o valor atual.`
            );
          }
          for (const refs of refsPorVariante) {
            for (const r of refs[t.lista].filter((x) => x.prop === nome)) {
              try {
                r.no.componentPropertyReferences = __spreadProps(__spreadValues({}, (_b = r.no.componentPropertyReferences) != null ? _b : {}), {
                  [t.campo]: chave
                });
              } catch (e) {
                this.rel.avisos.push(`Propriedade "${nome}": ${e.message}`);
              }
            }
          }
          this.rel.propriedades.push(`${nome} (${t.tipo === "TEXT" ? "texto" : "mostrar/ocultar"})`);
        }
      }
      const nomesSlot = new Set(refsPorVariante.flatMap((r) => {
        var _a2;
        return (_a2 = r.slots) != null ? _a2 : [];
      }));
      if (nomesSlot.size) {
        const defs = (_c = principal.componentPropertyDefinitions) != null ? _c : {};
        const chaves = Object.keys(defs).filter((k) => defs[k].type === "SLOT");
        const nome = [...nomesSlot][0];
        for (const k of chaves) {
          if (k.split("#")[0] === nome) continue;
          try {
            principal.editComponentProperty(k, { name: nome });
          } catch (e) {
          }
        }
        this.rel.propriedades.push(...[...nomesSlot].map((n) => `${n} (slot)`));
      }
      const nomesIcone = new Set(refsPorVariante.flatMap((r) => {
        var _a2;
        return ((_a2 = r.icone) != null ? _a2 : []).map((x) => x.prop);
      }));
      for (const nome of nomesIcone) {
        const ref = refsPorVariante.flatMap((r) => {
          var _a2;
          return (_a2 = r.icone) != null ? _a2 : [];
        }).find((r) => r.prop === nome);
        const padrao = this.icones.get(ref.plano.icone.nome);
        if (!padrao) continue;
        const sugeridos = [...this.icones.values()].filter((c) => c.key).map((c) => ({ type: "COMPONENT", key: c.key }));
        let chave;
        try {
          chave = principal.addComponentProperty(nome, "INSTANCE_SWAP", padrao.id, {
            preferredValues: sugeridos
          });
        } catch (e) {
          try {
            chave = principal.addComponentProperty(nome, "INSTANCE_SWAP", padrao.id);
          } catch (e2) {
            this.rel.avisos.push(`Propriedade "${nome}" (troca de \xEDcone): ${e2.message}`);
            continue;
          }
        }
        for (const refs of refsPorVariante) {
          for (const r of ((_d = refs.icone) != null ? _d : []).filter((x) => x.prop === nome)) {
            try {
              r.no.componentPropertyReferences = __spreadProps(__spreadValues({}, (_e = r.no.componentPropertyReferences) != null ? _e : {}), {
                mainComponent: chave
              });
            } catch (e) {
              this.rel.avisos.push(`Propriedade "${nome}": ${e.message}`);
            }
          }
        }
        this.rel.propriedades.push(`${nome} (troca de \xEDcone)`);
      }
    }
    construirComponente(c, x0, y0) {
      const f = this.figma;
      const variantes = [];
      const refsPorVariante = [];
      c.variantes.forEach((v) => {
        const comp = f.createComponent();
        const refs = { texto: [], visivel: [], nos: /* @__PURE__ */ new Map(), raiz: comp };
        this.construirNo(v.arvore, comp, false, c.nome, refs);
        comp.name = c.variantes.length > 1 ? v.nome : c.nome;
        variantes.push(comp);
        refsPorVariante.push(refs);
        this.nosPorVariante.set(`${c.id}|${v.nome}`, { variante: comp, nos: refs.nos });
      });
      let principal;
      if (variantes.length > 1) {
        principal = f.combineAsVariants(variantes, f.currentPage);
        principal.name = c.nome;
        semTracejado(principal);
        const larg = Math.max(...variantes.map((v) => v.width)) + 40;
        const alt = Math.max(...variantes.map((v) => v.height)) + 40;
        variantes.forEach((v, i) => {
          v.x = 20 + i % 3 * larg;
          v.y = 20 + Math.floor(i / 3) * alt;
        });
        principal.layoutMode = "NONE";
        try {
          principal.resizeWithoutConstraints(
            Math.min(3, variantes.length) * larg + 20,
            Math.ceil(variantes.length / 3) * alt + 20
          );
        } catch (e) {
        }
      } else {
        principal = variantes[0];
        f.currentPage.appendChild(principal);
      }
      principal.x = x0;
      principal.y = y0;
      principal.description = `${c.descricao}

KCX ${c.id} v${c.versao} \xB7 N\xEDvel ${c.nivel}.
Edit\xE1vel: ${c.editavel.join("; ")}.
Limita\xE7\xF5es: ${c.limitacoes.join(" ")}`;
      this.propriedades(principal, refsPorVariante);
      try {
        principal.setSharedPluginData(CHAVE_PLUGIN, "componente", c.id);
        principal.setSharedPluginData(CHAVE_PLUGIN, "versao", c.versao);
        principal.setSharedPluginData(CHAVE_PLUGIN, "pacote", this.pacoteJson);
      } catch (e) {
        this.rel.avisos.push(
          "N\xE3o foi poss\xEDvel guardar o pacote KCX no componente (pluginData indispon\xEDvel). O c\xF3digo continua no quadro de documenta\xE7\xE3o."
        );
      }
      this.rel.componentes.push({ nome: c.nome, id: principal.id, variantes: variantes.length });
      return principal;
    }
  };
  function semTracejado(conjunto) {
    try {
      conjunto.strokes = [];
      conjunto.dashPattern = [];
    } catch (e) {
    }
  }

  // src/app/kcx/figma/construir/construtor.ts
  var Construtor = class extends BaseNos {
    /** Interações do protótipo: clique/hover troca para outra variante (Smart Animate). */
    async criarInteracoes(c) {
      var _a, _b;
      if (!((_a = c.interacoes) == null ? void 0 : _a.length)) return;
      const porNo = /* @__PURE__ */ new Map();
      for (const it of c.interacoes) {
        const origem = this.nosPorVariante.get(`${c.id}|${it.variante}`);
        const destino = this.nosPorVariante.get(`${c.id}|${it.destino}`);
        const no = origem == null ? void 0 : origem.nos.get(it.no);
        if (!origem || !destino || !no) {
          this.rel.avisos.push(
            `Intera\xE7\xE3o "${it.no}" em ${it.variante}: camada ou variante n\xE3o encontrada.`
          );
          continue;
        }
        const lista = (_b = porNo.get(no)) != null ? _b : [];
        lista.push({
          trigger: gatilhoFigma(it),
          actions: [
            ...this.acoesExtras(c, it),
            {
              type: "NODE",
              destinationId: destino.variante.id,
              navigation: "CHANGE_TO",
              transition: transicaoFigma(it),
              preserveScrollPosition: false
            }
          ]
        });
        porNo.set(no, lista);
      }
      for (const [no, reactions] of porNo) {
        try {
          if (typeof no.setReactionsAsync === "function") await no.setReactionsAsync(reactions);
          else no.reactions = reactions;
          this.rel.interacoes.push(`${no.name}: ${reactions.length}`);
        } catch (e) {
          this.rel.avisos.push(`Intera\xE7\xE3o em "${no.name}" n\xE3o foi criada: ${e.message}`);
        }
      }
    }
    /** Ações extras de uma interação (trocar modo, alternar variável). */
    acoesExtras(c, it) {
      var _a, _b;
      const out = [];
      for (const a of (_a = it.acoes) != null ? _a : []) {
        if (a.tipo === "modo") {
          const col = this.colecoesFigma.get(a.colecao);
          const modo = col == null ? void 0 : col.modos[a.modo];
          if (col && modo)
            out.push({
              type: "SET_VARIABLE_MODE",
              variableCollectionId: col.id,
              variableModeId: modo
            });
          else this.rel.avisos.push(`${c.nome}: modo "${a.modo}" de ${a.colecao} n\xE3o existe.`);
        } else if (a.tipo === "alternar") {
          const v = (_b = [...this.vars.entries()].find(([n]) => n.endsWith(`/${a.variavel}`))) == null ? void 0 : _b[1];
          if (v)
            out.push({
              type: "SET_VARIABLE",
              variableId: v.id,
              variableValue: {
                resolvedType: "BOOLEAN",
                type: "EXPRESSION",
                value: {
                  expressionFunction: "NOT",
                  expressionArguments: [
                    {
                      resolvedType: "BOOLEAN",
                      type: "VARIABLE_ALIAS",
                      value: { type: "VARIABLE_ALIAS", id: v.id }
                    }
                  ]
                }
              }
            });
        }
      }
      return out;
    }
    /**
     * Protótipo de exemplo com overlay: uma tela com o componente fechado e um
     * frame com a variante aberta; clicar abre o overlay (centralizado) e o X fecha.
     */
    async construirPrototipo(c, principal, x, y) {
      var _a, _b, _c, _d;
      const o = (_a = c.prototipo) == null ? void 0 : _a.overlay;
      if (!o || principal.type !== "COMPONENT_SET") return null;
      const f = this.figma;
      const de = principal.children.find((v) => v.name === o.de);
      const ov = principal.children.find((v) => v.name === o.overlay);
      const noOrigem = (_b = this.nosPorVariante.get(`${c.id}|${o.de}`)) == null ? void 0 : _b.nos.get(o.no);
      if (!de || !ov || !noOrigem) return null;
      const tela = f.createFrame();
      tela.name = `${c.nome} \xB7 prot\xF3tipo (tela)`;
      tela.resize(Math.max(480, de.width + 80), Math.max(360, de.height + 80));
      tela.fills = [{ type: "SOLID", color: { r: 0.043, g: 0.039, b: 0.078 } }];
      const inst = de.createInstance();
      tela.appendChild(inst);
      inst.x = 40;
      inst.y = 40;
      const sobre = f.createFrame();
      sobre.name = `${c.nome} \xB7 overlay`;
      sobre.fills = [];
      const instOv = ov.createInstance();
      sobre.resize(instOv.width, instOv.height);
      sobre.appendChild(instOv);
      tela.x = x;
      tela.y = y;
      sobre.x = x + tela.width + 60;
      sobre.y = y;
      f.currentPage.appendChild(tela);
      f.currentPage.appendChild(sobre);
      const achar = (raiz, nome) => raiz.findOne ? raiz.findOne((n) => n.name === nome) : null;
      const gatilho = (_c = achar(inst, noOrigem.name)) != null ? _c : inst;
      try {
        await gatilho.setReactionsAsync([
          {
            trigger: { type: "ON_CLICK" },
            actions: [
              {
                type: "NODE",
                destinationId: sobre.id,
                navigation: "OVERLAY",
                transition: {
                  type: "MOVE_IN",
                  direction: "BOTTOM",
                  matchLayers: false,
                  easing: { type: "EASE_OUT" },
                  duration: 0.3
                },
                preserveScrollPosition: false
              }
            ]
          }
        ]);
        for (const id of o.fechar) {
          const n = (_d = this.nosPorVariante.get(`${c.id}|${o.overlay}`)) == null ? void 0 : _d.nos.get(id);
          const alvo = n ? achar(instOv, n.name) : null;
          if (alvo)
            await alvo.setReactionsAsync([
              { trigger: { type: "ON_CLICK" }, actions: [{ type: "CLOSE" }] }
            ]);
        }
        this.rel.interacoes.push(`${c.nome}: overlay no prot\xF3tipo`);
      } catch (e) {
        this.rel.avisos.push(`Prot\xF3tipo com overlay de ${c.nome}: ${e.message}`);
      }
      return [tela, sobre];
    }
    /** Instância do componente pronta para usar, ao lado da definição. */
    construirExemplo(c, principal, x, y) {
      const base = principal.type === "COMPONENT_SET" ? principal.defaultVariant : principal;
      const inst = base.createInstance();
      inst.name = `${c.nome} \u2014 inst\xE2ncia de exemplo`;
      this.figma.currentPage.appendChild(inst);
      inst.x = x;
      inst.y = y;
      this.rel.exemplos.push(inst.id);
      return inst;
    }
    /* ------------------------------ Documentação ------------------------------ */
    texto(conteudo, tamanho, estilo = "Regular", familia = "Inter", cor = { r: 0.96, g: 0.95, b: 1, a: 1 }) {
      const t = this.figma.createText();
      t.fontName = this.fonte(familia, estilo);
      t.characters = conteudo;
      t.fontSize = tamanho;
      t.fills = [{ type: "SOLID", color: rgb2(cor) }];
      t.layoutAlign = "STRETCH";
      t.textAutoResize = "HEIGHT";
      return t;
    }
    construirDocumentacao(c, x, y) {
      const f = this.figma;
      const quadro = f.createFrame();
      quadro.name = `KCX \xB7 ${c.nome} \xB7 documenta\xE7\xE3o`;
      quadro.layoutMode = "VERTICAL";
      quadro.itemSpacing = 12;
      quadro.paddingLeft = quadro.paddingRight = quadro.paddingTop = quadro.paddingBottom = 32;
      quadro.primaryAxisSizingMode = "AUTO";
      quadro.counterAxisSizingMode = "FIXED";
      quadro.resize(720, 100);
      quadro.cornerRadius = 16;
      quadro.fills = [{ type: "SOLID", color: { r: 0.043, g: 0.039, b: 0.078 } }];
      const docs = this.plano.colecoes.flatMap((col) => col.variaveis).filter((v) => v.nome.startsWith(`${c.id}/`) && !v.vinculadaA.length);
      const add = (n) => quadro.appendChild(n);
      add(this.texto(`${c.nome} \u2014 KCX v${c.versao}`, 28, "Bold"));
      add(
        this.texto(
          `N\xEDvel ${c.nivel} \xB7 ${c.nivel === 1 ? "nativo edit\xE1vel" : "parcialmente edit\xE1vel"} \xB7 pacote ${c.pacote}`,
          14
        )
      );
      add(this.texto(`Edit\xE1vel no Figma
\u2022 ${c.editavel.join("\n\u2022 ")}`, 14));
      if (c.parcial.length)
        add(this.texto(`Representado, mas n\xE3o executa
\u2022 ${c.parcial.join("\n\u2022 ")}`, 14));
      if (c.naoSuportado.length)
        add(this.texto(`S\xF3 no c\xF3digo
\u2022 ${c.naoSuportado.join("\n\u2022 ")}`, 14));
      add(this.texto(`Limita\xE7\xF5es
\u2022 ${c.limitacoes.join("\n\u2022 ")}`, 14));
      if (docs.length) {
        add(
          this.texto(
            `Vari\xE1veis documentais (n\xE3o controlam nada no Figma)
\u2022 ${docs.map((v) => v.nome).join("\n\u2022 ")}`,
            14
          )
        );
      }
      const mono = this.fontesOk.has("Roboto Mono|Regular") ? "Roboto Mono" : "Inter";
      for (const [rotulo, codigo] of [
        ["HTML", c.codigo.html],
        ["CSS", c.codigo.css],
        ["JS", c.codigo.js]
      ]) {
        add(this.texto(rotulo, 16, "Bold"));
        add(this.texto(codigo, 11, "Regular", mono, { r: 0.79, g: 0.76, b: 0.92, a: 1 }));
      }
      quadro.x = x;
      quadro.y = y;
      f.currentPage.appendChild(quadro);
      this.rel.documentacao = quadro.id;
      return quadro;
    }
    construirComposicao(principais, x, y) {
      var _a;
      const comp = this.plano.composicao;
      if (!comp) return;
      const f = this.figma;
      const quadro = f.createFrame();
      quadro.name = `KCX \xB7 ${comp.nome}`;
      quadro.fills = [{ type: "SOLID", color: { r: 0.043, g: 0.039, b: 0.078 } }];
      quadro.clipsContent = true;
      const instancias = comp.camadas.map((c) => {
        const p = principais.get(c.componente);
        const base = (p == null ? void 0 : p.type) === "COMPONENT_SET" ? p.defaultVariant : p;
        return base ? { papel: c.papel, inst: base.createInstance() } : null;
      }).filter((x2) => !!x2);
      const fundo = instancias.find((i) => i.papel === "fundo");
      const larg = Math.max(...instancias.map((i) => i.inst.width), 400);
      const alt = Math.max(
        (_a = fundo == null ? void 0 : fundo.inst.height) != null ? _a : 0,
        instancias.filter((i) => i.papel !== "fundo").reduce((s, i) => s + i.inst.height, 0) + 48
      );
      quadro.resize(larg, alt);
      let cursor = (alt - instancias.filter((i) => i.papel !== "fundo").reduce((s, i) => s + i.inst.height, 0)) / 2;
      for (const i of instancias) {
        quadro.appendChild(i.inst);
        if (i.papel === "fundo") {
          i.inst.x = 0;
          i.inst.y = 0;
        } else {
          i.inst.x = (larg - i.inst.width) / 2;
          i.inst.y = cursor;
          cursor += i.inst.height;
        }
      }
      quadro.x = x;
      quadro.y = y;
      f.currentPage.appendChild(quadro);
      this.rel.composicao = quadro.id;
    }
    async executar() {
      var _a, _b;
      if (this.plano.modo !== "visual") await this.criarVariaveis();
      if (this.plano.fundacao && this.plano.modo !== "visual") await this.criarEstilos();
      if (!this.plano.componentes.length) return this.rel;
      await this.carregarFontes();
      try {
        await this.figma.loadFontAsync({ family: "Roboto Mono", style: "Regular" });
        this.fontesOk.add("Roboto Mono|Regular");
      } catch (e) {
      }
      const origem = (_b = (_a = this.figma.viewport) == null ? void 0 : _a.center) != null ? _b : { x: 0, y: 0 };
      let y = Math.round(origem.y);
      const x = Math.round(origem.x);
      const principais = this.principais;
      const criados = [];
      const biblioteca = this.construirIcones(x - 600, y);
      if (biblioteca) criados.push(biblioteca);
      const ordem = [];
      const por = (c, pilha) => {
        var _a2;
        if (ordem.includes(c) || pilha.has(c.id)) return;
        pilha.add(c.id);
        for (const id of (_a2 = c.usa) != null ? _a2 : []) {
          const d = this.plano.componentes.find((x2) => x2.id === id);
          if (d) por(d, pilha);
        }
        ordem.push(c);
      };
      this.plano.componentes.forEach((c) => por(c, /* @__PURE__ */ new Set()));
      for (const c of ordem) {
        const pecas = c.pecas.length ? this.construirPecas(c, x, y) : null;
        const px = pecas ? x + pecas.width + 80 : x;
        const p = this.construirComponente(c, px, y);
        await this.criarInteracoes(c);
        principais.set(c.id, p);
        const proto = await this.construirPrototipo(c, p, px, y + p.height + 60);
        if (proto) criados.push(...proto);
        criados.push(p);
        if (pecas) criados.push(pecas);
        const exemplo = this.construirExemplo(c, p, px, y + p.height + 60);
        criados.push(exemplo);
        let alto = p.height + 60 + exemplo.height;
        if (this.plano.documentacao) {
          const doc = this.construirDocumentacao(c, px + p.width + 80, y);
          criados.push(doc);
          alto = Math.max(alto, doc.height);
        }
        if (pecas) alto = Math.max(alto, pecas.height);
        y += Math.max(alto, 200) + 160;
      }
      if (this.plano.composicao) this.construirComposicao(principais, x, y);
      await this.aplicarEstilosTexto();
      try {
        this.figma.currentPage.selection = criados;
        this.figma.viewport.scrollAndZoomIntoView(criados);
      } catch (e) {
      }
      return this.rel;
    }
  };
  function importarNoFigma(figma2, plano, pacoteJson, duplicados = "atualizar") {
    return new Construtor(figma2, plano, pacoteJson, duplicados).executar();
  }

  // src/app/kcx/figma/construir/ler-alteracoes.ts
  var kebab3 = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
  var hex22 = (n) => Math.round(Math.min(1, Math.max(0, n)) * 255).toString(16).padStart(2, "0");
  async function lerAlteracoes(figma2, no) {
    var _a, _b, _c, _d;
    let alvo = no;
    while (alvo && !((_a = alvo.getSharedPluginData) == null ? void 0 : _a.call(alvo, CHAVE_PLUGIN, "componente"))) {
      alvo = alvo.type === "INSTANCE" && alvo.getMainComponentAsync ? await alvo.getMainComponentAsync() : alvo.parent;
      if ((alvo == null ? void 0 : alvo.type) === "PAGE" || (alvo == null ? void 0 : alvo.type) === "DOCUMENT") alvo = null;
    }
    if (!alvo)
      return { erro: "Selecione um componente importado pelo Figma Bridge (ou uma inst\xE2ncia dele)." };
    const compId = alvo.getSharedPluginData(CHAVE_PLUGIN, "componente");
    let pacote;
    try {
      pacote = JSON.parse(alvo.getSharedPluginData(CHAVE_PLUGIN, "pacote"));
    } catch (e) {
      return { erro: "O componente n\xE3o guarda o pacote KCX; importe de novo pelo Figma Bridge." };
    }
    const comp = pacote.componentes.find((c) => c.id === compId);
    const locais = await variaveisLocais(figma2);
    const colecoes = await figma2.variables.getLocalVariableCollectionsAsync();
    const porNome = new Map(locais.map((v) => [v.name, v]));
    const ler2 = async (v) => {
      var _a2, _b2, _c2;
      const col = colecoes.find((c) => c.id === v.variableCollectionId);
      let x = v.valuesByMode[(_a2 = col == null ? void 0 : col.defaultModeId) != null ? _a2 : Object.keys(v.valuesByMode)[0]];
      for (let i = 0; x && typeof x === "object" && x.type === "VARIABLE_ALIAS" && i < 5; i++) {
        const a = await figma2.variables.getVariableByIdAsync(x.id);
        const ca = colecoes.find((c) => c.id === (a == null ? void 0 : a.variableCollectionId));
        x = a == null ? void 0 : a.valuesByMode[(_c2 = ca == null ? void 0 : ca.defaultModeId) != null ? _c2 : Object.keys((_b2 = a == null ? void 0 : a.valuesByMode) != null ? _b2 : {})[0]];
      }
      return x;
    };
    const valores = {};
    const ignoradas = [];
    for (const kv of comp.variaveis) {
      const nome = `${compId}/${kebab3(kv.id)}`;
      if (kv.tipo === "gradient") {
        const paradas = [];
        for (let i = 1; porNome.has(`${nome}/stop-${i}`); i++) {
          const c = await ler2(porNome.get(`${nome}/stop-${i}`));
          const orig = [...kv.valor.paradas].sort((a, b) => a.posicao - b.posicao)[i - 1];
          paradas.push({
            cor: `#${hex22(c.r)}${hex22(c.g)}${hex22(c.b)}${c.a < 1 ? hex22(c.a) : ""}`,
            posicao: (_b = orig == null ? void 0 : orig.posicao) != null ? _b : i - 1
          });
        }
        if (paradas.length >= 2) valores[kv.id] = { angulo: kv.valor.angulo, paradas };
        continue;
      }
      const v = porNome.get(nome);
      if (!v) {
        ignoradas.push(kv.id);
        continue;
      }
      const x = await ler2(v);
      if (v.resolvedType === "COLOR")
        valores[kv.id] = `#${hex22(x.r)}${hex22(x.g)}${hex22(x.b)}${x.a < 1 ? hex22(x.a) : ""}`;
      else if (v.resolvedType === "FLOAT")
        valores[kv.id] = ((_c = v.scopes) != null ? _c : []).includes("OPACITY") ? Math.round(x * 10) / 1e3 : x;
      else if (v.resolvedType === "TIMING")
        valores[kv.id] = kv.unidade === "ms" ? Math.round(x * 1e3) : x;
      else if (v.resolvedType === "EASING") {
        const b = x == null ? void 0 : x.easingFunctionCubicBezier;
        const op = ((_d = kv.opcoes) != null ? _d : []).find((o) => {
          var _a2, _b2, _c2;
          const e = easingFigma(
            (_c2 = (_b2 = (_a2 = kv.vinculos.flatMap((l) => {
              var _a3;
              return (_a3 = l.transformar) != null ? _a3 : [];
            }).find((o2) => o2.op === "mapa")) == null ? void 0 : _a2.valores) == null ? void 0 : _b2[o.valor]) != null ? _c2 : o.valor
          );
          const c = e == null ? void 0 : e.easingFunctionCubicBezier;
          return c && b && ["x1", "y1", "x2", "y2"].every((k) => Math.abs(c[k] - b[k]) < 1e-3);
        });
        if (op) valores[kv.id] = op.valor;
        else ignoradas.push(kv.id);
      } else valores[kv.id] = x;
    }
    return {
      arquivo: {
        formato: "kcx-alteracoes",
        schemaVersion: pacote.schemaVersion,
        pacote: pacote.id,
        componente: compId,
        versao: comp.versao,
        exportadoEm: (/* @__PURE__ */ new Date()).toISOString(),
        valores
      },
      ignoradas
    };
  }

  // src/app/kcx/figma/construir.ts
  function limparTracejados(figma2) {
    const sets = figma2.currentPage.findAll((n) => n.type === "COMPONENT_SET");
    sets.forEach((n) => semTracejado(n));
    return sets.length;
  }

  // src/app/kcx/projeto/navegacao.ts
  var TIPOS_PASSO = {
    inicio: { nome: "In\xEDcio", dica: 'Onde a tarefa come\xE7a (ex.: "Abre o app").' },
    tela: { nome: "Tela", dica: "Uma p\xE1gina das Telas que a pessoa v\xEA." },
    acao: { nome: "A\xE7\xE3o", dica: 'O que a pessoa faz (ex.: "Toca em Comprar").' },
    decisao: { nome: "Decis\xE3o", dica: "Uma pergunta com dois caminhos: sim e n\xE3o." },
    fim: { nome: "Fim", dica: "A tarefa conclu\xEDda (ou abandonada)." }
  };
  var TIPOS2 = Object.keys(TIPOS_PASSO);
  var CORES_ESCURO = {
    fundo: "#0f0e17",
    caixa: "#1d1b2c",
    borda: "#3a3656",
    texto: "#f4f2fb",
    suave: "#a9a4c4",
    acento: "#d4119f",
    linha: "#8f89b3",
    erro: "#f43f5e",
    aviso: "#f59e0b"
  };
  var hexOk = (c, padrao) => /^#[0-9a-f]{6}$/i.test(c) ? c : padrao;
  function corDoNo(n, c) {
    return n.estado === "inicio" ? c.acento : n.estado === "erro" ? c.erro : n.estado === "aviso" ? c.aviso : c.borda;
  }
  var FORMATO_DIAGRAMA = "kcx-diagrama";
  function lerArquivoDiagrama(textoArquivo) {
    var _a, _b, _c, _d;
    let o;
    try {
      o = JSON.parse(textoArquivo);
    } catch (e) {
      return { erro: "JSON inv\xE1lido." };
    }
    if ((o == null ? void 0 : o["formato"]) !== FORMATO_DIAGRAMA) return { erro: "N\xE3o \xE9 um diagrama KCX." };
    const d = o["diagrama"];
    const num = (n) => typeof n === "number" && Number.isFinite(n) && Math.abs(n) < 1e5;
    if (!d || !Array.isArray(d.nos) || !Array.isArray(d.arestas) || !num(d.largura) || !num(d.altura))
      return { erro: "Diagrama incompleto." };
    if (d.nos.length > 300 || d.arestas.length > 600) return { erro: "Diagrama grande demais." };
    const formas = ["pagina", "pilula", "retangulo", "losango", "tela"];
    for (const n of d.nos)
      if (![n.x, n.y, n.w, n.h].every(num) || !formas.includes(n.forma) || typeof n.titulo !== "string" || !Array.isArray(n.linhas))
        return { erro: "Caixa inv\xE1lida no diagrama." };
    for (const a of d.arestas)
      if (typeof a.d !== "string" || !/^[MCL\d\s.-]+$/.test(a.d) || !num(a.lx) || !num(a.ly) || !num((_a = a.ponta) == null ? void 0 : _a.x) || !num((_b = a.ponta) == null ? void 0 : _b.y) || !num((_c = a.ponta) == null ? void 0 : _c.angulo))
        return { erro: "Seta inv\xE1lida no diagrama." };
    const cin = (_d = o["cores"]) != null ? _d : {};
    const cores = Object.fromEntries(
      Object.entries(CORES_ESCURO).map(([k, v]) => [
        k,
        typeof cin[k] === "string" ? hexOk(cin[k], v) : v
      ])
    );
    return { diagrama: d, cores };
  }

  // src/app/kcx/figma/construir-diagrama.ts
  var rgb3 = (hex3) => {
    const n = parseInt(hex3.slice(1), 16);
    return { r: (n >> 16 & 255) / 255, g: (n >> 8 & 255) / 255, b: (n & 255) / 255 };
  };
  var solido = (hex3, opacity = 1) => [{ type: "SOLID", color: rgb3(hex3), opacity }];
  var escSvg = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  async function carregarFontes(f) {
    const normal = { family: "Inter", style: "Regular" };
    await f.loadFontAsync(normal);
    for (const style of ["Semi Bold", "Bold"]) {
      try {
        await f.loadFontAsync({ family: "Inter", style });
        return { normal, forte: { family: "Inter", style } };
      } catch (e) {
      }
    }
    return { normal, forte: normal };
  }
  function texto(f, fontes, conteudo, o) {
    const t = f.createText();
    t.fontName = o.forte ? fontes.forte : fontes.normal;
    t.fontSize = o.tamanho;
    t.characters = conteudo;
    t.fills = solido(o.cor);
    t.lineHeight = { value: Math.round(o.tamanho * 1.3), unit: "PIXELS" };
    if (o.largura) {
      t.textAutoResize = "HEIGHT";
      t.resize(o.largura, t.height || o.tamanho * 1.3);
    }
    if (o.centro) t.textAlignHorizontal = "CENTER";
    return t;
  }
  function caixa(f, fontes, n, c, tipo) {
    var _a;
    const borda = corDoNo(n, c);
    const larg = n.estado ? 2 : 1;
    const quadro = f.createFrame();
    quadro.name = n.forma === "pagina" ? `P\xE1gina \xB7 ${n.titulo.replace(/\n/g, " ")}` : `${{ pilula: "In\xEDcio/Fim", retangulo: "A\xE7\xE3o", losango: "Decis\xE3o", tela: "Tela", pagina: "" }[n.forma]} \xB7 ${n.titulo.replace(/\n/g, " ")}`;
    quadro.x = n.x;
    quadro.y = n.y;
    quadro.resize(n.w, n.h);
    quadro.clipsContent = false;
    (_a = quadro.setSharedPluginData) == null ? void 0 : _a.call(quadro, "kcx", "diagrama-no", `${tipo}:${n.id}`);
    const centro = n.forma !== "pagina";
    const corTitulo = n.forma === "pilula" && n.estado === "inicio" ? "#ffffff" : c.texto;
    if (n.forma === "losango") {
      quadro.fills = [];
      const forma = f.createNodeFromSvg(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${n.w}" height="${n.h}" viewBox="0 0 ${n.w} ${n.h}"><polygon points="${n.w / 2},1 ${n.w - 1},${n.h / 2} ${n.w / 2},${n.h - 1} 1,${n.h / 2}" fill="${c.caixa}" stroke="${borda}" stroke-width="${larg}"/></svg>`
      );
      forma.name = "Losango";
      forma.fills = [];
      quadro.appendChild(forma);
    } else {
      quadro.fills = solido(n.forma === "pilula" && n.estado === "inicio" ? c.acento : c.caixa);
      quadro.strokes = solido(borda);
      quadro.strokeWeight = larg;
      quadro.cornerRadius = n.forma === "pilula" ? n.h / 2 : 12;
      if (n.forma === "pagina" || n.forma === "tela") {
        const barra = f.createRectangle();
        barra.name = "Barra do navegador";
        barra.resize(n.w, 18);
        barra.fills = solido(borda, 0.55);
        barra.topLeftRadius = 12;
        barra.topRightRadius = 12;
        quadro.appendChild(barra);
      }
    }
    const titulo = texto(f, fontes, n.titulo, {
      tamanho: 14,
      cor: corTitulo,
      forte: true,
      centro,
      largura: n.w - 28
    });
    titulo.name = "T\xEDtulo";
    titulo.x = 14;
    const linhasTitulo = n.titulo.split("\n").length;
    titulo.y = n.forma === "pagina" || n.forma === "tela" ? 26 : n.forma === "retangulo" ? 8 : Math.round(n.h / 2 - linhasTitulo * 18 / 2);
    quadro.appendChild(titulo);
    if (n.linhas.length) {
      const linhas = texto(f, fontes, n.linhas.map((l) => centro ? l : `\u25AA ${l}`).join("\n"), {
        tamanho: 12,
        cor: c.suave,
        centro,
        largura: n.w - 28
      });
      linhas.name = n.forma === "pagina" ? "Se\xE7\xF5es" : "Detalhe";
      linhas.x = 14;
      linhas.y = titulo.y + linhasTitulo * 18 + 4;
      quadro.appendChild(linhas);
    }
    if (n.etiqueta && n.forma !== "pilula") {
      const et = texto(f, fontes, n.etiqueta, {
        tamanho: 9,
        cor: n.estado === "inicio" ? c.acento : c.suave,
        forte: true
      });
      et.name = "Etiqueta";
      et.letterSpacing = { value: 1, unit: "PIXELS" };
      et.x = n.w - 12 - (et.width || 40);
      et.y = 3;
      quadro.appendChild(et);
    }
    return quadro;
  }
  function ponta(x, y, angulo) {
    const a = angulo * Math.PI / 180;
    const p = (dx, dy) => `${Math.round((x + dx * Math.cos(a) - dy * Math.sin(a)) * 10) / 10} ${Math.round((y + dx * Math.sin(a) + dy * Math.cos(a)) * 10) / 10}`;
    return `M${p(0, 0)} L${p(-10, -5)} L${p(-10, 5)} Z`;
  }
  async function construirDiagrama(f, d, c) {
    var _a, _b, _c, _d, _e;
    const fontes = await carregarFontes(f);
    const quadro = f.createFrame();
    quadro.name = `${d.tipo === "mapa" ? "Mapa de navega\xE7\xE3o" : "Fluxo"} \xB7 ${d.nome}`;
    quadro.resize(d.largura, d.altura);
    quadro.fills = solido(c.fundo);
    quadro.cornerRadius = 16;
    quadro.clipsContent = false;
    (_a = quadro.setSharedPluginData) == null ? void 0 : _a.call(quadro, "kcx", "diagrama", d.tipo);
    for (const a of d.arestas) {
      const traco = a.volta ? ' stroke-dasharray="6 5"' : "";
      const seta = f.createNodeFromSvg(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${d.largura}" height="${d.altura}" viewBox="0 0 ${d.largura} ${d.altura}"><path d="${escSvg(a.d)}" fill="none" stroke="${c.linha}" stroke-width="1.6"${traco}/><path d="${ponta(a.ponta.x, a.ponta.y, a.ponta.angulo)}" fill="${c.linha}"/></svg>`
      );
      seta.name = `Seta \xB7 ${a.rotulo || "liga\xE7\xE3o"}`;
      seta.fills = [];
      seta.x = 0;
      seta.y = 0;
      quadro.appendChild(seta);
    }
    for (const n of d.nos) quadro.appendChild(caixa(f, fontes, n, c, d.tipo));
    for (const a of d.arestas) {
      if (!a.rotulo) continue;
      const et = f.createFrame();
      et.name = `Gatilho \xB7 ${a.rotulo}`;
      et.layoutMode = "HORIZONTAL";
      et.primaryAxisSizingMode = "AUTO";
      et.counterAxisSizingMode = "AUTO";
      et.paddingLeft = et.paddingRight = 8;
      et.paddingTop = et.paddingBottom = 4;
      et.cornerRadius = 6;
      et.fills = solido(c.fundo);
      et.strokes = solido(c.borda);
      et.strokeWeight = 1;
      et.appendChild(texto(f, fontes, a.rotulo, { tamanho: 11, cor: c.suave }));
      quadro.appendChild(et);
      et.x = Math.round(a.lx - (et.width || 0) / 2);
      et.y = Math.round(a.ly - (et.height || 0) / 2);
    }
    const centro = (_c = (_b = f.viewport) == null ? void 0 : _b.center) != null ? _c : { x: 0, y: 0 };
    quadro.x = Math.round(centro.x - d.largura / 2);
    quadro.y = Math.round(centro.y - d.altura / 2);
    f.currentPage.appendChild(quadro);
    f.currentPage.selection = [quadro];
    (_e = (_d = f.viewport) == null ? void 0 : _d.scrollAndZoomIntoView) == null ? void 0 : _e.call(_d, [quadro]);
    return { nome: quadro.name, caixas: d.nos.length, setas: d.arestas.length, id: quadro.id };
  }

  // figma-bridge/src/code.ts
  figma.showUI(__html__, { width: 460, height: 660, themeColors: true, title: "KCX \xB7 Figma Bridge" });
  function responder(msg) {
    figma.ui.postMessage(msg);
  }
  function ler(texto2, modo) {
    var _a, _b;
    const r = desserializar(texto2);
    if (!r.ok) return { erro: r.erro, problemas: (_b = (_a = r.validacao) == null ? void 0 : _a.erros) != null ? _b : [] };
    const m = modo != null ? modo : r.pacote.exportacao.modo === "pacote" ? "completo" : r.pacote.exportacao.modo;
    return { pacote: r.pacote, plano: planejarFigma(r.pacote, m), avisos: r.validacao.avisos };
  }
  var ehDiagrama = (texto2) => texto2.length < 5e6 && texto2.includes(`"${FORMATO_DIAGRAMA}"`);
  figma.ui.onmessage = async (msg) => {
    var _a;
    try {
      if (msg.tipo === "analisar" && ehDiagrama(msg.texto)) {
        const r = lerArquivoDiagrama(msg.texto);
        if ("erro" in r) return responder({ tipo: "erro", erro: r.erro });
        return responder({
          tipo: "diagrama",
          nome: r.diagrama.nome,
          mapa: r.diagrama.tipo === "mapa",
          caixas: r.diagrama.nos.length,
          setas: r.diagrama.arestas.length,
          largura: r.diagrama.largura,
          altura: r.diagrama.altura
        });
      }
      if (msg.tipo === "importar-diagrama") {
        const r = lerArquivoDiagrama(msg.texto);
        if ("erro" in r) return responder({ tipo: "erro", erro: r.erro });
        const rel = await construirDiagrama(figma, r.diagrama, r.cores);
        figma.notify(`KCX: ${rel.nome} \u2014 ${rel.caixas} caixa(s) e ${rel.setas} seta(s).`);
        return responder(__spreadValues({ tipo: "diagrama-pronto" }, rel));
      }
      if (msg.tipo === "analisar") {
        const r = ler(msg.texto, msg.modo);
        if ("erro" in r) return responder({ tipo: "erro", erro: r.erro, problemas: r.problemas });
        const duplicados = await detectarDuplicados(figma, r.plano);
        responder({
          tipo: "analise",
          pacote: {
            id: r.pacote.id,
            nome: r.pacote.nome,
            versao: r.pacote.versao,
            schema: r.pacote.schemaVersion,
            origem: r.pacote.origem.ferramenta
          },
          plano: {
            modo: r.plano.modo,
            resumo: r.plano.resumo,
            colecoes: r.plano.colecoes.map((c) => ({
              nome: c.nome,
              modos: c.modos,
              variaveis: c.variaveis.map((v) => ({
                nome: v.nome,
                tipo: v.tipo,
                vinculada: v.vinculadaA.length > 0,
                origem: v.origem
              }))
            })),
            componentes: r.plano.componentes.map((c) => ({
              nome: c.nome,
              nivel: c.nivel,
              variantes: c.variantes.map((v) => v.nome),
              editavel: c.editavel,
              parcial: c.parcial,
              naoSuportado: c.naoSuportado,
              limitacoes: c.limitacoes
            })),
            documentacao: r.plano.documentacao,
            composicao: (_a = r.plano.composicao) == null ? void 0 : _a.nome,
            avisos: [...r.plano.avisos, ...r.avisos.map((a) => a.mensagem)]
          },
          duplicados
        });
      }
      if (msg.tipo === "importar") {
        const r = ler(msg.texto, msg.modo);
        if ("erro" in r) return responder({ tipo: "erro", erro: r.erro, problemas: r.problemas });
        responder({ tipo: "progresso", texto: "Criando vari\xE1veis e componentes\u2026" });
        const relatorio = await importarNoFigma(figma, r.plano, msg.texto, msg.duplicados);
        figma.notify(
          `KCX: ${relatorio.componentes.length} componente(s), ${relatorio.variaveisCriadas.length} vari\xE1vel(is) nova(s), ${relatorio.vinculos} v\xEDnculo(s).`
        );
        responder({ tipo: "concluido", relatorio });
      }
      if (msg.tipo === "exportar-alteracoes") {
        const sel = figma.currentPage.selection[0];
        if (!sel)
          return responder({
            tipo: "erro",
            erro: "Selecione um componente importado pelo Figma Bridge."
          });
        const r = await lerAlteracoes(figma, sel);
        if ("erro" in r) return responder({ tipo: "erro", erro: r.erro });
        responder({ tipo: "alteracoes", arquivo: r.arquivo, ignoradas: r.ignoradas });
      }
      if (msg.tipo === "enviar-selecao") {
        const sel = figma.currentPage.selection[0];
        if (!sel)
          return responder({
            tipo: "erro",
            erro: "Selecione um frame, componente ou inst\xE2ncia para enviar ao lab."
          });
        const comp = await lerSelecao(figma, sel);
        const pacote = criarPacote([comp], { modo: "completo" });
        responder({
          tipo: "selecao",
          id: comp.id,
          nome: comp.nome,
          texto: serializar(pacote),
          variaveis: comp.variaveis.length,
          avisos: comp.compatibilidade.figma.parcial
        });
      }
      if (msg.tipo === "enviar-design-system") {
        const ds = await lerDesignSystem(figma);
        if (!ds.variaveis.length && !ds.estilosTexto.length)
          return responder({
            tipo: "erro",
            erro: "Este arquivo n\xE3o tem vari\xE1veis nem estilos de texto locais para enviar."
          });
        const r = fundacaoDoFigma(ds);
        responder({
          tipo: "design-system",
          nome: r.fundacao.nome,
          texto: JSON.stringify(r.fundacao, null, 2),
          reconhecido: r.reconhecido,
          padrao: r.padrao
        });
      }
      if (msg.tipo === "limpar-tracejado") {
        const n = limparTracejados(figma);
        figma.notify(`KCX: borda tracejada removida de ${n} conjunto(s) de variantes.`);
        responder({ tipo: "tracejado", n });
      }
      if (msg.tipo === "fechar") figma.closePlugin();
    } catch (e) {
      responder({ tipo: "erro", erro: `Falha inesperada: ${e.message}` });
    }
  };
})();

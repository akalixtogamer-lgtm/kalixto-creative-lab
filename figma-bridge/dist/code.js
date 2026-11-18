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
    const rgb2 = lerRgb(t);
    if (rgb2) return rgb2;
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
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p;
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
        case "somarVariavel": {
          const outra = (_j = valores[o.variavel]) != null ? _j : (_i = todas.find((t) => t.id === o.variavel)) == null ? void 0 : _i.valor;
          x = comoNumero(x, variavel2.id) + o.fator * comoNumero(outra, o.variavel);
          break;
        }
        case "alpha": {
          if (typeof x !== "string")
            throw new Error(`KCX: alpha em "${variavel2.id}" precisa de cor.`);
          const a = o.variavel ? (_l = valores[o.variavel]) != null ? _l : (_k = todas.find((t) => t.id === o.variavel)) == null ? void 0 : _k.valor : o.valor;
          x = comAlpha(x, comoNumero(a != null ? a : 1, (_m = o.variavel) != null ? _m : variavel2.id));
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
          const forma = String((_o = valores[o.variavel]) != null ? _o : (_n = todas.find((t2) => t2.id === o.variavel)) == null ? void 0 : _n.valor);
          const d = o.caminhos[forma];
          if (!d) throw new Error(`KCX: caminho "${forma}" n\xE3o encontrado.`);
          const t = comoNumero(x, variavel2.id);
          x = o.op === "tracoNoCaminho" ? comprimento(d) * t : pontoEm(d, t)[o.eixo] + ((_p = o.somar) != null ? _p : 0);
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
        if (o.op === "pontoNoCaminho" || o.op === "tracoNoCaminho" || o.op === "variavelPorOpcao") {
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
    var _a, _b;
    const out = [];
    const add = (campo, ref) => {
      if (ehRefVariavel(ref) || ehRefDerivada(ref)) out.push({ campo, ref });
    };
    ["x", "y", "largura", "altura", "raio", "opacidade", "visivel", "rotacao", "svg"].forEach((k) => add(k, no[k]));
    (_a = no.preenchimentos) == null ? void 0 : _a.forEach((p, i) => {
      if (p.tipo === "solido") add(`preenchimentos[${i}].cor`, p.cor);
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
    if (no.svgTraco) {
      add("svgTraco.cor", no.svgTraco.cor);
      add("svgTraco.espessura", no.svgTraco.espessura);
    }
    (_b = no.efeitos) == null ? void 0 : _b.forEach((ef, i) => {
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
    if (!Array.isArray(pkg.componentes) || pkg.componentes.length === 0) {
      erros.push({
        caminho: "componentes",
        mensagem: "O pacote precisa de pelo menos um componente."
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
    const comps = componentes.map((c) => {
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
    return __spreadProps(__spreadValues({
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
    }, opcoes.composicao ? { composicao: clonar(opcoes.composicao) } : {}), {
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
  function desserializar(texto) {
    let bruto;
    try {
      bruto = JSON.parse(texto);
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
      const hex = corDeFigma({ r: cor.r, g: cor.g, b: cor.b, a: ((_a2 = cor.a) != null ? _a2 : 1) * opacidade });
      const existente = porCor.get(hex);
      if (existente) return existente;
      const ligado = await nomeLigado(alias);
      const vid = idUnico(
        ligado ? camel(/^cor\b/i.test(ligado) ? ligado : `cor ${ligado}`) : `cor${porCor.size + 1}`
      );
      porCor.set(hex, vid);
      vars.push(
        variavel({
          id: vid,
          nome: ligado ? /^cor\b/i.test(ligado) ? ligado : `Cor ${ligado}` : `Cor ${porCor.size}`,
          tipo: "color",
          padrao: hex,
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
  function valoresPorModo(v, atual, modos, campo, transformar) {
    var _a;
    const t = transformar != null ? transformar : ((x) => x);
    const out = {};
    for (const m of modos) {
      const bruto = m === "Light" && ((_a = v.modos) == null ? void 0 : _a.light) !== void 0 && atual === v.valor ? v.modos.light : atual;
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
          valores: Object.fromEntries(ctx.modos.map((m) => [m, valorFigma(v, calc, campo)])),
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
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p;
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
    if (no.svg !== void 0) {
      const r = resolverRef(no.svg, __spreadProps(__spreadValues({}, CAMPOS["fixo"]), { tipo: "STRING" }), "", __spreadProps(__spreadValues({}, ctx), {
        usarVariaveis: false
      }));
      p.svg = String((_h = r == null ? void 0 : r.valor) != null ? _h : "");
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
        tracejado: (_i = no.svgTraco.tracejado) == null ? void 0 : _i.map((t) => {
          var _a2;
          return Math.round(((_a2 = literal(t, ctx)) != null ? _a2 : 0) * 100) / 100;
        })
      };
    }
    let parcial = false;
    const tr = (_j = p.svgTraco) == null ? void 0 : _j.tracejado;
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
      const rotulo = (_m = (_l = (_k = eixo.opcoes) == null ? void 0 : _k.find((o) => o.valor === ctx.valores[eixo.id])) == null ? void 0 : _l.rotulo) != null ? _m : String(ctx.valores[eixo.id]);
      p.peca = { nome: no.peca.nome, variante: rotulo };
      let peca = ctx.pecas.get(no.peca.nome);
      if (!peca)
        ctx.pecas.set(no.peca.nome, peca = { nome: no.peca.nome, eixo: eixo.id, opcoes: [] });
      if (!peca.opcoes.some((o) => o.rotulo === rotulo)) {
        const traco = (_n = p.svgTraco) != null ? _n : {
          cor: { valor: { r: 0, g: 0, b: 0, a: 1 } },
          espessura: { valor: 1 }
        };
        peca.opcoes.push({
          rotulo,
          svg: p.svg,
          traco: { cor: traco.cor, espessura: traco.espessura }
        });
        const ordem = ((_o = eixo.opcoes) != null ? _o : []).map((o) => o.rotulo);
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
        )
      };
    }
    p.filhos = ((_p = no.filhos) != null ? _p : []).map((f) => planejarNo(f, ctx, `${caminho} \u203A ${f.nome}`));
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
  function planejarFigma(pacote, modo = pacote.exportacao.modo) {
    var _a, _b, _c, _d;
    const usarVariaveis = modo !== "visual";
    const criarComponentes = modo !== "variaveis";
    const vars = /* @__PURE__ */ new Map();
    const avisos = [];
    const temModos = pacote.componentes.some((c) => c.variaveis.some((v) => v.modos));
    const modosDe = (colecao) => temModos && colecao === COLECOES.colors ? ["Dark", "Light"] : ["Valor"];
    const registrar = (pv, onde) => {
      pv.valores = Object.fromEntries(
        modosDe(pv.colecao).map((m) => {
          var _a2, _b2, _c2;
          return [
            m,
            (_c2 = (_b2 = (_a2 = pv.valores[m]) != null ? _a2 : pv.valores["Dark"]) != null ? _b2 : pv.valores["Valor"]) != null ? _c2 : Object.values(pv.valores)[0]
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
    const componentes = [];
    for (const comp of pacote.componentes) {
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
          pecas
        };
        ctx.modos = temModos ? ["Dark", "Light", "Valor"] : ["Valor"];
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
        for (const v of variantes.filter((x) => x.propriedades["Estado"] === de.nome)) {
          const alvo = variantes.find(
            (x) => Object.entries(__spreadProps(__spreadValues({}, v.propriedades), { Estado: para.nome })).every(
              ([k, val]) => x.propriedades[k] === val
            )
          );
          if (alvo)
            interacoes.push({
              variante: v.nome,
              no: it.no,
              gatilho: it.gatilho,
              destino: alvo.nome,
              transicao: it.transicao,
              duracao: it.duracao
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
          interacoes: interacoes.length ? interacoes : void 0
        });
      }
    }
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
    const todas = [...vars.values()];
    const contar = (n) => 1 + n.filhos.reduce((s, f) => s + contar(f), 0);
    return {
      modo,
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
        variaveis: todas.length,
        vinculadas: todas.filter((v) => v.vinculadaA.length > 0).length,
        documentais: todas.filter((v) => v.origem === "documental").length,
        componentes: componentes.length,
        variantes: componentes.reduce((s, c) => s + c.variantes.length, 0),
        camadas: componentes.reduce(
          (s, c) => s + c.variantes.reduce((t, v) => t + contar(v.arvore), 0),
          0
        )
      }
    };
  }

  // src/app/kcx/figma/construir.ts
  var CHAVE_PLUGIN = "kcx";
  function rgb(c) {
    return { r: c.r, g: c.g, b: c.b };
  }
  async function variaveisLocais(figma2) {
    return figma2.variables.getLocalVariablesAsync ? await figma2.variables.getLocalVariablesAsync() : [];
  }
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
  var Construtor = class {
    constructor(figma2, plano, pacoteJson, duplicados) {
      __publicField(this, "figma", figma2);
      __publicField(this, "plano", plano);
      __publicField(this, "pacoteJson", pacoteJson);
      __publicField(this, "duplicados", duplicados);
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
      /* ------------------------------ Camadas ------------------------------ */
      /** Componentes das peças reutilizáveis já criados: "peça|variante" → componente. */
      __publicField(this, "pecas", /* @__PURE__ */ new Map());
      /** Nós de cada variante (para ligar as interações do protótipo). */
      __publicField(this, "nosPorVariante", /* @__PURE__ */ new Map());
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
      if (p.tipo === "solido") {
        let paint = {
          type: "SOLID",
          color: rgb(p.cor.valor),
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
      var _a, _b, _c, _d, _e, _f, _g, _h, _i;
      const f = this.figma;
      let no;
      const local = `${onde} \u203A ${p.nome}`;
      const pecaComp = p.peca ? this.pecas.get(`${p.peca.nome}|${p.peca.variante}`) : void 0;
      if (p.tipo === "svg" && pecaComp) {
        no = pecaComp.createInstance();
        if ((_b = (_a = p.svgTraco) == null ? void 0 : _a.tracejado) == null ? void 0 : _b.length) {
          for (const v of no.findAll((x) => x.type === "VECTOR"))
            v.dashPattern = p.svgTraco.tracejado;
        }
      } else if (p.tipo === "svg") {
        no = f.createNodeFromSvg((_c = p.svg) != null ? _c : '<svg xmlns="http://www.w3.org/2000/svg"/>');
        no.fills = [];
        const vetores = no.findAll ? no.findAll((x) => x.type === "VECTOR") : [];
        if (p.svgTraco) {
          this.tracarVetores(vetores, p.svgTraco, local);
          if ((_d = p.svgTraco.tracejado) == null ? void 0 : _d.length)
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
      if (p.id) (_e = refs.nos) == null ? void 0 : _e.set(p.id, no);
      if (p.tipo === "frame" && p.autoLayout) {
        no.layoutMode = p.autoLayout.direcao;
        no.primaryAxisAlignItems = "CENTER";
        no.counterAxisAlignItems = (_f = p.autoLayout.alinhar) != null ? _f : "CENTER";
        no.itemSpacing = Number(p.autoLayout.espaco.valor);
        no.paddingLeft = no.paddingRight = Number(p.autoLayout.paddingX.valor);
        no.paddingTop = no.paddingBottom = Number(p.autoLayout.paddingY.valor);
        this.vincular(no, "itemSpacing", p.autoLayout.espaco, local);
        for (const lado of ["paddingLeft", "paddingRight"])
          this.vincular(no, lado, p.autoLayout.paddingX, local);
        for (const lado of ["paddingTop", "paddingBottom"])
          this.vincular(no, lado, p.autoLayout.paddingY, local);
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
          if (p.largura)
            hor ? no.counterAxisSizingMode = "AUTO" : no.primaryAxisSizingMode = "AUTO";
          else hor ? no.primaryAxisSizingMode = "AUTO" : no.counterAxisSizingMode = "AUTO";
        }
        if (p.largura) this.vincular(no, "width", p.largura, local);
        if (p.altura) this.vincular(no, "height", p.altura, local);
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
        const n = this.construirNo(filho, null, !!p.autoLayout, local, refs);
        no.appendChild(n);
        if (p.autoLayout && filho.absoluto) {
          n.layoutPositioning = "ABSOLUTE";
          absolutos.push({ no: n, plano: filho });
        } else if (p.autoLayout && ((_g = filho.texto) == null ? void 0 : _g.preencher)) {
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
        if (((_h = a.plano.restricoes) == null ? void 0 : _h.horizontal) === "STRETCH") {
          a.no.x = 0;
          a.no.resize(Math.max(0.01, no.width), a.no.height);
        }
        if (((_i = a.plano.restricoes) == null ? void 0 : _i.vertical) === "STRETCH") {
          a.no.y = 0;
          a.no.resize(a.no.width, Math.max(0.01, no.height));
        }
      }
      return no;
    }
    /** Cria as propriedades de componente (texto e visibilidade) e liga as camadas a elas. */
    propriedades(principal, refsPorVariante) {
      var _a, _b;
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
    }
    construirComponente(c, x0, y0) {
      const f = this.figma;
      const variantes = [];
      const refsPorVariante = [];
      c.variantes.forEach((v) => {
        const comp = f.createComponent();
        const refs = { texto: [], visivel: [], nos: /* @__PURE__ */ new Map() };
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
        const transition = it.transicao === "instantanea" ? null : {
          type: it.transicao === "dissolver" ? "DISSOLVE" : "SMART_ANIMATE",
          easing: { type: "EASE_OUT" },
          duration: it.duracao / 1e3
        };
        const lista = (_b = porNo.get(no)) != null ? _b : [];
        lista.push({
          trigger: { type: it.gatilho === "hover" ? "ON_HOVER" : "ON_CLICK" },
          actions: [
            {
              type: "NODE",
              destinationId: destino.variante.id,
              navigation: "CHANGE_TO",
              transition,
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
      t.fills = [{ type: "SOLID", color: rgb(cor) }];
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
      const principais = /* @__PURE__ */ new Map();
      const criados = [];
      for (const c of this.plano.componentes) {
        const pecas = c.pecas.length ? this.construirPecas(c, x, y) : null;
        const px = pecas ? x + pecas.width + 80 : x;
        const p = this.construirComponente(c, px, y);
        await this.criarInteracoes(c);
        principais.set(c.id, p);
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

  // figma-bridge/src/code.ts
  figma.showUI(__html__, { width: 460, height: 660, themeColors: true, title: "KCX \xB7 Figma Bridge" });
  function responder(msg) {
    figma.ui.postMessage(msg);
  }
  function ler(texto, modo) {
    var _a, _b;
    const r = desserializar(texto);
    if (!r.ok) return { erro: r.erro, problemas: (_b = (_a = r.validacao) == null ? void 0 : _a.erros) != null ? _b : [] };
    const m = modo != null ? modo : r.pacote.exportacao.modo === "pacote" ? "completo" : r.pacote.exportacao.modo;
    return { pacote: r.pacote, plano: planejarFigma(r.pacote, m), avisos: r.validacao.avisos };
  }
  figma.ui.onmessage = async (msg) => {
    var _a;
    try {
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
      if (msg.tipo === "fechar") figma.closePlugin();
    } catch (e) {
      responder({ tipo: "erro", erro: `Falha inesperada: ${e.message}` });
    }
  };
})();

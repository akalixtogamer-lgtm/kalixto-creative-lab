/**
 * Inspetor da reconstrução: script que vai junto do documento do preview
 * (iframe sandbox, origem opaca). O app conversa com ele só por postMessage.
 *
 * App → iframe ({ kcxCmp: … }):
 *   inspecionar {ativo}   liga/desliga a seleção de elementos com o mouse
 *   destacar {seletor}    contorna um elemento por 1,2 s
 *   medir {seletores}     mede caixas, cores, fontes, camadas e animações
 *   irPara {ms}           pausa todas as animações no tempo pedido
 *   soltar                volta a tocar a partir de onde parou
 *   log {ativo}           registra interações e os efeitos que elas disparam
 *
 * iframe → app:
 *   selecionado {seletor, nome, medicao}
 *   medidas {palco, elementos, viewport}
 *   tempo {ms, total}
 *   evento {tipo, seletor, efeitos[]}
 */
import type { MedicaoElemento, MedicaoViewport } from './tipos';

export interface MsgSelecionado {
  kcxCmp: 'selecionado';
  seletor: string;
  nome: string;
  medicao: MedicaoElemento;
}
export interface MsgMedidas {
  kcxCmp: 'medidas';
  palco: { largura: number; altura: number };
  elementos: Record<string, MedicaoElemento>;
  viewport: MedicaoViewport;
}
export interface MsgTempo {
  kcxCmp: 'tempo';
  ms: number;
  total: number;
}
export interface MsgEvento {
  kcxCmp: 'evento';
  tipo: string;
  seletor: string;
  efeitos: string[];
}
export type MsgInspetor = MsgSelecionado | MsgMedidas | MsgTempo | MsgEvento;

/** Confere a forma de uma mensagem vinda do iframe (origem opaca: nunca confie). */
export function lerMsgInspetor(d: unknown): MsgInspetor | null {
  if (!d || typeof d !== 'object') return null;
  const m = d as Record<string, unknown>;
  const texto = (x: unknown) => typeof x === 'string' && x.length <= 400;
  switch (m['kcxCmp']) {
    case 'selecionado':
      return texto(m['seletor']) &&
        texto(m['nome']) &&
        m['medicao'] &&
        typeof m['medicao'] === 'object'
        ? (m as unknown as MsgSelecionado)
        : null;
    case 'medidas':
      return m['palco'] && m['elementos'] && m['viewport'] ? (m as unknown as MsgMedidas) : null;
    case 'tempo':
      return Number.isFinite(m['ms']) && Number.isFinite(m['total'])
        ? (m as unknown as MsgTempo)
        : null;
    case 'evento':
      return texto(m['tipo']) && texto(m['seletor']) && Array.isArray(m['efeitos'])
        ? (m as unknown as MsgEvento)
        : null;
    default:
      return null;
  }
}

export const SCRIPT_INSPETOR = String.raw`(function () {
  var pai = window.parent;
  function enviar(m) { pai.postMessage(m, '*'); }
  var tela = document.createElement('canvas');
  tela.width = tela.height = 1;
  var ctx = tela.getContext('2d', { willReadFrequently: true });
  function cor(c) {
    if (!ctx || !c) return 'rgba(0, 0, 0, 0)';
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillStyle = c;
    ctx.fillRect(0, 0, 1, 1);
    var d = ctx.getImageData(0, 0, 1, 1).data;
    return 'rgba(' + d[0] + ', ' + d[1] + ', ' + d[2] + ', ' + Math.round((d[3] / 255) * 1000) / 1000 + ')';
  }
  function partir(t) {
    var out = [], prof = 0, atual = '';
    for (var i = 0; i < t.length; i++) {
      var ch = t[i];
      if (ch === '(') prof++;
      if (ch === ')') prof--;
      if (ch === ',' && prof === 0) { out.push(atual.trim()); atual = ''; } else atual += ch;
    }
    if (atual.trim()) out.push(atual.trim());
    return out;
  }
  function ms(t) {
    t = String(t || '').trim();
    if (/ms$/.test(t)) return parseFloat(t);
    if (/s$/.test(t)) return parseFloat(t) * 1000;
    return parseFloat(t) || 0;
  }
  var CLASSE = /^[a-zA-Z_][\w-]*$/;
  function seletorDe(el) {
    if (!el || el.nodeType !== 1) return '';
    if (el.id && CLASSE.test(el.id)) return '#' + el.id;
    var partes = [];
    while (el && el.nodeType === 1 && el !== document.body && el !== document.documentElement) {
      var tag = el.tagName.toLowerCase();
      var cls = [].filter.call(el.classList, function (c) { return CLASSE.test(c) && c.indexOf('kcxcmp') !== 0; });
      var p = cls.length ? tag + '.' + cls.slice(0, 2).join('.') : tag;
      var pai2 = el.parentElement;
      if (pai2) {
        var mesmos = [].filter.call(pai2.children, function (x) { return x.matches(p); });
        if (mesmos.length > 1) {
          var irmaos = [].filter.call(pai2.children, function (x) { return x.tagName === el.tagName; });
          p += ':nth-of-type(' + (irmaos.indexOf(el) + 1) + ')';
        }
      }
      partes.unshift(p);
      var s = partes.join(' > ');
      try { if (document.querySelectorAll(s).length === 1) return s; } catch (e) {}
      el = el.parentElement;
    }
    return partes.join(' > ') || 'body';
  }
  function nomeDe(el) {
    var a = el.getAttribute('aria-label');
    if (a) return a.slice(0, 40);
    var c = [].find.call(el.classList, function (x) { return x.indexOf('__') > 0; });
    var base = c ? c.split('__').pop().replace(/[-_]+/g, ' ') : el.tagName.toLowerCase();
    var txt = (el.textContent || '').trim().replace(/\s+/g, ' ');
    return (base + (txt && txt.length < 30 ? ' “' + txt + '”' : '')).slice(0, 60);
  }
  function camada(el, r) {
    if (!document.elementsFromPoint) return 0;
    var lista = document.elementsFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    for (var i = 0; i < lista.length; i++) if (lista[i] === el || el.contains(lista[i])) return i;
    return 999;
  }
  function medir(el) {
    var r = el.getBoundingClientRect();
    var cs = getComputedStyle(el);
    var nomes = partir(cs.animationName || 'none');
    var durA = partir(cs.animationDuration || '0s');
    var atrA = partir(cs.animationDelay || '0s');
    var easA = partir(cs.animationTimingFunction || 'ease');
    var anims = [];
    nomes.forEach(function (n, i) {
      if (n && n !== 'none') anims.push({ nome: n, duracao: ms(durA[i % durA.length]), atraso: ms(atrA[i % atrA.length]), easing: easA[i % easA.length] });
    });
    var props = partir(cs.transitionProperty || 'all');
    var durT = partir(cs.transitionDuration || '0s');
    var atrT = partir(cs.transitionDelay || '0s');
    var easT = partir(cs.transitionTimingFunction || 'ease');
    var trans = [];
    props.forEach(function (p, i) {
      var d = ms(durT[i % durT.length]);
      if (d > 0) trans.push({ propriedade: p, duracao: d, atraso: ms(atrT[i % atrT.length]), easing: easT[i % easT.length] });
    });
    var flex = /flex|grid/.test(cs.display);
    return {
      seletor: seletorDe(el),
      caixa: { x: r.left + scrollX, y: r.top + scrollY, largura: r.width, altura: r.height },
      corTexto: cor(cs.color),
      corFundo: cor(cs.backgroundColor),
      fonte: parseFloat(cs.fontSize) || 0,
      familia: cs.fontFamily || '',
      peso: parseInt(cs.fontWeight, 10) || 400,
      opacidade: parseFloat(cs.opacity),
      padding: parseFloat(cs.paddingTop) || 0,
      gap: flex ? parseFloat(cs.rowGap) || parseFloat(cs.columnGap) || 0 : 0,
      camada: camada(el, r),
      animacoes: anims,
      transicoes: trans
    };
  }
  function viewport() {
    var w = innerWidth;
    var fora = [];
    document.querySelectorAll('body *').forEach(function (el) {
      if (fora.length >= 5 || el.id === 'kcxcmp-marca') return;
      var r = el.getBoundingClientRect();
      if (r.width && r.right > w + 1) fora.push(seletorDe(el));
    });
    return { largura: w, transborda: document.documentElement.scrollWidth > w + 1, foraDaTela: fora };
  }

  /* ---------- seleção ---------- */
  var marca = document.createElement('div');
  marca.id = 'kcxcmp-marca';
  marca.setAttribute('aria-hidden', 'true');
  marca.style.cssText = 'position:fixed;pointer-events:none;z-index:2147483647;outline:2px solid #00d9ff;outline-offset:1px;background:rgba(0,217,255,.08);display:none;font:600 11px/1.4 system-ui,sans-serif;color:#050505;';
  var rotulo = document.createElement('span');
  rotulo.style.cssText = 'position:absolute;left:-2px;top:-20px;background:#00d9ff;padding:1px 6px;border-radius:4px;white-space:nowrap;';
  marca.appendChild(rotulo);
  document.addEventListener('DOMContentLoaded', function () { document.body.appendChild(marca); });
  if (document.body) document.body.appendChild(marca);
  var inspecionando = false;
  function contornar(el, texto) {
    if (!el) { marca.style.display = 'none'; return; }
    var r = el.getBoundingClientRect();
    marca.style.display = 'block';
    marca.style.left = r.left + 'px';
    marca.style.top = r.top + 'px';
    marca.style.width = r.width + 'px';
    marca.style.height = r.height + 'px';
    rotulo.textContent = texto || nomeDe(el);
  }
  function alvo(e) {
    var el = e.target;
    return el && el.nodeType === 1 && el !== marca && el !== document.body && el !== document.documentElement ? el : null;
  }
  document.addEventListener('pointermove', function (e) { if (inspecionando) contornar(alvo(e)); }, true);
  document.addEventListener('click', function (e) {
    if (!inspecionando) return;
    var el = alvo(e);
    e.preventDefault();
    e.stopPropagation();
    if (!el) return;
    var m = medir(el);
    enviar({ kcxCmp: 'selecionado', seletor: m.seletor, nome: nomeDe(el), medicao: m });
  }, true);
  document.addEventListener('keydown', function (e) {
    if (inspecionando && e.key === 'Escape') { inspecionando = false; contornar(null); }
  }, true);

  /* ---------- tempo ---------- */
  function total() {
    var t = 0;
    (document.getAnimations ? document.getAnimations() : []).forEach(function (a) {
      var ct = a.effect && a.effect.getComputedTiming ? a.effect.getComputedTiming() : null;
      if (!ct) return;
      var fim = isFinite(ct.endTime) ? ct.endTime : (ct.delay || 0) + (ct.duration || 0);
      t = Math.max(t, fim || 0);
    });
    return t;
  }
  function irPara(alvoMs) {
    (document.getAnimations ? document.getAnimations() : []).forEach(function (a) {
      try { a.pause(); a.currentTime = alvoMs; } catch (e) {}
    });
    enviar({ kcxCmp: 'tempo', ms: alvoMs, total: total() });
  }

  /* ---------- log de interações ---------- */
  var registrando = false, aberto = null, ultimoHover = null, ultimoScroll = 0, apertado = null;
  function abrir(tipo, el) {
    if (!registrando) return;
    if (aberto) fechar();
    aberto = { tipo: tipo, seletor: el ? seletorDe(el) : 'window', efeitos: [] };
    setTimeout(fechar, 700);
  }
  function fechar() {
    if (!aberto) return;
    enviar({ kcxCmp: 'evento', tipo: aberto.tipo, seletor: aberto.seletor, efeitos: aberto.efeitos.slice(0, 12) });
    aberto = null;
  }
  function efeito(txt) { if (aberto && aberto.efeitos.indexOf(txt) === -1) aberto.efeitos.push(txt); }
  document.addEventListener('pointerover', function (e) {
    var el = alvo(e);
    if (inspecionando || !el || el === ultimoHover) return;
    ultimoHover = el;
    abrir('hover', el);
  }, true);
  document.addEventListener('click', function (e) { if (!inspecionando) abrir('clique', alvo(e)); }, true);
  document.addEventListener('pointerdown', function (e) { apertado = { x: e.clientX, y: e.clientY, el: alvo(e) }; }, true);
  document.addEventListener('pointerup', function (e) {
    if (apertado && !inspecionando && Math.hypot(e.clientX - apertado.x, e.clientY - apertado.y) > 12) abrir('arrastar', apertado.el);
    apertado = null;
  }, true);
  addEventListener('scroll', function () {
    var agora = Date.now();
    if (agora - ultimoScroll < 800) return;
    ultimoScroll = agora;
    abrir('scroll', null);
  }, true);
  addEventListener('hashchange', function () { abrir('navegacao', null); });
  document.addEventListener('transitionstart', function (e) { efeito('transição ' + e.propertyName + ' em ' + seletorDe(e.target)); }, true);
  document.addEventListener('animationstart', function (e) { efeito('animação ' + e.animationName + ' em ' + seletorDe(e.target)); }, true);
  if (window.MutationObserver) {
    new MutationObserver(function (lista) {
      lista.forEach(function (m) {
        if (m.type !== 'attributes' || !m.target || m.target === marca) return;
        var n = m.attributeName;
        if (n === 'aria-expanded' || n === 'open' || n === 'aria-selected' || n === 'aria-pressed' || n === 'data-estado' || n === 'class') {
          var v = m.target.getAttribute(n);
          efeito((n === 'class' ? 'classe' : n) + (n === 'class' ? ' mudou' : '=' + v) + ' em ' + seletorDe(m.target));
        }
      });
    }).observe(document.documentElement, { subtree: true, attributes: true, attributeFilter: ['aria-expanded', 'open', 'aria-selected', 'aria-pressed', 'data-estado', 'class'] });
  }

  /* ---------- mensagens ---------- */
  addEventListener('message', function (e) {
    if (e.source !== pai || !e.data || typeof e.data !== 'object') return;
    var d = e.data;
    if (d.kcxCmp === 'inspecionar') { inspecionando = !!d.ativo; if (!inspecionando) contornar(null); }
    if (d.kcxCmp === 'destacar') {
      var el; try { el = document.querySelector(String(d.seletor)); } catch (x) { el = null; }
      contornar(el, d.rotulo);
      if (el) setTimeout(function () { if (!inspecionando) contornar(null); }, 1200);
    }
    if (d.kcxCmp === 'medir') {
      var out = {};
      (Array.isArray(d.seletores) ? d.seletores : []).slice(0, 60).forEach(function (s) {
        var el2; try { el2 = document.querySelector(String(s)); } catch (x) { el2 = null; }
        if (el2) out[s] = medir(el2);
      });
      enviar({ kcxCmp: 'medidas', palco: { largura: innerWidth, altura: innerHeight }, elementos: out, viewport: viewport() });
    }
    if (d.kcxCmp === 'irPara' && typeof d.ms === 'number' && isFinite(d.ms)) irPara(Math.max(0, d.ms));
    if (d.kcxCmp === 'soltar') (document.getAnimations ? document.getAnimations() : []).forEach(function (a) { a.play(); });
    if (d.kcxCmp === 'log') registrando = !!d.ativo;
  });
})();`;

/** Acrescenta o inspetor ao documento do preview (antes de </body>). */
export function comInspetor(documento: string): string {
  const script = `<script>\n${SCRIPT_INSPETOR.replace(/<\/script/gi, '<\\/script')}\n</script>\n`;
  const i = documento.lastIndexOf('</body>');
  return i === -1 ? documento + script : documento.slice(0, i) + script + documento.slice(i);
}

/* =====================================================================
   scrypt.js - efeitos da página principal (index.html)
   ===================================================================== */

/* ---------- Imagens reserva ----------
   Se uma foto externa não carregar (onerror="fb(this)" no HTML), troca por um
   SVG gerado aqui, com cores da paleta PAL (escolhida por data-i). */
var PAL = [
  ["#1d2b64", "#f8cdda"],
  ["#0f2027", "#2c5364"],
  ["#232526", "#d7ff3a"],
  ["#41295a", "#2f0743"],
  ["#134e5e", "#71b280"],
  ["#3a1c71", "#d76d77"],
  ["#0b0b0b", "#d7ff3a"],
  ["#141e30", "#243b55"],
  ["#42275a", "#734b6d"],
  ["#000", "#434343"],
];
function fb(img) {
  if (img.dataset.f) return;
  img.dataset.f = 1;
  var i = +img.dataset.i || 0,
    p = PAL[i % PAL.length],
    w = 1200,
    h = 1500;
  var shapes = [
    '<rect x="250" y="720" width="700" height="60" rx="30" fill="#fff" opacity=".9"/><rect x="200" y="620" width="70" height="260" rx="20" fill="#fff"/><rect x="930" y="620" width="70" height="260" rx="20" fill="#fff"/><rect x="140" y="660" width="50" height="180" rx="14" fill="#fff" opacity=".8"/><rect x="1010" y="660" width="50" height="180" rx="14" fill="#fff" opacity=".8"/>',
    '<circle cx="600" cy="800" r="230" fill="#fff" opacity=".9"/><rect x="480" y="470" width="240" height="120" rx="60" fill="none" stroke="#fff" stroke-width="40" opacity=".9"/>',
    '<polygon points="0,1500 420,820 700,1150 900,900 1200,1500" fill="#fff" opacity=".85"/><circle cx="900" cy="420" r="110" fill="#fff" opacity=".9"/>',
    '<rect x="380" y="500" width="440" height="800" rx="60" fill="#fff" opacity=".12"/><circle cx="600" cy="640" r="90" fill="#fff" opacity=".9"/><rect x="520" y="740" width="160" height="420" rx="70" fill="#fff" opacity=".9"/><rect x="330" y="760" width="520" height="50" rx="25" fill="#fff" opacity=".9"/>',
  ];
  var svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' +
    w +
    " " +
    h +
    '" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' +
    p[0] +
    '"/><stop offset="1" stop-color="' +
    p[1] +
    '"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><circle cx="1000" cy="250" r="320" fill="#fff" opacity=".07"/><circle cx="150" cy="1300" r="380" fill="#000" opacity=".15"/>' +
    shapes[i % shapes.length] +
    "</svg>";
  img.src = "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}
document.querySelectorAll("img").forEach(function (im) {
  if (im.complete && im.naturalWidth === 0) fb(im);
});

/* ---------- Parallax + movimento ao rolar ---------- */
var reduce = matchMedia("(prefers-reduced-motion:reduce)").matches; // respeita "reduzir movimento"
var imgs = [].slice.call(document.querySelectorAll("[data-speed]")); // fotos com parallax
var mq = document.querySelector("[data-x]"); // texto do letreiro
var heroTxt = document.querySelector(".hero>div");
var hdr = document.querySelector("header");
var bar = document.querySelector(".bar");
var lastY = 0,
  ticking = false,
  hasCSSbar = CSS.supports("animation-timeline:scroll()"); // barra feita só em CSS?

/* Roda no máximo 1x por quadro (ver req). Tudo é calculado a partir da
   posição de cada elemento na tela, então funciona em qualquer tamanho. */
function frame() {
  ticking = false;
  var y = scrollY,
    vh = innerHeight;

  if (!reduce) {
    /* 1) Fotos: a imagem é 130% da moldura; deslocamos dentro da folga de 15%.
          c = distância do centro da moldura ao centro da tela.
          t = deslocamento (proporcional a c e a data-speed, limitado a +-max).
          sc = leve zoom quando a foto está no centro da tela. */
    imgs.forEach(function (el) {
      var p = el.parentElement.getBoundingClientRect();
      if (p.bottom < -200 || p.top > vh + 200) return; // fora da tela: ignora
      var c = p.top + p.height / 2 - vh / 2,
        max = (el.offsetHeight - p.height) / 2;
      var t = Math.max(-max, Math.min(max, -c * parseFloat(el.dataset.speed)));
      var sc = 1 + (1 - Math.min(Math.abs(c) / vh, 1)) * 0.06;
      el.style.transform = "translate3d(0," + t + "px,0) scale(" + sc + ")";
    });

    /* 2) Texto do hero: desce mais devagar que a página e esmaece */
    if (heroTxt && y < vh * 1.2) {
      heroTxt.style.transform = "translate3d(0," + y * 0.35 + "px,0)";
      heroTxt.style.opacity = Math.max(0, 1 - y / (vh * 0.8));
    }

    /* 3) Letreiro: anda para a esquerda conforme a seção sobe na tela */
    var m = mq.parentElement.getBoundingClientRect();
    mq.style.transform =
      "translate3d(" + -(vh - m.top) * parseFloat(mq.dataset.x) * 2 + "px,0,0)";
  }

  /* 4) Cabeçalho: ganha fundo após 60px e some ao descer (volta ao subir) */
  hdr.classList.toggle("solid", y > 60);
  hdr.classList.toggle("hide", y > lastY && y > 400);
  lastY = y;

  /* 5) Barra de progresso (só se o CSS não conseguir fazer sozinho) */
  if (!hasCSSbar) {
    var h = document.documentElement.scrollHeight - vh;
    bar.style.transform = "scaleX(" + (h > 0 ? y / h : 0) + ")";
  }
}
function req() {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(frame);
  }
}
addEventListener("scroll", req, { passive: true });
addEventListener("resize", req); // recalcula ao girar o celular / redimensionar
frame();

/* ---------- Fade ao entrar na tela ----------
   Todo elemento com class="rv" ganha a classe "in" quando 15% dele aparece;
   o CSS (.rv / .rv.in) faz a animação. Observa uma vez só e solta. */
var io = new IntersectionObserver(
  function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.15 },
);
document.querySelectorAll(".rv").forEach(function (el) {
  io.observe(el);
});

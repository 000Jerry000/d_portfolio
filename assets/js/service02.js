// =========================================================
//  浄化槽管理（service02.html）専用JS
//  ※ 既存の共通JS（common.js）は変更せず、このファイルで固有演出のみ追加。
//     GSAP / ScrollTrigger は common.js 側で読み込み・初期化済み。
//
//  【SYSTEMのスクロール連動】
//  左の構造図（diagram）は sticky で固定。右の body をスクロールすると、
//  中央に来た body に合わせて diagram の画像（structure_img01〜03）と
//  body の活性状態（is-active）を切り替える。
// =========================================================
(function () {
  "use strict";

  if (typeof window.gsap === "undefined" || typeof window.ScrollTrigger === "undefined") return;

  var bodies = Array.prototype.slice.call(document.querySelectorAll(".js-system-body"));
  var imgs = Array.prototype.slice.call(document.querySelectorAll(".s2-system__diagram-img"));
  if (!bodies.length || !imgs.length) return;

  function activate(index) {
    bodies.forEach(function (el, i) { el.classList.toggle("is-active", i === index); });
    imgs.forEach(function (el, i) { el.classList.toggle("is-active", i === index); });
  }

  // 切替はPCのみ（SPは各body内にdiagramを表示して通常フローで並べる）
  gsap.matchMedia().add("(min-width: 769px)", function () {
    var triggers = bodies.map(function (body, i) {
      var next = bodies[i + 1];
      return ScrollTrigger.create({
        trigger: body,
        start: "top center",
        endTrigger: next || body,
        end: next ? "top center" : "bottom center",
        onToggle: function (self) { if (self.isActive) activate(i); },
      });
    });
    return function () {
      triggers.forEach(function (t) { t.kill(); });
      activate(0); // クリーンアップ時は初期状態へ
    };
  });

  // =========================================================
  //  s2-flow（循環図）：スクロールで順次表示（PCのみ）
  //  法定検査 → 弧+矢印 → 定期点検 → 弧+矢印 → 浄化槽清掃 → 弧+矢印
  //  is-reveal（初期非表示）を付与し、ビューに入ったら is-in で
  //  CSSのanimation-delayによりスタッガー表示する。
  // =========================================================
  gsap.matchMedia().add("(min-width: 769px)", function () {
    var tri = document.querySelector(".s2-flow__triangle");
    if (!tri) return function () {};
    // 動きを減らす設定なら順次表示せず全て表示のまま
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return function () {};
    tri.classList.add("is-reveal");
    var st = ScrollTrigger.create({
      trigger: tri,
      start: "top 65%",
      once: true,
      onEnter: function () { tri.classList.add("is-in"); },
    });
    return function () {
      if (st) st.kill();
      tri.classList.remove("is-reveal", "is-in");
    };
  });

  // =========================================================
  //  スクロールでふわっと表示（PC/SP共通）
  //   ・s2-point__list：ふわっと表示
  //   ・s2-cards__flow：STEPを1から順にふわっと → 線は最後
  //  ※ JSが無効なら常時表示（is-reveal はJSで付与）。reduced-motionは即表示。
  // =========================================================
  (function initReveal() {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var targets = [];
    var pointList = document.querySelector(".s2-point__list");
    if (pointList) targets.push(pointList);
    Array.prototype.forEach.call(document.querySelectorAll(".s2-cards__flow"), function (el) {
      targets.push(el);
    });
    if (!targets.length) return;

    targets.forEach(function (el) { el.classList.add("is-reveal"); });

    if (!("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -12% 0px", threshold: 0.15 }
    );
    targets.forEach(function (el) { io.observe(el); });
  })();

  window.addEventListener("load", function () {
    ScrollTrigger.refresh();
  });
})();

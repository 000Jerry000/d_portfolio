// =========================================================
//  サービス詳細（service01.html）専用JS
//  ※ 既存の共通JS（common.js）は変更せず、このファイルで固有演出のみ追加。
//     GSAP / ScrollTrigger / Lenis は common.js 側で読み込み・初期化済み。
//
//  【せり上がりの土台化（MV・EQUIPMENT）】
//  縦長のセクションを「全内容スクロール表示 → 下端がビューポート下端に来たら
//  position:fixed;bottom:0 で固定 → その上に次セクションが乗り上げて重なる」。
//  fixed化で土台がフローから外れる分は、次セクションの margin-top に
//  土台の高さを補償して飛びを防ぐ。
//  MV はビューポートに収まる高さなら上部sticky（.is-sticky-top）にする。
// =========================================================
(function () {
  "use strict";

  if (typeof window.gsap === "undefined" || typeof window.ScrollTrigger === "undefined") return;

  // せり上がりの土台化は PC / SP 共通で適用（EQUIPMENT→MV、SERVICE→EQUIPMENT）
  gsap.matchMedia().add("(min-width: 1px)", function () {
    var mv = document.querySelector(".service-mv");
    var eq = document.querySelector(".service-equipment");
    var svc = document.querySelector(".service-service");
    if (!mv || !eq || !svc) return;

    var allUnpin = [];

    // pinEl を「下端固定」し、nextEl で高さ補償する土台化。
    // enabled() が false の間はトリガー無効（開始位置を遠くに飛ばす）。
    function makeBottomPin(pinEl, nextEl, enabled) {
      var pinned = false;
      function pin() {
        if (pinned || (enabled && !enabled())) return;
        nextEl.style.marginTop = pinEl.offsetHeight + "px";
        pinEl.classList.add("is-pinned");
        pinned = true;
      }
      function unpin() {
        if (!pinned) return;
        pinEl.classList.remove("is-pinned");
        nextEl.style.marginTop = "";
        pinned = false;
      }
      allUnpin.push(unpin);

      ScrollTrigger.create({
        start: function () {
          if (enabled && !enabled()) return 1e9; // 無効時は発火させない
          return pinEl.getBoundingClientRect().bottom + window.scrollY - window.innerHeight;
        },
        end: function () {
          if (enabled && !enabled()) return 1e9 + 1;
          return pinEl.getBoundingClientRect().bottom + window.scrollY;
        },
        onEnter: pin,
        onLeave: unpin,
        onEnterBack: pin,
        onLeaveBack: unpin,
      });
    }

    // MV：ビューポートに収まる高さなら上部sticky、収まらないなら下端固定
    var mvTall = false;
    function updateMvMode() {
      mvTall = mv.offsetHeight > window.innerHeight + 2;
      mv.classList.toggle("is-sticky-top", !mvTall);
    }
    updateMvMode();

    makeBottomPin(mv, eq, function () { return mvTall; });
    makeBottomPin(eq, svc); // EQUIPMENT は常に縦長

    // 位置計測の前に全ピンを解除（fixed中は位置がズレるため）＋ MVモード更新
    function beforeRefresh() {
      allUnpin.forEach(function (fn) { fn(); });
      updateMvMode();
    }
    ScrollTrigger.addEventListener("refreshInit", beforeRefresh);

    return function () {
      allUnpin.forEach(function (fn) { fn(); });
      mv.classList.remove("is-sticky-top", "is-pinned");
      ScrollTrigger.removeEventListener("refreshInit", beforeRefresh);
    };
  });

  // =========================================================
  //  FLOW：スクロール位置に応じて現在のステップに .is-active を付与
  //  各ステップは「自分の上端が画面中央に来た時点 → 次ステップの上端が
  //  画面中央に来る時点」までアクティブ（隙間・重なりなく1つだけ点灯）。
  // =========================================================
  (function initFlowActive() {
    var steps = Array.prototype.slice.call(
      document.querySelectorAll(".service-flow__step")
    );
    if (!steps.length) return;

    steps.forEach(function (step, i) {
      var next = steps[i + 1];
      ScrollTrigger.create({
        trigger: step,
        start: "top center",
        endTrigger: next || step,
        end: next ? "top center" : "bottom center",
        onToggle: function (self) {
          step.classList.toggle("is-active", self.isActive);
        },
      });
    });
  })();

  // =========================================================
  //  スクロールで下からふわっと表示
  //  対象：サービス例リスト / グリストラップのながれ・BEFORE-AFTER / 緊急対応バナー
  //  ※ JSが無効でも内容は表示されるよう、隠す .sv-reveal はJSで付与する。
  // =========================================================
  (function initReveal() {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var selectors = [
      ".service-block__list",
      ".service-grease__flow",
      ".service-grease__ba",
      ".service-emergency__banner",
    ];
    var els = [];
    selectors.forEach(function (sel) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) {
        els.push(el);
      });
    });
    if (!els.length) return;

    els.forEach(function (el) { el.classList.add("sv-reveal"); });

    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-inview"); });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-inview");
            io.unobserve(e.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );
    els.forEach(function (el) { io.observe(el); });
  })();

  window.addEventListener("load", function () {
    ScrollTrigger.refresh();
  });
})();

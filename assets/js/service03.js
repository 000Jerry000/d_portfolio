// =========================================================
//  事業所ごみ・産業廃棄物回収（service03.html）専用JS
//  ※ 既存の共通JS（common.js）は変更せず、このファイルで固有演出のみ追加。
//     GSAP / ScrollTrigger は common.js 側で読み込み・初期化済み。
//
//  【FLOW：スクロール位置に応じて現在のステップに .is-active を付与】
//  各ステップは「自分の上端が画面中央に来た時点 → 次ステップの上端が
//  画面中央に来る時点」までアクティブ（隙間・重なりなく1つだけ点灯）。
//  ※ service01 の FLOW と同一挙動。
// =========================================================
(function () {
  "use strict";

  if (typeof window.gsap === "undefined" || typeof window.ScrollTrigger === "undefined") return;

  // =========================================================
  //  MV → MERIT せり上がり（service01/02 と同一方式）
  //  MV は最初フツーにスクロール表示 → 下端がビューポート下端に来たら
  //  position:fixed;bottom:0（.is-pinned）で固定 → その上に MERIT が乗り上げる。
  //  fixed化でフローから外れる分は MERIT の margin-top で高さ補償。
  //  MV がビューポートに収まる高さなら上部sticky（.is-sticky-top）にする。
  // =========================================================
  gsap.matchMedia().add("(min-width: 1px)", function () {
    var mv = document.querySelector(".service-mv");
    var merit = document.querySelector(".s3-merit");
    if (!mv || !merit) return;

    var pinned = false;
    var mvTall = false;

    function updateMvMode() {
      mvTall = mv.offsetHeight > window.innerHeight + 2;
      mv.classList.toggle("is-sticky-top", !mvTall);
    }
    updateMvMode();

    function pin() {
      if (pinned || !mvTall) return;
      merit.style.marginTop = mv.offsetHeight + "px";
      mv.classList.add("is-pinned");
      pinned = true;
    }
    function unpin() {
      if (!pinned) return;
      mv.classList.remove("is-pinned");
      merit.style.marginTop = "";
      pinned = false;
    }

    ScrollTrigger.create({
      start: function () {
        if (!mvTall) return 1e9; // sticky運用時は発火させない
        return mv.getBoundingClientRect().bottom + window.scrollY - window.innerHeight;
      },
      end: function () {
        if (!mvTall) return 1e9 + 1;
        return mv.getBoundingClientRect().bottom + window.scrollY;
      },
      onEnter: pin,
      onLeave: unpin,
      onEnterBack: pin,
      onLeaveBack: unpin,
    });

    // 位置計測の前にピン解除（fixed中は位置がズレるため）＋ MVモード再判定
    function beforeRefresh() {
      unpin();
      updateMvMode();
    }
    ScrollTrigger.addEventListener("refreshInit", beforeRefresh);

    return function () {
      unpin();
      mv.classList.remove("is-sticky-top", "is-pinned");
      ScrollTrigger.removeEventListener("refreshInit", beforeRefresh);
    };
  });

  var steps = Array.prototype.slice.call(
    document.querySelectorAll(".service-flow__step")
  );
  if (steps.length) {
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
  }

  // =========================================================
  //  MERIT：各itemが領域に入った時に順番にふわっと表示（PC/SP共通）
  //  itemを個別に監視するので、まだ画面外のitemが先に出ることはない。
  //  同時に入った（同じ行の）itemはDOM順に少しずつ遅延させて順番に。
  //  ※ JS無効なら常時表示（is-reveal はJSで付与）。reduced-motionは即表示。
  // =========================================================
  (function initMeritReveal() {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var items = Array.prototype.slice.call(document.querySelectorAll(".s3-merit__item"));
    if (!items.length) return;

    items.forEach(function (el) { el.classList.add("is-reveal"); });

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-shown"); });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        // 同じタイミングで入ったものはDOM順に並べ、少しずつ遅らせて順番に出す
        entries
          .filter(function (e) { return e.isIntersecting; })
          .sort(function (a, b) { return items.indexOf(a.target) - items.indexOf(b.target); })
          .forEach(function (e, i) {
            var el = e.target;
            io.unobserve(el);
            setTimeout(function () { el.classList.add("is-shown"); }, i * 130);
          });
      },
      { root: null, rootMargin: "0px 0px -12% 0px", threshold: 0.2 }
    );
    items.forEach(function (el) { io.observe(el); });
  })();

  window.addEventListener("load", function () {
    ScrollTrigger.refresh();
  });
})();

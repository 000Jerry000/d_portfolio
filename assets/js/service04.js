// =========================================================
//  粗大ごみ回収（service04.html）専用JS
//  ※ 既存の共通JS（common.js）は変更せず、このファイルで固有演出のみ追加。
//     GSAP / ScrollTrigger は common.js 側で読み込み・初期化済み。
// =========================================================
(function () {
  "use strict";

  // =========================================================
  //  スクロールで下からふわっと表示（プランの各項目 / アイテム例の各セル）
  //  各要素を個別に監視し、ビューに入ったものだけ順に表示。
  //  同時に入った（同じ行の）要素はDOM順に少し遅らせて順番に出す。
  //  ※ GSAP に依存しないので先に初期化（is-reveal はJSで付与）。
  //    JS無効なら常時表示、reduced-motion なら即表示。
  // =========================================================
  (function initReveal() {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function setup(selector, stagger) {
      var items = Array.prototype.slice.call(document.querySelectorAll(selector));
      if (!items.length) return;
      items.forEach(function (el) { el.classList.add("is-reveal"); });

      if (!("IntersectionObserver" in window)) {
        items.forEach(function (el) { el.classList.add("is-shown"); });
        return;
      }

      var io = new IntersectionObserver(
        function (entries) {
          entries
            .filter(function (e) { return e.isIntersecting; })
            .sort(function (a, b) { return items.indexOf(a.target) - items.indexOf(b.target); })
            .forEach(function (e, i) {
              var el = e.target;
              io.unobserve(el);
              setTimeout(function () { el.classList.add("is-shown"); }, i * stagger);
            });
        },
        { root: null, rootMargin: "0px 0px -12% 0px", threshold: 0.2 }
      );
      items.forEach(function (el) { io.observe(el); });
    }

    setup(".s4-items__cell", 90);
    setup(".s4-plan__item", 120);
  })();

  if (typeof window.gsap === "undefined" || typeof window.ScrollTrigger === "undefined") return;

  // =========================================================
  //  MV → SUPPORT せり上がり（service01/02/03 と同一方式）
  //  MV は最初フツーにスクロール表示 → 下端がビューポート下端に来たら
  //  position:fixed;bottom:0（.is-pinned）で固定 → その上に SUPPORT が乗り上げる。
  //  fixed化でフローから外れる分は SUPPORT の margin-top で高さ補償。
  //  MV がビューポートに収まる高さなら上部sticky（.is-sticky-top）にする。
  // =========================================================
  gsap.matchMedia().add("(min-width: 1px)", function () {
    var mv = document.querySelector(".service-mv");
    var support = document.querySelector(".s4-support");
    if (!mv || !support) return;

    var pinned = false;
    var mvTall = false;

    function updateMvMode() {
      mvTall = mv.offsetHeight > window.innerHeight + 2;
      mv.classList.toggle("is-sticky-top", !mvTall);
    }
    updateMvMode();

    function pin() {
      if (pinned || !mvTall) return;
      support.style.marginTop = mv.offsetHeight + "px";
      mv.classList.add("is-pinned");
      pinned = true;
    }
    function unpin() {
      if (!pinned) return;
      mv.classList.remove("is-pinned");
      support.style.marginTop = "";
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

  // =========================================================
  //  FLOW：スクロール位置に応じて現在のステップに .is-active を付与
  //  （service01/03 と同一挙動）
  // =========================================================
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

  window.addEventListener("load", function () {
    ScrollTrigger.refresh();
  });
})();

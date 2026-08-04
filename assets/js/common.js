gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis();

lenis.on("scroll", ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

$(window).on("load", function () {
  setTimeout(function () {
    const target = document.querySelectorAll(".js-io");
    const targetArray = Array.prototype.slice.call(target);
    const options = {
      root: null,
      rootMargin: "0% 0% -15% 0%",
      threshold: 0,
    };
    const observer = new IntersectionObserver(callback, options);
    targetArray.forEach((tgt) => {
      observer.observe(tgt);
    });

    function callback(entries) {
      entries.forEach(function (entry, i) {
        const target = entry.target;

        if (entry.isIntersecting && !target.classList.contains("_show")) {
          const delay = i * 100;
          setTimeout(function () {
            target.classList.add("_show");
          }, delay);
        }
      });
    }
  }, 400);
});

// ヘッダー：ハンバーガーメニューの開閉
const $btn = $(".js-header-menu");
const isOpen = $btn.hasClass("is-open");
const menu = document.querySelector(".js-sp-menu");
const overlay = document.querySelector(".full-bg");

function menuActive() {
  $btn.toggleClass("is-open");
  $btn.attr("aria-expanded", !isOpen);
  $btn.attr("aria-label", isOpen ? "メニューを開く" : "メニューを閉じる");
  $("body").toggleClass("is-menu-active");
  $(".full-bg").toggleClass("open-menu");
  
  
  // menuBtn.classList.toggle("is-open");
  menu.classList.toggle("is-open");
  document.body.classList.toggle("is-fixed");
}
$(".js-header-menu").on("click", menuActive);
$(".full-bg").on("click", menuActive);

$(document).ready(function () {
  var browserWidth = $(window).width();

  if (browserWidth > "768") {
    gsap.utils.toArray(".js-plx").forEach((el) => {
      const speed = el.getAttribute("data-plx-speed") * 10;
      gsap.set(el, {
        y: speed,
      });

      gsap.to(el, {
        y: -1 * speed,
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          toggleActions: "play reverse play reverse",
          scrub: 0.1,
        },
      });
    });
  }

  // loading
  const body = $("body");

  if (body.hasClass("front-page")) {
    var imgLoad = imagesLoaded("body");
    var images = $("img").length,
      loadedCount = 0,
      loadingProgress = 0,
      tlProgress = gsap.timeline();

    imgLoad.on("progress", function (instance, image) {
      loadProgress();
    });

    function loadProgress() {
      loadedCount++;
      loadingProgress = loadedCount / images;

      gsap.to(tlProgress, { progress: loadingProgress, duration: 1 });
    }

    var tlProgress = gsap.timeline({
      paused: true,
      onComplete: loadComplete,
    });

    function loadComplete() {
      setTimeout(() => {
        $(".loading__elem").addClass("loaded");
      }, 500);
    }
  } else {
    $("body").addClass("loaded");
  }
});

$(".to-concept").click(function (event) {
  event.preventDefault();

  const targetTop = $(".sec-concept").offset().top;
  const margin = $(window).height() * 0.15;

  $("html, body").animate(
    {
      scrollTop: targetTop - margin,
    },
    "slow",
  );
});

$(".to-about").click(function (event) {
  event.preventDefault();

  const targetTop = $(".sec-about").offset().top;

  $("html, body").animate(
    {
      scrollTop: targetTop,
    },
    "slow",
  );
});

$(".to-service").click(function (event) {
  event.preventDefault();

  const targetTop = $(".sec-service").offset().top;

  $("html, body").animate(
    {
      scrollTop: targetTop,
    },
    "slow",
  );
});

$(".to-contact").click(function (event) {
  event.preventDefault();

  const targetTop = $(".sec-contact").offset().top;

  $("html, body").animate(
    {
      scrollTop: targetTop,
    },
    "slow",
  );
});

$(".to-top").click(function () {
  $("html, body").animate(
    {
      scrollTop: 0,
    },
    "slow",
  );
});

$(function () {
  const params = new URLSearchParams(window.location.search);
  const targetClass = params.get("target");

  const targetMap = {
    concept: ".to-concept",
    about: ".to-about",
    service: ".to-service",
    contact: ".to-contact",
  };

  if (targetMap[targetClass]) {
    $(targetMap[targetClass]).click();
    history.replaceState(
      null,
      "",
      window.location.origin + window.location.pathname,
    );
  }
});

// =================================== slide =================================
const swiper1 = new Swiper('.serviceSlider', {

  loop: true,
  centeredSlides: true,
  pagination: {
    el: '.swiper-pagination',
  },
  navigation: {
    nextEl: '.service-next',
    prevEl: '.service-prev',
  },
  slidesPerView: 1,
  autoplay: {

    delay: 3000,
    disableOnInteraction: false,
    pauseOnMouseEnter: true,

  },
  breakpoints: {
    768: {
      slidesPerView: 1,
    },
    769: {
      slidesPerView: 3,
    },
    1500: {
      slidesPerView: 3,
    },
    2000: {
      slidesPerView: 5,
    },
  },
});

const swiper2 = new Swiper('.interviewSlider', {

  loop: true,
  centeredSlides: true,
  pagination: {
    el: '.swiper-pagination',
  },
  navigation: {
    nextEl: '.nav-next',
    prevEl: '.nav-prev',
  },
  slidesPerView: 1,
  autoplay: {

    delay: 5000,
    disableOnInteraction: false,
    pauseOnMouseEnter: true,

  },
  breakpoints: {
    2000: {
      slidesPerView: 1,
    },
  },
});



// ------------ 統一トラック：マップの truck-1 が追従トラックになる ------------
// マップ内の truck-1 が左下の定位置（旧 #sticky_truck と同じ bottom:100rem）まで来たら
// position:fixed に切り替えて追従。旧 #sticky_truck は使わず1台に統一する。
// 向き(left/right)・hide は、追従中のみ各 .road セクションの data-direction を適用。
const sections = document.querySelectorAll('.road');
const truck1 = document.querySelector('.sec-map__inner .truck-1');

// 旧・浮遊トラックは非表示（統一）
const oldStickyTruck = document.getElementById('sticky_truck');
if (oldStickyTruck) oldStickyTruck.style.display = 'none';

let truckFollowing = false;

if (truck1) {
  // 追従の開始/終了（PCのみ。SPは元々トラック非表示のため対象外）
  // ScrollTrigger の pin は要素にインライン transform を付与し、向き反転(scaleX)を潰すため使わない。
  // 代わりに「追従前の自然位置から算出した固定スクロール量」をトリガーにし、position:fixed(.is-following)を手動切替。
  // トリガーは動かない数値なのでフィードバックせず、CSSの transform(向き反転)も自由に使える。
  gsap.matchMedia().add('(min-width: 768px)', () => {
    // 追従前（absolute）の truck-1 下端の絶対座標を記録
    const rect = truck1.getBoundingClientRect();
    const truckDocBottom = rect.bottom + window.scrollY;

    const footerEl = document.querySelector('.footer');

    // 停車位置をフッターからどれだけ上げるか（rem）。大きいほど上で止まる（調整用）
    const parkRaiseRem = 100;
    const parkRaisePx = () => parseFloat(getComputedStyle(document.documentElement).fontSize) * parkRaiseRem;

    const clearPark = () => { truck1.style.top = ''; truck1.style.left = ''; };

    // 追従中（画面左下に fixed）
    const setFollowing = () => {
      truck1.classList.remove('is-parked', 'hide');
      clearPark();
      truck1.classList.add('is-following');
      truckFollowing = true;
    };
    // マップ内の元位置へ戻す（開始位置より上へスクロールした時）
    const setNormal = () => {
      truck1.classList.remove('is-following', 'is-parked', 'left', 'right', 'hide');
      clearPark();
      truckFollowing = false;
    };
    // その場に停車（sec-footer-map 上）：フッター上端の少し上・左下に確定配置し、以降ページと一緒にスクロール
    // → 非表示にせず、フッター手前に留まったまま表示され続ける（発火タイミングに依存せず被りゼロ）
    const setParked = () => {
      truck1.classList.remove('is-following', 'hide');
      truck1.classList.add('is-parked');                   // position:absolute 化
      const op = truck1.offsetParent || document.body;     // 絶対配置後の基準（sec-map__inner）
      const opr = op.getBoundingClientRect();
      const opDocTop = opr.top + window.scrollY;
      const opDocLeft = opr.left + window.scrollX;
      const offset = parseFloat(getComputedStyle(document.documentElement).fontSize) * 100; // 100rem(px)＝追従時と同じ左/下オフセット
      const truckH = truck1.getBoundingClientRect().height;
      const footerTop = footerEl
        ? footerEl.getBoundingClientRect().top + window.scrollY
        : ScrollTrigger.maxScroll(window) + window.innerHeight;
      // 左：追従時と同じ 100rem、上：フッター上端から (100rem + parkRaise + トラック高さ) ぶん上
      truck1.style.left = (offset - opDocLeft) + 'px';
      truck1.style.top = (footerTop - offset - parkRaisePx() - truckH - opDocTop) + 'px';
      truckFollowing = false;
    };

    const st = ScrollTrigger.create({
      // 下端が画面の90%位置（≒左下の定位置 bottom:100rem）に来たら追従開始
      start: () => truckDocBottom - window.innerHeight * 0.9,
      // フッター上端が画面下端に来る手前で停車（フッターには被らない）。parkRaise ぶん早めて停車位置を上げる（ジャンプ無し）
      end: () => {
        if (!footerEl) return ScrollTrigger.maxScroll(window);
        const footerTop = footerEl.getBoundingClientRect().top + window.scrollY;
        return footerTop - window.innerHeight - parkRaisePx();
      },
      onEnter: setFollowing,       // 下スクロールで開始域に入る → 追従
      onEnterBack: setFollowing,   // 上スクロールで停車域から戻る → 追従に復帰
      onLeave: setParked,          // 下スクロールで終端 → sec-footer-map 上に停車（非表示にしない）
      onLeaveBack: setNormal,      // 上スクロールで開始域より戻る → マップ内の元位置へ
    });
    return () => {
      st.kill();
      truckFollowing = false;
      truck1.classList.remove('is-following', 'is-parked', 'left', 'right', 'hide');
      clearPark();
    };
  });

  // 向き/hide：追従中のみ、表示中セクションの data-direction を truck-1 に適用
  const truckObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      if (!truckFollowing) return;            // マップ内（追従前）は通常表示のまま
      const direction = entry.target.dataset.direction;
      truck1.classList.remove('left', 'right', 'hide');
      truck1.classList.add(direction);
    });
  }, { threshold: 0.5 });

  sections.forEach(section => truckObserver.observe(section));

  // クリックでページTOPへスムーススクロール（追従中・停車中のみ。マップ内の装飾状態では無効）
  truck1.addEventListener('click', () => {
    if (!truck1.classList.contains('is-following') && !truck1.classList.contains('is-parked')) return;
    lenis.scrollTo(0);
  });
}

// ------------ sec-message: 背景ピン留め＋コンテンツせり上がり（試作） ------------
// 背景(.movie)をスクロール中だけピン留めし、その上を __inner がせり上がって重なる演出。
// 既存CSSには手を入れず、JSのみで実装（不要なら本ブロックを削除すれば元に戻る）。
// pinSpacing:false … .movie は position:absolute（フロー外）なのでスペーサーを入れない
//                     → 後続セクションのレイアウトはズレない
{
  const messageMM = gsap.matchMedia();

  messageMM.add('(min-width: 768px)', () => {
    const sec = document.querySelector('.sec-message');
    if (!sec) return;
    const movie = sec.querySelector('.movie');
    const inner = sec.querySelector('.sec-message__inner');
    if (!movie || !inner) return;

    const st = ScrollTrigger.create({
      trigger: sec,
      start: 'top top',                       // セクション上端が画面上端に来たら背景を固定
      end: () => '+=' + inner.offsetHeight,   // __inner の高さぶんスクロールしたら固定解除
      pin: movie,
      pinSpacing: false,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      // markers: true,                        // ← 位置調整時はコメントを外すと開始/終了が可視化される
    });

    return () => st.kill();                     // 画面幅が条件から外れたら破棄（レスポンシブ対応）
  });
}

// ------------ sec-service: 背景ピン留め＋コンテンツせり上がり ------------
// sec-message と同じ演出。ただし背景(.movie)が inner の上側にあり、セクション上端では
// movie がほぼ画面外になるジオメトリのため、pin範囲は「inner が画面下から入る〜画面上端に達する」
// までとする（inner が背景を覆いながらせり上がる区間）。
{
  const serviceMM = gsap.matchMedia();

  serviceMM.add('(min-width: 768px)', () => {
    const sec = document.querySelector('.sec-service');
    if (!sec) return;
    const movie = sec.querySelector('.movie');
    const inner = sec.querySelector('.sec-service__inner');
    if (!movie || !inner) return;

    const st = ScrollTrigger.create({
      trigger: inner,
      start: 'top bottom',   // inner の上端が画面下端に入ったら背景を固定
      end: 'top top',        // inner の上端が画面上端に達したら固定解除（＝せり上がり完了）
      pin: movie,
      pinSpacing: false,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      // markers: true,
    });

    return () => st.kill();
  });
}


// ================== モーダルを見せる ====================

const cards = document.querySelectorAll(".page-vehicle-card");

const popup = document.querySelector(".popup");
const popupImg = document.querySelector(".popup__image");
const popupTitle = document.querySelector(".popup__title");
const popupDesc = document.querySelector(".popup__description");
const closeBtn = document.querySelector(".popup__close");

// Open popup
cards.forEach(card => {

  card.addEventListener("click", () => {
    popupImg.src = card.dataset.image;
    popupTitle.textContent = card.dataset.title;
    popupDesc.textContent = card.dataset.description;
    popup.classList.add("active");
  });

});

// Close button
closeBtn.addEventListener("click", () => {
  popup.classList.remove("active");
});

// Click outside popup
popup.addEventListener("click", e => {
  if (e.target === popup) {
    popup.classList.remove("active");
  }
});

// ===================== time line ==================
const timeline = document.querySelector(".timeline");
const hour = document.querySelector(".clock__hour");
const minute = document.querySelector(".clock__minute");

window.addEventListener("scroll", () => {

  const maxScroll =
    document.body.scrollHeight - innerHeight;

  const progress =
    window.scrollY / maxScroll;

  // 横移動
  const move =
    progress * (timeline.scrollWidth - innerWidth);

  timeline.style.transform =
    `translateX(-${move}px)`;

  // 時計
  hour.style.transform =
    `translateX(-50%) rotate(${progress * 360}deg)`;

  minute.style.transform =
    `translateX(-50%) rotate(${progress * 2160}deg)`;

});
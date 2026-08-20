import "./styles.css";
import { gsap } from "gsap";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ExternalLink, Maximize2, Menu, Play, X, createIcons } from "lucide";
import content from "./content/site.json";

let ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger;

type ResultItem = (typeof content.results)[number] & {
  title?: string;
  summary?: string;
  date?: string;
  platform?: string;
  cover?: string;
  href?: string;
  mediaType?: "video";
  src?: string;
};

type SourceItem = {
  id: string;
  title: string;
  publisher: string;
  href: string;
  license: string;
  accessedAt: string;
};

const categoryMeta = {
  documentary: { title: "微纪录片", action: "观看纪录片", className: "is-documentary" },
  interview: { title: "人物采访", action: "观看采访", className: "is-interview" },
  post: { title: "介绍推文", action: "查看推文", className: "is-post" },
  news: { title: "新闻稿", action: "阅读原文", className: "is-news" },
  oralHistory: { title: "口述史", action: "进入口述史", className: "is-oral" },
} as const;

const entersAfterHero = ["#history", "#longquan", "#results", "#creative", "#about"].includes(location.hash);
if (entersAfterHero) setDirectHeroState();
requestAnimationFrame(() => void initializeApp());

async function initializeApp(): Promise<void> {
  ({ ScrollTrigger } = await import("gsap/ScrollTrigger"));
  await nextFrame();
  gsap.registerPlugin(ScrollTrigger);
  renderHistory();
  renderRouteStops();
  renderResults();
  await nextFrame();
  renderMeta();
  renderSources();
  initializeIcons();
  initializeRouteMap();
  initializeFieldworkGallery();
  initializeCreativeGallery();
  initializeResultCarousels();
  initializeHeader();
  initializeHistoryNavigation();
  initializeOfflineState();
  initializeScrollRestoration();
  await nextFrame();
  initializeHistoryIllustrations();
  initializeGlazeTransition();
  initializeMotion(entersAfterHero);
  if (entersAfterHero) {
    setDirectHeroState();
    requestAnimationFrame(() => {
      document.getElementById(location.hash.slice(1))?.scrollIntoView();
      ScrollTrigger.update();
    });
  }
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function setDirectHeroState(): void {
  const world = document.querySelector<HTMLElement>("[data-celadon-world]")!;
  const artwork = document.querySelector<HTMLElement>("[data-celadon-artwork]")!;
  const shards = gsap.utils.toArray<SVGGElement>(".celadon-shard");
  gsap.set(world, { "--backdrop-opacity": 0.42 });
  gsap.set([artwork.querySelector(".vessel-art"), artwork.querySelector(".celadon-artwork__outline"), artwork.querySelector(".celadon-artwork__ground")], { autoAlpha: 0 });
  gsap.set(shards, {
    autoAlpha: 0.36,
    x: (_, shard) => Number((shard as SVGGElement).dataset.shardX) * window.innerWidth,
    y: (_, shard) => Number((shard as SVGGElement).dataset.shardY) * window.innerHeight,
    rotation: (_, shard) => Number((shard as SVGGElement).dataset.shardRotation),
    scale: (_, shard) => Number((shard as SVGGElement).dataset.shardScale),
  });
}

function initializeMotion(entersAfterHero: boolean): void {
  const heroProgress = document.querySelector<HTMLElement>(".hero-progress span")!;
  const historyScroll = document.querySelector<HTMLElement>(".history-scroll")!;
  const historyAxis = document.querySelector<SVGSVGElement>(".history-axis")!;
  const axisProgress = document.querySelector<SVGPathElement>("[data-history-axis-progress]")!;
  const traveler = document.querySelector<HTMLElement>("[data-history-traveler]")!;
  const world = document.querySelector<HTMLElement>("[data-celadon-world]")!;
  const artwork = document.querySelector<HTMLElement>("[data-celadon-artwork]")!;
  const vesselArt = artwork.querySelector<SVGGElement>(".vessel-art")!;
  const outline = artwork.querySelector<SVGUseElement>(".celadon-artwork__outline")!;
  const ground = artwork.querySelector<SVGEllipseElement>(".celadon-artwork__ground")!;
  const base = artwork.querySelector<SVGRectElement>(".vessel-art__base")!;
  const wash = artwork.querySelector<SVGImageElement>(".vessel-art__wash")!;
  const growth = artwork.querySelector<SVGGElement>(".vessel-art__growth")!;
  const growthPaths = gsap.utils.toArray<SVGPathElement>(".vessel-growth-path");
  const color = artwork.querySelector<SVGImageElement>(".vessel-art__color")!;
  const shards = gsap.utils.toArray<SVGGElement>(".celadon-shard");

  gsap.set([base, wash, color], { autoAlpha: 0, transformOrigin: "center center" });
  gsap.set(growth, { autoAlpha: 1 });
  growthPaths.forEach((path) => {
    const length = path.getTotalLength();
    gsap.set(path, { strokeDasharray: `${length} ${length + 360}`, strokeDashoffset: length + 180 });
  });
  gsap.set(shards, { autoAlpha: 0, transformOrigin: "center center" });

  const vesselTimeline = gsap.timeline({ paused: true, defaults: { ease: "none" } })
    .to(world, { "--backdrop-opacity": 0.42, duration: 0.72 }, 0)
    .to(base, { autoAlpha: 0.94, duration: 0.24 }, 0.06)
    .fromTo(wash, { autoAlpha: 0 }, { autoAlpha: 0.24, duration: 0.22 }, 0.08)
    .to(growthPaths[0], { strokeDashoffset: 0, duration: 0.46 }, 0.12)
    .to(growthPaths.slice(1, 3), { strokeDashoffset: 0, duration: 0.3, stagger: 0.035 }, 0.3)
    .to(growthPaths.slice(3), { strokeDashoffset: 0, duration: 0.28, stagger: 0.04 }, 0.42)
    .to(color, { autoAlpha: 0.32, duration: 0.18 }, 0.58)
    .to(outline, { opacity: 0.58, duration: 0.16 }, 0.58)
    .to(shards, { autoAlpha: 0.94, duration: 0.04 }, 0.75)
    .to([vesselArt, outline, ground], { autoAlpha: 0, duration: 0.09 }, 0.76)
    .to(shards, {
      x: (_, shard) => Number((shard as SVGGElement).dataset.shardX) * window.innerWidth,
      y: (_, shard) => Number((shard as SVGGElement).dataset.shardY) * window.innerHeight,
      rotation: (_, shard) => Number((shard as SVGGElement).dataset.shardRotation),
      scale: (_, shard) => Number((shard as SVGGElement).dataset.shardScale),
      opacity: 0.36,
      duration: 0.24,
    }, 0.76);

  if (entersAfterHero) vesselTimeline.progress(1);

  const heroScroll = {
    trigger: "#form",
    endTrigger: ".glaze-transition",
    start: "top top",
    end: "bottom bottom",
    scrub: 0.58,
    invalidateOnRefresh: true,
  };
  ScrollTrigger.create({ ...heroScroll, animation: vesselTimeline });
  gsap.to(heroProgress, { scaleX: 1, ease: "none", scrollTrigger: heroScroll });

  initializeChapterPortals();
  initializeTextMotion();

  const axisLength = axisProgress.getTotalLength();
  gsap.set(axisProgress, { strokeDasharray: axisLength, strokeDashoffset: axisLength });
  const historyMotion = { progress: 0 };
  const axisViewHeight = historyAxis.viewBox.baseVal.height;
  const axisCenterX = historyAxis.viewBox.baseVal.width / 2;
  let historyHeight = 1;
  let scrollDistance = 0;
  let travelerCenter = 0;
  let axisScale = 1;
  let axisSamples: Array<{ length: number; x: number; y: number }> = [];

  const measureHistoryMotion = () => {
    historyHeight = historyScroll.offsetHeight;
    scrollDistance = Math.max(0, historyHeight - window.innerHeight);
    travelerCenter = window.innerHeight * 0.42 + traveler.offsetHeight / 2;
    axisScale = historyAxis.getBoundingClientRect().width / 240;
    if (axisSamples.length) return;
    const sampleCount = 96;
    axisSamples = Array.from({ length: sampleCount + 1 }, (_, index) => {
      const length = (axisLength * index) / sampleCount;
      const point = axisProgress.getPointAtLength(length);
      return { length, x: point.x, y: point.y };
    });
  };

  const pointAtAxisY = (targetY: number) => {
    let low = 0;
    let high = axisSamples.length - 1;
    while (low < high) {
      const middle = Math.floor((low + high) / 2);
      if (axisSamples[middle].y < targetY) low = middle + 1;
      else high = middle;
    }
    const upper = axisSamples[low];
    const lowerIndex = Math.max(0, low - 1);
    const lower = axisSamples[lowerIndex];
    const span = Math.max(0.001, upper.y - lower.y);
    const ratio = gsap.utils.clamp(0, 1, (targetY - lower.y) / span);
    const sampleLength = axisLength / (axisSamples.length - 1);
    const tangentRatio = Math.min(1, 14 / sampleLength);
    const lowerNext = axisSamples[Math.min(axisSamples.length - 1, lowerIndex + 1)];
    const upperNext = axisSamples[Math.min(axisSamples.length - 1, low + 1)];
    const lowerTangentX = gsap.utils.interpolate(lower.x, lowerNext.x, tangentRatio);
    const upperTangentX = gsap.utils.interpolate(upper.x, upperNext.x, tangentRatio);
    return {
      length: gsap.utils.interpolate(lower.length, upper.length, ratio),
      x: gsap.utils.interpolate(lower.x, upper.x, ratio),
      tangentX: gsap.utils.interpolate(lowerTangentX, upperTangentX, ratio),
    };
  };

  const updateHistoryMotion = () => {
    const progress = historyMotion.progress;
    const targetY = gsap.utils.clamp(0, axisViewHeight, ((progress * scrollDistance + travelerCenter) / historyHeight) * axisViewHeight);
    const { length: traveledLength, x: axisX, tangentX } = pointAtAxisY(targetY);
    const x = (axisX - axisCenterX) * axisScale;
    const rotation = gsap.utils.clamp(-5, 5, (tangentX - axisX) * axisScale * 0.55);
    const axisVisibility = Math.min(gsap.utils.clamp(0, 1, progress / 0.055), gsap.utils.clamp(0, 1, (1 - progress) / 0.07));
    const vesselVisibility = Math.min(gsap.utils.clamp(0, 1, progress / 0.025), gsap.utils.clamp(0, 1, (1 - progress) / 0.04));
    gsap.set(axisProgress, { strokeDashoffset: axisLength - traveledLength });
    gsap.set(historyAxis, { opacity: axisVisibility });
    gsap.set(traveler, {
      autoAlpha: vesselVisibility,
      x,
      y: Math.sin(progress * Math.PI * 10) * 1.8,
      rotationY: Math.sin(progress * Math.PI * 6) * 9,
      rotationZ: rotation,
    });
  };
  measureHistoryMotion();
  gsap.to(historyMotion, {
    progress: 1,
    ease: "none",
    onUpdate: updateHistoryMotion,
    scrollTrigger: {
      id: "history-axis-motion",
      trigger: historyScroll,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.42,
      invalidateOnRefresh: true,
      onRefresh: measureHistoryMotion,
    },
  });
  updateHistoryMotion();

  document.querySelectorAll<HTMLElement>(".history-chapter").forEach((chapter, index) => {
    const opening = chapter.querySelector<HTMLElement>(".history-opening")!;
    const detail = chapter.querySelector<HTMLElement>(".history-detail")!;
    const plate = chapter.querySelector<HTMLElement>(".history-plate")!;
    const scene = chapter.querySelector<HTMLElement>(".history-scene")!;
    const direction = index % 2 === 0 ? 1 : -1;

    gsap.timeline({
      scrollTrigger: {
        trigger: chapter,
        start: "top 82%",
        end: "top 38%",
        scrub: 0.55,
        invalidateOnRefresh: true,
      },
    })
      .fromTo(opening,
        { x: () => direction * Math.min(window.innerWidth * 0.24, 340), scale: () => window.innerWidth < 768 ? 1.12 : 1.34, transformOrigin: "center center" },
        { x: 0, scale: 1, ease: "none" },
        0,
      )
      .fromTo(detail,
        { autoAlpha: 0, y: 22, clipPath: "inset(0 0 100% 0)" },
        { autoAlpha: 1, y: 0, clipPath: "inset(0 0 0% 0)", ease: "none" },
        0.42,
      )
      .fromTo(plate,
        { autoAlpha: 0, scale: 0.92 },
        { autoAlpha: 0.96, scale: 1, ease: "none" },
        0.55,
      );

    gsap.timeline({
      scrollTrigger: {
        trigger: chapter,
        start: "top 92%",
        end: "bottom 8%",
        scrub: 0.42,
      },
      defaults: { ease: "none" },
    })
      .fromTo(scene,
        { autoAlpha: 0.04, y: 8, scale: 0.985 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.24 },
        0,
      )
      .to(scene,
        { autoAlpha: 0.04, y: -8, scale: 0.985, duration: 0.22 },
        0.78,
      );

    ScrollTrigger.create({
      trigger: chapter,
      start: "top 58%",
      end: "bottom 42%",
      onEnter: () => activateHistory(index),
      onEnterBack: () => activateHistory(index),
    });
  });

  const routeDrawPaths = gsap.utils.toArray<SVGPathElement>(".route-path");
  routeDrawPaths.forEach((path) => {
    const length = path.getTotalLength();
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
  });
  gsap.set(".route-stop", { autoAlpha: 0, scale: 0.7, transformOrigin: "center" });

  gsap.timeline({
    scrollTrigger: { trigger: ".longquan", start: "top 78%", end: "top 12%", scrub: 0.68 },
  })
    .to(".route-path", { strokeDashoffset: 0, duration: 0.52, stagger: 0.08, ease: "none" }, 0.12)
    .to(".route-stop", { autoAlpha: 1, scale: 1, duration: 0.24, stagger: 0.08, ease: "power2.out" }, 0.34);

  const documentaryCover = document.querySelector<HTMLElement>(".is-documentary .result-cover");
  if (documentaryCover) {
    gsap.fromTo(documentaryCover,
      { clipPath: "circle(2% at 78% 31%)" },
      { clipPath: "circle(125% at 78% 31%)", ease: "none", scrollTrigger: { trigger: documentaryCover, start: "top 88%", end: "top 30%", scrub: 0.7 } },
    );
  }

  ScrollTrigger.batch(".result-carousel", {
    start: "top 90%",
    once: true,
    interval: 0.12,
    batchMax: 2,
    onEnter: (items) => gsap.from(items, { autoAlpha: 0, y: 20, duration: 0.48, stagger: 0.08, ease: "power2.out" }),
  });

  document.querySelectorAll<HTMLElement>("[data-section]").forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: "top 45%",
      end: "bottom 45%",
      onToggle: (self) => { if (self.isActive) setActiveNav(section.dataset.section ?? ""); },
    });
  });

  window.addEventListener("load", refreshScrollMeasurements, { once: true });
  document.fonts.ready.then(refreshScrollMeasurements);
}

function initializeChapterPortals(): void {
  const portalInsets = {
    history: { desktop: [18, 29], mobile: [22, 14] },
    longquan: { desktop: [29, 17], mobile: [28, 10] },
    results: { desktop: [20, 32], mobile: [23, 14] },
    about: { desktop: [17, 34], mobile: [22, 17] },
  } as const;

  document.querySelectorAll<HTMLElement>("[data-chapter-portal]").forEach((portal) => {
    const sticky = portal.querySelector<HTMLElement>(".chapter-portal__sticky")!;
    const frame = portal.querySelector<HTMLElement>(".chapter-portal__frame")!;
    const image = portal.querySelector<HTMLImageElement>(".chapter-portal__frame img")!;
    const copyShell = portal.querySelector<HTMLElement>(".chapter-portal__copy-shell")!;
    const copy = portal.querySelector<HTMLElement>(".chapter-portal__copy")!;
    const title = portal.querySelector<HTMLElement>(".chapter-portal__title")!;
    const summary = portal.querySelector<HTMLElement>(".chapter-portal__summary")!;
    const veil = portal.querySelector<HTMLElement>(".chapter-portal__veil")!;
    const artNote = portal.querySelector<HTMLElement>(".chapter-portal__art-note")!;
    const variant = portal.dataset.portalVariant as keyof typeof portalInsets;

    const startClip = () => {
      const size = window.innerWidth < 768 ? portalInsets[variant].mobile : portalInsets[variant].desktop;
      return `inset(${size[0]}% ${size[1]}% ${size[0]}% ${size[1]}% round 4px)`;
    };
    const titleOffset = () => {
      const stickyRect = sticky.getBoundingClientRect();
      const shellRect = copyShell.getBoundingClientRect();
      const titleLeft = shellRect.left + copy.offsetLeft + title.offsetLeft;
      const titleTop = stickyRect.top + copy.offsetTop + title.offsetTop;
      return {
        x: stickyRect.left + stickyRect.width / 2 - (titleLeft + title.offsetWidth / 2),
        y: stickyRect.top + stickyRect.height / 2 - (titleTop + title.offsetHeight / 2),
      };
    };

    gsap.timeline({
      scrollTrigger: {
        trigger: portal,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.55,
        invalidateOnRefresh: true,
      },
    })
      .fromTo(frame,
        { clipPath: startClip },
        { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 0.7, ease: "none" },
        0,
      )
      .fromTo(image,
        { scale: () => window.innerWidth < 768 ? 1.1 : 1.16 },
        { scale: 1, duration: 0.7, ease: "none" },
        0,
      )
      .fromTo(title,
        {
          x: () => titleOffset().x,
          y: () => titleOffset().y,
          scale: () => window.innerWidth < 768 ? 1.1 : 1.28,
          transformOrigin: "center center",
        },
        { x: 0, y: 0, scale: 1, duration: 0.7, ease: "none" },
        0,
      )
      .fromTo(title,
        { autoAlpha: 0.24 },
        { autoAlpha: 1, duration: 0.42, ease: "none" },
        0,
      )
      .fromTo(veil, { opacity: 0.38 }, { opacity: 0.58, duration: 0.7, ease: "none" }, 0)
      .fromTo(summary,
        { autoAlpha: 0, y: 22 },
        { autoAlpha: 1, y: 0, duration: 0.2, ease: "none" },
        0.42,
      )
      .fromTo(artNote,
        { autoAlpha: 0, y: 8 },
        { autoAlpha: 1, y: 0, duration: 0.12, ease: "none" },
        0.54,
      )
      .to(copy, { autoAlpha: 0, y: -16, duration: 0.14, ease: "none" }, 0.86);
  });
}

function initializeTextMotion(): void {
  const heroTitle = document.querySelector<HTMLElement>(".hero h1")!;
  const heroCopy = gsap.utils.toArray<HTMLElement>(".hero-identity, .hero-en, .hero-subtitle, .next-chapter");
  const heroExit = {
    trigger: "#form",
    start: "top top",
    end: () => `+=${Math.min(window.innerHeight * 0.62, 560)}`,
    scrub: 0.42,
    invalidateOnRefresh: true,
  };

  gsap.timeline({ scrollTrigger: heroExit })
    .to(heroTitle, {
      autoAlpha: 0,
      y: -30,
      scale: 0.985,
      duration: 0.78,
      ease: "none",
      overwrite: "auto",
    }, 0.22);
  gsap.to(heroCopy, {
    autoAlpha: 0,
    y: -14,
    stagger: 0.025,
    ease: "none",
    overwrite: "auto",
    scrollTrigger: heroExit,
  });

  const bodyCopy = gsap.utils.toArray<HTMLElement>([
    ".glaze-transition > p",
    ".history-summary",
    ".result-caption p",
    ".source-list > p",
    ".site-update",
    ".preview-note",
  ].join(", "));

  bodyCopy.forEach((copy) => {
    gsap.timeline({
      scrollTrigger: {
        trigger: copy,
        start: "top 90%",
        end: "bottom 12%",
        scrub: 0.38,
      },
    })
      .fromTo(copy,
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: 0.3, ease: "none" },
      )
      .to(copy, { autoAlpha: 1, duration: 0.46, ease: "none" })
      .to(copy, { autoAlpha: 0, y: -10, duration: 0.24, ease: "none" });
  });
}

function activateHistory(index: number): void {
  document.querySelector<HTMLElement>(".history")!.dataset.activeHistory = String(index);
  document.querySelectorAll<HTMLAnchorElement>("[data-history-index]").forEach((link) => {
    const active = link.dataset.historyIndex === String(index);
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "step");
    else link.removeAttribute("aria-current");
  });
}

function initializeHistoryNavigation(): void {
  document.querySelectorAll<HTMLAnchorElement>("[data-history-index]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const index = Number(link.dataset.historyIndex);
      const targetId = link.hash.slice(1);
      document.getElementById(targetId)?.scrollIntoView({ behavior: "auto", block: "center" });
      history.replaceState(null, "", link.hash);
      activateHistory(index);
    });
  });
}

function renderHistory(): void {
  const mobile = document.querySelector<HTMLElement>("[data-history-timeline-mobile]")!;
  const chapters = document.querySelector<HTMLElement>("[data-history-chapters]")!;

  content.history.forEach((node, index) => {
    mobile.insertAdjacentHTML("beforeend", `<a href="#history-${node.id}" data-history-index="${index}" aria-label="${node.index} ${node.stage}">${node.index}</a>`);

    const sourceIds = node.sourceIds as string[];
    const sourceLinks = sourceIds.length > 0
      ? sourceIds.map((sourceId) => `<a href="#source-${sourceId}">[${sourceId}]</a>`).join(" ")
      : "<span>[来源待审核]</span>";
    chapters.insertAdjacentHTML("beforeend", `
      <article class="history-chapter" id="history-${node.id}">
        <div class="history-copy">
          <div class="history-opening">
            <p class="history-index">${node.index} · ${node.stage}</p>
            <h3>${node.title}</h3>
            <p class="history-period">${node.period}</p>
          </div>
          <div class="history-detail">
            <p class="history-summary">${node.summary}</p>
            <div class="history-source">${sourceLinks}</div>
          </div>
        </div>
        <figure class="history-plate">
          <div class="history-scene" data-history-scene="${node.id}" aria-hidden="true">
            <div class="history-scene-fallback">${historySceneFallback(node.id)}</div>
            <div class="history-scene-artwork">
              <img class="history-scene-illustration" data-history-illustration src="${node.visualImage}" width="1254" height="1254" alt="" loading="lazy" decoding="async">
              <img class="history-scene-motion" src="${node.visualImage}" width="1254" height="1254" alt="" loading="lazy" decoding="async">
            </div>
          </div>
          <figcaption>${node.visualCaption}</figcaption>
        </figure>
      </article>`);
  });
}

function renderRouteStops(): void {
  const root = document.querySelector<HTMLElement>("[data-route-stops]")!;
  const actions = document.querySelector<HTMLElement>("[data-route-actions]")!;
  const pathRoot = document.querySelector<SVGGElement>("[data-route-paths]")!;
  const point = (position: { x: number; y: number }) => ({ x: position.x * 10, y: position.y * 10 });
  const routePoints = content.routeStops.map((stop) => point(stop.displayPosition));
  const controls = [
    { c1: { x: 750, y: 360 }, c2: { x: 620, y: 220 } },
    { c1: { x: 370, y: 220 }, c2: { x: 240, y: 360 } },
    { c1: { x: 260, y: 650 }, c2: { x: 430, y: 780 } },
  ];

  routePoints.slice(0, -1).forEach((start, index) => {
    const end = routePoints[index + 1];
    const control = controls[index];
    const path = `M${start.x} ${start.y} C${control.c1.x} ${control.c1.y} ${control.c2.x} ${control.c2.y} ${end.x} ${end.y}`;
    pathRoot.insertAdjacentHTML("beforeend", `<path class="route-path-base" d="${path}" aria-hidden="true" /><path class="route-path-glaze" d="${path}" aria-hidden="true" /><path class="route-path" data-route-segment="${index}" d="${path}" />`);
  });

  content.routeStops.forEach((stop, index) => {
    const icon = routeStopIcon(stop.icon);
    root.insertAdjacentHTML("beforeend", `
      <button class="route-stop${index === 0 ? " is-active" : ""}" type="button" data-route-index="${index}"
        data-route-id="${stop.id}"
        style="--stop-x:${stop.displayPosition.x};--stop-y:${stop.displayPosition.y}"
        aria-label="查看第 ${stop.order} 站：${stop.name}" tabindex="-1">
        <span class="route-stop__marker" aria-hidden="true">
          <span class="route-stop__icon">${icon}</span>
          <span class="route-stop__number">${String(stop.order).padStart(2, "0")}</span>
        </span>
        <span class="route-stop__label" aria-hidden="true">${stop.shortName}</span>
      </button>`);
    actions.insertAdjacentHTML("beforeend", `
      <button class="route-action${index === 0 ? " is-active" : ""}" type="button" data-route-index="${index}"
        aria-pressed="${index === 0}" aria-controls="route-dossier">
        <span class="route-action__number">${String(stop.order).padStart(2, "0")}</span>
        <span class="route-action__icon" aria-hidden="true">${icon}</span>
        <span>${stop.shortName}</span>
      </button>`);
  });
}

function routeStopIcon(icon: string): string {
  const drawings: Record<string, string> = {
    museum: '<path d="M5 10h22M8 10l8-5 8 5M9 12v10m5-10v10m5-10v10m5-10v10M6 24h20"/><path d="M14 17h4v5h-4z"/>',
    district: '<path d="M5 21V12l6-4 5 4 5-5 6 5v9M4 24h24"/><path d="M8 17h4m5 0h3m3 0h3M5 27c4-2 7 2 11 0s7 2 11 0"/>',
    kiln: '<path d="M4 23h24M7 23c1-8 6-13 14-15 2 5 3 10 3 15M10 23v-4c0-3 2-5 5-5s5 2 5 5v4"/><path d="M23 8V4h4v14"/>',
    street: '<path d="M4 12h24L22 7H10l-2 5M7 12v12m18-12v12M5 24h22M11 16h4v8m4-8h3v4"/><path d="M25 8l2-3M9 8 7 5"/>',
  };
  return `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${drawings[icon] ?? drawings.museum}</svg>`;
}

function initializeRouteMap(): void {
  const stops = content.routeStops;
  const markers = Array.from(document.querySelectorAll<HTMLButtonElement>(".route-stop"));
  const actions = Array.from(document.querySelectorAll<HTMLButtonElement>(".route-action"));
  const routePaths = Array.from(document.querySelectorAll<SVGPathElement>(".route-path"));
  const image = document.querySelector<HTMLImageElement>("[data-route-image]")!;
  const imageCaption = document.querySelector<HTMLElement>("[data-route-image-caption]")!;
  const current = document.querySelector<HTMLElement>("[data-route-current]")!;
  const title = document.querySelector<HTMLElement>("[data-route-title]")!;
  const description = document.querySelector<HTMLElement>("[data-route-description]")!;
  const coordinates = document.querySelector<HTMLElement>("[data-route-coordinates]")!;
  const coordinateSource = document.querySelector<HTMLElement>("[data-route-coordinate-source]")!;
  const imageSource = document.querySelector<HTMLAnchorElement>("[data-route-image-source]")!;
  const mapLink = document.querySelector<HTMLAnchorElement>("[data-route-map-link]")!;
  let activeIndex = 0;

  const selectStop = (index: number, animate = true) => {
    activeIndex = (index + stops.length) % stops.length;
    const stop = stops[activeIndex];
    markers.forEach((marker, markerIndex) => marker.classList.toggle("is-active", markerIndex === activeIndex));
    routePaths.forEach((segment, segmentIndex) => segment.classList.toggle("is-complete", segmentIndex < activeIndex));
    actions.forEach((action, actionIndex) => {
      const active = actionIndex === activeIndex;
      action.classList.toggle("is-active", active);
      action.setAttribute("aria-pressed", String(active));
    });
    image.src = stop.image;
    image.alt = stop.imageAlt;
    imageCaption.textContent = `${stop.name} · 走访点位`;
    current.textContent = String(stop.order).padStart(2, "0");
    title.textContent = stop.name;
    description.textContent = stop.description;
    coordinates.textContent = `${stop.coordinates.latitude.toFixed(6)}°N · ${stop.coordinates.longitude.toFixed(6)}°E`;
    coordinateSource.textContent = stop.coordinateSource;
    imageSource.href = `#source-${stop.imageSourceId}`;
    imageSource.textContent = `图片来源 [${stop.imageSourceId}]`;
    mapLink.href = stop.mapHref;
    if (animate) {
      gsap.fromTo(image, { clipPath: "inset(0 100% 0 0)", scale: 1.025 }, { clipPath: "inset(0 0% 0 0)", scale: 1, duration: 0.6, ease: "power3.out", overwrite: true });
      gsap.fromTo([current, title, description], { y: 9, autoAlpha: 0.3 }, { y: 0, autoAlpha: 1, duration: 0.42, stagger: 0.035, ease: "power3.out", overwrite: true });
    }
  };

  [...markers, ...actions].forEach((button) => button.addEventListener("click", () => selectStop(Number(button.dataset.routeIndex))));
  document.querySelector<HTMLElement>("[data-route-actions]")!.addEventListener("keydown", (event) => {
    const focusedAction = event.target as HTMLButtonElement;
    if (!actions.includes(focusedAction)) return;
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const focusedIndex = Number(focusedAction.dataset.routeIndex);
    const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? stops.length - 1 : focusedIndex + (event.key === "ArrowRight" ? 1 : -1);
    selectStop(nextIndex);
    actions[activeIndex].focus();
  });
}

function renderResults(): void {
  const root = document.querySelector<HTMLElement>("[data-results-root]")!;
  (Object.keys(categoryMeta) as Array<keyof typeof categoryMeta>).forEach((category) => {
    const meta = categoryMeta[category];
    const items = (content.results as ResultItem[]).filter((item) => item.category === category).sort((a, b) => a.fixedOrder - b.fixedOrder);
    const isCarousel = items.length > 1;
    const count = String(items.length).padStart(2, "0");
    root.insertAdjacentHTML("beforeend", `
      <section class="result-category" aria-labelledby="category-${category}">
        <header class="category-heading"><h3 id="category-${category}">${meta.title}</h3><span>${count} 项</span></header>
        <div class="result-carousel${isCarousel ? "" : " is-static"}" data-result-carousel
          ${isCarousel ? `role="region" aria-roledescription="轮播" aria-label="${meta.title}成果" tabindex="0"` : ""}>
          <div class="result-carousel__stage" data-result-stage>
            ${items.map((item, index) => resultCard(item, meta, index, items.length)).join("")}
          </div>
          ${isCarousel ? resultCarouselControls(meta.title, items.length) : ""}
        </div>
      </section>`);
  });
}

function resultCarouselControls(title: string, count: number): string {
  const indicators = Array.from({ length: count }, (_, index) => {
    const number = String(index + 1).padStart(2, "0");
    return `<button type="button" data-result-to="${index}" aria-label="查看${title}第 ${index + 1} 项" ${index === 0 ? 'aria-current="true"' : ""}>${number}</button>`;
  }).join("");

  return `
    <div class="result-carousel__navigation">
      <div class="result-carousel__arrows" aria-label="${title}切换">
        <button type="button" data-result-prev aria-label="上一项" disabled><i data-lucide="chevron-left" aria-hidden="true"></i></button>
        <button type="button" data-result-next aria-label="下一项"><i data-lucide="chevron-right" aria-hidden="true"></i></button>
      </div>
      <div class="result-carousel__indicators" aria-label="${title}项目">${indicators}</div>
      <p class="result-carousel__position" aria-live="polite"><span data-result-current>01</span><span aria-hidden="true">／</span><span>${String(count).padStart(2, "0")}</span></p>
    </div>`;
}

function resultCard(item: ResultItem, meta: (typeof categoryMeta)[keyof typeof categoryMeta], position: number, count: number): string {
  const isPublished = item.status === "published";
  const isVideo = isPublished && item.mediaType === "video" && Boolean(item.src);
  const coverStyle = item.cover ? `style="background-image:url('${item.cover}')"` : "";
  const visual = isVideo ? `
    <div class="result-cover result-cover--video">
      <video controls playsinline preload="metadata" poster="${item.cover ?? ""}" width="967" height="544" aria-label="播放${item.title}">
        <source src="${item.src}" type="video/mp4">
        您的浏览器暂不支持站内视频播放。
      </video>
    </div>` : `
    <div class="result-cover" ${coverStyle}>
      <div class="result-preview-meta"><span>${meta.title}</span><strong>${item.index}</strong><span>${isPublished ? item.platform ?? "发布平台待补充" : "待发布"}</span></div>
      ${(item.category === "documentary" || item.category === "interview") ? `<span class="result-play"><i data-lucide="play"></i></span>` : ""}
      <span class="result-depth-tint" aria-hidden="true"></span>
    </div>`;
  const caption = `
    <div class="result-caption">
      <div>
        <h4>${isPublished ? item.title : `${meta.title} ${item.index}`}</h4>
        <p>${isPublished ? `${item.summary} · ${item.date}` : "内容发布后将在原展位开放入口"}</p>
        ${isPublished && !isVideo ? `<span class="result-action">${meta.action}<i data-lucide="external-link"></i></span>` : ""}
      </div>
      ${isPublished && !isVideo ? `<i data-lucide="external-link" aria-hidden="true"></i>` : ""}
    </div>`;
  const classes = `result-card ${meta.className} ${isPublished ? "is-published" : "is-pending"}`;
  const slideState = `data-result-card data-result-index="${position}" role="group" aria-roledescription="项目" aria-label="第 ${position + 1} 项，共 ${count} 项"${position === 0 ? "" : ' aria-hidden="true" inert'}`;
  const tabIndex = position === 0 ? "" : ' tabindex="-1"';
  if (item.category === "oralHistory") {
    return `<article class="${classes}" id="${item.id}" ${slideState}><a href="./oral-history/"${tabIndex}>${visual}${caption}</a></article>`;
  }
  if (!isPublished) return `<article class="${classes}" id="${item.id}" ${slideState}>${visual}${caption}</article>`;
  if (isVideo) return `<article class="${classes}" id="${item.id}" ${slideState}>${visual}${caption}</article>`;
  return `<article class="${classes}" id="${item.id}" ${slideState}><a href="${item.href}" target="_blank" rel="noopener noreferrer" data-external-link${tabIndex}>${visual}${caption}</a></article>`;
}

function initializeResultCarousels(): void {
  document.querySelectorAll<HTMLElement>("[data-result-carousel]").forEach((carousel) => {
    const cards = Array.from(carousel.querySelectorAll<HTMLElement>("[data-result-card]"));
    const stage = carousel.querySelector<HTMLElement>("[data-result-stage]")!;
    if (cards.length < 2) {
      const observer = new ResizeObserver(() => { stage.style.height = `${cards[0]?.offsetHeight ?? 0}px`; });
      if (cards[0]) observer.observe(cards[0]);
      return;
    }

    const previous = carousel.querySelector<HTMLButtonElement>("[data-result-prev]")!;
    const next = carousel.querySelector<HTMLButtonElement>("[data-result-next]")!;
    const indicators = Array.from(carousel.querySelectorAll<HTMLButtonElement>("[data-result-to]"));
    const current = carousel.querySelector<HTMLElement>("[data-result-current]")!;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const requestedCard = cards.findIndex((card) => `#${card.id}` === location.hash);
    let active = requestedCard >= 0 ? requestedCard : 0;
    let position = active;
    let tween: gsap.core.Tween | undefined;
    let drag: { id: number; x: number; y: number; start: number; claimed: boolean; moved: boolean } | undefined;
    let suppressClick = false;

    const layout = (value: number) => {
      const width = carousel.clientWidth;
      const mobile = width < 600;
      const spread = mobile ? Math.min(34, width * 0.075) : Math.min(78, width * 0.07);
      const depth = mobile ? 92 : width < 900 ? 126 : 168;
      const tilt = mobile ? 7 : 9;
      const visible = Math.min(cards.length - 1, 3);

      cards.forEach((card, index) => {
        const distance = index - value;
        const behind = Math.max(0, distance);
        const shown = distance > -1.02 && distance <= visible + 0.45;
        const opacity = !shown ? 0 : distance < 0 ? Math.max(0, 1 + distance) : 1;
        const tint = card.querySelector<HTMLElement>(".result-depth-tint");

        gsap.set(card, {
          x: spread * distance,
          z: -depth * behind,
          rotationY: tilt * Math.min(behind, 1),
          autoAlpha: opacity,
          zIndex: Math.round(100 - distance * 10),
          pointerEvents: shown && opacity > 0.06 ? "auto" : "none",
        });
        if (tint) tint.style.opacity = String(Math.min(0.34, behind * 0.09));
      });
    };

    const measure = () => {
      stage.style.height = `${Math.max(...cards.map((card) => card.offsetHeight))}px`;
      layout(position);
      refreshScrollMeasurements();
    };

    const updateState = () => {
      cards.forEach((card, index) => {
        const selected = index === active;
        card.toggleAttribute("inert", !selected);
        if (selected) card.removeAttribute("aria-hidden");
        else card.setAttribute("aria-hidden", "true");
        card.querySelectorAll<HTMLAnchorElement>("a").forEach((link) => { link.tabIndex = selected ? 0 : -1; });
      });
      indicators.forEach((indicator, index) => indicator.toggleAttribute("aria-current", index === active));
      current.textContent = String(active + 1).padStart(2, "0");
      previous.disabled = active === 0;
      next.disabled = active === cards.length - 1;
    };

    const goTo = (target: number, animate = true) => {
      active = gsap.utils.clamp(0, cards.length - 1, target);
      updateState();
      tween?.kill();
      const proxy = { value: position };
      cards.forEach((card) => { card.style.willChange = "transform, opacity"; });
      tween = gsap.to(proxy, {
        value: active,
        duration: animate && !reducedMotion ? 0.52 : 0,
        ease: "power3.out",
        overwrite: "auto",
        onUpdate: () => { position = proxy.value; layout(position); },
        onComplete: () => {
          position = active;
          layout(position);
          cards.forEach((card) => { card.style.willChange = "auto"; });
        },
      });
    };

    carousel.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goTo(active - 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goTo(active + 1);
      }
    });
    previous.addEventListener("click", () => goTo(active - 1));
    next.addEventListener("click", () => goTo(active + 1));
    indicators.forEach((indicator, index) => indicator.addEventListener("click", () => goTo(index)));

    carousel.addEventListener("click", (event) => {
      const card = (event.target as HTMLElement).closest<HTMLElement>("[data-result-card]");
      if (suppressClick) {
        event.preventDefault();
        suppressClick = false;
        return;
      }
      if (!card) return;
      const index = Number(card.dataset.resultIndex);
      if (index !== active) {
        event.preventDefault();
        goTo(index);
      }
    });

    carousel.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      tween?.kill();
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY, start: position, claimed: false, moved: false };
    });
    carousel.addEventListener("pointermove", (event) => {
      if (!drag || drag.id !== event.pointerId) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      if (!drag.claimed && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
        drag.claimed = true;
        carousel.setPointerCapture(event.pointerId);
      }
      if (!drag.claimed) return;
      event.preventDefault();
      drag.moved = true;
      const step = Math.max(carousel.clientWidth * 0.32, 110);
      position = gsap.utils.clamp(0, cards.length - 1, drag.start - dx / step);
      layout(position);
    });
    const finishDrag = (event: PointerEvent) => {
      if (!drag || drag.id !== event.pointerId) return;
      const wasMoved = drag.moved;
      drag = undefined;
      if (!wasMoved) return;
      suppressClick = true;
      goTo(Math.round(position));
    };
    carousel.addEventListener("pointerup", finishDrag);
    carousel.addEventListener("pointercancel", finishDrag);

    const observer = new ResizeObserver(measure);
    observer.observe(carousel);
    cards.forEach((card) => observer.observe(card));
    goTo(active, false);
    measure();
  });
}

function initializeFieldworkGallery(): void {
  const dialog = document.querySelector<HTMLDialogElement>("[data-fieldwork-lightbox]")!;
  const image = dialog.querySelector<HTMLImageElement>("[data-fieldwork-lightbox-image]")!;
  const caption = dialog.querySelector<HTMLElement>("[data-fieldwork-lightbox-caption]")!;
  const current = dialog.querySelector<HTMLElement>("[data-fieldwork-current]")!;
  const total = dialog.querySelector<HTMLElement>("[data-fieldwork-total]")!;
  const previous = dialog.querySelector<HTMLButtonElement>("[data-fieldwork-previous]")!;
  const next = dialog.querySelector<HTMLButtonElement>("[data-fieldwork-next]")!;
  const close = dialog.querySelector<HTMLButtonElement>("[data-fieldwork-close]")!;
  const photos = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-fieldwork-photo]"));
  let activeIndex = 0;
  let trigger: HTMLButtonElement | null = null;

  total.textContent = String(photos.length).padStart(2, "0");

  const showPhoto = (index: number) => {
    activeIndex = (index + photos.length) % photos.length;
    const photo = photos[activeIndex];
    image.src = photo.dataset.full!;
    image.alt = photo.dataset.alt!;
    caption.textContent = photo.dataset.caption!;
    current.textContent = String(activeIndex + 1).padStart(2, "0");
  };

  photos.forEach((photo, index) => photo.addEventListener("click", () => {
    trigger = photo;
    showPhoto(index);
    dialog.showModal();
  }));

  previous.addEventListener("click", () => showPhoto(activeIndex - 1));
  next.addEventListener("click", () => showPhoto(activeIndex + 1));
  close.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") showPhoto(activeIndex - 1);
    if (event.key === "ArrowRight") showPhoto(activeIndex + 1);
  });
  dialog.addEventListener("close", () => trigger?.focus());
}

function initializeCreativeGallery(): void {
  const root = document.querySelector<HTMLElement>("[data-creative-gallery]")!;
  const visuals = Array.from(root.querySelectorAll<HTMLImageElement>("[data-creative-visual]"));
  const stepsRoot = root.querySelector<HTMLOListElement>("[data-creative-steps]")!;
  const steps = Array.from(stepsRoot.querySelectorAll<HTMLElement>("[data-creative-step]"));
  const triggers = Array.from(stepsRoot.querySelectorAll<HTMLButtonElement>("[data-creative-trigger]"));
  const expand = root.querySelector<HTMLButtonElement>("[data-creative-expand]")!;
  const previous = root.querySelector<HTMLButtonElement>("[data-creative-previous]")!;
  const next = root.querySelector<HTMLButtonElement>("[data-creative-next]")!;
  const current = root.querySelector<HTMLElement>("[data-creative-current]")!;
  const activeTitle = root.querySelector<HTMLElement>("[data-creative-active-title]")!;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const verticalStepsQuery = "(min-width: 768px), (orientation: landscape) and (max-height: 560px)";
  let activeIndex = 0;

  const setActive = (index: number, animate = true) => {
    const nextIndex = gsap.utils.clamp(0, visuals.length - 1, index);
    const changed = nextIndex !== activeIndex;
    activeIndex = nextIndex;

    visuals.forEach((visual, visualIndex) => {
      const selected = visualIndex === activeIndex;
      visual.classList.toggle("is-active", selected);
      visual.setAttribute("aria-hidden", String(!selected));
      if (!selected) {
        gsap.set(visual, { autoAlpha: 0, scale: 0.985 });
      } else if (changed && animate && !reducedMotion) {
        gsap.fromTo(visual,
          { autoAlpha: 0.35, scale: 0.982 },
          { autoAlpha: 1, scale: 1, duration: 0.42, ease: "power3.out", overwrite: "auto" },
        );
      } else {
        gsap.set(visual, { autoAlpha: 1, scale: 1 });
      }
    });

    steps.forEach((step, stepIndex) => step.classList.toggle("is-active", stepIndex === activeIndex));
    triggers.forEach((trigger, triggerIndex) => trigger.toggleAttribute("aria-current", triggerIndex === activeIndex));
    const title = triggers[activeIndex].querySelector<HTMLElement>(".creative-step__title")!.textContent!;
    current.textContent = String(activeIndex + 1).padStart(2, "0");
    activeTitle.textContent = title;
    expand.setAttribute("aria-label", `放大查看${title}`);
    previous.disabled = activeIndex === 0;
    next.disabled = activeIndex === visuals.length - 1;
  };

  const goTo = (index: number, focus = false) => {
    const target = gsap.utils.clamp(0, visuals.length - 1, index);
    setActive(target);
    if (window.matchMedia(verticalStepsQuery).matches) {
      steps[target].scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
    } else {
      steps[target].scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "nearest", inline: "center" });
    }
    if (focus) triggers[target].focus({ preventScroll: true });
  };

  triggers.forEach((trigger, index) => trigger.addEventListener("click", () => goTo(index)));
  previous.addEventListener("click", () => goTo(activeIndex - 1));
  next.addEventListener("click", () => goTo(activeIndex + 1));
  stepsRoot.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    goTo(activeIndex + (event.key === "ArrowRight" ? 1 : -1), true);
  });

  const media = gsap.matchMedia();
  media.add(
    {
      isVertical: verticalStepsQuery,
      isHorizontal: "(max-width: 767px) and (orientation: portrait), (max-width: 767px) and (min-height: 561px)",
    },
    (context) => {
      if (context.conditions?.isVertical) {
        const scrollTriggers = steps.map((step, index) => ScrollTrigger.create({
          trigger: step,
          start: "top 58%",
          end: "bottom 42%",
          onEnter: () => setActive(index),
          onEnterBack: () => setActive(index),
        }));
        return () => scrollTriggers.forEach((trigger) => trigger.kill());
      }

      let frame = 0;
      const syncNearestStep = () => {
        frame = 0;
        const center = stepsRoot.scrollLeft + stepsRoot.clientWidth / 2;
        const nearest = steps.reduce((best, step, index) => {
          const distance = Math.abs(step.offsetLeft + step.offsetWidth / 2 - center);
          return distance < best.distance ? { index, distance } : best;
        }, { index: activeIndex, distance: Number.POSITIVE_INFINITY });
        setActive(nearest.index);
      };
      const onScroll = () => {
        if (frame) return;
        frame = requestAnimationFrame(syncNearestStep);
      };
      stepsRoot.addEventListener("scroll", onScroll, { passive: true });
      return () => {
        stepsRoot.removeEventListener("scroll", onScroll);
        if (frame) cancelAnimationFrame(frame);
      };
    },
  );

  const dialog = document.querySelector<HTMLDialogElement>("[data-creative-lightbox]")!;
  const dialogImage = dialog.querySelector<HTMLImageElement>("[data-creative-lightbox-image]")!;
  const dialogCaption = dialog.querySelector<HTMLElement>("[data-creative-lightbox-caption]")!;
  const dialogCurrent = dialog.querySelector<HTMLElement>("[data-creative-lightbox-current]")!;
  const dialogPrevious = dialog.querySelector<HTMLButtonElement>("[data-creative-lightbox-previous]")!;
  const dialogNext = dialog.querySelector<HTMLButtonElement>("[data-creative-lightbox-next]")!;
  const dialogClose = dialog.querySelector<HTMLButtonElement>("[data-creative-close]")!;
  let dialogIndex = 0;

  const showDialogImage = (index: number) => {
    dialogIndex = (index + visuals.length) % visuals.length;
    const visual = visuals[dialogIndex];
    dialogImage.src = visual.currentSrc || visual.src;
    dialogImage.alt = visual.alt;
    dialogCaption.textContent = visual.dataset.caption!;
    dialogCurrent.textContent = String(dialogIndex + 1).padStart(2, "0");
  };

  expand.addEventListener("click", () => {
    showDialogImage(activeIndex);
    dialog.showModal();
  });
  dialogPrevious.addEventListener("click", () => showDialogImage(dialogIndex - 1));
  dialogNext.addEventListener("click", () => showDialogImage(dialogIndex + 1));
  dialogClose.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") showDialogImage(dialogIndex - 1);
    if (event.key === "ArrowRight") showDialogImage(dialogIndex + 1);
  });
  dialog.addEventListener("close", () => expand.focus());

  setActive(0, false);
}

function renderMeta(): void {
  document.querySelector<HTMLElement>("[data-site-update]")!.textContent = `更新于 ${content.site.updatedAt}`;
  const preview = import.meta.env.VITE_SITE_MODE !== "production";
  document.querySelector<HTMLElement>("[data-preview-note]")!.hidden = !preview;
}

function initializeIcons(): void {
  createIcons({ icons: { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ExternalLink, Maximize2, Menu, Play, X } });
}

function initializeHeader(): void {
  const header = document.querySelector<HTMLElement>("[data-header]")!;
  const toggle = document.querySelector<HTMLButtonElement>("[data-menu-toggle]")!;
  const nav = document.querySelector<HTMLElement>("[data-mobile-nav]")!;
  const desktopNav = document.querySelector<HTMLElement>("[data-desktop-nav]");
  let previousY = window.scrollY;

  if (desktopNav) initializeDesktopNavResponse(desktopNav);

  const closeMenu = (restoreFocus = false) => {
    nav.classList.remove("is-open");
    nav.inert = true;
    nav.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "打开章节菜单");
    toggle.innerHTML = '<i data-lucide="menu" aria-hidden="true"></i>';
    document.body.classList.remove("menu-open");
    initializeIcons();
    if (restoreFocus) toggle.focus();
  };

  nav.inert = true;
  toggle.addEventListener("click", () => {
    const open = !nav.classList.contains("is-open");
    if (!open) return closeMenu(true);
    nav.classList.add("is-open");
    nav.inert = false;
    nav.setAttribute("aria-hidden", "false");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "关闭章节菜单");
    toggle.innerHTML = '<i data-lucide="x" aria-hidden="true"></i>';
    document.body.classList.add("menu-open");
    initializeIcons();
    nav.querySelector<HTMLAnchorElement>("a")?.focus();
  });
  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => closeMenu(false)));

  document.addEventListener("pointerdown", (event) => {
    if (nav.classList.contains("is-open") && !header.contains(event.target as Node)) closeMenu(true);
  });

  document.addEventListener("keydown", (event) => {
    if (!nav.classList.contains("is-open")) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu(true);
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = [toggle, ...nav.querySelectorAll<HTMLAnchorElement>("a")];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  const desktopLayout = window.matchMedia("(min-width: 1100px)");
  desktopLayout.addEventListener("change", (event) => {
    if (event.matches && nav.classList.contains("is-open")) closeMenu(false);
  });

  header.addEventListener("focusin", () => header.classList.remove("is-hidden"));

  const syncHeader = () => {
    const y = window.scrollY;
    header.classList.toggle("is-solid", y > window.innerHeight * 0.65);
    header.classList.toggle("is-hidden", y > previousY + 12 && y > window.innerHeight && !nav.classList.contains("is-open") && !header.matches(":focus-within"));
    if (y < previousY - 12) header.classList.remove("is-hidden");
    previousY = y;
  };
  window.addEventListener("scroll", syncHeader, { passive: true });
  requestAnimationFrame(syncHeader);
}

function initializeDesktopNavResponse(nav: HTMLElement): void {
  const links = Array.from(nav.querySelectorAll<HTMLAnchorElement>("a"));
  const yTo = links.map((link) => gsap.quickTo(link, "--nav-lift", { duration: 0.28, ease: "power3.out" }));
  const scaleTo = links.map((link) => gsap.quickTo(link, "--nav-scale", { duration: 0.28, ease: "power3.out" }));

  const setInfluence = (activeIndex: number, pointerX?: number) => {
    const linkCenters = pointerX === undefined
      ? []
      : links.map((link) => {
          const bounds = link.getBoundingClientRect();
          return bounds.left + bounds.width / 2;
        });
    links.forEach((link, index) => {
      const influence = pointerX === undefined
        ? Math.max(0, 1 - Math.abs(index - activeIndex) * 0.64)
        : Math.max(0, 1 - Math.abs(pointerX - linkCenters[index]) / 168);
      yTo[index](-5 * influence);
      scaleTo[index](1 + 0.085 * influence);
    });
  };

  const reset = () => {
    links.forEach((link) => {
      gsap.to(link, { "--nav-lift": 0, "--nav-scale": 1, duration: 0.55, ease: "elastic.out(1, 0.58)", overwrite: "auto" });
    });
  };

  nav.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    setInfluence(-1, event.clientX);
  });
  nav.addEventListener("pointerleave", reset);
  nav.addEventListener("focusin", (event) => {
    const index = links.indexOf(event.target as HTMLAnchorElement);
    if (index >= 0) setInfluence(index);
  });
  nav.addEventListener("focusout", () => requestAnimationFrame(() => {
    if (!nav.contains(document.activeElement)) reset();
  }));
}

function setActiveNav(section: string): void {
  document.querySelectorAll<HTMLAnchorElement>(".desktop-nav a, .mobile-nav a").forEach((link) => {
    link.classList.toggle("is-active", link.hash === `#${section}`);
    if (link.hash === `#${section}`) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
}

function initializeOfflineState(): void {
  const notice = document.querySelector<HTMLElement>("[data-offline-notice]")!;
  const packagedOffline = import.meta.env.VITE_OFFLINE_MODE === "true";
  const sync = () => {
    const offline = packagedOffline || !navigator.onLine;
    notice.hidden = !offline;
    if (packagedOffline) notice.textContent = "当前为离线展示包，外部成果入口需在联网版本中查看。";
    document.querySelectorAll<HTMLAnchorElement>("[data-external-link]").forEach((link) => {
      link.toggleAttribute("aria-disabled", offline);
      if (offline) link.setAttribute("aria-describedby", "offline-notice");
      else link.removeAttribute("aria-describedby");
    });
  };
  document.addEventListener("click", (event) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>("[data-external-link]");
    if (!link) return;
    if (packagedOffline || !navigator.onLine) { event.preventDefault(); notice.hidden = false; return; }
    sessionStorage.setItem("celadon-scroll-y", String(window.scrollY));
  });
  window.addEventListener("online", sync);
  window.addEventListener("offline", sync);
  sync();
}

function initializeScrollRestoration(): void {
  const returnTo = sessionStorage.getItem("celadon-return-to");
  if (returnTo) {
    sessionStorage.removeItem("celadon-return-to");
    history.replaceState(null, "", `#${returnTo}`);
    requestAnimationFrame(() => document.getElementById(returnTo)?.scrollIntoView());
    return;
  }
  if (location.hash) return;
  const saved = sessionStorage.getItem("celadon-scroll-y");
  if (!saved) return;
  sessionStorage.removeItem("celadon-scroll-y");
  requestAnimationFrame(() => window.scrollTo({ top: Number(saved), behavior: "auto" }));
}

function initializeHistoryIllustrations(): void {
  const scenes = Array.from(document.querySelectorAll<HTMLElement>(".history-scene"));
  const setMotionState = (scene: HTMLElement, active: boolean) => {
    const playing = active && !document.hidden;
    scene.classList.toggle("is-artisan-active", playing);
    scene.dataset.motionState = playing ? "playing" : "paused";
  };

  scenes.forEach((scene) => {
    const illustration = scene.querySelector<HTMLImageElement>("[data-history-illustration]")!;
    const revealIllustration = () => {
      scene.classList.add("is-illustration-ready");
    };
    if (illustration.complete && illustration.naturalWidth > 0) revealIllustration();
    else illustration.addEventListener("load", revealIllustration, { once: true });

    ScrollTrigger.create({
      trigger: scene.closest<HTMLElement>(".history-chapter")!,
      start: "top 84%",
      end: "bottom 16%",
      onToggle: (self) => {
        scene.dataset.inView = String(self.isActive);
        setMotionState(scene, self.isActive);
      },
    });
  });

  document.addEventListener("visibilitychange", () => {
    scenes.forEach((scene) => setMotionState(scene, scene.dataset.inView === "true"));
  });
}

async function initializeGlazeTransition(): Promise<void> {
  const glazeContainer = document.querySelector<HTMLElement>("[data-glaze-lottie]")!;
  try {
    const { default: lottie } = await import("lottie-web/build/player/lottie_light.js");
    const glazeAnimation = lottie.loadAnimation({ container: glazeContainer, renderer: "svg", loop: false, autoplay: false, path: "./lottie/time-in-glaze.json" });
    glazeAnimation.setSubframe(false);
    glazeAnimation.addEventListener("DOMLoaded", () => {
      let lastFrame = -1;
      ScrollTrigger.create({
        trigger: ".glaze-transition",
        start: "top bottom",
        end: "bottom top",
        scrub: 0.45,
        onUpdate: (self) => {
          const frame = Math.round(self.progress * Math.max(0, glazeAnimation.totalFrames - 1));
          if (frame === lastFrame) return;
          lastFrame = frame;
          glazeAnimation.goToAndStop(frame, true);
        },
      });
      refreshScrollMeasurements();
    });

  } catch {
    glazeContainer.innerHTML = '<svg class="glaze-fallback" viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="24"></circle><circle cx="100" cy="100" r="42"></circle><circle cx="100" cy="100" r="60"></circle><circle cx="100" cy="100" r="78"></circle></svg>';
    refreshScrollMeasurements();
  }
}

let refreshFrame = 0;
function refreshScrollMeasurements(): void {
  if (refreshFrame) return;
  refreshFrame = requestAnimationFrame(() => {
    refreshFrame = 0;
    ScrollTrigger.refresh();
  });
}

function renderSources(): void {
  const root = document.querySelector<HTMLElement>("[data-source-list]")!;
  const sources = content.sources as SourceItem[];
  if (sources.length === 0) return;
  const intro = root.querySelector("p");
  intro?.remove();
  const list = document.createElement("ol");
  sources.forEach((source) => {
    const item = document.createElement("li");
    item.id = `source-${source.id}`;
    const backLinks = content.history
      .filter((node) => (node.sourceIds as string[]).includes(source.id))
      .map((node) => `<a class="source-context" href="#history-${node.id}">查看${node.stage}</a>`)
      .join(" · ");
    item.innerHTML = `<a href="${source.href}" target="_blank" rel="noopener noreferrer" data-external-link>[${source.id}] ${source.title}</a><span>${source.publisher} · ${source.license} · 访问于 ${source.accessedAt}</span>${backLinks ? `<span>${backLinks}</span>` : ""}`;
    list.append(item);
  });
  root.append(list);
}

function historySceneFallback(scene: string): string {
  const drawings: Record<string, string> = {
    origin: '<circle cx="92" cy="120" r="19"/><path d="M88 140 76 198l60 84m-57-106 95 29m-76-29 79 12m-11 17-2 33 14 16 14-16-2-33m-56 73h88M35 342h290"/><ellipse cx="178" cy="278" rx="53" ry="15"/>',
    peak: '<circle cx="278" cy="103" r="19"/><path d="m276 124-26 56 10 67m1-93-83 18m103-16-89 32M42 258h216l21 78m-161-132 10-28h42l10 28-16 18h-30zM34 336h292"/><ellipse cx="194" cy="117" rx="29" ry="12"/><path d="m222 116 33-20m-65 36-11 38"/>',
    journey: '<circle cx="92" cy="126" r="19"/><path d="m94 147 18 56 41 43m-47-77 99 5m-92 9 103 9m-78 54-48 91m64-92 56 92M66 255h228l16 83M36 338h288m-121-164 29 47"/><ellipse cx="214" cy="222" rx="66" ry="23"/><ellipse cx="214" cy="222" rx="50" ry="16"/>',
    change: '<circle cx="84" cy="137" r="19"/><path d="m86 158 14 64 27 45m-31-85 117 20m-105-7 106 25m-100 45-46 73m62-74 40 74M28 340h304m-144-2V130l27-46 59-22 45 30 13 246m-114 0V168l26-40h38l27 40v170m-74-147h61m-61 48h61m-61 48h61m-122-95h38v34h-38z"/>',
    revival: '<circle cx="270" cy="104" r="19"/><path d="M38 147h94v176H38zm15 26h63m-46 92h29m169-140-26 67 8 77m-1-112-68-3m94 4-87 11m62 98-42 73m55-73 43 73M30 340h300m-163-197 8-17h25l8 17-10 12h-21z"/><circle cx="84" cy="209" r="17"/>',
  };
  return `<svg viewBox="0 0 360 420" focusable="false"><g>${drawings[scene] ?? drawings.origin}</g></svg>`;
}

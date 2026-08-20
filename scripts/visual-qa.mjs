import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright-core";
const baseUrl = process.argv[2] ?? "http://127.0.0.1:4173/";
const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const output = resolve("screenshots");
await mkdir(output, { recursive: true });

const browser = await chromium.launch({ executablePath: edgePath, headless: true });
const failures = [];
const reports = [];
const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "landscape", width: 844, height: 390 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport });
  const runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") runtimeErrors.push(message.text()); });
  page.on("requestfailed", (request) => {
    const errorText = request.failure()?.errorText ?? "";
    if (errorText !== "net::ERR_ABORTED") runtimeErrors.push(`资源失败：${request.url()} ${errorText}`);
  });

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    document.documentElement.style.setProperty("scroll-behavior", "auto", "important");
    document.body.style.setProperty("scroll-behavior", "auto", "important");
  });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);

  const initial = await page.evaluate(() => ({
    title: document.title,
    historyCount: document.querySelectorAll(".history-chapter").length,
    resultCount: document.querySelectorAll(".result-card").length,
    creativeVisualCount: document.querySelectorAll("[data-creative-visual]").length,
    creativeTriggerCount: document.querySelectorAll("[data-creative-trigger]").length,
    resultCarouselCount: document.querySelectorAll("[data-result-carousel]").length,
    staticResultCarouselCount: document.querySelectorAll("[data-result-carousel].is-static").length,
    interactiveResultCarouselCount: document.querySelectorAll("[data-result-carousel][tabindex]").length,
    hiddenFocusableResults: Array.from(document.querySelectorAll('[data-result-card][aria-hidden="true"] a')).filter((link) => link.tabIndex >= 0).length,
    cloudPatternSections: [".history", ".longquan", ".results", ".about"].filter((selector) => {
      const section = document.querySelector(selector);
      const style = getComputedStyle(section, "::before");
      return style.maskImage !== "none" || style.webkitMaskImage !== "none";
    }).length,
    portalCount: document.querySelectorAll("[data-chapter-portal]").length,
    chapterImageCount: document.querySelectorAll(".chapter-portal__frame img").length,
    canvasCount: document.querySelectorAll("canvas").length,
    historyIllustrationCount: document.querySelectorAll("[data-history-illustration]").length,
    historyMotionLayerCount: document.querySelectorAll(".history-scene-motion").length,
    historyLottieCount: document.querySelectorAll("[data-history-lottie]").length,
    growthPathCount: document.querySelectorAll(".vessel-growth-path").length,
    shardCount: document.querySelectorAll(".celadon-shard").length,
    wordmarkText: document.querySelector(".wordmark")?.textContent?.trim(),
    heroLayering: {
      world: Number(getComputedStyle(document.querySelector("[data-celadon-world]")).zIndex),
      main: Number(getComputedStyle(document.querySelector("main")).zIndex),
    },
    horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    overflowElements: Array.from(document.querySelectorAll("body *")).map((element) => {
      const rect = element.getBoundingClientRect();
      return { tag: element.tagName, className: element.className?.baseVal ?? element.className, left: Math.round(rect.left), right: Math.round(rect.right) };
    }).filter((item) => item.left < -1 || item.right > innerWidth + 1).slice(0, 12),
    clippedControls: Array.from(document.querySelectorAll("button, .seal, .route-actions span"))
      .filter((element) => element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1)
      .map((element) => element.textContent?.trim() ?? element.className),
  }));
  if (!initial.title.includes("龙泉青瓷")) failures.push(`${viewport.name}: 页面标题错误`);
  if (initial.historyCount !== 5) failures.push(`${viewport.name}: 历史节点为 ${initial.historyCount}`);
  if (initial.resultCount !== 15) failures.push(`${viewport.name}: 成果展位为 ${initial.resultCount}`);
  if (initial.creativeVisualCount !== 6 || initial.creativeTriggerCount !== 6) {
    failures.push(`${viewport.name}: 文创展示结构不完整 ${initial.creativeVisualCount}/6 图、${initial.creativeTriggerCount}/6 项`);
  }
  if (initial.resultCarouselCount !== 5) failures.push(`${viewport.name}: 成果类别轮播为 ${initial.resultCarouselCount}`);
  if (initial.staticResultCarouselCount !== 2 || initial.interactiveResultCarouselCount !== 3) failures.push(`${viewport.name}: 单项/多项成果模式错误`);
  if (initial.hiddenFocusableResults !== 0) failures.push(`${viewport.name}: 隐藏成果仍可被键盘聚焦`);
  if (initial.cloudPatternSections !== 4) failures.push(`${viewport.name}: 云纹背景仅覆盖 ${initial.cloudPatternSections}/4 个章节`);
  if (initial.portalCount !== 4) failures.push(`${viewport.name}: 章节展开入口为 ${initial.portalCount}`);
  if (initial.chapterImageCount !== 4) failures.push(`${viewport.name}: 章节图像为 ${initial.chapterImageCount}`);
  if (initial.canvasCount !== 0) failures.push(`${viewport.name}: 仍存在 ${initial.canvasCount} 个 3D Canvas`);
  if (initial.historyIllustrationCount !== 5 || initial.historyMotionLayerCount !== 5) failures.push(`${viewport.name}: 历史插画动作层不完整`);
  if (initial.historyLottieCount !== 0) failures.push(`${viewport.name}: 已移除的历史 Lottie 仍然存在`);
  if (initial.growthPathCount !== 5) failures.push(`${viewport.name}: 藤脉生长路径为 ${initial.growthPathCount}`);
  if (initial.shardCount !== 9) failures.push(`${viewport.name}: 同源碎片为 ${initial.shardCount}`);
  if (initial.wordmarkText !== "瓷") failures.push(`${viewport.name}: 页眉团队文字未删除`);
  if (initial.heroLayering.world >= initial.heroLayering.main) failures.push(`${viewport.name}: 器物场景仍可能遮挡标题`);
  if (initial.horizontalOverflow > 1) failures.push(`${viewport.name}: 横向溢出 ${initial.horizontalOverflow}px；${JSON.stringify(initial.overflowElements)}`);
  if (initial.clippedControls.length) failures.push(`${viewport.name}: 控件文字被裁切 ${initial.clippedControls.join(", ")}`);

  const currentNavCount = await page.locator('.desktop-nav a[aria-current="location"], .mobile-nav a[aria-current="location"]').count();
  if (currentNavCount !== 2) failures.push(`${viewport.name}: 当前章节状态数量为 ${currentNavCount}`);

  if (viewport.width >= 1100) {
    const target = page.locator(".desktop-nav a").nth(2);
    const bounds = await target.boundingBox();
    if (bounds) await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    await page.waitForTimeout(360);
    const pointerState = await target.evaluate((link) => ({
      transform: getComputedStyle(link).transform,
      layoutWidth: link.clientWidth,
      visualWidth: link.getBoundingClientRect().width,
    }));
    if (pointerState.transform === "none" || pointerState.visualWidth <= pointerState.layoutWidth) {
      failures.push(`${viewport.name}: 桌面章节未响应指针邻近`);
    }
    await page.mouse.move(0, viewport.height / 2);
    await target.focus();
    await page.waitForTimeout(360);
    const focusTransform = await target.evaluate((link) => getComputedStyle(link).transform);
    if (focusTransform === "none") failures.push(`${viewport.name}: 键盘聚焦没有同等导航反馈`);
    await target.evaluate((link) => link.blur());
    await page.waitForTimeout(600);
  }

  await page.screenshot({ path: resolve(output, `${viewport.name}-hero-2d.png`) });
  const heroTravel = await page.evaluate(() => {
    const hero = document.querySelector("#form");
    return Math.max(0, hero.offsetHeight - innerHeight) * 0.76;
  });
  await page.evaluate((top) => window.scrollTo(0, top), heroTravel);
  await page.waitForTimeout(1200);
  const vesselState = await page.evaluate(() => ({
    base: Number(getComputedStyle(document.querySelector(".vessel-art__base")).opacity),
    wash: Number(getComputedStyle(document.querySelector(".vessel-art__wash")).opacity),
    growthOpacity: Number(getComputedStyle(document.querySelector(".vessel-art__growth")).opacity),
    grownPaths: Array.from(document.querySelectorAll(".vessel-growth-path")).filter((path) => {
      const offset = Math.abs(Number.parseFloat(getComputedStyle(path).strokeDashoffset));
      return offset < path.getTotalLength() * 0.8;
    }).length,
    imageWidth: document.querySelector(".vessel-art image").getBoundingClientRect().width,
  }));
  if (vesselState.base < 0.7 || vesselState.wash < 0.15 || vesselState.growthOpacity < 0.8 || vesselState.grownPaths < 3 || vesselState.imageWidth <= 0) {
    failures.push(`${viewport.name}: 瓶内龙泉元素未沿藤脉汇聚 ${JSON.stringify(vesselState)}`);
  }
  await page.screenshot({ path: resolve(output, `${viewport.name}-hero-filled.png`) });

  await page.evaluate(() => {
    const transition = document.querySelector(".glaze-transition");
    const end = transition.offsetTop + transition.offsetHeight - innerHeight;
    window.scrollTo(0, end * 0.94);
  });
  await page.waitForTimeout(800);
  const fractureState = await page.locator("[data-celadon-artwork]").evaluate((element) => {
    const shards = Array.from(element.querySelectorAll(".celadon-shard"));
    return {
      visible: shards.filter((shard) => Number(getComputedStyle(shard).opacity) > 0.12).length,
      moved: shards.filter((shard) => getComputedStyle(shard).transform !== "none").length,
      vesselOpacity: Number(getComputedStyle(element.querySelector(".vessel-art")).opacity),
    };
  });
  if (fractureState.visible < 7 || fractureState.moved < 7 || fractureState.vesselOpacity > 0.2) failures.push(`${viewport.name}: 青瓷碎片未在章节交界铺开 ${JSON.stringify(fractureState)}`);
  await page.screenshot({ path: resolve(output, `${viewport.name}-hero-fracture.png`) });

  for (const portalName of ["history", "longquan", "results", "about"]) {
    const selector = `.chapter-portal--${portalName}`;
    await page.evaluate(({ selector }) => {
      const portal = document.querySelector(selector);
      const top = scrollY + portal.getBoundingClientRect().top;
      window.scrollTo({ top: top + (portal.offsetHeight - innerHeight) * 0.48, behavior: "instant" });
    }, { selector });
    await page.waitForTimeout(700);
    const middleState = await page.locator(selector).evaluate((portal) => {
      const frame = portal.querySelector(".chapter-portal__frame");
      const image = portal.querySelector("img");
      const title = portal.querySelector(".chapter-portal__title");
      return {
        clipPath: getComputedStyle(frame).clipPath,
        imageWidth: image.naturalWidth,
        titleTransform: getComputedStyle(title).transform,
      };
    });
    if (middleState.imageWidth <= 0) failures.push(`${viewport.name}: ${portalName} 章节图像未加载`);
    if (middleState.clipPath === "none" || middleState.titleTransform === "none") {
      failures.push(`${viewport.name}: ${portalName} 章节展开动效未建立`);
    }

    await page.evaluate(({ selector }) => {
      const portal = document.querySelector(selector);
      const top = scrollY + portal.getBoundingClientRect().top;
      window.scrollTo({ top: top + (portal.offsetHeight - innerHeight) * 0.86, behavior: "instant" });
    }, { selector });
    await page.waitForTimeout(700);
    const settledState = await page.locator(selector).evaluate((portal) => ({
      summaryOpacity: Number(getComputedStyle(portal.querySelector(".chapter-portal__summary")).opacity),
      noteOpacity: Number(getComputedStyle(portal.querySelector(".chapter-portal__art-note")).opacity),
    }));
    if (settledState.summaryOpacity < 0.5 || settledState.noteOpacity < 0.35) {
      failures.push(`${viewport.name}: ${portalName} 章节结尾信息未清晰显现`);
    }
    await page.screenshot({ path: resolve(output, `${viewport.name}-portal-${portalName}.png`) });
  }

  await page.locator("#history-journey").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  const timelineLink = page.locator('[data-history-index="2"]');
  if (viewport.width < 1100) {
    await timelineLink.click();
    await page.waitForTimeout(80);
  }
  const timelineState = await timelineLink.evaluate((link) => ({ active: link.classList.contains("is-active"), current: link.getAttribute("aria-current") }));
  if (!timelineState.active || timelineState.current !== "step") failures.push(`${viewport.name}: timeline selection feedback is delayed`);
  const historyMotion = await page.evaluate(() => {
    const progress = document.querySelector("[data-history-axis-progress]");
    const traveler = document.querySelector("[data-history-traveler]");
    return {
      axisOffset: Number.parseFloat(getComputedStyle(progress).strokeDashoffset),
      axisLength: progress.getTotalLength(),
      travelerTransform: getComputedStyle(traveler).transform,
    };
  });
  if (historyMotion.axisOffset >= historyMotion.axisLength * 0.98) failures.push(`${viewport.name}: 历史螺旋线未随滚动绘制`);
  if (historyMotion.travelerTransform === "none") failures.push(`${viewport.name}: 历史小器物未产生旋转位移`);
  const historyScene = page.locator("#history-journey");
  await historyScene.evaluate((chapter) => {
    const top = scrollY + chapter.getBoundingClientRect().top;
    window.scrollTo(0, top + chapter.offsetHeight * 0.5 - innerHeight * 0.5);
  });
  await page.waitForTimeout(250);
  const activeMotionStart = await historyScene.evaluate((chapter) => {
    const scene = chapter.querySelector(".history-scene");
    const layer = chapter.querySelector(".history-scene-motion");
    const image = chapter.querySelector("[data-history-illustration]");
    return {
      state: scene.dataset.motionState,
      playState: getComputedStyle(layer).animationPlayState,
      transform: getComputedStyle(layer).transform,
      opacity: Number(getComputedStyle(scene).opacity),
      imageWidth: image.naturalWidth,
    };
  });
  await page.waitForTimeout(700);
  const activeMotionEnd = await historyScene.locator(".history-scene-motion").evaluate((element) => ({ transform: getComputedStyle(element).transform }));
  if (activeMotionStart.imageWidth <= 0 || activeMotionStart.opacity < 0.5 || activeMotionStart.state !== "playing" || activeMotionStart.playState !== "running") failures.push(`${viewport.name}: 历史插画未进入可见播放状态 ${JSON.stringify(activeMotionStart)}`);
  if (activeMotionEnd.transform === activeMotionStart.transform) failures.push(`${viewport.name}: 匠人局部动作没有持续变化`);
  await page.screenshot({ path: resolve(output, `${viewport.name}-history-forward.png`) });
  await page.screenshot({ path: resolve(output, `${viewport.name}-history.png`) });
  await page.locator("#longquan").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const pausedMotionStart = await historyScene.evaluate((chapter) => {
    const scene = chapter.querySelector(".history-scene");
    const layer = chapter.querySelector(".history-scene-motion");
    return { state: scene.dataset.motionState, playState: getComputedStyle(layer).animationPlayState, transform: getComputedStyle(layer).transform };
  });
  await page.waitForTimeout(400);
  const pausedMotionEnd = await historyScene.locator(".history-scene-motion").evaluate((element) => ({ transform: getComputedStyle(element).transform }));
  if (pausedMotionStart.state !== "paused" || pausedMotionStart.playState !== "paused" || pausedMotionEnd.transform !== pausedMotionStart.transform) failures.push(`${viewport.name}: 离屏匠人动作仍在运行 ${JSON.stringify({ pausedMotionStart, pausedMotionEnd })}`);
  const visibleStops = await page.locator(".route-stop").evaluateAll((stops) => stops.filter((stop) => Number(getComputedStyle(stop).opacity) > 0.2).length);
  if (visibleStops !== 4) failures.push(`${viewport.name}: 路线站点仅显示 ${visibleStops}/4`);
  await page.screenshot({ path: resolve(output, `${viewport.name}-route.png`) });

  await page.locator("#results").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  const resultCarousel = page.locator("[data-result-carousel]:not(.is-static)").first();
  await resultCarousel.locator("[data-result-next]").click();
  await page.waitForTimeout(600);
  const carouselNextState = await resultCarousel.evaluate((carousel) => ({
    current: carousel.querySelector("[data-result-current]")?.textContent,
    activeIndex: Array.from(carousel.querySelectorAll("[data-result-card]")).findIndex((card) => !card.hasAttribute("aria-hidden")),
    hiddenFocusable: Array.from(carousel.querySelectorAll('[data-result-card][aria-hidden="true"] a')).filter((link) => link.tabIndex >= 0).length,
  }));
  if (carouselNextState.current !== "02" || carouselNextState.activeIndex !== 1 || carouselNextState.hiddenFocusable !== 0) {
    failures.push(`${viewport.name}: 成果轮播下一项状态错误 ${JSON.stringify(carouselNextState)}`);
  }
  await resultCarousel.focus();
  await page.keyboard.press("ArrowLeft");
  await page.waitForTimeout(600);
  const carouselKeyboardState = await resultCarousel.locator("[data-result-current]").textContent();
  if (carouselKeyboardState !== "01") failures.push(`${viewport.name}: 成果轮播方向键未返回上一项`);
  await page.screenshot({ path: resolve(output, `${viewport.name}-results.png`) });

  const creative = page.locator("[data-creative-gallery]");
  await creative.locator(".creative-stage").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  const creativeTriggers = creative.locator("[data-creative-trigger]");
  for (let index = 0; index < 6; index += 1) {
    await creativeTriggers.nth(index).evaluate((trigger) => {
      trigger.scrollIntoView({ behavior: "instant", block: "center", inline: "center" });
      trigger.click();
    });
    await page.waitForTimeout(180);
    const imageWidth = await creative.locator("[data-creative-visual]").nth(index).evaluate((image) => image.naturalWidth);
    if (!imageWidth) failures.push(`${viewport.name}: 文创第 ${index + 1} 张图像未加载`);
  }
  await creativeTriggers.first().evaluate((trigger) => {
    trigger.scrollIntoView({ behavior: "instant", block: "center", inline: "center" });
    trigger.click();
  });
  await page.waitForTimeout(650);
  await creative.locator("[data-creative-next]").click();
  await page.waitForTimeout(650);
  const creativeNextState = await creative.evaluate((gallery) => ({
    current: gallery.querySelector("[data-creative-current]")?.textContent,
    activeVisual: Array.from(gallery.querySelectorAll("[data-creative-visual]")).findIndex((visual) => visual.classList.contains("is-active")),
    currentTrigger: Array.from(gallery.querySelectorAll("[data-creative-trigger]")).findIndex((trigger) => trigger.hasAttribute("aria-current")),
  }));
  if (creativeNextState.current !== "02" || creativeNextState.activeVisual !== 1 || creativeNextState.currentTrigger !== 1) {
    failures.push(`${viewport.name}: 文创下一项状态错误 ${JSON.stringify(creativeNextState)}`);
  }

  await creative.locator('[data-creative-trigger][aria-current]').focus();
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(650);
  const creativeKeyboardState = await creative.locator("[data-creative-current]").textContent();
  if (creativeKeyboardState !== "03") failures.push(`${viewport.name}: 文创方向键未切换到第三项`);

  await creative.locator("[data-creative-expand]").click();
  await page.waitForTimeout(250);
  const creativeDialog = page.locator("[data-creative-lightbox]");
  const dialogOpenState = await creativeDialog.evaluate((dialog) => ({
    open: dialog.hasAttribute("open"),
    current: dialog.querySelector("[data-creative-lightbox-current]")?.textContent,
    imageWidth: dialog.querySelector("[data-creative-lightbox-image]")?.naturalWidth,
  }));
  if (!dialogOpenState.open || dialogOpenState.current !== "03" || !dialogOpenState.imageWidth) {
    failures.push(`${viewport.name}: 文创大图未正确打开 ${JSON.stringify(dialogOpenState)}`);
  }
  await page.keyboard.press("ArrowRight");
  const dialogKeyboardState = await creativeDialog.locator("[data-creative-lightbox-current]").textContent();
  if (dialogKeyboardState !== "04") failures.push(`${viewport.name}: 文创大图方向键未切换到第四项`);
  await page.screenshot({ path: resolve(output, `${viewport.name}-creative-lightbox.png`) });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(180);
  const dialogClosedState = await creativeDialog.evaluate((dialog) => ({
    open: dialog.hasAttribute("open"),
    focusRestored: document.activeElement === document.querySelector("[data-creative-expand]"),
  }));
  if (dialogClosedState.open || !dialogClosedState.focusRestored) failures.push(`${viewport.name}: 文创大图关闭后焦点未恢复`);
  await page.screenshot({ path: resolve(output, `${viewport.name}-creative.png`) });

  await page.locator(".about-content").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.screenshot({ path: resolve(output, `${viewport.name}-about.png`) });

  if (viewport.width < 1100) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.locator("[data-menu-toggle]").click();
    await page.waitForTimeout(300);
    const menuState = await page.locator("[data-mobile-nav]").evaluate((element) => ({
      open: element.classList.contains("is-open"),
      visibility: getComputedStyle(element).visibility,
      hidden: element.getAttribute("aria-hidden"),
      firstLinkFocused: document.activeElement === element.querySelector("a"),
    }));
    if (!menuState.open || menuState.visibility !== "visible") failures.push(`${viewport.name}: 移动菜单未打开 ${JSON.stringify(menuState)}`);
    if (menuState.hidden !== "false" || !menuState.firstLinkFocused) failures.push(`${viewport.name}: mobile menu focus did not enter the first link`);
    await page.screenshot({ path: resolve(output, `${viewport.name}-navigation.png`) });
    await page.keyboard.press("Escape");
    const closedMenuState = await page.evaluate(() => ({
      expanded: document.querySelector("[data-menu-toggle]")?.getAttribute("aria-expanded"),
      hidden: document.querySelector("[data-mobile-nav]")?.getAttribute("aria-hidden"),
      toggleFocused: document.activeElement === document.querySelector("[data-menu-toggle]"),
    }));
    if (closedMenuState.expanded !== "false" || closedMenuState.hidden !== "true" || !closedMenuState.toggleFocused) {
      failures.push(`${viewport.name}: mobile menu Escape did not close and return focus`);
    }
    await page.locator("[data-menu-toggle]").click();
    await page.setViewportSize({ width: 1100, height: viewport.height });
    const resizedMenuState = await page.evaluate(() => ({
      expanded: document.querySelector("[data-menu-toggle]")?.getAttribute("aria-expanded"),
      bodyLocked: document.body.classList.contains("menu-open"),
    }));
    if (resizedMenuState.expanded !== "false" || resizedMenuState.bodyLocked) failures.push(`${viewport.name}: menu stayed locked after desktop resize`);
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
  }

  await page.goto(`${baseUrl}?direct=${viewport.name}#results`, { waitUntil: "networkidle" });
  const directState = await page.locator("[data-celadon-artwork]").evaluate((element) => ({
    vesselOpacity: Number(getComputedStyle(element.querySelector(".vessel-art")).opacity),
    visibleShards: Array.from(element.querySelectorAll(".celadon-shard")).filter((shard) => Number(getComputedStyle(shard).opacity) > 0.1).length,
  }));
  if (directState.vesselOpacity > 0.2 || directState.visibleShards < 7) failures.push(`${viewport.name}: 直达成果区未进入碎片背景状态 ${JSON.stringify(directState)}`);
  if (runtimeErrors.length) failures.push(`${viewport.name}: ${runtimeErrors.join(" | ")}`);
  reports.push(`${viewport.name}: 轮廓→元素汇聚→碎片完成, spiral axis=${Math.round(historyMotion.axisLength - historyMotion.axisOffset)}, route stops=${visibleStops}`);
  await page.close();
}

const oral = await browser.newPage({ viewport: { width: 390, height: 844 } });
await oral.goto(new URL("oral-history/", baseUrl).href, { waitUntil: "networkidle" });
await oral.screenshot({ path: resolve(output, "oral-history-mobile.png") });
await oral.locator(".oral-back").click();
await oral.waitForLoadState("networkidle");
if (!oral.url().includes("#oral-history-01")) failures.push("口述史返回后未恢复到固定展位");
await oral.close();

const share = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await share.goto(new URL("share/", baseUrl).href, { waitUntil: "networkidle" });
await share.evaluate(() => document.fonts.ready);
await share.screenshot({ path: resolve("public/og-cover.png") });
await share.screenshot({ path: resolve(output, "share-1200x630.png") });
await share.close();
await browser.close();

reports.forEach((report) => console.log(report));
if (failures.length) {
  console.error(`视觉验收失败（${failures.length} 项）：`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log("视觉验收通过，分享封面已生成");

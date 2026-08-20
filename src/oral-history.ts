import "./styles.css";
import { gsap } from "gsap";
import { ArrowLeft, createIcons } from "lucide";

createIcons({ icons: { ArrowLeft } });

document.querySelector<HTMLAnchorElement>(".oral-back")?.addEventListener("click", () => {
  sessionStorage.setItem("celadon-return-to", "oral-history-01");
});

requestAnimationFrame(() => void initializeOralHistory());

async function initializeOralHistory(): Promise<void> {
  const { ScrollTrigger } = await import("gsap/ScrollTrigger");
  gsap.registerPlugin(ScrollTrigger);

  const progress = document.querySelector<HTMLElement>(".oral-progress span");
  if (progress) {
    gsap.to(progress, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: { start: 0, end: "max", scrub: 0.25 },
    });
  }

  const heroVisual = document.querySelector<HTMLElement>(".oral-hero__visual");
  const heroImage = heroVisual?.querySelector<HTMLImageElement>("img");
  if (heroVisual && heroImage) {
    gsap.timeline({
      scrollTrigger: {
        trigger: ".oral-hero",
        start: "top top",
        end: "bottom 32%",
        scrub: 0.55,
        invalidateOnRefresh: true,
      },
    })
      .fromTo(heroImage,
        { clipPath: "inset(8% 7% 8% 7% round 4px)" },
        { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 1, ease: "none" },
      )
      .fromTo(heroImage, { scale: 1.045 }, { scale: 1, duration: 1, ease: "none" }, 0);
  }

  document.querySelectorAll<HTMLElement>(".oral-media").forEach((figure) => {
    const frame = figure.querySelector<HTMLElement>(".oral-media__frame");
    const image = figure.querySelector<HTMLImageElement>("img");
    const caption = figure.querySelector<HTMLElement>("figcaption");
    if (!frame || !image || !caption) return;

    gsap.timeline({
      scrollTrigger: {
        trigger: figure,
        start: "top 86%",
        toggleActions: "play none none reverse",
      },
    })
      .fromTo(frame,
        { clipPath: "inset(0 100% 0 0)" },
        { clipPath: "inset(0 0% 0 0)", duration: 0.68, ease: "power3.out" },
      )
      .fromTo(image, { scale: 1.035 }, { scale: 1, duration: 0.72, ease: "power3.out" }, 0)
      .fromTo(caption, { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.42, ease: "power2.out" }, 0.28);
  });

  await Promise.all(Array.from(document.images).map((image) => image.complete ? Promise.resolve() : image.decode().catch(() => undefined)));
  await document.fonts.ready;
  ScrollTrigger.refresh();
}

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const mode = process.argv[2] ?? "preview";
if (!["preview", "production", "offline"].includes(mode)) {
  console.error(`未知构建模式：${mode}`);
  process.exit(1);
}

const node = process.execPath;
const validation = spawnSync(node, [resolve("scripts/validate-content.mjs"), mode], { stdio: "inherit", env: process.env });
if (validation.status !== 0) process.exit(validation.status ?? 1);

const siteUrl = mode === "production"
  ? process.env.SITE_URL
  : process.env.SITE_URL ?? "http://localhost:4173/";
const content = JSON.parse(await readFile(resolve("src/content/site.json"), "utf8"));
const oralHistoryPublished = content.results.some((item) => item.category === "oralHistory" && item.status === "published");
const env = {
  ...process.env,
  VITE_SITE_MODE: mode === "production" ? "production" : "preview",
  VITE_OFFLINE_MODE: mode === "offline" ? "true" : "false",
  VITE_SITE_URL: siteUrl,
  VITE_ORAL_ROBOTS: mode === "production" && oralHistoryPublished ? "index,follow" : "noindex,nofollow",
};
const viteBin = resolve("node_modules/vite/bin/vite.js");
const build = spawnSync(node, [viteBin, "build", "--mode", mode], { stdio: "inherit", env });
if (build.status !== 0) process.exit(build.status ?? 1);

if (mode === "production") {
  const base = new URL(siteUrl);
  await mkdir(resolve("dist"), { recursive: true });
  await writeFile(resolve("dist/robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${new URL("sitemap.xml", base)}\n`, "utf8");
  const urls = [new URL("", base)];
  if (oralHistoryPublished) urls.push(new URL("oral-history/", base));
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${url}</loc></url>`).join("\n")}\n</urlset>\n`;
  await writeFile(resolve("dist/sitemap.xml"), sitemap, "utf8");
}

console.log(`${mode} 构建完成`);

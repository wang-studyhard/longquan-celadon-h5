import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const validator = resolve("scripts/validate-content.mjs");
const source = JSON.parse(await readFile(resolve("src/content/site.json"), "utf8"));
const temp = await mkdtemp(join(tmpdir(), "celadon-content-test-"));
const fixturePath = join(temp, "site.json");
const run = (mode, contentPath, siteUrl = "https://example.github.io/longquan-celadon-h5/") => spawnSync(
  process.execPath,
  [validator, mode],
  { encoding: "utf8", env: { ...process.env, CONTENT_PATH: contentPath, SITE_URL: siteUrl } },
);

try {
  const preview = run("preview", resolve("src/content/site.json"));
  if (preview.status !== 0) throw new Error(`预览内容不应失败：\n${preview.stderr}`);

  const valid = structuredClone(source);
  valid.sources = [{
    id: "S01",
    title: "自动校验用来源",
    publisher: "测试发布者",
    href: "https://example.com/source",
    license: "CC BY 4.0",
    accessedAt: "2026.08.08",
  }];
  valid.history.forEach((node, index) => {
    node.period = `测试年代 ${index + 1}`;
    node.summary = "这是用于验证正式构建内容长度和必填字段的自动测试文本".repeat(4).slice(0, 90);
    node.sourceIds = ["S01"];
    node.verifiedBy = "测试审核人";
    node.verifiedAt = "2026.08.08";
  });
  valid.routeStops.forEach((stop, index) => {
    stop.name = `测试站点 ${index + 1}`;
    stop.verifiedByTeam = true;
  });
  await writeFile(fixturePath, JSON.stringify(valid), "utf8");
  const validProduction = run("production", fixturePath);
  if (validProduction.status !== 0) throw new Error(`完整正式内容应通过：\n${validProduction.stderr}`);

  const invalid = structuredClone(valid);
  const pendingIndex = invalid.results.findIndex((item) => item.status === "pending");
  invalid.results[pendingIndex].status = "published";
  await writeFile(fixturePath, JSON.stringify(invalid), "utf8");
  const invalidProduction = run("production", fixturePath);
  const invalidOutput = `${invalidProduction.stdout}\n${invalidProduction.stderr}`;
  if (invalidProduction.status === 0 || !invalidOutput.includes(`results[${pendingIndex}].title 缺失`) || !invalidOutput.includes("imageryRights")) {
    throw new Error(`已发布成果缺字段时未被准确拦截：\n${invalidOutput}`);
  }

  const videoWithoutSource = structuredClone(valid);
  const videoIndex = videoWithoutSource.results.findIndex((item) => item.mediaType === "video");
  delete videoWithoutSource.results[videoIndex].src;
  await writeFile(fixturePath, JSON.stringify(videoWithoutSource), "utf8");
  const invalidVideo = run("production", fixturePath);
  const invalidVideoOutput = `${invalidVideo.stdout}\n${invalidVideo.stderr}`;
  if (invalidVideo.status === 0 || !invalidVideoOutput.includes(`results[${videoIndex}].src 缺失`)) {
    throw new Error(`已发布视频缺少 src 时未被准确拦截：\n${invalidVideoOutput}`);
  }

  console.log("内容校验测试通过：预览、完整正式内容、缺字段成果和缺少 src 的视频均符合预期");
} finally {
  await rm(temp, { recursive: true, force: true });
}

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const mode = process.argv[2] ?? "preview";
const production = mode === "production";
const allowedModes = new Set(["preview", "production", "offline"]);

if (!allowedModes.has(mode)) {
  console.error(`未知校验模式：${mode}`);
  process.exit(1);
}

const contentPath = resolve(process.env.CONTENT_PATH ?? "src/content/site.json");
const content = JSON.parse(await readFile(contentPath, "utf8"));
const errors = [];
const warnings = [];
const requiredResultCounts = { documentary: 1, interview: 2, post: 7, news: 4, oralHistory: 1 };

const missing = (value) => value === null || value === undefined || (typeof value === "string" && value.trim() === "");
const addMissing = (label, value) => { if (missing(value)) errors.push(`${label} 缺失`); };
const textLength = (value) => Array.from(String(value ?? "").replace(/\s/g, "")).length;

addMissing("site.title", content.site?.title);
addMissing("site.description", content.site?.description);
addMissing("site.team", content.site?.team);
addMissing("site.updatedAt", content.site?.updatedAt);

if (!Array.isArray(content.history) || content.history.length !== 5) {
  errors.push(`history 必须恰好包含 5 个节点，当前为 ${content.history?.length ?? 0}`);
} else {
  const historyIds = new Set();
  content.history.forEach((node, index) => {
    const label = `history[${index}]`;
    ["id", "index", "stage", "period", "title", "summary", "visualImage", "visualCaption"].forEach((field) => addMissing(`${label}.${field}`, node[field]));
    if (historyIds.has(node.id)) errors.push(`${label}.id 重复：${node.id}`);
    historyIds.add(node.id);
    if (!Array.isArray(node.sourceIds)) errors.push(`${label}.sourceIds 必须是数组`);

    if (production) {
      if (String(node.period).includes("待")) errors.push(`${label}.period 尚未审核：${node.period}`);
      const summaryLength = textLength(node.summary);
      if (summaryLength < 80 || summaryLength > 120) errors.push(`${label}.summary 必须为 80–120 字，当前 ${summaryLength} 字`);
      addMissing(`${label}.verifiedBy`, node.verifiedBy);
      addMissing(`${label}.verifiedAt`, node.verifiedAt);
      if (!node.sourceIds?.length) errors.push(`${label}.sourceIds 至少需要 1 项`);
    } else if (String(node.period).includes("待") || !node.verifiedBy) {
      warnings.push(`${label} 仍为预览内容`);
    }
  });
}

if (!Array.isArray(content.sources)) {
  errors.push("sources 必须是数组");
} else {
  const sourceIds = new Set();
  content.sources.forEach((source, index) => {
    const label = `sources[${index}]`;
    ["id", "title", "publisher", "href", "license", "accessedAt"].forEach((field) => addMissing(`${label}.${field}`, source[field]));
    if (sourceIds.has(source.id)) errors.push(`${label}.id 重复：${source.id}`);
    sourceIds.add(source.id);
  });
  if (production && content.sources.length === 0) errors.push("sources 正式构建不能为空");
  if (production) {
    content.history?.forEach((node, index) => node.sourceIds?.forEach((id) => {
      if (!sourceIds.has(id)) errors.push(`history[${index}].sourceIds 引用了不存在的来源：${id}`);
    }));
  }
}

if (!Array.isArray(content.routeStops) || content.routeStops.length === 0) {
  errors.push("routeStops 至少需要 1 个站点");
} else {
  const orders = new Set();
  content.routeStops.forEach((stop, index) => {
    const label = `routeStops[${index}]`;
    if (!Number.isInteger(stop.order)) errors.push(`${label}.order 必须是整数`);
    if (orders.has(stop.order)) errors.push(`${label}.order 重复：${stop.order}`);
    orders.add(stop.order);
    addMissing(`${label}.name`, stop.name);
    const position = stop.approximatePosition;
    if (!position || typeof position.x !== "number" || typeof position.y !== "number") {
      errors.push(`${label}.approximatePosition 必须包含数字 x/y`);
    } else if (position.x < 0 || position.x > 100 || position.y < 0 || position.y > 100) {
      errors.push(`${label}.approximatePosition 必须位于 0–100`);
    }
    if (production && (!stop.verifiedByTeam || String(stop.name).includes("待"))) errors.push(`${label} 尚未经团队核实`);
  });
}

if (!Array.isArray(content.results)) {
  errors.push("results 必须是数组");
} else {
  const resultIds = new Set();
  Object.entries(requiredResultCounts).forEach(([category, count]) => {
    const actual = content.results.filter((item) => item.category === category).length;
    if (actual !== count) errors.push(`results.${category} 必须为 ${count} 项，当前 ${actual} 项`);
  });
  content.results.forEach((item, index) => {
    const label = `results[${index}]`;
    ["id", "category", "index", "aspectRatio", "status"].forEach((field) => addMissing(`${label}.${field}`, item[field]));
    if (resultIds.has(item.id)) errors.push(`${label}.id 重复：${item.id}`);
    resultIds.add(item.id);
    if (!Number.isInteger(item.fixedOrder)) errors.push(`${label}.fixedOrder 必须是整数`);
    if (!["pending", "published"].includes(item.status)) errors.push(`${label}.status 必须是 pending 或 published`);
    if (item.status === "published") {
      ["title", "summary", "date", "platform", "cover", "approvedBy", "approvedAt", "imageryRights"].forEach((field) => addMissing(`${label}.${field}`, item[field]));
      addMissing(`${label}.${item.mediaType === "video" ? "src" : "href"}`, item.mediaType === "video" ? item.src : item.href);
      if (item.imageryRights && !["team-owned", "licensed"].includes(item.imageryRights)) errors.push(`${label}.imageryRights 必须是 team-owned 或 licensed`);
    }
  });
}

if (production) {
  const siteUrl = process.env.SITE_URL;
  if (!siteUrl) errors.push("环境变量 SITE_URL 缺失");
  else {
    try {
      const url = new URL(siteUrl);
      if (url.protocol !== "https:") errors.push("SITE_URL 必须使用 https");
      if (!url.pathname.endsWith("/")) errors.push("SITE_URL 必须以 / 结尾");
    } catch {
      errors.push("SITE_URL 不是有效网址");
    }
  }
}

if (warnings.length) {
  console.warn(`内容提醒（${warnings.length}）：`);
  warnings.forEach((warning) => console.warn(`- ${warning}`));
}

if (errors.length) {
  console.error(`内容校验失败（${errors.length} 项）：`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`${mode} 内容校验通过`);

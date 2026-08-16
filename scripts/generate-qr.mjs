import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import QRCode from "qrcode";

const rawUrl = process.argv[2] ?? process.env.SITE_URL;
if (!rawUrl) {
  console.error("请传入正式站点地址，例如：pnpm generate:qr -- https://账号.github.io/longquan-celadon-h5/");
  process.exit(1);
}

let siteUrl;
try {
  siteUrl = new URL(rawUrl);
  if (siteUrl.protocol !== "https:") throw new Error();
} catch {
  console.error("二维码地址必须是有效的 https 网址");
  process.exit(1);
}

const output = resolve("artifacts");
await mkdir(output, { recursive: true });
await QRCode.toFile(resolve(output, "longquan-celadon-qr.svg"), siteUrl.href, { type: "svg", margin: 2, color: { dark: "#17201D", light: "#F3F5F0" } });
await QRCode.toFile(resolve(output, "longquan-celadon-qr.png"), siteUrl.href, { type: "png", width: 1600, margin: 3, errorCorrectionLevel: "H", color: { dark: "#17201D", light: "#F3F5F0" } });
console.log(`二维码已生成：${output}`);

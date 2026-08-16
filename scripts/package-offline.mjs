import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(".");
const output = resolve(root, "offline-package");
const archive = resolve(root, "longquan-celadon-offline.zip");
const build = spawnSync(process.execPath, [resolve(root, "scripts/build.mjs"), "offline"], { stdio: "inherit", env: process.env });
if (build.status !== 0) process.exit(build.status ?? 1);

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(resolve(root, "dist"), resolve(output, "site"), { recursive: true });
await cp(resolve(root, "offline/start-offline.cmd"), resolve(output, "start-offline.cmd"));
await cp(resolve(root, "offline/serve.ps1"), resolve(output, "serve.ps1"));
await writeFile(resolve(output, "使用说明.txt"), "双击 start-offline.cmd，浏览器会自动打开完整离线展览。关闭命令窗口即可停止本地服务。外部成果入口在离线包中固定禁用。\r\n", "utf8");

await rm(archive, { force: true });
const escapedOutput = output.replaceAll("'", "''");
const escapedArchive = archive.replaceAll("'", "''");
const zip = spawnSync("powershell.exe", ["-NoProfile", "-Command", `Compress-Archive -Path '${escapedOutput}\\*' -DestinationPath '${escapedArchive}' -Force`], { stdio: "inherit" });
if (zip.status !== 0) process.exit(zip.status ?? 1);
console.log(`离线包已生成：${archive}`);

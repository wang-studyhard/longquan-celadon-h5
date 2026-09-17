# 一器千年｜龙泉青瓷社会实践成果展

面向公众的龙泉青瓷社会实践 H5。项目采用 Vite、TypeScript、GSAP ScrollTrigger、Lottie SVG Light 和 Lucide，无服务端依赖，支持 GitHub Pages 与 Windows 离线展示。

## 当前状态

页面结构、二维器物背景、螺旋历史脉络、调研路线、15 个固定成果展位、口述史二级页、分享封面和离线包均已实现。现有报道、团队微型纪录片、陈华与陈坛根两篇人物采访，以及两篇口述史均已接入对应展位。

## 本地运行

```powershell
pnpm install
pnpm dev
```

常用检查：

```powershell
pnpm typecheck
pnpm test:content
pnpm build
pnpm qa:visual
```

正式内容验收使用：

```powershell
$env:SITE_URL="https://YOUR_GITHUB_USERNAME.github.io/longquan-celadon-h5/"
pnpm validate:production
pnpm build:production
```

## 内容更新

内容集中在 `src/content/site.json`。不要改变成果 `id`、`fixedOrder` 和展位数量。

已发布成果必须补齐：

- `title`、`summary`、`date`、`platform`、`cover`
- 外部成果填写 `href`，站内视频填写 `mediaType: "video"` 与 `src`
- `approvedBy`、`approvedAt`
- `imageryRights`：仅允许 `team-owned` 或 `licensed`

历史节点正式发布前必须有 80–120 字正文、授权视觉、来源编号、审核人和审核时间。来源项需记录标题、发布者、链接、许可方式和访问日期。路线站点只能使用团队确认的名称与顺序。

## 本地预览与正式发布

`pnpm build` 是本地预览构建；`pnpm build:production` 会执行正式内容校验，并生成生产环境的 robots 与 sitemap。开发预览模式与网站内容是否已经正式审核是两件事。

内容和授权信息全部审核通过后，再确认 GitHub Pages 工作流使用正式构建：

先配置固定 Pages 地址，再运行：

```powershell
pnpm build:production
pnpm generate:qr -- $env:SITE_URL
```

正式构建会列出所有缺项；全部通过后再推送到 `main`，由工作流发布 GitHub Pages。当前不要通过推送、手动运行工作流或标签发布线上版本。

## 离线展示

```powershell
pnpm package:offline
```

输出为 `longquan-celadon-offline.zip`。解压后双击 `start-offline.cmd`，浏览器会自动打开完整本地展览；关闭命令窗口即停止。离线包中的外部成果入口固定禁用。

## 素材边界

公开仓库只放批准公开的压缩素材。原始采访、视频、工作文件和授权凭证保留在团队内部存储。历史图片只能使用公共领域、CC 许可或其他明确开放授权资源，并保留授权页面与署名要求。

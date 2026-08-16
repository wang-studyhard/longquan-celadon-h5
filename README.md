# 一器千年｜龙泉青瓷社会实践成果展

面向公众的龙泉青瓷社会实践 H5。项目采用 Vite、TypeScript、GSAP ScrollTrigger、Lottie SVG Light 和 Lucide，无服务端依赖，支持 GitHub Pages 与 Windows 离线展示。

## 当前状态

当前是内容预览版。页面结构、二维器物背景、螺旋历史脉络、调研路线、11 个固定成果展位、口述史二级页、分享封面和离线包均已实现。工作区没有经过团队审核的历史正文、路线站点或授权图片，因此这些内容保持明确占位；正式构建会拒绝发布。

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

## 内容更新

内容集中在 `src/content/site.json`。不要改变成果 `id`、`fixedOrder` 和展位数量。

已发布成果必须补齐：

- `title`、`summary`、`date`、`platform`、`cover`、`href`
- `approvedBy`、`approvedAt`
- `imageryRights`：仅允许 `team-owned` 或 `licensed`

历史节点正式发布前必须有 80–120 字正文、授权视觉、来源编号、审核人和审核时间。来源项需记录标题、发布者、链接、许可方式和访问日期。路线站点只能使用团队确认的名称与顺序。

## 在线预览与正式发布

推送到 `main` 分支后，GitHub Actions 会运行预览构建并自动发布 GitHub Pages。该版本用于在线验收，页面仍保留未进入正式发布状态的内容标记。

内容和授权信息全部审核通过后，再在本地执行正式构建：

先配置固定 Pages 地址，再运行：

```powershell
$env:SITE_URL="https://YOUR_GITHUB_USERNAME.github.io/longquan-celadon-h5/"
pnpm build:production
pnpm generate:qr -- $env:SITE_URL
```

正式构建会列出所有缺项；全部通过后再将工作流切换为正式构建并创建版本标签发布。

## 离线展示

```powershell
pnpm package:offline
```

输出为 `longquan-celadon-offline.zip`。解压后双击 `start-offline.cmd`，浏览器会自动打开完整本地展览；关闭命令窗口即停止。离线包中的外部成果入口固定禁用。

## 素材边界

公开仓库只放批准公开的压缩素材。原始采访、视频、工作文件和授权凭证保留在团队内部存储。历史图片只能使用公共领域、CC 许可或其他明确开放授权资源，并保留授权页面与署名要求。

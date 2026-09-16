# 编程教程全集

一个面向实际工程实践的中文编程教程知识库，共 152 篇教程。内容覆盖 C/C++、系统底层、Android 原生与 NDK、3D 数学、Vulkan / ImGui、跨进程内存、引擎数据模型、物理与可见性，以及专题、词汇和附录资料。

## 技术栈

本站使用 Next.js App Router、Fumadocs UI / Core / MDX、Tailwind CSS 与 pnpm 构建，并通过 Next.js Static Export 输出纯静态文件到 `out/`，由 GitHub Actions 部署到 GitHub Pages。

Fumadocs 是独立的开源文档框架，本仓库使用它作为文档站点基础设施；教程内容与本站工程代码仍归本仓库维护。

## 本地开发

```bash
pnpm install
pnpm dev
```

生产构建：

```bash
pnpm build
```

GitHub Actions 中会自动为 Project Pages 使用 `/tutorial` base path；本地开发保持根路径，不强制子路径。

## 内容结构

教程正文位于 `content/docs/`，各分卷通过 `meta.json` 显式维护顺序。旧版 `::: tip` / `::: warning` 等容器语法由迁移脚本标准化后交给 Fumadocs 原生 Admonition/Callout 渲染；Mermaid、KaTeX 数学公式和静态本地搜索均在生产构建中启用。

## License

见仓库根目录 `LICENSE`。迁移没有改变原有内容授权。

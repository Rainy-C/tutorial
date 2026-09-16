# 编程教程全集

基于 [Teek](https://github.com/Kele-Bingtang/vitepress-theme-teek)（VitePress 主题）构建的教程知识库，共 **152 篇** Markdown 教程：开始之前、八卷 100 章正文、9 篇深挖专题、8 篇英文词汇、26 篇附录。

## 本地启动

```sh
pnpm install
pnpm docs:dev
```

## 构建

```sh
pnpm docs:build   # 产物在 docs/.vitepress/dist
pnpm docs:preview # 本地预览构建产物
```

> 部署到 GitHub Pages 时，构建会根据 `GITHUB_REPOSITORY` 自动设置 `base`（如 `/tutorial/`），本地构建默认为 `/`。

## 在线阅读

- GitHub 仓库：<https://github.com/Rainy-C/tutorial>
- GitHub Pages：<https://rainy-c.github.io/tutorial/>

## 说明

- 主题与站点基础样式来自开源项目 [vitepress-theme-teek](https://github.com/Kele-Bingtang/vitepress-theme-teek)（MIT License），遵守其原许可证与署名要求，见 [LICENSE](./LICENSE)。
- 教程内容归本仓库所有。

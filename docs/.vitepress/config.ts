import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";
import { teekConfig } from "./teekConfig";
import { containers } from "./markdown/containers";

const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
// GitHub Pages 子目录部署：仓库 tutorial -> base /tutorial/
const base = repoName ? `/${repoName}/` : "/";
const site = "https://rainy-c.github.io";
const description =
  "编程教程全集：从编程地基、Android 与系统，到 3D 数学、图形、跨进程内存与引擎数据模型。152 篇教程，60 天完整路线。";

export default withMermaid(
  defineConfig({
    extends: teekConfig,
    lang: "zh-CN",
    title: "编程教程全集",
    description,
    base,
    cleanUrls: false,
    lastUpdated: true,
    ignoreDeadLinks: false,
    head: [
      ["link", { rel: "icon", type: "image/svg+xml", href: `${base}favicon.svg` }],
      ["link", { rel: "icon", type: "image/png", href: `${base}teek-logo-mini.png` }],
      ["meta", { property: "og:type", content: "website" }],
      ["meta", { property: "og:locale", content: "zh-CN" }],
      ["meta", { property: "og:title", content: "编程教程全集" }],
      ["meta", { property: "og:site_name", content: "编程教程全集" }],
      ["meta", { property: "og:description", content: description }],
      ["meta", { name: "description", content: description }],
      ["meta", { name: "author", content: "Rainy-C" }],
    ],
    markdown: {
      lineNumbers: true,
      math: true,
      image: { lazyLoading: true },
      container: {
        tipLabel: "提示",
        warningLabel: "警告",
        dangerLabel: "危险",
        infoLabel: "信息",
        detailsLabel: "详细信息",
      },
      config: (md) => {
        md.use(containers);
      },
    },
    sitemap: { hostname: site },
    themeConfig: {
      logo: "/favicon.svg",
      darkModeSwitchLabel: "主题",
      sidebarMenuLabel: "菜单",
      returnToTopLabel: "返回顶部",
      lastUpdatedText: "上次更新",
      outline: { level: [2, 4], label: "本页导航" },
      docFooter: { prev: "上一篇", next: "下一篇" },
      nav: [
        { text: "首页", link: "/" },
        { text: "开始阅读", link: "/00.开始之前/00.开始之前.html" },
        { text: "文章清单", link: "/articleOverview.html" },
        {
          text: "功能页",
          items: [
            { text: "归档页", link: "/archives.html" },
            { text: "分类页", link: "/categories.html" },
            { text: "标签页", link: "/tags.html" },
          ],
        },
        { text: "GitHub", link: "https://github.com/Rainy-C/tutorial" },
      ],
      socialLinks: [
        { icon: "github", link: "https://github.com/Rainy-C/tutorial" },
      ],
      search: {
        provider: "local",
        options: {
          locales: {
            root: {
              translations: {
                button: { buttonText: "搜索文档", buttonAriaLabel: "搜索文档" },
                modal: {
                  noResultsText: "未找到相关结果",
                  resetButtonTitle: "清除查询条件",
                  footer: { selectText: "选择", navigateText: "切换", closeText: "关闭" },
                },
              },
            },
          },
        },
      },
    },
    vite: {
      // Teek 的自动侧边栏插件需要识别 docs 目录
      // mermaid 插件自动注册
    },
  })
);

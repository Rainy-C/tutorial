import Teek from "vitepress-theme-teek";
import TeekLayoutProvider from "./components/TeekLayoutProvider.vue";

import "vitepress-theme-teek/index.css";
import "vitepress-theme-teek/theme-chalk/tk-code-block-mobile.css"; // 移动端代码块
import "vitepress-theme-teek/theme-chalk/tk-sidebar.css"; // 侧边栏优化
import "vitepress-theme-teek/theme-chalk/tk-nav.css"; // 导航栏优化
import "vitepress-theme-teek/theme-chalk/tk-aside.css"; // 右侧目录
import "vitepress-theme-teek/theme-chalk/tk-table.css"; // 表格样式
import "vitepress-theme-teek/theme-chalk/tk-mark.css"; // <mark> 样式
import "vitepress-theme-teek/theme-chalk/tk-blockquote.css"; // 引用块
import "vitepress-theme-teek/theme-chalk/tk-home-card-hover.css"; // 首页卡片悬停
import "vitepress-theme-teek/theme-chalk/tk-fade-up-animation.css"; // 首屏加载动画

import "./styles/code-bg.scss";
import "./styles/callouts.scss";
import "./styles/custom.scss";

export default {
  extends: Teek,
  Layout: TeekLayoutProvider,
};

import { defineTeekConfig } from "vitepress-theme-teek/config";

// 顶层分组显示名（Teek 自动侧边栏基于目录扫描，这里只做标题美化，不维护 152 项清单）
const GROUP_LABELS: [RegExp, string][] = [
  [/开始之前/, "开始之前"],
  [/卷一/, "卷一 · 编程地基"],
  [/卷二/, "卷二 · 系统与底层"],
  [/卷三/, "卷三 · Android 原生与构建"],
  [/卷四/, "卷四 · 3D 数学"],
  [/卷五/, "卷五 · 图形与界面"],
  [/卷六/, "卷六 · 跨进程内存"],
  [/卷七/, "卷七 · 引擎数据模型"],
  [/卷八/, "卷八 · 物理与可见性"],
  [/深挖/, "深挖专题"],
  [/英文词汇/, "英文词汇"],
  [/附录/, "附录"],
];

function prettyGroupText(text: string | undefined): string | undefined {
  if (!text) return text;
  const bare = text.replace(/^\d+\./, "");
  for (const [re, label] of GROUP_LABELS) {
    if (re.test(bare)) return label;
  }
  return bare;
}

export const teekConfig = defineTeekConfig({
  teekHome: false,
  vpHome: true,
  sidebarTrigger: true, // 侧边栏折叠
  author: { name: "Rainy-C", link: "https://github.com/Rainy-C" },
  footerInfo: {
    theme: { name: "Theme By Teek" },
    copyright: { createYear: 2026, suffix: "Rainy-C" },
  },
  codeBlock: {
    copiedDone: (TkMessage: any) => TkMessage.success("复制成功！"),
  },
  articleShare: { enabled: false },
  vitePlugins: {
    sidebarOption: {
      type: "array", // 单侧边栏：每个页面都能看到全部 12 个分组
      ignoreList: [/^@pages/],
      initItems: true,
      initItemsText: true,
      collapsed: false, // 分组默认展开
      sidebarResolved: (data: any) => {
        const items = Array.isArray(data) ? data : Object.values(data as any);
        for (const item of items as any[]) {
          if (item && item.text) item.text = prettyGroupText(item.text);
        }
        return data;
      },
    },
  },
});

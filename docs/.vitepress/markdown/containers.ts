import type MarkdownIt from "markdown-it";
import container from "markdown-it-container";

/**
 * Register extra alert types used by the tutorial's Obsidian-style callouts.
 * Rendering mirrors VitePress built-in custom-blocks so styling stays native.
 * tip / info / warning / danger / details are already built into VitePress.
 */
const EXTRA_TYPES: Record<string, string> = {
  note: "注意",
  abstract: "摘要",
  question: "问题",
  success: "成功",
  important: "重要",
};

export function containers(md: MarkdownIt) {
  for (const [type, label] of Object.entries(EXTRA_TYPES)) {
    md.use(container, type, {
      render(tokens: any[], idx: number) {
        if (tokens[idx].nesting === 1) {
          const info = tokens[idx].info.trim().slice(type.length).trim();
          const title = md.renderInline(info || label);
          return `<div class="custom-block ${type}"><p class="custom-block-title">${title}</p>\n`;
        }
        return `</div>\n`;
      },
    });
  }
}

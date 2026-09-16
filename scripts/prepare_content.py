#!/usr/bin/env python3
"""
Transform tutorial sources into the VitePress docs tree.
- course-order numbering (dirs & files)
- Obsidian [[wikilinks]] -> markdown links (resolved against final paths)
- escape stray C++ template <> that VitePress/Vue would swallow as HTML
Content itself is NOT modified (no reordering inside files, no edits of prose).
"""
import os, re, sys, shutil

SRC = "/workspace/tutorial-src/tutorial"
DST = "/workspace/tutorial-site/docs"
CN = {1:"一",2:"二",3:"三",4:"四",5:"五",6:"六",7:"七",8:"八"}
VOL_NAMES = {1:"编程地基",2:"系统与底层",3:"Android原生与构建",4:"3D数学",5:"图形与界面",6:"跨进程内存",7:"引擎数据模型",8:"物理与可见性"}
DIGI_RE = re.compile(r'^第(\d+)章')

def vol_dir(n): return f"0{n}.卷{CN[n]}-{VOL_NAMES[n]}"

# ---------- plan: (src_rel, dst_rel) ----------
plan = []
plan.append(("00-开始之前.md", "00.开始之前/00.开始之前.md"))
for n in range(1, 9):
    sd = f"卷{CN[n]}-{VOL_NAMES[n]}"
    dd = vol_dir(n)
    plan.append((f"{sd}/卷{CN[n]}-本卷导航.md", f"{dd}/00.本卷导读.md"))
    chapters = []
    for f in os.listdir(os.path.join(SRC, sd)):
        m = DIGI_RE.match(f)
        if m: chapters.append((int(m.group(1)), f))
    chapters.sort()
    for idx, (num, f) in enumerate(chapters, start=1):
        plan.append((f"{sd}/{f}", f"{dd}/{idx:02d}.{f}"))

plan.append(("深挖/00-深挖索引.md", "09.深挖专题/00.深挖索引.md"))
for i, L in enumerate("ABCDEFGH", start=1):
    src = next(f for f in os.listdir(os.path.join(SRC, "深挖")) if f.startswith(f"深挖{L}-"))
    plan.append((f"深挖/{src}", f"09.深挖专题/{i:02d}.{src}"))

vocab_order = ["词频词汇总览.md", "高频总表索引-1000词.md"]
for lvl in range(1, 7):
    vocab_order.append(next(f for f in os.listdir(os.path.join(SRC, "英文词汇")) if f.startswith(f"第{lvl}级-")))
for i, f in enumerate(vocab_order):
    plan.append((f"英文词汇/{f}", f"10.英文词汇/{i:02d}.{f}"))

appendix_letters = list("ABCDEFGHIJ") + ["K","K1","K2","K3","K4"] + list("LMNOPQRSTUV")
for i, L in enumerate(appendix_letters):
    src = next(f for f in os.listdir(os.path.join(SRC, "附录")) if f == f"附录{L}-" + f[len(f"附录{L}-"):] and f.startswith(f"附录{L}-"))
    plan.append((f"附录/{src}", f"11.附录/{i:02d}.{src}"))

# basename(w/o ext) -> final docs-relative path
basemap = {}
for s, d in plan:
    basemap[os.path.splitext(os.path.basename(s))[0]] = d

# ---------- VP slug for same-file anchors ----------
_rSpecial = re.compile(r'[\s~`!@#$%^&*()\-_+=[\]{}\\|;:"\',<.>/?]+')
def vp_slug(text):
    return _rSpecial.sub('-', text.strip()).replace('\u0000-\u001f', '').lower().strip('-')

# ---------- content transform ----------
fence_re = re.compile(r'(```|~~~)')
def escape_line(line):
    # split off inline code segments
    parts = re.split(r'(`[^`\n]*`)', line)
    for j in range(0, len(parts), 2):
        parts[j] = re.sub(r'<(std::mutex|MyObjectId|uint64_t)>', r'&lt;\1&gt;', parts[j])
    return ''.join(parts)


CALLOUT_OPEN = re.compile(r'^>\s*\[!(\w+)\]\s*(.*)$')
FENCE_OPEN = re.compile(r'^\s*(```|~~~)')
ALIAS_TYPE = {"caution": "danger", "quote": "note"}

def convert_callouts(text):
    """Convert `> [!type] Title` blockquote callouts into ::: type Title containers.
    Content inside is only de-blockquoted; nothing else changes."""
    lines = text.split('\n')
    out = []
    i, n = 0, len(lines)
    in_fence = False
    fence_mark = None
    while i < n:
        ln = lines[i]
        if in_fence:
            out.append(ln)
            m = FENCE_OPEN.match(ln)
            if m and m.group(1) == fence_mark:
                in_fence = False
                fence_mark = None
            i += 1
            continue
        m = CALLOUT_OPEN.match(ln)
        if m:
            typ = m.group(1).lower()
            typ = ALIAS_TYPE.get(typ, typ)
            title = m.group(2).strip()
            out.append(('::: ' + typ + (' ' + title if title else '')).rstrip())
            i += 1
            while i < n and (lines[i].startswith('>') or lines[i] == '>'):
                body = re.sub(r'^>\s?', '', lines[i])
                out.append(body)
                fm = FENCE_OPEN.match(body)
                if fm:
                    if not in_fence:
                        in_fence = True
                        fence_mark = fm.group(1)
                    elif fence_mark == fm.group(1):
                        in_fence = False
                        fence_mark = None
                i += 1
            out.append(':::')
            continue
        fm = FENCE_OPEN.match(ln)
        if fm:
            in_fence = True
            fence_mark = fm.group(1)
        out.append(ln)
        i += 1
    return '\n'.join(out)

wiki_re = re.compile(r'\[\[([^\[\]\n]+)\]\]')

def rewrite_wikis(text, cur_dst):
    cur_dir = os.path.dirname(cur_dst)
    warnings = []
    def repl(m):
        inner = m.group(1)
        if '\\|' in inner:
            target, label = inner.split('\\|', 1)
        elif '|' in inner:
            target, label = inner.split('|', 1)
        else:
            target, label = inner, inner
        target = target.strip(); label = label.strip()
        if target.startswith('#'):
            slug = vp_slug(target[1:].replace('#', ' ').strip())
            return f'[{label}](#{slug})'
        key = target
        dst = basemap.get(key)
        if dst is None:
            warnings.append(f"unresolved wikilink [[{inner}]]")
            return f'**{label}**'
        rel = os.path.relpath(dst, cur_dir).replace(os.sep, '/')
        return f'[{label}]({rel})'
    out = wiki_re.sub(repl, text)
    return out, warnings

def main():
    if os.path.isdir(DST + "/.vitepress/dist"): shutil.rmtree(DST + "/.vitepress/dist")
    total_warn = []
    copied = 0
    for s, d in plan:
        sp, dp = os.path.join(SRC, s), os.path.join(DST, d)
        os.makedirs(os.path.dirname(dp), exist_ok=True)
        text = open(sp, encoding='utf-8').read()
        # split off fenced blocks; escape only outside fences
        # Obsidian callouts -> VitePress containers (fence-aware)
        text = convert_callouts(text)

        # line-wise fence-aware escaping of stray C++ template angle brackets
        lines = text.split('\n')
        out_lines = []
        in_fence = False
        fence_mark = None
        for ln in lines:
            m = re.match(r'^\s*(```|~~~)', ln)
            if m:
                if not in_fence:
                    in_fence = True
                    fence_mark = m.group(1)
                elif fence_mark == m.group(1):
                    in_fence = False
                    fence_mark = None
                out_lines.append(ln)
                continue
            out_lines.append(ln if in_fence else escape_line(ln))
        text = '\n'.join(out_lines)
        text, warns = rewrite_wikis(text, d)
        total_warn += [f"{s}: {w}" for w in warns]
        open(dp, 'w', encoding='utf-8').write(text)
        copied += 1
    print(f"copied {copied} markdown files")
    # leftover sources not in plan?
    src_all = set()
    for root, _, files in os.walk(SRC):
        for f in files:
            if f.endswith('.md'):
                src_all.add(os.path.relpath(os.path.join(root, f), SRC))
    planned = {s for s, _ in plan}
    missing = src_all - planned
    dup = len(plan) != len(set(d for _, d in plan))
    print(f"source md: {len(src_all)}, planned: {len(planned)}, missing: {sorted(missing)}, duplicate dst: {dup}")
    if total_warn:
        print("WIKILINK WARNINGS:")
        for w in total_warn: print(" ", w)
    else:
        print("wikilinks: all resolved")

if __name__ == "__main__":
    main()

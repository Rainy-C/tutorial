import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve('content/docs');
const EXPECTED = 152;
const calloutTypes = new Map([
  ['abstract', 'info'],
  ['info', 'info'],
  ['note', 'info'],
  ['important', 'info'],
  ['tip', 'tip'],
  ['success', 'tip'],
  ['warning', 'warning'],
  ['danger', 'danger'],
  ['question', 'tip'],
]);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else if (/\.mdx?$/.test(entry.name)) files.push(full);
  }
  return files;
}

function findTitle(source, file) {
  const body = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
  const lines = body.split(/\r?\n/);
  let fence = null;
  for (const line of lines) {
    const marker = line.match(/^\s*(```+|~~~+)/)?.[1];
    if (marker) {
      if (!fence) fence = marker[0];
      else if (marker[0] === fence) fence = null;
      continue;
    }
    if (!fence) {
      const match = line.match(/^#\s+(.+?)\s*$/);
      if (match) return match[1].replace(/[*_`]/g, '').trim();
    }
  }
  return path.basename(file, path.extname(file));
}

function ensureTitle(source, title) {
  if (source.startsWith('---\n') || source.startsWith('---\r\n')) {
    const end = source.indexOf('\n---', 4);
    if (end !== -1) {
      const frontmatter = source.slice(0, end);
      if (/^title\s*:/m.test(frontmatter)) return source;
      const firstBreak = source.indexOf('\n');
      return `${source.slice(0, firstBreak + 1)}title: ${JSON.stringify(title)}\n${source.slice(firstBreak + 1)}`;
    }
  }
  return `---\ntitle: ${JSON.stringify(title)}\n---\n\n${source}`;
}

function transformBody(source) {
  const lines = source.split(/\r?\n/);
  let fence = null;
  let callouts = 0;
  let links = 0;

  const output = lines.map((line) => {
    const marker = line.match(/^\s*(```+|~~~+)/)?.[1];
    if (marker) {
      if (!fence) fence = marker[0];
      else if (marker[0] === fence) fence = null;
      return line;
    }
    if (fence) return line;

    const callout = line.match(/^(\s*):::\s+([A-Za-z][\w-]*)(?:\s+(.+?))?\s*$/);
    if (callout && calloutTypes.has(callout[2].toLowerCase())) {
      const type = calloutTypes.get(callout[2].toLowerCase());
      const title = callout[3]?.trim().replaceAll(']', '\\]');
      callouts += 1;
      return title ? `${callout[1]}:::${type}[${title}]` : `${callout[1]}:::${type}`;
    }

    const replaced = line.replace(/(\]\()([^\n)]*?)\.md((?:#[^\n)]*)?\))/g, (_all, open, target, suffix) => {
      links += 1;
      return `${open}${target}${suffix}`;
    });
    return replaced;
  });

  return { source: output.join('\n'), callouts, links };
}

const files = await walk(ROOT);
if (files.length !== EXPECTED) {
  throw new Error(`Tutorial count mismatch before migration: expected ${EXPECTED}, found ${files.length}`);
}

let changed = 0;
let callouts = 0;
let links = 0;
for (const file of files) {
  const original = await readFile(file, 'utf8');
  const title = findTitle(original, file);
  const titled = ensureTitle(original, title);
  const result = transformBody(titled);
  callouts += result.callouts;
  links += result.links;
  if (result.source !== original) {
    await writeFile(file, result.source, 'utf8');
    changed += 1;
  }
}

const after = await walk(ROOT);
if (after.length !== EXPECTED) {
  throw new Error(`Tutorial count mismatch after migration: expected ${EXPECTED}, found ${after.length}`);
}

console.log(`[content] tutorials ${after.length}/${EXPECTED}; files changed ${changed}; callouts converted ${callouts}; internal .md links normalized ${links}`);

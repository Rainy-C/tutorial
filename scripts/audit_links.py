import os
import sys
import time
from collections import defaultdict, deque
from html.parser import HTMLParser
from urllib.error import HTTPError
from urllib.parse import quote, unquote, urljoin, urlsplit, urlunsplit, urldefrag
from urllib.request import Request, urlopen

BASE = "https://rainy-c.github.io/tutorial/"
HOST = "rainy-c.github.io"

class LinkParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.hrefs = []

    def handle_starttag(self, tag, attrs):
        if tag != "a":
            return
        for key, value in attrs:
            if key == "href" and value:
                self.hrefs.append(value)

def canon(url):
    url, _ = urldefrag(url)
    p = urlsplit(url)
    path = quote(unquote(p.path or "/"), safe="/%:@-._~")
    return urlunsplit((p.scheme.lower(), p.netloc.lower(), path, "", ""))

def gh_escape(value):
    return value.replace("%", "%25").replace("\r", "%0D").replace("\n", "%0A")

def seeds():
    yield BASE, "<homepage>"
    root = "content/docs"
    for dirpath, _, names in os.walk(root):
        for name in sorted(names):
            if not name.endswith((".md", ".mdx")):
                continue
            full = os.path.join(dirpath, name)
            rel = os.path.relpath(full, root).replace(os.sep, "/")
            rel = rel[:-4] if rel.endswith(".mdx") else rel[:-3]
            enc = "/".join(quote(x, safe="-._~") for x in rel.split("/"))
            yield canon(BASE + enc + "/"), rel

def fetch(url):
    last_error = ""
    for attempt in range(4):
        try:
            req = Request(url, headers={"User-Agent": "Rainy-C-link-audit"})
            with urlopen(req, timeout=30) as r:
                return (
                    r.getcode() or 0,
                    canon(r.geturl()),
                    r.headers.get("Content-Type", ""),
                    r.read(),
                    "",
                )
        except HTTPError as e:
            body = b""
            try:
                body = e.read()
            except Exception:
                pass
            return (
                e.code,
                canon(e.geturl() or url),
                e.headers.get("Content-Type", "") if e.headers else "",
                body,
                repr(e),
            )
        except Exception as e:
            last_error = repr(e)
            if attempt < 3:
                time.sleep(1 + attempt)
    return 0, url, "", b"", last_error

def main():
    queue = deque()
    seen = set()
    refs = defaultdict(set)

    for url, label in seeds():
        if url not in seen:
            seen.add(url)
            queue.append(url)
        refs[url].add(label)

    results = {}
    errors = {}
    html_pages = 0
    href_count = 0

    while queue:
        url = queue.popleft()
        code, final_url, ctype, body, error = fetch(url)
        results[url] = code
        if error:
            errors[url] = error
        if not (200 <= code < 300) or "text/html" not in ctype.lower():
            continue

        html_pages += 1
        parser = LinkParser()
        parser.feed(body.decode("utf-8", errors="replace"))

        for href in parser.hrefs:
            href_count += 1
            raw = href.strip()
            low = raw.lower()
            if not raw or low.startswith(("#", "mailto:", "tel:", "javascript:", "data:")):
                continue

            target = canon(urljoin(final_url, raw))
            p = urlsplit(target)
            if p.scheme not in ("http", "https") or p.netloc.lower() != HOST:
                continue

            refs[target].add(url)
            if target not in seen:
                seen.add(target)
                queue.append(target)

    bad = sorted((url, code) for url, code in results.items() if not (200 <= code < 300))

    print("===== INTERNAL LINK AUDIT =====")
    print("Seed URLs:", 153)
    print("HTML pages crawled:", html_pages)
    print("Anchor hrefs parsed:", href_count)
    print("Unique same-host URLs requested:", len(results))
    print("Broken/non-2xx URLs:", len(bad))
    print(f"::notice title=Internal link audit::{gh_escape(f'checked={len(results)} broken={len(bad)}')}")

    if bad:
        print("\n===== BROKEN URLS =====")
        for url, code in bad:
            print(f"[{code or 'ERR'}] {url}")
            ref_list = sorted(refs[url])
            for ref in ref_list:
                print("    <-", ref)
            if url in errors:
                print("    !!", errors[url])
            annotation = f"{code or 'ERR'} {url} <- {' | '.join(ref_list)}"
            print(f"::error title=Broken internal link::{gh_escape(annotation)}")
        return 1

    print("\nNo broken same-host links found.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())

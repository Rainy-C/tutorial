import os
import sys
import time
from collections import defaultdict, deque
from html.parser import HTMLParser
from urllib.error import HTTPError
from urllib.parse import quote, urljoin, urlsplit, urlunsplit, urldefrag
from urllib.request import Request, urlopen

BASE = "https://rainy-c.github.io/tutorial/"
HOST = "rainy-c.github.io"


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.hrefs = []

    def handle_starttag(self, tag, attrs):
        if tag.lower() != "a":
            return
      for key, value in attrs:
            if key.lower() == "href" and value:
                self.hrefs.append(value)


def canonical(url: str) -> str:
    url, _ = urldefrag(url)
    parsed = urlsplit(url)
    encoded_path = quote(
        parsed.path or "/",
        safe="/:@-._~!$&'(i*++,;=%",
    )
    return urlunsplit(
        (
            parsed.scheme.lower(),
            parsed.netloc.lower(),
            encoded_path,
            "",
            "",
        )
    )


def seed_urls():
    yield BASE, "<homepage>"

    root = "content/docs"
    for dirpath, _, files in os.walk(root):
        for name in sorted(files):
            if not (name.endswith(".md") or name.endswith(".mdx")):
                continue

            full = os.path.join(dirpath, name)
            rel = os.path.relpath(full, root).replace(os.sep, "/")
            rel = rel[:-4] if rel.endswith(".mdx") else rel[:-3]
            encoded = "/".join(
                quote(part, safe="-._~")
                for part in rel.split("/")
            )
            yield canonical(BASE + encoded + "/"), rel


def fetch(url: str):
    code = 0
    body = b""
    content_type = ""
    final_url = url
    error = ""

    for attempt in range(4):
        try:
            req = Request(
                url,
                headers={"User-Agent": "Rainy-C/tutorial-link-audit"},
            )
            with urlopen(req, timeout=30) as response:
                code = response.getcode() or 0
                final_url = canonical(response.geturl())
                content_type = response.headers.get("Content-Type", "")
                body = response.read()
            break
        except HTTPError as exc:
            code = exc.code
            final_url = canonical(exc.geturl() or url)
            content_type = (
                exc.headers.get("Content-Type", "")
                if exc.headers
                else ""
            )
            try:
                body = exc.read()
            except Exception:
                body = b""
            error = repr(exc)
            break
        except Exception as exc:
            error = repr(exc)
            if attempt == 3:
                code = 0
            else:
                time.sleep(1 + attempt)

    return code, final_url, content_type, body, error


def main():
    queue = deque()
    discovered = set()
    refs = defaultdict(set)

    for url, label in seed_urls():
        url = canonical(url)
        if url not in discovered:
            discovered.add(url)
            queue.append(url)
        refs[url].add(label)

    results = {}
    errors = {}
    html_pages = 0
    hrefs_parsed = 0
    same_host_hrefs = 0

    while queue:
        url = queue.popleft()
        code, final_url, content_type, body, error = fetch(url)
        results[url] = code
        if error:
            errors[url] = error

        if not (200 <= code < 300):
            continue
        if "text/html" not in content_type.lower():
            continue

        html_pages += 1
        parser = Links()
        try:
            parser.feed(body.decode("utf-8", errors="replace"))
        except Exception:
            pass

        for href in parser.hrefs:
            hrefs_parsed += 1
            raw = href.strip()
            lowered = raw.lower()

            if (
                not raw
                or lowered.startswith(
                    ("#", "mailto:", "tel:", "javascript:", "data:")
                )
            ):
                continue

            target = canonical(urljoin(final_url, raw))
            parsed = urlsplit(target)
            if (
                parsed.scheme not in ("http", "https")
                or parsed.netloc.lower() != HOST
            ):
                continue

            same_host_hrefs += 1
            refs[target].add(url)

            if target not in discovered:
                discovered.add(target)
                queue.append(target)

    bad = sorted(
        (url, code)
        for url, code in results.items()
        if not (200 <= code < 300)
    )

    print("===== INTERNAL LINK AUDIT =====")
    print("Seed URLs: 153")
    print(f"HTML pages crawled: {html_pages}")
    print(f"Anchor hrefs parsed: {hrefs_parsed}")
    print(f"Same-host hrefs discovered: {same_host_hrefs}")
    print(f"Unique same-host URLs requested: {len(results)}")
    print(f"Broken/non-2xx URLs: {len(bad)}")

    if bad:
        print("\n===== BROKEN URLS =====")
        for url, code in bad:
            print(f"[{code or 'ERR'}] {url}")
            for ref in sorted(refs[url]):
                print(f"    <- {ref}")
            if url in errors:
                print(f"    !! {errors[url]}")

        summary_path = os.environ.get("GITHUB_STEP_SUMMARY")
        if summary_path:
            with open(summary_path, "a", encoding="utf-8") as output:
                output.write("## Internal link audit\n\n")
                output.write(
                    f"- Unique URLs checked: **{len(results)}**\n"
                )
                output.write(
                    f"- Broken/non-2xx: **{len(bad)}**\n\n"
                )
                output.write("### Broken URLs\n\n")
                for url, code in bad:
                    output.write(f"- `{code or 'ERR'}` {url}\n")
                    for ref in sorted(refs[url]):
                        output.write(f"  - from: {ref}\n")

        return 1

    print("\nNo broken same-host links found.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

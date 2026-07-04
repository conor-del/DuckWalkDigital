#!/usr/bin/env python3
"""Regenerate sitemap.xml from every public .html page in this directory.

There's no build framework behind this site, so this script is the
stand-in for a framework's built-in sitemap generator: it scans the
project root for top-level .html pages and writes sitemap.xml from
whatever it finds. Run it again any time a page is added or removed:

    python generate-sitemap.py
"""
import datetime
import os

DOMAIN = "https://duckwalkdigital.ie"
ROOT = os.path.dirname(os.path.abspath(__file__))

# filename -> (priority, changefreq); anything not listed falls back to DEFAULT
PRIORITY = {
    "index.html": (1.0, "weekly"),
    "blog.html": (0.7, "weekly"),
}
DEFAULT_PRIORITY = (0.8, "monthly")


def build_sitemap():
    pages = sorted(f for f in os.listdir(ROOT) if f.endswith(".html"))

    entries = []
    for page in pages:
        mtime = datetime.date.fromtimestamp(os.path.getmtime(os.path.join(ROOT, page)))
        loc = f"{DOMAIN}/" if page == "index.html" else f"{DOMAIN}/{page}"
        priority, changefreq = PRIORITY.get(page, DEFAULT_PRIORITY)
        entries.append(
            "  <url>\n"
            f"    <loc>{loc}</loc>\n"
            f"    <lastmod>{mtime.isoformat()}</lastmod>\n"
            f"    <changefreq>{changefreq}</changefreq>\n"
            f"    <priority>{priority}</priority>\n"
            "  </url>"
        )

    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(entries)
        + "\n</urlset>\n"
    )

    out_path = os.path.join(ROOT, "sitemap.xml")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(xml)

    print(f"Wrote sitemap.xml with {len(pages)} page(s): {', '.join(pages)}")


if __name__ == "__main__":
    build_sitemap()

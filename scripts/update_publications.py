#!/usr/bin/env python3
"""Refresh the static publication cache from Maxime Cordy's DBLP record."""

from __future__ import annotations

import json
from pathlib import Path
import urllib.request
import xml.etree.ElementTree as ET


DBLP_URL = "https://dblp.org/pid/73/10839.xml"
OUTPUT = Path(__file__).resolve().parents[1] / "data" / "publications.js"
ALLOWED_TYPES = {
    "article": "Journal Article",
    "inproceedings": "Conference Paper",
    "incollection": "Book Chapter",
}


def text(element: ET.Element, tag: str) -> str:
    child = element.find(tag)
    return "" if child is None else "".join(child.itertext()).strip()


def load_record() -> bytes:
    request = urllib.request.Request(
        DBLP_URL,
        headers={"User-Agent": "maxcordy.github.io publication cache"},
    )
    with urllib.request.urlopen(request, timeout=45) as response:
        return response.read()


def extract_publications(xml_data: bytes) -> list[dict[str, str]]:
    root = ET.fromstring(xml_data)
    publications: list[dict[str, str]] = []

    for wrapper in root.findall("r"):
        if not len(wrapper):
            continue
        record = wrapper[0]
        if record.tag not in ALLOWED_TYPES or record.get("publtype") == "informal":
            continue

        venue = text(record, "journal") or text(record, "booktitle")
        if venue.lower() == "corr":
            continue

        year = text(record, "year")
        title = text(record, "title")
        if not year or not title:
            continue

        link = text(record, "ee")
        if not link:
            key = record.get("key", "")
            link = f"https://dblp.org/rec/{key}.html" if key else "https://dblp.org/pid/73/10839.html"

        publications.append(
            {
                "year": year,
                "title": title,
                "venue": " · ".join(part for part in (venue, ALLOWED_TYPES[record.tag]) if part),
                "url": link,
            }
        )

    publications.sort(key=lambda item: (-int(item["year"]), item["title"].casefold()))
    return publications


def main() -> None:
    publications = extract_publications(load_record())
    if not publications:
        raise RuntimeError("DBLP returned no peer-reviewed publications; keeping the existing cache")

    payload = json.dumps(publications, ensure_ascii=False, indent=2).replace("</", "<\\/")
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(
        "// Generated automatically from DBLP. Do not edit manually.\n"
        f"window.PUBLICATIONS_CACHE = {payload};\n",
        encoding="utf-8",
    )
    print(f"Cached {len(publications)} peer-reviewed publications in {OUTPUT}")


if __name__ == "__main__":
    main()

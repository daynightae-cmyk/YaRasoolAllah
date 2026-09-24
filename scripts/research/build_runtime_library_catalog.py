#!/usr/bin/env python3
"""Build the lazy-loaded public catalog from the governed acquisition masters."""

from __future__ import annotations

import csv
import hashlib
import json
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path("research/library-acquisition/2026-09-23")
OUTPUT = Path("client/public/data/library-catalog.v1.json")


def read_csv(name: str) -> list[dict[str, str]]:
    with (ROOT / name).open("r", encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def value(raw: str | None) -> str | None:
    text = (raw or "").strip()
    return text or None


def main() -> None:
    works = read_csv("03-islamic-works-master.csv")
    editions = read_csv("05-editions-master.csv")
    versions = read_csv("06-digital-versions-master.csv")

    edition_counts = Counter(row["work_id"] for row in editions if row["work_id"])
    versions_by_work: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in versions:
        if row["work_id"]:
            versions_by_work[row["work_id"]].append(row)

    records = []
    for work in works:
        work_versions = versions_by_work[work["work_id"]]
        preferred = next(
            (row for row in work_versions if row["rights_status"] == "CLEARED_WITH_ATTRIBUTION"),
            work_versions[0] if work_versions else None,
        )
        records.append(
            {
                "id": work["work_id"],
                "titleAr": value(work["canonical_title_ar"]),
                "titleEn": value(work["canonical_title_en"]),
                "authorAr": value(work["author_name_ar"]),
                "authorEn": value(work["author_name_en"]),
                "deathHijri": value(work["author_death_hijri"]),
                "category": value(work["category_primary"]),
                "subcategory": value(work["category_secondary"]),
                "language": value(work["language_original"]),
                "status": work["work_status"],
                "source": work["bibliographic_source"],
                "sourceUrl": value(work["bibliographic_source_url"]),
                "openitiUri": value(work["openiti_book_uri"]),
                "editionCount": edition_counts[work["work_id"]],
                "versionCount": len(work_versions),
                "digital": None
                if preferred is None
                else {
                    "id": preferred["digital_version_id"],
                    "provider": preferred["provider"],
                    "itemUrl": value(preferred["canonical_landing_url"]),
                    "fileUrl": value(preferred["direct_file_url"]),
                    "iiifUrl": value(preferred["iiif_manifest"]),
                    "format": preferred["format"],
                    "rights": preferred["rights_status"],
                    "download": preferred["download_capability"],
                    "reading": preferred["reading_capability"],
                    "ocrAvailable": preferred["ocr_available"].lower() == "true",
                    "searchableText": preferred["searchable_text"].lower() == "true",
                },
            }
        )

    payload = {
        "schemaVersion": 1,
        "sourceVersion": "OpenITI 2025.1.9 + reviewed seed reconciliation 2026-09-23",
        "rightsNotice": "OpenITI texts are CC BY-NC-SA 4.0. Seed-only records are metadata pending bibliographic review.",
        "counts": {
            "works": len(records),
            "editions": len(editions),
            "digitalVersions": len(versions),
            "openitiWorks": sum(row["status"] == "OPENITI_RELEASE_WORK" for row in records),
            "pendingSeedWorks": sum(row["status"] != "OPENITI_RELEASE_WORK" for row in records),
        },
        "works": records,
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(
        json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )
    checksums = {}
    for path in sorted(ROOT.iterdir()):
        if path.is_file() and path.name != "MANIFEST_SHA256.json":
            checksums[path.name] = hashlib.sha256(path.read_bytes()).hexdigest()
    checksums[str(OUTPUT)] = hashlib.sha256(OUTPUT.read_bytes()).hexdigest()
    (ROOT / "MANIFEST_SHA256.json").write_text(
        json.dumps(
            {
                "algorithm": "SHA-256",
                "sourceVersion": payload["sourceVersion"],
                "files": checksums,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(json.dumps(payload["counts"], ensure_ascii=False))


if __name__ == "__main__":
    main()

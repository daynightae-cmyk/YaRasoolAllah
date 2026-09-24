# Archive and Catalogue Acquisition Evidence Memo

**Workstream:** 02 — Internet Archive, HathiTrust, Google Books, and WorldCat/OCLC
**Research date:** 23 September 2026
**Scope:** Provider capability, Arabic/Islamic discovery potential, identifiers, machine-readable access, file availability, rights, and lawful future-ingestion classification. This memo does not authorize content acquisition and no corpus was downloaded.

## Conclusion

The four sources have sharply different roles. **HathiTrust is the strongest metadata-acquisition source** in this group because it exposes a complete item inventory through Hathifiles, OAI-PMH and an identifier-based API, while placing its own bibliographic metadata contributions under CC0. Its scans and text remain volume- and digitizer-specific, however, so this is not a blanket full-text source. [1] [2] [3]

**Internet Archive is the largest immediately searchable candidate pool** and supports deep JSON discovery plus item/file manifests. It has meaningful Arabic/Islamic reach, but its public file availability is not a rights grant. The evidence supports metadata-first discovery and strict item-level licence review, not bulk mirroring. [4] [5] [6]

**Google Books should be treated as bounded discovery, access-state and remote-preview infrastructure.** Its API exposes identifiers and country-sensitive access fields, but Google warns that much Books data is licensed and not freely distributable. The API terms also prohibit charging users for an API-based application without separate permission. [7] [8] [9]

**WorldCat is an authoritative discovery and reconciliation layer, not a content source.** Its Arabic Discovery Catalog reports 3,991,039 Arabic resources as of May 2026, but neither that count nor a WorldCat record confers full-text access or reuse rights. New API use requires OCLC credentials and eligible subscriptions, while OCLC policy restricts mass extraction and direct mass distribution. [10] [11] [12]

## Provider comparison

| Provider | Verified Arabic/Islamic evidence | Machine-readable acquisition route | Best future role | Content/rights position | Priority |
|---|---|---|---|---|---|
| Internet Archive | Live bounded candidate counts: 537,052 Arabic text items; 101,249 Arabic text items tagged `subject:islam`; 5,272 English text items tagged `subject:islam`. These are **candidate archive-item counts**, not de-duplicated works or cleared content. | Advanced Search JSON; cursor-based Scraping API; one-item Metadata API/file manifest. | Discovery of candidate scans, OCR and files; file-level checksum capture. | Provider does not guarantee item copyright status. Downloadable items need individual rights review. | P4 provider-wide; P1/P2 only after explicit item-level clearance. |
| HathiTrust | Arabic materials are demonstrably catalogued; a live Arabic-English lexicon record returned 15 scanned-volume items with mixed full-view and limited states. | Hathifiles monthly snapshots/daily deltas; OAI-PMH MARC21/DC; Bibliographic API for HTID/OCLC/LCCN/ISBN lookup. | Primary bulk bibliographic metadata inventory and rights/access-state index. | Bibliographic metadata is CC0 subject to provider caveats; volume content is rights- and digitizer-specific. | P0 metadata; P2 external reading; P4 content transfer until cleared. |
| Google Books | API supports Arabic query text and `langRestrict=ar`, but no live Arabic record was retained: the observed request was quota-blocked. | Volumes API JSON, maximum 40 results per page. No verified bulk dump. | Low-volume metadata enrichment, identifier reconciliation, remote preview where `embeddable=true`. | Country-sensitive access; preview/download signals are not redistribution rights. | P3 metadata/discovery; P2 remote embed when returned as embeddable; P4 local content. |
| WorldCat/OCLC | Arabic Discovery Catalog: 3,991,039 Arabic resources, 2,746,748 records with Arabic script, and 1,768,348 Arabic-language catalogue records as of May 2026. | Licensed WorldCat Search API; public catalogue interface for manual discovery. | Finding holding/digitizing institutions and reconciling OCLC numbers. | Not a content host; policy/contract controls bulk record reuse. | P5 unauthenticated discovery; P3 after explicit entitlement. |

## Internet Archive: high-scale discovery, unresolved reuse

Internet Archive’s documented Advanced Search API supports metadata queries. Its cursor-based Scraping API is the correct documented route beyond the 10,000 sorted-page limit; the Metadata API returns one item’s metadata and file manifest by archive identifier. Automated requests must use a descriptive User-Agent and respect `429`/`Retry-After`. [4] [5] [6]

A bounded live check on 23 September 2026 returned **537,052** matching `mediatype:texts AND language:Arabic` items, **101,249** matching the same query with `subject:islam`, and **5,272** matching English text items tagged `subject:islam`. These are deliberately reported as **search-result candidates only**. Subject values are inconsistent across an open repository; one archive item may package multiple volumes or formats, and no query count measures unique works, lawful files, Islamic doctrinal relevance, or OCR quality.

The verified identifier `ArIslamicbooks` is an example of why package-level normalization is necessary. Its landing page and JSON metadata endpoint responded successfully. The record is titled **“Arabic Islamic Books,”** is labelled Arabic/texts, and belongs to `booksbylanguage_arabic` and `booksbylanguage`; however, the fetched metadata supplied neither a creator nor explicit rights/licence metadata. It contained **252 file entries** including 18 EPUB derivatives, 18 DjVu text files, 18 hOCR files, 18 JP2 ZIP files, 12 image-container PDFs and six text PDFs. One sampled numbered package had a 616-image JP2 ZIP, hOCR marked as Arabic with detected-language confidence 1.0000, and related PDF/EPUB/DjVuTXT files. This proves technical availability, not the title, edition, author, or reuse status of the underlying content. [13]

> Internet Archive states that it does not guarantee the copyright status of items or rights information appearing on item details or collection pages. [6]

Accordingly, retain the archive identifier as an **ARCHIVE_ITEM_PACKAGE** key. Retain checksums at the **DIGITAL_FILE** level. Do not convert a numbered PDF or OCR derivative into a WORK or canonical Islamic text until its bibliographic identity and edition are independently confirmed. The representative bundle is therefore classified **NEEDS_ITEM_LEVEL_REVIEW**, `DOWNLOAD_REQUIRES_LICENSE_REVIEW`, and `DO_NOT_INGEST` despite its working public file URLs.

## HathiTrust: the preferred metadata route, not automatic scan reuse

HathiTrust explicitly distinguishes a bibliographic **record** from an **item**, a scanned physical volume. Its Bibliographic API resolves standard identifiers and returns both record metadata and individual HTIDs with rights/access strings. [1] The verified record `006790012`, *Arabic-English lexicon*, illustrates the distinction: the live API response returned 15 digitized-volume items under one catalogue record. Four were marked `pdus` / “Full view”; eleven were `ic` / “Limited (search-only).” The project should therefore store HTIDs as separate digital-volume records and never count all 15 as distinct works.

Hathifiles is especially suitable for mass discovery because it describes every collection item and includes bibliographic, source, rights and access information. The provider publishes a monthly `hathi_full_` snapshot and daily `hathi_upd_` deltas. HathiTrust’s OAI-PMH feed exposes MARC21 and Dublin Core XML; the worldwide-viewable `hathitrust:pd` set is safer for a globally accessible project than the United States-only `hathitrust:pdus` set. [2] [3]

The bibliographic-metadata permission is unusually strong: HathiTrust dedicates its own relevant contributions to CC0 and says its bibliographic records are shared under CC0, subject to applicable law and possible contributor contractual restrictions. That permission applies to metadata, **not** to page images or OCR. [2]

Content requires a distinct gate. HathiTrust says public-domain works may be copied, used and redistributed subject to stated cautions. However, its policy says Google-digitized image/OCR material should not be re-hosted, redistributed, or commercially used, even where the work is public domain; the policy separately says text transcribed from the images is unrestricted by that Google request. It also says that “Open Access” works require rightsholder permission for later uses unless a specific licence supplies permission. [14]

HathiTrust research datasets reinforce that boundary. They are approval-controlled, non-commercial research datasets. As historical February 2019 figures, the all-public-domain/CC datasets included 6,649,535 U.S.-accessible and 4,316,648 worldwide-accessible volumes. The Google-digitized subset requires an institutional Google Distribution Agreement and may not be re-hosted, used commercially, or shared with third parties. [15] Metadata may therefore enter the acquisition map now; full text must remain volume-level and rights-gated.

## Google Books: discovery signals and remote preview only by default

The documented Volumes API supports search with field qualifiers such as `intitle:`, `inauthor:`, `subject:`, ISBN, LCCN and OCLC number. It supports `filter=full`, `filter=free-ebooks`, `langRestrict`, `startIndex`, and a maximum `maxResults` value of 40. [8] The Volume record’s `id` is a **Google platform-volume identifier**, not a universal work or edition ID.

For every returned volume, persist `id`, `selfLink`, ISBN/LCCN/OCLC values, stated title/author/publisher/date/language, retrieval timestamp and country-specific `accessInfo`. The latter includes `viewability`, `publicDomain`, `embeddable`, PDF/EPUB availability, a web-reader link and download-license restrictions. A public-domain book is documented as `ALL_PAGES`, but a response remains country-specific and technical availability remains distinct from a right to re-host. [7]

The live query `q=صحيح البخاري&langRestrict=ar&filter=full&maxResults=10` received HTTP 429 / `RESOURCE_EXHAUSTED` in this environment. No Google record, count, ID, rights state or Arabic title has been inferred from it. Use a separately configured API project/key, respect quota, and run low-volume metadata-only discovery. The Google Books overview says much underlying data is licensed and Google cannot distribute it freely; default local-content status is therefore **NEEDS_LICENSE_REVIEW**. [7] [9]

## WorldCat/OCLC: authoritative bibliography and institutional routing

WorldCat’s public interface supports advanced searching by keyword, author, ISBN, ISSN, OCLC number, publisher, subject and title. It may link an authenticated user to licensed or open external services, but it does not itself make the linked item reusable. [16] OCLC reports that its Arabic Discovery Catalog provides Arabic-script search in an Arabic interface and, as of May 2026, covers 3,991,039 Arabic resources. This makes it valuable for locating Arabic printed and electronic editions, including Islamic studies leads, but the metric is not Islamic-only and does not measure digitization or rights. [10]

The WorldCat Search API can retrieve bibliographic records and holdings by OCLC number and other identifiers, but the official page limits it to libraries with both OCLC Cataloging and Metadata and FirstSearch/WorldCat Discovery subscriptions. It requires a WSKey; Search API 1.0 support ended on 31 December 2024. [11] The public title page tested for OCLC number 1181128 returned a Cloudflare 403 challenge in this environment, so no record-level content has been claimed.

OCLC’s OCN is a unique record identifier and a useful reconciliation key. Its quality operation also maintains duplicate detection and resolution. Nonetheless, do not merge records on OCN alone into a canonical work: compare title, creators, publication statement, language, ISBN/LCCN and manifestation clues. [12] For bulk use, obtain a specific licence or written OCLC permission. The OCLC policy says members must not mass-download WorldCat without prior written consent or mass-distribute data directly to non-members without prior consent. [17]

## Required normalization and rights rules

The ingestion model should retain the following chain without collapse:

1. **WORK** is the intellectual work, created only after title/author evidence is reconciled.
2. **EDITION** is a publication/translation/editorial manifestation, keyed by publisher, date, ISBN and volume statement where verified.
3. **DIGITAL_VERSION** is a provider-hosted digitization or platform expression, keyed by HTID, Internet Archive identifier plus file name, Google Volume ID, or an institutional persistent URL.
4. **DIGITAL_FILE** is the downloadable representation, keyed by canonical landing page, provider file name, format, checksum and stable provider ID. It is never presumed to share the work’s public-domain status.
5. **BIBLIOGRAPHIC_RECORD** and **HOLDING** remain separate from digital content. WorldCat OCN and HathiTrust record number belong here; HathiTrust HTID belongs to the scanned-volume level.

Arabic title search normalization may standardize tatweel, spacing, punctuation and selected Unicode variants, but must preserve the provider’s original Arabic title unchanged. Keep the provider’s author string alongside a normalized person link. Do not merge scholars based only on a kunya, nisba, short form or transliteration.

## Concrete handoff

The detailed, machine-readable registry is at:

`/home/ubuntu/research_outputs/02-archive-catalogs.json`

It contains four provider records, nine API/dataset records, two representative verified records, five rights-ledger observations, live access observations, normalized ingestion methods, continuation checkpoints, blockers and 20 exact source citations. It records **zero** canonical Islamic WORK entities rather than inventing bibliographic identities from package-level or blocked data.

## References

[1]: https://www.hathitrust.org/member-libraries/resources-for-librarians/data-resources/bibliographic-api/ "HathiTrust Bibliographic API"
[2]: https://www.hathitrust.org/member-libraries/resources-for-librarians/metadata-in-the-digital-library/metadata-sharing-and-use-policy/ "HathiTrust Metadata Sharing and Use Policy"
[3]: https://www.hathitrust.org/member-libraries/resources-for-librarians/data-resources/oai-feed/ "HathiTrust OAI Feed"
[4]: https://archive.org/help/aboutsearch.htm "Archive.org About Search"
[5]: https://archive.org/developers/metadata.html "Internet Archive Item Metadata API"
[6]: https://help.archive.org/help/rights/ "Internet Archive Rights"
[7]: https://developers.google.com/books/docs/v1/reference/volumes "Google Books Volume resource reference"
[8]: https://developers.google.com/books/docs/v1/using "Using the Google Books API"
[9]: https://developers.google.com/books/docs/overview "Google Books API Overview"
[10]: https://connect.oclc.org/en/arabic-discovery-catalog "OCLC Arabic Discovery Catalog"
[11]: https://www.oclc.org/developer/api/oclc-apis/worldcat-search-api.en.html "WorldCat Search API"
[12]: https://www.oclc.org/en/worldcat/cooperative-quality.html "OCLC Delivers Quality"
[13]: https://archive.org/metadata/ArIslamicbooks "Internet Archive metadata for Arabic Islamic Books"
[14]: https://www.hathitrust.org/the-collection/search-access/access-use-policy/ "HathiTrust Access and Use Policy"
[15]: https://www.hathitrust.org/member-libraries/resources-for-librarians/data-resources/research-datasets/ "HathiTrust Requesting and Using Research Datasets"
[16]: https://search.worldcat.org/faq "WorldCat.org Help and FAQ"
[17]: https://www.oclc.org/en/worldcat/cooperative-quality/policy.html "OCLC WorldCat Rights and Responsibilities Policy"
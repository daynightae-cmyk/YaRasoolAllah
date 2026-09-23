# Recommended Ingestion Plan

Generated: 2026-09-23

## P0 — metadata first
- Harvest HathiTrust metadata through Hathifiles/OAI-PMH.
- Use Wikidata/VIAF/ISNI only for entity reconciliation, never as sole historical authority.
- Preserve provider titles, author strings, identifiers, and rights/access codes.

## P1 — OpenITI primary texts
- Start with the 9,106 primary Arabic/Persian book versions.
- Attach CC BY-NC-SA 4.0 to every imported OpenITI resource.
- Keep 760 uncorrected-OCR book rows in an explicit review lane.
- Preserve all secondary versions for edition/version comparison instead of counting them as extra works.

## P2 — institutional remote reading
- Prefer provider-native IIIF for Princeton, Gallica/BnF, LOC, QDL, NYPL and other manuscript repositories.
- Use remote reading where rights do not clearly permit local hosting.

## P3 — bibliographic enrichment
- Use Google Books and WorldCat as discovery/reconciliation layers, not default content hosts.

## P4/P5 — do not ingest
- Internet Archive files with unresolved edition/rights.
- Community mirrors, social links, and uploaded seeds without independent bibliographic verification.

## Production gate
A resource may enter production only when PROVIDER_ID + RECORD_ID + WORK_MATCH + EDITION_MATCH + RIGHTS_ROW + READING_CAPABILITY + STORAGE_CLASSIFICATION are all present.

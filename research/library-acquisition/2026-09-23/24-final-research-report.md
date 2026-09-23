# Ya Rasool Allah ﷺ — Islamic Digital Library Acquisition Report

**Checkpoint:** 2026-09-23

## Proven corpus scale

The official OpenITI 2025.1.9 release was parsed at corpus scale:

- **14,107** digital/transcription versions total.
- **9,106** unique book works: 8,755 Arabic + 351 Persian.
- **431** distinct manuscript/document objects in the separate MSS subcorpus.
- **760** Arabic/Persian rows flagged as uncorrected OCR (524 Arabic + 236 Persian).
- The MSS objects are not inflated into the book count.

OpenITI 2025.1.9 is licensed **CC BY-NC-SA 4.0**. This is clear reuse permission with attribution, non-commercial, and ShareAlike restrictions; it is not blanket commercial permission and does not turn modern edition apparatus into unrestricted content.

## Other acquisition layers

- **Internet Archive:** very large candidate pool and strong APIs; rights remain item-level.
- **HathiTrust:** strongest open bulk bibliographic metadata route in the archive/catalog workstream; content rights differ by volume/digitizer.
- **Google Books:** bounded discovery/access-state layer by default.
- **WorldCat/OCLC:** authoritative reconciliation/holdings layer; not a full-text source and bulk use needs entitlement.
- Institutional manuscript discovery includes Princeton, Gallica/BnF, Library of Congress, QDL, NYPL and HMML; provider-native IIIF/OAI/SRU is preferred whenever available.

## Tool execution evidence

- Exa: canonical provider/API/rights discovery.
- Normal web search: current official release verification.
- Scite: scholarly verification of OpenITI and Arabic OCR/corpus literature.
- Hugging Face connector: dataset search was attempted but the connected server reported that dataset_search is disabled; no HF dataset was promoted from that failed action.
- Google Drive: a mission delivery folder was created.
- GitHub: canonical research outputs are being written to branch `research/islamic-library-acquisition-20260923`.

## No fake closure

This report does not claim complete item-level rights clearance, complete multilingual discovery, or production ingestion. It records the verified bulk corpus, exact rights constraints, and the remaining institutional/item-level acquisition work without collapsing WORK / EDITION / DIGITAL VERSION / FILE / MANUSCRIPT into one fake “book” object.

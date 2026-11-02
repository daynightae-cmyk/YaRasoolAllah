# Kids and family
Existing five `childrenAdaptationRegistry` records are original educational adaptations with age bands and provenance but zero cleared video assets. Keep reading mode and local progress, add curated `KidsContentRecord` only after editor checks age, cited source, depiction, language, publisher, embed permission and accessibility. Schema in `18-code-examples.md`.

Acquisition: YouTube `playlistItems.list?part=snippet,contentDetails&playlistId=<curated-id>&maxResults=50&key=<key>` yields page token and video IDs; `videos.list` validates embeddable and duration. https://developers.google.com/youtube/v3/docs/playlistItems/list . Wikimedia Commons educational illustrations can be queried by file and vetted one by one. HadeethEnc's external explained hadith links for stories are candidates, not already approved stories. Printable asset providers not verified; register placeholders in candidate queue only.

In `services/kids.ts`, `pages/KidsPage.tsx`, `components/ceremony/TvLounge.tsx`, show explicit reading / external / approved embed modalities; never simulate video playback. No visual depiction claiming to represent Prophet Muhammad ﷺ.

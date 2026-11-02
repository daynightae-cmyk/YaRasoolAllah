-- DESIGN PROPOSAL ONLY; migrate after inspecting existing Drizzle schema and hosting.
-- Apply source_governance tables first; the repository already defines them in shared/schema.ts.
-- Do not duplicate users/books/audio_tracks blindly. Every new table references the existing source_registry.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE TABLE IF NOT EXISTS acquired_works (
  work_id text PRIMARY KEY, title_ar text NOT NULL, author_ar text,
  openiti_uri text, source_id text NOT NULL REFERENCES source_registry(source_id),
  review_state text NOT NULL CHECK(review_state IN ('candidate','review_pending','verified')),
  UNIQUE(openiti_uri)
);
CREATE TABLE IF NOT EXISTS acquired_versions (
  version_id text PRIMARY KEY, work_id text NOT NULL REFERENCES acquired_works(work_id),
  source_id text NOT NULL REFERENCES source_registry(source_id),
  rights_id text NOT NULL REFERENCES rights_ledger(rights_id),
  edition_label text, canonical_url text NOT NULL, iiif_manifest_url text,
  artifact_sha256 char(64), availability text NOT NULL
);
CREATE TABLE IF NOT EXISTS acquired_tafsir (
  provider text NOT NULL, provider_record_id text NOT NULL, resource_id text NOT NULL,
  verse_key text NOT NULL CHECK(verse_key ~ '^[1-9][0-9]*:[1-9][0-9]*$'),
  language text NOT NULL, source_id text NOT NULL REFERENCES source_registry(source_id),
  version_id text REFERENCES acquired_versions(version_id),
  text_html text NOT NULL, review_state text NOT NULL DEFAULT 'review_pending',
  PRIMARY KEY(provider, provider_record_id),
  UNIQUE(provider, resource_id, verse_key, language)
);
CREATE INDEX IF NOT EXISTS acquired_tafsir_verse ON acquired_tafsir(verse_key, resource_id);
CREATE TABLE IF NOT EXISTS acquired_hadith (
  provider text NOT NULL, provider_record_id text NOT NULL, collection_id text NOT NULL,
  book_id text, chapter_id text, hadith_number text NOT NULL,
  text_ar text, text_en text, narrator text, isnad text,
  grade_text text, grade_assessor text, grade_source_url text,
  source_url text NOT NULL, source_id text NOT NULL REFERENCES source_registry(source_id),
  review_state text NOT NULL DEFAULT 'review_pending',
  PRIMARY KEY(provider, provider_record_id)
);
CREATE INDEX IF NOT EXISTS acquired_hadith_lookup ON acquired_hadith(collection_id, book_id, hadith_number);
CREATE TABLE IF NOT EXISTS acquired_places (
  place_id text PRIMARY KEY, name_ar text NOT NULL, latitude double precision, longitude double precision,
  geometry_status text NOT NULL CHECK(geometry_status IN ('none','modern','historical_hypothesis')),
  source_id text NOT NULL REFERENCES source_registry(source_id),
  CHECK((latitude IS NULL AND longitude IS NULL) OR (latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180))
);
CREATE TABLE IF NOT EXISTS acquired_seerah_events (
  event_id text PRIMARY KEY, title_ar text NOT NULL, summary_ar text,
  date_text text, date_precision text NOT NULL DEFAULT 'undated',
  place_id text REFERENCES acquired_places(place_id),
  review_state text NOT NULL DEFAULT 'review_pending'
);
CREATE TABLE IF NOT EXISTS acquired_references (
  reference_id text PRIMARY KEY, event_id text REFERENCES acquired_seerah_events(event_id),
  version_id text REFERENCES acquired_versions(version_id),
  locator text, canonical_url text NOT NULL,
  CHECK(event_id IS NOT NULL OR version_id IS NOT NULL)
);
CREATE TABLE IF NOT EXISTS acquired_media (
  media_id text PRIMARY KEY, media_kind text NOT NULL, title text NOT NULL,
  external_id text, canonical_url text NOT NULL,
  embed_url text, thumbnail_url text, duration_seconds integer,
  source_id text NOT NULL REFERENCES source_registry(source_id),
  rights_id text REFERENCES rights_ledger(rights_id),
  age_band text, depiction_review text, review_state text NOT NULL DEFAULT 'review_pending',
  UNIQUE(source_id, external_id)
);
CREATE TABLE IF NOT EXISTS acquired_audio_tracks (
  track_id text PRIMARY KEY, reciter_provider_id text NOT NULL, recitation_provider_id text,
  surah smallint NOT NULL CHECK(surah BETWEEN 1 AND 114),
  stream_url text, source_id text NOT NULL REFERENCES source_registry(source_id),
  rights_id text REFERENCES rights_ledger(rights_id),
  review_state text NOT NULL DEFAULT 'review_pending',
  UNIQUE(reciter_provider_id, recitation_provider_id, surah)
);
CREATE TABLE IF NOT EXISTS acquired_ayah_timing (
  track_id text NOT NULL REFERENCES acquired_audio_tracks(track_id),
  ayah smallint NOT NULL, start_ms integer NOT NULL, end_ms integer NOT NULL,
  PRIMARY KEY(track_id, ayah), CHECK(start_ms >= 0 AND end_ms > start_ms)
);
CREATE TABLE IF NOT EXISTS acquired_search_documents (
  document_id text PRIMARY KEY, domain text NOT NULL, entity_id text NOT NULL,
  version_id text NOT NULL DEFAULT '', language text NOT NULL,
  title text NOT NULL, body text NOT NULL, normalized_ar text NOT NULL,
  route text NOT NULL, source_id text NOT NULL REFERENCES source_registry(source_id),
  availability text NOT NULL, review_state text NOT NULL,
  search_vector tsvector GENERATED ALWAYS AS (to_tsvector('simple',coalesce(title,'') || ' ' || coalesce(body,''))) STORED,
  UNIQUE(domain, entity_id, version_id, language)
);
CREATE INDEX IF NOT EXISTS acquired_search_fts ON acquired_search_documents USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS acquired_search_ar_trgm ON acquired_search_documents USING GIN(normalized_ar gin_trgm_ops);
-- Optional later: CREATE EXTENSION IF NOT EXISTS vector; separate embedding table with model_id and fixed dimension.
-- Never insert unreviewed records into public views; add RLS/policies if Supabase is adopted.

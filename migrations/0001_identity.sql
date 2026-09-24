-- Identity and personal learning state.
-- Worship scoring (streaks, points, rankings) is intentionally omitted.

CREATE TABLE IF NOT EXISTS users (
  id serial PRIMARY KEY,
  username text NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  password text NOT NULL,
  preferred_language text DEFAULT 'ar',
  theme text DEFAULT 'light',
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS progress (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_type text NOT NULL,
  content_id text NOT NULL,
  last_accessed timestamp DEFAULT now(),
  UNIQUE (user_id, content_type, content_id)
);

CREATE TABLE IF NOT EXISTS bookmarks (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_type text NOT NULL,
  content_id text NOT NULL,
  title text NOT NULL,
  notes text,
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS prayer_times (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location text NOT NULL,
  latitude text NOT NULL,
  longitude text NOT NULL,
  timezone text NOT NULL,
  notifications_enabled boolean DEFAULT true,
  updated_at timestamp DEFAULT now()
);

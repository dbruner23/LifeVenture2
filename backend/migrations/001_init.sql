CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cognito_sub   text UNIQUE,
  handle        text UNIQUE NOT NULL,
  name          text NOT NULL,
  avatar_url    text,
  bio           text,
  home_location geography(Point, 4326),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE ventures (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title        text NOT NULL,
  body         text,
  excerpt      text,
  genre        text NOT NULL,
  place_label  text,
  location     geography(Point, 4326),
  cover_image  text,
  duration     text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz
);

-- GiST index powers viewport (&&), radius (ST_DWithin) and KNN (<->) queries.
CREATE INDEX ventures_location_gix ON ventures USING gist (location);
CREATE INDEX ventures_author_idx ON ventures (author_id, created_at DESC);
CREATE INDEX ventures_genre_idx ON ventures (genre);

CREATE TABLE photos (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id uuid NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
  s3_key     text NOT NULL,
  width      int,
  height     int,
  position   int NOT NULL DEFAULT 0
);

CREATE TABLE comments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id uuid NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
  author_id  uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE follows (
  follower_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  followee_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, followee_id)
);

CREATE TABLE reactions (
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  venture_id uuid NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
  kind       text NOT NULL CHECK (kind IN ('like', 'save')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, venture_id, kind)
);

-- Formula Gallery: Photos, Ratings, Comments
-- Allows stylists to post before/after photos linked to formulas,
-- community voting/ranking, and structured comments for AI training

-- ─── formula_photos ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS formula_photos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formula_id    UUID NOT NULL REFERENCES formulas(id) ON DELETE CASCADE,
  stylist_id    UUID NOT NULL REFERENCES stylists(id) ON DELETE NO ACTION,
  client_id     UUID REFERENCES clients(id) ON DELETE NO ACTION,
  before_url    TEXT,
  after_url     TEXT NOT NULL,
  caption       VARCHAR(500),
  hair_type     VARCHAR(20),
  porosity      VARCHAR(20),
  level_before  INT,
  level_after   INT,
  tone_before   VARCHAR(10),
  tone_after    VARCHAR(10),
  developer_vol INT,
  processing_time INT,
  is_featured   BOOLEAN DEFAULT false,
  is_approved   BOOLEAN DEFAULT true,
  upvotes       INT DEFAULT 0,
  downvotes     INT DEFAULT 0,
  score         DECIMAL(5,2) DEFAULT 0,
  view_count    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_formula_photos_formula ON formula_photos(formula_id);
CREATE INDEX idx_formula_photos_stylist ON formula_photos(stylist_id);
CREATE INDEX idx_formula_photos_featured ON formula_photos(is_featured);
CREATE INDEX idx_formula_photos_score ON formula_photos(score DESC);
CREATE INDEX idx_formula_photos_recent ON formula_photos(created_at DESC);

-- ─── formula_photo_votes ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS formula_photo_votes (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id  UUID NOT NULL REFERENCES formula_photos(id) ON DELETE CASCADE,
  voter_id  UUID NOT NULL,
  vote      INT NOT NULL, -- 1 = upvote, -1 = downvote
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(photo_id, voter_id)
);

CREATE INDEX idx_photo_votes_photo ON formula_photo_votes(photo_id);
CREATE INDEX idx_photo_votes_voter ON formula_photo_votes(voter_id);

-- ─── formula_photo_tags ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS formula_photo_tags (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id  UUID NOT NULL REFERENCES formula_photos(id) ON DELETE CASCADE,
  tag       VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(photo_id, tag)
);

CREATE INDEX idx_photo_tags_photo ON formula_photo_tags(photo_id);
CREATE INDEX idx_photo_tags_tag ON formula_photo_tags(tag);

-- ─── formula_photo_comments ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS formula_photo_comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id    UUID NOT NULL REFERENCES formula_photos(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL,
  author_type VARCHAR(20) NOT NULL DEFAULT 'stylist', -- 'stylist' | 'client' | 'ai'
  content     VARCHAR(1000) NOT NULL,
  is_ai       BOOLEAN DEFAULT false,
  tags        TEXT[] DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_photo_comments_photo ON formula_photo_comments(photo_id);
CREATE INDEX idx_photo_comments_photo_date ON formula_photo_comments(photo_id, created_at DESC);
CREATE INDEX idx_photo_comments_author ON formula_photo_comments(author_id);

-- ─── formula_comments ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS formula_comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formula_id  UUID NOT NULL REFERENCES formulas(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL,
  author_type VARCHAR(20) NOT NULL DEFAULT 'stylist', -- 'stylist' | 'client' | 'ai'
  content     VARCHAR(2000) NOT NULL,
  rating      INT, -- 1-5 stars for the formula itself
  tags        TEXT[] DEFAULT '{}',
  is_ai       BOOLEAN DEFAULT false,
  parent_id   UUID REFERENCES formula_comments(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_formula_comments_formula ON formula_comments(formula_id);
CREATE INDEX idx_formula_comments_formula_date ON formula_comments(formula_id, created_at DESC);
CREATE INDEX idx_formula_comments_author ON formula_comments(author_id);
CREATE INDEX idx_formula_comments_parent ON formula_comments(parent_id);

-- ─── formula_ratings ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS formula_ratings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formula_id    UUID NOT NULL REFERENCES formulas(id) ON DELETE CASCADE,
  rater_id      UUID NOT NULL,
  execution     INT, -- 1-5: how well was it executed
  effectiveness INT,  -- 1-5: how well did the formula work
  overall       INT NOT NULL, -- 1-5: overall rating
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(formula_id, rater_id)
);

CREATE INDEX idx_formula_ratings_formula ON formula_ratings(formula_id);
CREATE INDEX idx_formula_ratings_formula_overall ON formula_ratings(formula_id, overall DESC);
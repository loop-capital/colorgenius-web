-- Transformations: licensed starting formula -> AI-personalized formulation
-- -> before/after photos -> published post. Born as draft at formulation time.
-- Lifecycle: draft -> enriched -> published. Publishing requires a separate
-- marketing consent record; the draft's existence never implies permission.
CREATE TABLE IF NOT EXISTS transformations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    stylist_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    source_formula_id UUID,
    formulation_id UUID NOT NULL,
    before_photo_ref VARCHAR(1000) NOT NULL,
    after_photo_ref VARCHAR(1000),
    shade_story TEXT,
    shades JSONB,
    client_consent JSONB,
    published_post_ref VARCHAR(500),
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    enriched_at TIMESTAMP(6),
    published_at TIMESTAMP(6),
    CONSTRAINT transformations_stylist_id_fkey FOREIGN KEY (stylist_id) REFERENCES stylists(id) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT transformations_source_formula_id_fkey FOREIGN KEY (source_formula_id) REFERENCES formula_listings(id) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT transformations_formulation_id_fkey FOREIGN KEY (formulation_id) REFERENCES formulations(id) ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE INDEX IF NOT EXISTS idx_transformations_stylist ON transformations(stylist_id);
CREATE INDEX IF NOT EXISTS idx_transformations_status ON transformations(status);
CREATE INDEX IF NOT EXISTS idx_transformations_source_formula ON transformations(source_formula_id);
CREATE INDEX IF NOT EXISTS idx_transformations_formulation ON transformations(formulation_id);

-- CreateTable
CREATE TABLE "Salon" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "address_line1" VARCHAR(200),
    "address_line2" VARCHAR(200),
    "city" VARCHAR(100),
    "state" VARCHAR(2),
    "postal_code" VARCHAR(20),
    "country" VARCHAR(2) NOT NULL DEFAULT 'US',
    "timezone" VARCHAR(50) NOT NULL DEFAULT 'America/New_York',
    "phone" VARCHAR(50),
    "email" VARCHAR(255),
    "subscription_tier" VARCHAR(20) NOT NULL DEFAULT 'beta',
    "subscription_seats" INTEGER NOT NULL DEFAULT 5,
    "subscription_expires_at" TIMESTAMP(3),
    "preferred_brands" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Salon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stylist" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "display_name" VARCHAR(100),
    "license_number" VARCHAR(50),
    "license_state" VARCHAR(2),
    "years_experience" INTEGER NOT NULL DEFAULT 0,
    "salon_id" TEXT,
    "role" VARCHAR(50) NOT NULL DEFAULT 'stylist',
    "preferences" JSONB NOT NULL DEFAULT '{"default_brand": null, "preferred_developer": 20, "theme": "light"}',
    "formulations_count" INTEGER NOT NULL DEFAULT 0,
    "last_login_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Stylist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "date_of_birth" DATE,
    "primary_stylist_id" TEXT,
    "salon_id" TEXT,
    "hair_texture" VARCHAR(20),
    "hair_density" VARCHAR(20),
    "natural_level" INTEGER,
    "natural_tone" VARCHAR(10),
    "porosity" VARCHAR(20) NOT NULL DEFAULT 'normal',
    "scalp_condition" VARCHAR(20) NOT NULL DEFAULT 'normal',
    "allergies" JSONB NOT NULL DEFAULT '{"ppd": false, "ammonia": false, "fragrance": false, "known_allergens": []}',
    "has_straightening" BOOLEAN NOT NULL DEFAULT false,
    "has_permed_hair" BOOLEAN NOT NULL DEFAULT false,
    "has_metallic_dye" BOOLEAN NOT NULL DEFAULT false,
    "has_henna" BOOLEAN NOT NULL DEFAULT false,
    "has_previous_color" BOOLEAN NOT NULL DEFAULT false,
    "last_color_service_date" DATE,
    "general_notes" TEXT,
    "total_visits" INTEGER NOT NULL DEFAULT 0,
    "last_visit_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "manufacturer" VARCHAR(100),
    "origin_country" VARCHAR(2) NOT NULL DEFAULT 'US',
    "tier" VARCHAR(20) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductLine" (
    "id" TEXT NOT NULL,
    "brand_id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(20),
    "slug" VARCHAR(100) NOT NULL,
    "color_type" VARCHAR(50) NOT NULL,
    "ammonia_free" BOOLEAN NOT NULL DEFAULT false,
    "plex_technology" VARCHAR(50),
    "alkaline_agent" VARCHAR(20),
    "max_gray_coverage" INTEGER,
    "max_lift_levels" INTEGER,
    "mixing_ratio" VARCHAR(10) NOT NULL,
    "developer_options" INTEGER[],
    "base_processing_time" INTEGER,
    "max_processing_time" INTEGER,
    "can_use_heat" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shade" (
    "id" TEXT NOT NULL,
    "product_line_id" TEXT NOT NULL,
    "shade_code" VARCHAR(20) NOT NULL,
    "shade_name" VARCHAR(100),
    "level" INTEGER,
    "primary_tone" VARCHAR(10),
    "secondary_tone" VARCHAR(10),
    "is_natural" BOOLEAN NOT NULL DEFAULT false,
    "is_high_lift" BOOLEAN NOT NULL DEFAULT false,
    "is_clear" BOOLEAN NOT NULL DEFAULT false,
    "undertone" VARCHAR(50),
    "rgb_representation" INTEGER[],
    "lab_representation" DOUBLE PRECISION[],
    "best_for" TEXT[],
    "not_recommended_for" TEXT[],
    "swatch_image_url" TEXT,
    "result_image_urls" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Shade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Developer" (
    "id" TEXT NOT NULL,
    "brand_id" TEXT,
    "name" VARCHAR(100) NOT NULL,
    "volume" INTEGER NOT NULL,
    "h2o2_percentage" DECIMAL(4,2),
    "viscosity" VARCHAR(20),
    "special_properties" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Developer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Formulation" (
    "id" TEXT NOT NULL,
    "stylist_id" TEXT NOT NULL,
    "client_id" TEXT,
    "input_data" JSONB NOT NULL,
    "action_type" VARCHAR(50),
    "brand" VARCHAR(50),
    "product_line" VARCHAR(100),
    "primary_formula" JSONB NOT NULL,
    "toning_formula" JSONB,
    "processing_instructions" JSONB NOT NULL,
    "warnings" TEXT[],
    "confidence_score" DECIMAL(4,3),
    "status" VARCHAR(20) NOT NULL DEFAULT 'generated',
    "score_accuracy" INTEGER,
    "score_condition" INTEGER,
    "score_evenness" INTEGER,
    "score_overall" INTEGER,
    "stylist_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Formulation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL,
    "formulation_id" TEXT,
    "client_id" TEXT,
    "stylist_id" TEXT,
    "photo_type" VARCHAR(20) NOT NULL,
    "photo_label" VARCHAR(50),
    "original_url" TEXT NOT NULL,
    "processed_url" TEXT,
    "thumbnail_url" TEXT,
    "file_size_bytes" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "format" VARCHAR(10),
    "analysis_results" JSONB,
    "processing_status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientVisit" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "stylist_id" TEXT NOT NULL,
    "formulation_id" TEXT,
    "visit_date" TIMESTAMP(3) NOT NULL,
    "service_type" VARCHAR(50),
    "hair_state" JSONB,
    "client_satisfaction" INTEGER,
    "stylist_notes" TEXT,
    "photos" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actor_type" VARCHAR(20),
    "actor_id" TEXT,
    "action" VARCHAR(100) NOT NULL,
    "resource_type" VARCHAR(50) NOT NULL,
    "resource_id" TEXT,
    "details" JSONB,
    "ip_address" INET,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Salon_slug_key" ON "Salon"("slug");

-- CreateIndex
CREATE INDEX "Salon_subscription_tier_idx" ON "Salon"("subscription_tier");

-- CreateIndex
CREATE UNIQUE INDEX "Stylist_email_key" ON "Stylist"("email");

-- CreateIndex
CREATE INDEX "Stylist_salon_id_idx" ON "Stylist"("salon_id");

-- CreateIndex
CREATE INDEX "Stylist_email_idx" ON "Stylist"("email");

-- CreateIndex
CREATE INDEX "Stylist_is_active_idx" ON "Stylist"("is_active");

-- CreateIndex
CREATE INDEX "Client_primary_stylist_id_idx" ON "Client"("primary_stylist_id");

-- CreateIndex
CREATE INDEX "Client_salon_id_idx" ON "Client"("salon_id");

-- CreateIndex
CREATE INDEX "Client_email_idx" ON "Client"("email");

-- CreateIndex
CREATE INDEX "Client_last_visit_at_idx" ON "Client"("last_visit_at");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_name_key" ON "Brand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_slug_key" ON "Brand"("slug");

-- CreateIndex
CREATE INDEX "Brand_is_active_idx" ON "Brand"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "ProductLine_code_key" ON "ProductLine"("code");

-- CreateIndex
CREATE INDEX "ProductLine_brand_id_idx" ON "ProductLine"("brand_id");

-- CreateIndex
CREATE INDEX "ProductLine_color_type_idx" ON "ProductLine"("color_type");

-- CreateIndex
CREATE INDEX "ProductLine_is_active_idx" ON "ProductLine"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "ProductLine_brand_id_name_key" ON "ProductLine"("brand_id", "name");

-- CreateIndex
CREATE INDEX "Shade_product_line_id_idx" ON "Shade"("product_line_id");

-- CreateIndex
CREATE INDEX "Shade_level_idx" ON "Shade"("level");

-- CreateIndex
CREATE INDEX "Shade_primary_tone_idx" ON "Shade"("primary_tone");

-- CreateIndex
CREATE INDEX "Shade_is_natural_idx" ON "Shade"("is_natural");

-- CreateIndex
CREATE INDEX "Shade_level_primary_tone_idx" ON "Shade"("level", "primary_tone");

-- CreateIndex
CREATE UNIQUE INDEX "Shade_product_line_id_shade_code_key" ON "Shade"("product_line_id", "shade_code");

-- CreateIndex
CREATE INDEX "Developer_brand_id_idx" ON "Developer"("brand_id");

-- CreateIndex
CREATE UNIQUE INDEX "Developer_brand_id_volume_key" ON "Developer"("brand_id", "volume");

-- CreateIndex
CREATE INDEX "Formulation_stylist_id_idx" ON "Formulation"("stylist_id");

-- CreateIndex
CREATE INDEX "Formulation_client_id_idx" ON "Formulation"("client_id");

-- CreateIndex
CREATE INDEX "Formulation_status_idx" ON "Formulation"("status");

-- CreateIndex
CREATE INDEX "Formulation_created_at_idx" ON "Formulation"("created_at");

-- CreateIndex
CREATE INDEX "Formulation_brand_idx" ON "Formulation"("brand");

-- CreateIndex
CREATE INDEX "Formulation_confidence_score_idx" ON "Formulation"("confidence_score");

-- CreateIndex
CREATE INDEX "Photo_formulation_id_idx" ON "Photo"("formulation_id");

-- CreateIndex
CREATE INDEX "Photo_client_id_idx" ON "Photo"("client_id");

-- CreateIndex
CREATE INDEX "Photo_photo_type_idx" ON "Photo"("photo_type");

-- CreateIndex
CREATE INDEX "Photo_processing_status_idx" ON "Photo"("processing_status");

-- CreateIndex
CREATE INDEX "ClientVisit_client_id_idx" ON "ClientVisit"("client_id");

-- CreateIndex
CREATE INDEX "ClientVisit_stylist_id_idx" ON "ClientVisit"("stylist_id");

-- CreateIndex
CREATE INDEX "ClientVisit_visit_date_idx" ON "ClientVisit"("visit_date");

-- CreateIndex
CREATE INDEX "ClientVisit_formulation_id_idx" ON "ClientVisit"("formulation_id");

-- CreateIndex
CREATE INDEX "AuditLog_actor_type_actor_id_idx" ON "AuditLog"("actor_type", "actor_id");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_resource_type_resource_id_idx" ON "AuditLog"("resource_type", "resource_id");

-- CreateIndex
CREATE INDEX "AuditLog_created_at_idx" ON "AuditLog"("created_at");

-- AddForeignKey
ALTER TABLE "Stylist" ADD CONSTRAINT "Stylist_salon_id_fkey" FOREIGN KEY ("salon_id") REFERENCES "Salon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_primary_stylist_id_fkey" FOREIGN KEY ("primary_stylist_id") REFERENCES "Stylist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_salon_id_fkey" FOREIGN KEY ("salon_id") REFERENCES "Salon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductLine" ADD CONSTRAINT "ProductLine_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shade" ADD CONSTRAINT "Shade_product_line_id_fkey" FOREIGN KEY ("product_line_id") REFERENCES "ProductLine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Developer" ADD CONSTRAINT "Developer_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Formulation" ADD CONSTRAINT "Formulation_stylist_id_fkey" FOREIGN KEY ("stylist_id") REFERENCES "Stylist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Formulation" ADD CONSTRAINT "Formulation_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_formulation_id_fkey" FOREIGN KEY ("formulation_id") REFERENCES "Formulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_stylist_id_fkey" FOREIGN KEY ("stylist_id") REFERENCES "Stylist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientVisit" ADD CONSTRAINT "ClientVisit_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientVisit" ADD CONSTRAINT "ClientVisit_stylist_id_fkey" FOREIGN KEY ("stylist_id") REFERENCES "Stylist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientVisit" ADD CONSTRAINT "ClientVisit_formulation_id_fkey" FOREIGN KEY ("formulation_id") REFERENCES "Formulation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Formula" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "currentLevel" INTEGER NOT NULL DEFAULT 1,
    "currentTone" TEXT NOT NULL DEFAULT 'n',
    "targetLevel" INTEGER NOT NULL DEFAULT 1,
    "targetTone" TEXT NOT NULL DEFAULT 'n',
    "condition" TEXT NOT NULL DEFAULT 'virgin',
    "grayPercentage" INTEGER NOT NULL DEFAULT 0,
    "developerVolume" INTEGER NOT NULL DEFAULT 20,
    "processingTime" INTEGER NOT NULL DEFAULT 30,
    "productBrand" TEXT NOT NULL,
    "productLine" TEXT NOT NULL,
    "productShade" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "clientId" TEXT,
    CONSTRAINT "Formula_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "level" INTEGER NOT NULL DEFAULT 1,
    "tone" TEXT NOT NULL DEFAULT 'n',
    "underlyingPigment" TEXT NOT NULL DEFAULT 'Red',
    "rgbR" INTEGER NOT NULL DEFAULT 0,
    "rgbG" INTEGER NOT NULL DEFAULT 0,
    "rgbB" INTEGER NOT NULL DEFAULT 0,
    "confidence" INTEGER NOT NULL DEFAULT 80,
    "imageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientId" TEXT,
    CONSTRAINT "Analysis_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Client_name_idx" ON "Client"("name");

-- CreateIndex
CREATE INDEX "Client_phone_idx" ON "Client"("phone");

-- CreateIndex
CREATE INDEX "Formula_productBrand_idx" ON "Formula"("productBrand");

-- CreateIndex
CREATE INDEX "Formula_productLine_idx" ON "Formula"("productLine");

-- CreateIndex
CREATE INDEX "Formula_targetLevel_idx" ON "Formula"("targetLevel");

-- CreateIndex
CREATE INDEX "Formula_createdAt_idx" ON "Formula"("createdAt");

-- CreateIndex
CREATE INDEX "Analysis_level_idx" ON "Analysis"("level");

-- CreateIndex
CREATE INDEX "Analysis_tone_idx" ON "Analysis"("tone");

-- CreateIndex
CREATE INDEX "Analysis_createdAt_idx" ON "Analysis"("createdAt");

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "country" TEXT NOT NULL,
    "city" TEXT,
    "region" TEXT,
    "budgetMin" INTEGER NOT NULL,
    "budgetMax" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "timeline" TEXT NOT NULL,
    "skills" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'direct',
    "sourceUrl" TEXT,
    "clientName" TEXT NOT NULL,
    "clientCompany" TEXT,
    "clientEmail" TEXT NOT NULL,
    "clientPhone" TEXT,
    "clientAddress" TEXT,
    "clientLinkedin" TEXT,
    "clientWebsite" TEXT,
    "experienceReq" TEXT,
    "projectType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "urgent" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Lead_category_idx" ON "Lead"("category");

-- CreateIndex
CREATE INDEX "Lead_country_idx" ON "Lead"("country");

-- CreateIndex
CREATE INDEX "Lead_region_idx" ON "Lead"("region");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_source_idx" ON "Lead"("source");


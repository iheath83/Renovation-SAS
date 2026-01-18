-- AlterTable Projet: Ajouter les colonnes manquantes
ALTER TABLE "Projet" ADD COLUMN IF NOT EXISTS "adresse" TEXT;
ALTER TABLE "Projet" ADD COLUMN IF NOT EXISTS "budgetMax" DOUBLE PRECISION;
ALTER TABLE "Projet" ADD COLUMN IF NOT EXISTS "dateDebut" TIMESTAMP(3);
ALTER TABLE "Projet" ADD COLUMN IF NOT EXISTS "dateFin" TIMESTAMP(3);

-- AlterTable Depense: Ajouter les colonnes manquantes
ALTER TABLE "Depense" ADD COLUMN IF NOT EXISTS "estPrevue" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Depense" ADD COLUMN IF NOT EXISTS "fournisseur" TEXT;

-- CreateEnum TypeCategorie
DO $$ BEGIN
 CREATE TYPE "TypeCategorie" AS ENUM ('PIECE', 'TACHE', 'DEPENSE', 'MATERIAU');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- AlterEnum Unite: Ajouter les variantes manquantes
ALTER TYPE "Unite" ADD VALUE IF NOT EXISTS 'UNITE';
ALTER TYPE "Unite" ADD VALUE IF NOT EXISTS 'ML';
ALTER TYPE "Unite" ADD VALUE IF NOT EXISTS 'L';
ALTER TYPE "Unite" ADD VALUE IF NOT EXISTS 'ROULEAU';
ALTER TYPE "Unite" ADD VALUE IF NOT EXISTS 'PACK';

-- CreateTable CategorieCustom
CREATE TABLE IF NOT EXISTS "CategorieCustom" (
    "id" TEXT NOT NULL,
    "projetId" TEXT NOT NULL,
    "type" "TypeCategorie" NOT NULL,
    "nom" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CategorieCustom_pkey" PRIMARY KEY ("id")
);

-- CreateTable UserSettings
CREATE TABLE IF NOT EXISTS "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'light',
    "language" TEXT NOT NULL DEFAULT 'fr',
    "notifications" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CategorieCustom_deletedAt_idx" ON "CategorieCustom"("deletedAt");
CREATE INDEX IF NOT EXISTS "CategorieCustom_projetId_idx" ON "CategorieCustom"("projetId");
CREATE INDEX IF NOT EXISTS "CategorieCustom_type_idx" ON "CategorieCustom"("type");
CREATE UNIQUE INDEX IF NOT EXISTS "UserSettings_userId_key" ON "UserSettings"("userId");
CREATE INDEX IF NOT EXISTS "UserSettings_userId_idx" ON "UserSettings"("userId");

-- AddForeignKey
DO $$ BEGIN
 ALTER TABLE "CategorieCustom" ADD CONSTRAINT "CategorieCustom_projetId_fkey" FOREIGN KEY ("projetId") REFERENCES "Projet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
 ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

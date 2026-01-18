-- Migration de réparation pour synchroniser complètement le schéma

-- Assurer que toutes les colonnes de Piece existent
ALTER TABLE "Piece" ADD COLUMN IF NOT EXISTS "budget" DOUBLE PRECISION;
ALTER TABLE "Piece" ADD COLUMN IF NOT EXISTS "images" JSONB;
ALTER TABLE "Piece" ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Assurer que toutes les colonnes de Materiau existent
ALTER TABLE "Materiau" ADD COLUMN IF NOT EXISTS "quantite" DOUBLE PRECISION;
ALTER TABLE "Materiau" ADD COLUMN IF NOT EXISTS "reference" TEXT;
ALTER TABLE "Materiau" ADD COLUMN IF NOT EXISTS "lienMarchand" TEXT;
ALTER TABLE "Materiau" ADD COLUMN IF NOT EXISTS "image" TEXT;
ALTER TABLE "Materiau" ADD COLUMN IF NOT EXISTS "notes" TEXT;

-- Assurer que toutes les colonnes de Tache existent
ALTER TABLE "Tache" ADD COLUMN IF NOT EXISTS "coutEstime" DOUBLE PRECISION;
ALTER TABLE "Tache" ADD COLUMN IF NOT EXISTS "coutReel" DOUBLE PRECISION;

-- Assurer que toutes les colonnes de IdeePinterest existent
ALTER TABLE "IdeePinterest" ADD COLUMN IF NOT EXISTS "title" TEXT;
ALTER TABLE "IdeePinterest" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;

-- Assurer que toutes les colonnes de Moodboard existent
ALTER TABLE "Moodboard" ADD COLUMN IF NOT EXISTS "title" TEXT;

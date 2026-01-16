-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "ProjetRole" AS ENUM ('OWNER', 'MEMBER');

-- CreateEnum
CREATE TYPE "TypePiece" AS ENUM ('SALON', 'CUISINE', 'CHAMBRE', 'SDB', 'WC', 'BUREAU', 'COULOIR', 'GARAGE', 'EXTERIEUR', 'AUTRE');

-- CreateEnum
CREATE TYPE "StatutPiece" AS ENUM ('A_FAIRE', 'EN_COURS', 'TERMINE');

-- CreateEnum
CREATE TYPE "StatutTache" AS ENUM ('A_FAIRE', 'EN_COURS', 'EN_ATTENTE', 'TERMINE');

-- CreateEnum
CREATE TYPE "Priorite" AS ENUM ('BASSE', 'MOYENNE', 'HAUTE', 'URGENTE');

-- CreateEnum
CREATE TYPE "CategorieMateriau" AS ENUM ('PEINTURE', 'REVETEMENT_SOL', 'REVETEMENT_MUR', 'MENUISERIE', 'PLOMBERIE', 'ELECTRICITE', 'QUINCAILLERIE', 'AUTRE');

-- CreateEnum
CREATE TYPE "Unite" AS ENUM ('M2', 'M', 'PIECE', 'LITRE', 'KG', 'LOT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "budgetMaxProjet" DOUBLE PRECISION,
    "resetToken" TEXT,
    "resetTokenExp" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Projet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Projet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjetUser" (
    "projetId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "ProjetRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjetUser_pkey" PRIMARY KEY ("projetId","userId")
);

-- CreateTable
CREATE TABLE "Piece" (
    "id" TEXT NOT NULL,
    "projetId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "TypePiece" NOT NULL DEFAULT 'AUTRE',
    "etage" INTEGER,
    "surface" DOUBLE PRECISION,
    "budget" DOUBLE PRECISION,
    "statut" "StatutPiece" NOT NULL DEFAULT 'A_FAIRE',
    "images" JSONB,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Piece_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tache" (
    "id" TEXT NOT NULL,
    "projetId" TEXT NOT NULL,
    "pieceId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "statut" "StatutTache" NOT NULL DEFAULT 'A_FAIRE',
    "priorite" "Priorite" NOT NULL DEFAULT 'MOYENNE',
    "dateDebut" TIMESTAMP(3),
    "dateFin" TIMESTAMP(3),
    "coutEstime" DOUBLE PRECISION,
    "coutReel" DOUBLE PRECISION,
    "pourcentage" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Tache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TacheDependance" (
    "tacheId" TEXT NOT NULL,
    "dependanceId" TEXT NOT NULL,

    CONSTRAINT "TacheDependance_pkey" PRIMARY KEY ("tacheId","dependanceId")
);

-- CreateTable
CREATE TABLE "SousTache" (
    "id" TEXT NOT NULL,
    "tacheId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SousTache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Materiau" (
    "id" TEXT NOT NULL,
    "projetId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categorie" "CategorieMateriau" NOT NULL DEFAULT 'AUTRE',
    "prixUnitaire" DOUBLE PRECISION,
    "unite" "Unite" NOT NULL DEFAULT 'PIECE',
    "reference" TEXT,
    "fournisseur" TEXT,
    "lienMarchand" TEXT,
    "image" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Materiau_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MateriauPiece" (
    "materiauId" TEXT NOT NULL,
    "pieceId" TEXT NOT NULL,
    "quantite" DOUBLE PRECISION NOT NULL DEFAULT 1,

    CONSTRAINT "MateriauPiece_pkey" PRIMARY KEY ("materiauId","pieceId")
);

-- CreateTable
CREATE TABLE "Credit" (
    "id" TEXT NOT NULL,
    "projetId" TEXT NOT NULL,
    "banque" TEXT NOT NULL,
    "montantTotal" DOUBLE PRECISION NOT NULL,
    "tauxInteret" DOUBLE PRECISION,
    "duree" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Credit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deblocage" (
    "id" TEXT NOT NULL,
    "creditId" TEXT NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "dateDeblocage" TIMESTAMP(3) NOT NULL,
    "justificatifs" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Deblocage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Depense" (
    "id" TEXT NOT NULL,
    "projetId" TEXT NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "categorie" TEXT,
    "dateDepense" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "factures" JSONB,
    "passeDansCredit" BOOLEAN NOT NULL DEFAULT false,
    "pieceId" TEXT,
    "tacheId" TEXT,
    "materiauId" TEXT,
    "deblocageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Depense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdeePinterest" (
    "id" TEXT NOT NULL,
    "projetId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "titre" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "couleurs" JSONB,
    "materiaux" JSONB,
    "style" TEXT,
    "tags" TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "IdeePinterest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Moodboard" (
    "id" TEXT NOT NULL,
    "projetId" TEXT NOT NULL,
    "pieceId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "palette" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Moodboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdeesMoodboard" (
    "ideeId" TEXT NOT NULL,
    "moodboardId" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "IdeesMoodboard_pkey" PRIMARY KEY ("ideeId","moodboardId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");

-- CreateIndex
CREATE INDEX "Projet_deletedAt_idx" ON "Projet"("deletedAt");

-- CreateIndex
CREATE INDEX "ProjetUser_userId_idx" ON "ProjetUser"("userId");

-- CreateIndex
CREATE INDEX "ProjetUser_projetId_idx" ON "ProjetUser"("projetId");

-- CreateIndex
CREATE INDEX "Piece_projetId_idx" ON "Piece"("projetId");

-- CreateIndex
CREATE INDEX "Piece_deletedAt_idx" ON "Piece"("deletedAt");

-- CreateIndex
CREATE INDEX "Tache_projetId_idx" ON "Tache"("projetId");

-- CreateIndex
CREATE INDEX "Tache_pieceId_idx" ON "Tache"("pieceId");

-- CreateIndex
CREATE INDEX "Tache_deletedAt_idx" ON "Tache"("deletedAt");

-- CreateIndex
CREATE INDEX "TacheDependance_tacheId_idx" ON "TacheDependance"("tacheId");

-- CreateIndex
CREATE INDEX "TacheDependance_dependanceId_idx" ON "TacheDependance"("dependanceId");

-- CreateIndex
CREATE INDEX "SousTache_tacheId_idx" ON "SousTache"("tacheId");

-- CreateIndex
CREATE INDEX "Materiau_projetId_idx" ON "Materiau"("projetId");

-- CreateIndex
CREATE INDEX "Materiau_deletedAt_idx" ON "Materiau"("deletedAt");

-- CreateIndex
CREATE INDEX "MateriauPiece_materiauId_idx" ON "MateriauPiece"("materiauId");

-- CreateIndex
CREATE INDEX "MateriauPiece_pieceId_idx" ON "MateriauPiece"("pieceId");

-- CreateIndex
CREATE INDEX "Credit_projetId_idx" ON "Credit"("projetId");

-- CreateIndex
CREATE INDEX "Credit_deletedAt_idx" ON "Credit"("deletedAt");

-- CreateIndex
CREATE INDEX "Deblocage_creditId_idx" ON "Deblocage"("creditId");

-- CreateIndex
CREATE INDEX "Deblocage_deletedAt_idx" ON "Deblocage"("deletedAt");

-- CreateIndex
CREATE INDEX "Depense_projetId_idx" ON "Depense"("projetId");

-- CreateIndex
CREATE INDEX "Depense_pieceId_idx" ON "Depense"("pieceId");

-- CreateIndex
CREATE INDEX "Depense_tacheId_idx" ON "Depense"("tacheId");

-- CreateIndex
CREATE INDEX "Depense_materiauId_idx" ON "Depense"("materiauId");

-- CreateIndex
CREATE INDEX "Depense_deblocageId_idx" ON "Depense"("deblocageId");

-- CreateIndex
CREATE INDEX "Depense_deletedAt_idx" ON "Depense"("deletedAt");

-- CreateIndex
CREATE INDEX "IdeePinterest_projetId_idx" ON "IdeePinterest"("projetId");

-- CreateIndex
CREATE INDEX "IdeePinterest_deletedAt_idx" ON "IdeePinterest"("deletedAt");

-- CreateIndex
CREATE INDEX "Moodboard_projetId_idx" ON "Moodboard"("projetId");

-- CreateIndex
CREATE INDEX "Moodboard_pieceId_idx" ON "Moodboard"("pieceId");

-- CreateIndex
CREATE INDEX "Moodboard_deletedAt_idx" ON "Moodboard"("deletedAt");

-- CreateIndex
CREATE INDEX "IdeesMoodboard_ideeId_idx" ON "IdeesMoodboard"("ideeId");

-- CreateIndex
CREATE INDEX "IdeesMoodboard_moodboardId_idx" ON "IdeesMoodboard"("moodboardId");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjetUser" ADD CONSTRAINT "ProjetUser_projetId_fkey" FOREIGN KEY ("projetId") REFERENCES "Projet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjetUser" ADD CONSTRAINT "ProjetUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Piece" ADD CONSTRAINT "Piece_projetId_fkey" FOREIGN KEY ("projetId") REFERENCES "Projet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tache" ADD CONSTRAINT "Tache_projetId_fkey" FOREIGN KEY ("projetId") REFERENCES "Projet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tache" ADD CONSTRAINT "Tache_pieceId_fkey" FOREIGN KEY ("pieceId") REFERENCES "Piece"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TacheDependance" ADD CONSTRAINT "TacheDependance_tacheId_fkey" FOREIGN KEY ("tacheId") REFERENCES "Tache"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TacheDependance" ADD CONSTRAINT "TacheDependance_dependanceId_fkey" FOREIGN KEY ("dependanceId") REFERENCES "Tache"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SousTache" ADD CONSTRAINT "SousTache_tacheId_fkey" FOREIGN KEY ("tacheId") REFERENCES "Tache"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Materiau" ADD CONSTRAINT "Materiau_projetId_fkey" FOREIGN KEY ("projetId") REFERENCES "Projet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MateriauPiece" ADD CONSTRAINT "MateriauPiece_materiauId_fkey" FOREIGN KEY ("materiauId") REFERENCES "Materiau"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MateriauPiece" ADD CONSTRAINT "MateriauPiece_pieceId_fkey" FOREIGN KEY ("pieceId") REFERENCES "Piece"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credit" ADD CONSTRAINT "Credit_projetId_fkey" FOREIGN KEY ("projetId") REFERENCES "Projet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deblocage" ADD CONSTRAINT "Deblocage_creditId_fkey" FOREIGN KEY ("creditId") REFERENCES "Credit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Depense" ADD CONSTRAINT "Depense_projetId_fkey" FOREIGN KEY ("projetId") REFERENCES "Projet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Depense" ADD CONSTRAINT "Depense_pieceId_fkey" FOREIGN KEY ("pieceId") REFERENCES "Piece"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Depense" ADD CONSTRAINT "Depense_tacheId_fkey" FOREIGN KEY ("tacheId") REFERENCES "Tache"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Depense" ADD CONSTRAINT "Depense_materiauId_fkey" FOREIGN KEY ("materiauId") REFERENCES "Materiau"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Depense" ADD CONSTRAINT "Depense_deblocageId_fkey" FOREIGN KEY ("deblocageId") REFERENCES "Deblocage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdeePinterest" ADD CONSTRAINT "IdeePinterest_projetId_fkey" FOREIGN KEY ("projetId") REFERENCES "Projet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Moodboard" ADD CONSTRAINT "Moodboard_projetId_fkey" FOREIGN KEY ("projetId") REFERENCES "Projet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Moodboard" ADD CONSTRAINT "Moodboard_pieceId_fkey" FOREIGN KEY ("pieceId") REFERENCES "Piece"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdeesMoodboard" ADD CONSTRAINT "IdeesMoodboard_ideeId_fkey" FOREIGN KEY ("ideeId") REFERENCES "IdeePinterest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdeesMoodboard" ADD CONSTRAINT "IdeesMoodboard_moodboardId_fkey" FOREIGN KEY ("moodboardId") REFERENCES "Moodboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

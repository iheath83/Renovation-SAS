-- CreateEnum
CREATE TYPE "StatutTransaction" AS ENUM ('NOUVEAU', 'IGNORE', 'CONVERTI');

-- AlterTable
ALTER TABLE "Depense" ADD COLUMN     "transactionBancaireId" TEXT,
ADD COLUMN     "importeAutomatiquement" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "CompteBancaire" (
    "id" TEXT NOT NULL,
    "projetId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "powensItemId" TEXT NOT NULL,
    "powensAccessToken" TEXT,
    "banque" TEXT NOT NULL,
    "derniereSynchronisation" TIMESTAMP(3),
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CompteBancaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionBancaire" (
    "id" TEXT NOT NULL,
    "compteBancaireId" TEXT NOT NULL,
    "powensTransactionId" TEXT NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "dateTransaction" TIMESTAMP(3) NOT NULL,
    "categorie" TEXT,
    "estDepenseRenovation" BOOLEAN NOT NULL DEFAULT false,
    "depenseId" TEXT,
    "statut" "StatutTransaction" NOT NULL DEFAULT 'NOUVEAU',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransactionBancaire_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompteBancaire_powensItemId_key" ON "CompteBancaire"("powensItemId");

-- CreateIndex
CREATE INDEX "CompteBancaire_projetId_idx" ON "CompteBancaire"("projetId");

-- CreateIndex
CREATE INDEX "CompteBancaire_userId_idx" ON "CompteBancaire"("userId");

-- CreateIndex
CREATE INDEX "CompteBancaire_deletedAt_idx" ON "CompteBancaire"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "TransactionBancaire_powensTransactionId_key" ON "TransactionBancaire"("powensTransactionId");

-- CreateIndex
CREATE UNIQUE INDEX "TransactionBancaire_depenseId_key" ON "TransactionBancaire"("depenseId");

-- CreateIndex
CREATE INDEX "TransactionBancaire_compteBancaireId_idx" ON "TransactionBancaire"("compteBancaireId");

-- CreateIndex
CREATE INDEX "TransactionBancaire_statut_idx" ON "TransactionBancaire"("statut");

-- CreateIndex
CREATE INDEX "TransactionBancaire_dateTransaction_idx" ON "TransactionBancaire"("dateTransaction");

-- CreateIndex
CREATE INDEX "TransactionBancaire_depenseId_idx" ON "TransactionBancaire"("depenseId");

-- CreateIndex
CREATE UNIQUE INDEX "Depense_transactionBancaireId_key" ON "Depense"("transactionBancaireId");

-- CreateIndex
CREATE INDEX "Depense_transactionBancaireId_idx" ON "Depense"("transactionBancaireId");

-- AddForeignKey
ALTER TABLE "CompteBancaire" ADD CONSTRAINT "CompteBancaire_projetId_fkey" FOREIGN KEY ("projetId") REFERENCES "Projet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompteBancaire" ADD CONSTRAINT "CompteBancaire_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionBancaire" ADD CONSTRAINT "TransactionBancaire_compteBancaireId_fkey" FOREIGN KEY ("compteBancaireId") REFERENCES "CompteBancaire"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionBancaire" ADD CONSTRAINT "TransactionBancaire_depenseId_fkey" FOREIGN KEY ("depenseId") REFERENCES "Depense"("id") ON DELETE SET NULL ON UPDATE CASCADE;


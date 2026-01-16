import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Créer un utilisateur
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'jonathan@renovation-sas.fr' },
    update: {},
    create: {
      email: 'jonathan@renovation-sas.fr',
      name: 'Jonathan Arnaud',
      password: hashedPassword,
      role: 'ADMIN',
      budgetMaxProjet: 50000,
    },
  });
  console.log('✅ User created:', user.email);

  // Créer un projet (Prisma génère automatiquement l'ID CUID)
  const projet = await prisma.projet.create({
    data: {
      name: 'Rénovation Maison Principale',
      description: 'Rénovation complète de la maison - cuisine, salle de bain, chambres',
    },
  });
  console.log('✅ Projet created:', projet.name, '(ID:', projet.id, ')');

  // Lier l'utilisateur au projet
  await prisma.projetUser.upsert({
    where: { projetId_userId: { projetId: projet.id, userId: user.id } },
    update: {},
    create: {
      projetId: projet.id,
      userId: user.id,
      role: 'OWNER',
    },
  });

  // Créer des pièces (Prisma génère les IDs)
  const piecesData = [
    { name: 'Cuisine', type: 'CUISINE', etage: 0, surface: 15, budget: 12000, statut: 'EN_COURS', tags: ['prioritaire', 'moderne'] },
    { name: 'Salon', type: 'SALON', etage: 0, surface: 35, budget: 8000, statut: 'EN_COURS', tags: ['parquet', 'peinture'] },
    { name: 'Salle de bain', type: 'SDB', etage: 1, surface: 8, budget: 10000, statut: 'A_FAIRE', tags: ['carrelage', 'douche italienne'] },
    { name: 'Chambre parentale', type: 'CHAMBRE', etage: 1, surface: 18, budget: 4000, statut: 'TERMINE', tags: ['peinture'] },
    { name: 'Chambre enfant 1', type: 'CHAMBRE', etage: 1, surface: 12, budget: 2500, statut: 'A_FAIRE', tags: [] },
    { name: 'Bureau', type: 'BUREAU', etage: 1, surface: 10, budget: 3000, statut: 'A_FAIRE', tags: ['rangements'] },
    { name: 'WC RDC', type: 'WC', etage: 0, surface: 2, budget: 1500, statut: 'TERMINE', tags: [] },
  ];

  const pieces = [];
  for (const pieceData of piecesData) {
    const piece = await prisma.piece.create({
      data: {
        ...pieceData,
        projetId: projet.id,
      },
    });
    pieces.push(piece);
  }
  console.log('✅ Pieces created:', pieces.length);

  // Créer des tâches
  const tachesData = [
    { pieceIndex: 0, title: 'Électricité cuisine', description: 'Refaire le tableau électrique et ajouter des prises', statut: 'EN_COURS', priorite: 'URGENTE', dateDebut: new Date('2024-01-15'), dateFin: new Date('2024-01-20'), coutEstime: 1500 },
    { pieceIndex: 0, title: 'Pose plan de travail', description: 'Installer le nouveau plan de travail en granit', statut: 'A_FAIRE', priorite: 'HAUTE', dateDebut: new Date('2024-01-25'), dateFin: new Date('2024-01-26'), coutEstime: 800 },
    { pieceIndex: 2, title: 'Pose carrelage SDB', description: 'Carrelage mural et sol', statut: 'A_FAIRE', priorite: 'HAUTE', dateDebut: new Date('2024-02-01'), dateFin: new Date('2024-02-05'), coutEstime: 2000 },
    { pieceIndex: 1, title: 'Pose parquet flottant', description: 'Parquet chêne massif', statut: 'TERMINE', priorite: 'MOYENNE', dateDebut: new Date('2024-01-08'), dateFin: new Date('2024-01-12'), coutEstime: 1800, coutReel: 1750 },
    { pieceIndex: 1, title: 'Peinture murs', description: 'Peinture blanc satin', statut: 'EN_COURS', priorite: 'MOYENNE', dateDebut: new Date('2024-01-18'), dateFin: new Date('2024-01-22'), coutEstime: 400 },
    { pieceIndex: null, title: 'Commander robinetterie', description: 'Robinets pour cuisine et SDB', statut: 'EN_ATTENTE', priorite: 'MOYENNE', dateFin: new Date('2024-01-28'), coutEstime: 600 },
    { pieceIndex: 3, title: 'Peinture chambre', description: 'Peinture gris perle', statut: 'TERMINE', priorite: 'BASSE', dateDebut: new Date('2024-01-05'), dateFin: new Date('2024-01-07'), coutEstime: 300, coutReel: 280 },
    { pieceIndex: 6, title: 'Installation WC suspendu', description: 'WC suspendu + bâti-support', statut: 'TERMINE', priorite: 'HAUTE', dateDebut: new Date('2024-01-10'), dateFin: new Date('2024-01-11'), coutEstime: 500, coutReel: 520 },
  ];

  const taches = [];
  for (const tacheData of tachesData) {
    const { pieceIndex, ...rest } = tacheData;
    const tache = await prisma.tache.create({
      data: {
        ...rest,
        projetId: projet.id,
        pieceId: pieceIndex !== null ? pieces[pieceIndex].id : null,
      },
    });
    taches.push(tache);
  }
  console.log('✅ Taches created:', taches.length);

  // Créer des sous-tâches
  const sousTachesData = [
    { tacheIndex: 0, title: 'Couper le courant', completed: true, ordre: 0 },
    { tacheIndex: 0, title: 'Installer nouveau tableau', completed: true, ordre: 1 },
    { tacheIndex: 0, title: 'Tirer les câbles', completed: false, ordre: 2 },
    { tacheIndex: 2, title: 'Préparer les surfaces', completed: false, ordre: 0 },
    { tacheIndex: 2, title: 'Poser carrelage mur', completed: false, ordre: 1 },
    { tacheIndex: 2, title: 'Poser carrelage sol', completed: false, ordre: 2 },
    { tacheIndex: 4, title: 'Sous-couche', completed: true, ordre: 0 },
    { tacheIndex: 4, title: '1ère couche', completed: false, ordre: 1 },
    { tacheIndex: 4, title: '2ème couche', completed: false, ordre: 2 },
  ];

  for (const stData of sousTachesData) {
    const { tacheIndex, ...rest } = stData;
    await prisma.sousTache.create({
      data: {
        ...rest,
        tacheId: taches[tacheIndex].id,
      },
    });
  }
  console.log('✅ Sous-taches created:', sousTachesData.length);

  // Créer des dépenses
  const depensesData = [
    { pieceIndex: 0, tacheIndex: 0, description: 'Tableau électrique + disjoncteurs', montant: 450, categorie: 'MATERIAU', dateDepense: new Date('2024-01-15'), passeDansCredit: true },
    { pieceIndex: 0, tacheIndex: 0, description: 'Main d\'œuvre électricien', montant: 750, categorie: 'MAIN_OEUVRE', dateDepense: new Date('2024-01-18'), passeDansCredit: true },
    { pieceIndex: 1, tacheIndex: 3, description: 'Parquet chêne massif 45m²', montant: 1795.50, categorie: 'MATERIAU', dateDepense: new Date('2024-01-08'), passeDansCredit: true },
    { pieceIndex: 1, tacheIndex: 4, description: 'Peinture blanc satin 30L', montant: 149.70, categorie: 'MATERIAU', dateDepense: new Date('2024-01-16'), passeDansCredit: false },
    { pieceIndex: 6, tacheIndex: 7, description: 'WC suspendu Villeroy + bâti', montant: 520, categorie: 'MATERIAU', dateDepense: new Date('2024-01-10'), passeDansCredit: true },
    { pieceIndex: 3, tacheIndex: 6, description: 'Peinture gris perle', montant: 89, categorie: 'MATERIAU', dateDepense: new Date('2024-01-05'), passeDansCredit: false },
    { pieceIndex: 3, tacheIndex: 6, description: 'Main d\'œuvre peintre', montant: 191, categorie: 'MAIN_OEUVRE', dateDepense: new Date('2024-01-06'), passeDansCredit: false },
    { pieceIndex: null, tacheIndex: null, description: 'Location benne gravats', montant: 280, categorie: 'OUTIL', dateDepense: new Date('2024-01-12'), passeDansCredit: false },
    { pieceIndex: 2, tacheIndex: null, description: 'Livraison carrelage', montant: 45, categorie: 'LIVRAISON', dateDepense: new Date('2024-01-20'), passeDansCredit: true },
    { pieceIndex: null, tacheIndex: null, description: 'Plans architecte cuisine', montant: 350, categorie: 'ETUDE', dateDepense: new Date('2024-01-02'), passeDansCredit: false },
  ];

  for (const depData of depensesData) {
    const { pieceIndex, tacheIndex, ...rest } = depData;
    await prisma.depense.create({
      data: {
        ...rest,
        projetId: projet.id,
        pieceId: pieceIndex !== null ? pieces[pieceIndex].id : null,
        tacheId: tacheIndex !== null ? taches[tacheIndex].id : null,
      },
    });
  }
  console.log('✅ Depenses created:', depensesData.length);

  // Créer un crédit
  const credit = await prisma.credit.create({
    data: {
      projetId: projet.id,
      banque: 'Crédit Agricole',
      montantTotal: 30000,
      tauxInteret: 3.5,
      duree: 84,
      notes: 'Prêt travaux rénovation',
    },
  });
  console.log('✅ Credit created:', credit.banque);

  // Créer des déblocages
  const deblocagesData = [
    { creditId: credit.id, montant: 10000, dateDeblocage: new Date('2024-01-05'), notes: 'Premier déblocage' },
    { creditId: credit.id, montant: 5000, dateDeblocage: new Date('2024-01-20'), notes: 'Deuxième déblocage' },
  ];

  for (const deb of deblocagesData) {
    await prisma.deblocage.create({
      data: deb,
    });
  }
  console.log('✅ Deblocages created:', deblocagesData.length);

  // Créer des matériaux
  const materiauxData = [
    { name: 'Parquet chêne massif', categorie: 'REVETEMENT_SOL', prixUnitaire: 45, unite: 'M2', reference: 'PAR-CHENE-001', fournisseur: 'Leroy Merlin' },
    { name: 'Carrelage métro blanc', categorie: 'REVETEMENT_MUR', prixUnitaire: 25, unite: 'M2', reference: 'CAR-METRO-BL', fournisseur: 'Castorama' },
    { name: 'Peinture blanc satin', categorie: 'PEINTURE', prixUnitaire: 35, unite: 'LITRE', reference: 'PEI-SAT-BL', fournisseur: 'Tollens' },
    { name: 'Robinet mitigeur cuisine', categorie: 'PLOMBERIE', prixUnitaire: 189, unite: 'PIECE', reference: 'ROB-GROU-001', fournisseur: 'Grohe' },
  ];

  for (const mat of materiauxData) {
    await prisma.materiau.create({
      data: {
        ...mat,
        projetId: projet.id,
      },
    });
  }
  console.log('✅ Materiaux created:', materiauxData.length);

  console.log('');
  console.log('🎉 Database seeded successfully!');
  console.log('');
  console.log('📧 User: jonathan@renovation-sas.fr');
  console.log('🔑 Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


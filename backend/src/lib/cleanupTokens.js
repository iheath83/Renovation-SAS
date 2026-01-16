import prisma from './prisma.js';

/**
 * Supprime les refresh tokens expirés de la base de données
 * À appeler périodiquement (cron job ou au démarrage)
 */
export const cleanupExpiredTokens = async () => {
  const result = await prisma.refreshToken.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });

  if (result.count > 0) {
    console.log(`[Cleanup] ${result.count} expired refresh tokens deleted`);
  }

  return result.count;
};


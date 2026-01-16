import prisma from '../lib/prisma.js';
import { hashPassword, comparePassword } from '../lib/password.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateResetToken,
  getRefreshTokenExpiry,
  getResetTokenExpiry,
} from '../lib/tokens.js';
import { successResponse, errorResponse } from '../lib/response.js';

const excludePassword = (user) => {
  const { password, resetToken, resetTokenExp, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const register = async (req, res) => {
  const { email, password, name } = req.body;

  // Vérifier si l'email existe déjà
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json(errorResponse('Cet email est déjà utilisé', 'EMAIL_EXISTS'));
  }

  // Hash du password
  const hashedPassword = await hashPassword(password);

  // Créer l'utilisateur ET son projet par défaut dans une transaction
  const result = await prisma.$transaction(async (tx) => {
    // Créer l'utilisateur
    const user = await tx.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    // Créer un projet par défaut pour le nouvel utilisateur
    const projet = await tx.projet.create({
      data: {
        name: 'Mon projet de rénovation',
        description: 'Projet créé automatiquement',
        users: {
          create: {
            userId: user.id,
            role: 'OWNER',
          },
        },
      },
    });

    // Générer les tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Sauvegarder le refresh token
    await tx.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    return { user, accessToken, refreshToken };
  });

  res.status(201).json(
    successResponse({
      user: excludePassword(result.user),
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    })
  );
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  // Trouver l'utilisateur
  const user = await prisma.user.findUnique({
    where: { email, deletedAt: null },
  });

  if (!user) {
    return res.status(401).json(errorResponse('Email ou mot de passe incorrect', 'INVALID_CREDENTIALS'));
  }

  // Vérifier le password
  const isValid = await comparePassword(password, user.password);
  if (!isValid) {
    return res.status(401).json(errorResponse('Email ou mot de passe incorrect', 'INVALID_CREDENTIALS'));
  }

  // Générer les tokens
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // Sauvegarder le refresh token
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  res.json(
    successResponse({
      user: excludePassword(user),
      accessToken,
      refreshToken,
    })
  );
};

export const refresh = async (req, res) => {
  const { refreshToken } = req.body;

  try {
    // Vérifier le token JWT
    const decoded = verifyRefreshToken(refreshToken);

    // Vérifier que le token existe en base et n'est pas expiré
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      return res.status(401).json(errorResponse('Refresh token invalide ou expiré', 'INVALID_TOKEN'));
    }

    if (storedToken.user.deletedAt) {
      return res.status(401).json(errorResponse('Utilisateur non trouvé', 'UNAUTHORIZED'));
    }

    // Supprimer l'ancien token
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    // Générer nouveaux tokens
    const newAccessToken = generateAccessToken(storedToken.userId);
    const newRefreshToken = generateRefreshToken(storedToken.userId);

    // Sauvegarder le nouveau refresh token
    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: storedToken.userId,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    res.json(
      successResponse({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      })
    );
  } catch (error) {
    return res.status(401).json(errorResponse('Refresh token invalide', 'INVALID_TOKEN'));
  }
};

export const logout = async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  // Supprimer tous les refresh tokens de l'utilisateur (logout global)
  // ou on pourrait juste supprimer le token passé en body
  await prisma.refreshToken.deleteMany({
    where: { userId: req.user.id },
  });

  res.json(successResponse({ message: 'Déconnexion réussie' }));
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({
    where: { email, deletedAt: null },
  });

  // Toujours retourner succès pour ne pas révéler si l'email existe
  if (!user) {
    return res.json(successResponse({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé' }));
  }

  // Générer reset token
  const resetToken = generateResetToken();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken,
      resetTokenExp: getResetTokenExpiry(),
    },
  });

  // En dev, on log le token (en prod, envoyer par email)
  console.log(`[DEV] Reset token for ${email}: ${resetToken}`);

  res.json(successResponse({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé' }));
};

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExp: { gt: new Date() },
      deletedAt: null,
    },
  });

  if (!user) {
    return res.status(400).json(errorResponse('Token invalide ou expiré', 'INVALID_TOKEN'));
  }

  // Hash du nouveau password
  const hashedPassword = await hashPassword(newPassword);

  // Mettre à jour l'utilisateur
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExp: null,
    },
  });

  // Invalider tous les refresh tokens
  await prisma.refreshToken.deleteMany({
    where: { userId: user.id },
  });

  res.json(successResponse({ message: 'Mot de passe réinitialisé avec succès' }));
};

export const me = async (req, res) => {
  // req.user est défini par le middleware auth
  const user = await prisma.user.findUnique({
    where: { id: req.user.id, deletedAt: null },
  });

  if (!user) {
    return res.status(404).json(errorResponse('Utilisateur non trouvé', 'NOT_FOUND'));
  }

  res.json(successResponse({ user: excludePassword(user) }));
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Récupérer l'utilisateur
  const user = await prisma.user.findUnique({
    where: { id: req.user.id, deletedAt: null },
  });

  if (!user) {
    return res.status(404).json(errorResponse('Utilisateur non trouvé', 'NOT_FOUND'));
  }

  // Vérifier le mot de passe actuel
  const isValid = await comparePassword(currentPassword, user.password);
  if (!isValid) {
    return res.status(401).json(errorResponse('Mot de passe actuel incorrect', 'INVALID_PASSWORD'));
  }

  // Hash du nouveau mot de passe
  const hashedPassword = await hashPassword(newPassword);

  // Mettre à jour le mot de passe
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  res.json(successResponse({ message: 'Mot de passe modifié avec succès' }));
};


import { z } from 'zod';

const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

export const registerSchema = {
  body: z.object({
    email: z.string().email('Email invalide'),
    password: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .regex(passwordRegex, 'Le mot de passe doit contenir au moins 1 majuscule et 1 chiffre'),
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100),
  }),
};

export const loginSchema = {
  body: z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(1, 'Le mot de passe est requis'),
  }),
};

export const refreshSchema = {
  body: z.object({
    refreshToken: z.string().min(1, 'Le refresh token est requis'),
  }),
};

export const forgotPasswordSchema = {
  body: z.object({
    email: z.string().email('Email invalide'),
  }),
};

export const resetPasswordSchema = {
  body: z.object({
    token: z.string().min(1, 'Le token est requis'),
    newPassword: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .regex(passwordRegex, 'Le mot de passe doit contenir au moins 1 majuscule et 1 chiffre'),
  }),
};


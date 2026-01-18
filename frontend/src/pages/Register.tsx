import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Mail, Lock, User, AlertCircle, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';
import LogoWhite from '@/assets/logo_white.svg?react';

interface RegisterProps {
  onSuccess: () => void;
}

export function Register({ onSuccess }: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Validation en temps réel
  const passwordValidation = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (!isPasswordValid) {
      setError('Le mot de passe ne respecte pas les critères requis');
      return;
    }

    setIsLoading(true);

    try {
      const result = await api.register(name, email, password);
      if (result.success) {
        onSuccess();
      } else {
        setError(result.error?.message || 'Erreur lors de l\'inscription');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.1 }}
          transition={{ duration: 2, ease: 'easeOut' }}
          className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full bg-blue-500 blur-[150px]"
        />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.08 }}
          transition={{ duration: 2, delay: 0.3, ease: 'easeOut' }}
          className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-purple-500 blur-[150px]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-10 shadow-2xl">
          {/* Logo & Header */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="flex justify-center mb-6"
            >
              <LogoWhite className="h-16 w-auto" />
            </motion.div>
            <h1 className="text-3xl font-display font-bold text-white mb-2">
              Créer un compte
            </h1>
            <p className="text-gray-400">
              Commencez votre projet de rénovation dès aujourd'hui
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-red-400 leading-relaxed">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-5">
              {/* Nom */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom complet
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-400 transition-colors z-10" />
                  <Input
                    type="text"
                    placeholder="Jean Dupont"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-12 h-14 bg-slate-900/50 border-slate-700/50 text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-400 transition-colors z-10" />
                  <Input
                    type="email"
                    placeholder="jean@exemple.fr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-14 bg-slate-900/50 border-slate-700/50 text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-400 transition-colors z-10" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 pr-12 h-14 bg-slate-900/50 border-slate-700/50 text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors z-10"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Validation du mot de passe */}
                {password && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 space-y-2"
                  >
                    <ValidationItem 
                      isValid={passwordValidation.minLength}
                      text="Au moins 8 caractères"
                    />
                    <ValidationItem 
                      isValid={passwordValidation.hasUpperCase}
                      text="Une lettre majuscule"
                    />
                    <ValidationItem 
                      isValid={passwordValidation.hasNumber}
                      text="Un chiffre"
                    />
                  </motion.div>
                )}
              </div>

              {/* Confirmation mot de passe */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-400 transition-colors z-10" />
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-12 pr-12 h-14 bg-slate-900/50 border-slate-700/50 text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors z-10"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {confirmPassword && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3"
                  >
                    <ValidationItem 
                      isValid={passwordsMatch}
                      text="Les mots de passe correspondent"
                    />
                  </motion.div>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/25"
              disabled={Boolean(isLoading || !email || !password || !name || !confirmPassword || !isPasswordValid || !passwordsMatch)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Création du compte...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Créer mon compte
                </>
              )}
            </Button>
          </form>

          {/* Login link */}
          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Vous avez déjà un compte ?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ValidationItem({ isValid, text }: { isValid: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {isValid ? (
          <CheckCircle2 className="w-4 h-4 text-green-400" />
        ) : (
          <div className="w-4 h-4 rounded-full border-2 border-gray-600" />
        )}
      </motion.div>
      <span className={isValid ? 'text-green-400' : 'text-gray-500'}>
        {text}
      </span>
    </div>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LogIn, 
  Mail, 
  Lock, 
  AlertCircle, 
  Loader2,
  Home,
  CheckSquare,
  Package,
  PiggyBank,
  Sparkles,
  LayoutDashboard,
  TrendingUp,
  Calendar,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthState } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import logoBlack from '@/assets/logo_black.svg';
import logoWhite from '@/assets/logo_white.svg';

interface LoginProps {
  onSuccess: () => void;
}

const features = [
  {
    icon: LayoutDashboard,
    title: 'Dashboard Intuitif',
    description: 'Visualisez l\'avancement de votre projet en un coup d\'œil avec des graphiques et métriques détaillées.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Home,
    title: 'Gestion des Pièces',
    description: 'Organisez votre rénovation pièce par pièce avec photos, plans et suivi budgétaire individuel.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: CheckSquare,
    title: 'Tâches & Planning',
    description: 'Créez des listes de tâches, suivez l\'avancement et ne manquez jamais une échéance importante.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Package,
    title: 'Matériaux',
    description: 'Gérez votre liste de matériaux, comparez les prix et suivez vos achats en temps réel.',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: PiggyBank,
    title: 'Budget & Finances',
    description: 'Contrôlez vos dépenses, gérez vos crédits et déblocages pour rester dans votre budget.',
    color: 'from-yellow-500 to-amber-500',
  },
  {
    icon: Sparkles,
    title: 'Inspiration',
    description: 'Créez des moodboards et sauvegardez vos idées Pinterest pour un projet qui vous ressemble.',
    color: 'from-indigo-500 to-purple-500',
  },
];

const stats = [
  { value: '100%', label: 'Gratuit' },
  { value: '∞', label: 'Projets' },
  { value: '24/7', label: 'Accessible' },
];

export function Login({ onSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const { login } = useAuthState();
  const { theme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        onSuccess();
      } else {
        setError('Email ou mot de passe incorrect');
      }
    } catch {
      setError('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-950 via-surface-900 to-surface-950">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.1 }}
          transition={{ duration: 2, ease: 'easeOut' }}
          className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full bg-primary-500 blur-[150px]"
        />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.08 }}
          transition={{ duration: 2, delay: 0.3, ease: 'easeOut' }}
          className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-accent-500 blur-[150px]"
        />
      </div>

      <div className="relative">
        {/* Header */}
        <header className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <img 
              src={theme === 'dark' ? logoWhite : logoBlack}
              alt="RénoPilot"
              className="h-12 w-auto"
            />
            <Button
              variant="outline"
              onClick={() => setShowLoginForm(true)}
              className="gap-2"
            >
              <LogIn className="w-4 h-4" />
              Se connecter
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-8"
            >
              <TrendingUp className="w-4 h-4 text-primary-400" />
              <span className="text-sm text-primary-400 font-medium">L'outil tout-en-un pour vos rénovations</span>
            </motion.div>

            <h1 className="text-5xl lg:text-7xl font-display font-bold text-primary mb-6">
              Pilotez votre projet
              <br />
              <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                de rénovation
              </span>
            </h1>

            <p className="text-xl text-tertiary mb-12 max-w-2xl mx-auto">
              Gérez facilement votre budget, vos tâches, vos matériaux et inspirez-vous pour créer la maison de vos rêves.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => setShowLoginForm(true)}
                className="gap-2 text-lg px-8 py-6"
              >
                Commencer gratuitement
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Link to="/register">
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 text-lg px-8 py-6"
                >
                  Créer un compte
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-20 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-sm text-tertiary">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-display font-bold text-primary mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-tertiary max-w-2xl mx-auto">
              Une suite complète d'outils pour gérer chaque aspect de votre projet de rénovation
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-dark rounded-2xl p-8 hover:border-primary-500/50 transition-all duration-300 hover:scale-105"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-3">
                  {feature.title}
                </h3>
                <p className="text-tertiary leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass-dark rounded-3xl p-12 lg:p-16 text-center"
          >
            <Calendar className="w-16 h-16 mx-auto mb-6 text-primary-400" />
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-primary mb-4">
              Prêt à démarrer votre projet ?
            </h2>
            <p className="text-xl text-tertiary mb-8 max-w-2xl mx-auto">
              Rejoignez des milliers de propriétaires qui gèrent leur rénovation en toute sérénité
            </p>
            <Button
              size="lg"
              onClick={() => setShowLoginForm(true)}
              className="gap-2 text-lg px-8 py-6"
            >
              <LogIn className="w-5 h-5" />
              Se connecter maintenant
            </Button>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-8 text-center text-tertiary text-sm border-t border-subtle">
          <p>© 2026 RénoPilot. Tous droits réservés.</p>
        </footer>
      </div>

      {/* Login Modal */}
      {showLoginForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowLoginForm(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-dark rounded-2xl p-8 w-full max-w-md"
          >
            {/* Logo */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 mb-4"
              >
                <LogIn className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-2xl font-display font-bold text-primary">
                Connexion
              </h2>
              <p className="text-tertiary mt-1">
                Accédez à votre espace
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted z-10" />
                <Input
                  type="email"
                  placeholder="Adresse email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted z-10" />
                  <Input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11"
                    required
                  />
                </div>
                <div className="text-right">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !email || !password}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Se connecter
                  </>
                )}
              </Button>
            </form>

            {/* Register link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-tertiary">
                Pas encore de compte ?{' '}
                <Link to="/register" className="text-primary-400 hover:text-primary-300 transition-colors">
                  S'inscrire
                </Link>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

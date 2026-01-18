import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
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
  Eye,
  EyeOff,
  X,
  Check,
  ArrowRight,
  Star,
  Zap,
  Shield,
  Users,
  TrendingUp,
  Calendar,
  FileText,
  Image as ImageIcon,
  CreditCard,
} from 'lucide-react';
import { api } from '@/lib/api';
import LogoWhite from '@/assets/logo_white.svg?react';

interface LoginModalProps {
  onClose: () => void;
  isRegister: boolean;
  onToggleRegister: () => void;
  onSuccess: () => void;
}

function LoginModal({ onClose, isRegister, onToggleRegister, onSuccess }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let result;
      if (isRegister) {
        result = await api.register(name, email, password);
      } else {
        result = await api.login(email, password);
      }

      if (result.success) {
        onClose();
        onSuccess(); // Appeler le callback de succès
      } else {
        setError(result.error?.message || 'Erreur de connexion');
      }
    } catch (err) {
      console.error(err);
      setError('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-10 w-full max-w-md shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>

        {/* Logo */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="flex justify-center mb-6"
          >
            <LogoWhite className="h-16 w-auto" />
          </motion.div>
          <h2 className="text-3xl font-display font-bold text-white mb-2">
            {isRegister ? 'Créer un compte' : 'Connexion'}
          </h2>
          <p className="text-gray-400">
            {isRegister ? 'Rejoignez RénoVision gratuitement' : 'Accédez à votre espace de gestion'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-400 leading-relaxed">{error}</span>
            </motion.div>
          )}

          <div className="space-y-5">
            {isRegister && (
              <div className="group">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom complet
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-400 transition-colors z-10" />
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
            )}

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
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  Mot de passe
                </label>
                {!isRegister && (
                  <Link
                    to="/forgot-password"
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    onClick={onClose}
                  >
                    Mot de passe oublié ?
                  </Link>
                )}
              </div>
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
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-14 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/25"
            disabled={isLoading || !email || !password || (isRegister && !name)}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isRegister ? 'Inscription...' : 'Connexion...'}
              </>
            ) : (
              <>
                {isRegister ? 'S\'inscrire' : 'Se connecter'}
              </>
            )}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400">
            {isRegister ? 'Déjà un compte ? ' : 'Pas encore de compte ? '}
            <button
              onClick={onToggleRegister}
              className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              {isRegister ? 'Se connecter' : 'S\'inscrire'}
            </button>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface LoginProps {
  onSuccess: () => void;
}

export function Login({ onSuccess }: LoginProps) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const features = [
    { 
      icon: LayoutDashboard, 
      title: 'Dashboard Intuitif', 
      description: 'Visualisez l\'avancement de votre projet en temps réel avec des graphiques et des indicateurs clés de performance.' 
    },
    { 
      icon: Home, 
      title: 'Gestion des Pièces', 
      description: 'Organisez votre rénovation par pièce, suivez les statuts, budgets et tâches associées pour chaque espace.' 
    },
    { 
      icon: CheckSquare, 
      title: 'Tâches & Planning', 
      description: 'Créez, assignez et suivez toutes les tâches avec un système de sous-tâches et de dépendances.' 
    },
    { 
      icon: Package, 
      title: 'Matériaux', 
      description: 'Gérez votre inventaire de matériaux, suivez les quantités, prix et fournisseurs en un seul endroit.' 
    },
    { 
      icon: PiggyBank, 
      title: 'Budget & Finances', 
      description: 'Contrôlez vos dépenses, suivez les crédits, déblocages et optimisez votre budget en temps réel.' 
    },
    { 
      icon: Sparkles, 
      title: 'Inspiration', 
      description: 'Centralisez vos idées Pinterest, créez des moodboards et organisez vos inspirations visuelles.' 
    },
  ];

  const trustedBy = [
    { name: 'Artisans', count: '500+' },
    { name: 'Particuliers', count: '2000+' },
    { name: 'Entreprises', count: '100+' },
  ];

  const benefits = [
    {
      icon: Zap,
      title: 'Interface Ultra-Rapide',
      description: 'Naviguez à la vitesse de l\'éclair grâce à une interface optimisée et réactive.'
    },
    {
      icon: Shield,
      title: 'Données Sécurisées',
      description: 'Vos données sont cryptées et sauvegardées automatiquement pour une sécurité maximale.'
    },
    {
      icon: Users,
      title: 'Collaboration Facile',
      description: 'Partagez vos projets avec votre équipe, artisans et partenaires en quelques clics.'
    },
  ];

  const advancedFeatures = [
    {
      icon: TrendingUp,
      title: 'Suivi Budgétaire Avancé',
      description: 'Analysez vos dépenses avec des graphiques détaillés, comparez budget prévisionnel vs réel, et recevez des alertes automatiques.',
      features: ['Graphiques en temps réel', 'Alertes de dépassement', 'Export Excel/PDF']
    },
    {
      icon: Calendar,
      title: 'Planning Visuel',
      description: 'Visualisez votre projet avec un diagramme de Gantt interactif, gérez les dépendances entre tâches et optimisez votre calendrier.',
      features: ['Gantt interactif', 'Gestion des dépendances', 'Vue calendrier']
    },
    {
      icon: FileText,
      title: 'Documents Centralisés',
      description: 'Stockez tous vos documents (factures, devis, plans) au même endroit avec recherche et organisation intelligente.',
      features: ['Stockage illimité', 'Recherche avancée', 'Tags & catégories']
    },
    {
      icon: ImageIcon,
      title: 'Photos Avant/Après',
      description: 'Capturez l\'évolution de votre projet avec des photos organisées par pièce et date, créez des diaporamas.',
      features: ['Galerie par pièce', 'Comparaison avant/après', 'Partage facile']
    },
    {
      icon: CreditCard,
      title: 'Gestion des Crédits',
      description: 'Suivez vos prêts, déblocages et remboursements avec des tableaux d\'amortissement et alertes de paiement.',
      features: ['Tableau d\'amortissement', 'Alertes de déblocage', 'Multi-crédits']
    },
    {
      icon: Users,
      title: 'Réseau d\'Artisans',
      description: 'Contactez et évaluez des artisans de confiance, consultez leurs avis et gérez vos devis en un clic.',
      features: ['Annuaire artisans', 'Système d\'avis', 'Comparateur de devis']
    },
  ];

  const testimonials = [
    {
      name: 'Sophie Martin',
      role: 'Propriétaire',
      image: '👩',
      text: 'RénoVision a transformé ma rénovation chaotique en un projet organisé. Le suivi budgétaire m\'a permis d\'économiser 15% !'
    },
    {
      name: 'Thomas Dubois',
      role: 'Artisan',
      image: '👨',
      text: 'En tant qu\'artisan, je recommande RénoVision à tous mes clients. La collaboration est tellement plus fluide !'
    },
    {
      name: 'Marie Leroy',
      role: 'Architecte d\'intérieur',
      image: '👩‍💼',
      text: 'Les moodboards et l\'intégration Pinterest sont parfaits pour présenter mes concepts clients. Un gain de temps énorme.'
    },
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: 'Gratuit',
      description: 'Parfait pour débuter votre premier projet',
      features: [
        '1 projet actif',
        'Dashboard complet',
        'Gestion des tâches',
        'Suivi budgétaire de base',
        'Stockage 1 GB',
        'Support par email'
      ],
      cta: 'Commencer gratuitement',
      highlighted: false
    },
    {
      name: 'Pro',
      price: '9,99€',
      period: '/mois',
      description: 'Pour les rénovations ambitieuses',
      features: [
        'Projets illimités',
        'Toutes les fonctionnalités Starter',
        'Planning Gantt',
        'Intégration bancaire',
        'Stockage 50 GB',
        'Multi-utilisateurs',
        'Support prioritaire'
      ],
      cta: 'Essayer 30 jours gratuits',
      highlighted: true
    },
    {
      name: 'Enterprise',
      price: 'Sur mesure',
      description: 'Pour les professionnels exigeants',
      features: [
        'Tout en illimité',
        'Toutes les fonctionnalités Pro',
        'API personnalisée',
        'Branding personnalisé',
        'Formation dédiée',
        'Account manager dédié',
        'SLA garanti'
      ],
      cta: 'Nous contacter',
      highlighted: false
    },
  ];

  const stats = [
    { value: '2500+', label: 'Projets réalisés' },
    { value: '€12M+', label: 'Budget géré' },
    { value: '98%', label: 'Satisfaction' },
    { value: '24/7', label: 'Support disponible' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center">
            <LogoWhite className="h-10 w-auto" />
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Fonctionnalités</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Tarifs</a>
            <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Témoignages</a>
          </nav>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => { setShowLoginModal(true); setIsRegister(false); }}>
              Se connecter
            </Button>
            <Button onClick={() => { setShowLoginModal(true); setIsRegister(true); }}>
              Commencer
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        {/* Background effects */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.15 }}
          transition={{ duration: 2, ease: 'easeOut' }}
          className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full bg-blue-500 blur-[150px]"
        />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.1 }}
          transition={{ duration: 2, delay: 0.3, ease: 'easeOut' }}
          className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-purple-500 blur-[150px]"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-8"
          >
            <Sparkles className="w-4 h-4" />
            <span>La solution de gestion de rénovation #1 en France</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold leading-tight text-white mb-6"
          >
            Pilotez vos Rénovations
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              avec Simplicité
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto"
          >
            La plateforme tout-en-un pour gérer budget, planning, matériaux et inspiration. 
            Transformez votre projet de rénovation en succès garanti.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center gap-4 mb-12"
          >
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
              onClick={() => { setShowLoginModal(true); setIsRegister(true); }}
            >
              Commencer gratuitement
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6 border-2 border-slate-700 hover:border-slate-600"
              onClick={() => { setShowLoginModal(true); setIsRegister(false); }}
            >
              Voir la démo
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 border-y border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <p className="text-gray-400 text-sm uppercase tracking-wider">Ils nous font confiance</p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-12">
            {trustedBy.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-white">{item.count}</div>
                <div className="text-gray-400 text-sm">{item.name}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm mb-6"
            >
              <Star className="w-4 h-4" />
              <span>Fonctionnalités puissantes</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-white mb-6"
            >
              Tout ce dont vous avez besoin,
              <br />
              <span className="text-blue-400">au même endroit</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xl text-gray-300 max-w-3xl mx-auto"
            >
              RénoVision centralise tous les aspects de votre rénovation pour vous faire gagner du temps et de l'argent.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-slate-800/50 border border-slate-700 rounded-2xl p-8 hover:border-blue-500/50 hover:bg-slate-800 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-white mb-6"
            >
              Pourquoi choisir <span className="text-purple-400">RénoVision</span> ?
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center mb-6 mx-auto">
                  <benefit.icon className="w-10 h-10 text-blue-400" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">{benefit.title}</h3>
                <p className="text-gray-300">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Features Section */}
      <section className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-white mb-6"
            >
              Des fonctionnalités <span className="text-blue-400">avancées</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xl text-gray-300 max-w-3xl mx-auto"
            >
              Découvrez tous les outils qui feront de votre rénovation un véritable succès
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {advancedFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 hover:border-blue-500/50 transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-300 mb-4">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.features.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-gray-400 text-sm">
                          <Check className="w-4 h-4 text-green-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-white mb-6"
            >
              Des tarifs <span className="text-blue-400">transparents</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xl text-gray-300"
            >
              Choisissez le plan qui correspond à vos besoins
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-3xl p-8 ${
                  plan.highlighted
                    ? 'bg-gradient-to-b from-blue-600/20 to-purple-600/20 border-2 border-blue-500 shadow-2xl shadow-blue-500/20 scale-105'
                    : 'bg-slate-800/50 border border-slate-700'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold">
                    Le plus populaire
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold text-white">{plan.price}</span>
                    {plan.period && <span className="text-gray-400">{plan.period}</span>}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500'
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                  onClick={() => { setShowLoginModal(true); setIsRegister(true); }}
                >
                  {plan.cta}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-white mb-6"
            >
              Ce que nos clients <span className="text-purple-400">disent de nous</span>
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{testimonial.image}</div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-900 to-purple-900 relative overflow-hidden">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.1 }}
          className="absolute -top-1/2 -right-1/2 w-[1000px] h-[1000px] rounded-full bg-blue-500 blur-[150px]"
        />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            Prêt à transformer vos projets de rénovation ?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-blue-100 mb-10"
          >
            Rejoignez des milliers d'utilisateurs qui ont simplifié la gestion de leurs chantiers avec RénoVision.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Button 
              size="lg" 
              className="text-lg px-10 py-6 bg-white text-blue-900 hover:bg-gray-100"
              onClick={() => { setShowLoginModal(true); setIsRegister(true); }}
            >
              Créer mon compte gratuit
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
          <p className="text-blue-200 text-sm mt-6">Aucune carte bancaire requise • Accès immédiat</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <LogoWhite className="h-10 w-auto mb-4" />
              <p className="text-gray-400 text-sm">
                La solution de gestion de rénovation la plus complète du marché.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Tarifs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">CGU</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Confidentialité</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} RénoVision. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

      {/* Login/Register Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <LoginModal
            onClose={() => setShowLoginModal(false)}
            isRegister={isRegister}
            onToggleRegister={() => setIsRegister(prev => !prev)}
            onSuccess={onSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

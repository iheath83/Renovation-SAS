import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  User, 
  Building2, 
  Bell, 
  Save,
  Lock,
  AlertCircle,
  Check,
  Eye,
  EyeOff,
  PiggyBank,
  Download,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { useProjets } from '@/hooks/useProjets';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

type TabType = 'compte' | 'projet' | 'notifications';

const tabs = [
  { id: 'compte' as const, label: 'Mon compte', icon: User },
  { id: 'projet' as const, label: 'Projet', icon: Building2 },
  { id: 'notifications' as const, label: 'Notifications', icon: Bell },
];

export function Settings() {
  const [activeTab, setActiveTab] = useState<TabType>('compte');

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-primary flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-primary-400" />
          Paramètres
        </h1>
        <p className="text-tertiary mt-1">
          Gérez votre compte et vos préférences
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item} className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap',
              activeTab === tab.id
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                : 'bg-overlay text-tertiary hover:bg-surface-700'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Content */}
      <motion.div variants={item}>
        {activeTab === 'compte' && <CompteSection />}
        {activeTab === 'projet' && <ProjetSection />}
        {activeTab === 'notifications' && <NotificationsSection />}
      </motion.div>
    </motion.div>
  );
}

// Section Compte
function CompteSection() {
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setFormData({ name: userData.name || '', email: userData.email || '' });
      } catch {
        // Ignore
      }
    }
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      const result = await api.updateUser(formData);
      if (result.success) {
        const updatedUser = { ...user, ...formData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setHasChanges(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch {
      // Handle error
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setIsChangingPassword(true);

    try {
      const result = await api.changePassword(currentPassword, newPassword);
      if (result.success) {
        setPasswordSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordForm(false);
        setTimeout(() => setPasswordSuccess(false), 5000);
      } else {
        setPasswordError(result.error?.message || 'Erreur lors du changement de mot de passe');
      }
    } catch {
      setPasswordError('Erreur de connexion au serveur');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {saveSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400"
        >
          <Check className="w-4 h-4" />
          <span className="text-sm">Modifications enregistrées</span>
        </motion.div>
      )}

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-primary-400" />
          Informations personnelles
        </h2>
        <div className="space-y-4">
          <Input
            label="Nom complet"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Jean Dupont"
          />
          
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="jean@example.com"
          />

          {hasChanges && (
            <div className="flex items-center gap-3 pt-4 border-t border-subtle">
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="w-4 h-4" />
                {isSaving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => {
                  setFormData({ name: user.name, email: user.email });
                  setHasChanges(false);
                }}
              >
                Annuler
              </Button>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary-400" />
            Sécurité
          </h2>
          {!showPasswordForm && (
            <Button size="sm" onClick={() => setShowPasswordForm(true)}>
              Changer le mot de passe
            </Button>
          )}
        </div>

        {passwordSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 mb-4"
          >
            <Check className="w-4 h-4" />
            <span className="text-sm">Mot de passe changé avec succès</span>
          </motion.div>
        )}

        {passwordError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 mb-4"
          >
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{passwordError}</span>
          </motion.div>
        )}

        {showPasswordForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">
                Mot de passe actuel
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 rounded-xl bg-elevated/50 border border-primary/50 text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 rounded-xl bg-elevated/50 border border-primary/50 text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted mt-1">Minimum 8 caractères</p>
            </div>

            <Input
              label="Confirmer le nouveau mot de passe"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />

            <div className="flex items-center gap-3 pt-4 border-t border-subtle">
              <Button
                onClick={handlePasswordChange}
                disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
              >
                <Lock className="w-4 h-4" />
                {isChangingPassword ? 'Modification...' : 'Changer le mot de passe'}
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => {
                  setShowPasswordForm(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setPasswordError('');
                }}
              >
                Annuler
              </Button>
            </div>
          </motion.div>
        )}
      </Card>
    </div>
  );
}

// Section Projet
function ProjetSection() {
  const { data: projets = [], refetch } = useProjets();
  const currentProjetId = api.getProjetId();
  const projet = projets.find(p => p.id === currentProjetId);
  
  const [formData, setFormData] = useState({
    name: projet?.name || '',
    description: projet?.description || '',
    adresse: projet?.adresse || '',
    budgetMax: projet?.budgetMax || 0,
    dateDebut: projet?.dateDebut || '',
    dateFin: projet?.dateFin || '',
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (projet) {
      // Formater les dates au format YYYY-MM-DD pour les inputs de type date
      const formatDateForInput = (date: string | null | undefined) => {
        if (!date) return '';
        try {
          const d = new Date(date);
          return d.toISOString().split('T')[0];
        } catch {
          return '';
        }
      };

      setFormData({
        name: projet.name || '',
        description: projet.description || '',
        adresse: projet.adresse || '',
        budgetMax: projet.budgetMax || 0,
        dateDebut: formatDateForInput(projet.dateDebut),
        dateFin: formatDateForInput(projet.dateFin),
      });
      // Réinitialiser hasChanges quand le projet change
      setHasChanges(false);
    }
  }, [projet]);

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!currentProjetId) return;
    
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError('');
    
    try {
      // Convertir les dates au format ISO si elles existent
      const dataToSend = {
        name: formData.name,
        description: formData.description || null,
        adresse: formData.adresse || null,
        budgetMax: formData.budgetMax || null,
        dateDebut: formData.dateDebut ? new Date(formData.dateDebut).toISOString() : null,
        dateFin: formData.dateFin ? new Date(formData.dateFin).toISOString() : null,
      };

      console.log('Sending project update:', dataToSend);
      const result = await api.updateProjet(currentProjetId, dataToSend);
      console.log('Update result:', result);
      console.log('Updated project data:', JSON.stringify(result.data, null, 2));
      
      if (result.success) {
        setHasChanges(false);
        setSaveSuccess(true);
        // Recharger les données du projet
        await refetch();
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(result.error?.message || 'Erreur inconnue');
        console.error('Update failed:', result.error);
      }
    } catch (error) {
      console.error('Error updating project:', error);
      setSaveError((error as Error).message || 'Erreur de connexion');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    if (!currentProjetId) return;
    
    setIsExporting(true);
    try {
      const blob = await api.exportProjet(currentProjetId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `renovation-${projet?.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      setSaveError('Erreur lors de l\'export');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);
    setSaveError('');
    
    try {
      const result = await api.importProjet(file);
      if (result && typeof result === 'object' && 'success' in result && result.success) {
        setSaveSuccess(true);
        await refetch();
        setTimeout(() => setSaveSuccess(false), 3000);
        // Recharger pour afficher le nouveau projet
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setSaveError((result && typeof result === 'object' && 'error' in result && result.error && typeof result.error === 'object' && 'message' in result.error) ? String(result.error.message) : 'Erreur lors de l\'import');
      }
    } catch (error) {
      console.error('Import error:', error);
      setSaveError('Erreur lors de l\'import du fichier');
    } finally {
      setIsImporting(false);
      if (e.target) e.target.value = '';
    }
  };

  if (!projet) {
    return (
      <Card className="p-8 text-center">
        <Building2 className="w-12 h-12 text-muted mx-auto mb-4" />
        <p className="text-tertiary">Aucun projet sélectionné</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {saveSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400"
        >
          <Check className="w-4 h-4" />
          <span className="text-sm">Projet mis à jour</span>
        </motion.div>
      )}

      {saveError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400"
        >
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{saveError}</span>
        </motion.div>
      )}

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary-400" />
          Informations du projet
        </h2>
        <div className="space-y-4">
          <Input
            label="Nom du projet"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Ma rénovation"
          />
          
          <Input
            label="Adresse"
            value={formData.adresse}
            onChange={(e) => handleChange('adresse', e.target.value)}
            placeholder="123 Rue de la Rénovation, 75000 Paris"
          />

          <div>
            <label className="block text-sm font-medium text-secondary mb-1.5">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-elevated/50 border border-primary/50 text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none"
              placeholder="Description du projet..."
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
          <PiggyBank className="w-5 h-5 text-green-400" />
          Budget & Planning
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1.5">
              Budget maximum (€)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={formData.budgetMax}
                onChange={(e) => handleChange('budgetMax', parseFloat(e.target.value) || 0)}
                className="flex-1 px-4 py-3 rounded-xl bg-elevated/50 border border-primary/50 text-2xl font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              />
              <span className="text-2xl text-tertiary">€</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Date de début"
              type="date"
              value={formData.dateDebut}
              onChange={(e) => handleChange('dateDebut', e.target.value)}
            />
            <Input
              label="Date de fin prévue"
              type="date"
              value={formData.dateFin}
              onChange={(e) => handleChange('dateFin', e.target.value)}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
          <Download className="w-5 h-5 text-blue-400" />
          Export / Import
        </h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted mb-3">
              Exportez toutes les données de votre projet (pièces, tâches, matériaux, dépenses, crédits, inspirations) dans un fichier JSON.
            </p>
            <Button onClick={handleExport} disabled={isExporting}>
              <Download className="w-4 h-4" />
              {isExporting ? 'Export en cours...' : 'Exporter le projet'}
            </Button>
          </div>

          <div className="border-t border-subtle pt-4">
            <p className="text-sm text-muted mb-3">
              Importez un projet précédemment exporté. Un nouveau projet sera créé avec toutes les données.
            </p>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              id="import-file"
            />
            <label htmlFor="import-file">
              <span className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all",
                "bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-600/30",
                isImporting && "opacity-50 cursor-not-allowed"
              )}>
                <Upload className="w-4 h-4" />
                {isImporting ? 'Import en cours...' : 'Importer un projet'}
              </span>
            </label>
          </div>
        </div>
      </Card>

      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4" />
            {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => {
              setFormData({
                name: projet.name || '',
                description: projet.description || '',
                adresse: projet.adresse || '',
                budgetMax: projet.budgetMax || 0,
                dateDebut: projet.dateDebut || '',
                dateFin: projet.dateFin || '',
              });
              setHasChanges(false);
            }}
          >
            Annuler
          </Button>
        </motion.div>
      )}
    </div>
  );
}

// Section Notifications
function NotificationsSection() {
  const [settings, setSettings] = useState({
    email: true,
    push: true,
    alertesBudget: true,
    rappelsTaches: true,
  });

  useEffect(() => {
    const stored = localStorage.getItem('renovision_notifications');
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch {
        // Ignore
      }
    }
  }, []);

  const toggleNotification = (key: keyof typeof settings) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    localStorage.setItem('renovision_notifications', JSON.stringify(updated));
  };

  const notificationOptions = [
    {
      key: 'email' as const,
      label: 'Notifications par email',
      description: 'Recevoir des résumés et alertes par email',
    },
    {
      key: 'push' as const,
      label: 'Notifications push',
      description: 'Recevoir des notifications dans le navigateur',
    },
    {
      key: 'alertesBudget' as const,
      label: 'Alertes budget',
      description: 'Être notifié en cas de dépassement ou approche du budget',
    },
    {
      key: 'rappelsTaches' as const,
      label: 'Rappels de tâches',
      description: 'Rappels pour les tâches à échéance proche',
    },
  ];

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
        <Bell className="w-5 h-5 text-primary-400" />
        Préférences de notification
      </h2>
      <div className="space-y-3">
        {notificationOptions.map((option) => (
          <div
            key={option.key}
            className="flex items-center justify-between p-4 rounded-xl bg-overlay/50 hover:bg-overlay transition-colors cursor-pointer"
            onClick={() => toggleNotification(option.key)}
          >
            <div className="flex-1">
              <p className="font-medium text-primary mb-0.5">{option.label}</p>
              <p className="text-sm text-muted">{option.description}</p>
            </div>
            <div className={cn(
              'w-12 h-6 rounded-full transition-colors relative',
              settings[option.key] ? 'bg-primary-500' : 'bg-surface-700'
            )}>
              <div className={cn(
                'absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform',
                settings[option.key] ? 'translate-x-6' : 'translate-x-0.5'
              )} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

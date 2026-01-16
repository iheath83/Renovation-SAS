import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  User, 
  Building2, 
  Palette, 
  Bell, 
  Tags,
  Save,
  X,
  Plus,
  Trash2,
  Check,
  Edit,
  ChevronRight,
  Lock,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import {
  useUserSettings,
  useUpdateUserSettings,
  useProjetSettings,
  useUpdateProjetSettings,
  useAppSettings,
  useUpdateAppSettings,
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/hooks/useSettings';
import type { CategorieCustom } from '@/types/settings';
import { ICONS_DISPONIBLES, COLORS_DISPONIBLES } from '@/types/settings';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

type TabType = 'compte' | 'projet' | 'categories' | 'notifications';

const tabs = [
  { id: 'compte' as const, label: 'Mon compte', icon: User },
  { id: 'projet' as const, label: 'Projet', icon: Building2 },
  { id: 'categories' as const, label: 'Catégories', icon: Tags },
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
          Gérez votre compte, votre projet et vos préférences
        </p>
      </motion.div>

      {/* Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <motion.div variants={item} className="lg:w-64 flex-shrink-0">
          <Card className="p-2">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all',
                    activeTab === tab.id
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'text-tertiary hover:bg-overlay hover:text-primary'
                  )}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                  <ChevronRight className={cn(
                    'w-4 h-4 ml-auto transition-transform',
                    activeTab === tab.id && 'rotate-90'
                  )} />
                </button>
              ))}
            </nav>
          </Card>
        </motion.div>

        {/* Content */}
        <motion.div variants={item} className="flex-1">
          <AnimatePresence mode="wait">
            {activeTab === 'compte' && <CompteSection key="compte" />}
            {activeTab === 'projet' && <ProjetSection key="projet" />}
            {activeTab === 'categories' && <CategoriesSection key="categories" />}
            {activeTab === 'notifications' && <NotificationsSection key="notifications" />}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Section Compte
function CompteSection() {
  const { data: user } = useUserSettings();
  const updateUser = useUpdateUserSettings();
  const [formData, setFormData] = useState(user);
  const [hasChanges, setHasChanges] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : prev);
    setHasChanges(true);
  };

  const handleSave = () => {
    if (formData) {
      updateUser.mutate(formData, {
        onSuccess: () => setHasChanges(false),
      });
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

  if (!formData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary-400" />
            Informations personnelles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Prénom"
              value={formData.prenom}
              onChange={(e) => handleChange('prenom', e.target.value)}
            />
            <Input
              label="Nom"
              value={formData.nom}
              onChange={(e) => handleChange('nom', e.target.value)}
            />
          </div>
          
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
          
          <Input
            label="Téléphone"
            value={formData.telephone || ''}
            onChange={(e) => handleChange('telephone', e.target.value)}
            placeholder="06 12 34 56 78"
          />

          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 pt-4 border-t border-primary"
            >
              <Button onClick={handleSave} disabled={updateUser.isPending}>
                <Save className="w-4 h-4" />
                {updateUser.isPending ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => {
                  setFormData(user);
                  setHasChanges(false);
                }}
              >
                Annuler
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary-400" />
            Sécurité
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {passwordSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400"
            >
              <Check className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">Mot de passe changé avec succès</span>
            </motion.div>
          )}

          {passwordError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{passwordError}</span>
            </motion.div>
          )}

          <Input
            label="Mot de passe actuel"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
          />

          <Input
            label="Nouveau mot de passe"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
          />

          <Input
            label="Confirmer le nouveau mot de passe"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
          />

          <Button
            onClick={handlePasswordChange}
            disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
          >
            <Lock className="w-4 h-4" />
            {isChangingPassword ? 'Modification...' : 'Changer le mot de passe'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Section Projet
function ProjetSection() {
  const { data: projet } = useProjetSettings();
  const updateProjet = useUpdateProjetSettings();
  const [formData, setFormData] = useState(projet);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : prev);
    setHasChanges(true);
  };

  const handleSave = () => {
    if (formData) {
      updateProjet.mutate(formData, {
        onSuccess: () => setHasChanges(false),
      });
    }
  };

  if (!formData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary-400" />
            Informations du projet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Nom du projet"
            value={formData.nom}
            onChange={(e) => handleChange('nom', e.target.value)}
          />
          
          <Input
            label="Adresse"
            value={formData.adresse || ''}
            onChange={(e) => handleChange('adresse', e.target.value)}
            placeholder="123 Rue de la Rénovation, 75000 Paris"
          />

          <div>
            <label className="block text-sm font-medium text-secondary mb-1.5">
              Description
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-elevated/50 border border-primary/50 text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none"
              placeholder="Description du projet..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-green-400" />
            Budget & Planning
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
            <label className="block text-sm font-medium text-green-400 mb-2">
              Budget maximum du projet (€)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={formData.budgetMax}
                onChange={(e) => handleChange('budgetMax', parseInt(e.target.value) || 0)}
                className="flex-1 px-4 py-3 rounded-xl bg-elevated border border-green-500/30 text-2xl font-bold text-green-400 focus:outline-none focus:ring-2 focus:ring-green-500/50"
              />
              <span className="text-2xl text-tertiary">€</span>
            </div>
            <p className="text-xs text-muted mt-2">
              Ce montant sera utilisé pour calculer les projections et alertes budgétaires
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Date de début"
              type="date"
              value={formData.dateDebut || ''}
              onChange={(e) => handleChange('dateDebut', e.target.value)}
            />
            <Input
              label="Date de fin prévue"
              type="date"
              value={formData.dateFin || ''}
              onChange={(e) => handleChange('dateFin', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <Button onClick={handleSave} disabled={updateProjet.isPending}>
            <Save className="w-4 h-4" />
            {updateProjet.isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => {
              setFormData(projet);
              setHasChanges(false);
            }}
          >
            Annuler
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

// Section Catégories
function CategoriesSection() {
  const [selectedType, setSelectedType] = useState<'depense' | 'materiau' | 'piece'>('depense');
  const { data: categories = [] } = useCategories(selectedType);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({ nom: '', icon: '📦', color: 'blue' });

  const typeLabels = {
    depense: 'Catégories de dépenses',
    materiau: 'Catégories de matériaux',
    piece: 'Types de pièces',
  };

  const handleCreate = () => {
    createCategory.mutate(
      { ...newCategory, type: selectedType },
      {
        onSuccess: () => {
          setIsAdding(false);
          setNewCategory({ nom: '', icon: '📦', color: 'blue' });
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    if (confirm('Supprimer cette catégorie ?')) {
      deleteCategory.mutate(id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Type selector */}
      <div className="flex gap-2">
        {(['depense', 'materiau', 'piece'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={cn(
              'px-4 py-2 rounded-xl font-medium text-sm transition-all',
              selectedType === type
                ? 'bg-primary-500 text-white'
                : 'bg-overlay text-tertiary hover:bg-surface-700'
            )}
          >
            {type === 'depense' && 'Dépenses'}
            {type === 'materiau' && 'Matériaux'}
            {type === 'piece' && 'Pièces'}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Tags className="w-5 h-5 text-primary-400" />
              {typeLabels[selectedType]}
            </CardTitle>
            <Button size="sm" onClick={() => setIsAdding(true)}>
              <Plus className="w-4 h-4" />
              Ajouter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* Add form */}
            {isAdding && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 rounded-xl bg-overlay border border-primary-500/30 mb-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  {/* Icon selector */}
                  <div className="relative">
                    <button className="w-12 h-12 rounded-xl bg-surface-700 text-2xl flex items-center justify-center hover:bg-surface-600 transition-colors">
                      {newCategory.icon}
                    </button>
                    <div className="absolute top-full left-0 mt-2 p-2 rounded-xl bg-overlay border border-primary grid grid-cols-5 gap-1 z-10 hidden group-hover:grid">
                      {ICONS_DISPONIBLES.map((icon) => (
                        <button
                          key={icon}
                          onClick={() => setNewCategory(prev => ({ ...prev, icon }))}
                          className="w-8 h-8 rounded hover:bg-surface-600 flex items-center justify-center"
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={newCategory.nom}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, nom: e.target.value }))}
                    placeholder="Nom de la catégorie"
                    className="flex-1 px-4 py-2 rounded-xl bg-elevated border border-primary text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  />
                </div>
                
                {/* Color selector */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-tertiary">Couleur:</span>
                  <div className="flex gap-1">
                    {COLORS_DISPONIBLES.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setNewCategory(prev => ({ ...prev, color: color.value }))}
                        className={cn(
                          'w-6 h-6 rounded-full transition-transform',
                          `bg-${color.value}-500`,
                          newCategory.color === color.value && 'ring-2 ring-white ring-offset-2 ring-offset-surface-800 scale-110'
                        )}
                        style={{ backgroundColor: `var(--color-${color.value}-500, #888)` }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={handleCreate} disabled={!newCategory.nom.trim()}>
                    <Check className="w-4 h-4" />
                    Créer
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>
                    <X className="w-4 h-4" />
                    Annuler
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Categories list */}
            {categories.map((category) => (
              <CategoryItem
                key={category.id}
                category={category}
                isEditing={editingId === category.id}
                onEdit={() => setEditingId(category.id)}
                onCancelEdit={() => setEditingId(null)}
                onSave={(data) => {
                  updateCategory.mutate({ id: category.id, data });
                  setEditingId(null);
                }}
                onDelete={() => handleDelete(category.id)}
              />
            ))}

            {categories.length === 0 && (
              <p className="text-center text-muted py-8">
                Aucune catégorie
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface CategoryItemProps {
  category: CategorieCustom;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: (data: Partial<CategorieCustom>) => void;
  onDelete: () => void;
}

function CategoryItem({ category, isEditing, onEdit, onCancelEdit, onSave, onDelete }: CategoryItemProps) {
  const [editData, setEditData] = useState({ nom: category.nom, icon: category.icon });

  if (isEditing) {
    return (
      <motion.div
        initial={{ scale: 0.98 }}
        animate={{ scale: 1 }}
        className="flex items-center gap-3 p-3 rounded-xl bg-overlay border border-primary-500/30"
      >
        <span className="text-xl">{editData.icon}</span>
        <input
          type="text"
          value={editData.nom}
          onChange={(e) => setEditData(prev => ({ ...prev, nom: e.target.value }))}
          className="flex-1 px-3 py-1.5 rounded-lg bg-elevated border border-primary text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50"
        />
        <Button size="sm" onClick={() => onSave(editData)}>
          <Check className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancelEdit}>
          <X className="w-4 h-4" />
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-overlay/50 hover:bg-overlay transition-colors group">
      <span className="text-xl">{category.icon}</span>
      <span className="flex-1 text-primary">{category.nom}</span>
      {category.isDefault && (
        <span className="px-2 py-0.5 rounded text-xs bg-surface-700 text-muted">
          Par défaut
        </span>
      )}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="p-1.5 rounded-lg hover:bg-surface-700 text-tertiary hover:text-primary transition-colors"
        >
          <Edit className="w-4 h-4" />
        </button>
        {!category.isDefault && (
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg hover:bg-red-500/20 text-tertiary hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// Section Notifications
function NotificationsSection() {
  const { data: settings } = useAppSettings();
  const updateSettings = useUpdateAppSettings();

  const toggleNotification = (key: keyof typeof settings.notifications) => {
    if (settings) {
      updateSettings.mutate({
        notifications: {
          ...settings.notifications,
          [key]: !settings.notifications[key],
        },
      });
    }
  };

  if (!settings) return null;

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
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary-400" />
            Préférences de notification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {notificationOptions.map((option) => (
            <div
              key={option.key}
              className="flex items-center justify-between p-4 rounded-xl bg-overlay/50 hover:bg-overlay transition-colors cursor-pointer"
              onClick={() => toggleNotification(option.key)}
            >
              <div>
                <p className="font-medium text-primary">{option.label}</p>
                <p className="text-sm text-muted">{option.description}</p>
              </div>
              <div className={cn(
                'w-12 h-6 rounded-full transition-colors',
                settings.notifications[option.key] ? 'bg-primary-500' : 'bg-surface-700'
              )}>
                <div className={cn(
                  'w-5 h-5 rounded-full bg-white mt-0.5 transition-transform',
                  settings.notifications[option.key] ? 'translate-x-6' : 'translate-x-0.5'
                )} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}


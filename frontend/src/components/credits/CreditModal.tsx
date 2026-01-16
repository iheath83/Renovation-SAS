import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Credit, CreateCreditInput } from '@/types/credit';

interface CreditModalProps {
  isOpen: boolean;
  onClose: () => void;
  credit?: Credit | null;
  onSave: (data: CreateCreditInput) => void;
  onDelete?: () => void;
  isLoading?: boolean;
}

export function CreditModal({ 
  isOpen, 
  onClose, 
  credit, 
  onSave,
  onDelete,
  isLoading 
}: CreditModalProps) {
  const [formData, setFormData] = useState<CreateCreditInput>({
    nom: '',
    organisme: '',
    montantTotal: 0,
    tauxInteret: 0,
    dureeRemboursement: 12,
    dateDebut: new Date().toISOString().split('T')[0],
    mensualite: 0,
  });

  useEffect(() => {
    if (credit) {
      setFormData({
        nom: credit.nom,
        organisme: credit.organisme,
        montantTotal: credit.montantTotal,
        tauxInteret: credit.tauxInteret || 0,
        dureeRemboursement: credit.dureeRemboursement || 0,
        dateDebut: credit.dateDebut || '',
        mensualite: credit.mensualite || 0,
      });
    } else {
      setFormData({
        nom: '',
        organisme: '',
        montantTotal: 0,
        tauxInteret: 0,
        dureeRemboursement: 12,
        dateDebut: new Date().toISOString().split('T')[0],
        mensualite: 0,
      });
    }
  }, [credit, isOpen]);

  // Auto-calculate mensualite
  useEffect(() => {
    if (formData.montantTotal && formData.dureeRemboursement) {
      const tauxMensuel = formData.tauxInteret / 100 / 12;
      let mensualite: number;
      
      if (tauxMensuel === 0) {
        mensualite = formData.montantTotal / formData.dureeRemboursement;
      } else {
        mensualite = (formData.montantTotal * tauxMensuel) / 
          (1 - Math.pow(1 + tauxMensuel, -formData.dureeRemboursement));
      }
      
      setFormData(prev => ({ ...prev, mensualite: Math.round(mensualite * 100) / 100 }));
    }
  }, [formData.montantTotal, formData.tauxInteret, formData.dureeRemboursement]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg z-50"
          >
            <div className="glass-dark rounded-xl h-full md:h-auto max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-subtle">
                <h2 className="text-lg font-semibold text-primary">
                  {credit ? 'Modifier le crédit' : 'Nouveau crédit'}
                </h2>
                <div className="flex items-center gap-1">
                  {credit && onDelete && (
                    <button
                      onClick={onDelete}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-overlay text-tertiary transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
                <Input
                  label="Nom du crédit"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Ex: Prêt Travaux"
                  required
                />

                <Input
                  label="Organisme"
                  value={formData.organisme}
                  onChange={(e) => setFormData({ ...formData, organisme: e.target.value })}
                  placeholder="Ex: Crédit Agricole"
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Montant total (€)"
                    type="number"
                    min="0"
                    value={formData.montantTotal}
                    onChange={(e) => setFormData({ ...formData, montantTotal: parseFloat(e.target.value) || 0 })}
                    required
                  />

                  <Input
                    label="Taux d'intérêt (%)"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.tauxInteret}
                    onChange={(e) => setFormData({ ...formData, tauxInteret: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Durée (mois)"
                    type="number"
                    min="1"
                    value={formData.dureeRemboursement}
                    onChange={(e) => setFormData({ ...formData, dureeRemboursement: parseInt(e.target.value) || 12 })}
                    required
                  />

                  <Input
                    label="Date de début"
                    type="date"
                    value={formData.dateDebut}
                    onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                  />
                </div>

                {/* Mensualité calculée */}
                <div className="p-3 rounded-lg bg-primary-500/10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-tertiary">Mensualité estimée</span>
                    <span className="text-lg font-bold text-primary">
                      {formData.mensualite?.toLocaleString('fr-FR')}€/mois
                    </span>
                  </div>
                </div>
              </form>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-5 border-t border-subtle">
                <Button variant="ghost" onClick={onClose}>
                  Annuler
                </Button>
                <Button onClick={handleSubmit} disabled={isLoading || !formData.nom || !formData.organisme}>
                  {isLoading ? 'Enregistrement...' : credit ? 'Enregistrer' : 'Créer'}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


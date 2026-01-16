import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { CategorieDepense } from '@/types/depense';

interface DepenseImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (depenses: ImportedDepense[]) => Promise<void>;
}

export interface ImportedDepense {
  description: string;
  montant: number;
  categorie: CategorieDepense;
  dateDepense: string;
  fournisseur?: string;
  passeDansCredit: boolean;
}

const CATEGORY_MAP: Record<string, CategorieDepense> = {
  'matériaux': 'MATERIAU',
  'materiau': 'MATERIAU',
  'main d\'œuvre': 'MAIN_OEUVRE',
  'main d\'oeuvre': 'MAIN_OEUVRE',
  'outillage': 'OUTIL',
  'outil': 'OUTIL',
  'transport': 'LIVRAISON',
  'livraison': 'LIVRAISON',
  'étude': 'ETUDE',
  'etude': 'ETUDE',
  'autre': 'AUTRE',
};

function parseFrenchDate(dateStr: string): string {
  // Format: DD/MM/YYYY -> YYYY-MM-DD
  const parts = dateStr.replace(/"/g, '').trim().split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return new Date().toISOString().split('T')[0];
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ';' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());

  return result;
}

function parseCSV(content: string): ImportedDepense[] {
  const lines = content.split('\n').filter(line => line.trim());
  const depenses: ImportedDepense[] = [];

  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const columns = parseCSVLine(lines[i]);
    
    if (columns.length < 9) continue;

    const [date, description, categorie, montant, fournisseur, , , , passeDansCredit] = columns;

    // Parse category
    const catKey = categorie.toLowerCase().replace(/"/g, '').trim();
    const mappedCategorie = CATEGORY_MAP[catKey] || 'AUTRE';

    // Parse amount
    const montantValue = parseFloat(montant.replace(/"/g, '').replace(',', '.').trim());
    if (isNaN(montantValue)) continue;

    // Parse passeDansCredit
    const passeDansCreditStr = passeDansCredit.toLowerCase().replace(/"/g, '').trim();
    const passeDansCreditValue = passeDansCreditStr === 'oui';

    depenses.push({
      description: description.replace(/"/g, '').trim(),
      montant: montantValue,
      categorie: mappedCategorie,
      dateDepense: parseFrenchDate(date),
      fournisseur: fournisseur.replace(/"/g, '').trim() || undefined,
      passeDansCredit: passeDansCreditValue,
    });
  }

  return depenses;
}

export function DepenseImportModal({ isOpen, onClose, onImport }: DepenseImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportedDepense[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);

    try {
      const content = await selectedFile.text();
      const parsed = parseCSV(content);
      
      if (parsed.length === 0) {
        setError('Aucune dépense trouvée dans le fichier');
        return;
      }

      setPreview(parsed);
    } catch (err) {
      setError('Erreur lors de la lecture du fichier');
      console.error(err);
    }
  };

  const handleImport = async () => {
    if (preview.length === 0) return;

    setIsImporting(true);
    try {
      await onImport(preview);
      onClose();
      setFile(null);
      setPreview([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'import');
    } finally {
      setIsImporting(false);
    }
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
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl z-50"
          >
            <div className="glass-dark rounded-2xl h-full md:h-auto max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-subtle">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary-500/20">
                    <Upload className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-semibold text-primary">
                      Importer des dépenses
                    </h2>
                    <p className="text-xs text-muted">Format CSV avec séparateur point-virgule</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover-bg transition-colors"
                >
                  <X className="w-5 h-5 text-tertiary" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Fichier CSV
                  </label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-tertiary
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-medium
                      file:bg-primary-500 file:text-white
                      hover:file:bg-primary-600
                      file:cursor-pointer cursor-pointer"
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                {/* Preview */}
                {preview.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <p className="text-sm text-green-400">
                        {preview.length} dépense{preview.length > 1 ? 's' : ''} prête{preview.length > 1 ? 's' : ''} à importer
                      </p>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {preview.slice(0, 5).map((depense, index) => (
                        <div key={index} className="p-3 rounded-lg bg-overlay/50 border border-primary/50">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-primary truncate">{depense.description}</p>
                              <div className="flex items-center gap-2 mt-1 text-xs text-muted">
                                <span>{depense.categorie}</span>
                                <span>•</span>
                                <span>{new Date(depense.dateDepense).toLocaleDateString('fr-FR')}</span>
                                {depense.fournisseur && (
                                  <>
                                    <span>•</span>
                                    <span>{depense.fournisseur}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-primary">{depense.montant.toLocaleString('fr-FR')}€</p>
                              {depense.passeDansCredit && (
                                <span className="text-xs text-green-400">Crédit</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {preview.length > 5 && (
                        <p className="text-center text-sm text-muted py-2">
                          ... et {preview.length - 5} autre{preview.length - 5 > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Instructions */}
                {!file && (
                  <div className="p-4 rounded-lg bg-overlay/50 border border-primary/50">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-tertiary mt-0.5" />
                      <div className="text-sm text-tertiary space-y-2">
                        <p className="font-medium text-secondary">Format attendu :</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Séparateur : point-virgule (;)</li>
                          <li>Colonnes : Date, Description, Catégorie, Montant, Fournisseur, ...</li>
                          <li>Format de date : DD/MM/YYYY</li>
                          <li>Catégories : Matériaux, Main d'œuvre, Outillage, Transport, Autre</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-5 border-t border-subtle">
                <Button variant="ghost" onClick={onClose}>
                  Annuler
                </Button>
                <Button 
                  onClick={handleImport} 
                  disabled={preview.length === 0 || isImporting}
                >
                  {isImporting ? 'Import en cours...' : `Importer ${preview.length} dépense${preview.length > 1 ? 's' : ''}`}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileUp, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ACCEPTED_TYPES, type AcceptedFileType } from '@/types/file';

interface FileDropzoneProps {
  onFilesSelected: (files: FileList) => void;
  accept?: AcceptedFileType;
  maxFiles?: number;
  disabled?: boolean;
  error?: string | null;
  className?: string;
  compact?: boolean;
}

export function FileDropzone({
  onFilesSelected,
  accept = 'all',
  maxFiles = 10,
  disabled = false,
  error,
  className,
  compact = false,
}: FileDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragActive(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFilesSelected(files);
    }
  }, [disabled, onFilesSelected]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFilesSelected(files);
    }
    // Reset input
    e.target.value = '';
  }, [onFilesSelected]);

  const acceptedTypesString = ACCEPTED_TYPES[accept];

  if (compact) {
    const handleButtonClick = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = maxFiles > 1;
      input.accept = acceptedTypesString;
      input.onchange = (e) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
          onFilesSelected(target.files);
        }
      };
      input.click();
    };

    return (
      <div className={cn('inline-block', className)}>
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={disabled}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all',
            'bg-overlay hover:bg-surface-700 border border-primary',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Upload className="w-4 h-4 text-tertiary" />
          <span className="text-sm text-secondary">Ajouter des fichiers</span>
        </button>
        {error && (
          <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <motion.div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        animate={{
          scale: isDragActive ? 1.02 : 1,
          borderColor: isDragActive ? 'rgb(59, 130, 246)' : 'rgba(255, 255, 255, 0.1)',
        }}
        className={cn(
          'relative flex flex-col items-center justify-center',
          'p-8 rounded-2xl border-2 border-dashed',
          'bg-elevated/50 transition-colors',
          isDragActive && 'bg-primary-500/10 border-primary-500',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'cursor-pointer hover:bg-overlay/50',
        )}
      >
        <input
          type="file"
          multiple={maxFiles > 1}
          accept={acceptedTypesString}
          onChange={handleFileInput}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <AnimatePresence mode="wait">
          {isDragActive ? (
            <motion.div
              key="drop"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center"
            >
              <div className="p-4 rounded-full bg-primary-500/20 mb-4">
                <FileUp className="w-8 h-8 text-primary-400" />
              </div>
              <p className="text-lg font-medium text-primary-400">
                Déposez vos fichiers ici
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center text-center"
            >
              <div className="p-4 rounded-full bg-overlay mb-4">
                <Upload className="w-8 h-8 text-tertiary" />
              </div>
              <p className="text-primary font-medium mb-1">
                Glissez-déposez vos fichiers ici
              </p>
              <p className="text-sm text-muted">
                ou cliquez pour sélectionner
              </p>
              <p className="text-xs text-muted mt-2">
                {accept === 'image' && 'Images uniquement (JPEG, PNG, GIF, WebP)'}
                {accept === 'document' && 'PDF et images'}
                {accept === 'all' && 'Images et PDF'}
                {maxFiles > 1 && ` • Max ${maxFiles} fichiers`}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-400 mt-2 flex items-center gap-1"
        >
          <AlertCircle className="w-4 h-4" />
          {error}
        </motion.p>
      )}
    </div>
  );
}


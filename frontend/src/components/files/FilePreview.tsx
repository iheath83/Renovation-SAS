import { motion } from 'framer-motion';
import { X, FileText, Loader2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { formatFileSize, getFileIcon } from '@/types/file';
import type { UploadedFile, FileUploadProgress } from '@/types/file';

interface FilePreviewProps {
  file: UploadedFile;
  onRemove?: (id: string) => void;
  compact?: boolean;
  showActions?: boolean;
}

export function FilePreview({ 
  file, 
  onRemove, 
  compact = false,
  showActions = true 
}: FilePreviewProps) {
  const isImage = file.type.startsWith('image/');
  
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-overlay group"
      >
        <span className="text-lg">{getFileIcon(file.type)}</span>
        <span className="text-sm text-secondary truncate flex-1 max-w-[150px]">
          {file.name}
        </span>
        {showActions && onRemove && (
          <button
            onClick={() => onRemove(file.id)}
            className="p-1 rounded-full hover:bg-red-500/20 text-muted hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative rounded-xl overflow-hidden bg-overlay group"
    >
      {/* Preview */}
      <div className="aspect-square relative">
        {isImage && file.thumbnailUrl ? (
          <img
            src={file.thumbnailUrl}
            alt={file.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-elevated">
            <FileText className="w-12 h-12 text-muted mb-2" />
            <span className="text-xs text-muted uppercase">
              {file.type.split('/')[1] || 'file'}
            </span>
          </div>
        )}

        {/* Overlay actions */}
        {showActions && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            {onRemove && (
              <button
                onClick={() => onRemove(file.id)}
                className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/40 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm text-primary truncate" title={file.name}>
          {file.name}
        </p>
        <p className="text-xs text-muted">
          {formatFileSize(file.size)}
        </p>
      </div>
    </motion.div>
  );
}

interface FileUploadProgressItemProps {
  progress: FileUploadProgress;
}

export function FileUploadProgressItem({ progress }: FileUploadProgressItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-overlay/50"
    >
      {/* Status icon */}
      <div className="flex-shrink-0">
        {progress.status === 'uploading' && (
          <Loader2 className="w-5 h-5 text-primary-400 animate-spin" />
        )}
        {progress.status === 'completed' && (
          <CheckCircle className="w-5 h-5 text-green-400" />
        )}
        {progress.status === 'error' && (
          <AlertCircle className="w-5 h-5 text-red-400" />
        )}
        {progress.status === 'pending' && (
          <div className="w-5 h-5 rounded-full border-2 border-surface-600" />
        )}
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-primary truncate">{progress.fileName}</p>
        {progress.status === 'error' && progress.error && (
          <p className="text-xs text-red-400">{progress.error}</p>
        )}
      </div>

      {/* Progress bar */}
      {progress.status === 'uploading' && (
        <div className="w-24 h-1.5 rounded-full bg-surface-700 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress.progress}%` }}
            className="h-full bg-primary-500 rounded-full"
          />
        </div>
      )}

      {/* Percentage */}
      {progress.status === 'uploading' && (
        <span className="text-xs text-tertiary w-10 text-right">
          {progress.progress}%
        </span>
      )}
    </motion.div>
  );
}


import { AnimatePresence } from 'framer-motion';
import { Trash2, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FilePreview, FileUploadProgressItem } from './FilePreview';
import type { UploadedFile, FileUploadProgress } from '@/types/file';

interface FileListProps {
  files: UploadedFile[];
  uploadProgress?: FileUploadProgress[];
  onRemove?: (id: string) => void;
  onClearAll?: () => void;
  variant?: 'grid' | 'list' | 'compact';
  className?: string;
  emptyMessage?: string;
  showEmptyState?: boolean;
}

export function FileList({
  files,
  uploadProgress = [],
  onRemove,
  onClearAll,
  variant = 'grid',
  className,
  emptyMessage = 'Aucun fichier',
  showEmptyState = true,
}: FileListProps) {
  const hasContent = files.length > 0 || uploadProgress.length > 0;

  if (!hasContent && !showEmptyState) {
    return null;
  }

  if (!hasContent) {
    return (
      <div className={cn('text-center py-8', className)}>
        <FolderOpen className="w-12 h-12 text-muted mx-auto mb-3" />
        <p className="text-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with clear all */}
      {files.length > 1 && onClearAll && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-tertiary">
            {files.length} fichier{files.length > 1 ? 's' : ''}
          </span>
          <button
            onClick={onClearAll}
            className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Tout supprimer
          </button>
        </div>
      )}

      {/* Upload progress */}
      {uploadProgress.length > 0 && (
        <div className="space-y-2">
          <AnimatePresence>
            {uploadProgress
              .filter(p => p.status !== 'completed')
              .map((progress) => (
                <FileUploadProgressItem key={progress.fileId} progress={progress} />
              ))}
          </AnimatePresence>
        </div>
      )}

      {/* Files */}
      {variant === 'grid' && files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {files.map((file) => (
            <FilePreview
              key={file.id}
              file={file}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}

      {variant === 'list' && files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-overlay group"
            >
              {/* Thumbnail */}
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-surface-700 flex items-center justify-center">
                {file.type.startsWith('image/') && file.thumbnailUrl ? (
                  <img
                    src={file.thumbnailUrl}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">📄</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-primary truncate">{file.name}</p>
                <p className="text-xs text-muted">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>

              {/* Actions */}
              {onRemove && (
                <button
                  onClick={() => onRemove(file.id)}
                  className="p-2 rounded-lg hover:bg-red-500/20 text-muted hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {variant === 'compact' && files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((file) => (
            <FilePreview
              key={file.id}
              file={file}
              onRemove={onRemove}
              compact
            />
          ))}
        </div>
      )}
    </div>
  );
}


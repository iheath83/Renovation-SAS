import { useCallback, useRef, useState, useEffect } from 'react';
import { FileDropzone } from './FileDropzone';
import { FileList } from './FileList';
import { fileStorage } from '@/lib/fileStorage';
import type { AcceptedFileType, UploadedFile, FileUploadProgress } from '@/types/file';

interface FileUploaderProps {
  accept?: AcceptedFileType;
  maxFiles?: number;
  onChange?: (files: UploadedFile[]) => void;
  /** URLs des fichiers existants à charger */
  initialUrls?: string[];
  /** Clé pour réinitialiser le composant */
  resetKey?: string | number;
  variant?: 'grid' | 'list' | 'compact';
  compact?: boolean;
  className?: string;
}

export function FileUploader({
  accept = 'all',
  maxFiles = 10,
  onChange,
  initialUrls = [],
  resetKey,
  variant = 'grid',
  compact = false,
  className,
}: FileUploaderProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const initializedRef = useRef(false);

  // Charger les fichiers existants au montage ou quand resetKey change
  useEffect(() => {
    if (initialUrls.length > 0) {
      const existingFiles: UploadedFile[] = initialUrls.map((url, index) => ({
        id: `existing-${index}-${Date.now()}`,
        name: `Fichier ${index + 1}`,
        size: 0,
        type: url.startsWith('data:image') ? 'image/jpeg' : 'application/pdf',
        url,
        thumbnailUrl: url.startsWith('data:image') ? url : undefined,
        createdAt: new Date().toISOString(),
      }));
      setUploadedFiles(existingFiles);
      initializedRef.current = true;
    } else {
      setUploadedFiles([]);
      initializedRef.current = true;
    }
  }, [resetKey]); // Se déclenche quand resetKey change (nouvelle édition)

  const handleFilesSelected = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);
    
    if (fileArray.length > maxFiles) {
      setError(`Maximum ${maxFiles} fichiers autorisés`);
      return;
    }

    setError(null);
    setIsUploading(true);

    const initialProgress: FileUploadProgress[] = fileArray.map((file, index) => ({
      fileId: `temp-${index}`,
      fileName: file.name,
      progress: 0,
      status: 'pending' as const,
    }));
    setUploadProgress(initialProgress);

    const results: UploadedFile[] = [];

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        
        setUploadProgress(prev => 
          prev.map((p, idx) => 
            idx === i ? { ...p, status: 'uploading' as const } : p
          )
        );

        const uploaded = await fileStorage.upload(file, (progress) => {
          setUploadProgress(prev => 
            prev.map((p, idx) => 
              idx === i ? { ...p, progress } : p
            )
          );
        });

        results.push(uploaded);

        setUploadProgress(prev => 
          prev.map((p, idx) => 
            idx === i ? { ...p, status: 'completed' as const, fileId: uploaded.id } : p
          )
        );
      }

      const newFiles = [...uploadedFiles, ...results];
      setUploadedFiles(newFiles);
      onChangeRef.current?.(newFiles);
    } catch {
      setError('Erreur lors de l\'upload');
    } finally {
      setIsUploading(false);
      setUploadProgress([]);
    }
  }, [maxFiles, uploadedFiles]);

  const handleRemove = useCallback((fileId: string) => {
    fileStorage.delete(fileId);
    const newFiles = uploadedFiles.filter(f => f.id !== fileId);
    setUploadedFiles(newFiles);
    onChangeRef.current?.(newFiles);
  }, [uploadedFiles]);

  const handleClearAll = useCallback(() => {
    uploadedFiles.forEach(f => fileStorage.delete(f.id));
    setUploadedFiles([]);
    onChangeRef.current?.([]);
  }, [uploadedFiles]);

  return (
    <div className={className}>
      <FileDropzone
        onFilesSelected={handleFilesSelected}
        accept={accept}
        maxFiles={maxFiles}
        disabled={isUploading}
        error={error}
        compact={compact}
      />

      {(uploadedFiles.length > 0 || uploadProgress.length > 0) && (
        <div className="mt-4">
          <FileList
            files={uploadedFiles}
            uploadProgress={uploadProgress}
            onRemove={handleRemove}
            onClearAll={uploadedFiles.length > 1 ? handleClearAll : undefined}
            variant={variant}
            showEmptyState={false}
          />
        </div>
      )}
    </div>
  );
}


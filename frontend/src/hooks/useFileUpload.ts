import { useState, useCallback } from 'react';
import { fileStorage } from '@/lib/fileStorage';
import type { UploadedFile, FileUploadProgress } from '@/types/file';
import { MAX_FILE_SIZE } from '@/types/file';

interface UseFileUploadOptions {
  maxFiles?: number;
  maxSize?: number;
  acceptedTypes?: string;
  entityType?: UploadedFile['entityType'];
  entityId?: string;
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const {
    maxFiles = 10,
    maxSize = MAX_FILE_SIZE,
    entityType,
    entityId,
  } = options;

  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > maxSize) {
      return `Le fichier "${file.name}" dépasse la taille maximale autorisée (${Math.round(maxSize / 1024 / 1024)}MB)`;
    }
    return null;
  }, [maxSize]);

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Vérifier le nombre de fichiers
    if (fileArray.length > maxFiles) {
      setError(`Maximum ${maxFiles} fichiers autorisés`);
      return [];
    }

    // Valider chaque fichier
    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return [];
      }
    }

    setError(null);
    setIsUploading(true);

    // Initialiser le progress pour chaque fichier
    const initialProgress: FileUploadProgress[] = fileArray.map((file, index) => ({
      fileId: `temp-${index}`,
      fileName: file.name,
      progress: 0,
      status: 'pending',
    }));
    setUploadProgress(initialProgress);

    const results: UploadedFile[] = [];

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        
        // Mettre à jour le status à "uploading"
        setUploadProgress(prev => 
          prev.map((p, idx) => 
            idx === i ? { ...p, status: 'uploading' } : p
          )
        );

        const uploaded = await fileStorage.upload(file, (progress) => {
          setUploadProgress(prev => 
            prev.map((p, idx) => 
              idx === i ? { ...p, progress } : p
            )
          );
        });

        // Associer à l'entité si spécifié
        if (entityType && entityId) {
          fileStorage.linkToEntity(uploaded.id, entityType, entityId);
        }

        results.push(uploaded);

        // Mettre à jour le status à "completed"
        setUploadProgress(prev => 
          prev.map((p, idx) => 
            idx === i ? { ...p, status: 'completed', fileId: uploaded.id } : p
          )
        );
      }

      setUploadedFiles(prev => [...prev, ...results]);
      return results;
    } catch (err) {
      setError('Erreur lors de l\'upload');
      setUploadProgress(prev => 
        prev.map(p => p.status === 'uploading' ? { ...p, status: 'error', error: 'Upload failed' } : p)
      );
      return [];
    } finally {
      setIsUploading(false);
    }
  }, [maxFiles, validateFile, entityType, entityId]);

  const removeFile = useCallback((fileId: string) => {
    fileStorage.delete(fileId);
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    setUploadProgress(prev => prev.filter(p => p.fileId !== fileId));
  }, []);

  const clearAll = useCallback(() => {
    uploadedFiles.forEach(f => fileStorage.delete(f.id));
    setUploadedFiles([]);
    setUploadProgress([]);
    setError(null);
  }, [uploadedFiles]);

  const loadEntityFiles = useCallback(() => {
    if (entityType && entityId) {
      const files = fileStorage.getByEntity(entityType, entityId);
      setUploadedFiles(files);
    }
  }, [entityType, entityId]);

  return {
    uploadFiles,
    uploadedFiles,
    uploadProgress,
    isUploading,
    error,
    removeFile,
    clearAll,
    loadEntityFiles,
    setUploadedFiles,
  };
}


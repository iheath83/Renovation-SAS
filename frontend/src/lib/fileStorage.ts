import type { UploadedFile } from '@/types/file';

const STORAGE_KEY = 'renovision_files';

function getFilesFromStorage(): UploadedFile[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveFilesToStorage(files: UploadedFile[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
  }
}

export const fileStorage = {
  /**
   * Simule l'upload d'un fichier vers le "cloud"
   * En production, ceci appellerait AWS S3 ou Cloudinary
   */
  async upload(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<UploadedFile> {
    return new Promise((resolve, reject) => {
      // Simuler le progress d'upload
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress > 100) progress = 100;
        onProgress?.(Math.floor(progress));
        
        if (progress >= 100) {
          clearInterval(interval);
          
          // Créer un URL local (data URL) pour la simulation
          const reader = new FileReader();
          reader.onloadend = () => {
            const uploadedFile: UploadedFile = {
              id: `file-${Date.now()}-${Math.random().toString(36).slice(2)}`,
              name: file.name,
              size: file.size,
              type: file.type,
              url: reader.result as string,
              thumbnailUrl: file.type.startsWith('image/') 
                ? reader.result as string 
                : undefined,
              createdAt: new Date().toISOString(),
            };
            
            // Sauvegarder dans localStorage
            const files = getFilesFromStorage();
            files.push(uploadedFile);
            saveFilesToStorage(files);
            
            resolve(uploadedFile);
          };
          reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
          reader.readAsDataURL(file);
        }
      }, 100);
    });
  },

  /**
   * Upload multiple files
   */
  async uploadMultiple(
    files: File[],
    onProgress?: (fileIndex: number, progress: number) => void
  ): Promise<UploadedFile[]> {
    const results: UploadedFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const uploaded = await this.upload(file, (progress) => {
        onProgress?.(i, progress);
      });
      results.push(uploaded);
    }
    
    return results;
  },

  /**
   * Récupérer tous les fichiers
   */
  getAll(): UploadedFile[] {
    return getFilesFromStorage();
  },

  /**
   * Récupérer les fichiers d'une entité
   */
  getByEntity(entityType: string, entityId: string): UploadedFile[] {
    const files = getFilesFromStorage();
    return files.filter(f => f.entityType === entityType && f.entityId === entityId);
  },

  /**
   * Récupérer un fichier par ID
   */
  getById(id: string): UploadedFile | undefined {
    const files = getFilesFromStorage();
    return files.find(f => f.id === id);
  },

  /**
   * Supprimer un fichier
   */
  delete(id: string): boolean {
    const files = getFilesFromStorage();
    const filtered = files.filter(f => f.id !== id);
    saveFilesToStorage(filtered);
    return filtered.length < files.length;
  },

  /**
   * Associer un fichier à une entité
   */
  linkToEntity(
    fileId: string,
    entityType: UploadedFile['entityType'],
    entityId: string
  ): UploadedFile | undefined {
    const files = getFilesFromStorage();
    const index = files.findIndex(f => f.id === fileId);
    
    if (index !== -1) {
      files[index] = { ...files[index], entityType, entityId };
      saveFilesToStorage(files);
      return files[index];
    }
    
    return undefined;
  },
};


export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  thumbnailUrl?: string;
  createdAt: string;
  entityType?: 'piece' | 'depense' | 'credit' | 'materiau' | 'idee';
  entityId?: string;
}

export interface FileUploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export type AcceptedFileType = 'image' | 'document' | 'all';

export const ACCEPTED_TYPES: Record<AcceptedFileType, string> = {
  image: 'image/jpeg,image/png,image/gif,image/webp',
  document: 'application/pdf,image/jpeg,image/png',
  all: 'image/*,application/pdf',
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getFileIcon(type: string): string {
  if (type.startsWith('image/')) return '🖼️';
  if (type === 'application/pdf') return '📄';
  return '📎';
}


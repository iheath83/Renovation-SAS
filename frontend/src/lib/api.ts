// Client API pour communiquer avec le backend

// @ts-expect-error Vite env
const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { message: string; code: string };
  pagination?: { nextCursor: string | null; hasMore: boolean };
}

class ApiClient {
  // Toujours lire depuis le localStorage pour éviter la désynchronisation
  private get accessToken(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  }

  private get refreshToken(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
  }

  setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  setProjetId(projetId: string) {
    localStorage.setItem('projetId', projetId);
  }

  getProjetId(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem('projetId') : null;
  }

  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('projetId');
  }

  isAuthenticated() {
    return !!this.accessToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_URL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      // Si token expiré, essayer de le refresh
      if (response.status === 401 && this.refreshToken) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Réessayer la requête
          (headers as Record<string, string>)['Authorization'] = `Bearer ${this.accessToken}`;
          const retryResponse = await fetch(url, { ...options, headers });
          return retryResponse.json();
        }
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        error: { message: 'Erreur de connexion au serveur', code: 'NETWORK_ERROR' },
      };
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.accessToken) {
          localStorage.setItem('accessToken', data.data.accessToken);
          // Sauvegarder aussi le nouveau refreshToken
          if (data.data.refreshToken) {
            localStorage.setItem('refreshToken', data.data.refreshToken);
          }
          return true;
        }
      }
      
      // Refresh échoué, déconnecter
      this.clearTokens();
      return false;
    } catch {
      this.clearTokens();
      return false;
    }
  }

  // === Auth ===
  async login(email: string, password: string) {
    const result = await this.request<{
      user: { id: string; email: string; name: string; role: string };
      accessToken: string;
      refreshToken: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (result.success && result.data) {
      this.setTokens(result.data.accessToken, result.data.refreshToken);
    }

    return result;
  }

  async register(name: string, email: string, password: string) {
    const result = await this.request<{
      user: { id: string; email: string; name: string; role: string };
      accessToken: string;
      refreshToken: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });

    if (result.success && result.data) {
      this.setTokens(result.data.accessToken, result.data.refreshToken);
    }

    return result;
  }

  async forgotPassword(email: string) {
    return this.request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    this.clearTokens();
  }

  async getMe() {
    return this.request<{ id: string; email: string; name: string; role: string }>('/auth/me');
  }

  // === Projets ===
  async getProjets() {
    return this.request<Array<{
      id: string;
      name: string;
      description: string | null;
      users: Array<{ role: string }>;
      _count: { pieces: number; taches: number };
    }>>('/projets');
  }

  async getProjet(id: string) {
    return this.request<{
      id: string;
      name: string;
      description: string | null;
    }>(`/projets/${id}`);
  }

  // === Pieces ===
  async getPieces(projetId?: string) {
    const pid = projetId || this.getProjetId();
    if (!pid) throw new Error('Projet ID required');
    return this.request<Array<{
      id: string;
      name: string;
      type: string;
      etage: number | null;
      surface: number | null;
      budget: number | null;
      statut: string;
      images: string[] | null;
      tags: string[];
      _count: { taches: number; materiaux: number; depenses: number };
    }>>(`/projets/${pid}/pieces`);
  }

  async createPiece(data: Record<string, unknown>, projetId?: string) {
    const pid = projetId || this.getProjetId();
    if (!pid) throw new Error('Projet ID required');
    return this.request(`/projets/${pid}/pieces`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePiece(pieceId: string, data: Record<string, unknown>, projetId?: string) {
    const pid = projetId || this.getProjetId();
    if (!pid) throw new Error('Projet ID required');
    return this.request(`/projets/${pid}/pieces/${pieceId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deletePiece(pieceId: string, projetId?: string) {
    const pid = projetId || this.getProjetId();
    if (!pid) throw new Error('Projet ID required');
    return this.request(`/projets/${pid}/pieces/${pieceId}`, {
      method: 'DELETE',
    });
  }

  // === Taches ===
  async getTaches(projetId?: string) {
    const pid = projetId || this.getProjetId();
    if (!pid) throw new Error('Projet ID required');
    return this.request<Array<{
      id: string;
      title: string;
      description: string | null;
      statut: string;
      priorite: string;
      dateDebut: string | null;
      dateFin: string | null;
      coutEstime: number | null;
      coutReel: number | null;
      pieceId: string | null;
      piece: { id: string; name: string } | null;
      sousTaches: Array<{ id: string; title: string; completed: boolean; ordre: number }>;
    }>>(`/projets/${pid}/taches`);
  }

  async createTache(data: Record<string, unknown>, projetId?: string) {
    const pid = projetId || this.getProjetId();
    if (!pid) throw new Error('Projet ID required');
    return this.request(`/projets/${pid}/taches`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTache(tacheId: string, data: Record<string, unknown>, projetId?: string) {
    const pid = projetId || this.getProjetId();
    if (!pid) throw new Error('Projet ID required');
    return this.request(`/projets/${pid}/taches/${tacheId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTache(tacheId: string, projetId?: string) {
    const pid = projetId || this.getProjetId();
    if (!pid) throw new Error('Projet ID required');
    return this.request(`/projets/${pid}/taches/${tacheId}`, {
      method: 'DELETE',
    });
  }

  async createSousTache(tacheId: string, data: Record<string, unknown>, projetId?: string) {
    const pid = projetId || this.getProjetId();
    if (!pid) throw new Error('Projet ID required');
    return this.request(`/projets/${pid}/taches/${tacheId}/sous-taches`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSousTache(tacheId: string, sousTacheId: string, data: Record<string, unknown>, projetId?: string) {
    const pid = projetId || this.getProjetId();
    if (!pid) throw new Error('Projet ID required');
    return this.request(`/projets/${pid}/taches/${tacheId}/sous-taches/${sousTacheId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // === Depenses ===
  async getDepenses(projetId?: string) {
    const pid = projetId || this.getProjetId();
    if (!pid) throw new Error('Projet ID required');
    return this.request<Array<{
      id: string;
      description: string | null;
      montant: number;
      categorie: string | null;
      fournisseur: string | null;
      dateDepense: string;
      factures: string[] | null;
      passeDansCredit: boolean;
      estPrevue: boolean;
      pieceId: string | null;
      tacheId: string | null;
      piece: { id: string; name: string } | null;
      tache: { id: string; title: string } | null;
      createdAt: string;
      updatedAt: string;
      deblocageId: string | null;
    }>>(`/projets/${pid}/depenses?limit=1000`);
  }

  async createDepense(data: Record<string, unknown>, projetId?: string) {
    const pid = projetId || this.getProjetId();
    if (!pid) throw new Error('Projet ID required');
    return this.request(`/projets/${pid}/depenses`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDepense(depenseId: string, data: Record<string, unknown>, projetId?: string) {
    const pid = projetId || this.getProjetId();
    if (!pid) throw new Error('Projet ID required');
    return this.request(`/projets/${pid}/depenses/${depenseId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteDepense(depenseId: string, projetId?: string) {
    const pid = projetId || this.getProjetId();
    if (!pid) throw new Error('Projet ID required');
    return this.request(`/projets/${pid}/depenses/${depenseId}`, {
      method: 'DELETE',
    });
  }

  // === Materiaux ===
  async getMateriaux(projetId?: string) {
    const pid = projetId || this.getProjetId();
    if (!pid) throw new Error('Projet ID required');
    return this.request<Array<{
      id: string;
      name: string;
      categorie: string;
      prixUnitaire: number | null;
      unite: string;
      reference: string | null;
      fournisseur: string | null;
      lienMarchand: string | null;
      image: string | null;
      notes: string | null;
    }>>(`/projets/${pid}/materiaux`);
  }

  async createMateriau(data: Record<string, unknown>, projetId?: string) {
    const pid = projetId || this.getProjetId();
    if (!pid) throw new Error('Projet ID required');
    return this.request(`/projets/${pid}/materiaux`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMateriau(materiauId: string, data: Record<string, unknown>, projetId?: string) {
    const pid = projetId || this.getProjetId();
    if (!pid) throw new Error('Projet ID required');
    return this.request(`/projets/${pid}/materiaux/${materiauId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteMateriau(materiauId: string, projetId?: string) {
    const pid = projetId || this.getProjetId();
    if (!pid) throw new Error('Projet ID required');
    return this.request(`/projets/${pid}/materiaux/${materiauId}`, {
      method: 'DELETE',
    });
  }

  // === Credits ===
  async getCredits(projetId?: string) {
    const pid = projetId || this.getProjetId();
    if (!pid) throw new Error('Projet ID required');
    return this.request(`/projets/${pid}/credits`);
  }

  async createCredit(data: Record<string, unknown>, projetId?: string) {
    const pid = projetId || this.getProjetId();
    if (!pid) throw new Error('Projet ID required');
    return this.request(`/projets/${pid}/credits`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCredit(creditId: string, data: Record<string, unknown>, projetId?: string) {
    const pid = projetId || this.getProjetId();
    if (!pid) throw new Error('Projet ID required');
    return this.request(`/projets/${pid}/credits/${creditId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCredit(creditId: string, projetId?: string) {
    const pid = projetId || this.getProjetId();
    if (!pid) throw new Error('Projet ID required');
    return this.request(`/projets/${pid}/credits/${creditId}`, {
      method: 'DELETE',
    });
  }

  async deleteDeblocage(creditId: string, deblocageId: string, projetId?: string) {
    const pid = projetId || this.getProjetId();
    if (!pid) throw new Error('Projet ID required');
    return this.request(`/projets/${pid}/credits/${creditId}/deblocages/${deblocageId}`, {
      method: 'DELETE',
    });
  }

  // === Deblocages ===
  async getDeblocages(creditId: string, projetId?: string) {
    const pid = projetId || this.getProjetId();
    if (!pid) throw new Error('Projet ID required');
    return this.request(`/projets/${pid}/credits/${creditId}/deblocages`);
  }

  async createDeblocage(creditId: string, data: Record<string, unknown>, projetId?: string) {
    const pid = projetId || this.getProjetId();
    if (!pid) throw new Error('Projet ID required');
    return this.request(`/projets/${pid}/credits/${creditId}/deblocages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // === Idees Pinterest ===
  async getIdees(projetId?: string) {
    const pid = projetId || this.getProjetId();
    if (!pid) throw new Error('Projet ID required');
    return this.request(`/projets/${pid}/idees`);
  }

  async createIdee(data: Record<string, unknown>, projetId?: string) {
    const pid = projetId || this.getProjetId();
    if (!pid) throw new Error('Projet ID required');
    return this.request(`/projets/${pid}/idees`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateIdee(ideeId: string, data: Record<string, unknown>, projetId?: string) {
    const pid = projetId || this.getProjetId();
    if (!pid) throw new Error('Projet ID required');
    return this.request(`/projets/${pid}/idees/${ideeId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteIdee(ideeId: string, projetId?: string) {
    const pid = projetId || this.getProjetId();
    if (!pid) throw new Error('Projet ID required');
    return this.request(`/projets/${pid}/idees/${ideeId}`, {
      method: 'DELETE',
    });
  }

  async getIdee(ideeId: string, projetId?: string) {
    const pid = projetId || this.getProjetId();
    if (!pid) throw new Error('Projet ID required');
    return this.request(`/projets/${pid}/idees/${ideeId}`);
  }

  async extractPinterestMetadata(url: string, projetId?: string) {
    const pid = projetId || this.getProjetId();
    if (!pid) throw new Error('Projet ID required');
    return this.request(`/projets/${pid}/idees/extract`, {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  }

  // === Moodboards ===
  async getMoodboards(projetId?: string) {
    const pid = projetId || this.getProjetId();
    if (!pid) throw new Error('Projet ID required');
    return this.request(`/projets/${pid}/moodboards`);
  }

  async createMoodboard(data: Record<string, unknown>, projetId?: string) {
    const pid = projetId || this.getProjetId();
    if (!pid) throw new Error('Projet ID required');
    return this.request(`/projets/${pid}/moodboards`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMoodboard(moodboardId: string, data: Record<string, unknown>, projetId?: string) {
    const pid = projetId || this.getProjetId();
    if (!pid) throw new Error('Projet ID required');
    return this.request(`/projets/${pid}/moodboards/${moodboardId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteMoodboard(moodboardId: string, projetId?: string) {
    const pid = projetId || this.getProjetId();
    if (!pid) throw new Error('Projet ID required');
    return this.request(`/projets/${pid}/moodboards/${moodboardId}`, {
      method: 'DELETE',
    });
  }

  async getMoodboard(moodboardId: string, projetId?: string) {
    const pid = projetId || this.getProjetId();
    if (!pid) throw new Error('Projet ID required');
    return this.request(`/projets/${pid}/moodboards/${moodboardId}`);
  }

  // === Comptes Bancaires ===
  async getComptesBancaires(projetId?: string) {
    const pid = projetId || this.getProjetId();
    if (!pid) throw new Error('Projet ID required');
    return this.request(`/comptes-bancaires/projets/${pid}/comptes-bancaires`);
  }

  async syncCompteBancaire(compteId: string) {
    return this.request(`/comptes-bancaires/${compteId}/sync`, {
      method: 'POST',
    });
  }

  async disconnectCompteBancaire(compteId: string) {
    return this.request(`/comptes-bancaires/${compteId}`, {
      method: 'DELETE',
    });
  }

  // === Transactions Bancaires ===
  async getTransactionsBancaires(projetId?: string, params?: { statut?: string; limit?: number; offset?: number }) {
    const pid = projetId || this.getProjetId();
    if (!pid) throw new Error('Projet ID required');
    
    const queryParams = new URLSearchParams();
    if (params?.statut) queryParams.append('statut', params.statut);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    const queryString = queryParams.toString();
    return this.request(`/transactions-bancaires/projets/${pid}/transactions${queryString ? `?${queryString}` : ''}`);
  }

  async getTransactionsBancairesStats(projetId?: string) {
    const pid = projetId || this.getProjetId();
    if (!pid) throw new Error('Projet ID required');
    return this.request(`/transactions-bancaires/projets/${pid}/transactions/stats`);
  }

  async convertTransactionToDepense(transactionId: string, data: {
    categorie?: string;
    pieceId?: string;
    tacheId?: string;
    materiauId?: string;
    passeDansCredit?: boolean;
  }) {
    return this.request(`/transactions-bancaires/${transactionId}/convert`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async ignoreTransaction(transactionId: string) {
    return this.request(`/transactions-bancaires/${transactionId}/ignore`, {
      method: 'PATCH',
    });
  }

  // === Settings ===
  
  // User settings
  async getUserSettings() {
    return this.request('/settings/user');
  }

  async updateUserSettings(data: Record<string, unknown>) {
    return this.request('/settings/user', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Projet settings
  async getProjetSettings(projetId?: string) {
    const pid = projetId || this.getProjetId();
    if (!pid) throw new Error('Projet ID required');
    return this.request(`/settings/projets/${pid}`);
  }

  async updateProjetSettings(projetId: string, data: Record<string, unknown>) {
    return this.request(`/settings/projets/${projetId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Categories custom
  async getCategories(projetId?: string, type?: string) {
    const pid = projetId || this.getProjetId();
    if (!pid) throw new Error('Projet ID required');
    const query = type ? `?type=${type}` : '';
    return this.request(`/settings/projets/${pid}/categories${query}`);
  }

  async createCategory(projetId: string, data: { type: string; nom: string; icon?: string; color?: string }) {
    return this.request(`/settings/projets/${projetId}/categories`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(categoryId: string, data: Record<string, unknown>) {
    return this.request(`/settings/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(categoryId: string) {
    return this.request(`/settings/categories/${categoryId}`, {
      method: 'DELETE',
    });
  }
}

// Instance singleton
export const api = new ApiClient();

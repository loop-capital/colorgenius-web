import type { Client } from '@/types';
import type { AnalysisResult } from '@/types';
import type { FormulationResult } from '@/types';

// Base API URL - in production this would be environment-specific
const API_BASE = '';

/**
 * Generic fetch helper with error handling
 */
async function fetcher<T>(input: RequestInfo, init?: RequestInit): Promise<{ data?: T; error?: { message: string } }> {
  try {
    const response = await fetch(`${API_BASE}${input}`, init);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error: {
          message: errorData.message || `HTTP ${response.status}: ${response.statusText}`
        }
      };
    }
    
    const data = await response.json();
    return { data };
  } catch (err) {
    return {
      error: {
        message: err instanceof Error ? err.message : 'Failed to fetch'
      }
    };
  }
}

/**
 * Client Management APIs
 */
export const getClientsApi = async (params: { 
  page?: number; 
  limit?: number; 
  search?: string; 
} = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page !== undefined) queryParams.append('page', params.page.toString());
  if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
  if (params.search) queryParams.append('search', params.search);
  
  const url = `/api/clients${queryParams.toString() ? `?${queryParams}` : ''}`;
  return fetcher<{ clients: Client[]; pagination: { total: number; total_pages: number; page: number; limit: number } }>(url);
};

export const createClientApi = async (client: Omit<Client, 'id' | 'created_at' | 'updated_at' | 'formulations' | 'lastVisit' | 'avgScore' | 'nextAppt'>) => {
  return fetcher<Client>('/api/clients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(client)
  });
};

export const updateClientApi = async (id: string, data: Partial<Client>) => {
  return fetcher<Client>(`/api/clients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
};

export const deleteClientApi = async (id: string) => {
  return fetcher<{ success: boolean }>(`/api/clients/${id}`, {
    method: 'DELETE'
  });
};

/**
 * Analysis APIs
 */
export const getAnalysisApi = async (id: string) => {
  return fetcher<AnalysisResult>(`/api/analyze/${id}`);
};

export interface FormulateRequest {
  current_level: number;
  current_tone: string;
  target_level: number;
  target_tone: string;
  service_type: string;
  gray_percentage: number;
  preferred_brand?: string;
  is_virgin: boolean;
  hair_condition: string;
  questionnaire: {
    has_metallic_dye: boolean;
    has_henna: boolean;
    is_post_chemo: boolean;
    recent_bleach: boolean;
  };
}

/**
 * Formulation APIs
 */
export const getFormulateApi = async (id: string) => {
  return fetcher<FormulationResult>(`/api/formulate/${id}`);
};

export const createFormulateApi = async (params: FormulateRequest) => {
  return fetcher<FormulationResult>('/api/formulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
};

/**
 * Color Library APIs
 */
export const getColorsApi = async () => {
  return fetcher<{ brands: Array<{ 
    id: string; 
    name: string; 
    slug: string; 
    product_lines: string[]; 
    levels_available: number[]; 
    color_count: number; 
  }>; total: number }>('/api/colors');
};

/**
 * Health Check API
 */
export const healthCheckApi = async () => {
  return fetcher<{ status: string; timestamp: string }>('/api/health');
};

export const registerApi = async (email: string, password: string) => {
  return fetcher<{ token: string; user: any }>('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
};

export const uploadPhotoApi = async (file: File) => {
  const formData = new FormData();
  formData.append('photo', file);
  return fetcher<{ url: string }>('/api/upload', {
    method: 'POST',
    body: formData
  });
};

export const analyzePhotoApi = async (photoUrl: string) => {
  return fetcher<any>('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ photo_url: photoUrl })
  });
};

export const getMe = async () => {
  return fetcher<any>('/api/auth/me');
};

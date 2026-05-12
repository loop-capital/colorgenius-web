export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface User {
  id: string;
  email: string;
  created_at: Date;
}

export interface Analysis {
  id: string;
  user_id: string;
  client_id?: string;
  photo_path?: string;
  photo_type?: string;
  level: number;
  tone: string;
  rgb: [number, number, number];
  confidence: number;
  created_at: Date;
}

export interface Formulation {
  id: string;
  user_id: string;
  analysis_id?: string;
  current_level: number;
  target_level: number;
  target_tone: string;
  brand: string;
  developer_volume: number;
  developer_time: number;
  formula_data: Record<string, unknown>;
  created_at: Date;
}

export interface ColorLine {
  id: string;
  brand: string;
  product_line: string;
  shade_code: string;
  shade_name: string;
  level: number;
  tone: string;
  rgb: [number, number, number];
  is_natural: boolean;
}

export interface Client {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  notes?: string;
  preferred_brand?: string;
  hair_type?: string;
  total_formulations?: number;
  last_formulation_at?: Date;
  created_at: Date;
  formulations?: ClientFormulation[];
}

export interface ClientFormulation {
  id: string;
  user_id: string;
  client_id?: string;
  analysis_id?: string;
  current_level?: number;
  current_tone?: string;
  target_level: number;
  target_tone: string;
  brand?: string;
  developer_volume?: number;
  developer_time?: number;
  formula_data?: Record<string, unknown>;
  created_at: Date;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'created_at'>;
}

export interface AnalyzeRequest {
  client_id?: string;
  photo_type?: string;
}

export interface AnalyzeResponse {
  analysis_id: string;
  level: number;
  tone: string;
  rgb: [number, number, number];
  confidence: number;
}

export interface FormulateRequest {
  current_level: number;
  target_level: number;
  tone: string;
  porosity?: string;
  hair_condition?: string;
  gray_percentage?: number;
  previous_color?: boolean;
  preferred_brand?: string;
}

export interface FormulateResponse {
  formula_id: string;
  shades: Array<{
    shade_code: string;
    shade_name: string;
    level: number;
    tone: string;
    grams: number;
    purpose: string;
  }>;
  developer_volume: number;
  developer_time: number;
  mixing_instructions: string;
  rationale?: string[];
  warnings?: string[];
  action_type?: string;
}

export interface ColorLineQuery {
  brand?: string;
  level?: number;
  tone?: string;
}

export interface HistoryQuery {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface PythonEngineResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
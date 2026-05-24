export interface SystemDesign {
  title: string;
  overview: string;
  services: Array<{ name: string; responsibility: string }>;
  database: string;
  api_design: string;
  scalability: string;
  security: string;
  caching: string;
  monitoring: string;
  deployment: string;
  mermaid_diagram: string;
}

export interface DesignHistoryItem {
  id: number;
  prompt: string;
  response: SystemDesign;
  created_at: string;
  user_id?: number | null;
}

export interface UserResponse {
  id: number;
  username: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

const getApiBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window === 'undefined') {
    return 'https://archonai-production.up.railway.app';
  }
  const hostname = window.location.hostname;
  const isLocal = 
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.startsWith('172.') ||
    hostname.endsWith('.local');
    
  return isLocal 
    ? `http://${hostname}:8000` 
    : 'https://archonai-production.up.railway.app';
};

const API_BASE_URL = getApiBaseUrl();



class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    let token: string | null = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('archon_auth_token');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        } as Record<string, string>
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json() as T;
    } catch (error) {
      console.error(`API Request to ${endpoint} failed:`, error);
      throw error;
    }
  }

  async signup(username: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async login(username: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async getMe(): Promise<UserResponse> {
    return this.request<UserResponse>('/auth/me');
  }

  async generateDesign(prompt: string): Promise<DesignHistoryItem> {
    return this.request<DesignHistoryItem>('/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  }

  async getHistory(): Promise<DesignHistoryItem[]> {
    return this.request<DesignHistoryItem[]>('/history');
  }

  async getHistoryItem(id: number | string): Promise<DesignHistoryItem> {
    return this.request<DesignHistoryItem>(`/history/${id}`);
  }
}

export const api = new ApiService();


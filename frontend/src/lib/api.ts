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
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      
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

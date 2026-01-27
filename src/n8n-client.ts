import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  N8nWorkflow,
  N8nWorkflowListItem,
  N8nExecution,
  N8nCredential,
} from './types/workflow.js';

export interface N8nClientConfig {
  apiUrl: string;
  apiKey: string;
}

export interface ApiResponse<T> {
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor?: string;
}

export class N8nApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'N8nApiError';
  }
}

export class N8nClient {
  private client: AxiosInstance;

  constructor(config: N8nClientConfig) {
    this.client = axios.create({
      baseURL: config.apiUrl,
      headers: {
        'X-N8N-API-KEY': config.apiKey,
        'Content-Type': 'application/json',
      },
    });
  }

  private handleError(error: unknown): never {
    if (error instanceof AxiosError) {
      throw new N8nApiError(
        error.response?.data?.message || error.message,
        error.response?.status,
        error.response?.data
      );
    }
    throw error;
  }

  // Workflow Operations

  async listWorkflows(): Promise<N8nWorkflowListItem[]> {
    try {
      const response = await this.client.get<PaginatedResponse<N8nWorkflowListItem>>('/workflows');
      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getWorkflow(id: string): Promise<N8nWorkflow> {
    try {
      const response = await this.client.get<N8nWorkflow>(`/workflows/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async createWorkflow(workflow: N8nWorkflow): Promise<N8nWorkflow> {
    try {
      const response = await this.client.post<N8nWorkflow>('/workflows', workflow);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateWorkflow(id: string, workflow: Partial<N8nWorkflow>): Promise<N8nWorkflow> {
    try {
      const response = await this.client.put<N8nWorkflow>(`/workflows/${id}`, workflow);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteWorkflow(id: string): Promise<void> {
    try {
      await this.client.delete(`/workflows/${id}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  async activateWorkflow(id: string): Promise<N8nWorkflow> {
    try {
      const response = await this.client.post<N8nWorkflow>(`/workflows/${id}/activate`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async deactivateWorkflow(id: string): Promise<N8nWorkflow> {
    try {
      const response = await this.client.post<N8nWorkflow>(`/workflows/${id}/deactivate`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Execution Operations

  async listExecutions(workflowId?: string): Promise<N8nExecution[]> {
    try {
      const params = workflowId ? { workflowId } : {};
      const response = await this.client.get<PaginatedResponse<N8nExecution>>('/executions', { params });
      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getExecution(id: string): Promise<N8nExecution> {
    try {
      const response = await this.client.get<N8nExecution>(`/executions/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteExecution(id: string): Promise<void> {
    try {
      await this.client.delete(`/executions/${id}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Credential Operations

  async listCredentials(): Promise<N8nCredential[]> {
    try {
      const response = await this.client.get<PaginatedResponse<N8nCredential>>('/credentials');
      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Utility Methods

  async testConnection(): Promise<boolean> {
    try {
      await this.listWorkflows();
      return true;
    } catch {
      return false;
    }
  }

  async executeWorkflow(id: string, data?: Record<string, unknown>): Promise<N8nExecution> {
    try {
      const response = await this.client.post<N8nExecution>(`/workflows/${id}/run`, data || {});
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
}

export function createN8nClient(config?: Partial<N8nClientConfig>): N8nClient {
  const apiUrl = config?.apiUrl || process.env.N8N_API_URL || 'http://localhost:5678/api/v1';
  const apiKey = config?.apiKey || process.env.N8N_API_KEY || '';

  if (!apiKey) {
    throw new Error('N8N_API_KEY is required. Set it in .env or pass it to createN8nClient()');
  }

  return new N8nClient({ apiUrl, apiKey });
}

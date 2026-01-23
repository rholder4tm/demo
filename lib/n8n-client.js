/**
 * N8n API Client
 * Handles all interactions with the N8n API
 */

import dotenv from 'dotenv';
dotenv.config();

export class N8nClient {
  constructor(baseUrl = process.env.N8N_BASE_URL, apiKey = process.env.N8N_API_KEY) {
    if (!baseUrl || !apiKey) {
      throw new Error('N8N_BASE_URL and N8N_API_KEY must be set in .env file');
    }

    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = apiKey;
    this.headers = {
      'X-N8N-API-KEY': this.apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  /**
   * Make a request to the N8n API
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}/api/v1${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`N8n API Error (${response.status}): ${errorText}`);
      }

      return response.json();
    } catch (error) {
      if (error.cause) {
        throw new Error(`Network error connecting to N8n: ${error.message} - ${error.cause.message}`);
      }
      throw error;
    }
  }

  /**
   * Get all workflows
   */
  async getWorkflows() {
    return this.request('/workflows');
  }

  /**
   * Get a specific workflow by ID
   */
  async getWorkflow(workflowId) {
    return this.request(`/workflows/${workflowId}`);
  }

  /**
   * Create a new workflow
   */
  async createWorkflow(workflow) {
    return this.request('/workflows', {
      method: 'POST',
      body: JSON.stringify(workflow)
    });
  }

  /**
   * Update an existing workflow
   */
  async updateWorkflow(workflowId, workflow) {
    return this.request(`/workflows/${workflowId}`, {
      method: 'PUT',
      body: JSON.stringify(workflow)
    });
  }

  /**
   * Delete a workflow
   */
  async deleteWorkflow(workflowId) {
    return this.request(`/workflows/${workflowId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Activate a workflow
   */
  async activateWorkflow(workflowId) {
    return this.request(`/workflows/${workflowId}/activate`, {
      method: 'POST'
    });
  }

  /**
   * Deactivate a workflow
   */
  async deactivateWorkflow(workflowId) {
    return this.request(`/workflows/${workflowId}/deactivate`, {
      method: 'POST'
    });
  }

  /**
   * Get executions for a workflow
   */
  async getExecutions(workflowId = null, options = {}) {
    const params = new URLSearchParams();

    if (workflowId) {
      params.append('workflowId', workflowId);
    }

    if (options.limit) {
      params.append('limit', options.limit);
    }

    if (options.status) {
      params.append('status', options.status);
    }

    const queryString = params.toString();
    const endpoint = `/executions${queryString ? `?${queryString}` : ''}`;

    return this.request(endpoint);
  }

  /**
   * Get a specific execution by ID
   */
  async getExecution(executionId) {
    return this.request(`/executions/${executionId}`);
  }

  /**
   * Get failed executions for a workflow
   */
  async getFailedExecutions(workflowId = null, limit = 10) {
    return this.getExecutions(workflowId, { status: 'error', limit });
  }

  /**
   * Test the connection to N8n
   */
  async testConnection() {
    try {
      await this.getWorkflows();
      return { success: true, message: 'Connected to N8n successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

export default N8nClient;

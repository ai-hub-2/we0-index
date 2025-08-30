import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { io, Socket } from 'socket.io-client';
import { z } from 'zod';

// Types and schemas
export interface RapidToolsConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface ToolConfig {
  id?: string;
  name: string;
  description?: string;
  type: 'calculator' | 'form' | 'chart' | 'code' | 'custom';
  components: ToolComponent[];
  code?: string;
  settings?: {
    theme?: 'light' | 'dark';
    layout?: 'vertical' | 'horizontal' | 'grid';
    responsive?: boolean;
    public?: boolean;
  };
}

export interface ToolComponent {
  id?: string;
  type: 'input' | 'select' | 'button' | 'display' | 'chart' | 'form' | 'custom';
  label: string;
  placeholder?: string;
  options?: string[];
  formula?: string;
  validation?: any;
  style?: any;
}

export interface DeploymentConfig {
  toolId: string;
  domain?: string;
  subdomain?: string;
  config?: any;
}

export interface CollaborationConfig {
  toolId: string;
  userId: string;
  role: 'owner' | 'editor' | 'viewer';
}

// Validation schemas
const ToolConfigSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['calculator', 'form', 'chart', 'code', 'custom']),
  components: z.array(z.object({
    type: z.enum(['input', 'select', 'button', 'display', 'chart', 'form', 'custom']),
    label: z.string(),
    placeholder: z.string().optional(),
    options: z.array(z.string()).optional(),
    formula: z.string().optional(),
    validation: z.any().optional(),
    style: z.any().optional()
  })),
  code: z.string().optional(),
  settings: z.object({
    theme: z.enum(['light', 'dark']).optional(),
    layout: z.enum(['vertical', 'horizontal', 'grid']).optional(),
    responsive: z.boolean().optional(),
    public: z.boolean().optional()
  }).optional()
});

const DeploymentConfigSchema = z.object({
  toolId: z.string(),
  domain: z.string().optional(),
  subdomain: z.string().optional(),
  config: z.any().optional()
});

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface Tool {
  id: string;
  name: string;
  description?: string;
  type: string;
  config: any;
  code?: string;
  isPublic: boolean;
  isPublished: boolean;
  version: number;
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
}

export interface Deployment {
  id: string;
  toolId: string;
  domain?: string;
  subdomain?: string;
  status: 'pending' | 'building' | 'deployed' | 'failed' | 'cancelled';
  config: any;
  createdAt: string;
  updatedAt: string;
  deployedAt?: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  isVerified: boolean;
  isActive: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// Main SDK class
export class RapidTools {
  private config: Required<RapidToolsConfig>;
  private client: AxiosInstance;
  private socket?: Socket;

  constructor(config: RapidToolsConfig = {}) {
    this.config = {
      apiKey: config.apiKey || '',
      baseUrl: config.baseUrl || 'https://api.rapidtools.com',
      timeout: config.timeout || 30000,
      headers: config.headers || {}
    };

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...this.config.headers,
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
      }
    });

    // Add request interceptor for authentication
    this.client.interceptors.request.use(
      (config) => {
        if (this.config.apiKey) {
          config.headers.Authorization = `Bearer ${this.config.apiKey}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          throw new Error('Authentication failed. Please check your API key.');
        }
        if (error.response?.status === 403) {
          throw new Error('Access denied. You do not have permission to perform this action.');
        }
        if (error.response?.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        throw error;
      }
    );
  }

  // Authentication
  async authenticate(email: string, password: string): Promise<{ token: string; user: User }> {
    const response = await this.client.post<ApiResponse<{ token: string; user: User }>>('/auth/login', {
      email,
      password
    });
    return response.data.data;
  }

  async register(userData: {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<{ token: string; user: User }> {
    const response = await this.client.post<ApiResponse<{ token: string; user: User }>>('/auth/register', userData);
    return response.data.data;
  }

  setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
    this.client.defaults.headers.Authorization = `Bearer ${apiKey}`;
  }

  // Tools API
  async createTool(toolConfig: ToolConfig): Promise<Tool> {
    const validatedConfig = ToolConfigSchema.parse(toolConfig);
    const response = await this.client.post<ApiResponse<Tool>>('/tools', validatedConfig);
    return response.data.data;
  }

  async getTool(id: string): Promise<Tool> {
    const response = await this.client.get<ApiResponse<Tool>>(`/tools/${id}`);
    return response.data.data;
  }

  async updateTool(id: string, toolConfig: Partial<ToolConfig>): Promise<Tool> {
    const response = await this.client.put<ApiResponse<Tool>>(`/tools/${id}`, toolConfig);
    return response.data.data;
  }

  async deleteTool(id: string): Promise<void> {
    await this.client.delete(`/tools/${id}`);
  }

  async listTools(params?: {
    page?: number;
    limit?: number;
    type?: string;
    author?: string;
    public?: boolean;
  }): Promise<{ tools: Tool[]; total: number; page: number; limit: number }> {
    const response = await this.client.get<ApiResponse<{ tools: Tool[]; total: number; page: number; limit: number }>>('/tools', { params });
    return response.data.data;
  }

  async publishTool(id: string): Promise<Tool> {
    const response = await this.client.post<ApiResponse<Tool>>(`/tools/${id}/publish`);
    return response.data.data;
  }

  async unpublishTool(id: string): Promise<Tool> {
    const response = await this.client.post<ApiResponse<Tool>>(`/tools/${id}/unpublish`);
    return response.data.data;
  }

  // Deployments API
  async createDeployment(deploymentConfig: DeploymentConfig): Promise<Deployment> {
    const validatedConfig = DeploymentConfigSchema.parse(deploymentConfig);
    const response = await this.client.post<ApiResponse<Deployment>>('/deployments', validatedConfig);
    return response.data.data;
  }

  async getDeployment(id: string): Promise<Deployment> {
    const response = await this.client.get<ApiResponse<Deployment>>(`/deployments/${id}`);
    return response.data.data;
  }

  async listDeployments(toolId?: string): Promise<Deployment[]> {
    const params = toolId ? { toolId } : {};
    const response = await this.client.get<ApiResponse<Deployment[]>>('/deployments', { params });
    return response.data.data;
  }

  async deleteDeployment(id: string): Promise<void> {
    await this.client.delete(`/deployments/${id}`);
  }

  // Collaboration API
  async addCollaborator(collaborationConfig: CollaborationConfig): Promise<void> {
    await this.client.post('/collaborations', collaborationConfig);
  }

  async removeCollaborator(toolId: string, userId: string): Promise<void> {
    await this.client.delete(`/collaborations/${toolId}/users/${userId}`);
  }

  async listCollaborators(toolId: string): Promise<User[]> {
    const response = await this.client.get<ApiResponse<User[]>>(`/collaborations/${toolId}/users`);
    return response.data.data;
  }

  // Real-time collaboration
  connectToTool(toolId: string, onUpdate?: (data: any) => void): Socket {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(this.config.baseUrl, {
      auth: {
        token: this.config.apiKey
      },
      query: {
        toolId
      }
    });

    this.socket.on('connect', () => {
      console.log('Connected to RapidTools real-time collaboration');
    });

    this.socket.on('tool:update', (data) => {
      if (onUpdate) {
        onUpdate(data);
      }
    });

    this.socket.on('user:joined', (user) => {
      console.log(`User ${user.username} joined the collaboration`);
    });

    this.socket.on('user:left', (user) => {
      console.log(`User ${user.username} left the collaboration`);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from RapidTools real-time collaboration');
    });

    return this.socket;
  }

  disconnectFromTool(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = undefined;
    }
  }

  // User API
  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<ApiResponse<User>>('/users/me');
    return response.data.data;
  }

  async updateUser(userData: Partial<User>): Promise<User> {
    const response = await this.client.put<ApiResponse<User>>('/users/me', userData);
    return response.data.data;
  }

  async getUser(id: string): Promise<User> {
    const response = await this.client.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data;
  }

  // Analytics API
  async getToolAnalytics(toolId: string, period: 'day' | 'week' | 'month' = 'week'): Promise<any> {
    const response = await this.client.get<ApiResponse<any>>(`/analytics/tools/${toolId}`, {
      params: { period }
    });
    return response.data.data;
  }

  // Utility methods
  async healthCheck(): Promise<{ status: string; timestamp: string; uptime: number }> {
    const response = await this.client.get<ApiResponse<{ status: string; timestamp: string; uptime: number }>>('/health');
    return response.data.data;
  }

  // Webhook management
  async createWebhook(webhookData: {
    name: string;
    url: string;
    events: string[];
  }): Promise<any> {
    const response = await this.client.post<ApiResponse<any>>('/webhooks', webhookData);
    return response.data.data;
  }

  async listWebhooks(): Promise<any[]> {
    const response = await this.client.get<ApiResponse<any[]>>('/webhooks');
    return response.data.data;
  }

  async deleteWebhook(id: string): Promise<void> {
    await this.client.delete(`/webhooks/${id}`);
  }
}

// Export default instance
export default RapidTools;

// Export types
export type {
  RapidToolsConfig,
  ToolConfig,
  ToolComponent,
  DeploymentConfig,
  CollaborationConfig,
  ApiResponse,
  Tool,
  Deployment,
  User
};
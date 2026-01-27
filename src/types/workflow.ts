// n8n Workflow Types based on n8n's workflow schema

export interface N8nNodeCredentials {
  [credentialType: string]: {
    id: string;
    name: string;
  };
}

export interface N8nNodeParameters {
  [key: string]: unknown;
}

export interface N8nNodePosition {
  x: number;
  y: number;
}

export interface N8nNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: N8nNodeParameters;
  credentials?: N8nNodeCredentials;
  disabled?: boolean;
  notes?: string;
  notesInFlow?: boolean;
  webhookId?: string;
}

export interface N8nConnection {
  node: string;
  type: string;
  index: number;
}

export interface N8nConnections {
  [nodeName: string]: {
    [outputType: string]: N8nConnection[][];
  };
}

export interface N8nWorkflowSettings {
  saveDataErrorExecution?: 'all' | 'none';
  saveDataSuccessExecution?: 'all' | 'none';
  saveManualExecutions?: boolean;
  saveExecutionProgress?: boolean;
  executionTimeout?: number;
  errorWorkflow?: string;
  timezone?: string;
}

export interface N8nWorkflow {
  id?: string;
  name: string;
  nodes: N8nNode[];
  connections: N8nConnections;
  active?: boolean;
  settings?: N8nWorkflowSettings;
  staticData?: Record<string, unknown>;
  tags?: string[];
  pinData?: Record<string, unknown>;
  versionId?: string;
  meta?: {
    instanceId?: string;
  };
}

export interface N8nWorkflowListItem {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  tags?: { id: string; name: string }[];
}

export interface N8nExecution {
  id: string;
  finished: boolean;
  mode: string;
  startedAt: string;
  stoppedAt?: string;
  workflowId: string;
  workflowData: N8nWorkflow;
  data?: {
    resultData: {
      runData: Record<string, unknown>;
    };
  };
  status: 'success' | 'error' | 'waiting' | 'running';
}

export interface N8nCredential {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

// Common node types for quick reference
export type CommonNodeTypes =
  | 'n8n-nodes-base.webhook'
  | 'n8n-nodes-base.httpRequest'
  | 'n8n-nodes-base.code'
  | 'n8n-nodes-base.if'
  | 'n8n-nodes-base.switch'
  | 'n8n-nodes-base.merge'
  | 'n8n-nodes-base.set'
  | 'n8n-nodes-base.noOp'
  | 'n8n-nodes-base.respondToWebhook'
  | 'n8n-nodes-base.emailSend'
  | 'n8n-nodes-base.slack'
  | 'n8n-nodes-base.discord'
  | 'n8n-nodes-base.telegram'
  | 'n8n-nodes-base.googleSheets'
  | 'n8n-nodes-base.postgres'
  | 'n8n-nodes-base.mysql'
  | 'n8n-nodes-base.mongodb'
  | 'n8n-nodes-base.redis'
  | 'n8n-nodes-base.manualTrigger'
  | 'n8n-nodes-base.scheduleTrigger'
  | 'n8n-nodes-base.errorTrigger';

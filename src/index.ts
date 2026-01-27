// n8n Workflow Builder - Claude Code Integration
// Main entry point for programmatic usage

export { N8nClient, createN8nClient, N8nApiError } from './n8n-client.js';
export type { N8nClientConfig } from './n8n-client.js';

export { WorkflowBuilder, createWorkflow } from './workflow-builder.js';
export type { NodeConfig, ConnectionConfig } from './workflow-builder.js';

export {
  templates,
  listTemplates,
  createFromTemplate,
  webhookResponseTemplate,
  scheduledHttpRequestTemplate,
  conditionalProcessingTemplate,
  apiIntegrationTemplate,
  dataSyncTemplate,
  slackNotificationTemplate,
} from './templates/index.js';
export type { TemplateName, TemplateConfig } from './templates/index.js';

export type {
  N8nWorkflow,
  N8nNode,
  N8nConnections,
  N8nNodeParameters,
  N8nWorkflowSettings,
  N8nExecution,
  N8nCredential,
  CommonNodeTypes,
} from './types/workflow.js';

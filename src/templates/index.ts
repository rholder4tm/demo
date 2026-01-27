import { createWorkflow, WorkflowBuilder } from '../workflow-builder.js';
import type { N8nWorkflow } from '../types/workflow.js';

export interface TemplateConfig {
  name?: string;
  [key: string]: unknown;
}

// Template: Simple Webhook that responds with JSON
export function webhookResponseTemplate(config: TemplateConfig = {}): N8nWorkflow {
  const name = config.name || 'Webhook Response';

  return createWorkflow(name)
    .addWebhookTrigger('Webhook', {
      path: (config.path as string) || 'webhook',
      method: (config.method as string) || 'POST',
      responseMode: 'responseNode',
    })
    .addSet('Process Data', [
      { name: 'message', value: 'Webhook received successfully' },
      { name: 'timestamp', value: '={{ $now.toISO() }}' },
    ])
    .addRespondToWebhook('Respond', {
      responseBody: { success: true },
    })
    .connect({ from: 'Webhook', to: 'Process Data' })
    .connect({ from: 'Process Data', to: 'Respond' })
    .build();
}

// Template: Scheduled HTTP Request
export function scheduledHttpRequestTemplate(config: TemplateConfig = {}): N8nWorkflow {
  const name = config.name || 'Scheduled HTTP Request';

  return createWorkflow(name)
    .addScheduleTrigger('Schedule', {
      cronExpression: (config.cron as string) || '0 * * * *', // Every hour
    })
    .addHttpRequest('Fetch Data', {
      url: (config.url as string) || 'https://api.example.com/data',
      method: (config.method as string) || 'GET',
    })
    .addCode('Process Response', `
// Process the fetched data
const items = $input.all();
const processed = items.map(item => ({
  json: {
    ...item.json,
    processedAt: new Date().toISOString(),
  }
}));
return processed;
    `)
    .connect({ from: 'Schedule', to: 'Fetch Data' })
    .connect({ from: 'Fetch Data', to: 'Process Response' })
    .build();
}

// Template: Conditional Processing
export function conditionalProcessingTemplate(config: TemplateConfig = {}): N8nWorkflow {
  const name = config.name || 'Conditional Processing';

  return createWorkflow(name)
    .addManualTrigger('Start')
    .addIf('Check Condition', {
      value1: '={{ $json.status }}',
      operation: 'equals',
      value2: 'active',
    })
    .addSet('Handle Active', [
      { name: 'result', value: 'Item is active' },
    ])
    .addSet('Handle Inactive', [
      { name: 'result', value: 'Item is inactive' },
    ])
    .connect({ from: 'Start', to: 'Check Condition' })
    .connect({ from: 'Check Condition', to: 'Handle Active', fromOutput: 0 })
    .connect({ from: 'Check Condition', to: 'Handle Inactive', fromOutput: 1 })
    .build();
}

// Template: API Integration with Error Handling
export function apiIntegrationTemplate(config: TemplateConfig = {}): N8nWorkflow {
  const name = config.name || 'API Integration';

  const builder = createWorkflow(name)
    .addWebhookTrigger('Webhook', {
      path: 'api-integration',
      method: 'POST',
      responseMode: 'responseNode',
    })
    .addHttpRequest('Call External API', {
      url: (config.apiUrl as string) || 'https://api.example.com/endpoint',
      method: 'POST',
    })
    .addCode('Transform Response', `
const items = $input.all();
return items.map(item => ({
  json: {
    success: true,
    data: item.json,
    timestamp: new Date().toISOString(),
  }
}));
    `)
    .addRespondToWebhook('Send Response', {
      responseBody: { success: true },
    })
    .connect({ from: 'Webhook', to: 'Call External API' })
    .connect({ from: 'Call External API', to: 'Transform Response' })
    .connect({ from: 'Transform Response', to: 'Send Response' });

  return builder.build();
}

// Template: Data Sync Workflow
export function dataSyncTemplate(config: TemplateConfig = {}): N8nWorkflow {
  const name = config.name || 'Data Sync';

  return createWorkflow(name)
    .addScheduleTrigger('Schedule', {
      cronExpression: (config.cron as string) || '0 0 * * *', // Daily at midnight
    })
    .addHttpRequest('Fetch Source Data', {
      url: (config.sourceUrl as string) || 'https://source-api.example.com/data',
      method: 'GET',
    })
    .addCode('Transform Data', `
const items = $input.all();
return items.map(item => ({
  json: {
    // Transform the data for the destination
    id: item.json.id,
    name: item.json.name,
    syncedAt: new Date().toISOString(),
  }
}));
    `)
    .addHttpRequest('Push to Destination', {
      url: (config.destUrl as string) || 'https://dest-api.example.com/sync',
      method: 'POST',
    })
    .connect({ from: 'Schedule', to: 'Fetch Source Data' })
    .connect({ from: 'Fetch Source Data', to: 'Transform Data' })
    .connect({ from: 'Transform Data', to: 'Push to Destination' })
    .build();
}

// Template: Slack Notification
export function slackNotificationTemplate(config: TemplateConfig = {}): N8nWorkflow {
  const name = config.name || 'Slack Notification';

  return createWorkflow(name)
    .addWebhookTrigger('Webhook', {
      path: 'notify',
      method: 'POST',
      responseMode: 'onReceived',
    })
    .addSlack('Send Slack Message', {
      channel: (config.channel as string) || '#general',
      text: (config.message as string) || 'New notification: {{ $json.message }}',
    })
    .connect({ from: 'Webhook', to: 'Send Slack Message' })
    .build();
}

// Export all templates
export const templates = {
  webhookResponse: webhookResponseTemplate,
  scheduledHttpRequest: scheduledHttpRequestTemplate,
  conditionalProcessing: conditionalProcessingTemplate,
  apiIntegration: apiIntegrationTemplate,
  dataSync: dataSyncTemplate,
  slackNotification: slackNotificationTemplate,
};

export type TemplateName = keyof typeof templates;

export function listTemplates(): string[] {
  return Object.keys(templates);
}

export function createFromTemplate(
  templateName: TemplateName,
  config: TemplateConfig = {}
): N8nWorkflow {
  const template = templates[templateName];
  if (!template) {
    throw new Error(`Unknown template: ${templateName}`);
  }
  return template(config);
}

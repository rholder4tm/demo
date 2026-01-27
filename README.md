# n8n Workflow Builder

A Node.js tool for designing and deploying n8n workflows programmatically, designed for integration with Claude Code.

## Features

- **n8n API Client**: Full CRUD operations for workflows, executions, and credentials
- **Workflow Builder**: Fluent API for constructing n8n workflows programmatically
- **Templates**: Pre-built workflow templates for common patterns
- **CLI**: Command-line interface for managing workflows

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env`:
```
N8N_API_URL=http://localhost:5678/api/v1
N8N_API_KEY=your-n8n-api-key
```

To get your n8n API key:
1. Open n8n settings
2. Go to API section
3. Generate a new API key

## Usage

### CLI Commands

```bash
# Test connection
npm run cli -- test-connection

# List all workflows
npm run cli -- list

# Get workflow details
npm run cli -- get <workflow-id>

# List available templates
npm run cli -- templates

# Create from template and deploy
npm run cli -- create-from-template webhookResponse --name "My Webhook" --deploy

# Deploy workflow from file
npm run cli -- deploy workflow.json --activate

# Activate/deactivate workflows
npm run cli -- activate <workflow-id>
npm run cli -- deactivate <workflow-id>

# Execute a workflow
npm run cli -- execute <workflow-id> --data '{"key": "value"}'

# Export workflow to file
npm run cli -- export <workflow-id> -o workflow.json

# Delete a workflow
npm run cli -- delete <workflow-id> --force
```

### Programmatic Usage

```typescript
import { createN8nClient, createWorkflow } from 'n8n-workflow-builder';

// Create n8n client
const client = createN8nClient({
  apiUrl: 'http://localhost:5678/api/v1',
  apiKey: 'your-api-key'
});

// Build a workflow programmatically
const workflow = createWorkflow('My API Workflow')
  .addWebhookTrigger('Webhook', {
    path: 'my-endpoint',
    method: 'POST'
  })
  .addCode('Process Data', `
    const items = $input.all();
    return items.map(item => ({
      json: { processed: true, data: item.json }
    }));
  `)
  .addHttpRequest('Call External API', {
    url: 'https://api.example.com/endpoint',
    method: 'POST'
  })
  .addRespondToWebhook('Respond')
  .connect({ from: 'Webhook', to: 'Process Data' })
  .connect({ from: 'Process Data', to: 'Call External API' })
  .connect({ from: 'Call External API', to: 'Respond' })
  .build();

// Deploy to n8n
const created = await client.createWorkflow(workflow);
console.log('Created workflow:', created.id);

// Activate
await client.activateWorkflow(created.id);
```

### Using Templates

```typescript
import { createFromTemplate, templates } from 'n8n-workflow-builder';

// List available templates
// - webhookResponse
// - scheduledHttpRequest
// - conditionalProcessing
// - apiIntegration
// - dataSync
// - slackNotification

// Create from template
const workflow = createFromTemplate('webhookResponse', {
  name: 'My Custom Webhook',
  path: 'custom-path',
  method: 'POST'
});
```

## Available Node Builders

The `WorkflowBuilder` provides convenience methods for common nodes:

| Method | n8n Node Type |
|--------|---------------|
| `addManualTrigger()` | Manual Trigger |
| `addWebhookTrigger()` | Webhook |
| `addScheduleTrigger()` | Schedule Trigger |
| `addHttpRequest()` | HTTP Request |
| `addCode()` | Code |
| `addIf()` | IF |
| `addSet()` | Set |
| `addRespondToWebhook()` | Respond to Webhook |
| `addSlack()` | Slack |
| `addNoOp()` | No Operation |

For other nodes, use `addNode()` with full configuration:

```typescript
builder.addNode({
  name: 'My Custom Node',
  type: 'n8n-nodes-base.someNode',
  typeVersion: 1,
  parameters: { /* node parameters */ },
  credentials: { /* if needed */ }
});
```

## Claude Code Integration

This tool is designed to work with Claude Code. Ask Claude to:

1. **Design workflows**: Describe what you want to automate
2. **Generate workflow code**: Claude can create `WorkflowBuilder` code
3. **Deploy to n8n**: Use the CLI or API to push workflows

Example prompt:
> "Create an n8n workflow that receives webhooks, validates the data, calls an external API, and sends a Slack notification on success"

## Project Structure

```
src/
├── cli.ts              # CLI interface
├── index.ts            # Main exports
├── n8n-client.ts       # n8n API client
├── workflow-builder.ts # Workflow construction utilities
├── types/
│   └── workflow.ts     # TypeScript type definitions
└── templates/
    └── index.ts        # Pre-built workflow templates
```

## Development

```bash
# Build
npm run build

# Run in development
npm run dev

# Run CLI in development
npm run cli -- <command>

# Lint
npm run lint

# Test
npm run test
```

## License

MIT

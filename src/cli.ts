#!/usr/bin/env node

import { Command } from 'commander';
import { config } from 'dotenv';
import { createN8nClient, N8nApiError } from './n8n-client.js';
import { createWorkflow } from './workflow-builder.js';
import { templates, listTemplates, createFromTemplate, TemplateName } from './templates/index.js';
import type { N8nWorkflow } from './types/workflow.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';

// Load environment variables
config();

const program = new Command();

program
  .name('n8n-workflow')
  .description('CLI tool for managing n8n workflows with Claude Code')
  .version('1.0.0');

// Test connection command
program
  .command('test-connection')
  .description('Test connection to n8n instance')
  .action(async () => {
    try {
      const client = createN8nClient();
      const connected = await client.testConnection();
      if (connected) {
        console.log('Successfully connected to n8n!');
      } else {
        console.error('Failed to connect to n8n');
        process.exit(1);
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// List workflows command
program
  .command('list')
  .description('List all workflows in n8n')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    try {
      const client = createN8nClient();
      const workflows = await client.listWorkflows();

      if (options.json) {
        console.log(JSON.stringify(workflows, null, 2));
      } else {
        console.log('\nWorkflows:');
        console.log('─'.repeat(60));
        for (const wf of workflows) {
          const status = wf.active ? '✓ Active' : '○ Inactive';
          console.log(`[${wf.id}] ${wf.name} (${status})`);
        }
        console.log(`\nTotal: ${workflows.length} workflows`);
      }
    } catch (error) {
      handleError(error);
    }
  });

// Get workflow command
program
  .command('get <id>')
  .description('Get a workflow by ID')
  .option('--json', 'Output as JSON')
  .option('-o, --output <file>', 'Save to file')
  .action(async (id, options) => {
    try {
      const client = createN8nClient();
      const workflow = await client.getWorkflow(id);

      const output = JSON.stringify(workflow, null, 2);

      if (options.output) {
        writeFileSync(options.output, output);
        console.log(`Workflow saved to ${options.output}`);
      } else if (options.json) {
        console.log(output);
      } else {
        console.log(`\nWorkflow: ${workflow.name}`);
        console.log(`ID: ${workflow.id}`);
        console.log(`Active: ${workflow.active}`);
        console.log(`Nodes: ${workflow.nodes.length}`);
        console.log('\nNode list:');
        for (const node of workflow.nodes) {
          console.log(`  - ${node.name} (${node.type})`);
        }
      }
    } catch (error) {
      handleError(error);
    }
  });

// Create workflow from template
program
  .command('create-from-template <template>')
  .description('Create a workflow from a template')
  .option('-n, --name <name>', 'Workflow name')
  .option('--deploy', 'Deploy to n8n immediately')
  .option('--activate', 'Activate after deployment')
  .option('-o, --output <file>', 'Save workflow JSON to file')
  .option('--config <json>', 'Template configuration as JSON')
  .action(async (templateName, options) => {
    try {
      const availableTemplates = listTemplates();
      if (!availableTemplates.includes(templateName)) {
        console.error(`Unknown template: ${templateName}`);
        console.log(`Available templates: ${availableTemplates.join(', ')}`);
        process.exit(1);
      }

      const templateConfig: Record<string, unknown> = options.config
        ? JSON.parse(options.config)
        : {};

      if (options.name) {
        templateConfig.name = options.name;
      }

      const workflow = createFromTemplate(templateName as TemplateName, templateConfig);

      if (options.output) {
        writeFileSync(options.output, JSON.stringify(workflow, null, 2));
        console.log(`Workflow saved to ${options.output}`);
      }

      if (options.deploy) {
        const client = createN8nClient();
        const created = await client.createWorkflow(workflow);
        console.log(`Workflow created with ID: ${created.id}`);

        if (options.activate && created.id) {
          await client.activateWorkflow(created.id);
          console.log('Workflow activated');
        }
      } else if (!options.output) {
        console.log(JSON.stringify(workflow, null, 2));
      }
    } catch (error) {
      handleError(error);
    }
  });

// List available templates
program
  .command('templates')
  .description('List available workflow templates')
  .action(() => {
    console.log('\nAvailable Templates:');
    console.log('─'.repeat(40));
    const templateList = listTemplates();
    for (const name of templateList) {
      console.log(`  - ${name}`);
    }
    console.log(`\nUse: n8n-workflow create-from-template <template>`);
  });

// Deploy workflow from file
program
  .command('deploy <file>')
  .description('Deploy a workflow from a JSON file')
  .option('--activate', 'Activate after deployment')
  .option('--update <id>', 'Update existing workflow instead of creating new')
  .action(async (file, options) => {
    try {
      if (!existsSync(file)) {
        console.error(`File not found: ${file}`);
        process.exit(1);
      }

      const content = readFileSync(file, 'utf-8');
      const workflow: N8nWorkflow = JSON.parse(content);
      const client = createN8nClient();

      let result: N8nWorkflow;

      if (options.update) {
        result = await client.updateWorkflow(options.update, workflow);
        console.log(`Workflow updated: ${result.id}`);
      } else {
        result = await client.createWorkflow(workflow);
        console.log(`Workflow created: ${result.id}`);
      }

      if (options.activate && result.id) {
        await client.activateWorkflow(result.id);
        console.log('Workflow activated');
      }
    } catch (error) {
      handleError(error);
    }
  });

// Delete workflow
program
  .command('delete <id>')
  .description('Delete a workflow')
  .option('--force', 'Skip confirmation')
  .action(async (id, options) => {
    try {
      const client = createN8nClient();

      if (!options.force) {
        const workflow = await client.getWorkflow(id);
        console.log(`About to delete: ${workflow.name} (${id})`);
        console.log('Use --force to skip this confirmation');
        process.exit(0);
      }

      await client.deleteWorkflow(id);
      console.log(`Workflow ${id} deleted`);
    } catch (error) {
      handleError(error);
    }
  });

// Activate/Deactivate workflow
program
  .command('activate <id>')
  .description('Activate a workflow')
  .action(async (id) => {
    try {
      const client = createN8nClient();
      await client.activateWorkflow(id);
      console.log(`Workflow ${id} activated`);
    } catch (error) {
      handleError(error);
    }
  });

program
  .command('deactivate <id>')
  .description('Deactivate a workflow')
  .action(async (id) => {
    try {
      const client = createN8nClient();
      await client.deactivateWorkflow(id);
      console.log(`Workflow ${id} deactivated`);
    } catch (error) {
      handleError(error);
    }
  });

// Execute workflow
program
  .command('execute <id>')
  .description('Execute a workflow')
  .option('--data <json>', 'Input data as JSON')
  .action(async (id, options) => {
    try {
      const client = createN8nClient();
      const data = options.data ? JSON.parse(options.data) : undefined;
      const execution = await client.executeWorkflow(id, data);
      console.log(`Execution started: ${execution.id}`);
      console.log(`Status: ${execution.status}`);
    } catch (error) {
      handleError(error);
    }
  });

// List executions
program
  .command('executions')
  .description('List workflow executions')
  .option('-w, --workflow <id>', 'Filter by workflow ID')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    try {
      const client = createN8nClient();
      const executions = await client.listExecutions(options.workflow);

      if (options.json) {
        console.log(JSON.stringify(executions, null, 2));
      } else {
        console.log('\nExecutions:');
        console.log('─'.repeat(60));
        for (const exec of executions.slice(0, 20)) {
          const status = exec.status === 'success' ? '✓' : exec.status === 'error' ? '✗' : '○';
          console.log(`[${exec.id}] ${status} ${exec.workflowId} - ${exec.startedAt}`);
        }
      }
    } catch (error) {
      handleError(error);
    }
  });

// List credentials
program
  .command('credentials')
  .description('List available credentials')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    try {
      const client = createN8nClient();
      const credentials = await client.listCredentials();

      if (options.json) {
        console.log(JSON.stringify(credentials, null, 2));
      } else {
        console.log('\nCredentials:');
        console.log('─'.repeat(60));
        for (const cred of credentials) {
          console.log(`[${cred.id}] ${cred.name} (${cred.type})`);
        }
        console.log(`\nTotal: ${credentials.length} credentials`);
      }
    } catch (error) {
      handleError(error);
    }
  });

// Export workflow
program
  .command('export <id>')
  .description('Export a workflow to JSON file')
  .requiredOption('-o, --output <file>', 'Output file path')
  .action(async (id, options) => {
    try {
      const client = createN8nClient();
      const workflow = await client.getWorkflow(id);

      // Remove instance-specific data for portability
      const exportWorkflow = {
        ...workflow,
        id: undefined,
        versionId: undefined,
        meta: undefined,
      };

      writeFileSync(options.output, JSON.stringify(exportWorkflow, null, 2));
      console.log(`Workflow exported to ${options.output}`);
    } catch (error) {
      handleError(error);
    }
  });

function handleError(error: unknown): never {
  if (error instanceof N8nApiError) {
    console.error(`n8n API Error (${error.statusCode}): ${error.message}`);
  } else if (error instanceof Error) {
    console.error(`Error: ${error.message}`);
  } else {
    console.error('Unknown error:', error);
  }
  process.exit(1);
}

program.parse();

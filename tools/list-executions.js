#!/usr/bin/env node

/**
 * List recent workflow executions
 */

import { N8nClient } from '../lib/n8n-client.js';

async function listExecutions() {
  try {
    const client = new N8nClient();

    const workflowId = process.argv[2];
    const limit = parseInt(process.argv[3]) || 20;

    console.log('🔍 Fetching recent executions...\n');

    const response = await client.getExecutions(workflowId, { limit });
    const executions = response.data || response;

    if (!executions || executions.length === 0) {
      console.log('No executions found.');
      return;
    }

    console.log(`Found ${executions.length} execution(s):\n`);

    executions.forEach((execution, index) => {
      const statusIcon = execution.status === 'success' ? '✅' :
                         execution.status === 'error' ? '❌' :
                         execution.status === 'running' ? '🔄' : '⏸️';

      console.log(`${index + 1}. ${statusIcon} ${execution.status.toUpperCase()}`);
      console.log(`   Execution ID: ${execution.id}`);
      console.log(`   Workflow ID: ${execution.workflowId}`);
      console.log(`   Started: ${execution.startedAt || 'Unknown'}`);
      console.log(`   Finished: ${execution.stoppedAt || 'N/A'}`);

      if (execution.status === 'error') {
        console.log(`   ⚠️  Error detected - use 'npm run n8n:diagnose ${execution.id}' for details`);
      }

      console.log('');
    });

    const errorCount = executions.filter(e => e.status === 'error').length;
    if (errorCount > 0) {
      console.log(`⚠️  ${errorCount} execution(s) failed. Run 'npm run n8n:diagnose' for error analysis.`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

listExecutions();

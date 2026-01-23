#!/usr/bin/env node

/**
 * Diagnose errors from failed N8n executions
 * Provides detailed error analysis to help Claude Code fix issues
 */

import { N8nClient } from '../lib/n8n-client.js';

function formatError(execution) {
  console.log('═'.repeat(80));
  console.log(`❌ EXECUTION ERROR - ID: ${execution.id}`);
  console.log('═'.repeat(80));

  console.log(`\nWorkflow ID: ${execution.workflowId}`);
  console.log(`Status: ${execution.status}`);
  console.log(`Started: ${execution.startedAt}`);
  console.log(`Stopped: ${execution.stoppedAt || 'N/A'}`);

  console.log('\n📊 EXECUTION DATA:');
  console.log('-'.repeat(80));

  if (execution.data) {
    const { resultData } = execution.data;

    if (resultData && resultData.error) {
      console.log('\n🔴 ERROR DETAILS:');
      console.log(`Message: ${resultData.error.message || 'No message'}`);
      console.log(`Type: ${resultData.error.name || 'Unknown'}`);

      if (resultData.error.stack) {
        console.log('\nStack Trace:');
        console.log(resultData.error.stack);
      }

      if (resultData.error.description) {
        console.log('\nDescription:');
        console.log(resultData.error.description);
      }

      if (resultData.error.context) {
        console.log('\nContext:');
        console.log(JSON.stringify(resultData.error.context, null, 2));
      }
    }

    // Check for errors in individual nodes
    if (resultData && resultData.runData) {
      console.log('\n📍 NODE EXECUTION DETAILS:');
      for (const [nodeName, nodeData] of Object.entries(resultData.runData)) {
        if (Array.isArray(nodeData) && nodeData.length > 0) {
          const lastRun = nodeData[nodeData.length - 1];

          if (lastRun.error) {
            console.log(`\n  ❌ Node: ${nodeName}`);
            console.log(`     Error: ${lastRun.error.message}`);

            if (lastRun.error.description) {
              console.log(`     Description: ${lastRun.error.description}`);
            }

            if (lastRun.error.httpCode) {
              console.log(`     HTTP Code: ${lastRun.error.httpCode}`);
            }
          } else {
            console.log(`\n  ✅ Node: ${nodeName}`);
            console.log(`     Items: ${lastRun.data?.main?.[0]?.length || 0}`);
          }
        }
      }
    }
  }

  console.log('\n' + '═'.repeat(80) + '\n');
}

async function diagnoseErrors() {
  try {
    const client = new N8nClient();

    const executionId = process.argv[2];
    const workflowId = process.argv[3];

    console.log('🔍 Diagnosing N8n errors...\n');

    if (executionId) {
      // Diagnose a specific execution
      console.log(`Fetching execution ${executionId}...\n`);
      const execution = await client.getExecution(executionId);
      formatError(execution);
    } else {
      // Get recent failed executions
      const limit = 10;
      console.log(`Fetching last ${limit} failed executions...\n`);

      const response = await client.getFailedExecutions(workflowId, limit);
      const executions = response.data || response;

      if (!executions || executions.length === 0) {
        console.log('✅ No failed executions found!');
        return;
      }

      console.log(`Found ${executions.length} failed execution(s)\n`);

      for (const executionSummary of executions) {
        // Get full execution details
        const execution = await client.getExecution(executionSummary.id);
        formatError(execution);
      }

      console.log('\n💡 TROUBLESHOOTING TIPS:');
      console.log('─'.repeat(80));
      console.log('1. Review the error messages and stack traces above');
      console.log('2. Check which nodes failed in the execution');
      console.log('3. Verify API credentials and endpoints in the workflow');
      console.log('4. Pull the workflow locally: npm run n8n:pull');
      console.log('5. Ask Claude Code to analyze and fix the workflow');
      console.log('6. Push the fixed workflow: npm run n8n:push <workflow-file>');
      console.log('─'.repeat(80));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

diagnoseErrors();

#!/usr/bin/env node

/**
 * List all workflows from N8n instance
 */

import { N8nClient } from '../lib/n8n-client.js';

async function listWorkflows() {
  try {
    const client = new N8nClient();

    console.log('🔍 Fetching workflows from N8n...\n');

    const response = await client.getWorkflows();
    const workflows = response.data || response;

    if (!workflows || workflows.length === 0) {
      console.log('No workflows found.');
      return;
    }

    console.log(`Found ${workflows.length} workflow(s):\n`);

    workflows.forEach((workflow, index) => {
      console.log(`${index + 1}. ${workflow.name}`);
      console.log(`   ID: ${workflow.id}`);
      console.log(`   Active: ${workflow.active ? '✅ Yes' : '❌ No'}`);
      console.log(`   Nodes: ${workflow.nodes?.length || 0}`);
      console.log(`   Updated: ${workflow.updatedAt || 'Unknown'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

listWorkflows();

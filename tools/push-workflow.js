#!/usr/bin/env node

/**
 * Push a local workflow file to N8n (create or update)
 */

import { N8nClient } from '../lib/n8n-client.js';
import fs from 'fs/promises';
import path from 'path';

async function pushWorkflow() {
  try {
    const workflowFile = process.argv[2];

    if (!workflowFile) {
      console.error('Usage: npm run n8n:push <workflow-file.json>');
      console.error('Example: npm run n8n:push n8n-workflows/my-workflow-123.json');
      process.exit(1);
    }

    const client = new N8nClient();

    console.log(`📤 Reading workflow from ${workflowFile}...\n`);

    // Read the workflow file
    const workflowContent = await fs.readFile(workflowFile, 'utf-8');
    const workflow = JSON.parse(workflowContent);

    // Check if workflow has an ID (update) or not (create)
    if (workflow.id) {
      console.log(`🔄 Updating existing workflow: ${workflow.name} (ID: ${workflow.id})`);

      const updated = await client.updateWorkflow(workflow.id, workflow);
      console.log(`✅ Successfully updated workflow: ${updated.name}`);
      console.log(`   ID: ${updated.id}`);
      console.log(`   Active: ${updated.active ? '✅ Yes' : '❌ No'}`);
    } else {
      console.log(`➕ Creating new workflow: ${workflow.name}`);

      const created = await client.createWorkflow(workflow);
      console.log(`✅ Successfully created workflow: ${created.name}`);
      console.log(`   ID: ${created.id}`);
      console.log(`   Active: ${created.active ? '✅ Yes' : '❌ No'}`);

      // Update the local file with the new ID
      workflow.id = created.id;
      await fs.writeFile(
        workflowFile,
        JSON.stringify(workflow, null, 2),
        'utf-8'
      );
      console.log(`\n📝 Updated local file with workflow ID: ${created.id}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

pushWorkflow();

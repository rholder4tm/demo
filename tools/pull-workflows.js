#!/usr/bin/env node

/**
 * Pull workflows from N8n and save them as local JSON files
 */

import { N8nClient } from '../lib/n8n-client.js';
import fs from 'fs/promises';
import path from 'path';

const WORKFLOWS_DIR = path.join(process.cwd(), 'n8n-workflows');

async function pullWorkflows() {
  try {
    const client = new N8nClient();

    console.log('🔍 Fetching workflows from N8n...\n');

    const response = await client.getWorkflows();
    const workflows = response.data || response;

    if (!workflows || workflows.length === 0) {
      console.log('No workflows found.');
      return;
    }

    // Ensure workflows directory exists
    await fs.mkdir(WORKFLOWS_DIR, { recursive: true });

    console.log(`Found ${workflows.length} workflow(s). Pulling...\n`);

    for (const workflowSummary of workflows) {
      // Get full workflow details
      const workflow = await client.getWorkflow(workflowSummary.id);

      // Create a safe filename from workflow name
      const safeName = workflow.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const filename = `${safeName}-${workflow.id}.json`;
      const filepath = path.join(WORKFLOWS_DIR, filename);

      // Save workflow to file
      await fs.writeFile(
        filepath,
        JSON.stringify(workflow, null, 2),
        'utf-8'
      );

      console.log(`✅ ${workflow.name} → ${filename}`);
    }

    console.log(`\n✨ Successfully pulled ${workflows.length} workflow(s) to ${WORKFLOWS_DIR}`);

    // Create an index file
    const index = workflows.map(w => ({
      id: w.id,
      name: w.name,
      active: w.active,
      filename: `${w.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}-${w.id}.json`
    }));

    await fs.writeFile(
      path.join(WORKFLOWS_DIR, 'index.json'),
      JSON.stringify(index, null, 2),
      'utf-8'
    );

    console.log(`📋 Created index at ${path.join(WORKFLOWS_DIR, 'index.json')}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

pullWorkflows();

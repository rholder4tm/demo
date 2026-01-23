# N8n + Claude Code Integration

A tight integration between Claude Code and N8n that eliminates copy/paste workflows. Manage, edit, and debug N8n workflows directly from your codebase with version control.

## Features

- **Pull workflows** from N8n to local JSON files
- **Edit workflows** in your IDE with Claude Code's help
- **Push workflows** back to N8n without copy/paste
- **Diagnose errors** from failed executions with detailed analysis
- **Version control** your N8n workflows with Git
- **List workflows** and executions directly from CLI

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure N8n Connection

Copy `.env.example` to `.env` and add your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your N8n details:
```bash
N8N_BASE_URL=https://your-instance.app.n8n.cloud
N8N_API_KEY=your_api_key_here
```

**Getting your N8n API Key:**
1. Log into your N8n instance
2. Go to Settings > API
3. Create a new API key
4. Copy the key to your `.env` file

### 3. Test Connection

```bash
npm run n8n:list
```

If configured correctly, you'll see a list of your N8n workflows.

## Usage

### List All Workflows

See all workflows in your N8n instance:

```bash
npm run n8n:list
```

Output:
```
Found 3 workflow(s):

1. Customer Onboarding
   ID: 123
   Active: ✅ Yes
   Nodes: 8
   Updated: 2026-01-23T10:30:00.000Z

2. Data Sync to Database
   ID: 124
   Active: ❌ No
   Nodes: 5
   Updated: 2026-01-22T15:45:00.000Z
```

### Pull Workflows from N8n

Download all workflows to local JSON files:

```bash
npm run n8n:pull
```

This creates:
- `n8n-workflows/` directory with all workflow JSON files
- `n8n-workflows/index.json` with a summary of all workflows

Files are named: `{workflow-name}-{id}.json`

Example:
```
n8n-workflows/
├── customer-onboarding-123.json
├── data-sync-to-database-124.json
├── slack-notifications-125.json
└── index.json
```

### Edit Workflows with Claude Code

Once pulled, you can:

1. **Ask Claude Code to analyze a workflow:**
   ```
   "Analyze n8n-workflows/customer-onboarding-123.json and explain what it does"
   ```

2. **Ask Claude Code to fix issues:**
   ```
   "The webhook node in customer-onboarding-123.json is failing. Can you fix it?"
   ```

3. **Ask Claude Code to add features:**
   ```
   "Add a Slack notification to data-sync-to-database-124.json when the sync completes"
   ```

4. **Ask Claude Code to create new workflows:**
   ```
   "Create a new N8n workflow that monitors GitHub issues and posts to Slack"
   ```

### Push Workflows to N8n

After editing a workflow locally, push it back to N8n:

```bash
npm run n8n:push n8n-workflows/customer-onboarding-123.json
```

This will:
- **Update** the workflow if it has an ID
- **Create** a new workflow if it doesn't have an ID
- Update the local file with the new ID (for new workflows)

### List Recent Executions

See recent workflow executions:

```bash
# All workflows (last 20)
npm run n8n:executions

# Specific workflow
npm run n8n:executions 123

# Specific workflow with limit
npm run n8n:executions 123 50
```

Output:
```
Found 5 execution(s):

1. ✅ SUCCESS
   Execution ID: 789
   Workflow ID: 123
   Started: 2026-01-23T10:30:00.000Z
   Finished: 2026-01-23T10:30:05.000Z

2. ❌ ERROR
   Execution ID: 788
   Workflow ID: 123
   Started: 2026-01-23T09:15:00.000Z
   Finished: 2026-01-23T09:15:03.000Z
   ⚠️  Error detected - use 'npm run n8n:diagnose 788' for details
```

### Diagnose Errors

When a workflow fails, get detailed error information:

```bash
# Diagnose a specific execution
npm run n8n:diagnose 788

# Get last 10 failed executions
npm run n8n:diagnose

# Get failed executions for specific workflow
npm run n8n:diagnose "" 123
```

The diagnostic output includes:
- Execution timeline
- Error messages and stack traces
- Which nodes succeeded/failed
- Input/output data for debugging
- Suggested troubleshooting steps

Example output:
```
════════════════════════════════════════════════════════════════════════════════
❌ EXECUTION ERROR - ID: 788
════════════════════════════════════════════════════════════════════════════════

Workflow ID: 123
Status: error
Started: 2026-01-23T09:15:00.000Z
Stopped: 2026-01-23T09:15:03.000Z

📊 EXECUTION DATA:
────────────────────────────────────────────────────────────────────────────────

🔴 ERROR DETAILS:
Message: Request failed with status code 401
Type: AxiosError

📍 NODE EXECUTION DETAILS:

  ✅ Node: Webhook
     Items: 1

  ✅ Node: Set Variables
     Items: 1

  ❌ Node: HTTP Request
     Error: Request failed with status code 401
     Description: Unauthorized - Check your API credentials
     HTTP Code: 401
```

### Version Control Your Workflows

With workflows as JSON files, you can:

1. **Commit workflows to Git:**
   ```bash
   git add n8n-workflows/
   git commit -m "feat(n8n): add customer onboarding workflow"
   ```

2. **Track changes:**
   ```bash
   git diff n8n-workflows/customer-onboarding-123.json
   ```

3. **Review history:**
   ```bash
   git log n8n-workflows/customer-onboarding-123.json
   ```

4. **Create branches for workflow development:**
   ```bash
   git checkout -b feature/improve-onboarding
   # Edit workflows with Claude Code
   npm run n8n:push n8n-workflows/customer-onboarding-123.json
   git commit -am "feat(n8n): improve onboarding workflow error handling"
   ```

## Workflow with Claude Code

Here's the recommended workflow for managing N8n with Claude Code:

### Creating a New Workflow

1. **Ask Claude Code to create it:**
   ```
   "Create an N8n workflow that fetches GitHub issues and posts them to Slack daily"
   ```

2. **Push to N8n:**
   ```bash
   npm run n8n:push n8n-workflows/github-to-slack.json
   ```

3. **Commit to Git:**
   ```bash
   git add n8n-workflows/github-to-slack-*.json
   git commit -m "feat(n8n): add GitHub to Slack sync workflow"
   ```

### Fixing a Broken Workflow

1. **Check for errors:**
   ```bash
   npm run n8n:executions
   npm run n8n:diagnose 788  # Use the failed execution ID
   ```

2. **Pull the workflow:**
   ```bash
   npm run n8n:pull
   ```

3. **Ask Claude Code to fix it:**
   ```
   "The HTTP Request node in customer-onboarding-123.json is getting a 401 error.
   The diagnose output shows it's an auth issue. Can you fix it?"
   ```

4. **Push the fix:**
   ```bash
   npm run n8n:push n8n-workflows/customer-onboarding-123.json
   ```

5. **Commit the fix:**
   ```bash
   git add n8n-workflows/customer-onboarding-123.json
   git commit -m "fix(n8n): resolve auth issue in customer onboarding workflow"
   ```

### Improving an Existing Workflow

1. **Pull current workflows:**
   ```bash
   npm run n8n:pull
   ```

2. **Ask Claude Code for improvements:**
   ```
   "Review data-sync-to-database-124.json and suggest improvements for
   error handling and retry logic"
   ```

3. **Apply improvements:**
   ```
   "Add the retry logic and error notifications you suggested"
   ```

4. **Push and commit:**
   ```bash
   npm run n8n:push n8n-workflows/data-sync-to-database-124.json
   git add n8n-workflows/data-sync-to-database-124.json
   git commit -m "feat(n8n): add retry logic and error notifications to data sync"
   ```

## Tips for Working with Claude Code

### Be Specific
Instead of: "Fix my workflow"
Say: "The Slack node in n8n-workflows/notifications-123.json is failing with a channel_not_found error"

### Provide Context
Copy error output from `npm run n8n:diagnose` when asking Claude Code to fix issues.

### Request Explanations
```
"Explain what each node does in customer-onboarding-123.json"
"Why would the HTTP Request node return a 401 error?"
```

### Iterate on Workflows
```
"Add error handling to all HTTP Request nodes in this workflow"
"Add a condition to check if the email field exists before sending"
"Create a Slack notification when this workflow fails"
```

### Create from Scratch
```
"Create an N8n workflow that:
1. Triggers on webhook
2. Validates the incoming data
3. Stores it in a database
4. Sends a confirmation email
5. Posts to Slack on error"
```

## Project Structure

```
/home/user/demo/
├── n8n-workflows/          # Your N8n workflows as JSON files
│   ├── index.json          # Index of all workflows
│   └── *.json              # Individual workflow files
├── lib/
│   └── n8n-client.js       # N8n API client library
├── tools/                  # CLI tools
│   ├── list-workflows.js   # List all workflows
│   ├── pull-workflows.js   # Pull workflows from N8n
│   ├── push-workflow.js    # Push workflow to N8n
│   ├── list-executions.js  # List recent executions
│   └── diagnose-errors.js  # Diagnose failed executions
├── .env                    # Your N8n credentials (gitignored)
├── .env.example            # Environment template
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

## Troubleshooting

### "N8N_BASE_URL and N8N_API_KEY must be set"

Make sure you've created a `.env` file with your credentials:
```bash
cp .env.example .env
# Edit .env with your actual values
```

### "N8n API Error (401): Unauthorized"

Your API key is invalid or expired. Get a new one from N8n Settings > API.

### "N8n API Error (404): Not Found"

Check your `N8N_BASE_URL` in `.env`. It should be your N8n instance URL without trailing slash:
```
N8N_BASE_URL=https://fourtm.app.n8n.cloud
```

### Workflow pushed but not visible in N8n

The push was successful, but you may need to refresh your N8n browser tab.

### Cannot find workflow file

Make sure you've run `npm run n8n:pull` first to download workflows.

## Security Notes

- **Never commit `.env`** - It's in `.gitignore` for a reason
- **API keys are sensitive** - Treat them like passwords
- **Review workflows before pushing** - Especially if they contain credentials
- **Use N8n's credential system** - Don't hardcode API keys in workflows

## Advanced Usage

### Programmatic Access

You can use the N8n client library in your own scripts:

```javascript
import { N8nClient } from './lib/n8n-client.js';

const client = new N8nClient();

// Get all workflows
const workflows = await client.getWorkflows();

// Get specific workflow
const workflow = await client.getWorkflow('123');

// Update workflow
await client.updateWorkflow('123', modifiedWorkflow);

// Get failed executions
const failed = await client.getFailedExecutions('123', 10);
```

### Automation Ideas

Create custom scripts for:
- Automated workflow backups to Git
- Daily error reports
- Workflow testing and validation
- Bulk workflow updates
- Custom deployment pipelines

## Contributing

This integration is part of your Claude Code workspace. Feel free to:
- Modify tools to fit your workflow
- Add new CLI commands
- Extend the N8n client library
- Improve error diagnostics

## Support

For issues with:
- **This integration**: Ask Claude Code to help fix or improve it
- **N8n itself**: Check [N8n documentation](https://docs.n8n.io/)
- **N8n API**: See [N8n API docs](https://docs.n8n.io/api/)
- **Claude Code**: Run `/help` or visit [Claude Code docs](https://github.com/anthropics/claude-code)

---

**Happy automating with N8n and Claude Code!** 🚀

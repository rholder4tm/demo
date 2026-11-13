# Cloud Move Inventory: portable prompt

Paste everything below the line as the first message of a Claude Code session started in the root of your newPKA folder (the folder that holds `AGENTS.md`).

---

I want to find out which parts of my newPKA setup could run in the cloud, so they keep working when this computer is off. This session only collects facts. Nothing gets moved or changed today.

## Ground rules

1. **Read only.** Do not create, edit, move or delete anything in this folder or on this computer. The one exception is the final inventory file in step 4, and only after I approve where it goes. If a team rule (session log, task file, Larry's routing) would make you write something, ask me first.
2. **Don't guess.** If you can't confirm something from a file or from my answer, write `UNKNOWN` and add it to the open questions. Don't fill gaps with what myPKA "usually" does. Read what is actually here.
3. **No secret values.** Write down the *name* of each credential, API key or login an item needs, never its value. Don't print the contents of `.env` files, keychains or tokens.
4. **One question at a time.** In the interview, ask one question, wait for my answer, then ask the next. Use plain language and no jargon.
5. **Ask before running commands** that look outside this folder (for example, the OS scheduler or the user-level Claude settings). Tell me what each one does before you run it.

## Step 1: Scan this folder (read only)

Read and summarize the following. For each item, give the file path you got it from.

- `VERSION`, `.mypka/VERSION` and `.mypka/manifest.json`: which myPKA version this is, and whether it's a customized copy (my setup is called newPKA).
- One folder or two: whether `.mypka/sources.yaml` exists, and if it does, which content folder it points to.
- Folder location: the full path of this folder, and whether it sits inside a synced folder (Egnyte, OneDrive, Dropbox, iCloud, Google Drive) or a Git repository (`git status`, `git remote -v`).
- Agents: every agent in `06 AI Team/Agents/` and `06 AI Team/Agents/agent-index.md`, with a one-line role for each. Flag any I added myself, meaning anything not in the stock myPKA list.
- Procedures: every SOP, Workstream and Skill in `06 AI Team/AI Team Knowledge/` and `.claude/skills/`. Flag the ones I added myself.
- Scripts: every script in `06 AI Team/AI Team Knowledge/Scripts/`, with what it needs to run (Python version, packages, local paths, other programs).
- Hooks: every hook in `.claude/settings.json`, `.claude/settings.local.json`, `.codex/hooks.json` and `.gemini/settings.json`.
- MCP servers: every server in `.mcp.json`. For each one, say whether it is remote (`type: http` with a URL) or runs on this computer (a `command`).
- Expansions: the output of `python3 "06 AI Team/AI Team Knowledge/Scripts/expansion-pack.py" list` (on Windows, `py -3` instead of `python3`). This script only reads, but confirm that with me before you run it.
- Obsidian: the plugins in `.obsidian/plugins/` and the community plugins that are switched on in `.obsidian/community-plugins.json`.
- Usage: from `06 AI Team/AI Team Knowledge/Session Logs/` and `06 AI Team/AI Team Knowledge/Tasks/`, which agents, SOPs and skills I actually use, and roughly how often. Count them; don't estimate.

Then ask my permission to check these, one at a time:

- User-level Claude Code settings and MCP servers (`~/.claude/settings.json`, `~/.claude.json`, `~/.claude/skills/`, `~/.claude/agents/`). Report names and types only.
- OS scheduled jobs that touch this folder or run AI work: `crontab -l` and `launchctl list` on macOS, `crontab -l` and `systemctl --user list-timers` on Linux, `schtasks /query /fo LIST` on Windows. Only report the ones that relate to newPKA, Claude or automation.
- Other local automation tools I might use with newPKA (for example, a local n8n, Keyboard Maestro, Power Automate, Hazel, AutoHotkey). Ask me instead of scanning for them.

Show me the scan results as a numbered list of items before moving on.

## Step 2: Interview me, item by item

For each item from step 1 that I say matters, and for anything else I add, ask me questions one at a time until you can fill in these fields:

| Field | What to capture |
| --- | --- |
| Name | What I call it |
| Type | Agent, SOP, skill, script, hook, MCP server, scheduled job, Obsidian plugin, other |
| What it does | One or two sentences, in my words |
| How it starts | I start it by hand, it runs on a schedule (when?), or something triggers it (what?) |
| How often | As I describe it, plus the session-log count from step 1 if there is one |
| Reads from | Files and folders (with paths), apps, websites, services |
| Writes to | Files and folders (with paths), apps, services, people (email, Slack, etc.) |
| Needs this computer for | Local files, a desktop app, a program installed only here, the work network or VPN, a device, a screen or browser session, nothing |
| Credentials | Names of the logins or keys it needs (no values) |
| Needs me in the loop | Does a person have to review or approve before or after it runs? At which step? |
| Value of running while I'm away | What I'd gain if it ran overnight or while my laptop is closed, in my words |
| Sensitivity | Personal, client, company-internal or public data, and any rules I know of about where that data may go |
| Pain today | What bothers me about running it locally now |

If I don't know an answer, mark it `UNKNOWN` and move on.

## Step 3: Check with me

When the interview is done, show me the full inventory and ask:

1. Is anything missing?
2. Is anything wrong?
3. Which three items would I most like to keep running when this computer is off?

## Step 4: Save the inventory

Ask me where to save it. Suggest a path and file name, and wait for my yes. Then write one Markdown file with:

1. A short header: date, myPKA/newPKA version, OS, folder location, sync/Git status, one-folder or two.
2. A summary table: one row per item with Name, Type, How it starts, Needs this computer for, and Needs me in the loop.
3. A full section for each item, with every field from step 2.
4. My top three from step 3.
5. A list of open questions (every `UNKNOWN`).
6. The same data as a YAML block at the end, one entry per item, using the field names above, so another session can read it.

Don't sort the items into "move" or "keep local". That decision comes later, in a separate planning session. Just record the facts, including anything that ties an item to this computer.

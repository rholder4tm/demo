# CLAUDE.md - AI Assistant Guide

This document provides comprehensive guidance for AI assistants (like Claude) working on this codebase. It outlines the project structure, development workflows, and key conventions to follow.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Repository Structure](#repository-structure)
3. [Development Workflow](#development-workflow)
4. [Coding Conventions](#coding-conventions)
5. [Git Practices](#git-practices)
6. [Testing Guidelines](#testing-guidelines)
7. [Documentation Standards](#documentation-standards)
8. [AI Assistant Guidelines](#ai-assistant-guidelines)

---

## Project Overview

**Status:** New/Empty Repository - Awaiting Initial Setup

### Project Type
- [ ] Web Application
- [ ] Mobile Application
- [ ] Library/Package
- [ ] CLI Tool
- [ ] API/Backend Service
- [ ] Full-Stack Application
- [ ] Other: _________________

### Technology Stack
*To be documented as the project develops*

**Primary Language(s):**
-

**Frameworks/Libraries:**
-

**Build Tools:**
-

**Package Manager:**
-

---

## Repository Structure

```
/home/user/demo/
├── .git/                   # Git repository data
└── (awaiting project files)
```

### Key Directories
*To be documented as directories are created*

| Directory | Purpose | Notes |
|-----------|---------|-------|
| `/src` | Source code | *Add when created* |
| `/tests` or `/test` | Test files | *Add when created* |
| `/docs` | Documentation | *Add when created* |
| `/config` | Configuration files | *Add when created* |
| `/scripts` | Build/utility scripts | *Add when created* |

### Important Files
*To be documented as files are created*

| File | Purpose | When to Modify |
|------|---------|----------------|
| `README.md` | Project documentation | When features change |
| `package.json` | Dependencies & scripts | When adding packages |
| `.gitignore` | Ignored files | When new artifacts appear |
| `.env.example` | Environment template | When adding env variables |

---

## Development Workflow

### Branch Strategy

**Current Branch:** `claude/claude-md-mkr2avwpmeb3putg-u9ppf`

**Branch Naming Convention:**
- Feature branches: `claude/claude-md-<session-id>`
- All Claude development branches MUST start with `claude/` and end with the matching session ID
- Branch names must match exactly or pushes will fail with 403 error

**Branch Rules:**
1. ✅ Always develop on the designated Claude branch
2. ✅ Create the branch locally if it doesn't exist
3. ✅ Commit work with clear, descriptive messages
4. ✅ Push to the specified branch when changes are complete
5. ❌ NEVER push to a different branch without explicit permission
6. ❌ NEVER force push to main/master

### Commit Message Format

Follow these conventions for commit messages:

```
<type>(<scope>): <subject>

<body>

https://claude.ai/code/session_<SESSION_ID>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring without changing functionality
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependencies, build process

**Examples:**
```
feat(auth): add user authentication system

Implement JWT-based authentication with login and registration endpoints

https://claude.ai/code/session_013gVN2PQZfPFAJuzKcnBFTK
```

```
fix(api): resolve null pointer in user profile endpoint

Fixed crash when accessing profiles without profile pictures

https://claude.ai/code/session_013gVN2PQZfPFAJuzKcnBFTK
```

### Git Operations Best Practices

**Push Operations:**
```bash
# Always use -u flag for first push
git push -u origin <branch-name>

# Retry logic on network errors (up to 4 times with exponential backoff: 2s, 4s, 8s, 16s)
```

**Fetch/Pull Operations:**
```bash
# Prefer fetching specific branches
git fetch origin <branch-name>

# For pulls
git pull origin <branch-name>

# Apply same retry logic for network failures
```

**Pre-commit Safety Checks:**
- ✅ Review `git status` before committing
- ✅ Review `git diff` to understand all changes
- ✅ Never stage files with secrets (.env, credentials.json, etc.)
- ✅ Prefer staging specific files by name over `git add .` or `git add -A`
- ❌ NEVER skip hooks (--no-verify, --no-gpg-sign) unless explicitly requested
- ❌ NEVER update git config without permission
- ❌ NEVER run destructive commands (reset --hard, clean -f) without explicit request

---

## Coding Conventions

### General Principles

1. **Simplicity First:** Avoid over-engineering. Only make changes that are directly requested or clearly necessary.
2. **No Premature Abstraction:** Don't create helpers or utilities for one-time operations.
3. **Security Conscious:** Watch for vulnerabilities (XSS, SQL injection, command injection, OWASP Top 10).
4. **Read Before Modifying:** Always read existing code before suggesting modifications.

### Code Style
*To be documented based on project language and team preferences*

**Naming Conventions:**
-

**Indentation:**
-

**Comments:**
- Only add comments where logic isn't self-evident
- Don't add docstrings to code you didn't change
- Remove obsolete comments when updating code

### Error Handling

- Only add error handling at system boundaries (user input, external APIs)
- Trust internal code and framework guarantees
- Don't add validation for scenarios that can't happen

---

## Git Practices

### Security & Safety

**NEVER commit:**
- `.env` files or environment variables with secrets
- API keys, passwords, tokens, or credentials
- `credentials.json` or similar sensitive files
- Large binary files without explicit permission

**Always:**
- Use `.gitignore` to exclude sensitive and generated files
- Review changes before committing
- Write meaningful commit messages
- Keep commits focused and atomic

### Commit Workflow

1. **Before Committing:**
   ```bash
   git status          # See all untracked files
   git diff            # See unstaged changes
   git diff --staged   # See staged changes
   git log --oneline -5  # Review recent commit style
   ```

2. **Stage Changes:**
   ```bash
   # Prefer specific files
   git add src/file1.js src/file2.js

   # Avoid blanket staging (can accidentally include secrets)
   git add .  # Use with caution
   ```

3. **Commit:**
   ```bash
   # Use heredoc for proper formatting
   git commit -m "$(cat <<'EOF'
   feat(feature): add new functionality

   Detailed description of changes

   https://claude.ai/code/session_013gVN2PQZfPFAJuzKcnBFTK
   EOF
   )"
   ```

4. **Push:**
   ```bash
   git push -u origin <branch-name>
   ```

### Handling Pre-commit Hook Failures

If a pre-commit hook fails:
1. ✅ Fix the issue
2. ✅ Re-stage the files
3. ✅ Create a NEW commit (not --amend)
4. ❌ NEVER use `--amend` after hook failure (would modify previous commit)

---

## Testing Guidelines

*To be documented when testing framework is established*

### Test Structure
-

### Running Tests
```bash
# Add test commands here
```

### Test Coverage Goals
-

### When to Write Tests
-

---

## Documentation Standards

### Code Documentation

- Document complex algorithms and business logic
- Explain "why" rather than "what" in comments
- Keep documentation up-to-date with code changes

### README.md Requirements

Should include:
- Project description and purpose
- Installation instructions
- Usage examples
- Configuration guide
- Contributing guidelines
- License information

### API Documentation

*If applicable*
- Document all public APIs
- Include request/response examples
- Specify authentication requirements
- List error codes and meanings

---

## AI Assistant Guidelines

### Task Management

**Always use TodoWrite tool for:**
- Complex multi-step tasks (3+ steps)
- Non-trivial implementations
- User-provided task lists
- Tracking progress on long-running work

**Todo States:**
- `pending`: Not yet started
- `in_progress`: Currently working (limit to ONE task at a time)
- `completed`: Finished successfully

**Todo Requirements:**
- Mark tasks complete IMMEDIATELY after finishing
- Don't batch completions
- Exactly ONE task must be in_progress at any time
- Only mark completed when FULLY accomplished (no errors, no blockers)

### Tool Usage Policy

**Prefer specialized tools:**
- `Read` for reading files (not `cat`)
- `Edit` for editing files (not `sed`/`awk`)
- `Write` for creating files (not `echo` or heredocs)
- `Glob` for finding files (not `find`)
- `Grep` for searching content (not `grep` command)

**Use Task tool with Explore agent for:**
- Understanding codebase structure
- Finding where functionality is implemented
- Exploring error handling patterns
- Non-specific searches requiring context gathering

**Parallel execution:**
- Make multiple independent tool calls in single message
- Only run sequentially when dependencies exist

### Code Modification Principles

**When implementing features:**
1. Read existing code first
2. Use TodoWrite to plan if task is complex
3. Make minimal, focused changes
4. Avoid adding unnecessary features
5. Don't refactor surrounding code unless requested
6. Test changes if testing framework exists

**What NOT to do:**
- ❌ Add features beyond what was requested
- ❌ Create abstractions for one-time operations
- ❌ Add error handling for impossible scenarios
- ❌ Include backwards-compatibility hacks (unused `_vars`, `// removed` comments)
- ❌ Add docstrings/comments to unchanged code
- ❌ Refactor unrelated code

### Communication Style

- Be concise and direct
- No emojis unless explicitly requested
- Use GitHub-flavored markdown
- Focus on facts over validation
- Never give time estimates

### Code References

When referencing code, use format: `file_path:line_number`

Example: "The authentication logic is in `src/auth/login.js:142`"

---

## Project-Specific Notes

*Add any project-specific conventions, patterns, or requirements here*

### Architecture Decisions
-

### Third-Party Services
-

### Environment Variables
-

### Deployment Process
-

---

## Changelog

| Date | Author | Changes |
|------|--------|---------|
| 2026-01-23 | Claude | Initial CLAUDE.md creation for new repository |

---

## Maintenance

This document should be updated:
- ✅ When project structure changes
- ✅ When new conventions are established
- ✅ When development workflows change
- ✅ When key dependencies are added or changed
- ✅ When architectural decisions are made

**Last Updated:** 2026-01-23

**Document Version:** 1.0.0

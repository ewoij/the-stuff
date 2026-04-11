# The Stuff

Task manager with a Kanban UI and an API for Claude Code agents.

## Setup

```bash
npm install
npm run db:push
```

## Run

```bash
npm run dev
# http://localhost:3000
```

## Worker (autonomous agent)

```bash
# Add to PATH
export PATH="/path/to/the-stuff/bin:$PATH"

# Run on a project (fetches tasks until none left)
the-stuff-worker <project-id>

# Options
the-stuff-worker <project-id> --base-branch main --server http://localhost:3000
```

Multiple workers can run in parallel — each task gets its own git worktree.

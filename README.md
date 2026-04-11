# The Stuff

Task manager with a Kanban board UI and a REST API for Claude Code autonomous agents. Organize work into projects with tasks tracked through TODO, PROGRESS, DONE, and ARCHIVED statuses. Supports subtasks, Markdown content and comments, git branch/PR references, and concurrent agent workers.

## Prerequisites

- Node.js 18+
- Git
- [GitHub CLI](https://cli.github.com/) (`gh`) — used by the worker to create PRs
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) — used by the worker to process tasks

## Setup

```bash
git clone <repo-url> && cd the-stuff
npm install
npm run db:push   # create the SQLite database and apply the schema
npm run dev       # start the dev server at http://localhost:3000
```

The database is stored at `./data/the-stuff.db` (auto-created on first run). No environment variables are required for local development — see `.env.example` for optional configuration.

## Running the worker

The worker picks up TODO tasks, creates a git worktree for each one, and spawns Claude Code to implement them autonomously.

```bash
# Add the bin directory to your PATH
export PATH="$PWD/bin:$PATH"

# Run the worker (interactive project selection)
the-stuff-worker

# Or specify a project ID directly
the-stuff-worker <project-id>

# All options
the-stuff-worker <project-id> \
  --server http://localhost:3000 \
  --base-branch main \
  --max-tasks 10 \
  --poll-interval 30
```

You can also set `THE_STUFF_URL` to point the worker at a different server:

```bash
THE_STUFF_URL=http://my-server:3000 the-stuff-worker 1
```

Multiple workers can run in parallel — each task gets its own git worktree.

## Claude Code skill

The repo includes a Claude Code skill at `.claude/skills/the-stuff/SKILL.md` that lets Claude manage tasks and projects via the API. To install it for use outside this repo:

```bash
# Symlink from the repo into your global skills directory
mkdir -p ~/.claude/skills
ln -s "$PWD/.claude/skills/the-stuff" ~/.claude/skills/the-stuff
```

After linking, Claude Code will automatically pick up the skill in any project.

## Database commands

```bash
npm run db:push      # apply schema changes to the database
npm run db:studio    # open Drizzle Studio (database browser)
```

Schema lives in `src/lib/db/schema.ts`. After any schema change, run `npm run db:push`.

## API

### Web UI routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/projects` | List / create projects |
| GET/PUT/DELETE | `/api/projects/[id]` | Project CRUD |
| GET/POST | `/api/projects/[id]/tasks` | List / create tasks |
| GET/PUT/DELETE | `/api/tasks/[id]` | Task CRUD |
| POST | `/api/tasks/[id]/status` | Update task status |
| GET/POST | `/api/tasks/[id]/comments` | Task comments |

### Agent routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/agent/next-task` | Fetch next TODO task (atomic) |
| POST | `/api/agent/create-task` | Create a new task |
| POST | `/api/agent/complete-task` | Mark task as DONE |
| POST | `/api/agent/release-task` | Reset task back to TODO |

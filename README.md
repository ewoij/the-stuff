# The Stuff

Task manager with a Kanban board UI and a REST API for Claude Code autonomous agents. Organize work into projects with tasks tracked through TODO, PROGRESS, DONE, and ARCHIVED statuses. Supports subtasks, Markdown content and comments, git branch/PR references, and concurrent agent workers.

## Tech stack

Next.js 16, React 19, TypeScript, SQLite (Drizzle ORM), Tailwind CSS v4, shadcn/ui

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

## Database commands

```bash
npm run db:generate  # Generate Drizzle migrations from schema changes
npm run db:migrate   # Apply pending migrations
npm run db:push      # Push schema directly to database
npm run db:studio    # Open Drizzle Studio UI
```

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

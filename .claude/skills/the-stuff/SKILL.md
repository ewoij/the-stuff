---
name: the-stuff
description: CRUD projects and tasks via The Stuff task manager API. Use when asked to create, list, update, or manage tasks and projects.
user-invocable: false
---

# The Stuff — Task Manager API

Server: `http://localhost:3456` (override with `$THE_STUFF_URL`)

## Projects

**List projects:**
```bash
curl -s http://localhost:3456/api/projects
```

**Create project:**
```bash
curl -s -X POST http://localhost:3456/api/projects \
  -H 'Content-Type: application/json' \
  -d '{"name": "My Project", "content": "Optional description"}'
```

**Get project:**
```bash
curl -s http://localhost:3456/api/projects/:id
```

**Update project:**
```bash
curl -s -X PUT http://localhost:3456/api/projects/:id \
  -H 'Content-Type: application/json' \
  -d '{"name": "New Name", "content": "New description"}'
```

**Delete project:**
```bash
curl -s -X DELETE http://localhost:3456/api/projects/:id
```

## Tasks

**List tasks for a project (includes current status):**
```bash
curl -s http://localhost:3456/api/projects/:projectId/tasks
```

**Create task:**
```bash
curl -s -X POST http://localhost:3456/api/projects/:projectId/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title": "Task title", "content": "Description", "parentTaskId": null, "branch": null, "pr": null}'
```

New tasks start in `DRAFT`. **Leave them there.** Do not automatically bump to `TODO` after creation — `TODO` tasks are fair game for agents (see the agent endpoints below, which atomically claim any `TODO` task via `/api/agent/next-task`). Only set status to `TODO` when the user explicitly says the task is ready for an agent to pick up.

**Get task detail (includes status history, comments, subtasks):**
```bash
curl -s http://localhost:3456/api/tasks/:id
```

**Update task:**
```bash
curl -s -X PUT http://localhost:3456/api/tasks/:id \
  -H 'Content-Type: application/json' \
  -d '{"title": "New title", "content": "New desc", "branch": "feat/x", "pr": "https://..."}'
```

**Delete task:**
```bash
curl -s -X DELETE http://localhost:3456/api/tasks/:id
```

## Task Status

Statuses (event-sourced — each change is appended):
- `DRAFT` — initial state on creation. Not visible to agent pickup.
- `TODO` — queued for work. An agent may claim it via `/api/agent/next-task`.
- `PROGRESS` — actively being worked on.
- `DONE` — completed.
- `ARCHIVED` — removed from normal views.

**Change status:**
```bash
curl -s -X POST http://localhost:3456/api/tasks/:id/status \
  -H 'Content-Type: application/json' \
  -d '{"status": "DONE"}'
```

## Task Comments

**List comments:**
```bash
curl -s http://localhost:3456/api/tasks/:id/comments
```

**Add comment:**
```bash
curl -s -X POST http://localhost:3456/api/tasks/:id/comments \
  -H 'Content-Type: application/json' \
  -d '{"content": "Comment text"}'
```

**Update comment:**
```bash
curl -s -X PUT http://localhost:3456/api/tasks/:id/comments/:commentId \
  -H 'Content-Type: application/json' \
  -d '{"content": "Updated text"}'
```

**Delete comment:**
```bash
curl -s -X DELETE http://localhost:3456/api/tasks/:id/comments/:commentId
```

## Agent Endpoints

**Fetch next TODO task (atomically sets to PROGRESS):**
```bash
curl -s -X POST http://localhost:3456/api/agent/next-task \
  -H 'Content-Type: application/json' \
  -d '{"projectId": 1}'
```
Returns 404 if no tasks available.

**Create task (for agents):**
```bash
curl -s -X POST http://localhost:3456/api/agent/create-task \
  -H 'Content-Type: application/json' \
  -d '{"projectId": 1, "title": "Task title", "content": "Details", "parentTaskId": null}'
```

**Complete task:**
```bash
curl -s -X POST http://localhost:3456/api/agent/complete-task \
  -H 'Content-Type: application/json' \
  -d '{"taskId": 1, "branch": "feat/x", "pr": "https://..."}'
```

**Release task (give up, back to TODO):**
```bash
curl -s -X POST http://localhost:3456/api/agent/release-task \
  -H 'Content-Type: application/json' \
  -d '{"taskId": 1}'
```

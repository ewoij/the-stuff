# The Stuff

Distribute work to Claude agents.

![The Stuff — Kanban board with active agents](public/screenshot.png)

## TL;DR

```bash
# 1. Install
npm install
npm run db:push
ln -s "$PWD/.claude/skills/the-stuff" ~/.claude/skills/the-stuff

# 2. Run
npm run dev
```

Then:

3. Create a project on the board
4. Spawn agents from the repo you want them to work in: `cd /path/to/your-repo && the-stuff-worker`
5. Ask Claude to create tasks ("create a task to…")
6. Move them to **TODO** to dispatch
7. Ask Claude to review and merge the PRs

## Why "The Stuff"

I always have a project called "stuff" where I dump the tasks I need to do. I wanted something similar, but where a swarm of Claude Code agents could pick up tasks and implement them autonomously. I could have learned an existing framework, but I'm lazy, building it is more fun, and the result fits exactly how I work.

This is a toy project for local development. If you need something production-grade for agent orchestration, more serious tools exist.

## How it works

You can also create research tasks where the agent will not implement anything, no PR, just plan mode and will spawn other tasks.

## Prerequisites

- Node.js 18+
- Git
- [GitHub CLI](https://cli.github.com/) (`gh`) — used by the worker to create PRs
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) — used by the worker to process tasks

## Setup

```bash
git clone <repo-url> && cd the-stuff
npm install
npm run db:push   # create the SQLite database
npm run dev       # start the dev server at http://localhost:3000
```

The database is stored at `./data/the-stuff.db` (auto-created on first run).

## Install the skill

The repo ships a Claude Code skill that lets Claude manage tasks and projects via the API. To use it from any project:

```bash
mkdir -p ~/.claude/skills
ln -s "$PWD/.claude/skills/the-stuff" ~/.claude/skills/the-stuff
```

Once linked, you can ask Claude to create tasks, list projects, update statuses — all through natural language.

## Create and dispatch tasks

Ask Claude to create tasks in your project (or use the Kanban board at localhost:3000). Tasks start as drafts. When you're ready to dispatch work, move them to **TODO** — that's the signal for workers to pick them up.

## Spawn workers

```bash
export PATH="$PWD/bin:$PATH" # add to your .zshrc
the-stuff-worker
```

It'll prompt you to pick a project, then start polling for TODO tasks.

<details>
<summary>Advanced options</summary>

```bash
the-stuff-worker <project-id> \
  --server http://localhost:3000 \
  --base-branch main \
  --max-tasks 10 \
  --poll-interval 30
```

Or set `THE_STUFF_URL` to point at a different server:

```bash
THE_STUFF_URL=http://my-server:3000 the-stuff-worker 1
```

</details>

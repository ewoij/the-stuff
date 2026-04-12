# The Stuff

Distribute work to Claude agents.

![The Stuff — Kanban board with active agents](public/screenshot.png)

## TL;DR

1. Install dependencies: `npm install`
2. Set up the database: `npm run db:push`
3. Install the Claude Code skill: `ln -s "$PWD/.claude/skills/the-stuff" ~/.claude/skills/the-stuff`
4. Put the worker on your PATH — add to your `.zshrc`, with the absolute path to this repo: `export PATH="/path/to/the-stuff/bin:$PATH"`
5. Start the app: `npm run dev`
6. Create a project on the board
7. Spawn agents from the repo you want them to work in: `cd /path/to/your-repo && the-stuff-worker`
8. Ask Claude to create tasks ("create a task to…")
9. Move them to **TODO** to dispatch
10. Ask Claude to review and merge the PRs

## How it works

Tasks start as drafts. Moving one to **TODO** is the dispatch signal — a worker picks it up, spins up an isolated git worktree, runs Claude Code to implement the change, and opens a PR. You review and merge.

A few things worth knowing:

- **Statuses.** Poor wording, but: **Done** means the PR has been opened, **Archived** means the PR has been merged. The **Archive Merged** button on the board auto-moves any Done tasks whose PRs have been merged.
- **Dependencies.** A task with unresolved prerequisites won't be picked up until they're archived (i.e. merged).
- **Research tasks.** Some tasks are plan-only: the agent stays in plan mode, writes no code, and spawns follow-up tasks instead of opening a PR.
- **Session reuse.** Agents reuse the same Claude session across a handful of tasks, so context carries over.

## Prerequisites

- Node.js 18+
- Git
- [GitHub CLI](https://cli.github.com/) (`gh`) — used by the worker to create PRs
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) — used by the worker to process tasks

## Why "The Stuff"

I always have a project called "stuff" where I dump the tasks I need to do. I wanted something similar, but where a swarm of Claude Code agents could pick up tasks and implement them autonomously. I could have learned an existing framework, but I'm lazy, building it is more fun, and the result fits exactly how I work.

This is a toy project for local development. If you need something production-grade for agent orchestration, more serious tools exist.

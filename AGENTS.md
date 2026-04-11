<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Database

Schema: `src/lib/db/schema.ts`. After modifying the schema, run `npm run db:push` to apply changes to the database. Do NOT use `drizzle-kit generate` or `drizzle-kit migrate` — this project uses `db:push` only (no migration files).

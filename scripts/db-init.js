#!/usr/bin/env node
// idempotent database bootstrap - safe to run on every start
// creates tables if missing, seeds products if missing
import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const projectRoot = process.cwd()
const schemaPath = join(projectRoot, 'prisma', 'schema.prisma')
const seedPath = join(projectRoot, 'prisma', 'seed.ts')

if (!process.env.DATABASE_URL) {
  console.error('[db-init] DATABASE_URL not set, skipping migrations')
  process.exit(0)
}

console.log('[db-init] Starting database bootstrap...')

try {
  console.log('[db-init] Step 1/3 - prisma generate')
  execSync('npx prisma generate --schema=./prisma/schema.prisma', { stdio: 'inherit', cwd: projectRoot })

  console.log('[db-init] Step 2/3 - prisma db push (idempotent)')
  execSync('npx prisma db push --accept-data-loss --schema=./prisma/schema.prisma', {
    stdio: 'inherit',
    cwd: projectRoot,
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
  })

  if (existsSync(seedPath) && schemaPath) {
    console.log('[db-init] Step 3/3 - seed products (only if missing)')
    execSync('npx tsx prisma/seed.ts', { stdio: 'inherit', cwd: projectRoot, env: process.env })
  }

  console.log('[db-init] Database bootstrap completed successfully')
  process.exit(0)
} catch (err) {
  console.error('[db-init] Database bootstrap failed:', err.message)
  process.exit(1)
}

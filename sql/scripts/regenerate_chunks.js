#!/usr/bin/env node
/**
 * regenerate_chunks.js
 *
 * Usage:
 *   node sql/scripts/regenerate_chunks.js
 *
 * What it does:
 * 1. Reads the large SQL dump (default: sql/for_later_usage/dnd_3_5_data.sql).
 * 2. Splits it into chunks of ~N lines (default 100) but avoids cutting SQL statements:
 *    it only finalizes a chunk when a statement terminator `;` has been reached.
 * 3. Overwrites files in sql/for_later_usage/_chunks/dnd_chunk_*.sql
 * 4. Generates an idempotent migration SQL derived from prisma/schema.prisma:
 *    - emits CREATE TABLE IF NOT EXISTS ...
 *    - emits ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...
 *   The migration is conservative and aims to preserve existing data, but should be
 *   reviewed before execution.
 * 5. Writes helper runner scripts:
 *    - sql/run-chunks.sh  (bash)
 *    - sql/run-chunks.ps1 (PowerShell)
 *
 * NOTE:
 * - This script only writes files locally. It does NOT execute any SQL.
 * - Run it from the repository root to match default paths, or pass parameters.
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_SOURCE = path.join('sql', 'for_later_usage', 'dnd_3_5_data.sql');
const DEFAULT_CHUNKS_DIR = path.join('sql', 'for_later_usage', '_chunks');
const DEFAULT_PRISMA = path.join('world-of-dnd-backend', 'prisma', 'schema.prisma');
const DEFAULT_SCHEMAS_DIR = path.join('sql', 'schemas');
const LINES_PER_CHUNK = 100;

function readFileSafe(p) {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch (e) {
    console.error(`Error reading file ${p}:`, e.message);
    process.exit(1);
  }
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function writeChunkFile(dir, idx, lines) {
  const name = `dnd_chunk_${idx}.sql`;
  const p = path.join(dir, name);
  fs.writeFileSync(p, lines.join('\n') + '\n', 'utf8');
  console.log(`Wrote chunk ${idx} -> ${p} (${lines.length} lines)`);
}

// Split source into chunks ~N lines but don't cut statements mid-semicolon.
// A statement ends when a semicolon appears at line end after trimming (simple heuristic).
function splitIntoSafeChunks(sourceText, linesPerChunk) {
  const lines = sourceText.split(/\r?\n/);
  const chunks = [];
  let current = [];
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    current.push(ln);
    // Count non-empty lines for chunking decision
    const nonEmptyCount = current.filter(l => l.trim() !== '').length;
    // Check if this line ends a statement (heuristic: trimmed line endsWith ';')
    const trimmed = ln.trim();
    const endsStatement = trimmed.endsWith(';');
    if (nonEmptyCount >= linesPerChunk && endsStatement) {
      chunks.push(current);
      current = [];
    }
  }
  if (current.length > 0) chunks.push(current);
  return chunks;
}

// Parse prisma schema to extract models and fields (very lightweight parser).
function parsePrismaModels(prismaText) {
  const models = [];
  const modelRegex = /model\s+([A-Za-z0-9_]+)\s*{([^}]*)}/gms;
  let m;
  while ((m = modelRegex.exec(prismaText)) !== null) {
    const modelName = m[1];
    const body = m[2];
    const lines = body.split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('//') && !l.startsWith('@@'));
    const fields = [];
    for (const line of lines) {
      // stop at @@ or @@map etc
      if (line.startsWith('@@')) continue;
      // field lines look like: name  Type   @attr ...
      const parts = line.split(/\s+/);
      if (parts.length < 2) continue;
      const fieldName = parts[0];
      const fieldType = parts[1];
      const rest = line.substring(line.indexOf(fieldType) + fieldType.length).trim();
      fields.push({ name: fieldName, type: fieldType, meta: rest });
    }
    models.push({ name: modelName, fields });
  }
  return models;
}

function prismaTypeToPG(field) {
  const t = field.type;
  // handle array types e.g. String[] -> text[]
  if (t.endsWith('[]')) {
    const base = t.slice(0, -2);
    const mapped = prismaTypeToPG({ type: base });
    return `${mapped}[]`;
  }
  switch (t) {
    case 'Int': return 'INTEGER';
    case 'String': {
      // if meta contains @db.Text prefer TEXT
      if (fieldHasMeta(field, '@db.Text')) return 'TEXT';
      return 'TEXT';
    }
    case 'Boolean': return 'BOOLEAN';
    case 'DateTime': return 'TIMESTAMP WITH TIME ZONE';
    case 'Float': return 'DOUBLE PRECISION';
    case 'Json': return 'JSONB';
    default:
      // relations or enums or unsupported types -> TEXT fallback
      return 'TEXT';
  }
}

function fieldHasMeta(field, token) {
  return field.meta && field.meta.indexOf(token) !== -1;
}

function generateIdColumnSql(field) {
  // Detect autoincrement: @default(autoincrement())
  if (field.meta && field.meta.includes('autoincrement()')) {
    // use serial
    return `${field.name} SERIAL PRIMARY KEY`;
  }
  return null;
}

function generateMigrationSqlFromPrisma(prismaText) {
  const models = parsePrismaModels(prismaText);
  const statements = [];
  statements.push('-- AUTO-GENERATED idempotent migration from prisma/schema.prisma');
  statements.push('-- Review before executing. This migration tries to create tables if missing and add missing columns.');
  statements.push('BEGIN;');
  for (const model of models) {
    // attempt to read @@map("table_name")
    const mapRegex = new RegExp(`model\\s+${model.name}[\\s\\S]*?@@map\\(\"([^\"]+)\"\\)`, 'm');
    const mapMatch = mapRegex.exec(prismaText);
    const tableName = mapMatch ? mapMatch[1] : camelToSnake(model.name);
    // CREATE TABLE IF NOT EXISTS with minimal column definitions for safe creation
    const createCols = [];
    for (const field of model.fields) {
      // skip relation fields where type is another model name and no scalar type
      // Heuristic: if type starts with uppercase and not a scalar, still create as INTEGER if it looks like foreign key (endsWith 'Id')
      if (field.name.toLowerCase().endsWith('id') && (field.type === 'Int' || field.type === 'Int?')) {
        // scalar id
      }
      // id column special handling
      const idSql = generateIdColumnSql(field);
      if (idSql && field.name.toLowerCase() === 'id') {
        createCols.push(idSql);
        continue;
      }
      // skip relations that are arrays or references
      // map Prisma scalar types to PG
      const pgType = prismaTypeToPG(field);
      // default nullability: if field.type ends with ? then allow NULL
      const nullable = field.type.endsWith('?') || field.meta.includes('?') ? '' : '';
      // default value handling for timestamps with @default(now())
      let defaultSql = '';
      if (field.meta.includes('@default(now())')) defaultSql = ' DEFAULT now()';
      createCols.push(`${field.name} ${pgType}${defaultSql}`);
    }
    // write CREATE TABLE IF NOT EXISTS
    statements.push(`-- Model: ${model.name}`);
    statements.push(`CREATE TABLE IF NOT EXISTS ${tableName} (\n  ${createCols.join(',\n  ')}\n);`);
    // For each field, emit ALTER TABLE ADD COLUMN IF NOT EXISTS to ensure columns exist
    for (const field of model.fields) {
      // skip id because handled
      if (field.name.toLowerCase() === 'id' && field.meta.includes('autoincrement()')) continue;
      const pgType = prismaTypeToPG(field);
      let defaultSql = '';
      if (field.meta.includes('@default(now())')) defaultSql = ' DEFAULT now()';
      statements.push(`ALTER TABLE ${tableName} ADD COLUMN IF NOT EXISTS ${field.name} ${pgType}${defaultSql};`);
    }
  }
  statements.push('COMMIT;');
  return statements.join('\n') + '\n';
}

function camelToSnake(s) {
  // very simple converter (ex: GameSession -> game_session)
  return s.replace(/([A-Z])/g, (m, p, offset) => (offset ? '_' : '') + p.toLowerCase());
}

// MAIN
(function main() {
  const argv = (function() {
    const args = {};
    for (const a of process.argv.slice(2)) {
      if (!a.startsWith('--')) continue;
      const idx = a.indexOf('=');
      if (idx === -1) {
        args[a.slice(2)] = 'true';
      } else {
        const k = a.slice(2, idx);
        const v = a.slice(idx + 1);
        args[k] = v;
      }
    }
    return args;
  })();
  const source = argv.source || DEFAULT_SOURCE;
  const chunksDir = argv.chunksDir || DEFAULT_CHUNKS_DIR;
  const prismaPath = argv.prisma || DEFAULT_PRISMA;
  const schemasDir = argv.schemasDir || DEFAULT_SCHEMAS_DIR;
  const linesPerChunk = argv.linesPerChunk ? parseInt(argv.linesPerChunk, 10) : LINES_PER_CHUNK;

  if (!fs.existsSync(source)) {
    console.error(`Source SQL not found: ${source}`);
    process.exit(1);
  }

  console.log('Reading source SQL:', source);
  const sourceText = readFileSafe(source);

  console.log('Splitting into safe chunks (~' + linesPerChunk + ' lines per chunk)...');
  const chunks = splitIntoSafeChunks(sourceText, linesPerChunk);

  ensureDir(chunksDir);
  // Remove existing dnd_chunk_*.sql files first
  const existing = fs.readdirSync(chunksDir).filter(f => f.match(/^dnd_chunk_\\d+\\.sql$/));
  for (const f of existing) {
    fs.unlinkSync(path.join(chunksDir, f));
  }

  for (let i = 0; i < chunks.length; i++) {
    writeChunkFile(chunksDir, i + 1, chunks[i]);
  }
  console.log(`Wrote ${chunks.length} chunk files to ${chunksDir}`);

  // Generate idempotent migration from prisma schema
  if (!fs.existsSync(prismaPath)) {
    console.warn(`Prisma schema not found at ${prismaPath}. Skipping migration generation.`);
  } else {
    console.log('Reading prisma schema:', prismaPath);
    const prismaText = readFileSafe(prismaPath);
    const migrationSql = generateMigrationSqlFromPrisma(prismaText);
    ensureDir(schemasDir);
    const migrationFile = path.join(schemasDir, `999_auto_generated_from_prisma.sql`);
    fs.writeFileSync(migrationFile, migrationSql, 'utf8');
    console.log('Wrote idempotent migration SQL ->', migrationFile);
  }

  // Generate runner scripts
  const runSh = `#!/usr/bin/env bash
# Execute all chunk files in order using psql.
# Usage: DATABASE_URL="postgres://user:pass@host:port/db" ./sql/run-chunks.sh
set -euo pipefail
if [ -z "\${DATABASE_URL:-}" ]; then
  echo "Please set DATABASE_URL environment variable (e.g. export DATABASE_URL=postgres://user:pass@host:port/db)"
  exit 2
fi
CHUNKS_DIR="${path.relative('.', chunksDir)}"
for f in \$(ls -1 "\$CHUNKS_DIR" | sort -V); do
  echo "Executing \$CHUNKS_DIR/\$f..."
  psql "\$DATABASE_URL" -f "\$CHUNKS_DIR/\$f"
done
echo "All chunks executed."
`;
  const runPs1 = `param(
  [string]\$DatabaseUrl = \$env:DATABASE_URL
)
if (-not \$DatabaseUrl) {
  Write-Error "Please set the DATABASE_URL environment variable (e.g. $env:DATABASE_URL = 'postgres://user:pass@host:port/db')"
  exit 2
}
\$chunksDir = "${path.relative('.', chunksDir)}"
Get-ChildItem -Path \$chunksDir -Filter "dnd_chunk_*.sql" | Sort-Object Name | ForEach-Object {
  Write-Host "Executing \$($_.FullName)..."
  psql \$DatabaseUrl -f \$_.FullName
}
Write-Host "All chunks executed."
`;

  const runShPath = path.join('sql', 'run-chunks.sh');
  const runPs1Path = path.join('sql', 'run-chunks.ps1');
  fs.writeFileSync(runShPath, runSh, { mode: 0o755 });
  fs.writeFileSync(runPs1Path, runPs1, { mode: 0o755 });
  console.log('Wrote runner scripts:', runShPath, runPs1Path);

  console.log('Done. Review generated chunks and migration SQL before executing on a production database.');
})();

#!/bin/bash
set -e

DB_HOST=${DB_HOST:-database}
DB_USER=${DB_USER:-root}
DB_PASS=${DB_PASS:-root}
DB_NAME=${DB_NAME:-database}

function run_migration() {
    local file="$1"
    local name
    name=$(basename "$file")
    local exists
    exists=$(mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -N -B -e "SELECT COUNT(*) FROM migrations WHERE name='$name';" 2>/dev/null || echo 0)
    if [ "$exists" -eq 0 ]; then
        echo "Running migration: $name"
        mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$file"
        mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "INSERT INTO migrations (name) VALUES ('$name');"
    else
        echo "Migration $name already applied, skipping."
    fi
}

# Wait for DB to be ready
until mysqladmin ping -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASS" --silent; do
  echo "Waiting for database connection..."
  sleep 2
done

# Ensure migrations table exists
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$(dirname "$0")/schemas/000_create_migrations_table.sql"

# Run schema migrations
for file in $(ls "$(dirname "$0")/schemas/"*.sql | sort); do
    run_migration "$file"
done

# Run starting data
for file in $(ls "$(dirname "$0")/starting-data/"*.sql | sort); do
    run_migration "$file"
done

#!/bin/bash
set -e

echo "Restoring database from custom format dump..."
pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" /tmp/db.dump
echo "Database restore completed successfully!"

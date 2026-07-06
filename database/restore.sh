#!/bin/bash

echo "Restoring database from custom format dump..."
pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --no-privileges --verbose /tmp/db.dump || true
echo "Database restore completed!"

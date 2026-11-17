#!/bin/sh
# Runs once on first database creation (docker-entrypoint-initdb.d), after schema and seed.
# Creates the restricted application role (gurumera_app) that cannot bypass row-level security.
set -e
psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  -v app_password="'$APP_DB_PASSWORD'" \
  -f /migrations/004_sprint0_security.sql

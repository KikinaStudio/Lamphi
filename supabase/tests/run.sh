#!/usr/bin/env bash
# Vérifie les règles d'accès (RLS) de la migration sur un PostgreSQL local jetable.
# Connexion via les variables standard PGHOST / PGPORT / PGUSER, par exemple :
#   PGHOST=localhost PGUSER=postgres ./supabase/tests/run.sh
# Le schéma auth/storage de Supabase est simulé par 00_supabase_stubs.sql.
set -euo pipefail
cd "$(dirname "$0")"
DB="lamphi_rls_test"
PSQL="psql -q -v ON_ERROR_STOP=1"
$PSQL -d postgres -c "drop database if exists $DB" -c "create database $DB" 2>/dev/null
$PSQL -d "$DB" -f 00_supabase_stubs.sql
$PSQL -d "$DB" -f ../migrations/20261023000000_init.sql
$PSQL -d "$DB" -f 10_rls.test.sql 2>&1 | grep -E "NOTICE|ERROR" | sed 's/^psql:[^ ]* NOTICE:  //'
$PSQL -d postgres -c "drop database $DB"

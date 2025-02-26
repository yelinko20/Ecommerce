#!/bin/bash

set -e

echo "🔄 Running Drizzle migrations for the API..."

if [ ! -d "apps/api/drizzle/migrations" ]; then
    echo "⚠️ No migrations found, generating new ones..."
    pnpm --filter=api db:generate
fi

pnpm --filter=api db:migrate

echo "✅ Migrations completed successfully for the API!"

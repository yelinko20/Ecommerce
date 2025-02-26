#!/bin/bash

set -e

echo "🚀 Setting up the API project..."

if ! command -v pnpm &> /dev/null
then
    echo "🔴 pnpm not found! Installing pnpm..."
    npm install -g pnpm
else
    echo "✅ pnpm is already installed!"
fi

echo "🔄 Installing dependencies..."
pnpm install --frozen-lockfile

echo "🔧 Setting up environment variables..."
cp .env.example .env

echo "🎉 API setup complete! You can now run the backend service."

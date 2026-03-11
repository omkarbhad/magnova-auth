#!/bin/bash

# Astrova Database Cleaning Script
# Provides different levels of database cleaning
# Usage: ./clean-db.sh [level]
# Levels: soft, medium, hard, reset

set -e

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL environment variable is not set"
    echo "Please export DATABASE_URL or set it in your .env file"
    exit 1
fi

# Default to soft cleaning if no level specified
LEVEL=${1:-soft}

echo "🧹 Astrova Database Cleaning - Level: $LEVEL"
echo "⚠️  This action cannot be undone. Please confirm to continue."
echo ""

case $LEVEL in
    "soft")
        echo "Soft clean - Removing chat sessions and credit logs only"
        echo "This preserves user accounts, settings, and saved charts"
        echo ""
        read -p "Continue with soft clean? (y/N): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            psql "$DATABASE_URL" << EOF
-- Delete chat sessions
DELETE FROM chat_sessions;

-- Delete credit logs (keeping current credits in users table)
DELETE FROM credit_transactions;

-- Show results
SELECT 'chat_sessions deleted' as table_name, count(*) as rows_affected FROM chat_sessions
UNION ALL
SELECT 'credit_transactions deleted' as table_name, count(*) as rows_affected FROM credit_transactions;
EOF
            echo "✅ Soft clean completed"
        fi
        ;;

    "medium")
        echo "Medium clean - Removing user data except core accounts"
        echo "This preserves user accounts but removes all their activity data"
        echo ""
        read -p "Continue with medium clean? (y/N): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            psql "$DATABASE_URL" << EOF
-- Delete chat sessions
DELETE FROM chat_sessions;

-- Delete credit logs
DELETE FROM credit_transactions;

-- Delete saved charts
DELETE FROM saved_charts;

-- Delete user settings
DELETE FROM user_settings;

-- Reset user credits and stats
UPDATE users
SET credits = 10,
    credits_used = 0,
    last_login_at = NULL,
    updated_at = now();

-- Show results
SELECT 'chat_sessions deleted' as table_name, count(*) as rows_affected FROM chat_sessions
UNION ALL
SELECT 'credit_transactions deleted' as table_name, count(*) as rows_affected FROM credit_transactions
UNION ALL
SELECT 'saved_charts deleted' as table_name, count(*) as rows_affected FROM saved_charts
UNION ALL
SELECT 'user_settings deleted' as table_name, count(*) as rows_affected FROM user_settings
UNION ALL
SELECT 'users reset' as table_name, count(*) as rows_affected FROM users;
EOF
            echo "✅ Medium clean completed"
        fi
        ;;

    "hard")
        echo "Hard clean - Removing all user data including accounts"
        echo "This removes everything except knowledge base and admin config"
        echo ""
        read -p "Continue with hard clean? (y/N): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            psql "$DATABASE_URL" << EOF
-- Delete all user-related data (cascade will handle dependent tables)
DELETE FROM users;

-- Show results
SELECT 'users deleted' as table_name, count(*) as rows_affected FROM users;
EOF
            echo "✅ Hard clean completed"
        fi
        ;;

    "reset")
        echo "Complete reset - Dropping and recreating all tables"
        echo "This will completely wipe your database"
        echo ""
        read -p "Continue with complete reset? (y/N): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            # Drop all tables
            psql "$DATABASE_URL" << EOF
DROP TABLE IF EXISTS chat_sessions CASCADE;
DROP TABLE IF EXISTS saved_charts CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS credit_transactions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS knowledge_base CASCADE;
DROP TABLE IF EXISTS admin_config CASCADE;
DROP TABLE IF EXISTS enabled_models CASCADE;
EOF
            echo "🗑️  Tables dropped"

            # Recreate schema
            if [ -f "./neon-schema.sql" ]; then
                psql "$DATABASE_URL" -f ./neon-schema.sql
                echo "✅ Schema recreated"
            else
                echo "⚠️  neon-schema.sql not found. Please run it manually to recreate schema."
            fi
        fi
        ;;

    *)
        echo "Invalid level: $LEVEL"
        echo "Usage: $0 [soft|medium|hard|reset]"
        echo ""
        echo "Levels:"
        echo "  soft   - Remove chat sessions and credit logs only"
        echo "  medium - Remove all user activity data, keep accounts"
        echo "  hard   - Remove all user data including accounts"
        echo "  reset  - Complete database wipe and schema reset"
        exit 1
        ;;
esac

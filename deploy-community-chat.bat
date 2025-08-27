@echo off
REM Deploy Community Chat Edge Function to Supabase
REM This script deploys the community-chat function and sets up the database

setlocal enabledelayedexpansion

REM Colors for output (Windows doesn't support ANSI colors by default)
set "INFO=[INFO]"
set "SUCCESS=[SUCCESS]"
set "WARNING=[WARNING]"
set "ERROR=[ERROR]"

echo %INFO% Starting Community Chat deployment...

REM Check if Supabase CLI is installed
where supabase >nul 2>&1
if %errorlevel% neq 0 (
    echo %ERROR% Supabase CLI is not installed. Please install it first:
    echo %ERROR% npm install -g supabase
    pause
    exit /b 1
)

REM Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo %ERROR% Node.js is not installed. Please install it first.
    pause
    exit /b 1
)

echo %SUCCESS% Requirements check passed

REM Check if we're in a Supabase project
if not exist "supabase\config.toml" (
    echo %ERROR% Not in a Supabase project. Please run 'supabase init' first.
    pause
    exit /b 1
)

echo %SUCCESS% Supabase project found

REM Check if community-chat function exists
if not exist "supabase\functions\community-chat" (
    echo %ERROR% Community chat function not found. Please ensure the function exists.
    pause
    exit /b 1
)

REM Deploy the Edge Function
echo %INFO% Deploying community-chat Edge Function...
supabase functions deploy community-chat --no-verify-jwt

if %errorlevel% equ 0 (
    echo %SUCCESS% Community chat function deployed successfully
) else (
    echo %ERROR% Failed to deploy community chat function
    pause
    exit /b 1
)

REM Check if migration file exists
if not exist "supabase\migrations\001_create_community_tables.sql" (
    echo %ERROR% Migration file not found. Please ensure migrations exist.
    pause
    exit /b 1
)

REM Ask user about database reset
echo %WARNING% This will reset your local database. Make sure you have backups if needed.
set /p "continue=Continue? (y/N): "

if /i "!continue!"=="y" (
    echo %INFO% Running database migrations...
    supabase db reset
    
    if %errorlevel% equ 0 (
        echo %SUCCESS% Database migrations applied successfully
    ) else (
        echo %ERROR% Failed to apply database migrations
        pause
        exit /b 1
    )
) else (
    echo %WARNING% Skipping database reset. You may need to manually apply migrations.
)

REM Set up environment variables
echo %INFO% Setting up environment variables...

if not exist ".env.local" (
    echo %WARNING% .env.local file not found. Creating template...
    (
        echo # Supabase Configuration
        echo VITE_SUPABASE_URL=your_supabase_url_here
        echo VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
        echo.
        echo # Community Chat Configuration
        echo VITE_COMMUNITY_CHAT_FUNCTION=community-chat
    ) > .env.local
    echo %WARNING% Please update .env.local with your actual Supabase credentials
) else (
    echo %SUCCESS% .env.local file found
)

REM Verify deployment
echo %INFO% Verifying deployment...

REM List functions to show deployment status
supabase functions list

echo.
echo %SUCCESS% Community Chat deployment completed!
echo %INFO% Next steps:
echo %INFO% 1. Update your .env.local file with actual Supabase credentials
echo %INFO% 2. Test the chat functionality in your application
echo %INFO% 3. Configure any additional settings in Supabase dashboard
echo.
pause

# Community Chat Setup Guide

This guide will help you set up and deploy the community chat functionality for the eKaty application.

## Overview

The community chat module provides real-time messaging capabilities for users to discuss restaurants, share experiences, and build a local food community. It includes:

- User authentication and profiles
- Real-time messaging with replies
- Message likes and reactions
- Message editing and deletion
- Online user status
- Moderation features

## Architecture

The system consists of:

1. **Frontend Components**: React components for the chat interface
2. **Backend Services**: Supabase Edge Functions for API endpoints
3. **Database**: PostgreSQL tables with Row Level Security (RLS)
4. **Authentication**: Supabase Auth integration

## Prerequisites

- Node.js 18+ and npm
- Supabase CLI (`npm install -g supabase`)
- Supabase project with Edge Functions enabled
- Git repository with the eKaty project

## Setup Instructions

### 1. Environment Configuration

Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Community Chat Configuration
VITE_COMMUNITY_CHAT_FUNCTION=community-chat
```

### 2. Database Setup

Run the database migrations to create the required tables:

```bash
# Apply migrations
supabase db reset

# Or manually run the migration file
psql -h your-db-host -U postgres -d postgres -f supabase/migrations/001_create_community_tables.sql
```

### 3. Deploy Edge Function

Deploy the community chat Edge Function:

```bash
# Deploy the function
supabase functions deploy community-chat --no-verify-jwt

# Verify deployment
supabase functions list
```

### 4. Build and Test

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start development server
npm run dev
```

## Database Schema

### Tables

#### `user_profiles`
- `id`: UUID (references auth.users)
- `username`: TEXT (unique)
- `email`: TEXT
- `avatar_url`: TEXT
- `created_at`: TIMESTAMP
- `last_seen`: TIMESTAMP
- `is_online`: BOOLEAN

#### `community_messages`
- `id`: UUID (primary key)
- `user_id`: UUID (references user_profiles)
- `username`: TEXT
- `avatar_url`: TEXT
- `message`: TEXT
- `timestamp`: TIMESTAMP
- `likes`: INTEGER
- `parent_id`: UUID (for replies)
- `is_edited`: BOOLEAN
- `edited_at`: TIMESTAMP
- `is_deleted`: BOOLEAN
- `deleted_at`: TIMESTAMP

#### `message_likes`
- `id`: UUID (primary key)
- `message_id`: UUID (references community_messages)
- `user_id`: UUID (references user_profiles)
- `timestamp`: TIMESTAMP

#### `online_users`
- `user_id`: UUID (references user_profiles)
- `username`: TEXT
- `avatar_url`: TEXT
- `last_seen`: TIMESTAMP
- `is_online`: BOOLEAN

### Row Level Security (RLS)

The database uses RLS policies to ensure:
- Users can only edit/delete their own messages
- Authenticated users can create messages and likes
- Anyone can view public messages and profiles
- Users can only update their own online status

## API Endpoints

### Health Check
```
GET /functions/v1/community-chat/health
```

### Messages
```
GET    /functions/v1/community-chat/messages
POST   /functions/v1/community-chat/messages
PUT    /functions/v1/community-chat/messages
DELETE /functions/v1/community-chat/messages
```

### Likes
```
POST /functions/v1/community-chat/like
```

### Users
```
GET  /functions/v1/community-chat/users
POST /functions/v1/community-chat/users/heartbeat
```

## Frontend Components

### Core Components

1. **Community.tsx**: Main chat page
2. **AuthModal.tsx**: User authentication modal
3. **MessageItem.tsx**: Individual message display
4. **UserService**: User management service
5. **CommunityChatService**: Chat functionality service

### Key Features

- **Real-time Messaging**: Messages are sent and received in real-time
- **User Authentication**: Secure sign-in/sign-up with Supabase Auth
- **Message Actions**: Like, reply, edit, and delete messages
- **User Profiles**: Customizable usernames and avatars
- **Online Status**: Shows who's currently online
- **Responsive Design**: Works on desktop and mobile devices

## Usage Examples

### Sending a Message

```typescript
import { communityChatService } from '../lib/community-chat-service'

// Send a message
const message = await communityChatService.sendMessage(
  "Just tried the new Italian place - amazing food!",
  undefined // no reply
)
```

### Liking a Message

```typescript
// Toggle like on a message
const liked = await communityChatService.toggleLike(messageId)
```

### Getting Online Users

```typescript
// Get list of online users
const onlineUsers = await communityChatService.getOnlineUsers()
```

## Security Features

1. **Authentication Required**: Users must sign in to post messages
2. **Ownership Verification**: Users can only edit/delete their own messages
3. **Input Validation**: Messages are sanitized and validated
4. **Rate Limiting**: Built-in protection against spam
5. **Content Moderation**: Framework for implementing moderation rules

## Troubleshooting

### Common Issues

1. **Connection Errors**
   - Check Supabase URL and API keys
   - Verify Edge Function is deployed
   - Check network connectivity

2. **Authentication Issues**
   - Ensure Supabase Auth is properly configured
   - Check user permissions and RLS policies
   - Verify email confirmation if required

3. **Database Errors**
   - Run migrations to ensure schema is up to date
   - Check RLS policies are correctly applied
   - Verify database connection

### Debug Mode

Enable debug logging in the browser console:

```typescript
// In your component
console.log('Connection status:', communityChatService.getConnectionStatus())
console.log('Current user:', userService.getCurrentUser())
```

## Performance Considerations

1. **Message Pagination**: Messages are loaded in batches (default: 50)
2. **Optimistic Updates**: UI updates immediately for better UX
3. **Connection Monitoring**: Automatic reconnection on network issues
4. **Heartbeat System**: Efficient online status tracking
5. **Indexed Queries**: Database queries are optimized with proper indexes

## Deployment

### Production Deployment

1. **Environment Variables**: Set production Supabase credentials
2. **Edge Functions**: Deploy to production Supabase project
3. **Database**: Run migrations on production database
4. **Build**: Create production build with `npm run build`
5. **Deploy**: Deploy to your hosting platform (Netlify, Vercel, etc.)

### Monitoring

- Monitor Edge Function performance in Supabase dashboard
- Track database query performance
- Monitor user engagement and message volume
- Set up error tracking and logging

## Contributing

When contributing to the community chat:

1. Follow the existing code style and patterns
2. Add proper error handling and validation
3. Include TypeScript types for new features
4. Test thoroughly before submitting changes
5. Update documentation for new features

## Support

For issues and questions:

1. Check the troubleshooting section above
2. Review Supabase documentation
3. Check browser console for error messages
4. Verify all environment variables are set correctly

## License

This community chat module is part of the eKaty application and follows the same licensing terms.

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_online BOOLEAN DEFAULT FALSE
);

-- Create community messages table
CREATE TABLE IF NOT EXISTS community_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  avatar_url TEXT,
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  likes INTEGER DEFAULT 0,
  parent_id UUID REFERENCES community_messages(id) ON DELETE CASCADE,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create message likes table
CREATE TABLE IF NOT EXISTS message_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES community_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

-- Create online users table
CREATE TABLE IF NOT EXISTS online_users (
  user_id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  avatar_url TEXT,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_online BOOLEAN DEFAULT TRUE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_community_messages_timestamp ON community_messages(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_community_messages_user_id ON community_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_community_messages_parent_id ON community_messages(parent_id);
CREATE INDEX IF NOT EXISTS idx_community_messages_not_deleted ON community_messages(id) WHERE NOT is_deleted;

CREATE INDEX IF NOT EXISTS idx_message_likes_message_id ON message_likes(message_id);
CREATE INDEX IF NOT EXISTS idx_message_likes_user_id ON message_likes(user_id);

CREATE INDEX IF NOT EXISTS idx_online_users_last_seen ON online_users(last_seen DESC);
CREATE INDEX IF NOT EXISTS idx_online_users_online ON online_users(is_online) WHERE is_online = TRUE;

-- Create functions for managing like counts
CREATE OR REPLACE FUNCTION increase_message_likes(message_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE community_messages 
  SET likes = likes + 1 
  WHERE id = message_id_param;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrease_message_likes(message_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE community_messages 
  SET likes = GREATEST(0, likes - 1) 
  WHERE id = message_id_param;
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_users ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view all profiles" ON user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Community messages policies
CREATE POLICY "Anyone can view non-deleted messages" ON community_messages
  FOR SELECT USING (NOT is_deleted);

CREATE POLICY "Authenticated users can create messages" ON community_messages
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own messages" ON community_messages
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages" ON community_messages
  FOR DELETE USING (auth.uid() = user_id);

-- Message likes policies
CREATE POLICY "Anyone can view message likes" ON message_likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create likes" ON message_likes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own likes" ON message_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Online users policies
CREATE POLICY "Anyone can view online users" ON online_users
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own online status" ON online_users
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own online status" ON online_users
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create trigger to update user profile when auth user is created
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, username, email, created_at, last_seen, is_online)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    NEW.email,
    NOW(),
    NOW(),
    FALSE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new auth users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert some sample data for testing
INSERT INTO user_profiles (id, username, email, created_at, last_seen, is_online) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Sarah M.', 'sarah@example.com', NOW() - INTERVAL '1 day', NOW() - INTERVAL '15 minutes', FALSE),
  ('00000000-0000-0000-0000-000000000002', 'Mike K.', 'mike@example.com', NOW() - INTERVAL '2 days', NOW() - INTERVAL '30 minutes', FALSE),
  ('00000000-0000-0000-0000-000000000003', 'James R.', 'james@example.com', NOW() - INTERVAL '3 days', NOW() - INTERVAL '45 minutes', FALSE),
  ('00000000-0000-0000-0000-000000000004', 'Emma L.', 'emma@example.com', NOW() - INTERVAL '4 days', NOW() - INTERVAL '1 hour', FALSE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO community_messages (id, user_id, username, message, timestamp, likes, parent_id, is_edited, is_deleted) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Sarah M.', 'Just tried the new Italian place on Mason Road - absolutely amazing! The pasta was perfectly cooked and the service was outstanding. Highly recommend! 🍝', NOW() - INTERVAL '15 minutes', 8, NULL, FALSE, FALSE),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Mike K.', 'Which dish did you try? I''ve been wanting to check it out!', NOW() - INTERVAL '10 minutes', 2, '00000000-0000-0000-0000-000000000001', FALSE, FALSE),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'James R.', 'Anyone know if Local Foods is still doing their happy hour specials? Planning to meet friends there later!', NOW() - INTERVAL '30 minutes', 3, NULL, FALSE, FALSE),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'Emma L.', 'The farmers market this weekend was incredible! Picked up some fresh ingredients and tried the new food truck. Katy''s food scene just keeps getting better! 🌟', NOW() - INTERVAL '45 minutes', 15, NULL, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;



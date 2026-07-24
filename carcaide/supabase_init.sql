-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create storage buckets for media
-- Note: These need to be created in the Supabase Storage dashboard
-- Buckets needed: profiles, posts, business, ads

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'particulier' CHECK (role IN ('admin', 'ondernemer', 'particulier', 'werkzoekende')),
  phone TEXT,
  website TEXT,
  social_media TEXT,
  profile_picture TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('vacatures', 'ondernemers', 'vraag_aanbod', 'evenementen', 'samen_reizen', 'diensten')),
  subcategory TEXT,
  price NUMERIC,
  location TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post media table
CREATE TABLE IF NOT EXISTS post_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business profiles table
CREATE TABLE IF NOT EXISTS business_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  business_name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  cover_photo_url TEXT,
  website TEXT,
  phone TEXT,
  social_media TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business ads table
CREATE TABLE IF NOT EXISTS business_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  media_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);
CREATE INDEX IF NOT EXISTS idx_post_media_post_id ON post_media(post_id);

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql;

-- Create Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admin can view all users" ON users
  FOR ALL USING (is_admin(auth.uid()));

-- Posts table policies
CREATE POLICY "Users can view active posts" ON posts
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create posts" ON posts
  FOR INSERT WITH CHECK (
    (user_id = auth.uid() AND category != 'diensten') OR
    (is_admin(auth.uid()) AND category = 'diensten')
  );

CREATE POLICY "Users can update their own posts" ON posts
  FOR UPDATE USING (
    (user_id = auth.uid() AND category != 'diensten') OR
    (is_admin(auth.uid()))
  );

CREATE POLICY "Users can delete their own posts" ON posts
  FOR DELETE USING (
    (user_id = auth.uid() AND category != 'diensten') OR
    (is_admin(auth.uid()))
  );

CREATE POLICY "Admin can manage all posts" ON posts
  FOR ALL USING (is_admin(auth.uid()));

-- Post media policies
CREATE POLICY "Users can view post media" ON post_media
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = post_media.post_id AND posts.is_active = true
    )
  );

CREATE POLICY "Users can create post media for their posts" ON post_media
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = post_media.post_id AND posts.user_id = auth.uid()
    ) OR is_admin(auth.uid())
  );

CREATE POLICY "Users can delete post media for their posts" ON post_media
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = post_media.post_id AND posts.user_id = auth.uid()
    ) OR is_admin(auth.uid())
  );

-- Business profiles policies
CREATE POLICY "Users can view business profiles" ON business_profiles
  FOR SELECT USING (true);

CREATE POLICY "Ondernemers can create their own business profile" ON business_profiles
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND (
      SELECT role FROM users WHERE id = auth.uid()
    ) = 'ondernemer'
  );

CREATE POLICY "Ondernemers can update their own business profile" ON business_profiles
  FOR UPDATE USING (user_id = auth.uid());

-- Business ads policies
CREATE POLICY "Users can view active business ads" ON business_ads
  FOR SELECT USING (is_active = true);

CREATE POLICY "Ondernemers can create ads for their business" ON business_ads
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_profiles 
      WHERE business_profiles.id = business_ads.business_profile_id 
      AND business_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Ondernemers can update their own ads" ON business_ads
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM business_profiles 
      WHERE business_profiles.id = business_ads.business_profile_id 
      AND business_profiles.user_id = auth.uid()
    )
  );

-- Comments policies
CREATE POLICY "Users can view comments on active posts" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = comments.post_id AND posts.is_active = true
    )
  );

CREATE POLICY "Users can create comments" ON comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = comments.post_id AND posts.is_active = true
    )
  );

CREATE POLICY "Users can delete their own comments" ON comments
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Admin can manage all comments" ON comments
  FOR ALL USING (is_admin(auth.uid()));

-- Insert initial admin user (run this once after creating the database)
-- REPLACE 'admin-email@example.com' and 'admin-password' with your credentials
-- INSERT INTO users (id, email, name, role, is_approved) 
-- VALUES (
--   'admin-user-id', 
--   'admin-email@example.com', 
--   'Admin', 
--   'admin', 
--   true
-- );

-- Note: You'll need to create the admin user through Supabase Auth first, then insert into users table

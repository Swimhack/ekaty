-- eKaty.com Database Schema Migration
-- Converting from legacy MySQL to Supabase PostgreSQL

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret-here';

-- Create custom types
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE restaurant_status AS ENUM ('active', 'inactive', 'pending');
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected');

-- Cuisine types table
CREATE TABLE cuisines (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Area of town table
CREATE TABLE areas (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(10),
    current_location_id INTEGER REFERENCES areas(id),
    status user_status DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    newsletter_subscribed BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Restaurants table
CREATE TABLE restaurants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city VARCHAR(100) DEFAULT 'Katy',
    state VARCHAR(50) DEFAULT 'Texas',
    zip_code VARCHAR(10),
    phone VARCHAR(20),
    website VARCHAR(255),
    email VARCHAR(255),
    hours JSONB, -- Store operating hours as JSON
    price_range INTEGER CHECK (price_range >= 1 AND price_range <= 4), -- 1-4 dollar signs
    
    -- Location data
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    area_id INTEGER REFERENCES areas(id),
    
    -- Cuisine classifications
    primary_cuisine_id INTEGER REFERENCES cuisines(id),
    secondary_cuisine_id INTEGER REFERENCES cuisines(id),
    tertiary_cuisine_id INTEGER REFERENCES cuisines(id),
    
    -- Features
    delivery_available BOOLEAN DEFAULT FALSE,
    wifi_available BOOLEAN DEFAULT FALSE,
    kid_friendly BOOLEAN DEFAULT FALSE,
    outdoor_seating BOOLEAN DEFAULT FALSE,
    accepts_reservations BOOLEAN DEFAULT FALSE,
    
    -- Business info
    status restaurant_status DEFAULT 'pending',
    featured BOOLEAN DEFAULT FALSE,
    featured_until TIMESTAMP WITH TIME ZONE,
    owner_user_id UUID REFERENCES auth.users(id),
    
    -- SEO and content
    slug VARCHAR(255) UNIQUE,
    meta_title VARCHAR(255),
    meta_description TEXT,
    
    -- Images
    logo_url TEXT,
    cover_image_url TEXT,
    gallery_images JSONB, -- Array of image URLs
    
    -- Social media
    facebook_url VARCHAR(255),
    twitter_url VARCHAR(255),
    instagram_url VARCHAR(255),
    
    -- Google Places integration
    google_place_id VARCHAR(255) UNIQUE,
    google_rating DECIMAL(3,2),
    google_reviews_count INTEGER DEFAULT 0,
    
    -- Statistics
    total_reviews INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    total_views INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Rating categories (1-5 stars each)
    food_rating INTEGER CHECK (food_rating >= 1 AND food_rating <= 5),
    service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
    value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
    atmosphere_rating INTEGER CHECK (atmosphere_rating >= 1 AND atmosphere_rating <= 5),
    overall_rating DECIMAL(3,2), -- Calculated average
    
    -- Review content
    title VARCHAR(255),
    content TEXT,
    pros TEXT,
    cons TEXT,
    
    -- Metadata
    status review_status DEFAULT 'pending',
    helpful_count INTEGER DEFAULT 0,
    reported_count INTEGER DEFAULT 0,
    
    -- Visit info
    visit_date DATE,
    party_size INTEGER,
    meal_type VARCHAR(50), -- breakfast, lunch, dinner, etc.
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure user can only review each restaurant once
    UNIQUE(restaurant_id, user_id)
);

-- User favorites table
CREATE TABLE user_favorites (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, restaurant_id)
);

-- User locations table (for multiple saved locations)
CREATE TABLE user_locations (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- "Home", "Work", etc.
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    area_id INTEGER REFERENCES areas(id),
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin users table
CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    username VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'admin', -- admin, super_admin, moderator
    permissions JSONB, -- Store permissions as JSON
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Login logs
CREATE TABLE login_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    user_type VARCHAR(20), -- 'member', 'admin'
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Application logs
CREATE TABLE application_logs (
    id SERIAL PRIMARY KEY,
    level VARCHAR(20) NOT NULL, -- error, warning, info, debug
    message TEXT NOT NULL,
    context JSONB, -- Additional context data
    user_id UUID REFERENCES auth.users(id),
    ip_address INET,
    user_agent TEXT,
    stack_trace TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Newsletter subscriptions
CREATE TABLE newsletter_subscriptions (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    subscribed BOOLEAN DEFAULT TRUE,
    subscription_source VARCHAR(100), -- 'website', 'admin', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Search logs (for analytics)
CREATE TABLE search_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    search_term VARCHAR(255),
    search_type VARCHAR(50), -- 'restaurant', 'cuisine', 'craving', etc.
    results_count INTEGER,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_restaurants_status ON restaurants(status);
CREATE INDEX idx_restaurants_featured ON restaurants(featured, featured_until);
CREATE INDEX idx_restaurants_cuisine ON restaurants(primary_cuisine_id);
CREATE INDEX idx_restaurants_area ON restaurants(area_id);
CREATE INDEX idx_restaurants_location ON restaurants(latitude, longitude);
CREATE INDEX idx_restaurants_slug ON restaurants(slug);

CREATE INDEX idx_reviews_restaurant ON reviews(restaurant_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_rating ON reviews(overall_rating);

CREATE INDEX idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_restaurant ON user_favorites(restaurant_id);

CREATE INDEX idx_login_logs_user ON login_logs(user_id);
CREATE INDEX idx_login_logs_created ON login_logs(created_at);

CREATE INDEX idx_application_logs_level ON application_logs(level);
CREATE INDEX idx_application_logs_created ON application_logs(created_at);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view active restaurants" ON restaurants
    FOR SELECT USING (status = 'active');

CREATE POLICY "Restaurant owners can update their restaurants" ON restaurants
    FOR UPDATE USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can view approved reviews" ON reviews
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can create reviews" ON reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own favorites" ON user_favorites
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own locations" ON user_locations
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Only admins can access admin table" ON admin_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid()
        )
    );

-- Create functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_locations_updated_at BEFORE UPDATE ON user_locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate restaurant average rating
CREATE OR REPLACE FUNCTION update_restaurant_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE restaurants SET
        average_rating = (
            SELECT AVG(overall_rating)
            FROM reviews
            WHERE restaurant_id = COALESCE(NEW.restaurant_id, OLD.restaurant_id)
            AND status = 'approved'
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM reviews
            WHERE restaurant_id = COALESCE(NEW.restaurant_id, OLD.restaurant_id)
            AND status = 'approved'
        )
    WHERE id = COALESCE(NEW.restaurant_id, OLD.restaurant_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create trigger for automatic rating updates
CREATE TRIGGER update_restaurant_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_restaurant_rating();

-- Function to calculate overall rating from individual ratings
CREATE OR REPLACE FUNCTION calculate_overall_rating()
RETURNS TRIGGER AS $$
BEGIN
    NEW.overall_rating = (
        NEW.food_rating + NEW.service_rating + NEW.value_rating + NEW.atmosphere_rating
    ) / 4.0;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic overall rating calculation
CREATE TRIGGER calculate_overall_rating_trigger
    BEFORE INSERT OR UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION calculate_overall_rating();
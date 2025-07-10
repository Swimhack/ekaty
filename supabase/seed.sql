-- Seed data for eKaty.com

-- Insert initial cuisines
INSERT INTO cuisines (name, description) VALUES
('American', 'Traditional American cuisine'),
('Italian', 'Italian dishes and pasta'),
('Mexican', 'Mexican and Tex-Mex cuisine'),
('Chinese', 'Chinese cuisine and Asian fusion'),
('Japanese', 'Japanese cuisine including sushi'),
('Thai', 'Thai cuisine and flavors'),
('Indian', 'Indian curry and traditional dishes'),
('French', 'French cuisine and bistro fare'),
('Mediterranean', 'Mediterranean and Greek dishes'),
('BBQ', 'Barbecue and smoked meats'),
('Seafood', 'Fresh seafood and fish dishes'),
('Steakhouse', 'Premium steaks and grilled meats'),
('Pizza', 'Pizza and Italian-American'),
('Burgers', 'Burgers and casual American'),
('Fast Food', 'Quick service restaurants'),
('Bakery', 'Baked goods and desserts'),
('Cafe', 'Coffee shops and light meals'),
('Breakfast', 'Breakfast and brunch'),
('Vegetarian', 'Vegetarian and plant-based'),
('Vegan', 'Vegan cuisine'),
('Healthy', 'Health-conscious options'),
('Sports Bar', 'Sports bars with food'),
('Fine Dining', 'Upscale dining experience');

-- Insert Katy area locations
INSERT INTO areas (name, description) VALUES
('Old Katy', 'Historic downtown Katy area'),
('Cinco Ranch', 'Master-planned community in Katy'),
('Cross Creek Ranch', 'Newer development area'),
('Mason Creek', 'Established Katy neighborhood'),
('Nottingham Country', 'Country club area'),
('Pine Forest', 'Residential area in Katy'),
('Kelliwood', 'Katy subdivision'),
('Grand Lakes', 'Katy community near Grand Parkway'),
('Firethorne', 'Katy master-planned community'),
('Jordan Ranch', 'Newer Katy development'),
('Falcon Ranch', 'Katy residential area'),
('Windmill Lakes', 'Katy neighborhood'),
('Seven Meadows', 'Established Katy area'),
('Kingsland', 'Katy community'),
('Westpark Tollway', 'Commercial corridor'),
('I-10 Corridor', 'Interstate 10 commercial area'),
('Highland Knolls', 'Katy residential area'),
('Lakes of Rosehill', 'Katy community'),
('Cane Island', 'New master-planned community'),
('Green Trails', 'Katy golf course community');

-- Insert sample restaurants (representative of Katy area)
INSERT INTO restaurants (
    name, description, address, city, state, zip_code, phone, website,
    primary_cuisine_id, secondary_cuisine_id, area_id,
    price_range, delivery_available, wifi_available, kid_friendly,
    status, featured, slug
) VALUES
(
    'The Rouxpour',
    'Upscale Cajun and Creole cuisine with a modern twist',
    '23119 Colonial Pkwy',
    'Katy', 'Texas', '77449',
    '(281) 717-4499',
    'https://therouxpour.com',
    (SELECT id FROM cuisines WHERE name = 'American'),
    (SELECT id FROM cuisines WHERE name = 'Fine Dining'),
    (SELECT id FROM areas WHERE name = 'Cinco Ranch'),
    3, TRUE, TRUE, TRUE,
    'active', TRUE, 'the-rouxpour'
),
(
    'Local Table',
    'Farm-to-table American cuisine with local ingredients',
    '23501 Cinco Ranch Blvd',
    'Katy', 'Texas', '77494',
    '(281) 395-0102',
    'https://localtablekaty.com',
    (SELECT id FROM cuisines WHERE name = 'American'),
    (SELECT id FROM cuisines WHERE name = 'Healthy'),
    (SELECT id FROM areas WHERE name = 'Cinco Ranch'),
    3, FALSE, TRUE, TRUE,
    'active', FALSE, 'local-table'
),
(
    'Perry''s Steakhouse',
    'Premium steakhouse with famous pork chop',
    '23501 Cinco Ranch Blvd',
    'Katy', 'Texas', '77494',
    '(281) 347-3600',
    'https://perryssteakhouse.com',
    (SELECT id FROM cuisines WHERE name = 'Steakhouse'),
    (SELECT id FROM cuisines WHERE name = 'Fine Dining'),
    (SELECT id FROM areas WHERE name = 'Cinco Ranch'),
    4, FALSE, TRUE, FALSE,
    'active', TRUE, 'perrys-steakhouse'
),
(
    'Grub Burger Bar',
    'Gourmet burgers and craft beer',
    '25725 Katy Fwy',
    'Katy', 'Texas', '77494',
    '(281) 769-7555',
    'https://grubburger.com',
    (SELECT id FROM cuisines WHERE name = 'Burgers'),
    (SELECT id FROM cuisines WHERE name = 'American'),
    (SELECT id FROM areas WHERE name = 'I-10 Corridor'),
    2, TRUE, TRUE, TRUE,
    'active', FALSE, 'grub-burger-bar'
),
(
    'Zoes Kitchen',
    'Mediterranean fast-casual dining',
    '1425 S Mason Rd',
    'Katy', 'Texas', '77450',
    '(281) 492-9637',
    'https://zoeskitchen.com',
    (SELECT id FROM cuisines WHERE name = 'Mediterranean'),
    (SELECT id FROM cuisines WHERE name = 'Healthy'),
    (SELECT id FROM areas WHERE name = 'Mason Creek'),
    2, TRUE, TRUE, TRUE,
    'active', FALSE, 'zoes-kitchen'
);

-- Insert sample admin user (will need to be linked to actual Supabase auth user)
-- This is just the structure - actual admin users should be created through the app
INSERT INTO admin_users (username, role, permissions) VALUES
('admin', 'super_admin', '{"restaurants": ["create", "read", "update", "delete"], "users": ["read", "update"], "reviews": ["read", "update", "delete"], "admin": ["create", "read", "update", "delete"]}');

-- Add some sample reviews (these would normally be created by actual users)
-- Note: user_id values are placeholders - these should be actual UUID values from auth.users

-- Function to create application logs for system events
INSERT INTO application_logs (level, message, context) VALUES
('info', 'Database seeded successfully', '{"migration": "001_initial_schema", "timestamp": "' || NOW() || '"}'),
('info', 'Sample data inserted', '{"restaurants": 5, "cuisines": 23, "areas": 20}');

-- Create some sample newsletter subscriptions
INSERT INTO newsletter_subscriptions (email, subscription_source) VALUES
('test@example.com', 'seed_data'),
('demo@ekaty.com', 'seed_data');

-- Note: In a real application, you would populate this with actual data from:
-- 1. Google Places API for restaurant information
-- 2. User registration system for user profiles
-- 3. Review submission system for reviews
-- 4. Admin panel for restaurant management
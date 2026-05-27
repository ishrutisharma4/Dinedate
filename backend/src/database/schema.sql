-- Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  city TEXT DEFAULT 'Mumbai',
  lat REAL DEFAULT 19.076,
  lng REAL DEFAULT 72.877,
  bio TEXT DEFAULT '',
  photo TEXT,
  onboarding_complete INTEGER DEFAULT 0,
  food_preferences TEXT DEFAULT '{}',
  dining_habits TEXT DEFAULT '{}',
  stats TEXT DEFAULT '{"swipes":0,"matches":0,"dates":0}',
  created_at TEXT DEFAULT (datetime('now'))
);

-- Likes
CREATE TABLE IF NOT EXISTS likes (
  id TEXT PRIMARY KEY,
  liker_id TEXT NOT NULL,
  liked_id TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(liker_id, liked_id),
  FOREIGN KEY (liker_id) REFERENCES users(id),
  FOREIGN KEY (liked_id) REFERENCES users(id)
);

-- Matches
CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  user_a_id TEXT NOT NULL,
  user_b_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending_cuisine',
  user_a_cuisines TEXT DEFAULT '[]',
  user_b_cuisines TEXT DEFAULT '[]',
  mutual_cuisines TEXT DEFAULT '[]',
  restaurant TEXT DEFAULT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_a_id) REFERENCES users(id),
  FOREIGN KEY (user_b_id) REFERENCES users(id)
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  match_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (match_id) REFERENCES matches(id),
  FOREIGN KEY (sender_id) REFERENCES users(id)
);

-- Restaurant cache
CREATE TABLE IF NOT EXISTS restaurant_cache (
  place_id TEXT PRIMARY KEY,
  name TEXT,
  cuisine TEXT,
  cuisines TEXT DEFAULT '[]',
  rating REAL,
  total_ratings INTEGER,
  price_level INTEGER,
  lat REAL,
  lng REAL,
  address TEXT,
  city TEXT,
  open_now INTEGER,
  photo_url TEXT,
  cached_at TEXT DEFAULT (datetime('now'))
);

-- Seed demo user
INSERT OR IGNORE INTO users (id, name, email, password_hash, age, gender, city, bio, onboarding_complete, food_preferences, stats)
VALUES (
  'demo-user-1',
  'Demo User',
  'demo@dinedate.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  27,
  'Woman',
  'Mumbai',
  'Food is my love language. Big fan of everything from street food to fine dining!',
  1,
  '{"cuisines":["Indian","Italian","Japanese"],"meal_types":["dinner","lunch"],"restaurant_type":["casual","fine_dining"],"price_range":"$$"}',
  '{"swipes":42,"matches":7,"dates":2}'
);

-- Seed match profiles
INSERT OR IGNORE INTO users (id, name, email, password_hash, age, gender, city, bio, onboarding_complete, food_preferences)
VALUES
  ('profile-1','Priya','priya@demo.com','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',26,'Woman','Mumbai','Biryani enthusiast. Will travel 20km for good food.',1,'{"cuisines":["Indian","Thai","Japanese"],"meal_types":["dinner"],"restaurant_type":["casual","fine_dining"],"price_range":"$$"}'),
  ('profile-2','Arjun','arjun@demo.com','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',29,'Man','Mumbai','I rate restaurants before dates. Priorities sorted.',1,'{"cuisines":["Italian","Japanese","French"],"meal_types":["dinner","lunch"],"restaurant_type":["fine_dining"],"price_range":"$$$"}'),
  ('profile-3','Sneha','sneha@demo.com','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',24,'Woman','Mumbai','Chai > Coffee. Masala dosa is my love language.',1,'{"cuisines":["Indian","Chinese","Mexican"],"meal_types":["breakfast","lunch"],"restaurant_type":["cafe","casual"],"price_range":"$"}'),
  ('profile-4','Rahul','rahul@demo.com','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',31,'Man','Bangalore','Weekend brunch connoisseur. Avocado toast is non-negotiable.',1,'{"cuisines":["Mediterranean","Italian","American"],"meal_types":["breakfast","dinner"],"restaurant_type":["cafe","fine_dining"],"price_range":"$$"}');

const axios = require('axios')

const CITY_COORDS = {
  Bangalore: { lat: 12.9716, lng: 77.5946 },
  Mumbai: { lat: 19.0760, lng: 72.8777 },
  Delhi: { lat: 28.6139, lng: 77.2090 },
  Hyderabad: { lat: 17.3850, lng: 78.4867 },
  Pune: { lat: 18.5204, lng: 73.8567 },
  Chennai: { lat: 13.0827, lng: 80.2707 },
}

// Real Bangalore restaurants curated by cuisine
const BANGALORE_RESTAURANTS = {
  Indian: [
    { id: 'blr-in-1', name: 'MTR (Mavalli Tiffin Rooms)', cuisine: 'Indian', cuisines: ['Indian', 'South Indian'], rating: 4.7, total_ratings: 8420, price_level: 1, distance: 1200, open_now: true, address: 'Lalbagh Rd, Mavalli, Bangalore', mood: ['casual', 'heritage'], photo_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop', dietary: ['vegetarian'], match_pct: 94 },
    { id: 'blr-in-2', name: "Brahmin's Coffee Bar", cuisine: 'Indian', cuisines: ['Indian', 'South Indian'], rating: 4.6, total_ratings: 5100, price_level: 1, distance: 900, open_now: true, address: 'Shankarapuram, Basavanagudi', mood: ['casual', 'local'], photo_url: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=600&h=400&fit=crop', dietary: ['vegetarian'], match_pct: 88 },
    { id: 'blr-in-3', name: 'The Permit Room', cuisine: 'Indian', cuisines: ['Indian', 'Cocktail bar'], rating: 4.5, total_ratings: 3200, price_level: 3, distance: 2100, open_now: true, address: 'Indiranagar, Bangalore', mood: ['lively', 'date_night'], photo_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop', dietary: ['non-vegetarian'], match_pct: 91 },
    { id: 'blr-in-4', name: 'Karavalli', cuisine: 'Indian', cuisines: ['Indian', 'Coastal'], rating: 4.8, total_ratings: 4300, price_level: 3, distance: 3200, open_now: true, address: 'Gateway Hotel, Residency Rd', mood: ['romantic', 'fine_dining'], photo_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&h=400&fit=crop', dietary: ['non-vegetarian'], match_pct: 96 },
  ],
  Italian: [
    { id: 'blr-it-1', name: 'Fenny\'s Lounge & Kitchen', cuisine: 'Italian', cuisines: ['Italian', 'European'], rating: 4.4, total_ratings: 2800, price_level: 3, distance: 1800, open_now: true, address: 'Vittal Mallya Rd, Bangalore', mood: ['romantic', 'date_night'], photo_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop', dietary: ['vegetarian-friendly'], match_pct: 89 },
    { id: 'blr-it-2', name: 'Pizza Republic', cuisine: 'Italian', cuisines: ['Italian', 'Pizza'], rating: 4.3, total_ratings: 1900, price_level: 2, distance: 1100, open_now: true, address: 'Koramangala 5th Block', mood: ['casual', 'fun'], photo_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop', dietary: ['vegetarian-friendly'], match_pct: 82 },
    { id: 'blr-it-3', name: 'Trattoria', cuisine: 'Italian', cuisines: ['Italian', 'Mediterranean'], rating: 4.5, total_ratings: 2100, price_level: 3, distance: 2400, open_now: true, address: 'Taj West End, Race Course Rd', mood: ['fine_dining', 'romantic'], photo_url: 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=600&h=400&fit=crop', dietary: ['vegetarian-friendly'], match_pct: 92 },
  ],
  American: [
    { id: 'blr-am-1', name: 'Truffles', cuisine: 'American', cuisines: ['American', 'Burgers'], rating: 4.6, total_ratings: 12400, price_level: 2, distance: 800, open_now: true, address: 'St. Marks Road, Bangalore', mood: ['casual', 'fun', 'lively'], photo_url: 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=600&h=400&fit=crop', dietary: ['non-vegetarian'], match_pct: 97 },
    { id: 'blr-am-2', name: 'The Black Pearl', cuisine: 'American', cuisines: ['American', 'Seafood'], rating: 4.4, total_ratings: 3100, price_level: 3, distance: 2800, open_now: false, address: 'MG Road, Bangalore', mood: ['date_night', 'lively'], photo_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop', dietary: ['non-vegetarian'], match_pct: 85 },
  ],
  Craft_Beer: [
    { id: 'blr-cb-1', name: 'Toit Brewpub', cuisine: 'Craft Beer', cuisines: ['American', 'Pub grub', 'Craft Beer'], rating: 4.6, total_ratings: 18200, price_level: 2, distance: 1600, open_now: true, address: 'Indiranagar, Bangalore', mood: ['lively', 'fun', 'casual'], photo_url: 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=600&h=400&fit=crop', dietary: ['non-vegetarian'], match_pct: 99 },
    { id: 'blr-cb-2', name: 'Windmills Craftworks', cuisine: 'Craft Beer', cuisines: ['Continental', 'Craft Beer'], rating: 4.5, total_ratings: 6300, price_level: 2, distance: 4200, open_now: true, address: 'Whitefield, Bangalore', mood: ['lively', 'date_night'], photo_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop', dietary: ['non-vegetarian'], match_pct: 88 },
  ],
  Cafe: [
    { id: 'blr-ca-1', name: 'Koshy\'s', cuisine: 'Cafe', cuisines: ['Cafe', 'Continental'], rating: 4.5, total_ratings: 7800, price_level: 2, distance: 1400, open_now: true, address: 'St. Marks Rd, Bangalore', mood: ['heritage', 'casual', 'cozy'], photo_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop', dietary: ['vegetarian-friendly'], match_pct: 91 },
    { id: 'blr-ca-2', name: 'The Hole in the Wall Cafe', cuisine: 'Cafe', cuisines: ['Cafe', 'Breakfast'], rating: 4.3, total_ratings: 2900, price_level: 2, distance: 1100, open_now: true, address: 'Koramangala, Bangalore', mood: ['cozy', 'hidden_gem'], photo_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop', dietary: ['vegetarian-friendly'], match_pct: 84 },
    { id: 'blr-ca-3', name: 'Third Wave Coffee', cuisine: 'Cafe', cuisines: ['Cafe', 'Brunch'], rating: 4.4, total_ratings: 4500, price_level: 2, distance: 700, open_now: true, address: 'Indiranagar 12th Main', mood: ['cozy', 'casual'], photo_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop', dietary: ['vegetarian-friendly'], match_pct: 87 },
  ],
  Japanese: [
    { id: 'blr-jp-1', name: 'Harima', cuisine: 'Japanese', cuisines: ['Japanese', 'Sushi'], rating: 4.5, total_ratings: 2200, price_level: 3, distance: 3100, open_now: true, address: 'Lavelle Rd, Bangalore', mood: ['fine_dining', 'romantic'], photo_url: 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=600&h=400&fit=crop', dietary: ['non-vegetarian'], match_pct: 90 },
  ],
  Chinese: [
    { id: 'blr-cn-1', name: 'Burma Burma', cuisine: 'Chinese', cuisines: ['Burmese', 'Asian'], rating: 4.6, total_ratings: 4100, price_level: 2, distance: 1900, open_now: true, address: 'Indiranagar, Bangalore', mood: ['casual', 'unique'], photo_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&h=400&fit=crop', dietary: ['vegetarian-friendly'], match_pct: 93 },
  ],
  Mediterranean: [
    { id: 'blr-me-1', name: 'Social', cuisine: 'Mediterranean', cuisines: ['Mediterranean', 'Continental'], rating: 4.3, total_ratings: 8900, price_level: 2, distance: 1300, open_now: true, address: 'Koramangala, Bangalore', mood: ['lively', 'casual', 'fun'], photo_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop', dietary: ['vegetarian-friendly'], match_pct: 86 },
  ],
  Rooftop: [
    { id: 'blr-rt-1', name: 'Skyye', cuisine: 'Continental', cuisines: ['Continental', 'Rooftop'], rating: 4.7, total_ratings: 3400, price_level: 3, distance: 2600, open_now: true, address: 'UB City, Vittal Mallya Rd', mood: ['romantic', 'rooftop', 'date_night'], photo_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop', dietary: ['non-vegetarian'], match_pct: 95 },
    { id: 'blr-rt-2', name: 'Rooftop Restaurant at 1 MG', cuisine: 'Continental', cuisines: ['Continental', 'Rooftop'], rating: 4.4, total_ratings: 2100, price_level: 3, distance: 1800, open_now: true, address: '1 MG Mall, MG Road', mood: ['rooftop', 'date_night'], photo_url: 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=600&h=400&fit=crop', dietary: ['non-vegetarian'], match_pct: 88 },
  ],
}

// Mood-based restaurant picks
const MOOD_RESTAURANTS = {
  romantic: ['blr-it-3', 'blr-in-4', 'blr-rt-1', 'blr-jp-1'],
  lively: ['blr-cb-1', 'blr-am-1', 'blr-me-1', 'blr-cb-2'],
  cozy: ['blr-ca-1', 'blr-ca-2', 'blr-ca-3'],
  hidden_gem: ['blr-ca-2', 'blr-cn-1', 'blr-in-2'],
  rooftop: ['blr-rt-1', 'blr-rt-2'],
  date_night: ['blr-rt-1', 'blr-it-3', 'blr-in-4', 'blr-jp-1'],
  casual: ['blr-am-1', 'blr-cb-1', 'blr-ca-3', 'blr-in-2'],
}

async function getNearbyRestaurants({ cuisines = [], city = 'Bangalore', priceLevel = 2, mood = null }) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
    return getMockRestaurants(cuisines, mood)
  }

  const coords = CITY_COORDS[city] || CITY_COORDS.Bangalore
  try {
    const keyword = cuisines.slice(0, 2).join(' OR ') + ' restaurant'
    const res = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
      params: { location: `${coords.lat},${coords.lng}`, radius: 5000, type: 'restaurant', keyword, maxprice: priceLevel + 1, opennow: true, key: apiKey },
    })
    return res.data.results.slice(0, 10).map(place => ({
      id: place.place_id,
      name: place.name,
      cuisine: cuisines[0] || 'Restaurant',
      cuisines,
      rating: place.rating,
      total_ratings: place.user_ratings_total,
      price_level: place.price_level,
      distance: null,
      open_now: place.opening_hours?.open_now,
      address: place.vicinity,
      mood: [mood || 'casual'],
      match_pct: Math.floor(70 + Math.random() * 28),
      photo_url: place.photos?.[0]
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photoreference=${place.photos[0].photo_reference}&key=${apiKey}`
        : null,
    }))
  } catch (err) {
    console.error('Google Maps error, falling back to mock:', err.message)
    return getMockRestaurants(cuisines, mood)
  }
}

function getMockRestaurants(cuisines = [], mood = null) {
  const seen = new Set()
  let results = []

  // Mood-based first
  if (mood && MOOD_RESTAURANTS[mood]) {
    const allRests = Object.values(BANGALORE_RESTAURANTS).flat()
    const moodIds = MOOD_RESTAURANTS[mood]
    moodIds.forEach(id => {
      const r = allRests.find(x => x.id === id)
      if (r && !seen.has(r.id)) { results.push(r); seen.add(r.id) }
    })
  }

  // Then cuisine-based
  for (const cuisine of cuisines) {
    const key = Object.keys(BANGALORE_RESTAURANTS).find(k => k.toLowerCase() === cuisine.toLowerCase())
    if (key) {
      BANGALORE_RESTAURANTS[key].forEach(r => {
        if (!seen.has(r.id)) { results.push(r); seen.add(r.id) }
      })
    }
  }

  // Fill with Toit (most popular) if still short
  if (results.length < 4) {
    Object.values(BANGALORE_RESTAURANTS).flat().forEach(r => {
      if (!seen.has(r.id) && results.length < 8) { results.push(r); seen.add(r.id) }
    })
  }

  return results.slice(0, 10)
}

function getAllBangaloreRestaurants() {
  return Object.values(BANGALORE_RESTAURANTS).flat()
}

module.exports = { getNearbyRestaurants, getAllBangaloreRestaurants }

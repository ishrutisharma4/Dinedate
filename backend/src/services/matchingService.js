function jaccardSimilarity(a = [], b = []) {
  if (!a.length || !b.length) return 0
  const setA = new Set(a)
  const setB = new Set(b)
  const intersection = [...setA].filter(x => setB.has(x))
  const union = new Set([...setA, ...setB])
  return intersection.length / union.size
}

function priceScore(a, b) {
  const map = { '$': 1, '$$': 2, '$$$': 3 }
  const diff = Math.abs((map[a] || 2) - (map[b] || 2))
  return 1 - diff / 2
}

function computeMatchScore(prefsA, prefsB) {
  const cuisineScore = jaccardSimilarity(prefsA.cuisines, prefsB.cuisines)
  const price = priceScore(prefsA.price_range, prefsB.price_range)
  const atmosphere = jaccardSimilarity(prefsA.restaurant_type, prefsB.restaurant_type)
  const meals = jaccardSimilarity(prefsA.meal_types, prefsB.meal_types)

  return 0.40 * cuisineScore + 0.20 * price + 0.20 * atmosphere + 0.20 * meals
}

function getCuisineOverlap(cuisinesA, cuisinesB) {
  const setB = new Set(cuisinesB)
  return cuisinesA.filter(c => setB.has(c))
}

module.exports = { computeMatchScore, getCuisineOverlap, jaccardSimilarity }

export default function RestaurantCard({ restaurant, onSelect, selected }) {
  const stars = '★'.repeat(Math.floor(restaurant.rating || 4)) + '☆'.repeat(5 - Math.floor(restaurant.rating || 4))
  const price = '$'.repeat(restaurant.price_level || 2)

  return (
    <div
      style={{ ...styles.card, border: selected ? '2px solid #E07B39' : '2px solid transparent' }}
      onClick={() => onSelect?.(restaurant)}
    >
      <div style={styles.imageWrap}>
        <img
          src={restaurant.photo_url || `https://source.unsplash.com/300x200/?restaurant,${restaurant.cuisine || 'food'}`}
          alt={restaurant.name}
          style={styles.image}
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&h=200&fit=crop' }}
        />
        {selected && <div style={styles.selectedBadge}>✓ Selected</div>}
      </div>
      <div style={styles.body}>
        <div style={styles.header}>
          <h3 style={styles.name}>{restaurant.name}</h3>
          <span style={styles.price}>{price}</span>
        </div>
        <div style={styles.row}>
          <span style={styles.stars}>{stars}</span>
          <span style={styles.rating}>{restaurant.rating?.toFixed(1) || '4.2'} ({restaurant.total_ratings || 0})</span>
        </div>
        <div style={styles.tags}>
          {(restaurant.cuisines || [restaurant.cuisine]).filter(Boolean).map(c => (
            <span key={c} style={styles.tag}>{c}</span>
          ))}
        </div>
        <div style={styles.footer}>
          <span style={styles.meta}>📍 {restaurant.distance ? `${restaurant.distance}m away` : 'Nearby'}</span>
          {restaurant.open_now !== undefined && (
            <span style={{ ...styles.openBadge, background: restaurant.open_now ? '#E8F5E9' : '#FFF3E0', color: restaurant.open_now ? '#2E7D32' : '#E65100' }}>
              {restaurant.open_now ? '● Open' : '○ Closed'}
            </span>
          )}
        </div>
        {restaurant.address && <p style={styles.address}>{restaurant.address}</p>}
      </div>
    </div>
  )
}

const styles = {
  card: { background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', cursor: 'pointer', transition: 'all 0.2s ease' },
  imageWrap: { position: 'relative', width: '100%', height: 160 },
  image: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  selectedBadge: { position: 'absolute', top: 10, right: 10, background: '#E07B39', color: 'white', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 50 },
  body: { padding: '14px 16px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  name: { fontSize: 15, fontWeight: 700, color: '#1A1A1A', flex: 1, marginRight: 8 },
  price: { fontSize: 13, fontWeight: 700, color: '#E07B39' },
  row: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 },
  stars: { color: '#F4C430', fontSize: 13 },
  rating: { fontSize: 12, color: '#666', fontWeight: 500 },
  tags: { display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 },
  tag: { fontSize: 11, background: '#FFF0E6', color: '#E07B39', padding: '3px 8px', borderRadius: 50, fontWeight: 500 },
  footer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  meta: { fontSize: 12, color: '#999' },
  openBadge: { fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 50 },
  address: { fontSize: 11, color: '#AAA', marginTop: 6, lineHeight: 1.4 },
}

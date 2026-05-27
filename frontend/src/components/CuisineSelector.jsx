const CUISINES = [
  { id: 'Indian', icon: '🍛', label: 'Indian' },
  { id: 'Italian', icon: '🍝', label: 'Italian' },
  { id: 'Japanese', icon: '🍱', label: 'Japanese' },
  { id: 'Chinese', icon: '🥡', label: 'Chinese' },
  { id: 'Mexican', icon: '🌮', label: 'Mexican' },
  { id: 'Thai', icon: '🍜', label: 'Thai' },
  { id: 'American', icon: '🍔', label: 'American' },
  { id: 'Mediterranean', icon: '🥙', label: 'Mediterranean' },
  { id: 'Korean', icon: '🍲', label: 'Korean' },
  { id: 'French', icon: '🥐', label: 'French' },
  { id: 'Cafe', icon: '☕', label: 'Cafe' },
  { id: 'Pizza', icon: '🍕', label: 'Pizza' },
]

export { CUISINES }

export default function CuisineSelector({ selected = [], onChange, maxSelect = 5 }) {
  const toggle = (id) => {
    if (selected.includes(id)) {
      onChange(selected.filter(c => c !== id))
    } else if (selected.length < maxSelect) {
      onChange([...selected, id])
    }
  }

  return (
    <div style={styles.grid}>
      {CUISINES.map(c => {
        const isSelected = selected.includes(c.id)
        return (
          <button
            key={c.id}
            style={{ ...styles.item, ...(isSelected ? styles.selectedItem : {}) }}
            onClick={() => toggle(c.id)}
            type="button"
          >
            <span style={{ fontSize: 28 }}>{c.icon}</span>
            <span style={{ ...styles.label, color: isSelected ? 'white' : '#1A1A1A' }}>{c.label}</span>
          </button>
        )
      })}
    </div>
  )
}

const styles = {
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 },
  item: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    padding: '14px 8px', borderRadius: 14, border: '2px solid #E8DDD3',
    background: 'white', cursor: 'pointer', transition: 'all 0.15s ease',
    fontFamily: 'Inter, sans-serif',
  },
  selectedItem: { background: '#E07B39', borderColor: '#E07B39', boxShadow: '0 4px 12px rgba(224,123,57,0.3)' },
  label: { fontSize: 12, fontWeight: 600 },
}

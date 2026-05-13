// src/components/Sidebar.jsx
export default function Sidebar({ node, onChange }) {
  if (!node) return (
    <div style={{ padding: '24px', color: 'var(--muted)', fontSize: '13px' }}>
      Select a node to configure it.
    </div>
  )

  const update = (field, value) => {
    onChange(node.id, { ...node.data, [field]: value })
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '20px' }}
           className="mono">NODE CONFIG</div>

      {['name', 'image', 'command'].map(field => (
        <div key={field} style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '11px', color: 'var(--muted)',
                          marginBottom: '6px', fontFamily: 'IBM Plex Mono' }}>
            {field.toUpperCase()}
          </label>
          <input
            value={node.data[field] || ''}
            onChange={e => update(field, e.target.value)}
            style={{
              width: '100%',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              padding: '8px 10px',
              fontFamily: 'IBM Plex Mono',
              fontSize: '12px',
              outline: 'none',
              colorScheme: 'dark',
            }}
          />
        </div>
      ))}
    </div>
  )
}
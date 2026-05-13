    const colors = {
  queued:  { bg: 'var(--border)',   text: 'var(--muted)',  label: 'QUEUED'  },
  running: { bg: '#1e3a5f',         text: 'var(--running)', label: 'RUNNING' },
  passed:  { bg: '#14532d',         text: 'var(--success)', label: 'PASSED'  },
  failed:  { bg: '#450a0a',         text: 'var(--failure)', label: 'FAILED'  },
}

export default function StatusBadge({ status = 'queued' }) {
  const c = colors[status] ?? colors.queued
  return (
    <span style={{
      background: c.bg,
      color: c.text,
      fontFamily: 'IBM Plex Mono',
      fontSize: '10px',
      fontWeight: 500,
      padding: '2px 8px',
      letterSpacing: '0.5px',
    }}>
      {c.label}
    </span>
  )
}
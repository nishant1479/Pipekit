import { useEffect, useRef } from 'react'
import StatusBadge from './statusBadge'

export default function LogPanel({ stepName, status, lines }) {
  const bottomRef = useRef(null)

  // Auto-scroll to bottom as new lines arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  return (
    <div style={{
      border: '1px solid var(--border)',
      marginBottom: '12px',
      background: 'var(--surface)',
    }}>
      {/* Panel header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 14px', borderBottom: '1px solid var(--border)',
      }}>
        <span style={{ fontWeight: 700, fontSize: '13px' }}>{stepName}</span>
        <StatusBadge status={status} />
      </div>

      {/* Log lines */}
      <div style={{
        padding: '12px 14px',
        fontFamily: 'IBM Plex Mono',
        fontSize: '11px',
        color: 'var(--muted)',
        minHeight: '80px',
        maxHeight: '200px',
        overflowY: 'auto',
        lineHeight: '1.8',
      }}>
        {lines.length === 0
          ? <span style={{ color: 'var(--border)' }}>waiting...</span>
          : lines.map((line, i) => (
              <div key={i} style={{ color: line.startsWith('ERROR') ? 'var(--failure)' : 'var(--muted)' }}>
                {line}
              </div>
            ))
        }
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
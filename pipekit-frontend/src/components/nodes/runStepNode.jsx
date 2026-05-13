import { Handle, Position } from '@xyflow/react'
import StatusBadge from '../statusBadge'

export default function RunStepNode({ data }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      padding: '12px 16px',
      minWidth: '180px',
      fontFamily: 'Syne, sans-serif',
    }}>
      <Handle type="target" position={Position.Top}
        style={{ background: 'var(--accent)', border: 'none', width: '8px', height: '8px' }} />

      <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}
           className="mono">STEP</div>
      <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>
        {data.name || 'Untitled Step'}
      </div>
      <StatusBadge status={data.status} />

      <Handle type="source" position={Position.Bottom}
        style={{ background: 'var(--accent)', border: 'none', width: '8px', height: '8px' }} />
    </div>
  )
}
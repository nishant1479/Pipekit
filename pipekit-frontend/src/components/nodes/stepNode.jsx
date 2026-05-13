// src/components/nodes/StepNode.jsx
import { Handle, Position } from '@xyflow/react'

export default function StepNode({ data, selected }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
      padding: '12px 16px',
      minWidth: '180px',
      fontFamily: 'Syne, sans-serif',
    }}>
      {/* Connection point — top (input) */}
      <Handle type="target" position={Position.Top} style={{
        background: 'var(--accent)',
        border: 'none',
        width: '8px',
        height: '8px',
      }} />

      {/* Step label */}
      <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}
           className="mono">STEP</div>
      <div style={{ fontWeight: 700, fontSize: '14px' }}>
        {data.name || 'Untitled Step'}
      </div>
      <div className="mono" style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '6px' }}>
        {data.image || 'no image set'}
      </div>

      {/* Connection point — bottom (output) */}
      <Handle type="source" position={Position.Bottom} style={{
        background: 'var(--accent)',
        border: 'none',
        width: '8px',
        height: '8px',
      }} />
    </div>
  )
}
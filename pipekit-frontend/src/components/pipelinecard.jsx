import { useNavigate } from 'react-router-dom'

// A card component to display a pipeline in the dashboard
export default function PipelineCard({ pipeline }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/pipeline/${pipeline.id}`)}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        padding: '24px',
        cursor: 'pointer',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '8px' }}>
        {pipeline.name}
      </h3>
      <p className="mono" style={{ color: 'var(--muted)', fontSize: '11px' }}>
        {pipeline.nodes.length} steps · {pipeline.edges.length} connections
      </p>
      <p className="mono" style={{ color: 'var(--muted)', fontSize: '11px', marginTop: '4px' }}>
        {new Date(pipeline.updatedAt).toLocaleDateString()}
      </p>
    </div>
  )
}
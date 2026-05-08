import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPipelines, createPipeline } from '../api/pipelines'
import PipelineCard from '../components/pipelinecard'

export default function Dashboard() {
  const [pipelines, setPipelines] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    getPipelines().then(setPipelines)
  }, [])

  const handleNew = async () => {
    const p = await createPipeline({ name: 'Untitled Pipeline', nodes: [], edges: [] })
    navigate(`/pipeline/${p.id}`)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '48px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
        <div>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '28px', letterSpacing: '-0.5px' }}>
            PIPE<span style={{ color: 'var(--accent)' }}>KIT</span>
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '4px' }} className="mono">
            {pipelines.length} pipeline{pipelines.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={handleNew} style={{
          background: 'var(--accent)',
          color: '#000',
          border: 'none',
          padding: '10px 20px',
          fontFamily: 'Syne',
          fontWeight: 700,
          fontSize: '13px',
          letterSpacing: '0.5px',
          cursor: 'pointer',
        }}>
          + NEW PIPELINE
        </button>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {pipelines.map(p => <PipelineCard key={p.id} pipeline={p} />)}
      </div>
    </div>
  )
}
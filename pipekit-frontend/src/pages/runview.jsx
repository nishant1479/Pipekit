import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ReactFlow, Background } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import RunStepNode from '../components/nodes/runStepNode'
import LogPanel from '../components/logPanel'
import StatusBadge from '../components/statusBadge'
import { getPipeline } from '../api/pipelines'

const nodeTypes = { step: RunStepNode }

// ─── Fake WebSocket simulation ──────────────────────────────────────────────
// Delete this entire function when real backend exists
// Replace WebSocket simulation in RunView with: const ws = new WebSocket(...)
function simulateRun(pipeline, onMessage) {
  const steps = pipeline.nodes.map(n => n.id)
  let i = 0

  const interval = setInterval(() => {
    if (i >= steps.length) {
      clearInterval(interval)
      onMessage({ type: 'done', status: 'passed' })
      return
    }

    const stepId = steps[i]
    onMessage({ type: 'status', stepId, status: 'running' })

    let line = 0
    const logs = setInterval(() => {
      if (line >= 4) {
        clearInterval(logs)
        onMessage({ type: 'status', stepId, status: 'passed' })
        i++
        return
      }
      onMessage({ type: 'log', stepId, line: `[step ${stepId}] log line ${line + 1}...` })
      line++
    }, 500)

  }, 2500)

  return () => clearInterval(interval)  // cleanup function
}
// ────────────────────────────────────────────────────────────────────────────

export default function RunView() {
  const { pipelineId, runId } = useParams()
  const navigate = useNavigate()

  const [pipeline, setPipeline] = useState(null)
  const [stepStatuses, setStepStatuses] = useState({})   // { stepId: 'queued'|'running'|'passed'|'failed' }
  const [stepLogs, setStepLogs]       = useState({})     // { stepId: ['line1', 'line2', ...] }
  const [runStatus, setRunStatus]     = useState('running')

  useEffect(() => {
    getPipeline(pipelineId).then(p => {
      if (!p) return

      // Init all steps as queued
      const initStatuses = {}
      const initLogs = {}
      p.nodes.forEach(n => {
        initStatuses[n.id] = 'queued'
        initLogs[n.id] = []
      })
      setStepStatuses(initStatuses)
      setStepLogs(initLogs)
      setPipeline(p)

      // Start simulation (replace with real WebSocket later)
      const cleanup = simulateRun(p, (msg) => {
        if (msg.type === 'log') {
          setStepLogs(prev => ({
            ...prev,
            [msg.stepId]: [...(prev[msg.stepId] ?? []), msg.line]
          }))
        } else if (msg.type === 'status') {
          setStepStatuses(prev => ({ ...prev, [msg.stepId]: msg.status }))
        } else if (msg.type === 'done') {
          setRunStatus(msg.status)
        }
      })

      return cleanup
    })
  }, [pipelineId])

  // Build nodes with live status injected into data
  const displayNodes = pipeline?.nodes.map(n => ({
    ...n,
    data: { ...n.data, status: stepStatuses[n.id] ?? 'queued' }
  })) ?? []

  if (!pipeline) return (
    <div style={{ height: '100vh', display: 'grid', placeItems: 'center',
                  background: 'var(--bg)', color: 'var(--muted)', fontFamily: 'IBM Plex Mono' }}>
      loading run...
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '0 20px', height: '52px',
                    borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <span style={{ fontWeight: 800, fontSize: '16px', cursor: 'pointer' }}
              onClick={() => navigate('/')}>
          PIPE<span style={{ color: 'var(--accent)' }}>KIT</span>
        </span>
        <span style={{ color: 'var(--border)' }}>›</span>
        <span style={{ fontFamily: 'Syne', fontWeight: 600, fontSize: '14px' }}>
          {pipeline.name}
        </span>
        <span style={{ color: 'var(--border)' }}>›</span>
        <span className="mono" style={{ fontSize: '12px', color: 'var(--muted)' }}>
          run #{runId?.slice(-6)}
        </span>
        <div style={{ marginLeft: 'auto' }}>
          <StatusBadge status={runStatus} />
        </div>
      </div>

      {/* Main area: canvas top, logs bottom */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Canvas — read only */}
        <div style={{ flex: 1, borderRight: '1px solid var(--border)' }}>
          <ReactFlow
            nodes={displayNodes}
            edges={pipeline.edges}
            nodeTypes={nodeTypes}
            fitView
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
          >
            <Background color="var(--border)" gap={24} />
          </ReactFlow>
        </div>

        {/* Log panels */}
        <div style={{ width: '420px', overflowY: 'auto', padding: '16px' }}>
          <div className="mono" style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '16px' }}>
            LIVE LOGS
          </div>
          {pipeline.nodes.map(n => (
            <LogPanel
              key={n.id}
              stepName={n.data.name}
              status={stepStatuses[n.id] ?? 'queued'}
              lines={stepLogs[n.id] ?? []}
            />
          ))}
        </div>

      </div>
    </div>
  )
}
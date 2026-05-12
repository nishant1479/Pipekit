// src/pages/PipelineEditor.jsx
import { useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ReactFlow, useNodesState, useEdgesState, addEdge, Background, Controls } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import StepNode from './nodes/stepNode'
import Sidebar from './sidebar'
import { getPipeline, createPipeline, updatePipeline } from '../api/pipelines'

// Register your custom node types
const nodeTypes = { step: StepNode }

export default function PipelineEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'

  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [pipelineName, setPipelineName] = useState('Untitled Pipeline')

  useEffect(() => {
    if (isNew) return

    const loadPipeline = async () => {
      const pipeline = await getPipeline(id)
      if (!pipeline) return

      setPipelineName(pipeline.name || 'Untitled Pipeline')
      setNodes(pipeline.nodes || [])
      setEdges(pipeline.edges || [])
      setSelectedNode(null)
    }

    loadPipeline()
  }, [id, isNew, setNodes, setEdges])

  // When user draws an edge between two nodes
  const onConnect = useCallback(
    (connection) => setEdges(eds => addEdge(connection, eds)),
    [setEdges]
  )

  // When user clicks a node — set it as selected
  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node)
  }, [])

  // When sidebar form changes — update that node's data
  const onNodeDataChange = useCallback((nodeId, newData) => {
    setNodes(nds => nds.map(n =>
      n.id === nodeId ? { ...n, data: newData } : n
    ))
    // Also update selectedNode so the sidebar stays in sync
    setSelectedNode(prev => prev?.id === nodeId ? { ...prev, data: newData } : prev)
  }, [setNodes])

  // Add a new step node to the canvas
  const addStepNode = () => {
    const newNode = {
      id: Date.now().toString(),
      type: 'step',
      position: { x: 200 + Math.random() * 100, y: 200 + Math.random() * 100 },
      data: { name: 'New Step', image: '', command: '' },
    }
    setNodes(nds => [...nds, newNode])
  }

  // Save pipeline
  const handleSave = async () => {
    const payload = { name: pipelineName, nodes, edges }
    if (isNew) {
      const p = await createPipeline(payload)
      navigate(`/pipeline/${p.id}`, { replace: true })
    } else {
      await updatePipeline(id, payload)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '0 20px', height: '52px',
                    borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <span style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '-0.3px',
                       cursor: 'pointer' }} onClick={() => navigate('/')}>
          PIPE<span style={{ color: 'var(--accent)' }}>KIT</span>
        </span>
        <span style={{ color: 'var(--border)' }}>›</span>
        <input
          value={pipelineName}
          onChange={e => setPipelineName(e.target.value)}
          style={{ background: 'transparent', border: 'none', color: 'var(--text)',
                   fontFamily: 'Syne', fontWeight: 600, fontSize: '14px', outline: 'none' }}
        />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <button onClick={addStepNode} style={{
            background: 'transparent', border: '1px solid var(--border)',
            color: 'var(--text)', padding: '6px 14px',
            fontFamily: 'Syne', fontWeight: 600, fontSize: '12px', cursor: 'pointer'
          }}>+ ADD STEP</button>
          <button onClick={handleSave} style={{
            background: 'var(--accent)', border: 'none', color: '#000',
            padding: '6px 14px', fontFamily: 'Syne',
            fontWeight: 700, fontSize: '12px', cursor: 'pointer'
          }}>SAVE</button>
        </div>
      </div>

      {/* Main area: canvas + sidebar */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Canvas */}
        <div style={{ flex: 1 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background color="var(--border)" gap={24} />
            <Controls />
          </ReactFlow>
        </div>

        {/* Sidebar */}
        <div style={{ width: '260px', borderLeft: '1px solid var(--border)',
                      background: 'var(--surface)', overflowY: 'auto' }}>
          <Sidebar node={selectedNode} onChange={onNodeDataChange} />
        </div>

      </div>
    </div>
  )
}
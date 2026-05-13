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
const [selectedNodeId, setSelectedNodeId] = useState(null)
const selectedNode = nodes.find(n => n.id === selectedNodeId) ?? null
  const [pipelineName, setPipelineName] = useState('Untitled Pipeline')

 useEffect(() => {
  if (!isNew) {
    getPipeline(id).then(pipeline => {
      if (pipeline) {
        setPipelineName(pipeline.name)
        setNodes(pipeline.nodes)
        setEdges(pipeline.edges)
      }
    })
  }
}, [id])

  // When user draws an edge between two nodes
  const onConnect = useCallback(
    (connection) => setEdges(eds => addEdge(connection, eds)),
    [setEdges]
  )

  // When user clicks a node — set it as selected
const onNodeClick = useCallback((_, node) => {
  console.log('clicked node:', node)  // add this
  setSelectedNodeId(node.id)
}, [])

  // When sidebar form changes — update that node's data
  const onNodeDataChange = useCallback((nodeId, newData) => {
  setNodes(nds => nds.map(n =>
    n.id === nodeId ? { ...n, data: newData } : n
  ))
}, [setNodes])

  // Add a new step node to the canvas
  const addStepNode = () => {
  const newNode = {
    id: Date.now().toString(),
    type: 'step',
    position: { 
      x: 100 + (nodes.length % 3) * 220,   // spread horizontally
      y: 100 + Math.floor(nodes.length / 3) * 160  // new row every 3
    },
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
  onNodesChange={onNodesChange}
  edges={edges}
  onEdgesChange={onEdgesChange}
  onConnect={onConnect}
  onNodeClick={onNodeClick}
  nodeTypes={nodeTypes}
  isValidConnection={(connection) => 
      connection.source !== connection.target
    }
  connectionLineType="smoothstep"
  defaultEdgeOptions={{ type: 'smoothstep', style: { stroke: 'var(--accent)', strokeWidth: 1.5 } }}
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
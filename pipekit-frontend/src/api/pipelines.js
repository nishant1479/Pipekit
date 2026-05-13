// In-memory store — simulates a real database for now
// When you connect the real backend, only this file changes

const store = {
  "1": {
    id: "1",
    name: "Node CI",
    updatedAt: "2024-01-15T10:30:00Z",
    nodes: [],
    edges: [],
  },
  "2": {
    id: "2",
    name: "Docker Build",
    updatedAt: "2024-01-14T08:00:00Z",
    nodes: [],
    edges: [],
  },
}

export const getPipelines = async () => Object.values(store)

export const getPipeline = async (id) => store[id] ?? null

export const createPipeline = async (data) => {
  const id = Date.now().toString()
  const pipeline = { ...data, id, updatedAt: new Date().toISOString() }
  store[id] = pipeline
  return pipeline
}

export const updatePipeline = async (id, data) => {
  const pipeline = { ...data, id, updatedAt: new Date().toISOString() }
  store[id] = pipeline
  return pipeline
}

export const deletePipeline = async (id) => {
  delete store[id]
}
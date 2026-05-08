// Mock data — replace these functions with real axios calls later
// without changing anything else in the app

const mockPipelines = [
  {
    id: "1",
    name: "Node CI",
    updatedAt: "2024-01-15T10:30:00Z",
    nodes: [{ id: "1" }, { id: "2" }, { id: "3" }],
    edges: [{ source: "1", target: "2" }, { source: "2", target: "3" }],
  },
  {
    id: "2", 
    name: "Docker Build",
    updatedAt: "2024-01-14T08:00:00Z",
    nodes: [{ id: "1" }, { id: "2" }],
    edges: [{ source: "1", target: "2" }],
  },
];

export const getPipelines = async () => mockPipelines;
export const getPipeline  = async (id) => mockPipelines.find(p => p.id === id);
export const createPipeline = async (data) => ({ ...data, id: Date.now().toString() });
export const updatePipeline = async (id, data) => ({ ...data, id });
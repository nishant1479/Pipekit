export interface PipelineNode {
  id: string;
  type: 'start' | 'step' | 'end';
  data: {
    name: string;
    image: string;
    command: string;
  };
  position: { x: number; y: number };
}

export interface PipelineEdge {
  id: string;
  source: string;
  target: string;
}

export interface PipelineDefinition {
  nodes: PipelineNode[];
  edges: PipelineEdge[];
}

export interface Pipeline {
  id: string;
  name: string;
  definition: PipelineDefinition;
  created_at: Date;
  updated_at: Date;
}

export interface Run {
  id: string;
  pipeline_id: string;
  status: 'queued' | 'running' | 'passed' | 'failed';
  started_at: Date | null;
  finished_at: Date | null;
  created_at: Date;
}

export interface StepRun {
  id: string;
  run_id: string;
  step_id: string;
  name: string;
  status: 'queued' | 'running' | 'passed' | 'failed';
  started_at: Date | null;
  finished_at: Date | null;
  exit_code: number | null;
}

export interface Log {
  id: number;
  step_run_id: string;
  line: string;
  created_at: Date;
}
export interface Node {
  id: number;
  x: number;
  y: number;
  label?: string; // Optional label for real-world locations
}

export interface OptimizationParams {
  steps: number;
  init_temp: number;
  tunneling_rate: number;
}

export interface IterationData {
  step: number;
  current_route: number[];
  current_energy: number;
  best_route: number[];
  best_energy: number;
  tunneling: boolean;
}

export interface FinalResult {
  best_route: number[];
  best_energy: number;
  total_iterations: number;
  tunneling_events: number;
}

export interface OptimizationSummary {
  problem_type: string;
  total_nodes: number;
  parameters_used: OptimizationParams;
}

export interface OptimizationResponse {
  summary: OptimizationSummary;
  iterations: IterationData[];
  final_result: FinalResult;
  explanation: string;
}

export type ScenarioType = 'random' | 'logistics' | 'circuit' | 'delivery' | 'india';

export interface AppState {
  nodes: Node[];
  params: OptimizationParams;
  result: OptimizationResponse | null;
  isOptimizing: boolean;
  playbackIndex: number;
  isPlaying: boolean;
  error: string | null;
  scenario: ScenarioType;
  startNodeId: number;
}

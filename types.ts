
export enum AppMode {
  COLLISION = 'COLLISION',
  EXPLORATION = 'EXPLORATION'
}

export interface SynthesisResult {
  // Collision Mode Data
  disciplineName: string;
  tagline: string;
  definition: string;
  axioms: string[];
  application: string;
  visualPrompt: string;
  // Graph Theory Data
  logicPath?: string[]; // e.g. ["Mushroom", "Chitin", "Biomaterial", "Architecture"]
  // Analysis
  feasibilityScore: number; // 1-100
  feasibilityAnalysis: string;
}

export interface FringeField {
  name: string;
  description: string;
  feasibilityScore: number;
  application: string;
  visualPrompt: string;
}

export interface ExplorationResult {
  rootConcept: string;
  fields: FringeField[];
}

export interface DemoResult {
  code: string; // The HTML/JS source code
  label: string;
  instructions: string;
}

export type AnyResult = SynthesisResult | ExplorationResult;

export enum ColliderStatus {
  IDLE = 'IDLE',
  ACCELERATING = 'ACCELERATING', // Animation phase 1
  SEARCHING_GRAPH = 'SEARCHING_GRAPH', // New Phase: Wiki Graph Search
  COLLIDING = 'COLLIDING',       // Animation phase 2 (Impact/Split)
  SYNTHESIZING = 'SYNTHESIZING', // API Waiting
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

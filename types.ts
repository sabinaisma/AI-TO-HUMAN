export interface DetectionResult {
  percentage: number;
  explanation: string;
}

export interface AnalysisState {
  isAnalyzing: boolean;
  result: DetectionResult | null;
  error: string | null;
}

export interface HumanizeState {
  isHumanizing: boolean;
  result: string | null;
  error: string | null;
}

export enum TabOption {
  WRITE = 'WRITE',
  UPLOAD = 'UPLOAD'
}
// Imports removed as they were unused here.

export interface AnalyzeRequest {
  input_type: 'url' | 'text';
  content: string;
}

export interface AnalyzeResponse {
  analysis_id: string;
  status: string;
  message?: string;
}

export interface AnalysisStatus {
  analysis_id: string;
  status: 'queued' | 'structuring' | 'analysis' | 'contradictions' | 'synthesis' | 'scoring' | 'completed' | 'failed';
  progress: number;
  current_phase: string;
}

// We re-use FullReport and ReportListItem from @/types/report
// because the backend was explicitly synchronized to match them.

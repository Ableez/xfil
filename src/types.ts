// File handling types
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  path?: string;
  selected: boolean;
}

export interface FileValidationResult {
  valid: boolean;
  errors: Array<{
    code: string;
    message: string;
  }>;
}

// Processing types
export type ProcessingMode = 'analyze' | 'correct' | 'both';

export interface SanitizationOptions {
  removeMetadata: boolean;
  normalizeEncoding: boolean;
  stripMalicious: boolean;
}

export interface ValidationOptions {
  verifyStructure: boolean;
  checkSecurity: boolean;
}

export interface CorrectionOptions {
  fixEncoding: boolean;
  repairStructure: boolean;
  standardizeFormat: boolean;
}

export interface ProcessingOptions {
  mode: ProcessingMode;
  sanitization: SanitizationOptions;
  validation: ValidationOptions;
  corrections: CorrectionOptions;
}

// Result types
export interface FileIssue {
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  location?: string;
}

export interface FileAnalysis {
  isValid: boolean;
  fileType: string;
  encoding: string;
  issues: FileIssue[];
  metadata: Record<string, unknown>;
  processingTime: number;
}

export interface ProcessingResult {
  originalFile: {
    name: string;
    url: string;
    size: number;
  };
  analysis: FileAnalysis;
  correctedFile?: {
    name: string;
    url: string;
    size: number;
  } | null;
  error?: string;
}

export interface ProcessingSummary {
  totalFiles: number;
  successCount: number;
  errorCount: number;
  totalProcessingTime: number;
  timestamp: string;
}

export interface ProcessingResponse {
  success: boolean;
  results: ProcessingResult[];
  summary: ProcessingSummary;
  error?: string;
}

export interface CleanerResult {
  filepath: string;
  had_marker_or_change: boolean;
  temp_file_path?: string;
  error?: string;
  detected_markers: number;
  processed_markers: number;
}

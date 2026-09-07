/**
 * CV Studio Pro - AI & Tailoring Types
 * 
 * Domain-specific type definitions for AI model configurations,
 * tailoring requests, responses, and provider options.
 */

export type AIProviderId = 
  | 'local' 
  | 'gemini' 
  | 'groq' 
  | 'openai' 
  | 'claude' 
  | 'openrouter' 
  | 'custom'
  | 'manual';

export interface AIModelOption {
  id: string;
  name: string;
  provider: AIProviderId;
  description: string;
  isFree?: boolean;
  requiresKey?: boolean;
}

export interface AIProviderSettings {
  provider: AIProviderId;
  model: string;
  apiKey?: string;
  customEndpoint?: string;
  temperature?: number;
  localServerType?: 'ollama' | 'lm-studio' | 'custom';
}

export interface AIConnectionTestResult {
  success: boolean;
  message: string;
  detectedModels?: string[];
}

export interface TailorProgressUpdate {
  stage: 'preparing' | 'synthesizing' | 'parsing' | 'auditing' | 'finalizing';
  stageIndex: number;
  message: string;
  progress: number;
  wordCount?: number;
  snippet?: string;
  modelUsed?: string;
}

export interface TailorRequest {
  masterData: string;
  targetJob: string;
  rules?: string;
  companyName?: string;
  targetRole?: string;
  pageBudget?: 1 | 2;
  providerSettings: AIProviderSettings;
}

import { CVData } from './cv';

export interface TailorResponse {
  tailoredCvMarkdown: string;
  gapAnalysisMarkdown?: string;
  estimatedMatchScore?: number;
  extractedKeywords?: string[];
  rawResponse?: string;
  modelUsed: string;
  cvData?: CVData;
  detectedLanguage?: string;
}

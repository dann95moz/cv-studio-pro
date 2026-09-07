import {
  AIModelOption,
  AIProviderSettings,
  AIConnectionTestResult,
  TailorRequest,
  TailorResponse
} from '../types/cv';
import { buildPrompts, DEFAULT_RULES, PromptBundle } from './ai/prompt-builder';
import { extractCvAndGap, ExtractedCvAndGap } from './ai/extractor';
import {
  generateInterviewPrep,
  buildInterviewPrepPrompts,
  parseInterviewPrepResponse,
  generateDeterministicFallback as generateDeterministicInterviewPrep,
} from './ai/interview-prep-generator';
import {
  generateCoverLetter,
  buildCoverLetterPrompts,
  generateDeterministicCoverLetter,
} from './ai/cover-letter-generator';
import {
  generateLinkedInProfile,
  buildLinkedInPrompts,
  parseLinkedInResponse,
  generateDeterministicLinkedInProfile,
} from './ai/linkedin-generator';
import { getAIStrategy } from './ai/strategies';
import { GoogleGenerativeAI } from '@google/generative-ai';

export type { AIModelOption, AIProviderSettings, AIConnectionTestResult, TailorRequest, TailorResponse };
export {
  buildPrompts,
  DEFAULT_RULES,
  extractCvAndGap,
  generateInterviewPrep,
  buildInterviewPrepPrompts,
  parseInterviewPrepResponse,
  generateDeterministicInterviewPrep,
  generateCoverLetter,
  buildCoverLetterPrompts,
  generateDeterministicCoverLetter,
  generateLinkedInProfile,
  buildLinkedInPrompts,
  parseLinkedInResponse,
  generateDeterministicLinkedInProfile,
};

export { AVAILABLE_AI_MODELS } from '../constants/models';


/**
 * Validates AI provider connectivity and returns diagnostic feedback.
 */
export async function testAIConnection(settings: AIProviderSettings): Promise<AIConnectionTestResult> {
  try {
    if (settings.provider === 'manual') {
      return {
        success: true,
        message: 'Bring-Your-Own-AI (Prompt & Paste) mode is ready! 100% free, no API key or local server required.'
      };
    }

    if (settings.provider === 'local') {
      const rawEndpoint = settings.customEndpoint?.trim() || 'http://localhost:11434/v1';
      let endpoint = rawEndpoint.replace(/\/$/, '');
      if (!endpoint.endsWith('/chat/completions')) {
        endpoint = `${endpoint}/chat/completions`;
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (settings.apiKey?.trim()) {
        headers['Authorization'] = `Bearer ${settings.apiKey.trim()}`;
      }

      // First try fetching models list if Ollama / LM Studio standard endpoint
      let detectedModels: string[] | undefined;
      try {
        const baseV1 = rawEndpoint.replace(/\/$/, '').replace(/\/chat\/completions$/, '');
        const modelsRes = await fetch(`${baseV1}/models`, { method: 'GET', headers }).catch(() => null);
        if (modelsRes && modelsRes.ok) {
          const mData = await modelsRes.json().catch(() => ({}));
          if (Array.isArray(mData.data)) {
            detectedModels = mData.data.map((m: { id?: string }) => m.id || '').filter(Boolean);
          }
        }
        if (!detectedModels || detectedModels.length === 0) {
          const rootBase = baseV1.replace(/\/v1$/, '');
          const tagsRes = await fetch(`${rootBase}/api/tags`, { method: 'GET', headers }).catch(() => null);
          if (tagsRes && tagsRes.ok) {
            const tData = await tagsRes.json().catch(() => ({}));
            if (Array.isArray(tData.models)) {
              detectedModels = tData.models.map((m: { name?: string; model?: string }) => m.name || m.model || '').filter(Boolean);
            }
          }
        }
      } catch {
        // Models list probe optional
      }

      const testRes = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: settings.model || 'llama3.2',
          messages: [{ role: 'user', content: 'Respond with the single word: OK' }],
          max_tokens: 5,
          temperature: 0.1
        })
      });

      if (!testRes.ok) {
        const errJson = await testRes.json().catch(() => ({}));
        const errDetail = errJson.error?.message || errJson.message || `HTTP ${testRes.status} ${testRes.statusText}`;
        return {
          success: false,
          message: `Local server responded with error: ${errDetail}`
        };
      }

      return {
        success: true,
        message: `Successfully connected to Local AI (${settings.model || 'Local Model'})!`,
        detectedModels
      };
    }

    if (settings.provider === 'gemini') {
      const key = settings.apiKey?.trim();
      if (!key) {
        return { success: false, message: 'Please enter your Google Gemini API Key from aistudio.google.com' };
      }
      const genAI = new GoogleGenerativeAI(key);
      const requestedModel = settings.model || 'gemini-2.5-flash';
      const testCandidates = [requestedModel, 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'].filter((m, i, a) => a.indexOf(m) === i);
      let lastErr: unknown = null;

      for (const mName of testCandidates) {
        try {
          const model = genAI.getGenerativeModel({ model: mName });
          await model.generateContent('Say OK');
          const note = mName === requestedModel ? '' : ` (${requestedModel} experiencing temporary demand, ${mName} ready)`;
          return { success: true, message: `Google Gemini API Key validated successfully!${note}` };
        } catch (e: unknown) {
          lastErr = e;
          const msg = e instanceof Error ? e.message : String(e);
          if (!msg.includes('503') && !msg.includes('high demand') && !msg.includes('RESOURCE_EXHAUSTED') && !msg.includes('429')) {
            break;
          }
        }
      }
      const errMsg = lastErr instanceof Error ? lastErr.message : String(lastErr);
      return { success: false, message: `Google Gemini error: ${errMsg}` };
    }

    if (settings.provider === 'claude') {
      const key = settings.apiKey?.trim();
      if (!key) {
        return { success: false, message: 'Please enter your Anthropic Claude API Key.' };
      }
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: settings.model || 'claude-3-7-sonnet-latest',
          max_tokens: 5,
          messages: [{ role: 'user', content: 'Say OK' }]
        })
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        return { success: false, message: errJson.error?.message || `Claude API Error (HTTP ${res.status})` };
      }
      return { success: true, message: 'Anthropic Claude API Key validated successfully!' };
    }

    // OpenAI, Groq, OpenRouter, Custom
    let endpoint = 'https://api.openai.com/v1/chat/completions';
    if (settings.provider === 'groq') {
      endpoint = 'https://api.groq.com/openai/v1/chat/completions';
    } else if (settings.provider === 'openrouter') {
      endpoint = 'https://openrouter.ai/api/v1/chat/completions';
    } else if (settings.provider === 'custom' && settings.customEndpoint) {
      endpoint = settings.customEndpoint.replace(/\/$/, '') + '/chat/completions';
    }

    const key = settings.apiKey?.trim();
    if (!key && settings.provider !== 'custom') {
      return { success: false, message: `Please enter your ${settings.provider.toUpperCase()} API Key.` };
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (key) {
      headers['Authorization'] = `Bearer ${key}`;
    }
    if (settings.provider === 'openrouter') {
      headers['HTTP-Referer'] = 'https://customs-cvs.app';
      headers['X-Title'] = 'CV Studio Pro';
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: settings.model || (settings.provider === 'groq' ? 'llama-3.3-70b-versatile' : 'gpt-4o'),
        messages: [{ role: 'user', content: 'Say OK' }],
        max_tokens: 5
      })
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return { success: false, message: errJson.error?.message || `API error (HTTP ${res.status})` };
    }

    return { success: true, message: `${settings.provider.toUpperCase()} connection validated successfully!` };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (settings.provider === 'local') {
      return {
        success: false,
        message: `Cannot reach Local AI server (${msg}). Ensure Ollama/LM Studio is running and CORS is enabled: OLLAMA_ORIGINS="*" ollama serve`
      };
    }
    return { success: false, message: `Connection test failed: ${msg}` };
  }
}

/**
 * Main Tailor function delegating to Strategy pattern with real streaming & telemetry
 */
export async function tailorResume(
  req: TailorRequest,
  onProgress?: (update: import('../types/ai').TailorProgressUpdate) => void,
  signal?: AbortSignal
): Promise<TailorResponse> {
  onProgress?.({
    stage: 'preparing',
    stageIndex: 1,
    message: 'Analyzing employer requirements & extracting ATS keywords...',
    progress: 15,
    modelUsed: req.providerSettings.model
  });

  const prompts: PromptBundle = buildPrompts(req);
  const strategy = getAIStrategy(req.providerSettings.provider);

  if (signal?.aborted) throw new Error('Generation cancelled by user.');

  onProgress?.({
    stage: 'synthesizing',
    stageIndex: 2,
    message: `Synthesizing with ${req.providerSettings.model}...`,
    progress: 30,
    wordCount: 0,
    modelUsed: req.providerSettings.model
  });

  const result = await strategy.execute(
    prompts,
    req.providerSettings,
    ({ accumulatedText, wordCount }: { chunk: string; accumulatedText: string; wordCount: number }) => {
      const lastSnippet = accumulatedText.slice(-100);
      onProgress?.({
        stage: 'synthesizing',
        stageIndex: 2,
        message: `Synthesizing with ${req.providerSettings.model} (${wordCount} words)...`,
        progress: Math.min(78, 30 + Math.floor(wordCount / 8)),
        wordCount,
        snippet: lastSnippet,
        modelUsed: req.providerSettings.model
      });
    },
    signal
  );

  if (signal?.aborted) throw new Error('Generation cancelled by user.');

  const totalWords = result.text.trim().split(/\s+/).filter(Boolean).length;

  onProgress?.({
    stage: 'parsing',
    stageIndex: 3,
    message: 'Calibrating document layout & page budget...',
    progress: 85,
    wordCount: totalWords,
    modelUsed: result.modelUsed
  });

  const extracted: ExtractedCvAndGap = extractCvAndGap(result.text, req.masterData, prompts.company, req.targetRole);

  onProgress?.({
    stage: 'auditing',
    stageIndex: 4,
    message: 'Ensuring 100% authenticity & fidelity to your real career history...',
    progress: 95,
    wordCount: totalWords,
    modelUsed: result.modelUsed
  });

  return {
    tailoredCvMarkdown: extracted.cvMarkdown,
    gapAnalysisMarkdown: extracted.gapMarkdown,
    estimatedMatchScore: extracted.score,
    extractedKeywords: extracted.keywords,
    rawResponse: result.text,
    modelUsed: result.modelUsed,
    cvData: extracted.cvData,
    detectedLanguage: extracted.detectedLanguage,
  };
}

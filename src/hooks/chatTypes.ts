export interface Chat {
  id: string;
  title: string;
  created_at?: string;
  user_id?: string;
  is_pinned: boolean;
}

export interface SelectedModel {
  id: string;
  name: string;
}

export interface ImportedCode {
  id: string;
  filename: string;
  code: string;
}

export type Message = {
  id: string;
  role: 'user' | 'ai';
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  base64Image?: string;
  base64Video?: string;
  codes?: ImportedCode[];
  modelName?: string;
  feedback?: 'like' | 'dislike' | null;
  voice?: string;
  searchUsed?: boolean;
  isSearching?: boolean;
  isAnalyzingImage?: boolean;
  isAnalyzingVideo?: boolean;
  searchSources?: { title: string; url: string }[];
  searchEnabledBy?: 'user' | 'model';
  isTranslationActive?: boolean;
  translationInputLang?: string;
  translationOutputLang?: string;
};

export const MODELS: SelectedModel[] = [
  { id: 'DiffusionGemma 26B A4B IT', name: 'DiffusionGemma 26B A4B IT' },
  { id: 'Gemma 4 12B', name: 'Gemma 4 12B' },
  { id: 'Gemma 4 31B', name: 'Gemma 4 31B' },
  { id: 'Gemma 4 26B', name: 'Gemma 4 26B' },
  { id: 'Gemma 3 27B', name: 'Gemma 3 27B' },
  { id: 'Gemma 3 12B', name: 'Gemma 3 12B' },
  { id: 'Gemma 3 4B', name: 'Gemma 3 4B' },
  { id: 'Gemma 3n E4B', name: 'Gemma 3n E4B' },
  { id: 'Gemma 2 27B', name: 'Gemma 2 27B' },
  { id: 'google/gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite' },
  { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash Preview' },
  { id: 'google/gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite' },
  { id: 'google/gemini-3.1-flash-lite-preview', name: 'Gemini 3.1 Flash Lite Preview' },
  { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
  { id: 'google/gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro Preview' },
  { id: 'google/gemini-3.5-flash', name: 'Gemini 3.5 Flash' },
  { id: 'google/gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash Lite' },
  { id: 'google/gemini-3.6-flash', name: 'Gemini 3.6 Flash' }
];

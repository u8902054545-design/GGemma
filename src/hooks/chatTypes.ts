export interface SelectedModel {
  id: string;
  name: string;
}

export type Message = {
  id: string;
  role: 'user' | 'ai';
  content: string;
  imageUrl?: string;
  modelName?: string;
  feedback?: 'like' | 'dislike' | null;
};

export const MODELS: SelectedModel[] = [
  { id: 'google/gemma-4-31b-it', name: 'Gemma 4 31B' },
  { id: 'google/gemma-4-26b-a4b-it', name: 'Gemma 4 26B' },
  { id: 'google/gemma-3-27b-it', name: 'Gemma 3 27B' },
  { id: 'google/gemma-3-12b-it', name: 'Gemma 3 12B' },
  { id: 'google/gemma-3-4b-it', name: 'Gemma 3 4B' },
  { id: 'google/gemma-3-1b-it', name: 'Gemma 3 1B' },
  { id: 'google/gemma-3n-e4b-it', name: 'Gemma 3n E4B' },
  { id: 'google/gemma-3n-e2b-it', name: 'Gemma 3n E2B' },
  { id: 'google/gemma-2-27b-it', name: 'Gemma 2 27B' }
];

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

export type Message = {
  id: string;
  role: 'user' | 'ai';
  content: string;
  imageUrl?: string;
  modelName?: string;
  feedback?: 'like' | 'dislike' | null;
  voice?: string;
};

export const MODELS: SelectedModel[] = [
  { id: 'Gemma 4 31B', name: 'Gemma 4 31B' },
  { id: 'Gemma 4 26B', name: 'Gemma 4 26B' },
  { id: 'Gemma 3 27B', name: 'Gemma 3 27B' },
  { id: 'Gemma 3 12B', name: 'Gemma 3 12B' },
  { id: 'Gemma 3 4B', name: 'Gemma 3 4B' },
  { id: 'Gemma 3n E4B', name: 'Gemma 3n E4B' },
  { id: 'Gemma 2 27B', name: 'Gemma 2 27B' }
];

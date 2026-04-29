export type Message = {
  id: string;
  role: 'user' | 'ai';
  content: string;
  imageUrl?: string;
  modelName?: string;
  feedback?: 'like' | 'dislike' | null;
};

export const MODELS = [
  'Gemma 3 1B',
  'Gemma 3 4B',
  'Gemma 3 12B',
  'Gemma 3 27B',
  'Gemma 3n E2B',
  'Gemma 3n E4B',
  'Gemma 4 26B A4B IT',
  'Gemma 4 31B IT',
];

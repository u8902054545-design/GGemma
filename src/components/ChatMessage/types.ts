export type ChatMessageProps = {
  role: 'user' | 'ai';
  content: string;
  modelName?: string;
  isGenerating?: boolean;
  messageId?: string;
  feedback?: 'like' | 'dislike' | null;
  onFeedback?: (id: string, type: 'like' | 'dislike') => void;
};

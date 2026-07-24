import { supabase } from '../config';

export const processImage = async (file: File): Promise<{ base64: string; localUrl: string }> => {
  const localUrl = URL.createObjectURL(file);
  const base64 = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
  return { base64, localUrl };
};

export const updateChatTitle = async (
  chatId: string,
  setChatTitle: ((title: string) => void) | undefined,
  onNewChatCreated: (() => void) | undefined
) => {
  let attempts = 0;
  const maxAttempts = 30;

  const update = async () => {
    const { data } = await supabase
      .from('chats')
      .select('title')
      .eq('id', chatId)
      .maybeSingle();

    if (data?.title && data.title !== 'Untitled Chat') {
      if (setChatTitle) setChatTitle(data.title);
      if (onNewChatCreated) onNewChatCreated();
    } else if (attempts < maxAttempts) {
      attempts++;
      setTimeout(update, 1000);
    } else {
      if (onNewChatCreated) onNewChatCreated();
    }
  };

  await update();
};

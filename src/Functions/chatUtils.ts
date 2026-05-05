export const handleChatSelection = (
  id: string,
  chats: any[],
  setChatTitle: (title: string) => void,
  loadChatMessages: (id: string) => void,
  closeSidebar: () => void
) => {
  const selectedChat = chats.find(c => c.id === id);
  if (selectedChat) {
    setChatTitle(selectedChat.title);
  }
  loadChatMessages(id);
  closeSidebar();
};

export const handleCreateNewChat = (
  setMessages: (messages: any[]) => void,
  setChatId: (id: string) => void,
  setChatTitle: (title: string) => void,
  resetSearch: () => void,
  closeSidebar: () => void,
  refreshChats: () => void
) => {
  setMessages([]);
  setChatId(crypto.randomUUID());
  setChatTitle('');
  resetSearch();
  closeSidebar();
  refreshChats();
};

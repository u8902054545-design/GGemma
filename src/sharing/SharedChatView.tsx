import React, { useState, useEffect, useRef } from 'react';
import { getSharedChat, SharedChat } from './shareUtils';
import { ChatMessage } from '../components/ChatMessage';
import { supabase } from '../config';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import { GemmaIcon } from '../components/IconsApp/GemmaIcon';

interface SharedChatViewProps {
  shareId: string;
  onImportSuccess: (newChatId: string) => void;
}

export const SharedChatView: React.FC<SharedChatViewProps> = ({ shareId, onImportSuccess }) => {
  const [sharedChat, setSharedChat] = useState<SharedChat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSharedChat();
  }, [shareId]);

  const loadSharedChat = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSharedChat(shareId);
      if (data) {
        setSharedChat(data);
      } else {
        setError(t('shared.not_found') || 'Shared chat not found or has been deleted.');
      }
    } catch (err) {
      console.error(err);
      setError(t('shared.load_error') || 'Failed to load shared chat.');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!sharedChat) return;

    if (!user) {
      // If not logged in, redirect to login page (main app root)
      window.location.href = '/';
      return;
    }

    setIsImporting(true);
    try {
      const newChatId = crypto.randomUUID();

      // 1. Create a new chat row
      const { error: chatError } = await supabase
        .from('chats')
        .insert({
          id: newChatId,
          user_id: user.id,
          title: sharedChat.title,
          is_pinned: false,
          created_at: new Date().toISOString()
        });

      if (chatError) throw chatError;

      // 2. Process and copy media files to the new user's storage
      const messagesToInsert = await Promise.all(sharedChat.messages.map(async (m: any, idx: number) => {
        let copiedImageUrl = m.image_url || m.imageUrl || null;
        let copiedVideoUrl = m.video_url || m.videoUrl || null;

        // Copy Image
        if (copiedImageUrl) {
          try {
            const response = await fetch(copiedImageUrl);
            if (response.ok) {
              const blob = await response.blob();
              const ext = copiedImageUrl.split('.').pop()?.split('?')[0] || 'png';
              const fileName = `${user.id}/${crypto.randomUUID()}.${ext}`;
              
              const { error: uploadError } = await supabase.storage
                .from('chat-images')
                .upload(fileName, blob, { contentType: blob.type || 'image/png' });
              
              if (!uploadError) {
                copiedImageUrl = supabase.storage.from('chat-images').getPublicUrl(fileName).data.publicUrl;
              } else {
                console.error('Failed to upload copied image:', uploadError);
              }
            }
          } catch (err) {
            console.error('Error copying image:', err);
          }
        }

        // Copy Video
        if (copiedVideoUrl) {
          try {
            const response = await fetch(copiedVideoUrl);
            if (response.ok) {
              const blob = await response.blob();
              const ext = copiedVideoUrl.split('.').pop()?.split('?')[0] || 'mp4';
              const fileName = `${user.id}/${crypto.randomUUID()}.${ext}`;
              
              const { error: uploadError } = await supabase.storage
                .from('chat-videos')
                .upload(fileName, blob, { contentType: blob.type || 'video/mp4' });
              
              if (!uploadError) {
                copiedVideoUrl = supabase.storage.from('chat-videos').getPublicUrl(fileName).data.publicUrl;
              } else {
                console.error('Failed to upload copied video:', uploadError);
              }
            }
          } catch (err) {
            console.error('Error copying video:', err);
          }
        }

        return {
          id: crypto.randomUUID(),
          chat_id: newChatId,
          user_id: user.id,
          role: m.role === 'ai' ? 'model' : 'user', // database column role is 'model' or 'user'
          content: m.content,
          image_url: copiedImageUrl,
          video_url: copiedVideoUrl,
          created_at: new Date(Date.now() - (sharedChat.messages.length - idx) * 1000).toISOString()
        };
      }));

      const { error: msgError } = await supabase
        .from('messages')
        .insert(messagesToInsert);

      if (msgError) throw msgError;

      onImportSuccess(newChatId);
    } catch (err) {
      console.error('Failed to import chat:', err);
      alert(t('shared.import_error') || 'Failed to import chat.');
    } finally {
      setIsImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[var(--md-sys-color-background)]">
        <span className="material-symbols-outlined animate-spin text-[48px] text-[var(--md-sys-color-primary)]">progress_activity</span>
      </div>
    );
  }

  if (error || !sharedChat) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center p-6 text-center bg-[var(--md-sys-color-background)] text-[var(--md-sys-color-on-surface)]">
        <span className="material-symbols-outlined text-[64px] text-[var(--md-sys-color-error)] mb-4">error</span>
        <h1 className="text-xl font-medium mb-2">{error}</h1>
        <button
          onClick={() => { window.location.href = '/'; }}
          className="mt-4 px-6 py-2 bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] rounded-full text-sm font-medium hover:shadow-md transition-all active:scale-95"
        >
          {t('shared.go_home') || 'Go to Gemma'}
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-[var(--md-sys-color-background)] text-[var(--md-sys-color-on-surface)] overflow-hidden">
      {/* Shared Header */}
      <header className="h-[64px] border-b border-[var(--md-sys-color-outline-variant)]/10 px-4 md:px-6 flex items-center justify-between bg-[var(--md-sys-color-surface)] z-10 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => { window.location.href = '/'; }}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-[var(--md-sys-color-on-surface-variant)]/10 rounded-full transition-colors bg-transparent border-none cursor-pointer text-left focus:outline-none"
            title={t('shared.go_home') || 'Go to Gemma'}
          >
            <GemmaIcon className="w-6 h-6" />
            <span className="text-md font-semibold text-[var(--md-sys-color-on-surface)] leading-none select-none">
              Gemma
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Import Button */}
          <button
            onClick={handleImport}
            disabled={isImporting}
            className="px-5 py-2.5 bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] rounded-full text-sm font-semibold hover:shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {isImporting ? (
              <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">{user ? 'content_copy' : 'login'}</span>
            )}
            {user 
              ? (t('shared.import') || 'Copy to my chats') 
              : (t('shared.try_gemma') || 'Try Gemma')
            }
          </button>
        </div>
      </header>

      {/* Shared Content */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto w-full mx-auto flex flex-col p-4 md:p-6 pb-20 max-w-[1200px]"
      >
        <div className="flex-1 flex flex-col">
          {/* Chat Title and Public Link */}
          <div className="mb-8 border-b border-[var(--md-sys-color-outline-variant)]/10 pb-6">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--md-sys-color-on-background)] mb-3">
              {sharedChat.title}
            </h1>
            <div className="flex items-center gap-2 text-sm text-[var(--md-sys-color-primary)] font-medium">
              <span className="material-symbols-outlined text-[18px]">link</span>
              <a 
                href={window.location.href} 
                className="hover:underline break-all transition-all duration-150"
                target="_blank"
                rel="noopener noreferrer"
              >
                {window.location.href}
              </a>
            </div>
          </div>

          {sharedChat.messages.map((msg, index) => {
            const prevMsg = index > 0 ? sharedChat.messages[index - 1] : null;
            const userHasImage = msg.role === 'ai' && prevMsg ? !!prevMsg.image_url : undefined;
            const userHasVideo = msg.role === 'ai' && prevMsg ? !!prevMsg.video_url : undefined;
            return (
              <ChatMessage
                key={index}
                messageId={`shared-${index}`}
                role={msg.role}
                content={msg.content}
                imageUrl={msg.image_url}
                videoUrl={msg.video_url}
                codes={undefined}
                modelName={undefined}
                feedback={undefined}
                onFeedback={() => {}}
                isGenerating={false}
                isLast={index === sharedChat.messages.length - 1}
                onImageClick={(url) => {
                  // If there's an image click handler in the app, we can just open it in a new window or ignore
                  window.open(url, '_blank');
                }}
                onVideoClick={(url) => {
                  window.open(url, '_blank');
                }}
                isTemporary={false}
                searchUsed={false}
                isSearching={false}
                isAnalyzingImage={false}
                isAnalyzingVideo={false}
                searchSources={undefined}
                hideActions={true}
                userHasImage={userHasImage}
                userHasVideo={userHasVideo}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

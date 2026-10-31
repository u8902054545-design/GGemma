import React from 'react';

interface SendActionProps {
  isTyping: boolean;
  stopRequest: () => void;
  handleWrappedSend: () => void;
  isSendDisabled: boolean;
  showVoiceChat: boolean;
  onVoiceChatClick: () => void;
  preventFocusLoss?: (e: React.MouseEvent) => void;
}

export const SendAction: React.FC<SendActionProps> = ({
  isTyping,
  stopRequest,
  handleWrappedSend,
  isSendDisabled,
  showVoiceChat,
  onVoiceChatClick,
  preventFocusLoss = (e) => e.preventDefault(),
}) => {
  return (
    <div className="primary-action-slot">
      {isTyping ? (
        <button
          type="button"
          onMouseDown={preventFocusLoss}
          onClick={stopRequest}
          className="btn-slot-item btn-stop-action"
          title="Остановить генерацию"
          aria-label="Stop generation"
        >
          <span className="material-symbols-outlined text-[22px]">stop</span>
        </button>
      ) : (
        <>
          <button
            type="button"
            onMouseDown={preventFocusLoss}
            onClick={onVoiceChatClick}
            className="btn-slot-item btn-voice-chat"
            title="Gemma Live"
            aria-label="Gemma Live"
          >
            <span className="material-symbols-outlined text-[22px]">voice_chat</span>
          </button>

          <button
            type="button"
            onMouseDown={preventFocusLoss}
            onClick={handleWrappedSend}
            disabled={isSendDisabled}
            className="btn-slot-item btn-send-upward"
            title="Отправить сообщение"
            aria-label="Send message"
          >
            <span className="material-symbols-outlined text-[22px]">arrow_upward</span>
          </button>
        </>
      )}
    </div>
  );
};

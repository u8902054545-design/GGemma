import React from 'react';
import { GemmaIcon } from '../GemmaIcon';

type HeaderProps = {
  hasThought: boolean;
  isExpanded: boolean;
  onToggleThought: () => void;
  onSpeech?: () => void;
  isSpeaking?: boolean;
  modelName?: string;
};

export const ChatMessageHeader: React.FC<HeaderProps> = ({
  hasThought,
  isExpanded,
  onToggleThought,
  onSpeech,
  isSpeaking,
  modelName
}) => {
  return (
    <div className="flex items-center gap-2 mb-3 w-full">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-6 h-6">
          <GemmaIcon className="w-6 h-6" />
        </div>
        <span className="text-sm font-medium text-[var(--md-sys-color-on-surface-variant)]">
          {modelName || 'Gemma'}
        </span>
      </div>

      {hasThought && (
        <button
          onClick={onToggleThought}
          className="flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--md-sys-color-surface-container-high)] hover:bg-[#333] transition-colors text-[11px] text-[var(--md-sys-color-on-surface-variant)] border border-[var(--md-sys-color-outline)]/20"
        >
          <span>Show thought</span>
          <span className="material-symbols-outlined text-[14px]">
            {isExpanded ? 'expand_less' : 'expand_more'}
          </span>
        </button>
      )}

      <button
        onClick={onSpeech}
        className={`ml-auto p-1.5 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center ${
          isSpeaking 
            ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-lg scale-110' 
            : 'hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]'
        }`}
        title={isSpeaking ? "Stop" : "Listen"}
      >
        <span className="material-symbols-outlined text-[20px]">
          {isSpeaking ? 'pause' : 'volume_up'}
        </span>
      </button>
    </div>
  );
};

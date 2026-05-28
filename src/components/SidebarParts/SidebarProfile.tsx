import React from 'react';

interface SidebarProfileProps {
  userAvatar?: string;
  userName?: string;
  onClick: () => void;
}

export const SidebarProfile: React.FC<SidebarProfileProps> = ({ userAvatar, userName, onClick }) => {
  return (
    <div className="p-4 border-t border-[var(--md-sys-color-outline-variant)]/10 bg-[var(--md-sys-color-surface)] shrink-0">
      <button 
        onClick={onClick}
        className="w-full flex items-center gap-3 p-2 hover:bg-[var(--md-sys-color-on-surface-variant)]/10 rounded-full transition-colors group"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-[var(--md-sys-color-outline-variant)]/20">
          {userAvatar ? (
            <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[var(--md-sys-color-primary)] flex items-center justify-center text-[var(--md-sys-color-on-primary)] text-xs">
              {userName?.charAt(0)}
            </div>
          )}
        </div>
        <span className="flex-1 text-sm font-medium text-[var(--md-sys-color-on-surface)] truncate text-left">
          {userName}
        </span>
        <md-icon className="text-[var(--md-sys-color-on-surface-variant)] group-hover:text-[var(--md-sys-color-on-surface)] transition-colors">
          settings
        </md-icon>
      </button>
    </div>
  );
};

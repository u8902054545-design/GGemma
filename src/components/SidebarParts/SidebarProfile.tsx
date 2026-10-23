import React, { useState } from 'react';
import { QuotaAndUsagePage } from '../QuotaUsage/QuotaAndUsagePage';

interface SidebarProfileProps {
  userAvatar?: string;
  userName?: string;
  onClick: () => void;
  onUpdatePlanClick?: () => void;
}

export const SidebarProfile: React.FC<SidebarProfileProps> = ({ 
  userAvatar, 
  userName, 
  onClick,
  onUpdatePlanClick 
}) => {
  const [isQuotaUsageOpen, setIsQuotaUsageOpen] = useState(false);

  const handleUpdatePlan = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdatePlanClick) {
      onUpdatePlanClick();
    } else {
      setIsQuotaUsageOpen(true);
    }
  };

  return (
    <>
      <div className="p-4 border-t border-[var(--md-sys-color-outline-variant)]/10 bg-[var(--md-sys-color-surface)] shrink-0">
        <div className="w-full flex items-center justify-between gap-2 p-1">
          <button 
            type="button"
            onClick={onClick}
            className="flex items-center gap-2.5 min-w-0 flex-1 p-1 hover:bg-[var(--md-sys-color-on-surface-variant)]/10 rounded-full transition-colors group text-left cursor-pointer"
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
            <span className="text-sm font-medium text-[var(--md-sys-color-on-surface)] truncate">
              {userName}
            </span>
          </button>

          <button
            type="button"
            onClick={handleUpdatePlan}
            style={{ backgroundColor: '#0000FF' }}
            className="shrink-0 px-3.5 py-1.5 rounded-full hover:opacity-90 active:scale-95 text-white text-xs sm:text-sm font-medium shadow-sm transition-all duration-200 cursor-pointer flex items-center justify-center select-none whitespace-nowrap"
            title="Update plan"
            aria-label="Update plan"
          >
            Update plan
          </button>

          <button
            type="button"
            onClick={onClick}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--md-sys-color-on-surface-variant)]/10 transition-colors shrink-0 group cursor-pointer"
            title="Settings"
            aria-label="Settings"
          >
            <md-icon className="text-[var(--md-sys-color-on-surface-variant)] group-hover:text-[var(--md-sys-color-on-surface)] transition-colors">
              settings
            </md-icon>
          </button>
        </div>
      </div>

      <QuotaAndUsagePage
        isOpen={isQuotaUsageOpen}
        onClose={() => setIsQuotaUsageOpen(false)}
      />
    </>
  );
};

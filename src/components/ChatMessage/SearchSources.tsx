import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../hooks/useLanguage';
import '@material/web/button/text-button.js';

interface Source {
  title: string;
  url: string;
}

interface SearchSourcesProps {
  sources?: Source[];
}

const SourceCard: React.FC<Source> = ({ title, url }) => {
  const [imgError, setImgError] = useState(false);
  
  let domain = "";
  try {
    domain = new URL(url).hostname;
  } catch (_) {
    domain = url;
  }
  
  const displayName = domain.replace(/^www\./, '');
  
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-3 rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] hover:bg-[var(--md-sys-color-surface-container-high)] hover:shadow-sm transition-all duration-200 cursor-pointer outline-none active:scale-[0.99] group"
    >
      <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-surface-container-highest)] flex items-center justify-center overflow-hidden flex-shrink-0 border border-[var(--md-sys-color-outline-variant)]/50">
        {!imgError ? (
          <img
            src={`https://www.google.com/s2/favicons?sz=64&domain=${domain}`}
            onError={() => setImgError(true)}
            className="w-4 h-4 object-contain"
            alt=""
          />
        ) : (
          <span className="material-symbols-outlined text-[14px] text-[var(--md-sys-color-on-surface-variant)]">public</span>
        )}
      </div>
      
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <span className="text-[13px] font-medium text-[var(--md-sys-color-on-surface)] line-clamp-1 group-hover:text-[var(--md-sys-color-primary)] transition-colors">
          {title || displayName}
        </span>
        <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] line-clamp-1 mt-0.5">
          {displayName}
        </span>
      </div>
      
      <span className="material-symbols-outlined text-[16px] text-[var(--md-sys-color-on-surface-variant)] opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0">
        arrow_outward
      </span>
    </a>
  );
};

export const SearchSources: React.FC<SearchSourcesProps> = ({ sources }) => {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!sources || sources.length === 0) return null;
  
  const displayedSources = isExpanded ? sources : sources.slice(0, 3);
  const hasMore = sources.length > 3;
  
  return (
    <div className="flex flex-col gap-2 mt-4 w-full max-w-[640px] border-t border-[var(--md-sys-color-outline-variant)]/10 pt-3">
      <div className="flex items-center gap-2 mb-1.5 px-1">
        <span className="material-symbols-outlined text-[16px] text-[var(--md-sys-color-primary)]">source</span>
        <span className="text-[11px] font-bold tracking-wider uppercase text-[var(--md-sys-color-primary)]">
          {t('chat.search.sources')}
        </span>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        <AnimatePresence initial={false}>
          {displayedSources.map((source, index) => (
            <motion.div
              key={source.url + '-' + index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <SourceCard title={source.title} url={source.url} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {hasMore && (
        <div className="flex justify-start mt-1">
          <md-text-button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              '--md-text-button-label-text-color': 'var(--md-sys-color-primary)',
              '--md-text-button-label-text-size': '12px',
              'height': '32px'
            }}
          >
            <span slot="icon" className="material-symbols-outlined">
              {isExpanded ? 'expand_less' : 'expand_more'}
            </span>
            {isExpanded ? t('chat.search.show_less') : t('chat.search.all_sources')}
          </md-text-button>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../hooks/useLanguage';
import { VideoPreview } from '../VideoPreview';
import { YouTubeIcon } from '../IconsApp/YouTubeIcon';
import '@material/web/button/text-button.js';

interface Source {
  title: string;
  url: string;
  type?: string;
  thumbnail?: string;
  channelTitle?: string;
  views?: string;
}

interface SearchSourcesProps {
  sources?: Source[];
  isYouTubeSearch?: boolean;
}

const getYouTubeVideoId = (url: string) => {
  if (!url) return '';
  if (url.includes('youtu.be/')) {
    return url.split('youtu.be/')[1]?.split('?')[0];
  } else if (url.includes('watch?v=')) {
    return url.split('watch?v=')[1]?.split('&')[0];
  } else if (url.includes('embed/')) {
    return url.split('embed/')[1]?.split('?')[0];
  }
  return '';
};

const YouTubeVideoCard: React.FC<Source> = ({ title, url, thumbnail, channelTitle }) => {
  const [isVideoPreviewOpen, setIsVideoPreviewOpen] = useState(false);
  const videoId = getYouTubeVideoId(url);
  const posterUrl = thumbnail || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '');

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsVideoPreviewOpen(true);
  };

  return (
    <>
      <div
        onClick={handleClick}
        className="flex flex-col rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] hover:bg-[var(--md-sys-color-surface-container-high)] hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden group outline-none active:scale-[0.99]"
      >
        <div className="relative w-full aspect-video bg-black/10 overflow-hidden">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[var(--md-sys-color-surface-container-highest)]">
              <span className="material-symbols-outlined text-[32px] text-[var(--md-sys-color-on-surface-variant)]">play_circle</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[24px]">play_arrow</span>
            </div>
          </div>
        </div>

        <div className="p-3.5 flex flex-col gap-1">
          <span className="text-[13px] font-semibold text-[var(--md-sys-color-on-surface)] line-clamp-2 leading-snug group-hover:text-[var(--md-sys-color-primary)] transition-colors">
            {title}
          </span>
          {channelTitle && (
            <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] line-clamp-1">
              {channelTitle}
            </span>
          )}
        </div>
      </div>

      {isVideoPreviewOpen && (
        <VideoPreview
          url={url}
          onClose={() => setIsVideoPreviewOpen(false)}
        />
      )}
    </>
  );
};

const SourceCard: React.FC<Source> = ({ title, url, type }) => {
  const [imgError, setImgError] = useState(false);
  const [isVideoPreviewOpen, setIsVideoPreviewOpen] = useState(false);

  const isYouTube = type === 'video' || url.includes('youtube.com') || url.includes('youtu.be');

  let domain = "";
  try {
    domain = new URL(url).hostname;
  } catch (_) {
    domain = url;
  }

  const displayName = domain.replace(/^www\./, '');

  const handleClick = (e: React.MouseEvent) => {
    if (isYouTube) {
      e.preventDefault();
      setIsVideoPreviewOpen(true);
    }
  };

  return (
    <>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
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
            {isYouTube ? 'YouTube Video' : displayName}
          </span>
        </div>

        <span className="material-symbols-outlined text-[16px] text-[var(--md-sys-color-on-surface-variant)] opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0">
          {isYouTube ? 'play_arrow' : 'arrow_outward'}
        </span>
      </a>

      {isVideoPreviewOpen && (
        <VideoPreview
          url={url}
          onClose={() => setIsVideoPreviewOpen(false)}
        />
      )}
    </>
  );
};

export const SearchSources: React.FC<SearchSourcesProps> = ({ sources, isYouTubeSearch }) => {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  const displayedSources = isYouTubeSearch ? sources : (isExpanded ? sources : sources.slice(0, 3));
  const hasMore = !isYouTubeSearch && sources.length > 3;

  return (
    <div className="flex flex-col gap-2 mt-4 w-full max-w-[640px] border-t border-[var(--md-sys-color-outline-variant)]/10 pt-3">
      <div className="flex items-center gap-2 mb-1.5 px-1">
        {isYouTubeSearch ? (
          <YouTubeIcon className="w-4 h-4 text-[var(--md-sys-color-primary)] flex-shrink-0" />
        ) : (
          <span className="material-symbols-outlined text-[16px] text-[var(--md-sys-color-primary)]">source</span>
        )}
        <span className="text-[11px] font-bold tracking-wider uppercase text-[var(--md-sys-color-primary)]">
          {isYouTubeSearch ? ('Found on YouTube') : t('chat.search.sources')}
        </span>
      </div>

      <div className={isYouTubeSearch ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : "grid grid-cols-1 gap-2"}>
        <AnimatePresence initial={false}>
          {displayedSources.map((source, index) => (
            <motion.div
              key={source.url + '-' + index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              {isYouTubeSearch ? (
                <YouTubeVideoCard
                  title={source.title}
                  url={source.url}
                  thumbnail={source.thumbnail}
                  channelTitle={source.channelTitle}
                />
              ) : (
                <SourceCard
                  title={source.title}
                  url={source.url}
                  type={source.type}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {hasMore && (
        <div className="w-full mt-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full h-9 flex items-center justify-center bg-[var(--md-sys-color-primary-container)] hover:bg-[var(--md-sys-color-primary-container)]/85 text-[var(--md-sys-color-on-primary-container)] rounded-full text-[12px] font-semibold transition-all active:scale-[0.98] cursor-pointer outline-none border-none"
          >
            {isExpanded ? t('chat.search.show_less') : t('chat.search.all_sources')}
          </button>
        </div>
      )}
    </div>
  );
};

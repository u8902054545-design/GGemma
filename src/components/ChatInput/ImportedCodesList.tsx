import React from 'react';
import { ImportedCode } from '../../hooks/chatTypes';

interface ImportedCodesListProps {
  importedCodes: ImportedCode[];
  onRemoveCode?: (id: string) => void;
}

export const ImportedCodesList: React.FC<ImportedCodesListProps> = ({
  importedCodes,
  onRemoveCode,
}) => {
  if (importedCodes.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-3 px-1 no-scrollbar mb-1 max-w-full">
      {importedCodes.map((code) => (
        <div 
          key={code.id}
          className="flex items-center gap-2 px-3 py-2 bg-[var(--md-sys-color-surface-container-high)] rounded-xl border border-[var(--md-sys-color-outline-variant)] flex-shrink-0 animate-in fade-in zoom-in duration-200"
        >
          <md-icon style={{ fontSize: '20px', color: 'var(--md-sys-color-primary)' }}>code</md-icon>
          <span className="text-sm font-medium text-[var(--md-sys-color-on-surface)] truncate max-w-[150px]">
            {code.filename}
          </span>
          <button 
            onClick={() => onRemoveCode?.(code.id)}
            className="ml-1 p-0.5 rounded-full hover:bg-[var(--md-sys-color-on-surface-variant)]/10 text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center"
          >
            <md-icon style={{ fontSize: '18px' }}>close</md-icon>
          </button>
        </div>
      ))}
    </div>
  );
};

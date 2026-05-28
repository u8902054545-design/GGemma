import React from 'react';
import { ImportedCode } from '../../hooks/chatTypes';

interface ImportedCodesProps {
  codes: ImportedCode[];
}

export const ImportedCodes: React.FC<ImportedCodesProps> = ({ codes }) => {
  if (!codes || codes.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {codes.map((c, idx) => (
        <div key={c.id || idx} className="flex items-center gap-2 px-3 py-2 bg-[var(--md-sys-color-surface-container-highest)] rounded-xl border border-[var(--md-sys-color-outline-variant)] w-fit">
          <span className="material-symbols-outlined text-[18px] text-[var(--md-sys-color-primary)]">code</span>
          <span className="text-sm font-medium text-[var(--md-sys-color-on-surface-variant)] truncate max-w-[200px]">{c.filename}</span>
        </div>
      ))}
    </div>
  );
};

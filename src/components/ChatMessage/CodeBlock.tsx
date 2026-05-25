import React, { memo, useState } from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import js from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import ts from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { DownloadDialog } from './DownloadDialog';

SyntaxHighlighter.registerLanguage('javascript', js);
SyntaxHighlighter.registerLanguage('typescript', ts);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('python', python);

type CodeBlockProps = {
  language: string;
  value: string;
  isCopied: boolean;
  onCopy: (code: string) => void;
};

const CodeBlockComponent: React.FC<CodeBlockProps> = ({ language, value, isCopied, onCopy }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDownload = (filename: string, extension: string) => {
    const blob = new Blob([value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${extension.replace('.', '')}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsDialogOpen(false);
  };

  const getFileExtension = (lang: string) => {
    const map: Record<string, string> = {
      python: 'py',
      javascript: 'js',
      typescript: 'ts',
      json: 'json',
      css: 'css',
      html: 'html'
    };
    return map[lang.toLowerCase()] || lang;
  };

  return (
    <div className="my-6 w-full flex flex-col rounded-2xl overflow-hidden border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)]">
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--md-sys-color-surface-container-high)]">
        <span className="text-[11px] font-bold font-mono text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-widest">
          {language}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onCopy(value)}
            className="flex items-center p-2 rounded-lg transition-all hover:bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-primary)]"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isCopied ? 'done' : 'content_copy'}
            </span>
          </button>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center p-2 rounded-lg transition-all hover:bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-primary)]"
          >
            <span className="material-symbols-outlined text-[20px]">
              download
            </span>
          </button>
        </div>
      </div>
      
      <div className="relative w-full overflow-hidden bg-[var(--md-sys-color-surface)]">
        <SyntaxHighlighter
          language={language}
          style={atomDark}
          PreTag="div"
          customStyle={{
            margin: 0,
            padding: '20px',
            background: 'transparent',
            fontSize: '14px',
            lineHeight: '1.5',
            width: '100%',
            overflowX: 'hidden'
          }}
          codeTagProps={{
            style: {
              fontFamily: '"Fira Code", monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              display: 'block'
            }
          }}
        >
          {value}
        </SyntaxHighlighter>
      </div>

      <DownloadDialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleDownload}
        defaultExtension={getFileExtension(language)}
      />
    </div>
  );
};

export const CodeBlock = memo(CodeBlockComponent);

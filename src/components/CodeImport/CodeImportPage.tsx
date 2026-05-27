import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { pageVariants } from '../../motion/transitions';
import { useLanguage } from '../../hooks/useLanguage';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/icon/icon.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/button/filled-button.js';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import js from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import ts from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

SyntaxHighlighter.registerLanguage('javascript', js);
SyntaxHighlighter.registerLanguage('typescript', ts);
SyntaxHighlighter.registerLanguage('css', css);

interface CodeImportPageProps {
  onClose: () => void;
  onImport: (filename: string, code: string) => void;
}

export const CodeImportPage: React.FC<CodeImportPageProps> = ({ onClose, onImport }) => {
  const { t } = useLanguage();
  const [filename, setFilename] = useState('');
  const [code, setCode] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLDivElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.currentTarget.scrollTop;
      preRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const lineNumbers = code.split('\n').map((_, i) => i + 1).join('\n');
  const hasExtension = filename.includes('.') && filename.split('.').pop() !== '';

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="fixed inset-0 z-[150] bg-[var(--md-sys-color-surface)] flex flex-col"
    >
      <header className="h-16 flex items-center px-4 gap-4 border-b border-[var(--md-sys-color-outline-variant)]">
        <md-icon-button onClick={onClose}>
          <md-icon>close</md-icon>
        </md-icon-button>
        <h2 className="flex-1 text-lg font-medium text-[var(--md-sys-color-on-surface)]">
          {t('chat.import.code') || 'Import Code'}
        </h2>
        <md-filled-button 
          onClick={() => onImport(filename, code)}
          disabled={!filename.trim() || !code.trim() || !hasExtension}
        >
          {t('chat.import.button') || 'Import'}
        </md-filled-button>
      </header>

      <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
        <md-outlined-text-field
          label={t('chat.import.filename') || 'Filename'}
          value={filename}
          onInput={(e: any) => setFilename(e.target.value)}
          className="w-full"
        />

        <div className="flex-1 relative rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] overflow-hidden flex">
          {/* Line Numbers */}
          <div 
            ref={lineNumbersRef}
            className="w-12 bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] font-mono text-sm py-4 text-right pr-3 select-none border-r border-[var(--md-sys-color-outline-variant)] overflow-hidden"
          >
            <pre className="m-0 leading-[1.5]">{lineNumbers}</pre>
          </div>

          <div className="flex-1 relative overflow-hidden">
            {/* Syntax Highlighter (Background) */}
            <div 
              ref={preRef}
              className="absolute inset-0 p-4 pointer-events-none overflow-hidden whitespace-pre"
            >
              <SyntaxHighlighter
                language="javascript"
                style={atomDark}
                PreTag="div"
                customStyle={{
                  margin: 0,
                  padding: 0,
                  background: 'transparent',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  width: '100%',
                  height: '100%',
                }}
                codeTagProps={{
                  style: {
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    whiteSpace: 'pre',
                    display: 'block'
                  }
                }}
              >
                {code + (code.endsWith('\n') ? ' ' : '')}
              </SyntaxHighlighter>
            </div>

            {/* Textarea (Foreground) */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onScroll={handleScroll}
              className="absolute inset-0 w-full h-full p-4 bg-transparent text-transparent caret-[var(--md-sys-color-primary)] font-mono text-sm leading-[1.5] outline-none resize-none whitespace-pre overflow-auto"
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              }}
              spellCheck={false}
              placeholder={t('chat.import.placeholder') || 'Paste your code here...'}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

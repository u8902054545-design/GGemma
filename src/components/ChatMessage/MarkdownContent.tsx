import React from 'react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { CodeBlock } from './CodeBlock';

interface MarkdownContentProps {
  content: string;
  isAI: boolean;
  copiedText: string | null;
  handleCopy: (text: string) => void;
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({
  content,
  isAI,
  copiedText,
  handleCopy
}) => {
  if (!isAI) {
    return (
      <div className="whitespace-pre-wrap break-words">
        {content}
      </div>
    );
  }

  return (
    <motion.div layout="position" className="min-h-[1.5em]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          pre: ({ children }) => <>{children}</>,
          code({ inline, className, children }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');
            return !inline && match ? (
              <CodeBlock
                language={match[1]}
                value={codeString}
                isCopied={copiedText === codeString}
                onCopy={handleCopy}
              />
            ) : (
              <code className="bg-[var(--md-sys-color-surface-container-high)] px-1.5 py-0.5 rounded text-sm font-mono text-[var(--md-sys-color-primary)]">
                {children}
              </code>
            );
          },
          p: ({ children }) => <p className="mb-4 last:mb-0 break-words">{children}</p>,
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto rounded-lg border border-[var(--md-sys-color-outline-variant)]">
              <table className="w-full border-collapse text-sm text-left">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-[var(--md-sys-color-surface-container-high)]">{children}</thead>,
          th: ({ children }) => <th className="px-4 py-2 border-b border-[var(--md-sys-color-outline-variant)] font-semibold">{children}</th>,
          td: ({ children }) => <td className="px-4 py-2 border-b border-[var(--md-sys-color-outline-variant)]">{children}</td>,
          ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-[var(--md-sys-color-primary)] hover:underline">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </motion.div>
  );
};

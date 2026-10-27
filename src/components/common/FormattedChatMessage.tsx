import React from 'react';

interface FormattedChatMessageProps {
  content: string;
  isUser?: boolean;
}

export const FormattedChatMessage: React.FC<FormattedChatMessageProps> = ({ content, isUser = false }) => {
  if (!content) return null;

  // Helper to parse inline styles: ***bold italic***, **bold**, *italic*, and `code`
  const renderInline = (text: string): React.ReactNode[] => {
    // Regex matching ***...***, **...**, *...*, `...`
    const tokenRegex = /(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
    const parts = text.split(tokenRegex);

    return parts.map((part, index) => {
      if (!part) return null;

      if (part.startsWith('***') && part.endsWith('***') && part.length >= 6) {
        return (
          <strong
            key={index}
            className={isUser ? 'font-black italic text-white' : 'font-black italic text-slate-900'}
          >
            {part.slice(3, -3)}
          </strong>
        );
      }

      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return (
          <strong
            key={index}
            className={isUser ? 'font-bold text-white' : 'font-bold text-slate-900'}
          >
            {part.slice(2, -2)}
          </strong>
        );
      }

      if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
        return (
          <em
            key={index}
            className={isUser ? 'italic text-emerald-100' : 'italic text-slate-700'}
          >
            {part.slice(1, -1)}
          </em>
        );
      }

      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        return (
          <code
            key={index}
            className={
              isUser
                ? 'px-1.5 py-0.5 rounded bg-emerald-700 font-mono text-xs text-white'
                : 'px-1.5 py-0.5 rounded bg-slate-100 text-emerald-800 font-mono text-xs font-semibold border border-slate-200'
            }
          >
            {part.slice(1, -1)}
          </code>
        );
      }

      return <span key={index}>{part}</span>;
    });
  };

  const lines = content.split('\n');

  return (
    <div className={`space-y-1.5 text-xs sm:text-sm leading-relaxed ${isUser ? 'text-white' : 'text-slate-800'}`}>
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();

        // Empty line
        if (!trimmed) {
          return <div key={lineIdx} className="h-1.5" />;
        }

        // Headings: ### or ## or #
        if (trimmed.startsWith('### ')) {
          const headingText = trimmed.slice(4).trim();
          return (
            <h4
              key={lineIdx}
              className={`font-black text-xs sm:text-sm pt-1.5 pb-0.5 flex items-center gap-1.5 ${
                isUser ? 'text-emerald-100 border-b border-emerald-500/30' : 'text-slate-900 border-b border-slate-100'
              }`}
            >
              {renderInline(headingText)}
            </h4>
          );
        }

        if (trimmed.startsWith('## ')) {
          const headingText = trimmed.slice(3).trim();
          return (
            <h3
              key={lineIdx}
              className={`font-black text-sm sm:text-base pt-2 pb-1 ${
                isUser ? 'text-white' : 'text-slate-900'
              }`}
            >
              {renderInline(headingText)}
            </h3>
          );
        }

        // Bullet point: • or - or * (at line start followed by space)
        if (
          trimmed.startsWith('• ') ||
          trimmed.startsWith('- ') ||
          (trimmed.startsWith('* ') && !trimmed.startsWith('**'))
        ) {
          const bulletText = trimmed.slice(2).trim();
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-1 py-0.5">
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${
                  isUser ? 'bg-emerald-300' : 'bg-emerald-600'
                }`}
              />
              <div className="flex-1 min-w-0">{renderInline(bulletText)}</div>
            </div>
          );
        }

        // Numbered list: e.g. "1. ", "2. ", "10. "
        const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numberedMatch) {
          const num = numberedMatch[1];
          const itemText = numberedMatch[2];
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-0.5 py-0.5">
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 ${
                  isUser
                    ? 'bg-emerald-500/40 text-white'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {num}
              </span>
              <div className="flex-1 min-w-0">{renderInline(itemText)}</div>
            </div>
          );
        }

        // Normal text line
        return (
          <div key={lineIdx}>
            {renderInline(trimmed)}
          </div>
        );
      })}
    </div>
  );
};

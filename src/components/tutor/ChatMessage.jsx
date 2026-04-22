import ReactMarkdown from "react-markdown";

// Parse and render markdown tables manually
function renderContent(content) {
  const tableRegex = /(\|.+\|\n\|[-| :]+\|\n(?:\|.+\|\n?)+)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = tableRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: content.slice(lastIndex, match.index) });
    }
    parts.push({ type: "table", value: match[0] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < content.length) {
    parts.push({ type: "text", value: content.slice(lastIndex) });
  }
  return parts;
}

function MarkdownTable({ raw }) {
  const lines = raw.trim().split("\n").filter(l => !l.match(/^\|[-| :]+\|$/));
  const headers = lines[0].split("|").filter(Boolean).map(h => h.trim());
  const rows = lines.slice(1).map(l => l.split("|").filter(Boolean).map(c => c.trim()));
  return (
    <div className="overflow-x-auto my-2">
      <table className="min-w-full text-xs border-collapse border border-purple-200 rounded-lg overflow-hidden">
        <thead className="bg-purple-100 text-purple-800">
          <tr>{headers.map((h, i) => <th key={i} className="px-2 py-1.5 text-right font-semibold border border-purple-200">{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-purple-50"}>
              {row.map((cell, j) => <td key={j} className="px-2 py-1.5 text-right border border-purple-100">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ChatMessage({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-lg flex-shrink-0 ml-2 mt-1 shadow-sm">
          🦋
        </div>
      )}

      <div className={`max-w-[85%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        {message.imageUrl && (
          <img
            src={message.imageUrl}
            alt="מבחן"
            className="rounded-2xl max-w-full max-h-48 object-contain border border-purple-100 shadow-sm mb-1"
          />
        )}

        {message.content && (
          <div
            className={`rounded-2xl px-4 py-3 shadow-sm text-sm leading-relaxed ${
              isUser
                ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-bl-sm"
                : "bg-white border border-purple-100 text-gray-800 rounded-tl-sm"
            }`}
          >
            {isUser ? (
              <p>{message.content}</p>
            ) : (
              <div className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                {renderContent(message.content).map((part, idx) =>
                  part.type === "table" ? (
                    <MarkdownTable key={idx} raw={part.value} />
                  ) : (
                    <ReactMarkdown
                      key={idx}
                      components={{
                        p: ({ children }) => <p className="my-1.5 leading-relaxed text-gray-800">{children}</p>,
                        h1: ({ children }) => <h1 className="text-lg font-bold text-purple-800 my-2">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-base font-bold text-purple-700 my-2 border-b border-purple-100 pb-1">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-sm font-bold text-purple-600 my-1.5">{children}</h3>,
                        ul: ({ children }) => <ul className="my-2 space-y-1.5 list-none pr-1">{children}</ul>,
                        ol: ({ children }) => <ol className="my-2 space-y-2 list-none pr-1">{children}</ol>,
                        li: ({ children }) => {
                          const text = String(children);
                          const isCorrect = text.startsWith('✓') || text.startsWith('✅') || text.includes('נכון');
                          const isWrong = text.startsWith('✗') || text.startsWith('❌') || text.includes('טעות') || text.includes('טעת');
                          return (
                            <li className="flex items-start gap-2 leading-relaxed">
                              <span className={`mt-0.5 text-base flex-shrink-0 ${isCorrect ? 'text-green-500' : isWrong ? 'text-red-500' : 'text-purple-400'}`}>
                                {isCorrect ? '✓' : isWrong ? '✗' : '•'}
                            </span>
                              <span>{children}</span>
                            </li>
                        );
                        },
                        strong: ({ children }) => <strong className="font-bold text-purple-700">{children}</strong>,
                        hr: () => <hr className="my-3 border-purple-100" />,
                        blockquote: ({ children }) => (
                          <blockquote className="border-r-4 border-purple-300 bg-purple-50 rounded-lg px-3 py-2 my-2 text-purple-800">
                            {children}
                          </blockquote>
                        ),
                      }}
                    >
                      {part.value}
                    </ReactMarkdown>
                  )
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center text-lg flex-shrink-0 mr-2 mt-1 shadow-sm">
          ⭐
        </div>
      )}
    </div>
  );
}
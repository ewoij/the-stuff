import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

const components: Components = {
  h1: (props) => <h1 className="text-xl font-bold mt-4 mb-2" {...props} />,
  h2: (props) => <h2 className="text-lg font-bold mt-3 mb-2" {...props} />,
  h3: (props) => <h3 className="text-base font-semibold mt-2 mb-1" {...props} />,
  p: (props) => <p className="mb-2 last:mb-0" {...props} />,
  ul: (props) => <ul className="list-disc pl-4 mb-2" {...props} />,
  ol: (props) => <ol className="list-decimal pl-4 mb-2" {...props} />,
  li: (props) => <li className="mb-0.5" {...props} />,
  a: (props) => (
    <a
      className="text-primary underline underline-offset-2"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  blockquote: (props) => (
    <blockquote
      className="border-l-2 border-muted-foreground/30 pl-3 italic my-2"
      {...props}
    />
  ),
  code: ({ children, className, ...props }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <code
          className="block bg-muted rounded p-3 text-xs overflow-x-auto my-2"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code className="bg-muted rounded px-1 py-0.5 text-xs" {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children }) => <>{children}</>,
  hr: () => <hr className="my-3 border-border" />,
};

export function Markdown({ content }: { content: string }) {
  return (
    <div className="text-sm text-muted-foreground">
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  );
}

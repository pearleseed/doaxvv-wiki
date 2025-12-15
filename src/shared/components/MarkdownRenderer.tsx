import { memo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkSupersub from 'remark-supersub';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import type { Components } from 'react-markdown';
import { Check, Copy } from 'lucide-react';
import 'katex/dist/katex.min.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  enableToc?: boolean;
}

// Vietnamese character normalization map
const vietnameseMap: Record<string, string> = {
  'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
  'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
  'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
  'đ': 'd',
  'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
  'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
  'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
  'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
  'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
  'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
  'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
  'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
  'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
};

// Normalize Vietnamese text to ASCII for URL-safe IDs
const normalizeVietnamese = (text: string): string => {
  return text
    .split('')
    .map(char => vietnameseMap[char] || vietnameseMap[char.toLowerCase()] || char)
    .join('');
};

// Generate ID from heading text for anchor links
const generateId = (text: string): string => {
  return normalizeVietnamese(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

// Code block with language label and copy button
const CodeBlock = memo(({ className, children, inline }: { 
  className?: string; 
  children: React.ReactNode;
  inline?: boolean;
}) => {
  const [copied, setCopied] = useState(false);
  const language = className?.replace('language-', '') || '';
  const codeText = String(children).replace(/\n$/, '');
  
  if (inline) {
    return (
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground">
        {children}
      </code>
    );
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group mb-4">
      <div className="absolute top-2 right-2 flex items-center gap-2">
        {language && (
          <span className="text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            {language}
          </span>
        )}
        <button
          onClick={handleCopy}
          className="p-1.5 rounded bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all"
          title={copied ? 'Copied!' : 'Copy code'}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
        <code className={`text-sm font-mono ${className || ''}`}>
          {children}
        </code>
      </pre>
    </div>
  );
});
CodeBlock.displayName = 'CodeBlock';

// Blockquote with GitHub-style alerts support
const Blockquote = memo(({ children }: { children: React.ReactNode }) => {
  const childText = String(children);
  
  // GitHub-style alerts: [!NOTE], [!TIP], [!IMPORTANT], [!WARNING], [!CAUTION]
  const alertTypes: Record<string, { icon: string; className: string }> = {
    '[!NOTE]': { icon: 'ℹ️', className: 'border-blue-500 bg-blue-500/10' },
    '[!TIP]': { icon: '💡', className: 'border-green-500 bg-green-500/10' },
    '[!IMPORTANT]': { icon: '❗', className: 'border-purple-500 bg-purple-500/10' },
    '[!WARNING]': { icon: '⚠️', className: 'border-yellow-500 bg-yellow-500/10' },
    '[!CAUTION]': { icon: '🔴', className: 'border-red-500 bg-red-500/10' },
  };

  for (const [marker, config] of Object.entries(alertTypes)) {
    if (childText.includes(marker)) {
      return (
        <blockquote className={`border-l-4 ${config.className} pl-4 py-2 my-4 rounded-r-lg`}>
          <span className="mr-2">{config.icon}</span>
          {children}
        </blockquote>
      );
    }
  }

  return (
    <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4">
      {children}
    </blockquote>
  );
});
Blockquote.displayName = 'Blockquote';

// Video embed detection
const getVideoEmbed = (href: string, title?: string) => {
  const isYoutube = href.includes('youtube.com') || href.includes('youtu.be');
  const isVimeo = href.includes('vimeo.com');
  
  if (isYoutube) {
    const videoId = href.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1];
    if (videoId) {
      return (
        <div className="relative aspect-video mb-4 rounded-lg overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title={title || 'YouTube Video'}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
  }
  
  if (isVimeo) {
    const videoId = href.match(/vimeo\.com\/(\d+)/)?.[1];
    if (videoId) {
      return (
        <div className="relative aspect-video mb-4 rounded-lg overflow-hidden">
          <iframe
            src={`https://player.vimeo.com/video/${videoId}`}
            title={title || 'Vimeo Video'}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
  }
  
  return null;
};

const createComponents = (enableToc: boolean): Components => ({
  // Headers with IDs for TOC navigation
  h1: ({ children }) => {
    const id = `section-${generateId(String(children))}`;
    return (
      <h2 id={id} className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border/50 scroll-mt-24 group">
        {children}
        {enableToc && (
          <a href={`#${id}`} className="ml-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary transition-opacity">
            #
          </a>
        )}
      </h2>
    );
  },
  h2: ({ children }) => {
    const id = `section-${generateId(String(children))}`;
    return (
      <h3 id={id} className="text-xl font-semibold text-foreground mb-3 mt-6 scroll-mt-24 group">
        {children}
        {enableToc && (
          <a href={`#${id}`} className="ml-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary transition-opacity">
            #
          </a>
        )}
      </h3>
    );
  },
  h3: ({ children }) => {
    const id = `section-${generateId(String(children))}`;
    return (
      <h4 id={id} className="text-lg font-medium text-foreground mb-2 mt-4 scroll-mt-24">
        {children}
      </h4>
    );
  },
  h4: ({ children }) => {
    const id = `section-${generateId(String(children))}`;
    return (
      <h5 id={id} className="text-base font-medium text-foreground mb-2 mt-3 scroll-mt-24">
        {children}
      </h5>
    );
  },
  h5: ({ children }) => (
    <h6 className="text-sm font-medium text-foreground mb-2 mt-3 scroll-mt-24">
      {children}
    </h6>
  ),
  h6: ({ children }) => (
    <p className="text-sm font-medium text-muted-foreground mb-2 mt-3 scroll-mt-24">
      {children}
    </p>
  ),
  
  // Paragraphs
  p: ({ children }) => (
    <p className="text-muted-foreground leading-relaxed mb-4">{children}</p>
  ),
  
  // Lists
  ul: ({ children }) => (
    <ul className="list-disc space-y-1 mb-4 text-muted-foreground ml-4">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal space-y-1 mb-4 text-muted-foreground ml-4">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  
  // Task list checkbox (GFM)
  input: ({ type, checked }) => {
    if (type === 'checkbox') {
      return (
        <input
          type="checkbox"
          checked={checked}
          readOnly
          className="mr-2 rounded border-border"
        />
      );
    }
    return null;
  },
  
  // Code with language detection
  code: ({ className, children }) => {
    const inline = !className;
    return <CodeBlock className={className} inline={inline}>{children}</CodeBlock>;
  },
  pre: ({ children }) => <>{children}</>,
  
  // Links with external detection & video embed
  a: ({ href, children }) => {
    if (!href) return <>{children}</>;
    
    const isExternal = href.startsWith('http');
    const isAnchor = href.startsWith('#');
    
    // Video link detection - render as embed
    const videoEmbed = getVideoEmbed(href, String(children));
    if (videoEmbed) return videoEmbed;
    
    return (
      <a
        href={href}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className={`text-primary hover:underline ${isAnchor ? 'scroll-smooth' : ''}`}
      >
        {children}
        {isExternal && <span className="ml-1 text-xs align-super">↗</span>}
      </a>
    );
  },
  
  // Images with lazy loading - no figure wrapper to avoid DOM nesting issues
  img: ({ src, alt, title }) => (
    <span className="block my-4">
      <img
        src={src}
        alt={alt || ''}
        title={title}
        className="rounded-lg max-w-full h-auto"
        loading="lazy"
        decoding="async"
      />
      {(title || alt) && (
        <span className="block text-center text-sm text-muted-foreground mt-2 italic">
          {title || alt}
        </span>
      )}
    </span>
  ),
  
  // Blockquote with alert support
  blockquote: Blockquote,
  
  // Horizontal rule
  hr: () => <hr className="my-6 border-border" />,
  
  // Text formatting
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  del: ({ children }) => <del className="line-through text-muted-foreground">{children}</del>,
  
  // Tables with responsive wrapper
  table: ({ children }) => (
    <div className="overflow-x-auto mb-4 rounded-lg border border-border">
      <table className="min-w-full border-collapse">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
  tbody: ({ children }) => <tbody className="divide-y divide-border">{children}</tbody>,
  tr: ({ children }) => <tr className="hover:bg-muted/50 transition-colors">{children}</tr>,
  th: ({ children, style }) => {
    // Handle table alignment from GFM
    const alignClass = style?.textAlign === 'center' ? 'text-center' 
      : style?.textAlign === 'right' ? 'text-right' 
      : 'text-left';
    return (
      <th className={`px-4 py-3 font-semibold text-foreground text-sm ${alignClass}`}>
        {children}
      </th>
    );
  },
  td: ({ children, style }) => {
    const alignClass = style?.textAlign === 'center' ? 'text-center' 
      : style?.textAlign === 'right' ? 'text-right' 
      : 'text-left';
    return (
      <td className={`px-4 py-3 text-muted-foreground text-sm ${alignClass}`}>
        {children}
      </td>
    );
  },
  
  // Footnotes (GFM)
  sup: ({ children }) => <sup className="text-xs text-primary">{children}</sup>,
  sub: ({ children }) => <sub className="text-xs">{children}</sub>,
  
  // HTML elements support
  kbd: ({ children }) => (
    <kbd className="px-2 py-1 text-xs font-mono bg-muted border border-border rounded shadow-sm">
      {children}
    </kbd>
  ),
  details: ({ children }) => (
    <details className="my-4 border border-border rounded-lg overflow-hidden">
      {children}
    </details>
  ),
  summary: ({ children }) => (
    <summary className="px-4 py-2 bg-muted cursor-pointer hover:bg-muted/80 font-medium">
      {children}
    </summary>
  ),
  mark: ({ children }) => (
    <mark className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
      {children}
    </mark>
  ),
  // Definition list support
  dl: ({ children }) => (
    <dl className="my-4 space-y-2">{children}</dl>
  ),
  dt: ({ children }) => (
    <dt className="font-semibold text-foreground">{children}</dt>
  ),
  dd: ({ children }) => (
    <dd className="ml-4 text-muted-foreground">{children}</dd>
  ),
  // Section/div for admonitions
  section: ({ children, className }) => (
    <section className={className}>{children}</section>
  ),
});

// Preprocess markdown for extended syntax
const preprocessMarkdown = (content: string): string => {
  let processed = content;
  
  // Convert ==highlight== to <mark>highlight</mark>
  processed = processed.replace(/==([^=]+)==/g, '<mark>$1</mark>');
  
  // Convert :::note/warning/tip blocks to styled blockquotes
  processed = processed.replace(
    /:::(note|warning|tip|caution|important)\n([\s\S]*?):::/gi,
    (_, type, content) => {
      const icons: Record<string, string> = {
        note: 'ℹ️',
        tip: '💡',
        warning: '⚠️',
        caution: '🔴',
        important: '❗',
      };
      const icon = icons[type.toLowerCase()] || 'ℹ️';
      return `> ${icon} **${type.toUpperCase()}**\n>\n> ${content.trim().split('\n').join('\n> ')}`;
    }
  );
  
  return processed;
};

export const MarkdownRenderer = memo(function MarkdownRenderer({ 
  content, 
  className = '',
  enableToc = true,
}: MarkdownRendererProps) {
  const components = createComponents(enableToc);
  const remarkPlugins = [remarkGfm, remarkMath, remarkSupersub];
  const rehypePlugins = [rehypeRaw, rehypeKatex];
  const processedContent = preprocessMarkdown(content);

  if (!content) return null;

  return (
    <div className={`prose-custom ${className}`}>
      <ReactMarkdown 
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={components}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
});

export default MarkdownRenderer;

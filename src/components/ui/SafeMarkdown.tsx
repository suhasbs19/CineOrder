import React from 'react';
import { Clock, Calendar, Film, CheckCircle2, AlertTriangle, Sparkles, Tv } from 'lucide-react';

interface SafeMarkdownProps {
  content: string;
  className?: string;
}

interface MetaField {
  label: string;
  value: string;
}

/**
 * Parses inline tokens (**bold**, *italic*, `code`, [link](url)) into React nodes.
 */
function parseInline(text: string): React.ReactNode[] {
  if (!text) return [];

  // Match bold (**text**), italic (*text*), code (`code`), or link ([text](url))
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    if (part.startsWith('**') && part.endsWith('**')) {
      const inner = part.slice(2, -2);
      return (
        <strong key={index} className="font-bold text-white">
          {inner}
        </strong>
      );
    }

    if (part.startsWith('*') && part.endsWith('*')) {
      const inner = part.slice(1, -1);
      return (
        <em key={index} className="italic text-white/80">
          {inner}
        </em>
      );
    }

    if (part.startsWith('`') && part.endsWith('`')) {
      const inner = part.slice(1, -1);
      return (
        <code key={index} className="px-1.5 py-0.5 rounded bg-white/10 text-primary font-mono text-xs">
          {inner}
        </code>
      );
    }

    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={index}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline font-medium inline-flex items-center gap-0.5"
        >
          {linkMatch[1]}
        </a>
      );
    }

    return part;
  });
}

/**
 * Recognizes metadata lines (e.g. `**Release:** May 2, 2008` or `• **Runtime:** 2h 6m`)
 */
function parseMetaLine(line: string): MetaField | null {
  const trimmed = line.replace(/^[•\-\*]\s*/, '').trim();
  const match = trimmed.match(/^\*\*([A-Za-z\s]+):\*\*\s*(.+)$/) || trimmed.match(/^([A-Za-z\s]+):\s*(.+)$/);
  if (!match) return null;

  const label = match[1]?.trim() || '';
  const value = match[2]?.trim() || '';

  const knownLabels = [
    'release',
    'release date',
    'runtime',
    'status',
    'streaming',
    'story readiness',
    'readiness',
    'story impact',
    'impact',
    'story coverage',
    'watch time',
    'prep watch time',
    'verdict',
    'importance',
    'threat level',
    'recommended next',
    'recommended order',
  ];

  if (knownLabels.includes(label.toLowerCase())) {
    return { label, value };
  }

  return null;
}

function getMetaIcon(label: string) {
  const l = label.toLowerCase();
  if (l.includes('release')) return <Calendar className="w-3 h-3 text-primary" />;
  if (l.includes('runtime') || l.includes('time')) return <Clock className="w-3 h-3 text-blue-400" />;
  if (l.includes('streaming')) return <Tv className="w-3 h-3 text-purple-400" />;
  if (l.includes('status')) return <Film className="w-3 h-3 text-emerald-400" />;
  if (l.includes('readiness') || l.includes('coverage')) return <CheckCircle2 className="w-3 h-3 text-green-400" />;
  if (l.includes('impact') || l.includes('threat')) return <AlertTriangle className="w-3 h-3 text-amber-400" />;
  return <Sparkles className="w-3 h-3 text-primary" />;
}

export function SafeMarkdown({ content, className = '' }: SafeMarkdownProps) {
  if (!content) return null;

  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];

  let i = 0;
  while (i < lines.length) {
    const rawLine = lines[i];
    if (rawLine === undefined) {
      i++;
      continue;
    }
    const line = rawLine.trim();

    // Empty line
    if (!line) {
      i++;
      continue;
    }

    // Heading 1 (# ...)
    if (line.startsWith('# ') && !line.startsWith('## ')) {
      renderedElements.push(
        <h1 key={`h1-${i}`} className="text-xl font-black text-white mt-4 mb-2 first:mt-0 tracking-tight">
          {parseInline(line.slice(2).trim())}
        </h1>
      );
      i++;
      continue;
    }

    // Heading 2 (## ...)
    if (line.startsWith('## ')) {
      renderedElements.push(
        <h2 key={`h2-${i}`} className="text-lg font-black text-white mt-3.5 mb-2 first:mt-0 tracking-tight flex items-center gap-1.5">
          {parseInline(line.slice(3).trim())}
        </h2>
      );
      i++;
      continue;
    }

    // Heading 3 (### ...)
    if (line.startsWith('### ')) {
      renderedElements.push(
        <h3 key={`h3-${i}`} className="text-base font-bold text-white/95 mt-3 mb-1.5 first:mt-0 tracking-tight">
          {parseInline(line.slice(4).trim())}
        </h3>
      );
      i++;
      continue;
    }

    // Heading 4 (#### ...)
    if (line.startsWith('#### ')) {
      renderedElements.push(
        <h4 key={`h4-${i}`} className="text-sm font-bold text-white/90 mt-2 mb-1 first:mt-0">
          {parseInline(line.slice(5).trim())}
        </h4>
      );
      i++;
      continue;
    }

    // Check for a cluster of metadata fields (e.g. Release, Runtime, Status, Streaming...)
    const firstMeta = parseMetaLine(line);
    if (firstMeta) {
      const metaCluster: MetaField[] = [firstMeta];
      let j = i + 1;
      while (j < lines.length) {
        const nextRaw = lines[j];
        if (nextRaw === undefined) break;
        const nextLine = nextRaw.trim();
        if (!nextLine) {
          j++;
          continue;
        }
        const nextMeta = parseMetaLine(nextLine);
        if (nextMeta) {
          metaCluster.push(nextMeta);
          j++;
        } else {
          break;
        }
      }

      if (metaCluster.length >= 2) {
        renderedElements.push(
          <div
            key={`meta-grid-${i}`}
            className="grid grid-cols-2 sm:grid-cols-3 gap-2 my-2.5 p-3 rounded-xl bg-white/[0.04] border border-white/10 shadow-inner"
          >
            {metaCluster.map((m, idx) => (
              <div key={idx} className="flex flex-col space-y-0.5">
                <span className="text-muted text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                  {getMetaIcon(m.label)}
                  {m.label}
                </span>
                <span className="font-bold text-white text-xs leading-snug">
                  {parseInline(m.value)}
                </span>
              </div>
            ))}
          </div>
        );
        i = j;
        continue;
      }
    }

    // Ordered list item (e.g., "1. Iron Man")
    const numMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (numMatch) {
      const listItems: { num: string; text: string }[] = [{ num: numMatch[1] ?? '1', text: numMatch[2] ?? '' }];
      let j = i + 1;
      while (j < lines.length) {
        const nextRaw = lines[j];
        if (nextRaw === undefined) break;
        const nextLine = nextRaw.trim();
        const nextNum = nextLine.match(/^(\d+)\.\s+(.+)$/);
        if (nextNum) {
          listItems.push({ num: nextNum[1] ?? '1', text: nextNum[2] ?? '' });
          j++;
        } else {
          break;
        }
      }

      renderedElements.push(
        <ol key={`ol-${i}`} className="space-y-1.5 my-2">
          {listItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-white/90">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 border border-primary/40 text-primary text-[11px] font-bold flex items-center justify-center mt-0.5">
                {item.num}
              </span>
              <div className="flex-1 leading-relaxed">{parseInline(item.text)}</div>
            </li>
          ))}
        </ol>
      );
      i = j;
      continue;
    }

    // Unordered bullet list (e.g., "• Item" or "- Item" or "* Item")
    const bulletMatch = line.match(/^[•\-\*]\s+(.+)$/);
    if (bulletMatch) {
      const bulletItems: string[] = [bulletMatch[1] ?? ''];
      let j = i + 1;
      while (j < lines.length) {
        const nextRaw = lines[j];
        if (nextRaw === undefined) break;
        const nextLine = nextRaw.trim();
        const nextBullet = nextLine.match(/^[•\-\*]\s+(.+)$/);
        if (nextBullet) {
          bulletItems.push(nextBullet[1] ?? '');
          j++;
        } else {
          break;
        }
      }

      renderedElements.push(
        <ul key={`ul-${i}`} className="space-y-1.5 my-2">
          {bulletItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-white/90">
              <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-2 shadow-sm" />
              <div className="flex-1 leading-relaxed">{parseInline(item)}</div>
            </li>
          ))}
        </ul>
      );
      i = j;
      continue;
    }

    // Action arrow marker (e.g. "→ Iron Man 2")
    if (line.startsWith('→ ') || line.startsWith('-> ')) {
      renderedElements.push(
        <div
          key={`action-${i}`}
          className="flex items-center gap-2 p-2.5 rounded-xl bg-primary/10 border border-primary/30 text-white font-medium text-xs sm:text-sm my-2 shadow-sm"
        >
          <span className="text-primary font-bold text-base">→</span>
          <div>{parseInline(line.replace(/^(→|->)\s*/, ''))}</div>
        </div>
      );
      i++;
      continue;
    }

    // Standard paragraph
    renderedElements.push(
      <p key={`p-${i}`} className="text-xs sm:text-sm text-white/90 leading-relaxed my-1.5">
        {parseInline(line)}
      </p>
    );
    i++;
  }

  return <div className={`space-y-1 ${className}`}>{renderedElements}</div>;
}

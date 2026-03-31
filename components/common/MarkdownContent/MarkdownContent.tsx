import React from "react";
import styles from "./MarkdownContent.module.css";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

type ListBlock = {
  type: "ul" | "ol";
  items: string[];
};

type Block =
  | { type: "heading"; level: 1 | 2 | 3; content: string }
  | { type: "paragraph"; content: string }
  | ListBlock;

function parseBlocks(content: string): Block[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let paragraphLines: string[] = [];
  let listBlock: ListBlock | null = null;

  const flushParagraph = () => {
    const text = paragraphLines.join(" ").trim();
    if (text) {
      blocks.push({ type: "paragraph", content: text });
    }
    paragraphLines = [];
  };

  const flushList = () => {
    if (listBlock && listBlock.items.length > 0) {
      blocks.push(listBlock);
    }
    listBlock = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      blocks.push({
        type: "heading",
        level: headingMatch[1].length as 1 | 2 | 3,
        content: headingMatch[2].trim(),
      });
      continue;
    }

    const unorderedMatch = line.match(/^[-*+]\s+(.*)$/);
    if (unorderedMatch) {
      flushParagraph();
      if (!listBlock || listBlock.type !== "ul") {
        flushList();
        listBlock = { type: "ul", items: [] };
      }
      listBlock.items.push(unorderedMatch[1].trim());
      continue;
    }

    const orderedMatch = line.match(/^\d+\.\s+(.*)$/);
    if (orderedMatch) {
      flushParagraph();
      if (!listBlock || listBlock.type !== "ol") {
        flushList();
        listBlock = { type: "ol", items: [] };
      }
      listBlock.items.push(orderedMatch[1].trim());
      continue;
    }

    flushList();
    paragraphLines.push(line);
  }

  flushParagraph();
  flushList();

  return blocks;
}

function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const pattern =
    /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))|(`([^`]+)`)|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[2] && match[3]) {
      nodes.push(
        <a
          key={`link-${match.index}`}
          href={match[3]}
          target="_blank"
          rel="noreferrer"
        >
          {match[2]}
        </a>
      );
    } else if (match[5]) {
      nodes.push(<code key={`code-${match.index}`}>{match[5]}</code>);
    } else if (match[7]) {
      nodes.push(<strong key={`strong-${match.index}`}>{match[7]}</strong>);
    } else if (match[9]) {
      nodes.push(<em key={`em-${match.index}`}>{match[9]}</em>);
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

export default function MarkdownContent({ content, className }: MarkdownContentProps) {
  const blocks = parseBlocks(content);

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")}>
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          if (block.level === 1) {
            return <h1 key={index}>{renderInline(block.content)}</h1>;
          }

          if (block.level === 2) {
            return <h2 key={index}>{renderInline(block.content)}</h2>;
          }

          return <h3 key={index}>{renderInline(block.content)}</h3>;
        }

        if (block.type === "ul") {
          return (
            <ul key={index}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }

        if (block.type === "ol") {
          return (
            <ol key={index}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInline(item)}</li>
              ))}
            </ol>
          );
        }

        return <p key={index}>{renderInline(block.content)}</p>;
      })}
    </div>
  );
}

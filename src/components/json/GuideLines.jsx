import React, { useMemo } from 'react';

const LINE_HEIGHT = 22.1; // 13px * 1.7
const PADDING_TOP = 12;
const CHAR_WIDTH = 7.8; // JetBrains Mono 13px approximate

function findBracketPairs(text) {
  const lines = text.split('\n');
  const stack = [];
  const pairs = [];

  lines.forEach((line, lineIdx) => {
    const indent = line.length - line.trimStart().length;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '{' || ch === '[') {
        stack.push({ openLine: lineIdx, indent });
      } else if ((ch === '}' || ch === ']') && stack.length > 0) {
        const pair = stack.pop();
        if (pair.openLine !== lineIdx) {
          pairs.push({ openLine: pair.openLine, closeLine: lineIdx, indent: pair.indent });
        }
      }
    }
  });

  return pairs;
}

export default function GuideLines({ text }) {
  const pairs = useMemo(() => findBracketPairs(text || ''), [text]);
  if (!pairs.length) return null;

  const totalLines = (text || '').split('\n').length;
  const svgHeight = PADDING_TOP + totalLines * LINE_HEIGHT + 20;

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ width: '100%', height: svgHeight, zIndex: 5 }}
      aria-hidden="true"
    >
      {pairs.map((pair, i) => {
        const x = PADDING_TOP + pair.indent * CHAR_WIDTH + 0.5;
        const y1 = PADDING_TOP + pair.openLine * LINE_HEIGHT + LINE_HEIGHT * 0.85;
        const y2 = PADDING_TOP + pair.closeLine * LINE_HEIGHT + LINE_HEIGHT * 0.15;
        if (y2 <= y1) return null;
        return (
          <line
            key={i}
            x1={x} y1={y1}
            x2={x} y2={y2}
            stroke="rgba(59,130,246,0.2)"
            strokeWidth="1"
            strokeDasharray="2 4"
          />
        );
      })}
    </svg>
  );
}
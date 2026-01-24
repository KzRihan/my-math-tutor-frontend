'use client';

import { useEffect, useRef, memo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// 1. Basic cleanup for common OCR junk
function fixSyntax(latex) {
  return latex
    .replace(/\\nonumber/g, '') // Remove \nonumber (causes crash in arrays)
    .replace(/\\left/g, '')     // Remove \left (fixes unbalanced brackets)
    .replace(/\\right/g, '')    // Remove \right
    .replace(/&/g, '')          // Remove alignment & if we strip array later
    .trim();
}

// 2. Aggressive cleanup: Removes layout that causes "Double Subscript" errors
function stripLayout(latex) {
  let clean = fixSyntax(latex);

  // Remove \underbrace{...}_{...} but keep the content inside the first bracket
  // This is a "greedy" regex substitute to save the math content
  clean = clean.replace(/\\underbrace\s*\{([^{}]+)\}(?:_\{[^{}]+\})?(?:\^[^{}]+)?/g, '$1');

  // Remove array environments but keep content
  clean = clean.replace(/\\begin\{array\}\{[^}]+\}/g, '').replace(/\\end\{array\}/g, '');

  return clean;
}

function renderLatex(latex, container, displayMode) {
  const options = {
    throwOnError: true,
    displayMode: displayMode,
    globalGroup: true,
    trust: true,
    strict: false,
  };

  try {
    // ATTEMPT 1: Render Exact LaTeX
    katex.render(latex, container, options);
  } catch (e1) {
    try {
      // ATTEMPT 2: Fix Syntax (remove \nonumber, \left, \right)
      // This fixes 90% of OCR errors like your previous one
      katex.render(fixSyntax(latex), container, options);
    } catch (e2) {
      try {
        // ATTEMPT 3: Strip Layout (Remove \underbrace, \array)
        // This fixes the "Double Subscript" error by removing the subscript command entirely
        // The math symbols remain visible, just less formatted.
        katex.render(stripLayout(latex), container, options);
      } catch (e3) {
        // ATTEMPT 4: Last Resort - Show Error in Red
        // We use throwOnError: false to let KaTeX display its own error message
        katex.render(latex, container, { ...options, throwOnError: false });
      }
    }
  }
}

const MathRenderer = memo(function MathRenderer({ latex, display = false, className = '' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && latex) {
      // Clear previous content
      containerRef.current.innerHTML = '';
      renderLatex(latex, containerRef.current, display);
    }
  }, [latex, display]);

  // If display mode, wrap in a div with overflow handling
  if (display) {
    return (
      <div
        ref={containerRef}
        className={`katex-display my-4 overflow-x-auto overflow-y-hidden ${className}`}
      />
    );
  }

  return <span ref={containerRef} className={`katex-inline ${className}`} />;
});

// Component to render text with embedded LaTeX expressions
// Supports both inline ($...$) and display ($$...$$) LaTeX
export const MathText = memo(function MathText({ text, className = '' }) {
  if (!text) return null;

  // Regex to match LaTeX: $$...$$ (display) or $...$ (inline)
  // We match display mode first to avoid conflicts with inline mode
  const latexRegex = /\$\$([^$]+)\$\$|\$([^$]+)\$/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = latexRegex.exec(text)) !== null) {
    // Add text before LaTeX
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
    }

    // Check if it's display mode ($$...$$) or inline mode ($...$)
    if (match[1] !== undefined) {
      // Display mode: $$...$$
      parts.push({ type: 'latex', content: match[1], display: true });
    } else if (match[2] !== undefined) {
      // Inline mode: $...$
      parts.push({ type: 'latex', content: match[2], display: false });
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after last LaTeX
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.substring(lastIndex) });
  }

  // If no LaTeX found, return plain text
  if (parts.length === 0 || (parts.length === 1 && parts[0].type === 'text')) {
    return <span className={className}>{text}</span>;
  }

  // Render mixed content
  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.type === 'text') {
          return <span key={index}>{part.content}</span>;
        } else {
          return <MathRenderer key={index} latex={part.content} display={part.display} />;
        }
      })}
    </span>
  );
});

export default MathRenderer;
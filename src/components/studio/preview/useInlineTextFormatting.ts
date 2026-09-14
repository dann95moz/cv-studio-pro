import React, { useRef, useState, useCallback, useEffect } from 'react';
import { htmlToMarkdown } from '../../../utils/textFormatting';

export interface UseInlineTextFormattingProps {
  isEditingEnabled: boolean;
  elementRef: React.RefObject<HTMLElement | null>;
  value: string;
  onSave: (newValue: string) => void;
  onRegisterFormatter?: (formatter: { executeFormat: (cmd: 'bold' | 'italic' | 'highlight') => void }) => void;
}

export function useInlineTextFormatting({
  isEditingEnabled,
  elementRef,
  value,
  onSave,
  onRegisterFormatter,
}: UseInlineTextFormattingProps) {
  const lastRangeRef = useRef<Range | null>(null);
  const [bubblePosition, setBubblePosition] = useState<{ top: number; left: number } | null>(null);
  const [isBoldActive, setIsBoldActive] = useState(false);
  const [isItalicActive, setIsItalicActive] = useState(false);

  const saveCurrentContent = useCallback(() => {
    if (!elementRef.current) return;
    const currentHtml = elementRef.current.innerHTML;
    const cleanMd = htmlToMarkdown(currentHtml);
    if (cleanMd !== value) {
      onSave(cleanMd);
    }
  }, [elementRef, onSave, value]);

  const updateSelectionState = useCallback(() => {
    if (!isEditingEnabled || !elementRef.current) {
      setBubblePosition(null);
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      setBubblePosition(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const container = elementRef.current;

    // Verify selection is within this editable component
    if (!container.contains(range.commonAncestorContainer)) {
      setBubblePosition(null);
      return;
    }

    // Save active range
    lastRangeRef.current = range.cloneRange();

    const selectedText = selection.toString().trim();
    if (!selectedText) {
      setBubblePosition(null);
      return;
    }

    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      setBubblePosition(null);
      return;
    }

    setBubblePosition({
      top: rect.top + window.scrollY,
      left: rect.left + rect.width / 2 + window.scrollX,
    });

    try {
      setIsBoldActive(document.queryCommandState('bold'));
      setIsItalicActive(document.queryCommandState('italic'));
    } catch {
      setIsBoldActive(false);
      setIsItalicActive(false);
    }
  }, [elementRef, isEditingEnabled]);

  /**
   * Direct DOM toggle for bold, italic, and highlight.
   */
  const handleFormatCommand = useCallback(
    (command: 'bold' | 'italic' | 'highlight') => {
      const container = elementRef.current;
      if (!container) return;

      container.focus();
      const selection = window.getSelection();

      // 1. Restore saved range if available
      let range: Range | null = null;
      if (lastRangeRef.current && selection) {
        try {
          selection.removeAllRanges();
          selection.addRange(lastRangeRef.current);
          range = lastRangeRef.current;
        } catch {
          range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
        }
      } else if (selection && selection.rangeCount > 0) {
        range = selection.getRangeAt(0);
      }

      // 2. Expand range if inside a word
      if (range && range.collapsed) {
        const textNode = range.startContainer;
        if (textNode.nodeType === Node.TEXT_NODE && textNode.textContent) {
          const text = textNode.textContent;
          const offset = range.startOffset;
          let start = offset;
          while (start > 0 && /\S/.test(text[start - 1])) {
            start--;
          }
          let end = offset;
          while (end < text.length && /\S/.test(text[end])) {
            end++;
          }
          if (start < end) {
            range.setStart(textNode, start);
            range.setEnd(textNode, end);
            if (selection) {
              selection.removeAllRanges();
              selection.addRange(range);
            }
          }
        }
      }

      // 3. Apply formatting
      if (range && (!range.collapsed || range.toString().length > 0)) {
        if (command === 'bold') {
          let ancestor: Node | null = range.commonAncestorContainer;
          if (ancestor.nodeType === Node.TEXT_NODE) ancestor = ancestor.parentNode;
          const boldNode = (ancestor as HTMLElement)?.closest?.('strong, b');

          if (boldNode && container.contains(boldNode)) {
            const fragment = document.createDocumentFragment();
            while (boldNode.firstChild) {
              fragment.appendChild(boldNode.firstChild);
            }
            boldNode.parentNode?.replaceChild(fragment, boldNode);
          } else {
            const contentNode = range.extractContents();
            const strong = document.createElement('strong');
            strong.appendChild(contentNode);
            range.insertNode(strong);

            if (selection) {
              selection.removeAllRanges();
              const newRange = document.createRange();
              newRange.selectNodeContents(strong);
              selection.addRange(newRange);
              lastRangeRef.current = newRange.cloneRange();
            }
          }
        } else if (command === 'italic') {
          let ancestor: Node | null = range.commonAncestorContainer;
          if (ancestor.nodeType === Node.TEXT_NODE) ancestor = ancestor.parentNode;
          const italicNode = (ancestor as HTMLElement)?.closest?.('em, i');

          if (italicNode && container.contains(italicNode)) {
            const fragment = document.createDocumentFragment();
            while (italicNode.firstChild) {
              fragment.appendChild(italicNode.firstChild);
            }
            italicNode.parentNode?.replaceChild(fragment, italicNode);
          } else {
            const contentNode = range.extractContents();
            const em = document.createElement('em');
            em.appendChild(contentNode);
            range.insertNode(em);

            if (selection) {
              selection.removeAllRanges();
              const newRange = document.createRange();
              newRange.selectNodeContents(em);
              selection.addRange(newRange);
              lastRangeRef.current = newRange.cloneRange();
            }
          }
        } else if (command === 'highlight') {
          let ancestor: Node | null = range.commonAncestorContainer;
          if (ancestor.nodeType === Node.TEXT_NODE) ancestor = ancestor.parentNode;
          const markNode = (ancestor as HTMLElement)?.closest?.('.cv-highlight-keyword, mark');

          if (markNode && container.contains(markNode)) {
            const fragment = document.createDocumentFragment();
            while (markNode.firstChild) {
              fragment.appendChild(markNode.firstChild);
            }
            markNode.parentNode?.replaceChild(fragment, markNode);
          } else {
            const contentNode = range.extractContents();
            const mark = document.createElement('strong');
            mark.className = 'cv-highlight-keyword';
            mark.appendChild(contentNode);
            range.insertNode(mark);

            if (selection) {
              selection.removeAllRanges();
              const newRange = document.createRange();
              newRange.selectNodeContents(mark);
              selection.addRange(newRange);
              lastRangeRef.current = newRange.cloneRange();
            }
          }
        }
      } else {
        try {
          document.execCommand(command === 'highlight' ? 'bold' : command, false);
        } catch {
          // Safe fallback
        }
      }

      saveCurrentContent();
      updateSelectionState();
    },
    [elementRef, saveCurrentContent, updateSelectionState]
  );

  // Global mobile selection listener
  useEffect(() => {
    if (!isEditingEnabled) return;

    const handleGlobalSelection = () => {
      if (!elementRef.current) return;
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      if (elementRef.current.contains(range.commonAncestorContainer)) {
        lastRangeRef.current = range.cloneRange();
        onRegisterFormatter?.({ executeFormat: handleFormatCommand });
        updateSelectionState();
      }
    };

    document.addEventListener('selectionchange', handleGlobalSelection);
    return () => {
      document.removeEventListener('selectionchange', handleGlobalSelection);
    };
  }, [elementRef, isEditingEnabled, handleFormatCommand, onRegisterFormatter, updateSelectionState]);

  return {
    bubblePosition,
    setBubblePosition,
    isBoldActive,
    isItalicActive,
    handleFormatCommand,
    updateSelectionState,
    saveCurrentContent,
  };
}

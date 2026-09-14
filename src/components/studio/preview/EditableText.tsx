import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useCvLiveEdit } from './CvLiveEditContext';
import { markdownToHtml, htmlToMarkdown } from '../../../utils/textFormatting';
import { CvSelectionBubble } from './CvSelectionBubble';
import { AiRegeneratePopover } from './AiRegeneratePopover';
import { AiHoverActionsPill } from './AiHoverActionsPill';
import { BulletAuditPopover } from './BulletAuditPopover';
import { auditSingleBullet } from '../../../core/audit/bulletAuditor';
import { useInlineTextFormatting } from './useInlineTextFormatting';


export interface AiRegenerateConfig {
  type: 'bullet' | 'summary';
  fieldKey: string;
  sectionType?: 'experience' | 'projects';
  itemIndex?: number;
  bulletIndex?: number;
  company?: string;
  role?: string;
}

export interface EditableTextProps {
  value: string;
  onSave: (newValue: string) => void;
  tagName?: 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'li' | 'a';
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  multiline?: boolean;
  htmlContent?: string;
  children?: React.ReactNode;
  aiConfig?: AiRegenerateConfig;
}

/**
 * Clean inline text editor for hot document editing with markdown support.
 * For bullet items and summary: implements a 2-column layout so AI hover actions live in a dedicated
 * right-aligned column that never overlaps, wraps, or clips multi-line text.
 * Completely eliminates nested <li> tags to prevent double bullet points (• •).
 */
export const EditableText: React.FC<EditableTextProps> = ({
  value,
  onSave,
  tagName = 'span',
  className = '',
  style,
  placeholder,
  multiline = false,
  htmlContent,
  children,
  aiConfig,
}) => {
  const { t } = useTranslation(['preview', 'common']);
  const liveEdit = useCvLiveEdit();
  const isEditingEnabled = Boolean(liveEdit?.isLiveEditing);
  const elementRef = useRef<HTMLElement>(null);
  const isFocusedRef = useRef(false);
  const lastRangeRef = useRef<Range | null>(null);

  const [aiPopoverAnchor, setAiPopoverAnchor] = useState<HTMLElement | null>(null);
  const [auditPopoverAnchor, setAuditPopoverAnchor] = useState<HTMLElement | null>(null);

  const {
    bubblePosition,
    setBubblePosition,
    isBoldActive,
    isItalicActive,
    handleFormatCommand,
    updateSelectionState,
  } = useInlineTextFormatting({
    isEditingEnabled,
    elementRef,
    value,
    onSave,
    onRegisterFormatter: (formatter) => {
      if (liveEdit) {
        liveEdit.setActiveFormatter(formatter);
      }
    },
  });

  const bulletAuditIssue = React.useMemo(() => {
    if (tagName !== 'li') return null;
    return auditSingleBullet(value || '');
  }, [tagName, value]);

  const [isRecentlyRegenerated, setIsRecentlyRegenerated] = useState(false);
  const regenTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (regenTimeoutRef.current) {
        clearTimeout(regenTimeoutRef.current);
      }
    };
  }, []);

  const undoValue = aiConfig ? liveEdit?.undoMap[aiConfig.fieldKey] : undefined;

  // Initialize and synchronize innerHTML when external value changes and element is NOT focused
  useEffect(() => {
    if (elementRef.current && !isFocusedRef.current) {
      const formatted = htmlContent || markdownToHtml(value || '');
      if (elementRef.current.innerHTML !== formatted) {
        elementRef.current.innerHTML = formatted;
      }
    }
  }, [value, htmlContent]);

  const handleFocus = () => {
    isFocusedRef.current = true;
    if (liveEdit) {
      liveEdit.setActiveFormatter({ executeFormat: handleFormatCommand });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    isFocusedRef.current = false;
    setTimeout(() => {
      if (!isFocusedRef.current) {
        setBubblePosition(null);
      }
    }, 250);

    const currentHtml = e.currentTarget.innerHTML;
    const cleanMd = htmlToMarkdown(currentHtml);
    if (cleanMd !== value) {
      onSave(cleanMd);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    // Keyboard shortcut: Ctrl+B or Cmd+B for bold
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      handleFormatCommand('bold');
      return;
    }

    // Keyboard shortcut: Ctrl+I or Cmd+I for italic
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      handleFormatCommand('italic');
      return;
    }

    // Keyboard shortcut: Ctrl+Z or Cmd+Z for undo if available
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && aiConfig && undoValue !== undefined) {
      e.preventDefault();
      handleUndo();
      return;
    }

    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      if (elementRef.current) {
        elementRef.current.innerHTML = markdownToHtml(value || '');
        elementRef.current.blur();
      }
    }
  };

  const handleKeyUp = () => {
    updateSelectionState();
  };

  const handleMouseUp = () => {
    updateSelectionState();
  };

  const handleOpenAiPopover = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setAiPopoverAnchor(e.currentTarget);
  };

  const handleCloseAiPopover = () => {
    setAiPopoverAnchor(null);
  };

  const handleRegenerateWithAi = async (guidance: string) => {
    if (!aiConfig || !liveEdit) return;

    let newText = '';
    if (aiConfig.type === 'bullet') {
      newText = await liveEdit.regenerateExperienceBullet({
        fieldKey: aiConfig.fieldKey,
        sectionType: aiConfig.sectionType || 'experience',
        itemIndex: aiConfig.itemIndex ?? 0,
        bulletIndex: aiConfig.bulletIndex ?? 0,
        company: aiConfig.company || '',
        role: aiConfig.role,
        currentBullet: value,
        userGuidance: guidance,
      });
      if (newText && elementRef.current) {
        elementRef.current.innerHTML = markdownToHtml(newText);
      }
    } else if (aiConfig.type === 'summary') {
      newText = await liveEdit.regenerateSummaryBlock({
        fieldKey: aiConfig.fieldKey,
        currentSummary: value,
        userGuidance: guidance,
      });
      if (newText && elementRef.current) {
        elementRef.current.innerHTML = markdownToHtml(newText);
      }
    }

    if (newText) {
      setIsRecentlyRegenerated(true);
      if (regenTimeoutRef.current) {
        clearTimeout(regenTimeoutRef.current);
      }
      regenTimeoutRef.current = setTimeout(() => {
        setIsRecentlyRegenerated(false);
      }, 3000);
    }
  };

  const handleAccept = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (regenTimeoutRef.current) {
      clearTimeout(regenTimeoutRef.current);
      regenTimeoutRef.current = null;
    }
    setIsRecentlyRegenerated(false);
    if (aiConfig && liveEdit) {
      liveEdit.clearUndo(aiConfig.fieldKey);
    }
  };

  const handleUndo = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (regenTimeoutRef.current) {
      clearTimeout(regenTimeoutRef.current);
      regenTimeoutRef.current = null;
    }
    setIsRecentlyRegenerated(false);
    if (!aiConfig || !liveEdit) return;
    liveEdit.undoItem(aiConfig.fieldKey, (previousValue) => {
      onSave(previousValue);
      if (elementRef.current) {
        elementRef.current.innerHTML = markdownToHtml(previousValue);
      }
    });
  };

  const Tag = tagName as React.ElementType;

  // View / Print Mode (0 overhead, single DOM element)
  if (!isEditingEnabled) {
    const content = htmlContent || markdownToHtml(value || '');
    if (content) {
      return (
        <Tag
          className={className}
          style={style}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }
    return (
      <Tag className={className} style={style}>
        {children || value}
      </Tag>
    );
  }

  const hasAiAction = Boolean(aiConfig);

  // 1. Bullet point item (<li>) with 100% natural text width and floating absolute action pill
  if (tagName === 'li') {
    return (
      <li
        className={`cv-editable-wrapper cv-bullet-item ${className}`}
        style={{
          position: 'relative',
          ...style,
        }}
      >
        {/* Full-width natural editable text: no horizontal columns or reserved margins */}
        <span
          ref={elementRef}
          contentEditable
          suppressContentEditableWarning
          className="cv-editable-field"
          data-placeholder={placeholder}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onMouseUp={handleMouseUp}
          title={t('preview:toolbar.clickToEdit', 'Click to edit • Select text to format bold/italic (Ctrl+B)')}
          style={{
            display: 'inline',
            width: '100%',
          }}
        />

        {/* Floating Absolute Action Pill: Floats over the item without altering layout */}
        {hasAiAction && (
          <AiHoverActionsPill
            hasUndo={undoValue !== undefined}
            isRecentlyRegenerated={isRecentlyRegenerated}
            onAccept={handleAccept}
            onUndo={handleUndo}
            onOpenAiPopover={handleOpenAiPopover}
            auditIssue={bulletAuditIssue}
            onOpenAuditPopover={(e) => setAuditPopoverAnchor(e.currentTarget)}
          />
        )}

        {/* Selection Toolbar for Bold/Formatting */}
        <CvSelectionBubble
          position={bubblePosition}
          onToggleBold={() => handleFormatCommand('bold')}
          onToggleItalic={() => handleFormatCommand('italic')}
          onToggleHighlight={() => handleFormatCommand('highlight')}
          isBoldActive={isBoldActive}
          isItalicActive={isItalicActive}
        />

        {/* AI Regenerate Popover / Bottom Sheet */}
        {hasAiAction && (
          <AiRegeneratePopover
            open={Boolean(aiPopoverAnchor)}
            anchorEl={aiPopoverAnchor}
            onClose={handleCloseAiPopover}
            type={aiConfig?.type}
            onRegenerate={handleRegenerateWithAi}
          />
        )}

        {/* In-line Bullet Quality Audit Popover */}
        <BulletAuditPopover
          open={Boolean(auditPopoverAnchor)}
          anchorEl={auditPopoverAnchor}
          issue={bulletAuditIssue}
          onClose={() => setAuditPopoverAnchor(null)}
          onOptimizeWithAi={() => {
            setAuditPopoverAnchor(null);
            if (elementRef.current) {
              setAiPopoverAnchor(elementRef.current);
            }
          }}
        />
      </li>
    );
  }

  // 2. Summary or Block item with AI action (<div>)
  if (hasAiAction) {
    return (
      <div
        className={`cv-editable-wrapper cv-summary-item ${className}`}
        style={{
          position: 'relative',
          ...style,
        }}
      >
        {/* Full-width natural editable content */}
        <div
          ref={elementRef as React.RefObject<HTMLDivElement>}
          contentEditable
          suppressContentEditableWarning
          className={`cv-editable-field ${className}`}
          data-placeholder={placeholder}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onMouseUp={handleMouseUp}
          title={t('preview:toolbar.clickToEdit', 'Click to edit • Select text to format bold/italic (Ctrl+B)')}
          style={{
            width: '100%',
          }}
        />

        {/* Floating Absolute Action Pill */}
        <AiHoverActionsPill
          hasUndo={undoValue !== undefined}
          isRecentlyRegenerated={isRecentlyRegenerated}
          onAccept={handleAccept}
          onUndo={handleUndo}
          onOpenAiPopover={handleOpenAiPopover}
        />

        {/* Selection Toolbar for Bold/Formatting */}
        <CvSelectionBubble
          position={bubblePosition}
          onToggleBold={() => handleFormatCommand('bold')}
          onToggleItalic={() => handleFormatCommand('italic')}
          onToggleHighlight={() => handleFormatCommand('highlight')}
          isBoldActive={isBoldActive}
          isItalicActive={isItalicActive}
        />

        {/* AI Regenerate Popover / Bottom Sheet */}
        <AiRegeneratePopover
          open={Boolean(aiPopoverAnchor)}
          anchorEl={aiPopoverAnchor}
          onClose={handleCloseAiPopover}
          type={aiConfig?.type}
          onRegenerate={handleRegenerateWithAi}
        />
      </div>
    );
  }

  // 3. Regular Editable Tag without AI action (span, h1, h2, etc.)
  return (
    <>
      <Tag
        ref={elementRef}
        contentEditable
        suppressContentEditableWarning
        className={`cv-editable-field ${className}`}
        style={style}
        data-placeholder={placeholder}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onMouseUp={handleMouseUp}
        title={t('preview:toolbar.clickToEdit', 'Click to edit • Select text to format bold/italic (Ctrl+B)')}
      />

      <CvSelectionBubble
        position={bubblePosition}
        onToggleBold={() => handleFormatCommand('bold')}
        onToggleItalic={() => handleFormatCommand('italic')}
        onToggleHighlight={() => handleFormatCommand('highlight')}
        isBoldActive={isBoldActive}
        isItalicActive={isItalicActive}
      />
    </>
  );
};

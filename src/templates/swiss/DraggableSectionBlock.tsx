import React, { useState } from 'react';

export interface DraggableSectionBlockProps {
  sectionId: string;
  column: 'sidebar' | 'main';
  index: number;
  isLiveEditing: boolean;
  onReorder: (
    sourceId: string,
    targetColumn: 'sidebar' | 'main',
    targetIndex?: number,
    targetSectionId?: string,
    dropPosition?: 'before' | 'after'
  ) => void;
  children: React.ReactNode;
}

export const DraggableSectionBlock: React.FC<DraggableSectionBlockProps> = ({
  sectionId,
  column,
  index,
  isLiveEditing,
  onReorder,
  children,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | null>(null);

  if (!isLiveEditing) {
    return <div style={{ display: 'flex', flexDirection: 'column' }}>{children}</div>;
  }

  return (
    <div
      draggable={isLiveEditing}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setDropPosition(null);
      }}
      onDragStart={(e) => {
        const target = e.target as HTMLElement;
        if (
          target.isContentEditable ||
          target.closest('[contenteditable="true"]') ||
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.closest('button') ||
          target.closest('.no-drag')
        ) {
          e.preventDefault();
          return;
        }
        e.dataTransfer.setData('cv-section-id', sectionId);
        e.dataTransfer.setData('text/plain', sectionId);
        e.dataTransfer.effectAllowed = 'move';
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';
        const rect = e.currentTarget.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        if (e.clientY < midY) {
          setDropPosition('before');
        } else {
          setDropPosition('after');
        }
      }}
      onDragLeave={(e) => {
        e.stopPropagation();
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setDropPosition(null);
        }
      }}
      onDragEnd={() => {
        setIsHovered(false);
        setDropPosition(null);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const finalDropPos = dropPosition || 'after';
        setDropPosition(null);
        setIsHovered(false);
        const sourceId = e.dataTransfer.getData('cv-section-id') || e.dataTransfer.getData('text/plain');
        if (sourceId && sourceId !== sectionId) {
          onReorder(sourceId, column, undefined, sectionId, finalDropPos);
        }
      }}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '6px',
        transition: 'background-color 0.15s ease, outline 0.15s ease',
        backgroundColor: isHovered ? 'rgba(2, 132, 199, 0.02)' : 'transparent',
        outline: isHovered ? '1px dashed rgba(2, 132, 199, 0.25)' : '1px solid transparent',
        outlineOffset: '2px',
        cursor: isHovered ? 'grab' : 'default',
      }}
    >
      {/* Drop insertion line indicator (before) */}
      {dropPosition === 'before' && (
        <div
          className="no-print cv-dnd-drop-indicator"
          aria-hidden="true"
          data-no-ats="true"
          style={{
            position: 'absolute',
            top: -4,
            left: 0,
            right: 0,
            height: '3px',
            backgroundColor: 'var(--cv-primary, #0284c7)',
            borderRadius: '9999px',
            boxShadow: '0 0 6px rgba(2, 132, 199, 0.45)',
            zIndex: 10,
          }}
        />
      )}

      {/* Notion-style subtle Drag Grip handle that appears on hover */}
      <div
        className="no-print cv-dnd-handle"
        aria-hidden="true"
        data-no-ats="true"
        draggable={true}
        onDragStart={(e) => {
          e.stopPropagation();
          e.dataTransfer.setData('cv-section-id', sectionId);
          e.dataTransfer.setData('text/plain', sectionId);
          e.dataTransfer.effectAllowed = 'move';
        }}
        onDragEnd={() => {
          setIsHovered(false);
          setDropPosition(null);
        }}
        title="Arrastra para reordenar arriba/abajo o mover a la otra columna"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '2px',
          justifyContent: 'center',
          cursor: 'grab',
          opacity: isHovered ? 0.9 : 0,
          pointerEvents: isHovered ? 'auto' : 'none',
          transition: 'opacity 0.15s ease, background-color 0.15s ease',
          padding: '2px 6px',
          borderRadius: '4px',
          backgroundColor: 'rgba(241, 245, 249, 0.95)',
          border: '1px dashed #cbd5e1',
          color: '#64748b',
          fontSize: '9.5px',
          fontWeight: 600,
          userSelect: 'none',
          zIndex: 5,
        }}
      >
        <span aria-hidden="true" style={{ fontSize: '11px', letterSpacing: '-1px' }}>⋮⋮</span>
        <span aria-hidden="true" style={{ fontSize: '9px', fontWeight: 600 }}>Mover</span>
      </div>

      {children}

      {/* Drop insertion line indicator (after) */}
      {dropPosition === 'after' && (
        <div
          className="no-print cv-dnd-drop-indicator"
          aria-hidden="true"
          data-no-ats="true"
          style={{
            position: 'absolute',
            bottom: -4,
            left: 0,
            right: 0,
            height: '3px',
            backgroundColor: 'var(--cv-primary, #0284c7)',
            borderRadius: '9999px',
            boxShadow: '0 0 6px rgba(2, 132, 199, 0.45)',
            zIndex: 10,
          }}
        />
      )}
    </div>
  );
};

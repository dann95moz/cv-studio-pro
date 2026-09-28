import React, { useState } from 'react';

export interface DraggableSectionBlockProps {
  sectionId: string;
  column: 'sidebar' | 'main';
  index: number;
  isLiveEditing: boolean;
  onReorder: (sourceId: string, targetColumn: 'sidebar' | 'main', targetIndex?: number) => void;
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setDropPosition(null);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
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
        setDropPosition(null);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setDropPosition(null);
        const sourceId = e.dataTransfer.getData('cv-section-id') || e.dataTransfer.getData('text/plain');
        if (sourceId && sourceId !== sectionId) {
          const targetIndex = dropPosition === 'after' ? index + 1 : index;
          onReorder(sourceId, column, targetIndex);
        }
      }}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '6px',
        transition: 'background-color 0.15s ease',
        backgroundColor: isHovered ? 'rgba(2, 132, 199, 0.02)' : 'transparent',
      }}
    >
      {/* Drop insertion line indicator (before) */}
      {dropPosition === 'before' && (
        <div
          className="no-print"
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
        className="no-print"
        draggable={true}
        onDragStart={(e) => {
          e.dataTransfer.setData('cv-section-id', sectionId);
          e.dataTransfer.setData('text/plain', sectionId);
          e.dataTransfer.effectAllowed = 'move';
        }}
        title="Arrastra para reordenar arriba/abajo o mover a la otra columna"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'grab',
          opacity: isHovered ? 0.75 : 0,
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
        <span style={{ fontSize: '11px', letterSpacing: '-1px' }}>⋮⋮</span>
      </div>

      {children}

      {/* Drop insertion line indicator (after) */}
      {dropPosition === 'after' && (
        <div
          className="no-print"
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

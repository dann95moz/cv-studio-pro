import React, { useState } from 'react';
import { safeMarkdownInline } from '../../utils/sanitize';
import { EditableText } from '../../components/studio/preview/EditableText';

export interface BulletItemRowProps {
  bullet: string;
  isDisabled: boolean;
  isLiveEditing: boolean;
  onToggle: () => void;
  onSave?: (newVal: string) => void;
  aiConfig?: {
    type: 'bullet';
    fieldKey: string;
    sectionType: 'experience' | 'projects';
    itemIndex: number;
    bulletIndex: number;
    company?: string;
    role?: string;
  };
}

export const BulletItemRow: React.FC<BulletItemRowProps> = ({
  bullet,
  isDisabled,
  isLiveEditing,
  onToggle,
  onSave,
  aiConfig,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  if (isDisabled && !isLiveEditing) {
    return null;
  }

  return (
    <li
      className={isDisabled ? 'no-print' : ''}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        fontSize: '11px',
        color: '#334155',
        lineHeight: 1.45,
        opacity: isDisabled ? 0.42 : 1,
        textDecoration: isDisabled ? 'line-through' : 'none',
        transition: 'opacity 0.2s ease',
        listStyleType: 'disc',
      }}
    >
      <span style={{ display: 'inline' }}>
        {onSave ? (
          <EditableText
            tagName="span"
            value={bullet}
            onSave={onSave}
            htmlContent={safeMarkdownInline(bullet)}
            aiConfig={aiConfig}
            style={{ display: 'inline' }}
          />
        ) : (
          <span dangerouslySetInnerHTML={{ __html: safeMarkdownInline(bullet) }} />
        )}

        {isLiveEditing && (
          <span
            className="no-print cv-bullet-action"
            aria-hidden="true"
            data-no-ats="true"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            title={isDisabled ? 'Activar viñeta en el documento' : 'Ocultar viñeta para ahorrar espacio vertical en 1 página'}
            style={{
              display: isHovered || isDisabled ? 'inline-flex' : 'none',
              alignItems: 'center',
              gap: '3px',
              marginLeft: '6px',
              fontSize: '8.5px',
              fontWeight: 600,
              padding: '1px 5px',
              borderRadius: '4px',
              cursor: 'pointer',
              userSelect: 'none',
              verticalAlign: 'baseline',
              backgroundColor: isDisabled ? '#fef2f2' : 'rgba(241, 245, 249, 0.8)',
              color: isDisabled ? '#dc2626' : '#64748b',
              border: `1px dashed ${isDisabled ? '#f87171' : '#cbd5e1'}`,
              transition: 'all 0.15s ease',
            }}
          >
            {isDisabled ? (
              <>
                <span>✕ Oculta</span>
                <span style={{ fontWeight: 700, color: '#dc2626' }}>• Clic para activar</span>
              </>
            ) : (
              <>
                <span>👁️ Ocultar</span>
              </>
            )}
          </span>
        )}
      </span>
    </li>
  );
};

import React from 'react';
import { EditableText } from '../../components/studio/preview/EditableText';
import { useCvLiveEdit } from '../../components/studio/preview/CvLiveEditContext';

export interface SwissHeaderBlockProps {
  name: string;
  title?: string;
  liveEdit: ReturnType<typeof useCvLiveEdit>;
}

export const SwissHeaderBlock: React.FC<SwissHeaderBlockProps> = ({
  name,
  title,
  liveEdit,
}) => {
  return (
    <header style={{ borderBottom: '2.5px solid var(--cv-primary, #0284c7)', paddingBottom: '10px' }}>
      <EditableText
        tagName="h1"
        value={name}
        onSave={(val) => liveEdit?.updateName(val)}
        style={{
          fontSize: '25px',
          fontWeight: 800,
          color: '#0f172a',
          margin: '0 0 2px 0',
          lineHeight: 1.15,
          letterSpacing: '-0.5px',
        }}
      />
      {title && (
        <EditableText
          tagName="div"
          value={title}
          onSave={(val) => liveEdit?.updateTitle(val)}
          style={{
            fontSize: '13.5px',
            fontWeight: 700,
            color: 'var(--cv-primary, #0284c7)',
            letterSpacing: '0.2px',
          }}
        />
      )}
    </header>
  );
};

import React, { useState } from 'react';
import { CVTemplateProps } from './types';
import { useCvLiveEdit } from '../components/studio/preview/CvLiveEditContext';
import { SupportedLanguage } from '../constants/languages';
import { ProfilePhotoDisplay } from '../components/studio/photo/ProfilePhotoDisplay';
import { extractCandidateInitials } from '../core/parser';
import {
  SWISS_LABELS,
  resolveSwissSectionOrder,
  DraggableSectionBlock,
  SwissContactBlock,
  SwissHeaderBlock,
  SwissLegalStatusBlock,
  renderSwissSection,
} from './swiss';

export const SwissModernTemplate: React.FC<CVTemplateProps> = ({ slots, theme, photo, data }) => {
  const liveEdit = useCvLiveEdit();
  const { header, genericSections } = slots;
  const lang: SupportedLanguage = slots.language || 'fr';
  const labels = SWISS_LABELS[lang] || SWISS_LABELS.fr;

  const activePhoto = photo || slots.header.photo;
  const initials = extractCandidateInitials(header.name);

  const { activeSidebarIds, activeMainIds } = resolveSwissSectionOrder(genericSections, data);

  const [isDragOverAside, setIsDragOverAside] = useState(false);
  const [isDragOverMain, setIsDragOverMain] = useState(false);

  return (
    <div
      className={`theme-${theme} template-swiss-modern`}
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        color: '#1e293b',
        fontSize: '12px',
        lineHeight: 1.5,
        display: 'flex',
        minHeight: '100%',
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
      }}
    >
      {/* 1. LEFT SIDEBAR: Photo, Contact, Swiss Legal Status, and modular dynamic sections */}
      <aside
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOverAside(true);
        }}
        onDragLeave={() => setIsDragOverAside(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOverAside(false);
          const sectionId = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('cv-section-id');
          if (sectionId) {
            liveEdit?.reorderSection(sectionId, 'sidebar');
          }
        }}
        style={{
          width: 'var(--cv-sidebar-width, 34%)',
          backgroundColor: isDragOverAside ? 'rgba(2, 132, 199, 0.05)' : '#f8fafc',
          outline: isDragOverAside ? '2px dashed var(--cv-primary, #0284c7)' : 'none',
          outlineOffset: '-4px',
          borderRight: '1px solid #e2e8f0',
          padding: '24px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxSizing: 'border-box',
          flexShrink: 0,
          transition: 'background-color 0.2s ease, outline 0.2s ease',
        }}
      >
        {/* Profile Photo / Interactive Avatar Uploader */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
          <ProfilePhotoDisplay
            photo={activePhoto}
            maskShape="circle"
            size={activePhoto?.size || 96}
            border="2.5px solid var(--cv-primary, #0284c7)"
            boxShadow="0 3px 10px rgba(0, 0, 0, 0.08)"
            fallbackInitials={initials}
            fallbackIcon="monogram"
            fallbackBgColor="var(--cv-primary-light, #e0f2fe)"
            fallbackTextColor="var(--cv-primary, #0284c7)"
            activeTheme={theme}
            editable={true}
            hideOnPrintIfEmpty={true}
          />
        </div>

        {/* Contact Block */}
        <SwissContactBlock
          contacts={header.contacts}
          labels={labels}
          liveEdit={liveEdit}
        />

        {/* Swiss Status & Personal Details */}
        <SwissLegalStatusBlock
          header={header}
          labels={labels}
          liveEdit={liveEdit}
        />

        {/* Dynamic Reorderable Sections in Sidebar */}
        {activeSidebarIds.map((id, sIdx) => {
          const content = renderSwissSection({
            id,
            inSidebar: true,
            slots,
            labels,
            liveEdit,
          });
          if (!content) return null;
          return (
            <DraggableSectionBlock
              key={id}
              sectionId={id}
              column="sidebar"
              index={sIdx}
              isLiveEditing={Boolean(liveEdit?.isLiveEditing)}
              onReorder={(src, col, idx) => liveEdit?.reorderSection(src, col, idx)}
            >
              {content}
            </DraggableSectionBlock>
          );
        })}
      </aside>

      {/* 2. MAIN BODY: Name, Title, and modular dynamic sections */}
      <main
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOverMain(true);
        }}
        onDragLeave={() => setIsDragOverMain(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOverMain(false);
          const sectionId = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('cv-section-id');
          if (sectionId) {
            liveEdit?.reorderSection(sectionId, 'main');
          }
        }}
        style={{
          flex: 1,
          minWidth: 0,
          backgroundColor: isDragOverMain ? 'rgba(2, 132, 199, 0.03)' : '#ffffff',
          outline: isDragOverMain ? '2px dashed var(--cv-primary, #0284c7)' : 'none',
          outlineOffset: '-4px',
          padding: '24px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          boxSizing: 'border-box',
          transition: 'background-color 0.2s ease, outline 0.2s ease',
        }}
      >
        {/* Header Name & Title */}
        <SwissHeaderBlock
          name={header.name}
          title={header.title}
          liveEdit={liveEdit}
        />

        {/* Dynamic Reorderable Sections in Main */}
        {activeMainIds.map((id, mIdx) => {
          const content = renderSwissSection({
            id,
            inSidebar: false,
            slots,
            labels,
            liveEdit,
          });
          if (!content) return null;
          return (
            <DraggableSectionBlock
              key={id}
              sectionId={id}
              column="main"
              index={mIdx}
              isLiveEditing={Boolean(liveEdit?.isLiveEditing)}
              onReorder={(src, col, idx) => liveEdit?.reorderSection(src, col, idx)}
            >
              {content}
            </DraggableSectionBlock>
          );
        })}
      </main>
    </div>
  );
};

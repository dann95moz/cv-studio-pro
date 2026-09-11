import React from 'react';
import { SkillsSlotProps } from '../../templates/types';
import { EditableText } from '../studio/preview/EditableText';
import { useCvLiveEdit } from '../studio/preview/CvLiveEditContext';

export type { SkillsSlotProps };

export const SkillsSlot: React.FC<SkillsSlotProps> = ({ 
  data, 
  className = '',
  variant = 'pills'
}) => {
  const liveEdit = useCvLiveEdit();

  return (
    <section className={`cv-section section-skills section-block ${className} variant-${variant}`}>
      <EditableText
        tagName="h2"
        className="cv-section-title"
        value={data.title}
        onSave={(newTitle) => liveEdit?.updateSectionTitle('skills', newTitle)}
        placeholder="Skills & Competencies"
      />
      <ul className="skills-container skills-list">
        {data.skillGroups.map((group, idx) => (
          <li key={idx} className="skills-group cv-bullet-item">
            <EditableText
              tagName="span"
              className="skills-category"
              value={group.category.replace(/[:*_\s]+$/, '').replace(/^[:*_\s]+/, '')}
              onSave={(newCat) => liveEdit?.updateSkillCategory(idx, newCat.replace(/[:*_\s]+$/, '').replace(/^[:*_\s]+/, ''))}
              placeholder="Category"
            />
            <span className="skills-colon">: </span>
            {liveEdit?.isLiveEditing ? (
              <EditableText
                tagName="span"
                className="skills-items-editable"
                value={group.skills.map((s) => s.replace(/^[:*_\s]+/, '').replace(/[:*_\s]+$/, '')).join(', ')}
                onSave={(newSkillsText) => {
                  const parsed = newSkillsText
                    .split(',')
                    .map((s) => s.replace(/^[:*_\s]+/, '').replace(/[:*_\s]+$/, '').trim())
                    .filter(Boolean);
                  liveEdit.updateSkillList(idx, parsed);
                }}
                placeholder="Skill1, Skill2, Skill3..."
              />
            ) : (
              <span className="skills-items">
                {group.skills.map((skill, sIdx) => {
                  const isDiffAdded = skill.startsWith('cv-diff-added-skill:');
                  const isDiffRemoved = skill.startsWith('cv-diff-removed-skill:');
                  const rawSkill = isDiffAdded ? skill.replace('cv-diff-added-skill:', '') : isDiffRemoved ? skill.replace('cv-diff-removed-skill:', '') : skill;
                  const cleanSkill = rawSkill.replace(/^[:*_\s]+/, '').replace(/[:*_\s]+$/, '');
                  const diffClass = isDiffAdded ? 'cv-diff-added-skill' : isDiffRemoved ? 'cv-diff-removed-skill' : '';
                  return (
                    <React.Fragment key={sIdx}>
                      <span className={`skill-pill ${diffClass}`.trim()}>
                        {cleanSkill}
                      </span>
                      {variant === 'inline' && sIdx < group.skills.length - 1 && (
                        <span className="skill-separator">, </span>
                      )}
                    </React.Fragment>
                  );
                })}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

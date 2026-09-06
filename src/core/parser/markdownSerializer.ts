import { CVData } from '../../types/cv';
import { LANGUAGE_DEFINITIONS, SupportedLanguage } from '../../constants/languages';

/**
 * Serializes a structured CVData object back into standardized Markdown.
 * Principle: Single Responsibility (S) - focuses exclusively on converting CV model to Markdown text.
 */
export function serializeCvDataToMarkdown(data: CVData, language?: SupportedLanguage): string {
  const hasContent = Boolean(
    (data.name && data.name.trim()) ||
    (data.title && data.title.trim()) ||
    (data.contacts && data.contacts.length > 0) ||
    (data.summary && data.summary.trim()) ||
    (data.skillGroups && data.skillGroups.length > 0) ||
    (data.experience && data.experience.length > 0) ||
    (data.education && data.education.length > 0) ||
    (data.languages && data.languages.length > 0) ||
    (data.projects && data.projects.length > 0) ||
    (data.customSections && data.customSections.length > 0) ||
    (data.sections && data.sections.length > 0)
  );

  if (!hasContent) {
    return '';
  }

  const parts: string[] = [];
  const lang: SupportedLanguage = language || data.language || 'es';
  const langDef = LANGUAGE_DEFINITIONS[lang] || LANGUAGE_DEFINITIONS.es;

  // Name
  parts.push(`# ${data.name || ''}`);

  // Title
  if (data.title) {
    parts.push(`**${data.title}**  `);
  }

  // Contacts
  if (data.contacts && data.contacts.length > 0) {
    const contactStrings = data.contacts.map(c => {
      if (c.url) {
        const cleanLabel = (c.label || '').replace(/[\[\]]/g, '').trim();
        const cleanUrl = c.url.replace(/[\[\]\(\)]/g, '').trim();
        if (cleanLabel === cleanUrl || cleanLabel.startsWith('http') || cleanLabel.includes('linkedin.com') || cleanLabel.includes('github.com')) {
          return cleanUrl;
        }
        return `[${cleanLabel || cleanUrl}](${cleanUrl})`;
      }
      return (c.label || '').replace(/[\[\]]/g, '').trim();
    });
    parts.push(contactStrings.filter(Boolean).join(' • '));
  }

  // Helper to get formatted section title preserving user's edit or emoji prefix
  const getSectionTitle = (type: string, defaultEmoji = '') => {
    const custom = data.sectionTitles?.[type] || data.sections?.find(s => s.type === type)?.title;
    if (custom && custom.trim()) {
      const isEnglishDefault = /^(?:🎯\s*)?PROFESSIONAL SUMMARY(?:\s*&\s*PITCH)?$/i.test(custom) ||
        /^(?:🛠️\s*)?(?:CORE\s*)?SKILLS(?:\s*&\s*COMPETENCIES)?$/i.test(custom) ||
        /^(?:💼\s*)?(?:CAREER\s*HISTORY|WORK\s*EXPERIENCE|PROFESSIONAL\s*EXPERIENCE)(?:\s*&\s*KEY\s*ACHIEVEMENTS)?$/i.test(custom) ||
        /^(?:🚀\s*)?(?:PROJECTS|FEATURED\s*PROJECTS)(?:\s*&\s*EXTRAS)?$/i.test(custom) ||
        /^(?:🎓\s*)?EDUCATION(?:\s*&\s*CERTIFICATIONS)?$/i.test(custom) ||
        /^(?:🌐\s*)?LANGUAGES?$/i.test(custom);

      if (!isEnglishDefault || langDef.code === 'en') {
        return custom.trim();
      }
    }
    const defTitle = langDef.sections[type as keyof typeof langDef.sections] || type.toUpperCase();
    return defaultEmoji ? `${defaultEmoji} ${defTitle}` : defTitle;
  };

  // Summary
  if (data.summary && data.summary.trim()) {
    parts.push('\n---\n');
    parts.push(`## ${getSectionTitle('summary', '🎯')}`);
    parts.push(data.summary.trim());
  }

  // Skills
  if (data.skillGroups && data.skillGroups.length > 0) {
    parts.push('\n---\n');
    parts.push(`## ${getSectionTitle('skills', '🛠️')}`);
    for (const group of data.skillGroups) {
      const cat = group.category ? group.category.replace(/[:*_\s]+$/, '').replace(/^[*_\s]+/, '').trim() : '';
      const skl = group.skills && group.skills.length > 0
        ? group.skills.map((s) => s.replace(/^[:*_\s]+/, '').replace(/[:*_\s]+$/, '').trim()).filter(Boolean).join(', ')
        : '';
      parts.push(`- **${cat}**: ${skl}`);
    }
  }

  // Experience
  if (data.experience && data.experience.length > 0) {
    parts.push('\n---\n');
    parts.push(`## ${getSectionTitle('experience', '💼')}\n`);
    const expItemsFormatted = data.experience.map(exp => {
      const company = exp.company || '';
      const role = exp.role || '';
      const headerLine = `### **${company}**${exp.location ? ` | ${exp.location}` : ''}`;
      const subHeaderLine = `*${role}*${exp.date ? ` | **${exp.date}**` : ''}`;
      const bullets = (exp.bullets || []).map(b => (b.startsWith('- ') ? b : `- ${b}`)).join('\n');
      return `${headerLine}\n${subHeaderLine}\n${bullets}`;
    });
    parts.push(expItemsFormatted.join('\n\n---\n\n'));
  }

  // Projects & Extras
  if (data.projects && data.projects.length > 0) {
    parts.push('\n---\n');
    parts.push(`## ${getSectionTitle('projects', '🚀')}\n`);
    const projItemsFormatted = data.projects.map(proj => {
      const company = proj.company || '';
      const role = proj.role || '';
      const links: string[] = [];
      if (proj.demoUrl) {
        links.push(`[Live Demo](${proj.demoUrl})`);
      }
      if (proj.repoUrl) {
        links.push(`[GitHub Repository](${proj.repoUrl})`);
      }
      const linkText = links.length > 0 ? links.join(' • ') : (proj.location || '');
      const headerLine = `### **${company}**${linkText ? ` | ${linkText}` : ''}`;
      const subHeaderLine = `*${role}*${proj.date ? ` | **${proj.date}**` : ''}`;
      const bullets = (proj.bullets || [])
        .filter(b => Boolean(b && b.trim()))
        .map(b => (b.startsWith('- ') ? b : `- ${b}`))
        .join('\n');
      return `${headerLine}\n${subHeaderLine}${bullets ? `\n${bullets}` : ''}`;
    });
    parts.push(projItemsFormatted.join('\n\n---\n\n'));
  }

  // Education & Certifications
  const hasEdu = Boolean(data.education && data.education.length > 0);
  const hasCert = Boolean(data.certifications && data.certifications.length > 0);
  if (hasEdu || hasCert) {
    parts.push('\n---\n');
    parts.push(`## ${getSectionTitle('education', '🎓')}`);
    if (data.education) {
      for (const edu of data.education) {
        let cleanEdu = edu.replace(/^(?:[-•]\s*|\*\s+)/, '');
        if (/^\*?[^*]+\*\*/.test(cleanEdu)) {
          cleanEdu = cleanEdu.replace(/^\*?([^*]+)\*\*/, '**$1**');
        }
        parts.push(`- ${cleanEdu}`);
      }
    }
    if (data.certifications) {
      for (const cert of data.certifications) {
        let cleanCert = cert.replace(/^(?:[-•]\s*|\*\s+)/, '');
        if (/^\*?[^*]+\*\*/.test(cleanCert)) {
          cleanCert = cleanCert.replace(/^\*?([^*]+)\*\*/, '**$1**');
        }
        parts.push(`- ${cleanCert}`);
      }
    }
  }

  // Languages
  if (data.languages && data.languages.length > 0) {
    parts.push('\n---\n');
    parts.push(`## ${getSectionTitle('languages', '🌐')}`);
    for (const lang of data.languages) {
      let cleanLang = lang.replace(/^(?:[-•]\s*|\*\s+)/, '');
      if (/^\*?[^*]+\*\*/.test(cleanLang)) {
        cleanLang = cleanLang.replace(/^\*?([^*]+)\*\*/, '**$1**');
      }
      parts.push(`- ${cleanLang}`);
    }
  }


  // Dynamic Custom Sections (Certifications, Awards, Publications, Volunteering, etc.)
  if (data.customSections && data.customSections.length > 0) {
    for (const custom of data.customSections) {
      if (custom.title && custom.items && custom.items.length > 0) {
        parts.push('\n---\n');
        let iconPrefix = '';
        if (custom.presetType === 'certifications') iconPrefix = '🏆 ';
        else if (custom.presetType === 'awards') iconPrefix = '🎖️ ';
        else if (custom.presetType === 'publications') iconPrefix = '📚 ';
        else if (custom.presetType === 'volunteering') iconPrefix = '🤝 ';
        else if (custom.presetType === 'conferences') iconPrefix = '🎤 ';
        else iconPrefix = '📌 ';

        const cleanTitle = custom.title.replace(/^[🏆🎖️📚🤝🎤📌\s]+/, '').trim();
        parts.push(`## ${iconPrefix}${cleanTitle.toUpperCase()}`);
        for (const item of custom.items) {
          let cleanItem = item.replace(/^(?:[-•]\s*|\*\s+)/, '');
          if (cleanItem.trim()) {
            parts.push(`- ${cleanItem}`);
          }
        }
      }
    }
  }

  return parts.join('\n') + '\n';
}


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
      let url = c.url?.trim();
      let label = (c.label || '').replace(/[\[\]]/g, '').trim();

      // Auto-derive url if missing for link types
      if (!url) {
        if (c.type === 'email' && label.includes('@')) {
          url = `mailto:${label.replace(/^mailto:/i, '')}`;
        } else if ((c.type === 'linkedin' || c.type === 'github' || c.type === 'globe') && (label.includes('.') || label.startsWith('http'))) {
          url = label.startsWith('http') ? label : `https://${label}`;
        }
      }

      if (url) {
        let display = label;
        if (c.type === 'linkedin') {
          display = (!display || display.includes('linkedin.com') || display.startsWith('http')) ? 'LinkedIn' : display;
        } else if (c.type === 'github') {
          display = (!display || display.includes('github.com') || display.startsWith('http')) ? 'GitHub' : display;
        } else if (c.type === 'globe') {
          display = (!display || display.startsWith('http')) ? 'Portfolio' : display;
        } else if (c.type === 'email') {
          display = display.replace(/^mailto:/i, '');
        }
        return `[${display}](${url})`;
      }
      return label;
    });
    parts.push(contactStrings.filter(Boolean).join(' • '));
  }


  // Helper to get formatted section title preserving user's edit without emojis
  const getSectionTitle = (type: string) => {
    const defTitle = langDef.sections[type as keyof typeof langDef.sections] || type.toUpperCase();
    const custom = data.sectionTitles?.[type] || data.sections?.find(s => s.type === type)?.title;
    if (custom && custom.trim()) {
      const cleanCustom = custom.replace(/^[\p{Emoji}\p{Extended_Pictographic}\s*#_\-–—|•·:]+/u, '').trim();
      const isEnglishDefault = /^(?:PROFESSIONAL\s*SUMMARY(?:\s*&\s*PITCH)?|SUMMARY(?:\s*&\s*OBJECTIVE)?)$/i.test(cleanCustom) ||
        /^(?:(?:CORE\s*)?SKILLS(?:\s*&\s*COMPETENCIES)?|TECHNICAL\s*SKILLS)$/i.test(cleanCustom) ||
        /^(?:(?:CAREER\s*HISTORY|WORK\s*EXPERIENCE|PROFESSIONAL\s*EXPERIENCE)(?:\s*&\s*KEY\s*ACHIEVEMENTS)?)$/i.test(cleanCustom) ||
        /^(?:(?:FEATURED\s*)?PROJECTS(?:\s*&\s*EXTRAS)?)$/i.test(cleanCustom) ||
        /^(?:EDUCATION(?:\s*&\s*CERTIFICATIONS)?)$/i.test(cleanCustom) ||
        /^(?:LANGUAGES?)$/i.test(cleanCustom);

      if (!isEnglishDefault || langDef.code === 'en') {
        return cleanCustom || defTitle;
      }
    }
    return defTitle;
  };

  // Summary
  if (data.summary && data.summary.trim()) {
    parts.push('\n---\n');
    parts.push(`## ${getSectionTitle('summary')}`);
    parts.push(data.summary.trim());
  }

  // Skills
  if (data.skillGroups && data.skillGroups.length > 0) {
    parts.push('\n---\n');
    parts.push(`## ${getSectionTitle('skills')}`);
    for (const group of data.skillGroups) {
      const cat = group.category ? group.category.replace(/[:*_\s]+$/, '').replace(/^[*_\s]+/, '').replace(/\*\*/g, '').trim() : '';
      const skl = group.skills && group.skills.length > 0
        ? group.skills.map((s) => s.replace(/^[:*_\s]+/, '').replace(/[:*_\s]+$/, '').replace(/\*\*/g, '').trim()).filter(Boolean).join(', ')
        : '';
      parts.push(`- **${cat}**: ${skl}`);
    }
  }

  // Experience
  if (data.experience && data.experience.length > 0) {
    parts.push('\n---\n');
    parts.push(`## ${getSectionTitle('experience')}\n`);
    const expItemsFormatted = data.experience.map(exp => {
      const company = (exp.company || '').replace(/\*\*/g, '').trim();
      const role = (exp.role || '').replace(/[*_]/g, '').trim();
      const date = (exp.date || '').replace(/\*\*/g, '').trim();
      const location = (exp.location || '').replace(/\*\*/g, '').trim();
      const headerLine = `### **${company}**${location ? ` | ${location}` : ''}`;
      const subHeaderLine = `*${role}*${date ? ` | **${date}**` : ''}`;
      const bullets = (exp.bullets || []).map(b => (b.startsWith('- ') ? b : `- ${b}`)).join('\n');
      return `${headerLine}\n${subHeaderLine}\n${bullets}`;
    });
    parts.push(expItemsFormatted.join('\n\n---\n\n'));
  }

  // Projects & Extras
  if (data.projects && data.projects.length > 0) {
    parts.push('\n---\n');
    parts.push(`## ${getSectionTitle('projects')}\n`);
    const projItemsFormatted = data.projects.map(proj => {
      const company = (proj.company || '').replace(/\*\*/g, '').trim();
      const role = (proj.role || '').replace(/[*_]/g, '').trim();
      const date = (proj.date || '').replace(/\*\*/g, '').trim();
      const links: string[] = [];
      if (proj.demoUrl) {
        const dUrl = proj.demoUrl.trim();
        links.push(`[Live Demo](${dUrl.startsWith('http') ? dUrl : `https://${dUrl}`})`);
      }
      if (proj.repoUrl) {
        const rUrl = proj.repoUrl.trim();
        links.push(`[GitHub Repository](${rUrl.startsWith('http') ? rUrl : `https://${rUrl}`})`);
      }
      const linkText = links.length > 0 ? links.join(' • ') : '';
      const cleanLoc = (proj.location || '')
        .replace(/\*\*/g, '')
        .replace(/^[•|·+–—/\s]+|[•|·+–—/\s]+$/g, '')
        .trim();
      const locDisplay = cleanLoc && !cleanLoc.includes('http') && !cleanLoc.includes('Live Demo') && !cleanLoc.includes('GitHub') && cleanLoc !== '+' && cleanLoc !== '-' ? cleanLoc : '';
      const meta = [locDisplay, linkText].filter(Boolean).join(' • ');
      const headerLine = `### **${company}**${meta ? ` | ${meta}` : ''}`;

      const subHeaderLine = `*${role}*${date ? ` | **${date}**` : ''}`;
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
    parts.push(`## ${getSectionTitle('education')}`);
    if (data.education) {
      for (const edu of data.education) {
        let cleanEdu = edu.replace(/^(?:[-•]\s*|\*\s+)/, '').trim();
        parts.push(`- ${cleanEdu}`);
      }
    }
    if (data.certifications) {
      for (const cert of data.certifications) {
        let cleanCert = cert.replace(/^(?:[-•]\s*|\*\s+)/, '').trim();
        parts.push(`- ${cleanCert}`);
      }
    }
  }

  // Languages
  if (data.languages && data.languages.length > 0) {
    parts.push('\n---\n');
    parts.push(`## ${getSectionTitle('languages')}`);
    for (const lang of data.languages) {
      let cleanLang = lang.replace(/^(?:[-•]\s*|\*\s+)/, '').trim();
      parts.push(`- ${cleanLang}`);
    }
  }


  // Dynamic Custom Sections (Certifications, Awards, Publications, Volunteering, etc.)
  if (data.customSections && data.customSections.length > 0) {
    for (const custom of data.customSections) {
      if (custom.title && custom.items && custom.items.length > 0) {
        parts.push('\n---\n');
        const cleanTitle = custom.title.replace(/^[\p{Emoji}\p{Extended_Pictographic}\s*#_\-–—|•·:]+/u, '').trim();
        parts.push(`## ${cleanTitle.toUpperCase()}`);
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


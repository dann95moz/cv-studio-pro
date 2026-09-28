import { ContactItem, ExperienceItem } from '../../types/cv';
import { cleanHumanText } from './metadataExtractor';
import { cleanBulletText } from './cvSanitizers';
import { APP_LINKS } from '../../constants/links';

/**
 * Parses experience or project blocks from Markdown content into strongly-typed ExperienceItem models.
 * Supports flexible pipe headers (### Role | Company | Dates | Location), demo/repo links extraction,
 * and multi-line bullet lists.
 */
export function parseExperienceBlocks(content: string, contacts: ContactItem[] = []): ExperienceItem[] {
  const blocks = content.split(/(?=^###\s+)/m).filter((b) => b.trim().length > 0);
  const items: ExperienceItem[] = [];

  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    let company = '';
    let location = '';
    let role = '';
    let date = '';
    const bullets: string[] = [];

    // Extract demoUrl and repoUrl BEFORE stripping markdown links from header
    const fullHeaderRaw = lines[0] + (lines.length > 1 && !lines[1].startsWith('-') && !lines[1].startsWith('*') && !lines[1].startsWith('•') ? ` ${lines[1]}` : '');
    let demoUrl: string | undefined = undefined;
    let repoUrl: string | undefined = undefined;

    const demoMatch = fullHeaderRaw.match(/\[([^\]]*(?:demo|sitio|website|app|live|ver\s*demo)[^\]]*)\]\((https?:\/\/[^)]+)\)/i) ||
                      fullHeaderRaw.match(/\[(?:Live\s*Demo|Demo)\]\(([^)]+)\)/i);
    if (demoMatch) {
      demoUrl = (demoMatch[2] || demoMatch[1]).trim();
    }

    const repoMatch = fullHeaderRaw.match(/\[([^\]]*(?:github|repo|código|code|source)[^\]]*)\]\((https?:\/\/[^)]+)\)/i) ||
                      fullHeaderRaw.match(/\[(?:GitHub(?:\s*Repository)?|Repo)\]\(([^)]+)\)/i);
    if (repoMatch) {
      repoUrl = (repoMatch[2] || repoMatch[1]).trim();
    }

    if (!repoUrl) {
      const ghMatch = fullHeaderRaw.match(/https?:\/\/github\.com\/[^\s)\]|•]+/i);
      if (ghMatch) repoUrl = ghMatch[0];
    }
    if (!demoUrl) {
      const liveMatch = fullHeaderRaw.match(/https?:\/\/(?!github\.com)[^\s)\]|•]+/i);
      if (liveMatch) demoUrl = liveMatch[0];
    }

    const compOrHeaderLower = fullHeaderRaw.toLowerCase();
    if (compOrHeaderLower.includes('cv studio') || compOrHeaderLower.includes('tailor engine')) {
      if (!demoUrl) demoUrl = APP_LINKS.DEMO_URL;
      if (!repoUrl) repoUrl = APP_LINKS.GITHUB_REPO;
    } else if (!repoUrl && /\b(github|repo|repository)\b/i.test(compOrHeaderLower)) {
      const ghContact = contacts.find((c) => c.type === 'github');
      if (ghContact?.url) {
        const firstLineCompany = lines[0].replace(/^###\s+/, '').split('|')[0].replace(/[*_]/g, '').trim();
        const slug = firstLineCompany.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        if (slug) repoUrl = `${ghContact.url.replace(/\/+$/, '')}/${slug}`;
      }
    }

    // Line 1: Header line (e.g. "### **Company** | Location" or "### Role | Company" or "### Company | Oct 2024 – Present")
    const headerLine = lines[0].replace(/^###\s+/, '').trim();
    const headerParts = headerLine.split('|').map((p) => cleanHumanText(p).replace(/\[([^\]]+)\]/g, '$1').trim());
    const part0 = headerParts[0] || '';
    const part1 = headerParts.length > 1 ? headerParts[1] : '';
    const part2 = headerParts.length > 2 ? headerParts.slice(2).join(' | ') : '';

    const roleKeywords = /\b(developer|engineer|architect|consultant|specialist|designer|manager|lead|director|analyst|programmer|intern|assistant|desarrollador|ingeniero|l[ií]der|gerente|arquitecto|analista|consultor|especialista)\b/i;
    const isDatePattern = (str: string) => /\b(19\d\d|20\d\d|presente|present|actualidad|current)\b/i.test(str);

    if (part1 && roleKeywords.test(part0) && !roleKeywords.test(part1)) {
      role = part0;
      if (isDatePattern(part1)) {
        date = part1;
        company = part2;
      } else {
        company = part1;
        if (part2) {
          if (isDatePattern(part2)) date = part2;
          else location = part2;
        }
      }
    } else {
      company = part0;
      if (isDatePattern(part1)) {
        date = part1;
        location = part2;
      } else {
        location = part1;
        if (part2 && isDatePattern(part2)) {
          date = part2;
        }
      }
    }

    // Line 2: Subheader line (e.g. "*Role* | **Date**" or "Role | Date" or "Date")
    let lineIdx = 1;
    if (lineIdx < lines.length && !lines[lineIdx].startsWith('-') && !lines[lineIdx].startsWith('* ') && !lines[lineIdx].startsWith('• ')) {
      const subLine = lines[lineIdx];
      const isParagraph = subLine.length > 100 && !subLine.includes('|');
      if (!isParagraph) {
        const subParts = subLine.split('|').map((p) => cleanHumanText(p).replace(/\[([^\]]+)\]/g, '$1').trim());
        const sub0 = subParts[0] || '';
        const sub1 = subParts.length > 1 ? subParts.slice(1).join(' | ') : '';

        const isDateOnly = isDatePattern(sub0) && !roleKeywords.test(sub0);

        if (role && !date && isDateOnly) {
          date = sub0;
        } else {
          if (!role) role = sub0;
          if (sub1) date = sub1;
        }
        lineIdx++;
      }
    }

    // Remaining lines: Bullets
    const disabledBullets: number[] = [];
    for (; lineIdx < lines.length; lineIdx++) {
      const line = lines[lineIdx];
      const isDisabled = /^<!--\s*disabled\s*-->/i.test(line);
      const cleanLine = line.replace(/^<!--\s*disabled\s*-->\s*/i, '');
      if (cleanLine.startsWith('- ') || cleanLine.startsWith('* ') || cleanLine.startsWith('• ') || cleanLine.startsWith('+ ')) {
        const bulletText = cleanLine.replace(/^[-*•·+]\s+/, '').trim();
        if (bulletText) {
          if (isDisabled) {
            disabledBullets.push(bullets.length);
          }
          bullets.push(bulletText);
        }
      } else if (line.startsWith('---') || line.startsWith('===')) {
        continue;
      } else {
        if (bullets.length > 0) {
          bullets[bullets.length - 1] += ` ${cleanLine}`;
        } else {
          if (isDisabled) {
            disabledBullets.push(bullets.length);
          }
          bullets.push(cleanLine);
        }
      }
    }

    let cleanLoc = cleanHumanText(location);
    if (
      cleanLoc.includes('Live Demo') ||
      cleanLoc.includes('GitHub Repository') ||
      cleanLoc.startsWith('http') ||
      cleanLoc.includes('github.com') ||
      cleanLoc === 'Demo' ||
      cleanLoc === 'Repo'
    ) {
      cleanLoc = cleanLoc
        .replace(/Live\s*Demo/gi, '')
        .replace(/GitHub(?:\s*Repository)?/gi, '')
        .replace(/https?:\/\/[^\s]+/g, '')
        .replace(/[•|·+–—/]/g, '')
        .trim();
    }
    if (/^[•|·+–—/\s]+$/.test(cleanLoc) || cleanLoc === '+' || cleanLoc === '-') {
      cleanLoc = '';
    }

    if (company || role || bullets.length > 0) {
      items.push({
        company: cleanHumanText(company) || 'Organization',
        role: cleanHumanText(role) || 'Specialist',
        date: cleanHumanText(date),
        location: cleanLoc,
        demoUrl,
        repoUrl,
        bullets: bullets.map(cleanBulletText).filter(Boolean),
        disabledBullets: disabledBullets.length > 0 ? disabledBullets : undefined,
      });
    }
  }

  return items;
}

import { useMemo } from 'react';
import { extractCandidateName, parseMarkdownToCvData } from '../core/parser';

export interface MissingSectionItem {
  id: string;
  labelKey: string;
  defaultLabel: string;
}

export interface ProfileCompletenessResult {
  score: number; // 0 to 100
  level: 'initial' | 'good' | 'complete';
  missingSections: MissingSectionItem[];
  completedCount: number;
  totalCount: number;
}

export const useMasterProfileCompleteness = (masterData: string): ProfileCompletenessResult => {
  return useMemo(() => {
    if (!masterData || masterData.trim().length < 20) {
      return {
        score: 0,
        level: 'initial',
        missingSections: [
          { id: 'personal', labelKey: 'profile:nav.personal', defaultLabel: 'Datos Personales' },
          { id: 'summary', labelKey: 'profile:nav.summary', defaultLabel: 'Extracto / Resumen' },
          { id: 'experience', labelKey: 'profile:nav.experience', defaultLabel: 'Experiencia' },
          { id: 'skills', labelKey: 'profile:nav.skills', defaultLabel: 'Habilidades' },
          { id: 'education', labelKey: 'profile:nav.education', defaultLabel: 'Educación' },
          { id: 'languages', labelKey: 'profile:nav.languages', defaultLabel: 'Idiomas' },
        ],
        completedCount: 0,
        totalCount: 6,
      };
    }

    const parsed = parseMarkdownToCvData(masterData);
    const lower = masterData.toLowerCase();
    const candidateName = extractCandidateName(masterData, '');

    // 1. Personal & Contact (20 pts)
    const hasName = Boolean(
      (parsed.name && parsed.name.trim().length >= 2) ||
      (candidateName && candidateName.length >= 3)
    );
    const hasEmailOrContact = Boolean(
      (parsed.contacts && parsed.contacts.length > 0 && parsed.contacts.some(c => c.type === 'email' || c.type === 'linkedin' || c.type === 'phone' || (c.label && c.label.includes('@')))) ||
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(masterData)
    );
    const personalPassed = hasName && hasEmailOrContact;

    // 2. Summary (15 pts)
    const hasSummary = Boolean(
      (parsed.summary && parsed.summary.trim().length >= 25) ||
      ((lower.includes('summary') ||
        lower.includes('resumen') ||
        lower.includes('extracto') ||
        lower.includes('perfil profesional') ||
        lower.includes('about me')) &&
        masterData.length > 120)
    );

    // 3. Work Experience (30 pts)
    const hasExperience = Boolean(
      (parsed.experience && parsed.experience.length > 0 && parsed.experience.some(e => (e.company || e.role) && (e.bullets?.length || 0) > 0)) ||
      ((lower.includes('experience') ||
        lower.includes('experiencia') ||
        lower.includes('work history') ||
        lower.includes('trayectoria') ||
        lower.includes('empleo') ||
        lower.includes('puesto')) &&
        ((/•|-|\*/.test(masterData) || /\b(19\d\d|20\d\d)\b/.test(masterData)) && masterData.length > 150))
    );

    // 4. Skills (15 pts)
    const hasSkills = Boolean(
      (parsed.skillGroups && parsed.skillGroups.some(g => g.skills && g.skills.length > 0)) ||
      ((lower.includes('skills') ||
        lower.includes('habilidades') ||
        lower.includes('competencias') ||
        lower.includes('tech stack') ||
        lower.includes('kenntnisse') ||
        lower.includes('compétences')) &&
        masterData.length > 100)
    );

    // 5. Education (10 pts)
    const hasEducation = Boolean(
      (parsed.education && parsed.education.length > 0 && parsed.education.some(e => e.trim().length > 3)) ||
      ((lower.includes('education') ||
        lower.includes('educación') ||
        lower.includes('educacion') ||
        lower.includes('formación') ||
        lower.includes('universidad') ||
        lower.includes('university') ||
        lower.includes('degree') ||
        lower.includes('ausbildung')) &&
        (/\b(19\d\d|20\d\d)\b/.test(masterData) || /•|-|\*/.test(masterData)) &&
        masterData.length > 100)
    );

    // 6. Languages / Certifications (10 pts)
    const hasLanguages = Boolean(
      (parsed.languages && parsed.languages.length > 0 && parsed.languages.some(l => l.trim().length > 2)) ||
      ((lower.includes('languages') ||
        lower.includes('idiomas') ||
        lower.includes('sprachen') ||
        lower.includes('langues') ||
        lower.includes('lingue')) &&
        (/native|nativo|bilingual|bilingüe|c1|c2|b1|b2|a1|a2|fluido|fluent|intermedio|avanzado|profesional|professional/i.test(masterData)))
    );

    const checks: Array<{ passed: boolean; item: MissingSectionItem; weight: number }> = [
      {
        passed: personalPassed,
        item: { id: 'personal', labelKey: 'profile:nav.personal', defaultLabel: 'Datos Personales' },
        weight: 20,
      },
      {
        passed: hasSummary,
        item: { id: 'summary', labelKey: 'profile:nav.summary', defaultLabel: 'Extracto / Resumen' },
        weight: 15,
      },
      {
        passed: hasExperience,
        item: { id: 'experience', labelKey: 'profile:nav.experience', defaultLabel: 'Experiencia Laboral' },
        weight: 30,
      },
      {
        passed: hasSkills,
        item: { id: 'skills', labelKey: 'profile:nav.skills', defaultLabel: 'Habilidades Técnicas' },
        weight: 15,
      },
      {
        passed: hasEducation,
        item: { id: 'education', labelKey: 'profile:nav.education', defaultLabel: 'Educación' },
        weight: 10,
      },
      {
        passed: hasLanguages,
        item: { id: 'languages', labelKey: 'profile:nav.languages', defaultLabel: 'Idiomas' },
        weight: 10,
      },
    ];

    let score = 0;
    const missingSections: MissingSectionItem[] = [];
    let completedCount = 0;

    for (const check of checks) {
      if (check.passed) {
        score += check.weight;
        completedCount++;
      } else {
        missingSections.push(check.item);
      }
    }

    let level: 'initial' | 'good' | 'complete' = 'initial';
    if (score >= 85) {
      level = 'complete';
    } else if (score >= 50) {
      level = 'good';
    }

    return {
      score,
      level,
      missingSections,
      completedCount,
      totalCount: checks.length,
    };
  }, [masterData]);
};

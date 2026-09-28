import { SupportedLanguage, LANGUAGE_DEFINITIONS } from '../../constants/languages';

/**
 * Heuristically infers the document language from domain keywords and grammatical markers.
 */
export function inferDocumentLanguage(text: string): SupportedLanguage {
  const lower = text.toLowerCase();
  let esScore = 0;
  let deScore = 0;
  let frScore = 0;
  let itScore = 0;
  let enScore = 0;

  // Domain-specific keyword indicators
  if (/(\bexperiencia\b|\bhabilidades\b|\beducaci[oó]n\b|\bidiomas\b|\bresumen\b|\bdesarrollador\b|\bproyectos\b|\bcertificaciones\b|\blaboral\b)/i.test(lower)) esScore += 4;
  if (/(\bberufserfahrung\b|\bausbildung\b|\bsprachen\b|\bkenntnisse\b|\bkurzprofil\b|\bprojekte\b)/i.test(lower)) deScore += 4;
  if (/(\bexp[ée]rience\b|\bformation\b|\blangues\b|\bcomp[ée]tences\b|\bprofil professionnel\b|\bprojets\b)/i.test(lower)) frScore += 4;
  if (/(\besperienza\b|\bistruzione\b|\blingue\b|\bcompetenze\b|\bprogetti\b)/i.test(lower)) itScore += 4;
  if (/(\bexperience\b|\bskills\b|\beducation\b|\blanguages\b|\bsummary\b|\bprojects\b)/i.test(lower)) enScore += 4;

  // Common syntax and grammatical markers
  if (/\b(de|en|con|para|por|los|las|del|una|un|años|trayectoria)\b/i.test(lower)) esScore += 2;
  if (/\b(und|der|die|das|mit|für|von|im|jahre)\b/i.test(lower)) deScore += 2;
  if (/\b(et|dans|pour|avec|des|les|une|ans)\b/i.test(lower)) frScore += 2;
  if (/\b(e|in|per|con|dei|le|un|anni)\b/i.test(lower)) itScore += 2;
  if (/\b(the|and|with|for|from|years|track\s*record)\b/i.test(lower)) enScore += 2;

  if (esScore > deScore && esScore > frScore && esScore > itScore && esScore >= enScore) return 'es';
  if (deScore > esScore && deScore > frScore && deScore > itScore && deScore >= enScore) return 'de';
  if (frScore > esScore && frScore > deScore && frScore > itScore && frScore >= enScore) return 'fr';
  if (itScore > esScore && itScore > deScore && itScore > frScore && itScore >= enScore) return 'it';
  return 'en';
}

/**
 * Normalizes and localizes standard technical skill category names into the target document language.
 */
export function normalizeSkillCategory(category: string, lang: SupportedLanguage): string {
  const clean = category.replace(/[*_`]/g, '').trim();
  const lower = clean.toLowerCase();
  const unaccented = lower.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const langDef = LANGUAGE_DEFINITIONS[lang] || LANGUAGE_DEFINITIONS.es;

  // 1. Core Competencies / Languages & Fundamentals
  if (
    unaccented.includes('language') ||
    unaccented.includes('lenguaje') ||
    unaccented.includes('programmiersprache') ||
    unaccented.includes('fundamento') ||
    unaccented.includes('core web') ||
    unaccented.includes('core fundamental') ||
    unaccented === 'core skills' ||
    unaccented === 'competencias clave' ||
    unaccented === 'competencias principales' ||
    unaccented === 'kernkompetenzen' ||
    unaccented === 'competences cles' ||
    unaccented === 'competences principales' ||
    unaccented === 'competenze chiave' ||
    unaccented === 'competenze principali' ||
    unaccented === 'core competencies' ||
    unaccented === 'hauptkompetenzen'
  ) {
    return langDef.skillsCategories.languages;
  }

  // 2. Frameworks & Architecture / Specialties
  if (
    unaccented.includes('framework') ||
    unaccented.includes('architecture') ||
    unaccented.includes('arquitectura') ||
    unaccented.includes('ecosystem') ||
    unaccented.includes('ecosistema') ||
    unaccented.includes('okosystem') ||
    unaccented.includes('specialt') ||
    unaccented.includes('specialit') ||
    unaccented.includes('especialidad') ||
    unaccented.includes('schwerpunkt') ||
    unaccented.includes('specializzazion')
  ) {
    return langDef.skillsCategories.frameworks;
  }

  // 3. Tools & Software / Tooling
  if (
    unaccented.includes('tool') ||
    unaccented.includes('herramienta') ||
    unaccented.includes('ci/cd') ||
    unaccented.includes('testing') ||
    unaccented.includes('werkzeug') ||
    unaccented.includes('outil') ||
    unaccented.includes('strument')
  ) {
    return langDef.skillsCategories.tooling;
  }

  if (
    unaccented === 'skills' ||
    unaccented === 'technical skills' ||
    unaccented === 'competencies' ||
    unaccented === 'competences' ||
    unaccented === 'habilidades' ||
    unaccented === 'habilidades tecnicas' ||
    unaccented === 'competencias'
  ) {
    return langDef.sections.skills;
  }

  return clean;
}

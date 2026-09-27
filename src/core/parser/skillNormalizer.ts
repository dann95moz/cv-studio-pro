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
  const langDef = LANGUAGE_DEFINITIONS[lang] || LANGUAGE_DEFINITIONS.es;

  if (
    lower.includes('language') ||
    lower.includes('lenguaje') ||
    lower.includes('programmiersprache') ||
    lower.includes('fundamento') ||
    lower.includes('core web') ||
    lower.includes('core fundamental') ||
    lower === 'core skills' ||
    lower === 'competencias clave' ||
    lower === 'kernkompetenzen' ||
    lower === 'compétences clés' ||
    lower === 'competenze chiave' ||
    lower === 'core competencies'
  ) {
    return langDef.skillsCategories.languages;
  }
  if (
    lower.includes('framework') ||
    lower.includes('architecture') ||
    lower.includes('arquitectura') ||
    lower.includes('ecosystem') ||
    lower.includes('ecosistema') ||
    lower.includes('ökosystem') ||
    lower.includes('écosystème') ||
    lower.includes('specialt') ||
    lower.includes('especialidad') ||
    lower.includes('schwerpunkt') ||
    lower.includes('specializzazion')
  ) {
    return langDef.skillsCategories.frameworks;
  }
  if (
    lower.includes('tool') ||
    lower.includes('herramienta') ||
    lower.includes('ci/cd') ||
    lower.includes('testing') ||
    lower.includes('werkzeug') ||
    lower.includes('outil') ||
    lower.includes('strument')
  ) {
    return langDef.skillsCategories.tooling;
  }
  if (
    lower === 'skills' ||
    lower === 'technical skills' ||
    lower === 'competencies' ||
    lower === 'habilidades' ||
    lower === 'habilidades técnicas'
  ) {
    return langDef.sections.skills;
  }

  return clean;
}

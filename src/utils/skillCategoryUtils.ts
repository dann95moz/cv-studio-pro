/**
 * Utility to dynamically resolve and localize standard skill category names
 * across supported languages (en, es, de, fr, it) while preserving custom user-defined categories.
 */
export function getLocalizedCategoryTitle(
  rawName: string,
  t: (key: string, def: string) => string
): string {
  if (!rawName) return rawName;
  const lower = rawName.trim().toLowerCase();

  // 1. Core Competencies / Fundamentales
  if (
    lower === 'core skills' ||
    lower === 'competencias clave' ||
    lower === 'kernkompetenzen' ||
    lower === 'compétences clés' ||
    lower === 'competenze chiave' ||
    lower === 'core competencies' ||
    lower === 'competencias principales' ||
    lower.includes('core & language') ||
    lower.includes('fundamentales y lenguaje') ||
    lower.includes('languages & core') ||
    lower.includes('lenguajes y fundamento')
  ) {
    return t('profile:sections.skills.defaultCore', 'Core Skills');
  }

  // 2. Specialties / Frameworks & Architecture
  if (
    lower === 'specialties' ||
    lower === 'especialidades' ||
    lower === 'schwerpunkte' ||
    lower === 'spécialités' ||
    lower === 'specializzazioni' ||
    lower.includes('specialt') ||
    lower.includes('especialidad') ||
    lower.includes('architecture & framework') ||
    lower.includes('arquitectura y framework') ||
    lower.includes('frameworks, architecture') ||
    lower.includes('frameworks, arquitectura')
  ) {
    return t('profile:sections.skills.defaultArchitecture', 'Specialties');
  }

  // 3. Tools & Software / Tooling & Cloud
  if (
    lower === 'tools' ||
    lower === 'herramientas' ||
    lower === 'outils' ||
    lower === 'strumenti' ||
    lower === 'tools & software' ||
    lower === 'herramientas y software' ||
    lower.includes('tooling') ||
    lower.includes('cloud & ci/cd') ||
    lower.includes('testing, ci/cd') ||
    lower.includes('herramientas, testing')
  ) {
    return t('profile:sections.skills.defaultTooling', 'Tools');
  }

  // Custom user-defined category (e.g. "Litigación Civil", "Bases de Datos")
  return rawName;
}

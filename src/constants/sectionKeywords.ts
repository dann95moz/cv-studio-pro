import { SectionType } from '../types/cv';

/**
 * Multilingual section classification dictionary across all 5 supported locales:
 * - English (en)
 * - Spanish (es)
 * - German (de)
 * - French (fr)
 * - Italian (it)
 */
export const SECTION_KEYWORDS: Record<Exclude<SectionType, 'generic' | 'custom'>, string[]> = {
  summary: [
    // English
    'summary', 'professional summary', 'executive summary', 'profile', 'about me', 'career objective', 'pitch',
    // Spanish
    'resumen', 'resumen profesional', 'perfil', 'perfil profesional', 'sobre mí', 'extracto', 'presentación',
    // German
    'zusammenfassung', 'kurzprofil', 'profil', 'über mich', 'beruflicher werdegang kurzfassung', 'karriereprofil',
    // French
    'résumé', 'resume', 'profil', 'profil professionnel', 'à propos de moi', 'a propos', 'synthèse',
    // Italian
    'sommario', 'profilo', 'profilo professionale', 'chi sono', 'presentazione', 'sintesi'
  ],
  skills: [
    // English
    'skills', 'technical skills', 'core competencies', 'competencies', 'tech stack', 'technologies', 'stack', 'expertise', 'areas of expertise',
    // Spanish
    'habilidades', 'competencias', 'habilidades técnicas', 'stack tecnológico', 'tecnologías', 'áreas de experiencia',
    // German
    'kenntnisse', 'fähigkeiten', 'faehigkeiten', 'kompetenzen', 'technologien', 'fachkenntnisse', 'it-kenntnisse', 'qualifikationen',
    // French
    'compétences', 'competences', 'compétences techniques', 'savoir-faire', 'technologies', 'expertises',
    // Italian
    'competenze', 'competenze tecniche', 'abilità', 'abilita', 'tecnologie', 'conoscenze tecniche'
  ],
  experience: [
    // English
    'experience', 'work experience', 'professional experience', 'career history', 'employment history', 'work history',
    // Spanish
    'experiencia', 'experiencia laboral', 'experiencia profesional', 'historial laboral', 'trayectoria profesional',
    // German
    'berufserfahrung', 'beruflicher werdegang', 'werdegang', 'praxiserfahrung', 'arbeitserfahrung',
    // French
    'expérience', 'experience', 'expérience professionnelle', 'parcours professionnel', 'historique professionnel',
    // Italian
    'esperienza', 'esperienza professionale', 'esperienze lavorative', 'percorso professionale', 'storia lavorativa'
  ],
  education: [
    // English
    'education', 'academic background', 'academics', 'certifications', 'degrees', 'training',
    // Spanish
    'educación', 'educacion', 'formación académica', 'formacion', 'certificaciones', 'titulaciones', 'estudios',
    // German
    'ausbildung', 'studium', 'bildungsweg', 'akademischer werdegang', 'zertifikate', 'weiterbildung',
    // French
    'formation', 'formations', 'études', 'etudes', 'diplômes', 'diplomes', 'certifications', 'cursus académique',
    // Italian
    'istruzione', 'formazione', 'titoli di studio', 'certificazioni', 'percorso accademico', 'studi'
  ],
  languages: [
    // English
    'languages', 'language skills', 'spoken languages',
    // Spanish
    'idiomas', 'lenguajes', 'competencia lingüística',
    // German
    'sprachen', 'sprachkenntnisse', 'fremdsprachen',
    // French
    'langues', 'langues parlées', 'compétences linguistiques',
    // Italian
    'lingue', 'lingue conosciute', 'competenze linguistiche'
  ],
  projects: [
    // English
    'projects', 'key projects', 'notable projects', 'initiatives', 'publications', 'volunteering', 'side ventures', 'case studies',
    // Spanish
    'proyectos', 'proyectos destacados', 'iniciativas', 'publicaciones', 'voluntariado', 'casos de estudio',
    // German
    'projekte', 'ausgewählte projekte', 'publikationen', 'ehrenamt', 'initiativen', 'fallstudien',
    // French
    'projets', 'projets récents', 'publications', 'bénévolat', 'initiatives', 'études de cas',
    // Italian
    'progetti', 'progetti principali', 'pubblicazioni', 'volontariato', 'iniziative', 'casi di studio'
  ]
};

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const PERSONAL_KEYWORDS = [
  'contact', 'contact info', 'contact information', 'personal info', 'personal information', 'personal details',
  'contacto', 'contactos', 'datos personales', 'informacion de contacto', 'informacion personal',
  'kontaktdaten', 'personliche daten', 'kontakt',
  'coordonnees', 'informations personnelles',
  'dati di contatto', 'informazioni personali', 'contatto'
];

/**
 * Classifies a raw section header into a standardized SectionType across all 5 locales.
 */
export function classifySectionType(rawTitle: string): SectionType {
  const normalized = rawTitle
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics for uniform matching
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalized) return 'generic';

  // Guard: Personal and contact info sections should never be classified as education or others
  for (const pKw of PERSONAL_KEYWORDS) {
    const pRegex = new RegExp(`(?:^|\\s)${escapeRegex(pKw)}(?:$|\\s)`);
    if (pRegex.test(normalized)) {
      return 'generic';
    }
  }

  // Check categories in priority order
  const categories: Array<Exclude<SectionType, 'generic' | 'custom'>> = [
    'summary',
    'skills',
    'experience',
    'education',
    'languages',
    'projects'
  ];

  for (const cat of categories) {
    const keywords = SECTION_KEYWORDS[cat];
    for (const kw of keywords) {
      const normalizedKw = kw
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      const regex = new RegExp(`(?:^|\\s)${escapeRegex(normalizedKw)}(?:$|\\s)`);
      if (regex.test(normalized)) {
        return cat;
      }
    }
  }

  return 'generic';
}


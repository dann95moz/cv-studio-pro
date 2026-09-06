export type SupportedLanguage = 'es' | 'de' | 'fr' | 'it' | 'en';

export interface DetectedLanguage {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  sections: {
    summary: string;
    skills: string;
    experience: string;
    projects: string;
    education: string;
    languages: string;
    websites: string;
  };
  skillsCategories: {
    languages: string;
    frameworks: string;
    tooling: string;
  };
  gapReportTitle: string;
  gapLabels: {
    targetCompany: string;
    targetRole: string;
    matchScore: string;
    keywords: string;
    narrative: string;
    gaps: string;
  };
}

export const LANGUAGE_DEFINITIONS: Record<SupportedLanguage, DetectedLanguage> = {
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    sections: {
      summary: 'RESUMEN PROFESIONAL',
      skills: 'HABILIDADES TÉCNICAS',
      experience: 'EXPERIENCIA LABORAL',
      projects: 'PROYECTOS DESTACADOS',
      education: 'EDUCACIÓN Y CERTIFICACIONES',
      languages: 'IDIOMAS',
      websites: 'SITIOS WEB Y PERFILES'
    },
    skillsCategories: {
      languages: 'Lenguajes y Fundamentos',
      frameworks: 'Frameworks, Arquitectura y Ecosistema',
      tooling: 'Herramientas, Testing, CI/CD e Integración IA'
    },
    gapReportTitle: 'REPORTE DE ESTRATEGIA Y MATCHING (Análisis de Brechas)',
    gapLabels: {
      targetCompany: 'Empresa Objetivo:',
      targetRole: 'Rol Objetivo:',
      matchScore: 'Puntuación Estimada de Compatibilidad:',
      keywords: 'Palabras Clave Críticas Integradas:',
      narrative: 'Narrativa de Alineación Estratégica:',
      gaps: 'Brechas Identificadas y Mitigación:'
    }
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    sections: {
      summary: 'KURZPROFIL',
      skills: 'IT-KENNTNISSE & FÄHIGKEITEN',
      experience: 'BERUFLICHER WERDEGANG',
      projects: 'AUSGEWÄHLTE PROJEKTE',
      education: 'AUSBILDUNG & ZERTIFIZIERUNGEN',
      languages: 'SPRACHKENNTNISSE',
      websites: 'WEBSITES & PROFILE'
    },
    skillsCategories: {
      languages: 'Programmiersprachen & Grundlagen',
      frameworks: 'Frameworks, Architektur & Ökosystem',
      tooling: 'Werkzeuge, Testing, CI/CD & KI-Integrationen'
    },
    gapReportTitle: 'MATCHING- & ANPASSUNGSSTRATEGIEBERICHT (Gap-Analyse)',
    gapLabels: {
      targetCompany: 'Zielunternehmen:',
      targetRole: 'Zielrolle:',
      matchScore: 'Geschätzter Match-Score:',
      keywords: 'Integrierte kritische Schlüsselwörter:',
      narrative: 'Strategische Ausrichtung:',
      gaps: 'Identifizierte Lücken & Abmilderung:'
    }
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    sections: {
      summary: 'PROFIL PROFESSIONNEL',
      skills: 'COMPÉTENCES TECHNIQUES',
      experience: 'EXPÉRIENCE PROFESSIONNELLE',
      projects: 'PROJETS NOTABLES',
      education: 'FORMATION & CERTIFICATIONS',
      languages: 'LANGUES',
      websites: 'SITES WEB & PROFILS'
    },
    skillsCategories: {
      languages: 'Langages et Fondamentaux',
      frameworks: 'Frameworks, Architecture et Écosystème',
      tooling: 'Outils, Tests, CI/CD et Intégrations IA'
    },
    gapReportTitle: 'RAPPORT DE STRATÉGIE ET D’ADÉQUATION (Analyse des Écarts)',
    gapLabels: {
      targetCompany: 'Entreprise Cible:',
      targetRole: 'Poste Cible:',
      matchScore: 'Score de Correspondance Estimé:',
      keywords: 'Mots-clés Critiques Intégrés:',
      narrative: 'Narrative d’Alignement Stratégique:',
      gaps: 'Écarts Identifiés et Mesures d’Atténuation:'
    }
  },
  it: {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    sections: {
      summary: 'PROFILO PROFESSIONALE',
      skills: 'COMPETENZE TECNICHE',
      experience: 'ESPERIENZA PROFESSIONALE',
      projects: 'PROGETTI PRINCIPALI',
      education: 'ISTRUZIONE E CERTIFICAZIONI',
      languages: 'LINGUE',
      websites: 'SITI WEB E PROFILI'
    },
    skillsCategories: {
      languages: 'Linguaggi e Fondamenti',
      frameworks: 'Framework, Architettura ed Ecosistema',
      tooling: 'Strumenti, Testing, CI/CD e Integrazioni IA'
    },
    gapReportTitle: 'RAPPORTO DI STRATEGIA E ALLINEAMENTO (Analisi dei Gap)',
    gapLabels: {
      targetCompany: 'Azienda Obiettivo:',
      targetRole: 'Ruolo Obiettivo:',
      matchScore: 'Punteggio di Corrispondenza Stimato:',
      keywords: 'Parole Chiave Critiche Integrate:',
      narrative: 'Narrativa di Allineamento Strategico:',
      gaps: 'Gap Identificati e Mitigazione:'
    }
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    sections: {
      summary: 'PROFESSIONAL SUMMARY',
      skills: 'TECHNICAL SKILLS',
      experience: 'PROFESSIONAL EXPERIENCE',
      projects: 'FEATURED PROJECTS',
      education: 'EDUCATION & CERTIFICATIONS',
      languages: 'LANGUAGES',
      websites: 'WEBSITES, PORTFOLIOS, PROFILES'
    },
    skillsCategories: {
      languages: 'Languages & Core Fundamentals',
      frameworks: 'Frameworks, Architecture & Ecosystem',
      tooling: 'Tooling, Testing, CI/CD & AI Integrations'
    },
    gapReportTitle: 'MATCHING & TAILORING STRATEGY REPORT (Gap Analysis)',
    gapLabels: {
      targetCompany: 'Target Company:',
      targetRole: 'Target Role:',
      matchScore: 'Estimated Match Score:',
      keywords: 'Critical Integrated Keywords:',
      narrative: 'Strategic Alignment Narrative:',
      gaps: 'Identified Gaps & Mitigation:'
    }
  }
};

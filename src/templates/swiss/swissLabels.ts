import { SupportedLanguage } from '../../constants/languages';

export interface SwissLabels {
  contactTitle: string;
  workPermit: string;
  nationality: string;
  birthDate: string;
  drivingLicense: string;
  availability: string;
  civilStatus: string;
  languages: string;
  competencies: string;
  education: string;
  profile: string;
  experience: string;
  projects: string;
  references: string;
}

export const SWISS_LABELS: Record<SupportedLanguage, SwissLabels> = {
  fr: {
    contactTitle: 'Contact & Informations',
    workPermit: 'Permis de travail',
    nationality: 'Nationalité',
    birthDate: 'Date de naissance',
    drivingLicense: 'Permis de conduire',
    availability: 'Disponibilité',
    civilStatus: 'État civil',
    languages: 'Langues',
    competencies: 'Compétences',
    education: 'Formation & Diplômes',
    profile: 'Profil professionnel',
    experience: 'Expérience professionnelle',
    projects: 'Projets & Réalisations',
    references: 'Références',
  },
  de: {
    contactTitle: 'Kontakt & Personalien',
    workPermit: 'Aufenthaltsbewilligung',
    nationality: 'Nationalität',
    birthDate: 'Geburtsdatum',
    drivingLicense: 'Führerschein',
    availability: 'Verfügbarkeit',
    civilStatus: 'Zivilstand',
    languages: 'Sprachen',
    competencies: 'Kenntnisse & IT',
    education: 'Ausbildung & Abschlüsse',
    profile: 'Kurzprofil',
    experience: 'Berufliche Erfahrung',
    projects: 'Projekte & Erfolge',
    references: 'Referenzen',
  },
  en: {
    contactTitle: 'Contact & Details',
    workPermit: 'Work permit',
    nationality: 'Nationality',
    birthDate: 'Date of birth',
    drivingLicense: 'Driving licence',
    availability: 'Availability',
    civilStatus: 'Civil status',
    languages: 'Languages',
    competencies: 'Core Competencies',
    education: 'Education & Credentials',
    profile: 'Professional Profile',
    experience: 'Work Experience',
    projects: 'Projects & Achievements',
    references: 'References',
  },
  es: {
    contactTitle: 'Contacto y Datos',
    workPermit: 'Permiso de trabajo',
    nationality: 'Nacionalidad',
    birthDate: 'Fecha de nacimiento',
    drivingLicense: 'Permiso de conducir',
    availability: 'Disponibilidad',
    civilStatus: 'Estado civil',
    languages: 'Idiomas',
    competencies: 'Competencias',
    education: 'Educación y Títulos',
    profile: 'Perfil profesional',
    experience: 'Experiencia laboral',
    projects: 'Proyectos destacados',
    references: 'Referencias',
  },
  it: {
    contactTitle: 'Contatti e Dati',
    workPermit: 'Permesso di lavoro',
    nationality: 'Nazionalità',
    birthDate: 'Data di nascita',
    drivingLicense: 'Patente',
    availability: 'Disponibilità',
    civilStatus: 'Stato civile',
    languages: 'Lingue',
    competencies: 'Competenze',
    education: 'Istruzione e Titoli',
    profile: 'Profilo professionale',
    experience: 'Esperienza professionale',
    projects: 'Progetti principali',
    references: 'Referenze',
  },
};

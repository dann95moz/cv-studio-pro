import { SupportedLanguage } from './languages';

export interface LegalPresetOption {
  label: string;
  value: string;
}

export const WORK_PERMIT_PRESETS: Record<SupportedLanguage, LegalPresetOption[]> = {
  en: [
    { label: '⭐ No permit required (Citizen / Permanent)', value: 'No permit required' },
    { label: 'Permit C (Settlement / Permanent)', value: 'Permit C' },
    { label: 'Permit B (Residence)', value: 'Permit B' },
    { label: 'Permit G (Cross-border commuter)', value: 'Permit G' },
    { label: 'Permit L (Short-term)', value: 'Permit L' },
    { label: 'EU / EFTA Citizen (Free movement)', value: 'EU / EFTA Citizen' },
    { label: 'Visa sponsorship required', value: 'Visa sponsorship required' },
  ],
  es: [
    { label: '⭐ Sin permiso requerido (Ciudadano / Residente)', value: 'Sin permiso requerido' },
    { label: 'Permiso C (Residencia permanente / Asentamiento)', value: 'Permiso C' },
    { label: 'Permiso B (Residencia)', value: 'Permiso B' },
    { label: 'Permiso G (Trabajador transfronterizo)', value: 'Permiso G' },
    { label: 'Permiso L (Corta duración)', value: 'Permiso L' },
    { label: 'Ciudadano UE / AELC (Libre circulación)', value: 'Ciudadano UE / AELC' },
    { label: 'Requiere patrocinio de visado', value: 'Requiere patrocinio de visado' },
  ],
  fr: [
    { label: '⭐ Aucun permis requis (Citoyen / Résident)', value: 'Aucun permis requis' },
    { label: 'Permis C (Établissement)', value: 'Permis C' },
    { label: 'Permis B (Séjour)', value: 'Permis B' },
    { label: 'Permis G (Frontalier)', value: 'Permis G' },
    { label: 'Permis L (Courte durée)', value: 'Permis L' },
    { label: 'Citoyen UE / AELE (Libre circulation)', value: 'Citoyen UE / AELE' },
    { label: 'Parrainage de visa requis', value: 'Parrainage de visa requis' },
  ],
  de: [
    { label: '⭐ Keine Bewilligung erforderlich (Bürger / Niedergelassen)', value: 'Keine Bewilligung erforderlich' },
    { label: 'Bewilligung C (Niederlassungsbewilligung)', value: 'Bewilligung C' },
    { label: 'Bewilligung B (Aufenthaltsbewilligung)', value: 'Bewilligung B' },
    { label: 'Bewilligung G (Grenzgängerbewilligung)', value: 'Bewilligung G' },
    { label: 'Bewilligung L (Kurzaufenthaltsbewilligung)', value: 'Bewilligung L' },
    { label: 'EU / EFTA-Staatsangehöriger (Freizügigkeit)', value: 'EU / EFTA-Bürger' },
    { label: 'Visumsponsoring erforderlich', value: 'Visumsponsoring erforderlich' },
  ],
  it: [
    { label: '⭐ Nessun permesso richiesto (Cittadino / Residente)', value: 'Nessun permesso richiesto' },
    { label: 'Permesso C (Domicilio)', value: 'Permesso C' },
    { label: 'Permesso B (Dimora)', value: 'Permesso B' },
    { label: 'Permesso G (Frontaliero)', value: 'Permesso G' },
    { label: 'Permesso L (Breve durata)', value: 'Permesso L' },
    { label: 'Cittadino UE / AELS (Libera circolazione)', value: 'Cittadino UE / AELS' },
    { label: 'Sponsorizzazione visto richiesta', value: 'Sponsorizzazione visto richiesta' },
  ],
};

export const AVAILABILITY_PRESETS: Record<SupportedLanguage, LegalPresetOption[]> = {
  en: [
    { label: 'Immediate', value: 'Immediate' },
    { label: '1 month notice', value: '1 month notice' },
    { label: '2 months notice', value: '2 months notice' },
    { label: '3 months notice', value: '3 months notice' },
    { label: 'To be agreed', value: 'To be agreed' },
  ],
  es: [
    { label: 'Inmediata', value: 'Inmediata' },
    { label: '1 mes de preaviso', value: '1 mes de preaviso' },
    { label: '2 meses de preaviso', value: '2 meses de preaviso' },
    { label: '3 meses de preaviso', value: '3 meses de preaviso' },
    { label: 'A convenir', value: 'A convenir' },
  ],
  fr: [
    { label: 'Immédiate', value: 'Immédiate' },
    { label: '1 mois de préavis', value: '1 mois de préavis' },
    { label: '2 mois de préavis', value: '2 mois de préavis' },
    { label: '3 mois de préavis', value: '3 mois de préavis' },
    { label: 'À convenir', value: 'À convenir' },
  ],
  de: [
    { label: 'Sofort', value: 'Sofort' },
    { label: '1 Monat Kündigungsfrist', value: '1 Monat Kündigungsfrist' },
    { label: '2 Monate Kündigungsfrist', value: '2 Monate Kündigungsfrist' },
    { label: '3 Monate Kündigungsfrist', value: '3 Monate Kündigungsfrist' },
    { label: 'Nach Vereinbarung', value: 'Nach Vereinbarung' },
  ],
  it: [
    { label: 'Immediata', value: 'Immediata' },
    { label: '1 mese di preavviso', value: '1 mese di preavviso' },
    { label: '2 mesi di preavviso', value: '2 mesi di preavviso' },
    { label: '3 mesi di preavviso', value: '3 mesi di preavviso' },
    { label: 'Da concordare', value: 'Da concordare' },
  ],
};

export const DRIVING_LICENSE_PRESETS: Record<SupportedLanguage, LegalPresetOption[]> = {
  en: [
    { label: 'Category B (Car)', value: 'Category B' },
    { label: 'Category B + Own vehicle', value: 'Category B + Own vehicle' },
    { label: 'Category A (Motorcycle)', value: 'Category A' },
  ],
  es: [
    { label: 'Categoría B (Turismo)', value: 'Categoría B' },
    { label: 'Categoría B + Vehículo propio', value: 'Categoría B + Vehículo propio' },
    { label: 'Categoría A (Motocicleta)', value: 'Categoría A' },
  ],
  fr: [
    { label: 'Catégorie B (Voiture)', value: 'Catégorie B' },
    { label: 'Catégorie B + Véhicule personnel', value: 'Catégorie B + Véhicule personnel' },
    { label: 'Catégorie A (Moto)', value: 'Catégorie A' },
  ],
  de: [
    { label: 'Kategorie B (PKW)', value: 'Kategorie B' },
    { label: 'Kategorie B + Eigener PKW', value: 'Kategorie B + Eigener PKW' },
    { label: 'Kategorie A (Motorrad)', value: 'Kategorie A' },
  ],
  it: [
    { label: 'Categoria B (Auto)', value: 'Categoria B' },
    { label: 'Categoria B + Veicolo proprio', value: 'Categoria B + Veicolo proprio' },
    { label: 'Categoria A (Moto)', value: 'Categoria A' },
  ],
};

export const CIVIL_STATUS_PRESETS: Record<SupportedLanguage, LegalPresetOption[]> = {
  en: [
    { label: 'Single', value: 'Single' },
    { label: 'Married', value: 'Married' },
  ],
  es: [
    { label: 'Soltero/a', value: 'Soltero/a' },
    { label: 'Casado/a', value: 'Casado/a' },
  ],
  fr: [
    { label: 'Célibataire', value: 'Célibataire' },
    { label: 'Marié(e)', value: 'Marié(e)' },
  ],
  de: [
    { label: 'Ledig', value: 'Ledig' },
    { label: 'Verheiratet', value: 'Verheiratet' },
  ],
  it: [
    { label: 'Celibe / Nubile', value: 'Celibe / Nubile' },
    { label: 'Coniugato/a', value: 'Coniugato/a' },
  ],
};

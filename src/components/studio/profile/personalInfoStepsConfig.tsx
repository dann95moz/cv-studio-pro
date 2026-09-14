import React from 'react';
import { Theme } from '@mui/material';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import { ContactType, ContactItem } from '../../../types/cv';
import { Icon } from '../../Icons';

export interface StepFieldConfig {
  id: string;
  iconNode: React.ReactNode;
  questionKey: string;
  defaultQuestion: string;
  hintKey: string;
  defaultHint: string;
  placeholder: string;
  isOptional: boolean;
  type: 'name' | 'title' | 'contact';
  contactType?: ContactType;
  inputType?: string;
}

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function extractContactValues(contacts: ContactItem[] = []): Partial<Record<ContactType, string>> {
  const map: Partial<Record<ContactType, string>> = {};
  contacts.forEach((c) => {
    const raw =
      c.type === 'email'
        ? c.label || c.url || ''
        : c.type === 'location' || c.type === 'phone' || c.type === 'text'
        ? c.label || ''
        : c.url || c.label || '';

    let cleaned = raw
      .replace(/^mailto:/i, '')
      .replace(/\\([\[\]+*`_~\\-])/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .trim();

    if (c.type === 'linkedin' || c.type === 'github' || c.type === 'globe') {
      const urlMatch = cleaned.match(/https?:\/\/[^\s)\]]+/i);
      cleaned = urlMatch ? urlMatch[0] : cleaned.replace(/[*_\[\]()]/g, '').trim();
    } else {
      cleaned = cleaned.replace(/[*_\[\]]/g, '').replace(/^\\+|\\+$/g, '').trim();
    }
    map[c.type] = cleaned;
  });
  return map;
}

export function getStepsConfig(theme: Theme): StepFieldConfig[] {
  return [
    {
      id: 'name',
      type: 'name',
      iconNode: <PersonRoundedIcon sx={{ fontSize: 28, color: 'primary.main' }} />,
      questionKey: 'profile:stepFlow.questions.fullName',
      defaultQuestion: 'What is your full name?',
      hintKey: 'profile:stepFlow.hints.fullName',
      defaultHint: 'This will appear as the main heading on your resume.',
      placeholder: 'e.g. Alex Morgan',
      isOptional: false,
    },
    {
      id: 'title',
      type: 'title',
      iconNode: <BadgeRoundedIcon sx={{ fontSize: 28, color: 'primary.main' }} />,
      questionKey: 'profile:stepFlow.questions.jobTitle',
      defaultQuestion: 'What is your professional title or headline?',
      hintKey: 'profile:stepFlow.hints.jobTitle',
      defaultHint: 'Your headline (e.g. Staff Frontend Architect, Lead DevOps).',
      placeholder: 'e.g. Senior Software Engineer | Full Stack & Cloud',
      isOptional: false,
    },
    {
      id: 'email',
      type: 'contact',
      contactType: 'email',
      inputType: 'email',
      iconNode: <Icon type="email" size={26} style={{ color: theme.palette.primary.main }} />,
      questionKey: 'profile:stepFlow.questions.email',
      defaultQuestion: 'What email can recruiters reach you at?',
      hintKey: 'profile:stepFlow.hints.email',
      defaultHint: 'Recruiters and ATS systems will use this to contact you.',
      placeholder: 'e.g. alex.morgan@example.com',
      isOptional: false,
    },
    {
      id: 'location',
      type: 'contact',
      contactType: 'location',
      iconNode: <Icon type="location" size={26} style={{ color: theme.palette.primary.main }} />,
      questionKey: 'profile:stepFlow.questions.location',
      defaultQuestion: 'Where are you located?',
      hintKey: 'profile:stepFlow.hints.location',
      defaultHint: 'City and Country (e.g. London, UK or Remote - US).',
      placeholder: 'e.g. Madrid, Spain | Remote',
      isOptional: false,
    },
    {
      id: 'phone',
      type: 'contact',
      contactType: 'phone',
      inputType: 'tel',
      iconNode: <Icon type="phone" size={26} style={{ color: theme.palette.primary.main }} />,
      questionKey: 'profile:stepFlow.questions.phone',
      defaultQuestion: 'Do you have a contact phone number?',
      hintKey: 'profile:stepFlow.hints.phone',
      defaultHint: 'Optional. Useful if employers reach out via phone or WhatsApp.',
      placeholder: 'e.g. +1 555 123 4567',
      isOptional: true,
    },
    {
      id: 'linkedin',
      type: 'contact',
      contactType: 'linkedin',
      inputType: 'url',
      iconNode: <Icon type="linkedin" size={26} style={{ color: theme.palette.primary.main }} />,
      questionKey: 'profile:stepFlow.questions.linkedin',
      defaultQuestion: 'Do you have a LinkedIn profile?',
      hintKey: 'profile:stepFlow.hints.linkedin',
      defaultHint: 'Optional. Recommended so evaluators can review your network and recommendations.',
      placeholder: 'linkedin.com/in/username',
      isOptional: true,
    },
    {
      id: 'portfolio',
      type: 'contact',
      contactType: 'globe',
      inputType: 'url',
      iconNode: <Icon type="globe" size={26} style={{ color: theme.palette.primary.main }} />,
      questionKey: 'profile:stepFlow.questions.portfolio',
      defaultQuestion: 'Do you have a portfolio or personal website?',
      hintKey: 'profile:stepFlow.hints.portfolio',
      defaultHint: 'Optional. Great for demonstrating live demos, GitHub repositories, or design work.',
      placeholder: 'myportfolio.dev',
      isOptional: true,
    },
  ];
}

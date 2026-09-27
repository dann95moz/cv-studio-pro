import React from 'react';
import { Box, Typography } from '@mui/material';
import { MiniatureLayoutProps } from './types';

export const SwissModernMiniature: React.FC<MiniatureLayoutProps> = ({ pal }) => {
  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '33% 67%',
        boxSizing: 'border-box',
        fontFamily: "'Inter', sans-serif",
        bgcolor: '#ffffff',
        userSelect: 'none',
        pointerEvents: 'none',
      }}
    >
      {/* Sidebar */}
      <Box sx={{ bgcolor: '#f8fafc', p: '5px 4px', borderRight: '0.5px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: '1px' }}>
          <Box sx={{ width: '15px', height: '15px', borderRadius: '50%', bgcolor: '#e2e8f0', border: `1.5px solid ${pal.accentColor}` }} />
        </Box>
        <Typography sx={{ fontSize: '2.5px', fontWeight: 800, color: pal.accentColor, textTransform: 'uppercase', borderBottom: '0.5px solid #cbd5e1', pb: '0.5px' }}>
          CONTACT & STATUT
        </Typography>
        <Typography sx={{ fontSize: '2.2px', color: '#475569' }}>
          Genève, Suisse
        </Typography>
        <Box sx={{ bgcolor: '#e0f2fe', borderRadius: '2px', px: '2px', py: '0.5px', alignSelf: 'flex-start' }}>
          <Typography sx={{ fontSize: '2.1px', fontWeight: 800, color: '#0369a1' }}>
            Permis B
          </Typography>
        </Box>
        <Typography sx={{ fontSize: '2.5px', fontWeight: 800, color: pal.accentColor, textTransform: 'uppercase', borderBottom: '0.5px solid #cbd5e1', pb: '0.5px', mt: '1px' }}>
          LANGUES
        </Typography>
        <Typography sx={{ fontSize: '2.2px', color: '#1e293b', fontWeight: 600 }}>
          Français · Natif
        </Typography>
        <Typography sx={{ fontSize: '2.2px', color: '#1e293b', fontWeight: 600 }}>
          Anglais · C1
        </Typography>
        <Typography sx={{ fontSize: '2.2px', color: '#64748b' }}>
          Allemand · B1
        </Typography>
      </Box>

      {/* Main */}
      <Box sx={{ p: '5px 6px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <Typography sx={{ fontSize: '4.8px', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
          ALEXANDRE DUBOIS
        </Typography>
        <Typography sx={{ fontSize: '2.7px', fontWeight: 700, color: pal.accentColor }}>
          INGÉNIEUR LOGICIEL SENIOR
        </Typography>
        <Typography sx={{ fontSize: '2.7px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', borderBottom: '0.5px solid #e2e8f0', pb: '0.5px', mt: '1px' }}>
          EXPÉRIENCE PROFESSIONNELLE
        </Typography>
        <Typography sx={{ fontSize: '2.5px', fontWeight: 700, color: '#0f172a' }}>
          Nestlé / Rolex — Genève (2021 – Présent)
        </Typography>
        <Typography sx={{ fontSize: '2.2px', color: '#475569', lineHeight: 1.2 }}>
          • Architecture cloud et microservices déployés pour 1.2M d’utilisateurs.
        </Typography>
        <Typography sx={{ fontSize: '2.4px', fontWeight: 700, color: pal.accentColor, mt: 'auto', pt: '1px', borderTop: '0.5px solid #e2e8f0' }}>
          RÉFÉRENCES : Disponibles sur demande
        </Typography>
      </Box>
    </Box>
  );
};

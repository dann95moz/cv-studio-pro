import React from 'react';
import { Button } from '@mui/material';
import { Icon } from '../Icons';
import { LockedViewCardProps } from '../../types';

export type { LockedViewCardProps };

export const LockedViewCard: React.FC<LockedViewCardProps> = ({
  iconType,
  badgeVariant = 'default',
  title,
  description,
  actionText,
  actionIcon,
  onAction,
  isDisabled = false,
}) => {
  const badgeClass = badgeVariant === 'default' ? 'locked-icon-badge' : `locked-icon-badge ${badgeVariant}`;

  return (
    <div className="locked-view-card">
      <div className={badgeClass}>
        <Icon type={iconType} size={32} />
      </div>
      <h3 className="locked-title">{title}</h3>
      <p className="locked-desc">{description}</p>
      <div className="locked-actions">
        <Button
          variant="contained"
          color="primary"
          onClick={onAction}
          disabled={isDisabled}
          startIcon={actionIcon ? <Icon type={actionIcon} size={14} /> : undefined}
          sx={{ fontWeight: 700 }}
        >
          {actionText}
        </Button>
      </div>
    </div>
  );
};

import { ResumeStore } from '../store/types';

export interface WorkspaceSnapshotMetadata {
  version: number;
  createdAt: number;
  lastModifiedAt: number;
  deviceLabel?: string;
  candidateName?: string;
  stats: {
    versionsCount: number;
    applicationsCount: number;
    hasTargetJob: boolean;
    masterDataLength: number;
  };
}

export interface WorkspaceSnapshotPayload {
  metadata: WorkspaceSnapshotMetadata;
  data: Partial<ResumeStore>;
}

export type ConflictSeverity = 'clean' | 'newer_remote' | 'local_newer_conflict';

export interface ConflictComparison {
  severity: ConflictSeverity;
  localLastModified: number;
  remoteLastModified: number;
  timeDiffFormatted: string;
  isLocalSignificantlyNewer: boolean;
  localStats: {
    versionsCount: number;
    applicationsCount: number;
    masterDataLength: number;
  };
  remoteStats: {
    versionsCount: number;
    applicationsCount: number;
    masterDataLength: number;
  };
}

export interface RelayPushResponse {
  ok: boolean;
  id: string;
  ttl: number;
}

export interface RelayPullResponse {
  ciphertext: string;
}

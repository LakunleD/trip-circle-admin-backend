export const FEATURE_STATUSES = [
  'backlog',
  'not_started',
  'in_progress',
  'blocked',
  'built',
  'paused',
  'deprecated',
] as const;

export const FEATURE_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;

export const FEATURE_WORK_TYPES = [
  'App Feature',
  'AI Agent',
  'Internal Tool',
  'Setup Task',
  'B2B Portal',
] as const;

export const FEATURE_TIERS = ['free', 'tripcircle_plus'] as const;

export const FEATURE_PLATFORMS = ['web', 'mobile_only', 'web_and_mobile'] as const;

export const FEATURE_SORT_FIELDS = ['createdAt', 'updatedAt', 'priority', 'title'] as const;

export const SORT_ORDERS = ['asc', 'desc'] as const;

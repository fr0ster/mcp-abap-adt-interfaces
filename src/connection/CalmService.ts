export const CALM_SERVICES = [
  'features',
  'documents',
  'tasks',
  'projects',
  'testManagement',
  'hierarchy',
  'analytics',
  'processMonitoring',
  'logs',
] as const;

export type CalmService = (typeof CALM_SERVICES)[number];

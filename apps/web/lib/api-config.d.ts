export interface SkewLineServerConfig {
  appName: string;
  appTitle: string;
  appDomain: string;
  appDomainConfigured: boolean;
  appKeyConfigured: boolean;
  activeBackend: string;
  backendBaseUrl: string;
  isHttps: boolean;
}

export interface ApplicationIdentity {
  appKey: string;
  appDomain: string;
  appName: string;
  appTitle: string;
}

export interface ValidatedServerConfiguration extends ApplicationIdentity {
  backendBaseUrl: string;
}

export class BackendConfigurationError extends Error {
  code: string;
  constructor(message: string, code?: string);
}

export function resolveBackendBaseUrl(
  env?: Record<string, string | undefined>,
  options?: { requireHttps?: boolean }
): string;

export function isHttpsBackendUrl(baseUrl: string): boolean;

export function resolveApplicationIdentity(
  env?: Record<string, string | undefined>
): ApplicationIdentity;

export function validateServerConfiguration(
  env?: Record<string, string | undefined>,
  options?: { requireHttps?: boolean }
): ValidatedServerConfiguration;

export function getSkewLineServerConfig(
  env?: Record<string, string | undefined>
): SkewLineServerConfig;

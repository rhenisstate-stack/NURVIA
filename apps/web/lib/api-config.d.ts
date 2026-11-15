export interface SkewLineServerConfig {
  appName: string;
  appTitle: string;
  appDomain: string;
  appKeyConfigured: boolean;
  activeBackend: string;
  backendBaseUrl: string;
}

export function resolveBackendBaseUrl(
  env?: Record<string, string | undefined>,
  options?: { requireHttps?: boolean }
): string;

export function isHttpsBackendUrl(baseUrl: string): boolean;

export function getSkewLineServerConfig(
  env?: Record<string, string | undefined>
): SkewLineServerConfig;

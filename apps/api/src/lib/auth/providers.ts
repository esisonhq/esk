import { env } from '@esk/utils/env';

// Define provider names as a const array for type safety
const providers = [
  'apple',
  'discord',
  'dropbox',
  'facebook',
  'github',
  'gitlab',
  'google',
  'linkedin',
  'microsoft',
  'reddit',
  'roblox',
  'spotify',
  'tiktok',
  'twitch',
  'vk',
  'zoom',
  'x',
] as const;

// Helper function to safely get env values with computed keys
function getEnvValue(key: string): string | undefined {
  const envValue = (env as Record<string, string | number | undefined>)[key];
  return typeof envValue === 'string' ? envValue : undefined;
}

// Helper function to check if a string is non-empty
function isNonEmptyString(value: string | undefined): value is string {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Dynamically configures supported social authentication providers using environment variables.
 *
 * This setup supports multiple OAuth providers (e.g., Google, GitHub, Apple) and reads their
 * credentials from the environment. It includes provider-specific overrides for additional
 * configuration options like `appBundleIdentifier`, `issuer`, `tenantId`, and `clientKey`.
 *
 * @remarks
 * - Only providers with both `CLIENT_ID` and `CLIENT_SECRET` defined are included.
 * - Additional fields are conditionally added based on provider-specific needs.
 * - The configuration is used by `better-auth` to enable social login.
 */
export const configuredProviders = providers.reduce<
  Record<
    string,
    {
      clientId: string;
      clientSecret: string;
      appBundleIdentifier?: string;
      tenantId?: string;
      requireSelectAccount?: boolean;
      clientKey?: string;
      issuer?: string;
    }
  >
>((acc, provider) => {
  const uppercaseProvider = provider.toUpperCase();
  const id = getEnvValue(`${uppercaseProvider}_CLIENT_ID`);
  const secret = getEnvValue(`${uppercaseProvider}_CLIENT_SECRET`);

  if (isNonEmptyString(id) && isNonEmptyString(secret)) {
    acc[provider] = { clientId: id, clientSecret: secret };
  }

  // Handle provider-specific configurations
  if (provider === 'apple' && acc[provider]) {
    const bundleId = getEnvValue(`${uppercaseProvider}_APP_BUNDLE_IDENTIFIER`);
    if (isNonEmptyString(bundleId)) {
      acc[provider].appBundleIdentifier = bundleId;
    }
  }

  if (provider === 'gitlab' && acc[provider]) {
    const issuer = getEnvValue(`${uppercaseProvider}_ISSUER`);
    if (isNonEmptyString(issuer)) {
      acc[provider].issuer = issuer;
    }
  }

  if (provider === 'microsoft' && acc[provider]) {
    acc[provider].tenantId = 'common';
    acc[provider].requireSelectAccount = true;
  }

  if (provider === 'tiktok' && acc[provider]) {
    const key = getEnvValue(`${uppercaseProvider}_CLIENT_KEY`);
    if (isNonEmptyString(key)) {
      acc[provider].clientKey = key;
    }
  }

  return acc;
}, {});

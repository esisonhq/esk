/**
 * Loads and validates environment variables using `dotenv`, `dotenv-expand`, and `zod`.
 *
 * This module:
 * - Loads environment variables from `.env` or `.env.test` depending on `NODE_ENV`.
 * - Expands any nested environment variables using `dotenv-expand`.
 * - Validates the loaded environment variables using a Zod schema.
 * - Exits the process with an error message if validation fails.
 *
 * @module Env
 */

import { config } from 'dotenv';
import { expand } from 'dotenv-expand';
import path from 'node:path';
import { z } from 'zod';

/**
 * Load environment variables with better cross-platform support
 */
const loadEnvironmentVariables = () => {
  // Skip dotenv in production if no .env file exists
  if (process.env.NODE_ENV === 'production') {
    console.log('Production mode: using platform environment variables');
    return;
  }

  // Try to load .env file (local development)
  const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
  const envPath = path.resolve(process.cwd(), envFile);

  try {
    const result = expand(config({ path: envPath }));
    if (result.parsed) {
      console.log(`Loaded environment variables from ${envPath}`);
    } else {
      console.log('No .env file found, using system environment variables');
    }
  } catch {
    console.log('Could not load .env file, using system environment variables');
  }
};

loadEnvironmentVariables();

/**
 * Zod schema for validating required environment variables.
 */
const EnvSchema = z
  .object({
    // General
    APP_NAME: z.string().default('esk'),

    // Deployment
    NODE_ENV: z.string().default('development'),
    PORT: z.coerce.number().default(3000),
    HOST: z.string().default('localhost'),
    ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),

    // Auth
    BETTER_AUTH_SECRET: z.string(),
    BETTER_AUTH_PATH: z.string().default('/auth'),

    // Social Logins
    APPLE_APP_BUNDLE_IDENTIFIER: z.string().optional(),
    APPLE_CLIENT_ID: z.string().optional(),
    APPLE_CLIENT_SECRET: z.string().optional(),
    DISCORD_CLIENT_ID: z.string().optional(),
    DISCORD_CLIENT_SECRET: z.string().optional(),
    DROPBOX_CLIENT_ID: z.string().optional(),
    DROPBOX_CLIENT_SECRET: z.string().optional(),
    FACEBOOK_CLIENT_ID: z.string().optional(),
    FACEBOOK_CLIENT_SECRET: z.string().optional(),
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
    GITLAB_CLIENT_ID: z.string().optional(),
    GITLAB_CLIENT_SECRET: z.string().optional(),
    GITLAB_ISSUER: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    LINKEDIN_CLIENT_ID: z.string().optional(),
    LINKEDIN_CLIENT_SECRET: z.string().optional(),
    MICROSOFT_CLIENT_ID: z.string().optional(),
    MICROSOFT_CLIENT_SECRET: z.string().optional(),
    REDDIT_CLIENT_ID: z.string().optional(),
    REDDIT_CLIENT_SECRET: z.string().optional(),
    ROBLOX_CLIENT_ID: z.string().optional(),
    ROBLOX_CLIENT_SECRET: z.string().optional(),
    SPOTIFY_CLIENT_ID: z.string().optional(),
    SPOTIFY_CLIENT_SECRET: z.string().optional(),
    TIKTOK_CLIENT_ID: z.string().optional(),
    TIKTOK_CLIENT_KEY: z.string().optional(),
    TIKTOK_CLIENT_SECRET: z.string().optional(),
    TWITCH_CLIENT_ID: z.string().optional(),
    TWITCH_CLIENT_SECRET: z.string().optional(),
    VK_CLIENT_ID: z.string().optional(),
    VK_CLIENT_SECRET: z.string().optional(),
    ZOOM_CLIENT_ID: z.string().optional(),
    ZOOM_CLIENT_SECRET: z.string().optional(),
    X_CLIENT_ID: z.string().optional(),
    X_CLIENT_SECRET: z.string().optional(),

    // Email
    RESEND_API_KEY: z.string(),

    // Logging
    LOG_LEVEL: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
      .default('info'),

    // Primary Database
    DATABASE_PRIMARY_URL: z.url(),

    // Transaction / Job Process Database
    DATABASE_PRIMARY_POOLER_URL: z.url(),

    // Provider-agnostic replica configuration
    DATABASE_REPLICAS: z.string().optional(), // Comma-separated URLs
    DATABASE_REGIONS: z.string().optional(), // Comma-separated regions (must match replica order)

    // Provider specific (auto-set)
    DATABASE_REGION: z.string().optional(), // Current region, auto set or manual
    FLY_REGION: z.string().optional(),
    FLY_PRIMARY_REGION: z.string().optional(),
    RENDER_SERVICE_REGION: z.string().optional(),
    RAILWAY_REGION: z.string().optional(),
    VERCEL_REGION: z.string().optional(),
    AWS_REGION: z.string().optional(),
    AWS_DEFAULT_REGION: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Validate that replicas and regions arrays match length if both are provided
    const replicas =
      data.DATABASE_REPLICAS?.split(',')
        .map((s) => s.trim())
        .filter(Boolean) || [];
    const regions =
      data.DATABASE_REGIONS?.split(',')
        .map((s) => s.trim())
        .filter(Boolean) || [];

    if (
      replicas.length > 0 &&
      regions.length > 0 &&
      replicas.length !== regions.length
    ) {
      ctx.addIssue({
        code: 'custom',
        message:
          'DATABASE_REPLICAS and DATABASE_REGIONS arrays must have the same length',
        path: ['DATABASE_REPLICAS', 'DATABASE_REGIONS'],
      });
    }
  });

/**
 * Type representing the validated environment variables.
 */
export type env = z.infer<typeof EnvSchema>;

/**
 * Parses and validates the environment variables against the schema.
 * If validation fails, logs the errors and exits the process.
 */
const { data, error } = EnvSchema.safeParse(process.env);

if (error) {
  console.error('Invalid env:');
  console.error(z.prettifyError(error));
  process.exit(1);
}

/**
 * The validated and parsed environment variables.
 */
export const env = data!;

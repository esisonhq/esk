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
    NODE_ENV: z.string().default('development'),

    // Primary Database
    DATABASE_PRIMARY_URL: z.url(),
    DATABASE_PRIMARY_POOLER_URL: z.url(),

    // Provider-agnostic replica configuration
    DATABASE_REPLICAS: z.string().optional(), // Comma-separated URLs
    DATABASE_REGIONS: z.string().optional(), // Comma-separated regions (must match replica order)
    DATABASE_REGION: z.string().optional(), // Current region
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
const { data: env, error } = EnvSchema.safeParse(process.env);

if (error) {
  console.error('Invalid environment variables:');
  console.error(z.prettifyError(error));
  process.exit(1);
}

/**
 * The validated and parsed environment variables.
 */
export default env!;

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
const EnvSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().default(3000),

  // Pino Log Levels
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
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
  console.error('Invalid env:');
  console.error(z.prettifyError(error));
  process.exit(1);
}

/**
 * The validated and parsed environment variables.
 */
export default env!;

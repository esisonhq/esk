import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { multiSession, openAPI, twoFactor } from 'better-auth/plugins';

import { primaryDb } from '@esk/db/client';
import { authSchemas } from '@esk/db/schema';
import { resend } from '@esk/email/client';
import { env } from '@esk/utils/env';

import { configuredProviders } from './providers';

/**
 * Initializes and configures the authentication system using `better-auth`.
 *
 * This setup includes:
 * - Email/password authentication with password reset and verification flows
 * - Social login providers
 * - Session management with expiration and freshness policies
 * - Two-factor authentication via OTP
 * - Multi-session support
 * - OpenAPI plugin for auth endpoints
 * - Custom email flows using `resend`
 * - PostgreSQL database integration via Drizzle ORM
 */
export const auth = betterAuth({
  trustedOrigins: env.ALLOWED_ORIGINS?.split(',') || [],
  database: drizzleAdapter(primaryDb, {
    schema: authSchemas,
    provider: 'pg',
    usePlural: false,
  }),
  advanced: {
    database: {
      useNumberId: false,
      generateId: false,
    },
  },
  // baseURL: env.BETTER_AUTH_URL, // auto infer
  basePath: env.BETTER_AUTH_PATH,
  secret: env.BETTER_AUTH_SECRET,
  appName: env.APP_NAME,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    resetPasswordTokenExpiresIn: 300,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      await resend.emails.send({
        from: 'Esison <onboarding@resend.dev>', // TODO change to custom domain
        to: user.email,
        subject: 'Reset your password',
        html: `Click the link to reset your password: ${url}`, // TODO change to custom template
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      await resend.emails.send({
        from: 'Esison <onboarding@resend.dev>', // TODO change to custom domain
        to: user.email,
        subject: 'Confirm your Esison account',
        html: `Thank you for signing up for Esison. To confirm your account, please click the button below.: ${url}`, // TODO change to custom template
      });
    },
  },
  user: {
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url, token }, request) => {
        await resend.emails.send({
          from: 'Esison <onboarding@resend.dev>', // TODO change to custom domain
          to: user.email,
          subject: 'Confirm deleting your Esison account',
          html: `To delete your account, please click the button below.: ${url}`, // TODO change to custom template
        });
      },
    },
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ user, url, token }, request) => {
        await resend.emails.send({
          from: 'Esison <onboarding@resend.dev>', // TODO change to custom domain
          to: user.email,
          subject: 'Confirm your email',
          html: `You have requested to change your email. To confirm your new email, please click the button below.: ${url}`, // TODO change to custom template
        });
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24, // 1 day
    updateAge: 60 * 60 * 24, // 1 day (every 1 day the session expiration is updated)
    freshAge: 5 * 60, // 5 minutes (the session is fresh if created within the last 5 minutes)
    cookieCache: {
      enabled: false,
    },
  },
  socialProviders: configuredProviders,
  plugins: [
    openAPI(),
    twoFactor({
      otpOptions: {
        async sendOTP({ user, otp }, request) {
          await resend.emails.send({
            from: 'Esison <onboarding@resend.dev>', // TODO change to custom domain
            to: user.email,
            subject: 'Your One-Time Password',
            html: `Your one-time password is below. This code is valid for the next 5 minutes. DO NOT share this with anyone. If you did not request this code, you can safely ignore this email.: ${otp}`, // TODO change to custom template
          });
        },
      },
      issuer: env.APP_NAME,
    }),
    multiSession(),
  ],
});

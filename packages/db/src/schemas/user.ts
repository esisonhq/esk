import { relations } from 'drizzle-orm';
import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { timestamps } from './timestamps';

export const userTable = pgTable('user', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  twoFactorEnabled: boolean('two_factor_enabled').default(false).notNull(),
  image: text('image'),

  ...timestamps,
});

export const userRelations = relations(userTable, ({ many }) => ({
  sessions: many(sessionTable, {
    relationName: 'userSessions',
  }),
  accounts: many(accountTable, {
    relationName: 'userAccounts',
  }),
  twoFactors: many(twoFactorTable, {
    relationName: 'userTwoFactors',
  }),
}));

export const sessionTable = pgTable('session', {
  id: uuid('id').primaryKey().defaultRandom(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: uuid('userId')
    .notNull()
    .references(() => userTable.id),

  ...timestamps,
});

export const sessionRelations = relations(sessionTable, ({ one }) => ({
  user: one(userTable, {
    fields: [sessionTable.userId],
    references: [userTable.id],
    relationName: 'userSessions',
  }),
}));

export const accountTable = pgTable('account', {
  id: uuid('id').primaryKey().defaultRandom(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: uuid('userId')
    .notNull()
    .references(() => userTable.id),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),

  ...timestamps,
});

export const accountRelations = relations(accountTable, ({ one }) => ({
  user: one(userTable, {
    fields: [accountTable.userId],
    references: [userTable.id],
    relationName: 'userAccounts',
  }),
}));

export const verificationTable = pgTable('verification', {
  id: uuid('id').primaryKey().defaultRandom(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),

  ...timestamps,
});

export const twoFactorTable = pgTable('two_factor', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userId')
    .notNull()
    .references(() => userTable.id),
  secret: text('secret').notNull(),
  backupCodes: text('backup_codes').notNull(),

  ...timestamps,
});

export const twoFactorRelations = relations(twoFactorTable, ({ one }) => ({
  user: one(userTable, {
    fields: [twoFactorTable.userId],
    references: [userTable.id],
    relationName: 'userTwoFactors',
  }),
}));

export const authSchemas = {
  user: userTable,
  userRelations,
  session: sessionTable,
  sessionRelations,
  account: accountTable,
  accountRelations,
  verification: verificationTable,
  twoFactor: twoFactorTable,
  twoFactorRelations,
};

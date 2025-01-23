import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

// Enums
export const Gender = pgEnum('Gender', ['male', 'female', 'other']);
export const UserRole = pgEnum('UserRole', ['ADMIN', 'USER', 'GUEST']);
export const Permission = pgEnum('Permission', [
  'CREATE',
  'READ',
  'UPDATE',
  'DELETE',
]);

// Role Table with Detailed Permissions
export const Role = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  permissions: Permission('permissions').array().notNull(),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// User Table with Constraints and Indexes
export const User = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    firstName: varchar('first_name', { length: 255 }).notNull(),
    lastName: varchar('last_name', { length: 255 }).notNull(),
    userName: varchar('user_name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    isActive: boolean('is_active').notNull().default(false),
    isSuperUser: boolean('is_super_user').notNull().default(false),
    phone: varchar('phone', { length: 20 }),
    gender: Gender('gender').notNull().default('other'),
    birthDate: timestamp('birth_date', { mode: 'date' }),
    address: varchar('address', { length: 255 }),
    hashedPassword: varchar('hashed_password', { length: 255 }),
    role: UserRole('role').notNull().default('USER'),
    roleId: uuid('role_id').references(() => Role.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    deletedAt: timestamp('deleted_at', { mode: 'date', withTimezone: true }),
    createdBy: uuid('created_by').notNull(),
    updatedBy: uuid('updated_by').notNull(),
    lastLogin: timestamp('last_login', { mode: 'date', withTimezone: true }),
    failedLoginAttempts: integer('failed_login_attempts').default(0),
  },
  (t) => [
    uniqueIndex('email_index').on(t.email),
    uniqueIndex('user_name_index').on(t.userName),
  ],
);

// Token Table with Expiry Management
export const Token = pgTable('tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => User.id, {
    onDelete: 'cascade',
    onUpdate: 'cascade',
  }),
  token: text('token').notNull().unique(),
  expiredAt: timestamp('expired_at', {
    mode: 'date',
    withTimezone: true,
  }).notNull(),
});

// AuditLog Table for Action Tracking
export const AuditLog = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  action: varchar('action', { length: 255 }).notNull(),
  userId: uuid('user_id')
    .references(() => User.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    })
    .notNull(),
  timestamp: timestamp('timestamp', {
    mode: 'date',
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
  metadata: jsonb('metadata').default(null),
});

// Define Relations
export const UserRelations = relations(User, ({ one, many }) => ({
  role: one(Role, {
    fields: [User.roleId],
    references: [Role.id],
  }),
  tokens: many(Token),
  auditLogs: many(AuditLog),
}));

export const TokenRelations = relations(Token, ({ one }) => ({
  user: one(User, {
    fields: [Token.userId],
    references: [User.id],
  }),
}));

export const AuditLogRelations = relations(AuditLog, ({ one }) => ({
  user: one(User, {
    fields: [AuditLog.userId],
    references: [User.id],
  }),
}));

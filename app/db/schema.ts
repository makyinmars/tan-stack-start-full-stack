import { createId } from "@paralleldrive/cuid2";
import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", [
  "member",
  "admin",
  "superadmin",
  "guest",
]);
export const accountTypeEnum = pgEnum("type", ["email"]);
export const packageStatusEnum = pgEnum("package_status", [
  "registered",
  "received",
  "processing",
  "manifested",
  "in_bag",
  "in_transit",
  "flying",
  "at_customs",
  "out_for_delivery",
  "delivered",
  "returned",
  "lost",
  "canceled",
]);

// Reusable timestamp columns
const timestamps = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
};

export const users = pgTable("user", {
  id: varchar("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  ...timestamps,
});

export const accounts = pgTable(
  "account",
  {
    id: varchar("id", { length: 24 })
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountType: accountTypeEnum("account_type").notNull().default("email"),
    password: text("password"),
    salt: text("salt"),
    ...timestamps,
  },
  (table) => [
    index("user_id_account_type_idx").on(table.userId, table.accountType),
  ]
);

export const resetTokens = pgTable(
  "reset_token",
  {
    id: varchar("id", { length: 24 })
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .unique(),
    token: text("token"),
    tokenExpiresAt: timestamp("token_expires_at", { mode: "date" }),
    ...timestamps,
  },
  (table) => [index("reset_tokens_token_idx").on(table.token)]
);

export const verifyEmailTokens = pgTable(
  "verify_email_token",
  {
    id: varchar("id", { length: 24 })
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .unique(),
    token: text("token"),
    tokenExpiresAt: timestamp("token_expires_at", { mode: "date" }),
    ...timestamps,
  },
  (table) => [index("verify_email_tokens_token_idx").on(table.token)]
);

export const profiles = pgTable("profile", {
  id: varchar("id", { length: 24 })
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  displayName: text("displayName"),
  imageId: text("imageId"),
  image: text("image"),
  bio: text("bio").notNull().default(""),
  ...timestamps,
});

export const sessions = pgTable(
  "session",
  {
    id: varchar("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    ...timestamps,
  },
  (table) => [index("sessions_user_id_idx").on(table.userId)]
);

// User and Auth Types
export type User = typeof users.$inferSelect;
export type UserId = User["id"];
export type NewUser = typeof users.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export type ResetToken = typeof resetTokens.$inferSelect;
export type NewResetToken = typeof resetTokens.$inferInsert;

export type Session = typeof sessions.$inferSelect;

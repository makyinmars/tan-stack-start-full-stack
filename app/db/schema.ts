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

export const userTable = pgTable("user", {
  id: varchar("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  ...timestamps,
});

export const accountTable = pgTable(
  "account",
  {
    id: varchar("id", { length: 24 })
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: varchar("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    accountType: accountTypeEnum("account_type").notNull().default("email"),
    password: text("password"),
    salt: text("salt"),
    ...timestamps,
  },
  (table) => [
    index("user_id_account_type_idx").on(table.userId, table.accountType),
  ]
);

export const resetTokenTable = pgTable(
  "reset_token",
  {
    id: varchar("id", { length: 24 })
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: varchar("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" })
      .unique(),
    token: text("token"),
    tokenExpiresAt: timestamp("token_expires_at", { mode: "date" }),
    ...timestamps,
  },
  (table) => [index("reset_tokens_token_idx").on(table.token)]
);

export const verifyEmailTokenTable = pgTable(
  "verify_email_token",
  {
    id: varchar("id", { length: 24 })
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: varchar("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" })
      .unique(),
    token: text("token"),
    tokenExpiresAt: timestamp("token_expires_at", { mode: "date" }),
    ...timestamps,
  },
  (table) => [index("verify_email_tokens_token_idx").on(table.token)]
);

export const profileTable = pgTable("profile", {
  id: varchar("id", { length: 24 })
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: varchar("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" })
    .unique(),
  displayName: text("displayName"),
  imageId: text("imageId"),
  image: text("image"),
  bio: text("bio").notNull().default(""),
  ...timestamps,
});

export const sessionTable = pgTable(
  "session",
  {
    id: varchar("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: varchar("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    ...timestamps,
  },
  (table) => [index("sessions_user_id_idx").on(table.userId)]
);

// User and Auth Types
export type User = typeof userTable.$inferSelect;
export type NewUser = typeof userTable.$inferInsert;

export type Account = typeof accountTable.$inferSelect;
export type NewAccount = typeof accountTable.$inferInsert;

export type ResetToken = typeof resetTokenTable.$inferSelect;
export type NewResetToken = typeof resetTokenTable.$inferInsert;

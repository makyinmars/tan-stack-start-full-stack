import { databasePrefix } from "@/constants";
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./app/db/schema.ts",
  dialect: "postgresql",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
  },
  tablesFilter: [`${databasePrefix}_*`],
  verbose: true,
  strict: true,
});

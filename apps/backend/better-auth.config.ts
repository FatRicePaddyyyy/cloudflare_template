import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { schema } from "./src/lib/schema"
import initSqlJs from "sql.js";
import { drizzle } from "drizzle-orm/sql-js";

const SQL = await initSqlJs();
const sqlite = new SQL.Database();
const db = drizzle(sqlite, { schema });

export const auth = betterAuth({
    basePath: "/api/v1/auth",
    emailAndPassword: {
      enabled: true,
    },
    database: drizzleAdapter(db, { provider: "sqlite", schema }),
    plugins: [admin()],
  });


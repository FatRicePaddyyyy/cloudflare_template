import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { createDBClient } from "../db"
import { schema } from "../schema"

export const auth = (env: CloudflareBindings) => {
  const db = createDBClient(env);

  return betterAuth({
    basePath: "/api/v1/auth",
    emailAndPassword: {
      enabled: true,
    },
    database: drizzleAdapter(db, { provider: "sqlite", schema }),
    baseURL: env.BACKEND_URL,
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: [env.FRONTEND_URL],
    advanced: {
      crossSubDomainCookies: {
        enabled: true,
        domain: env.crossSubDomainCookies,
      },
      useSecureCookies: env.crossSubDomainCookies === "localhost" ? false : true,
      defaultCookieAttributes: { sameSite: "lax", secure: false },
    },
    plugins: [admin()],
  });
};

import { drizzle } from "drizzle-orm/d1";
import { schema } from "../lib/schema"
export const createDBClient = (env: CloudflareBindings) => {
  return drizzle(env.DB, { schema: schema});
};

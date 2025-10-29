
import type { Context, Next } from "hono";
import { auth } from "../lib/better-auth";
import type { Variables } from "../types";

export const authMiddleware = async (
  ctx: Context<{ Bindings: CloudflareBindings; Variables: Variables }>,
  next: Next,
) => {
  try {

    const sessionRes = await auth(ctx.env).api.getSession({
      headers: ctx.req.raw.headers,
    });

    if (!sessionRes?.user) {
      return ctx.json({ error: "unauthorized" }, 401);
    }

    const userId = sessionRes.user.id;
    ctx.set("userId", userId);
    await next();
  } catch (e) {
    console.error("auth middleware error:", e);
    return ctx.json({ error: "unauthorized" }, 401);
  }
};

import { cors } from "hono/cors";
export const corsMiddleware = cors({
  origin: (origin) => {
    if (!origin) {
      return null;
    }
    const ALLOWED_ORIGINS = ["http://localhost:3000","https://frontend-preview.fatricepaddy.workers.dev","https://frontend-production.fatricepaddy.workers.dev",] 

    if (ALLOWED_ORIGINS.includes(origin)) {
      return origin;
    }
    return null;
  },
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowHeaders: ["Content-Type", "Authorization", "credentials", "User-Agent"],
  credentials: true,
});

import type { Context, Next } from "hono";

export const apiKeyAuthMiddleware = async (
  ctx: Context<{ Bindings: CloudflareBindings }>,
  next: Next,
) => {
  try {
    const authorizationHeader = ctx.req.header("Authorization");

    if (!authorizationHeader) {
      return ctx.json({ error: "認証ヘッダーが必要です" }, 401);
    }
    const bearerTokenPrefix = "Bearer ";
    if (!authorizationHeader.startsWith(bearerTokenPrefix)) {
      return ctx.json(
        { error: "認証形式が無効です。形式: Bearer <token>" },
        401,
      );
    }

    const clientToken = authorizationHeader.substring(bearerTokenPrefix.length);

    if (!clientToken) {
      return ctx.json({ error: "トークンが必要です" }, 401);
    }

    const serverApiKey = ctx.env.SECRET_KEY;

    if (!serverApiKey) {
      console.error("SECRET_KEY環境変数が設定されていません");
      return ctx.json({ error: "サーバー設定エラー" }, 500);
    }
    
    if (clientToken !== serverApiKey) {
      return ctx.json({ error: "無効なトークンです" }, 401);
    }

    await next();
  } catch (error) {
    console.error("APIキー認証ミドルウェアエラー:", error);
    return ctx.json({ error: "認証に失敗しました" }, 500);
  }
};

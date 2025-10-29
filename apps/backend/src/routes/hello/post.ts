import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import type { Variables } from "../../types";

const HelloRequestSchema = z
  .object({
    text: z.string().trim().min(1, "テキストが必要です").max(250, "テキストが長すぎます").openapi({
      example: "こんにちは",
      description: "ユーザーが入力したテキスト",
    }),
  })
  .openapi("EchoRequest");

// 成功レスポンスのスキーマ
const HelloResponseSchema = z
  .object({
    message: z.string().openapi({
      example: "あなたはこんにちはと言いましたよ",
      description: "エコーされたメッセージ",
    }),
  })
  .openapi("EchoResponse");

// エラーレスポンスのスキーマ
const ErrorResponseSchema = z
  .object({
    error: z.string().openapi({
      example: "テキストが無効です",
      description: "エラーメッセージ",
    }),
  })
  .openapi("EchoErrorResponse");

const echoRouteSchema = createRoute({
  method: "post",
  path: "/api/v1/secure/hello",
  request: {
    body: {
      content: {
        "application/json": {
          schema: HelloRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: HelloResponseSchema,
        },
      },
      description: "エコー成功",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "不正なリクエスト（バリデーションエラー）",
    },
  },
});

const app = new OpenAPIHono<{
  Bindings: CloudflareBindings;
  Variables: Variables;
}>();

export const helloRouteHandler = app.openapi(
  echoRouteSchema,
  async (ctx) => {
    try {
      const { text } = ctx.req.valid("json");
      const userId = ctx.get("userId");
      return ctx.json(
        {
          message: `あなたは${text}と言いましたよ。\n ユーザーID: ${userId}`,
        },
        200
      );
    } catch (error) {
      console.error("Echo error:", error);
      return ctx.json(
        {
          error: "テキストの処理中にエラーが発生しました",
        },
        400
      );
    }
  },
);


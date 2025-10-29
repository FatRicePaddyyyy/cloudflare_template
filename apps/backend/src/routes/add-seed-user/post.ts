import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { auth } from "../../lib/better-auth";

const CreateSeedUserRequestSchema = z
  .object({
    email: z.string().email().openapi({
      example: "admin@example.com",
      description: "メールアドレス",
    }),
    name: z.string().trim().min(1, "名前が必要です").openapi({
      example: "管理者太郎",
      description: "名前",
    }),
    password: z.string().trim().min(1, "パスワードが必要です").openapi({
      example: "admin123",
      description: "パスワード",
    }),
  })
  .openapi("CreateSeedUserRequest");

// 成功レスポンスのスキーマ
const SuccessResponseSchema = z
  .object({
    success: z.boolean().openapi({
      example: true,
      description: "成功フラグ",
    }),
    user: z
      .object({
        id: z.string().openapi({
          example: "user_123456789",
          description: "ユーザーID",
        }),
        email: z.string().email().openapi({
          example: "admin@example.com",
          description: "メールアドレス",
        }),
        name: z.string().openapi({
          example: "管理者太郎",
          description: "名前",
        }),
        createdAt: z.string().openapi({
          example: "2024-01-01T00:00:00Z",
          description: "作成日時",
        }),
      })
      .openapi({
        description: "作成されたユーザー情報",
      }),
  })
  .openapi("CreateSeedUserSuccessResponse");

// エラーレスポンスのスキーマ
const ErrorResponseSchema = z
  .object({
    success: z.boolean().openapi({
      example: false,
      description: "成功フラグ",
    }),
    error: z.string().openapi({
      example: "ユーザーが既に存在します",
      description: "エラーメッセージ",
    }),
  })
  .openapi("CreateSeedUserErrorResponse");

const createSeedUserRouteSchema = createRoute({
  method: "post",
  path: "/api/v1/secret/create-seed-user",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateSeedUserRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: SuccessResponseSchema,
        },
      },
      description: "ユーザー作成成功",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "不正なリクエスト（バリデーションエラー）",
    },
    409: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "ユーザー重複（既に存在するメールアドレス）",
    },
    500: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "サーバーエラー",
    },
  },
});

const app = new OpenAPIHono<{
  Bindings: CloudflareBindings;
}>();


export const createSeedUserRouteHandler = app.openapi(
  createSeedUserRouteSchema,
  async (ctx) => {
    try {
      const { email, name, password } = ctx.req.valid("json");
      
      const result = await auth(ctx.env).api.createUser({
        body: {
          email: email,
          name: name,
          password: password,
        },
      });

      if (!result || !result.user) {
        return ctx.json(
          {
            success: false,
            error: "ユーザーの作成に失敗しました",
          },
          500
        );
      }

      return ctx.json(
        {
          success: true,
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            createdAt: result.user.createdAt?.toISOString() || new Date().toISOString(),
          },
        },
        200
      );
    } catch (error: unknown) {
      console.error("Create seed user error:", error);

      if (error && typeof error === "object" && "message" in error) {
        const errorMessage = error.message as string;
        
        // Better Authのエラーメッセージに基づいて適切なステータスコードを返す
        if (errorMessage.toLowerCase().includes("duplicate") || errorMessage.toLowerCase().includes("already exists") || errorMessage.toLowerCase().includes("重複")) {
          return ctx.json(
            {
              success: false,
              error: "このメールアドレスは既に使用されています",
            },
            409
          );
        }

        if (errorMessage.toLowerCase().includes("validation") || errorMessage.toLowerCase().includes("invalid")) {
          return ctx.json(
            {
              success: false,
              error: "入力データが無効です",
            },
            400
          );
        }
      }

      return ctx.json(
        {
          success: false,
          error: "ユーザーの作成中にエラーが発生しました",
        },
        500
      );
    }
  },
);

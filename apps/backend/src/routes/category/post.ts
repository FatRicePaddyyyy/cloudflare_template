import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import type { Variables } from "../../types";
import { ProductRepository } from "./repository";

const CreateProductRequestSchema = z
  .object({
    category: z
      .object({
        name: z
          .string()
          .trim()
          .min(1, "カテゴリ名が必要です")
          .max(120, "カテゴリ名が長すぎます")
          .openapi({
            example: "家電",
            description: "作成するカテゴリ名",
          }),
      })
      .openapi({
        description: "作成対象のカテゴリ",
      }),
    products: z
      .array(
        z
          .object({
            name: z
              .string()
              .trim()
              .min(1, "プロダクト名が必要です")
              .max(120, "プロダクト名が長すぎます")
              .openapi({
                example: "スマートスピーカー",
                description: "作成するプロダクト名",
              }),
          })
          .openapi({
            description: "作成するプロダクト",
          }),
      )
      .min(1, "少なくとも1件のプロダクトが必要です")
      .openapi({
        description: "作成するプロダクトの配列",
      }),
  })
  .openapi("CreateProductRequest");

const CreatedCategorySchema = z
  .object({
    id: z.string().openapi({
      example: "cat_123456",
      description: "作成されたカテゴリID",
    }),
    name: z.string().openapi({
      example: "家電",
      description: "作成されたカテゴリ名",
    }),
  })
  .openapi("CreatedCategory");

const CreatedProductSchema = z
  .object({
    id: z.string().openapi({
      example: "prod_123456",
      description: "作成されたプロダクトID",
    }),
    name: z.string().openapi({
      example: "スマートスピーカー",
      description: "作成されたプロダクト名",
    }),
    categoryId: z.string().openapi({
      example: "cat_123456",
      description: "紐付けられたカテゴリID",
    }),
  })
  .openapi("CreatedProduct");

const CreateProductSuccessResponseSchema = z
  .object({
    success: z.literal(true).openapi({
      description: "プロダクト作成が成功したことを示します",
    }),
    data: z
      .object({
        category: CreatedCategorySchema,
        products: z.array(CreatedProductSchema),
      })
      .openapi({
        description: "作成されたカテゴリとプロダクト情報",
      }),
    error: z.null(),
  })
  .openapi("CreateProductSuccessResponse");

const CreateProductErrorResponseSchema = z
  .object({
    success: z.literal(false).openapi({
      description: "プロダクト作成が失敗したことを示します",
    }),
    data: z.null(),
    error: z.string().openapi({
      example: "プロダクトの作成に失敗しました",
      description: "エラーメッセージ",
    }),
  })
  .openapi("CreateProductErrorResponse");

const createProductRouteSchema = createRoute({
  method: "post",
  path: "/api/v1/secret/category",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateProductRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: CreateProductSuccessResponseSchema,
        },
      },
      description: "カテゴリとプロダクトの作成に成功しました",
    },
    400: {
      content: {
        "application/json": {
          schema: CreateProductErrorResponseSchema,
        },
      },
      description: "不正なリクエスト（バリデーションエラー）",
    },
    500: {
      content: {
        "application/json": {
          schema: CreateProductErrorResponseSchema,
        },
      },
      description: "サーバーでエラーが発生しました",
    },
  },
});

const app = new OpenAPIHono<{
  Bindings: CloudflareBindings;
  Variables: Variables;
}>();


export const createCategoryRouteHandler = app.openapi(
  createProductRouteSchema,
  async (ctx) => {
    try {
      const payload = ctx.req.valid("json");

      const result = await ProductRepository.createCategoryAndProduct(
        payload,
        ctx.env,
      );

      if (!result.success || !result.data) {
        return ctx.json(
          {
            success: false,
            data: null,
            error: result.error ?? "プロダクトの作成に失敗しました",
          },
          500,
        );
      }

      return ctx.json(result, 201);
    } catch (error) {
      console.error("Create product error:", error);
      return ctx.json(
        {
          success: false,
          data: null,
          error: "プロダクトの作成中にエラーが発生しました",
        },
        500,
      );
    }
  },
);

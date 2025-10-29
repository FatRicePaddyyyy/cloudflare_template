import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import type { Variables } from "../../types";
import { ProductRepository } from "./repository";

const CategorySchema = z
  .object({
    id: z.string().openapi({
      example: "cat_123456",
      description: "カテゴリID",
    }),
    name: z.string().openapi({
      example: "家電",
      description: "カテゴリ名",
    }),
    products: z.array(
      z.object({
        id: z.string().openapi({
          example: "prod_123456",
          description: "プロダクトID",
        }),
        name: z.string().openapi({
          example: "スマートスピーカー",
          description: "プロダクト名",
        }),
        categoryId: z.string().openapi({
          example: "cat_123456",
          description: "紐付けられたカテゴリID",
        }),
      })
    ).openapi({
      description: "カテゴリに属するプロダクトの配列",
    }),
  })
  .openapi("Category");

const GetAllCategoriesAndProductsSuccessResponseSchema = z
  .object({
    success: z.literal(true).openapi({
      description: "カテゴリ・プロダクト取得が成功したことを示します",
    }),
    data: z
      .object({
        categories: z.array(CategorySchema),
      })
      .openapi({
        description: "取得されたカテゴリとプロダクト情報",
      }),
    error: z.null(),
  })
  .openapi("GetAllCategoriesAndProductsSuccessResponse");

const GetAllCategoriesAndProductsErrorResponseSchema = z
  .object({
    success: z.literal(false).openapi({
      description: "カテゴリ・プロダクト取得が失敗したことを示します",
    }),
    data: z.null(),
    error: z.string().openapi({
      example: "カテゴリ・プロダクトの取得に失敗しました",
      description: "エラーメッセージ",
    }),
  })
  .openapi("GetAllCategoriesAndProductsErrorResponse");

const getAllCategoriesAndProductsRouteSchema = createRoute({
  method: "get",
  path: "/api/v1/secure/category",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: GetAllCategoriesAndProductsSuccessResponseSchema,
        },
      },
      description: "カテゴリとプロダクトの取得に成功しました",
    },
    500: {
      content: {
        "application/json": {
          schema: GetAllCategoriesAndProductsErrorResponseSchema,
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

export const getAllCategoriesAndProductsRouteHandler = app.openapi(
  getAllCategoriesAndProductsRouteSchema,
  async (ctx) => {
    try {
      const result = await ProductRepository.getAllCategoriesAndProducts(
        ctx.env,
      );

      if (!result.success || !result.data) {
        return ctx.json(
          {
            success: false,
            data: null,
            error: result.error ?? "カテゴリ・プロダクトの取得に失敗しました",
          },
          500,
        );
      }

      return ctx.json(result, 200);
    } catch (error) {
      console.error("Get all categories and products error:", error);
      return ctx.json(
        {
          success: false,
          data: null,
          error: "カテゴリ・プロダクトの取得中にエラーが発生しました",
        },
        500,
      );
    }
  },
);

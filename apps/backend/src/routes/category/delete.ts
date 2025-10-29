import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import type { Variables } from "../../types";
import { ProductRepository } from "./repository";

const DeleteCategoryParamsSchema = z
  .object({
    categoryId: z
      .string()
      .trim()
      .min(1, "カテゴリIDが必要です")
      .openapi({
        example: "cat_123456",
        description: "削除対象のカテゴリID",
      }),
  })
  .openapi("DeleteCategoryParams");

const DeleteProductSuccessResponseSchema = z
  .object({
    success: z.literal(true).openapi({
      description: "削除が成功したことを示します",
    }),
    error: z.null(),
  })
  .openapi("DeleteProductSuccessResponse");

const DeleteProductErrorResponseSchema = z
  .object({
    success: z.literal(false).openapi({
      description: "削除が失敗したことを示します",
    }),
    error: z.string().openapi({
      example: "プロダクトの削除に失敗しました",
      description: "エラーメッセージ",
    }),
  })
  .openapi("DeleteProductErrorResponse");

const deleteCategoryRouteSchema = createRoute({
  method: "delete",
  path: "/api/v1/secure/category/{categoryId}",
  request: {
    params: DeleteCategoryParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: DeleteProductSuccessResponseSchema,
        },
      },
      description: "カテゴリの削除に成功しました",
    },
    404: {
      content: {
        "application/json": {
          schema: DeleteProductErrorResponseSchema,
        },
      },
      description: "削除対象のカテゴリが見つかりません",
    },
    500: {
      content: {
        "application/json": {
          schema: DeleteProductErrorResponseSchema,
        },
      },
      description: "サーバーエラーが発生しました",
    },
  },
});

const app = new OpenAPIHono<{
  Bindings: CloudflareBindings;
  Variables: Variables;
}>();

export const deleteCategoryRouteHandler = app.openapi(
  deleteCategoryRouteSchema,
  async (ctx) => {
    try {
      const { categoryId } = ctx.req.valid("param");

      const result = await ProductRepository.deleteCategory(
        { categoryId },
        ctx.env,
      );

      if (!result.success) {
        return ctx.json(
          {
            success: false,
            error: "カテゴリの削除に失敗しました",
          },
          500,
        );
      }

      return ctx.json(
        {
          success: true,
          error: null,
        },
        200,
      );
    } catch (error) {
      console.error("Delete category error:", error);
      return ctx.json(
        {
          success: false,
          error: "カテゴリの削除中にエラーが発生しました",
        },
        500,
      );
    }
  },
);

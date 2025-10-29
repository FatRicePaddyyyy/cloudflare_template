import { eq } from "drizzle-orm";
import { products, categories } from "../../lib/schema/general-schema";
import { createDBClient } from "../../lib/db";


export interface CreateCategoryAndProductInput {
  category: {
    name: string;
  };
  products: {
    name: string;
  }[];
}

export type CreateCategoryAndProductResponse = 
  | {
      success: true;
      data: {
        category: {
          id: string;
          name: string;
        };
        products: Array<{
          id: string;
          name: string;
          categoryId: string;
        }>;
      };
      error: null;
    }
  | {
      success: false;
      data: null;
      error: string;
    };


export interface DeleteProductInput {
  productId: string;
}

export interface DeleteCategoryInput {
  categoryId: string;
}

export type GetAllCategoriesAndProductsResponse = 
  | {
      success: true;
      data: {
        categories: Array<{
          id: string;
          name: string;
          products: Array<{
            id: string;
            name: string;
            categoryId: string;
          }>;
        }>;
      };
      error: null;
    }
  | {
      success: false;
      data: null;
      error: string;
    };

export class ProductRepository {

  static async createCategoryAndProduct(input: CreateCategoryAndProductInput, env: CloudflareBindings): Promise<CreateCategoryAndProductResponse> {
    try {
      const db = createDBClient(env);
      
      // カテゴリIDを自動生成
      const categoryId = crypto.randomUUID();
      
      // リレーションを活用してカテゴリとプロダクトを同時に作成
      const batchResponse = await db.batch([
        // カテゴリを作成（リレーション込みで取得）
        db
          .insert(categories)
          .values({
            id: categoryId,
            name: input.category.name,
          })
          .returning({
            id: categories.id,
            name: categories.name,
          }),
        // プロダクトを一括作成
        db
          .insert(products)
          .values(
            input.products.map(product => ({
              name: product.name,
              categoryId: categoryId, // 自動生成されたカテゴリIDを使用
            }))
          )
          .returning({
            id: products.id,
            name: products.name,
            categoryId: products.categoryId,
          }),
      ]);

      const categoryResult = batchResponse[0][0];
      const productsResult = batchResponse[1];


      return {
        success: true,
        data: {
          category: categoryResult,
          products: productsResult,
        },
        error: null,
      };
    } catch (error) {
      console.error("カテゴリ・プロダクト作成エラー:", error);

      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : "不明なエラー",
      };
    }
  }

  static async getAllCategoriesAndProducts(env: CloudflareBindings): Promise<GetAllCategoriesAndProductsResponse> {
    try {
      const db = createDBClient(env);
      
      // バッチ処理でカテゴリとプロダクトを同時に取得
      const batchResponse = await db.batch([
        // すべてのカテゴリを取得
        db
          .select({
            id: categories.id,
            name: categories.name,
          })
          .from(categories),
        // すべてのプロダクトを取得
        db
          .select({
            id: products.id,
            name: products.name,
            categoryId: products.categoryId,
          })
          .from(products),
      ]);

      const allCategories = batchResponse[0];
      const allProducts = batchResponse[1];

      // カテゴリごとにプロダクトをグループ化
      const categoriesWithProducts = allCategories.map(category => ({
        id: category.id,
        name: category.name,
        products: allProducts.filter(product => product.categoryId === category.id),
      }));

      return {
        success: true,
        data: {
          categories: categoriesWithProducts,
        },
        error: null,
      };
    } catch (error) {
      console.error("カテゴリ・プロダクト取得エラー:", error);

      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : "不明なエラー",
      };
    }
  }

  static async deleteProduct(input: DeleteProductInput, env: CloudflareBindings) {
    try {
      const db = createDBClient(env);
      // バッチ処理でプロダクトの削除を実行
      await db.batch([
        // 削除対象のプロダクトを取得（削除前の確認用）
        db
          .select({
            id: products.id,
            name: products.name,
            categoryId: products.categoryId,
          })
          .from(products)
          .where(eq(products.id, input.productId)),
        // プロダクトを削除
        db.delete(products).where(eq(products.id, input.productId)),
      ]);

      return { success: true }
    } catch (error) {
      console.error("プロダクト削除エラー:", error);
      return { success: false }
    }
  }

  static async deleteCategory(input: DeleteCategoryInput, env: CloudflareBindings) {
    try {
      const db = createDBClient(env);
      
      // バッチ処理でカテゴリとそのカテゴリに属する全プロダクトを削除
      await db.batch([
        // カテゴリに属する全プロダクトを削除
        db.delete(products).where(eq(products.categoryId, input.categoryId)),
        // カテゴリを削除
        db.delete(categories).where(eq(categories.id, input.categoryId)),
      ]);

      return { success: true }
    } catch (error) {
      console.error("カテゴリ削除エラー:", error);
      return { success: false }
    }
  }
}

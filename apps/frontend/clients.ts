import { hc } from "hono/client";
import type { InferResponseType, InferRequestType } from "hono/client";
import type { ApiType } from "backend";

const client = (baseUrl: string) => hc<ApiType>(
  baseUrl,
  {
    init: {
      credentials: "include",
    },
  },
).api.v1;

// api/v1/secure/helloの post を呼び出す関数を作成
export const $getHello = client(process.env.NEXT_PUBLIC_BACKEND_URL!).secure.hello.$post;
export type GetHelloRequest = InferRequestType<typeof $getHello>;
export type GetHelloResponse = InferResponseType<typeof $getHello>;

// api/v1/secure/products の get を呼び出す関数を作成
export const $getAllCategoriesAndProducts = client(process.env.NEXT_PUBLIC_BACKEND_URL!).secure.category.$get;
export type getAllCategoriesAndProductsResponse = InferResponseType<typeof $getAllCategoriesAndProducts>;

// api/v1/secure/products の delete  を呼び出す関数を作成
export const $deleteCategory = client(process.env.NEXT_PUBLIC_BACKEND_URL!).secure.category[":categoryId"].$delete;
export type DeleteCategoryRequest = InferRequestType<typeof $deleteCategory>;
export type DeleteCategoryResponse = InferResponseType<typeof $deleteCategory>;
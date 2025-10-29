"use client";

import { useSession, signOut } from "../../../auth-client";
import { useRouter } from "next/navigation";
import { $getHello, type GetHelloRequest, type GetHelloResponse, $getAllCategoriesAndProducts, type getAllCategoriesAndProductsResponse, $deleteCategory, type DeleteCategoryRequest } from "../../../clients";
import { useState, useEffect } from "react";

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [helloResult, setHelloResult] = useState<GetHelloResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("Hello");
  
  // プロダクト関連の状態
  const [productsData, setProductsData] = useState<getAllCategoriesAndProductsResponse | null>(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // プロダクト取得
  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    setProductsError(null);
    
    try {
      const response = await $getAllCategoriesAndProducts();
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "プロダクトの取得に失敗しました");
      }
      
      const data: getAllCategoriesAndProductsResponse = await response.json();
      setProductsData(data);
    } catch (err) {
      setProductsError(err instanceof Error ? err.message : "不明なエラーが発生しました");
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // カテゴリを削除（カテゴリ内の全プロダクトも一緒に削除）
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      setProductsError(null);
      setDeletingProductId("bulk:" + categoryId);

      const requestData: DeleteCategoryRequest = {
        param: { categoryId: categoryId },
      };
      
      const response = await $deleteCategory(requestData);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "カテゴリの削除に失敗しました");
      }

      // 削除成功後、一覧を更新
      await fetchProducts();
    } catch (err) {
      setProductsError(err instanceof Error ? err.message : "不明なエラーが発生しました");
    } finally {
      setDeletingProductId(null);
    }
  };

  // コンポーネントマウント時にプロダクトを取得
  useEffect(() => {
    if (session?.user) {
      fetchProducts();
    }
  }, [session?.user]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("ログアウトエラー:", error);
    }
  };

  const handleHello = async () => {
    setIsLoading(true);
    setError(null);
    setHelloResult(null);
    
    try {
      if (!message.trim()) {
        throw new Error("メッセージを入力してください");
      }
      
      const requestData: GetHelloRequest = {
        json: {
          text: message,
        },
      };
      
      const response = await $getHello(requestData);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "リクエストに失敗しました");
      }
      
      const data: GetHelloResponse = await response.json();
      setHelloResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "不明なエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6 text-black">ダッシュボード</h1>
        
        {session?.user ? (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-green-600 text-lg font-semibold mb-2">
                ログインしています
              </div>
              <p className="text-black">
                ユーザー: {session.user.name || session.user.email}
              </p>
            </div>
            
            
            
            {/* Hello API テスト */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-bold mb-4 text-black">Hello API テスト</h2>
              
              <div className="mb-4">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  メッセージ
                </label>
                <input
                  id="message"
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isLoading}
                  placeholder="メッセージを入力してください"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-black"
                />
              </div>
              
              <button
                onClick={handleHello}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed mb-4"
              >
                {isLoading ? "処理中..." : "Hello API を呼び出す"}
              </button>
              
              {helloResult && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">レスポンス</h3>
                  <pre className="text-left text-sm text-green-700 whitespace-pre-wrap">
                    {JSON.stringify(helloResult, null, 2)}
                  </pre>
                </div>
              )}
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">エラー</h3>
                  <p className="text-left text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-bold mb-4 text-black">ログアウト</h2>
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                ログアウト
              </button>
            </div>

            {/* プロダクト一覧（機能の区切りを明確にする境界線） */}
            <div className="border-t-2 border-gray-300 pt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-black">プロダクト一覧</h2>
                <button
                  onClick={fetchProducts}
                  disabled={isLoadingProducts}
                  className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoadingProducts ? "読み込み中..." : "更新"}
                </button>
              </div>
              
              {isLoadingProducts && !productsData && (
                <div className="text-center py-4">
                  <div className="text-gray-600">プロダクトを読み込み中...</div>
                </div>
              )}
              
              {productsError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">エラー</h3>
                  <p className="text-left text-sm text-red-700">{productsError}</p>
                </div>
              )}
              
              {productsData?.success && productsData.data?.categories && (
                <div className="space-y-4">
                  {productsData.data.categories.length === 0 ? (
                    <div className="text-center py-8 text-gray-600">
                      プロダクトがありません
                    </div>
                  ) : (
                    productsData.data.categories.map((category) => (
                      <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-lg font-semibold text-black">
                            {category.name}
                          </h3>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            disabled={deletingProductId === `bulk:${category.id}`}
                            className="bg-red-600 text-white py-1 px-3 rounded text-xs hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            {deletingProductId === `bulk:${category.id}` ? "削除中..." : "カテゴリを削除"}
                          </button>
                        </div>
                        {category.products.length === 0 ? (
                          <p className="text-gray-500 text-sm">このカテゴリにはプロダクトがありません</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {category.products.map((product) => (
                              <div key={product.id} className="bg-gray-50 rounded-md p-3 flex justify-between items-center">
                                <span className="text-black text-sm">{product.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="text-red-600 text-lg font-semibold mb-2">
              ログインしていません
            </div>
            <p className="text-black">
              ログインページに移動してください
            </p>
            <button
              onClick={() => router.push("/login")}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              ログインページへ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

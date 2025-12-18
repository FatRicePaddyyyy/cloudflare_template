- このリポジトリは[こちらのzennの記事](https://zenn.dev/fatricepaddyy/books/cf_sample_app)に対応するものです。

# セットアップ方法
1. ```apps/backend/.env```を作成。
```bash
BETTER_AUTH_SECRET=
SECRET_KEY=
```
2. ```apps/frontend/.env```を作成。
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8787
```
3. 以下のコマンドを実行し、シードユーザーの作成
```bash
curl -X POST "http://localhost:8787/api/v1/secret/create-seed-user" \
  -H "Authorization: Bearer <設定したSECRET_KEYの値>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "name": "管理者太郎",
    "password": "admin123"
  }'
```
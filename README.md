- このリポジトリは[こちらのzennの記事](https://zenn.dev/fatricepaddyy/books/cf_sample_app)に対応するものです
- Cloudflare×Typescript でのWebページの認証付きテンプレートです

# アーキテクチャー


```bash

├── apps
│   ├── backend
│   │   ├── drizzl/ # マイグレーションファイルやスナップショット
│   │   ├── src/
│   │   │   ├── index.ts # エンドポイントのエントリーポイント
│   │   │   ├── lib/
│   │   │   ├── middlewares/
│   │   │   ├── routes/ # エンドポイントの定義を書く
│   │   ├── tsconfig.json
│   │   ├── worker-configuration.d.ts
│   │   └── wrangler.jsonc
│   └── frontend/ # フロントエンド
├── docs
│   ├── architecture.drawio
│   └── architecture.png
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── README.md

```

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
3. プロジェクトルートで以下のコマンドを実行
```bash
pnpm install
```

4. ```apps/backend```, ```apps/frontend```で以下のコマンドを実行
```bash
pnpm run dev
```

5. 以下のコマンドを実行し、シードユーザーの作成
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

# 技術スタック
| 技術 | バージョン | 補足 |
| --- | --- | --- |
| Hono | 4.11.1 | backend / frontend で利用 |
| OpenAPI Hono | `@hono/zod-openapi` 1.1.5 | backend で OpenAPI 定義に利用 |
| Next.js | 15.4.6 | frontend で利用 |
| Better Auth | 1.3.32 | backend / frontend で利用 |
| Drizzle | `drizzle-orm` 0.44.7 / `drizzle-kit` 0.31.5 | backend で利用 |

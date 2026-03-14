# セットアップ方法

## 1. 環境変数を作成

`apps/backend/.env` を作成し、適当な値を設定します。

```bash
BETTER_AUTH_SECRET=
SECRET_KEY=
```

`apps/frontend/.env` を作成します。

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8787
```

## 2. Volta と Node.js をセットアップ

`pnpm install` の前に、以下を実行して Volta と Node.js 24.13.0 を導入します。

```bash
brew install volta
volta setup
volta install node@24.13.0
```

## 3. 依存関係をインストール

プロジェクトルートで以下を実行します。

```bash
pnpm install
```

## 4. ローカル D1 にマイグレーションを適用

`apps/backend` で以下を実行します。

```bash
npx wrangler d1 migrations apply db-local --local
```

## 5. 開発サーバーを起動

`apps/backend` と `apps/frontend` でそれぞれ以下を実行します。

```bash
pnpm run dev
```

## 6. シードユーザーを作成

以下を実行します。

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

## 7. 動作確認

ブラウザで以下にアクセスします。

- Web画面: `http://localhost:3000`
- API ドキュメント: `http://localhost:8787/docs`

Web画面にアクセス後、以下のシードユーザーでログインします。

- email: `admin@example.com`
- password: `admin123`

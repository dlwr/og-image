# og-image

指定 URL のページから Open Graph 画像を取得・プロキシする Cloudflare Worker。

- 本番: https://og-image.yuta25.workers.dev
- `GET /:url` — エンコードした URL のページの og:image を `{ "ogImage": ... }` で返す
- `GET /image.jpg?url=` — og:image を `image/jpeg` としてプロキシする（CORS `*`）。og:image が無ければ `null`
- `GET /` — 使い方

## 構成

- `src/index.ts` — Worker 本体。フレームワークは使わず、HTML のパースは `HTMLRewriter`
- `test/` — `@cloudflare/vitest-plugin` で Workers ランタイム上で実行。外部への fetch は `@msw/cloudflare` でモック

## コマンド

```bash
pnpm install
pnpm test          # vitest
pnpm dev           # wrangler dev
pnpm deploy        # wrangler deploy
pnpm cf-typegen    # wrangler.jsonc 変更後に worker-configuration.d.ts を再生成
pnpm exec tsc      # 型チェック
pnpm exec prettier --write src test
```

## 注意

- GitHub 連携の自動デプロイは無い。反映は `pnpm deploy`
- 相対 URL の og:image は絶対 URL に変換していない

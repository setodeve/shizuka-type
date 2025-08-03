# Shizuka Type

Nuxt 3 + TypeScript + Tailwind CSS + Biome を使用したモダンなWebアプリケーション

## 技術スタック

- **Nuxt 3** - Vue.jsベースのフルスタックフレームワーク
- **TypeScript** - 型安全なJavaScript
- **Tailwind CSS** - ユーティリティファーストCSSフレームワーク
- **Biome** - 高速なJavaScript/TypeScriptリンター・フォーマッター
- **pnpm** - 高速なパッケージマネージャー

## セットアップ

依存関係をインストールしてください：

```bash
pnpm install
```

## 開発サーバー

開発サーバーを `http://localhost:3000` で起動：

```bash
pnpm dev
```

## コード品質

### Biome によるコードチェック

```bash
# コードチェック
pnpm lint

# コードチェックと自動修正
pnpm lint:fix

# コードフォーマット
pnpm format

# コードフォーマットと自動修正
pnpm format:fix
```

## ビルド

本番用にアプリケーションをビルド：

```bash
pnpm build
```

本番ビルドをローカルでプレビュー：

```bash
pnpm preview
```

## プロジェクト構造

```
shizuka-type/
├── app/                 # Nuxt 3のアプリケーションディレクトリ
├── components/          # Vueコンポーネント
├── layouts/            # レイアウトコンポーネント
├── pages/              # ページコンポーネント
├── public/             # 静的ファイル
├── biome.json          # Biome設定
├── nuxt.config.ts      # Nuxt設定
├── tailwind.config.ts  # Tailwind CSS設定
└── tsconfig.json       # TypeScript設定
```

## 設定ファイル

### Biome設定 (`biome.json`)
- スペースインデント（2スペース）
- シングルクォート
- セミコロンは必要に応じて
- 未使用変数のエラー
- 型安全性の警告

### Tailwind CSS設定 (`tailwind.config.ts`)
- カスタムプライマリカラー
- Nuxt.jsプロジェクト構造に対応したコンテンツパス

詳細については [Nuxt ドキュメント](https://nuxt.com/docs/getting-started/introduction) を参照してください。

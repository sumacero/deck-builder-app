This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

# Deck Builder App - プロジェクトルール

## 1. プロジェクト概要

- Expo (React Native / TypeScript) で構築する、Slay the Spire 2 にインスパイアされたオリジナルのデッキ構築型ローグライク**ゲーム**。
- 既存ゲームの記録・分析用トラッカーではない（当初の定義は誤りだった）。
- カード・キャラクター・敵はデータ定義を追加するだけで増やせる拡張性を重視する。
- 主な要素: ターン制カードバトル（エナジー・ドロー・ブロック・敵のインテント）、デッキ構築（戦闘報酬でカードを選ぶ）、マップ進行、レリック。

## 2. 技術スタック & 開発方針

- Expo SDK 57 / React Native / TypeScript（`strict: true`）
- 将来の PHP/Laravel API・AWS インフラ連携を前提に設計する。
  - ドメインの型（カード、クラス、レリック、ラン、バトルログ等）は UI から独立させ、API のリクエスト/レスポンスにそのまま対応付けられる形にする。
  - ID は文字列で扱い、サーバー側の採番に置き換えられるようにする。
  - データの取得・保存処理はコンポーネントに直接書かず、後からローカル保存と API 呼び出しを差し替えられる層（hooks / services 等）に分離する。
- UI スタイル: テイルズシリーズとファイアーエムブレムの中間のような、中学生くらいが好むアニメ調の王道ファンタジー RPG（2026-10-04 に ダーク → ポップ → この方向に変更）。
  - 土台は深い紺（#141A2E / #1E2742 系統）、アクセントは紋章のような落ち着いた金（#E2B84A）。
  - イラストはアニメ調のセル塗り + 絵画的な背景、劇的な光。名前はかっこいいファンタジー風（亡霊・呪術師などは可）。血や残酷な表現は避ける。
  - 色・余白などのデザイン値はテーマ定数にまとめ、コンポーネント内にハードコードしない。
- モバイルファースト。iOS / Android の両方で動作する実装にする。

## 3. AI アシスタントへの行動ルール

- 提案や設計では、プレイヤー体験を最優先の判断軸にする（背景は `docs/KNOWLEDGE.md` の「開発背景」を参照）。
- 勝手に新しい npm パッケージをインストールしない。必要な場合はパッケージ名・理由・代替案を提案するだけにとどめ、承認を得てから `npx expo install <package>` で追加する。
- コマンドは基本的に自動で実行してよい。ただし、取り消せない操作や外部に影響する操作は、実行前にエンジニアの承認を得る:
  - パッケージの追加・削除・バージョン変更
  - ファイルの一括削除（`rm -rf` 等）、プロジェクト外のファイル操作
  - `git push`、`git reset --hard`、`git push --force` など履歴を失う・外部に出る git 操作
  - `sudo` を使うコマンド
  - AWS へのデプロイ、外部 API・本番 DB の操作など外部サービスに作用するもの
- 区切りのよいところでローカルの `git commit` を作り、いつでも戻せる状態を保つ（コミットは承認不要、プッシュは要承認）。
- 型定義（interface / type）を重視する。
  - `any` を使わない。不明な値は `unknown` で受けて絞り込む。
  - コンポーネントの props には必ず型を付ける。
  - 選択肢が決まっている値はユニオン型で表現する。
- モジュール化された安全なコードを書く。
  - 1 つのコンポーネントは 1 つの責務に保ち、肥大化したら分割する。
  - 状態の更新はイミュータブルに行う。
- コンポーネントを追加・修正したら、`npx tsc --noEmit`（型チェック）と `npx expo lint` がエラーなしで通ることを確認してから完了とする。

## 4. エンジニアの学習戦略

このプロジェクトはオーナーのスキルアップ（React Native/Expo・TypeScript・PHP/Laravel・AWS）も目的にしている。オーナーは Web/PHP の経験は豊富だが、スマホアプリ開発は未経験。

- **型安全**: ドメインモデル（Card, Deck, Relic, RunLog 等）を最初に型で定義し、UI やロジックはその型から組み立てる。型で防げるバグは型で防ぐ。
- **アーキテクチャ意識**: 層を分ける（ドメイン型 / 純粋関数のロジック / Custom Hooks による状態管理 / UI コンポーネント）。各層は Phase 2 の Laravel API（Clean Architecture）と対応付けられるようにする。
- **TDD 的アプローチ**: ロジックは副作用のない純粋関数として切り出し、テストしやすくする。テストを書く場合は、期待する振る舞いを先にテストで表してから実装する。テスト基盤が未導入の間は、型チェックとリントで品質を担保する。
- **説明のしかた**: コードを提案するときは「なぜこの設計にしたか」を短く添える。React / React Native / モバイル特有の概念は、PHP / Laravel / Web の知識に置き換えて説明する（例: Custom Hooks ≒ サービスクラス、型定義 ≒ DTO）。

## 5. ナレッジの記録

- 作業を始める前に `docs/KNOWLEDGE.md` を読み、これまでの決定事項・環境・未解決の課題を把握する。
- 重要な決定、判明した環境の事実、実装状況の変化、新しい課題が出たら、その都度 `docs/KNOWLEDGE.md` を更新する。

---

# Expo 共通ルール

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- 現在は Expo Router 未導入で、エントリは `index.ts` → `App.tsx`。画面が増えた段階で Expo Router へ移行する（導入はパッケージ追加ルールに従い要承認）。
- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

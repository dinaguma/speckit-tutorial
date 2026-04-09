# [PROJECT_NAME] Constitution
<!-- 例: Spec 憲章、TaskFlow 憲章 など -->

## 基本原則

### [PRINCIPLE_1_NAME]
<!-- 例: I. ライブラリ優先 -->
[PRINCIPLE_1_DESCRIPTION]
<!-- 例: すべての機能は独立したライブラリとして開始すること。ライブラリは自己完結型で、単体でテスト可能かつドキュメント化されている必要がある。明確な目的が必要であり、組織上の都合だけで作られるライブラリは禁止する -->

### [PRINCIPLE_2_NAME]
<!-- 例: II. CLI インターフェース -->
[PRINCIPLE_2_DESCRIPTION]
<!-- 例: すべてのライブラリは CLI を通じて機能を公開すること。テキスト入出力プロトコル: stdin/引数 → stdout、エラー → stderr。JSON および人間可読形式の両方をサポートする -->

### [PRINCIPLE_3_NAME]
<!-- 例: III. テストファースト（絶対遵守） -->
[PRINCIPLE_3_DESCRIPTION]
<!-- 例: TDD を必須とする: テスト作成 → ユーザー承認 → テスト失敗 → 実装の順で進める。Red-Green-Refactor サイクルを厳格に適用する -->

### [PRINCIPLE_4_NAME]
<!-- 例: IV. 統合テスト -->
[PRINCIPLE_4_DESCRIPTION]
<!-- 例: 統合テストが必要な重点領域: 新規ライブラリの契約テスト、契約変更、サービス間通信、共有スキーマ -->

### [PRINCIPLE_5_NAME]
<!-- 例: V. 可観測性、VI. バージョニングと破壊的変更、VII. シンプルさ -->
[PRINCIPLE_5_DESCRIPTION]
<!-- 例: テキスト I/O によりデバッグ性を確保する。構造化ログを必須とする。または: MAJOR.MINOR.BUILD 形式を採用する。または: シンプルに始める（YAGNI 原則） -->

## [SECTION_2_NAME]
<!-- 例: 追加制約、セキュリティ要件、パフォーマンス基準 など -->
[SECTION_2_CONTENT]
<!-- 例: 技術スタック要件、コンプライアンス基準、デプロイポリシー など -->

## [SECTION_3_NAME]
<!-- 例: 開発ワークフロー、レビュー手順、品質ゲート など -->
[SECTION_3_CONTENT]
<!-- 例: コードレビュー要件、テストゲート、デプロイ承認プロセス など -->

## ガバナンス
<!-- 例: 本憲章は他のすべての慣行に優先する。改訂にはドキュメント、承認、移行計画が必要 -->
[GOVERNANCE_RULES]
<!-- 例: すべての PR/レビューで準拠を確認すること。複雑性には正当な理由が必要。[GUIDANCE_FILE] を実行時の開発指針として使用する -->

**バージョン**: [CONSTITUTION_VERSION] | **制定日**: [RATIFICATION_DATE] | **最終改訂日**: [LAST_AMENDED_DATE]
<!-- 例: Version: 2.1.1 | Ratified: 2025-06-13 | Last Amended: 2025-07-16 -->

# Feature Specification: ブログ記事管理API

**Feature Branch**: `di/task_study_tutorial_no2`  
**Created**: 2026-04-09  
**Status**: Draft  
**Input**: User description: "ブログ記事管理APIの仕様を作成してください"

## Clarifications

### Session 2026-04-12

- Q: 記事の下書き(draft)は誰が閲覧できるか? → A: 管理者と作成者のみ閲覧可
- Q: 認証が必要なエンドポイントと不要なエンドポイントの区別は? → A: 現状維持（GETは不要、POST/PUT/DELETEは必須）
- Q: エラーレスポンスのフォーマットは統一するか? → A: 現状の共通形式を維持
- Q: ページネーションのデフォルト値は? → A: page=1, limit=10
- Q: 記事作成時のauthorは自動設定か? → A: リクエストボディから受け取る

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 記事一覧を取得する (Priority: P1)

API利用者として、公開状態や並び順を指定しながら記事一覧を取得したい（未認証時は公開記事のみ、draftは管理者または作成者のみ取得可能）。

**Why this priority**: 記事一覧は閲覧機能の起点であり、最小構成のMVPとして最優先。

**Independent Test**: `GET /api/v1/posts` に対してページネーション、フィルタ、ソートを指定し、期待件数と順序を検証すれば独立して価値を提供できる。

**Acceptance Scenarios**:

1. **Given** 記事が複数登録されている, **When** `GET /api/v1/posts?page=1&limit=10` を実行する, **Then** 200で記事一覧とメタ情報（page/limit/total/totalPages）が返る
2. **Given** draft/publishedが混在している, **When** `GET /api/v1/posts?status=published` を実行する, **Then** publishedのみ返る
3. **Given** 更新日時が異なる記事がある, **When** `GET /api/v1/posts?sort=-updatedAt` を実行する, **Then** updatedAt降順で返る
4. **Given** 未認証利用者が `status=draft` を指定する, **When** `GET /api/v1/posts?status=draft` を実行する, **Then** `403 Forbidden` を返す

---

### User Story 2 - 記事詳細を取得する (Priority: P1)

API利用者として、記事IDを指定して単一記事の詳細を取得したい（draft記事は管理者または作成者のみ閲覧可能）。

**Why this priority**: 一覧と並ぶ基本機能で、個別ページ表示や編集画面表示に必須。

**Independent Test**: 既存IDと未存在IDで `GET /api/v1/posts/:id` を呼び、200と404の挙動を確認する。

**Acceptance Scenarios**:

1. **Given** 有効な記事IDが存在する, **When** `GET /api/v1/posts/:id` を実行する, **Then** 200で対象記事を返す
2. **Given** 指定IDの記事が存在しない, **When** `GET /api/v1/posts/:id` を実行する, **Then** 404で標準エラー形式を返す
3. **Given** draft記事に対して管理者/作成者以外がアクセスする, **When** `GET /api/v1/posts/:id` を実行する, **Then** `403 Forbidden` を返す

---

### User Story 3 - 記事を作成・更新・削除する (Priority: P2)

認証済み利用者として、記事を作成し、更新し、不要になった記事を削除したい。

**Why this priority**: 管理機能として重要だが、閲覧機能に比べると後続優先。

**Independent Test**: JWT付きで `POST`/`PUT`/`DELETE` を順に実行し、201/200/204と不正入力時400、未認証時401を確認する。

**Acceptance Scenarios**:

1. **Given** 有効なJWTと正しい入力がある, **When** `POST /api/v1/posts` を実行する, **Then** 201で作成済み記事を返す
2. **Given** 有効なJWTと更新対象IDがある, **When** `PUT /api/v1/posts/:id` を実行する, **Then** 200で更新済み記事を返す
3. **Given** 有効なJWTと削除対象IDがある, **When** `DELETE /api/v1/posts/:id` を実行する, **Then** 204で本文なしを返す

---

### Edge Cases

- `page < 1` や `limit < 1`、`limit > 100` の場合は `400 Bad Request` を返す
- `status` が `draft`/`published` 以外の場合は `400 Bad Request` を返す
- `sort` が許可カラム（`createdAt`/`updatedAt`/`title`）以外の場合は `400 Bad Request` を返す
- UUID形式でない `id` 指定時は `400 Bad Request` を返す
- `title` が空文字、201文字以上、`content` が空の場合は `400 Bad Request` を返す
- JWTなし、無効JWT、期限切れJWTは `401 Unauthorized` を返す
- 更新・削除対象が未存在の場合は `404 Not Found` を返す
- draft記事に対して管理者/作成者以外が閲覧しようとした場合は `403 Forbidden` を返す

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: システムは `GET /api/v1/posts` で記事一覧取得を提供しなければならない
- **FR-002**: システムは `GET /api/v1/posts/:id` で記事詳細取得を提供しなければならない
- **FR-003**: システムは `POST /api/v1/posts` でJWT認証済みユーザーの記事作成を提供しなければならない
- **FR-004**: システムは `PUT /api/v1/posts/:id` でJWT認証済みユーザーの記事更新を提供しなければならない
- **FR-005**: システムは `DELETE /api/v1/posts/:id` でJWT認証済みユーザーの記事削除を提供しなければならない
- **FR-006**: システムは一覧APIで `page`、`limit`、`status`、`sort` クエリパラメータを受け付けなければならない
- **FR-007**: システムは入力値バリデーションを実施し、失敗時は `400` と標準エラー形式を返さなければならない
- **FR-008**: システムは認証必須APIでJWTを検証し、失敗時は `401` を返さなければならない
- **FR-009**: システムは未存在リソースアクセス時に `404` を返さなければならない
- **FR-010**: システムは成功時に適切なHTTPステータスコード（200/201/204）を返さなければならない
- **FR-011**: システムは全エンドポイントをOpenAPI（Swagger）に記述し、実装と同期しなければならない
- **FR-012**: システムは内部エラー時に `500` を返し、秘匿情報をレスポンスへ含めてはならない
- **FR-013**: システムは未認証で `GET` 系エンドポイントを呼び出した場合、`published` 記事のみ返却しなければならない
- **FR-014**: システムは `draft` 記事の閲覧を管理者または作成者のみに制限し、権限不足時は `403` を返さなければならない

### API Endpoints

#### 1) 記事一覧取得
- **Method / Path**: `GET /api/v1/posts`
- **Auth**: 任意（未認証は `published` のみ閲覧可。`status=draft` は管理者または作成者のみ）
- **Query Parameters**:
  - `page` (integer, optional, default: 1, min: 1)
  - `limit` (integer, optional, default: 10, min: 1, max: 100)
  - `status` (string, optional, enum: `draft` | `published`, `draft` 指定時は権限制御を適用)
  - `sort` (string, optional, default: `-createdAt`, 許可: `createdAt` / `updatedAt` / `title`, `-` 接頭辞で降順)
- **Success Response**: `200 OK`
- **Error Responses**: `400`, `403`, `500`

#### 2) 記事詳細取得
- **Method / Path**: `GET /api/v1/posts/:id`
- **Auth**: 任意（対象が `draft` の場合、管理者または作成者のみ）
- **Path Parameters**:
  - `id` (UUID, required)
- **Success Response**: `200 OK`
- **Error Responses**: `400`, `403`, `404`, `500`

#### 3) 記事作成
- **Method / Path**: `POST /api/v1/posts`
- **Auth**: 必須（JWT）
- **Request Body**:
  - `title` (string, required, 1-200文字)
  - `content` (string, required)
  - `author` (string, required)
  - `status` (string, optional, enum: `draft` | `published`, default: `draft`)
- **Success Response**: `201 Created`
- **Error Responses**: `400`, `401`, `500`

#### 4) 記事更新
- **Method / Path**: `PUT /api/v1/posts/:id`
- **Auth**: 必須（JWT）
- **Path Parameters**:
  - `id` (UUID, required)
- **Request Body**:
  - `title` (string, optional, 1-200文字)
  - `content` (string, optional)
  - `author` (string, optional)
  - `status` (string, optional, enum: `draft` | `published`)
- **Success Response**: `200 OK`
- **Error Responses**: `400`, `401`, `404`, `500`

#### 5) 記事削除
- **Method / Path**: `DELETE /api/v1/posts/:id`
- **Auth**: 必須（JWT）
- **Path Parameters**:
  - `id` (UUID, required)
- **Success Response**: `204 No Content`
- **Error Responses**: `400`, `401`, `404`, `500`

### Response Format

#### Success
```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

#### Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "リクエストが不正です",
    "details": []
  }
}
```

### Key Entities *(include if feature involves data)*

- **Post**: ブログ記事を表す主要エンティティ
  - `id` (UUID)
  - `title` (string, required, 1-200)
  - `content` (string, required)
  - `author` (string, required)
  - `authorUserId` (UUID, required, server-generated, 権限制御に使用)
  - `status` (enum: `draft` | `published`)
  - `createdAt` (datetime, server-generated)
  - `updatedAt` (datetime, server-generated)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 指定5エンドポイントのOpenAPI定義が100%作成され、実装との差分レビューで不一致0件
- **SC-002**: 一覧APIで `page`/`limit`/`status`/`sort` の正常系・異常系テストが全件成功
- **SC-003**: 作成・更新・削除APIで認証あり/なしのテストが全件成功し、未認証は100% `401` を返す
- **SC-004**: 関連テストの行カバレッジ80%以上をCIで継続達成
- **SC-005**: draft記事に対する権限制御テスト（管理者/作成者は成功、それ以外は `403`）が全件成功

## Assumptions

- 本仕様の `author` は表示用文字列としてリクエストボディから受け取り、権限制御は `authorUserId`（サーバー側でJWTから解決）で行う
- 本仕様の削除は物理削除を基本とし、論理削除要件は将来拡張とする
- 開発環境はSQLite、本番環境はPostgreSQLであり、両環境で同等に動作するクエリを優先する
- レスポンスの日時はISO 8601（UTC）で返却する
- OpenAPIはSwagger UIで確認可能な状態を前提とする

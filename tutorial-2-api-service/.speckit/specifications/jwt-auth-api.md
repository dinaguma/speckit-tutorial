# Feature Specification: JWT認証API

**Feature Branch**: `di/task_study_tutorial_no2`  
**Created**: 2026-04-09  
**Status**: Draft  
**Input**: User description: "JWT認証機能の仕様を作成してください"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 新規登録してログインする (Priority: P1)

新規利用者として、アカウントを作成し、その後ログインしてAPIを利用したい。

**Why this priority**: 認証機能の入口であり、他API利用の前提となるため最優先。

**Independent Test**: `POST /api/v1/auth/register` でユーザー作成後、`POST /api/v1/auth/login` でアクセストークンとリフレッシュトークンを取得できることを確認する。

**Acceptance Scenarios**:

1. **Given** 未登録のメールアドレスと有効なパスワードがある, **When** `POST /api/v1/auth/register` を実行する, **Then** 201で登録成功レスポンスを返す
2. **Given** 登録済みユーザーの認証情報が正しい, **When** `POST /api/v1/auth/login` を実行する, **Then** 200で有効期限1時間のJWTアクセストークンと7日間有効なRefresh tokenを返す
3. **Given** 同一メールアドレスが既に登録済み, **When** `POST /api/v1/auth/register` を実行する, **Then** 409を返す

---

### User Story 2 - トークンを更新して継続利用する (Priority: P1)

認証済み利用者として、アクセストークンの期限切れ後も再ログインせずにトークン更新したい。

**Why this priority**: セキュアかつ継続的なセッション維持に必須。

**Independent Test**: `POST /api/v1/auth/refresh` に有効なRefresh tokenを渡し、新しいアクセストークンが返ること、および無効トークンでは401になることを確認する。

**Acceptance Scenarios**:

1. **Given** 有効なRefresh tokenがある, **When** `POST /api/v1/auth/refresh` を実行する, **Then** 200で新しいアクセストークンを返す
2. **Given** 期限切れまたは改ざんされたRefresh tokenがある, **When** `POST /api/v1/auth/refresh` を実行する, **Then** 401を返す

---

### User Story 3 - ログアウトしてセッションを終了する (Priority: P2)

認証済み利用者として、現在のセッションを安全に終了したい。

**Why this priority**: セキュリティ事故防止のため重要だが、登録・ログイン・更新より後順位。

**Independent Test**: `POST /api/v1/auth/logout` 実行後に同Refresh tokenで `POST /api/v1/auth/refresh` が失敗することを確認する。

**Acceptance Scenarios**:

1. **Given** 有効なRefresh tokenを保持している, **When** `POST /api/v1/auth/logout` を実行する, **Then** 200でログアウト成功を返し、該当Refresh tokenを無効化する
2. **Given** 無効なRefresh tokenが送信される, **When** `POST /api/v1/auth/logout` を実行する, **Then** 401を返す

---

### Edge Cases

- 1分間に同一クライアントから6回目以降の認証リクエストは `429 Too Many Requests` を返す
- パスワードが要件未満（長さ不足、許可外形式）の場合は `400 Bad Request` を返す
- ログイン時にメールアドレス未登録、またはパスワード不一致の場合は `401 Unauthorized` を返す
- Refresh tokenの期限切れ（7日超過）は `401 Unauthorized` を返す
- JWTの署名不正、形式不正は `401 Unauthorized` を返す
- サーバー障害時は `500 Internal Server Error` を返し、内部詳細を露出しない

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: システムは `POST /api/v1/auth/register` で新規登録を提供しなければならない
- **FR-002**: システムは `POST /api/v1/auth/login` でログインを提供しなければならない
- **FR-003**: システムは `POST /api/v1/auth/refresh` でトークン更新を提供しなければならない
- **FR-004**: システムは `POST /api/v1/auth/logout` でログアウトを提供しなければならない
- **FR-005**: システムはパスワードを平文保存せず、bcryptでハッシュ化して保存しなければならない
- **FR-006**: システムはJWTアクセストークンの有効期限を1時間に設定しなければならない
- **FR-007**: システムはRefresh tokenの有効期限を7日間に設定しなければならない
- **FR-008**: システムは認証エンドポイントに対し、1分あたり5リクエストのレート制限を適用しなければならない
- **FR-009**: システムは認証失敗時に `401`、バリデーション失敗時に `400`、重複登録時に `409` を返さなければならない
- **FR-010**: システムはレート制限超過時に `429` を返さなければならない
- **FR-011**: システムは全認証エンドポイントをOpenAPI（Swagger）に記述し、実装と同期しなければならない
- **FR-012**: システムはエラーレスポンスで秘密情報（ハッシュ、鍵、内部トレース）を返してはならない

### API Endpoints

#### 1) 新規登録
- **Method / Path**: `POST /api/v1/auth/register`
- **Auth**: 不要
- **Request Body**:
  - `email` (string, required, email形式)
  - `password` (string, required, 最低8文字)
  - `name` (string, optional, 1-100文字)
- **Success Response**: `201 Created`
- **Error Responses**: `400`, `409`, `429`, `500`

#### 2) ログイン
- **Method / Path**: `POST /api/v1/auth/login`
- **Auth**: 不要
- **Request Body**:
  - `email` (string, required, email形式)
  - `password` (string, required)
- **Success Response**: `200 OK`
- **Success Payload**:
  - `accessToken` (JWT, expiresIn: 1h)
  - `refreshToken` (opaque or JWT, expiresIn: 7d)
- **Error Responses**: `400`, `401`, `429`, `500`

#### 3) トークン更新
- **Method / Path**: `POST /api/v1/auth/refresh`
- **Auth**: Refresh token必須
- **Request Body**:
  - `refreshToken` (string, required)
- **Success Response**: `200 OK`
- **Success Payload**:
  - `accessToken` (JWT, expiresIn: 1h)
  - `refreshToken` (string, optional: ローテーションする場合は新値を返却)
- **Error Responses**: `400`, `401`, `429`, `500`

#### 4) ログアウト
- **Method / Path**: `POST /api/v1/auth/logout`
- **Auth**: Refresh token必須
- **Request Body**:
  - `refreshToken` (string, required)
- **Success Response**: `200 OK`
- **Error Responses**: `400`, `401`, `429`, `500`

### Security and Validation Rules

- パスワードはbcryptでハッシュ化し、ハッシュ値のみ保存する
- bcryptのコスト係数は運用時に見直し可能な設定値で管理する
- JWT署名鍵は環境変数で管理し、リポジトリへ保存しない
- アクセストークンは1時間、Refresh tokenは7日間を超えて利用させない
- レート制限は1分あたり5リクエストを上限とし、超過時は再試行可能時刻を通知する

### Response Format

#### Success
```json
{
  "success": true,
  "data": {}
}
```

#### Error
```json
{
  "success": false,
  "error": {
    "code": "AUTH_FAILED",
    "message": "認証に失敗しました",
    "details": []
  }
}
```

### Key Entities *(include if feature involves data)*

- **User**: 認証対象ユーザー
  - `id` (UUID)
  - `email` (string, unique, required)
  - `passwordHash` (string, bcryptハッシュ, required)
  - `name` (string, optional)
  - `createdAt` (datetime)
  - `updatedAt` (datetime)

- **RefreshTokenSession**: リフレッシュトークン管理
  - `id` (UUID)
  - `userId` (UUID)
  - `tokenHash` (string)
  - `expiresAt` (datetime, 発行から7日)
  - `revokedAt` (datetime, nullable)
  - `createdAt` (datetime)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 4つの認証エンドポイントがOpenAPI上で定義され、必須項目・レスポンス・エラーが100%記載される
- **SC-002**: パスワード保存時の平文保存が0件で、全件bcryptハッシュ化される
- **SC-003**: アクセストークンの有効期限検証テストで、1時間以内は成功、期限超過は100%失敗する
- **SC-004**: Refresh tokenの有効期限検証テストで、7日以内は成功、期限超過は100%失敗する
- **SC-005**: レート制限テストで1分間6回目のリクエストが100% `429` になる
- **SC-006**: 認証関連テストのカバレッジ80%以上をCIで継続達成する

## Assumptions

- メールアドレスはユーザー一意キーとして扱う
- 本仕様ではメール認証（確認メール送信）は対象外とする
- Refresh tokenはDB保存時にハッシュ化して管理する
- レート制限は同一IPまたは同一識別子を単位に適用する
- 本仕様は開発環境SQLite、本番環境PostgreSQLの双方で同等動作する前提とする

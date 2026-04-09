# Blog API - Project Constitution

## Project Vision
Build a secure, scalable, and well-documented RESTful API for managing blog posts, following industry best practices and modern API design principles.

## Core Principles

### 1. Security First
- Authentication and authorization on all protected endpoints
- Input validation and sanitization
- Protection against common vulnerabilities (OWASP Top 10)
- Secure password storage with bcrypt
- JWT-based authentication with refresh tokens
- Rate limiting to prevent abuse

### 2. RESTful Design
- Resource-based URLs
- Proper HTTP methods (GET, POST, PUT, DELETE)
- Appropriate HTTP status codes
- Stateless design
- HATEOAS principles where applicable

### 3. Developer Experience
- Clear and comprehensive API documentation
- Consistent error responses
- Helpful error messages
- OpenAPI (Swagger) specification
- API versioning (v1)
- Easy local development setup

### 4. Code Quality
- Clean, readable, and maintainable code
- Separation of concerns (MVC pattern)
- DRY principle
- Single Responsibility Principle
- Comprehensive error handling
- Meaningful variable and function names

### 5. Testing and Reliability
- Minimum 80% test coverage
- Unit tests for business logic
- Integration tests for API endpoints
- Error case testing
- Automated test execution

## Technical Constraints

### Technology Stack
- **Runtime**: Node.js 18+ (LTS)
- **Framework**: Express.js 4.x
- **Database**: SQLite (development), PostgreSQL-compatible design (production)
- **ORM**: Sequelize or Knex.js
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Joi or express-validator
- **Testing**: Jest + Supertest
- **Documentation**: Swagger/OpenAPI 3.0

### Architecture Pattern
```
MVC (Model-View-Controller) with middleware layers
┌─────────────┐
│   Routes    │  ← API endpoints definition
└──────┬──────┘
       │
┌──────▼──────┐
│ Middleware  │  ← Auth, Validation, Error handling
└──────┬──────┘
       │
┌──────▼──────┐
│ Controllers │  ← Request handling & response
└──────┬──────┘
       │
┌──────▼──────┐
│   Models    │  ← Data layer & business logic
└──────┬──────┘
       │
┌──────▼──────┐
│  Database   │  ← Persistence
└─────────────┘
```

### File Structure
```
blog-api/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.js
│   │   ├── auth.js
│   │   └── constants.js
│   ├── models/          # Data models
│   │   ├── index.js
│   │   ├── User.js
│   │   ├── Post.js
│   │   └── Category.js
│   ├── controllers/     # Request handlers
│   │   ├── authController.js
│   │   ├── postController.js
│   │   └── userController.js
│   ├── routes/          # API routes
│   │   ├── index.js
│   │   ├── auth.js
│   │   └── posts.js
│   ├── middleware/      # Custom middleware
│   │   ├── auth.js
│   │   ├── validation.js
│   │   ├── errorHandler.js
│   │   └── rateLimiter.js
│   ├── utils/           # Utility functions
│   │   ├── jwt.js
│   │   └── validation.js
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── tests/
│   ├── integration/
│   │   ├── auth.test.js
│   │   └── posts.test.js
│   └── unit/
│       └── models.test.js
├── docs/
│   └── api-spec.yaml    # OpenAPI specification
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## API Design Standards

### URL Structure
- Base URL: `/api/v1`
- Resource naming: plural nouns (e.g., `/posts`, `/users`)
- Nested resources: `/posts/:postId/comments`
- No verbs in URLs (use HTTP methods instead)

### HTTP Status Codes
- `200 OK`: Successful GET, PUT
- `201 Created`: Successful POST
- `204 No Content`: Successful DELETE
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Authenticated but not authorized
- `404 Not Found`: Resource doesn't exist
- `409 Conflict`: Resource conflict (e.g., duplicate)
- `422 Unprocessable Entity`: Semantic validation error
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

### Response Format
```json
// Success Response
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}

// Error Response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "title",
        "message": "Title is required"
      }
    ]
  }
}
```

### Pagination
- Query parameters: `page` (1-based), `limit` (default: 10, max: 100)
- Response includes metadata: total count, current page, total pages

### Sorting
- Query parameter: `sort` (e.g., `?sort=-createdAt,title`)
- Prefix `-` for descending order

### Filtering
- Query parameters match field names (e.g., `?status=published&author=john`)

## Security Requirements

### Authentication
- JWT access tokens (1 hour expiry)
- Refresh tokens (7 days expiry, stored hashed)
- Secure HTTP-only cookies for refresh tokens (web clients)

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- bcrypt hashing with salt rounds: 10

### Rate Limiting
- Authentication endpoints: 5 requests per minute per IP
- API endpoints (authenticated): 100 requests per minute per user
- API endpoints (public): 20 requests per minute per IP

### Input Validation
- All inputs validated before processing
- SQL injection prevention (parameterized queries)
- XSS prevention (input sanitization)
- Max request body size: 10MB

## Performance Requirements
- Response time: < 200ms (95th percentile) for read operations
- Response time: < 500ms (95th percentile) for write operations
- Support 100 concurrent connections
- Database connection pooling

## Environment Variables
```
NODE_ENV=development|production|test
PORT=3000
DATABASE_URL=sqlite://./database.sqlite
JWT_SECRET=<secure-random-string>
JWT_EXPIRY=1h
REFRESH_TOKEN_EXPIRY=7d
BCRYPT_ROUNDS=10
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=100
```

## Out of Scope
- File upload/storage
- Email notifications
- Real-time features (WebSocket)
- Social login (OAuth)
- Payment processing
- Content moderation
- Search engine (full-text search)
- Caching layer (Redis)
- Microservices architecture

## Success Criteria
- [ ] All CRUD operations implemented for posts
- [ ] JWT authentication working
- [ ] Authorization checks on protected endpoints
- [ ] Input validation on all endpoints
- [ ] Proper error handling and responses
- [ ] 80%+ test coverage
- [ ] OpenAPI documentation generated
- [ ] No security vulnerabilities (based on npm audit)
- [ ] Rate limiting functional
- [ ] Pagination working correctly

## Development Workflow
1. Write specification for feature
2. Design database schema if needed
3. Write tests (TDD approach)
4. Implement feature
5. Verify tests pass
6. Update API documentation
7. Code review
8. Merge to main branch

## Deployment Considerations
- Environment-based configuration
- Database migrations versioned
- Graceful shutdown handling
- Health check endpoint (`/health`)
- Logging (development: console, production: file/service)
- CORS configuration for frontend clients

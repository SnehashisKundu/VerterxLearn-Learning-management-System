# VertexLearn LMS-AI

> Learning Management System backend with AI-ready architecture,
> authentication, gamification, rewards, notifications, and production
> deployment support.

## 🌐 Live API

**Production API:** `https://verterxlearn.onrender.com`

### Health Check

``` text
GET /health
```

Example response:

``` json
{
  "success": true,
  "message": "LMS-AI API is healthy"
}
```

------------------------------------------------------------------------

## 📌 Project Overview

VertexLearn is an LMS-AI platform designed around a modular backend
architecture. The backend is responsible for authentication,
authorization, learning workflows, user progress, gamification, points,
rewards, notifications, and supporting infrastructure.

The backend follows a layered/module-oriented design:

``` text
Client
  ↓
Express Routes
  ↓
Middleware
  ↓
Controller
  ↓
Service
  ↓
Prisma / Database
```

Supporting infrastructure such as Redis, BullMQ, Cloudinary, email/SMS
services, and AI services can participate in specific workflows.

------------------------------------------------------------------------

## 🏗️ Technology Stack

  Layer                              Technology
  ---------------------------------- --------------
  Runtime                            Node.js
  Language                           TypeScript
  API                                Express.js
  ORM                                Prisma
  Database                           PostgreSQL
  Cache / Queue Support              Redis
  Background Jobs                    BullMQ
  Authentication                     JWT
  Validation                         Zod
  Security                           Helmet, CORS
  Logging                            Morgan
  File / Media                       Cloudinary
  Email                              Nodemailer
  PDF                                PDFKit
  QR                                 QRCode
  Deployment                         Render
  Container / Local Infrastructure   Docker

------------------------------------------------------------------------

## 📁 Backend Structure

``` text
Internmo 2nd/
│
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   │
│   ├── src/
│   │   ├── lib/
│   │   │   ├── prisma.ts
│   │   │   ├── redis.ts
│   │   │   └── jwt.ts
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   └── role.middleware.ts
│   │   │
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── point-rule/
│   │   │   ├── point-wallet/
│   │   │   ├── reward/
│   │   │   ├── streak/
│   │   │   └── ...
│   │   │
│   │   ├── app.ts
│   │   └── server.ts
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── ai-service/
├── frontend/
├── docs/
├── infra/
└── render.yaml
```

> The module list can grow as additional LMS features are implemented.

------------------------------------------------------------------------

# 🔄 System Data Flow

## 1. High-Level System Flow

``` mermaid
flowchart TD
    A[Web / Mobile Client] --> B[Render / HTTPS]
    B --> C[Express API]
    C --> D[Security Middleware]
    D --> E[JWT Authentication]
    E --> F[RBAC / Authorization]
    F --> G[Controller]
    G --> H[Service Layer]

    H --> I[(PostgreSQL)]
    H --> J[(Redis)]
    H --> K[BullMQ Jobs]
    H --> L[Cloudinary]
    H --> M[Email / SMS]
    H --> N[AI Service]

    K --> J
    N --> H
```

### Flow

1.  Client sends an HTTPS request.
2.  Express receives the request.
3.  Security middleware applies headers/CORS and request processing.
4.  Authentication validates the JWT when the endpoint is protected.
5.  Authorization checks the user's role/permissions.
6.  Controller validates request-level input and calls the service.
7.  Service contains business logic.
8.  Prisma communicates with PostgreSQL for persistent data.
9.  Redis supports caching/queue infrastructure.
10. BullMQ handles asynchronous/background jobs where required.
11. External services such as Cloudinary, email/SMS, or the AI service
    are called only for workflows that require them.

------------------------------------------------------------------------

# 🔐 Authentication Data Flow

``` mermaid
sequenceDiagram
    participant C as Client
    participant API as Express API
    participant AUTH as Auth Service
    participant DB as PostgreSQL
    participant JWT as JWT Layer

    C->>API: Login / Register
    API->>AUTH: Process credentials
    AUTH->>DB: Read / create user
    DB-->>AUTH: User data
    AUTH->>JWT: Generate access token
    JWT-->>AUTH: JWT
    AUTH-->>API: Authentication result
    API-->>C: Token + user information

    C->>API: Protected request + Bearer token
    API->>JWT: Verify token
    JWT-->>API: User identity
    API->>AUTH: Continue authorized workflow
```

------------------------------------------------------------------------

# 👤 Request Processing Flow

``` mermaid
flowchart LR
    A[HTTP Request] --> B[Express]
    B --> C[Middleware]
    C --> D{Authenticated?}
    D -- No --> E[401 Unauthorized]
    D -- Yes --> F{Authorized?}
    F -- No --> G[403 Forbidden]
    F -- Yes --> H[Controller]
    H --> I[Validation]
    I --> J[Service]
    J --> K[Prisma]
    K --> L[(PostgreSQL)]
    L --> K
    K --> J
    J --> H
    H --> M[JSON Response]
```

------------------------------------------------------------------------

# 🎮 Gamification Data Flow

The platform includes point, streak, and reward workflows.

``` mermaid
flowchart TD
    A[Student Activity] --> B[Point Rule]
    B --> C[Points Earned]
    C --> D[Point Wallet]
    D --> E[(Wallet / Transactions)]

    A --> F[Streak Logic]
    F --> G[Streak State]

    D --> H{Enough Points?}
    H -- No --> I[Insufficient Balance]
    H -- Yes --> J[Reward Redemption]
    J --> K[Redemption Record]
    K --> L[Admin Fulfillment]
    L --> M[Reward Status Update]
```

------------------------------------------------------------------------

# 💰 Point Wallet Flow

``` mermaid
sequenceDiagram
    participant S as Student
    participant API as API
    participant PW as Point Wallet Service
    participant DB as PostgreSQL

    S->>API: Earn points
    API->>PW: Validate earning request
    PW->>DB: Create transaction
    PW->>DB: Update wallet balance
    DB-->>PW: Updated wallet
    PW-->>API: Wallet + transaction
    API-->>S: Success response
```

For reward redemption:

``` mermaid
sequenceDiagram
    participant S as Student
    participant API as API
    participant R as Reward Service
    participant PW as Point Wallet
    participant DB as PostgreSQL

    S->>API: Redeem reward
    API->>R: Validate reward
    R->>DB: Check active reward
    R->>PW: Check balance
    PW->>DB: Read wallet

    alt Insufficient points
        PW-->>R: Reject
        R-->>API: Insufficient balance
        API-->>S: Error
    else Enough points
        R->>PW: Deduct points
        PW->>DB: Create debit transaction
        R->>DB: Create redemption
        DB-->>R: Redemption created
        R-->>API: Success
        API-->>S: Redemption details
    end
```

------------------------------------------------------------------------

# 🎁 Reward Lifecycle

``` mermaid
stateDiagram-v2
    [*] --> PENDING
    PENDING --> APPROVED
    PENDING --> REJECTED
    APPROVED --> SHIPPED
    SHIPPED --> DELIVERED
    DELIVERED --> FULFILLED
    APPROVED --> FULFILLED
    REJECTED --> [*]
    FULFILLED --> [*]
```

For digital rewards, fulfillment may use a digital delivery/claim
workflow rather than physical shipping.

------------------------------------------------------------------------

# 🗄️ Data Architecture

``` mermaid
flowchart TB
    API[Express API]

    API --> AUTH[Authentication]
    API --> USERS[Users / Roles]
    API --> LMS[Learning Modules]
    API --> GAME[Gamification]
    API --> REWARD[Rewards]
    API --> NOTIFY[Notifications]

    AUTH --> DB[(PostgreSQL)]
    USERS --> DB
    LMS --> DB
    GAME --> DB
    REWARD --> DB
    NOTIFY --> DB

    GAME --> REDIS[(Redis)]
    NOTIFY --> REDIS
    REWARD --> REDIS

    REDIS --> QUEUE[BullMQ]
    QUEUE --> WORKER[Background Worker]
```

------------------------------------------------------------------------

# ⚡ Redis & BullMQ

Redis is intended for fast temporary/stateful operations and queue
infrastructure.

BullMQ can be used to move expensive or asynchronous work away from the
HTTP request-response cycle.

``` mermaid
flowchart LR
    A[API Request] --> B[Service]
    B --> C[Create Job]
    C --> D[(Redis)]
    D --> E[BullMQ Worker]
    E --> F[Background Task]
    F --> G[Email / Notification / External Service]
```

This keeps API requests responsive while background processing happens
independently.

------------------------------------------------------------------------

# 🖼️ Media / File Flow

``` mermaid
flowchart LR
    A[Client] --> B[Express API]
    B --> C[Validation]
    C --> D[Cloudinary]
    D --> E[Media URL]
    E --> F[(PostgreSQL)]
    F --> G[API Response]
    G --> A
```

Only metadata/URLs should be persisted in PostgreSQL when the actual
binary asset is stored externally.

------------------------------------------------------------------------

# 🛡️ Security

The backend uses several security layers:

-   JWT-based authentication
-   Role-based authorization
-   Zod request validation
-   Helmet security headers
-   CORS configuration
-   Password hashing with bcrypt
-   Environment-based secrets
-   Protected administrative endpoints
-   Database-level persistence through Prisma

### Authorization Flow

``` mermaid
flowchart TD
    A[Request] --> B[JWT Middleware]
    B --> C{Valid Token?}
    C -- No --> D[401]
    C -- Yes --> E[Attach User]
    E --> F[Role Middleware]
    F --> G{Allowed Role?}
    G -- No --> H[403]
    G -- Yes --> I[Controller]
```

------------------------------------------------------------------------

# 🚀 Local Development

### 1. Install dependencies

``` bash
cd backend
npm ci
```

### 2. Configure environment

Create/update `.env` with the required database, Redis, JWT, and
external-service configuration.

### 3. Start infrastructure

Use the project's Docker/infra configuration for PostgreSQL and Redis.

### 4. Generate Prisma client

``` bash
npx prisma generate
```

### 5. Build

``` bash
npm run build
```

### 6. Start production build

``` bash
npm start
```

### 7. Development mode

``` bash
npm run dev
```

------------------------------------------------------------------------

# ☁️ Production Deployment

The backend is deployed on Render.

`render.yaml`:

``` yaml
services:
  - type: web
    name: vertexlms-backend
    runtime: node
    rootDir: backend
    buildCommand: npm ci && npm run build
    startCommand: npm start
    healthCheckPath: /health
```

The application listens on:

``` text
process.env.PORT || 5000
```

and binds to:

``` text
0.0.0.0
```

This allows Render to route external traffic to the Node.js process.

### Production Health Check

``` bash
curl -i https://verterxlearn.onrender.com/health
```

Expected:

``` text
HTTP/1.1 200 OK
```

``` json
{
  "success": true,
  "message": "LMS-AI API is healthy"
}
```

------------------------------------------------------------------------

# 🧪 API Testing

Recommended testing sequence:

``` text
Health
  ↓
Authentication
  ↓
User / Role authorization
  ↓
Core LMS APIs
  ↓
Point Rules
  ↓
Point Wallet
  ↓
Streak
  ↓
Rewards
  ↓
Reward Redemption
  ↓
Admin Fulfillment
  ↓
Notifications / Background Jobs
```

------------------------------------------------------------------------

# 📚 API Documentation

Swagger/OpenAPI documentation will be added next.

Planned documentation should cover:

-   Authentication
-   User management
-   Role/permission protected APIs
-   Learning modules
-   Point rules
-   Point wallet
-   Streaks
-   Rewards
-   Reward redemptions
-   Admin operations
-   Notifications
-   Request/response schemas
-   Authentication requirements
-   Error responses

------------------------------------------------------------------------

# 🧭 Engineering Architecture

The project follows separation of concerns:

``` text
Routes
  ↓
Middleware
  ↓
Controller
  ↓
Service
  ↓
Data / External Services
```

### Routes

Responsible for endpoint definitions and middleware composition.

### Middleware

Responsible for authentication, authorization, security, and
request-level processing.

### Controllers

Responsible for translating HTTP requests into service calls and
formatting HTTP responses.

### Services

Responsible for business rules and application workflows.

### Prisma

Responsible for database access and persistence.

------------------------------------------------------------------------

# 📈 Production Request Lifecycle

``` mermaid
flowchart TD
    A[Browser / Mobile App] --> B[HTTPS]
    B --> C[Cloudflare / Render]
    C --> D[Node.js Express]
    D --> E[Helmet / CORS]
    E --> F[JWT / RBAC]
    F --> G[Controller]
    G --> H[Service Layer]

    H --> I[(PostgreSQL)]
    H --> J[(Redis)]
    H --> K[Cloudinary]
    H --> L[Notification Provider]
    H --> M[AI Service]

    J --> N[BullMQ]
    N --> O[Worker]
```

------------------------------------------------------------------------

# 🔮 Planned / Extensible Areas

The architecture is prepared for additional LMS-AI capabilities such as:

-   AI-assisted learning workflows
-   Personalized recommendations
-   AI-generated learning content
-   Automated notifications
-   Advanced analytics
-   Leaderboards
-   More gamification rules
-   Background processing
-   Reporting and PDF generation

These capabilities should be added as independent modules/services
rather than tightly coupling them to existing controllers.

------------------------------------------------------------------------

# 📌 Current Deployment Status

  Component              Status
  ---------------------- --------
  TypeScript backend     ✅
  Express API            ✅
  PostgreSQL             ✅
  Prisma                 ✅
  Redis integration      ✅
  JWT authentication     ✅
  RBAC middleware        ✅
  Point Rule module      ✅
  Point Wallet module    ✅
  Streak module          ✅
  Reward module          ✅
  Render deployment      ✅
  Production `/health`   ✅
  Swagger/OpenAPI        🔜

------------------------------------------------------------------------

## 👨‍💻 Project

**VertexLearn --- LMS-AI**

Backend architecture built with Node.js, Express, TypeScript, Prisma,
PostgreSQL, Redis, and modular service design.

import fs from "node:fs";
import path from "node:path";

import swaggerAutogen from "swagger-autogen";

const root = process.cwd();

const outputFile = path.resolve(root, "swagger-output.json");
const appFile = path.resolve(root, "src/app.ts");

const appSource = fs.readFileSync(appFile, "utf8");

/*
|--------------------------------------------------------------------------
| Route imports
|--------------------------------------------------------------------------
*/

const routeImports = new Map<string, string>();

for (const match of appSource.matchAll(
  /import\s+(\w+)\s+from\s+["'](\.\/modules\/[^"']+)["'];/g,
)) {
  const [, routeName, routeImport] = match;

  if (!routeName || !routeImport) continue;

  const routeFile = path.resolve(
    root,
    "src",
    `${routeImport.replace(/^\.\/modules\//, "modules/")}.ts`,
  );

  routeImports.set(routeName, routeFile);
}

/*
|--------------------------------------------------------------------------
| Route tags
|--------------------------------------------------------------------------
*/

const tagNames: Record<string, string> = {
  authRoutes: "Auth",
  courseRoutes: "Courses",
  moduleRoutes: "Modules",
  lectureRoutes: "Lectures",
  lectureProgressRoutes: "Lecture Progress",
  enrollmentRoutes: "Enrollment",
  noteRoutes: "Notes",
  bookmarkRoutes: "Bookmarks",
  lectureResourceRoutes: "Lecture Resources",
  documentChunkRoutes: "Document Chunks",
  quizRoutes: "Quiz",
  quizQuestionRoutes: "Quiz Questions",
  quizOptionRoutes: "Quiz Options",
  quizAttemptRoutes: "Quiz Attempts",
  quizAnswerRoutes: "Quiz Answers",
  assignmentRoutes: "Assignments",
  idCardRoutes: "Student ID Card",
  attendanceRoutes: "Attendance",
  crRoutes: "Certificates",
  certificateTemplateRoutes: "Certificate Templates",
  aiTutorRoutes: "AI Tutor",
  flashcardRoutes: "Flashcards",
  roadmapRoutes: "Roadmap",
  badgeRoutes: "Badges",
  pointRuleRoutes: "Point Rules",
  pointWalletRoutes: "Point Wallet",
  rewardRoutes: "Rewards",
  streakRoutes: "Streak",
  analyticsRoutes: "Analytics",
};

/*
|--------------------------------------------------------------------------
| Public endpoints
|--------------------------------------------------------------------------
|
| These endpoints DO NOT require JWT.
|
*/

const publicPaths = new Set([
  "/api/auth/register",
  "/api/auth/login",
  "/api/auth/refresh",
  "/api/auth/logout",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/health",
]);

/*
|--------------------------------------------------------------------------
| Request body schemas
|--------------------------------------------------------------------------
*/

const requestSchemas = {
  RegisterRequest: {
    type: "object",
    required: ["name", "email", "password"],
    properties: {
      name: {
        type: "string",
        minLength: 2,
        maxLength: 100,
        example: "John Doe",
      },
      email: {
        type: "string",
        format: "email",
        example: "john@example.com",
      },
      password: {
        type: "string",
        format: "password",
        minLength: 8,
        maxLength: 100,
        example: "password123",
      },
    },
  },

  LoginRequest: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: {
        type: "string",
        format: "email",
        example: "john@example.com",
      },
      password: {
        type: "string",
        format: "password",
        example: "password123",
      },
    },
  },

  RefreshTokenRequest: {
    type: "object",
    required: ["refreshToken"],
    properties: {
      refreshToken: {
        type: "string",
        example: "your-refresh-token",
      },
    },
  },

  ForgotPasswordRequest: {
    type: "object",
    required: ["email"],
    properties: {
      email: {
        type: "string",
        format: "email",
        example: "john@example.com",
      },
    },
  },

  ResetPasswordRequest: {
    type: "object",
    required: ["token", "newPassword"],
    properties: {
      token: {
        type: "string",
        example: "reset-token",
      },
      newPassword: {
        type: "string",
        format: "password",
        minLength: 8,
        maxLength: 100,
        example: "newPassword123",
      },
    },
  },
};

/*
|--------------------------------------------------------------------------
| Auth request bodies
|--------------------------------------------------------------------------
*/

const requestBodySchemas: Record<string, object> = {
  "/api/auth/register": {
    required: true,
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/RegisterRequest",
        },
      },
    },
  },

  "/api/auth/login": {
    required: true,
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/LoginRequest",
        },
      },
    },
  },

  "/api/auth/refresh": {
    required: true,
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/RefreshTokenRequest",
        },
      },
    },
  },

  "/api/auth/logout": {
    required: true,
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/RefreshTokenRequest",
        },
      },
    },
  },

  "/api/auth/forgot-password": {
    required: true,
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/ForgotPasswordRequest",
        },
      },
    },
  },

  "/api/auth/reset-password": {
    required: true,
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/ResetPasswordRequest",
        },
      },
    },
  },
};

/*
|--------------------------------------------------------------------------
| Automatically discover every route
|--------------------------------------------------------------------------
*/

const routePaths: Record<string, Record<string, any>> = {};

for (const match of appSource.matchAll(
  /app\.use\(\s*["']([^"']+)["']\s*,\s*(\w+)\s*\)/g,
)) {
  const [, prefix, routeName] = match;

  if (!prefix || !routeName) continue;

  const routeFile = routeImports.get(routeName);

  if (!routeFile || !fs.existsSync(routeFile)) {
    continue;
  }

  const routeSource = fs.readFileSync(routeFile, "utf8");

  for (const routeMatch of routeSource.matchAll(
    /router\.(get|post|put|patch|delete|options|head)\(\s*["']([^"']+)["']/g,
  )) {
    const [, method, routePath] = routeMatch;

    if (!method || !routePath) continue;

    const fullPath =
      `${prefix}${routePath === "/" ? "" : routePath}`.replace(
        /:([A-Za-z0-9_]+)/g,
        "{$1}",
      ) || "/";

    const tag = tagNames[routeName] ?? "API";

    const operation: Record<string, any> = {
      tags: [tag],

      summary: `${method.toUpperCase()} ${fullPath}`,

      responses: {
        "200": {
          description: "Successful response",
        },

        "400": {
          description: "Bad request",
        },

        "401": {
          description: "Unauthorized",
        },

        "403": {
          description: "Forbidden",
        },

        "404": {
          description: "Resource not found",
        },

        "500": {
          description: "Internal server error",
        },
      },
    };

    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */

    if (!publicPaths.has(fullPath)) {
      operation.security = [
        {
          bearerAuth: [],
        },
      ];
    }

    /*
    |--------------------------------------------------------------------------
    | Auth request bodies
    |--------------------------------------------------------------------------
    */

    if (requestBodySchemas[fullPath]) {
      operation.requestBody = requestBodySchemas[fullPath];
    }

    routePaths[fullPath] ??= {};

    routePaths[fullPath][method] = operation;
  }
}

/*
|--------------------------------------------------------------------------
| Swagger document
|--------------------------------------------------------------------------
*/

const doc = {
  openapi: "3.0.0",

  info: {
    title: "VertexLearn LMS-AI API",
    version: "1.0.0",
    description:
      "Complete REST API documentation for the VertexLearn LMS-AI platform.",
  },

  servers: [
    {
      url: "http://localhost:5000",
      description: "Local development",
    },

    {
      url: "https://vertexlearn.onrender.com",
      description: "Production",
    },
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description:
          "Enter your JWT access token. Example: eyJhbGciOiJIUzI1NiIs...",
      },
    },

    schemas: {
      ...requestSchemas,

      Error: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: false,
          },

          message: {
            type: "string",
            example: "Something went wrong",
          },
        },
      },

      HealthResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true,
          },

          message: {
            type: "string",
            example: "LMS-AI API is healthy",
          },
        },
      },
    },
  },

  tags: [
    { name: "Auth", description: "Authentication and account management" },
    { name: "Courses", description: "Course management" },
    { name: "Modules", description: "Course module management" },
    { name: "Lectures", description: "Lecture management" },
    { name: "Lecture Progress", description: "Learning progress tracking" },
    { name: "Enrollment", description: "Course enrollment" },
    { name: "Notes", description: "Student notes" },
    { name: "Bookmarks", description: "Lecture bookmarks" },
    { name: "Lecture Resources", description: "Lecture resources" },
    { name: "Document Chunks", description: "Document chunks and embeddings" },
    { name: "Quiz", description: "Quiz management" },
    { name: "Quiz Questions", description: "Quiz question management" },
    { name: "Quiz Options", description: "Quiz option management" },
    { name: "Quiz Attempts", description: "Quiz attempt workflow" },
    { name: "Quiz Answers", description: "Quiz answer workflow" },
    { name: "Assignments", description: "Assignment workflow" },
    { name: "Student ID Card", description: "Student identity cards" },
    { name: "Attendance", description: "Attendance management" },
    { name: "Certificates", description: "Certificate issuance and retrieval" },
    {
      name: "Certificate Templates",
      description: "Certificate template management",
    },
    { name: "AI Tutor", description: "AI-powered learning assistance" },
    { name: "Flashcards", description: "Flashcard learning system" },
    { name: "Roadmap", description: "Learning roadmap and planning" },
    { name: "Badges", description: "Gamification badges" },
    { name: "Point Rules", description: "Point earning rules" },
    { name: "Point Wallet", description: "Student point wallet and transactions" },
    { name: "Rewards", description: "Reward catalogue and redemption" },
    { name: "Streak", description: "Learning streak tracking" },
    { name: "Analytics", description: "Learning analytics" },
  ],
};

/*
|--------------------------------------------------------------------------
| Generate Swagger
|--------------------------------------------------------------------------
*/

async function generateSwagger() {
  console.log("🧹 Removing old swagger-output.json...");

  if (fs.existsSync(outputFile)) {
    fs.unlinkSync(outputFile);
  }

  console.log("⚙️ Generating fresh Swagger specification...");

  await swaggerAutogen({
    openapi: "3.0.0",
  })(outputFile, [appFile], doc);

  const generated = JSON.parse(
    fs.readFileSync(outputFile, "utf8"),
  );

  /*
  |--------------------------------------------------------------------------
  | Merge our automatically discovered routes
  |--------------------------------------------------------------------------
  */

  generated.paths = {
    ...(generated.paths ?? {}),
    ...routePaths,
  };

  /*
  |--------------------------------------------------------------------------
  | Remove accidental auth from public endpoints
  |--------------------------------------------------------------------------
  */

  for (const publicPath of publicPaths) {
    const pathItem = generated.paths?.[publicPath];

    if (!pathItem) continue;

    for (const method of Object.keys(pathItem)) {
      if (
        [
          "get",
          "post",
          "put",
          "patch",
          "delete",
          "options",
          "head",
        ].includes(method)
      ) {
        delete pathItem[method].security;
      }
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Ensure every protected route has JWT security
  |--------------------------------------------------------------------------
  */

  for (const [routePath, pathItem] of Object.entries(
    generated.paths ?? {},
  )) {
    if (publicPaths.has(routePath)) continue;

    for (const method of [
      "get",
      "post",
      "put",
      "patch",
      "delete",
      "options",
      "head",
    ]) {
      const operation = (pathItem as Record<string, any>)?.[method];

      if (!operation) continue;

      operation.security = [
        {
          bearerAuth: [],
        },
      ];
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Write final clean specification
  |--------------------------------------------------------------------------
  */

  fs.writeFileSync(
    outputFile,
    `${JSON.stringify(generated, null, 2)}\n`,
    "utf8",
  );

  const pathCount = Object.keys(generated.paths ?? {}).length;

  let operationCount = 0;

  for (const pathItem of Object.values(generated.paths ?? {})) {
    for (const method of [
      "get",
      "post",
      "put",
      "patch",
      "delete",
      "options",
      "head",
    ]) {
      if ((pathItem as Record<string, unknown>)?.[method]) {
        operationCount++;
      }
    }
  }

  console.log("");
  console.log("==============================================");
  console.log("✅ Swagger specification generated successfully");
  console.log("==============================================");
  console.log(`📁 ${outputFile}`);
  console.log(`📌 Paths: ${pathCount}`);
  console.log(`🔗 Operations: ${operationCount}`);
  console.log("==============================================");
}

generateSwagger().catch((error) => {
  console.error("❌ Swagger generation failed:");
  console.error(error);
  process.exit(1);
});
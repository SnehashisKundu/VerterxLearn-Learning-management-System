import path from "node:path";
import fs from "node:fs";
import swaggerAutogen from "swagger-autogen";

const outputFile = path.resolve(process.cwd(), "swagger-output.json");

const endpointsFiles = [
  path.resolve(process.cwd(), "src/app.ts"),
];

const appFile = path.resolve(process.cwd(), "src/app.ts");
const appSource = fs.readFileSync(appFile, { encoding: "utf8" });

/* ============================================================
   ROUTE IMPORTS
============================================================ */

const routeImports = new Map<string, string>();

for (const match of appSource.matchAll(
  /import\s+(\w+)\s+from\s+["'](\.\/modules\/[^"']+)["'];/g,
)) {
  const [, routeName, routeImport] = match;

  if (routeName && routeImport) {
    routeImports.set(
      routeName,
      path.resolve(
        process.cwd(),
        "src",
        `${routeImport.slice(2)}.ts`,
      ),
    );
  }
}

/* ============================================================
   TAGS
============================================================ */

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

/* ============================================================
   PUBLIC ENDPOINTS
============================================================ */

const publicEndpoints = new Set([
  "/health",

  "/api/auth/register",
  "/api/auth/login",
  "/api/auth/refresh",
  "/api/auth/logout",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
]);

const isPublicEndpoint = (pathName: string): boolean => {
  return publicEndpoints.has(pathName);
};

/* ============================================================
   REQUEST BODY SCHEMAS
============================================================ */

const requestBodySchemas: Record<string, object> = {
  "/api/auth/register": {
    required: ["name", "email", "password"],
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/RegisterRequest",
        },
      },
    },
  },

  "/api/auth/login": {
    required: ["email", "password"],
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/LoginRequest",
        },
      },
    },
  },

  "/api/auth/refresh": {
    required: ["refreshToken"],
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/RefreshTokenRequest",
        },
      },
    },
  },

  "/api/auth/logout": {
    required: ["refreshToken"],
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/RefreshTokenRequest",
        },
      },
    },
  },

  "/api/auth/forgot-password": {
    required: ["email"],
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/ForgotPasswordRequest",
        },
      },
    },
  },

  "/api/auth/reset-password": {
    required: ["token", "newPassword"],
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/ResetPasswordRequest",
        },
      },
    },
  },
};

/* ============================================================
   REQUEST SCHEMAS
============================================================ */

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

/* ============================================================
   ROUTE PATHS
============================================================ */

const routePaths: Record<
  string,
  Record<string, object>
> = {};

/* ============================================================
   READ APP ROUTES
============================================================ */

for (const match of appSource.matchAll(
  /app\.use\(\s*["']([^"']+)["']\s*,\s*(\w+)\s*\)/g,
)) {
  const [, prefix, routeName] = match;

  const routeFile = routeName
    ? routeImports.get(routeName)
    : undefined;

  if (!prefix || !routeFile || !fs.existsSync(routeFile)) {
    continue;
  }

  const routeSource = fs.readFileSync(routeFile, {
    encoding: "utf8",
  });

  /*
   * Match router methods.
   *
   * We intentionally detect the route itself and then inspect
   * the complete declaration for authentication middleware.
   */
  const routeRegex =
    /router\.(get|post|put|patch|delete|options|head)\s*\(\s*["']([^"']+)["']([\s\S]*?)(?=\n\s*router\.|\n\s*export\s+default|\Z)/g;

  for (const routeMatch of routeSource.matchAll(routeRegex)) {
    const [, method, routePath, routeDeclaration] =
      routeMatch;

    if (!method || !routePath) {
      continue;
    }

    const fullPath =
      `${prefix}${routePath === "/" ? "" : routePath}`
        .replace(
          /:([A-Za-z0-9_]+)/g,
          "{$1}",
        ) || "/";

    /*
     * Determine whether endpoint is public.
     */
    const publicEndpoint =
      isPublicEndpoint(fullPath);

    /*
     * Detect authentication middleware.
     *
     * If the route explicitly contains authenticate/auth middleware,
     * Swagger will require JWT.
     *
     * For everything else, protected API endpoints remain protected
     * by default.
     */
    const explicitlyAuthenticated =
      /\bauthenticate\b|\bauthorize\b|\brequirePermission\b/.test(
        routeDeclaration ?? "",
      );

    const security =
      publicEndpoint
        ? {}
        : explicitlyAuthenticated
          ? { security: [{ bearerAuth: [] }] }
          : { security: [{ bearerAuth: [] }] };

    routePaths[fullPath] ??= {};

    routePaths[fullPath][method] = {
      tags: [
        routeName
          ? tagNames[routeName] ?? "API"
          : "API",
      ],

      ...security,

      ...(requestBodySchemas[fullPath]
        ? {
            requestBody:
              requestBodySchemas[fullPath],
          }
        : {}),

      responses: {
        "200": {
          description: "Successful response",
        },
      },
    };
  }
}

/* ============================================================
   OPENAPI DOCUMENT
============================================================ */

const doc = {
  openapi: "3.0.0",

  info: {
    title: "VertexLearn LMS-AI API",
    version: "1.0.0",
    description:
      "REST API documentation for the VertexLearn LMS-AI platform.",
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
          "Enter JWT access token.",
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
    {
      name: "Auth",
      description:
        "Authentication and account management",
    },
    {
      name: "Courses",
      description: "Course management",
    },
    {
      name: "Modules",
      description: "Course module management",
    },
    {
      name: "Lectures",
      description: "Lecture management",
    },
    {
      name: "Enrollment",
      description: "Course enrollment",
    },
    {
      name: "Lecture Progress",
      description:
        "Learning progress tracking",
    },
    {
      name: "Notes",
      description: "Student notes",
    },
    {
      name: "Bookmarks",
      description: "Lecture bookmarks",
    },
    {
      name: "Lecture Resources",
      description:
        "Lecture resources",
    },
    {
      name: "Document Chunks",
      description:
        "Document chunk and embedding data",
    },
    {
      name: "Quiz",
      description: "Quiz management",
    },
    {
      name: "Quiz Questions",
      description:
        "Quiz question management",
    },
    {
      name: "Quiz Options",
      description:
        "Quiz option management",
    },
    {
      name: "Quiz Attempts",
      description:
        "Quiz attempt workflow",
    },
    {
      name: "Quiz Answers",
      description:
        "Quiz answer workflow",
    },
    {
      name: "Assignments",
      description:
        "Assignment workflow",
    },
    {
      name: "Student ID Card",
      description:
        "Student identity cards",
    },
    {
      name: "Attendance",
      description:
        "Attendance management",
    },
    {
      name: "Certificates",
      description:
        "Certificate issuance and retrieval",
    },
    {
      name: "Certificate Templates",
      description:
        "Certificate template management",
    },
    {
      name: "AI Tutor",
      description:
        "AI-powered learning assistance",
    },
    {
      name: "Flashcards",
      description:
        "Flashcard learning system",
    },
    {
      name: "Roadmap",
      description:
        "Learning roadmap and planning",
    },
    {
      name: "Badges",
      description:
        "Gamification badges",
    },
    {
      name: "Point Rules",
      description:
        "Point earning rules",
    },
    {
      name: "Point Wallet",
      description:
        "Student point wallet and transactions",
    },
    {
      name: "Rewards",
      description:
        "Reward catalogue and redemption",
    },
    {
      name: "Streak",
      description:
        "Learning streak tracking",
    },
    {
      name: "Analytics",
      description:
        "Learning analytics",
    },
  ],
};

/* ============================================================
   GENERATE SWAGGER
============================================================ */

swaggerAutogen({ openapi: "3.0.0" })(
  outputFile,
  endpointsFiles,
  doc,
).then(() => {
  const generated = JSON.parse(
    fs.readFileSync(outputFile, "utf8"),
  );

  generated.paths = {
    ...generated.paths,
    ...routePaths,
  };

  fs.writeFileSync(
    outputFile,
    `${JSON.stringify(generated, null, 2)}\n`,
  );

  console.log(
    "✅ Swagger specification generated successfully.",
  );

  console.log(`📁 ${outputFile}`);

  console.log(
    `📌 Total paths: ${
      Object.keys(generated.paths ?? {}).length
    }`,
  );
});
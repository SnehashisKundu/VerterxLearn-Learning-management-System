import fs from "node:fs";
import path from "node:path";

const generatedSpecPath = path.resolve(process.cwd(), "swagger-output.json");

const fallbackSpec = {
  openapi: "3.0.0",
  info: {
    title: "VertexLearn LMS-AI API",
    version: "1.0.0",
    description: "REST API documentation for the VertexLearn LMS-AI platform.",
  },
  servers: [
    { url: "http://localhost:5000", description: "Local development" },
    { url: "https://vertexlearn.onrender.com", description: "Production" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter JWT access token.",
      },
    },
  },
  tags: [
    { name: "Auth", description: "Authentication and account management" },
    { name: "Courses", description: "Course management" },
    { name: "Modules", description: "Course module management" },
    { name: "Lectures", description: "Lecture management" },
    { name: "Enrollment", description: "Course enrollment" },
    { name: "Quiz", description: "Quiz management" },
    { name: "Assignments", description: "Assignment workflow" },
    { name: "AI Tutor", description: "AI-powered learning assistance" },
    { name: "Analytics", description: "Learning analytics" },
  ],
};

const swaggerSpec = fs.existsSync(generatedSpecPath)
  ? JSON.parse(fs.readFileSync(generatedSpecPath, { encoding: "utf8" }))
  : fallbackSpec;

export default swaggerSpec;

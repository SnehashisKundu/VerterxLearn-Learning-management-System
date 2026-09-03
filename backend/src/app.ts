import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./modules/auth/auth.routes";
import courseRoutes from "./modules/course/crs.routes";
import moduleRoutes from "./modules/module/mod.routes";
import lectureRoutes from "./modules/lecture/lec.routes";
import lectureProgressRoutes from "./modules/lecture-progress/lp.routes";
import enrollmentRoutes from "./modules/enrollment/enr.routes";

export const app = express();

app.use(helmet());

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api", moduleRoutes);
app.use("/api", lectureRoutes);
app.use("/api", lectureProgressRoutes);
app.use("/api", enrollmentRoutes);

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "LMS-AI API is healthy",
  });
});
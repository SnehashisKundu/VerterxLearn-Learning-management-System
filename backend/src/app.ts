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
import noteRoutes from "./modules/notes/note.routes";
import bookmarkRoutes from "./modules/bookmark/bm.routes";
import lectureResourceRoutes from "./modules/lecture-resource/lr.routes";
import documentChunkRoutes from "./modules/document-chunk/dc.routes";
import quizRoutes from "./modules/quiz/qz.routes";
import quizQuestionRoutes from "./modules/quiz-question/qq.routes";
import quizOptionRoutes from "./modules/quiz-option/qo.routes";
import quizAttemptRoutes from "./modules/quiz-attempt/qa.routes";
import quizAnswerRoutes from "./modules/quiz-answer/qans.routes";
import assignmentRoutes from "./modules/assignment/asgn.routes";
import idCardRoutes from "./modules/student-id-card/id-card.routes";
import attendanceRoutes from "./modules/attendance/attnd.routes";
import crRoutes from "./modules/certificate/cr.routes";
import certificateTemplateRoutes from "./modules/certificate-template/ct.routes";
import aiTutorRoutes from "./modules/ai-tutor/ai-tutor.routes";
import flashcardRoutes from "./modules/flashcard/fc.routes";
import roadmapRoutes from "./modules/roadmap/rd.routes";
import badgeRoutes from "./modules/badge/badge.routes";
import pointRuleRoutes from "./modules/point-rule/point-rule.routes";
import pointWalletRoutes from "./modules/point-wallet/pw.routes";
import rewardRoutes from "./modules/reward/rw.routes";
import streakRoutes from "./modules/streak/str.routes";
import analyticsRoutes from "./modules/analytics/an.routes";

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
app.use("/api/lecture-progress", lectureProgressRoutes);
app.use("/api", enrollmentRoutes);
app.use("/api", noteRoutes);
app.use("/api", bookmarkRoutes);
app.use("/api", lectureResourceRoutes);
app.use("/api", documentChunkRoutes);
app.use("/api", quizRoutes);
app.use("/api", quizQuestionRoutes);
app.use("/api", quizOptionRoutes);
app.use("/api", quizAttemptRoutes);
app.use("/api", quizAnswerRoutes);
app.use("/api", assignmentRoutes);
app.use("/api/student-id-card",idCardRoutes);
app.use( "/api/attendance",attendanceRoutes);
app.use("/api/certificates",crRoutes);
app.use("/api/certificate-templates",certificateTemplateRoutes);
app.use("/api/ai-tutor", aiTutorRoutes);
app.use("/api", flashcardRoutes);
app.use("/api", roadmapRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/point-rules", pointRuleRoutes);
app.use("/api/point-wallet", pointWalletRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/streak", streakRoutes);
app.use("/api/analytics", analyticsRoutes);

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "LMS-AI API is healthy",
  });
});
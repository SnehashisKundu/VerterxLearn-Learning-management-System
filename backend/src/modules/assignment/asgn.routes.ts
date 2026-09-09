import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

import * as assignmentController from "./asgn.controller";

const router = Router();

router.post(
  "/assignments",
  authenticate,
  authorize("instructor"),
  assignmentController.create
);

router.post(
  "/assignments/:id/submit",
  authenticate,
  authorize("student"),
  assignmentController.submit
);

router.put(
  "/submissions/:id/grade",
  authenticate,
  authorize("instructor"),
  assignmentController.grade
);

router.get(
  "/assignments/:id",
  authenticate,
  authorize("student", "instructor"),
  assignmentController.getAssignment
);

router.get(
  "/assignments/:id/submissions",
  authenticate,
  authorize("instructor"),
  assignmentController.getSubmissions
);

router.get(
  "/submissions/:id",
  authenticate,
  authorize("student", "instructor"),
  assignmentController.getSubmission
);

export default router;